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
│                   (Render - Flask/Python)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Clerk JWT   │  │ SQLAlchemy  │  │ REST API Routes         │  │
│  │ Verification│  │ ORM         │  │ /api/* /auth/* /admin/* │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│               (Render PostgreSQL - pepe_prod_db)                │
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

### Backend (Render)
- Python Flask + SQLAlchemy
- Flask-Migrate (Alembic migrations)
- Clerk JWT verification
- Flasgger (Swagger API docs)

### Database (Render PostgreSQL)
- PostgreSQL managed by Render
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
├── backend/                  # Flask backend (deployed to Render)
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
VITE_API_URL=http://localhost:5001           # Backend URL (dev)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx       # Clerk public key
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx     # Vercel Blob token
```

### Backend (`backend/.env`)
```env
CLERK_SECRET_KEY=sk_test_xxx                 # Clerk secret key
DATABASE_URL=postgresql://user:pass@host/db  # Render PostgreSQL URL
FLASK_ENV=development
FLASK_DEBUG=1
```

## Local Development

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:frontend  # Frontend on :5173
npm run dev:backend   # Backend on :5001
```

## Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

**Vercel Environment Variables:**
- `VITE_API_URL` = Backend Render URL (e.g., `https://pepe-backend.onrender.com`)
- `VITE_CLERK_PUBLISHABLE_KEY` = Clerk public key
- `BLOB_READ_WRITE_TOKEN` = Vercel Blob token

### Backend → Render
1. Connect GitHub repo to Render
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `gunicorn app:app`
4. Add environment variables:
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL` (auto-set if using Render PostgreSQL)

### Database → Render PostgreSQL
- Managed PostgreSQL on Render
- Auto-connected via `DATABASE_URL`
- Run migrations: `flask db upgrade`

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
