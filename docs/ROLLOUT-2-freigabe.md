# Rollout SPEC-2 (Freigabe-Workflow + Entfernungsberechnung)

Der Code-Anteil der Spec ist umgesetzt. Was hier steht, sind die Schritte, die
SMTP-Zugangsdaten, die Produktions-DB oder ein echtes Postfach brauchen und
deshalb nicht aus dem Repo heraus erledigt werden können.

Reihenfolge einhalten — Schritt 1 ist die riskanteste Annahme der Spec. Wenn er
scheitert, fällt Akzeptanzkriterium 3, und alles Weitere daran zu hängen wäre
verschwendete Zeit.

---

## 1. SMTP verifizieren (AK 3, blockiert alles Weitere)

Bisher gingen alle Artist-Mails an `@clerk.placeholder`-Adressen — es kann also
niemand wissen, ob `send_email` je zugestellt hat. Erst prüfen, dann bauen:

```bash
cd backend && ./.venv/bin/python -m scripts.send_test_email deine.echte@adresse.de
```

Nötige Env-Variablen: `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`,
`SMTP_PASSWORD`, `SMTP_FROM`, `APP_URL`.

- **Kommt keine Mail an:** zuerst das Log des Skripts lesen (Login abgelehnt?
  falscher Port? TLS?). Ohne funktionierenden Versand ist AK 3 nicht erfüllbar.
- **Mail landet im Spam:** SPF- und DKIM-Eintrag für die Absenderdomain setzen.
  Das ist kein Schönheitsfehler — formal gilt AK 3 dann als erfüllt, hilft aber
  niemandem (siehe „Offene Punkte" der Spec).

## 2. Admin-Flag in der Produktions-DB setzen (AK 4)

Rollenverwaltung im UI ist ein ausdrückliches Nicht-Ziel — der eine Admin wird
per SQL geflaggt. `artists.is_admin` ist die einzige Quelle für Admin-Rechte,
Clerk-`publicMetadata` wird weder im Backend noch im Frontend noch gelesen.

```sql
UPDATE artists SET is_admin = true WHERE email = '<admin-adresse>';
```

Gegenprobe: mit diesem Account einloggen → der Link „Admin" erscheint in der
Navigation, `/admin/kuenstler` lädt die Artist-Liste (kein Redirect auf
`/profile`, kein 403).

## 3. Nominatim-Nutzungsbedingungen (AK 5 + 6)

Geocoding läuft über OpenStreetMap Nominatim, limitiert auf **1 Request/Sekunde**
(prozessweit serialisiert in `services/geo.py`). Zwei Punkte für Produktion:

- `GEO_USER_AGENT` auf eine echte Kontaktadresse setzen — anonyme Requests
  werden von Nominatim geblockt.
- Koordinaten werden beim Speichern der Adresse einmal ermittelt und am Artist
  gespeichert. Pro Buchungsanfrage fällt dadurch nur noch **ein** Aufruf an
  (die Event-Adresse). Ein Nominatim-Ausfall macht `distance_km = 0`, blockiert
  aber weder Profil-Update noch Anfrage.

Bestandsadressen nachzugeocodieren ist ein Nicht-Ziel der Spec (die DB ist
praktisch leer). Falls doch nötig, existiert `scripts/backfill_geo.py`.

---

## End-to-End-Prüfung (aus der Spec)

1. Mit einem zweiten Clerk-Account (echte, eigene E-Mail) registrieren.
2. Profil vollständig ausfüllen **inklusive Adresse**, zur Prüfung einreichen.
3. `SELECT lat, lon FROM artists WHERE email = '<zweite Adresse>';` → beide gefüllt.
4. Als Admin `/admin/kuenstler` öffnen → der Artist erscheint unter `pending`.
5. „Ablehnen" → Grund „Bitte bessere Fotos" → Mail mit genau diesem Grund kommt
   an; der Artist sieht ihn im Profil-Banner.
6. Erneut einreichen, diesmal freigeben → Freigabe-Mail kommt an.
7. Als dieser Artist `GET /api/requests/requests` → **200** statt 403.
8. Über den BookingWizard eine Anfrage mit weit entfernter Adresse anlegen →
   `SELECT distance_km FROM booking_requests ORDER BY id DESC LIMIT 1;` →
   plausibler Wert, nicht 0.

Das Admin-UI meldet nach jeder Entscheidung, ob die Mail rausging — der
Response enthält `email_sent`. Steht dort „keine E-Mail versendet", ist entweder
die SMTP-Konfiguration kaputt oder die Adresse ein Platzhalter.

---

## Bekanntes Problem (nicht Teil dieser Spec)

`backend/tests/integration` ist **flaky**: In etwa jedem vierten Lauf schlagen
Tests mit `ADMIN_GATE: FORBIDDEN … artist_found=False` fehl, obwohl die Fixture
den Admin angelegt hat. Reproduzierbar auch ohne die in SPEC-2 ergänzten Tests.
Ursache liegt im Session-/Savepoint-Handling von `tests/conftest.py` (die
Test-Session wird nicht zuverlässig an die Verbindung gebunden, auf der die
Tabellen liegen), nicht im Anwendungscode. Sollte vor dem nächsten Feature
geradegezogen werden — solange gilt: bei Fehlschlägen den Lauf wiederholen.
