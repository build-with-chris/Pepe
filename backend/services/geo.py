

"""Geolocation helpers (geocoding + distance) for PepeBooking.

Usage:
    from services.geo import geocode_address, haversine_km

Notes:
- Uses OpenStreetMap Nominatim for geocoding ("search" endpoint).
- Provide a proper User-Agent via Flask config GEO_USER_AGENT to respect the API policy.
- Returns (lat, lon) as floats or None if not found.
"""
from __future__ import annotations

import math
import re
import threading
import time
from collections import OrderedDict
from typing import Optional, Tuple

import requests
from flask import current_app

# Nominatim erlaubt maximal 1 Request/Sekunde. Der Lock serialisiert die
# Aufrufe prozessweit; bei mehreren Workern greift zusätzlich deren Trennung.
_NOMINATIM_MIN_INTERVAL = 1.0
_throttle_lock = threading.Lock()
_last_request_ts = 0.0

# Ergebnis-Cache. Adressen wiederholen sich stark (dieselbe Event-Adresse beim
# zweiten Anlauf, derselbe Artist in mehreren Anfragen). Jeder Treffer spart
# eine Sekunde Wartezeit im Request-Pfad und einen Aufruf gegen ein Limit, das
# wir nicht kontrollieren. Auch Fehlschläge werden gemerkt, sonst rennt jeder
# Retry erneut ins Leere.
_GEOCODE_CACHE_MAX = 512
_GEOCODE_CACHE_TTL = 24 * 3600
_geocode_cache: "OrderedDict[str, Tuple[float, Optional[Tuple[float, float]]]]" = OrderedDict()
_cache_lock = threading.Lock()


def _cache_key(address: str) -> str:
    return " ".join(address.lower().split())


def _cache_get(key: str):
    """(hit, value) — `hit=False` heißt: nicht im Cache, `value` ist dann None."""
    with _cache_lock:
        entry = _geocode_cache.get(key)
        if not entry:
            return False, None
        stored_at, value = entry
        if time.monotonic() - stored_at > _GEOCODE_CACHE_TTL:
            _geocode_cache.pop(key, None)
            return False, None
        _geocode_cache.move_to_end(key)
        return True, value


def _cache_put(key: str, value) -> None:
    with _cache_lock:
        _geocode_cache[key] = (time.monotonic(), value)
        _geocode_cache.move_to_end(key)
        while len(_geocode_cache) > _GEOCODE_CACHE_MAX:
            _geocode_cache.popitem(last=False)


def clear_geocode_cache() -> None:
    """Cache leeren — für Tests und für einen erzwungenen Neuabgleich."""
    with _cache_lock:
        _geocode_cache.clear()


def _throttle() -> None:
    """Blockiert, bis seit dem letzten Nominatim-Aufruf 1 Sekunde vergangen ist."""
    global _last_request_ts
    with _throttle_lock:
        wait = _NOMINATIM_MIN_INTERVAL - (time.monotonic() - _last_request_ts)
        if wait > 0:
            time.sleep(wait)
        _last_request_ts = time.monotonic()


def _user_agent() -> str:
    """Return a polite User-Agent for Nominatim requests."""
    # Allow override via Flask config; otherwise use a sensible default.
    ua = current_app.config.get(
        "GEO_USER_AGENT",
        "PepeBooking/1.0 (+mailto:info@pepeshows.de)",
    )
    return ua


def geocode_address(address: str, *, timeout: float = 8.0) -> Optional[Tuple[float, float]]:
    """Geocode a free-form address to (lat, lon) using Nominatim.

    Returns None if the address is empty, not found, or the request fails.
    """
    if not address:
        return None

    key = _cache_key(address)
    hit, cached = _cache_get(key)
    if hit:
        return cached

    try:
        _throttle()
        resp = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": address,
                "format": "json",
                "limit": 1,
                "addressdetails": 0,
            },
            headers={"User-Agent": _user_agent()},
            timeout=timeout,
        )
        resp.raise_for_status()
        data = resp.json()
        if not data:
            current_app.logger.info(f"Geocode not found: {address}")
            _cache_put(key, None)
            return None
        lat = float(data[0]["lat"])  # type: ignore[index]
        lon = float(data[0]["lon"])  # type: ignore[index]
        _cache_put(key, (lat, lon))
        return (lat, lon)
    except Exception as e:
        # Netz- oder Parsefehler bewusst NICHT cachen: ein kurzer Nominatim-
        # Ausfall würde die Adresse sonst stundenlang als unauflösbar festhalten.
        current_app.logger.warning(f"Geocode failed for '{address}': {e}")
        return None


# --- Adresssuche mit Rückfallstufen ----------------------------------------
#
# Eine Adresse aus einem Formular ist selten fehlerfrei. Ein vertippter
# Straßenname reicht, und Nominatim findet gar nichts — dann fehlt die
# Entfernung, und der Kunde sieht einen Preis ohne Anfahrt, ohne dass jemand
# etwas davon merkt. Genau so lag "Kiebtzweg 12a, 85464 Finsing" im Bestand:
# ein fehlendes "i" im Straßennamen.
#
# Deshalb wird von genau nach grob gesucht. Für eine Anfahrtsberechnung ist der
# Ortsmittelpunkt völlig ausreichend; ein paar hundert Meter fallen bei einer
# Fahrt über Dutzende Kilometer nicht ins Gewicht. Wichtig ist nur, dass die
# Ungenauigkeit benannt wird und nicht als exakter Treffer durchgeht.

# Genauigkeitsstufen, absteigend. Der Wert wird am Artist gespeichert.
GEO_PRECISION_EXACT = "exact"    # Adresse wie eingegeben gefunden
GEO_PRECISION_STREET = "street"  # Straße ohne Hausnummer
GEO_PRECISION_POSTAL = "postal"  # Postleitzahl und Ort
GEO_PRECISION_CITY = "city"      # nur der Ort

_COUNTRY_SUFFIXES = {
    "deutschland", "germany", "de",
    "österreich", "oesterreich", "austria", "at",
    "schweiz", "switzerland", "ch",
}

_POSTAL_CITY = re.compile(r"^(\d{4,5})\s+(.+)$")


def _split_address(address: str):
    """Zerlegt eine Adresse in (Glieder ohne Land, Land oder None)."""
    parts = [p.strip() for p in str(address).split(",") if p.strip()]
    country = None
    while parts and parts[-1].lower() in _COUNTRY_SUFFIXES:
        country = parts.pop()
    return parts, country


def _looks_like_a_place(value: str) -> bool:
    """Grober Plausibilitätstest für einen Ortsnamen.

    Ohne diesen Test wird die Stufensuche zu gutmütig: Zur Eingabe
    "ewergreg, 65456 4565445" fiel sie auf den "Ort" 4565445 zurück, und
    Nominatim antwortete mit einer Koordinate mitten in München. Eine
    offensichtlich unsinnige Adresse soll ohne Koordinate bleiben, statt eine
    plausibel aussehende zu erfinden.
    """
    value = (value or "").strip()
    return len(value) >= 2 and any(ch.isalpha() for ch in value)


def _without_house_number(street: str) -> str:
    """'Kiebitzweg 12a' -> 'Kiebitzweg'. Gibt '' zurück, wenn nichts übrig bleibt."""
    tokens = street.split()
    while tokens and any(ch.isdigit() for ch in tokens[-1]):
        tokens.pop()
    return " ".join(tokens)


def address_variants(address: str) -> list:
    """[(Suchtext, Genauigkeit), …] von genau nach grob, ohne Doppelte.

    Erwartet das übliche Format "Straße Hausnr, PLZ Ort, Land". Weicht eine
    Adresse davon ab, fallen die nicht ermittelbaren Stufen einfach weg.
    """
    address = (address or "").strip()
    if not address:
        return []

    parts, country = _split_address(address)
    tail = f", {country}" if country else ""

    postal = city = None
    for p in parts:
        m = _POSTAL_CITY.match(p)
        if m:
            postal, city = m.group(1), m.group(2).strip()
            break
    # Kein "PLZ Ort"-Glied? Dann ist das letzte Glied nach der Straße der Ort.
    if city is None and len(parts) > 1:
        city = parts[-1]

    variants = [(address, GEO_PRECISION_EXACT)]

    if parts:
        street = _without_house_number(parts[0])
        if street and street != parts[0]:
            rest = "".join(f", {p}" for p in parts[1:])
            variants.append((f"{street}{rest}{tail}", GEO_PRECISION_STREET))

    if city and _looks_like_a_place(city):
        if postal:
            variants.append((f"{postal} {city}{tail}", GEO_PRECISION_POSTAL))
        variants.append((f"{city}{tail}", GEO_PRECISION_CITY))

    seen = set()
    unique = []
    for query, precision in variants:
        key = _cache_key(query)
        if key in seen:
            continue
        seen.add(key)
        unique.append((query, precision))
    return unique


def geocode_address_cascade(address: str, *, timeout: float = 8.0):
    """Sucht eine Adresse in Stufen und meldet mit, wie genau der Treffer war.

    Rückgabe `((lat, lon), Genauigkeit)` oder `(None, None)`, wenn keine Stufe
    etwas findet. `Genauigkeit` ist eine der GEO_PRECISION_*-Konstanten.
    """
    for query, precision in address_variants(address):
        coord = geocode_address(query, timeout=timeout)
        if coord:
            if precision != GEO_PRECISION_EXACT:
                current_app.logger.info(
                    "Geocode: %r nicht gefunden, benutze %r (Genauigkeit %s)",
                    address, query, precision,
                )
            return coord, precision
    current_app.logger.warning("Geocode: keine Stufe fuehrte zu einem Treffer fuer %r", address)
    return None, None


def haversine_km(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    """Great-circle distance between two (lat, lon) points in kilometers."""
    lat1, lon1 = a
    lat2, lon2 = b
    R = 6371.0  # km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    s = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return 2 * R * math.atan2(math.sqrt(s), math.sqrt(1 - s))


__all__ = [
    "geocode_address",
    "geocode_address_cascade",
    "address_variants",
    "haversine_km",
    "clear_geocode_cache",
    "GEO_PRECISION_EXACT",
    "GEO_PRECISION_STREET",
    "GEO_PRECISION_POSTAL",
    "GEO_PRECISION_CITY",
]