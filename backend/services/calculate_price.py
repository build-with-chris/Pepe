from __future__ import annotations

import os
import logging

logger = logging.getLogger(__name__)


# Ab dieser Showlänge bzw. Teamgröße gibt es keinen automatischen Preis mehr,
# sondern ein individuelles Angebot (SPEC-3, Kriterien 3 und 6).
MAX_AUTOMATIC_DURATION_MINUTES = 45
MAX_AUTOMATIC_TEAM_SIZE = 2


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def team_size_to_people(team_size) -> int:
    """Normalisiert 'solo'/'duo'/'gruppe'/Zahlen auf eine Personenzahl >= 1."""
    if isinstance(team_size, (int, float)) and not isinstance(team_size, bool):
        return max(1, int(team_size))
    try:
        ts = str(team_size).strip().lower()
    except Exception:
        return 1
    named = {'solo': 1, 'duo': 2, 'trio': 3, 'quartet': 4, 'quartett': 4}
    if ts in named:
        return named[ts]
    if ts in ('group', 'gruppe'):
        return 3
    try:
        return max(1, int(ts))
    except ValueError:
        return 1


def requires_individual_offer(duration_minutes=None, team_size=None) -> str | None:
    """Prüft, ob eine Anfrage automatisch bepreisbar ist.

    Rückgabe: 'duration' bei Überlänge, 'group' ab drei Personen, sonst None.
    Die Faktor-Scores sind nur bis 45 Min und bis Duo geeicht; darüber hinaus
    wäre jede Zahl geraten. Deshalb wird bewusst gar keine angezeigt.
    """
    if duration_minutes is not None:
        try:
            if int(duration_minutes) > MAX_AUTOMATIC_DURATION_MINUTES:
                return 'duration'
        except (TypeError, ValueError):
            pass
    if team_size is not None and team_size_to_people(team_size) > MAX_AUTOMATIC_TEAM_SIZE:
        return 'group'
    return None


def _to_float(value) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def _distance_tier(distance_km: float) -> int:
    """Zuschlagsstufe für eine einzelne Anreise."""
    if distance_km >= 600:
        return 300
    if distance_km >= 300:
        return 200
    return 0


def surcharges(distance_km=0, needs_light=False, needs_sound=False,
               event_address=None, people=1, distances=None) -> float:
    """Feste Durchlaufposten in Euro: Technik, Distanzzuschlag und Anfahrt.

    Diese Posten sind keine Gage — auf sie wird keine Agenturgebühr erhoben.

    `distances` ist die Liste der Einzelentfernungen der beteiligten Artists.
    Ist sie gesetzt, zählt jede Anreise für sich: Kilometergeld und
    Zuschlagsstufe fallen pro Artist an. Das ist der Normalfall, seit die
    Entfernung je Artist bekannt ist.

    `distance_km` zusammen mit `people` bleibt als Kurzform erhalten (eine
    Entfernung, mehrfach gefahren) und wird nur benutzt, wenn `distances`
    fehlt. Dort gilt die Zuschlagsstufe wie bisher genau einmal.
    """
    tech_fee = 0
    if needs_light:
        tech_fee += 450
    if needs_sound:
        tech_fee += 450

    rate = _env_float('RATE_PER_KM', 0.5)

    if distances is not None:
        legs = [_to_float(d) for d in distances]
        travel_fee = sum(d * rate for d in legs)
        surcharge = sum(_distance_tier(d) for d in legs)
    else:
        distance = _to_float(distance_km)
        travel_fee = distance * rate * max(1, int(people or 1))
        surcharge = _distance_tier(distance)

    city = None
    if event_address:
        raw_city = event_address.split(',')[-1].strip()
        parts = raw_city.split()
        city = parts[-1].lower() if parts else None
    # Der Ortsrabatt hängt am Veranstaltungsort, nicht an der Anreise, und
    # wird deshalb genau einmal abgezogen.
    if city in ['münchen', 'muenchen', 'munich']:
        surcharge -= 100

    return tech_fee + surcharge + travel_fee


def client_price(artist_gage, fee_pct, **surcharge_kwargs) -> int:
    """Kundenpreis für eine **feste** Gage: Gage + Agenturgebühr + Zuschläge.

    Wird verwendet, sobald ein Artist eine konkrete Gage genannt hat. Die
    Faktorlogik aus `calculate_price` läuft dann bewusst nicht mehr — sie ist
    im Angebot des Artists bereits enthalten und würde doppelt wirken.
    """
    try:
        fee_factor = 1 + float(fee_pct) / 100
    except (TypeError, ValueError):
        fee_factor = 1.0
    total = float(artist_gage) * fee_factor + surcharges(**surcharge_kwargs)
    return max(0, int(round(total)))


def calculate_price(base_min, base_max,
                    distance_km, fee_pct, newsletter=False,
                    event_type='Private Feier', num_guests=0, show_discipline=False,
                    is_weekend=False, is_indoor=True,
                    needs_light=False, needs_sound=False,
                    team_size='solo',
                    duration=0, event_address=None, team_count=None,
                    tight_spread_pct: float | None = None,
                    distances=None):
    """Berechnet die Preisspanne (inkl. Agenturgebühr) für eine Buchungsanfrage.

    Ablauf:

    1. **Basis** ist ein Punktwert: die Mitte zwischen `min_floor` und `base_max`.
       `min_floor` ist `base_min`, bei 'Private Feier' um `PRIVATE_MIN_FACTOR`
       reduziert.
    2. **Faktoren** (Event-Typ, Gästezahl, Dauer, Indoor/Outdoor, Wochenende)
       werden zu einem Score 0–1 gemittelt und wirken als *Multiplikator*
       `1 - span/2 + span * score` auf die Basis — nicht mehr als Interpolation
       innerhalb der Artist-Spanne.
    3. Die so ermittelte Gage wird auf `[min_floor, base_max]` **begrenzt**.
       Damit übersteigt die Obergrenze nie das, was der Artist tatsächlich
       bekäme (SPEC-3, Kern).
    4. Ein einziger **±20 %-Spread** erzeugt die angezeigte Spanne; auch sie
       bleibt innerhalb der Artist-Spanne.
    5. Erst danach kommen Agenturgebühr (nur auf die Gage) und die festen
       Durchlaufposten Technik, Distanzzuschlag und Anfahrt dazu.

    `distances` sind die Einzelentfernungen der beteiligten Artists. Ist die
    Liste gesetzt, ersetzt sie `distance_km`: jede Anreise wird einzeln
    abgerechnet, statt eine Sammelentfernung mit der Personenzahl zu
    multiplizieren.

    `newsletter`, `show_discipline` und `tight_spread_pct` sind ohne Wirkung und
    bleiben nur erhalten, damit bestehende Aufrufer unverändert funktionieren.

    Rückgabe: `(min_total, max_total)` als ganze Euro.
    """
    PRIVATE_MIN_FACTOR = _env_float('PRIVATE_MIN_FACTOR', 0.6)
    # Wirkungsbreite der Faktoren: Multiplikator läuft von 0,8 bis 1,2.
    FACTOR_SPAN = _env_float('PRICE_FACTOR_SPAN', 0.4)
    # Breite der angezeigten Spanne um den berechneten Punktpreis.
    SPREAD_PCT = _env_float('PRICE_SPREAD_PCT', 0.20)

    base_min = float(base_min)
    base_max = float(base_max)
    if base_max < base_min:
        base_min, base_max = base_max, base_min

    # Untergrenze: Private Feiern dürfen unter die reguläre Mindestgage rutschen.
    min_floor = base_min * PRIVATE_MIN_FACTOR if event_type == 'Private Feier' else base_min
    min_floor = min(min_floor, base_max)

    # Personenzahl für die pro Kopf anfallende Anfahrt
    people = team_size_to_people(team_count if team_count is not None else team_size)

    # --- Faktor-Scores (jeweils 0–1) ---------------------------------------
    event_scores = {
        'Private Feier': 0.0,
        'Firmenfeier': 1.0,
        'Teamevent': 0.7,
        # 'Incentive' ist der Wert, den Formular und DB verwenden; fachlich das
        # gleiche wie 'Teamevent'. Ohne diesen Eintrag fiel er auf 0.5 zurück.
        'Incentive': 0.7,
        'Streetshow': 0.3,
    }
    event_s = event_scores.get(event_type, 0.5)

    try:
        guests = int(num_guests or 0)
    except (TypeError, ValueError):
        guests = 0
    if guests <= 200:
        guests_s = 0.0
    elif guests <= 500:
        guests_s = 0.5
    else:
        guests_s = 1.0

    try:
        duration_minutes = int(duration or 0)
    except (TypeError, ValueError):
        duration_minutes = 0
    duration_clamped = max(5, min(MAX_AUTOMATIC_DURATION_MINUTES, duration_minutes))
    duration_s = (duration_clamped - 5) / (MAX_AUTOMATIC_DURATION_MINUTES - 5)

    outdoor_s = 0.0 if is_indoor else 1.0
    weekend_s = 1.0 if is_weekend else 0.0

    score = (event_s + guests_s + duration_s + outdoor_s + weekend_s) / 5.0

    # --- Gage: Punktwert mal Faktor, begrenzt auf die Artist-Spanne --------
    basis = (min_floor + base_max) / 2.0
    gage = basis * (1 - FACTOR_SPAN / 2 + FACTOR_SPAN * score)

    def _clamp(value):
        return min(max(value, min_floor), base_max)

    gage = _clamp(gage)
    gage_min = _clamp(gage * (1 - SPREAD_PCT))
    gage_max = _clamp(gage * (1 + SPREAD_PCT))

    # --- Agenturgebühr auf die Gage, Zuschläge als Durchlaufposten ---------
    extras = dict(distance_km=distance_km, needs_light=needs_light,
                  needs_sound=needs_sound, event_address=event_address,
                  people=people, distances=distances)
    result = (client_price(gage_min, fee_pct, **extras),
              client_price(gage_max, fee_pct, **extras))

    # Nachvollziehbar machen, wie eine angezeigte Spanne zustande kam. Ohne das
    # bleibt bei einer Rueckfrage zum Preis nur Raten.
    logger.debug(
        "calculate_price: base=%s-%s, min_floor=%.0f, score=%.2f, gage=%.0f "
        "(%.0f-%.0f), fee=%s%%, people=%s, distance=%s => %s-%s",
        base_min, base_max, min_floor, score, gage, gage_min, gage_max,
        fee_pct, people, distances if distances is not None else distance_km,
        result[0], result[1],
    )
    return result
