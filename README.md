# Pepe Shows - Artist Booking Platform

A full-stack booking application for an artist agency with artist management, booking requests, and invoicing.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (Vercel - React/Vite)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Clerk Auth  │  │ shadcn/ui   │  │ Vercel Blob (images)    │  │
│  │ (login/JWT) │  │ components  │  │ - profile/hero images   │  │
│  └─────────────┘  └─────────────┘  │ - gallery images        │  │
│                                     │ - invoice documents     │  │
│                                     └─────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ API calls (JWT auth)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│      (Flask/Python – Vercel-Service, gleiche Domain wie das UI)  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Clerk JWT   │  │ SQLAlchemy  │  │ REST API Routes         │  │
│  │ Verification│  │ ORM         │  │ /api/* /auth/* /admin/* │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│            (PostgreSQL, z. B. Supabase – empfohlen)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ artists     │  │ bookings    │  │ invoices                │  │
│  │ disciplines │  │ requests    │  │ availabilities          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend (Vercel)
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- Clerk Authentication (JWT tokens)
- Vercel Blob Storage (images/documents)
- i18next (DE/EN translations)

### Backend (Flask)
- Python Flask + SQLAlchemy
- Flask-Migrate (Alembic migrations)
- Clerk JWT verification
- Flasgger (Swagger API docs)

### Database (PostgreSQL)
- Z. B. **Supabase** oder anderer Managed-Postgres (siehe `backend/docs/SUPABASE_MIGRATION.md`)
- Tables: artists, disciplines, booking_requests, invoices, availabilities

### Storage (Vercel Blob)
- Profile images: `artists/{id}/profile.webp`
- Hero images: `artists/{id}/hero.webp`
- Gallery: `artists/{id}/gallery/{timestamp}.webp`
- Invoices: `invoices/{artistId}/{filename}`

## Project Structure

```
pepe-shows/
├── frontend/                 # React frontend (deployed to Vercel)
│   ├── src/
│   │   ├── components/       # UI components (shadcn/ui based)
│   │   ├── pages/            # Route pages
│   │   ├── lib/storage/      # Vercel Blob upload utilities
│   │   ├── context/          # React context (Auth, etc.)
│   │   └── i18n/             # Translation files
│   ├── .env                  # Frontend env vars
│   └── vercel.json           # Vercel config
│
├── backend/                  # Flask backend (Deploy als Vercel-Service, siehe vercel.json im Repo-Root)
│   ├── routes/               # API route blueprints
│   │   ├── api_routes.py     # /api/* endpoints
│   │   ├── auth_routes.py    # /auth/* endpoints
│   │   ├── admin_routes.py   # /api/admin/* endpoints
│   │   └── request_routes.py # Booking request endpoints
│   ├── helpers/              # Utility functions
│   │   └── clerk_auth.py     # Clerk JWT verification
│   ├── models.py             # SQLAlchemy models
│   ├── config.py             # App configuration
│   ├── app.py                # Flask app entry point
│   ├── migrations/           # Alembic DB migrations
│   └── .env                  # Backend env vars
│
└── README.md
```

## Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://127.0.0.1:5000           # Backend-URL (dev; Port wie bei `python app.py`)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx       # Clerk public key
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx     # Vercel Blob token
```

### Backend (`backend/.env`)
Siehe `backend/.env.example`. Wichtigste Variablen:

```env
CLERK_SECRET_KEY=sk_test_xxx
DATABASE_URL=postgresql://...                 # z. B. Supabase (siehe backend/docs/SUPABASE_MIGRATION.md)
FLASK_SECRET_KEY=random-long-string         # für Production setzen
FLASK_ENV=development
FLASK_DEBUG=1
SUPABASE_URL=                               # Storage / Service-API
SUPABASE_SERVICE_ROLE_KEY=
```

## Local Development

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:frontend  # Frontend on :5173
npm run dev:backend   # Backend (Flask-Default meist :5000)
```

## Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

**Vercel Environment Variables:**
- `VITE_API_URL` = die eigene Domain, `https://pepeshows.de`
- `VITE_CLERK_PUBLISHABLE_KEY` = Clerk public key

### Backend → Vercel (gleiches Projekt, zweiter Service)
Die API ist **Flask**; die Datenbank liegt bei **Supabase**. Frontend und Backend
laufen als zwei Services in **einem** Vercel-Projekt (`pepe-services`,
Framework-Preset "Services"):

```
pepeshows.de/            -> Service "frontend" (Vite)
pepeshows.de/api/...     -> Service "backend"  (Flask)
```

Beide liegen damit auf derselben Herkunft, CORS entfällt im Produktionsbetrieb.
Die Aufstellung steht in **`vercel.json`** im Repo-Root, die vollständigen
Umzugsschritte in `docs/ROLLOUT-3-vercel-backend.md`.

Umgebungsvariablen im Vercel-Projekt setzen, mindestens:
- `DATABASE_URL` – Supabase Connection String (Pooler, `sslmode=require` wie lokal)
- `CLERK_JWKS_URL` – ohne den Wert wird jedes Token mit 401 abgelehnt
- `BLOB_READ_WRITE_TOKEN` – ohne den Wert schlägt **jeder** Bildupload mit 500 fehl
- `FLASK_SECRET_KEY`, `SUPABASE_*`, SMTP falls genutzt

`render.yaml` liegt noch im Repo-Root, beschreibt aber kein laufendes Deployment
mehr: Die Render-Dienste sind stillgelegt.

Siehe auch `backend/docs/SUPABASE_MIGRATION.md`.

### Database → Supabase PostgreSQL (empfohlen)
- Connection String aus dem Supabase-Dashboard
- Migrationen: `cd backend && flask db upgrade`
- Optional: Daten von alter Postgres-Instanz mit `pg_dump` / `psql` migrieren

## API Documentation

Swagger UI available at `/api-docs/` when backend is running.

## Features

- **Artist Profiles**: Image uploads, bio, disciplines, pricing
- **Booking System**: Request workflow (pending → accepted → completed)
- **Availability Calendar**: Artists set available dates
- **Invoice Management**: Upload and track invoices
- **Admin Dashboard**: Approve artists, manage bookings
- **Multi-language**: German and English (i18next)
- **Role-based Access**: Admin vs Artist views

## Test Accounts

14 test artists available (pepe-001 to pepe-014):
- Email: `pepe-XXX@deniskreuzer.dk`
- Admin: `pepe-014@deniskreuzer.dk` (Zara Magic)

All test artists have pre-loaded profile/hero images and are pre-approved.
