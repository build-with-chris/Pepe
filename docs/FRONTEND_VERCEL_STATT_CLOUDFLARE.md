# Frontend: von Cloudflare zu Vercel

Das Repo enthält noch Cloudflare Workers/Pages-Artefakte (`frontend/wrangler.toml`, `frontend/_worker.js`, Build kopiert `_worker.js` nach `dist/`). **Vercel braucht das nicht** – Routing über `frontend/vercel.json` (SPA-Rewrites).

## 1. Vercel-Projekt anlegen

1. [vercel.com](https://vercel.com) → **Add New… → Project** → GitHub-Repo wählen.
2. **Root Directory:** `frontend`
3. Framework: **Vite** (oder „Other“ mit Build `npm run build`, Output `dist` – entspricht `vercel.json`).
4. **Environment Variables** (wie bisher auf Cloudflare, Namen aus `frontend/.env.example`):
   - `VITE_API_URL` → deine Render-Backend-URL  
   - `VITE_CLERK_PUBLISHABLE_KEY`, ggf. weitere `VITE_*`  
   - **Vercel Blob:** `BLOB_READ_WRITE_TOKEN` (lokal oft in `.env`, auf Vercel unter Project Settings)
5. **Deploy** – Testen: Production-URL und Preview-Deployments.

## 2. Clerk anpassen

Im [Clerk Dashboard](https://dashboard.clerk.com):

- **Allowed origins / Frontend API:** Vercel-URL(s) (`https://….vercel.app`, Custom Domain).
- **Redirect URLs** (Sign-in / Sign-up / After sign-in): auf die neuen URLs umstellen.
- Alte Cloudflare-URLs entfernen oder erst nach Cutover parallel lassen.

## 3. Backend CORS

In **Render** (oder wo das Flask-Backend läuft) `CORS_ORIGINS` setzen, z. B.:

`https://deine-app.vercel.app,https://pepeshows.de`

Inkl. **Preview-Deployments**, falls du die nutzt (Wildcard `https://*.vercel.app` ist in `app.py` schon im Default-Fallback, wenn `CORS_ORIGINS` leer ist – in Production lieber explizit eintragen).

## 4. Domain (DNS)

**Option A – DNS bei Vercel:** Domain im Vercel-Projekt hinzufügen; Vercel zeigt dir **CNAME/A-Records**.

**Option B – DNS bleibt bei Cloudflare (nur DNS):**  
Domain auf **DNS only** (graue Wolke, kein Proxy), CNAME wie von Vercel vorgegeben – dann hostest du nur noch DNS bei Cloudflare, **nicht** Pages/Workers.

**Option C – Nameserver komplett weg von Cloudflare:** beim Domain-Registrar auf Vercel (oder anderen DNS) umstellen.

Wichtig: Solange die **öffentliche URL** der Seite wechselt, müssen Clerk + CORS + ggf. `VITE_PUBLIC_SITE_URL` mitziehen.

## 5. Cloudflare-Projekte abschalten

- **Workers & Pages:** betroffenes Projekt (`wrangler.toml` → `name = "pepe…"`) löschen oder deploy stoppen.
- **Custom Domains** dort entfernen, bevor du die Domain an Vercel hängst (sonst Konflikte).
- Abos/Quotas prüfen, nichts doppelt bezahlen.

## 6. Repo-Aufräumen (optional)

- `frontend/wrangler.toml` und `frontend/_worker.js` kannst du löschen oder nach `docs/archive/` legen, wenn **nur noch Vercel** deployt wird.
- Build-Script `vite build && cp _worker.js dist/` kann zu `vite build` vereinfacht werden – **erst nachdem** niemand mehr über Wrangler deployt.

## Was **nicht** „Weg von Cloudflare“ ist

- **Turnstile** (Bot-Schutz) ist ein Cloudflare-Produkt, läuft aber auf **jeder** Website – unabhängig davon, wo das Frontend gehostet wird. Keys bleiben in den `VITE_TURNSTILE_*` / Backend-Env.

## Kurz-Checkliste

- [ ] Vercel-Projekt (`frontend` root), Env-Vars, erfolgreicher Build  
- [ ] Clerk URLs/Origins  
- [ ] `CORS_ORIGINS` am Backend  
- [ ] Custom Domain auf Vercel + DNS  
- [ ] Cloudflare Pages/Worker abgeschaltet, Domain dort gelöst  
- [ ] Optional: Wrangler/Worker aus Repo entfernen, Build vereinfachen  
