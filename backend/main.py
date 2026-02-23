import os
import json
import asyncio
from uuid import uuid4
from pathlib import Path
from typing import Any, Dict, List, DefaultDict
from collections import defaultdict

import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# ===================== Session-based Chat History =====================

# Memory store: { session_id: [ {role, content}, ... ] }
SESSION_HISTORY: DefaultDict[str, List[dict]] = defaultdict(list)
SESSION_LOCK = asyncio.Lock()  # to protect concurrent appends/clears

# Tune how much context you forward to Cosmic (last K message objects)
MAX_TURNS = int(os.getenv("MAX_TURNS", "10"))  # 10 turns ~= up to 20 messages (user+assistant)
COOKIE_NAME = "chat_session_id"

# ============================ Config ============================

COSMIC_URL = os.getenv("COSMIC_URL", "http://host.docker.internal:3000/cosmic")
TIMEOUT_SECS = float(os.getenv("COSMIC_TIMEOUT", "60"))

DEFAULT_USER = {
    "id": int(os.getenv("DEFAULT_USER_ID", "2")),
    "role": os.getenv("DEFAULT_USER_ROLE", "user"),
    "email": os.getenv("DEFAULT_USER_EMAIL", "carlos.noschangkuhn@canberra.edu.au"),
}

app = FastAPI(title="Cosmic Chat Backend", version="1.0.0")

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"   # Docker copies Vite dist/ → /app/static
INDEX_FILE = STATIC_DIR / "index.html"
ASSETS_DIR = STATIC_DIR / "assets"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Serve built assets with correct MIME types
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR), html=False), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # tighten for prod (e.g., ["http://localhost:8081"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------- Logging -------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    method = request.method
    path = request.url.path
    response = await call_next(request)
    print(f"[REQ] {method} {path} -> {response.status_code}")
    return response

# ============================ API ============================

@app.get("/health")
async def health() -> Dict[str, Any]:
    return {"status": "ok", "cosmic_url": COSMIC_URL}

@app.api_route("/api/chat", methods=["POST", "OPTIONS"])
async def chat(request: Request):
    if request.method == "OPTIONS":
        return PlainTextResponse("OK", status_code=200)

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    user_message = payload.get("user_message")
    user = payload.get("user") or DEFAULT_USER
    if not isinstance(user_message, str) or not user_message.strip():
        raise HTTPException(status_code=400, detail="user_message is required")

    # Identify session (prefer cookie set by index route)
    session_id = request.cookies.get(COOKIE_NAME)
    # If someone hits /api/chat directly (e.g., curl), allow a session_id in payload
    if not session_id:
        session_id = payload.get("session_id")

    if not session_id:
        # Fallback: ephemeral session for this call (won't persist across requests)
        session_id = uuid4().hex

    # Append user message and prepare outgoing with last K turns
    async with SESSION_LOCK:
        history = SESSION_HISTORY[session_id]
        history.append({"role": "user", "content": user_message})
        trimmed = history[-(MAX_TURNS * 2):]  # approx user+assistant per turn

    outgoing = {
        "body": {
            "user": user,
            "messages": trimmed,  # pass recent context only
        },
        "user_message": user_message,
    }

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECS) as client:
            upstream = await client.post(
                COSMIC_URL,
                headers={"accept": "application/json", "Content-Type": "application/json"},
                json=outgoing,
            )

            ct = (upstream.headers.get("content-type") or "").lower()
            text = upstream.text

            # Parse assistant reply (prefer JSON with {result})
            assistant_reply: str = ""
            if "application/json" in ct:
                try:
                    data = upstream.json()
                except Exception:
                    data = None
                if isinstance(data, dict):
                    assistant_reply = (
                        data.get("result")
                        or data.get("reply")
                        or data.get("answer")
                        or data.get("message")
                        or ""
                    )
            if not assistant_reply:
                # Fallback: use raw text
                assistant_reply = text or ""

            # Persist assistant reply
            async with SESSION_LOCK:
                SESSION_HISTORY[session_id].append({"role": "assistant", "content": assistant_reply})
                # Optionally hard prune to a max buffer size to cap memory:
                SESSION_HISTORY[session_id] = SESSION_HISTORY[session_id][- (MAX_TURNS * 2 + 2) :]

            # Forward upstream response (JSON as-is if possible)
            if "application/json" in ct:
                try:
                    return JSONResponse(status_code=upstream.status_code, content=upstream.json())
                except Exception:
                    return JSONResponse(status_code=upstream.status_code, content={"raw": text})
            else:
                return JSONResponse(status_code=upstream.status_code, content={"raw": text})

    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Failed to reach Cosmic API at {COSMIC_URL}: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/session/reset")
async def reset_session(request: Request):
    """Manual reset: clears the current session history and issues a new session id."""
    old_sid = request.cookies.get(COOKIE_NAME)
    new_sid = uuid4().hex

    async with SESSION_LOCK:
        if old_sid and old_sid in SESSION_HISTORY:
            del SESSION_HISTORY[old_sid]
        SESSION_HISTORY[new_sid] = []  # start empty

    resp = JSONResponse({"status": "reset", "session_id": new_sid})
    resp.set_cookie(
        key=COOKIE_NAME,
        value=new_sid,
        httponly=True,
        samesite="Lax",
        secure=False,  # set True behind HTTPS
        path="/",
    )
    return resp

# ============================ STATIC / SPA ============================

def _new_session_response(file_path: Path, request: Request) -> Response:
    """
    Serve index.html and start a new session each time the SPA is loaded.
    If an old session cookie exists, clear its history to free memory.
    """
    old_sid = request.cookies.get(COOKIE_NAME)
    new_sid = uuid4().hex

    async def _clear_and_prepare():
        async with SESSION_LOCK:
            if old_sid and old_sid in SESSION_HISTORY:
                del SESSION_HISTORY[old_sid]
            SESSION_HISTORY[new_sid] = []  # fresh history for this session

    # Run cleanup now (FastAPI allows awaiting in route handlers; here we call inside handlers)
    # We'll call this function only from async handlers below.
    # Returning response and setting cookie:
    resp = FileResponse(str(file_path)) if file_path.exists() else PlainTextResponse("index.html not found", status_code=404)
    # Set cookie for the new session id
    resp.set_cookie(
        key=COOKIE_NAME,
        value=new_sid,
        httponly=True,
        samesite="Lax",
        secure=False,  # set True with HTTPS/production
        path="/",
    )
    # Return resp; static cleanup must be awaited in handlers (see below)
    return resp, _clear_and_prepare

@app.get("/")
async def index_root(request: Request):
    resp, clear_task = _new_session_response(INDEX_FILE, request)
    await clear_task()
    return resp

# SPA fallback for client routes — do NOT intercept /api/* or /assets/*
@app.get("/{full_path:path}")
async def spa_fallback(full_path: str, request: Request):
    if full_path.startswith("api/") or full_path.startswith("assets/") or full_path.startswith("static/"):
        return PlainTextResponse("Not found", status_code=404)
    resp, clear_task = _new_session_response(INDEX_FILE, request)
    await clear_task()
    return resp