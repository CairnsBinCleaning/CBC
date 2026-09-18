"""Token helpers. Deliberately dependency-light: requests + PyJWT only,
so a scheduled run never has to install anything."""

import time
import jwt
import requests

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
_cache = {}


def google_service_account_token(sa: dict, scopes: list) -> str:
    """Sign a JWT with the service-account key and swap it for an access token."""
    key = (sa["client_email"], tuple(scopes))
    hit = _cache.get(key)
    if hit and hit[1] > time.time() + 60:
        return hit[0]

    now = int(time.time())
    claim = {
        "iss": sa["client_email"],
        "scope": " ".join(scopes),
        "aud": GOOGLE_TOKEN_URL,
        "iat": now,
        "exp": now + 3600,
    }
    assertion = jwt.encode(claim, sa["private_key"], algorithm="RS256")
    r = requests.post(
        GOOGLE_TOKEN_URL,
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": assertion,
        },
        timeout=30,
    )
    r.raise_for_status()
    tok = r.json()["access_token"]
    _cache[key] = (tok, now + 3500)
    return tok


def google_oauth_token(client_id: str, client_secret: str, refresh_token: str) -> str:
    """Refresh-token flow — used by Google Ads, which won't take a service account."""
    key = (client_id, refresh_token)
    hit = _cache.get(key)
    if hit and hit[1] > time.time() + 60:
        return hit[0]

    r = requests.post(
        GOOGLE_TOKEN_URL,
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        },
        timeout=30,
    )
    r.raise_for_status()
    tok = r.json()["access_token"]
    _cache[key] = (tok, int(time.time()) + 3500)
    return tok
