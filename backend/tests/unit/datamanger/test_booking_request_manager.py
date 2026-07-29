import pytest
from datetime import date
from managers.booking_requests_manager import BookingRequestManager
from managers.artist_manager import ArtistManager
from models import Artist, BookingRequest

def test_create_and_get_request():
    """Legt eine Buchungsanfrage an und prüft get_request und get_all_requests."""
    booking_mgr = BookingRequestManager()
    artist_mgr = ArtistManager()
    artist = artist_mgr.create_artist('Tester', 't@ex.de', 'pw', ['Zauberer'])
    req = booking_mgr.create_request(
        client_name      = 'Client',
        client_email     = 'client@ex.de',
        event_date       = date.today().isoformat(),
        duration_minutes = 10,
        event_type       = 'Private Feier',
        show_type        = 'Bühnen Show',
        show_discipline  = ['Zauberer'],
        team_size        = 1,
        number_of_guests = 5,
        event_address    = 'Musterstr. 1',
        is_indoor        = True,
        special_requests = 'None',
        needs_light      = False,
        needs_sound      = False,
        artists          = [artist]
    )
    # Prüfen, dass die Anfrage gespeichert und abrufbar ist
    fetched = booking_mgr.get_request(req.id)
    assert isinstance(fetched, BookingRequest)
    assert fetched.client_email == 'client@ex.de'
    all_reqs = booking_mgr.get_all_requests()
    assert any(r.id == req.id for r in all_reqs)

def test_set_offer_solo():
    """Solo-Booking: direktes Angebot, Preis mit Agenturgebühr, Status 'angeboten'.

    Der Status 'angeboten' steht heute an der Artist-Verknüpfung
    (`booking_artists`), nicht am BookingRequest selbst.
    """
    booking_mgr = BookingRequestManager()
    artist_mgr = ArtistManager()
    artist = artist_mgr.create_artist('Solo', 'solo@ex.de', 'pw', ['Zauberer'])
    req = booking_mgr.create_request(
        client_name      = 'C',
        client_email     = 'c@ex.de',
        event_date       = date.today().isoformat(),
        duration_minutes = 5,
        event_type       = 'Private Feier',
        show_type        = 'Bühnen Show',
        show_discipline  = ['Zauberer'],
        team_size        = 1,
        number_of_guests = 10,
        event_address    = 'Ort',
        is_indoor        = True,
        special_requests = '',
        needs_light      = False,
        needs_sound      = False,
        artists          = [artist]
    )
    updated = booking_mgr.set_offer(req.id, artist.id, 500)
    # Bei Solo-Booking wird die Agenturgebühr von 20% aufgerechnet: 500 × 1.2 = 600
    # hier werden Gewichte von Gästeanzahl und Eventtyp nicht angewendet, da die Gage fix vorgegeben wird
    assert updated.price_offered == 600

    statuses = booking_mgr.get_artist_statuses(req.id)
    entry = next(s for s in statuses if s['artist_id'] == artist.id)
    assert entry['status'] == 'angeboten'
    assert entry['requested_gage'] == 500

def test_set_offer_multiple():
    """Duo-Booking: jedes Angebot landet einzeln in der Artist-Verknüpfung."""
    # Hinweis: Der finale Request-Status bei Duo wird von den SPEC-3-Tests
    # weiter unten abgedeckt; hier geht es nur um die Pivot-Einträge.
    booking_mgr = BookingRequestManager()
    artist_mgr = ArtistManager()
    a1 = artist_mgr.create_artist('A1', 'a1@ex.de', 'pw', ['Zauberer'])
    a2 = artist_mgr.create_artist('A2', 'a2@ex.de', 'pw', ['Zauberer'])
    req = booking_mgr.create_request(
        client_name      = 'DuoClient',
        client_email     = 'duo@ex.de',
        event_date       = date.today().isoformat(),
        duration_minutes = 15,
        event_type       = 'Private Feier',
        show_type        = 'Bühnen Show',
        show_discipline  = ['Zauberer'],
        team_size        = 2,
        number_of_guests = 20,
        event_address    = 'Ort2',
        is_indoor        = False,
        special_requests = '',
        needs_light      = False,
        needs_sound      = False,
        artists          = [a1, a2]
    )
    booking_mgr.set_offer(req.id, a1.id, 300)
    booking_mgr.set_offer(req.id, a2.id, 400)

    by_artist = {s['artist_id']: s for s in booking_mgr.get_artist_statuses(req.id)}
    assert by_artist[a1.id]['requested_gage'] == 300
    assert by_artist[a2.id]['requested_gage'] == 400
    assert all(s['status'] == 'angeboten' for s in by_artist.values())

def test_change_status():
    """Ändert status bei gültigem Status; unzulässiger bleibt unverändert."""
    booking_mgr = BookingRequestManager()
    artist_mgr = ArtistManager()
    artist = artist_mgr.create_artist('CS', 'cs@ex.de', 'pw', ['Zauberer'])
    req = booking_mgr.create_request(
        client_name      = 'Change',
        client_email     = 'change@ex.de',
        event_date       = date.today().isoformat(),
        duration_minutes = 20,
        event_type       = 'Private Feier',
        show_type        = 'Bühnen Show',
        show_discipline  = ['Zauberer'],
        team_size        = 1,
        number_of_guests = 10,
        event_address    = 'Ort3',
        is_indoor        = True,
        special_requests = '',
        needs_light      = False,
        needs_sound      = False,
        artists          = [artist]
    )
    # Gültiger Statuswechsel
    updated = booking_mgr.change_status(req.id, 'akzeptiert')
    assert updated.status == 'akzeptiert'
    # Ungültiger Status: change_status meldet None und lässt die Anfrage unberührt
    assert booking_mgr.change_status(req.id, 'ungültiger_status') is None
    assert booking_mgr.get_request(req.id).status == 'akzeptiert'

def _make_request(booking_mgr, artists, team_size, **overrides):
    """Hilfsfunktion: Buchungsanfrage mit sinnvollen Vorgaben anlegen."""
    payload = dict(
        client_name      = 'C',
        client_email     = 'c@ex.de',
        event_date       = date.today().isoformat(),
        duration_minutes = 20,
        event_type       = 'Firmenfeier',
        show_type        = 'Bühnen Show',
        show_discipline  = ['Zauberer'],
        team_size        = team_size,
        number_of_guests = 100,
        event_address    = 'Musterstr. 1, 10115 Berlin',
        is_indoor        = True,
        special_requests = '',
        needs_light      = False,
        needs_sound      = False,
        artists          = artists,
    )
    payload.update(overrides)
    return booking_mgr.create_request(**payload)


def test_set_offer_solo_sums_exactly_one_gage():
    """SPEC-3, Kriterium 4: Solo summiert eine Gage — egal wie viele gematcht sind."""
    booking_mgr = BookingRequestManager()
    artist_mgr = ArtistManager()
    matched = [
        artist_mgr.create_artist(f'Solo{i}', f'solo{i}@sum.de', 'pw', ['Zauberer'],
                                 price_min=800, price_max=900)
        for i in range(4)
    ]
    req = _make_request(booking_mgr, matched, team_size=1)

    booking_mgr.set_offer(req.id, matched[0].id, 1000)

    req = booking_mgr.get_request(req.id)
    # Nur die Gage des bietenden Artists, nicht die Summe aller vier
    assert req.artist_gage == 1000
    assert req.price_offered == 1200  # 1000 + 20 % Agenturgebühr


def test_set_offer_duo_sums_exactly_two_gages():
    """SPEC-3, Kriterium 4: Duo summiert zwei Gagen — nicht drei oder fünf."""
    booking_mgr = BookingRequestManager()
    artist_mgr = ArtistManager()
    matched = [
        artist_mgr.create_artist(f'Duo{i}', f'duo{i}@sum.de', 'pw', ['Zauberer'],
                                 price_min=700, price_max=900)
        for i in range(5)
    ]
    req = _make_request(booking_mgr, matched, team_size=2)

    booking_mgr.set_offer(req.id, matched[0].id, 1000)

    req = booking_mgr.get_request(req.id)
    # Eigene Gage (1000) plus die Mindestgage genau eines weiteren Artists (700)
    assert req.artist_gage == 1700
    assert req.price_offered == 2040  # 1700 + 20 %


def test_set_offer_duo_uses_the_second_artists_actual_offer():
    """Sobald der zweite Artist geboten hat, zählt seine echte Gage."""
    booking_mgr = BookingRequestManager()
    artist_mgr = ArtistManager()
    a1 = artist_mgr.create_artist('DuoA', 'duo_a@real.de', 'pw', ['Zauberer'],
                                  price_min=700, price_max=900)
    a2 = artist_mgr.create_artist('DuoB', 'duo_b@real.de', 'pw', ['Zauberer'],
                                  price_min=700, price_max=900)
    req = _make_request(booking_mgr, [a1, a2], team_size=2)

    booking_mgr.set_offer(req.id, a1.id, 1000)
    booking_mgr.set_offer(req.id, a2.id, 1200)

    req = booking_mgr.get_request(req.id)
    assert req.artist_gage == 2200
    assert req.price_offered == 2640


def test_set_offer_persists_price_and_surcharges():
    """SPEC-3, Kriterium 5: price_offered ist danach eine Zahl, nicht NULL."""
    booking_mgr = BookingRequestManager()
    artist_mgr = ArtistManager()
    artist = artist_mgr.create_artist('Tech', 'tech@sum.de', 'pw', ['Zauberer'])
    req = _make_request(booking_mgr, [artist], team_size=1, needs_light=True)
    assert req.price_offered is None

    booking_mgr.set_offer(req.id, artist.id, 1000)

    req = booking_mgr.get_request(req.id)
    assert req.price_offered is not None
    # 1000 € Gage + 20 % Gebühr + 450 € Licht (ohne Gebühr darauf)
    assert req.price_offered == 1650
    assert req.artist_offer_date is not None


def test_get_artist_offer_separates_gage_and_client_price():
    """Netto-Gage und Kundenpreis stehen getrennt in der Antwort."""
    booking_mgr = BookingRequestManager()
    artist_mgr = ArtistManager()
    artist = artist_mgr.create_artist('Split', 'split@sum.de', 'pw', ['Zauberer'])
    req = _make_request(booking_mgr, [artist], team_size=1)

    booking_mgr.set_offer(req.id, artist.id, 1000)
    offer = booking_mgr.get_artist_offer(req.id, artist.id)

    assert offer['artist_gage'] == 1000
    assert offer['client_price'] == 1200
    assert offer['price_offered'] == 1000  # Altschlüssel bleibt die Netto-Gage
    assert offer['request_price_offered'] == 1200
    assert offer['status'] == 'angeboten'
