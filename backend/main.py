import os
import json
from pathlib import Path
from typing import Any, Dict

import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Chat history 
CHAT_HISTORY:list[dict] = []

# ---- Config ----
COSMIC_URL = os.getenv("COSMIC_URL", "http://host.docker.internal:3000/cosmic")
TIMEOUT_SECS = float(os.getenv("COSMIC_TIMEOUT", "60"))

DEFAULT_USER = {
    "id": int(os.getenv("DEFAULT_USER_ID", "2")),
    "role": os.getenv("DEFAULT_USER_ROLE", "user"),
    "email": os.getenv("DEFAULT_USER_EMAIL", "carlos.noschangkuhn@canberra.edu.au"),
}

app = FastAPI(title="Cosmic Chat Backend", version="1.0.0")


STATIC_DIR = Path(__file__).resolve().parent.parent / "static"   # this is where Docker copied dist/
INDEX_FILE = STATIC_DIR / "index.html"
ASSETS_DIR = STATIC_DIR / "assets"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# 1) Mount /assets to serve JS/CSS with correct MIME types
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR), html=False), name="assets")


# CORS: safe even if same-origin; also answers OPTIONS preflight cleanly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # tighten for prod (e.g., ["http://localhost:8081"])
    allow_credentials=True,
    allow_methods=["*"],        # allow POST/GET/OPTIONS
    allow_headers=["*"],
)

# Debug logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    method = request.method
    path = request.url.path
    response = await call_next(request)
    print(f"[REQ] {method} {path} -> {response.status_code}")
    return response

# ========== API ROUTES FIRST ==========

@app.get("/health")
async def health() -> Dict[str, Any]:
    return {"status": "ok", "cosmic_url": COSMIC_URL}

# Accept POST (main) and OPTIONS (preflight) for /api/chat
@app.api_route("/api/chat", methods=["POST", "OPTIONS"])
async def chat(request: Request):
    if request.method == "OPTIONS":
        # CORS middleware already sets headers; return 200 OK
        return PlainTextResponse("OK", status_code=200)

    # POST
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    user_message = payload.get("user_message")
    user = payload.get("user") or DEFAULT_USER
    CHAT_HISTORY.append({"role": "user", "content": user_message})
    # messages = payload.get("messages") or []

    if not isinstance(user_message, str) or not user_message.strip():
        raise HTTPException(status_code=400, detail="user_message is required")

    outgoing = {
        "body": {"user": user, 
                 'messages': CHAT_HISTORY[-5:]  # send last 5 messages as context; adjust as needed,
                #  "messages":[ {"role": "user", "content": "We are talking about Ayrton Senna"},
                            #  {"role": "assistant", "content": "Yes, we are talking about the F1 legend Ayrton Senna"}]
                 },
        "user_message": user_message,
    }

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECS) as client:
            upstream = await client.post(
                COSMIC_URL,
                headers={"accept": "application/json", "Content-Type": "application/json"},
                json=outgoing,  # json= avoids double encoding
            )
            ct = (upstream.headers.get("content-type") or "").lower()
            text = upstream.text
            CHAT_HISTORY.append({"role": "assistant", "content": json.loads(text).get("result", "")})
            if "application/json" in ct:
                # Forward JSON as-is
                return JSONResponse(status_code=upstream.status_code, content=upstream.json())
            else:
                # Wrap non-JSON as { raw: "..."}
                return JSONResponse(status_code=upstream.status_code, content={"raw": text})
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Failed to reach Cosmic API at {COSMIC_URL}: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Optional: friendly GET to help when visiting in a browser
@app.get("/api/chat/info")
async def chat_info():
    return PlainTextResponse("Use POST /api/chat with JSON: { user_message, user }", status_code=200)

# ========== STATIC AFTER API ==========

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
INDEX_FILE = STATIC_DIR / "index.html"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Serve assets at /static
app.mount("/static", StaticFiles(directory=str(STATIC_DIR), html=False), name="static")

# Serve SPA at root
@app.get("/")
async def index_root():
    if INDEX_FILE.exists():
        return FileResponse(str(INDEX_FILE))
    return PlainTextResponse("index.html not found", status_code=404)

# SPA fallback for client routes — but DO NOT intercept /api/*
@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    if full_path.startswith("api/"):
        return PlainTextResponse("API route not found", status_code=404)
    if INDEX_FILE.exists():
        return FileResponse(str(INDEX_FILE))
    return PlainTextResponse("Not found", status_code=404)