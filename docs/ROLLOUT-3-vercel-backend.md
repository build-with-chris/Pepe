# Rollout: Backend von Render zu Vercel

Der Code-Anteil ist umgesetzt. Was hier steht, sind die Schritte, die Zugriff auf
das Vercel-Dashboard, Supabase oder Clerk brauchen und deshalb nicht aus dem Repo
heraus erledigt werden können.

Ausgangslage: Beide Render-Dienste stehen auf "Suspended by Render". Die
Datenbank liegt bei **Supabase** und ist davon nicht betroffen. Das Frontend
läuft schon als Vercel-Projekt `pepe` auf `pepeshows.de`.

---

## 1. Zweites Vercel-Projekt für das Backend

Bewusst ein eigenes Projekt, nicht das Frontend-Projekt mitbenutzen: Der
Frontend-Build ist Node, das Backend ist Python. Getrennt bleibt der
Build-Schritt einfach und das Frontend spricht das Backend weiter über eine
eigene URL an, also bleibt es bei der bestehenden CORS-Logik.

Vercel → **Add New… → Project** → dasselbe GitHub-Repo:

- **Root Directory:** `backend`
- **Framework Preset:** Flask (wird über `backend/pyproject.toml` erkannt,
  Eintrag `[tool.vercel] entrypoint = "app:app"`)
- Build- und Install-Command: leer lassen, Vercel liest `requirements.txt`

`backend/vercel.json` setzt bereits `maxDuration: 30` und `memory: 1024`. Die
30 Sekunden sind nötig, weil beim Anlegen einer Anfrage ein Geocoding-Aufruf und
der Mailversand im Request-Pfad liegen; 1 GB, weil die Bildverarbeitung mit
Pillow läuft.

## 2. Umgebungsvariablen im Backend-Projekt

Aus der bisherigen Render-Konfiguration übernehmen:

```
DATABASE_URL          Supabase, siehe Schritt 3 (Pooler-URL!)
CLERK_JWKS_URL        https://clerk.pepeshows.de/.well-known/jwks.json
CLERK_ISSUER          https://clerk.pepeshows.de        (optional, empfohlen)
CORS_ORIGINS          https://pepeshows.de,https://www.pepeshows.de
AGENCY_FEE_PERCENT    20
APP_URL               https://pepeshows.de
ADMIN_EMAIL           <Adresse für Anfrage-Benachrichtigungen>
SMTP_HOST/PORT/USER/PASSWORD/SMTP_FROM
GEO_USER_AGENT        echte Kontaktadresse, sonst blockt Nominatim
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PROFILE_BUCKET
BLOB_READ_WRITE_TOKEN falls die Upload-Routen genutzt werden
```

Nicht setzen: `ENABLE_DEBUG_ROUTES`, `ALLOW_HTTP_MIGRATION`. Beide sind
Notschalter und gehören in Produktion aus.

`VERCEL=1` setzt Vercel selbst. Der Code liest das und schaltet damit auf
`NullPool` um (`backend/app.py`, `IS_SERVERLESS`).

## 3. DATABASE_URL auf den Supabase-Pooler umstellen

**Der wichtigste Schritt.** Serverless heißt viele kurzlebige Instanzen. Jede
würde eine eigene direkte Postgres-Verbindung aufbauen, und das
Verbindungslimit ist schnell erreicht.

In Supabase → Project Settings → Database → Connection string die
**Connection-Pooling-URL** nehmen (Port **6543**, `pgbouncer`), nicht die
direkte Verbindung auf Port 5432.

```
postgresql://postgres.<ref>:<passwort>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

Sonderzeichen im Passwort URL-kodieren. `normalize_db_url` in `config.py` macht
aus `postgresql://` selbst `postgresql+psycopg://`.

## 4. Migrationen

`flask db upgrade` hat auf Vercel keinen Ort zum Laufen. Migrationen laufen
lokal gegen dieselbe Datenbank, **vor** dem ersten Deploy:

```bash
cd backend
DATABASE_URL='<direkte Supabase-URL, Port 5432>' ./.venv/bin/flask db upgrade
```

Für Migrationen die **direkte** Verbindung nehmen, nicht den Pooler: pgbouncer
im Transaction-Mode verträgt sich schlecht mit DDL.

## 5. Geteilter Store für Rate-Limit und Idempotenz (empfohlen)

Ohne diesen Schritt läuft alles, aber zwei Schutzmechanismen wirken nicht mehr:
Das Limit von 5 Anfragen pro Stunde und IP zählt dann pro Funktionsinstanz, und
ein doppelt abgeschicktes Formular erzeugt zwei Buchungsanfragen statt einer.

Vercel → Storage → **Upstash Redis** hinzufügen (Marketplace). Die Integration
setzt `KV_REST_API_URL` und `KV_REST_API_TOKEN` selbst; `helpers/shared_store.py`
liest beide Namen und ausserdem die `UPSTASH_*`-Varianten.

Gegenprobe nach dem Deploy: dasselbe Formular zweimal mit demselben
`Idempotency-Key` abschicken. Der zweite Aufruf muss den Header
`Idempotent-Replay: true` liefern.

## 6. Frontend umstellen

Im Vercel-Projekt `pepe` die Variable `VITE_API_URL` auf die neue Backend-URL
setzen und **neu deployen** — `VITE_*` wird zur Build-Zeit eingebacken, eine
Änderung wirkt ohne Rebuild nicht.

## 7. Zwei offene Punkte, die nichts mit dem Umzug zu tun haben

Beide sind aktuell live sichtbar und blockieren unabhängig vom Hosting:

1. **Clerk-JWT-Template fehlt in der Produktionsinstanz.** `POST .../tokens/pepe-backend`
   antwortet mit 404. Im Clerk-Dashboard von `clerk.pepeshows.de` unter
   JWT Templates anlegen, Claims wie in ROLLOUT-1 beschrieben. Bis dahin läuft
   die App mit dem Standard-Token: bestehende Konten funktionieren, eine
   Neuanmeldung scheitert bewusst mit `invalid_token`.
2. **Vercel Attack Challenge Mode** im Frontend-Projekt blockt dynamisch
   nachgeladene JS-Chunks mit 403 (`x-vercel-mitigated: challenge`). Unter
   Project → Firewall abschalten oder auf einzelne Pfade eingrenzen.

## 8. Kosten im Blick behalten

Vercel → Settings → **Spend Management** ein Limit setzen (z. B. 5 €). Dann kann
die Rechnung nicht unbemerkt über das Budget laufen. Upstash Redis in der
kleinsten Stufe und Supabase bleiben davon unberührt.

## 9. End-to-End-Prüfung

1. `GET <backend>/healthz` → `{"status":"ok"}`, also Datenbank erreichbar.
2. `GET <backend>/api/artists` → Liste der freigegebenen Artists.
3. `GET <backend>/__debug/whoami` → **404** (Debug-Routen sind aus).
4. `POST <backend>/api/admin/artists` ohne Token → **401**.
5. Auf `pepeshows.de` eine Anfrage über den Wizard abschicken → Preisspanne
   erscheint, Anfrage liegt in der DB, Mail an `ADMIN_EMAIL` kommt an.
6. Formular zweimal abschicken → nur eine Anfrage in der DB.
7. Einloggen, Profil laden, als Admin `/admin/kuenstler` öffnen.

Schritt 5 ist der aussagekräftigste: Er berührt Geocoding, Preisberechnung,
Datenbank und Mailversand in einem Durchlauf.
