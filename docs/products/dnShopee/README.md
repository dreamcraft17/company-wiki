# dnShop Finance

**dnShop Finance** — Financial Dashboard & Reporting Platform untuk Shopee Sellers Indonesia  
**Owner:** Dozer (CEO + Tech Lead + PM) · **Company:** DN Tech  
**Specs shipped:** [`prd/`](./prd/) v1.0 + v2.0 · [`prd/sopi/`](./prd/sopi/) **v2.1 SOPI go-live** · UI2 [`prd/v2/…_Design.md`](./prd/v2/dnShop_Finance_v2.1_Design.md)  
**PRD berikutnya:** [`docs/NEXT-PRD-BRIEF.md`](./docs/NEXT-PRD-BRIEF.md) → **v2.2 Accounting depth**  
**Posisi v2.0:** pembukuan = **bonus di akun seller**, bukan aplikasi akuntansi terpisah

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 · React 19 · Tailwind · Recharts · Syne + IBM Plex Sans · port **6000** |
| Backend | NestJS 10 · TypeORM · Passport JWT · Socket.io · port **6001** |
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

Opsional lokal dengan Docker Compose (hanya jika Anda memakai Docker):

```bash
docker compose up -d          # postgres (+ redis opsional)
```

### Akun demo (data dummy)

| | |
|---|---|
| Seller | `seller@dnshop.id` / `Seller123!` |
| Accountant | `accountant@dnshop.id` / `Seller123!` |

Seed mengisi **2 toko**, produk, pesanan, settlement, pajak, bank statement, rekonsiliasi, **dan pembukuan v2.0 (CoA + 100+ entries)**. Detail: [`docs/DEMO-ACCOUNTS.md`](./docs/DEMO-ACCOUNTS.md).

```bash
npm run seed            # idempotent
npm run seed:force      # refresh data demo
```

## Modul MVP (Phase 1–2)

- Auth (register/login/refresh/logout/health) + JWT + OTP / reset password
- Koneksi toko Shopee (OAuth / mock) + sync
- Dashboard sales & financial summary + **charts** (7d / 30d / custom range)
- Orders, returns, reconciliation
- Products & inventory (low stock, CSV import)
- Payments, settlements, payouts
- Reports (sales / financial / tax / cash-flow / inventory) + CSV/PDF + async job
- Tax engine PPh 21 + PPN + e-Faktur XML
- Webhook Shopee terverifikasi, refresh token, dan sync live
- Mutasi bank CSV + pencocokan otomatis (+ match ke pembukuan)
- Dashboard agregat multi-toko
- Tim owner/accountant/cashier/viewer dengan izin per fitur
- Preferensi notifikasi + email templates (`email_log`)
- TypeORM migrations untuk production

## Modul v2.0 — Pembukuan (bonus seller)

- Chart of Accounts template SAK EMKM (45 akun) + custom
- Entri jurnal manual (validasi debit=credit) · reverse · bulk CSV
- Auto-journal dari pembayaran / income Shopee
- Approval Draft → Pending → Approved → Posted
- General Ledger · Trial Balance · P&L · Balance Sheet
- Audit trail immutable + export PDF
- UI: menu **Pembukuan** (`/journal`) + entry point di Dashboard / Laporan / Pajak / Bank
- Flag: `ENABLE_JOURNALING=true`

## Modul v2.1 — SOPI go-live + UI2

- Live OAuth (Redis/memory state) · order/income cron · webhook HMAC + DLQ
- Tier Free **100 lifetime** / Starter **5000/mo** · onboarding wizard step-1/2/3
- HTML email + bounce · ops alerts · Socket.io `/realtime` · beta UAT
- UI2 ops desk (design tokens, wizard, upsell, theme toggle, OTP UI)

## Production (DN Tech)

| | |
|---|---|
| Web | https://shop.dntech.id |
| API | https://api.shop.dntech.id/api/v1 |
| Proses | pm2 `dnshop-web` (6000) · `dnshop-api` (6001) |
| DB | Supabase (SSL) |

Panduan lengkap: [`docs/DEPLOY-VPS.md`](./docs/DEPLOY-VPS.md).

## Verifikasi

```bash
cd apps/backend && npm test && npm run build
cd ../frontend && npm run build
curl -s http://127.0.0.1:6001/api/v1/auth/health
```

## Catatan jujur (bukan fake-100%)

| Area | Status |
|------|--------|
| MVP + v2.0 pembukuan + UI2 + **SOPI v2.1** | **Done** di repo |
| Live Shopee Open API | **Conditional ops** — butuh partner key + webhook portal; tanpa itu = mock |
| Redis/Bull queue | **Conditional ops** — Redis jika `REDIS_HOST` set, fallback inline |
| SMTP email | **Conditional ops** — kirim jika SMTP set, fallback log + `email_log` |
| TypeORM migrations prod | **Done** — `synchronize:false` + migrations |
| Accounting depth (cash flow / COGS / Accurate) | **Belum** — lihat PRD v2.2 brief |

Detail status: [`docs/STATUS.md`](./docs/STATUS.md) · baseline: [`docs/docs.md`](./docs/docs.md) · **PRD berikutnya:** [`docs/NEXT-PRD-BRIEF.md`](./docs/NEXT-PRD-BRIEF.md) · demo: [`docs/DEMO-ACCOUNTS.md`](./docs/DEMO-ACCOUNTS.md) · **VPS:** [`docs/DEPLOY-VPS.md`](./docs/DEPLOY-VPS.md)
