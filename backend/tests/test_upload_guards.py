"""Schranken des einen Upload-Wegs (SPEC-4, AK 3).

Vorher gab es drei Upload-Wege mit drei Sicherheitsniveaus, darunter eine
Vercel-Funktion im Frontend ganz ohne Anmeldung, mit frei waehlbarem Ablagepfad
und `allowOverwrite: true` (Befunde O2 und O3). Uebrig ist
`POST /api/upload/image`. Diese Datei haelt fest, was er abweist.

Kein Test hier erreicht den Blob-Speicher: Alle pruefen Faelle, die *vor* dem
Netzaufruf entschieden werden. Der Erfolgsfall haengt in
`tests/integration/test_onboarding_flow.py`, dort mit ersetztem HTTP-Aufruf.
"""

import io

import pytest

from tests.conftest import bearer


def _png(size_bytes: int = 64) -> io.BytesIO:
    return io.BytesIO(b'\x89PNG\r\n\x1a\n' + b'0' * size_bytes)


def _form(artist_id, upload_type='profile', content_type='image/png', size_bytes=64):
    return {
        'file': (_png(size_bytes), 'bild.png', content_type),
        'type': upload_type,
        'artist_id': str(artist_id),
    }


def test_upload_without_token_is_unauthorized(client, artist_approved_row):
    """AK 3: Ohne Token 401 — nicht 404 und nicht stillschweigend abgelegt."""
    resp = client.post(
        '/api/upload/image',
        data=_form(artist_approved_row['id']),
        content_type='multipart/form-data',
    )
    assert resp.status_code == 401, resp.get_data(as_text=True)


def test_upload_for_foreign_artist_is_forbidden(client, user_headers, artist_pending_row):
    """AK 3: Fremde artist_id ergibt 403.

    Der Ablagepfad enthaelt die artist_id (`artists-<id>-profile.webp`) und
    ueberschreibt vorhandene Dateien. Ohne diese Schranke koennte jeder
    angemeldete Nutzer das Profilbild eines fremden Artists ersetzen.
    """
    resp = client.post(
        '/api/upload/image',
        headers=user_headers,
        data=_form(artist_pending_row['id']),
        content_type='multipart/form-data',
    )
    assert resp.status_code == 403, resp.get_data(as_text=True)


def test_upload_without_linked_artist_is_forbidden(client, clerk_token):
    """Ein gueltiges Clerk-Token ohne Artist-Datensatz reicht nicht."""
    headers = bearer(clerk_token('user_ohne_artist', email='ohne@example.com'))
    resp = client.post(
        '/api/upload/image',
        headers=headers,
        data=_form(1),
        content_type='multipart/form-data',
    )
    assert resp.status_code == 403, resp.get_data(as_text=True)


def test_delete_without_token_is_unauthorized(client):
    resp = client.post('/api/upload/delete', json={'url': 'https://x/artists-1-profile.webp'})
    assert resp.status_code == 401


def test_delete_of_foreign_file_is_forbidden(client, user_headers, artist_pending_row):
    """Loeschen ist auf die eigenen Ablagepfade begrenzt."""
    foreign = f'https://blob.example/artists-{artist_pending_row["id"]}-profile.webp'
    resp = client.post('/api/upload/delete', headers=user_headers, json={'url': foreign})
    assert resp.status_code == 403, resp.get_data(as_text=True)


# ---------------------------------------------------------------------------
# Eingabepruefung: Der Endpunkt soll kein offener Dateiablage-Dienst werden.
# ---------------------------------------------------------------------------


def test_unknown_upload_type_is_rejected(client, user_headers, artist_approved_row):
    resp = client.post(
        '/api/upload/image',
        headers=user_headers,
        data=_form(artist_approved_row['id'], upload_type='schadcode'),
        content_type='multipart/form-data',
    )
    assert resp.status_code == 400
    assert 'type must be one of' in resp.get_data(as_text=True)


def test_disallowed_content_type_is_rejected(client, user_headers, artist_approved_row):
    """Ein Bildupload nimmt keine ausfuehrbaren Dateien an."""
    resp = client.post(
        '/api/upload/image',
        headers=user_headers,
        data=_form(artist_approved_row['id'], content_type='text/html'),
        content_type='multipart/form-data',
    )
    assert resp.status_code == 400
    assert 'not allowed' in resp.get_data(as_text=True)


def test_pdf_is_allowed_for_invoices_but_not_for_profile(client, user_headers, artist_approved_row):
    aid = artist_approved_row['id']

    profile = client.post(
        '/api/upload/image',
        headers=user_headers,
        data=_form(aid, upload_type='profile', content_type='application/pdf'),
        content_type='multipart/form-data',
    )
    assert profile.status_code == 400, profile.get_data(as_text=True)

    # Fuer Rechnungen erlaubt: kommt an der Inhaltstyp-Pruefung vorbei und
    # scheitert erst am fehlenden Blob-Token in der Testumgebung.
    invoice = client.post(
        '/api/upload/image',
        headers=user_headers,
        data=_form(aid, upload_type='invoice', content_type='application/pdf'),
        content_type='multipart/form-data',
    )
    assert invoice.status_code != 400, invoice.get_data(as_text=True)


def test_oversized_file_is_rejected(client, user_headers, artist_approved_row, monkeypatch):
    """Groessenbegrenzung greift vor dem Blob-Aufruf."""
    from routes import upload_routes

    monkeypatch.setattr(upload_routes, 'MAX_UPLOAD_BYTES', 1024)
    resp = client.post(
        '/api/upload/image',
        headers=user_headers,
        data=_form(artist_approved_row['id'], size_bytes=4096),
        content_type='multipart/form-data',
    )
    assert resp.status_code == 413, resp.get_data(as_text=True)


def test_empty_file_is_rejected(client, user_headers, artist_approved_row):
    resp = client.post(
        '/api/upload/image',
        headers=user_headers,
        data={
            'file': (io.BytesIO(b''), 'leer.png', 'image/png'),
            'type': 'profile',
            'artist_id': str(artist_approved_row['id']),
        },
        content_type='multipart/form-data',
    )
    assert resp.status_code == 400
    assert 'empty' in resp.get_data(as_text=True).lower()


def test_authz_is_decided_before_storage_config(client, user_headers, artist_pending_row, monkeypatch):
    """Ein 403 darf nicht davon abhaengen, ob ein Blob-Token gesetzt ist.

    Vorher stand die Konfigurationspruefung an erster Stelle: Ohne
    BLOB_READ_WRITE_TOKEN antwortete der Endpunkt jedem mit 500 und verriet
    damit auch Unberechtigten den Zustand des Speichers.
    """
    monkeypatch.delenv('BLOB_READ_WRITE_TOKEN', raising=False)
    resp = client.post(
        '/api/upload/image',
        headers=user_headers,
        data=_form(artist_pending_row['id']),
        content_type='multipart/form-data',
    )
    assert resp.status_code == 403, resp.get_data(as_text=True)


# ---------------------------------------------------------------------------
# Pfadbildung: Der Aufrufer bestimmt den Ablageort nicht mehr.
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    'upload_type,expected_prefix',
    [
        ('profile', 'artists-7-profile'),
        ('hero', 'artists-7-hero'),
        ('gallery', 'artists-7-gallery-'),
        ('invoice', 'invoices-7-'),
    ],
)
def test_storage_path_is_derived_from_artist_and_type(upload_type, expected_prefix):
    from routes.upload_routes import _get_storage_path

    path = _get_storage_path('7', upload_type, 'beleg.pdf')
    assert path.startswith(expected_prefix), path
    assert '/' not in path


def test_filename_cannot_escape_the_invoice_prefix():
    """Ein Dateiname darf nicht aus `invoices-<id>-` ausbrechen.

    Daran haengt die Eigentumspruefung beim Loeschen: Sie liest die artist_id
    aus dem letzten Pfadsegment.
    """
    from routes.upload_routes import _get_storage_path

    path = _get_storage_path('7', 'invoice', '../../artists-1-profile.webp')

    assert path.startswith('invoices-7-'), path
    assert '/' not in path
    assert '..' not in path
