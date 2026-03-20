import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Immer backend/.env (nie .env.example) – unabhängig vom aktuellen Arbeitsverzeichnis
_backend_root = Path(__file__).resolve().parent
load_dotenv(_backend_root / ".env")

def normalize_db_url(raw: str) -> str:
    if raw.startswith("postgres://"):
        raw = raw.replace("postgres://", "postgresql+psycopg://", 1)
    elif raw.startswith("postgresql://") and not raw.startswith("postgresql+psycopg://"):
        raw = raw.replace("postgresql://", "postgresql+psycopg://", 1)
    # Supabase / die meisten managed Postgres-Anbieter brauchen TLS
    lowered = raw.lower()
    if any(h in lowered for h in ("supabase.co", "pooler.supabase.com")):
        if "sslmode=" not in lowered and "ssl=" not in lowered:
            sep = "&" if "?" in raw else "?"
            raw = f"{raw}{sep}sslmode=require"
    return raw


def psycopg_connection_uri(raw: Optional[str] = None) -> str:
    """URI für psycopg/libpq (postgresql://…), nicht SQLAlchemy (postgresql+psycopg://)."""
    s = (raw or os.getenv("DATABASE_URL", "")).strip()
    if not s:
        return ""
    return normalize_db_url(s).replace("postgresql+psycopg://", "postgresql://", 1)


# Klassen-Body: Comprehensions sehen keine frisch zugewiesenen Klassen-Locals → Modul-Ebene nutzen
_db_url_lower = os.getenv("DATABASE_URL", "").lower()


class Config:
    # Flask-Session / CSRF: eigener Secret bevorzugen (nicht JWT-Secret von Clerk/Supabase mischen)
    SECRET_KEY = (
        os.getenv("FLASK_SECRET_KEY")
        or os.getenv("SECRET_KEY")
        or os.getenv("SUPABASE_JWT_SECRET")
        or "dev-only-change-me"
    )
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or SECRET_KEY

    raw_db = os.getenv("DATABASE_URL", "")
    if raw_db:
        SQLALCHEMY_DATABASE_URI = normalize_db_url(raw_db)
    else:
        SQLALCHEMY_DATABASE_URI = "sqlite:///pepe.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Optional: SQLAlchemy Engine-Optionen (wird in app.py mit Defaults gemerged)
    SQLALCHEMY_ENGINE_OPTIONS = {}
    if any(h in _db_url_lower for h in ("supabase.co", "pooler.supabase.com")):
        SQLALCHEMY_ENGINE_OPTIONS["connect_args"] = {"sslmode": "require"}

    AGENCY_FEE_PERCENT = int(os.getenv("AGENCY_FEE_PERCENT", "20"))
    RATE_PER_KM = 0.5

    # --- SMTP / App Settings ---
    APP_URL = os.getenv("APP_URL")
    SMTP_HOST = os.getenv("SMTP_HOST")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    SMTP_FROM = os.getenv("SMTP_FROM") or SMTP_USER
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")


    # --- Swagger / OpenAPI Settings ---
    SWAGGER = {
        "title": "Pepe Booking API",
        # Use Swagger UI v3 to render OpenAPI 3 specs
        "uiversion": 3,
        # Ensure the generated root spec uses OpenAPI 3
        "openapi": "3.0.3",
        # Route where the Swagger UI will be served (e.g., http://localhost:5000/api-docs/)
        "specs": [
            {
                "endpoint": "apispec_1",
                "route": "/apispec_1.json",
            }
        ],
        "specs_route": "/api-docs/",
    }

    
class TestConfig(Config):
    """Konfiguration für Tests mit In-Memory-Datenbank."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv("TEST_DATABASE_URL", "sqlite:///:memory:")