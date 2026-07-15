# main.py - for the main file for the backend for frontend -bff  for redirecting the login to keycloak and getting the tokens/cookies for the frontend.


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .auth_routes import auth_router
from . import config

app = FastAPI(title="CoSMIC BFF")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)

@app.get("/health")
async def health():
    return {"status": "ok"}