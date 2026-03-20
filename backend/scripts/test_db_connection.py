#!/usr/bin/env python3
"""
Prüft DATABASE_URL aus backend/.env (ohne Passwort auszugeben).
Aus backend/: python scripts/test_db_connection.py
"""
import os
import sys

# backend/ als cwd
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path
from dotenv import load_dotenv

_backend_root = Path(__file__).resolve().parent.parent
load_dotenv(_backend_root / ".env")

raw = os.getenv("DATABASE_URL", "").strip()
if not raw:
    print("FEHLER: DATABASE_URL ist leer.")
    sys.exit(1)

# Nur Metadaten loggen
from urllib.parse import urlparse

try:
    u = urlparse(raw.replace("postgresql+psycopg://", "postgresql://", 1))
except Exception as e:
    print(f"FEHLER: URL lässt sich nicht parsen: {e}")
    sys.exit(1)

user = u.username or "?"
host = u.hostname or "?"
port = u.port or 5432
db = (u.path or "").lstrip("/") or "?"
pw = u.password or ""
pw_len = len(pw)

# Nur exakte Template-Passwörter (nicht Substring im ganzen URL-String → weniger False Positives)
_PLACEHOLDER_PASSWORDS = frozenset(
    {
        "HIER_DEIN_PASSWORT",
        "[YOUR-PASSWORD]",
        "YOUR-PASSWORD",
        "[password]",
    }
)

print("--- DATABASE_URL Diagnose (kein Klartext-Passwort) ---")
print(f"  Host: {host}")
print(f"  Port: {port}")
print(f"  User: {user}")
print(f"  DB:   {db}")
print(f"  Passwort-Länge (Zeichen): {pw_len}")
if pw in _PLACEHOLDER_PASSWORDS:
    print("  WARNUNG: Passwortfeld ist noch ein bekannter Platzhalter aus der Doku.")
if pw_len == 0:
    print("  WARNUNG: Kein Passwort im geparsten URL-Teil – oft ein @ im Passwort ohne Encoding (URL zerstückelt).")
if pw and ("@" in pw or "#" in pw or "!" in pw or "%" in pw):
    print("  WARNUNG: Passwort enthält @ # ! oder % – in URLs muss es percent-encoded sein,")
    print("           sonst bricht der Parser: erstes @ trennt user:pass von host.")
    print("           Beispiel Python: urllib.parse.quote(passwort, safe='')")

from config import psycopg_connection_uri

# SQLAlchemy braucht postgresql+psycopg:// — reines psycopg nur postgresql://
uri_psycopg = psycopg_connection_uri(raw)

try:
    import psycopg
    conn = psycopg.connect(uri_psycopg, connect_timeout=15)
    conn.close()
    print("OK: Verbindung zu PostgreSQL hat geklappt.")
except Exception as e:
    print(f"FEHLER: {e}")
    print("\nTipps:")
    print("  1) Supabase: Passwort unter Settings → Database neu setzen und exakt kopieren.")
    print("  2) Sonderzeichen im Passwort → URL-Encoding (siehe oben).")
    print("  3) Migrationen: Connection string mit Host db.<ref>.supabase.co (Direct) statt Pooler testen.")
    sys.exit(1)
