# Rollout SPEC-1 (Auth vereinheitlichen)

Der Code-Anteil der Spec ist umgesetzt. Was hier steht, sind die Schritte, die
Zugriff auf das Clerk-Dashboard, die Produktions-DB oder Hoster-Secrets brauchen
und deshalb nicht aus dem Repo heraus erledigt werden können.

Reihenfolge einhalten — Schritt 1 ist die riskanteste Annahme der Spec und
entscheidet, ob der Rest überhaupt trägt.

---

## 1. JWT-Template anlegen und verifizieren (AK 3, blockiert AK 6)

**Clerk-Dashboard → JWT Templates → New template**

- Name: `pepe-backend` (muss zu `VITE_CLERK_JWT_TEMPLATE` passen)
- Claims:

```json
{
  "email": "{{user.primary_email_address}}",
  "name": "{{user.full_name}}",
  "public_metadata": "{{user.public_metadata}}"
}
```

**Gegenprobe, bevor irgendetwas deployt wird** (Browser-Konsole, eingeloggt):

```js
await window.Clerk.session.getToken({ template: 'pepe-backend' })
```

Token auf https://jwt.io dekodieren. Enthalten sein müssen `sub`, `email`, `name`.

- **Kein `email`-Claim?** Dann greift das Template nicht. Das Backend legt in dem
  Fall bewusst *keinen* Datensatz an, sondern antwortet mit `400 invalid_token`
  (`ensure_artist_for_current_user` in `backend/routes/api_routes.py`).
  Fallback laut Spec: E-Mail über die Clerk Backend-API (`users.getUser`)
  nachladen — Mehraufwand ca. 2 h plus eine zusätzliche Abhängigkeit.

## 2. `CLERK_JWKS_URL` setzen (AK 4)

Beim Hoster des Backends (Render) als Umgebungsvariable eintragen:

```
CLERK_JWKS_URL=https://<clerk-frontend-api-host>/.well-known/jwks.json
```

Den Host findet man im Clerk-Dashboard unter *API Keys → Frontend API*.
Für die aktuelle Dev-Instanz: `https://next-quail-49.clerk.accounts.dev/.well-known/jwks.json`.

Ohne diese Variable schlägt jede Verifikation mit einem klaren `RuntimeError`
im Log fehl (kein stiller Fallback auf eine hartkodierte Instanz mehr).

## 3. Clerk-Production-Instanz (AK 5)

- Production-Instanz im Clerk-Dashboard anlegen.
- **Offener Punkt aus der Spec vorab klären:** Für die Production-Instanz
  verlangt Clerk eine Domain-Verifikation (DNS-Records für `clerk.pepeshows.de`).
  Der Google-Login hängt daran — die OAuth-Credentials müssen für die neue
  Domain in der Google Cloud Console als autorisierte Redirect-URI hinterlegt
  werden. Das ist der Schritt, der erfahrungsgemäß am längsten dauert.
- JWT-Template aus Schritt 1 in der Production-Instanz **erneut** anlegen
  (Templates werden nicht zwischen Instanzen übernommen).
- Danach tauschen:
  - Frontend: `VITE_CLERK_PUBLISHABLE_KEY` → `pk_live_…`
  - Backend: `CLERK_JWKS_URL` → Production-JWKS
  - Serverseitiger `CLERK_SECRET_KEY` (falls verwendet) → `sk_live_…`

## 4. Secrets (AK 7)

Stand der Prüfung im Repo:

- `git log -S"sk_live_" --all` und `git grep` über alle Commits liefern **keine
  Treffer**. Der `SHADCNBLOCKS_API_KEY` lag nur im Arbeitsverzeichnis
  (`frontend/wrangler.toml`, uncommitted) und ist dort jetzt entfernt.
  Eine History-Bereinigung ist damit **nicht** nötig.
- Rotation bleibt trotzdem empfohlen: Der Schlüssel stand im Klartext in einer
  Datei, die für den Commit vorgesehen war. Rotieren im shadcnblocks-Konto,
  neuen Wert nur in `frontend/.env` (gitignored) bzw. in die Build-Umgebung des
  Hosters.
- `frontend/wrangler.toml` enthält keinen `[vars]`-Block mehr. VITE-Variablen
  werden zur Build-Zeit eingebacken und gehören in die Build-Umgebung, nicht in
  eine eingecheckte Worker-Konfiguration.
- `VITE_CLERK_PUBLISHABLE_KEY` muss in der Build-Umgebung gesetzt sein, sonst
  bricht der Start mit `Missing VITE_CLERK_PUBLISHABLE_KEY` ab
  (`frontend/src/main.tsx`).

## 5. Datenbank aufräumen (AK 9)

Die Produktions-DB enthält laut Spec genau einen unvollständigen Datensatz.
Nicht migrieren — löschen:

```sql
-- vorher ansehen
SELECT id, email, supabase_user_id, approval_status FROM artists;

DELETE FROM artists;

-- Gegenprobe: muss 0 ergeben
SELECT count(*) FROM artists WHERE email LIKE '%clerk.placeholder';
```

## 6. End-to-End-Prüfung

1. Datenbank ist leer (Schritt 5).
2. Im Browser mit einer **neuen** E-Mail registrieren.
3. ```sql
   SELECT id, email, supabase_user_id, approval_status FROM artists;
   ```
   → genau eine Zeile, echte E-Mail, gefüllte Clerk-UID, Status `unsubmitted`.
4. ```sql
   UPDATE artists SET is_admin = true WHERE id = <diese id>;
   ```
5. ```bash
   curl -H "Authorization: Bearer <Clerk-Token>" "$API/api/admin/artists?status=pending"
   ```
   → **HTTP 200** mit JSON-Array (nicht 422, nicht 403).
6. Ausloggen, erneut mit derselben E-Mail einloggen → weiterhin genau eine Zeile.
   (Zusätzlich abgesichert: `artists.email` und `artists.supabase_user_id` sind
   unique; ein paralleler Doppel-Login fängt den `IntegrityError` ab und gibt die
   bestehende Zeile zurück, statt eine zweite anzulegen.)

Schritt 5 und 6 sind zusätzlich als automatischer Test hinterlegt:
`backend/tests/test_guards.py::test_admin_can_reach_admin_routes`.
