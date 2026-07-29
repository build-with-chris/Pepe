from models import db, BookingRequest, booking_artists, Artist
from services.calculate_price import (
    calculate_price,
    client_price,
    team_size_to_people,
)
from flask import current_app
from datetime import date, datetime, time, timedelta
from typing import Optional, List, Tuple
from services.geo import geocode_address, haversine_km
from sqlalchemy import func

# Zulässige Statuswerte für Buchungsanfragen
ALLOWED_STATUSES = ["angefragt", "angeboten", "akzeptiert", "abgelehnt", "storniert"]

# Mapping/Normalisierung: akzeptiere DE/EN-Schreibweisen
STATUS_ALIASES = {
    "requested": "angefragt",
    "requested_pending": "angefragt",
    "requested_pending_admin": "angefragt",
    "offered": "angeboten",
    "accepted": "akzeptiert",
    "declined": "abgelehnt",
    "rejected": "abgelehnt",
    "canceled": "storniert",
    "cancelled": "storniert",
}

def normalize_status(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    raw = str(value).strip().lower()
    if raw in ALLOWED_STATUSES:
        return raw
    return STATUS_ALIASES.get(raw)

# Zulässige Event-Typen für Buchungsanfragen
ALLOWED_EVENT_TYPES = ['Private Feier', 'Firmenfeier', 'Incentive', 'Streetshow']


class BookingRequestManager:
    """
    Verwaltet Buchungsanfragen: Anlage, Abruf, Angebote und Statuswechsel.
    """

    def __init__(self):
        """Initialisiert den BookingRequestManager mit der Datenbanksitzung."""
        self.db = db

    def get_all_requests(self):
        """Gibt alle Buchungsanfragen zurück."""
        return BookingRequest.query.all()

    def get_request(self, request_id):
        """Gibt eine Buchungsanfrage anhand ihrer ID zurück oder None."""
        return BookingRequest.query.get(request_id)

    def get_by_id(self, request_id: int) -> Optional[BookingRequest]:
        """Alias für get_request, typisiert."""
        return BookingRequest.query.get(request_id)

    def delete(self, request_id: int) -> bool:
        """Löscht eine Buchungsanfrage. Gibt True bei Erfolg zurück."""
        obj = self.get_by_id(request_id)
        if not obj:
            return False
        self.db.session.delete(obj)
        self.db.session.commit()
        return True

    def accept(self, request_id: int) -> Optional[BookingRequest]:
        """Komfort-Methode: setzt Status auf 'akzeptiert'."""
        return self.change_status(request_id, "akzeptiert")

    def list_requests(
        self,
        status: Optional[str] = None,
        sort: str = "created_desc",
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[BookingRequest], int]:
        """Listet Anfragen optional gefiltert nach Status und sortiert nach created_at.
        sort: 'created_desc' (default) | 'created_asc'
        """
        q = BookingRequest.query
        if status:
            norm = normalize_status(status)
            if norm:
                q = q.filter(BookingRequest.status == norm)
            else:
                # wenn unbekannter Status-Filter: keine Ergebnisse
                return [], 0
        if sort == "created_asc":
            q = q.order_by(BookingRequest.created_at.asc())
        else:
            q = q.order_by(BookingRequest.created_at.desc())
        total = q.with_entities(func.count()).scalar() or 0
        items = q.limit(max(0, int(limit))).offset(max(0, int(offset))).all()
        return items, int(total)

    def _compute_travel_distance(self, event_address, artists) -> Tuple[Optional[Tuple[float, float]], float]:
        """Ermittelt (Event-Koordinate, mittlere Entfernung in km) für eine Anfrage.

        Artist-Koordinaten kommen aus der DB (`lat`/`lon`), die beim Speichern der
        Adresse gesetzt werden. Fehlen sie, wird die Adresse einmal nachgeocodiert
        und das Ergebnis am Artist persistiert — jede Adresse kostet so höchstens
        einen Nominatim-Aufruf statt einen pro Anfrage.

        Rückgabe (None, 0.0), wenn die Event-Adresse nicht auflösbar ist.
        """
        try:
            event_coord = geocode_address(event_address)
        except Exception as e:
            current_app.logger.warning(f"event geocoding failed: {e}")
            return None, 0.0

        if not event_coord:
            current_app.logger.info("distance calculation skipped – event address not geocodable: %r", event_address)
            return None, 0.0

        distances = []
        for a in artists:
            lat = getattr(a, 'lat', None)
            lon = getattr(a, 'lon', None)
            if lat is None or lon is None:
                addr = getattr(a, 'address', None)
                if not addr:
                    continue
                try:
                    coord = geocode_address(addr)
                except Exception as e:
                    current_app.logger.warning(f"artist geocoding failed: {e}")
                    continue
                if not coord:
                    continue
                lat, lon = coord
                # Nachtragen, damit die nächste Anfrage ohne Netzaufruf auskommt
                try:
                    a.lat, a.lon = lat, lon
                except Exception:
                    pass
            distances.append(haversine_km((float(lat), float(lon)), event_coord))

        if not distances:
            return event_coord, 0.0

        # Heuristik: Mittelwert der Entfernungen aller zugeordneten Artists
        return event_coord, round(sum(distances) / len(distances), 1)

    def create_request(
        self,
        client_name,
        client_email,
        event_date,
        duration_minutes,
        event_type,
        show_type,
        show_discipline,
        team_size,
        number_of_guests,
        event_address,
        is_indoor,
        special_requests,
        needs_light,
        needs_sound,
        artists,
        event_time="18:00",
        distance_km=None,  # ignoriert – die Distanz wird immer serverseitig berechnet
        newsletter_opt_in=False
    ):
        """Erstellt eine neue Buchungsanfrage und verknüpft sie mit Artists."""
        current_app.logger.info(f"create_request called with client={client_name}, disciplines={show_discipline}, artists={[getattr(a, 'id', a) for a in artists]}")

        # Datum und Zeit konvertieren
        if isinstance(event_date, str):
            event_date = date.fromisoformat(event_date)
        if isinstance(event_time, str):
            event_time = time.fromisoformat(event_time)

        # Event-Type validieren
        if isinstance(event_type, str):
            matched = next(
                (e for e in ALLOWED_EVENT_TYPES if e.lower() == event_type.strip().lower()),
                None
            )
            if matched:
                event_type = matched
            else:
                raise ValueError(
                    f"Invalid event_type: {event_type}. Allowed: {ALLOWED_EVENT_TYPES}"
                )

        # --- Distanzberechnung Event <-> Artists (rein serverseitig) ---
        # Ein vom Client mitgeschickter distance_km-Wert wird ignoriert; er ist
        # preisrelevant und damit manipulierbar (SPEC-2, Kriterium 6).
        event_coord, travel_distance = self._compute_travel_distance(event_address, artists)

        req = BookingRequest(
            client_name=client_name,
            client_email=client_email,
            event_date=event_date,
            event_time=event_time,
            duration_minutes=duration_minutes,
            event_type=event_type,
            show_type=show_type,
            show_discipline=",".join(show_discipline) if isinstance(show_discipline, list) else show_discipline,
            team_size=team_size,
            number_of_guests=number_of_guests,
            event_address=event_address,
            is_indoor=is_indoor,
            special_requests=special_requests,
            needs_light=needs_light,
            needs_sound=needs_sound,
            distance_km=travel_distance,
            event_lat=event_coord[0] if event_coord else None,
            event_lon=event_coord[1] if event_coord else None,
            newsletter_opt_in=newsletter_opt_in
        )

        # 1) Request speichern (flush, um ID zu erhalten)
        self.db.session.add(req)
        self.db.session.flush()

        # 2) Artists verknüpfen: explizit in Pivot schreiben, Startstatus 'angefragt'
        #    - doppelte Artists verhindern
        artist_ids = []
        for a in artists:
            aid = getattr(a, 'id', a)
            try:
                aid = int(aid)
            except Exception:
                continue
            if aid not in artist_ids:
                artist_ids.append(aid)

        for aid in artist_ids:
            self.db.session.execute(
                booking_artists.insert().values(
                    booking_id=req.id,
                    artist_id=aid,
                    status='angefragt'
                )
            )

        # 3) final commit
        self.db.session.commit()
        return req

    def set_offer(self, request_id, artist_id, price_offered):
        """Speichert ein Angebot und aktualisiert den Status bei Solo oder nach vollständigen Angeboten."""
        current_app.logger.info(f"set_offer called for request_id={request_id}, artist_id={artist_id}, price_offered={price_offered}")
        # Angebot in Assoziationstabelle speichern und Status auf 'angeboten' setzen
        res = self.db.session.execute(
            booking_artists.update()
            .where(booking_artists.c.booking_id == request_id)
            .where(booking_artists.c.artist_id == artist_id)
            .values(requested_gage=price_offered, status='angeboten')
        )
        current_app.logger.debug(
            f"set_offer pivot update rowcount={res.rowcount} request_id={request_id} artist_id={artist_id} price_offered={price_offered}"
        )
        if res.rowcount == 0:
            # Falls die Verknüpfung fehlt, lege sie an
            self.db.session.execute(
                booking_artists.insert().values(
                    booking_id=request_id,
                    artist_id=artist_id,
                    requested_gage=price_offered,
                    status='angeboten'
                )
            )
            current_app.logger.debug("set_offer pivot insert performed for missing association")
        # Wichtig: Pivot-Update sofort festschreiben, damit nachfolgende Reads (z.B. Admin) die Gage sehen
        self.db.session.commit()

        req = self.get_request(request_id)
        if req is not None:
            self._persist_offer_price(req, artist_id, price_offered)
        return req

    # --- Preisberechnung für Angebote -------------------------------------

    @staticmethod
    def _fee_pct() -> float:
        """Agenturgebühr in Prozent aus der App-Konfiguration."""
        try:
            return float(current_app.config.get("AGENCY_FEE_PERCENT", 20))
        except (TypeError, ValueError):
            return 20.0

    def booked_team_gage(self, req, artist_id=None, offered_gage=None) -> Tuple[float, int]:
        """Summiert genau so viele Gagen, wie die Anfrage Artists bucht.

        Gematcht werden oft mehr Artists als gebucht (bis zu fünf). Für den Preis
        zählt nur die gebuchte Teamgröße: bei Solo eine Gage, bei Duo zwei
        (SPEC-3, Kriterium 4). Der gerade bietende Artist kommt zuerst, danach
        die übrigen mit ihrer eigenen abgegebenen Gage — oder ersatzweise ihrer
        Mindestgage aus dem Profil.

        Rückgabe: (Summe der Gagen, Anzahl der tatsächlich summierten Gagen).
        """
        booked = team_size_to_people(getattr(req, 'team_size', 1))

        gages: List[float] = []
        if artist_id is not None and offered_gage is not None:
            gages.append(float(offered_gage))

        pivot = {row['artist_id']: row for row in self.get_artist_statuses(req.id)}
        for a in req.artists:
            if a.id == artist_id:
                continue
            gage = pivot.get(a.id, {}).get('requested_gage')
            if gage is None:
                gage = getattr(a, 'price_min', None)
            if gage is None:
                continue
            gages.append(float(gage))

        used = gages[:booked]
        if len(used) < booked:
            current_app.logger.warning(
                "booked_team_gage: request %s bucht %s Artists, es liegen aber nur %s Gagen vor",
                req.id, booked, len(used)
            )
        return sum(used), len(used)

    def _persist_offer_price(self, req, artist_id, price_offered) -> None:
        """Schreibt Netto-Gage und Kundenpreis an die Anfrage.

        Ohne diesen Schritt blieb `price_offered` dauerhaft NULL, obwohl der
        Artist längst geboten hatte (SPEC-3, Kriterium 5).
        """
        try:
            total_gage, _ = self.booked_team_gage(req, artist_id, price_offered)
            req.artist_gage = int(round(total_gage))
            req.price_offered = client_price(
                total_gage,
                self._fee_pct(),
                distance_km=getattr(req, 'distance_km', 0) or 0,
                needs_light=req.needs_light,
                needs_sound=req.needs_sound,
                event_address=req.event_address,
                people=team_size_to_people(getattr(req, 'team_size', 1)),
            )
            req.artist_offer_date = datetime.utcnow()
            self.db.session.commit()
        except Exception as e:
            self.db.session.rollback()
            current_app.logger.exception(
                "Angebotspreis für Anfrage %s konnte nicht berechnet werden: %s", req.id, e
            )

    def set_artist_status(self, request_id: int, artist_id: int, status: str, comment: Optional[str] = None) -> bool:
        """Setzt den Status für genau EINEN Artist innerhalb einer Anfrage."""
        if status not in ALLOWED_STATUSES:
            return False
        update_values = {'status': status}
        if comment is not None:
            update_values['comment'] = comment
        res = self.db.session.execute(
            booking_artists.update()
            .where(booking_artists.c.booking_id == request_id)
            .where(booking_artists.c.artist_id == artist_id)
            .values(**update_values)
        )
        self.db.session.commit()
        return res.rowcount > 0

    def set_artists_status(self, request_id: int, artist_ids: List[int], status: str, comment: Optional[str] = None) -> int:
        """Setzt den Status für eine Menge von Artists; gibt Anzahl aktualisierter Zeilen zurück."""
        if status not in ALLOWED_STATUSES or not artist_ids:
            return 0
        update_values = {'status': status}
        if comment is not None:
            update_values['comment'] = comment
        res = self.db.session.execute(
            booking_artists.update()
            .where(booking_artists.c.booking_id == request_id)
            .where(booking_artists.c.artist_id.in_(artist_ids))
            .values(**update_values)
        )
        self.db.session.commit()
        return res.rowcount

    def set_all_artists_status(self, request_id: int, status: str, comment: Optional[str] = None) -> int:
        """Setzt den Status für ALLE Artists einer Anfrage; gibt Anzahl aktualisierter Zeilen zurück."""
        if status not in ALLOWED_STATUSES:
            return 0
        update_values = {'status': status}
        if comment is not None:
            update_values['comment'] = comment
        res = self.db.session.execute(
            booking_artists.update()
            .where(booking_artists.c.booking_id == request_id)
            .values(**update_values)
        )
        self.db.session.commit()
        return res.rowcount

    def get_artist_statuses(self, request_id: int):
        """Liefert pro Artist den Status und die gesendete Gage für eine Anfrage zurück."""
        rows = self.db.session.execute(
            booking_artists.select()
            .with_only_columns(
                booking_artists.c.artist_id,
                booking_artists.c.status,
                booking_artists.c.requested_gage,
                booking_artists.c.comment
            )
            .where(booking_artists.c.booking_id == request_id)
        ).fetchall()
        return [
            {'artist_id': r[0], 'status': r[1], 'requested_gage': r[2], 'comment': r[3]} for r in rows
        ]

    def change_status(self, request_id, status):
        """Ändert den Status einer Buchungsanfrage, sofern der neue Status zulässig ist."""
        req = self.get_request(request_id)
        norm = normalize_status(status)
        if not req or not norm or norm not in ALLOWED_STATUSES:
            return None
        req.status = norm
        self.db.session.commit()
        return req

    def get_all_offers(self):
        """
        Gibt alle Buchungsanfragen zurück, die bereits ein Angebot erhalten haben.
        """
        return BookingRequest.query.filter(BookingRequest.price_offered.isnot(None)).all()

    def get_requests_for_artist(self, artist_id):
        """Gibt Buchungsanfragen zurück, in denen der Artist beteiligt ist. (Debug: ohne Datumseinschränkung)"""
        try:
            aid = int(artist_id)
        except (TypeError, ValueError):
            current_app.logger.warning(f"Invalid artist_id passed to get_requests_for_artist: {artist_id}")
            return []

        query = (
            BookingRequest.query
            .join(booking_artists, booking_artists.c.booking_id == BookingRequest.id)
            .filter(booking_artists.c.artist_id == aid)
            .filter(BookingRequest.status.in_(ALLOWED_STATUSES))
        )
        results = query.all()
        current_app.logger.debug(f"get_requests_for_artist: artist_id={aid}, found {[r.id for r in results]}")
        if not results:
            # zusätzliche Diagnose: was ist in der Assoziationstabelle?
            assoc_rows = self.db.session.execute(
                booking_artists.select().where(booking_artists.c.artist_id == aid)
            ).fetchall()
            current_app.logger.debug(f"booking_artists rows for artist {aid}: {assoc_rows}")
            # nochmal alle verknüpften Requests ohne Statusfilter
            fallback = (
                BookingRequest.query
                .join(booking_artists, booking_artists.c.booking_id == BookingRequest.id)
                .filter(booking_artists.c.artist_id == aid)
                .all()
            )
            current_app.logger.debug(f"Fallback linked requests for artist {aid} (no status filter): {[r.id for r in fallback]}")
        return results

    def get_requests_for_artist_with_recommendation(self, artist_id):
        """
        Gibt zukünftige Buchungsanfragen zurück, die für den angegebenen Artist empfohlen werden,
        inklusive einer empfohlenen Preis-Spanne auf Basis von Artist-Parametern.
        """
        current_app.logger.info(f"get_requests_for_artist_with_recommendation called for artist_id={artist_id}")
        try:
            aid = int(artist_id)
        except (TypeError, ValueError):
            return []

        artist = Artist.query.get(aid)
        if not artist:
            current_app.logger.warning(f"No artist found with id={aid}")
            return []

        relevant = self.get_requests_for_artist(aid)
        current_app.logger.info(f"Relevant requests for artist {aid}: {[r.id for r in relevant]}")

        fee_pct = self._fee_pct()

        result = []
        for r in relevant:
            # Bewusst fee_pct=0: die Empfehlung ist die **Netto-Gage** des
            # Artists. Der Kundenpreis inkl. Agenturgebühr steht separat
            # darunter, damit beide Zahlen nicht mehr verwechselt werden können.
            rec_min, rec_max = calculate_price(
                base_min=artist.price_min,
                base_max=artist.price_max,
                distance_km=0,
                fee_pct=0,
                newsletter=False,
                event_type=r.event_type,
                num_guests=r.number_of_guests,
                is_weekend=r.event_date.weekday() >= 5,
                is_indoor=r.is_indoor,
                needs_light=False,
                needs_sound=False,
                show_discipline=r.show_discipline,
                team_size=1,
                duration=r.duration_minutes,
                event_address=r.event_address
            )
            current_app.logger.info(f"Calculated recommendation for request {r.id}: min={rec_min}, max={rec_max}")

            # Pivot-Daten (pro Artist) laden: Status & gesendete Gage
            pivot_row = self.db.session.execute(
                booking_artists.select()
                .with_only_columns(
                    booking_artists.c.status,
                    booking_artists.c.requested_gage,
                    booking_artists.c.comment
                )
                .where(booking_artists.c.booking_id == r.id)
                .where(booking_artists.c.artist_id == aid)
            ).fetchone()
            artist_status = pivot_row[0] if pivot_row else None
            requested_gage = pivot_row[1] if pivot_row else None
            artist_comment = pivot_row[2] if pivot_row else None
            current_app.logger.debug(
                f"artist pivot for request {r.id} & artist {aid}: status={artist_status}, requested_gage={requested_gage}, comment={artist_comment}"
            )

            result.append({
                'id': r.id,
                'client_name': r.client_name,
                'client_email': r.client_email,
                'event_date': r.event_date.isoformat(),
                'event_time': r.event_time.isoformat() if r.event_time else None,
                'duration_minutes': r.duration_minutes,
                'event_type': r.event_type,
                'show_type': getattr(r, 'show_type', None),
                'show_discipline': r.show_discipline,
                'team_size': r.team_size,
                'number_of_guests': r.number_of_guests,
                'event_address': r.event_address,
                'is_indoor': r.is_indoor,
                'special_requests': r.special_requests,
                'needs_light': r.needs_light,
                'needs_sound': r.needs_sound,
                'status': artist_status or r.status,
                'artist_status': artist_status,
                'artist_ids': [a.id for a in r.artists],
                # Netto-Empfehlung für den Artist …
                'recommended_price_min': rec_min,
                'recommended_price_max': rec_max,
                # … und was der Kunde dafür zahlen würde (inkl. Agenturgebühr)
                'client_price_min': client_price(rec_min, fee_pct),
                'client_price_max': client_price(rec_max, fee_pct),
                # Neu: tatsächliches Angebot und Datum
                'artist_gage': requested_gage,
                'artist_comment': artist_comment,
                'artist_offer_date': r.artist_offer_date.isoformat() if getattr(r, 'artist_offer_date', None) else None
            })
        return result
    
    def get_artist_offer(self, request_id, artist_id):
        """Gibt das vom Artist eingereichte Angebot (Pivot) für eine bestimmte Anfrage zurück."""
        # Verifizieren, dass die Anfrage existiert und der Artist zugeordnet ist
        req = self.get_request(request_id)
        if not req:
            return None
        if artist_id not in [a.id for a in req.artists]:
            return None
        # Aus der Assoziationstabelle lesen (Single Source of Truth)
        row = self.db.session.execute(
            booking_artists.select()
            .with_only_columns(
                booking_artists.c.requested_gage,
                booking_artists.c.status,
                booking_artists.c.comment
            )
            .where(booking_artists.c.booking_id == request_id)
            .where(booking_artists.c.artist_id == artist_id)
        ).fetchone()
        if not row:
            return None
        artist_gage = row[0]
        # Netto-Gage und Kundenpreis getrennt ausweisen: `price_offered` hieß
        # bisher zwar so, enthielt aber die Netto-Gage ohne Agenturgebühr.
        # Der Schlüssel bleibt für bestehende Clients erhalten.
        return {
            'price_offered': artist_gage,
            'artist_gage': artist_gage,
            # Anteil dieses Artists am Kundenpreis: seine Gage plus Agenturgebühr.
            # Technik, Anfahrt und Distanzzuschlag hängen an der Anfrage, nicht am
            # einzelnen Artist, und sind deshalb hier nicht enthalten.
            'client_price': (
                client_price(artist_gage, self._fee_pct())
                if artist_gage is not None else None
            ),
            # Gesamtpreis der Anfrage (alle gebuchten Gagen inkl. Gebühr und Zuschlägen)
            'request_price_offered': req.price_offered,
            'status': row[1],
            'comment': row[2]
        }