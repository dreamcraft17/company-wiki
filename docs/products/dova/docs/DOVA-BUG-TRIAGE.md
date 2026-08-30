# DOVA — Bug Triage (All Features)

> **Status:** Active · **Last updated:** 2026-08-30 · **Author:** Dozer  
> **Repo HEAD:** `ebd71bd` (**21 commits ahead** of the `8fb5b5e` this doc was last triaged against) · **Environment:** Production (`dova.dntech.id` / `api.dova.dntech.id`)  
> **Method:** AI bug triage pipeline — deterministic fingerprinting + classification + QA routing

This document summarizes triage status across **all DOVA MVP modules**: automated coverage, manual UAT gaps, regression fingerprints, and the backlog of tickets awaiting human approval before execution.

**Related docs:** [TEST-CASES.md](./TEST-CASES.md) · [UAT-BUG-FIXES.md](./UAT-BUG-FIXES.md) · [DOVA-API-QA-POSTMAN.md](./DOVA-API-QA-POSTMAN.md) · [DOVA-RELEASE-READINESS-AUDIT.md](../operations/DOVA-RELEASE-READINESS-AUDIT.md) · [GUIDE.md](./GUIDE.md)

---

## Summary

| Metric | Value |
|--------|-------|
| MVP features | **10 modules** · ~67 API routes |
| Unit tests | **160/160 pass** (`npm run test`, verified 2026-08-30 — up from 146) |
| Global coverage | **~52%** (QA target: 80%, unverified against new tests) |
| Historical UAT bugs | **14 fixed** · **0 open P0/P1** |
| Production smoke (last log) | ⚠️ **No log found** — `ops/logs/` is empty (only `.gitkeep`); **TRI-001 was never actually closed** |
| Manual UAT not yet run | **Admin (ADM-01–07)**, **Feedback (FEED-01–10)**, **Mobile ops (OPS-04)** |

**Triage verdict:** Core journey (register → OTP → cart → order → pay init → supplier → admin API) is **stable**, unit suite grew and stays green. Main risk is unchanged from before, plus one new process regression: **TRI-001 (post-deploy smoke re-run) was marked P0 on 2026-08-28 and still has no evidence of having run** — 21 commits, including the admin-delete feature it was gating, have since shipped without it.

---

## Production URLs

| Service | URL |
|---------|-----|
| Storefront | https://dova.dntech.id |
| API | https://api.dova.dntech.id/api/v1 |
| Health | https://api.dova.dntech.id/api/v1/health |

---

## Feature matrix — triage status

| Module | Routes / pages | Auto test | Smoke | Manual UAT | Status |
|-------|----------------|-----------|-------|------------|--------|
| **1. Auth & roles** | 10 API + 6 pages | ✅ Strong | ✅ Partial | ✅ PASS | 🟢 Low risk |
| **2. Catalog** | 3 API + 2 pages | ✅ | ✅ | ✅ PASS | 🟢 Low risk |
| **3. Cart & slot** | 4 API + 1 page | ✅ + regressions | ✅ | ✅ PASS | 🟢 Low risk |
| **4. Checkout & min order** | 1 API + 2 pages | ✅ | ✅ | ✅ PASS | 🟢 Low risk |
| **5. Payments** | 5 API + verify page | ✅ mock + HMAC | ✅ init only | ⚠️ PAY-03 live | 🟡 Medium |
| **6. Supplier** | 11 API + 2 pages | ✅ CRUD/fulfillment | ✅ partial | ✅ PASS | 🟢 Low risk |
| **7. Admin** | 14 API + 1 page | ✅ incl. delete user | ✅ + DELETE | ❌ Not tested | 🟡 Medium |
| **8. Feedback board** | 13 API + 5 pages | ✅ 6 unit | ✅ GET only | ❌ Not tested | 🟡 Medium |
| **9. Public / contact** | 2 API + 4 pages | ✅ | ✅ | Partial | 🟢 Low risk |
| **10. Ops / health** | health, migrate, PM2 | ✅ env-guard | ✅ | ⚠️ OPS-04 mobile | 🟡 Medium |

---

## Component ownership (routing)

| Component | Main path | Owner |
|-----------|------------|-------|
| Auth | `apps/backend/src/app.service.ts`, `apps/frontend/src/pages/auth/*` | Backend + Frontend |
| Commerce | cart, orders, payments | Backend |
| Supplier | `supplier.tsx`, `/suppliers/*` | Fullstack |
| Admin | `admin.tsx`, `AdminUserModal.tsx` | Fullstack |
| Feedback | `feedback.service.ts`, `pages/feedback/*` | Backend |
| Ops | VPS env, PM2, migrations | Dozer (deploy) |

---

## Per-module — fingerprint & classification

### 1. Auth & roles

| Fingerprint | Anchor | Category | Severity | Status |
|-------------|--------|----------|----------|--------|
| `a1b2-auth-401-unverified` | Login before OTP verification | Application (by design) | Minor | ✅ Expected |
| `c3d4-auth-smtp-535` | `[Mail] SMTP send failed: auth failed` | Environment | Major | ⚠️ Ops — Gmail App Password |
| `e5f6-auth-register-blocked` | Signup rejected, email provider not configured | Environment | Critical | Guard prod OK |
| `g7h8-auth-forgot-nosmoke` | `/auth/forgot-password` missing from smoke | Test gap | Minor | ✅ Fixed — smoke 24–26 |

**Regression:** BUG-002/003 (Bearer token), forgot/reset password unit tests ✅

---

### 2. Catalog & search

| Fingerprint | Issue | Status |
|-------------|-------|--------|
| `cat-001-meat-vegetables` | Chicken showing in Vegetables filter | ✅ Fixed BUG-001 |
| `cat-006-wrong-image` | Wrong Farm Milk image | ✅ Fixed BUG-006 |
| `cat-500-invalid-uuid` | Invalid product id → 500 | ✅ Fixed PROD-01 → 404 |

---

### 3. Cart & delivery slot

| Fingerprint | Issue | Status |
|-------------|-------|--------|
| `cart-004-no-slot` | Add to cart without delivery slot | ✅ Fixed BUG-CART-004 |
| `cart-005-over-stock` | Qty > stock | ✅ Fixed BUG-CART-005 |
| `cart-011-badge-kg` | Cart badge counting kg instead of line items | ✅ Fixed BUG-011 |

---

### 4. Checkout & minimum order

| Fingerprint | Issue | Status |
|-------------|-------|--------|
| `chk-007-dup-pkey` | `order_items_pkey` duplicate | ✅ Fixed BUG-007 |
| `chk-min-delivery-5000` | Checkout delivery < ₦5,000 | ✅ Tested |
| `chk-min-pickup-3000` | Checkout pickup < ₦3,000 | ✅ Tested |

---

### 5. Payments (Paystack)

| Fingerprint | Issue | Category | Priority |
|-------------|-------|----------|----------|
| `pay-002-dup-ref` | Duplicate payment reference | — | ✅ Fixed |
| `pay-webhook-no-sig` | Webhook without HMAC | Security | ✅ Rejected by design |
| `pay-live-card-unverified` | PAY-03 live card not yet UAT'd | Test gap | **P1** |
| `pay-webhook-smoke-missing` | Webhook not in smoke script | Test gap | P2 |

---

### 6. Supplier portal

| Fingerprint | Issue | Status |
|-------------|-------|--------|
| `sup-008-all-products` | Viewing another supplier's products | ✅ Fixed BUG-008 |
| `sup-003-deleted-visible` | Deleted product still visible | ✅ Fixed |
| `sup-approve-42p08` | Postgres cast error on approve | ✅ Fixed BF-017 |

| `sup-upload-multipart-smoke` | Multipart product image upload | ✅ Smoke step 14b (`POST /suppliers/products`) |

---

### 7. Admin panel

| Fingerprint | Issue | Category | Priority |
|-------------|-------|----------|----------|
| `adm-not-uat` | ADM-01–07 not yet manually UAT'd | Test gap | **P1** |
| `adm-delete-new` | DELETE user (`8fb5b5e`) | Needs smoke re-run | P0 after deploy |
| `adm-ui-no-rtl` | `AdminUserModal`, `admin.tsx` have no component test | Test gap | P2 |

**Smoke coverage (latest code, not yet verified in prod log):**

- DELETE pending user (no orders) → 200
- NEG-08: customer token → 403
- NEG-09: admin self-delete → 400

---

### 8. Feedback board (native)

| Fingerprint | Issue | Category | Priority |
|-------------|-------|----------|----------|
| `feed-not-uat` | FEED-01–10 not yet manual | Test gap | **P1** |
| `feed-smoke-get-only` | Smoke only covers `GET /feedback/posts` | Test gap | P2 |
| `feed-vote-dup` | Double vote | — | ✅ Unit tested |

---

### 9. Public & contact

| Fingerprint | Status |
|-------------|--------|
| `contact-persist` | ✅ Smoke POST + admin GET |
| `pub-mobile-layout` | ⚠️ OPS-04 not yet done | P2 |

---

### 10. Ops & infrastructure

| Fingerprint | Issue | Category | Priority |
|-------------|-------|----------|----------|
| `ops-smoke-stale` | Smoke log 23+7; code 26+9 | Test gap | **P0** re-run |
| `ops-migration-007` | Password reset migration | Ops | ✅ if already migrated |
| `ops-doc-drift` | TEST-CASES.md test count | Docs | Trivial | ✅ Fixed |

---

## Regression watch — dedup registry

If a fingerprint matches a ticket that's already **closed**, **reopen as a regression** and raise its priority.

| Bug ID | Fingerprint prefix | Reopen if |
|--------|-------------------|-------------|
| BUG-002/003 | `auth-401-cart-crossorigin` | Cart/add returns 401 despite being logged in |
| BUG-007 | `checkout-order_items_pkey` | Duplicate key on checkout |
| BUG-008 | `supplier-wrong-product-list` | Supplier sees another supplier's SKUs |
| PROD-01 | `products-invalid-uuid-500` | `GET /products/not-uuid` → 500 |
| BF-017 | `supplier-approve-42P08` | Postgres error approving supplier |

Full history: [UAT-BUG-FIXES.md](./UAT-BUG-FIXES.md)

---

## Open backlog — suggested tickets (human approval)

| ID | Title | Category | Severity | Priority | Action |
|----|-------|----------|----------|----------|--------|
| **TRI-001** | Re-run `smoke:production` after deploy `8fb5b5e` — **regression: still not run as of `ebd71bd` (21 commits later)** | Test gap | Major | **P0 (escalated — see Regression watch)** | Run + save log to `ops/logs/smoke-production-latest.log` (currently missing) |
| **TRI-002** | Manual UAT for Admin ADM-01–07 in production | Test gap | Major | **P1** | QA checklist |
| **TRI-003** | UAT Feedback FEED-01–10 | Test gap | Major | **P1** | QA checklist |
| **TRI-004** | Smoke: forgot-password + reset-password | Test gap | Minor | P2 | ✅ Done |
| **TRI-005** | Postman doc: `/auth/forgot-password`, `/auth/reset-password` | Docs | Trivial | P2 | ✅ Done |
| **TRI-006** | Paystack live card PAY-03 | Test gap | Major | P1 | 1× manual transaction |
| **TRI-007** | Mobile smoke OPS-04 | Test gap | Minor | P2 | Browser phone |
| **TRI-008** | Playwright E2E checkout + admin (QA-GAP-05) | Test gap | Minor | P2 | Scaffold |
| **TRI-009** | Frontend page RTL tests | Test gap | Minor | P3 | AdminUserModal, checkout |
| **TRI-010** | Coverage 52% → 80% | Tech debt | Minor | P3 | Incremental |

### Not code bugs (ops / env)

| Issue | Remediation |
|-------|-------------|
| SMTP `535 BadCredentials` | Set `SMTP_PASS` to a 16-char Gmail App Password (not the login password) |
| User stuck at pending registration | Admin → Users → Delete account (shipped `5488101` / `8fb5b5e`) |
| Smoke OTP failing | Set `DOVA_QA_FIXED_OTP` on the server + `SMOKE_OTP_CODE` locally — see [ENV-SETUP.md](../operations/ENV-SETUP.md) |

---

## Smoke vs unit — gap map

| Endpoint group | Unit | Smoke | Manual UAT |
|----------------|------|-------|------------|
| Auth register / OTP / login | ✅ | ✅ | ✅ |
| Auth forgot / reset | ✅ | ✅ | ❌ |
| Cart / checkout / order | ✅ | ✅ | ✅ |
| Payment initialize | ✅ | ✅ | Partial |
| Payment webhook | ✅ | ❌ | ❌ |
| Supplier CRUD | ✅ | Partial | ✅ |
| Admin CRUD + delete | ✅ | ✅ (new code) | ❌ |
| Feedback full CRUD | ✅ | GET only | ❌ |

```
Automated well  ████████████░░░░░░░░  ~60%
Manual only     ░░░░░░░░░░░░████████  Admin UI, Feedback UI, Mobile
Not covered     ░░░░░░░░░░░░░░░░████  E2E browser, forgot-password smoke
```

---

## Severity × priority (reference)

| Severity | Definition | DOVA example |
|----------|----------|-------------|
| **Critical** | System unusable, data loss, no workaround | All payments failing, signup blocked without SMTP |
| **Major** | Core feature broken, workaround exists | Admin delete fails, checkout error |
| **Minor** | Non-core, cosmetic + functional | Sort doesn't persist, tooltip clipped |
| **Trivial** | Cosmetic only | Typo in label |

| Priority | Example SLA |
|----------|------------|
| **P0** | Same day — blocks release/prod |
| **P1** | This sprint |
| **P2** | Next sprint |
| **P3** | Backlog |

---

## Immediate actions (P0–P1)

### P0 — After deploy `8fb5b5e`

```bash
# Local (needs OTP env)
SMOKE_OTP_CODE=123456 npm run smoke:production

# VPS deploy
cd ~/dova && git pull && npm ci && npm run build && pm2 restart dova-api dova-web --update-env
```

Log saved to `ops/logs/smoke-production-latest.log` in the app repo (when running smoke from the `dova/` clone).

### P1 — Manual UAT

| Module | Test IDs | URL |
|-------|----------|-----|
| Admin | ADM-01–07 | https://dova.dntech.id/admin |
| Feedback | FEED-01–10 | https://dova.dntech.id/feedback |
| Payment live | PAY-03 | Checkout → Paystack test/live card |

Scenario detail: [TEST-CASES.md](./TEST-CASES.md)

---

## Running automated checks

```bash
npm run test              # 160 unit tests
npm run test:coverage     # coverage report (~52% global)
npm run smoke:production  # production API (needs SMOKE_OTP_CODE)
npm run smoke:week4       # health + contact persist
```

Demo accounts: admin `admin@dova.local` / `admin1234` · supplier `supplier@dova.local` / `supplier1234`

---

## Document changelog

| Date | Change |
|------|--------|
| 2026-08-30 | Translated to English. Re-triaged against current HEAD (`ebd71bd`, +21 commits since last pass). Unit suite verified 160/160 pass (was 146). **Flagged TRI-001 as an unresolved P0 regression** — no smoke log exists on disk, so the post-`8fb5b5e` re-run this doc called for on 2026-08-28 never happened; admin-delete and five auth/UX features have since shipped without it. No new application-code bugs found in the 21 commits (mix of auth UX, admin delete, docs). |
| 2026-08-28 | TRI-004/005 closed — forgot/reset smoke + Postman; TEST-CASES count 146 |
