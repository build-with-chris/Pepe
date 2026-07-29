import os, sys, time, uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Muss vor dem Import von app/helpers gesetzt sein: clerk_auth liest die JWKS-URL
# beim Modul-Import. Die URL wird in Tests nie aufgerufen — get_jwks_client() ist
# durch die Fixture unten ersetzt —, muss aber gesetzt sein.
os.environ.setdefault("CLERK_JWKS_URL", "https://clerk.test.invalid/.well-known/jwks.json")

# Ebenfalls vor dem Import: Der Aussteller-Check ist optional, wird hier aber
# bewusst eingeschaltet. Sonst liefe er in Tests nie mit, obwohl er in Produktion
# aktiv sein soll. Der Wert muss zum `iss` der Token-Factory unten passen.
TEST_ISSUER = "https://clerk.test.invalid"
os.environ["CLERK_ISSUER"] = TEST_ISSUER

import pytest
import jwt as pyjwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from flask import g

import helpers.clerk_auth as clerk_auth
from app import app as flask_app
from models import db, Artist
from managers.artist_manager import ArtistManager
from managers.booking_requests_manager import BookingRequestManager
from config import TestConfig


def unique_email(prefix="user"):
    return f"{prefix}+{uuid.uuid4().hex[:8]}@example.com"


def unique_uid(prefix="user"):
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


# ---------------------------------------------------------------------------
# Clerk-Token-Fixtures
#
# Die Tests erzeugen echte RS256-Tokens mit einem lokalen Schlüsselpaar und
# hängen den öffentlichen Schlüssel in den JWKS-Client. Damit läuft der Test
# durch denselben Verifikationspfad wie Produktion (Signatur, exp, sub) —
# gemockt wird nur der Netzabruf des JWKS.
# ---------------------------------------------------------------------------

class _StubSigningKey:
    def __init__(self, key):
        self.key = key


class _StubJWKSClient:
    def __init__(self, public_key):
        self._signing_key = _StubSigningKey(public_key)

    def get_signing_key_from_jwt(self, token):
        return self._signing_key


@pytest.fixture(scope='session')
def clerk_keys():
    """RSA-Schlüsselpaar für die Testsuite (PEM privat, Public-Key-Objekt)."""
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    return private_pem, private_key.public_key()


@pytest.fixture(scope='session', autouse=True)
def stub_jwks(clerk_keys):
    """Ersetzt den JWKS-Client durch den lokalen Public Key (kein Netzzugriff)."""
    _, public_key = clerk_keys
    original = clerk_auth.get_jwks_client
    clerk_auth.get_jwks_client = lambda: _StubJWKSClient(public_key)
    try:
        yield
    finally:
        clerk_auth.get_jwks_client = original


@pytest.fixture(scope='session')
def clerk_token(clerk_keys):
    """Factory: baut ein Clerk-artiges JWT (inkl. email/name/public_metadata)."""
    private_pem, _ = clerk_keys

    def _make(sub, email=None, name=None, public_metadata=None, expires_in=3600, **extra):
        now = int(time.time())
        claims = {
            "sub": sub,
            "iss": TEST_ISSUER,
            "iat": now,
            "nbf": now,
            "exp": now + expires_in,
        }
        if email is not None:
            claims["email"] = email
        if name is not None:
            claims["name"] = name
        if public_metadata is not None:
            claims["public_metadata"] = public_metadata
        claims.update(extra)
        return pyjwt.encode(claims, private_pem, algorithm="RS256")

    return _make


def bearer(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# App / DB
# ---------------------------------------------------------------------------

def _reset_auth_cache():
    """Vor jedem Request den auf `g` zwischengespeicherten Auth-Zustand verwerfen."""
    g.pop('clerk_claims', None)
    g.pop('clerk_user_id', None)
    g.pop('current_artist', None)
    return None


@pytest.fixture(scope='session')
def app(tmp_path_factory):
    """Flask-App gegen eine temporäre SQLite-Datei.

    Bewusst eine Datei statt `:memory:`: Bei einer In-Memory-DB ist jede neue
    Connection eine *neue, leere* Datenbank. Die Testsuite müsste deshalb eine
    einzige Connection über alle Requests hinweg festhalten — genau daran hing
    die bisherige Instabilität (ein Reconnect liess Tabellen "verschwinden").
    Mit einer Datei ist das egal: Jede Connection sieht dieselben Daten.
    """
    db_path = tmp_path_factory.mktemp("db") / "test.sqlite"

    flask_app.config['TESTING'] = True
    flask_app.config.from_object(TestConfig)
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
    flask_app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'connect_args': {'check_same_thread': False}
    }
    flask_app.config['SERVER_NAME'] = 'localhost'
    flask_app.config['PREFERRED_URL_SCHEME'] = 'http'

    # Pflicht: Flask-SQLAlchemy 3.x baut die Engines bereits in init_app() —
    # das ist beim Import von app.py mit der Produktionskonfiguration passiert.
    # Ohne dieses zweite init_app() zeigt die Engine weiterhin auf
    # `instance/pepe.db`, und die Tests schreiben in die echte Projekt-DB
    # (genau das war die Ursache für scheinbar zufällig fehlschlagende Tests).
    #
    # init_app() verwirft vorhandene Engines von sich aus, weigert sich aber,
    # wenn die Extension schon registriert ist — daher der Eintrag zuerst raus.
    flask_app.extensions.pop("sqlalchemy", None)
    db.init_app(flask_app)

    # Flask legt pro Request nur dann einen neuen App-Context an, wenn keiner
    # aktiv ist. Da die Tests einen ambienten Context brauchen (viele greifen
    # direkt auf db.session zu), teilen sich alle Requests dasselbe `g` — die
    # verifizierten Clerk-Claims eines Requests wären im nächsten noch da und
    # würden das mitgeschickte Token überstimmen. Der Hook unten räumt den
    # Auth-Cache deshalb vor *jedem* Request ab.
    #
    # insert(0, …): `_admin_gate_by_db` ist beim Import registriert worden und
    # liefe sonst vor dem Reset.
    flask_app.before_request_funcs.setdefault(None, []).insert(0, _reset_auth_cache)

    with flask_app.app_context():
        metadata = getattr(db, "metadata", None) or db.Model.metadata
        metadata.create_all(bind=db.engine)
        flask_app.config['TEST_DB_METADATA'] = metadata

    yield flask_app

    with flask_app.app_context():
        db.session.remove()
        db.engine.dispose()


@pytest.fixture
def client(app):
    """Flask test client."""
    return app.test_client()

@pytest.fixture
def artist_manager(app):
    """ArtistManager instance."""
    return ArtistManager()

@pytest.fixture
def booking_request_manager(app):
    """BookingRequestManager instance."""
    return BookingRequestManager()


@pytest.fixture(autouse=True)
def app_context(app):
    """Pro Test ein eigener App-Context — damit `g` nicht über Tests hinweg lebt."""
    with app.app_context():
        yield


@pytest.fixture(autouse=True)
def clean_geocode_cache():
    """Der Geocoding-Cache lebt im Modul und überdauert sonst jeden Test."""
    from services.geo import clear_geocode_cache
    clear_geocode_cache()
    yield
    clear_geocode_cache()


@pytest.fixture(autouse=True)
def session_transaction(app):
    """Jeder Test startet auf einer leeren Datenbank.

    Bewusst kein Savepoint-Rollback: Die Anwendung committet innerhalb von
    Requests, und verschachtelte Savepoints über mehrere Requests hinweg sauber
    zurückzurollen war die Quelle wechselseitiger Testbeeinflussung. Stattdessen
    werden nach jedem Test alle Tabellen geleert — langweilig, aber nachweislich
    isoliert.
    """
    try:
        yield
    finally:
        # Läuft noch im App-Context des Tests (die `app_context`-Fixture wird
        # erst danach abgebaut). Wichtig, weil db.session in Flask-SQLAlchemy
        # pro App-Context gescoped ist: Ein verschachtelter Context würde eine
        # andere Session entfernen als die, die der Test benutzt hat — deren
        # Identity Map bliebe mit inzwischen gelöschten Zeilen zurück.
        db.session.remove()
        metadata = app.config['TEST_DB_METADATA']
        with db.engine.begin() as conn:
            for table in reversed(metadata.sorted_tables):
                conn.execute(table.delete())


# ---------------------------------------------------------------------------
# Artist-Fixtures (geben Dicts zurück, keine detached ORM-Objekte)
# ---------------------------------------------------------------------------

def _create_artist(app, *, name, approval_status, is_admin=False, prefix="user"):
    a = Artist(
        name=name,
        email=unique_email(prefix),
        supabase_user_id=unique_uid(prefix),
        approval_status=approval_status,
        is_admin=is_admin,
    )
    db.session.add(a)
    db.session.commit()
    return {"id": a.id, "uid": a.supabase_user_id, "email": a.email, "name": a.name}


@pytest.fixture()
def artist_pending_row(app):
    return _create_artist(app, name="Pending Paula", approval_status="pending", prefix="pending")


@pytest.fixture()
def artist_approved_row(app):
    return _create_artist(app, name="Approved Alex", approval_status="approved", prefix="approved")


@pytest.fixture()
def artist_pending(artist_pending_row):
    """Nur die ID — Rückwärtskompatibilität für bestehende Tests."""
    return artist_pending_row["id"]


@pytest.fixture()
def artist_approved(artist_approved_row):
    """Nur die ID — Rückwärtskompatibilität für bestehende Tests."""
    return artist_approved_row["id"]


@pytest.fixture()
def admin_artist(app):
    """Der eine Admin: artists.is_admin = true (Single Source of Truth)."""
    return _create_artist(app, name="Admin Ada", approval_status="approved",
                          is_admin=True, prefix="admin")


@pytest.fixture()
def admin_headers(admin_artist, clerk_token):
    return bearer(clerk_token(admin_artist["uid"],
                              email=admin_artist["email"],
                              name=admin_artist["name"],
                              public_metadata={"role": "shows-admin"}))


@pytest.fixture()
def user_headers(artist_approved_row, clerk_token):
    """Gültiges Clerk-Token eines normalen (nicht-Admin) Artists."""
    return bearer(clerk_token(artist_approved_row["uid"],
                              email=artist_approved_row["email"],
                              name=artist_approved_row["name"]))


@pytest.fixture()
def get_artist(app):
    def _get(artist_id: int) -> Artist | None:
        # Frisch aus der DB lesen: Requests committen in derselben Session,
        # deren Identity Map sonst einen veralteten Stand liefern kann.
        db.session.expire_all()
        return db.session.get(Artist, artist_id)
    return _get
