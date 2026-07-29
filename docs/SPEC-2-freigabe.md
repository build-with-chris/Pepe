# SPEC: Admin-Freigabe-Workflow und Entfernungsberechnung

Ersetzt F3 + F9 aus `docs/BACKLOG-ANALYSE.md`. **Setzt SPEC-1 voraus.**

## Kern

Du kannst einen wartenden Artist im Admin-Bereich freigeben oder mit Begründung ablehnen, und der
Artist erfährt es per E-Mail. Parallel werden Artist-Koordinaten endlich gespeichert, sodass
`distance_km` serverseitig real berechnet wird. Woran man es merkt: Ein Artist auf `pending` ist nach
zwei Klicks `approved`, hat eine Mail im Postfach und erreicht `/api/requests/requests` ohne 403.

## Nicht-Ziele

- **Keine Rollenverwaltung im UI.** Ein Admin, per SQL geflaggt.
- **Kein Nachgeocodieren von Bestandsadressen.** Die DB ist praktisch leer — es gibt nichts nachzutragen.
- **Kein Pending-Badge / Zähler in der Navigation.** Naheliegend, aber nicht nötig: Bei einer Handvoll
  Artists sieht man die Liste ohnehin. Fällt weg, weil „dann ist es halt unschöner".
- **Keine Bulk-Aktionen** (mehrere Artists gleichzeitig freigeben). Bei dieser Menge sinnlos.
- **Kein E-Mail-Template-System.** Die bestehenden HTML-Builder in `request_routes.py` werden kopiert,
  nicht abstrahiert.
- **Keine Umstellung der Availability-Anlage auf Bulk-Insert.** Reine Performance, betrifft niemanden
  bei einem Artist pro Woche.

## Betroffene Dateien und Schnittstellen

| Pfad | Änderung |
|---|---|
| `frontend/src/pages/Artists.tsx` | Fehlendes `/api`-Präfix in **vier** Fetch-Aufrufen (Z. 110, 166, 226, 257); Reject-Button + Dialog für den Ablehnungsgrund |
| `backend/routes/admin_routes.py` | `approve_artist` / `reject_artist`: E-Mail an den Artist auslösen |
| `backend/routes/request_routes.py` | `send_email` und die HTML-Builder für die Wiederverwendung zugänglich machen (ggf. nach `backend/helpers/` verschieben) |
| `backend/managers/artist_manager.py` | `_geocode_and_set`: schreibt auf `latitude`/`longitude`, muss auf `lat`/`lon` (Z. 53–56) |
| `backend/services/geo.py` | Bereits vollständig vorhanden und **ungenutzt** — nur anbinden, nichts neu schreiben |
| `backend/routes/request_routes.py` | `create_request`: `distance_km` serverseitig aus Event-Adresse + Artist-Koordinaten berechnen, statt den Client-Wert zu übernehmen |
| `frontend/src/context/AuthContext.tsx` | `is_admin` aus `/api/artists/me` (DB) statt aus Clerk `publicMetadata` |
| `frontend/src/components/ProtectedRoute.tsx` | Entsprechend anpassen |
| **Neu:** `backend/helpers/emails.py` | Falls die Builder ausgelagert werden |

## Akzeptanzkriterien

| # | Kriterium (prüfbar formuliert) | Aufwand |
|---|---|---|
| 1 | Die Artist-Liste im Admin-Bereich lädt Daten (kein 404 mehr); alle vier Aufrufe treffen `/api/admin/...`. | 0,5 h |
| 2 | Ein Klick auf „Ablehnen" öffnet einen Dialog, speichert den Grund und setzt `approval_status='rejected'`; der Grund erscheint im `ProfileStatusBanner` des Artists. | 2–3 h |
| 3 | Bei `approve` **und** `reject` geht eine E-Mail an die echte Artist-Adresse; bei Ablehnung enthält sie den Grund. | 2 h |
| 4 | `is_admin` stammt ausschließlich aus der DB. Ein Nutzer ohne Clerk-`publicMetadata`, aber mit `artists.is_admin = true`, erreicht `/admin`. | 1–2 h |
| 5 | Nach dem Speichern einer Artist-Adresse sind `lat` und `lon` in der DB gefüllt (nicht `NULL`). | 0,5 h |
| 6 | Eine Anfrage mit Event-Adresse in Hamburg und einem Artist in München ergibt `distance_km` ≈ 600 (±10 %), unabhängig davon, was der Client sendet. | 2–3 h |

**Summe: 8–11 h** — Referenzklasse: SPEC-1 (12–17 h). Diese Spec ist spürbar kleiner, weil
`services/geo.py` bereits fertig existiert und nur verdrahtet werden muss, und weil das
Freigabe-Backend funktional schon vollständig ist — es fehlten nur der `/api`-Präfix und die Mails.

**Drumherum:** SMTP-Konfiguration verifizieren (die Mails wurden bislang nie erfolgreich zugestellt,
weil alle Adressen Platzhalter waren) 1 h · Nominatim-Rate-Limit beachten, 1 Request/Sekunde 0,5 h ·
Rollout 0,5 h. **Gesamt realistisch: 1,5 Arbeitstage.**

## Unterhalb der Schnittlinie (v2, bewusst verschoben)

- Pending-Zähler/Badge in der Admin-Navigation
- Bulk-Freigabe mehrerer Artists
- Nachgeocodierung von Bestandsadressen (Skript)
- Caching der Geocoding-Ergebnisse pro Adresse
- Availability-Anlage als Bulk-Insert
- Wiedervorlage/Erinnerung bei lange offenen `pending`-Profilen

## Riskanteste Annahme

**Dass der SMTP-Versand überhaupt funktioniert.** Bisher gingen alle Artist-Mails an
`@clerk.placeholder`-Adressen — es kann also niemand wissen, ob `send_email` je erfolgreich
zugestellt hat oder ob die Konfiguration seit Monaten stillschweigend scheitert. Wenn sie kaputt ist,
fällt Kriterium 3 und der halbe Wert dieser Spec.

*Billig vorab prüfbar:* Vor allem anderen einen einzelnen `send_email()`-Aufruf gegen die eigene
Adresse absetzen — direkt aus der Flask-Shell, zwei Minuten. Erst wenn eine Mail ankommt, mit
Kriterium 3 beginnen.

## End-to-End-Prüfschritt

1. Mit einem zweiten Clerk-Account (echte, eigene E-Mail) registrieren.
2. Profil vollständig ausfüllen **inklusive Adresse** und zur Prüfung einreichen.
3. `SELECT lat, lon FROM artists WHERE email = '<zweite Adresse>';` → beide Werte gefüllt.
4. Als Admin `/admin/kuenstler` öffnen → der Artist erscheint unter `pending`.
5. Auf „Ablehnen" klicken, Grund „Bitte bessere Fotos" eintragen → Mail mit genau diesem Grund
   kommt an; der Artist sieht den Grund in seinem Profil-Banner.
6. Erneut einreichen, diesmal freigeben → Freigabe-Mail kommt an.
7. Als dieser Artist `GET /api/requests/requests` aufrufen → **200** statt 403.
8. Über den BookingWizard eine Anfrage mit einer weit entfernten Adresse anlegen →
   `SELECT distance_km FROM booking_requests ORDER BY id DESC LIMIT 1;` → plausibler Wert, nicht 0.

## Offene Punkte

- Ob Nominatim für die erwartete Anfragemenge ausreicht oder ob ein kommerzieller Geocoder nötig wird.
  Bei aktueller Menge unkritisch — erst ab ~1 Anfrage/Sekunde relevant.
- Welche Absenderadresse für die Freigabe-Mails verwendet wird und ob deren SPF/DKIM steht
  (sonst landen die Mails im Spam, und Kriterium 3 gilt formal als erfüllt, hilft aber niemandem).
