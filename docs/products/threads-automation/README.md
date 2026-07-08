# Threads Automation Posting System

Aplikasi web untuk schedule dan auto-publish posts ke akun Threads. Dibangun sesuai PRD/SRS/SDD v1.0.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, MUI, Redux Toolkit |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| Queue | Bull (Redis) |
| Automation | Playwright |
| Scheduler | node-cron |

## Quick Start

### 1. Prerequisites

- Node.js 18+
- Docker & Docker Compose

### 2. Setup

```bash
# Clone & install
npm install

# Copy environment
cp .env.example .env

# Start PostgreSQL & Redis
npm run docker:up

# Run migrations
npm run db:migrate

# Start dev servers (API :3000, Frontend :5173)
npm run dev
```

### 3. Login

Buka http://localhost:5173 dan login dengan username/password Threads.

> **Development mode:** Set `PLAYWRIGHT_DRY_RUN=true` di `.env` untuk simulasi login/publish tanpa browser automation.

## API Endpoints

Base URL: `http://localhost:3000/v1`

### Auth
- `POST /auth/login` — Login dengan Threads credentials
- `POST /auth/logout` — Logout
- `GET /auth/me` — Get current user
- `PUT /auth/preferences` — Update notification preferences

### Posts
- `POST /posts` — Create scheduled post
- `GET /posts` — List posts (filter: status, search, date)
- `GET /posts/scheduled` — Upcoming queue
- `GET /posts/published` — Published history
- `GET /posts/failed` — Failed posts
- `PUT /posts/:id` — Update scheduled post
- `DELETE /posts/:id` — Cancel post
- `POST /posts/import` — Bulk CSV import
- `POST /posts/:id/retry` — Manual retry

### Dashboard
- `GET /dashboard/stats` — Dashboard statistics
- `GET /dashboard/timeline` — Activity timeline
- `GET /dashboard/queue` — Queue status
- `GET /dashboard/notifications` — In-app notifications

## CSV Import Format

```csv
caption,date,time,timezone
"Good morning! #threads",2026-06-23,09:00,Asia/Jakarta
"Afternoon vibes",2026-06-23,15:00,Asia/Jakarta
```

## Architecture

```
Frontend (React) → API (Express) → PostgreSQL
                                 → Redis/Bull Queue
                                 → Playwright → Threads.net
```

## Features (MVP)

- [x] Threads login dengan credential encryption
- [x] Single post scheduler dengan preview
- [x] Bulk CSV import dengan validation & rollback
- [x] Auto-publish engine (Bull queue + cron)
- [x] Dashboard: upcoming, published, failed
- [x] Retry mechanism (3x exponential backoff)
- [x] In-app & email notifications
- [x] Settings & notification preferences

## Production Notes

1. Set `PLAYWRIGHT_DRY_RUN=false` untuk real browser automation
2. Ganti `JWT_SECRET` dan `ENCRYPTION_KEY` dengan nilai aman
3. Konfigurasi `SENDGRID_API_KEY` untuk email notifications
4. Install Playwright browsers: `npx playwright install chromium`

## License

Private — internal use only.
