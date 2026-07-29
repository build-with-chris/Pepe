# SPEC: Auth vereinheitlichen, Clerk-Identität, Secrets

Ersetzt F1 + F2 + F7 aus `docs/BACKLOG-ANALYSE.md`.

## Kern

Ein neu registrierter Artist kommt mit seiner **echten E-Mail** in der Datenbank an, und die
Admin-Endpoints antworten auf ein Clerk-Token mit `200` statt `422`. Danach existiert im Backend
genau **ein** Auth-System. Woran man es merkt: `GET /api/admin/artists?status=pending` liefert eine
Liste, und in `artists.email` steht nirgends mehr `@clerk.placeholder`.

## Nicht-Ziele

- **Keine Datenmigration.** Die Produktions-DB enthält einen einzigen unvollständigen Datensatz — der
  wird gelöscht, nicht migriert. Das streicht den größten Einzelposten des ursprünglichen F2.
- **Keine Rollenverwaltung im UI.** Es gibt genau einen Admin; das `is_admin`-Flag wird per SQL gesetzt.
- **Kein Redis für Rate-Limiting/Idempotency.** Die In-Memory-Lösung bleibt; die Einschränkung wird
  in `backend/README.md` dokumentiert, nicht behoben.
- **Kein Umbenennen von `supabase_user_id` → `clerk_user_id`.** Reine Kosmetik, berührt Migrationen
  und Queries an vielen Stellen — kein Gegenwert in dieser Spec.
- **Keine Entfernung der übrigen Debug-Endpoints** außer den beiden unten genannten. `/__debug/cors`
  und `/__debug/whoami` sind harmlos genug, um zu bleiben.

## Betroffene Dateien und Schnittstellen

| Pfad | Änderung |
|---|---|
| `backend/routes/admin_routes.py` | Alle 20 Routen: `@jwt_required()` → `@clerk_auth_required`; `get_jwt_identity()` → Clerk-UID → `Artist` → `artist.id` |
| `backend/routes/request_routes.py` | 5 Routen umstellen (`list_requests`, `list_requests_admin`, `set_offer`, `accept_request`, `delete_request`); Identitäts-Semantik vereinheitlichen |
| `backend/routes/auth_routes.py` | **Datei löschen** (Legacy-Passwort-Login, enthält auch `/auth/debug-secret`) |
| `backend/helpers/authz.py` | **Datei löschen** (toter Supabase-Code) |
| `backend/app.py` | `JWTManager` + Blueprint-Registrierung von `auth_bp` entfernen; `/__debug/db` entfernen (leakt DB-Credentials); Doppelprüfung in `_admin_gate_by_db` auflösen |
| `backend/helpers/clerk_auth.py` | JWKS-URL aus ENV (`CLERK_JWKS_URL`) statt hardcodiert; auf Production-Instanz zeigen |
| `backend/routes/api_routes.py` | Placeholder-Pfad (`@clerk.placeholder`, Zeile 477) ersatzlos entfernen; `ensure_my_artist` und `get_current_user` auf einen gemeinsamen Pfad reduzieren |
| `backend/config.py` | `SECRET_KEY`/`JWT_SECRET_KEY` aus `SUPABASE_JWT_SECRET` entfernen |
| `backend/requirements.txt` | `flask-jwt-extended` entfernen |
| `frontend/src/context/AuthContext.tsx` | `getToken({ template: '…' })` statt `getToken()` |
| `frontend/wrangler.toml` | Alle Secrets aus `[vars]` entfernen |
| `frontend/.env.example` | Auf Clerk umstellen, Supabase-Einträge raus |
| `backend/tests/conftest.py`, `test_guards.py` | Auf Clerk-Token-Fixtures umstellen |
| **Neu:** Clerk Dashboard | JWT-Template mit `email`, `name`, `public_metadata`; Production-Instanz |

## Akzeptanzkriterien

| # | Kriterium (prüfbar formuliert) | Aufwand |
|---|---|---|
| 1 | `grep -rn "jwt_required\|get_jwt_identity\|flask_jwt_extended" backend/` liefert **0 Treffer**. Die Checkliste aller 40 Fundstellen in 4 Dateien ist abgearbeitet und im Commit dokumentiert. | 3–4 h |
| 2 | `POST /api/admin/artists/<id>/approve` setzt `approved_by` auf eine **Integer**-Artist-ID, nicht auf einen Clerk-String. | 1 h |
| 3 | Ein frisch decodierter Clerk-Token enthält `email` und `name`; `AuthContext` fordert das Template an. | 1–2 h |
| 4 | `CLERK_JWKS_URL` kommt aus der Umgebung; ein Wechsel der Instanz erfordert keine Codeänderung. | 0,5 h |
| 5 | Clerk-Production-Instanz ist eingerichtet, Keys getauscht, Login funktioniert gegen Production. | 2–3 h |
| 6 | Ein Signup mit neuer E-Mail erzeugt **genau einen** Artist-Datensatz mit korrekter E-Mail. Zweiter Login desselben Users erzeugt keinen weiteren. | 2–3 h |
| 7 | `SHADCNBLOCKS_API_KEY` ist rotiert; `git grep "sk_live_"` liefert 0 Treffer; Produktions-Build startet ohne `Missing VITE_CLERK_PUBLISHABLE_KEY`. | 1–2 h |
| 8 | `/__debug/db` und `/auth/debug-secret` antworten mit 404. | 0,5 h |
| 9 | Der eine unvollständige Artist-Datensatz ist gelöscht; `SELECT count(*) FROM artists WHERE email LIKE '%clerk.placeholder'` ergibt 0. | 0,5 h |

**Summe: 12–17 h** — Referenzklasse: die bisherige Clerk-Umstellung (~8 Commits, mehrere Wochen,
nie fertig geworden, weil das Backend nur punktuell angefasst wurde). Die Lehre daraus steckt in
Kriterium 1: **vollständige Routen-Checkliste statt punktueller Fixes**. Ohne diese Disziplin
wiederholt sich das Ergebnis.

**Drumherum:** Tests umstellen (`conftest.py` und `test_guards.py` hängen an `flask_jwt_extended`)
2–3 h · `pytest` überhaupt lauffähig machen 0,5 h · Rollout lokal → Produktion 1 h.
**Gesamt realistisch: 2–3 Arbeitstage.**

## Unterhalb der Schnittlinie (v2, bewusst verschoben)

- Redis-basiertes Rate-Limiting und Idempotency (aktuell pro Prozess, bei mehreren Workern wirkungslos)
- `supabase_user_id` → `clerk_user_id` umbenennen
- `/__debug/cors`, `/__debug/whoami` entfernen
- `/api/admin/migrate-database-temp` entfernen
- `lib/supabase.ts` im Frontend entfernen
- Rollenverwaltung im Admin-UI

## Riskanteste Annahme

**Dass das Clerk-JWT-Template die E-Mail zuverlässig in jeden Token schreibt.** Wenn nicht, bricht
Kriterium 6 und der gesamte Onboarding-Pfad bleibt kaputt — der teuerste Fehlschlag dieser Spec.

*Billig vorab prüfbar:* Template im Clerk-Dashboard anlegen, im Browser `await window.Clerk.session.getToken({template:'…'})`
aufrufen und den Token auf jwt.io dekodieren. Fünf Minuten, bevor eine Zeile Backend-Code angefasst wird.
Falls das Template nicht greift: Fallback über die Clerk Backend-API (`users.getUser`) einplanen — dann
+2 h und eine zusätzliche Abhängigkeit.

## End-to-End-Prüfschritt

1. Datenbank leeren (`DELETE FROM artists`).
2. Im Browser mit einer neuen E-Mail registrieren.
3. `SELECT id, email, supabase_user_id, approval_status FROM artists;` → genau eine Zeile,
   echte E-Mail, gefüllte Clerk-UID, Status `unsubmitted`.
4. `UPDATE artists SET is_admin = true WHERE id = <diese id>;`
5. `curl -H "Authorization: Bearer <Clerk-Token>" $API/api/admin/artists?status=pending`
   → **HTTP 200** mit JSON-Array (nicht 422, nicht 403).
6. Ausloggen, erneut mit derselben E-Mail einloggen → immer noch genau eine Zeile in `artists`.

## Offene Punkte

- Ob der Wechsel auf die Clerk-Production-Instanz eine neue Domain-Verifikation erfordert (Google-Login
  hängt daran). Vor Kriterium 5 im Clerk-Dashboard prüfen.
- Ob `SHADCNBLOCKS_API_KEY` bereits in der Git-History liegt — falls ja, ist Rotation zwingend und
  nicht optional.
