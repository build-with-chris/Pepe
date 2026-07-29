# Pepe Shows – Schwachstellenanalyse & Feature-Backlog

Stand: 2026-07-27, Branch `main` (Commit `18f1c2c`)

---

## 0. Kernbefund in drei Sätzen

1. **Das Backend hat zwei konkurrierende Auth-Systeme.** Clerk (RS256/JWKS) und das alte
   Supabase-`flask_jwt_extended` (HS256). Sämtliche Admin- und Booking-Routen hängen noch am alten
   System — das Frontend schickt aber Clerk-Tokens. Deshalb ist **der komplette Admin-Bereich tot**
   und damit auch die Artist-Freigabe.
2. **Clerk liefert keine E-Mail im Token**, weil `getToken()` ohne JWT-Template aufgerufen wird.
   Das Backend legt daraufhin Artists mit Platzhalter-Adressen `user_xyz@clerk.placeholder` an.
   Benachrichtigungen laufen ins Leere, bestehende Profile werden nicht verknüpft, es entstehen Dubletten.
3. **Der Preisberechner rechnet, aber niemand sieht das Ergebnis.** Der BookingWizard verwirft die
   Server-Antwort; zusätzlich sind mehrere Rechenfehler drin (Distanz immer 0, Dauer bei 45 Min gedeckelt,
   doppelte ±20 %-Spreizung, Summierung aller gematchten statt der gebuchten Artists).

---

## 1. Detailbefunde

### 1.1 Auth-Architektur (Ursache für „Artist kann nicht freigeschaltet werden")

| # | Befund | Ort |
|---|---|---|
| A1 | Alle Admin-Routen nutzen `@jwt_required()` (HS256, `SUPABASE_JWT_SECRET`). Clerk-Tokens sind RS256 → `422 Invalid header`. | `backend/routes/admin_routes.py` (alle 20 Routen) |
| A2 | `app.py:61-104` prüft den Clerk-Token korrekt und lässt durch — danach kippt `@jwt_required()`. Doppelte, widersprüchliche Prüfung. | `backend/app.py:61` |
| A3 | Auch Booking-Routen betroffen: `list_requests`, `set_offer`, `accept_request`, `delete_request`. | `backend/routes/request_routes.py:136,433,507,520` |
| A4 | `approved_by` ist Integer-FK, bekommt aber `get_jwt_identity()` = Clerk-String `user_2abc…`. Schlägt auch nach Auth-Fix fehl. | `backend/routes/admin_routes.py:385,414` |
| A5 | Identitäts-Semantik uneinheitlich: `list_requests` liest die Identity als `artist.id`, `set_offer` als `supabase_user_id`. Eins von beiden ist zwingend falsch. | `request_routes.py:140` vs. `:438` |
| A6 | Kompletter Legacy-Passwort-Login noch aktiv (`/auth/login`, `/auth/verify`) — tot, aber offene Angriffsfläche. | `backend/routes/auth_routes.py` |
| A7 | Rollen-Doppelquelle: Frontend prüft Clerk `publicMetadata.role`, Backend prüft DB `artists.is_admin`. Ein Admin, der nur in der DB geflaggt ist, kommt nicht mal auf die Seite. | `ProtectedRoute.tsx:30` vs. `app.py:99` |
| A8 | `helpers/authz.py` (`admin_required`) ist toter Supabase-Code. | `backend/helpers/authz.py` |

### 1.2 Artist-Onboarding & Freischaltung

| # | Befund | Ort |
|---|---|---|
| B1 | `getToken()` ohne JWT-Template → Default-Session-Token enthält nur `sub`, `sid`, `exp`… **kein `email`, kein `public_metadata`**. | `frontend/src/context/AuthContext.tsx:35` |
| B2 | Folge: Artist wird mit `f'{user_id}@clerk.placeholder'` angelegt. | `backend/routes/api_routes.py:477` |
| B3 | Folge: Benachrichtigungs-Mails an Artists gehen an Fake-Adressen. | `request_routes.py:376` |
| B4 | Folge: Verknüpfung mit bestehendem Artist per E-Mail unmöglich → Dubletten bei jedem Neu-Login-Weg. | `api_routes.py:436-471` |
| B5 | `get_user_role()` liest `public_metadata` aus Claims — im Default-Token nicht vorhanden → `require_role` würde immer 403 liefern. | `helpers/clerk_auth.py:150` |
| B6 | **Admin-UI ruft falsche Pfade auf**: `${baseUrl}/admin/artists` statt `/api/admin/artists` → 404. Der Freigabe-Button kann gar nicht funktionieren. | `pages/Artists.tsx:110,166,226,257` |
| B7 | Es gibt **keinen Reject-Button** im UI, obwohl der Endpoint existiert. Artists bleiben ewig auf `pending`. | `pages/Artists.tsx` |
| B8 | Keine E-Mail an den Artist bei `approve`/`reject`. Zusammen mit B2 erfährt niemand je vom Statuswechsel. | `admin_routes.py:378-432` |
| B9 | Geocoding schreibt `artist.latitude/longitude`, das Modell hat aber `lat`/`lon` → Koordinaten werden **immer** verworfen. Entfernungsberechnung damit dauerhaft blind. | `artist_manager.py:53-56` vs. `models.py:43-44` |
| B10 | `create_artist()` legt 365 Availability-Zeilen einzeln an (kein Bulk-Insert). | `artist_manager.py:124-126` |

### 1.3 Preisberechner / Booking Agent

| # | Befund | Ort |
|---|---|---|
| C1 | **Server-Antwort wird verworfen** — `if (response.ok) { success = true; break }`. `price_min`/`price_max`/`request_id` landen nie im State. Der Kunde sieht nur ein `alert()`. | `BookingWizard.tsx:364-366` |
| C2 | `distance_km: 0` hardcodiert → Anfahrtspauschale und Distanzzuschlag sind immer 0. | `BookingWizard.tsx:94` |
| C3 | Dauer wird auf 45 Min gedeckelt. Eine 120-Min-Show kostet exakt so viel wie 45 Min. | `calculate_price.py:88` |
| C4 | `set_offer` summiert `price_min` **aller gematchten** Artists (bis zu 5) statt nur der gebuchten → massiv überhöhte Preise. | `request_routes.py:456-463` |
| C5 | `set_offer` berechnet `pmin/pmax` und **speichert sie nie**; `price_offered` bleibt `None`. Response ist `{'price_offered': null}`. | `request_routes.py:466-502` |
| C6 | Doppelte ±20 %-Spreizung: `artist.price_min/max` sind bereits Gage ±20 %, `calculate_price` legt nochmal ±20 % drauf → effektiv ~±44 %. | `artist_manager.py:269-271` + `calculate_price.py:132-135` |
| C7 | Zwei konkurrierende Offer-Endpoints mit **unterschiedlichen Feldnamen**: `artist_gage` (jwt) vs. `price_offered` (Clerk). | `request_routes.py:432` vs. `api_routes.py:837` |
| C8 | Artist-Empfehlung rechnet mit `fee_pct=0`, die Kundenanfrage mit 20 % → Artist und Kunde sehen unterschiedliche Zahlen für denselben Gig. | `booking_requests_manager.py:374` |
| C9 | `event_type` Mapping bricht: Wizard sendet `'Incentive'`, `event_scores` kennt nur `'Teamevent'` → stiller Fallback auf 0.5. | `BookingWizard.tsx:63` vs. `calculate_price.py:71-76` |
| C10 | `team_size: 'group'` → 5 → Backend liefert `group_pricing_pending` und **gar keinen Preis**. Im UI nicht abgefangen. | `BookingWizard.tsx:55`, `request_routes.py:407` |
| C11 | Tote Parameter: `newsletter`, `show_discipline`, `tight_spread_pct` werden entgegengenommen und nie benutzt. | `calculate_price.py:3-10` |
| C12 | München-Rabatt (−100 €) über `address.split(',')[-1].split()[-1]` — bricht bei `"…, 80331 München, Deutschland"`. Surcharge kann negativ werden. | `calculate_price.py:110-119` |
| C13 | Artist kann `price_min/price_max` frei via Profil-PATCH setzen und überschreibt damit die Gage-Berechnung. Zwei Schreiber auf dieselben Felder. | `api_routes.py:342-345` |
| C14 | `budget` und `planningStatus` werden im Wizard abgefragt, fließen aber in keine Berechnung ein. | `BookingWizardSteps.tsx:405-422` |
| C15 | `GageCalculator` Docstring sagt „Gage in Cent", der Code liefert Euro. | `gage_calculator.py:59` |

### 1.4 Sicherheit & Deployment

| # | Befund | Ort |
|---|---|---|
| D1 | **Live-Secret im Klartext** in einer git-getrackten Datei: `SHADCNBLOCKS_API_KEY = "sk_live_…"` (uncommitted, aber staged-fähig). Ebenso Supabase- und PostHog-Keys. | `frontend/wrangler.toml` |
| D2 | `VITE_CLERK_PUBLISHABLE_KEY` fehlt in `[vars]` → `main.tsx:13` wirft → weiße Seite. Zudem sind `[vars]` Worker-Runtime-Variablen; `VITE_*` müssen zur **Build-Zeit** gesetzt sein — der Block wirkt für eine Vite-SPA ohnehin nicht. | `wrangler.toml`, `main.tsx:10-14` |
| D3 | JWKS-URL hardcodiert auf die **Test**-Instanz `next-quail-49.clerk.accounts.dev`. Ein Wechsel auf Production-Clerk bricht die Auth sofort. | `helpers/clerk_auth.py:21` |
| D4 | `/__debug/db` gibt die DB-URI **inkl. Zugangsdaten unauthentifiziert** aus. `/__debug/whoami`, `/__debug/cors` ebenfalls offen. | `app.py:223-277` |
| D5 | `/auth/debug-secret` verrät Länge und Prefix des JWT-Secrets. | `auth_routes.py:70-82` |
| D6 | `/api/admin/migrate-database-temp` ohne eigenen Decorator (nur hinter dem before_request-Gate). | `admin_routes.py:640` |
| D7 | Rate-Limiting und Idempotency-Cache liegen im Prozess-Speicher → bei mehreren Gunicorn-Workern/Render-Instanzen wirkungslos. | `request_routes.py:14-58` |

### 1.5 Frontend / UX / Aufräumen

| # | Befund | Ort |
|---|---|---|
| E1 | Hero-Bild mobil: `height: 100vh` + `objectFit: cover` + `objectPosition: center`. Auf schmalen Screens starker seitlicher Beschnitt, Motiv wirkt zu klein; `100vh` springt zusätzlich bei ein-/ausfahrender URL-Leiste. | `pages/Home.tsx:304-327` |
| E2 | Tote Supabase-Reste: `lib/supabase.ts`, `.env.example`, `wrangler.toml`. | diverse |
| E3 | 8 parallele `ArtistCard*`-Varianten. | `components/` |
| E4 | `fetchWithRetry` wirft bei 400 pauschal `ValidationError` und verschluckt die Server-Fehlermeldung — schwer zu debuggen. | `lib/http.ts:60-63` |
| E5 | BookingWizard probiert drei Endpoints durch, darunter `https://api.pepe-shows.com` (fremde Domain, existiert vermutlich nicht). | `BookingWizard.tsx:344-348` |
| E6 | `pytest` ist im aktiven Interpreter nicht installiert — Tests laufen aktuell gar nicht. | `backend/tests/` |

---

## 2. Feature-Pakete (in Bearbeitungsreihenfolge)

Die Pakete sind so geschnitten, dass sie **einzeln an je einen Agent** gegeben werden können.
F1 und F2 sind harte Blocker — alles andere baut darauf auf.

---

### F1 — Auth vereinheitlichen: Backend komplett auf Clerk
**Priorität: BLOCKER · Aufwand: M · Abhängigkeit: —**

Adressiert: A1–A5, A8

- `admin_routes.py`: alle `@jwt_required()` → `@clerk_auth_required` ersetzen, `get_jwt_identity()` → `get_clerk_user_id()`.
- `request_routes.py`: dito für `list_requests`, `list_requests_admin`, `set_offer`, `accept_request`, `delete_request`.
- Admin-Identität konsistent auflösen: Clerk-UID → `Artist` → `artist.id` für `approved_by`/`admin_id` (Integer-FK!).
- `app.py:61-104`: Doppelprüfung auflösen — entweder das before_request-Gate behalten *oder* Decorator, nicht beides.
- Identitäts-Semantik in `request_routes.py` vereinheitlichen (überall Clerk-UID → Artist auflösen).
- `flask_jwt_extended` und `helpers/authz.py` entfernen; `JWTManager` aus `app.py` raus.

**Akzeptanzkriterien**
- `GET /api/admin/artists?status=pending` liefert mit gültigem Clerk-Admin-Token 200.
- `POST /api/admin/artists/<id>/approve` setzt `approval_status='approved'` und `approved_by` = Integer-ID des Admins.
- Kein `jwt_required` mehr im Repo; `backend/tests/test_guards.py` grün.

---

### F2 — Clerk-Identität reparieren (E-Mail, Name, Rolle im Token)
**Priorität: BLOCKER · Aufwand: S–M · Abhängigkeit: —** (parallel zu F1 machbar)

Adressiert: B1–B5, D3

- In Clerk ein **JWT-Template** anlegen, das `email`, `name` und `public_metadata` in den Token schreibt;
  im Frontend `getToken({ template: '…' })` verwenden.
- `helpers/clerk_auth.py:21`: JWKS-URL aus `CLERK_JWKS_URL`/`CLERK_ISSUER` per ENV, nicht hardcodiert.
- Fallback: Wenn kein `email`-Claim vorhanden ist, die Clerk Backend-API abfragen, **statt** eine
  `@clerk.placeholder`-Adresse zu erzeugen. Placeholder-Pfad ersatzlos entfernen.
- **Datenmigration**: bestehende Artists mit `@clerk.placeholder` identifizieren, mit echten Clerk-Usern
  matchen und Dubletten zusammenführen. Als Skript unter `backend/scripts/`.
- `ensure_my_artist` und `get_current_user` auf **einen** gemeinsamen Pfad reduzieren (aktuell zwei
  fast identische, leicht abweichende Implementierungen).

**Akzeptanzkriterien**
- Neu registrierter Artist hat sofort seine echte E-Mail in der DB.
- Kein neuer Datensatz enthält `@clerk.placeholder`.
- Zweiter Login desselben Users erzeugt keinen zweiten Artist-Datensatz.
- Migrationsskript ist idempotent und protokolliert jede Zusammenführung.

---

### F3 — Admin-Freigabe-Workflow vollständig
**Priorität: HOCH · Aufwand: M · Abhängigkeit: F1, F2**

Adressiert: B6–B8, A7

- `pages/Artists.tsx`: fehlendes `/api`-Präfix in **allen vier** Fetch-Aufrufen fixen (Zeilen 110, 166, 226, 257).
- Reject-Button + Ablehnungsgrund-Dialog ergänzen (Endpoint existiert bereits).
- Benachrichtigungs-Mails an den Artist bei `approve` und `reject` (Reject inkl. Grund),
  über den vorhandenen `send_email`-Helper.
- Rollen-Quelle vereinheitlichen: **DB `artists.is_admin` ist die Wahrheit.** Frontend soll den
  Admin-Status aus `/api/artists/me` beziehen statt aus Clerk `publicMetadata` — oder Clerk-Metadata
  beim Approve serverseitig mitschreiben. Eine Quelle, nicht zwei.
- Pending-Zähler/Badge in der Admin-Navigation.

**Akzeptanzkriterien**
- Admin sieht pending Artists, kann freigeben und ablehnen; die Liste aktualisiert sich.
- Artist erhält bei beiden Aktionen eine E-Mail an seine echte Adresse.
- Freigegebener Artist erreicht `/api/requests/requests` ohne 403.

---

### F4 — Preisberechner Backend: Rechenlogik korrigieren
**Priorität: HOCH · Aufwand: M–L · Abhängigkeit: F1**

Adressiert: C3–C8, C11, C12, C15

- **Vorab mit dem Kunden klären**, was fachlich korrekt ist — das sind Preisentscheidungen,
  keine reinen Bugfixes. Erst dann implementieren.
- Dauer-Score über 45 Min hinaus fortführen (oder Pro-Rata-Aufschlag je angefangene 15 Min).
- Doppelte ±20 %-Spreizung auflösen: **entweder** speichert der Artist eine Spanne **oder**
  `calculate_price` erzeugt sie — nicht beides.
- `set_offer`: nur die tatsächlich gebuchten Artists summieren, nicht alle gematchten.
- `set_offer`: berechneten Preis auch **persistieren** (`price_offered`) und zurückgeben.
- Die beiden Offer-Endpoints zu einem zusammenführen, ein Feldname.
- `fee_pct` konsistent: Artist-Empfehlung ist Netto-Gage, Kundenpreis ist inkl. Agenturgebühr —
  das explizit benennen und in der API-Antwort trennen (`artist_gage` vs. `client_price`).
- Tote Parameter entfernen; Stadt-Erkennung über PLZ/Geo statt String-Split; Docstring in `gage_calculator.py` korrigieren.
- Unit-Tests für `calculate_price` mit ~10 realistischen Szenarien.

**Akzeptanzkriterien**
- 45-, 60- und 120-Min-Anfragen liefern unterschiedliche Preise.
- Duo-Anfrage summiert genau zwei Artists.
- Artist-Ansicht und Kunden-Ansicht desselben Gigs sind rechnerisch konsistent erklärbar.
- Tests decken alle Faktoren einzeln ab.

---

### F5 — Preisberechner Frontend: Ergebnis sichtbar machen
**Priorität: HOCH · Aufwand: M · Abhängigkeit: F4**

Adressiert: C1, C2, C9, C10, C14, E5

- Server-Antwort auswerten und die Preisspanne im Wizard anzeigen (Ergebnisschritt statt `alert()`).
- `distance_km` echt berechnen — Geocoding der Event-Adresse + Distanz zum Artist-Standort
  (setzt F9/B9 voraus, damit Artist-Koordinaten überhaupt gespeichert werden).
- Event-Type-Mapping mit dem Backend abgleichen (`Incentive` ↔ `Teamevent`).
- Gruppen-Anfragen (3+): `group_pricing_pending` sauber als „individuelles Angebot folgt" darstellen
  statt gar nichts anzuzeigen.
- `budget`/`planningStatus` entweder in die Berechnung einbeziehen oder aus dem Formular entfernen.
- Endpoint-Fallback-Kaskade entfernen — eine konfigurierte URL, ordentliche Fehlerbehandlung.
- Fehlerzustände sichtbar machen (aktuell nur `console.warn`).

**Akzeptanzkriterien**
- Kunde sieht nach dem Absenden eine konkrete Preisspanne oder eine klare Begründung, warum nicht.
- Zwei Anfragen mit 10 km vs. 400 km Anfahrt ergeben unterschiedliche Preise.
- Kein `alert()` mehr im Submit-Pfad.

---

### F6 — Gage-/Preis-Datenmodell entwirren
**Priorität: MITTEL · Aufwand: M · Abhängigkeit: F4**

Adressiert: C6, C13

- Klare Trennung: `calculated_gage` (System) / `admin_gage_override` (Admin) / `price_min`+`price_max` (abgeleitet).
- `price_min/max` als abgeleitete Werte behandeln — Artist darf sie **nicht** frei per Profil-PATCH
  überschreiben (oder: ein separates, bewusst gesetztes Wunsch-Honorar-Feld einführen).
- Genau eine Stelle, die `price_min/max` schreibt.
- Gage-Aufschlüsselung im Artist-Profil sichtbar machen (`get_gage_breakdown` existiert bereits, wird nirgends genutzt).

**Akzeptanzkriterien**
- Ein Profil-Speichervorgang verändert die berechnete Gage nicht mehr unbeabsichtigt.
- Artist kann nachvollziehen, wie seine Gage zustande kommt.

---

### F7 — Secrets & Deployment-Hygiene
**Priorität: HOCH (schnell erledigt) · Aufwand: S · Abhängigkeit: —**

Adressiert: D1, D2

- `SHADCNBLOCKS_API_KEY` (`sk_live_…`) **rotieren** — der Key gilt als kompromittiert, sobald er
  in einer getrackten Datei steht.
- Secrets aus `wrangler.toml` entfernen; Build-Zeit-Variablen als Build-Env im Cloudflare-/Vercel-Projekt setzen.
- `VITE_CLERK_PUBLISHABLE_KEY` in allen Deploy-Umgebungen ergänzen (sonst weiße Seite).
- `.env.example` auf den Ist-Zustand bringen (Clerk statt Supabase).
- Prüfen, ob die Keys bereits in der Git-History liegen; falls ja, ebenfalls rotieren.

**Akzeptanzkriterien**
- Keine Secrets mehr in getrackten Dateien.
- Produktions-Build startet ohne `Missing VITE_CLERK_PUBLISHABLE_KEY`.

---

### F8 — Debug-Endpoints & Legacy-Code entfernen
**Priorität: MITTEL · Aufwand: S · Abhängigkeit: F1**

Adressiert: D4–D7, A6, E2

- `/__debug/db`, `/__debug/cors`, `/__debug/whoami`, `/auth/debug-secret`, `/api/admin/migrate-database-temp`
  entfernen oder hinter Admin-Auth + ENV-Flag legen. `/__debug/db` ist der dringlichste (leakt DB-Credentials).
- `auth_routes.py` komplett entfernen (Legacy-Passwort-Login).
- Rate-Limiting und Idempotency auf einen geteilten Store umstellen (Redis o. ä.) oder als
  bekannte Einschränkung dokumentieren.
- Supabase-Reste entfernen: `lib/supabase.ts`, ENV-Einträge, `supabase_user_id` ggf. zu `clerk_user_id` umbenennen.

**Akzeptanzkriterien**
- Kein unauthentifizierter Endpoint gibt Infrastruktur-Details preis.
- Keine Supabase-Referenzen mehr im aktiven Code.

---

### F9 — Geocoding & Entfernungsberechnung reparieren
**Priorität: MITTEL · Aufwand: S · Abhängigkeit: —** (Voraussetzung für F5)

Adressiert: B9, B10

- `_geocode_and_set` schreibt auf `lat`/`lon` statt auf die nicht existierenden `latitude`/`longitude`.
- Bestehende Artists nachträglich geocodieren (Skript).
- Distanzberechnung Artist ↔ Event bereitstellen (`services/geo.py` ist vorhanden, wird aber nicht genutzt).
- Availability-Anlage auf Bulk-Insert umstellen.

**Akzeptanzkriterien**
- Nach dem Speichern einer Adresse sind `lat`/`lon` in der DB gefüllt.
- `distance_km` einer Anfrage entspricht der realen Entfernung (±10 %).

---

### F10 — Mobile Hero & UI-Aufräumen
**Priorität: NIEDRIG · Aufwand: S–M · Abhängigkeit: —**

Adressiert: E1, E3, E4

- Hero auf Mobil: `100svh`/`dvh` statt `100vh` (URL-Leisten-Sprung), `objectPosition` per Breakpoint,
  Bildausschnitt auf Portrait optimieren — ggf. eigenes Hoch-Format-Asset via `<picture>`.
- Die 8 `ArtistCard*`-Varianten auf ein bis zwei konsolidieren.
- `fetchWithRetry`: Server-Fehlermeldung durchreichen statt verschlucken.

**Akzeptanzkriterien**
- Hero füllt auf iPhone-Breite den Viewport ohne Sprung beim Scrollen, Motiv ist erkennbar.
- Nur noch die tatsächlich genutzten ArtistCard-Komponenten im Repo.

---

### F11 — Test-Absicherung
**Priorität: MITTEL · Aufwand: M · Abhängigkeit: F1–F5**

Adressiert: E6

- `pytest` in die Dev-Requirements und lauffähig machen.
- Integrationstests für den Onboarding-Pfad: Signup → ensure → Profil → submit_review → approve → Anfrage empfangen.
- Unit-Tests für `calculate_price` und `GageCalculator`.
- Auth-Guard-Tests: Clerk-Token gültig/ungültig/abgelaufen, Admin vs. Artist.

---

## 3. Empfohlene Reihenfolge

```
F1 ──┬── F3 ── F11
F2 ──┘
F7 (sofort, unabhängig)
F9 ──┐
F4 ──┴── F5 ── F6
F8, F10 (jederzeit)
```

**Sprint 1 (Blocker):** F1, F2, F7 → Login und Freischaltung funktionieren wieder
**Sprint 2:** F3, F9 → Admin-Workflow vollständig
**Sprint 3:** F4, F5, F6 → Preisberechner korrekt und sichtbar
**Sprint 4:** F8, F10, F11 → Aufräumen und Absichern

---

## 4. Offene fachliche Fragen an den Kunden

Diese sollten **vor F4** geklärt sein, sonst wird geraten:

1. Soll die angezeigte Preisspanne ±20 % um den berechneten Wert liegen — oder ist die
   Artist-Gage-Spanne bereits die Spanne?
2. Wie werden Shows über 45 Min bepreist: linear weiter, gestaffelt, oder Pauschale?
3. Was genau ist der Kundenpreis bei Duo/Gruppe — Summe der Einzelgagen plus Agenturgebühr?
4. Gilt der München-Rabatt von 100 € noch, und woran wird „München" festgemacht (PLZ-Bereich)?
5. Sollen `budget` und `planningStatus` aus dem Wizard den Preis beeinflussen oder sind sie
   reine Vertriebsinformation?
