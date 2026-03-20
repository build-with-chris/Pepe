# Backend: Supabase & neues API-Hosting

Ziel: **PostgreSQL und Storage über Supabase**; **API** auf einem Anbieter deiner Wahl (nicht mehr an einen festen Legacy-Host gebunden).

## Was du heute schon hast

| Komponente | Status |
|------------|--------|
| **Postgres** | Flask nutzt `DATABASE_URL` + SQLAlchemy. Jede Postgres-URL funktioniert – inkl. **Supabase**. |
| **Auth** | **Clerk** (`CLERK_*`, JWKS) – unabhängig von Render. |
| **Dateien** | Teils **Supabase Storage** (z. B. Rechnungen), teils **Vercel Blob** (Frontend-Profilbilder). |

Früher typisch: **ein PaaS für Web + Postgres**. Supabase übernimmt **Datenbank** (und Storage); den **Flask-Server** hostest du separat (Railway, Fly.io, Cloud Run, VPS, …).

---

## Passt die Anleitung, wenn die DB schon existiert und nichts verloren gehen soll?

**Grundsätzlich ja** – dieselben Werkzeuge (`DATABASE_URL`, `pg_dump` / Import, `flask db upgrade`).  
**Aber:** Phase 1 unten war für ein **neues oder leeres Ziel** gedacht. Bei einer **bereits genutzten** Supabase-Instanz musst du **zusätzlich** die nächsten Abschnitte beachten, sonst riskierst du **Kollisionen** oder **Überschreiben**.

### Bestehende Supabase / bestehender Postgres – nichts verlieren

1. **Immer zuerst Backup der Quelle** (Render o. Ä.):

   ```bash
   pg_dump "$RENDER_DATABASE_URL" -Fc -f pepe_render_backup.dump
   ```

   Zusätzlich Backup der **Ziel**-Datenbank, falls dort schon produktive Daten liegen (Supabase: ggf. über Dashboard oder eigene `pg_dump`-URL).

2. **Prüfen: Gibt es schon Tabellen der Pepe-App im Ziel?**  
   Namen wie `artists`, `booking_requests`, `alembic_version` im Schema `public` – wenn ja, ist das **kein** „frisches“ Ziel.

3. **Drei typische Fälle**

   | Situation | Empfehlung |
   |-----------|------------|
   | **Neues Supabase-Projekt** oder `public` ist für Pepe noch **leer** | Wie „Phase 1“: Schema per `flask db upgrade`, danach **Daten** importieren (siehe unten) **oder** vollständigen Dump wiederherstellen und Alembic-Stand prüfen. |
   | **Gleiche App**, nur Host wechseln (Render → Supabase) | Am sichersten: **logischer Dump** der **kompletten** DB (`pg_dump -Fc`) und **Restore in leere Ziel-DB**; danach `DATABASE_URL` umstellen und `alembic_version` mit eurem Code-Stand vergleichen. |
   | **Supabase wird schon für andere Apps genutzt** (`public` belegt) | **Nicht** blind `flask db upgrade` auf `public` laufen lassen. Optionen: **eigenes Supabase-Projekt**, oder **eigenes Schema** (z. B. `pepe`) + Anpassung in SQLAlchemy (größerer Eingriff), oder sicherstellen, dass Tabellennamen **nirgends** kollidieren. |

4. **Reihenfolge: Schema vs. Daten (kurz)**

   - **Ziel leer:** Entweder  
     **A)** `flask db upgrade` → dann **nur Daten** von Render importieren (`pg_dump --data-only` passend zum Schema), **oder**  
     **B)** vollständigen `pg_dump` von Render ins Ziel spielen, falls die Postgres-Versionen kompatibel sind – danach prüfen, ob Migrationen/ `alembic_version` zum aktuellen Code passen.  
   - **Ziel hat fremde Daten:** Nur **A** oder **B** anwenden, wenn ihr **keine** bestehenden Tabellen überschreibt; sonst erst Schema-Trennung klären (s. o.).

5. **Nichts „still“ löschen:** Cutover erst, wenn die App mit der **neuen** `DATABASE_URL` getestet ist; alte Render-DB erst **nach** erfolgreichem Betrieb abschalten.

Die übrigen Phasen (Storage, API-Hosting, Frontend) bleiben **unverändert** gültig.

---

## Phase 1: Supabase-Projekt & Datenbank

1. Entweder ein **neues** [Supabase](https://supabase.com)-Projekt anlegen **oder** ein **bestehendes** nutzen (dann Abschnitt „Bestehende Supabase …“ oben beachten).
2. **Settings → Database**:
   - **Connection string** (URI) kopieren – am besten **Session mode** (Port **5432**) für Migrationen / `flask db upgrade`.
   - Für hohe Last später: **Transaction pooler** (Port **6543**) – dann Connection-Pooling beachten.
3. `DATABASE_URL` in `.env` setzen (siehe `.env.example` im Backend).

> Die App hängt `sslmode=require` an, wenn die URL auf Supabase zeigt (siehe `config.py`).

4. **Schema anlegen**

   **Wichtig:** Die Alembic-Historie enthält **keine** initiale „alle Tabellen anlegen“-Migration — sie geht von einer **bestehenden** Pepe-DB aus (`ALTER TABLE artists`, …). Außerdem gab es früher **zwei Heads** (`7759e31194a7` und `gage_calc_001`); das ist per **Merge-Revision `8f4c2b9e1a0d`** bereinigt. `flask db upgrade` sollte danach wieder mit einem eindeutigen **Head** laufen.

   | Situation | Vorgehen |
   |-----------|----------|
   | **Bereits eine Pepe-Postgres-DB** (Render o. Ä.) mit Tabellen | Logischer Dump einspielen **oder** nur URL umstellen; dann `flask db upgrade` (stellt Schema auf den Stand der Migrationen). |
   | **Neue / leere DB** (nur fremde Tabellen z. B. Kanban, **keine** `artists` etc.) | **Nicht** nur `flask db upgrade` — schlägt mit `relation "artists" does not exist` fehl. Stattdessen Bootstrap: |

```bash
cd backend
source .venv/bin/activate   # oder dein venv
# DATABASE_URL in backend/.env auf Supabase setzen
python scripts/bootstrap_empty_postgres.py
```

   Das Script macht `db.create_all()` (Schema laut `models.py`) und setzt `alembic_version` auf den Merge-Head **`8f4c2b9e1a0d`**. Bestehende **fremde** Tabellen im Schema `public` werden dabei **nicht** gelöscht.

   **Danach** reicht für Schema-Updates wie gewohnt:

```bash
./scripts/flask_cli.sh db upgrade
# oder: python -m flask --app app:app db upgrade
```

5. **Daten von Render (oder alter Postgres)** erhalten: `pg_dump` von der Quelle und in Supabase einspielen (`pg_restore` / `psql` / SQL Editor) – **nach** Schema-Klarheit (siehe Abschnitt oben). Nicht optional, wenn ihr keine leere Test-DB wollt.

---

## Phase 2: Supabase Storage & Secrets

Unter **Settings → API**:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (nur Backend, nie ins Frontend)

Im Code wird teils `SUPABASE_SERVICE_ROLE` erwartet – setze **beides** gleich oder nutzt nur die in `.env.example` dokumentierte Variable.

Buckets (z. B. `invoices`, `profiles`) in Supabase anlegen und Policies definieren (wer darf lesen/schreiben).

---

## Phase 3: API wo hosten?

Flask + Gunicorn braucht einen **Python-Host**, nicht Supabase selbst.

**Render (empfohlen im Projekt):** Blueprint **`render.yaml`** im **Repo-Root** (`rootDir: backend`, Gunicorn, Healthcheck `/healthz`).  
`DATABASE_URL` = Supabase (im Render-Dashboard setzen). Kleiner Web Service oft **~5 $/Monat**, läuft durchgehend.

**Weitere Optionen:**

| Plattform | Hinweis |
|-----------|---------|
| **Railway** | Einfaches Deploy, Postgres extern (Supabase URL). |
| **Fly.io** | Docker/Procfile, gut für EU-Region. |
| **Google Cloud Run** | Container, skalierbar, Pay-per-use. |
| **DigitalOcean App Platform** | Ähnlich Render. |

Überall dieselben **Env-Vars** wie lokal: `DATABASE_URL` (Supabase), `CLERK_*`, `SUPABASE_*`, `CORS_ORIGINS`, SMTP, etc.

---

## Phase 4: Frontend & DNS

- `VITE_API_URL` auf die **neue API-URL** setzen (Vercel Env).
- Clerk: neue **Allowed origins / redirect URLs** für die API-Domain falls nötig.

---

## „Backend neu aufbauen“ bei vielen Fehlern

Sinnvolle Reihenfolge:

1. **Tests & Linter:** `pytest` im Ordner `backend/tests` – zeigt echte Fehler.
2. **Eine Postgres-URL (Supabase)** + `flask db upgrade` – Schema konsistent.
3. **Env-Check:** Alle Keys aus `.env.example` gesetzt.
4. Erst danach größere Refactors (z. B. dünneres API oder später Supabase Edge Functions für Teile der Logik).

Wenn du **nur** DB/Storage auf Supabase umstellst, musst du die Flask-App nicht komplett neu schreiben – nur **Konfiguration, Deploy und Datenmigration**.

---

## Kurz-Checkliste

- [ ] Quelle **gesichert** (`pg_dump`), Ziel bei Bedarf auch
- [ ] Kollisionen mit **bestehenden** Tabellen in Supabase geklärt (eigenes Projekt / Schema / leeres `public`)
- [ ] Supabase-Projekt + `DATABASE_URL`
- [ ] Schema + Daten in der richtigen **Reihenfolge** (siehe „Bestehende Supabase …“)
- [ ] `flask db upgrade` nur wo passend (leeres Ziel oder bewusste Migration)
- [ ] `SUPABASE_URL` + Service Role für Storage-Endpoints
- [ ] API-Hosting (z. B. **Render** mit `render.yaml`) + Env-Vars
- [ ] Frontend `VITE_API_URL` + Clerk-Anpassungen
- [ ] Nicht mehr genutzte Hosting-Accounts abschalten

Bei Fragen zu einem konkreten Fehler: Log-Auszug + Endpoint nennen.
