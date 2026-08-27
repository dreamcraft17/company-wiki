# DOVA — Current Phase

| | |
|---|---|
| **Product** | DOVA — food supply marketplace (Nigeria / NGN / Paystack) |
| **Repository** | [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova) |
| **HEAD** | `b17e2a5` · **Tag:** `v0.5.2` |
| **Document date** | 27 August 2026 |
| **Owner** | Dozer |
| **Phase** | **🚀 Production live** |

> **Release audit:** [docs/DOVA-RELEASE-READINESS-AUDIT.md](./docs/DOVA-RELEASE-READINESS-AUDIT.md) — **100% production**

---

## One-line status

**Production is live** at [dova.dntech.id](https://dova.dntech.id). **127** tests green · full API smoke pass · Paystack live on production.

| Live now | Optional later |
|----------|----------------|
| Production storefront + API | `dovachain.com` DNS alias |
| Customer / supplier / admin flows | Playwright E2E suite |
| Paystack payment initialize | Additional live card tx monitoring |
| Automated API smoke (`smoke:production`) | Mobile browser spot-check |

---

## Production URLs

| Service | URL |
|---------|-----|
| Storefront | https://dova.dntech.id |
| API health | https://api.dova.dntech.id/api/v1/health |

**Demo:** admin `admin@dova.local` / `admin1234` · supplier `supplier@dova.local` / `supplier1234`

---

## Verify production

```bash
npm run smoke:production
API_URL=https://api.dova.dntech.id/api/v1 npm run smoke:week4
```

Log: `dova/tests/SMOKE-PRODUCTION-RESULT.md`

---

*Last updated: 27 August 2026*
