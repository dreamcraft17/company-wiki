# DOVA — Current Phase

| | |
|---|---|
| **Product** | DOVA — food supply marketplace (Nigeria / NGN / Paystack) |
| **Repository** | [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova) |
| **HEAD** | `2b99ae1` |
| **Document date** | 24 July 2026 |
| **Owner** | Dozer |
| **Audience** | Engineering + business stakeholders |
| **Phase** | **MVP codebase complete → ops / soft-launch readiness** |

---

## One-line status

**MVP product code is 100% done** (4-week Week 1–4 scope). Internal demo ready on desktop & mobile. **Not** public go-live until staging URL + Paystack test proof.

```
Done in code                         Still open (ops)
─────────────────────────────        ──────────────────────────────
Auth + roles                         Shared staging / public URL
Catalog / cart / checkout            ≥10 Paystack test transactions
Paystack (mock without keys)         Soft-launch go/no-go on staging
Supplier + admin dashboards
Contact persist + Contacts inbox
Min order pickup ₦3k / delivery ₦5k
Product image upload
Startup UI + mobile-first
Unit tests + smoke:week4
```

---

## Planned window vs actual

| Week | Calendar | Planned focus | Current phase result |
|------|----------|---------------|----------------------|
| **1** | 21–27 Jul 2026 | Foundation | **Done in codebase** |
| **2** | 28 Jul–3 Aug | Customer shop | **Done in codebase** |
| **3** | 4–10 Aug | Supplier & admin | **Done in codebase** |
| **4** | 11–17 Aug | Polish + launch | **Features + launch docs done in code**; live verify = **this phase** |

Calendar is still early in the overall window, but **feature delivery is complete**. Current workstream = **launch operations**, not more MVP feature build.

---

## What “done” means for this MVP

### Customer
Register / login → browse / search → cart → checkout (**pickup** or **delivery**) → pay (mock or Paystack) → order history.

### Supplier
Register + verification docs (CAC / gov ID / address) → pending → admin approve → products (image file or URL) → stock → fulfill orders.

### Admin
Dashboard stats → approve/reject suppliers → users / products / orders → **Contacts** inbox.

### Public
Home (Startup brand), About, Contact (saved), footer, mobile hamburger nav.

### Commerce rules
| Rule | Value |
|------|-------|
| Currency | ₦ (NGN) |
| Min order — pickup | ₦3,000 |
| Min order — delivery | ₦5,000 |
| Under-min message | “Add ₦X more to qualify for checkout.” |

---

## Tech baseline (as shipped)

| Layer | Choice |
|-------|--------|
| Monorepo | `apps/backend` (NestJS) · `apps/frontend` (Next.js) · `shared` |
| Auth | JWT httpOnly cookies · roles: customer / supplier / admin |
| Data | PostgreSQL + Redis optional; local often `USE_IN_MEMORY=true` |
| Payments | Paystack NGN (+ mock when secret unset) |
| UI | DOVA-Startup port (Poppins, green `#0F6B43`, gold `#D8B24A`); custom CSS |
| Deploy path | Vercel frontend and/or VPS Node; no Docker required for MVP |
| Migrations | `001_init.sql`, `002_week4.sql` (`fulfillment_type`) |

**Demo accounts (local / seed):**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

---

## Out of MVP (do not expect yet)

Password reset · email verification · real product reviews API · wishlist · discounts · courier tracking · Playwright full E2E suite · live production monitoring.

---

## Current phase — next actions

1. Provision **staging** (API + DB + frontend URL).  
2. `npm run db:migrate` (+ seed as needed).  
3. Configure **Paystack test** keys + webhook.  
4. Run `npm run smoke:week4` against staging API.  
5. Walk customer → supplier → admin on phone + desktop.  
6. Complete **≥10** Paystack test txs.  
7. Soft-launch go/no-go with business owners.

### Go / no-go checklist

- [ ] Official staging URL  
- [ ] Customer pay → view order  
- [ ] Supplier register → approve → fulfill  
- [ ] ≥10 Paystack test txs  
- [ ] Admin approvals on staging  
- [ ] Contact / support channel agreed  
- [ ] Mobile smoke on staging  
- [ ] Soft launch date approved  

---

## Notes on documentation location

- Product/spec markdown for DOVA is kept **local** under `dova/docs/` (gitignored in the app repo).  
- This wiki page is the **shared current-phase snapshot** for the team (DCS / company-wiki).  
- App repo README: setup, env, routes, deploy — no PRD dump.

---

## Related

| Item | Location |
|------|----------|
| App repository | https://github.com/dreamcraft17/dova |
| Product index (this folder) | [00_INDEX.md](./00_INDEX.md) |
| Local deep docs (not in git) | `dova/docs/` on developer machines |
