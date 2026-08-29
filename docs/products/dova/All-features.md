# DOVA — All Features

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer · [@dreamcraft17](https://github.com/dreamcraft17)  
> **App HEAD:** `71225e3` · **Release:** v0.5.4 · **Production:** [dova.dntech.id](https://dova.dntech.id)

Master list of **every feature** shipped in DOVA as of 29 August 2026. For API paths, status codes, and QA notes see [code/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md).

**Related:** [README.md](./README.md) · [code/API.md](./docs/API.md) · [operations/current-phase.md](./docs/current-phase.md)

---

## Summary

| | |
|---|---|
| **Product** | Agricultural / food supply marketplace (Nigeria · NGN · Paystack) |
| **Roles** | Customer · Supplier · Admin |
| **Frontend routes** | 27 |
| **API handlers** | ~67 |
| **Unit tests** | 158 pass |
| **Production smoke** | 29 steps + 10 negative |

### Status legend

| Label | Meaning |
|-------|---------|
| **Live** | In UI + API; production-ready |
| **Conditional** | In code; needs env key or ops config |
| **Roadmap** | Not in current MVP |

---

## By role

### Customer

- Register with inline email OTP on register page (Send code → enter code → create account)
- Legacy Profile email verify for accounts registered before inline OTP
- Login · logout · refresh session · Remember Me
- Forgot password · reset password via OTP
- View and edit profile (name, phone) · verified badge
- Change password while signed in
- Browse catalog · search · filter by category · product detail
- Add to cart · update quantity · set delivery slot · remove items
- Checkout (pickup or delivery) · min-order enforcement
- Pay via Paystack (or mock in dev) · payment verify page
- View order history · filter by status · order detail
- Re-initiate payment for pending orders
- Submit contact form
- Browse and vote on feedback board · post ideas · comment

### Supplier

- Register with verification documents (PDF/JPG/PNG)
- Pending / approved / rejected status gate
- Dashboard overview with stats
- Product CRUD · image upload · hide/activate products
- Stock adjust (restock/damage) · stock history
- View and update order line status
- Edit account profile (business info read-only until approved)

### Admin

- Dashboard statistics
- Approve or reject supplier applications (with reason)
- User list · user detail · edit user · toggle active
- Admin reset user password · delete user (no order history)
- Products overview · toggle product active
- Orders overview · filter and search
- Contact form inbox
- Feedback moderation · official replies · changelog management

### Public (no login)

- Home · About · product catalog · product detail
- Categories listing
- Contact form
- Feedback board read (posts, roadmap, changelog)
- API health check

---

## Complete feature list

### 1. Auth & accounts

| # | Feature | Status |
|---|---------|--------|
| 1 | Customer registration (inline OTP on register page) | Live |
| 2 | Send registration code (`/auth/send-registration-code`) | Live |
| 3 | Legacy email OTP verification (Profile) | Live |
| 4 | Resend OTP — legacy (60s cooldown) | Live |
| 5 | Login (customer / supplier / admin) | Live |
| 6 | Login redirect when legacy unverified | Live |
| 7 | Logout | Live |
| 8 | Refresh token | Live |
| 9 | Remember Me (extended refresh TTL) | Live |
| 10 | Forgot password | Live |
| 11 | Reset password via OTP | Live |
| 12 | GET my profile | Live |
| 13 | Edit profile (name + phone) | Live |
| 14 | Change password (signed in) | Live |
| 15 | Supplier registration + document upload | Live |
| 16 | JWT role guards (401/403) | Live |
| 17 | Cross-origin Bearer + httpOnly cookies | Live |
| 18 | QA fixed OTP for smoke tests | Conditional |

### 2. Customer & profile

| # | Feature | Status |
|---|---------|--------|
| 19 | Editable profile page | Live |
| 20 | Change password from profile Security tab | Live |
| 21 | Order history with status filter | Live |
| 22 | Order detail page | Live |
| 23 | Legacy `/customer` redirect to history | Live |
| 24 | Nav: My Orders / Cart / Profile | Live |
| 25 | Checkout login modal for guests | Live |

### 3. Catalog & storefront

| # | Feature | Status |
|---|---------|--------|
| 25 | Home hero (DOVA brand) | Live |
| 26 | About page | Live |
| 27 | Product listing + search + category filter | Live |
| 28 | Product detail (invalid UUID → 404) | Live |
| 29 | Categories API + display | Live |
| 30 | Auto kg/L product units by category | Live |
| 31 | Category-based product placeholder images | Live |
| 32 | Mobile hamburger navigation | Live |

### 4. Cart & checkout

| # | Feature | Status |
|---|---------|--------|
| 33 | View cart | Live |
| 34 | Add to cart (fractional qty, min 1) | Live |
| 35 | Update quantity and delivery slot per item | Live |
| 36 | Remove cart item | Live |
| 37 | Cart badge count in header | Live |
| 38 | Checkout form (pickup / delivery) | Live |
| 39 | Minimum order pickup ₦3,000 | Live |
| 40 | Minimum order delivery ₦5,000 | Live |
| 41 | Post-Paystack payment verify page | Live |

### 5. Payments (Paystack)

| # | Feature | Status |
|---|---------|--------|
| 42 | Payment config endpoint (mock vs live) | Live |
| 43 | Initialize payment (DOVA-* reference) | Live |
| 44 | Verify payment (GET/POST) | Live |
| 45 | Paystack webhook with HMAC | Live |
| 46 | Mock payment (no secret key) | Conditional |
| 47 | Paystack live keys on production VPS | Conditional |

### 6. Orders

| # | Feature | Status |
|---|---------|--------|
| 48 | Create order from cart (clears cart) | Live |
| 49 | List my orders | Live |
| 50 | Order detail (owner or admin) | Live |
| 51 | Status flow: pending → paid → processing → shipped → delivered | Live |
| 52 | Complete payment for pending orders from history | Live |

### 7. Supplier

| # | Feature | Status |
|---|---------|--------|
| 53 | Supplier status check (pending/approved/rejected) | Live |
| 54 | Dashboard overview tab | Live |
| 55 | Product CRUD | Live |
| 56 | Product image upload (JPG/PNG/WEBP ≤ 5 MB) | Live |
| 57 | Product tabs: available / low stock / hidden | Live |
| 58 | Activate hidden product | Live |
| 59 | Stock adjust (restock / damage) | Live |
| 60 | Stock history | Live |
| 61 | Supplier orders list + per-line status update | Live |
| 62 | Supplier profile tab (edit account) | Live |
| 63 | Gate: block product management until approved | Live |

### 8. Admin

| # | Feature | Status |
|---|---------|--------|
| 64 | Dashboard stats | Live |
| 65 | Pending suppliers list | Live |
| 66 | Approve supplier | Live |
| 67 | Reject supplier (with reason) | Live |
| 68 | Users list | Live |
| 69 | User detail modal (verification, order counts) | Live |
| 70 | Edit user (name, email, phone, role, active) | Live |
| 71 | Admin reset user password | Live |
| 72 | Toggle user active | Live |
| 73 | Delete user (no orders; block self-delete) | Live |
| 74 | Products admin view (Available / Low / Hidden) | Live |
| 75 | Toggle product active | Live |
| 76 | Orders admin view (filter + search) | Live |
| 77 | Contact form inbox | Live |
| 78 | Feedback moderation + official reply | Live |

### 9. Feedback board (native)

Replaces external FeedLog — full stack in monorepo.

| # | Feature | Status |
|---|---------|--------|
| 79 | List and search posts (sort by votes / new) | Live |
| 80 | Post detail page | Live |
| 81 | Create post (auth optional per config) | Live |
| 82 | Vote on posts (auth required) | Live |
| 83 | Comments on posts | Live |
| 84 | Official admin reply | Live |
| 85 | Roadmap columns view | Live |
| 86 | Changelog list + slug detail | Live |
| 87 | Admin status update on posts | Live |
| 88 | Admin create changelog entry | Live |
| 89 | Feature flag to hide legacy FeedLog link | Live |

### 10. Public & contact

| # | Feature | Status |
|---|---------|--------|
| 90 | Contact form (persisted → admin inbox) | Live |
| 91 | Health check endpoint | Live |
| 92 | Public catalog (categories + products, no auth) | Live |

### 11. Ops, QA & tooling

| # | Feature | Status |
|---|---------|--------|
| 93 | Unit test suite (`npm run test`, 151 tests) | Live |
| 94 | Production API smoke (`npm run smoke:production`) | Live |
| 95 | Week 4 local smoke (`npm run smoke:week4`) | Live |
| 96 | Database migrations (`npm run db:migrate`) | Live |
| 97 | Seed demo data (`npm run db:seed`) | Live |
| 98 | CI build + test (GitHub Actions) | Live |
| 99 | VPS deploy runbook + PM2 | Live |
| 100 | Bug triage documentation | Live |
| 101 | Release readiness audit | Live |

**Total shipped features:** 101 (97 live · 4 conditional)

---

## Business rules

| Rule | Value |
|------|-------|
| Currency | NGN (₦) |
| Min order — pickup | ₦3,000 |
| Min order — delivery | ₦5,000 |
| Delivery slots | Morning · Evening (per cart item) |
| Product units | kg / L (auto by category) |
| Supplier doc upload | PDF/JPG/PNG ≤ 5 MB |
| Product image upload | JPG/PNG/WEBP ≤ 5 MB |
| Email verification | Required in production (Resend / SMTP) |

---

## Frontend routes (27)

| Area | Paths |
|------|-------|
| Storefront | `/` · `/products` · `/products/[id]` · `/about` · `/contact` |
| Commerce | `/cart` · `/checkout` · `/checkout/verify` |
| Auth | `/auth/login` · `/auth/register` · `/auth/verify-email` · `/auth/forgot-password` · `/auth/reset-password` · `/auth/supplier-register` |
| Customer | `/customer` (→ history) · `/customer/profile` · `/customer/history` · `/customer/orders/[id]` |
| Supplier | `/supplier` |
| Admin | `/admin` |
| Feedback | `/feedback` · `/feedback/[id]` · `/feedback/roadmap` · `/feedback/changelog` · `/feedback/changelog/[slug]` |

---

## API surface (summary)

Base: `{API}/api/v1` · Auth: JWT httpOnly cookies + Bearer header.

| Group | Key endpoints |
|-------|---------------|
| Auth | `/auth/send-registration-code` · `/auth/register` · `/auth/login` · `/auth/logout` · `/auth/refresh` · `/auth/me` · `/auth/verify-otp` · `/auth/resend-otp` · `/auth/forgot-password` · `/auth/reset-password` · `/auth/change-password` |
| Catalog | `/categories` · `/products` · `/products/:id` |
| Cart | `/cart` · `/cart/add` · `/cart/items/:id` |
| Orders | `/orders` · `/orders/:id` |
| Payments | `/payments/config` · `/payments/initialize` · `/payments/verify` · `/payments/webhook` |
| Supplier | `/suppliers/register` · `/suppliers/status` · `/suppliers/products*` · `/suppliers/orders` |
| Admin | `/admin/dashboard` · `/admin/suppliers/*` · `/admin/users/*` · `/admin/products/*` · `/admin/orders` · `/admin/contacts` |
| Feedback | `/feedback/posts` · `/feedback/roadmap` · `/feedback/changelog` |
| Public | `/health` · `/contact` |

Full endpoint list: [code/API.md](./docs/API.md) · [code/DOVA-API-QA-POSTMAN.md](./docs/DOVA-API-QA-POSTMAN.md)

---

## Not in MVP (roadmap)

| Feature | Status |
|---------|--------|
| Product reviews & ratings | Roadmap |
| Wishlist | Roadmap |
| Discount / promo codes | Roadmap |
| Courier live tracking | Roadmap |
| Full Playwright E2E suite | Roadmap |
| Production APM / alerting | Roadmap |
| Multi-language UI | Roadmap |
| `dovachain.com` DNS alias | Optional ops |

---

## Recent additions (post v0.5.4)

| Date | Feature |
|------|---------|
| 2026-08-29 | Inline registration OTP on register page · auth UI split layout |
| 2026-08-29 | Admin delete user (cascade order history) · Customer copy |
| 2026-08-28 | Profile self-service · change password |
| 2026-08-27 | Email OTP required · forgot/reset password |
| 2026-08-27 | Production smoke 29+10 · Paystack live |

Details: [code/CHANGELOG.md](./docs/CHANGELOG.md)

---

*Author: Dozer · [@dreamcraft17](https://github.com/dreamcraft17)*
