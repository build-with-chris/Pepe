from __future__ import annotations

from flask import Blueprint, request, jsonify
from helpers.clerk_auth import (
    admin_required,
    artist_required,
    get_current_artist,
    is_admin,
)
from services.calculate_price import calculate_price, requires_individual_offer
from flask import current_app
from models import db, Artist, BookingRequest
from flasgger import swag_from

from helpers.http_responses import error_response
from helpers.emails import (
    build_admin_new_request_email,
    build_artist_new_request_email,
    event_city,
    format_event_date,
    is_deliverable_address,
    send_email,
)

from managers.booking_requests_manager import BookingRequestManager
from managers.artist_manager import ArtistManager
from helpers import shared_store

# Manager-Instanzen
request_mgr = BookingRequestManager()
artist_mgr = ArtistManager()

"""
Booking module: Endpoints to create, list and manage booking requests.
"""

# --- Missbrauchsschutz der oeffentlichen Anfrage-Route -------------------------
#
# Beide Werte liegen im geteilten Store (`helpers/shared_store`), nicht mehr im
# Prozessspeicher. Auf einem dauerhaft laufenden Server war das gleichwertig; in
# einer Serverless-Umgebung ist jeder Aufruf potenziell eine neue Instanz, und
# ein prozesslokaler Zaehler schuetzt dort gar nicht mehr.
_RATE_LIMIT_WINDOW_SECONDS = 3600  # 1 hour
_RATE_LIMIT_MAX_REQUESTS = 5       # 5 requests/hour per IP
_IDEMPOTENCY_TTL_SECONDS = 3600


def _client_ip() -> str:
    """Best-effort client IP extraction (respects X-Forwarded-For)."""
    xff = request.headers.get('X-Forwarded-For')
    if xff:
        return xff.split(',')[0].strip()
    return request.remote_addr or 'unknown'


def _rate_limit_allow(ip: str) -> bool:
    """True, solange die IP im laufenden Fenster unter dem Limit liegt.

    Gezaehlt wird hochlaufend mit fester Ablaufzeit statt mit einer Liste von
    Zeitstempeln: ein Zaehler ist im geteilten Store eine einzige atomare
    Operation, eine Liste waere ein Lesen-Aendern-Schreiben mit Wettlauf.
    """
    count = shared_store.incr_with_ttl(
        f"ratelimit:booking:{ip}", _RATE_LIMIT_WINDOW_SECONDS
    )
    return count <= _RATE_LIMIT_MAX_REQUESTS


def _idempotency_lookup(key: str):
    """Zwischengespeicherte Antwort zu einem Idempotency-Key, sonst None."""
    if not key:
        return None
    return shared_store.get_json(f"idem:booking:{key}")


def _idempotency_store(key: str, payload: dict) -> None:
    if not key:
        return
    shared_store.set_json(f"idem:booking:{key}", payload, _IDEMPOTENCY_TTL_SECONDS)


# --- 80/20 constants & helpers -------------------------------------------------
MAX_MATCHED_ARTISTS = 5

# Zustand der Preisauskunft in der API-Antwort (SPEC-3, Kriterien 1, 3, 6)
PRICE_STATUS_RANGE = 'range'            # price_min/price_max sind gesetzt
PRICE_STATUS_INDIVIDUAL = 'individual_offer'  # bewusst kein automatischer Preis
PRICE_STATUS_UNAVAILABLE = 'unavailable'      # Preis konnte nicht ermittelt werden

def _config_fee_pct():
    try:
        return float(current_app.config.get("AGENCY_FEE_PERCENT", 20))
    except Exception:
        return 20.0

REQUIRED_REQUEST_FIELDS = (
    "client_name",
    "client_email",
    "event_date",
    "event_time",
    "duration_minutes",
    "event_type",
    "number_of_guests",
    "event_address",
)

def validate_create_request_payload(data: dict) -> tuple[bool, str | None]:
    """Lightweight validation for create_request payload. Returns (ok, error_message)."""
    if not isinstance(data, dict):
        return False, "payload must be a JSON object"
    for k in REQUIRED_REQUEST_FIELDS:
        if data.get(k) in (None, ""):
            return False, f"missing field: {k}"
    # types
    try:
        int(data.get("duration_minutes"))
        int(data.get("number_of_guests"))
    except Exception:
        return False, "duration_minutes and number_of_guests must be integers"
    # disciplines optional but must be list when present
    d = data.get("disciplines")
    if d is not None and not isinstance(d, list):
        return False, "disciplines must be a list"
    return True, None

def request_brief_json(r: BookingRequest) -> dict:
    """Serialize booking request to a compact JSON structure for lists."""
    return {
        "id": r.id,
        "status": r.status,
        "created_at": r.created_at.isoformat() if getattr(r, "created_at", None) else None,
        "event_address": r.event_address,
        "event_lat": getattr(r, "event_lat", None),
        "event_lon": getattr(r, "event_lon", None),
        "price_min": getattr(r, "price_min", None),
        "price_max": getattr(r, "price_max", None),
        "num_available_artists": getattr(r, "num_available_artists", None),
    }
# ------------------------------------------------------------------------------

# Blueprint für Buchungsanfragen unter /api/requests
booking_bp = Blueprint('booking', __name__, url_prefix='/api/requests')


@booking_bp.route('/debug/matching', methods=['GET'])
@admin_required
def debug_matching():
    """Diagnostic endpoint to check artist matching prerequisites.

    Gibt Namen, Disziplinen und Verfuegbarkeiten aller freigegebenen Artists aus.
    Das ist zur Fehlersuche nuetzlich, aber nichts fuer die Oeffentlichkeit —
    deshalb nur fuer Admins.
    """
    from models import Artist, Discipline, Availability
    from datetime import date as _date

    test_date = request.args.get('date', '2026-06-15')
    test_disc = request.args.get('discipline', 'Zauberer')

    try:
        event_date = _date.fromisoformat(test_date)
    except Exception:
        return jsonify({"error": f"Invalid date: {test_date}"}), 400

    # 1) All approved artists
    approved = Artist.query.filter_by(approval_status='approved').all()
    approved_info = []
    for a in approved:
        discs = [d.name for d in a.disciplines]
        avail_count = Availability.query.filter_by(artist_id=a.id).count()
        has_date = Availability.query.filter_by(artist_id=a.id, date=event_date).first() is not None
        approved_info.append({
            "id": a.id,
            "name": a.name,
            "disciplines": discs,
            "total_availability_days": avail_count,
            "has_availability_for_date": has_date,
        })

    # 2) Matching result
    matched = artist_mgr.get_artists_by_discipline([test_disc], test_date)

    return jsonify({
        "test_date": test_date,
        "test_discipline": test_disc,
        "approved_artists": approved_info,
        "matched_artists": [{"id": a.id, "name": a.name} for a in (matched or [])],
        "diagnosis": (
            "No approved artists" if not approved else
            "Artists exist but none have matching discipline+availability" if not matched else
            f"{len(matched)} artist(s) matched"
        )
    })


@booking_bp.route('/requests', methods=['GET'])
@artist_required
@swag_from('../resources/swagger/requests_get.yml')
def list_requests():
    """Return booking requests that match the logged-in artist."""
    artist = get_current_artist()
    result = request_mgr.get_requests_for_artist_with_recommendation(artist.id)
    return jsonify(result)

@booking_bp.route('/requests/list', methods=['GET'])
@admin_required
def list_requests_admin():
    """Admin list of booking requests.
    
    Allows optional filtering by status and sorting by creation date.
    Query parameters:
      - status: optional (e.g. requested | offered | accepted | rejected | cancelled)
      - sort: created_desc (default) | created_asc
      - limit: number of results (default 50)
      - offset: pagination offset
    """
    try:
        status = request.args.get('status') or None
        sort = request.args.get('sort') or 'created_desc'
        limit = int(request.args.get('limit') or 50)
        offset = int(request.args.get('offset') or 0)
    except Exception as e:
        current_app.logger.warning(f"Invalid query params: {e}")
        return error_response("validation_error", "Invalid query parameters", 400)

    items, total = request_mgr.list_requests(status=status, sort=sort, limit=limit, offset=offset)

    return jsonify({
        "items": [request_brief_json(r) for r in items],
        "total": total,
        "limit": limit,
        "offset": offset,
        "sort": sort,
        "status": status,
    })

# kein Login erforderlich!
@booking_bp.route('/requests', methods=['POST'])
@swag_from('../resources/swagger/requests_post.yml')
def create_request():
    """Create a new booking request and calculate a price range."""
    try:
        data = request.get_json(force=True)
        current_app.logger.debug("create_request payload: %s", data)

        # --- Simple per-IP rate limiting (5 req/hour)
        ip = _client_ip()
        if not _rate_limit_allow(ip):
            return error_response("rate_limited", "Too many requests. Try again later.", 429)

        # --- Idempotency-Key support (prevent duplicate creations on reload)
        idem_key = request.headers.get('Idempotency-Key')
        cached = _idempotency_lookup(idem_key) if idem_key else None
        if cached is not None:
            resp = jsonify(cached)
            resp.status_code = 201
            resp.headers["Location"] = cached.get("_location", "")
            resp.headers["Idempotent-Replay"] = "true"
            return resp

        # --- Validation
        ok, err = validate_create_request_payload(data)
        if not ok:
            return error_response("validation_error", err, 400)

        # Team-Größe normalisieren: Zahlen oder Strings wie "solo"/"duo" akzeptieren
        raw_team_size = data.get('team_size')
        if isinstance(raw_team_size, str):
            ts_lower = raw_team_size.strip().lower()
            if ts_lower == 'solo':
                team_size = 1
            elif ts_lower == 'duo':
                team_size = 2
            elif ts_lower in ('group', 'gruppe'):
                team_size = 3
            else:
                try:
                    team_size = int(raw_team_size)
                except ValueError:
                    return error_response("validation_error", "Invalid team_size", 400)
        else:
            team_size = raw_team_size

        # Disciplines normalization and validation
        raw_disc = data.get('disciplines')
        if raw_disc is None:
            disciplines = []
        elif isinstance(raw_disc, list):
            disciplines = raw_disc
        else:
            return error_response("validation_error", "disciplines must be a list", 400)

        # Optional: direct targeting of specific artists via IDs
        raw_target_ids = data.get('target_artist_ids')
        target_ids = None
        if raw_target_ids is not None:
            if not isinstance(raw_target_ids, list):
                return error_response("validation_error", "target_artist_ids must be a list of integers", 400)
            try:
                target_ids = [int(x) for x in raw_target_ids]
            except Exception:
                return error_response("validation_error", "target_artist_ids must be integers", 400)
            if len(target_ids) == 0:
                return error_response("validation_error", "target_artist_ids cannot be empty", 400)
            if len(target_ids) > MAX_MATCHED_ARTISTS:
                return error_response("validation_error", f"Too many target artists (max {MAX_MATCHED_ARTISTS})", 400)

        event_date = data['event_date']  # will raise KeyError if missing

        # Choose artist set: either explicitly targeted artists or recommendation by discipline/date
        if target_ids is not None:
            artist_objs = Artist.query.filter(Artist.id.in_(target_ids)).all()
            if len(artist_objs) != len(target_ids):
                return error_response("not_found", "One or more target artists not found", 404)
        else:
            current_app.logger.info(f"[BOOKING] Matching artists for disciplines={disciplines}, event_date={event_date}")
            artist_objs = artist_mgr.get_artists_by_discipline(disciplines, event_date) or []
            current_app.logger.info(f"[BOOKING] Matched {len(artist_objs)} artists before approval filter: {[a.id for a in artist_objs]}")

        # Filter only approved artists
        artist_objs = [a for a in artist_objs if str(getattr(a, 'approval_status', '')).lower() == 'approved']
        current_app.logger.info(f"[BOOKING] After approval filter: {len(artist_objs)} artists: {[(a.id, a.name) for a in artist_objs]}")
        if target_ids is not None and not artist_objs:
            return error_response("forbidden", "No approved target artists available", 403)
        # Für die UI: kompaktes Matched-Payload (max. MAX_MATCHED_ARTISTS Artists)
        matched_payload = [
            {
                "id": getattr(a, 'id', None),
                "name": getattr(a, 'name', None),
                "price_min": getattr(a, 'price_min', None),
                "price_max": getattr(a, 'price_max', None),
            }
            for a in (artist_objs[:MAX_MATCHED_ARTISTS] if artist_objs else [])
        ]
        req = request_mgr.create_request(
            client_name       = data['client_name'],
            client_email      = data['client_email'],
            event_date        = data['event_date'],
            event_time        = data['event_time'],
            duration_minutes  = data['duration_minutes'],
            event_type        = data['event_type'],
            show_type         = data.get('show_type'),
            show_discipline   = disciplines,
            team_size         = team_size,
            number_of_guests  = data['number_of_guests'],
            event_address     = data['event_address'],
            is_indoor         = data.get('is_indoor', False),
            special_requests  = data.get('special_requests', ''),
            needs_light       = data.get('needs_light', False),
            needs_sound       = data.get('needs_sound', False),
            artists           = artist_objs,
            # distance_km kommt bewusst NICHT vom Client — der Manager berechnet
            # sie aus Event-Adresse und Artist-Koordinaten (SPEC-2, Kriterium 6).
            newsletter_opt_in = data.get('newsletter_opt_in', False)
        )

        # Preisspanne berechnen basierend auf ausgewählten Artists und Parametern
        duo_min = duo_max = None
        pmin = pmax = None
        price_status = PRICE_STATUS_RANGE
        price_reason = None

        # Sonderfälle zuerst: ohne sie wäre jede Zahl geraten (SPEC-3, Kriterien 3 & 6)
        individual_reason = requires_individual_offer(req.duration_minutes, team_size)

        if not req.artists:
            price_status = PRICE_STATUS_UNAVAILABLE
            price_reason = 'no_artists'
            req.price_min = None
            req.price_max = None
        elif individual_reason:
            price_status = PRICE_STATUS_INDIVIDUAL
            price_reason = individual_reason
            req.price_min = None
            req.price_max = None
        else:
            fee_pct = _config_fee_pct()
            # `req.distance_km` ist der geografisch berechnete Mittelwert
            # Artist <-> Event. Die frühere Zusatzprüfung "wohnt der Artist in
            # derselben Stadt?" verglich Adress-Strings und kippte schon bei
            # einem angehängten "Deutschland" ins Gegenteil. Sie war zudem
            # überflüssig: Wohnt der Artist am Ort, ist die Entfernung ohnehin
            # nahe null.
            travel_distance = req.distance_km or 0.0

            # Basis definieren je Teamgröße. Gruppen (3+) sind hier bereits
            # ausgeschlossen, es bleiben Solo und Duo.
            if team_size == 2:
                # Duo: exakt die ersten zwei aus der gematchten Liste — nur wenn
                # überhaupt zwei Artists verfügbar sind.
                if len(artist_objs) >= 2:
                    pair = artist_objs[:2]
                    duo_min = sum(getattr(a, 'price_min', 0) for a in pair)
                    duo_max = sum(getattr(a, 'price_max', 0) for a in pair)
                    base_min, base_max = duo_min, duo_max
                else:
                    base_min = base_max = None
            else:
                # Solo: min/max aus den verfügbaren Artists (bisheriges Verhalten)
                base_min = min(a.price_min for a in artist_objs)
                base_max = max(a.price_max for a in artist_objs)

            try:
                if base_min is not None:
                    pmin, pmax = calculate_price(
                        base_min        = base_min,
                        base_max        = base_max,
                        distance_km     = travel_distance,
                        fee_pct         = fee_pct,
                        newsletter      = req.newsletter_opt_in,
                        event_type      = req.event_type,
                        num_guests      = req.number_of_guests,
                        is_weekend      = req.event_date.weekday() >= 5,
                        is_indoor       = req.is_indoor,
                        needs_light     = req.needs_light,
                        needs_sound     = req.needs_sound,
                        show_discipline = req.show_discipline,
                        # Die Basis ist bei Duo bereits die Summe beider Gagen;
                        # team_count steuert nur noch die Anfahrt pro Kopf.
                        team_count      = team_size,
                        duration        = req.duration_minutes,
                        event_address   = req.event_address,
                    )
                else:
                    price_status = PRICE_STATUS_UNAVAILABLE
                    price_reason = 'not_enough_artists'
            except Exception as e:
                current_app.logger.exception("calculate_price failed: %s", e)
                pmin = pmax = None
                price_status = PRICE_STATUS_UNAVAILABLE
                price_reason = 'calculation_failed'

            # In die DB schreiben
            req.price_min = pmin
            req.price_max = pmax
        db.session.commit()

        # --- Notify matched artists via email (first simple version) ---
        try:
            date_str = format_event_date(req.event_date)
            city = event_city(req.event_address)
            subject = f"Neue Booking-Anfrage – {date_str}{', ' + city if city else ''}"

            for artist in artist_objs:
                # Platzhalter-Adressen (…@clerk.placeholder) sind nicht zustellbar
                # und würden den Versand nur mit Fehlern fluten.
                if not is_deliverable_address(getattr(artist, 'email', None)):
                    current_app.logger.warning(
                        "Skipping email for artist %s – no deliverable address on record",
                        getattr(artist, 'id', '?'),
                    )
                    continue

                html = build_artist_new_request_email(artist, req)
                send_email(artist.email, subject, html)
        except Exception as e:
            # Do not fail the API if email sending has issues; just log it.
            current_app.logger.exception(f"Error while sending artist notification emails: {e}")

        # Send admin notification email
        try:
            admin_email = current_app.config.get('ADMIN_EMAIL')
            if admin_email:
                admin_subject = f"[Pepe Shows] Neue Buchungsanfrage #{req.id}"
                admin_html = build_admin_new_request_email(req)
                send_email(admin_email, admin_subject, admin_html)
                current_app.logger.info(f"Admin notification sent for request {req.id} to {admin_email}")
            else:
                current_app.logger.warning("Admin email notification skipped - ADMIN_EMAIL not configured")
        except Exception as e:
            # Do not fail the API if admin email sending has issues; just log it.
            current_app.logger.exception(f"Error while sending admin notification email: {e}")

        resp = {
            'request_id': req.id,
            'price_min': pmin,
            'price_max': pmax,
            # Damit das Frontend die drei Fälle unterscheiden kann, ohne auf
            # null-Preise zu raten (SPEC-3, Kriterien 1, 6, 7).
            'price_status': price_status,
            'price_reason': price_reason,
            'currency': 'EUR',
            'num_available_artists': len(artist_objs),
            'matched_artists': matched_payload,
        }
        # Duo-Zusatzpreise nur dann mitsenden, wenn tatsächlich >= 2 Artists vorhanden
        if team_size == 2 and len(artist_objs) >= 2 and duo_min is not None and duo_max is not None:
            resp['duo_price_min'] = duo_min
            resp['duo_price_max'] = duo_max
        # Gruppe: Flag setzen, keine Preise (bleibt für bestehende Clients erhalten)
        if price_reason == 'group':
            resp['group_pricing_pending'] = True

        location_value = f"/api/requests/requests/{req.id}"
        resp["_location"] = location_value  # internal for idempotent replays

        # Cache the response if an Idempotency-Key was provided
        if idem_key:
            _idempotency_store(idem_key, resp)

        response = jsonify(resp)
        response.status_code = 201
        response.headers["Location"] = location_value
        if idem_key:
            response.headers["Idempotent-Replay"] = "false"
        return response

    except KeyError as ke:
        current_app.logger.warning("Missing field in create_request: %s", ke)
        return error_response("missing_field", f"Missing field: {str(ke)}", 400)
    except Exception as e:
        current_app.logger.exception("Error in create_request")
        return error_response("internal_error", f"create_request failed: {str(e)}", 500)


@booking_bp.route('/requests/<int:req_id>/offer', methods=['PUT'])
@artist_required
@swag_from('../resources/swagger/requests_offer_put.yml')
def set_offer(req_id):
    """DEPRECATED: Angebot eines Artists speichern.

    Das Frontend nutzt ausschließlich `PUT /api/requests/requests/<id>/offer`
    aus `api_routes.py`. Dieser Endpunkt bleibt nur für Altclients bestehen und
    delegiert an dieselbe Manager-Logik — er hatte zuvor eine eigene, fehlerhafte
    Preisberechnung (Summe über *alle* gematchten Artists statt über die
    gebuchte Teamgröße). Zusammenführen der beiden Endpunkte: SPEC-3, v2.
    """
    current_app.logger.warning(
        "Deprecated endpoint PUT /api/requests/requests/%s/offer used", req_id
    )
    user = get_current_artist()
    user_id = user.id

    req = request_mgr.get_request(req_id)
    # Zugriff prüfen: Nur beteiligte Artists oder Admins dürfen bieten
    if not req or (user_id not in [a.id for a in req.artists] and not user.is_admin):
        return error_response("forbidden", "Not allowed to offer on this request", 403)

    data = request.json or {}
    # Beide Feldnamen annehmen: `price_offered` schickt das aktuelle Frontend,
    # `artist_gage` stammt von Altclients.
    artist_gage = data.get('artist_gage')
    if artist_gage is None:
        artist_gage = data.get('price_offered')
    if artist_gage is None:
        return error_response("validation_error", "artist_gage or price_offered is required", 400)
    try:
        artist_gage = int(artist_gage)
    except (TypeError, ValueError):
        return error_response("validation_error", "artist_gage must be a number", 400)

    req = request_mgr.set_offer(req_id, user_id, artist_gage)

    # Push-Benachrichtigung an alle Artists senden
    for artist in req.artists:
        #aktuell noch dummy
        send_push(artist, f'New offer: {req.price_offered} EUR for request {req_id}')

    return jsonify({
        'status': req.status,
        'price_offered': req.price_offered,
        'artist_gage': req.artist_gage,
    })

@booking_bp.route('/requests/<int:req_id>/accept', methods=['PUT'])
@artist_required
def accept_request(req_id: int):
    """Set a booking request status to 'accepted'.

    Only an artist assigned to the request (or an admin) may accept it.
    """
    try:
        artist = get_current_artist()
        req = request_mgr.get_request(req_id)
        if not req:
            return error_response("not_found", "Request not found", 404)
        if artist.id not in [a.id for a in req.artists] and not is_admin():
            return error_response("forbidden", "Not allowed to accept this request", 403)

        updated = request_mgr.change_status(req_id, 'akzeptiert')
        if not updated:
            return error_response("not_found", "Request not found or invalid status", 404)
        return jsonify({"ok": True, "id": updated.id, "status": updated.status})
    except Exception as e:
        current_app.logger.exception(f"accept_request failed for id={req_id}: {e}")
        return error_response("internal_error", f"accept_request failed: {str(e)}", 500)

@booking_bp.route('/requests/<int:req_id>', methods=['DELETE'])
@admin_required
def delete_request(req_id: int):
    """Delete a booking request by ID."""
    try:
        ok = request_mgr.delete(req_id)
        if not ok:
            return error_response("not_found", "Request not found", 404)
        return jsonify({"ok": True, "deleted_id": req_id})
    except Exception as e:
        current_app.logger.exception(f"delete_request failed for id={req_id}: {e}")
        return error_response("internal_error", f"delete_request failed: {str(e)}", 500)

def send_push(artist, message):
    """Log a push notification for an artist (placeholder)."""
    current_app.logger.info(f"PUSH to {artist.id}: {message}")
