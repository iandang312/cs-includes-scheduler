# CS-INCLUDES Scheduler

Mentor + Mentee calendar scheduling platform.

## Tech
- **Frontend**: Next.js (TypeScript) in `frontend/`
- **Backend**: FastAPI (Python) in `backend/`
- **DB**: PostgreSQL
- **Auth**: Email + password (session cookie)

## Quickstart (Docker)
1. Create a `.env` at repo root (copy from `.env.example`).
2. Run:

```bash
docker compose up --build
```

- Backend: `http://localhost:8000/health`

### Frontend (optional)
To also run the Next.js frontend via Docker Compose:

```bash
docker compose --profile frontend up --build
```

Frontend: `http://localhost:3000`

## Google Calendar Feed
- Set `GOOGLE_CALENDAR_ID` and `GOOGLE_CALENDAR_API_KEY` in the repo-root `.env`.
- Signed-in mentors and mentees will see upcoming events from that calendar on the dashboard.
- This is a read-only feed. If the calendar is private or the API key cannot access it, the dashboard will show a configuration error instead of live events.

## Roles
- **Admin**: set by `ADMIN_EMAILS` (comma-separated). On first login, matching emails are assigned Admin.\n
- **Mentor**: admins can promote via `/admin/users` UI.\n
- **Mentee**: default.
