from models import db, Artist
from models import Discipline, Availability, Artist
from datetime import date
from managers.discipline_manager import DisciplineManager
from datetime import date, timedelta
from managers.availability_manager import AvailabilityManager
from services.gage_calculator import GageCalculator
from sqlalchemy.exc import IntegrityError
import logging
logger = logging.getLogger(__name__)
import os
import requests
from urllib.parse import urlencode


class ArtistManager:
    """
    CRUD-Operationen für Artists und Anlage der Standard-Verfügbarkeit.
    """
    def __init__(self):
        """Initialisiert den ArtistManager mit der Datenbanksitzung."""
        self.db = db
        self.discipline_mgr = DisciplineManager()
        # Manager für Verfügbarkeiten
        self.availability_mgr = AvailabilityManager()

    def _geocode_and_set(self, artist):
        """If artist.address is set, try to geocode and store latitude/longitude.
        Uses OpenStreetMap Nominatim. Fails silently (logs warning) to avoid blocking flows.
        """
        try:
            address = (getattr(artist, 'address', None) or '').strip()
            if not address:
                return
            base = 'https://nominatim.openstreetmap.org/search'
            params = {
                'q': address,
                'format': 'json',
                'limit': 1
            }
            ua = os.getenv('GEOCODING_USER_AGENT', 'PepeBooking/1.0 (contact: admin@pepebooking.local)')
            resp = requests.get(f"{base}?{urlencode(params)}", headers={'User-Agent': ua}, timeout=6)
            if resp.status_code != 200:
                logger.warning('Geocoding failed: HTTP %s', resp.status_code)
                return
            data = resp.json() or []
            if not data:
                logger.warning('Geocoding: no result for %s', address)
                return
            lat = float(data[0].get('lat'))
            lon = float(data[0].get('lon'))
            # set on model if columns exist
            if hasattr(artist, 'latitude'):
                artist.latitude = lat
            if hasattr(artist, 'longitude'):
                artist.longitude = lon
        except Exception:
            logger.exception('Geocoding exception for address: %s', getattr(artist, 'address', None))

    def get_all_artists(self):
        """Gibt eine Liste aller Artists zurück."""
        return Artist.query.all()

    def get_pending_artists(self):
        """Gibt alle Artists mit Status 'pending' zurück."""
        return Artist.query.filter_by(approval_status='pending').all()

    def get_approved_artists(self):
        """Gibt alle freigegebenen Artists zurück."""
        return Artist.query.filter_by(approval_status='approved').all()

    def get_rejected_artists(self):
        """Gibt alle abgelehnten Artists zurück."""
        return Artist.query.filter_by(approval_status='rejected').all()

    def get_unsubmitted_artists(self):
        """Gibt alle (noch) nicht eingereichten Artists zurück."""
        return Artist.query.filter_by(approval_status='unsubmitted').all()

    def get_artist(self, artist_id):
        """Gibt den Artist mit der angegebenen ID zurück oder None."""
        return Artist.query.get(artist_id)
        

    def get_artist_by_email(self, email):
        """Gibt den Artist mit gegebener E-Mail zurück oder None."""
        return Artist.query.filter_by(email=email).first()

    def create_artist(self, name, email, password=None, disciplines=None,
                      phone_number=None, address=None,
                      price_min=1500, price_max=1900, is_admin=False, supabase_user_id=None,
                      approval_status="unsubmitted"):
        """Legt einen neuen Artist mit Standardverfügbarkeit an."""
        try:
            if self.get_artist_by_email(email):
                raise ValueError('Email already exists')
            disciplines = disciplines or []
            artist = Artist(
                name=name,
                email=email,
                phone_number=phone_number,
                address=address,
                price_min=price_min,
                price_max=price_max,
                is_admin=is_admin,
                supabase_user_id=supabase_user_id,
                approval_status=approval_status,
            )
            # Passwort ist optional (z. B. Supabase-Login)
            if password:
                artist.set_password(password)
            # Disziplinen zuordnen
            for disc_name in disciplines:
                disc = self.discipline_mgr.get_or_create_discipline(disc_name)
                artist.disciplines.append(disc)

            # Try to geocode the address and set lat/lon
            self._geocode_and_set(artist)

            self.db.session.add(artist)
            self.db.session.flush()
            # Standard-Verfügbarkeit: 365 Tage ab heute über AvailabilityManager anlegen
            today = date.today()
            for i in range(365):
                day = today + timedelta(days=i)
                self.availability_mgr.add_availability(artist.id, day)
            self.db.session.commit()
            return artist
        except IntegrityError as e:
            self.db.session.rollback()
            err_str = str(e).lower()
            if 'unique' in err_str or 'email' in err_str:
                raise ValueError('Email already exists')
            else:
                raise
        except Exception:
            self.db.session.rollback()
            raise


    def get_artist_by_supabase_user_id(self, supabase_user_id):
        """Gibt den Artist zurück, der mit der Supabase user_id verknüpft ist."""
        return Artist.query.filter_by(supabase_user_id=supabase_user_id).first()

    def get_artists_by_discipline(self, disciplines, event_date):
        """
        Gibt Artists zurück, die am angegebenen Datum verfügbar sind und
        mindestens eine der gegebenen Disziplinen beherrschen.
        """
        if isinstance(disciplines, str):
            disciplines = [disciplines]

        # Normalisierung der Disziplinnamen
        normalized = []
        for name in disciplines:
            name = name.strip()
            for allowed in self.discipline_mgr.get_allowed_disciplines():
                if allowed.lower() == name.lower():
                    normalized.append(allowed)
                    break

        # Datum konvertieren
        if isinstance(event_date, str):
            event_date = date.fromisoformat(event_date)

        # Query: join disciplines und availabilities
        return (
            Artist.query
            .join(Artist.disciplines)
            .join(Artist.availabilities)
            .filter(
                Discipline.name.in_(normalized),
                Availability.date == event_date
            )
            .all()
        )


    def delete_artist(self, artist_id):
        """
        Löscht einen Artist und alle zugehörigen Daten anhand der ID.
        """
        artist = self.get_artist(artist_id)
        if artist:
            self.db.session.delete(artist)
            self.db.session.commit()
            return True
        return False

    def update_artist(self, artist_id, **fields):
        """Update artist fields; if address changes, re-geocode. Returns updated artist or None."""
        artist = self.get_artist(artist_id)
        if not artist:
            return None
        try:
            address_before = getattr(artist, 'address', None)
            for k, v in fields.items():
                if hasattr(artist, k):
                    setattr(artist, k, v)
            # If address changed, recompute coordinates
            if 'address' in fields and (fields['address'] or '') != (address_before or ''):
                self._geocode_and_set(artist)
            self.db.session.commit()
            return artist
        except Exception:
            self.db.session.rollback()
            raise

    def ensure_artist_exists(self, *, email: str, supabase_user_id: str, name: str | None = None):
        """Sichert, dass ein Artist existiert: upsert nach E-Mail, UID verknüpfen, falls fehlend.
        Legt KEINE Jahres-Verfügbarkeit an (soll schlank bleiben für Onboarding/Login).
        """
        try:
            artist = self.get_artist_by_email(email)
            if artist:
                updated = False
                if not getattr(artist, 'supabase_user_id', None) and supabase_user_id:
                    artist.supabase_user_id = supabase_user_id
                    updated = True
                if not getattr(artist, 'approval_status', None):
                    artist.approval_status = 'unsubmitted'
                    updated = True
                if updated:
                    self.db.session.commit()
                return artist

            # Neu anlegen – ohne Passwort und ohne 365-Tage-Availability
            artist = Artist(
                name=name or (email.split('@')[0] if email else None),
                email=email,
                supabase_user_id=supabase_user_id,
                approval_status='unsubmitted',
            )
            self.db.session.add(artist)
            self.db.session.commit()
            return artist
        except Exception:
            self.db.session.rollback()
            raise

    def update_gage_criteria(self, artist_id, **criteria):
        """
        Updates gage calculation criteria for an artist and recalculates gage.

        Args:
            artist_id: Artist ID
            **criteria: Gage criteria fields (circus_education, stage_experience, etc.)

        Returns:
            dict: Updated artist data with calculated gage
        """
        try:
            artist = self.get_artist(artist_id)
            if not artist:
                return None

            # Update criteria fields
            for field, value in criteria.items():
                if hasattr(artist, field):
                    setattr(artist, field, value)

            # Calculate and set new gage
            calculated_gage = GageCalculator.calculate_gage(artist)
            artist.calculated_gage = calculated_gage

            # Update price_min/max to calculated value (unless admin override exists)
            if not artist.admin_gage_override:
                # ±20% spread as requested
                spread = int(calculated_gage * 0.2)
                artist.price_min = calculated_gage - spread
                artist.price_max = calculated_gage + spread

            self.db.session.commit()
            return artist

        except Exception:
            self.db.session.rollback()
            raise

    def calculate_artist_gage(self, artist_id):
        """
        Calculates gage for an artist without updating the database.

        Returns:
            dict: Gage calculation breakdown
        """
        artist = self.get_artist(artist_id)
        if not artist:
            return None

        return GageCalculator.get_gage_breakdown(artist)

    def recalculate_all_gages(self, limit=None):
        """
        Recalculates gages for all artists (admin function).

        Args:
            limit: Optional limit for number of artists to process

        Returns:
            dict: Summary of recalculated gages
        """
        try:
            query = Artist.query
            if limit:
                query = query.limit(limit)
            artists = query.all()

            updated_count = 0
            results = []

            for artist in artists:
                old_gage = artist.calculated_gage
                new_gage = GageCalculator.calculate_gage(artist)

                if old_gage != new_gage:
                    artist.calculated_gage = new_gage
                    # Only update price range if no admin override
                    if not artist.admin_gage_override:
                        spread = int(new_gage * 0.2)
                        artist.price_min = new_gage - spread
                        artist.price_max = new_gage + spread
                    updated_count += 1

                results.append({
                    'artist_id': artist.id,
                    'artist_name': artist.name,
                    'old_gage': old_gage,
                    'new_gage': new_gage,
                    'updated': old_gage != new_gage
                })

            self.db.session.commit()

            return {
                'total_artists': len(artists),
                'updated_count': updated_count,
                'results': results
            }

        except Exception:
            self.db.session.rollback()
            raise

    def set_admin_gage_override(self, artist_id, override_gage):
        """
        Sets admin override for artist gage.

        Args:
            artist_id: Artist ID
            override_gage: Override gage in EUR (set to None to remove override)

        Returns:
            Artist: Updated artist object
        """
        try:
            artist = self.get_artist(artist_id)
            if not artist:
                return None

            artist.admin_gage_override = override_gage

            # Update price range to override value
            if override_gage:
                spread = int(override_gage * 0.2)
                artist.price_min = override_gage - spread
                artist.price_max = override_gage + spread
            else:
                # Recalculate based on criteria
                calculated_gage = GageCalculator.calculate_gage(artist)
                artist.calculated_gage = calculated_gage
                spread = int(calculated_gage * 0.2)
                artist.price_min = calculated_gage - spread
                artist.price_max = calculated_gage + spread

            self.db.session.commit()
            return artist

        except Exception:
            self.db.session.rollback()
            raise