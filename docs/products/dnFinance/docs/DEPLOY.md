# dnFinance — Deploy Guide

**UpdatedAt:** 2 August 2026

## Local development (no Docker)

```bash
cd dnFinance
npm install
cp .env.dev .env
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000/api/v1 |
| Swagger | http://localhost:3000/api/docs |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default 3000) |
| `FRONTEND_URL` | No | CORS origin (default localhost:5173) |
| `JWT_SECRET` | Yes (prod) | JWT signing secret |
| `DATABASE_URL` | No | PostgreSQL — enables JSONB snapshot sync |
| `REDIS_URL` | No | Redis — Bull queue + distributed cache |
| `GMAIL_USER` | No | Gmail address for real email |
| `GMAIL_APP_PASSWORD` | No | Gmail app password |
| `DNF_STORE_DIR` | No | Override data directory (tests) |
| `RATE_LIMIT_PER_MIN` | No | Default 100 |

See `.env.dev` for template.

## Build & test

```bash
npm run build
npm run test        # 78 tests
npm run test:coverage
```

## Docker (staging/production)

```bash
docker build -t dnaccounting-api .
docker run -p 3000:3000 --env-file .env dnaccounting-api
```

## Staging (GitHub Actions → Cloud Run)

Workflow: `.github/workflows/deploy-staging.yml`

**Required GitHub secrets:**
- `GCP_SA_KEY`
- `GCP_PROJECT_ID`
- GCP Secret Manager: `dnfinance-jwt-staging`, `dnfinance-db-staging`, `dnfinance-redis-staging`, `dnfinance-gmail-user`, `dnfinance-gmail-pass`

Trigger: push to `main`.

## Frontend deploy

Build static assets:

```bash
npm run build -w apps/frontend
# dist/ → Vercel / Cloudflare Pages
```

Set `VITE_API_URL=https://your-api.example.com/api/v1`.

## Database migrations

Reference SQL (not yet full runtime ORM):
- `database/migrations/001_init.sql`
- `database/migrations/002_extensions.sql`
- `database/migrations/003_departments.sql`

## Production checklist

- [ ] `JWT_SECRET` rotated
- [ ] `DATABASE_URL` → managed PostgreSQL
- [ ] `REDIS_URL` → managed Redis
- [ ] Gmail app password configured
- [ ] GCP secrets + staging deploy verified
- [ ] Frontend `VITE_API_URL` pointed to API
- [ ] Load test 100 concurrent users
- [ ] Security audit (OWASP Top 10)
