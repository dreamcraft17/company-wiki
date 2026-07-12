# dnPeople — Deployment Guide

**Last Updated:** July 12, 2026
**Applies to:** MVP 1–4 (schema includes enterprise tables)

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
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev          # http://localhost:4100

# 2. Frontend
cd ../frontend
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3001
```

Tidak perlu `docker compose up`. Redis di compose belum dipakai.

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
npx prisma migrate resolve --applied 20260712000000_baseline
npx prisma migrate status
```

## Backup & Disaster Recovery

Workflow `.github/workflows/backup.yml` berjalan harian menggunakan secret `BACKUP_DATABASE_URL`. Jika `BACKUP_S3_URI` diisi, dump dan checksum juga dikirim ke object storage dengan server-side encryption.

```bash
# Backup manual
DATABASE_URL="..." BACKUP_DIR=./backups npm run db:backup

# Restore drill ke database kosong/non-production
ALLOW_RESTORE=true DATABASE_URL="..." npm run db:restore -- ../backups/dnpeople-YYYYMMDDTHHMMSSZ.dump
```

Setiap backup memakai format custom PostgreSQL dan checksum SHA-256. Restore wajib eksplisit memakai `ALLOW_RESTORE=true` dan diakhiri pemeriksaan status migration.

Dengan Supabase, lihat catatan pooler vs direct di [SUPABASE.md](./SUPABASE.md).

## Verifikasi

```bash
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

*Last Updated: July 12, 2026*
