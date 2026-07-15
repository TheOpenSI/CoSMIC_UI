# auth_routes.py - for the authentication routes for the backend for frontend -bff  for redirecting the login to keycloak and getting the tokens/cookies for the frontend.



import secrets
from urllib.parse import urlencode

import httpx
import jwt
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from jwt import PyJWKClient

from . import config

auth_router = APIRouter(prefix=config.AUTH_API_PREFIX, tags=["auth"])

_jwks_client: PyJWKClient | None = None

#  cookir_kwrags for the structure of the cookie or common settings
def _cookie_kwargs(max_age: int | None = None) -> dict:
    kwargs = {
        "httponly": True,
        "secure": False,      # set True in production (HTTPS)
        "samesite": "lax",
        "path": "/",
    }
    if max_age is not None:
        kwargs["max_age"] = max_age
    return kwargs

# public key of keycloak for the authentication of the tokens.
def _get_jwks() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(
            f"{config.KEYCLOAK_INTERNAL_URL}/realms/{config.KEYCLOAK_REALM}"
            "/protocol/openid-connect/certs"
        )
    return _jwks_client

# decode the access token  with public key  above
def _decode_access_token(token: str) -> dict:
    signing_key = _get_jwks().get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        issuer=config.OIDC_ISSUER,
        options={"verify_aud": False},
    )

# login redirects to keycloak for the authentication of the user. uyrl built from .env file. and hits the exact url of realm and protocol.
@auth_router.get("/login")
async def login() -> RedirectResponse:
    state = secrets.token_urlsafe(32)

    params = {
        "client_id": config.KEYCLOAK_CLIENT_ID,
        "response_type": "code",
        "scope": "openid profile email",
        "redirect_uri": config.AUTH_CALLBACK_URL,
        "state": state,
    }
    authorize_url = (
        f"{config.KEYCLOAK_PUBLIC_URL}/realms/{config.KEYCLOAK_REALM}"
        f"/protocol/openid-connect/auth?{urlencode(params)}"
    )

    response = RedirectResponse(url=authorize_url, status_code=302)
    response.set_cookie(config.OAUTH_STATE_COOKIE, state, max_age=600, **_cookie_kwargs())
    return response


@auth_router.get("/callback")
async def callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
) -> RedirectResponse:
    if error:
        return RedirectResponse(
            url=f"{config.FRONTEND_URL}/login?error={error}",
            status_code=302,
        )

    # if the code or state is missing, raise an error

    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing OAuth code or state")
    # if the state is not saved or not equal beforr sending to keycloak, raise an error
    saved_state = request.cookies.get(config.OAUTH_STATE_COOKIE)
    if not saved_state or saved_state != state:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")


    # BFF recieves token code from keyclock not actual token , so we need to exchange the code for the token.
    # token_url is the url of the keycloak to exchange the code for the token.
    token_url = (
        f"{config.KEYCLOAK_INTERNAL_URL}/realms/{config.KEYCLOAK_REALM}"
        "/protocol/openid-connect/token"
    )
    token_data = {
        "grant_type": "authorization_code",
        "client_id": config.KEYCLOAK_CLIENT_ID,
        "client_secret": config.KEYCLOAK_CLIENT_SECRET,
        "code": code,
        "redirect_uri": config.AUTH_CALLBACK_URL,
    }

    #sending token data including code to token url to get the access token and refresh token.
    async with httpx.AsyncClient(timeout=15.0) as client:
        token_response = await client.post(token_url, data=token_data)

    if token_response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Token exchange failed: {token_response.text}",
        )

    # tokens is the response from the keycloak to the token url.
    tokens = token_response.json()
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")

    if not access_token:
        raise HTTPException(status_code=502, detail="No access token returned")
    # redirect to the frontend url with the access token and refresh token.
    response = RedirectResponse(url=f"{config.FRONTEND_URL}/chat", status_code=302)
    response.delete_cookie(config.OAUTH_STATE_COOKIE, path="/")
    # setting the access token and refresh token in the cookies.
    response.set_cookie(
        config.ACCESS_TOKEN_COOKIE,
        access_token,
        max_age=tokens.get("expires_in", 300),
        **_cookie_kwargs(),
    )
    if refresh_token:
        response.set_cookie(
            config.REFRESH_TOKEN_COOKIE,
            refresh_token,
            max_age=tokens.get("refresh_expires_in", 1800),
            **_cookie_kwargs(),
        )
    return response


@auth_router.post("/logout")
async def logout(request: Request) -> RedirectResponse:
    refresh_token = request.cookies.get(config.REFRESH_TOKEN_COOKIE)
    if refresh_token:
        logout_url = (
            f"{config.KEYCLOAK_INTERNAL_URL}/realms/{config.KEYCLOAK_REALM}"
            "/protocol/openid-connect/logout"
        )
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(
                logout_url,
                data={
                    "client_id": config.KEYCLOAK_CLIENT_ID,
                    "client_secret": config.KEYCLOAK_CLIENT_SECRET,
                    "refresh_token": refresh_token,
                },
            )

    response = RedirectResponse(url=f"{config.FRONTEND_URL}/login", status_code=302)
    response.delete_cookie(config.ACCESS_TOKEN_COOKIE, path="/")
    response.delete_cookie(config.REFRESH_TOKEN_COOKIE, path="/")
    return response


@auth_router.get("/me")
async def me(request: Request) -> dict:
    access_token = request.cookies.get(config.ACCESS_TOKEN_COOKIE)
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        claims = _decode_access_token(access_token)
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    realm_roles = claims.get("realm_access", {}).get("roles", [])
    return {
        "sub": claims.get("sub"),
        "email": claims.get("email"),
        "name": claims.get("name") or claims.get("preferred_username"),
        "roles": realm_roles,
    }