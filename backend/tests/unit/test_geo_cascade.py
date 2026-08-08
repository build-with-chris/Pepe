"""Adresssuche in Stufen (Tippfehler-Toleranz).

Anlass ist ein echter Datensatz: "Kiebtzweg 12a, 85464 Finsing, Deutschland".
Dem Strassennamen fehlt ein "i". Nominatim fand deshalb gar nichts, die
Entfernung fiel auf 0 km, und der Kunde bekam einen Preis ohne Anfahrt
genannt, ohne dass irgendwo etwas aufgefallen waere.

Getestet wird die Stufenlogik, nicht Nominatim: Der Geocoder wird gestubbt und
kennt nur die Schreibweisen, die es wirklich gibt.
"""
import pytest

import services.geo as geo
from services.geo import (
    GEO_PRECISION_CITY,
    GEO_PRECISION_EXACT,
    GEO_PRECISION_POSTAL,
    GEO_PRECISION_STREET,
    address_variants,
)

FINSING = (48.2167, 11.8167)
MUENCHEN = (48.1372, 11.5756)

TYPO_ADDRESS = "Kiebtzweg 12a, 85464 Finsing, Deutschland"
CORRECT_ADDRESS = "Kiebitzweg 12a, 85464 Finsing, Deutschland"


@pytest.fixture(autouse=True)
def clean_cache():
    geo.clear_geocode_cache()
    yield
    geo.clear_geocode_cache()


def _stub(known):
    """Geocoder, der nur die Schreibweisen in `known` kennt."""
    seen = []

    def fake(query, **kwargs):
        seen.append(query)
        return known.get(" ".join(query.lower().split()))

    fake.seen = seen
    return fake


# --- Zerlegung der Adresse -------------------------------------------------

def test_variants_go_from_precise_to_coarse():
    got = address_variants(TYPO_ADDRESS)
    assert got == [
        (TYPO_ADDRESS, GEO_PRECISION_EXACT),
        ("Kiebtzweg, 85464 Finsing, Deutschland", GEO_PRECISION_STREET),
        ("85464 Finsing, Deutschland", GEO_PRECISION_POSTAL),
        ("Finsing, Deutschland", GEO_PRECISION_CITY),
    ]


def test_variants_without_country_suffix():
    got = address_variants("Leopoldstr. 1, 80802 München")
    assert got == [
        ("Leopoldstr. 1, 80802 München", GEO_PRECISION_EXACT),
        ("Leopoldstr., 80802 München", GEO_PRECISION_STREET),
        ("80802 München", GEO_PRECISION_POSTAL),
        ("München", GEO_PRECISION_CITY),
    ]


def test_variants_of_a_bare_city_stay_single():
    """Ohne Strasse und PLZ gibt es nur eine Stufe, keine Doppelten."""
    assert address_variants("München") == [("München", GEO_PRECISION_EXACT)]


def test_variants_of_an_empty_address():
    assert address_variants("") == []
    assert address_variants(None) == []


def test_a_numeric_city_is_not_used_as_a_fallback():
    """Unsinn soll ohne Koordinate bleiben, statt eine erfundene zu bekommen.

    Zur echten Eingabe "ewergreg, 65456 4565445, Deutschland" fiel die Suche
    sonst auf den "Ort" 4565445 zurueck, und Nominatim antwortete mit einer
    Koordinate mitten in Muenchen.
    """
    got = address_variants("ewergreg, 65456 4565445, Deutschland")
    precisions = [p for _, p in got]
    assert GEO_PRECISION_POSTAL not in precisions
    assert GEO_PRECISION_CITY not in precisions


def test_nonsense_address_yields_no_coordinates(app, monkeypatch):
    """Ende zu Ende: Nominatim wuerde antworten, wir fragen gar nicht erst."""
    fake = _stub({"4565445, deutschland": MUENCHEN, "65456 4565445, deutschland": MUENCHEN})
    monkeypatch.setattr(geo, "geocode_address", fake)

    coord, precision = geo.geocode_address_cascade("ewergreg, 65456 4565445, Deutschland")

    assert coord is None
    assert precision is None


# --- Suche mit Rückfall ----------------------------------------------------

def test_typo_in_street_falls_back_to_postal_code(app, monkeypatch):
    """Der eigentliche Fall: Strasse vertippt, Ort trotzdem gefunden."""
    fake = _stub({"85464 finsing, deutschland": FINSING, "finsing, deutschland": FINSING})
    monkeypatch.setattr(geo, "geocode_address", fake)

    coord, precision = geo.geocode_address_cascade(TYPO_ADDRESS)

    assert coord == FINSING
    assert precision == GEO_PRECISION_POSTAL
    # Die genaueren Stufen wurden zuerst probiert, nicht uebersprungen.
    assert fake.seen[0] == TYPO_ADDRESS
    assert len(fake.seen) == 3


def test_correct_address_is_an_exact_hit_and_costs_one_lookup(app, monkeypatch):
    """Eine richtige Adresse loest keine zusaetzlichen Nominatim-Aufrufe aus."""
    fake = _stub({" ".join(CORRECT_ADDRESS.lower().split()): (48.2170, 11.8200)})
    monkeypatch.setattr(geo, "geocode_address", fake)

    coord, precision = geo.geocode_address_cascade(CORRECT_ADDRESS)

    assert coord == (48.2170, 11.8200)
    assert precision == GEO_PRECISION_EXACT
    assert len(fake.seen) == 1


def test_house_number_only_typo_falls_back_to_street(app, monkeypatch):
    """Falsche Hausnummer, richtige Strasse: Stufe 'street' greift."""
    fake = _stub({"kiebitzweg, 85464 finsing, deutschland": FINSING})
    monkeypatch.setattr(geo, "geocode_address", fake)

    coord, precision = geo.geocode_address_cascade("Kiebitzweg 999x, 85464 Finsing, Deutschland")

    assert coord == FINSING
    assert precision == GEO_PRECISION_STREET


def test_nothing_found_at_any_level(app, monkeypatch):
    fake = _stub({})
    monkeypatch.setattr(geo, "geocode_address", fake)

    coord, precision = geo.geocode_address_cascade("Nirgendwo 1, 00000 Nirgendheim, Deutschland")

    assert coord is None
    assert precision is None
    # Alle Stufen wurden probiert, bevor aufgegeben wurde.
    assert len(fake.seen) == 4


def test_artist_with_typo_still_gets_coordinates(app, monkeypatch):
    """Ende zu Ende: geocode_and_set schreibt lat/lon und die Genauigkeit."""
    import managers.artist_manager as am
    from models import Artist, db
    from tests.conftest import unique_email, unique_uid

    fake = _stub({"85464 finsing, deutschland": FINSING})
    monkeypatch.setattr(geo, "geocode_address", fake)

    artist = Artist(
        name="Tippfehler Toni",
        email=unique_email("typo"),
        supabase_user_id=unique_uid("typo"),
        approval_status="approved",
        address=TYPO_ADDRESS,
    )
    am.ArtistManager().geocode_and_set(artist)
    db.session.add(artist)
    db.session.commit()

    assert artist.lat == pytest.approx(FINSING[0], abs=0.01)
    assert artist.lon == pytest.approx(FINSING[1], abs=0.01)
    assert artist.geo_precision == GEO_PRECISION_POSTAL
