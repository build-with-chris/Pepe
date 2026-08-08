import time
from sqlalchemy import or_

# Robust imports that work whether you run as a module (-m) or directly
try:
    # Preferred: run from project root with: python -m PepeBooking.scripts.backfill_geo
    from PepeBooking.app import app
    from PepeBooking.models import db, Artist, BookingRequest
    from PepeBooking.services.geo import geocode_address_cascade
except ModuleNotFoundError:
    import sys, os
    # 1) Add project root (parent of 'PepeBooking') to sys.path
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    try:
        # Try again to import as a package
        from PepeBooking.app import app
        from PepeBooking.models import db, Artist, BookingRequest
        from PepeBooking.services.geo import geocode_address_cascade
    except ModuleNotFoundError:
        # 2) Fallback: import modules directly within the PepeBooking package dir
        pepe_dir = os.path.dirname(os.path.dirname(__file__))
        if pepe_dir not in sys.path:
            sys.path.insert(0, pepe_dir)
        from app import app
        from models import db, Artist, BookingRequest
        from services.geo import geocode_address_cascade

BATCH_SLEEP = 1.0  # Respekt für Nominatim: 1 Request/Sekunde

# scripts/backfill_geo.py – nur die beiden Loops umbauen

with app.app_context():
    # -------- Artists: IDs sammeln --------
    artist_ids = (
        db.session.query(Artist.id)
        .filter(Artist.address.isnot(None))
        .filter(Artist.address != '')
        .filter(or_(Artist.lat.is_(None), Artist.lon.is_(None)))
        .all()
    )
    artist_ids = [row[0] for row in artist_ids]

    for i, a_id in enumerate(artist_ids, 1):
        a = Artist.query.get(a_id)
        if not a:
            continue
        if not a.address or not str(a.address).strip():
            print(f"[artist] {a_id} has no address – skipping")
            continue

        addr = str(a.address).strip()
        # Die Stufensuche probiert von genau nach grob: Adresse wie eingegeben,
        # ohne Hausnummer, dann PLZ und Ort, zuletzt nur der Ort. Sie ersetzt
        # den frueheren Handgriff, einfach ", Deutschland" anzuhaengen — der
        # half bei einem vertippten Strassennamen naemlich gar nicht.
        coord, precision = geocode_address_cascade(addr)

        if coord:
            a.lat, a.lon = coord
            a.geo_precision = precision
            db.session.add(a)
            db.session.commit()
            print(f"[artist] {a.id} {addr} -> {coord} ({precision})")
        else:
            print(f"[artist] {a.id} FAILED to geocode: '{addr}'")

        time.sleep(BATCH_SLEEP)

    # -------- BookingRequests: IDs sammeln --------
    req_ids = (
        db.session.query(BookingRequest.id)
        .filter(BookingRequest.event_address.isnot(None))
        .filter(BookingRequest.event_address != '')
        .filter(or_(BookingRequest.event_lat.is_(None), BookingRequest.event_lon.is_(None)))
        .all()
    )
    req_ids = [row[0] for row in req_ids]

    for i, r_id in enumerate(req_ids, 1):
        r = BookingRequest.query.get(r_id)
        if not r or not r.event_address:
            continue
        coord, _ = geocode_address_cascade(r.event_address)
        if coord:
            r.event_lat, r.event_lon = coord
            db.session.add(r)
            db.session.commit()
            print(f"[request] {r.id} {r.event_address} -> {coord}")
        time.sleep(BATCH_SLEEP)

print("Backfill done ✅")