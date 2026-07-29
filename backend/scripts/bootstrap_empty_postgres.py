#!/usr/bin/env python3
"""
Leere Postgres-DB (z. B. neues Supabase): Tabellen aus SQLAlchemy-Modellen anlegen
und Alembic auf den aktuellen Merge-Head setzen — ohne die historischen
Migrationen auszuführen (die bei leerer DB fehlschlagen, weil es keine
„Initial create tables“-Revision gibt).

Voraussetzungen:
  - backend/.env mit DATABASE_URL auf die Ziel-DB
  - Schema public: keine Namenskollision mit bestehenden Tabellen der App
    (fremde Tabellen wie shared_cards werden nicht gelöscht)

Usage (im backend-Ordner):
  .venv/bin/python scripts/bootstrap_empty_postgres.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

_backend = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_backend))

# Merge-Head muss mit migrations/versions/8f4c2b9e1a0d_merge_*.py übereinstimmen
ALEMBIC_HEAD = '8f4c2b9e1a0d'


def main() -> None:
    os.chdir(_backend)
    from app import app  # noqa: E402
    from models import db  # noqa: E402
    from flask_migrate import stamp  # noqa: E402

    with app.app_context():
        db.create_all()
        stamp(revision=ALEMBIC_HEAD)
    print('OK: create_all() ausgeführt und Alembic auf', ALEMBIC_HEAD, 'gesetzt.')


if __name__ == '__main__':
    main()
