# helpers/clerk_auth.py
"""Clerk JWT verification helper for Flask backend."""

from __future__ import annotations

import os
import ssl
import jwt
from jwt import PyJWKClient
from functools import wraps
from flask import request, g, current_app
from helpers.http_responses import error_response

# Try to use certifi for SSL certificates (fixes macOS SSL issues)
try:
    import certifi
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSL_CONTEXT = ssl.create_default_context()

# Clerk JWKS URL comes from the environment so switching between the Clerk
# development and production instance never requires a code change.
# Example: https://clerk.pepeshows.de/.well-known/jwks.json
#
# Bewusst ohne Fallback auf die Dev-Instanz: Ein hartkodierter Default lässt den
# Wechsel auf Production stillschweigend gegen die Testinstanz laufen, statt
# klar zu scheitern (Analyse D3).
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "").strip()

# Optionaler Aussteller-Check. Ist CLERK_ISSUER gesetzt, muss der `iss`-Claim
# exakt passen. Ohne diese Prüfung zählt allein die Signatur — beim Umschalten
# zwischen Dev- und Production-Instanz fällt ein vergessener JWKS-Wechsel sonst
# nicht auf. Leer gelassen bleibt das Verhalten wie bisher.
CLERK_ISSUER = os.getenv("CLERK_ISSUER", "").strip()

# Cache the JWKS client
_jwks_client = None

def get_jwks_client():
    """Get or create cached JWKS client."""
    global _jwks_client
    if not CLERK_JWKS_URL:
        raise RuntimeError(
            "CLERK_JWKS_URL is not configured. Set it to the JWKS endpoint of the "
            "Clerk instance, e.g. https://clerk.pepeshows.de/.well-known/jwks.json"
        )
    if _jwks_client is None:
        current_app.logger.info(
            "Initializing Clerk JWKS client with URL: %s", CLERK_JWKS_URL
        )
        _jwks_client = PyJWKClient(CLERK_JWKS_URL, ssl_context=SSL_CONTEXT)
    return _jwks_client


def verify_clerk_token(token: str) -> dict | None:
    """Verify a Clerk JWT token and return the claims.

    Args:
        token: The JWT token string (without 'Bearer ' prefix)

    Returns:
        dict with claims if valid, None if invalid
    """
    if not token:
        return None

    try:
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify the token
        decode_kwargs = {}
        if CLERK_ISSUER:
            decode_kwargs["issuer"] = CLERK_ISSUER

        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={
                "verify_exp": True,
                "verify_aud": False,  # Clerk doesn't always set audience
                "require": ["exp", "sub"],
            },
            **decode_kwargs,
        )
        if not claims.get("sub"):
            current_app.logger.warning("Clerk token without sub claim rejected")
            return None
        return claims
    except jwt.ExpiredSignatureError:
        current_app.logger.warning("Clerk token expired")
        return None
    except jwt.InvalidTokenError as e:
        current_app.logger.warning(f"Invalid Clerk token: {e}")
        return None
    except Exception as e:
        current_app.logger.error(f"Clerk token verification error: {e}")
        return None


def get_clerk_user_id() -> str | None:
    """Get the Clerk user ID from the current request.

    Returns:
        The Clerk user ID (sub claim) or None if not authenticated
    """
    return getattr(g, 'clerk_user_id', None)


def get_clerk_claims() -> dict | None:
    """Get all Clerk claims from the current request.

    Returns:
        dict of claims or None if not authenticated
    """
    return getattr(g, 'clerk_claims', None)


def authenticate_request() -> dict | None:
    """Verify the Authorization header once per request and cache it on `g`.

    Called by both the /api/admin before_request gate and `clerk_auth_required`,
    so a request is never verified against the JWKS endpoint twice.

    Returns:
        The claims dict, or None if there is no valid bearer token.
    """
    if getattr(g, 'clerk_claims', None) is not None:
        return g.clerk_claims

    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None

    claims = verify_clerk_token(auth_header[7:])  # Remove 'Bearer ' prefix
    if not claims:
        return None

    g.clerk_user_id = claims.get('sub')
    g.clerk_claims = claims
    return claims


def get_clerk_email() -> str | None:
    """Return the e-mail from the Clerk claims (requires the JWT template)."""
    claims = get_clerk_claims() or {}
    email = (
        claims.get("email")
        or claims.get("primary_email_address")
        or claims.get("email_address")
    )
    if not email:
        addresses = claims.get("email_addresses")
        if isinstance(addresses, list) and addresses:
            first = addresses[0]
            email = first.get("email_address") if isinstance(first, dict) else first
    if isinstance(email, str):
        email = email.strip()
    return email or None


def get_clerk_name() -> str | None:
    """Return the display name from the Clerk claims (requires the JWT template)."""
    claims = get_clerk_claims() or {}
    name = claims.get("name")
    if not name:
        parts = [claims.get("first_name") or "", claims.get("last_name") or ""]
        name = " ".join(p for p in parts if p)
    name = name.strip() if isinstance(name, str) else None
    return name or None


def get_current_artist():
    """Resolve the Artist row belonging to the authenticated Clerk user.

    Pure lookup — this never creates rows. Use `ensure_artist_for_current_user`
    in api_routes for the onboarding path.

    Returns:
        Artist instance or None.
    """
    if 'current_artist' in g:
        return g.current_artist

    artist = None
    uid = get_clerk_user_id()
    if uid and isinstance(uid, str):
        from sqlalchemy import func
        from models import Artist
        try:
            artist = Artist.query.filter(
                func.lower(Artist.supabase_user_id) == uid.lower()
            ).first()
        except Exception:
            current_app.logger.exception("get_current_artist lookup failed for uid=%s", uid)
            artist = None

    g.current_artist = artist
    return artist


def get_current_artist_id() -> int | None:
    """Return the internal integer Artist.id of the authenticated Clerk user."""
    artist = get_current_artist()
    return getattr(artist, 'id', None)


def clerk_auth_required(fn):
    """Decorator to require Clerk authentication.

    Sets g.clerk_user_id and g.clerk_claims on successful auth.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if authenticate_request() is None:
            return error_response("unauthorized", "Invalid or missing token", 401)
        return fn(*args, **kwargs)
    return wrapper


def artist_required(fn):
    """Require a valid Clerk token *and* a linked Artist row.

    Sets g.current_artist so the handler can use the internal integer ID.
    """
    @wraps(fn)
    @clerk_auth_required
    def wrapper(*args, **kwargs):
        if get_current_artist() is None:
            return error_response("forbidden", "Current user not linked to an artist", 403)
        return fn(*args, **kwargs)
    return wrapper


def clerk_auth_optional(fn):
    """Decorator for optional Clerk authentication.

    Sets g.clerk_user_id and g.clerk_claims if valid token present,
    otherwise sets them to None. Never returns error.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if authenticate_request() is None:
            g.clerk_user_id = None
            g.clerk_claims = None
        return fn(*args, **kwargs)
    return wrapper


def get_user_role() -> str | None:
    """Get the user's role from Clerk public metadata.

    Returns:
        Role string ('shows-artist', 'shows-admin') or None
    """
    claims = get_clerk_claims()
    if claims:
        # Clerk stores public_metadata in the JWT
        metadata = claims.get('public_metadata', {}) or {}
        return metadata.get('role')
    return None


def require_role(*allowed_roles):
    """Decorator to require specific roles.

    Usage:
        @require_role("shows-admin")
        def admin_only(): ...

        @require_role("shows-admin", "shows-artist")
        def admin_or_artist(): ...
    """
    def decorator(fn):
        @wraps(fn)
        @clerk_auth_required
        def wrapper(*args, **kwargs):
            role = get_user_role()
            if role not in allowed_roles:
                return error_response(
                    "forbidden",
                    f"Access denied. Required role: {', '.join(allowed_roles)}",
                    403
                )
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def is_admin() -> bool:
    """Check whether the authenticated user is an admin.

    The `artists.is_admin` column is the single source of truth — the Clerk
    role in public_metadata is informational only.
    """
    return bool(getattr(get_current_artist(), 'is_admin', False))


def is_artist() -> bool:
    """Check if current user is shows-artist."""
    return get_user_role() == "shows-artist"


def admin_required(fn):
    """Require a valid Clerk token and artists.is_admin = true."""
    @wraps(fn)
    @clerk_auth_required
    def wrapper(*args, **kwargs):
        if not is_admin():
            return error_response("forbidden", "Admins only", 403)
        return fn(*args, **kwargs)
    return wrapper
