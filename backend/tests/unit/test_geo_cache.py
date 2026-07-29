"""Geocoding-Cache.

Nominatim erlaubt einen Request pro Sekunde. Jeder vermiedene Aufruf ist eine
Sekunde weniger Wartezeit im Request-Pfad des Kunden — und ein Limit weniger,
das wir reißen können.
"""

import pytest

import services.geo as geo


@pytest.fixture(autouse=True)
def clean_cache():
    geo.clear_geocode_cache()
    yield
    geo.clear_geocode_cache()


class _FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


def _stub_requests(monkeypatch, payload):
    """Ersetzt den Netzaufruf und zählt, wie oft er stattfindet."""
    calls = []

    def fake_get(url, **kwargs):
        calls.append(kwargs.get('params', {}).get('q'))
        return _FakeResponse(payload)

    monkeypatch.setattr(geo.requests, 'get', fake_get)
    monkeypatch.setattr(geo, '_throttle', lambda: None)
    return calls


HIT = [{'lat': '48.1372', 'lon': '11.5756'}]


def test_second_lookup_comes_from_the_cache(app, monkeypatch):
    calls = _stub_requests(monkeypatch, HIT)

    with app.app_context():
        first = geo.geocode_address('Leopoldstr. 1, München')
        second = geo.geocode_address('Leopoldstr. 1, München')

    assert first == second == (48.1372, 11.5756)
    assert len(calls) == 1


def test_cache_key_ignores_case_and_extra_whitespace(app, monkeypatch):
    calls = _stub_requests(monkeypatch, HIT)

    with app.app_context():
        geo.geocode_address('Leopoldstr. 1, München')
        geo.geocode_address('  leopoldstr. 1,   MÜNCHEN ')

    assert len(calls) == 1


def test_a_known_miss_is_cached_too(app, monkeypatch):
    """Sonst rennt jeder Wiederholungsversuch erneut ins Leere."""
    calls = _stub_requests(monkeypatch, [])

    with app.app_context():
        assert geo.geocode_address('Nirgendwo 1') is None
        assert geo.geocode_address('Nirgendwo 1') is None

    assert len(calls) == 1


def test_network_errors_are_not_cached(app, monkeypatch):
    """Ein kurzer Ausfall darf eine Adresse nicht stundenlang blockieren."""
    calls = []

    def failing_get(url, **kwargs):
        calls.append(url)
        raise OSError('connection reset')

    monkeypatch.setattr(geo.requests, 'get', failing_get)
    monkeypatch.setattr(geo, '_throttle', lambda: None)

    with app.app_context():
        assert geo.geocode_address('Leopoldstr. 1, München') is None
        assert geo.geocode_address('Leopoldstr. 1, München') is None

    assert len(calls) == 2


def test_empty_address_never_hits_the_network(app, monkeypatch):
    calls = _stub_requests(monkeypatch, HIT)

    with app.app_context():
        assert geo.geocode_address('') is None

    assert calls == []
