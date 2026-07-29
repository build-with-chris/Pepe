import pytest
from datetime import date, timedelta
from managers.availability_manager import AvailabilityManager
from managers.artist_manager import ArtistManager

def test_new_artist_has_full_year_availability():
    """Ein neuer Artist erhält standardmäßig 365 Verfügbarkeits-Tage."""
    artist_mgr = ArtistManager()
    manager = AvailabilityManager()
    artist = artist_mgr.create_artist('Test', 'test@ex.de', 'pw', ['Zauberer'])
    slots = manager.get_availabilities(artist.id)
    assert len(slots) == 365
    # Prüfe, dass der erste Tag heute ist und der letzte heute+364
    today = date.today()
    dates = sorted([slot.date for slot in slots])
    assert dates[0] == today
    assert dates[-1] == today + timedelta(days=364)

def test_bulk_insert_skips_days_that_already_exist():
    """add_availabilities_bulk ist idempotent — ein zweiter Lauf legt nichts an."""
    from models import db
    artist_mgr = ArtistManager()
    manager = AvailabilityManager()
    artist = artist_mgr.create_artist('Bulk', 'bulk@ex.de', 'pw', ['Zauberer'])

    today = date.today()
    days = [today + timedelta(days=i) for i in range(400)]
    created = manager.add_availabilities_bulk(artist.id, days)
    db.session.commit()

    # 365 Tage bestanden bereits aus der Anlage, es fehlen die letzten 35
    assert created == 35
    assert len(manager.get_availabilities(artist.id)) == 400

    assert manager.add_availabilities_bulk(artist.id, days) == 0


def test_bulk_insert_ignores_duplicates_within_one_call():
    from models import db
    artist_mgr = ArtistManager()
    manager = AvailabilityManager()
    artist = artist_mgr.create_artist('Dupe', 'dupe@ex.de', 'pw', ['Zauberer'])
    for slot in manager.get_availabilities(artist.id):
        manager.remove_availability(slot.id)

    tomorrow = date.today() + timedelta(days=1)
    created = manager.add_availabilities_bulk(artist.id, [tomorrow, tomorrow, tomorrow])
    db.session.commit()

    assert created == 1
    assert len(manager.get_availabilities(artist.id)) == 1


def test_bulk_insert_accepts_iso_strings():
    from models import db
    artist_mgr = ArtistManager()
    manager = AvailabilityManager()
    artist = artist_mgr.create_artist('Iso', 'iso@ex.de', 'pw', ['Zauberer'])
    for slot in manager.get_availabilities(artist.id):
        manager.remove_availability(slot.id)

    created = manager.add_availabilities_bulk(artist.id, ['2030-01-01', 'kein-datum'])
    db.session.commit()

    assert created == 1
    assert manager.get_availabilities(artist.id)[0].date == date(2030, 1, 1)


def test_add_availability_creates_slot():
    """add_availability fügt einen Slot hinzu, wenn er nicht existiert."""
    artist_mgr = ArtistManager()
    manager = AvailabilityManager()
    artist = artist_mgr.create_artist('A', 'a@ex.de', 'pw', ['Zauberer'])
    # Entferne alle Slots
    for slot in manager.get_availabilities(artist.id):
        manager.remove_availability(slot.id)
    # Jetzt keine Slots mehr
    assert manager.get_availabilities(artist.id) == []
    # Füge einen Slot für morgen hinzu
    tomorrow = date.today() + timedelta(days=1)
    slot = manager.add_availability(artist.id, tomorrow)
    assert slot.artist_id == artist.id
    assert slot.date == tomorrow
    # Doppelter Eintrag ändert nichts
    slot2 = manager.add_availability(artist.id, tomorrow)
    assert slot2.id == slot.id
    assert len(manager.get_availabilities(artist.id)) == 1

def test_remove_availability():
    """remove_availability löscht einen vorhandenen Slot oder gibt None zurück."""
    artist_mgr = ArtistManager()
    manager = AvailabilityManager()
    artist = artist_mgr.create_artist('B', 'b@ex.de', 'pw', ['Zauberer'])
    slots = manager.get_availabilities(artist.id)
    slot = slots[0]
    removed = manager.remove_availability(slot.id)
    assert removed.id == slot.id
    # Erneutes Löschen gibt None
    assert manager.remove_availability(slot.id) is None