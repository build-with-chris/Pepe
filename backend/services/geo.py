

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


__all__ = ["geocode_address", "haversine_km", "clear_geocode_cache"]