# DOVA — Current Phase

| | |
|---|---|
| **Product** | DOVA — food supply marketplace (Nigeria / NGN / Paystack) |
| **Repository** | [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova) |
| **HEAD** | `71225e3` · **Tag:** `v0.5.4` (+ unreleased auth UX) |
| **Document date** | 29 August 2026 |
| **Author** | Dozer · [@dreamcraft17](https://github.com/dreamcraft17) |
| **Phase** | **Production live — post-launch UX hardening** |

> **Release audit:** [DOVA-RELEASE-READINESS-AUDIT.md](./docs/DOVA-RELEASE-READINESS-AUDIT.md)  
> **Full feature catalog:** [FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md)

---

## One-line status

**Production live** at [dova.dntech.id](https://dova.dntech.id). **158** tests · **29+10** smoke pass · inline registration OTP on register page · auth UI refresh shipped (unreleased tag).

| Live now | In progress / optional |
|----------|------------------------|
| Full MVP commerce + admin + feedback | Manual UAT admin/feedback UI |
| Inline register OTP + legacy Profile verify | Tag v0.5.5 |
| Paystack initialize on production | E2E Playwright |
| Auth split layout (login/register) | Login/register UI polish (FE) |
| Profile edit + change password | `dovachain.com` alias |

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
cd ~/dova && git pull && npm ci && npm run build
pm2 restart dova-backend dova-frontend --update-env
SMOKE_OTP_CODE=123456 npm run smoke:production
```

Log: [SMOKE-PRODUCTION-RESULT.md](./docs/SMOKE-PRODUCTION-RESULT.md)

---

*Last updated: 29 August 2026 · **Author:** Dozer · [@dreamcraft17](https://github.com/dreamcraft17)*
