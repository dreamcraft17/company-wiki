# dnFinance — Changelog (living docs)

## 2026-10-27 — Langganan & Tagihan (deposit via DOKU)

App repo `main`: `2541aa6` → `6ce7673` → `4bd2cd2`.

### Added
- Modul backend `billing/`: DOKU Checkout (port dari dnPeople), top-up deposit `TRXDNFINANCE-…`, webhook `POST /api/v1/webhooks/doku` (raw body + verifikasi tanda tangan), Check Status, faktur bulanan `FBDNF-…` dipotong dari saldo (cron 01.00 WIB), mutasi saldo, profil penagihan, ganti paket, slot pengguna tambahan
- Frontend: menu profil Data Usaha › **Langganan & Tagihan** (`/langganan`) dan **Pusat Tagihan** per usaha (`/langganan/:tenantId`)
- `billing.service.spec.ts` (10 tes; DOKU dan storage di-mock)
- Env: `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY`, `DOKU_IS_PRODUCTION`, `DOKU_NOTIFICATION_URL`, `API_PUBLIC_URL`, `DOKU_PAYMENT_METHOD_TYPES`

### Changed
- `Tenant.extraUsers`: batas pengguna = batas tier + slot tambahan (createUser, aktifkan ulang user, tambah administrator)
- `main.ts`: `rawBody: true`

### Notes
- Harga paket masih hipotesis (lihat [Rancangan_Harga_dan_Paket_dnFinance.md](./Rancangan_Harga_dan_Paket_dnFinance.md))
- Belum diuji end-to-end di sandbox DOKU; tampilan belum dicek di browser

---

## 2026-08-02 — V2 Phase 2 implementation

### Added
- Production infra modules: database, email, queue, cache, approval, scheduler, logger, rate-limit
- Journal entry approval workflow + tenant setting
- Email approval tokens (24h JWT) + public `/approve/:token` page
- Scheduled reports (API + cron + Reports UI)
- Department dimension on COA + P&L filter
- Vendor CSV import
- 56 integration tests (78 total with unit)
- `Dockerfile` + `.github/workflows/deploy-staging.yml`
- `docs2/` living documentation suite
- `docs/PRD_V2.md`, `SRS_V2.md`, `SDD_V2.md`, `STATUS_V2.md`

### Changed
- Swagger version 2.0
- Health endpoint reports stack flags (postgres, email, redis)
- `.env.dev` expanded with optional production vars
- Frontend: Accounts, Journal, Reports, Import pages (V2 features)

### Notes
- Local dev still works without Docker (file store + simulated email)
- Full production requires Postgres, Redis, Gmail env + GCP secrets

---

## 2026-08-01 — MVP demo-ready (~92%)

### Added
- Full MVP: COA, GL, AR/AP, inventory, tax, reports
- Demo seed + file persistence
- PDF invoice, e-Faktur CSV, GL export
- Frontend polish + `DEMO.md`
- `docs/STATUS.md` vs PRD/SRS/SDD
- 16 unit tests

---

## Earlier

- Initial monorepo: NestJS + React + shared package
- PRD/SRS/SDD v1.0 specs in `docs/`
