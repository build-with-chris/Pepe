import os
from dotenv import load_dotenv

load_dotenv()

def normalize_db_url(raw: str) -> str:
    if raw.startswith("postgres://"):
        return raw.replace("postgres://", "postgresql+psycopg://", 1)
    if raw.startswith("postgresql://") and not raw.startswith("postgresql+psycopg://"):
        return raw.replace("postgresql://", "postgresql+psycopg://", 1)
    return raw

class Config:
    SECRET_KEY = os.getenv("SUPABASE_JWT_SECRET")
    JWT_SECRET_KEY = os.getenv("SUPABASE_JWT_SECRET")

    raw_db = os.getenv("DATABASE_URL", "")
    if raw_db:
        SQLALCHEMY_DATABASE_URI = normalize_db_url(raw_db)
    else:
        SQLALCHEMY_DATABASE_URI = "sqlite:///pepe.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

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

    # SICHERHEITSCHECK: Niemals Production-DB in Tests verwenden!
    test_db_url = os.getenv("TEST_DATABASE_URL", "sqlite:///:memory:")
    production_indicators = [
        "render.com", "production", "prod", "pepe-backend",
        "postgresql+psycopg://", "postgresql://", "postgres://"
    ]

    # Überprüfe, ob TEST_DATABASE_URL auf Production zeigt
    for indicator in production_indicators:
        if indicator in test_db_url.lower():
            raise RuntimeError(
                f"GEFAHR: TEST_DATABASE_URL scheint auf Production-DB zu zeigen! "
                f"URL enthält '{indicator}'. Verwende für Tests nur 'sqlite:///:memory:' "
                f"oder eine lokale Test-DB. Aktuelle URL: {test_db_url[:50]}..."
            )

    SQLALCHEMY_DATABASE_URI = test_db_url