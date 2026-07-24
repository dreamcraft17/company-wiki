# DOVA — Current Phase

| | |
|---|---|
| **Product** | DOVA — food supply marketplace (Nigeria / NGN / Paystack) |
| **Repository** | [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova) |
| **HEAD** | `27db4da` |
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

---

## Commerce rules

| Rule | Value |
|------|-------|
| Currency | ₦ (NGN) |
| Min order — pickup | ₦3,000 |
| Min order — delivery | ₦5,000 |
| Under-min message | “Add ₦X more to qualify for checkout.” |

---

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

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

## Documentation

Shared docs live in this wiki folder ([00_INDEX.md](./00_INDEX.md)).  
App repo keeps `docs/` **gitignored** locally; mirror updates here for the team.
