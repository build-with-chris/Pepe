from flask import request, jsonify, g
from flask import Blueprint
from services.calculate_price import calculate_price
from flasgger import swag_from
from managers.artist_manager import ArtistManager
from managers.availability_manager import AvailabilityManager
from managers.booking_requests_manager import BookingRequestManager
from models import Availability, Discipline, db
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
import logging
from helpers.http_responses import error_response
from helpers.clerk_auth import (
    clerk_auth_required,
    get_clerk_claims,
    get_clerk_email,
    get_clerk_name,
    get_clerk_user_id,
    get_current_artist,
)

from datetime import datetime
import os
import tempfile
from PIL import Image
import io

logger = logging.getLogger(__name__)

# Manager-Instanzen
artist_mgr = ArtistManager()
avail_mgr = AvailabilityManager()
request_mgr = BookingRequestManager()


def filter_blob_url(url):
    """Filtert Blob-URLs heraus - gibt None zurück, wenn es eine Blob-URL ist."""
    if not url or not isinstance(url, str):
        return url
    if url.strip().startswith('blob:'):
        logger.warning(f'Blob-URL detected and filtered: {url[:50]}...')
        return None
    return url

"""
API-Modul: Beinhaltet Endpunkte für Artists, Verfügbarkeit und Buchungsanfragen.
"""

# Blueprint für API-Routen
api_bp = Blueprint('api', __name__)


def process_image_for_upload(image_file, max_width=1200, max_height=1200, quality=85):
    """
    Verarbeitet ein Bild: Größe anpassen und in WebP konvertieren
    """
    try:
        # Bild öffnen
        image = Image.open(image_file)

        # Bei Bedarf EXIF-Orientierung korrigieren
        if hasattr(image, '_getexif'):
            exif = image._getexif()
            if exif is not None:
                for tag, value in exif.items():
                    if tag == 274:  # Orientation tag
                        if value == 3:
                            image = image.rotate(180, expand=True)
                        elif value == 6:
                            image = image.rotate(270, expand=True)
                        elif value == 8:
                            image = image.rotate(90, expand=True)

        # RGB konvertieren falls notwendig
        if image.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')

        # Größe anpassen
        original_width, original_height = image.size
        if original_width > max_width or original_height > max_height:
            # Aspect ratio beibehalten
            ratio = min(max_width / original_width, max_height / original_height)
            new_width = int(original_width * ratio)
            new_height = int(original_height * ratio)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # In WebP konvertieren
        output = io.BytesIO()
        image.save(output, format='WEBP', quality=quality, method=6)
        output.seek(0)

        return output
    except Exception as e:
        logger.exception('Fehler bei Bildverarbeitung')
        raise ValueError(f'Bildverarbeitung fehlgeschlagen: {str(e)}')


class ArtistOnboardingError(Exception):
    """Raised when no artist row can be resolved or created for the current user."""

    def __init__(self, code: str, message: str, status: int):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status


def ensure_artist_for_current_user(create_if_missing: bool = True):
    """Der einzige Onboarding-Pfad: Clerk-User -> Artist-Datensatz.

    Reihenfolge:
      1) Lookup per Clerk-UID (gespeichert in artists.supabase_user_id)
      2) Verknüpfung eines vorhandenen Datensatzes mit derselben E-Mail
      3) Minimal-Artist anlegen (approval_status='unsubmitted')

    Ohne E-Mail im Token wird *kein* Datensatz angelegt — es gibt keine
    Platzhalter-Adressen mehr. Fehlt die E-Mail, ist das JWT-Template in Clerk
    nicht (korrekt) konfiguriert.

    Raises:
        ArtistOnboardingError: wenn kein Datensatz ermittelt/angelegt werden kann.
    """
    from models import Artist  # local import to avoid circulars at module import time

    user_id = get_clerk_user_id()

    # 1) Direkt über die Clerk-UID
    artist = get_current_artist()
    if artist:
        return artist

    email = get_clerk_email()
    name = get_clerk_name()

    if not email:
        logger.error(
            "ensure_artist: no e-mail claim for uid=%s (claim keys=%s) — "
            "check the Clerk JWT template",
            user_id, sorted((get_clerk_claims() or {}).keys()),
        )
        raise ArtistOnboardingError(
            'invalid_token',
            'Token contains no e-mail claim. Clerk JWT template is missing or misconfigured.',
            400,
        )

    email_norm = email.lower()

    # 2) Vorhandenen Datensatz mit derselben E-Mail übernehmen
    existing = Artist.query.filter(func.lower(Artist.email) == email_norm).first()
    if existing:
        linked_uid = getattr(existing, 'supabase_user_id', None)
        if not linked_uid:
            existing.supabase_user_id = user_id
            db.session.commit()
            g.current_artist = existing
            return existing
        if linked_uid.lower() != (user_id or '').lower():
            logger.warning(
                "ensure_artist: e-mail %s is already linked to a different Clerk user (%s != %s)",
                email_norm, linked_uid, user_id,
            )
            raise ArtistOnboardingError(
                'conflict', 'E-mail already linked to another account', 409
            )
        g.current_artist = existing
        return existing

    if not create_if_missing:
        return None

    # 3) Minimal-Artist anlegen
    try:
        new_artist = Artist(
            name=name or email_norm.split('@')[0],
            email=email_norm,
            supabase_user_id=user_id,
            approval_status='unsubmitted',
        )
        db.session.add(new_artist)
        db.session.commit()
        logger.info("ensure_artist: created artist id=%s for uid=%s", new_artist.id, user_id)
        g.current_artist = new_artist
        return new_artist
    except IntegrityError:
        # Parallele Requests (z. B. doppelter Login-Sync): Der andere Request war
        # schneller — dessen Datensatz zurückgeben statt einen zweiten anzulegen.
        db.session.rollback()
        artist = (Artist.query
                  .filter((func.lower(Artist.email) == email_norm)
                          | (Artist.supabase_user_id == user_id))
                  .first())
        if artist:
            g.current_artist = artist
            return artist
        logger.exception("ensure_artist: create raced and no row found for uid=%s", user_id)
        raise ArtistOnboardingError(
            'internal_error', 'Unable to ensure artist for current user', 500
        )


def get_current_user():
    """Gibt ein Tupel (user_id, artist) des aktuell authentifizierten Clerk-Users zurück.

    Dünner Wrapper um `ensure_artist_for_current_user` für Handler, die bei
    fehlendem Artist selbst mit 403 antworten.
    """
    user_id = get_clerk_user_id()
    try:
        return user_id, ensure_artist_for_current_user()
    except ArtistOnboardingError as e:
        logger.warning("get_current_user: %s (uid=%s)", e.message, user_id)
        return user_id, None


def artist_me_payload(artist) -> dict:
    """Serialize the own artist profile — shared by /artists/me and /artists/me/ensure.

    Enthält auch die Gage-Kriterien: Die Profilseite zeigt daraus die
    Aufschlüsselung, wie die eigene Gage zustande kommt.
    """
    return {
        'id': artist.id,
        'name': artist.name,
        'email': artist.email,
        'address': getattr(artist, 'address', None),
        'phone_number': artist.phone_number,
        'disciplines': [d.name for d in artist.disciplines],
        'price_min': getattr(artist, 'price_min', None),
        'price_max': getattr(artist, 'price_max', None),
        'calculated_gage': getattr(artist, 'calculated_gage', None),
        'admin_gage_override': getattr(artist, 'admin_gage_override', None),
        'stage_experience': getattr(artist, 'stage_experience', None),
        'employment_type': getattr(artist, 'employment_type', None),
        'circus_education': getattr(artist, 'circus_education', False),
        'awards_level': getattr(artist, 'awards_level', None),
        'pepe_years': getattr(artist, 'pepe_years', 0),
        'pepe_exclusivity': getattr(artist, 'pepe_exclusivity', False),
        # blob:-URLs entstehen aus abgebrochenen Uploads und sind ausserhalb des
        # erzeugenden Browser-Tabs wertlos.
        'profile_image_url': filter_blob_url(getattr(artist, 'profile_image_url', None)),
        'bio': getattr(artist, 'bio', None),
        'instagram': getattr(artist, 'instagram', None),
        'gallery_urls': getattr(artist, 'gallery_urls', []) or [],
        'is_admin': bool(getattr(artist, 'is_admin', False)),
        'approval_status': getattr(artist, 'approval_status', None),
        'rejection_reason': getattr(artist, 'rejection_reason', None),
        'approved': (getattr(artist, 'approval_status', '') or '').lower() == 'approved',
        'guidelines_accepted': bool(getattr(artist, 'guidelines_accepted', False)),
    }


# Artists
@api_bp.route('/artists', methods=['GET'])
@swag_from('../resources/swagger/artists_get.yml')
def list_artists():
    """Return all approved artists as JSON list."""
    # Nur freigegebene Artists öffentlich listen
    artists = artist_mgr.get_approved_artists()
    return jsonify([{
        'id': a.id,
        'name': a.name,
        'disciplines': [d.name for d in a.disciplines],
        'profile_image_url': filter_blob_url(getattr(a, 'profile_image_url', None)),
        'bio': getattr(a, 'bio', None),
        'instagram': getattr(a, 'instagram', None),
        'gallery_urls': getattr(a, 'gallery_urls', []) or []
    } for a in artists])


@api_bp.route('/artists', methods=['POST'])
@clerk_auth_required
@swag_from('../resources/swagger/artists_post.yml')
def create_artist():
    """Create a new artist with the provided data."""
    try:
        current_user_id = get_clerk_user_id()
        data = request.get_json(silent=True) or {}
        disciplines = data.get('disciplines')
        if not disciplines:
            return error_response('validation_error', 'Disciplines must be provided', 400)
        # Fehlende Pflichtfelder als 400 melden statt als KeyError in einem 500er
        for field in ('name', 'email'):
            if not (data.get(field) or '').strip():
                return error_response('validation_error', f'missing field: {field}', 400)
        if artist_mgr.get_artist_by_email(data.get('email', '')):
            return error_response('conflict', 'Email already exists', 409)

        artist = artist_mgr.create_artist(
            name=data['name'],
            email=data['email'],
            password=data.get('password'),
            disciplines=disciplines,
            phone_number=data.get('phone_number'),
            address=data.get('address'),
            price_min=data.get('price_min', 1500),
            price_max=data.get('price_max', 1900),
            is_admin=data.get('is_admin', False),
            supabase_user_id=current_user_id,
        )
        return jsonify({'id': artist.id}), 201
    except ValueError as ve:
        if 'email already exists' in str(ve).lower():
            return error_response('conflict', 'Email already exists', 409)
        return error_response('validation_error', str(ve), 400)
    except Exception as e:
        logger.exception('Failed to create artist')
        return error_response('internal_error', f'Failed to create artist: {str(e)}', 500)


# Own artist profile: read

@api_bp.route('/artists/me', methods=['GET'])
@clerk_auth_required
@swag_from('../resources/swagger/artists_me_get.yml')
def get_my_artist():
    """Return the current user's artist profile including image and bio."""
    user_id, artist = get_current_user()
    if not artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)
    return jsonify(artist_me_payload(artist)), 200


# New endpoint: Accept artist guidelines
@api_bp.route('/artists/me/accept_guidelines', methods=['POST'])
@clerk_auth_required
@swag_from('../resources/swagger/artists_me_accept_guidelines_post.yml', validation=False)
def accept_my_guidelines():
    """Mark the current artist as having accepted the guidelines."""
    user_id, artist = get_current_user()
    if not artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)
    try:
        # Accept multiple possible column names for forward/backward compatibility
        if hasattr(artist, 'guidelines_accepted'):
            artist.guidelines_accepted = True
        elif hasattr(artist, 'guidelinesAccepted'):
            setattr(artist, 'guidelinesAccepted', True)
        else:
            # If the column is missing, we still respond gracefully
            return jsonify({'ok': False, 'note': 'guidelines_accepted column missing on Artist model'}), 501
        db.session.commit()
        return jsonify({'ok': True, 'guidelines_accepted': True}), 200
    except Exception as e:
        logger.exception('Failed to set guidelines_accepted')
        db.session.rollback()
        return error_response('internal_error', f'Failed to accept guidelines: {str(e)}', 500)


# Explizite Freigabe anfordern (Status -> pending)
@api_bp.route('/artists/me/submit_review', methods=['POST'])
@clerk_auth_required
@swag_from('../resources/swagger/artists_me_submit_review_post.yml', validation=False)
def submit_my_profile_for_review():
    """Set the current artist's approval status to 'pending' (unless already approved)."""
    user_id, artist = get_current_user()
    if not artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)

    try:
        current_status = (getattr(artist, 'approval_status', 'unsubmitted') or 'unsubmitted').lower()
        if current_status != 'approved':
            artist.approval_status = 'pending'
            # vorherige Ablehnungsgründe entfernen
            if hasattr(artist, 'rejection_reason'):
                artist.rejection_reason = None
            db.session.commit()
        return jsonify({
            'id': artist.id,
            'approval_status': getattr(artist, 'approval_status', None),
            'rejection_reason': getattr(artist, 'rejection_reason', None),
        }), 200
    except Exception as e:
        logger.exception('Failed to submit profile for review')
        return error_response('internal_error', f'Failed to submit review: {str(e)}', 500)


@api_bp.route('/artists/me/profile', methods=['PUT', 'PATCH'])
@clerk_auth_required
@swag_from('../resources/swagger/artists_me_profile_put.yml')
def update_my_profile():
    """Update the current artist's profile fields (name, address, phone, prices, disciplines, media)."""
    user_id, artist = get_current_user()
    if not artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)

    payload = request.get_json(silent=True) or {}

    # Einzeln auslesen (alle Felder sind optional)
    name = payload.get('name')
    address = payload.get('address')
    phone_number = payload.get('phone_number')
    disciplines = payload.get('disciplines')  # erwartet Liste[str]

    img_url = payload.get('profile_image_url')
    bio = payload.get('bio')
    instagram = payload.get('instagram')
    gallery_urls = payload.get('gallery_urls')
    req_status = payload.get('approval_status')

    # Gage criteria fields (new)
    gage_fields = {}
    for gf in ('stage_experience', 'employment_type', 'circus_education',
               'awards_level', 'pepe_years', 'pepe_exclusivity'):
        if gf in payload:
            gage_fields[gf] = payload[gf]

    updatable_keys = [
        name, address, phone_number, disciplines,
        img_url, bio, instagram, gallery_urls, req_status
    ]
    has_gage = bool(gage_fields)
    if all(v is None for v in updatable_keys) and not has_gage:
        return error_response('validation_error', 'Nothing to update', 400)

    # Validierungen
    if gallery_urls is not None:
        if not isinstance(gallery_urls, list):
            return error_response('validation_error', 'gallery_urls must be a list of URLs', 400)
        gallery_urls = [str(u).strip() for u in gallery_urls if isinstance(u, (str, bytes))]
        # Filtere Blob-URLs aus der Galerie
        gallery_urls = [filter_blob_url(u) for u in gallery_urls if filter_blob_url(u) is not None]
        if len(gallery_urls) > 9:
            return error_response('validation_error', 'gallery_urls may contain at most 9 items', 400)

    if disciplines is not None and not isinstance(disciplines, list):
        return error_response('validation_error', 'disciplines must be a list of strings', 400)
    
    # Validierung: Blob-URLs werden nicht akzeptiert
    if img_url is not None:
        if isinstance(img_url, str) and img_url.strip().startswith('blob:'):
            return error_response('validation_error', 'Blob-URLs are not allowed. Please upload the image properly.', 400)

    try:
        from services.gage_calculator import GageCalculator

        # Primitive Felder
        if name is not None:
            artist.name = str(name).strip() or artist.name
        address_before = getattr(artist, 'address', None)
        if address is not None:
            old_address = artist.address
            artist.address = str(address).strip() or None
            # Re-geocode if address changed
            if artist.address and artist.address != old_address:
                artist_mgr._geocode_and_set(artist)
        if phone_number is not None:
            artist.phone_number = str(phone_number).strip() or None

        # Social / Media
        if img_url is not None:
            # Filtere Blob-URLs heraus
            filtered_url = filter_blob_url(img_url)
            artist.profile_image_url = filtered_url
        if bio is not None:
            artist.bio = (str(bio).strip()[:1000] if bio is not None else None)
        if instagram is not None:
            artist.instagram = (instagram.strip() or None) if isinstance(instagram, str) else None
        if gallery_urls is not None:
            artist.gallery_urls = gallery_urls

        # Disziplinen
        if disciplines is not None:
            def get_or_create_discipline(name: str):
                disc = Discipline.query.filter_by(name=name).first()
                if not disc:
                    disc = Discipline(name=name)
                    db.session.add(disc)
                    db.session.flush()
                return disc
            artist.disciplines = [get_or_create_discipline(str(d).strip()) for d in disciplines if str(d).strip()]

        # Gage criteria fields
        if gage_fields:
            if 'stage_experience' in gage_fields:
                artist.stage_experience = gage_fields['stage_experience']
            if 'employment_type' in gage_fields:
                artist.employment_type = gage_fields['employment_type']
            if 'circus_education' in gage_fields:
                artist.circus_education = bool(gage_fields['circus_education'])
            if 'awards_level' in gage_fields:
                artist.awards_level = gage_fields['awards_level']
            if 'pepe_years' in gage_fields:
                try:
                    artist.pepe_years = int(gage_fields['pepe_years'])
                except (TypeError, ValueError):
                    artist.pepe_years = 0
            if 'pepe_exclusivity' in gage_fields:
                artist.pepe_exclusivity = bool(gage_fields['pepe_exclusivity'])

        # Always recalculate gage when gage criteria change (or on any profile save)
        if gage_fields or not artist.calculated_gage:
            calculated_gage = GageCalculator.calculate_gage(artist)
            artist.calculated_gage = calculated_gage
            if not artist.admin_gage_override:
                price_min, price_max = GageCalculator.get_price_range(artist)
                artist.price_min = price_min
                artist.price_max = price_max

        # Optional: Einreichen zur Prüfung – nur 'pending' ist vom Artist aus erlaubt
        if req_status is not None:
            req_status = str(req_status).strip().lower()
            current_status = (getattr(artist, 'approval_status', 'unsubmitted') or 'unsubmitted').lower()
            if req_status == 'pending' and current_status != 'approved':
                artist.approval_status = 'pending'
                if hasattr(artist, 'rejection_reason'):
                    artist.rejection_reason = None

        # Adresse geändert (oder noch ohne Koordinaten)? -> lat/lon nachziehen,
        # sonst bleibt distance_km bei jeder Anfrage 0.
        if (artist.address or '') != (address_before or '') or (
            artist.address and (artist.lat is None or artist.lon is None)
        ):
            artist_mgr.geocode_and_set(artist)

        db.session.commit()

        # Antwort mit allen wichtigen Feldern inkl. Gage
        return jsonify({
            'id': artist.id,
            'name': artist.name,
            'email': artist.email,
            'address': getattr(artist, 'address', None),
            'phone_number': artist.phone_number,
            'disciplines': [d.name for d in artist.disciplines],
            'price_min': getattr(artist, 'price_min', None),
            'price_max': getattr(artist, 'price_max', None),
            'calculated_gage': getattr(artist, 'calculated_gage', None),
            'admin_gage_override': getattr(artist, 'admin_gage_override', None),
            'stage_experience': getattr(artist, 'stage_experience', None),
            'employment_type': getattr(artist, 'employment_type', None),
            'circus_education': getattr(artist, 'circus_education', False),
            'awards_level': getattr(artist, 'awards_level', None),
            'pepe_years': getattr(artist, 'pepe_years', 0),
            'pepe_exclusivity': getattr(artist, 'pepe_exclusivity', False),
            'profile_image_url': filter_blob_url(getattr(artist, 'profile_image_url', None)),
            'bio': getattr(artist, 'bio', None),
            'instagram': getattr(artist, 'instagram', None),
            'gallery_urls': getattr(artist, 'gallery_urls', []) or [],
            'is_admin': bool(getattr(artist, 'is_admin', False)),
            'approval_status': getattr(artist, 'approval_status', None),
            'rejection_reason': getattr(artist, 'rejection_reason', None),
        }), 200
    except Exception as e:
        logger.exception('Failed to update own profile')
        db.session.rollback()
        return error_response('internal_error', f'Failed to update profile: {str(e)}', 500)


@api_bp.route('/artists/me/ensure', methods=['POST'])
@clerk_auth_required
@swag_from('../resources/swagger/artists_me_ensure_post.yml', validation=False)
def ensure_my_artist():
    """Ensure exactly one artist row exists and is linked to the current Clerk user."""
    try:
        artist = ensure_artist_for_current_user()
    except ArtistOnboardingError as e:
        return error_response(e.code, e.message, e.status)

    return jsonify(artist_me_payload(artist)), 200


@api_bp.route('/artists/email/<string:email>', methods=['GET'])
@clerk_auth_required
@swag_from('../resources/swagger/artists_email_get.yml')
def get_artist_by_email(email):
    """Look up an artist by e-mail. Only the own profile or an admin may do this.

    Der frühere `artist.serialize()`-Aufruf existiert am Modell nicht — die Route
    endete immer in einem 500er. Und sie stand jedem eingeloggten Nutzer offen,
    hätte also fremde Profile preisgegeben.
    """
    _, current_artist = get_current_user()
    if not current_artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)

    artist = artist_mgr.get_artist_by_email(email)
    if not artist:
        return error_response('not_found', 'Artist not found', 404)

    is_self = artist.id == current_artist.id
    if not (is_self or getattr(current_artist, 'is_admin', False)):
        return error_response('forbidden', 'Forbidden', 403)

    return jsonify(artist_me_payload(artist)), 200


@api_bp.route('/artists/<int:artist_id>', methods=['GET'])
@swag_from('../resources/swagger/artist_get.yml')
def get_artist_public(artist_id):
    """Return a single artist (public). Only approved artists are visible without auth."""
    try:
        artist = artist_mgr.get_artist(artist_id)
        if not artist:
            return error_response('not_found', 'Artist not found', 404)
        approved = (getattr(artist, 'approval_status', '') or '').lower() == 'approved'
        if not approved:
            # hide non-approved artists from public
            return error_response('not_found', 'Artist not found', 404)
        return jsonify({
            'id': artist.id,
            'name': artist.name,
            'disciplines': [d.name for d in artist.disciplines],
            'profile_image_url': filter_blob_url(getattr(artist, 'profile_image_url', None)),
            'bio': getattr(artist, 'bio', None),
            'instagram': getattr(artist, 'instagram', None),
            'gallery_urls': getattr(artist, 'gallery_urls', []) or []
        }), 200
    except Exception as e:
        logger.exception('Failed to fetch artist')
        return error_response('internal_error', f'Failed to fetch artist: {str(e)}', 500)


# Corrected DELETE endpoint for artists
@api_bp.route('/artists/<int:artist_id>', methods=['DELETE'])
@clerk_auth_required
@swag_from('../resources/swagger/artists_delete.yml')
def delete_artist(artist_id):
    """Delete an artist entry if the current user is allowed (admin, owner, or orphan self)."""
    current_user_id = get_clerk_user_id()
    claims = get_clerk_claims()
    jwt_email = None
    try:
        jwt_email = claims.get("email") or claims.get("user_metadata", {}).get("email")
    except Exception:
        jwt_email = None

    artist = artist_mgr.get_artist(artist_id)
    if not artist:
        return error_response('not_found', 'Artist not found', 404)

    # aktuellen Artist (vom aufrufenden User) laden, um Admin-Status korrekt zu prüfen
    current_artist = artist_mgr.get_artist_by_supabase_user_id(current_user_id)
    is_admin = bool(getattr(current_artist, 'is_admin', False)) if current_artist else False

    is_owner = (artist.supabase_user_id == current_user_id)
    is_orphan_self = (getattr(artist, 'supabase_user_id', None) is None and jwt_email and getattr(artist, 'email', None) == jwt_email)

    if not (is_admin or is_owner or is_orphan_self):
        return error_response('forbidden', 'Forbidden', 403)

    success = artist_mgr.delete_artist(artist_id)
    if success:
        return jsonify({'deleted': artist_id}), 200
    return error_response('not_found', 'Artist not found', 404)


@api_bp.route('/artists/<int:artist_id>', methods=['PUT', 'PATCH'])
@clerk_auth_required
@swag_from('../resources/swagger/artists_put.yml')
def update_artist(artist_id):
    """Update an existing artist profile by ID."""
    try:
        current_user_id = get_clerk_user_id()
        current_user = artist_mgr.get_artist_by_supabase_user_id(current_user_id)
        data = request.json or {}
        logger.info(f'Update attempt for artist {artist_id} by user {current_user_id}')
        logger.info(f'Updating artist {artist_id} with data: {data}')
        artist = artist_mgr.get_artist(artist_id)
        if not artist:
            return error_response('not_found', 'Artist not found', 404)
        if not (getattr(current_user, 'is_admin', False) or artist.supabase_user_id == current_user_id):
            return error_response('forbidden', 'Forbidden', 403)
        if 'name' in data:
            artist.name = data['name']
        if 'email' in data:
            new_email = data['email']
            if new_email != artist.email and artist_mgr.get_artist_by_email(new_email):
                return jsonify({'error': 'Email already exists'}), 409
            artist.email = new_email
        if 'password' in data:
            artist.set_password(data['password'])
        if 'phone_number' in data:
            artist.phone_number = data['phone_number']
        if 'address' in data:
            artist.address = data['address']
        if 'price_min' in data:
            artist.price_min = data.get('price_min')
        if 'price_max' in data:
            artist.price_max = data.get('price_max')
        if 'instagram' in data:
            val = data.get('instagram')
            artist.instagram = (val.strip() if isinstance(val, str) and val.strip() else None)
        if 'gallery_urls' in data:
            val = data.get('gallery_urls')
            if val is not None:
                if not isinstance(val, list):
                    return error_response('validation_error', 'gallery_urls must be a list of URLs', 400)
                urls = [str(u).strip() for u in val if isinstance(u, (str, bytes))]
                if len(urls) > 9:
                    return error_response('validation_error', 'gallery_urls may contain at most 9 items', 400)
                artist.gallery_urls = urls
        if 'disciplines' in data:
            def get_or_create_discipline(name):
                disc = Discipline.query.filter_by(name=name).first()
                if not disc:
                    disc = Discipline(name=name)
                    db.session.add(disc)
                    db.session.flush()
                return disc
            artist.disciplines = [get_or_create_discipline(d) for d in data['disciplines']]
        db.session.commit()
        return jsonify({'id': artist.id}), 200
    except Exception as e:
        logger.exception('Failed to update artist')
        return error_response('internal_error', f'Failed to update artist: {str(e)}', 500)


# Availability

@api_bp.route('/availability', methods=['GET'])
@clerk_auth_required
@swag_from('../resources/swagger/availability_get.yml')
def get_availability():
    """Return availability slots for the current artist or another artist if allowed."""
    user_id, current_artist = get_current_user()
    logger.debug(f"get_availability called by supabase_user_id={user_id} with args={request.args}")

    artist_id_param = request.args.get('artist_id')

    if not current_artist:
        logger.warning(f"Current user {user_id} not linked to an artist (after ensure)")
        return error_response('forbidden', 'Current user not linked to an artist', 403)

    target_artist = current_artist
    if artist_id_param:
        try:
            artist_id_int = int(artist_id_param)
            artist_candidate = artist_mgr.get_artist(artist_id_int)
            if artist_candidate:
                # permission: same artist or admin
                if artist_candidate.id != current_artist.id and not getattr(current_artist, 'is_admin', False):
                    logger.warning(f"User {user_id} forbidden from viewing availability of artist {artist_candidate.id}")
                    return error_response('forbidden', 'Forbidden', 403)
                target_artist = artist_candidate
            else:
                logger.warning(f"Artist candidate not found for id {artist_id_int}, falling back to current artist")
            
        except ValueError:
            logger.warning(f"Invalid artist_id parameter: {artist_id_param}, ignoring and using current artist")
    
    # fetch and return slots: if target is current artist use user-specific helper for better handling
    try:
        if target_artist.id == current_artist.id:
            slots = avail_mgr.get_availabilities_for_user(user_id)
        else:
            slots = avail_mgr.get_availabilities(target_artist.id)
    except Exception as e:
        logger.exception(f"Failed to fetch availabilities for artist {target_artist.id}")
        return error_response('internal_error', f'Failed to fetch availabilities: {str(e)}', 500)

    result = [{'id': s.id, 'artist_id': s.artist_id, 'date': s.date.isoformat()} for s in slots]
    logger.debug(f"Returning {len(result)} availability slots for artist {target_artist.id}")
    return jsonify(result)


@api_bp.route('/availability', methods=['POST'])
@clerk_auth_required
@swag_from('../resources/swagger/availability_post.yml')
def add_availability():
    """Add one or more availability slots for the current artist (or another if admin)."""
    user_id, current_artist = get_current_user()
    if not current_artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)

    # resolve target artist (optional override for admin)
    artist_id_param = request.args.get('artist_id')
    target_artist = current_artist
    if artist_id_param:
        try:
            artist_id_int = int(artist_id_param)
        except ValueError:
            return error_response('validation_error', 'artist_id must be integer', 400)
        candidate = artist_mgr.get_artist(artist_id_int)
        if not candidate:
            return error_response('not_found', 'Artist not found', 404)
        if candidate.id != current_artist.id and not getattr(current_artist, 'is_admin', False):
            return error_response('forbidden', 'Forbidden', 403)
        target_artist = candidate

    artist_id = target_artist.id
    data = request.get_json()
    if not data:
        return error_response('validation_error', 'Date must be provided', 400)

    def create_slot(item):
        date_str = item.get('date')
        if not date_str:
            raise KeyError('date')
        try:
            from datetime import datetime
            datetime.fromisoformat(date_str)
        except ValueError:
            raise ValueError('Invalid date format')
        slot = avail_mgr.add_availability(artist_id, date_str)
        return {'id': slot.id, 'date': slot.date.isoformat()}

    slots = []
    if isinstance(data, list):
        try:
            for item in data:
                slots.append(create_slot(item))
        except KeyError:
            return error_response('validation_error', 'Date must be provided', 400)
        except ValueError:
            return error_response('validation_error', 'Invalid date format', 400)
    else:
        try:
            slots.append(create_slot(data))
        except KeyError:
            return error_response('validation_error', 'Date must be provided', 400)
        except ValueError:
            return error_response('validation_error', 'Invalid date format', 400)
    return jsonify(slots), 201


@api_bp.route('/availability', methods=['PUT'])
@clerk_auth_required
@swag_from('../resources/swagger/availability_put.yml')
def replace_availability():
    """Replace all availability slots for the current artist (or another if admin)."""
    user_id, current_artist = get_current_user()
    if not current_artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)

    # resolve target artist (optional override for admin)
    artist_id_param = request.args.get('artist_id')
    target_artist = current_artist
    if artist_id_param:
        try:
            artist_id_int = int(artist_id_param)
        except ValueError:
            return error_response('validation_error', 'artist_id must be integer', 400)
        candidate = artist_mgr.get_artist(artist_id_int)
        if not candidate:
            return error_response('not_found', 'Artist not found', 404)
        if candidate.id != current_artist.id and not getattr(current_artist, 'is_admin', False):
            return error_response('forbidden', 'Forbidden', 403)
        target_artist = candidate

    data = request.get_json()
    if not data or 'dates' not in data:
        return error_response('validation_error', 'dates list required', 400)
    if artist_id_param:
        result = avail_mgr.replace_availabilities_for_artist(target_artist.id, data['dates'])
    else:
        result = avail_mgr.replace_availabilities_for_user(user_id, data['dates'])
    return jsonify(result), 200


@api_bp.route('/availability/<int:slot_id>', methods=['DELETE'])
@clerk_auth_required
@swag_from('../resources/swagger/availability_delete.yml')
def remove_availability(slot_id):
    """Remove one availability slot by ID if the user is owner or admin."""
    logger.debug(f"remove_availability called with slot_id={slot_id}")
    user_id, current_artist = get_current_user()
    if not current_artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)
    slot = Availability.query.get(slot_id)
    if not slot:
        return error_response('not_found', 'Availability not found', 404)
    # permission: owner or admin
    if slot.artist_id != current_artist.id and not getattr(current_artist, 'is_admin', False):
        return error_response('forbidden', 'Forbidden', 403)
    avail_mgr.remove_availability(slot_id)
    return jsonify({'deleted': slot_id})
@api_bp.route('/requests/requests', methods=['GET'])
@clerk_auth_required
@swag_from('../resources/swagger/booking_requests_get.yml')
def list_my_booking_requests():
    """Return booking requests relevant to the current artist (with recommendations)."""
    # Bewusst über get_current_user: der Lookup dort ist gegen Groß-/Kleinschreibung
    # der Clerk-UID unempfindlich, ein direktes filter_by(supabase_user_id=…) nicht.
    user_id, artist = get_current_user()
    logger.debug(f"list_my_booking_requests called with supabase_user_id={user_id}")
    if not artist:
        logger.warning(f"Current user {user_id} not linked to an artist")
        return error_response('forbidden', 'Current user not linked to an artist', 403)
    # Nur freigegebene Artists können Anfragen erhalten/einsehen
    if getattr(artist, 'approval_status', '') != 'approved':
        return error_response('forbidden', 'Artist not approved yet', 403)
    logger.debug(f"Resolved artist: id={artist.id}, supabase_user_id={artist.supabase_user_id}")
    requests = request_mgr.get_requests_for_artist_with_recommendation(artist.id)

    # Fallback-Diagnose: wenn keine empfohlenen Anfragen, hole die rohen verknüpften Requests
    if not requests:
        raw_reqs = request_mgr.get_requests_for_artist(artist.id)
        logger.debug(f"Raw get_requests_for_artist returned: {[r.id for r in raw_reqs]}")
    try:
        request_ids = [r.get('id') if isinstance(r, dict) else getattr(r, 'id', None) for r in requests]
    except Exception:
        request_ids = str(requests)
    logger.debug(f"list_my_booking_requests result count={len(requests)} ids={request_ids}")
    return jsonify(requests), 200



# Combined GET/PUT endpoint for artist offer
@api_bp.route('/requests/requests/<int:req_id>/offer', methods=['GET', 'PUT'])
@clerk_auth_required
@swag_from('../resources/swagger/requests_offer_get_put.yml')
def artist_offer(req_id):
    """GET: Return the artist's offer for a request. PUT: Save or update the artist's offer."""
    user_id, artist = get_current_user()
    logger.debug(f"artist_offer called by supabase_user_id={user_id} for req_id={req_id} method={request.method}")
    if not artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)
    if getattr(artist, 'approval_status', '') != 'approved':
        return error_response('forbidden', 'Artist not approved yet', 403)

    if request.method == 'PUT':
        try:
            payload = request.get_json(silent=True) or {}
            price_offered = payload.get('price_offered')
            if price_offered is None:
                return error_response('validation_error', 'price_offered is required', 400)
            # persist in pivot and set status='angeboten'
            request_mgr.set_offer(req_id, artist.id, price_offered)
            # Nach dem Speichern erneut aus Pivot lesen
            offer_data = request_mgr.get_artist_offer(req_id, artist.id)
            logger.debug(f"artist_offer PUT stored; pivot now: {offer_data}")
            return jsonify(offer_data or {'price_offered': price_offered, 'status': 'angeboten'}), 200
        except Exception as e:
            logger.exception('Failed to set artist offer')
            return error_response('internal_error', f'Failed to set offer: {str(e)}', 500)

    # GET-Fall
    logger.debug(f"Resolved artist for offer lookup: id={artist.id} name={getattr(artist, 'name', None)}")
    offer_data = request_mgr.get_artist_offer(req_id, artist.id)
    logger.debug(f"artist_offer GET result: {offer_data}")
    if offer_data is None:
        return error_response('not_found', 'Offer not found or not permitted', 404)
    return jsonify(offer_data), 200


# =============================
# Invoices (UID-Folder in Supabase)
# =============================
try:
    from models import Invoice  # optional: only if model exists
    HAS_INVOICE_MODEL = True
except Exception:
    HAS_INVOICE_MODEL = False


@api_bp.route('/invoices', methods=['POST'])
@clerk_auth_required
@swag_from('../resources/swagger/invoices_post.yml', validation=False)
def create_invoice_entry():
    """Register an invoice entry for the current artist. Requires storage_path and optional fields."""
    user_id, artist = get_current_user()
    if not artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)

    payload = request.get_json(silent=True) or {}
    storage_path = (payload.get('storage_path') or '').strip()
    amount_cents = payload.get('amount_cents')
    currency = (payload.get('currency') or 'EUR').upper()
    invoice_date_raw = payload.get('invoice_date')  # ISO (YYYY-MM-DD) optional
    notes = payload.get('notes')

    if not storage_path:
        return error_response('validation_error', 'storage_path is required', 400)

    # parse date if provided
    invoice_date = None
    if isinstance(invoice_date_raw, str) and invoice_date_raw.strip():
        try:
            invoice_date = datetime.fromisoformat(invoice_date_raw).date()
        except Exception:
            return error_response('validation_error', 'invoice_date must be ISO date (YYYY-MM-DD)', 400)

    if not HAS_INVOICE_MODEL:
        # Soft success so Frontend-Uploadflow funktioniert auch ohne DB-Tracking
        return jsonify({
            'ok': True,
            'note': 'Invoice model not installed; stored only in Supabase Storage',
            'artist_id': artist.id,
            'storage_path': storage_path,
        }), 200

    try:
        # De-dupe by (artist_id, storage_path)
        existing = Invoice.query.filter_by(artist_id=artist.id, storage_path=storage_path).first()
        if existing:
            # update optional fields
            if amount_cents is not None:
                existing.amount_cents = int(amount_cents)
            if currency:
                existing.currency = currency
            if invoice_date is not None:
                existing.invoice_date = invoice_date
            if notes is not None:
                existing.notes = notes
            db.session.commit()
            return jsonify({'id': existing.id, 'artist_id': artist.id, 'storage_path': storage_path}), 200

        inv = Invoice(
            artist_id=artist.id,
            storage_path=storage_path,
            amount_cents=(int(amount_cents) if amount_cents is not None else None),
            currency=currency,
            invoice_date=invoice_date,
            notes=notes,
        )
        db.session.add(inv)
        db.session.commit()
        return jsonify({'id': inv.id, 'artist_id': artist.id, 'storage_path': inv.storage_path}), 201
    except Exception as e:
        logger.exception('Failed to create/update invoice entry')
        db.session.rollback()
        return error_response('internal_error', f'Failed to create invoice: {str(e)}', 500)


@api_bp.route('/invoices', methods=['GET'])
@clerk_auth_required
@swag_from('../resources/swagger/invoices_get.yml', validation=False)
def list_invoices():
    """List all registered invoices of the current artist (if Invoice model is available)."""
    user_id, artist = get_current_user()
    if not artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)

    if not HAS_INVOICE_MODEL:
        return ('', 204)

    try:
        rows = Invoice.query.filter_by(artist_id=artist.id).order_by(Invoice.created_at.desc()).all()
        return jsonify([
            {
                'id': r.id,
                'storage_path': r.storage_path,
                'status': getattr(r, 'status', None),
                'amount_cents': getattr(r, 'amount_cents', None),
                'currency': getattr(r, 'currency', 'EUR'),
                'invoice_date': (r.invoice_date.isoformat() if getattr(r, 'invoice_date', None) else None),
                'created_at': (r.created_at.isoformat() if getattr(r, 'created_at', None) else None),
                'updated_at': (r.updated_at.isoformat() if getattr(r, 'updated_at', None) else None),
            }
            for r in rows
        ]), 200
    except Exception as e:
        logger.exception('Failed to list invoices')
        return error_response('internal_error', f'Failed to list invoices: {str(e)}', 500)


# ===== GAGE CALCULATION ENDPOINTS =====

@api_bp.route('/artists/me/gage-criteria', methods=['PUT'])
@clerk_auth_required
def update_my_gage_criteria():
    """Update gage calculation criteria for the current artist."""
    user_id, artist = get_current_user()
    if not artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)

    try:
        data = request.get_json() or {}

        # Validate allowed fields
        allowed_fields = {
            'circus_education', 'stage_experience', 'employment_type',
            'awards_level', 'pepe_years', 'pepe_exclusivity'
        }

        criteria = {k: v for k, v in data.items() if k in allowed_fields}

        if not criteria:
            return error_response('bad_request', 'No valid gage criteria provided', 400)

        # Validate field values
        if 'stage_experience' in criteria:
            valid_exp = ['0-3', '3-7', '7-10', '10+', '0-2', '3-5', '6-10']
            if criteria['stage_experience'] not in valid_exp:
                return error_response('bad_request', f'Invalid stage_experience. Must be one of: {valid_exp}', 400)

        if 'employment_type' in criteria:
            valid_emp = ['vollzeit', 'teilzeit', 'hobby']
            if criteria['employment_type'] not in valid_emp:
                return error_response('bad_request', f'Invalid employment_type. Must be one of: {valid_emp}', 400)

        if 'awards_level' in criteria:
            valid_awards = ['international', 'national', 'regional', 'lokal', 'keine']
            if criteria['awards_level'] not in valid_awards:
                return error_response('bad_request', f'Invalid awards_level. Must be one of: {valid_awards}', 400)

        # Update criteria and calculate gage
        updated_artist = artist_mgr.update_gage_criteria(artist.id, **criteria)

        if not updated_artist:
            return error_response('internal_error', 'Failed to update gage criteria', 500)

        return jsonify({
            'message': 'Gage criteria updated successfully',
            'artist_id': updated_artist.id,
            'calculated_gage': updated_artist.calculated_gage,
            'price_range': {
                'min': updated_artist.price_min,
                'max': updated_artist.price_max
            },
            'admin_override': updated_artist.admin_gage_override
        }), 200

    except Exception as e:
        logger.exception('Failed to update gage criteria')
        return error_response('internal_error', f'Failed to update gage criteria: {str(e)}', 500)


@api_bp.route('/artists/me/gage-calculation', methods=['GET'])
@clerk_auth_required
def get_my_gage_calculation():
    """Get detailed gage calculation breakdown for the current artist."""
    user_id, artist = get_current_user()
    if not artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)

    try:
        breakdown = artist_mgr.calculate_artist_gage(artist.id)
        if not breakdown:
            return error_response('not_found', 'Artist not found', 404)

        return jsonify(breakdown), 200

    except Exception as e:
        logger.exception('Failed to get gage calculation')
        return error_response('internal_error', f'Failed to get gage calculation: {str(e)}', 500)


@api_bp.route('/artists/me/gage-criteria', methods=['GET'])
@clerk_auth_required
def get_my_gage_criteria():
    """Get current gage criteria for the artist."""
    user_id, artist = get_current_user()
    if not artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)

    try:
        return jsonify({
            'artist_id': artist.id,
            'criteria': {
                'circus_education': artist.circus_education,
                'stage_experience': artist.stage_experience,
                'employment_type': artist.employment_type,
                'awards_level': artist.awards_level,
                'pepe_years': artist.pepe_years,
                'pepe_exclusivity': artist.pepe_exclusivity
            },
            'gage_info': {
                'calculated_gage': artist.calculated_gage,
                'admin_override': artist.admin_gage_override,
                'current_range': {
                    'min': artist.price_min,
                    'max': artist.price_max
                }
            }
        }), 200

    except Exception as e:
        logger.exception('Failed to get gage criteria')
        return error_response('internal_error', f'Failed to get gage criteria: {str(e)}', 500)


# ===== IMAGE UPLOAD ENDPOINTS =====

@api_bp.route('/artists/me/upload-image', methods=['POST'])
@clerk_auth_required
def upload_artist_image():
    """Upload and process profile or gallery images for the current artist."""
    user_id, artist = get_current_user()
    if not artist:
        return error_response('forbidden', 'Current user not linked to an artist', 403)

    if 'image' not in request.files:
        return error_response('validation_error', 'No image file provided', 400)

    image_file = request.files['image']
    if image_file.filename == '':
        return error_response('validation_error', 'No image file selected', 400)

    # Überprüfen ob es ein Bild ist
    if not image_file.content_type or not image_file.content_type.startswith('image/'):
        return error_response('validation_error', 'File must be an image', 400)

    try:
        # Image type (profile or gallery)
        image_type = request.form.get('type', 'profile')  # default: profile

        if image_type not in ['profile', 'gallery']:
            return error_response('validation_error', 'Image type must be "profile" or "gallery"', 400)

        # Bild verarbeiten
        processed_image = process_image_for_upload(image_file)

        # Supabase Storage Upload
        from supabase import create_client

        supabase_url = os.getenv('SUPABASE_URL')
        supabase_service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

        if not supabase_url or not supabase_service_key:
            return error_response('internal_error', 'Supabase configuration missing', 500)

        supabase = create_client(supabase_url, supabase_service_key)
        bucket = os.getenv('SUPABASE_PROFILE_BUCKET', 'profiles')

        if image_type == 'profile':
            # Profilbild: überschreibt vorheriges
            file_path = f"{artist.id}/profile.webp"
        else:
            # Gallery: eindeutiger Name mit Timestamp
            timestamp = int(datetime.utcnow().timestamp())
            file_path = f"{artist.id}/gallery/{timestamp}.webp"

        # Upload zu Supabase.
        # storage3 liefert eine httpx-Response zurück und wirft bei HTTP-Fehlern
        # selbst. Ein `result.error` gibt es dort nicht — der frühere Zugriff
        # darauf löste einen AttributeError aus, weshalb *jeder* Upload mit
        # "Image upload failed" endete, obwohl die Datei längst im Bucket lag.
        # "upsert" muss ein String sein, der Header wird 1:1 weitergereicht.
        supabase.storage.from_(bucket).upload(
            file_path,
            processed_image.read(),
            file_options={
                "content-type": "image/webp",
                "upsert": "true" if image_type == 'profile' else "false",
            }
        )

        # Public URL generieren
        public_url = supabase.storage.from_(bucket).get_public_url(file_path)

        # URL in der Datenbank festhalten — sonst ist das Bild zwar hochgeladen,
        # taucht im Profil aber nie auf.
        try:
            if image_type == 'profile':
                artist.profile_image_url = public_url
            else:
                gallery = list(getattr(artist, 'gallery_urls', None) or [])
                if public_url not in gallery:
                    gallery.append(public_url)
                artist.gallery_urls = gallery[:9]
            db.session.commit()
        except Exception:
            db.session.rollback()
            logger.exception('Failed to persist image URL in database')
            # Nicht kritisch - Bild ist trotzdem hochgeladen

        return jsonify({
            'success': True,
            'url': public_url,
            'type': image_type,
            'message': f'{image_type.title()} image uploaded and processed successfully'
        }), 200

    except ValueError as e:
        return error_response('validation_error', str(e), 400)
    except Exception as e:
        logger.exception('Failed to upload image')
        return error_response('internal_error', f'Image upload failed: {str(e)}', 500)