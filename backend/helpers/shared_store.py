"""Kleiner Schlüssel-Wert-Speicher mit Ablaufzeit, geteilt über Instanzen.

Warum es das braucht: Rate-Limit und Idempotency-Cache der Anfrage-Route lagen
im Prozessspeicher. Auf einem dauerhaft laufenden Server mit einer Instanz
funktioniert das. Serverless (Vercel) ist jeder Aufruf potenziell eine neue
Instanz — dann greift das Limit von 5 Anfragen pro Stunde nicht mehr, und ein
Idempotency-Key verhindert keine Doppelbuchung beim Neuladen. Beides fällt
niemandem auf, es hört einfach auf zu schützen.

Backend ist Upstash Redis über die REST-Schnittstelle: kein zusätzliches Paket
(`requests` ist bereits Abhängigkeit) und keine offene TCP-Verbindung, die zu
einer kurzlebigen Funktion schlecht passt.

Ohne konfigurierte Zugangsdaten fällt das Modul auf einen prozesslokalen Speicher
zurück. Damit bleibt die lokale Entwicklung unverändert, und ein Ausfall von
Upstash macht die Anfrage-Route nicht kaputt — sie schützt dann nur schlechter.
"""

from __future__ import annotations

import json
import os
import threading
import time
from collections import OrderedDict
from typing import Any, Optional

import requests

# Von Upstash bereitgestellt (Vercel-Integration setzt beide Variablen selbst).
_REST_URL = (os.getenv("UPSTASH_REDIS_REST_URL") or os.getenv("KV_REST_API_URL") or "").rstrip("/")
_REST_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN") or os.getenv("KV_REST_API_TOKEN") or ""

_HTTP_TIMEOUT = 3.0

_MEMORY_MAX_ENTRIES = 5_000
_memory: "OrderedDict[str, tuple[float, Any]]" = OrderedDict()
_memory_lock = threading.Lock()


def is_shared() -> bool:
    """True, wenn ein instanzübergreifender Speicher konfiguriert ist."""
    return bool(_REST_URL and _REST_TOKEN)


def backend_name() -> str:
    return "upstash-redis" if is_shared() else "in-process"


# --- prozesslokaler Rückfall ------------------------------------------------

def _memory_prune(now: float) -> None:
    for key in [k for k, (expires, _) in _memory.items() if expires <= now]:
        _memory.pop(key, None)
    while len(_memory) > _MEMORY_MAX_ENTRIES:
        _memory.popitem(last=False)


def _memory_get(key: str):
    with _memory_lock:
        now = time.time()
        _memory_prune(now)
        entry = _memory.get(key)
        if not entry:
            return None
        _memory.move_to_end(key)
        return entry[1]


def _memory_set(key: str, value: Any, ttl_seconds: int) -> None:
    with _memory_lock:
        now = time.time()
        _memory_prune(now)
        _memory[key] = (now + ttl_seconds, value)
        _memory.move_to_end(key)
        while len(_memory) > _MEMORY_MAX_ENTRIES:
            _memory.popitem(last=False)


def _memory_incr(key: str, ttl_seconds: int) -> int:
    with _memory_lock:
        now = time.time()
        _memory_prune(now)
        entry = _memory.get(key)
        if entry:
            count = int(entry[1]) + 1
            _memory[key] = (entry[0], count)  # Ablaufzeit des ersten Treffers behalten
        else:
            count = 1
            _memory[key] = (now + ttl_seconds, count)
        _memory.move_to_end(key)
        return count


# --- Upstash über REST ------------------------------------------------------

def _rest(*command: str):
    """Ein Redis-Kommando über die REST-Schnittstelle. Wirft bei Problemen."""
    resp = requests.post(
        f"{_REST_URL}/{'/'.join(requests.utils.quote(str(c), safe='') for c in command)}",
        headers={"Authorization": f"Bearer {_REST_TOKEN}"},
        timeout=_HTTP_TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json().get("result")


def _log_fallback(action: str, exc: Exception) -> None:
    try:
        from flask import current_app
        current_app.logger.warning(
            "shared_store: %s ueber Upstash fehlgeschlagen, nutze Prozessspeicher: %s",
            action, exc,
        )
    except Exception:
        pass


def get_json(key: str) -> Optional[Any]:
    """Wert lesen. None, wenn nicht vorhanden oder abgelaufen."""
    if is_shared():
        try:
            raw = _rest("GET", key)
            return json.loads(raw) if isinstance(raw, str) else None
        except Exception as e:
            _log_fallback("GET", e)
    return _memory_get(key)


def set_json(key: str, value: Any, ttl_seconds: int) -> None:
    """Wert mit Ablaufzeit schreiben."""
    if is_shared():
        try:
            _rest("SET", key, json.dumps(value), "EX", str(int(ttl_seconds)))
            return
        except Exception as e:
            _log_fallback("SET", e)
    _memory_set(key, value, ttl_seconds)


def incr_with_ttl(key: str, ttl_seconds: int) -> int:
    """Zähler erhöhen und die Ablaufzeit beim ersten Treffer setzen.

    Rückgabe: der Zählerstand nach dem Erhöhen. Die Ablaufzeit wird bewusst nur
    beim ersten Treffer gesetzt, damit das Zeitfenster fest bleibt und nicht bei
    jeder Anfrage nach vorn rutscht.
    """
    if is_shared():
        try:
            count = int(_rest("INCR", key))
            if count == 1:
                _rest("EXPIRE", key, str(int(ttl_seconds)))
            return count
        except Exception as e:
            _log_fallback("INCR", e)
    return _memory_incr(key, ttl_seconds)


def reset_for_tests() -> None:
    """Prozessspeicher leeren. Nur für Tests."""
    with _memory_lock:
        _memory.clear()


__all__ = [
    "is_shared",
    "backend_name",
    "get_json",
    "set_json",
    "incr_with_ttl",
    "reset_for_tests",
]
