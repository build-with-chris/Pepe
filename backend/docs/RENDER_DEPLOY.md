# Backend auf Render – häufige Deploy-Fehler

## 1. Root Directory

Der Service muss im Ordner **`backend`** laufen (enthält `app.py`, `requirements.txt`).

- **Blueprint:** `render.yaml` im Repo-Root setzt `rootDir: backend`.
- **Manuell angelegter Web Service:** unter *Settings* → **Root Directory** = `backend` eintragen (nicht leer / Repo-Root).

Sonst schlägt der Build fehl (`requirements.txt` nicht gefunden) oder `gunicorn app:app` findet kein Modul `app`.

## 2. Python-Version

- Im Dashboard: **`PYTHON_VERSION`** = z. B. `3.11.11` (vollständige Version).
- Lokal abgestimmt: `backend/.python-version` und `backend/runtime.txt` (für andere Tools).

Widersprüche (z. B. `3.10` in `runtime.txt` und `3.11` auf Render) können zu seltsamen Build-/Import-Fehlern führen.

## 3. Environment Variables (Pflicht für Start)

Ohne **`DATABASE_URL`** (Supabase) startet die App zwar mit SQLite-Default, Production sollte die URL **immer** gesetzt sein.

Mindestens setzen:

| Variable | Hinweis |
|----------|---------|
| `DATABASE_URL` | Supabase URI, Sonderzeichen im Passwort URL-encoden |
| `FLASK_SECRET_KEY` | zufälliger langer String |
| `CLERK_SECRET_KEY` | aus Clerk Dashboard |
| `CLERK_PUBLISHABLE_KEY` | optional fürs Backend, aber oft gesetzt |
| `CORS_ORIGINS` | Frontend-URL(s), z. B. `https://….vercel.app` |

Optional: `SUPABASE_*`, SMTP, `CLERK_JWKS_URL` falls nicht aus Publishable Key ableitbar.

## 4. Build-Logs lesen

Im Render-Dashboard: **Logs** → letzter Deploy.

- **`pip install` failed** → Paket/Konflikt; ggf. `buildCommand` aus `render.yaml` (upgrade pip/wheel) nutzen.
- **`ModuleNotFoundError`** → falsches Root Directory oder fehlende Dependency in `requirements.txt`.
- **`bash: gunicorn: command not found`** → Runtime nicht „Python“, oder Build hat nicht installiert.
- **Health Check failed** → Service startet, aber `/healthz` liefert nicht 200 (oft DB nicht erreichbar oder falscher `DATABASE_URL`).

## 5. Datenbank nach dem ersten Deploy

Schema auf Supabase anlegen (lokal oder CI), **nicht** automatisch bei jedem Render-Start:

```bash
cd backend && ./scripts/flask_cli.sh db upgrade
```

(bzw. mit gesetzter `DATABASE_URL` auf die gleiche Supabase-DB.)

## 6. Logs teilen

Wenn es weiter scheitert, kopiere aus Render:

1. **Build**-Log (komplett ab `pip install` bis Fehlerzeile)  
2. **Deploy/Runtime**-Log (erste Zeilen nach `gunicorn` bis Traceback)

Dann kann man gezielt die Ursache nennen.
