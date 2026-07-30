"""Rate-Limit und Idempotenz der oeffentlichen Anfrage-Route.

Beide liegen im geteilten Store (`helpers/shared_store`). Ohne Zugangsdaten
faellt der auf einen prozesslokalen Speicher zurueck — genau der Pfad, der hier
geprueft wird. Der Redis-Pfad wird separat in test_shared_store.py geprueft.
"""

import pytest

import routes.request_routes as rr
from helpers import shared_store


@pytest.fixture(autouse=True)
def clean_store():
    shared_store.reset_for_tests()
    yield
    shared_store.reset_for_tests()


def test_rate_limit_blocks_after_the_configured_number(app):
    with app.app_context():
        allowed = [rr._rate_limit_allow('10.0.0.1') for _ in range(6)]

    assert allowed[:5] == [True] * 5
    assert allowed[5] is False


def test_rate_limit_counts_per_ip(app):
    """Eine blockierte IP darf eine andere nicht mitblockieren."""
    with app.app_context():
        for _ in range(6):
            rr._rate_limit_allow('10.0.0.1')

        assert rr._rate_limit_allow('10.0.0.2') is True


def test_rate_limit_window_expires(app, monkeypatch):
    """Nach Ablauf des Fensters ist die IP wieder frei."""
    monkeypatch.setattr(rr, '_RATE_LIMIT_WINDOW_SECONDS', 1)

    with app.app_context():
        for _ in range(6):
            rr._rate_limit_allow('10.0.0.3')
        assert rr._rate_limit_allow('10.0.0.3') is False

        # Ablauf simulieren statt zu warten
        shared_store.reset_for_tests()
        assert rr._rate_limit_allow('10.0.0.3') is True


def test_idempotency_replays_the_same_payload(app):
    with app.app_context():
        rr._idempotency_store('key-1', {'request_id': 7})

        assert rr._idempotency_lookup('key-1') == {'request_id': 7}


def test_idempotency_lookup_without_key_is_none(app):
    with app.app_context():
        assert rr._idempotency_lookup('') is None
        assert rr._idempotency_lookup(None) is None


def test_idempotency_unknown_key_is_none(app):
    with app.app_context():
        assert rr._idempotency_lookup('gibtsnicht') is None


def test_idempotency_survives_a_nested_payload(app):
    """Der Store serialisiert nach JSON — verschachtelte Antworten muessen durch."""
    payload = {
        'request_id': 12,
        'price_min': 1627,
        'matched_artists': [{'id': 1, 'name': 'Ada'}],
        'price_reason': None,
    }
    with app.app_context():
        rr._idempotency_store('key-2', payload)

        assert rr._idempotency_lookup('key-2') == payload
