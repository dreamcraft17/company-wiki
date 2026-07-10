# dnPeople — Deployment Guide

**Last Updated:** July 10, 2026  
**Applies to:** MVP 1–4 (schema includes enterprise tables)

---

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (PostgreSQL + Redis)
- npm

> Setelah pull schema MVP 4, selalu jalankan `npx prisma db push` (atau migrate) sebelum seed/dev.

## Local Development

```bash
# 1. Infra
cd dnpeople
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev          # http://localhost:4100

# 3. Frontend
cd ../frontend
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3001
```

### Environment

**Backend `.env`**

```env
DATABASE_URL="postgresql://dnpeople:dnpeople@localhost:5433/dnpeople?schema=public"
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="24h"
PORT=4100
FRONTEND_URL="http://localhost:3001"
TRUST_PROXY=false
```

**Frontend `.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:4100/api/v1
```

### Demo accounts (setelah seed)

| Role | Email | Password |
|------|-------|----------|
| Company Admin | admin@dnpeople.id | Admin123! |
| Employee | budi@dnpeople.id | Employee123! |

## Production Checklist (draft)

- [ ] Ganti `JWT_SECRET` kuat (32+ chars)
- [ ] `FRONTEND_URL` = domain production (comma-separated jika multi)
- [ ] `TRUST_PROXY=1` di belakang Nginx
- [ ] PostgreSQL managed / volume backup
- [ ] HTTPS only (TLS terminate di Nginx/Caddy)
- [ ] `npm run build` backend + frontend
- [ ] Process manager: PM2 atau Docker
- [ ] Seed **tidak** dijalankan di production (kecuali bootstrap admin terkontrol)
- [ ] Rate limit & CORS diverifikasi
- [ ] Monitoring `/health`
- [ ] API keys production: rotate & revoke unused (`/integrations/api-keys`)
- [ ] SSO secrets tidak di-commit; isi via env/secret manager saat handshake live
- [ ] White-label: logo URL memakai CDN/HTTPS

### Contoh PM2

```bash
# Backend
cd backend && npm ci && npm run build
pm2 start dist/index.js --name dnpeople-api

# Frontend
cd frontend && npm ci && npm run build
pm2 start npm --name dnpeople-web -- start
```

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

MVP 1 memakai `prisma db push` untuk kecepatan iterasi. Sebelum production hard-launch, pindah ke:

```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

## Verifikasi

```bash
curl http://localhost:4100/health

curl -X POST http://localhost:4100/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@dnpeople.id","password":"Admin123!"}'
```

---

*Last Updated: July 10, 2026*
