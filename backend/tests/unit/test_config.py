"""Normalisierung der DATABASE_URL.

Die Werte kommen aus Dashboard-Feldern und werden von Hand eingefuegt. Genau da
entstehen die Fehler, die man nicht sieht: ein Zeilenumbruch am Ende hat auf
Vercel dazu gefuehrt, dass Postgres eine Datenbank namens "postgres\\n" suchte.
"""

from config import normalize_db_url, psycopg_connection_uri

POOLER = "postgresql://postgres.ref:pw@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"


class TestWhitespace:
    def test_trailing_newline_is_stripped(self):
        assert normalize_db_url(POOLER + "\n") == normalize_db_url(POOLER)

    def test_surrounding_whitespace_is_stripped(self):
        assert normalize_db_url(f"  {POOLER}\r\n ") == normalize_db_url(POOLER)

    def test_database_name_stays_intact(self):
        assert normalize_db_url(POOLER + "\n").endswith("/postgres?sslmode=require")

    def test_empty_stays_empty(self):
        assert normalize_db_url("") == ""
        assert normalize_db_url("   \n") == ""


class TestScheme:
    def test_postgres_scheme_becomes_psycopg(self):
        out = normalize_db_url("postgres://u:p@host:5432/db")
        assert out.startswith("postgresql+psycopg://")

    def test_postgresql_scheme_becomes_psycopg(self):
        out = normalize_db_url("postgresql://u:p@host:5432/db")
        assert out.startswith("postgresql+psycopg://")

    def test_already_normalized_is_untouched(self):
        src = "postgresql+psycopg://u:p@host:5432/db"
        assert normalize_db_url(src) == src

    def test_sqlite_is_untouched(self):
        assert normalize_db_url("sqlite:///pepe.db") == "sqlite:///pepe.db"


class TestSsl:
    def test_supabase_gets_sslmode(self):
        assert normalize_db_url(POOLER).endswith("?sslmode=require")

    def test_existing_query_gets_ampersand(self):
        out = normalize_db_url(POOLER + "?application_name=pepe")
        assert out.endswith("?application_name=pepe&sslmode=require")

    def test_existing_sslmode_is_not_duplicated(self):
        out = normalize_db_url(POOLER + "?sslmode=require")
        assert out.count("sslmode=") == 1

    def test_non_supabase_host_gets_nothing_appended(self):
        assert "sslmode" not in normalize_db_url("postgresql://u:p@localhost:5432/db")


class TestPsycopgUri:
    def test_returns_libpq_scheme(self):
        assert psycopg_connection_uri(POOLER).startswith("postgresql://")

    def test_strips_whitespace_too(self):
        assert psycopg_connection_uri(POOLER + "\n") == psycopg_connection_uri(POOLER)

    def test_empty_input_is_empty(self):
        assert psycopg_connection_uri("   ") == ""
