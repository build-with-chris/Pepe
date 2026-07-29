"""Rate-Limit- und Idempotency-Speicher der Anfrage-Route.

Beide liegen im Prozessspeicher (bekannte Einschränkung, siehe Analyse D7).
Solange das so ist, müssen sie wenigstens nach oben begrenzt sein: Ein
Render-Prozess läuft wochenlang, und ohne Aufräumen bleibt jede IP und jeder
Idempotency-Key darin für immer stehen.
"""

import time

import pytest

import routes.request_routes as rr


@pytest.fixture(autouse=True)
def clean_stores():
    rr._rate_limit_hits.clear()
    rr._idempotency_cache.clear()
    yield
    rr._rate_limit_hits.clear()
    rr._idempotency_cache.clear()


def test_rate_limit_blocks_after_the_configured_number(app):
    with app.app_context():
        allowed = [rr._rate_limit_allow('10.0.0.1') for _ in range(6)]

    assert allowed[:5] == [True] * 5
    assert allowed[5] is False


def test_rate_limit_forgets_ips_whose_window_has_passed(app):
    with app.app_context():
        rr._rate_limit_allow('10.0.0.2')
        assert '10.0.0.2' in rr._rate_limit_hits

        # Fenster künstlich altern lassen
        old = time.time() - rr._RATE_LIMIT_WINDOW_SECONDS - 1
        rr._rate_limit_hits['10.0.0.2'][0] = old

        rr._rate_limit_allow('10.0.0.3')

    assert '10.0.0.2' not in rr._rate_limit_hits
    assert '10.0.0.3' in rr._rate_limit_hits


def test_rate_limit_store_stays_bounded(app, monkeypatch):
    monkeypatch.setattr(rr, '_RATE_LIMIT_MAX_TRACKED_IPS', 50)

    with app.app_context():
        for i in range(200):
            rr._rate_limit_allow(f'10.1.{i // 256}.{i % 256}')

    assert len(rr._rate_limit_hits) <= 50


def test_idempotency_replays_the_same_payload():
    rr._idempotency_store('key-1', {'request_id': 7})

    assert rr._idempotency_lookup('key-1') == {'request_id': 7}


def test_expired_idempotency_entries_are_dropped_on_write():
    rr._idempotency_store('alt', {'request_id': 1})
    rr._idempotency_cache['alt'] = (
        time.time() - rr._IDEMPOTENCY_TTL_SECONDS - 1, {'request_id': 1}
    )

    rr._idempotency_store('neu', {'request_id': 2})

    assert 'alt' not in rr._idempotency_cache
    assert rr._idempotency_lookup('neu') == {'request_id': 2}


def test_idempotency_cache_stays_bounded(monkeypatch):
    monkeypatch.setattr(rr, '_IDEMPOTENCY_MAX_ENTRIES', 10)

    for i in range(50):
        rr._idempotency_store(f'key-{i}', {'request_id': i})

    assert len(rr._idempotency_cache) <= 10
    # Der jüngste Eintrag muss erhalten bleiben
    assert rr._idempotency_lookup('key-49') == {'request_id': 49}
