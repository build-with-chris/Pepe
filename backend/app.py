from flask import Flask, jsonify, request
from config import Config
from models import db, Artist
from flask_jwt_extended import JWTManager, verify_jwt_in_request, get_jwt_identity, jwt_required
from routes.api_routes       import api_bp
from routes.auth_routes  import auth_bp
from routes.admin_routes import admin_bp
from flasgger import Swagger
from flask_cors import CORS
from routes.request_routes import booking_bp
from flask_migrate import Migrate

from sqlalchemy import text

import logging
import os
import yaml
import re

from helpers.http_responses import error_response
from urllib.parse import urlparse



# --- Flask app & config ---
app = Flask(__name__)
app.config.from_object(Config)
# Ensure robust DB connections (survive restarts/plan changes)
app.config.setdefault('SQLALCHEMY_ENGINE_OPTIONS', {
    'pool_pre_ping': True,     # validates connections before using them
    'pool_recycle': 1800,      # recycle connections every 30 minutes
    'pool_size': 5,
    'max_overflow': 5,
    # If your provider requires SSL (e.g. Supabase/managed PG), uncomment:
    # 'connect_args': {'sslmode': 'require'},
})
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

app.register_blueprint(auth_bp,  url_prefix='/auth')
app.register_blueprint(api_bp,   url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(booking_bp)

jwt = JWTManager(app)

# --- Guard all /api/admin routes via DB flag (Option A) ---
@app.before_request
def _admin_gate_by_db():
    """Require a valid JWT and artists.is_admin = true for any /api/admin/* route."""
    path = request.path or ""
    # Only guard admin endpoints; Swagger and health checks are elsewhere
    if not path.startswith("/api/admin"):
        return None

    # Allow CORS preflight to pass without auth
    if request.method == "OPTIONS":
        return None

    # 1) Verify JWT present and valid
    try:
        verify_jwt_in_request()
    except Exception:
        # Consistent error format
        return error_response("unauthorized", "Missing or invalid token", 401)

    # 2) Load user and check DB flag
    uid = get_jwt_identity()
    app.logger.info(f"ADMIN_GATE: path={path} uid={uid}")
    artist = None

    # Try integer primary key first (local Artist.id)
    try:
        if uid is not None:
            uid_int = int(uid)
            artist = Artist.query.get(uid_int)
            if artist:
                app.logger.info(f"ADMIN_GATE: resolved by int PK -> artist_id={artist.id} email={getattr(artist,'email',None)} is_admin={getattr(artist,'is_admin',None)}")
    except (TypeError, ValueError):
        artist = None

    # Fallback: resolve via Supabase UUID stored on Artist.supabase_user_id
    if artist is None and isinstance(uid, str):
        from sqlalchemy import func
        try:
            artist = Artist.query.filter(func.lower(Artist.supabase_user_id) == uid.lower()).first()
            if artist is not None:
                app.logger.info(f"ADMIN_GATE: resolved by supabase_user_id -> artist_id={artist.id} email={getattr(artist,'email',None)} is_admin={getattr(artist,'is_admin',None)}")
        except Exception:
            artist = None

    if not artist or not getattr(artist, "is_admin", False):
        app.logger.warning(f"ADMIN_GATE: FORBIDDEN uid={uid} artist_found={bool(artist)} is_admin={getattr(artist,'is_admin',None)}")
        return error_response("forbidden", "Admins only", 403)

    # Admin OK -> continue request
    return None

# --- CORS (dynamic via ENV CORS_ORIGINS with wildcard support) ---
origins_env = os.getenv("CORS_ORIGINS", "")
allowed_patterns = [o.strip() for o in origins_env.split(",") if o.strip()]

# Fallback, falls ENV leer ist
if not allowed_patterns:
    allowed_patterns = [
        "http://localhost:5173",
        "https://pepeshows.de",
    ]

def _pattern_to_regex_fragment(p: str) -> str:
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

# Debug route for DB config
@app.get("/__debug/db")
def debug_db():
    return {
        "uri": app.config.get("SQLALCHEMY_DATABASE_URI"),
        "testing": app.config.get("TESTING", False)
    }

# Debug route for CORS config
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
@jwt_required()
def debug_whoami():
    uid = get_jwt_identity()
    artist = None
    try:
        uid_int = int(uid)
        artist = Artist.query.get(uid_int)
    except Exception:
        pass
    if artist is None and isinstance(uid, str):
        from sqlalchemy import func
        artist = Artist.query.filter(func.lower(Artist.supabase_user_id) == uid.lower()).first()
    return jsonify({
        "uid": uid,
        "artist_found": bool(artist),
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
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify({"status": "ok"}), 200
    except Exception as e:
        app.logger.exception("Health check failed: %s", e)
        return error_response("internal_error", f"DB unavailable: {str(e)}", 503)


@app.post("/run-migrations-temp")
def run_migrations_temp():
    """TEMPORARY: Run database migrations without auth. Remove after use."""
    try:
        from flask_migrate import upgrade

        # Run migrations
        upgrade()

        return jsonify({
            "message": "Database migration completed successfully"
        }), 200

    except Exception as e:
        app.logger.exception("Migration failed: %s", e)
        return error_response("internal_error", f"Migration failed: {str(e)}", 500)


if __name__=="__main__":
    app.run(debug=True)