# DOVA — Full Technical Status Document

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer · [@dreamcraft17](https://github.com/dreamcraft17)  
> **Repo:** [dreamcraft17/dova](https://github.com/dreamcraft17/dova) · **HEAD:** `71225e3` · **Release:** v0.5.4 · **Tag:** production live

---

## Summary

**DOVA** is an MVP marketplace for agricultural / food supply products in Nigeria. The platform connects **business buyers (customers)** with **verified suppliers**, through browse → cart → checkout → pay (Paystack NGN) → manage orders.

| Question | Short answer |
|----------|--------------|
| Is MVP code complete? | **Yes** — full Week 1–4 scope implemented |
| Is it publicly live? | **Yes — production** — [dova.dntech.id](https://dova.dntech.id); Paystack live; launched 27 Aug 2026 |
| Main stack | NestJS + Next.js + PostgreSQL + Paystack |
| Automated tests | **158 unit tests** green · `npm run smoke:production` |
| Currency | **₦ (NGN)** |

---

## 1. What is DOVA?

### Product

B2B/B2C food supply marketplace with three roles:

| Role | Responsibilities |
|------|------------------|
| **Customer** | Register with inline OTP on register page, browse catalog, cart, checkout (pickup/delivery), pay, view order history |
| **Supplier** | Register + verification docs → admin approval → manage products, stock, incoming orders |
| **Admin** | Approve suppliers, manage users/products/orders, contact inbox, feedback moderation |

### MVP business rules

| Rule | Value | Code location |
|------|-------|---------------|
| Minimum order pickup | ₦3,000 | `shared/src/index.ts` |
| Minimum order delivery | ₦5,000 | `shared/src/index.ts` |
| Delivery slot | Morning / Evening | Cart item level |
| Product units | kg / L (per category) | `shared/src/product-units.ts` |
| Supplier image upload | JPG/PNG/WEBP ≤ 5 MB | `app.controller.ts` multer |

---

## 2. Technology stack

### Runtime & language

| Layer | Technology | Version (manifest) |
|-------|------------|-------------------|
| Runtime | Node.js | **20** (CI) |
| Language | TypeScript | 5.7 |
| Package manager | npm workspaces | monorepo |

### Backend — `apps/backend`

| Component | Technology |
|-----------|------------|
| Framework | **NestJS 11** |
| Auth | JWT (access + refresh), httpOnly cookies + Bearer token cross-origin |
| Password | bcryptjs |
| Database | **PostgreSQL** via `pg` pool |
| Cache (optional) | **Redis** — in-memory fallback if unavailable |
| Payment | **Paystack** (NGN) + mock mode without secret key |
| Email | Resend or Gmail SMTP (OTP + password reset) |
| Validation | class-validator + DTO |

### Frontend — `apps/frontend`

| Component | Technology |
|-----------|------------|
| Framework | **Next.js 16** (Pages Router) |
| UI | React 19, custom CSS (DOVA-Startup brand) |
| Icons | lucide-react |
| State | React Context (Auth, Cart, Toast) |
| API client | Fetch wrapper + sessionStorage Bearer token |

### Shared — `shared/`

| Contents | Examples |
|----------|----------|
| TypeScript types | `User`, `Product`, `Cart`, `Order`, … |
| Business helpers | `minOrderFor`, `cartBadgeCount`, `passwordToggleState` |
| Product images | Unsplash mapping per product + category fallback |
| Product units | kg/L labels, stock messages |

### Infrastructure & tooling

| Tool | Purpose |
|------|---------|
| **GitHub Actions** | CI: build, typecheck, test |
| **PM2** | Process manager on VPS production |
| **Vercel** | Optional frontend deploy (`vercel.json`) |
| **Jest + ts-jest** | Unit tests |
| **PostgreSQL migrations** | `database/migrations/001–006+` |
| **Scripts** | migrate, seed, smoke-week4, smoke:production |

### Database migrations

| File | Contents |
|------|----------|
| `001_init.sql` | Initial schema: users, products, cart, orders, supplier |
| `002_week4.sql` | `fulfillment_type` pickup/delivery |
| `003_feedlog_extensions.sql` | Native feedback board |
| `004_cart_order_hardening.sql` | Cart/order constraints (v0.5.0 batch) |
| `005_feedback_postgres.sql` | Feedback Postgres persistence |
| `006_email_otp.sql` | Email OTP columns (active in production) |

---

## 3. Monorepo architecture

```
dova/
├── apps/
│   ├── backend/          # NestJS API → :3000 /api/v1
│   └── frontend/         # Next.js → dev :3001, prod :3002
├── shared/               # Types + pure helpers (dova-shared package)
├── database/migrations/  # SQL schema
├── scripts/              # migrate.js, seed.js, smoke-week4.js
└── .github/workflows/    # ci.yml, database-migrate.yml
```

### Data operation modes

| Mode | Env | Behavior |
|------|-----|----------|
| **In-memory** | `USE_IN_MEMORY=true` | Local demo without PostgreSQL — seed in RAM |
| **Production** | `USE_IN_MEMORY=false` | PostgreSQL required; Redis optional |

### Cross-origin auth (production)

Frontend (`dova.dntech.id`) and API (`api.dova.dntech.id`) on different subdomains:

- `CROSS_SITE_COOKIES=true`
- Bearer token stored in `sessionStorage` (`auth-session.ts`)
- Refresh/logout send token via body + cookie

---

## 4. Features — implementation status

### 4.1 Storefront & catalog

| Feature | Status | Technical notes |
|---------|--------|-----------------|
| Home, About, Contact | ✅ Done | Contact form → DB + admin inbox |
| Browse products + pagination | ✅ Done | `GET /products` |
| Search + category filter | ✅ Done | Query params |
| Product detail + delivery slot | ✅ Done | Morning/evening required before add |
| Product images | ✅ Done | Per-product mapping + `ProductImage` onError fallback |
| Mobile responsive + hamburger | ✅ Done | CSS mobile-first + nav-drawer fix |
| Desktop navbar | ✅ Done | `header-inner` layout fix |

### 4.2 Auth & roles

| Feature | Status | Technical notes |
|---------|--------|-----------------|
| Customer register/login | ✅ Done | Email validation, password ≥8 |
| Email OTP verify | ✅ Done | Required in production; Resend/SMTP |
| Forgot / reset password | ✅ Done | OTP flow + session revoke |
| Supplier register + docs | ✅ Done | PDF/JPG/PNG upload |
| Role guards (customer/supplier/admin) | ✅ Done | `requireRole()` + `RequireAuth` frontend |
| JWT refresh + revoke | ✅ Done | Session DB + optional Redis |
| Cross-origin Bearer auth | ✅ Done | Fix BUG-002/003 |
| Profile edit + change password | ✅ Done | `PATCH /auth/me`, profile Security tab |
| Login unverified → redirect verify | ✅ Done | Auto resend OTP |
| Password toggle UI | ✅ Done | `passwordToggleState()` shared helper |

### 4.3 Cart & checkout

| Feature | Status | Technical notes |
|---------|--------|-----------------|
| Add/update/remove cart | ✅ Done | Per-item delivery slot |
| Empty slot validation | ✅ Done | Toast + backend BadRequest |
| Stock validation (no silent cap) | ✅ Done | BUG-CART-005 |
| Cart badge = line item count | ✅ Done | `cartBadgeCount()` — not total kg |
| Checkout pickup / delivery | ✅ Done | Min order enforced |
| Order creation + clear cart | ✅ Done | Stock decrement |
| Checkout duplicate key fix | ✅ Done | BUG-007 — new UUID order_items |
| Re-order from history | ✅ Done | PR #6 — `/customer/orders/[id]` |

### 4.4 Payment (Paystack)

| Feature | Status | Technical notes |
|---------|--------|-----------------|
| Initialize payment | ✅ Done | Mock if secret empty |
| Verify payment | ✅ Done | GET/POST verify |
| Webhook HMAC | ✅ Done | Signature validation |
| Payment reference idempotency | ✅ Done | PAY-02 |
| Live Paystack in production | ✅ Done | Keys configured on VPS |

### 4.5 Supplier dashboard

| Feature | Status | Technical notes |
|---------|--------|-----------------|
| Product CRUD | ✅ Done | |
| Image upload / URL | ✅ Done | Multipart |
| Stock adjust + history | ✅ Done | |
| Soft delete product | ✅ Done | Filter `is_active` — SUP-03 |
| Own products only | ✅ Done | BUG-008 |
| Order fulfillment status | ✅ Done | processing → shipped → delivered |

### 4.6 Admin dashboard

| Feature | Status | Technical notes |
|---------|--------|-----------------|
| Dashboard stats | ✅ Done | |
| Approve/reject supplier | ✅ Done | Postgres `$1::varchar` fix v0.5.0 |
| Users — full CRUD admin | ✅ Done | Edit, role, reset password, active toggle |
| Delete user (no orders) | ✅ Done | v0.5.4+ |
| Users / products / orders | ✅ Done | Tab Available/Low Stock/Hidden |
| Contacts inbox | ✅ Done | |
| Feedback moderation | ✅ Done | Native board |

### 4.7 Customer — My Orders (PR #6)

| Feature | Status | Route |
|---------|--------|-------|
| Profile + tabs | ✅ Done | `/customer/profile` |
| Purchase history + filter | ✅ Done | `/customer/history` |
| Order detail + re-order | ✅ Done | `/customer/orders/[id]` |

### 4.8 Feedback board (native)

External FeedLog **replaced** by native board in DOVA.

| Feature | Status | Route / API |
|---------|--------|-------------|
| Submit idea + vote | ✅ Done | `/feedback`, `POST /feedback/posts/:id/vote` |
| Comments | ✅ Done | |
| Roadmap columns | ✅ Done | `/feedback/roadmap` |
| Changelog | ✅ Done | `/feedback/changelog` |
| Admin status update | ✅ Done | Admin panel |

---

## 5. Technical work completed

### 5.1 MVP core (Week 1–4)

- Monorepo NestJS + Next.js + shared types
- JWT multi-role auth
- Catalog, cart, checkout, orders
- Supplier + admin dashboards
- Paystack integration + mock fallback
- PostgreSQL migrations + seed scripts
- Native feedback board (replaces FeedLog)
- GitHub Actions CI pipeline

### 5.2 Deploy & ops

| Work | Commit / doc |
|------|--------------|
| ENV setup guide VPS | `ENV-SETUP.md` |
| Build order: shared → backend → frontend | `1145a14` |
| Production URLs live | `dova.dntech.id`, `api.dova.dntech.id` |
| PM2 deploy pattern | Documented in ENV-SETUP |
| Vercel config | `vercel.json` |

### 5.3 UAT bug fixes (August 2026)

All UAT sprint defects fixed — details in [`UAT-BUG-FIXES.md`](./UAT-BUG-FIXES.md).

| ID | Summary | Severity |
|----|---------|----------|
| BUG-001 | Category Chicken → Meat | Medium |
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
| BLOCKER | Cheap UAT products min-order | Major |

### 5.4 Post-launch hardening (August 2026)

| Work | Notes |
|------|-------|
| Email OTP production | Required for customer signup |
| Forgot / reset password | Full OTP flow |
| Profile self-service | `PATCH /auth/me`, change password |
| Admin delete user | No orders only |
| Login unverified redirect | Auto resend OTP |
| Production smoke | 29 steps + 10 negative |

### 5.5 Regression tests

Helpers + tests added to prevent UI/logic regressions:

| Helper / test | File |
|---------------|------|
| `cartBadgeCount()` | `shared/src/index.ts` + spec |
| `passwordToggleState()` | `shared/src/index.ts` + spec |
| UAT seed products assertion | `app.service.spec.ts` |
| Delivery slot rejection | `app.service.spec.ts` |
| Supplier soft-delete filter | `app.service.spec.ts` |

**Total:** 151 tests · all green.

### 5.6 UX / mobile fixes

| Work | Commit |
|------|--------|
| Mobile layout all viewports | `b8b20b7` |
| Hamburger menu tap fix | `48f2dda` |
| Desktop navbar layout | `64f8750`, `d5eb686` |
| Broken Unsplash images + fallback | `b7c6e58` |
| Contact phone update | `2bea2d1` |
| My Orders page (PR #6) | `81317cc` |

---

## 6. API surface (summary)

Base URL: `/api/v1`

| Group | Main endpoints |
|-------|----------------|
| Health | `GET /health` |
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `/verify-otp`, `/forgot-password`, `/reset-password`, `GET /auth/me`, `PATCH /auth/me` |
| Catalog | `GET /categories`, `/products`, `/products/:id` |
| Cart | `GET /cart`, `POST /cart/add`, `PUT/DELETE /cart/items/:id` |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/:id` |
| Payments | `POST /payments/initialize`, `GET/POST /payments/verify`, webhook |
| Supplier | `/suppliers/*` — products, stock, orders |
| Admin | `/admin/*` — dashboard, suppliers, users, products, orders, contacts |
| Contact | `POST /contact` |
| Feedback | `/feedback/*` — posts, votes, comments, roadmap, changelog |

Full API doc: [API Documention.md](./API%20Documention.md)

---

## 7. Testing & quality

| Layer | Status | Location |
|-------|--------|----------|
| Unit tests | ✅ 151 passed | `*.spec.ts` in shared, backend, frontend/lib |
| CI | ✅ build + typecheck + test | `.github/workflows/ci.yml` |
| Coverage | ~52% statements | `npm run test:coverage` |
| E2E Playwright | ❌ Not yet | Backlog |
| DB integration tests | ⚠️ Minimal | `database.service.ts` low coverage |
| Manual UAT | ✅ August sprint | Excel + [`GUIDE.md`](./GUIDE.md) |
| Production smoke | ✅ 29+10 pass | `npm run smoke:production` |

### Open QA gaps (from code triage)

| Gap | Priority | Notes |
|-----|----------|-------|
| Admin UI manual UAT (ADM-01–07) | P1 | Documented in bug triage |
| Feedback UI manual UAT (FEED-01–10) | P1 | Documented in bug triage |
| Paystack live card (PAY-03) | P1 | One manual transaction |
| Re-order partial failure | P2 | Loop add without rollback |
| Meat category fallback image broken ID | P1 | `CATEGORY_IMAGES.Meat` ∈ `BROKEN_IMAGE_IDS` |

---

## 8. Deployment & environment

### Production (VPS)

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

Full env guide: [`ENV-SETUP.md`](./ENV-SETUP.md)

### Local dev

```bash
npm install
cp .env.dev .env
cp apps/backend/.env.dev apps/backend/.env
cp apps/frontend/.env.dev apps/frontend/.env.local
npm run dev
```

| Service | Dev URL |
|---------|---------|
| Storefront | http://localhost:3001 |
| API | http://localhost:3000/api/v1/health |

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

---

## 9. Current status (August 2026)

### ✅ Complete (code)

- Full MVP user journeys: customer, supplier, admin
- Production deployed and accessible
- UAT bug sprint fixed + regression tests
- My Orders / Purchase History (PR #6)
- Native feedback board
- Email OTP + password reset
- Profile self-service
- Mobile + desktop UI stable
- CI green · 151 tests · production smoke pass

### ⚠️ Conditional (needs ops / business)

| Item | What's needed |
|------|---------------|
| Manual UAT admin + feedback UI | QA checklist execution |
| Paystack live proof | Ongoing transaction monitoring |
| Email notifications | `RESEND_API_KEY` or Gmail SMTP |
| Redis production | Optional — backend runs without Redis |

### ❌ Out of MVP / backlog

- Product reviews API, wishlist, discounts
- Courier tracking
- Playwright E2E suite
- Production APM / monitoring
- Mutation testing gate (Stryker)

---

## 10. Related documents

| Document | Path | Contents |
|----------|------|----------|
| Feature catalog | [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) | Available vs out-of-scope |
| ENV setup | [ENV-SETUP.md](./ENV-SETUP.md) | VPS/production env |
| Test catalog | [TEST-CASES.md](./TEST-CASES.md) | Manual + automated cases |
| UAT fixes | [UAT-BUG-FIXES.md](./UAT-BUG-FIXES.md) | Bug log + verification |
| QA guide | [GUIDE.md](./GUIDE.md) | Manual QA workflow |
| Bug triage | [DOVA-BUG-TRIAGE.md](./DOVA-BUG-TRIAGE.md) | Fingerprints + backlog |
| Runbook | [RUNBOOK.md](./RUNBOOK.md) | Deploy & troubleshoot |
| Wiki index | [00_INDEX.md](../00_INDEX.md) | DOVA product index |

---

## Document changelog

| Date | Change |
|------|--------|
| 2026-08-28 | Renamed from STATUS-LENGKAP.md; full English; HEAD `9e37a8a`, 151 tests, production live |
| 2026-08-27 | Removed launch budget links (personal docs, not team wiki) |
| 2026-08-23 | Initial document — stack, features, technical work, August 2026 status |
