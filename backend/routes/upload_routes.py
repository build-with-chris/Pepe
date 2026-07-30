"""Upload routes - proxy image uploads to Vercel Blob Storage."""

import os
import logging
import requests as http_requests
from flask import Blueprint, request, jsonify
from helpers.http_responses import error_response
from helpers.clerk_auth import artist_required, get_current_artist, is_admin

logger = logging.getLogger(__name__)

upload_bp = Blueprint('upload', __name__)

BLOB_TOKEN = os.getenv('BLOB_READ_WRITE_TOKEN')

# Dies ist der einzige Weg, auf dem Dateien ins Konto gelangen (SPEC-4, AK 3).
# Damit daraus kein offener Dateiablage-Dienst wird, sind Typ, Inhaltstyp und
# Groesse festgelegt.
UPLOAD_TYPES = ('profile', 'hero', 'gallery', 'invoice')

IMAGE_CONTENT_TYPES = frozenset({
    'image/webp',
    'image/jpeg',
    'image/png',
    'image/avif',
})

# Rechnungen kommen als PDF oder als abfotografierter Beleg.
ALLOWED_CONTENT_TYPES = {
    'profile': IMAGE_CONTENT_TYPES,
    'hero': IMAGE_CONTENT_TYPES,
    'gallery': IMAGE_CONTENT_TYPES,
    'invoice': IMAGE_CONTENT_TYPES | {'application/pdf'},
}

# 4 MB. Bewusst unter dem Vercel-Limit von 4,5 MB fuer den Request-Body: Waere
# es hoeher, wuerde die Plattform vorher abbrechen und der Nutzer bekaeme einen
# unverstaendlichen Fehler statt unserer Meldung. Das Frontend rechnet Bilder
# ohnehin auf WebP herunter und bleibt weit darunter.
MAX_UPLOAD_BYTES = 4 * 1024 * 1024


def _get_blob_token():
    """Get Vercel Blob token from environment."""
    token = os.getenv('BLOB_READ_WRITE_TOKEN')
    if not token:
        logger.error('BLOB_READ_WRITE_TOKEN not set')
    return token


def _safe_filename(filename: str | None) -> str:
    """Auf harmlose Zeichen reduzieren.

    Der Name landet im Ablagepfad. Ohne diese Reduktion koennte ein Dateiname
    Schraegstriche oder `..` enthalten und damit aus dem `invoices-<id>-`-Bereich
    ausbrechen — woran die Eigentumspruefung beim Loeschen haengt.
    """
    import re
    import time

    base = (filename or '').rsplit('/', 1)[-1].rsplit('\\', 1)[-1].strip()
    base = re.sub(r'[^A-Za-z0-9_.-]', '_', base).lstrip('.')
    return base[:120] or f'invoice_{int(time.time() * 1000)}.pdf'


def _get_storage_path(artist_id: str, upload_type: str, filename: str | None = None) -> str:
    """Generate storage path based on upload type.

    Flache Pfade ohne Schraegstriche — so erwartet es der Vercel-Blob-Speicher
    hier, und die Eigentumspruefung in `delete_blob` liest die `artist_id`
    daraus zurueck.
    """
    import time
    ts = int(time.time() * 1000)

    if upload_type == 'profile':
        return f'artists-{artist_id}-profile.webp'
    elif upload_type == 'hero':
        return f'artists-{artist_id}-hero.webp'
    elif upload_type == 'gallery':
        return f'artists-{artist_id}-gallery-{ts}.webp'
    elif upload_type == 'invoice':
        return f'invoices-{artist_id}-{_safe_filename(filename)}'
    else:
        return f'misc-{artist_id}-{ts}'


@upload_bp.route('/image', methods=['POST'])
@artist_required
def upload_image():
    """Upload an image to Vercel Blob Storage.

    Der einzige Weg, auf dem Dateien ins Blob-Konto gelangen (SPEC-4, AK 3).

    Expects multipart form data with:
    - file: The image file, max 4 MB, Inhaltstyp aus ALLOWED_CONTENT_TYPES
    - type: Upload type (profile, hero, gallery, invoice)
    - artist_id: The artist ID (muss der eigene sein, ausser für Admins)

    Der Ablagepfad wird hier aus `artist_id` und `type` gebildet und nicht vom
    Aufrufer uebernommen. Vorher konnte eine Vercel-Funktion im Frontend den
    Pfad frei aus dem Query-String setzen, ohne jede Anmeldung (Befund O2).
    """
    # Parse request
    file = request.files.get('file')
    if not file:
        return error_response('validation_error', 'No file provided', 400)

    upload_type = request.form.get('type', 'profile')
    artist_id = request.form.get('artist_id', '')

    if not artist_id:
        return error_response('validation_error', 'artist_id required', 400)

    if upload_type not in UPLOAD_TYPES:
        return error_response(
            'validation_error',
            f'type must be one of: {", ".join(UPLOAD_TYPES)}',
            400,
        )

    # Der Ablagepfad enthaelt die artist_id. Ohne diese Pruefung koennte jeder
    # eingeloggte Nutzer das Profilbild eines fremden Artists ueberschreiben.
    current = get_current_artist()
    try:
        requested_id = int(artist_id)
    except (TypeError, ValueError):
        return error_response('validation_error', 'artist_id must be an integer', 400)
    if requested_id != current.id and not is_admin():
        return error_response('forbidden', 'Not allowed to upload for this artist', 403)

    # Determine content type
    content_type = (file.content_type or 'image/webp').split(';')[0].strip().lower()
    allowed = ALLOWED_CONTENT_TYPES[upload_type]
    if content_type not in allowed:
        return error_response(
            'validation_error',
            f'Content type {content_type} not allowed for {upload_type}. '
            f'Allowed: {", ".join(sorted(allowed))}',
            400,
        )

    file_data = file.read()
    if not file_data:
        return error_response('validation_error', 'File is empty', 400)
    if len(file_data) > MAX_UPLOAD_BYTES:
        return error_response(
            'validation_error',
            f'File too large: {len(file_data)} bytes, '
            f'maximum is {MAX_UPLOAD_BYTES // (1024 * 1024)} MB',
            413,
        )

    pathname = _get_storage_path(artist_id, upload_type, file.filename)

    # Erst jetzt der Blick auf die Konfiguration. Bewusst nach Anmeldung,
    # Berechtigung und Validierung: Wer nichts hochladen darf, soll auch nicht
    # erfahren, ob der Speicher eingerichtet ist — und ein 403 darf nicht davon
    # abhaengen, ob gerade ein Blob-Token gesetzt ist.
    blob_token = _get_blob_token()
    if not blob_token:
        return error_response('internal_error', 'Storage not configured', 500)

    try:
        # Upload to Vercel Blob via REST API
        logger.info(f'Uploading to Vercel Blob: {pathname} ({len(file_data)} bytes)')

        # Vercel Blob REST API: PUT with pathname in query param
        resp = http_requests.put(
            'https://blob.vercel-storage.com',
            params={'pathname': pathname},
            headers={
                'Authorization': f'Bearer {blob_token}',
                'Content-Type': content_type,
                'x-api-version': '7',
            },
            data=file_data,
            timeout=30,
        )

        if resp.status_code not in (200, 201):
            logger.error(f'Vercel Blob upload failed: status={resp.status_code} url={resp.url} headers={dict(resp.headers)} body={resp.text[:500]}')
            return error_response('upstream_error', f'Upload failed: {resp.status_code} - {resp.text[:200]}', 502)

        result = resp.json()
        url = result.get('url', '')
        logger.info(f'Upload successful: {url}')

        return jsonify({'url': url, 'pathname': pathname}), 200

    except Exception as e:
        logger.exception(f'Upload error: {e}')
        return error_response('internal_error', f'Upload failed: {str(e)}', 500)


@upload_bp.route('/delete', methods=['POST'])
@artist_required
def delete_blob():
    """Delete a file from Vercel Blob Storage.

    Loeschbar sind nur Dateien, deren Ablagepfad zur eigenen artist_id gehoert.
    Ohne diese Einschraenkung koennte jeder eingeloggte Nutzer jede beliebige
    Blob-URL des Kontos loeschen.
    """
    data = request.get_json(silent=True) or {}
    url = data.get('url', '').strip()
    if not url:
        return error_response('validation_error', 'url required', 400)

    current = get_current_artist()
    if not is_admin():
        # Die Pfade sind `artists-<id>-…` bzw. `invoices-<id>-…` (_get_storage_path)
        owned_prefixes = (
            f'artists-{current.id}-',
            f'invoices-{current.id}-',
            f'misc-{current.id}-',
        )
        filename = url.rsplit('/', 1)[-1]
        if not filename.startswith(owned_prefixes):
            logger.warning(
                'Blob delete denied: artist %s tried to delete %r', current.id, filename
            )
            return error_response('forbidden', 'Not allowed to delete this file', 403)

    # Wie beim Upload: Konfiguration erst nach der Berechtigungspruefung.
    blob_token = _get_blob_token()
    if not blob_token:
        return error_response('internal_error', 'Storage not configured', 500)

    try:
        resp = http_requests.delete(
            'https://blob.vercel-storage.com/delete',
            headers={
                'Authorization': f'Bearer {blob_token}',
                'Content-Type': 'application/json',
                'x-api-version': '7',
            },
            json={'urls': [url]},
            timeout=15,
        )

        if resp.status_code not in (200, 204):
            logger.error(f'Vercel Blob delete failed: {resp.status_code} {resp.text[:300]}')
            return error_response('upstream_error', 'Delete failed', 502)

        return jsonify({'ok': True}), 200

    except Exception as e:
        logger.exception(f'Delete error: {e}')
        return error_response('internal_error', f'Delete failed: {str(e)}', 500)
