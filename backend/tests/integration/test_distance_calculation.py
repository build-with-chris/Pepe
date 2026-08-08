"""Entfernungsberechnung: serverseitig, aus Artist-Koordinaten (SPEC-2, Kriterium 5+6).

Nominatim wird gestubbt — getestet wird die Verdrahtung (welche Koordinaten
benutzt werden, was persistiert wird), nicht der fremde Geocoder.
"""
import pytest

import managers.booking_requests_manager as brm
import managers.artist_manager as am
from models import Artist, BookingRequest, db

# Ungefähre Stadtzentren; Luftlinie Hamburg <-> München ≈ 600 km
COORDS = {
    "hamburg": (53.5511, 9.9937),
    "münchen": (48.1351, 11.5820),
    "muenchen": (48.1351, 11.5820),
}


def _fake_geocode(address, **kwargs):
    a = (address or "").lower()
    for city, coord in COORDS.items():
        if city in a:
            return coord
    return None


@pytest.fixture()
def stub_geocode(monkeypatch):
    # Auf der untersten Ebene stubben, damit die Stufensuche darueber
    # (voll -> ohne Hausnummer -> PLZ+Ort -> Ort) mitgetestet wird.
    import services.geo as geo
    monkeypatch.setattr(geo, "geocode_address", _fake_geocode)
    return _fake_geocode


@pytest.fixture()
def munich_artist(app, stub_geocode):
    """Freigegebener Artist in München mit gefüllten Koordinaten."""
    from tests.conftest import unique_email, unique_uid

    artist = Artist(
        name="Muc Mike",
        email=unique_email("muc"),
        supabase_user_id=unique_uid("muc"),
        approval_status="approved",
        address="Marienplatz 1, München",
        price_min=1000,
        price_max=1400,
    )
    am.ArtistManager().geocode_and_set(artist)
    db.session.add(artist)
    db.session.commit()
    return artist.id


def test_geocode_and_set_fills_lat_lon(app, stub_geocode, munich_artist, get_artist):
    """Kriterium 5: nach dem Speichern der Adresse sind lat/lon gefüllt."""
    artist = get_artist(munich_artist)
    assert artist.lat == pytest.approx(48.1351, abs=0.01)
    assert artist.lon == pytest.approx(11.5820, abs=0.01)


def test_distance_is_computed_server_side_and_ignores_client(client, app, stub_geocode, munich_artist):
    """Kriterium 6: Hamburg <-> München ≈ 600 km, egal was der Client schickt."""
    payload = {
        "client_name": "Klara Kundin",
        "client_email": "klara@example.com",
        "event_date": "2099-06-01",
        "event_time": "18:00",
        "duration_minutes": 30,
        "event_type": "Private Feier",
        "show_type": "Walking Act",
        "number_of_guests": 50,
        "event_address": "Rathausmarkt 1, Hamburg",
        "team_size": 1,
        "target_artist_ids": [munich_artist],
        # Lüge des Clients – muss ignoriert werden
        "distance_km": 0,
    }
    resp = client.post("/api/requests/requests", json=payload)
    assert resp.status_code == 201, resp.get_data(as_text=True)

    req_id = resp.get_json()["request_id"]
    req = db.session.get(BookingRequest, req_id)
    assert req.distance_km == pytest.approx(600, rel=0.10)
    # Event-Koordinaten werden mitgespeichert
    assert req.event_lat == pytest.approx(53.5511, abs=0.01)
    assert req.event_lon == pytest.approx(9.9937, abs=0.01)


def test_artist_without_coordinates_is_geocoded_and_backfilled(app, stub_geocode, get_artist):
    """Fehlen lat/lon, wird die Adresse einmal aufgelöst und am Artist nachgetragen."""
    from tests.conftest import unique_email, unique_uid

    artist = Artist(
        name="Coordless Cora",
        email=unique_email("nocoord"),
        supabase_user_id=unique_uid("nocoord"),
        approval_status="approved",
        address="Marienplatz 1, München",
    )
    db.session.add(artist)
    db.session.commit()
    assert artist.lat is None and artist.lon is None

    mgr = brm.BookingRequestManager()
    event_coord, distances = mgr._compute_travel_distance("Rathausmarkt 1, Hamburg", [artist])

    assert event_coord == pytest.approx(COORDS["hamburg"], abs=0.01)
    assert distances[artist.id] == pytest.approx(600, rel=0.10)
    # nachgetragen, damit die nächste Anfrage keinen Netzaufruf mehr braucht
    assert artist.lat == pytest.approx(48.1351, abs=0.01)
    assert artist.lon == pytest.approx(11.5820, abs=0.01)


def test_unresolvable_event_address_yields_no_distances(app, stub_geocode, munich_artist, get_artist):
    """Keine Koordinate zur Event-Adresse -> keine Entfernungen, kein Absturz."""
    mgr = brm.BookingRequestManager()
    event_coord, distances = mgr._compute_travel_distance("Nirgendwo 1", [get_artist(munich_artist)])
    assert event_coord is None
    assert distances == {}


def test_distances_are_per_artist_not_averaged(app, stub_geocode, munich_artist, get_artist):
    """Jeder Artist bekommt seine eigene Entfernung, nicht den Mittelwert aller.

    Der Mittelwert war als Preisbestandteil unbrauchbar: Für ein Event in
    München kam derselbe Wert heraus wie für eines in Hamburg, sobald die
    Artists auf beide Städte verteilt waren.
    """
    from tests.conftest import unique_email, unique_uid

    hamburg = Artist(
        name="Hansa Hanna",
        email=unique_email("hh"),
        supabase_user_id=unique_uid("hh"),
        approval_status="approved",
        address="Rathausmarkt 1, Hamburg",
        price_min=900,
        price_max=1300,
    )
    am.ArtistManager().geocode_and_set(hamburg)
    db.session.add(hamburg)
    db.session.commit()

    mgr = brm.BookingRequestManager()
    artists = [get_artist(munich_artist), hamburg]

    _, in_munich = mgr._compute_travel_distance("Marienplatz 1, München", artists)
    _, in_hamburg = mgr._compute_travel_distance("Rathausmarkt 1, Hamburg", artists)

    # In München ist der Münchner da, der Hamburger muss anreisen.
    assert in_munich[munich_artist] == pytest.approx(0, abs=1)
    assert in_munich[hamburg.id] == pytest.approx(600, rel=0.10)
    # In Hamburg genau andersherum. Beim Mittelwert war beides identisch.
    assert in_hamburg[hamburg.id] == pytest.approx(0, abs=1)
    assert in_hamburg[munich_artist] == pytest.approx(600, rel=0.10)
