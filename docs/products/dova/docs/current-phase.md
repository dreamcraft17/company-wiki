# DOVA — Current Phase

| | |
|---|---|
| **Product** | DOVA — food supply marketplace (Nigeria / NGN / Paystack) |
| **Repository** | [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova) |
| **HEAD** | `642b165` · **Tag:** `v0.5.4` (+ unreleased auth UX) |
| **Document date** | 29 August 2026 |
| **Author** | Dozer · [@dreamcraft17](https://github.com/dreamcraft17) |
| **Phase** | **Production live — post-launch UX hardening** |

> **Release audit:** [DOVA-RELEASE-READINESS-AUDIT.md](./DOVA-RELEASE-READINESS-AUDIT.md)  
> **Full feature catalog:** [./FEATURE-CATALOG.md](./FEATURE-CATALOG.md)

---

## One-line status

**Production live** at [dova.dntech.id](https://dova.dntech.id). **158** tests · **29+10** smoke pass · inline registration OTP · register **success modal** (Bug-016) · QA **security checklist** doc (4/4 pass).

| Live now | In progress / optional |
|----------|------------------------|
| Full MVP commerce + admin + feedback | Manual UAT admin/feedback UI |
| Inline register OTP + legacy Profile verify | Tag v0.5.5 |
| Register success modal (Bug-016) | Login/register UI polish (FE) |
| Paystack initialize on production | E2E Playwright |
| Auth split layout (login/register) | `dovachain.com` alias |
| QA security checklist assessment (4/4 pass) | |

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

Log: [SMOKE-PRODUCTION-RESULT.md](./SMOKE-PRODUCTION-RESULT.md)

---

*Last updated: 29 August 2026 · **Author:** Dozer · [@dreamcraft17](https://github.com/dreamcraft17)*
