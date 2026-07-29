# PepeBooking Backend

**PepeBooking** ist eine innovative Plattform zur Vermittlung von Show-Acts, Artisten und Performances.  
Dieses Repository enthält das **Backend** der PepeBooking App.

---

## Projektüberblick

Das Backend dient als zentrale Schnittstelle für:

- **Buchungsanfragen** (mit Preisempfehlung & Artist-Auswahl)
- **Künstlerverwaltung** (Artist-Profile, Gagen, Verfügbarkeiten)
- **Admin-Funktionen** (Angebotsmanagement, Kontroll-Dashboard)
- **Preisberechnung** (inkl. intelligenter Gewichtung & Spannen)
- **API für das React-Frontend** (in Entwicklung)

---

## API Dokumentation

Alle REST-Endpunkte sind ausführlich über **Swagger** dokumentiert.  
Einfach erreichbar unter:  
http://localhost:5000/api-docs/


---


### Wichtige Endpunkte

| Methode | Pfad                                     | Funktion                         |
| ------- | ---------------------------------------- | -------------------------------- |
| GET     | `/artists`                              | Liste aller Artists              |
| POST    | `/artists`                              | Künstler anlegen                 |
| DELETE  | `/artists/<artist_id>`                  | Künstler löschen (self-service)  |
| GET     | `/requests`                             | Buchungsanfragen (mit Empfehlung)|
| POST    | `/requests`                             | Neue Anfrage inkl. Preisspanne   |
| PUT     | `/requests/<req_id>/offer`              | Artist-Angebot für Anfrage       |
| GET     | `/requests/all`                         | Admin-Übersicht aller Anfragen   |
| GET/POST| `/requests/<req_id>/admin_offers`       | Admin-Angebote verwalten         |
| GET/POST| `/availability`                         | Verfügbarkeiten verwalten        |
| GET     | `/offers`                               | Übersicht aller Angebote         |
| POST    | `/offers`                               | Neues Angebot erstellen          |
| GET     | `/offers/<offer_id>`                    | Details zu einem Angebot         |
| PUT     | `/offers/<offer_id>`                    | Angebot aktualisieren            |
| DELETE  | `/offers/<offer_id>`                    | Angebot löschen                  |
| GET     | `/bookings`                             | Übersicht aller Buchungen        |
| POST    | `/bookings`                             | Neue Buchung erstellen           |
| GET     | `/bookings/<booking_id>`                | Details zu einer Buchung         |
| PUT     | `/bookings/<booking_id>`                | Buchung aktualisieren            |
| DELETE  | `/bookings/<booking_id>`                | Buchung löschen                  |

> Alle Details & Response-Formate findest du in Swagger.

---

## Frontend

Das **Frontend** wird aktuell als moderne Single Page App mit **React** entwickelt.  
Hier entstehen Schritt für Schritt Wizard, Artist-Login und das Admin-Dashboard.
Die Anwendung ist bereits in Production unter [pepeshows.de](https://pepeshows.de)

---

## Quickstart

1. **Backend lokal starten**  
   (z.B. mit Flask, Virtualenv oder Docker)

2. **Swagger aufrufen**  
   [http://localhost:5000/api-docs/](http://localhost:5000/api-docs/)

3. **API testen & Frontend entwickeln**

---

## Swagger / OpenAPI Hinweise

- Die API-Dokumentation basiert auf **Flasgger** und **Swagger-UI v3**.
- Spezifikation wird automatisch unter [`/apispec_1.json`](http://localhost:5000/apispec_1.json) bereitgestellt.
- Die UI ist unter [`/api-docs/`](http://localhost:5000/api-docs/) erreichbar.
- Root-Level nutzt `openapi: "3.0.3"`.

---

## Technologie-Stack

- **Python 3 / Flask**  
- **SQLAlchemy** (ORM)
- **Swagger / Flasgger** (API-Doku)
- **React** (Frontend) Repo unter https://github.com/build-with-chris/pepe-frontend-app

---

## Hinweis für Arbeitgeber

Dieses Backend ist als skalierbares, modulares Fundament für eine moderne Buchungsplattform konzipiert.  
Besonderer Fokus liegt auf:

- **Klarer API-Struktur**
- **Automatisierter Dokumentation**
- **Intelligenter Preisfindung**
- **Datensicherheit & Erweiterbarkeit**

Gerne beantworte ich Rückfragen zum Code, Deployment oder Produktvision!

---
## Authentifizierung (Clerk)

Es gibt genau **ein** Auth-System: Clerk. Das Backend verifiziert eingehende
Bearer-Tokens asymmetrisch (RS256) gegen die JWKS-Endpoint der aktiven
Clerk-Instanz. Es gibt kein Passwort-Login, kein geteiltes JWT-Secret und keine
Supabase-Auth mehr.

### Ablauf pro Request

1. `helpers.clerk_auth.authenticate_request()` verifiziert den Token **einmal**
   und legt `g.clerk_claims` / `g.clerk_user_id` ab.
2. `get_current_artist()` löst die Clerk-UID über `artists.supabase_user_id`
   (historischer Spaltenname, enthält die Clerk-UID) zur internen Artist-Zeile auf.
3. Alles, was eine Benutzer-ID persistiert (`approved_by`, `admin_offers.admin_id`),
   nutzt die **Integer**-`Artist.id` — niemals die Clerk-UID.

Decorator-Übersicht:

| Decorator | Bedeutung |
| --- | --- |
| `@clerk_auth_required` | gültiges Clerk-Token |
| `@artist_required` | zusätzlich: verknüpfte Artist-Zeile vorhanden |
| `@admin_required` | zusätzlich: `artists.is_admin = true` |

`/api/admin/*` ist zusätzlich global durch `_admin_gate_by_db` (before_request)
abgesichert. Das Gate und die Decorators teilen sich die Verifikation über `g`,
es wird also nie doppelt gegen JWKS geprüft.

### Admin-Rolle

`artists.is_admin` ist die einzige Quelle der Wahrheit. Es gibt kein Rollen-UI —
das Flag wird per SQL gesetzt:

```sql
UPDATE artists SET is_admin = true WHERE email = '<admin-mail>';
```

Die Clerk-Rolle in `public_metadata` ist rein informativ (Frontend-Anzeige).

### Erforderliche Umgebungsvariablen

| Variable | Zweck |
| --- | --- |
| `CLERK_JWKS_URL` | JWKS-Endpoint der aktiven Clerk-Instanz, z. B. `https://clerk.pepeshows.de/.well-known/jwks.json`. **Pflicht** — ohne diesen Wert schlägt jede Token-Verifikation fehl. Ein Instanzwechsel (Dev → Production) erfordert damit keine Codeänderung. |
| `DATABASE_URL` | Postgres-Verbindung (leer ⇒ lokales SQLite) |
| `SECRET_KEY` | nur Flask-interne Signierung, **nicht** für Auth |
| `CORS_ORIGINS` | Komma-separierte erlaubte Origins (Wildcards erlaubt) |

### Clerk JWT-Template

Das Frontend fordert den Token **mit Template** an
(`getToken({ template: … })`, konfigurierbar über `VITE_CLERK_JWT_TEMPLATE`,
Default `pepe-backend`). Nur ein Template-Token enthält die Claims, die das
Backend beim ersten Login braucht:

```json
{
  "email": "{{user.primary_email_address}}",
  "name": "{{user.full_name}}",
  "public_metadata": "{{user.public_metadata}}"
}
```

Fehlt der `email`-Claim, legt das Backend **keinen** Artist-Datensatz an und
antwortet mit `400 invalid_token`. Platzhalter-Adressen (`@clerk.placeholder`)
gibt es bewusst nicht mehr — ein Datensatz ohne echte E-Mail ist wertlos und
blockiert die Unique-Constraint.

Template vor dem Rollout prüfen (Browser-Konsole der eingeloggten App):

```js
await window.Clerk.session.getToken({ template: 'pepe-backend' })
```

Den Token auf jwt.io dekodieren und `email` sowie `name` verifizieren.

## Bekannte Einschränkungen

- **Rate-Limiting und Idempotency laufen im Prozessspeicher**
  (`routes/request_routes.py`). Bei mehreren Gunicorn-Workern oder mehreren
  Instanzen zählt jeder Worker eigenständig — das Limit von 5 Anfragen/Stunde
  pro IP wirkt real also pro Worker. Ebenso wird ein `Idempotency-Key` nur vom
  Worker erkannt, der die erste Anfrage bearbeitet hat. Für eine belastbare
  Lösung wäre ein gemeinsamer Store (Redis) nötig; das ist bewusst zurückgestellt.
- `artists.supabase_user_id` enthält die **Clerk**-UID. Die Umbenennung wurde
  bewusst verschoben (berührt Migrationen und Queries an vielen Stellen).

## Tests

```bash
cd backend
python -m venv .venv && .venv/bin/pip install -r requirements.txt pytest
.venv/bin/python -m pytest
```

Die Tests erzeugen echte RS256-Tokens mit einem lokalen Schlüsselpaar; nur der
JWKS-Netzabruf ist gemockt (`tests/conftest.py`). Damit läuft derselbe
Verifikationspfad wie in Produktion.

> **Python-Version:** Produktion läuft auf Python 3.10 (siehe `runtime.txt`);
> lokal reicht jedes 3.10+. Die macOS-System-Python 3.9 reicht **nicht** — ihr
> fehlt `hashlib.scrypt` (LibreSSL statt OpenSSL), das Werkzeug für
> Passwort-Hashes benutzt. Unter macOS z. B. `brew install python@3.11` und das
> venv damit anlegen.

Zwei Fallstricke, die in der Testsuite bereits gelöst sind und beim Erweitern
beachtet werden müssen (`tests/conftest.py`):

- **Engine neu binden.** Flask-SQLAlchemy 3.x legt die Engines schon in
  `init_app()` an — das passiert beim Import von `app.py` mit der
  Produktionskonfiguration. Ohne ein zweites `init_app()` schreiben die Tests in
  `instance/pepe.db` statt in die temporäre Test-DB.
- **`g` pro Request leeren.** Die Tests halten einen App-Context offen; Flask
  legt dann pro Request *keinen* neuen an. Ohne den `_reset_auth_cache`-Hook
  würden die verifizierten Clerk-Claims eines Requests im nächsten weitergelten
  und dessen Token überstimmen.
