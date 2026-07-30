"""Tests für die Token-Prüfung — bewusst ohne den JWKS-Stub aus conftest.py.

Der Stub dort ersetzt `get_jwks_client` komplett. Das ist für die übrigen Tests
richtig, sonst bräuchte jeder einzelne Netzzugriff. Es hat aber dazu geführt,
dass ein `NameError` in genau dieser Funktion monatelang unentdeckt blieb:
`verify_clerk_token` fängt jede Exception zu `None` weg, also endete in
Produktion jeder authentifizierte Aufruf in 401, während die Suite grün lief
(SPEC-4, Befund O1).

Diese Datei geht deshalb den echten Weg durch `get_jwks_client` und ersetzt nur
`PyJWKClient` selbst — die einzige Stelle, die ans Netz gehen würde.
"""

import pytest
import jwt as pyjwt

import helpers.clerk_auth as clerk_auth
from tests.conftest import REAL_GET_JWKS_CLIENT, TEST_ISSUER


class _RecordingJWKSClient:
    """Merkt sich die URL, mit der er gebaut wurde, und liefert einen Schlüssel."""

    instances = []

    def __init__(self, url, ssl_context=None):
        self.url = url
        self.ssl_context = ssl_context
        _RecordingJWKSClient.instances.append(self)

    def get_signing_key_from_jwt(self, token):
        raise AssertionError("Signierschlüssel muss der Test selbst setzen")


@pytest.fixture
def real_jwks_client(monkeypatch):
    """Stellt die echte `get_jwks_client` her und ersetzt nur `PyJWKClient`.

    Gibt die Liste der gebauten Client-Instanzen zurück, damit die Tests
    prüfen können, mit welcher URL und wie oft gebaut wurde.
    """
    _RecordingJWKSClient.instances = []
    monkeypatch.setattr(clerk_auth, "get_jwks_client", REAL_GET_JWKS_CLIENT)
    monkeypatch.setattr(clerk_auth, "PyJWKClient", _RecordingJWKSClient)
    monkeypatch.setattr(clerk_auth, "_jwks_client", None)
    try:
        yield _RecordingJWKSClient.instances
    finally:
        # Der Zwischenspeicher ist ein Modul-Global; monkeypatch stellt zwar den
        # alten Wert wieder her, aber nur wenn er nicht zwischenzeitlich neu
        # gesetzt wurde. Deshalb hier ausdrücklich leeren.
        clerk_auth._jwks_client = None
        _RecordingJWKSClient.instances = []


def test_jwks_client_uses_configured_url(real_jwks_client):
    """AK 1: `get_jwks_client` baut den Client mit `CLERK_JWKS_URL`.

    Das ist der Test, der O1 gefunden hätte: Vorher stand hier ein Aufruf einer
    nicht existierenden `get_clerk_jwks_url()`.
    """
    client = clerk_auth.get_jwks_client()

    assert client.url == clerk_auth.CLERK_JWKS_URL
    assert clerk_auth.CLERK_JWKS_URL.startswith("https://")
    assert len(real_jwks_client) == 1


def test_jwks_client_is_built_only_once(real_jwks_client):
    """Der Zwischenspeicher greift — kein JWKS-Abruf pro Request."""
    first = clerk_auth.get_jwks_client()
    second = clerk_auth.get_jwks_client()

    assert first is second
    assert len(real_jwks_client) == 1


def test_missing_jwks_url_raises_runtime_error(real_jwks_client, monkeypatch):
    """Fehlende Konfiguration scheitert laut, statt still gegen die Dev-Instanz zu laufen."""
    monkeypatch.setattr(clerk_auth, "CLERK_JWKS_URL", "")

    with pytest.raises(RuntimeError) as excinfo:
        clerk_auth.get_jwks_client()

    assert "CLERK_JWKS_URL" in str(excinfo.value)
    assert not real_jwks_client, "Ohne URL darf kein Client gebaut werden"


def test_verify_clerk_token_accepts_valid_token(real_jwks_client, clerk_keys, clerk_token):
    """AK 1: Ein gültiges Token kommt durch den echten `get_jwks_client`-Pfad.

    Kein Stub auf `get_jwks_client` — ein Tippfehler oder NameError dort lässt
    diesen Test fehlschlagen, statt sich als 401 zu tarnen.
    """
    _, public_key = clerk_keys
    _RecordingJWKSClient.get_signing_key_from_jwt = (
        lambda self, token: type("K", (), {"key": public_key})()
    )
    try:
        token = clerk_token("user_valid_signature", email="a@example.com")
        claims = clerk_auth.verify_clerk_token(token)

        assert claims is not None, "Gültiges Token wurde abgewiesen"
        assert claims["sub"] == "user_valid_signature"
        assert claims["iss"] == TEST_ISSUER
        assert real_jwks_client[0].url == clerk_auth.CLERK_JWKS_URL
    finally:
        del _RecordingJWKSClient.get_signing_key_from_jwt


def test_verify_clerk_token_rejects_foreign_signature(real_jwks_client, clerk_token):
    """Ein Token, das nicht zum Schlüssel des JWKS passt, wird abgewiesen."""
    from cryptography.hazmat.primitives.asymmetric import rsa

    other_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    _RecordingJWKSClient.get_signing_key_from_jwt = (
        lambda self, token: type("K", (), {"key": other_key.public_key()})()
    )
    try:
        assert clerk_auth.verify_clerk_token(clerk_token("user_wrong_key")) is None
    finally:
        del _RecordingJWKSClient.get_signing_key_from_jwt


def test_verify_clerk_token_without_token_returns_none(real_jwks_client):
    """Kein Token heisst kein JWKS-Abruf."""
    assert clerk_auth.verify_clerk_token("") is None
    assert not real_jwks_client


# ---------------------------------------------------------------------------
# AK 2: Fehlkonfiguration, Infrastruktur und abgelehntes Token sind im Log
# auseinanderzuhalten. Nach aussen bleibt alles 401 — im Log nicht.
# ---------------------------------------------------------------------------


def test_missing_config_is_logged_as_config_not_as_bad_token(
    real_jwks_client, monkeypatch, clerk_token, caplog
):
    monkeypatch.setattr(clerk_auth, "CLERK_JWKS_URL", "")

    with caplog.at_level("WARNING"):
        assert clerk_auth.verify_clerk_token(clerk_token("user_x")) is None

    records = [r for r in caplog.records if "Konfiguration" in r.message]
    assert records, f"keine Konfigurationsmeldung, nur: {[r.message for r in caplog.records]}"
    assert records[0].levelname == "CRITICAL"
    assert "CLERK_JWKS_URL" in records[0].getMessage()


def test_unreachable_jwks_is_logged_as_infrastructure(real_jwks_client, clerk_token, caplog):
    """Ein nicht erreichbarer JWKS-Endpunkt ist kein ungültiges Token."""
    from jwt.exceptions import PyJWKClientConnectionError

    def _boom(self, token):
        raise PyJWKClientConnectionError('Fail to fetch data from the url, err: "timed out"')

    _RecordingJWKSClient.get_signing_key_from_jwt = _boom
    try:
        with caplog.at_level("WARNING"):
            assert clerk_auth.verify_clerk_token(clerk_token("user_x")) is None
    finally:
        del _RecordingJWKSClient.get_signing_key_from_jwt

    records = [r for r in caplog.records if "JWKS" in r.message]
    assert records, f"keine JWKS-Meldung, nur: {[r.message for r in caplog.records]}"
    assert records[0].levelname == "ERROR"
    assert clerk_auth.CLERK_JWKS_URL in records[0].getMessage()


def test_expired_and_invalid_tokens_stay_warnings(real_jwks_client, clerk_keys, clerk_token, caplog):
    """Ein abgelehntes Token ist Alltag und bleibt eine Warnung, kein Fehler."""
    _, public_key = clerk_keys
    _RecordingJWKSClient.get_signing_key_from_jwt = (
        lambda self, token: type("K", (), {"key": public_key})()
    )
    try:
        with caplog.at_level("WARNING"):
            expired = clerk_token("user_x", email="a@example.com", expires_in=-60)
            assert clerk_auth.verify_clerk_token(expired) is None
        assert any(r.levelname == "WARNING" and "expired" in r.getMessage()
                   for r in caplog.records), [r.getMessage() for r in caplog.records]

        caplog.clear()
        with caplog.at_level("WARNING"):
            assert clerk_auth.verify_clerk_token("kein.gueltiges.jwt") is None
        assert any(r.levelname == "WARNING" and "Invalid Clerk token" in r.getMessage()
                   for r in caplog.records), [r.getMessage() for r in caplog.records]

        # Kein CRITICAL/ERROR: sonst geht die echte Fehlkonfiguration im Rauschen
        # abgelehnter Anmeldeversuche unter.
        assert not [r for r in caplog.records if r.levelname in ("ERROR", "CRITICAL")]
    finally:
        del _RecordingJWKSClient.get_signing_key_from_jwt


def test_unexpected_error_is_not_swallowed(real_jwks_client, clerk_token):
    """AK 2: Ein Programmierfehler taucht als Exception auf, nicht als 401.

    Das ist die Lehre aus O1: Ein NameError, der zu `None` weggefangen wird,
    sieht nach aussen wie ein falsches Passwort aus und bleibt unentdeckt.
    """
    def _boom(self, token):
        raise AttributeError("Tippfehler im Verifikationspfad")

    _RecordingJWKSClient.get_signing_key_from_jwt = _boom
    try:
        with pytest.raises(AttributeError, match="Tippfehler"):
            clerk_auth.verify_clerk_token(clerk_token("user_x"))
    finally:
        del _RecordingJWKSClient.get_signing_key_from_jwt


def test_pyjwt_encode_decode_roundtrip_uses_rs256(clerk_keys):
    """Absicherung der Test-Factory selbst: sie signiert wirklich mit RS256."""
    private_pem, public_key = clerk_keys
    token = pyjwt.encode({"sub": "x"}, private_pem, algorithm="RS256")

    header = pyjwt.get_unverified_header(token)
    assert header["alg"] == "RS256"
    assert pyjwt.decode(token, public_key, algorithms=["RS256"])["sub"] == "x"
