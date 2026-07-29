"""Szenario-Tests für die Preisberechnung (SPEC-3, Kriterium 8).

Jeder Faktor wird einzeln geprüft: Es wird genau ein Parameter gegenüber der
Basisanfrage verändert und erwartet, dass sich der Preis in die richtige
Richtung bewegt. Dazu kommen die Sonderfälle (Gruppe, Überlänge) und die
Obergrenzen-Garantie aus dem Kern der Spec.
"""

import pytest

from services.calculate_price import (
    MAX_AUTOMATIC_DURATION_MINUTES,
    calculate_price,
    client_price,
    requires_individual_offer,
    surcharges,
    team_size_to_people,
)

# Bewusst weite Artist-Spanne, damit die Faktoren nicht an der Kappung
# hängenbleiben und ihre Wirkung einzeln sichtbar wird.
BASE = dict(
    base_min=1000,
    base_max=3000,
    distance_km=0,
    fee_pct=20,
    event_type='Streetshow',
    num_guests=100,
    duration=15,
    is_weekend=False,
    is_indoor=True,
    needs_light=False,
    needs_sound=False,
    team_size='solo',
    event_address='Musterstr. 1, 10115 Berlin',
)


def price(**overrides):
    """Preisspanne für die Basisanfrage mit einzelnen Abweichungen."""
    return calculate_price(**{**BASE, **overrides})


# --- Faktoren einzeln ------------------------------------------------------

@pytest.mark.parametrize('event_type, expected_order', [
    ('Private Feier', 0),
    ('Streetshow', 1),
    ('Incentive', 2),
    ('Teamevent', 2),
    ('Firmenfeier', 3),
])
def test_event_type_factor(event_type, expected_order):
    """Event-Typ: Private Feier < Streetshow < Incentive/Teamevent < Firmenfeier."""
    ladder = ['Private Feier', 'Streetshow', 'Incentive', 'Firmenfeier']
    prices = [price(event_type=e)[1] for e in ladder]
    assert prices == sorted(prices)
    assert prices[0] < prices[-1]
    # Incentive und Teamevent sind fachlich dasselbe und dürfen nicht
    # unterschiedlich bepreist werden.
    assert price(event_type='Incentive') == price(event_type='Teamevent')


def test_event_type_unknown_falls_back_to_middle():
    """Ein unbekannter Event-Typ liegt zwischen den Extremen statt zu crashen."""
    unknown = price(event_type='Hochzeit')[1]
    assert price(event_type='Private Feier')[1] < unknown < price(event_type='Firmenfeier')[1]


def test_guest_count_factor():
    """Gästezahl: mehr Gäste, höherer Preis (Stufen bei 200 und 500)."""
    small = price(num_guests=100)[1]
    medium = price(num_guests=400)[1]
    large = price(num_guests=900)[1]
    assert small < medium < large
    # innerhalb einer Stufe ändert sich nichts
    assert price(num_guests=50) == price(num_guests=200)


def test_duration_factor():
    """Dauer: längere Show, höherer Preis — bis 45 Minuten."""
    assert price(duration=5)[1] < price(duration=20)[1] < price(duration=45)[1]


def test_indoor_outdoor_factor():
    """Outdoor ist teurer als Indoor."""
    assert price(is_indoor=True)[1] < price(is_indoor=False)[1]


def test_weekend_factor():
    """Wochenende ist teurer als Wochentag."""
    assert price(is_weekend=False)[1] < price(is_weekend=True)[1]


def test_tech_factor():
    """Licht und Ton schlagen mit je 450 € als Durchlaufposten auf."""
    plain = price()
    with_light = price(needs_light=True)
    with_both = price(needs_light=True, needs_sound=True)
    assert with_light[1] - plain[1] == 450
    assert with_both[1] - plain[1] == 900
    # Durchlaufposten: keine Agenturgebühr darauf
    assert with_light[0] - plain[0] == 450


def test_distance_factor():
    """Entfernung wirkt über Anfahrt (pro km) und Zuschlagsstufen."""
    near = price(distance_km=0)[1]
    mid = price(distance_km=100)[1]
    far = price(distance_km=610)[1]
    assert near < mid < far
    # 100 km * 0,50 €/km bei einer Person
    assert mid - near == 50
    # 610 km: 305 € Anfahrt + 300 € Zuschlag ab 600 km
    assert far - near == 605


def test_distance_is_charged_per_artist():
    """Bei einem Duo fällt die Anfahrt zweimal an."""
    solo = price(distance_km=100, team_count=1)[1]
    duo = price(distance_km=100, team_count=2)[1]
    assert duo - solo == 50


# --- Kern: Obergrenze bleibt in der Artist-Spanne -------------------------

def test_upper_bound_never_exceeds_artist_max_plus_fee():
    """SPEC-3, Kriterium 2: 1200–1800 € Gage, maximale Faktoren.

    Die Obergrenze darf Artist-Max zzgl. Agenturgebühr nicht übersteigen.
    """
    _, pmax = calculate_price(
        base_min=1200, base_max=1800, distance_km=0, fee_pct=20,
        event_type='Firmenfeier', num_guests=5000, duration=45,
        is_weekend=True, is_indoor=False, needs_light=False, needs_sound=False,
        team_size='solo', event_address='Musterstr. 1, 10115 Berlin',
    )
    assert pmax <= 1800 * 1.2


def test_upper_bound_holds_for_every_factor_combination():
    """Die Kappung greift für alle Faktorkombinationen, nicht nur die extreme."""
    ceiling = 3000 * 1.2
    for event_type in ('Private Feier', 'Streetshow', 'Incentive', 'Firmenfeier'):
        for guests in (10, 300, 900):
            for weekend in (False, True):
                for indoor in (False, True):
                    pmin, pmax = price(
                        event_type=event_type, num_guests=guests,
                        is_weekend=weekend, is_indoor=indoor, duration=45,
                    )
                    assert pmin <= pmax <= ceiling


def test_private_party_may_undercut_the_minimum_gage():
    """Private Feiern dürfen unter die reguläre Mindestgage rutschen."""
    args = dict(
        base_min=1200, base_max=1800, distance_km=0, fee_pct=20,
        num_guests=80, duration=5, is_weekend=False, is_indoor=True,
        needs_light=False, needs_sound=False, team_size='solo',
        event_address='Musterstr. 1, 10115 Berlin',
    )
    private_min, _ = calculate_price(event_type='Private Feier', **args)
    corporate_min, _ = calculate_price(event_type='Firmenfeier', **args)
    assert private_min < 1200 * 1.2 <= corporate_min


def test_price_stays_within_range_for_a_fixed_gage():
    """Ist die Gage ein Punktwert, bleibt der Preis genau dort (plus Gebühr)."""
    pmin, pmax = calculate_price(
        base_min=1500, base_max=1500, distance_km=0, fee_pct=20,
        event_type='Firmenfeier', num_guests=800, duration=45,
        is_weekend=True, is_indoor=False, needs_light=False, needs_sound=False,
        team_size='solo', event_address='Musterstr. 1, 10115 Berlin',
    )
    assert pmin == pmax == 1800


def test_inverted_artist_range_is_tolerated():
    """Vertauschte Grenzen aus dem Artist-Profil führen nicht zu Unsinn."""
    assert calculate_price(base_min=3000, base_max=1000, **{
        k: v for k, v in BASE.items() if k not in ('base_min', 'base_max')
    }) == price()


# --- Sonderfälle -----------------------------------------------------------

def test_special_case_group_gets_no_automatic_price():
    """Sonderfall 1: ab drei Personen kein automatischer Preis."""
    assert requires_individual_offer(duration_minutes=30, team_size='gruppe') == 'group'
    assert requires_individual_offer(duration_minutes=30, team_size=3) == 'group'
    assert requires_individual_offer(duration_minutes=30, team_size='duo') is None
    assert requires_individual_offer(duration_minutes=30, team_size='solo') is None


def test_special_case_overlength_gets_no_automatic_price():
    """Sonderfall 2: über 45 Minuten kein automatischer Preis."""
    assert requires_individual_offer(duration_minutes=120, team_size='solo') == 'duration'
    assert requires_individual_offer(duration_minutes=46, team_size='solo') == 'duration'
    assert requires_individual_offer(
        duration_minutes=MAX_AUTOMATIC_DURATION_MINUTES, team_size='solo') is None


def test_special_case_missing_input_is_not_treated_as_special():
    """Sonderfall 3: fehlende Angaben lösen keinen Individualfall aus.

    Ohne Artists entscheidet die Route (`price_status = 'unavailable'`), nicht
    diese Funktion — sie darf hier nicht fälschlich 'duration' melden.
    """
    assert requires_individual_offer() is None
    assert requires_individual_offer(duration_minutes=None, team_size=None) is None
    assert requires_individual_offer(duration_minutes='keine Angabe', team_size='solo') is None


# --- Hilfsfunktionen -------------------------------------------------------

@pytest.mark.parametrize('value, expected', [
    ('solo', 1), ('Solo', 1), ('duo', 2), ('gruppe', 3), ('group', 3),
    (1, 1), (2, 2), (5, 5), ('2', 2), ('unfug', 1), (None, 1), (0, 1),
])
def test_team_size_to_people(value, expected):
    assert team_size_to_people(value) == expected


def test_client_price_adds_fee_to_gage_only():
    """Auf Technik und Anfahrt wird keine Agenturgebühr erhoben."""
    assert client_price(1000, 20) == 1200
    assert client_price(1000, 20, needs_light=True) == 1200 + 450
    assert client_price(1000, 0) == 1000


def test_surcharges_are_independent_of_the_gage():
    assert surcharges() == 0
    assert surcharges(needs_light=True, needs_sound=True) == 900
    assert surcharges(distance_km=100, people=2) == 100
    assert surcharges(distance_km=350) == 200 + 175
