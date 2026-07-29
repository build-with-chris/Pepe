"""Mail-Builder: die Bausteine, die bisher still gescheitert sind.

Alle drei Fehler hier hatten dieselbe Signatur: Der Aufrufer fängt jede
Exception ab und loggt sie nur. Ein kaputter Builder fiel deshalb nie auf — die
Mail kam einfach nicht an.
"""

from datetime import date, datetime

import pytest

from helpers.emails import (
    build_admin_new_request_email,
    build_artist_new_request_email,
    event_city,
    format_disciplines,
    format_event_date,
    is_deliverable_address,
)
from models import Artist, BookingRequest, db


@pytest.fixture
def request_row(app):
    req = BookingRequest(
        client_name='Marta Kunde',
        client_email='marta@example.com',
        event_type='Firmenfeier',
        show_type='solo',
        show_discipline='Zauberer,Jonglage',
        team_size='1',
        number_of_guests=120,
        event_address='Leopoldstr. 1, 80802 München, Deutschland',
        event_date=date(2026, 8, 15),
        duration_minutes=30,
        special_requests='Bitte ohne Feuer.',
        price_min=1400,
        price_max=1800,
    )
    db.session.add(req)
    db.session.commit()
    return req


@pytest.fixture
def artist_row(app):
    artist = Artist(name='Ada Artistin', email='ada@example.com',
                    price_min=1200, price_max=1800)
    db.session.add(artist)
    db.session.commit()
    return artist


def test_admin_email_uses_the_fields_the_model_actually_has(app, request_row):
    """Der Builder las `customer_name`/`customer_email` — die gibt es nicht.

    Jeder Aufruf endete im AttributeError, der Admin erfuhr von keiner einzigen
    Anfrage.
    """
    html = build_admin_new_request_email(request_row)

    assert 'Marta Kunde' in html
    assert 'marta@example.com' in html
    assert f'#{request_row.id}' in html


def test_admin_email_shows_the_special_requests(app, request_row):
    assert 'Bitte ohne Feuer.' in build_admin_new_request_email(request_row)


def test_admin_email_lists_disciplines_as_words(app, request_row):
    """`', '.join(...)` über den DB-String hätte zeichenweise getrennt."""
    html = build_admin_new_request_email(request_row)

    assert 'Zauberer, Jonglage' in html
    assert 'Z, a, u' not in html


def test_artist_email_renders_with_a_plain_date(app, artist_row, request_row):
    html = build_artist_new_request_email(artist_row, request_row)

    assert '15.08.2026' in html
    assert 'Ada Artistin' in html
    assert 'Zauberer, Jonglage' in html


def test_artist_email_names_the_city_not_the_country(app, artist_row, request_row):
    html = build_artist_new_request_email(artist_row, request_row)

    assert 'München' in html
    assert '>Deutschland<' not in html


def test_artist_email_uses_singular_for_a_solo_act(app, artist_row, request_row):
    """`team_size` ist eine Textspalte — der Vergleich mit der Zahl 1 griff nie."""
    html = build_artist_new_request_email(artist_row, request_row)

    assert '1 Person<' in html


class TestFormatEventDate:
    """`event_date` ist eine `db.Date` — also `date`, nicht `datetime`."""

    def test_date_is_formatted_german(self):
        assert format_event_date(date(2026, 8, 15)) == '15.08.2026'

    def test_datetime_is_formatted_german(self):
        assert format_event_date(datetime(2026, 8, 15, 19, 30)) == '15.08.2026'

    def test_iso_string_is_formatted_german(self):
        assert format_event_date('2026-08-15') == '15.08.2026'

    def test_unparsable_string_is_passed_through(self):
        assert format_event_date('irgendwann') == 'irgendwann'

    def test_none_becomes_a_dash(self):
        assert format_event_date(None) == '—'


class TestFormatDisciplines:
    def test_comma_string_is_split_on_commas(self):
        assert format_disciplines('Zauberer,Jonglage') == 'Zauberer, Jonglage'

    def test_list_is_joined(self):
        assert format_disciplines(['Zauberer', 'Jonglage']) == 'Zauberer, Jonglage'

    def test_empty_becomes_a_dash(self):
        assert format_disciplines(None) == '—'
        assert format_disciplines('') == '—'


class TestEventCity:
    """Der Mailkopf zeigte "Deutschland", wenn die Adresse auf das Land endet."""

    def test_trailing_country_is_skipped(self):
        assert event_city('Reeperbahn 1, 20359 Hamburg, Deutschland') == 'Hamburg'

    def test_postal_code_is_stripped(self):
        assert event_city('Leopoldstr. 1, 80802 München') == 'München'

    def test_plain_city_stays(self):
        assert event_city('Leopoldstr. 1, München') == 'München'

    def test_multi_word_city_survives(self):
        assert event_city('Hauptstr. 2, 61462 Königstein im Taunus, Germany') \
            == 'Königstein im Taunus'

    def test_empty_address_is_empty(self):
        assert event_city(None) == ''
        assert event_city('') == ''


class TestIsDeliverableAddress:
    def test_real_address_is_deliverable(self):
        assert is_deliverable_address('ada@example.com') is True

    def test_clerk_placeholder_is_not(self):
        assert is_deliverable_address('user_abc@clerk.placeholder') is False

    def test_missing_address_is_not(self):
        assert is_deliverable_address(None) is False
        assert is_deliverable_address('keine-mail') is False
