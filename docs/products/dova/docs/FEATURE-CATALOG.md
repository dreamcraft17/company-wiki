# DOVA — Feature Catalog (Complete)

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer · [@dreamcraft17](https://github.com/dreamcraft17)  
> **App HEAD:** `71225e3` · **Production:** [dova.dntech.id](https://dova.dntech.id)  
> **Spec baseline:** Aggressive 4W PRD/SRS/SDD · MVP + post-launch hardening

This document is the **actual feature inventory** in the codebase and production as of **28 August 2026**. Use it for QA, stakeholder review, and future PRD writing.

**Related:** [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) · [API.md](./API.md) · [DOVA-API-QA-POSTMAN.md](./DOVA-API-QA-POSTMAN.md) · [TEST-CASES.md](./TEST-CASES.md)

---

## How to read status

| Status | Meaning |
|--------|---------|
| **Available** | In UI + API; deployed / production-ready |
| **Conditional** | In code; needs env key, ops, or business sign-off |
| **Scaffold** | Partial UI/API; no end-to-end journey yet |
| **Out of MVP** | Not promised in the current release |

---

## Summary metrics

| Metric | Value |
|--------|-------|
| Frontend pages | **27** routes (Next.js pages router) |
| API routes | **~67** handlers (`app.controller.ts` + feedback) |
| Unit tests | **158 pass** (`npm run test:unit`) |
| Production smoke | **29 steps + 10 negative** (`npm run smoke:production`) |
| Roles | `customer` · `supplier` · `admin` |
| Currency | NGN (₦) · Paystack |

---

## 1. Auth & accounts

| Feature | Status | API / UI | Notes |
|---------|--------|----------|-------|
| Send registration code | Available | `POST /auth/send-registration-code` · `/auth/register` | Before account exists; 60s cooldown |
| Customer register (inline OTP) | Available | `POST /auth/register` · `/auth/register` | Requires `code`; account **verified** + session cookies |
| Legacy email OTP verify | Available | `POST /auth/verify-otp` · `/customer/profile` | Pre-inline accounts only |
| Resend OTP (legacy) | Available | `POST /auth/resend-otp` | Profile / legacy pending users |
| Login (customer/supplier/admin) | Available | `POST /auth/login` · `/auth/login` | JWT + httpOnly cookie + Bearer |
| Login → unverified legacy → Profile | Available | — · `/auth/login` | Redirect legacy accounts to Profile verify |
| Logout | Available | `POST /auth/logout` | Revoke session |
| Refresh token | Available | `POST /auth/refresh` | Remember Me = longer TTL |
| Remember Me | Available | login/verify body | localStorage + refresh 30d |
| Forgot password | Available | `POST /auth/forgot-password` · `/auth/forgot-password` | Generic message (no email leak) |
| Reset password (OTP) | Available | `POST /auth/reset-password` · `/auth/reset-password` | Revoke all sessions |
| GET my profile | Available | `GET /auth/me` | Role, emailVerifiedAt, phone |
| Edit profile (name + phone) | Available | `PATCH /auth/me` · `/customer/profile` · supplier Profile tab | Self-service |
| Change password (signed in) | Available | `POST /auth/change-password` · profile Security | Revoke session → re-login |
| Supplier register + docs | Available | `POST /suppliers/register` · `/auth/supplier-register` | PDF/JPG/PNG ≤5 MB |
| Role guards | Available | JWT guard + `@Roles()` | 401/403 per route |
| Cross-origin Bearer + cookies | Available | `CROSS_SITE_COOKIES=true` | Production subdomains |
| QA fixed OTP (smoke only) | Conditional | env `DOVA_QA_FIXED_OTP` | Pattern `qa.softlaunch.*@example.com` |

---

## 2. Customer & profile

| Feature | Status | Page | Notes |
|---------|--------|------|-------|
| Editable profile | Available | `/customer/profile` | Name, phone, email verified badge |
| Change password from profile | Available | `/customer/profile` → Security | Forgot password link also |
| Order history (rich) | Available | `/customer/history` | Filter status · pay again (pending) |
| Order detail | Available | `/customer/orders/[id]` | Line items · status · address |
| Legacy `/customer` | Available | redirect → `/customer/history` | Route consolidation |
| Nav: My Orders / Cart / Profile | Available | `Layout.tsx` | Customer chrome |
| Checkout login modal | Available | `/checkout` | Guest → modal login |

---

## 3. Catalog & storefront

| Feature | Status | API / UI | Notes |
|---------|--------|----------|-------|
| Home hero | Available | `/` | DOVA-Startup brand |
| About | Available | `/about` | |
| Product listing + search + filter | Available | `GET /products` · `/products` | Pagination · categoryId |
| Product detail | Available | `GET /products/:id` · `/products/[id]` | Invalid UUID → 404 |
| Categories | Available | `GET /categories` | |
| Auto kg/L units | Available | `dova-shared` product units | By category/name |
| Product placeholder image | Available | `ProductImage` | Category-based fallback |
| Mobile hamburger nav | Available | `Layout.tsx` | Responsive |

---

## 4. Cart & checkout

| Feature | Status | API / UI | Notes |
|---------|--------|----------|-------|
| View cart | Available | `GET /cart` · `/cart` | Customer role only |
| Add to cart | Available | `POST /cart/add` | Qty fractional · min 1 |
| Update qty / delivery slot | Available | `PUT /cart/items/:id` | Morning / evening per item |
| Remove item | Available | `DELETE /cart/items/:id` | |
| Cart badge count | Available | `CartContext` | Header nav |
| Checkout form | Available | `/checkout` | Pickup / delivery |
| Min order pickup ₦3,000 | Available | `shared` helpers | Enforced API + UI |
| Min order delivery ₦5,000 | Available | `shared` helpers | |
| Payment verify page | Available | `/checkout/verify` | Post-Paystack redirect |

---

## 5. Payments (Paystack)

| Feature | Status | API | Notes |
|---------|--------|-----|-------|
| Payment config | Available | `GET /payments/config` | Mode mock vs paystack |
| Initialize payment | Available | `POST /payments/initialize` | Reference DOVA-* |
| Verify payment (GET/POST) | Available | `GET/POST /payments/verify` | Mark order paid |
| Paystack webhook | Available | `POST /payments/webhook` | HMAC signature |
| Mock payment (no secret) | Conditional | — | Dev / demo |
| Paystack live | Conditional | env keys | Production VPS configured |

---

## 6. Orders

| Feature | Status | API | Notes |
|---------|--------|-----|-------|
| Create order from cart | Available | `POST /orders` | Clears cart on success |
| List my orders | Available | `GET /orders` | Customer |
| Order detail | Available | `GET /orders/:id` | Owner or admin |
| Status flow | Available | pending → paid → processing → shipped → delivered | Supplier updates per line |
| Complete payment (pending) | Available | `/customer/history` | Re-init Paystack |

---

## 7. Supplier

| Feature | Status | API / UI | Notes |
|---------|--------|----------|-------|
| Supplier status | Available | `GET /suppliers/status` | pending / approved / rejected |
| Dashboard overview | Available | `/supplier` tab overview | Stats · welcome |
| Product CRUD | Available | `/suppliers/products*` · Products tab | |
| Image upload | Available | multipart `image` | JPG/PNG/WEBP ≤5 MB |
| Product tabs (available/low/hidden) | Available | supplier UI | Hide ≠ delete |
| Activate hidden product | Available | `PUT .../activate` | |
| Stock adjust (restock/damage) | Available | `PUT .../stock` | Decrease on purchase |
| Stock history | Available | `GET .../stock-history` | |
| Supplier orders + status update | Available | `/suppliers/orders` · Orders tab | Per line item |
| Supplier profile tab | Available | `/supplier` Profile | Edit account + business read-only |
| Pending/rejected gate | Available | supplier UI | Block products until approved |

---

## 8. Admin

| Feature | Status | API / UI | Notes |
|---------|--------|----------|-------|
| Dashboard stats | Available | `GET /admin/dashboard` · `/admin` | |
| Pending suppliers list | Available | `GET /admin/suppliers/pending` | |
| Approve / reject supplier | Available | `POST .../approve` · `.../reject` | Rejection reason |
| Users list | Available | `GET /admin/users` | |
| User detail modal | Available | `GET /admin/users/:id` | emailVerifiedAt · order counts |
| Edit user (name/email/phone/role/active) | Available | `PUT /admin/users/:id` | |
| Admin reset password | Available | `POST .../reset-password` | |
| Toggle user active | Available | `PUT .../active` | |
| Delete user (no orders) | Available | `DELETE /admin/users/:id` | Block self-delete · `canDelete` flag |
| Products admin view | Available | `GET /admin/products` | Available / Low / Hidden tabs |
| Toggle product active | Available | `PUT /admin/products/:id/active` | |
| Orders admin view | Available | `GET /admin/orders` | Filter status · search |
| Contacts inbox | Available | `GET /admin/contacts` | From public form |
| Feedback moderation | Available | Admin feedback tab | Status · official reply |

---

## 9. Feedback board (native)

Replaces external FeedLog — full stack in monorepo.

| Feature | Status | API / UI | Notes |
|---------|--------|----------|-------|
| List / search posts | Available | `GET /feedback/posts` · `/feedback` | Sort votes/new |
| Post detail | Available | `/feedback/[id]` | |
| Create post | Available | `POST /feedback/posts` | Auth optional (config) |
| Vote | Available | `POST .../vote` | Auth required |
| Comments | Available | `GET/POST .../comments` | |
| Official reply (admin) | Available | `POST .../official-reply` | |
| Roadmap columns | Available | `GET /feedback/roadmap` · `/feedback/roadmap` | |
| Changelog list + slug | Available | `/feedback/changelog` | |
| Admin status update | Available | `PUT .../status` | |
| Create changelog (admin) | Available | `POST /feedback/changelog` | |
| Feature flag hide FeedLog link | Available | env / `feedlog.ts` | Native board default |

---

## 10. Public & contact

| Feature | Status | API / UI | Notes |
|---------|--------|----------|-------|
| Contact form | Available | `POST /contact` · `/contact` | Persisted · admin inbox |
| Health check | Available | `GET /health` | PM2 / smoke |
| Public catalog (no auth) | Available | categories + products | |

---

## 11. Ops, QA & tooling

| Feature | Status | Command / doc | Notes |
|---------|--------|---------------|-------|
| Unit tests | Available | `npm run test` | 151 tests |
| Production API smoke | Available | `npm run smoke:production` | 29 + 10 neg |
| Week4 smoke (local) | Available | `npm run smoke:week4` | |
| DB migrations | Available | `npm run db:migrate` | 001–006+ |
| Seed demo data | Available | `npm run db:seed` | Admin + supplier |
| CI build + test | Available | `.github/workflows/ci.yml` | |
| VPS deploy runbook | Available | [RUNBOOK.md](./RUNBOOK.md) · [VPS-DEPLOY.md](./VPS-DEPLOY.md) | PM2 |
| Bug triage doc | Available | [DOVA-BUG-TRIAGE.md](./DOVA-BUG-TRIAGE.md) | Fingerprint + backlog |
| Release readiness audit | Available | [DOVA-RELEASE-READINESS-AUDIT.md](./DOVA-RELEASE-READINESS-AUDIT.md) | |

---

## Frontend routes (27)

| Area | Paths |
|------|-------|
| Storefront | `/`, `/products`, `/products/[id]`, `/about`, `/contact` |
| Commerce | `/cart`, `/checkout`, `/checkout/verify` |
| Auth | `/auth/login`, `/auth/register`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/supplier-register` |
| Customer | `/customer` (→ history), `/customer/profile`, `/customer/history`, `/customer/orders/[id]` |
| Supplier | `/supplier` |
| Admin | `/admin` |
| Feedback | `/feedback`, `/feedback/[id]`, `/feedback/roadmap`, `/feedback/changelog`, `/feedback/changelog/[slug]` |

---

## Out of MVP / roadmap

| Item | Status |
|------|--------|
| Product reviews & ratings API | Out of MVP |
| Wishlist | Out of MVP |
| Discount / promo codes | Out of MVP |
| Courier live tracking | Out of MVP |
| Full Playwright E2E suite | Out of MVP |
| Production APM / alerting | Out of MVP |
| `dovachain.com` DNS alias | Optional ops |
| Multi-language UI | Out of MVP |

---

## Recent feature changelog (post v0.5.4)

| Date | Feature |
|------|---------|
| 2026-08-29 | Inline registration OTP on `/auth/register` · legacy Profile verify retained |
| 2026-08-29 | Auth UI split layout (login + register) · Customer copy |
| 2026-08-28 | Profile self-service (`PATCH /auth/me`, change password) |
| 2026-08-28 | Admin delete user (cascade order history) |
| 2026-08-27 | Email OTP required · forgot/reset password · smoke 29+10 |
| 2026-08-27 | Production smoke health retry · Paystack live |

Commit details: [CHANGELOG.md](./CHANGELOG.md)

---

*Author: Dozer · [@dreamcraft17](https://github.com/dreamcraft17) · sync via `dova-company-wiki/scripts/sync-docs.sh`*
