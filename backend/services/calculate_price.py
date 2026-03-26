from __future__ import annotations

import os
import logging

logger = logging.getLogger(__name__)


def calculate_price(base_min, base_max,
                    distance_km, fee_pct, newsletter=False,
                    event_type='Private Feier', num_guests=0, show_discipline=False,
                    is_weekend=False, is_indoor=True,
                    needs_light=False, needs_sound=False,
                    team_size='solo',
                    duration=0, event_address=None, team_count=None,
                    tight_spread_pct: float | None = None):
    """
    Berechnet den Preis durch Interpolation innerhalb einer Spanne [min_floor, base_max]
    unter Verwendung von Faktor-Scores.

    - min_floor ist base_min * PRIVATE_MIN_FACTOR (default 0.6) für 'Private Feier',
      sonst base_min.  This means the price CAN go below the artist's base gage for
      simple private events — this is intentional.
    - Faktoren (Event, Gäste, Dauer, Indoor/Outdoor, Wochenende) werden als Scores 0–1
      bestimmt und gemittelt.
    - Der Basispreis wird interpoliert: base_price = min_floor + score * (base_max - min_floor).
    - Agenturgebühr multiplicativ + feste Zuschläge (Technik, Distanz, Reise).
    - Rückgabe: Tupel (int(min_total), int(max_total)) mit ±20% Spread.

    Returns:
        tuple[int, int]: (price_min, price_max)
    """
    # Get PRIVATE_MIN_FACTOR from env or default 0.6
    try:
        PRIVATE_MIN_FACTOR = float(os.getenv('PRIVATE_MIN_FACTOR', '0.6'))
    except Exception:
        PRIVATE_MIN_FACTOR = 0.6

    # Normalize artist base range
    try:
        base_min = float(base_min)
        base_max = float(base_max)
    except Exception:
        base_min = float(base_min or 0)
        base_max = float(base_max or 0)

    if base_max < base_min:
        base_max = base_min

    # Determine min_floor based on Private Feier special rule
    if event_type == 'Private Feier':
        min_floor = base_min * PRIVATE_MIN_FACTOR
    else:
        min_floor = base_min

    # Clamp min_floor and base_max to valid range
    if min_floor > base_max:
        min_floor = base_max

    # Derive effective team count (number of artists) for per-person costs
    people = 1
    if team_count is not None:
        try:
            people = max(1, int(team_count))
        except Exception:
            people = 1
    else:
        try:
            if isinstance(team_size, (int, float)):
                people = max(1, int(team_size))
            else:
                ts = str(team_size).strip().lower()
                if ts in ('duo', '2'):
                    people = 2
                elif ts in ('trio', '3'):
                    people = 3
                elif ts in ('quartet', '4'):
                    people = 4
                else:
                    people = 1
        except Exception:
            people = 1

    # --- Factor scores (0–1) ---

    # Event type score
    event_scores = {
        'Private Feier': 0.0,
        'Firmenfeier': 1.0,
        'Teamevent': 0.7,
        'Streetshow': 0.3
    }
    event_s = event_scores.get(event_type, 0.5)

    # Guests score
    if num_guests <= 200:
        guests_s = 0.0
    elif num_guests <= 500:
        guests_s = 0.5
    else:
        guests_s = 1.0

    # Duration score: linear from 5 min (0) to 45 min (1), clamp duration to [5,45]
    duration_clamped = max(5, min(45, duration))
    duration_s = (duration_clamped - 5) / (45 - 5)

    # Indoor/Outdoor score
    outdoor_s = 0.0 if is_indoor else 1.0

    # Weekend score
    weekend_s = 1.0 if is_weekend else 0.0

    # Average score
    score = (event_s + guests_s + duration_s + outdoor_s + weekend_s) / 5.0

    # Interpolate base price within [min_floor, base_max]
    base_price = min_floor + score * (base_max - min_floor)

    # --- Fixed add-on fees ---

    # Tech fees
    tech_fee = 0
    if needs_light:
        tech_fee += 450
    if needs_sound:
        tech_fee += 450

    # Distance surcharges
    surcharge = 0
    city = None
    if event_address:
        raw_city = event_address.split(',')[-1].strip()
        city = raw_city.split()[-1].lower()
    if distance_km >= 600:
        surcharge += 300
    elif distance_km >= 300:
        surcharge += 200
    if city in ['münchen', 'muenchen', 'munich']:
        surcharge -= 100

    # Travel fee (per artist)
    rate_per_km = float(os.getenv("RATE_PER_KM", 0.5))
    travel_fee_single = distance_km * rate_per_km
    travel_fee = travel_fee_single * max(1, people)

    # --- Build total ---

    # Agency fee (percentage on top of base price)
    total = base_price * (1 + fee_pct / 100)

    # Add fixed fees on top
    total += tech_fee + surcharge + travel_fee

    # Final display range ±20%
    spread_pct = 0.20
    min_total = total * (1 - spread_pct)
    max_total = total * (1 + spread_pct)

    logger.debug(
        "calculate_price: base=%s-%s, min_floor=%.0f, score=%.2f, base_price=%.0f, "
        "fee=%.0f%%, travel=%.0f, tech=%d, surcharge=%d => total=%.0f, range=%d-%d",
        base_min, base_max, min_floor, score, base_price, fee_pct,
        travel_fee, tech_fee, surcharge, total, int(min_total), int(max_total)
    )

    return int(min_total), int(max_total)
