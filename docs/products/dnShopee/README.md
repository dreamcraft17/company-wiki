# dnShop Finance

**dnShop Finance** — Financial Dashboard & Reporting Platform untuk Shopee Sellers Indonesia  
**Owner:** DN Tech (PT. Dozer Napitupulu Technology)  
**Release:** **[v2.2.1](./docs/CHANGELOG.md)** (5 Sep 2026) · accounting depth **v2.2.0** (tag `v2.2.0` = `6b27974`)  
**Specs shipped:** [`PRD/`](./PRD/) v1.0 + v2.0 · [`PRD/sopi/`](./PRD/sopi/) **v2.1 SOPI** · UI2 [`PRD/v2/…_Design.md`](./PRD/v2/dnShop_Finance_v2.1_Design.md) · **[`PRD/v2.2/`](./PRD/v2.2/) Accounting depth**  
**PRD berikutnya:** **v3.0 Multi-marketplace** — lihat [`docs/NEXT-PRD-BRIEF.md`](./docs/NEXT-PRD-BRIEF.md)  
**Posisi produk:** pembukuan = **bonus di akun seller**, bukan aplikasi akuntansi terpisah

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 · React 19 · Tailwind · Recharts · Syne + Plus Jakarta Sans (hero) + IBM Plex · port **6000** |
| Backend | NestJS 10 · TypeORM · Passport JWT · Socket.io · ExcelJS · port **6001** |
| Data | PostgreSQL 15 (native atau **Supabase**) · Redis 7 (opsional) |
| Shopee | OAuth 2.0 + Open API live client · **mock mode** jika kredensial kosong |

## Quick start

**Tanpa Docker (disarankan di VPS):** Postgres native atau Supabase — lihat [`docs/DEPLOY-VPS.md`](./docs/DEPLOY-VPS.md).  
Redis **tidak wajib** (kosongkan `REDIS_HOST`).

```bash
# 1) Postgres sudah jalan (localhost atau Supabase di .env)

# 2) API
cd apps/backend
cp .env.example .env          # isi DB_* + JWT_SECRET (+ DB_SSL=true untuk Supabase)
npm install
npm run seed                  # opsional demo
npm run start:dev             # http://localhost:6001/api/v1

# 3) Web
cd ../frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:6001/api/v1
npm install
npm run dev                   # http://localhost:6000
```

Opsional lokal dengan Docker Compose:

```bash
docker compose up -d          # postgres (+ redis opsional)
```

### Akun demo

| | |
|---|---|
| Seller | `seller@dnshop.id` / `Seller123!` |
| Accountant | `accountant@dnshop.id` / `Seller123!` |

Detail: [`docs/DEMO-ACCOUNTS.md`](./docs/DEMO-ACCOUNTS.md).

```bash
npm run seed            # idempotent
npm run seed:force      # refresh data demo
```

## Modul (shipped)

### Phase 1–2 / v1.0
Auth JWT + OTP/reset · Shopee OAuth/mock · sync · dashboard charts · orders/products/inventory · payments/settlements · reports CSV/PDF · tax PPh/PPN · bank CSV · team RBAC · notifications

### v2.0 — Pembukuan (bonus seller)
CoA SAK EMKM · journal CRUD · auto-journal Shopee · GL · TB · P&L · BS · audit PDF · `/journal`

### v2.1 — SOPI go-live + UI2
Live OAuth · order/income cron · webhook HMAC + DLQ · tier Free 100 / Starter 5000 · onboarding wizard · email + ops alerts · Socket.io · UI2 ops desk

### v2.2 — Accounting depth (**Implemented** 10 Agu 2026 · patch **v2.2.1** 5 Sep 2026)
| Fitur | UI | API (ringkas) |
|-------|----|----------------|
| Cash Flow (indirect) | `/journal/cf` | `GET …/journals/cash-flow` · export CSV/PDF |
| Auto-COGS (average) | `/journal/cogs` | costing · `POST …/cogs/sync` · cron 4 jam WIB |
| Export Accurate/Jurnal/MYOB | `/journal/export` | mapping + `POST …/accounting-export/export-gl` |
| e-Faktur dari journal | `/journal/efaktur` | `POST …/tax/e-faktur/generate` |
| Tutup buku + period lock | `/journal/close` | checklist · lock enforce pada mutasi jurnal |

Spec: [`PRD/v2.2/`](./PRD/v2.2/) · Go-live checklist: [`docs/V22-PRODUCTION-CHECKLIST.md`](./docs/V22-PRODUCTION-CHECKLIST.md)

> v2.2 **tidak mengganggu** kontrak Shopee OpenAPI (OAuth/webhook/cron) — hanya mengolah data di DB.

## Production (DN Tech)

| | |
|---|---|
| Web | https://shop.dntech.id |
| API | https://api.shop.dntech.id/api/v1 |
| Health (reviewer) | https://shop.dntech.id/api/v1/health · `/api/v1/shopee/status` |
| Proses | pm2 `dnshop-web` (6000) · `dnshop-api` (6001) |
| DB | Supabase (SSL) · `migrationsRun` di prod |

```bash
git pull
cd apps/backend && npm ci && npm run build && pm2 restart dnshop-api
cd ../frontend && npm ci && npm run build && pm2 restart dnshop-web
```

Panduan: [`docs/DEPLOY-VPS.md`](./docs/DEPLOY-VPS.md) · [`docs/V22-PRODUCTION-CHECKLIST.md`](./docs/V22-PRODUCTION-CHECKLIST.md)

## Verifikasi

```bash
cd apps/backend && npm test && npm run build
cd ../frontend && npm run build
# opsional E2E: cd apps/frontend && npm run test:e2e
curl -s http://127.0.0.1:6001/api/v1/auth/health
curl -s http://127.0.0.1:6001/api/v1/health
curl -s http://127.0.0.1:6001/api/v1/shopee/status
```

## Status jujur

| Area | Status |
|------|--------|
| MVP + v2.0 + UI2 + SOPI v2.1 + **v2.2 accounting** | **Done** · tag **v2.2.1** (`707b47e`) · ship v2.2.0 `6b27974` |
| Live Shopee Open API | **Conditional ops** — `SHOPEE_PARTNER_ID` + webhook portal; kosong = mock |
| Redis / SMTP / tier hard block | **Conditional ops** via env |
| TypeORM migrations prod | **Done** — termasuk `172304…AddV22AccountingDepth` |
| UAT import Accurate / DJP XML | **Ops manual** — checklist di V22-PRODUCTION-CHECKLIST |
| Multi-marketplace | **Belum** → v3.0 |

## Docs index

| Dokumen | Isi |
|---------|-----|
| [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) | Release notes (**v2.2.1**) |
| [`docs/openapi-v1.yaml`](./docs/openapi-v1.yaml) | OpenAPI stub (critical routes) |
| [`docs/CODE-REVIEW-BUNDLE-2026-09-05.md`](./docs/CODE-REVIEW-BUNDLE-2026-09-05.md) | Review engineering 5 Sep 2026 |
| [`docs/STATUS.md`](./docs/STATUS.md) | Status implementasi living |
| [`docs/docs.md`](./docs/docs.md) | Baseline + arah PRD |
| [`docs/FEATURE-CATALOG.md`](./docs/FEATURE-CATALOG.md) | Katalog fitur |
| [`docs/CURRENT-IMPLEMENTATION.md`](./docs/CURRENT-IMPLEMENTATION.md) | Modul kode |
| [`docs/NEXT-PRD-BRIEF.md`](./docs/NEXT-PRD-BRIEF.md) | Brief PRD berikutnya (v3.0) |
| [`docs/PRD-v2.2-Accounting-Depth-PREP.md`](./docs/PRD-v2.2-Accounting-Depth-PREP.md) | Prep v2.2 (arsip / non-gangguan OpenAPI) |
| [`docs/V22-PRODUCTION-CHECKLIST.md`](./docs/V22-PRODUCTION-CHECKLIST.md) | Deploy + smoke v2.2 |
| [`docs/DEMO-ACCOUNTS.md`](./docs/DEMO-ACCOUNTS.md) | Akun & data seed |
| [`docs/DEPLOY-VPS.md`](./docs/DEPLOY-VPS.md) | Deploy VPS |
| [`docs/UAT-PLAYBOOK-v2.1.md`](./docs/UAT-PLAYBOOK-v2.1.md) | UAT beta |
| [`sopi/`](./sopi/) | Remedi partner Shopee (ops) |
