"""Upload routes - proxy image uploads to Vercel Blob Storage."""

import os
import logging
import requests as http_requests
from flask import Blueprint, request, jsonify
from helpers.http_responses import error_response
from helpers.clerk_auth import verify_clerk_token

logger = logging.getLogger(__name__)

upload_bp = Blueprint('upload', __name__)

BLOB_TOKEN = os.getenv('BLOB_READ_WRITE_TOKEN')


def _get_blob_token():
    """Get Vercel Blob token from environment."""
    token = os.getenv('BLOB_READ_WRITE_TOKEN')
    if not token:
        logger.error('BLOB_READ_WRITE_TOKEN not set')
    return token


def _get_storage_path(artist_id: str, upload_type: str, filename: str | None = None) -> str:
    """Generate storage path based on upload type."""
    import time
    ts = int(time.time() * 1000)

    if upload_type == 'profile':
        return f'artists/{artist_id}/profile.webp'
    elif upload_type == 'hero':
        return f'artists/{artist_id}/hero.webp'
    elif upload_type == 'gallery':
        return f'artists/{artist_id}/gallery/{ts}.webp'
    elif upload_type == 'invoice':
        return f'invoices/{artist_id}/{filename or f"invoice_{ts}.pdf"}'
    else:
        return f'misc/{artist_id}/{ts}'


@upload_bp.route('/image', methods=['POST'])
def upload_image():
    """Upload an image to Vercel Blob Storage.

    Expects multipart form data with:
    - file: The image file
    - type: Upload type (profile, hero, gallery, invoice)
    - artist_id: The artist ID
    """
    # Verify auth
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return error_response('unauthorized', 'Missing token', 401)

    token = auth_header[7:]
    claims = verify_clerk_token(token)
    if not claims:
        return error_response('unauthorized', 'Invalid token', 401)

    # Get blob token
    blob_token = _get_blob_token()
    if not blob_token:
        return error_response('internal_error', 'Storage not configured', 500)

    # Parse request
    file = request.files.get('file')
    if not file:
        return error_response('validation_error', 'No file provided', 400)

    upload_type = request.form.get('type', 'profile')
    artist_id = request.form.get('artist_id', '')

    if not artist_id:
        return error_response('validation_error', 'artist_id required', 400)

    # Determine content type
    content_type = file.content_type or 'image/webp'
    pathname = _get_storage_path(artist_id, upload_type, file.filename)

    try:
        # Upload to Vercel Blob via REST API
        file_data = file.read()
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
def delete_blob():
    """Delete a file from Vercel Blob Storage."""
    # Verify auth
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return error_response('unauthorized', 'Missing token', 401)

    token = auth_header[7:]
    claims = verify_clerk_token(token)
    if not claims:
        return error_response('unauthorized', 'Invalid token', 401)

    blob_token = _get_blob_token()
    if not blob_token:
        return error_response('internal_error', 'Storage not configured', 500)

    data = request.get_json(silent=True) or {}
    url = data.get('url', '').strip()
    if not url:
        return error_response('validation_error', 'url required', 400)

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
