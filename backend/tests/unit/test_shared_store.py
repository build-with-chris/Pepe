"""Der geteilte Store: Prozessspeicher-Rückfall und der Upstash-Pfad.

Der Redis-Pfad wird gegen eine nachgebildete REST-Schnittstelle geprueft. Wichtig
ist vor allem das Verhalten bei Ausfall: Ein Fehler von Upstash darf die
Anfrage-Route nicht kaputt machen, sondern nur schlechter schuetzen.
"""

import pytest

from helpers import shared_store


@pytest.fixture(autouse=True)
def clean():
    shared_store.reset_for_tests()
    yield
    shared_store.reset_for_tests()


class TestInProcessFallback:
    def test_not_shared_without_credentials(self):
        assert shared_store.is_shared() is False
        assert shared_store.backend_name() == 'in-process'

    def test_set_and_get(self):
        shared_store.set_json('a', {'x': 1}, 60)
        assert shared_store.get_json('a') == {'x': 1}

    def test_missing_key_is_none(self):
        assert shared_store.get_json('nope') is None

    def test_expired_entry_is_gone(self):
        shared_store.set_json('b', 'wert', 0)
        assert shared_store.get_json('b') is None

    def test_incr_counts_up(self):
        assert shared_store.incr_with_ttl('c', 60) == 1
        assert shared_store.incr_with_ttl('c', 60) == 2
        assert shared_store.incr_with_ttl('c', 60) == 3

    def test_incr_keeps_the_first_expiry(self):
        """Sonst rutscht das Zeitfenster bei jeder Anfrage nach vorn."""
        shared_store.incr_with_ttl('d', 0)
        # Ablaufzeit lag beim ersten Treffer bereits in der Vergangenheit
        assert shared_store.incr_with_ttl('d', 0) == 1

    def test_memory_store_stays_bounded(self, monkeypatch):
        monkeypatch.setattr(shared_store, '_MEMORY_MAX_ENTRIES', 20)
        for i in range(200):
            shared_store.set_json(f'k{i}', i, 60)
        assert len(shared_store._memory) <= 20


class _FakeResponse:
    def __init__(self, result, status=200):
        self._result = result
        self.status = status

    def raise_for_status(self):
        if self.status >= 400:
            raise RuntimeError(f'HTTP {self.status}')

    def json(self):
        return {'result': self._result}


class TestUpstashPath:
    @pytest.fixture
    def upstash(self, monkeypatch):
        """Konfigurierten Upstash vorspiegeln und die Kommandos mitschreiben."""
        monkeypatch.setattr(shared_store, '_REST_URL', 'https://fake.upstash.io')
        monkeypatch.setattr(shared_store, '_REST_TOKEN', 'token')
        calls = []
        results = {}

        def fake_post(url, **kwargs):
            path = url.replace('https://fake.upstash.io/', '')
            calls.append(path)
            command = path.split('/')[0].upper()
            if command == 'GET':
                return _FakeResponse(results.get('value'))
            if command == 'INCR':
                results['count'] = results.get('count', 0) + 1
                return _FakeResponse(results['count'])
            return _FakeResponse('OK')

        monkeypatch.setattr(shared_store.requests, 'post', fake_post)
        return calls, results

    def test_is_shared_with_credentials(self, upstash):
        assert shared_store.is_shared() is True
        assert shared_store.backend_name() == 'upstash-redis'

    def test_set_sends_set_with_expiry(self, upstash):
        calls, _ = upstash
        shared_store.set_json('key', {'a': 1}, 120)

        assert calls[0].startswith('SET/key/')
        assert calls[0].endswith('/EX/120')

    def test_incr_sets_expiry_only_on_first_hit(self, upstash):
        calls, _ = upstash
        shared_store.incr_with_ttl('key', 60)
        shared_store.incr_with_ttl('key', 60)

        assert [c.split('/')[0] for c in calls] == ['INCR', 'EXPIRE', 'INCR']

    def test_get_returns_the_decoded_value(self, upstash):
        _, results = upstash
        results['value'] = '{"a": 1}'

        assert shared_store.get_json('key') == {'a': 1}

    def test_upstash_failure_falls_back_to_memory(self, app, monkeypatch):
        """Ein Ausfall darf die Route nicht kippen, nur schlechter schuetzen."""
        monkeypatch.setattr(shared_store, '_REST_URL', 'https://fake.upstash.io')
        monkeypatch.setattr(shared_store, '_REST_TOKEN', 'token')

        def failing_post(url, **kwargs):
            raise OSError('connection reset')

        monkeypatch.setattr(shared_store.requests, 'post', failing_post)

        with app.app_context():
            shared_store.set_json('key', {'a': 1}, 60)
            assert shared_store.get_json('key') == {'a': 1}
            assert shared_store.incr_with_ttl('cnt', 60) == 1
