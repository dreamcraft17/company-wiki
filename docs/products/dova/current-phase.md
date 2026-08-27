# DOVA — Current Phase

| | |
|---|---|
| **Product** | DOVA — food supply marketplace (Nigeria / NGN / Paystack) |
| **Repository** | [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova) |
| **HEAD** | `00c8601` · **v0.5.0** |
| **Document date** | 26 August 2026 |
| **Owner** | Dozer |
| **Audience** | Engineering + business stakeholders |
| **Phase** | **Staging live → Paystack live + soft-launch go/no-go** |

> **Full technical status:** [docs/STATUS-LENGKAP.md](./docs/STATUS-LENGKAP.md)  
> **BD / non-tech one-pager:** [docs/PHASE-UPDATE-BD.md](./docs/PHASE-UPDATE-BD.md)

---

## One-line status

**MVP codebase complete.** Staging live at [dova.dntech.id](https://dova.dntech.id). **121** unit tests green. Soft launch pending Paystack live proof + business checklist.

```
Done in code + staging              Still open (ops / business)
─────────────────────────────       ──────────────────────────────
Auth + roles + Remember Me          Paystack LIVE keys + ≥10 txs
Catalog / cart / checkout           Soft-launch go/no-go sign-off
Paystack (mock + test mode wired)   Production domain (`dovachain.com`)
Supplier + admin dashboards
Admin user management (v0.5.0)
Native feedback board
Staging VPS (PM2) live
Min order pickup ₦3k / delivery ₦5k
121 unit tests + CI

---

## Staging URLs

| Service | URL |
|---------|-----|
| Storefront | https://dova.dntech.id |
| API health | https://api.dova.dntech.id/api/v1/health |

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

1. Configure **Paystack live/test** keys + webhook on VPS.  
2. Run `npm run db:migrate` after deploy (migrations through `006`).  
3. Run `npm run smoke:week4` against staging API.  
4. Walk customer → supplier → admin on phone + desktop.  
5. Complete **≥10** Paystack test txs.  
6. Soft-launch go/no-go with business owners.

### Verified (August 2026)

- [x] Unit tests **121/121** pass (`npm run test:unit`)
- [x] Staging live — `dova.dntech.id` + `api.dova.dntech.id`
- [x] Native feedback board (replaced FeedLog)
- [x] Admin user management shipped (`52530da`)
- [x] Supplier approve/reject Postgres fix (`00c8601`)

### Go / no-go checklist

- [x] Official staging URL  
- [ ] Customer pay → view order (Paystack live)  
- [ ] Supplier register → approve → fulfill (on staging with real DB)  
- [ ] ≥10 Paystack test txs  
- [x] Admin approvals on staging  
- [ ] Contact / support channel agreed  
- [ ] Mobile smoke on staging  
- [ ] Soft launch date approved  

---

## Documentation

Shared docs live in this wiki folder ([00_INDEX.md](./00_INDEX.md)).  
App repo keeps `docs/` **gitignored** locally; mirror updates here for the team.
