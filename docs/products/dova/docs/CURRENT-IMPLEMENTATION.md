# DOVA — Current Implementation Baseline

> **Author:** Dozer · **Last updated:** 2026-08-28

| Metadata | Value |
|----------|-------|
| Snapshot date | 28 August 2026 |
| App HEAD | **`9e37a8a`** (post v0.5.4) |
| Last tag | **v0.5.4** (email OTP production) |
| Purpose | PRD baseline + ops truth setelah soft launch |
| Spec baseline | Aggressive 4W PRD/SRS/SDD + VPS PM2 deploy |
| Owner | Dozer |
| Phase | **Production live — post-launch hardening** |

> [current-phase.md](../current-phase.md) · [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) · [STATUS-LENGKAP.md](./STATUS-LENGKAP.md) · [CHANGELOG.md](./CHANGELOG.md)

---

## One-line status

**Production live** at [dova.dntech.id](https://dova.dntech.id). **151** unit tests green · **29+10** production smoke pass · Paystack live · email OTP wajib untuk customer baru.

---

## Product baseline

| Area | Implementation |
|------|----------------|
| Product | Marketplace: buyers ↔ verified food suppliers (Nigeria / NGN) |
| Frontend | Next.js 16 storefront — **27 pages** (`apps/frontend`) |
| Backend | NestJS 11 API — **~67 routes** (`apps/backend`, `/api/v1`) |
| Shared | TypeScript types, min-order, product units/images (`shared/`) |
| Data | PostgreSQL (Supabase/VPS) + optional Redis sessions |
| Auth | JWT httpOnly + Bearer cross-origin · OTP verify · forgot/reset · profile PATCH |
| Payments | Paystack NGN (+ mock when secret unset) |
| Email | Resend SMTP — verification OTP + password reset |
| UI | DOVA-Startup (Poppins, `#0F6B43`, `#D8B24A`) · mobile-first |
| Migrations | `001`–`006`+ (cart, feedback Postgres, OTP columns active) |
| QA | 151 unit · `smoke:production` · Postman guide · bug triage doc |
| Feedback | Native board `/feedback` (FeedLog replaced v0.4.0) |

---

## Available now (production)

| Journey | Status |
|---------|--------|
| Register → OTP verify → browse → cart → checkout → pay → orders | **Available** |
| Login unverified → auto-resend OTP → verify → session | **Available** (2026-08-28) |
| Forgot / reset password | **Available** |
| Customer profile edit + in-app change password | **Available** (2026-08-28) |
| Supplier register → admin approve → products → fulfill orders | **Available** |
| Admin dashboard, users (incl. delete), suppliers, products, orders, contacts | **Available** |
| Native feedback / roadmap / changelog | **Available** |
| Public home / about / contact | **Available** |
| Min order pickup ₦3k / delivery ₦5k | **Available** |
| Remember Me | **Available** |

---

## Conditional (ops / env)

| Item | Notes |
|------|-------|
| `RESEND_API_KEY` + `EMAIL_FROM` | Wajib customer signup production |
| `DOVA_QA_FIXED_OTP` | Opsional — automated smoke QA emails |
| Paystack live monitoring | Keys set; ongoing tx proof |
| Gmail App Password (legacy SMTP path) | Some VPS configs — prefer Resend |
| Manual UAT admin UI + feedback UI | Documented gap in bug triage |

---

## Out of MVP

Reviews API · wishlist · discounts · courier tracking · Playwright E2E · production APM.

---

## Suggested next work

1. Manual UAT admin + feedback flows (ADM-*, FEED-* in TEST-CASES).  
2. Raise unit coverage toward 80% (currently ~52% global).  
3. Tag **v0.5.5** after profile + auth UX ship sign-off.  
4. Post-MVP: reviews, notifications, mobile app.

---

## Related

- [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) — **inventaris fitur lengkap**  
- [DOVA-BUG-TRIAGE.md](./DOVA-BUG-TRIAGE.md)  
- [API.md](./API.md) · [RUNBOOK.md](./RUNBOOK.md) · [VPS-DEPLOY.md](./VPS-DEPLOY.md)  
- Specs: [../PRD/](../PRD/)
