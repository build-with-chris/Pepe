# helpers/clerk_auth.py
"""Clerk JWT verification helper for Flask backend."""

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

# Clerk JWKS URL - derived from publishable key
# pk_test_bmV4dC1xdWFpbC00OS5jbGVyay5hY2NvdW50cy5kZXYk decodes to next-quail-49.clerk.accounts.dev
CLERK_JWKS_URL = "https://next-quail-49.clerk.accounts.dev/.well-known/jwks.json"

# Cache the JWKS client
_jwks_client = None

def get_jwks_client():
    """Get or create cached JWKS client."""
    global _jwks_client
    if _jwks_client is None:
        # Use custom SSL context with certifi certificates
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
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={
                "verify_exp": True,
                "verify_aud": False,  # Clerk doesn't always set audience
            }
        )
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


def clerk_auth_required(fn):
    """Decorator to require Clerk authentication.

    Sets g.clerk_user_id and g.clerk_claims on successful auth.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return error_response("unauthorized", "Missing or invalid Authorization header", 401)

        token = auth_header[7:]  # Remove 'Bearer ' prefix
        claims = verify_clerk_token(token)

        if not claims:
            return error_response("unauthorized", "Invalid or expired token", 401)

        # Store in Flask's g object for access in route handlers
        g.clerk_user_id = claims.get('sub')
        g.clerk_claims = claims

        return fn(*args, **kwargs)
    return wrapper


def clerk_auth_optional(fn):
    """Decorator for optional Clerk authentication.

    Sets g.clerk_user_id and g.clerk_claims if valid token present,
    otherwise sets them to None. Never returns error.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            claims = verify_clerk_token(token)
            if claims:
                g.clerk_user_id = claims.get('sub')
                g.clerk_claims = claims
            else:
                g.clerk_user_id = None
                g.clerk_claims = None
        else:
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
    """Check if current user is shows-admin."""
    return get_user_role() == "shows-admin"


def is_artist() -> bool:
    """Check if current user is shows-artist."""
    return get_user_role() == "shows-artist"
