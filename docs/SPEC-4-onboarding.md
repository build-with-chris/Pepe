# SPEC-4: Onboarding sicher und stabil

Setzt SPEC-1 bis SPEC-3 voraus.

---

## Kontext

Das Onboarding eines Künstlers ist der einzige Weg, auf dem neue Artists ins
System kommen: anmelden, Datensatz anlegen lassen, Profil ausfüllen, Bilder
hochladen, zur Prüfung einreichen, freigeben lassen. Bricht irgendein Glied,
kommt kein Artist mehr rein, und das fällt erst auf, wenn sich jemand beschwert.

Genau das ist heute im Deployment passiert. Beim Anmelden auf
`pepe-services.vercel.app`:

```
POST /api/artists/me/ensure                          401
PATCH /api/artists/me/profile                        401
GET  /api/upload?pathname=artists/new-id/profile.webp 404
```

Der Nutzer ist bei Clerk eingeloggt, aber das Backend weist jedes Token ab, und
der Bildupload läuft ins Leere. Das `new-id` im Pfad zeigt die Kettenreaktion:
Weil `ensure` scheitert, kennt das Frontend keine Artist-ID und lädt trotzdem
weiter hoch.

Die drei Fehler haben unterschiedliche Ursachen, und alle drei sind Symptome
desselben Musters: Der Ablauf besteht aus mehreren voneinander abhängigen
Aufrufen ohne gemeinsame Absicherung, und die Testsuite deckt genau die Stellen
nicht ab, an denen es bricht.

---

## Befunde

### O1 — Jede Anmeldung scheitert: NameError in der Token-Prüfung

`backend/helpers/clerk_auth.py:48` ruft `get_clerk_jwks_url()` auf. Die Funktion
existiert nicht mehr; sie stammte aus dem origin-Zweig und ist beim Merge
weggefallen, der Aufruf blieb stehen.

```
Clerk token verification error: name 'get_clerk_jwks_url' is not defined
```

Folge: `verify_clerk_token` fängt die Exception in seinem generischen
`except Exception` und gibt `None` zurück. Jeder authentifizierte Aufruf endet
in 401, unabhängig von Token, Template und Konfiguration.

**Warum kein Test das gefunden hat:** `tests/conftest.py:78` ersetzt
`clerk_auth.get_jwks_client` durch einen Stub. Das ist genau die Funktion, die
den Fehler enthält. 173 Tests laufen grün, während in Produktion keine einzige
Anmeldung funktioniert. Das ist der eigentliche Befund: Der Teststub verdeckt
den einen Pfad, der zwischen Frontend und Datenbank alles trägt.

### O2 — Ungeschützter Upload-Endpunkt

`frontend/api/upload.ts` schreibt in den Vercel-Blob-Speicher:

- keine Prüfung eines Tokens, überhaupt keine Authentifizierung
- `pathname` kommt ungeprüft aus dem Query-String
- `allowOverwrite: true`
- `Access-Control-Allow-Origin: *`

Wer die URL kennt, kann beliebige Dateien ablegen und fremde Profilbilder
überschreiben, von jeder Domain aus. Aktuell ist die Funktion nur deshalb nicht
erreichbar, weil die Services-Aufstellung `/api/(.*)` an das Backend leitet und
dort keine passende Route liegt (daher der 404). Diese Abschirmung ist ein
Nebeneffekt, keine Absicht, und verschwindet mit jeder Änderung an den Rewrites.

### O3 — Drei parallele Upload-Wege

| Weg | Ziel | Auth |
|---|---|---|
| `frontend/api/upload.ts` | Vercel Blob | keine |
| `backend/routes/upload_routes.py` (`/api/upload/image`) | Vercel Blob | Token + Eigentumsprüfung |
| `backend/routes/api_routes.py` (`/api/artists/me/upload-image`) | Supabase Storage | Token |

Drei Implementierungen, zwei Speicherorte, drei Sicherheitsniveaus. Welcher Weg
benutzt wird, hängt davon ab, welche Funktion im Frontend gerade aufgerufen
wird. `ProfileSetup.tsx` nutzt den ersten, `deleteFromBlob` den zweiten.

### O4 — Das Onboarding ist eine ungesicherte Kette

`ProfileSetup.tsx` ruft nacheinander auf: `ensure` → `me` → Bildupload →
`profile` (PATCH) → `submit_review`. Scheitert ein Glied, laufen die folgenden
trotzdem, mit unvollständigen Daten. Der Pfad `artists/new-id/profile.webp` im
Fehlerprotokoll ist genau das: Die ID fehlte, der Upload lief los.

### O5 — Missbrauchsschutz wirkt in Produktion nicht

Am Deployment gemessen: Nach Erreichen des Limits zwölf gleichzeitige Aufrufe,
**sieben kamen durch**. Zähler und Idempotenz liegen pro Funktionsinstanz. Der
geteilte Store (`backend/helpers/shared_store.py`) ist fertig, nur ohne
Upstash-Zugangsdaten fällt er auf den Prozessspeicher zurück.

### O6 — Kein Test über den ganzen Ablauf

Es gibt Tests für einzelne Endpunkte, aber keinen, der die Kette
Anmeldung → ensure → Profil → Einreichen → Freigabe → erste Anfrage am Stück
prüft. Genau diese Kette ist heute gebrochen.

---

## Ziel

Ein Künstler kann sich anmelden, sein Profil vollständig anlegen und zur
Prüfung einreichen. Bricht ein Schritt, sagt die Anwendung, welcher, und
hinterlässt keinen halben Datensatz. Kein Endpunkt, der Dateien schreibt, ist
ohne Anmeldung erreichbar.

## Nicht-Ziele

- Kein Umbau des Gage-Datenmodells (bleibt SPEC-3, v2).
- Keine Rollenverwaltung im UI; der eine Admin wird weiter per SQL geflaggt.
- Kein Wechsel des Speicherorts für bestehende Bilder. Was in Supabase Storage
  liegt, bleibt dort; es geht nur darum, dass Neuuploads einen Weg nehmen.
- Keine Änderung an der Preisberechnung.

---

## Kriterien

1. **Token-Prüfung funktioniert und ist getestet.** `get_jwks_client` benutzt
   `CLERK_JWKS_URL`. Ein Test prüft `verify_clerk_token` **ohne** den
   JWKS-Stub, gegen einen lokal aufgesetzten Schlüsselsatz, sodass ein
   NameError oder ein Tippfehler in dieser Funktion auffällt.

2. **Fehlkonfiguration ist unterscheidbar.** `verify_clerk_token` fängt nicht
   mehr pauschal jede Exception zu `None` weg. Ein fehlendes `CLERK_JWKS_URL`,
   ein nicht erreichbarer JWKS-Endpunkt und ein ungültiges Token führen zu
   unterscheidbaren Logzeilen. Ein abgelehntes Token bleibt nach aussen 401,
   eine kaputte Konfiguration wird als solche geloggt.

3. **Genau ein Upload-Weg, und der ist geschützt.** `frontend/api/upload.ts` ist
   entfernt. Alle Uploads laufen über den Backend-Blueprint mit Token und
   Eigentumsprüfung. Ein Upload ohne Token antwortet mit 401, ein Upload auf eine
   fremde `artist_id` mit 403.

4. **Das Onboarding bricht sichtbar ab.** Scheitert `ensure`, wird kein Bild
   hochgeladen und kein Profil gespeichert. Der Nutzer sieht, woran es lag, statt
   einer stillen Teilspeicherung. Kein Pfad enthält jemals `new-id`.

5. **Der Ablauf ist am Stück getestet.** Ein Integrationstest fährt
   ensure → Profil speichern → einreichen → freigeben → Anfrage empfangen
   durch und prüft nach jedem Schritt den Zustand in der Datenbank.

6. **Missbrauchsschutz wirkt instanzübergreifend.** Nach Einrichten des
   geteilten Stores liefern zwölf gleichzeitige Aufrufe über dem Limit
   **zwölfmal** 429, nicht sieben Durchlässer.

7. **Die Prüfung läuft von aussen.** `scripts/smoke-deployment.sh` erweitert um
   den Onboarding-Pfad, soweit ohne Anmeldung prüfbar: dass die Upload-Routen
   ohne Token abweisen und dass kein unauthentifizierter Schreibendpunkt
   existiert.

---

## Umsetzung

### Schritt 0 — Hotfix, sofort und einzeln

Getrennter Commit, sofort gepusht, damit die Anmeldung wieder läuft. Danach
Schritt 1 in Ruhe.

**`backend/helpers/clerk_auth.py`** — Zeile 48: `url = get_clerk_jwks_url()`
durch `url = CLERK_JWKS_URL` ersetzen. Einzeiler, behebt O1 und damit alle drei
401-Fehler aus dem Kontext.

**`backend/tests/unit/test_clerk_auth.py`** (neu) — prüft `get_jwks_client` und
`verify_clerk_token` **ohne** den JWKS-Stub aus `conftest.py`. Der Stub bleibt
für die übrigen Tests bestehen, sonst bräuchte jeder Test Netzzugriff; hier wird
er gezielt umgangen, indem `PyJWKClient` durch ein Objekt ersetzt wird, das die
übergebene URL festhält. Fälle:

- `CLERK_JWKS_URL` gesetzt → Client wird mit genau dieser URL gebaut
- `CLERK_JWKS_URL` leer → `RuntimeError` mit verständlicher Meldung
- Client wird nur einmal gebaut (der Zwischenspeicher greift)

Dieser Test hätte O1 gefunden. Er ist der eigentliche Wert von Schritt 0.

**Gegenprobe nach dem Deploy:** anmelden, `/api/artists/me` muss 200 liefern.

### Schritt 1 — Uploads zusammenführen

**Entfernen:** `frontend/api/upload.ts`.

**`frontend/src/lib/storage/blobUpload.ts`** — `uploadViaServerless` ruft
statt `/api/upload?pathname=…` den Backend-Endpunkt
`POST ${base}/api/upload/image` als `multipart/form-data` mit `file`, `type`
und `artist_id` auf und schickt den Clerk-Token mit. `deleteFromBlob` bleibt
wie es ist, es zeigt schon auf das Backend.

**`backend/routes/upload_routes.py`** — hat bereits Token- und
Eigentumsprüfung. Ergänzen: Grössenbegrenzung und erlaubte Inhaltstypen, damit
der Endpunkt nicht zum offenen Dateiablage-Dienst wird.

**`backend/routes/api_routes.py`** — `/artists/me/upload-image` (Supabase
Storage) als veraltet markieren und im Frontend nicht mehr aufrufen. Nicht
löschen, solange unklar ist, ob Bestandsbilder darüber ausgeliefert werden.

### Schritt 2 — Onboarding-Kette absichern

**`frontend/src/pages/ProfileSetup.tsx`** — Der Speichervorgang bricht ab,
sobald `ensure` keine Artist-ID liefert. Reihenfolge: erst ID sichern, dann
hochladen, dann Profil speichern. Der `new-id`-Ersatzwert entfällt ersatzlos.
Fehler werden pro Schritt gemeldet, dafür sind die Fehlerklassen aus
`lib/http.ts` bereits vorhanden und tragen seit dem letzten Umbau die
Servermeldung samt `request_id`.

**`backend/routes/api_routes.py`** — `ensure_artist_for_current_user` bleibt
unverändert, sie ist bereits der einzige Onboarding-Pfad und behandelt
Wettläufe über den `IntegrityError`-Zweig.

### Schritt 3 — Absicherung

**`backend/tests/integration/test_onboarding_flow.py`** (neu) — der Ablauf am
Stück, mit den vorhandenen Fixtures aus `conftest.py` (`clerk_token`, `client`,
`admin_headers`, `get_artist`).

**`scripts/smoke-deployment.sh`** — zwei Prüfungen ergänzen: `/api/upload/image`
ohne Token muss 401 liefern, und `/api/upload` (der alte Pfad) darf keine
Vercel-Funktion mehr treffen.

### Schritt 4 — Betrieb

**Upstash Redis** in Vercel hinzufügen (siehe ROLLOUT-3, Abschnitt 5). Kein
Code-Eingriff, `shared_store` erkennt die Variablen selbst.

---

## Verifikation

1. `cd backend && ./.venv/bin/python -m pytest -q` — alle Tests, inklusive der
   neuen Clerk- und Onboarding-Tests.
2. Deployment abwarten, dann `./scripts/smoke-deployment.sh <url>`.
3. Anmelden und ein Profil vollständig anlegen: Bild hochladen, speichern, zur
   Prüfung einreichen. In der Datenbank prüfen, dass genau ein Artist-Datensatz
   entstanden ist, mit echter E-Mail und gefüllter Bild-URL.
4. Gegenprobe zum Abbruchverhalten: `CLERK_JWKS_URL` kurzzeitig falsch setzen,
   Onboarding versuchen. Erwartet: klare Fehlermeldung im UI, **kein** Bild im
   Blob-Speicher, **kein** halber Datensatz in der Datenbank.
5. Zwölf gleichzeitige Aufrufe über dem Rate-Limit: alle müssen 429 liefern.
6. Vercel-Logs durchsehen: keine Zeile mit Zugangsdaten, keine NameErrors.

---

## Offene Punkte

- Ob Bestandsbilder in Supabase Storage liegen und ausgeliefert werden, oder ob
  alles bereits im Vercel-Blob-Speicher ist. Davon hängt ab, ob
  `/artists/me/upload-image` bleiben muss.
- Der `BLOB_READ_WRITE_TOKEN` lag bisher auch im Frontend-Projekt, weil die
  Vercel-Funktion ihn brauchte. Nach deren Entfernung gehört er nur noch ins
  Backend und sollte im Frontend-Projekt entfernt werden.
