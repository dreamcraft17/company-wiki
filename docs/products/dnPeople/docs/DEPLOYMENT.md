# dnPeople — Deployment Guide

**Last Updated:** July 19, 2026  
**Applies to:** MVP 1–5 + PRD v8–v11.0

---

## Panduan terkait

| Panduan | Isi |
|---------|-----|
| [SUPABASE.md](./SUPABASE.md) | Koneksi PostgreSQL managed di Supabase |
| [VPS.md](./VPS.md) | Instal API + frontend di VPS (Nginx, PM2, TLS) |

**Rekomendasi production:** DB di Supabase + app di VPS (lihat kedua panduan di atas).

---

## Prerequisites

- Node.js 20+
- npm
- **Database:** project Supabase (disarankan, **tanpa Docker**) — lihat [SUPABASE.md](./SUPABASE.md)  
  Opsional: Docker Compose hanya jika ingin Postgres lokal

> Deployment baru memakai migration baseline dan `npx prisma migrate deploy`. `db push` hanya untuk prototyping lokal tanpa data penting.

## Local Development (tanpa Docker — default)

```bash
# 1. Backend → isi DATABASE_URL Supabase Session pooler di .env
cd dnpeople/backend
cp .env.example .env
# Edit .env: ganti YOUR_PASSWORD (lihat docs/SUPABASE.md)
npm install
npm run db:migrate
npm run db:seed
npm run dev          # http://localhost:4100

# 2. Frontend
cd ../frontend
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3001
```

Tidak perlu Redis. `docker compose up` hanya menjalankan PostgreSQL lokal bila dipakai.

### Opsional: Postgres lokal via Docker

```bash
cd dnpeople
docker compose up -d
# lalu di backend/.env:
# DATABASE_URL="postgresql://dnpeople:dnpeople@localhost:5433/dnpeople?schema=public"
```

### Environment

**Backend `.env` (Supabase — tanpa Docker)**

```env
DATABASE_URL="postgresql://postgres.bikhnyqslizcckusiyrg:YOUR_PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require&schema=public"
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="24h"
PORT=4100
FRONTEND_URL="http://localhost:3001"
TRUST_PROXY=false
FIELD_ENCRYPTION_KEYS="current-64-char-secret,previous-rotation-secret"
METRICS_TOKEN="strong-observability-token"
BIOMETRIC_VERIFIER_URL="https://biometric-provider.example/verify"
BIOMETRIC_VERIFIER_TOKEN="provider-secret"
BIOMETRIC_MIN_CONFIDENCE=0.8
SENTRY_DSN="https://public-key@o0.ingest.sentry.io/project-id"
SENTRY_ENVIRONMENT="production"
SENTRY_TRACES_SAMPLE_RATE=0.05
APP_RELEASE="dnpeople@release-sha"
HTTP_BACKLOG=2048
CONTRACT_REMINDERS_ENABLED=true
```

Detail field host/user: [SUPABASE.md](./SUPABASE.md).

**Frontend `.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:4100/api/v1
```

Production:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```
### Demo accounts (setelah seed)

| Role | Email | Password |
|------|-------|----------|
| Company Admin | admin@dnpeople.id | Admin123! |
| Employee | budi@dnpeople.id | Employee123! |

## Production Checklist

- [ ] Ikuti [SUPABASE.md](./SUPABASE.md) atau Postgres hardened di VPS
- [ ] Ikuti [VPS.md](./VPS.md) untuk Nginx + PM2 + TLS
- [ ] Ganti `JWT_SECRET` kuat (32+ chars)
- [ ] `FRONTEND_URL` = domain production (comma-separated jika multi)
- [ ] `TRUST_PROXY=1` di belakang Nginx
- [ ] HTTPS only (TLS terminate di Nginx/Caddy)
- [ ] `npm run build` backend + frontend
- [ ] Seed **tidak** dijalankan di production (kecuali bootstrap admin terkontrol)
- [ ] Rate limit & CORS diverifikasi
- [ ] Monitoring `/health`
- [ ] Readiness `/ready` dan metrics `/metrics` terhubung ke monitoring
- [ ] `FIELD_ENCRYPTION_KEYS` kuat, disimpan di secret manager, dan diuji rotasinya
- [ ] Migrasi data sensitif legacy dijalankan sekali dengan `npm run security:migrate-fields`
- [ ] Provider biometrik dikonfigurasi; production sengaja menolak selfie check-in tanpa verifier
- [ ] `SENTRY_DSN`, environment, release, dan sampling dikonfigurasi; event uji dipastikan tidak mengandung PII
- [ ] Reverse proxy memakai keep-alive dan OS listen backlog mendukung target concurrency
- [ ] Workflow backup harian berhasil dan restore drill dilakukan berkala
- [ ] API keys production: rotate & revoke unused (`/integrations/api-keys`)
- [ ] SSO secrets tidak di-commit
- [ ] White-label: logo URL memakai CDN/HTTPS

### Contoh PM2 (ringkas)

```bash
# Backend
cd backend && npm ci && npm run build
pm2 start dist/index.js --name dnpeople-api

# Frontend
cd frontend && npm ci && npm run build
pm2 start npm --name dnpeople-web -- start
```

Detail lengkap: [VPS.md](./VPS.md).

### Nginx (sketch)

```nginx
server {
  server_name app.dnpeople.id;
  location / {
    proxy_pass http://127.0.0.1:3001;
  }
}

server {
  server_name api.dnpeople.id;
  location / {
    proxy_pass http://127.0.0.1:4100;
  }
}
```

## Database Migrations

Clean database dan production deploy:

```bash
npm run db:migrate
```

Database lama yang sebelumnya dibuat dengan `db push` harus di-baseline satu kali setelah diverifikasi cocok dengan schema:

```bash
# Backup database lebih dahulu, lalu dari dnpeople/backend:
npm ci
npx prisma generate
npx prisma migrate resolve --applied 20260712000000_baseline
npm run db:migrate
npx prisma migrate status
```

Perintah `resolve` hanya mencatat migration baseline sebagai sudah diterapkan; perintah ini tidak
menghapus atau membuat ulang tabel. Migration setelah baseline—termasuk constraint audit/attendance,
role HR, dan subscription v5—tetap dijalankan oleh `db:migrate`.

Jangan menandai migration `20260716000000_subscription_tier_gating` sebagai applied sebelum SQL-nya
benar-benar diterapkan. Migration tersebut sudah membuat dan mengisi subscription untuk perusahaan
legacy, sehingga `subscription:migrate-v5` hanya diperlukan sebagai recovery/idempotent data repair.

Jangan menjalankan `db:seed` saat update production. Seed berisi akun dan data demo; gunakan hanya
untuk development atau bootstrap yang memang disengaja.

## Backup & Disaster Recovery

Workflow `.github/workflows/backup.yml` berjalan harian menggunakan secret `BACKUP_DATABASE_URL`. Jika `BACKUP_S3_URI` diisi, dump dan checksum juga dikirim ke object storage dengan server-side encryption.

```bash
# Backup manual
DATABASE_URL="..." BACKUP_DIR=./backups npm run db:backup

# Verifikasi checksum + umur backup (PRD v10.0)
npm run db:verify-backup

# Restore drill ke database staging (ALLOW_RESTORE wajib)
ALLOW_RESTORE=true DATABASE_URL="..." npm run db:restore -- ../backups/dnpeople-YYYYMMDDTHHMMSSZ.dump
# atau wrapper (integrity COUNT employees/payslips/attendance/leave):
ALLOW_RESTORE=true DATABASE_URL="..." npm run db:restore-drill

# Smoke test (health/ready/metrics)
bash scripts/smoke-test.sh

# k6 load tests (butuh k6 + kredensial staging)
BASE_URL=https://staging.dnpeople.id k6 run scripts/loadtest/baseline.js
BASE_URL=https://staging.dnpeople.id k6 run scripts/loadtest/ramp.js

# Load test terautentikasi (butuh k6)
BASE_URL=http://localhost:4100 npm run test:load:auth
```

Setiap backup memakai format custom PostgreSQL dan checksum SHA-256. Restore wajib eksplisit memakai `ALLOW_RESTORE=true` dan diakhiri pemeriksaan status migration. Isi hasil drill di [RESTORE-DRILL-RUNBOOK.md](./RESTORE-DRILL-RUNBOOK.md).

Observability: scrape `/metrics` (includes `payment_webhook_*`, `postgresql_connections`, `attendance_records_today`); opsional Datadog agent — `scripts/install-datadog-agent.sh` + `ops/datadog/`. Alert rule stubs: `ops/alerting/alert-rules.yaml`. Launch checklist: [LAUNCH-GATE-CHECKLIST.md](./LAUNCH-GATE-CHECKLIST.md).

## Marketing & lead capture (PRD v11.0)

Frontend routes: `/welcome`, `/pricing`, `/faq`, `/contact`, `/about`, `/demo`, `/blog`. Anonymous `/` redirects to `/welcome`.

```bash
# Env opsional
NEXT_PUBLIC_GA_ID=G-XXXXXXXX   # Google Analytics 4
LEADS_NOTIFY_EMAIL=sales@dnpeople.id
SMTP_HOST=...                  # untuk notifikasi lead

# Migrasi MarketingLead
cd backend && npx prisma migrate deploy
```

Public API (no auth, rate-limited):

```bash
curl -X POST http://localhost:4100/api/v1/public/leads \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@company.id","name":"Demo","source":"contact"}'

curl -X POST http://localhost:4100/api/v1/public/beta-interest \
  -H 'Content-Type: application/json' \
  -d '{"email":"hr@company.id","company":"PT Demo","employeeCount":120}'
```

Dengan Supabase, lihat catatan pooler vs direct di [SUPABASE.md](./SUPABASE.md).

## Verifikasi

```bash
curl http://localhost:4100/alive
curl http://localhost:4100/health
# production:
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/ready
curl -H "Authorization: Bearer $METRICS_TOKEN" https://api.yourdomain.com/metrics

curl -X POST http://localhost:4100/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@dnpeople.id","password":"Admin123!"}'
```

---

*Last Updated: July 22, 2026*
