# DOVA — Current Phase

| | |
|---|---|
| **Product** | DOVA — food supply marketplace (Nigeria / NGN / Paystack) |
| **Repository** | [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova) |
| **HEAD** | `9e37a8a` · **Tag:** `v0.5.4` (+ unreleased hardening) |
| **Document date** | 28 August 2026 |
| **Owner** | Dozer |
| **Phase** | **Production live — post-launch UX hardening** |

> **Release audit:** [docs/DOVA-RELEASE-READINESS-AUDIT.md](./docs/DOVA-RELEASE-READINESS-AUDIT.md)  
> **Fitur lengkap:** [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md)

---

## One-line status

**Production live** at [dova.dntech.id](https://dova.dntech.id). **151** tests · **29+10** smoke pass · email OTP · profile self-service · auth redirect fixes deployed/in pipeline.

| Live now | In progress / optional |
|----------|------------------------|
| Full MVP commerce + admin + feedback | Manual UAT admin/feedback UI |
| Email verification + password reset | Tag v0.5.5 |
| Paystack initialize on production | E2E Playwright |
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
pm2 restart dova-api dova-web --update-env
SMOKE_OTP_CODE=123456 npm run smoke:production
```

Log: [docs/SMOKE-PRODUCTION-RESULT.md](./docs/SMOKE-PRODUCTION-RESULT.md)

---

*Last updated: 28 August 2026 · Author: Dozer*
