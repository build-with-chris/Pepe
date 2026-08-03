"""CORS-Preflight der oeffentlichen Anfrage-Route.

Der Booking-Assistent laeuft im Browser unter einer anderen Herkunft als das
Backend. Jeder Header, den er mitschickt, muss deshalb in `allow_headers`
stehen. Fehlt einer, scheitert schon der Preflight: Die eigentliche Anfrage
geht nie raus, und der Kunde sieht "Ihre Anfrage konnte nicht uebermittelt
werden", obwohl das Backend laeuft.

Genau so ist es mit `Idempotency-Key` passiert, nachdem der Assistent ihn zu
schicken begann.
"""
import pytest


ORIGIN = 'https://www.pepeshows.de'

# Die Header, die das Frontend beim Absenden einer Anfrage tatsaechlich setzt.
WIZARD_HEADERS = ['content-type', 'idempotency-key']


@pytest.fixture()
def cors_app(monkeypatch):
    """App mit der Produktions-Herkunft in CORS_ORIGINS neu laden."""
    import importlib
    import app as app_module

    monkeypatch.setenv('CORS_ORIGINS', ORIGIN)
    reloaded = importlib.reload(app_module)
    yield reloaded.app
    # Fuer nachfolgende Tests den urspruenglichen Zustand wiederherstellen
    monkeypatch.undo()
    importlib.reload(app_module)


def _preflight(client, request_headers):
    return client.options(
        '/api/requests/requests',
        headers={
            'Origin': ORIGIN,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': ', '.join(request_headers),
        },
    )


@pytest.mark.parametrize('header', WIZARD_HEADERS)
def test_every_header_the_wizard_sends_is_allowed(cors_app, header):
    res = _preflight(cors_app.test_client(), [header])

    assert res.status_code < 400, res.get_data(as_text=True)
    allowed = (res.headers.get('Access-Control-Allow-Headers') or '').lower()
    assert header in allowed, (
        f"'{header}' fehlt in Access-Control-Allow-Headers ({allowed!r}). "
        'Der Browser bricht die Anfrage dann schon vor dem Absenden ab.'
    )


def test_preflight_allows_all_wizard_headers_at_once(cors_app):
    """So, wie der Browser es wirklich fragt: alle Header in einem Preflight."""
    res = _preflight(cors_app.test_client(), WIZARD_HEADERS)

    assert res.status_code < 400
    allowed = (res.headers.get('Access-Control-Allow-Headers') or '').lower()
    assert res.headers.get('Access-Control-Allow-Origin') == ORIGIN
    for header in WIZARD_HEADERS:
        assert header in allowed
