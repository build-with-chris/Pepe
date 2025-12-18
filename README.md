# Pepe Shows - Artist Booking Platform

A full-stack booking application for an artist agency with artist management, booking requests, and invoicing.

## Tech Stack

### Frontend
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Clerk Authentication
- Vercel Blob Storage (images/documents)

### Backend
- Python Flask + SQLAlchemy
- PostgreSQL (Render)
- Clerk JWT verification

## Project Structure

```
pepe-shows/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/storage/  # Vercel Blob upload utils
│   │   └── context/
│   └── .env
├── backend/           # Flask backend
│   ├── routes/
│   ├── models.py
│   ├── app.py
│   └── .env
└── README.md
```

## Storage Structure (Vercel Blob)

```
├── artists/{artistId}/profile.webp      # Profile image
├── artists/{artistId}/hero.webp         # Hero/banner image
├── artists/{artistId}/gallery/{ts}.webp # Gallery images
└── invoices/{artistId}/{filename}       # Invoice documents
```

## Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL database (Render)
- Clerk account
- Vercel account with Blob storage

### Environment Variables

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5001
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
```

**Backend** (`backend/.env`):
```env
CLERK_SECRET_KEY=sk_test_xxx
DATABASE_URL=postgresql://user:pass@host:5432/db
FLASK_ENV=development
```

### Installation

```bash
# Install all dependencies
npm run install:all

# Start development (both frontend and backend)
npm run dev

# Or start separately:
npm run dev:frontend  # Frontend on :5173
npm run dev:backend   # Backend on :5001
```

## Deployment

- **Frontend**: Vercel (auto-deploy from main branch)
- **Backend**: Render
- **Database**: Render PostgreSQL
- **Storage**: Vercel Blob

## API Documentation

Swagger UI available at `/api-docs/` when backend is running.

## Features

- Artist profile management with image uploads
- Booking request system
- Availability calendar
- Invoice management
- Admin dashboard
- Multi-language support (DE/EN)
