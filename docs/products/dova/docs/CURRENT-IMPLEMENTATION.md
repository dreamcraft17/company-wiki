# DOVA — Current Implementation Baseline

| Metadata | Value |
|----------|-------|
| Snapshot date | 26 August 2026 |
| App release | **v0.5.0** (unreleased tag; HEAD `00c8601`) |
| Purpose | Canonical baseline after MVP + staging live + admin hardening |
| Spec baseline | Aggressive 4W PRD/SRS/SDD + VPS deploy |
| Owner | Dozer |
| Phase | **Staging live → Paystack live + soft-launch checklist** |

> See also [current-phase.md](../current-phase.md) · [STATUS-LENGKAP.md](./STATUS-LENGKAP.md) · [CHANGELOG.md](./CHANGELOG.md)

## One-line status

**MVP codebase complete.** Staging at [dova.dntech.id](https://dova.dntech.id) · API [api.dova.dntech.id](https://api.dova.dntech.id/api/v1/health). **121** unit tests green. Soft launch pending Paystack live proof + business go/no-go.

## Product baseline

| Area | Implementation |
|------|----------------|
| Product | Marketplace: buyers ↔ verified food suppliers (Nigeria / NGN) |
| Frontend | Next.js storefront (`apps/frontend`, dev :3001) |
| Backend | NestJS API (`apps/backend`, :4201 prod / :3000 local `/api/v1`) |
| Shared | TypeScript types + min-order helpers (`shared/`) |
| Data | PostgreSQL (Supabase on staging) + optional Redis |
| Auth | JWT httpOnly cookies + Bearer cross-origin · roles: customer / supplier / admin |
| Payments | Paystack NGN (+ mock when secret unset) |
| UI | DOVA-Startup port (Poppins, green `#0F6B43`, gold `#D8B24A`) · mobile-first |
| Migrations | `001`–`006` (cart/order hardening, feedback Postgres, email OTP columns idle) |
| Evidence | **121** unit tests · CI build + typecheck · `npm run smoke:week4` |
| Feedback | **Native** board at `/feedback` (FeedLog replaced in v0.4.0) |

## Available now (code + staging)

| Journey | Status |
|---------|--------|
| Customer register → browse → cart → checkout → pay → orders / history / profile | Available |
| Remember Me (persist login across sessions) | Available (`v0.5.0`) |
| Supplier register + docs → admin approve/reject → products → fulfill | Available |
| Admin dashboard, supplier approvals, users/products/orders, contacts | Available |
| **Admin user management** — detail, edit, role, reset password, activate/deactivate | Available (`v0.5.0`) |
| Native feedback / roadmap / changelog | Available |
| Public home / about / contact / mobile nav | Available |
| Min order pickup ₦3,000 / delivery ₦5,000 | Available |

## Conditional (ops)

| Item | Notes |
|------|-------|
| Paystack **live** (≥10 test txs on staging) | Keys + webhook on VPS |
| Soft-launch go/no-go | Business checklist |
| Email OTP verification | Scaffolding only — **disabled**; register = immediate active user |
| Resend transactional email | Optional env |

## Out of MVP / roadmap

Password reset · enforced email verification · real reviews API · wishlist · discounts · courier tracking · full Playwright E2E · production APM.

## Suggested next work

1. Paystack live keys + webhook on staging VPS.  
2. Complete ≥10 Paystack test transactions.  
3. Walk go/no-go checklist in [current-phase.md](../current-phase.md).  
4. Soft launch — then post-MVP backlog.

## Related

- [FEATURE-CATALOG.md](./FEATURE-CATALOG.md)  
- [SPEC-COMPLIANCE.md](./SPEC-COMPLIANCE.md)  
- [API.md](./API.md) · [RUNBOOK.md](./RUNBOOK.md) · [VPS-DEPLOY.md](./VPS-DEPLOY.md)  
- Specs: [../PRD/](../PRD/)
