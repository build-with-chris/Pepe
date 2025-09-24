# Booking App Artistenagentur - Claude Configuration

## Development Commands
- Start full dev environment: `npm run dev`
- Start backend only: `npm run dev:backend`
- Start frontend only: `npm run dev:frontend`
- Install all dependencies: `npm run install:all`

## Backend (Python/Flask)
- Located in `/backend`
- Main app: `app.py`
- Models: `models.py`
- Virtual env: `.venv` or `.venv-backend`
- Requirements: `requirements.txt`

## Frontend (React/TypeScript/Vite)
- Located in `/frontend`
- Built with React, TypeScript, Vite
- Uses shadcn/ui components
- Config: `vite.config.ts`, `tsconfig.json`

## Testing
- Backend tests: `/backend/tests`
- Use pytest for backend testing

## Notes
- This is a full-stack booking application for an artist agency
- Backend uses Flask with SQLAlchemy
- Frontend uses React with TypeScript and Vite
- Deployment ready with Cloudflare Pages/Workers