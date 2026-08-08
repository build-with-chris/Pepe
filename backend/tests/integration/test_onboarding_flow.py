"""Der Onboarding-Ablauf am Stück (SPEC-4, AK 5).

Es gab Tests für jeden einzelnen Endpunkt und trotzdem war die Kette im
Deployment gebrochen: anmelden, Datensatz anlegen, Profil ausfüllen, Bild
hochladen, einreichen, freigeben. Genau daran hing, dass überhaupt neue Artists
ins System kommen (Befund O6).

Dieser Test fährt die Kette einmal durch und prüft nach jedem Schritt den Stand
in der Datenbank. Der einzige ersetzte Teil ist der HTTP-PUT an den
Blob-Speicher — alles andere läuft durch die echten Routen.
"""

import io

import pytest

from models import Artist, db
from tests.conftest import bearer


BLOB_URL = 'https://blob.example.com/artists-1-profile.webp'


class _FakeBlobResponse:
    status_code = 200
    text = ''
    url = 'https://blob.vercel-storage.com'
    headers: dict = {}

    def __init__(self, pathname):
        self._pathname = pathname

    def json(self):
        return {'url': f'https://blob.example.com/{self._pathname}', 'pathname': self._pathname}


@pytest.fixture
def blob_storage(monkeypatch):
    """Ersetzt den Netzaufruf an Vercel Blob und protokolliert die Ablagepfade."""
    import routes.upload_routes as upload_routes

    calls = []

    def _put(url, params=None, headers=None, data=None, timeout=None):
        pathname = (params or {}).get('pathname', '')
        calls.append({'pathname': pathname, 'bytes': len(data or b''),
                      'content_type': (headers or {}).get('Content-Type')})
        return _FakeBlobResponse(pathname)

    monkeypatch.setenv('BLOB_READ_WRITE_TOKEN', 'test-blob-token')
    monkeypatch.setattr(upload_routes.http_requests, 'put', _put)
    return calls


@pytest.fixture
def geocoder(monkeypatch):
    """Feste Koordinaten statt eines Nominatim-Aufrufs.

    Nicht nur der Geschwindigkeit wegen: Ohne diese Fixture haengt der Test am
    Netz und der Schritt „Adresse gespeichert" waere nicht nachweisbar.
    """
    # Gestubbt wird die unterste Ebene in `services.geo`, nicht der Manager.
    # Damit laeuft die Stufensuche (voll -> ohne Hausnummer -> PLZ -> Ort) im
    # Test wirklich mit, statt umgangen zu werden.
    import services.geo as geo

    calls = []

    def _geocode(address, *, timeout=8.0):
        calls.append(address)
        return (48.1371, 11.5754)  # Muenchen

    monkeypatch.setattr(geo, 'geocode_address', _geocode)
    return calls


def _png(size_bytes=256):
    return io.BytesIO(b'\x89PNG\r\n\x1a\n' + b'0' * size_bytes)


def test_onboarding_from_signup_to_first_request(
    client, clerk_token, admin_headers, admin_artist, get_artist, blob_storage, geocoder
):
    """AK 5: ensure -> Profil -> einreichen -> freigeben -> Anfragen erreichbar."""
    headers = bearer(clerk_token(
        'user_onboarding_flow',
        email='Neuer.Artist@Example.com',
        name='Neuer Artist',
    ))

    # --- Schritt 1: Datensatz anlegen -------------------------------------
    ensure = client.post('/api/artists/me/ensure', headers=headers)
    assert ensure.status_code == 200, ensure.get_data(as_text=True)
    artist_id = ensure.get_json()['id']

    row = get_artist(artist_id)
    assert row.email == 'neuer.artist@example.com', 'E-Mail aus dem Token, kleingeschrieben'
    assert '@clerk.placeholder' not in row.email
    assert row.supabase_user_id == 'user_onboarding_flow'
    assert row.approval_status == 'unsubmitted'

    # --- Schritt 2: eigenes Profil lesen ----------------------------------
    me = client.get('/api/artists/me', headers=headers)
    assert me.status_code == 200, me.get_data(as_text=True)
    assert me.get_json()['id'] == artist_id

    # --- Schritt 3: Profilbild hochladen ----------------------------------
    upload = client.post(
        '/api/upload/image',
        headers=headers,
        data={'file': (_png(), 'portrait.png', 'image/png'),
              'type': 'profile',
              'artist_id': str(artist_id)},
        content_type='multipart/form-data',
    )
    assert upload.status_code == 200, upload.get_data(as_text=True)
    image_url = upload.get_json()['url']

    # Der Ablagepfad kommt vom Server und enthaelt die eigene ID — nie `new-id`.
    assert len(blob_storage) == 1
    assert blob_storage[0]['pathname'] == f'artists-{artist_id}-profile.webp'
    assert 'new-id' not in blob_storage[0]['pathname']

    # --- Schritt 4: Profil speichern --------------------------------------
    profile = client.patch(
        '/api/artists/me/profile',
        headers=headers,
        json={
            'name': 'Neuer Artist',
            'address': 'Teststrasse 1, 80331 Muenchen, Deutschland',
            'phone_number': '+49 89 123456',
            'disciplines': ['Jonglage'],
            'bio': 'Kurze Vorstellung.',
            'profile_image_url': image_url,
        },
    )
    assert profile.status_code == 200, profile.get_data(as_text=True)

    row = get_artist(artist_id)
    assert row.name == 'Neuer Artist'
    assert row.profile_image_url == image_url
    assert row.phone_number == '+49 89 123456'

    # Die Adresse wurde geocodiert. Der Aufruf lief vorher gegen
    # `artist_mgr._geocode_and_set` — eine Methode, die es nicht gibt. Jedes
    # Speichern mit geaenderter Adresse endete deshalb in einem 500. Genau
    # dieser Fehler ist von diesem Test gefunden worden.
    assert geocoder == ['Teststrasse 1, 80331 Muenchen, Deutschland']
    assert (row.lat, row.lon) == (48.1371, 11.5754)

    # --- Schritt 5: zur Pruefung einreichen -------------------------------
    submit = client.post('/api/artists/me/submit_review', headers=headers)
    assert submit.status_code == 200, submit.get_data(as_text=True)
    assert get_artist(artist_id).approval_status == 'pending'

    # Vor der Freigabe keine Anfragen.
    blocked = client.get('/api/requests/requests', headers=headers)
    assert blocked.status_code == 403, blocked.get_data(as_text=True)

    # --- Schritt 6: Admin gibt frei ---------------------------------------
    approve = client.post(f'/api/admin/artists/{artist_id}/approve', headers=admin_headers)
    assert approve.status_code == 200, approve.get_data(as_text=True)

    row = get_artist(artist_id)
    assert row.approval_status == 'approved'
    assert row.approved_by == admin_artist['id'], 'interne Integer-ID, kein Clerk-String'

    # --- Schritt 7: Anfragen sind erreichbar ------------------------------
    requests_resp = client.get('/api/requests/requests', headers=headers)
    assert requests_resp.status_code == 200, requests_resp.get_data(as_text=True)
    assert isinstance(requests_resp.get_json(), list)

    # Am Ende genau ein Datensatz fuer diesen Nutzer, nicht zwei.
    rows = db.session.query(Artist).filter_by(supabase_user_id='user_onboarding_flow').all()
    assert len(rows) == 1


def test_flow_leaves_nothing_behind_when_ensure_fails(client, clerk_token, blob_storage):
    """AK 4, Gegenprobe: Scheitert `ensure`, entsteht weder Datensatz noch Datei.

    Im Deployment lief der Ablauf trotz gescheitertem `ensure` weiter und legte
    Bilder unter `artists/new-id/…` ab. Der Abbruch sitzt jetzt im Frontend; das
    Backend haelt hier die andere Haelfte fest: Ohne Artist-Datensatz weist es
    Upload und Profil-PATCH ab.
    """
    # Ohne `email`-Claim legt `ensure` bewusst nichts an (SPEC-1).
    headers = bearer(clerk_token('user_ohne_email'))

    ensure = client.post('/api/artists/me/ensure', headers=headers)
    assert ensure.status_code == 400
    assert ensure.get_json()['error'] == 'invalid_token'
    assert db.session.query(Artist).count() == 0

    # Die Folgeschritte muessen ebenfalls abweisen.
    upload = client.post(
        '/api/upload/image',
        headers=headers,
        data={'file': (_png(), 'portrait.png', 'image/png'),
              'type': 'profile',
              'artist_id': '1'},
        content_type='multipart/form-data',
    )
    assert upload.status_code == 403, upload.get_data(as_text=True)

    profile = client.patch('/api/artists/me/profile', headers=headers, json={'name': 'X'})
    assert profile.status_code == 403, profile.get_data(as_text=True)

    # Nichts im Speicher, nichts in der Datenbank.
    assert blob_storage == []
    assert db.session.query(Artist).count() == 0


def test_second_login_does_not_create_a_second_artist(client, clerk_token, blob_storage):
    """Ein zweiter Anmeldeweg desselben Nutzers erzeugt keine Dublette."""
    headers = bearer(clerk_token('user_zweimal', email='zweimal@example.com'))

    first = client.post('/api/artists/me/ensure', headers=headers)
    second = client.post('/api/artists/me/ensure', headers=headers)

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.get_json()['id'] == second.get_json()['id']
    assert db.session.query(Artist).count() == 1


def test_upload_before_ensure_is_rejected(client, clerk_token, blob_storage):
    """Reihenfolge zaehlt: Erst ID sichern, dann hochladen.

    Vorher lief der Upload los, bevor klar war, ob es einen Datensatz gibt.
    """
    headers = bearer(clerk_token('user_upload_zuerst', email='zuerst@example.com'))

    upload = client.post(
        '/api/upload/image',
        headers=headers,
        data={'file': (_png(), 'portrait.png', 'image/png'),
              'type': 'profile',
              'artist_id': '1'},
        content_type='multipart/form-data',
    )
    assert upload.status_code == 403, upload.get_data(as_text=True)
    assert blob_storage == []
