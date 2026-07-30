# Rollout: Backend von Render zu Vercel

Der Code-Anteil ist umgesetzt. Was hier steht, sind die Schritte, die Zugriff auf
das Vercel-Dashboard, Supabase oder Clerk brauchen und deshalb nicht aus dem Repo
heraus erledigt werden können.

Ausgangslage: Beide Render-Dienste stehen auf "Suspended by Render". Die
Datenbank liegt bei **Supabase** und ist davon nicht betroffen.

## Die Aufstellung

Vercel erkennt das Repo als Monorepo mit zwei Services und bietet den
Application Preset **Services** an. Das ist besser als zwei getrennte Projekte:

```
pepeshows.de/            -> Service "frontend" (Vite)
pepeshows.de/api/...     -> Service "backend"  (Flask)
```

Frontend und Backend liegen damit auf **derselben Herkunft**. CORS entfällt für
den Produktionsbetrieb, es gibt eine Domain und ein Deployment für beides.

`vercel.json` im Repo-Wurzelverzeichnis beschreibt genau das. Wichtig daran: Der
Pfad wird beim Weiterleiten an den Service **nicht** abgeschnitten. Das Backend
sieht `/api/artists`, und genau so heissen die Flask-Routen auch
(`api_bp` hängt unter `/api`). Wer den Präfix abschneiden will, braucht laut
Vercel-Doku einen ausdrücklichen `request.path`-Transform — den wollen wir hier
nicht.

`/healthz` liegt ausserhalb von `/api` und ist deshalb einzeln eingetragen.
`/api-docs/` und `/apispec_1.json` sind bewusst **nicht** eingetragen: Die
Swagger-Oberfläche war auf Render öffentlich erreichbar und muss das nicht sein.

---

## 1. Projekt: das bestehende umstellen, kein neues anlegen

Im Vercel-Konto gibt es schon ein Projekt `pepe`, und **an dem hängen
`pepeshows.de` und `www.pepeshows.de`**. Ein zweites Projekt mit demselben Namen
geht nicht, und ein neues Projekt hätte die Domain nicht.

**Empfohlen:** Import abbrechen und im bestehenden Projekt `pepe` unter
Settings → Build & Deployment den **Framework Preset auf "Services"** stellen,
Root Directory auf `./`. Dann greift die Root-`vercel.json`, die Domain bleibt,
wo sie ist, und es gibt keine Umzugsaktion.

**Falls der Preset dort nicht angeboten wird:** neues Projekt unter einem
anderen Namen anlegen (z. B. `pepe-services`), auf der `*.vercel.app`-URL alles
durchprüfen (Abschnitt 7) und **erst danach** `pepeshows.de` im alten Projekt
entfernen und im neuen hinzufügen. In dieser Reihenfolge, sonst ist die Seite
zwischenzeitlich nicht erreichbar.

Auf dem Import-Bildschirm selbst sind sonst keine Angaben nötig: Root Directory
bleibt `./`, Build- und Output-Einstellungen bleiben leer. Alles steht in
`vercel.json`, und "Refresh" liest sie neu ein.

## 2. Umgebungsvariablen

Aus der bisherigen Render-Konfiguration übernehmen:

```
DATABASE_URL          Supabase, siehe Abschnitt 3 (Pooler-URL!)
CLERK_JWKS_URL        https://clerk.pepeshows.de/.well-known/jwks.json
CLERK_ISSUER          https://clerk.pepeshows.de        (optional, empfohlen)
AGENCY_FEE_PERCENT    20
APP_URL               https://pepeshows.de
ADMIN_EMAIL           <Adresse für Anfrage-Benachrichtigungen>
SMTP_HOST/PORT/USER/PASSWORD/SMTP_FROM
GEO_USER_AGENT        echte Kontaktadresse, sonst blockt Nominatim
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PROFILE_BUCKET
BLOB_READ_WRITE_TOKEN falls die Upload-Routen genutzt werden
```

Dazu für das Frontend:

```
VITE_API_URL          https://pepeshows.de
```

Also die eigene Domain. Das Frontend baut seine Aufrufe als
`${VITE_API_URL}/api/...` zusammen, damit landet es auf derselben Herkunft. Der
Wert wird zur **Build-Zeit** eingebacken: eine Änderung wirkt erst nach einem
neuen Deployment.

```
CORS_ORIGINS          https://pepeshows.de,https://www.pepeshows.de
```

Im Normalbetrieb überflüssig, weil gleiche Herkunft. Trotzdem setzen: für
Preview-Deployments und damit der Fallback im Code nicht greift.

**Nicht** setzen: `ENABLE_DEBUG_ROUTES`, `ALLOW_HTTP_MIGRATION`. Beide sind
Notschalter und gehören in Produktion aus.

`VERCEL=1` setzt Vercel selbst. Der Code liest das und schaltet damit auf
`NullPool` um (`backend/app.py`, `IS_SERVERLESS`).

## 3. DATABASE_URL auf den Supabase-Pooler umstellen

**Der wichtigste Schritt.** Serverless heisst viele kurzlebige Instanzen. Jede
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

## 5. Geteilter Store für Rate-Limit und Idempotenz

**Nicht optional, sondern am Deployment nachgewiesen offen.** Gegenprobe vom
30.07.2026 gegen `pepe-services.vercel.app`: Nach Erreichen des Limits wurden
zwölf Aufrufe gleichzeitig abgeschickt, **sieben kamen durch**. Der Zähler liegt
also pro Funktionsinstanz. Damit gilt:

- Das Limit von 5 Anfragen pro Stunde und IP bremst nur, wen es zufällig auf
  derselben Instanz trifft. Bei Parallellast, also genau im Missbrauchsfall,
  wirkt es nicht.
- Ein doppelt abgeschicktes Formular kann zwei Buchungsanfragen erzeugen, weil
  der Idempotency-Key auf einer anderen Instanz unbekannt ist.

Vercel → Storage → **Upstash Redis** hinzufügen (Marketplace). Die Integration
setzt `KV_REST_API_URL` und `KV_REST_API_TOKEN` selbst; `helpers/shared_store.py`
liest beide Namen und ausserdem die `UPSTASH_*`-Varianten. Kein Code-Eingriff
nötig, das Modul erkennt die Variablen von allein.

Gegenprobe danach: dieselben zwölf parallelen Aufrufe müssen alle 429 liefern.

## 6. Kosten begrenzen

Vercel → Settings → **Spend Management** ein Limit setzen (z. B. 5 €). Dann kann
die Rechnung nicht unbemerkt über das Budget laufen.

## 7. End-to-End-Prüfung

Der Teil, der von aussen prüfbar ist, steckt in einem Skript:

```bash
./scripts/smoke-deployment.sh https://pepe-services.vercel.app
```

Es prüft die öffentlichen Endpunkte, alle Auth-Schranken, dass die
abgeschalteten Debug- und Legacy-Pfade keine Backend-Daten liefern, die
Eingabevalidierung, den SPA-Fallback und dass der Fallback die statischen Assets
nicht verschluckt. Stand 30.07.2026: 23 von 24 in Ordnung, die eine Abweichung
war das Rate-Limit aus vorherigen Läufen.

Was das Skript **nicht** prüfen kann, weil es echte Daten anlegen oder eine
Anmeldung brauchen würde:

1. Eine Anfrage über den Wizard abschicken → Preisspanne erscheint, Anfrage
   liegt in der DB, Mail an `ADMIN_EMAIL` kommt an. Der aussagekräftigste
   Schritt: Er berührt Geocoding, Preisberechnung, Datenbank und Mailversand in
   einem Durchlauf.
2. Dasselbe Formular zweimal abschicken → nur **eine** Anfrage in der DB
   (setzt Abschnitt 5 voraus).
3. Einloggen, Profil laden, als Admin `/admin/kuenstler` öffnen.

Zu den Debug-Pfaden: `/__debug/whoami` und `/auth/debug-secret` antworten jetzt
mit **200**, aber nur mit der SPA-HTML. Sie liegen ausserhalb von `/api` und
landen im Frontend-Fallback, erreichen das Backend also gar nicht. Das Skript
prüft deshalb den Inhalt statt des Statuscodes.

## 8. Zwei offene Punkte, die nichts mit dem Umzug zu tun haben

Beide sind unabhängig vom Hosting und blockieren jetzt schon:

1. **Clerk-JWT-Template fehlt in der Produktionsinstanz.**
   `POST .../tokens/pepe-backend` antwortet mit 404. Im Clerk-Dashboard von
   `clerk.pepeshows.de` unter JWT Templates anlegen, Claims wie in ROLLOUT-1.
   Bis dahin läuft die App mit dem Standard-Token: bestehende Konten
   funktionieren, eine Neuanmeldung scheitert bewusst mit `invalid_token`.
2. **Vercel Attack Challenge Mode** blockt dynamisch nachgeladene JS-Chunks mit
   403 (`x-vercel-mitigated: challenge`). Unter Project → Firewall abschalten
   oder auf einzelne Pfade eingrenzen.
