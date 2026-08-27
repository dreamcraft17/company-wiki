# DOVA — Dokumen Status Lengkap (Teknis)

> **Status:** Active · **Terakhir diperbarui:** 2026-08-26 · **Owner:** Dozer / DN Tech  
> **Repo:** [dreamcraft17/dova](https://github.com/dreamcraft17/dova) · **HEAD:** `00c8601` · **Release:** v0.5.0

---

## Ringkasan

**DOVA** adalah marketplace MVP untuk produk pertanian / food supply di Nigeria. Platform ini menghubungkan **pembeli bisnis (customer)** dengan **supplier terverifikasi**, dengan alur browse → cart → checkout → bayar (Paystack NGN) → kelola pesanan.

| Pertanyaan | Jawaban singkat |
|------------|-----------------|
| Apakah kode MVP sudah jadi? | **Ya** — seluruh scope Week 1–4 sudah diimplementasi |
| Apakah sudah live publik? | **Staging ya** — [dova.dntech.id](https://dova.dntech.id); soft-launch penuh butuh Paystack live + checklist bisnis |
| Stack utama | NestJS + Next.js + PostgreSQL + Paystack |
| Test otomatis | **121 unit tests** green · CI build + typecheck |
| Mata uang | **₦ (NGN)** |

---

## 1. Apa itu DOVA?

### Produk

Marketplace B2B/B2C food supply dengan tiga peran:

| Peran | Tugas |
|-------|-------|
| **Customer** | Daftar, browse katalog, cart, checkout (pickup/delivery), bayar, lihat riwayat pesanan |
| **Supplier** | Daftar + dokumen verifikasi → approval admin → kelola produk, stok, pesanan masuk |
| **Admin** | Approve supplier, kelola user/produk/pesanan, inbox contact, moderasi feedback |

### Aturan bisnis MVP

| Aturan | Nilai | Lokasi kode |
|--------|-------|-------------|
| Minimum order pickup | ₦3.000 | `shared/src/index.ts` |
| Minimum order delivery | ₦5.000 | `shared/src/index.ts` |
| Delivery slot | Morning / Evening | Cart item level |
| Satuan produk | kg / L (per kategori) | `shared/src/product-units.ts` |
| Upload gambar supplier | JPG/PNG/WEBP ≤ 5 MB | `app.controller.ts` multer |

---

## 2. Stack teknologi

### Runtime & bahasa

| Layer | Teknologi | Versi (manifest) |
|-------|-----------|------------------|
| Runtime | Node.js | **20** (CI) |
| Bahasa | TypeScript | 5.7 |
| Package manager | npm workspaces | monorepo |

### Backend — `apps/backend`

| Komponen | Teknologi |
|----------|-----------|
| Framework | **NestJS 11** |
| Auth | JWT (access + refresh), httpOnly cookies + Bearer token cross-origin |
| Password | bcryptjs |
| Database | **PostgreSQL** via `pg` pool |
| Cache (opsional) | **Redis** — fallback in-memory jika tidak ada |
| Payment | **Paystack** (NGN) + mock mode tanpa secret key |
| Email (opsional) | Resend |
| Validasi | class-validator + DTO |

### Frontend — `apps/frontend`

| Komponen | Teknologi |
|----------|-----------|
| Framework | **Next.js 16** (Pages Router) |
| UI | React 19, CSS custom (DOVA-Startup brand) |
| Icons | lucide-react |
| State | React Context (Auth, Cart, Toast) |
| API client | Fetch wrapper + sessionStorage Bearer token |

### Shared — `shared/`

| Isi | Contoh |
|-----|--------|
| TypeScript types | `User`, `Product`, `Cart`, `Order`, … |
| Business helpers | `minOrderFor`, `cartBadgeCount`, `passwordToggleState` |
| Product images | Mapping Unsplash per produk + fallback kategori |
| Product units | Label kg/L, stock messages |

### Infrastruktur & tooling

| Tool | Fungsi |
|------|--------|
| **GitHub Actions** | CI: build, typecheck, test |
| **PM2** | Process manager di VPS staging |
| **Vercel** | Opsi deploy frontend (`vercel.json`) |
| **Jest + ts-jest** | Unit tests |
| **PostgreSQL migrations** | `database/migrations/001–006` |
| **Scripts** | migrate, seed, smoke-week4 |

### Database migrations

| File | Isi |
|------|-----|
| `001_init.sql` | Schema awal: users, products, cart, orders, supplier |
| `002_week4.sql` | `fulfillment_type` pickup/delivery |
| `003_feedlog_extensions.sql` | Feedback board native |
| `004_cart_order_hardening.sql` | Cart/order constraints (v0.5.0 batch) |
| `005_feedback_postgres.sql` | Feedback Postgres persistence |
| `006_email_otp.sql` | Email OTP columns (idle — verification disabled) |

---

## 3. Arsitektur monorepo

```
dova/
├── apps/
│   ├── backend/          # NestJS API → :3000 /api/v1
│   └── frontend/         # Next.js → dev :3001, prod :3002
├── shared/               # Types + pure helpers (dova-shared package)
├── database/migrations/  # SQL schema
├── scripts/              # migrate.js, seed.js, smoke-week4.js
├── tests/                # QA docs, env templates, dokumen ini
└── .github/workflows/    # ci.yml, database-migrate.yml
```

### Mode operasi data

| Mode | Env | Perilaku |
|------|-----|----------|
| **In-memory** | `USE_IN_MEMORY=true` | Demo lokal tanpa PostgreSQL — seed di RAM |
| **Production** | `USE_IN_MEMORY=false` | PostgreSQL wajib; Redis opsional |

### Auth cross-origin (staging)

Frontend (`dova.dntech.id`) dan API (`api.dova.dntech.id`) beda subdomain:

- `CROSS_SITE_COOKIES=true`
- Bearer token disimpan di `sessionStorage` (`auth-session.ts`)
- Refresh/logout kirim token via body + cookie

---

## 4. Fitur — status implementasi

### 4.1 Storefront & katalog

| Fitur | Status | Catatan teknis |
|-------|--------|----------------|
| Home, About, Contact | ✅ Done | Contact form → DB + admin inbox |
| Browse produk + pagination | ✅ Done | `GET /products` |
| Search + filter kategori | ✅ Done | Query params |
| Product detail + delivery slot | ✅ Done | Morning/evening wajib sebelum add |
| Product images | ✅ Done | Mapping per produk + `ProductImage` onError fallback |
| Mobile responsive + hamburger | ✅ Done | CSS mobile-first + nav-drawer fix |
| Desktop navbar | ✅ Done | `header-inner` layout fix |

### 4.2 Auth & peran

| Fitur | Status | Catatan teknis |
|-------|--------|----------------|
| Customer register/login | ✅ Done | Validasi email, password ≥8 |
| Supplier register + dokumen | ✅ Done | PDF/JPG/PNG upload |
| Role guards (customer/supplier/admin) | ✅ Done | `requireRole()` + `RequireAuth` frontend |
| JWT refresh + revoke | ✅ Done | Session DB + optional Redis |
| Cross-origin Bearer auth | ✅ Done | Fix BUG-002/003 |
| Password toggle UI | ✅ Done | `passwordToggleState()` shared helper |
| Password reset / email verify | ❌ Out of MVP | Belum diimplementasi |

### 4.3 Cart & checkout

| Fitur | Status | Catatan teknis |
|-------|--------|----------------|
| Add/update/remove cart | ✅ Done | Per-item delivery slot |
| Validasi slot kosong | ✅ Done | Toast + backend BadRequest |
| Validasi stok (no silent cap) | ✅ Done | BUG-CART-005 |
| Cart badge = jumlah line item | ✅ Done | `cartBadgeCount()` — bukan total kg |
| Checkout pickup / delivery | ✅ Done | Min order enforced |
| Order creation + clear cart | ✅ Done | Stock decrement |
| Checkout duplicate key fix | ✅ Done | BUG-007 — UUID order_items baru |
| Re-order dari history | ✅ Done | PR #6 — `/customer/orders/[id]` |

### 4.4 Payment (Paystack)

| Fitur | Status | Catatan teknis |
|-------|--------|----------------|
| Initialize payment | ✅ Done | Mock jika secret kosong |
| Verify payment | ✅ Done | GET/POST verify |
| Webhook HMAC | ✅ Done | Signature validation |
| Payment reference idempotency | ✅ Done | PAY-02 |
| Live Paystack di staging | ⚠️ Conditional | Butuh key + ≥10 tx test (checklist bisnis) |

### 4.5 Supplier dashboard

| Fitur | Status | Catatan teknis |
|-------|--------|----------------|
| Product CRUD | ✅ Done | |
| Image upload / URL | ✅ Done | Multipart |
| Stock adjust + history | ✅ Done | |
| Soft delete produk | ✅ Done | Filter `is_active` — SUP-03 |
| Hanya lihat produk sendiri | ✅ Done | BUG-008 |
| Order fulfillment status | ✅ Done | processing → shipped → delivered |

### 4.6 Admin dashboard

| Fitur | Status | Catatan teknis |
|-------|--------|----------------|
| Dashboard stats | ✅ Done | |
| Approve/reject supplier | ✅ Done | Postgres `$1::varchar` fix v0.5.0 |
| Users — full CRUD admin | ✅ Done | Edit, role, reset password, active toggle (v0.5.0) |
| Users / products / orders | ✅ Done | Tab Available/Low Stock/Hidden |
| Contacts inbox | ✅ Done | |
| Feedback moderation | ✅ Done | Native board |

### 4.7 Customer — My Orders (PR #6)

| Fitur | Status | Route |
|-------|--------|-------|
| Profile + tabs | ✅ Done | `/customer/profile` |
| Purchase history + filter | ✅ Done | `/customer/history` |
| Order detail + re-order | ✅ Done | `/customer/orders/[id]` |

### 4.8 Feedback board (native)

FeedLog eksternal **diganti** board native di DOVA.

| Fitur | Status | Route / API |
|-------|--------|-------------|
| Submit idea + vote | ✅ Done | `/feedback`, `POST /feedback/posts/:id/vote` |
| Comments | ✅ Done | |
| Roadmap columns | ✅ Done | `/feedback/roadmap` |
| Changelog | ✅ Done | `/feedback/changelog` |
| Admin status update | ✅ Done | Admin panel |

---

## 5. Pekerjaan teknis yang sudah dilakukan

### 5.1 MVP core (Week 1–4)

- Monorepo NestJS + Next.js + shared types
- Auth JWT multi-role
- Katalog, cart, checkout, orders
- Supplier + admin dashboards
- Paystack integration + mock fallback
- PostgreSQL migrations + seed scripts
- Native feedback board (ganti FeedLog)
- CI pipeline GitHub Actions

### 5.2 Deploy & ops

| Pekerjaan | Commit / doc |
|-----------|--------------|
| ENV setup guide VPS | `924fa98`, `tests/ENV-SETUP.md` |
| Build order: shared → backend → frontend | `1145a14` |
| Staging URLs live | `dova.dntech.id`, `api.dova.dntech.id` |
| PM2 deploy pattern | Documented di ENV-SETUP |
| Vercel config | `vercel.json` |

### 5.3 UAT bug fixes (Agustus 2026)

Semua defect UAT sprint sudah diperbaiki — detail di [`UAT-BUG-FIXES.md`](./UAT-BUG-FIXES.md).

| ID | Ringkasan | Severity |
|----|-----------|----------|
| BUG-001 | Kategori Chicken → Meat | Medium |
| BUG-002/003 | Auth cross-origin (Bearer token) | High |
| BUG-CART-004/005 | Delivery slot + stock validation | Medium |
| BUG-006 | Product image mapping | Medium |
| BUG-007 | Checkout duplicate key | High |
| BUG-008 | Supplier isolation | High |
| SUP-03 | Soft delete filter | Medium |
| PAY-02 | Payment idempotency | Medium |
| BUG-010 | Password eye icon | Minor |
| BUG-011 | Cart badge count | Major |
| BUG-012 | Password toggle CSS | Minor |
| BLOCKER | Produk murah UAT min-order | Major |

### 5.4 Regression tests (Agustus 2026)

Helper + test ditambahkan agar bug UI/logic tidak regress:

| Helper / test | File |
|---------------|------|
| `cartBadgeCount()` | `shared/src/index.ts` + spec |
| `passwordToggleState()` | `shared/src/index.ts` + spec |
| UAT seed products assertion | `app.service.spec.ts` |
| Delivery slot rejection | `app.service.spec.ts` |
| Supplier soft-delete filter | `app.service.spec.ts` |

**Total:** 121 tests · 15 suites · semua green.

### 5.5 UX / mobile fixes

| Pekerjaan | Commit |
|-----------|--------|
| Mobile layout semua viewport | `b8b20b7` |
| Hamburger menu tap fix | `48f2dda` |
| Desktop navbar layout | `64f8750`, `d5eb686` |
| Broken Unsplash images + fallback | `b7c6e58` |
| Contact phone update | `2bea2d1` |
| My Orders page (PR #6) | `81317cc` |
| README refresh | `10110e4` |

---

## 6. API surface (ringkas)

Base URL: `/api/v1`

| Grup | Endpoint utama |
|------|----------------|
| Health | `GET /health` |
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `GET /auth/me` |
| Catalog | `GET /categories`, `/products`, `/products/:id` |
| Cart | `GET /cart`, `POST /cart/add`, `PUT/DELETE /cart/items/:id` |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/:id` |
| Payments | `POST /payments/initialize`, `GET/POST /payments/verify`, webhook |
| Supplier | `/suppliers/*` — products, stock, orders |
| Admin | `/admin/*` — dashboard, suppliers, users, products, orders, contacts |
| Contact | `POST /contact` |
| Feedback | `/feedback/*` — posts, votes, comments, roadmap, changelog |

Dokumen API lengkap: [`company-wiki/docs/products/dova/docs/API.md`](../../company-wiki/docs/products/dova/docs/API.md)

---

## 7. Testing & quality

| Layer | Status | Lokasi |
|-------|--------|--------|
| Unit tests | ✅ 121 passed | `*.spec.ts` di shared, backend, frontend/lib |
| CI | ✅ build + typecheck + test | `.github/workflows/ci.yml` |
| Coverage | ~48% statements | `npm run test:coverage` |
| E2E Playwright | ❌ Belum ada | Backlog |
| DB integration tests | ⚠️ Minimal | `database.service.ts` ~3% coverage |
| Manual UAT | ✅ Sprint Agustus | Excel + [`GUIDE.md`](./GUIDE.md) |
| Smoke script | ✅ | `npm run smoke:week4` |

### Gap QA yang masih terbuka (dari triage kode)

| Gap | Priority | Catatan |
|-----|----------|---------|
| CSS/layout (BUG-012 class) | P2 | Belum ada visual regression test |
| `database.service.ts` checkout SQL | P1 | BUG-007 class — butuh integration test |
| Re-order partial failure | P2 | Loop add tanpa rollback |
| Meat category fallback image broken ID | P1 | `CATEGORY_IMAGES.Meat` ∈ `BROKEN_IMAGE_IDS` |

---

## 8. Deployment & environment

### Staging (VPS)

| Service | URL |
|---------|-----|
| Storefront | https://dova.dntech.id |
| API | https://api.dova.dntech.id/api/v1/health |

```bash
cd ~/dova
git pull
npm run build
npm run db:seed
pm2 restart dova-backend dova-frontend --update-env
```

Panduan env lengkap: [`ENV-SETUP.md`](./ENV-SETUP.md)

### Local dev

```bash
npm install
cp .env.dev .env
cp apps/backend/.env.dev apps/backend/.env
cp apps/frontend/.env.dev apps/frontend/.env.local
npm run dev
```

| Service | URL dev |
|---------|---------|
| Storefront | http://localhost:3001 |
| API | http://localhost:3000/api/v1/health |

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

---

## 9. Status sekarang (Agustus 2026)

### ✅ Selesai (code)

- Seluruh user journey MVP: customer, supplier, admin
- Staging deployed dan accessible
- UAT bug sprint diperbaiki + regression tests
- My Orders / Purchase History (PR #6)
- Native feedback board
- Mobile + desktop UI stabil
- CI green

### ⚠️ Conditional (butuh ops / bisnis)

| Item | Yang dibutuhkan |
|------|-----------------|
| Soft-launch go/no-go | Checklist stakeholder |
| Paystack live proof | ≥10 transaksi test di staging |
| Email notifications | `RESEND_API_KEY` (opsional) |
| Redis production | Opsional — backend jalan tanpa Redis |

### ❌ Out of MVP / backlog

- Password reset & email verification
- Reviews API, wishlist, discounts
- Courier tracking
- Playwright E2E suite
- Production APM / monitoring
- Mutation testing gate (Stryker)

---

## 10. Dokumen terkait

| Dokumen | Path | Isi |
|---------|------|-----|
| **Launch budget (BD)** | [`DOVA-LAUNCH-BUDGET.md`](./DOVA-LAUNCH-BUDGET.md) | Yang perlu dibeli + budget minimum pre-funding |
| README repo | [`../Readme.md`](../Readme.md) | Quick start + commands |
| ENV setup | [`ENV-SETUP.md`](./ENV-SETUP.md) | VPS/staging env |
| Test catalog | [`TEST-CASES.md`](./TEST-CASES.md) | Manual + automated cases |
| UAT fixes | [`UAT-BUG-FIXES.md`](./UAT-BUG-FIXES.md) | Log bug + verifikasi |
| QA guide | [`GUIDE.md`](./GUIDE.md) | Workflow manual QA |
| Wiki index | [`company-wiki/.../00_INDEX.md`](../../company-wiki/docs/products/dova/00_INDEX.md) | Index produk DOVA |
| Feature catalog | [`company-wiki/.../FEATURE-CATALOG.md`](../../company-wiki/docs/products/dova/docs/FEATURE-CATALOG.md) | Available vs out-of-scope |
| Runbook | [`company-wiki/.../RUNBOOK.md`](../../company-wiki/docs/products/dova/docs/RUNBOOK.md) | Deploy & troubleshoot |

---

## Changelog dokumen ini

| Tanggal | Perubahan |
|---------|-----------|
| 2026-08-23 | Dokumen awal — stack, fitur, pekerjaan teknis, status Agustus 2026 |
