from __future__ import annotations

import sys
from pathlib import Path

# Backend-Root immer auf sys.path, wenn Flask nicht aus backend/ gestartet wird
# (sonst: ModuleNotFoundError: config → kein „flask db“-Befehl)
_backend_dir = Path(__file__).resolve().parent
_backend_dir_str = str(_backend_dir)
if _backend_dir_str not in sys.path:
    sys.path.insert(0, _backend_dir_str)

from flask import Flask, jsonify, request
from config import Config
from models import db
from routes.api_routes       import api_bp
from routes.admin_routes import admin_bp
from flasgger import Swagger
from flask_cors import CORS
from routes.request_routes import booking_bp
from routes.upload_routes import upload_bp
from flask_migrate import Migrate
from helpers.clerk_auth import authenticate_request, get_current_artist

from sqlalchemy import text

import logging
import os
import yaml
import re

from helpers.http_responses import error_response
from urllib.parse import urlparse



# Serverless (Vercel) verhaelt sich anders als ein dauerhaft laufender Prozess:
# Es gibt viele kurzlebige Instanzen statt einer langen. Alles, was auf "ein
# Prozess, der lange lebt" baut, muss das wissen. Vercel setzt VERCEL=1.
IS_SERVERLESS = bool(os.getenv("VERCEL"))

# --- Flask app & config ---
app = Flask(__name__)
app.config.from_object(Config)
# Robuste DB-Verbindungen + optional connect_args aus Config (z. B. Supabase SSL)
if IS_SERVERLESS:
    # Kein Verbindungspool: Jede Instanz haette ihren eigenen, und bei
    # gleichzeitigen Aufrufen waere das Verbindungslimit von Postgres schnell
    # erreicht. Pooling uebernimmt in dieser Aufstellung der Supabase-Pooler
    # (Port 6543), nicht SQLAlchemy.
    from sqlalchemy.pool import NullPool
    _engine_defaults = {
        'poolclass': NullPool,
        'pool_pre_ping': True,
    }
else:
    _engine_defaults = {
        'pool_pre_ping': True,
        'pool_recycle': 1800,
        'pool_size': 5,
        'max_overflow': 5,
    }
_cfg_engine = dict(getattr(Config, 'SQLALCHEMY_ENGINE_OPTIONS', None) or {})
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {**_engine_defaults, **_cfg_engine}
# Hilfsfunktion: Passwort in der DB-URL maskieren für Logs
def mask_db_uri(uri: str) -> str:
    import re
    return re.sub(r'(://[^:]+:)([^@]+)(@)', r"\1****\3", uri)


app.logger.info("DB URI: %s | TESTING=%s | ENV=%s",
                app.config.get("SQLALCHEMY_DATABASE_URI"),
                app.config.get("TESTING"),
                os.getenv("FLASK_CONFIG") or os.getenv("FLASK_ENV") or "unset")

logging.getLogger().info(f"Using DB URI: {mask_db_uri(app.config.get('SQLALCHEMY_DATABASE_URI',''))}")
db.init_app(app)
migrate = Migrate(app, db)

app.register_blueprint(api_bp,   url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(upload_bp, url_prefix='/api/upload')
app.register_blueprint(booking_bp)

# --- Guard all /api/admin routes via DB flag (Option A) ---
@app.before_request
def _admin_gate_by_db():
    """Require a valid Clerk token and artists.is_admin = true for any /api/admin/* route.

    Verification result is cached on `g`, so the @clerk_auth_required decorators
    on the individual admin routes reuse it instead of verifying a second time.
    """
    path = request.path or ""
    # Only guard admin endpoints; Swagger and health checks are elsewhere
    if not path.startswith("/api/admin"):
        return None

    # Allow CORS preflight to pass without auth
    if request.method == "OPTIONS":
        return None

    # 1) Verify Clerk token present and valid (cached on g for the route handlers)
    claims = authenticate_request()
    if not claims:
        return error_response("unauthorized", "Invalid or missing token", 401)

    # 2) Load user and check DB flag (also cached on g as g.current_artist)
    #
    # Bewusst *ohne* die zwischenzeitlich ergaenzte Auto-Befoerderung anhand von
    # Clerk-`public_metadata.role`: Wer sich diese Rolle in den Token bekommt,
    # haette sich damit dauerhaft `is_admin` in die DB geschrieben. Adminrechte
    # haengen allein an `artists.is_admin` (SPEC-1/SPEC-2), gesetzt per SQL.
    uid = claims.get('sub')  # Clerk user ID
    artist = get_current_artist()

    if not artist or not getattr(artist, "is_admin", False):
        app.logger.warning(f"ADMIN_GATE: FORBIDDEN uid={uid} artist_found={bool(artist)} is_admin={getattr(artist,'is_admin',None)}")
        return error_response("forbidden", "Admins only", 403)

    app.logger.info(f"ADMIN_GATE: OK path={path} uid={uid} artist_id={artist.id}")
    # Admin OK -> continue request
    return None

# --- CORS (dynamic via ENV CORS_ORIGINS with wildcard support) ---
origins_env = os.getenv("CORS_ORIGINS", "")
allowed_patterns = [o.strip() for o in origins_env.split(",") if o.strip()]

# Fallback, falls ENV leer ist
if not allowed_patterns:
    allowed_patterns = [
        "http://localhost:*",  # alle localhost-Ports (Vite 5173/5174 …)
        "http://127.0.0.1:*",
        "https://pepeshows.de",
        "https://www.pepeshows.de",
        "https://*.vercel.app",  # allow Vercel preview domains via wildcard
    ]

def _pattern_to_regex_fragment(p: str) -> str:
    # Explizit: localhost / 127.0.0.1 mit beliebigem Port (robuster als nur re.escape)
    if p in ("http://localhost:*", "https://localhost:*"):
        return r"https?://localhost(?::\d+)?"
    if p in ("http://127.0.0.1:*", "https://127.0.0.1:*"):
        return r"https?://127\.0\.0\.1(?::\d+)?"
    # Exact origin (no wildcard): anchor exact match
    if "*" not in p:
        return re.escape(p)
    # Wildcard supported at host level, e.g. https://*.vercel.app
    # Convert scheme-specific wildcards to a safe regex
    if p.startswith("https://*"):
        suffix = p.replace("https://*", "", 1)
        return r"https://[^/]+" + re.escape(suffix)
    if p.startswith("http://*"):
        suffix = p.replace("http://*", "", 1)
        return r"http://[^/]+" + re.escape(suffix)
    # Generic fallback: escape and replace * with a non-greedy host match
    return re.escape(p).replace(r"\*", r"[^/]+")

def _compile_origins_regex(patterns: list[str]) -> re.Pattern:
    if not patterns:
        # match nothing
        return re.compile(r"^(?!)$")
    parts = [_pattern_to_regex_fragment(p) for p in patterns]
    regex = r"^(?:" + "|".join(parts) + r")$"
    return re.compile(regex)

allowed_origins_regex = _compile_origins_regex(allowed_patterns)

def origin_allowed(origin: str) -> bool:
    if not origin:
        return False
    return bool(allowed_origins_regex.fullmatch(origin))

CORS(
    app,
    origins=allowed_origins_regex,  # compiled regex accepted by flask-cors
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type", "Authorization", "X-Request-ID"],
    supports_credentials=False,
)

template = {
    "openapi": "3.0.3",
    "info": {
        "title": "Pepe Backend API",
        "description": (
            "This API provides endpoints for artists to manage availability, "
            "authentication, and client booking requests."
        ),
        "version": "1.0.0",
    },
    "components": {
        "securitySchemes": {
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer <token>'",
            }
        }
    },
    "security": [{"bearerAuth": []}],
}

# --- Merge shared OpenAPI component schemas -----------------------------------
try:
    BASE_DIR = os.path.dirname(__file__)
    SCHEMAS_PATH = os.path.join(BASE_DIR, 'resources', 'swagger', 'components', 'schemas.yml')
    if os.path.exists(SCHEMAS_PATH):
        with open(SCHEMAS_PATH, 'r', encoding='utf-8') as f:
            schemas_doc = yaml.safe_load(f) or {}
        # schemas_doc should look like { components: { schemas: { ... } } }
        shared_schemas = (
            schemas_doc.get('components', {}).get('schemas', {})
            if isinstance(schemas_doc, dict) else {}
        )
        if shared_schemas:
            template.setdefault('components', {})
            template['components'].setdefault('schemas', {})
            # extend without overwriting existing keys
            template['components']['schemas'].update(shared_schemas)
except Exception as e:
    app.logger.exception('Failed to load shared OpenAPI schemas: %s', e)
# -----------------------------------------------------------------------------

app.config['SWAGGER'] = {
    'title': "Pepe Backend API",
    'uiversion': 3,
    'openapi': '3.0.3',
    'specs': [
        {
            'endpoint': 'apispec_1',
            'route': '/apispec_1.json',
        }
    ],
    'specs_route': '/api-docs/',
    'ui_params': {
        'validatorUrl': None,
        'docExpansion': 'none',
        'persistAuthorization': True,
        'displayRequestDuration': True,
    }
}

# Serve Swagger UI at /api-docs (also generates /apispec_raw.json)
swagger = Swagger(app, template=template, parse=False)

# --- Debug-Routen ------------------------------------------------------------
# Beide geben Innenansichten preis: die eine die CORS-Konfiguration, die andere
# den kompletten Token-Inhalt des Aufrufers. Sie sind zur Fehlersuche nützlich,
# gehören aber nicht dauerhaft in eine öffentliche Produktionsumgebung.
# Deshalb: nur registrieren, wenn ENABLE_DEBUG_ROUTES gesetzt ist. Ohne Flag
# antwortet der Pfad mit 404, als gäbe es ihn nicht.
DEBUG_ROUTES_ENABLED = os.getenv("ENABLE_DEBUG_ROUTES", "").strip().lower() in ("1", "true", "yes")

if DEBUG_ROUTES_ENABLED:
    app.logger.warning("Debug-Routen unter /__debug/* sind aktiv (ENABLE_DEBUG_ROUTES)")

    @app.get("/__debug/cors")
    def debug_cors():
        test_origin = request.args.get("origin")
        is_allowed = None
        if test_origin:
            try:
                is_allowed = bool(allowed_origins_regex.fullmatch(test_origin))
            except Exception as e:
                is_allowed = f"error: {e}"
        return {
            "allowed_patterns": allowed_patterns,
            "regex": allowed_origins_regex.pattern,
            "test_origin": test_origin,
            "is_allowed": is_allowed,
        }

    @app.get("/__debug/whoami")
    def debug_whoami():
        """Debug endpoint to verify Clerk token and user lookup."""
        claims = authenticate_request()
        if not claims:
            return error_response("unauthorized", "Invalid or missing token", 401)

        uid = claims.get('sub')
        artist = get_current_artist()

        return jsonify({
            "uid": uid,
            "artist_found": bool(artist),
            "clerk_claims": {k: v for k, v in claims.items() if k not in ['iat', 'exp', 'nbf']},
            "artist": {
                "id": getattr(artist, 'id', None),
                "email": getattr(artist, 'email', None),
                "is_admin": getattr(artist, 'is_admin', None),
                "supabase_user_id": getattr(artist, 'supabase_user_id', None),
            }
        }), 200

# Health check endpoint that verifies DB connectivity
@app.get("/healthz")
def healthz():
    """Simple health check that verifies DB connectivity."""
    # Use engine directly for more reliable connection testing
    try:
        # Test connection using engine directly (bypasses session issues)
        with db.engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()  # Actually fetch the result
        return jsonify({"status": "ok"}), 200
    except Exception as e:
        app.logger.exception("Health check failed: %s", e)
        
        # Try one more time with a fresh connection
        try:
            # Force engine to create a new connection
            db.engine.dispose()
            with db.engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                result.fetchone()
            app.logger.info("Health check recovered after engine dispose")
            return jsonify({"status": "ok", "recovered": True}), 200
        except Exception as retry_error:
            app.logger.exception("Health check failed after retry: %s", retry_error)
            return error_response("internal_error", f"DB unavailable: {str(e)}", 503)


# Migration endpoint removed after successful migration


# --- Cron endpoint for daily availability update ---
@app.route("/api/cron/auto-availability", methods=["POST"])
def cron_auto_availability():
    """
    Daily cron: add day+365 availability for all approved artists.
    Protected by CRON_SECRET header to prevent unauthorized access.
    """
    cron_secret = os.getenv("CRON_SECRET")
    if cron_secret:
        provided = request.headers.get("X-Cron-Secret") or request.args.get("secret")
        if provided != cron_secret:
            return error_response("forbidden", "Invalid cron secret", 403)

    try:
        from cron_jobs.auto_availability import run_daily_availability
        result = run_daily_availability()
        return jsonify({"status": "ok", "result": result}), 200
    except Exception as e:
        app.logger.exception("Cron auto-availability failed: %s", e)
        return error_response("internal_error", str(e), 500)


if __name__=="__main__":
    app.run(debug=True)