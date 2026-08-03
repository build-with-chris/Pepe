"""Preisauskunft beim Anlegen einer Buchungsanfrage (SPEC-3, Kriterien 1, 3, 5, 6).

Der Wizard zeigt dem Kunden am Ende eine Preisspanne. Diese Tests prüfen die
Antwort, aus der sie stammt: die Spanne selbst, die beiden Sonderfälle
(Gruppe, Überlänge) und dass die Entfernung tatsächlich durchschlägt.
"""

from datetime import date, timedelta

import pytest

import managers.artist_manager as am
import managers.booking_requests_manager as brm
import routes.request_routes as request_routes
from models import db

MUNICH = (48.1372, 11.5756)
HAMBURG = (53.5511, 9.9937)

MUNICH_ADDRESS = 'Leopoldstr. 1, 80802 München'
HAMBURG_ADDRESS = 'Reeperbahn 1, 20359 Hamburg'


@pytest.fixture(autouse=True)
def reset_rate_limit():
    """Die Route erlaubt 5 Anfragen/Stunde pro IP — im Test hinderlich."""
    from helpers import shared_store
    shared_store.reset_for_tests()
    yield
    shared_store.reset_for_tests()


@pytest.fixture(autouse=True)
def stub_geocoding(monkeypatch):
    """Kein Nominatim im Test: Adressen werden lokal aufgelöst."""
    def fake_geocode(address):
        if address and 'hamburg' in address.lower():
            return HAMBURG
        return MUNICH
    monkeypatch.setattr(brm, 'geocode_address', fake_geocode)
    monkeypatch.setattr(am, 'geocode_address', fake_geocode)


@pytest.fixture
def munich_artists(artist_manager):
    """Zwei freigegebene Künstler mit gepflegter Adresse und Gage in München."""
    artists = []
    for i in range(2):
        artist = artist_manager.create_artist(
            f'Preis{i}', f'preis{i}@price-test.de', 'pw', ['Zauberer'],
            address=MUNICH_ADDRESS, price_min=1200, price_max=1800,
            approval_status='approved',
        )
        artist.lat, artist.lon = MUNICH
        artists.append(artist)
    db.session.commit()
    return artists


def payload(**overrides):
    body = {
        'client_name': 'Testkunde',
        'client_email': 'kunde@example.com',
        'event_date': (date.today() + timedelta(days=30)).isoformat(),
        'event_time': '19:00',
        'duration_minutes': 30,
        'event_type': 'Firmenfeier',
        'show_type': 'solo',
        'disciplines': ['Zauberer'],
        'team_size': 1,
        'number_of_guests': 300,
        'event_address': MUNICH_ADDRESS,
        'is_indoor': False,
    }
    body.update(overrides)
    return body


def post(client, **overrides):
    return client.post('/api/requests/requests', json=payload(**overrides))


def test_solo_request_returns_a_price_range(client, munich_artists):
    """Kriterium 1: Die Antwort enthält eine konkrete, plausible Spanne."""
    res = post(client)
    assert res.status_code == 201

    data = res.get_json()
    assert data['price_status'] == 'range'
    assert data['price_reason'] is None
    assert data['currency'] == 'EUR'
    assert isinstance(data['price_min'], int)
    assert isinstance(data['price_max'], int)
    assert 0 < data['price_min'] <= data['price_max']
    # Kriterium 2: Obergrenze bleibt unter Artist-Max plus Agenturgebühr
    assert data['price_max'] <= 1800 * 1.2


def test_distance_increases_the_price(client, munich_artists):
    """E2E-Schritt 5: Dieselbe Anfrage in Hamburg kostet mehr als in München."""
    munich = post(client).get_json()
    hamburg = post(client, event_address=HAMBURG_ADDRESS).get_json()

    assert hamburg['price_max'] > munich['price_max']
    assert hamburg['price_min'] > munich['price_min']
    # Die Differenz ist reiner Fahrtkostenaufschlag, die Gage bleibt gleich:
    # ~613 km * 0,50 €/km + 300 € Zuschlag ab 600 km + 100 € München-Rabatt.
    assert 650 <= hamburg['price_max'] - munich['price_max'] <= 750


def test_overlong_show_gets_an_individual_offer(client, munich_artists):
    """Kriterium 3: über 45 Minuten kein automatischer Preis."""
    data = post(client, duration_minutes=120).get_json()

    assert data['price_status'] == 'individual_offer'
    assert data['price_reason'] == 'duration'
    assert data['price_min'] is None
    assert data['price_max'] is None


def test_group_gets_an_individual_offer(client, munich_artists):
    """Kriterium 6: Gruppen ab drei Personen bekommen keinen Automatikpreis."""
    data = post(client, team_size=5, show_type='gruppe').get_json()

    assert data['price_status'] == 'individual_offer'
    assert data['price_reason'] == 'group'
    assert data['price_min'] is None
    assert data['group_pricing_pending'] is True


def test_request_without_matching_artists_is_marked_unavailable(client):
    """Ohne passenden Künstler gibt es keinen Preis — aber eine klare Auskunft."""
    data = post(client, disciplines=['Feuerspucken']).get_json()

    assert data['price_status'] == 'unavailable'
    assert data['price_reason'] == 'no_artists'
    assert data['price_min'] is None
    assert data['num_available_artists'] == 0


def test_duo_sums_exactly_two_artists(client, munich_artists):
    """Die Duo-Basis sind genau zwei Gagen, nicht alle gematchten."""
    data = post(client, team_size=2, show_type='duo').get_json()

    assert data['price_status'] == 'range'
    assert data['duo_price_min'] == 2400   # 2 x 1200
    assert data['duo_price_max'] == 3600   # 2 x 1800
    assert data['price_max'] <= 3600 * 1.2


def test_client_supplied_distance_is_ignored(client, munich_artists):
    """Ein mitgeschickter distance_km-Wert darf den Preis nicht verändern."""
    honest = post(client).get_json()
    manipulated = post(client, distance_km=5000).get_json()

    assert manipulated['price_min'] == honest['price_min']
    assert manipulated['price_max'] == honest['price_max']


# --- Anfahrt je Artist -----------------------------------------------------

@pytest.fixture
def mixed_artists(artist_manager):
    """Ein Künstler in München, einer in Hamburg, gleiche Gage."""
    artists = []
    for name, address, coord in (
        ('MucMike', MUNICH_ADDRESS, MUNICH),
        ('HansaHanna', HAMBURG_ADDRESS, HAMBURG),
    ):
        artist = artist_manager.create_artist(
            name, f'{name.lower()}@price-test.de', 'pw', ['Zauberer'],
            address=address, price_min=1200, price_max=1800,
            approval_status='approved',
        )
        artist.lat, artist.lon = coord
        artists.append(artist)
    db.session.commit()
    return artists


def test_far_away_artist_does_not_inflate_a_local_solo_price(client, mixed_artists):
    """Ein Solo-Kunde zahlt nicht die Anreise eines Künstlers, der nicht auftritt.

    Vorher lief ein Mittelwert über alle gematchten Künstler in den Preis. Bei
    einem Künstler in München und einem in Hamburg kamen für ein Event in
    München rund 300 km heraus, obwohl der Münchner direkt vor Ort wohnt.
    """
    data = post(client, event_address=MUNICH_ADDRESS).get_json()
    assert data['price_status'] == 'range'

    # Die Untergrenze gehört dem Münchner: keine nennenswerte Anfahrt, dafür
    # der München-Rabatt von 100 €.
    assert data['price_min'] < 1200 * 1.2


def test_solo_range_spans_the_individual_artist_prices(client, mixed_artists):
    """Die Spanne ist die Hülle der Einzelpreise, inklusive der Anfahrten.

    Der Hamburger muss anreisen, der Münchner nicht. Die Obergrenze trägt
    deshalb seine Anfahrt, die Untergrenze nicht.
    """
    data = post(client, event_address=MUNICH_ADDRESS).get_json()

    # ~613 km * 0,50 €/km + 300 € Zuschlag ab 600 km, die alle nur den
    # Hamburger betreffen. Ohne Aufteilung je Artist läge beides gleichauf.
    assert data['price_max'] - data['price_min'] > 600


def test_matched_artists_are_sorted_by_distance(client, mixed_artists):
    """Der nächstgelegene Künstler steht vorn — er ist die naheliegende Besetzung."""
    data = post(client, event_address=MUNICH_ADDRESS).get_json()
    matched = data['matched_artists']

    assert [a['name'] for a in matched] == ['MucMike', 'HansaHanna']
    assert matched[0]['distance_km'] == pytest.approx(0, abs=1)
    assert matched[1]['distance_km'] == pytest.approx(600, rel=0.1)


def test_duo_charges_both_journeys_separately(client, mixed_artists):
    """Beim Duo fällt jede Anreise für sich an, nicht zweimal dieselbe.

    Beide Künstler zusammen: einmal 0 km, einmal ~613 km. Zweimal den
    Mittelwert zu rechnen käme zwar aufs gleiche Kilometergeld, würde die
    Zuschlagsstufe ab 600 km aber verfehlen.
    """
    data = post(client, team_size=2, show_type='duo',
                event_address=MUNICH_ADDRESS).get_json()

    assert data['price_status'] == 'range'
    assert data['duo_price_min'] == 2400   # 2 x 1200
    # Kilometergeld nur für den Hamburger plus dessen 600-km-Zuschlag.
    solo_gage_ceiling = 3600 * 1.2
    assert data['price_max'] > solo_gage_ceiling


# --- Kundenangaben ---------------------------------------------------------

def test_contact_and_planning_fields_are_stored(client, munich_artists):
    """Telefon, Firma, Budget, Planungsstand und Ortshinweise landen in der DB.

    Die Telefonnummer ist im Formular Pflicht, wurde aber nie mitgeschickt und
    hatte auch keine Spalte. Der Kunde gab sie an, niemand bekam sie zu sehen.
    """
    from models import BookingRequest

    res = post(
        client,
        client_phone='+49 170 1234567',
        client_company='Muster GmbH',
        budget_range='2500-5000',
        planning_status='urgent',
        location_details='Hintereingang, 2. Stock, Saal B',
        needs_stage_floor=True,
        needs_rigging=True,
    )
    assert res.status_code == 201

    req = db.session.get(BookingRequest, res.get_json()['request_id'])
    assert req.client_phone == '+49 170 1234567'
    assert req.client_company == 'Muster GmbH'
    assert req.budget_range == '2500-5000'
    assert req.planning_status == 'urgent'
    assert req.location_details == 'Hintereingang, 2. Stock, Saal B'
    assert req.needs_stage_floor is True
    assert req.needs_rigging is True


def test_admin_email_shows_the_phone_number(app, client, munich_artists):
    """Die Admin-Mail nennt die Kontaktdaten, sonst nützt die Nummer niemandem."""
    from helpers.emails import build_admin_new_request_email
    from models import BookingRequest

    res = post(client, client_phone='+49 170 1234567', client_company='Muster GmbH',
               budget_range='2500-5000', planning_status='urgent')
    req = db.session.get(BookingRequest, res.get_json()['request_id'])

    html = build_admin_new_request_email(req)
    assert '+49 170 1234567' in html
    assert 'Muster GmbH' in html
    assert '2.500 bis 5.000 €' in html
    assert 'dringend' in html
