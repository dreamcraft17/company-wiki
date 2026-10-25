# dnAccounting — Snapshot Repo, Fitur & Keadaan

> **Status:** Active · **Last updated:** 2026-10-24 · **Author:** Dozer  
> **Produk:** dnAccounting (cloud accounting UKM Indonesia) · **Folder:** `dnFinance/`  
> **Remote:** https://github.com/dreamcraft17/dnfinance.git · **Branch:** `main` · **HEAD:** `d563991`

## Summary

Dokumen ini merangkum **apa yang ada di git**, **fitur yang sudah jalan di codebase**, dan **keadaan proyek hari ini** — tanpa menggantikan spek lengkap di `docs2/PRD/` atau katalog detail di [FEATURE-CATALOG.md](./FEATURE-CATALOG.md).

**Posisi produk:** alternatif cloud accounting untuk UKM (positioning vs Accurate/Jurnal di [../docs/PRD.md](../docs/PRD.md) — spek V1 **lokal**, tidak di-track git).

---

## Keadaan sekarang (2026-10-24)

| Dimensi | Nilai | Catatan |
|---------|-------|---------|
| **V1 MVP (fitur bisnis)** | ~**92%** | COA → GL → AR/AP → inventory → laporan → demo |
| **V2 production hardening** | ~**78%** | Infra conditional (Postgres, Redis, Gmail, CI deploy) |
| **Siap demo client** | **Ya** | Tanpa Docker; persist JSON + email simulasi |
| **Siap production penuh** | **Belum** | Butuh `DATABASE_URL`, `REDIS_URL`, Gmail, secrets GCP untuk staging workflow |
| **Test otomatis** | **78 passed** | 3 suite · di-verify `npm run test` pada 2026-10-24 |
| **Versi package** | `0.1.0` | Monorepo npm workspaces |

### Satu kalimat

MVP + fitur V2 P1 (approval jurnal, token email, scheduled reports, department) **sudah ada di kode**; stack production **ada tapi opsional** — default dev tetap file store + email simulasi.

### Jalankan lokal

```bash
cd dnFinance
npm install
cp .env.dev .env
npm run dev
```

| Service | URL |
|---------|-----|
| API | http://localhost:3000/api/v1 |
| Swagger | http://localhost:3000/api/docs |
| Web | http://localhost:5173 |

**Demo:** `demo@dnaccounting.id` / `demo123456` — lihat [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md) dan [../DEMO.md](../DEMO.md).

---

## Fitur yang ada sekarang (codebase)

Legenda: **Available** = UI/API ada · **Conditional** = butuh env · **Roadmap** = belum dijual sebagai existing.

### Ringkasan modul

| Area | Highlights | Status |
|------|------------|--------|
| Auth & multi-tenant | Register perusahaan + industri, JWT + refresh, RBAC | Available |
| Chart of Accounts | 5 template industri, CRUD, tag department, import/export CSV | Available |
| Jurnal & GL | Draft multi-line, post, recurring, approval workflow | Available |
| AR | Customer, invoice PPN 11%, kirim + GL, partial payment, PDF, batch | Available |
| AP | Vendor, bill PPh 23, approval UI + token email 24h, schedule/mark paid | Available |
| Inventory | Item, stock in/out, valuation report | Available |
| Laporan & pajak | TB, P&L (filter department), BS, CF, aging AR/AP, tax summary, budget vs actual | Available |
| Export | e-Faktur CSV, GL/transactions CSV, beberapa report PDF | Available |
| Import | COA, opening balances, customers, vendors | Available |
| Admin | Users, tier limits, audit log | Available |
| Demo | Seed + reset tenant demo | Available |
| Infra V2 | Postgres JSONB snapshot, Bull, Redis cache, Gmail, Winston, rate limit | Conditional |
| FIFO costing, GCS PDF, report cache Redis, Datadog | — | Roadmap |

Detail per endpoint/halaman: [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) · [API.md](./API.md).

### Halaman frontend (React)

| Route | Halaman |
|-------|---------|
| `/`, `/login`, `/register` | Dashboard, login, register |
| `/accounts`, `/journal`, `/general-ledger` | COA, jurnal, GL |
| `/reports` | Laporan + export |
| `/customers`, `/invoices` | AR |
| `/vendors`, `/bills` | AP |
| `/inventory`, `/import` | Stok + impor data |
| `/admin`, `/audit` | User & audit |
| `/approve/:token` | Approval publik via link email |

### Modul backend (NestJS)

API terpusat di `app.controller.ts` + `app.service.ts`, dengan modul pendukung:

| Modul | Path |
|-------|------|
| Database (Postgres opsional) | `apps/backend/src/database/` |
| Email | `apps/backend/src/email/` |
| Queue (Bull / in-memory) | `apps/backend/src/queue/` |
| Cache (Redis / in-memory) | `apps/backend/src/cache/` |
| Approval token JWT | `apps/backend/src/approval/` |
| Scheduler (cron) | `apps/backend/src/scheduler/` |
| Rate limit | `apps/backend/src/middleware/` |
| Logger | `apps/backend/src/logger/` |
| Persist file JSON | `apps/backend/src/persistence.ts` |

### Shared package

`shared/` — template COA per industri, helper PPN/PPh, validator (dipakai backend + unit test).

---

## Isi repository (struktur & git)

### Struktur folder (logical)

```
dnFinance/
├── apps/
│   ├── backend/          NestJS 11 — API /api/v1
│   └── frontend/         React 19 + Vite + Redux + Tailwind
├── shared/               COA templates, tax helpers
├── database/migrations/  SQL referensi (001–003) — belum schema runtime penuh
├── docs2/                Living docs (di-track git)
├── docs/                 Spek V1/V2 MVP — ada di disk lokal, tidak di-track git
├── tests/                Matriks UAT manual (TEST-CASES.md)
├── .github/workflows/    ci.yml, deploy-staging.yml
├── Dockerfile
├── DEMO.md, README.md
├── package.json          workspaces: shared, apps/backend, apps/frontend
└── .env.dev              template env (di-track; tanpa secret production)
```

### Apa yang **di-track git** (HEAD `d563991`)

| Kategori | Isi |
|----------|-----|
| **Kode** | Backend (~25 TS modul), frontend (16 pages + layout), `shared/` |
| **DB ref** | `database/migrations/*.sql` (3 file) |
| **Dokumen** | `docs2/*` (index, API, architecture, feature catalog, PRD V2 copies, dll.) |
| **Ops** | `Dockerfile`, CI + deploy-staging workflow |
| **Root** | `README.md`, `DEMO.md`, `jest.config.js`, lockfile |

**Tidak di-track git (penting):**

| Path | Alasan |
|------|--------|
| `docs/` | Dihapus dari tracking commit `d563991` / `1a48cb2` ("stop tracking docs/") — masih ada lokal untuk PRD/SRS/SDD V1 |
| `node_modules/` | Dependency |
| `.data/` | Data runtime / demo (persist lokal) |
| `.env` | Env aktif (salin dari `.env.dev`) |

### Riwayat git (ringkas)

| Commit | Pesan |
|--------|--------|
| `e30255f` | first commit |
| `2db3dc6` | waw |
| `e58645c` | Implement V2 production hardening and living docs2 suite. |
| `1a48cb2` / `d563991` | stop tracking docs/ |

Working tree saat snapshot: branch `main` sync `origin/main`; perubahan lokal tipikal `.DS_Store` / data dev — tidak mempengaruhi fitur di git.

---

## Stack teknis

| Layer | Teknologi |
|-------|-----------|
| Backend | NestJS 11, JWT, Swagger 2.0 |
| Frontend | React 19, Vite 5, Redux Toolkit, Tailwind 3.4 |
| Persist dev | JSON file (`.data/store.json`) |
| Persist prod (target) | PostgreSQL JSONB snapshot jika `DATABASE_URL` set |
| Queue / cache | Bull + Redis jika `REDIS_URL`; fallback in-memory |
| Email | Nodemailer + Gmail jika `GMAIL_*`; else simulasi + `GET /email-log` |

---

## Gap utama vs production

1. **Schema relational penuh** — migration SQL referensi; runtime masih snapshot/file, bukan TypeORM entity map lengkap.
2. **Email/PDF/queue** — sync atau simulasi tanpa Redis/Gmail.
3. **Deploy staging** — workflow ada; butuh secrets GCP/GitHub.
4. **Monitoring** — Winston ada; Datadog/APM roadmap V2 P2.

Matriks requirement: [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md).

---

## Dokumen terkait

| Dokumen | Untuk apa |
|---------|-----------|
| [00_INDEX.md](./00_INDEX.md) | Hub semua docs2 |
| [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) | Visi, persona, milestone |
| [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) | Baseline teknis V2 |
| [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) | Katalog fitur Available/Conditional/Roadmap |
| [DEPLOY.md](./DEPLOY.md) | Staging & env vars |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat V1 → V2 |
| [../README.md](../README.md) | Quick start repo |

---

## Verifikasi ulang snapshot

```bash
cd dnFinance
npm run test          # expect: 78 passed
npm run build
git log -1 --oneline
git ls-files | wc -l  # jumlah file tracked
```

Update tanggal **Last updated** di header dokumen ini setelah perubahan besar (release, migrasi DB, atau shift % readiness).
