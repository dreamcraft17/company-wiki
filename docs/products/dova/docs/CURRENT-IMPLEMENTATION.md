# DOVA — Current Implementation Baseline

| Metadata | Value |
|----------|-------|
| Snapshot date | 24 July 2026 |
| App HEAD | `27db4da` |
| Purpose | Canonical baseline after MVP Week 1–4 complete in code |
| Spec baseline | Aggressive 4W PRD/SRS/SDD + Vercel deploy override |
| Owner | Dozer |
| Phase | **MVP codebase complete → ops / soft-launch** |

> See also [current-phase.md](../current-phase.md) (short stakeholder snapshot).

## One-line status

**MVP product code is 100% done.** Internal demo ready. **Not** public go-live until staging URL + Paystack test proof.

## Product baseline

| Area | Implementation |
|------|----------------|
| Product | Marketplace: buyers ↔ verified food suppliers (Nigeria / NGN) |
| Frontend | Next.js storefront (`apps/frontend`, :3001) |
| Backend | NestJS API (`apps/backend`, :3000 `/api/v1`) |
| Shared | TypeScript types + min-order helpers (`shared/`) |
| Data | PostgreSQL + optional Redis; local often `USE_IN_MEMORY=true` |
| Auth | JWT httpOnly cookies · roles: customer / supplier / admin |
| Payments | Paystack NGN (+ mock when secret unset) |
| UI | DOVA-Startup port (Poppins, green `#0F6B43`, gold `#D8B24A`) |
| Migrations | `001_init.sql`, `002_week4.sql` (`fulfillment_type`) |
| Evidence | Unit tests + `npm run smoke:week4` |

## Available now (code)

| Journey | Status |
|---------|--------|
| Customer register → browse → cart → checkout (pickup/delivery) → pay → orders | Available |
| Supplier register + verification docs → admin approve → products (image) → fulfill | Available |
| Admin dashboard, approvals, users/products/orders, Contacts inbox | Available |
| Public home / about / contact (persisted) / footer / mobile nav | Available |
| Min order pickup ₦3,000 / delivery ₦5,000 | Available |

## Conditional (ops)

| Item | Notes |
|------|-------|
| Shared staging / public URL | Hosting + migrate/seed |
| Live Paystack test (≥10 txs) | Keys + webhook |
| Soft-launch go/no-go | Business checklist on staging |
| Resend email notifications | Optional env |

## Out of MVP / roadmap

Password reset · email verification · real reviews API · wishlist · discounts · courier tracking · full Playwright E2E · production APM.

## Suggested next work

1. Provision staging (API + DB + frontend).  
2. Configure Paystack test + run smoke.  
3. Complete go/no-go checklist in [current-phase.md](../current-phase.md).  
4. Soft launch — then post-MVP backlog.

## Related

- [FEATURE-CATALOG.md](./FEATURE-CATALOG.md)  
- [SPEC-COMPLIANCE.md](./SPEC-COMPLIANCE.md)  
- [API.md](./API.md) · [RUNBOOK.md](./RUNBOOK.md)  
- Specs: [../PRD/](../PRD/)
