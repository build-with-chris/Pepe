"""SMTP-Rauchtest: verschickt genau eine Mail an eine Adresse deiner Wahl.

Die riskanteste Annahme von SPEC-2 ist, dass der SMTP-Versand überhaupt
funktioniert — bisher gingen alle Artist-Mails an Platzhalter-Adressen. Dieses
Skript beantwortet das in zwei Minuten, bevor irgendetwas anderes getestet wird.

    python -m scripts.send_test_email deine.adresse@example.com

Exit-Code 0 = zugestellt (laut SMTP-Server), 1 = nicht versendet.
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app  # noqa: E402
from helpers.emails import build_artist_approved_email, send_email  # noqa: E402


class _FakeArtist:
    name = "Test-Artist"


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    recipient = sys.argv[1]

    with app.app_context():
        missing = [k for k in ('SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD') if not app.config.get(k)]
        if missing:
            print(f"FEHLT in der Konfiguration: {', '.join(missing)}")
            return 1

        print(f"Sende über {app.config['SMTP_HOST']}:{app.config.get('SMTP_PORT')} "
              f"als {app.config.get('SMTP_FROM')} an {recipient} …")
        ok = send_email(
            recipient,
            '[Test] Pepe Shows – SMTP-Rauchtest',
            build_artist_approved_email(_FakeArtist()),
        )

    print('OK – Mail wurde übergeben. Jetzt Postfach UND Spam-Ordner prüfen.'
          if ok else 'FEHLGESCHLAGEN – siehe Log oben.')
    return 0 if ok else 1


if __name__ == '__main__':
    raise SystemExit(main())
