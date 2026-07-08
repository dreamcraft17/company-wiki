# ENGINEERING REMAINING WORK
## Post-Phase-4 Ops Backlog — Live Deploy Only

**Date:** 7 July 2026  
**Status:** 🟢 **All coding complete (Phase 1–4)** · AWS live deploy pending credentials  
**Priority:** Deploy to staging → validate → production  
**Project Owner:** Dozer (CEO / Tech Lead)

---

## OVERVIEW

```
Phase 1–4 coding:     ✅ COMPLETE
Production hardening: ✅ COMPLETE (e2f46fc)
Test coverage ≥60%:   ✅ COMPLETE (390 tests · 83 suites)
CI/CD + smoke scripts: ✅ COMPLETE

Remaining:            🟡 AWS credentials → live deploy only
```

---

## WHAT'S DONE (code — 7 Jul)

### All phases

| Phase | Shipped |
|-------|---------|
| **1** | Custom reports, workflow engine, integrations gallery, portal JWT |
| **2** | Dashboard builder, KPI alerts, OLAP UI, documents, workflow SLA |
| **3** | Analytics, e-sign, HR 360°, tenant schema hook, platform registry, mobile Expo |
| **4** | 15 locales, industry templates, prod Docker/Helm/Terraform, smoke/backup scripts |

### Production hardening (`e2f46fc`)

- Real health probes (`/health/live`, `/health/ready` — DB + Redis)
- Env validation + graceful shutdown
- Prometheus metrics (text/plain)
- `docker-compose.prod.yml`, `backend/.env.production`, `frontend/.env.production`
- `scripts/production-smoke.sh`, `db-backup.sh`, `production-checklist.sh`
- Helm `values-production.yaml`, Terraform `prod.tfvars`
- Deploy workflows with post-deploy smoke

### Metrics

| Metrik | Nilai |
|--------|-------|
| Unit tests | **390** (83 suites) |
| Coverage | **≥60%** |
| Migrations | `0005`–`0013` |
| Locales | **15** |
| Frontend pages | **29** |

---

## WHAT'S NOT DONE (ops only)

### AWS Live Deploy 🟡

```
✅ Terraform (VPC, RDS multi-AZ prod, Redis, backup retention)
✅ Helm staging + production values
✅ GitHub Actions deploy-staging.yml + deploy-production.yml
✅ Production smoke script

❌ GitHub Secrets not set → no live EKS/RDS yet
❌ Migrations 0005–0013 not exercised on live RDS
❌ Monitoring/backups not verified on real infra
```

**Effort:** 1–2 days once credentials exist.

### Live API Keys 🟡

```
✅ .env.production templates (Stripe, Slack, SMTP, JIRA, JNE)
❌ Production keys not configured
```

### App Store 🟡

```
✅ mobile/eas.json (staging + production profiles)
✅ SecureStore token persistence
❌ Not submitted to App Store / Play Store
```

---

## ACTION PLAN — GO LIVE

### P0 — Deploy (ASAP)

1. Set GitHub Secrets (`AWS_*`, `PROD_DB_*`, `PROD_JWT_SECRET`)
2. `cd terraform && terraform apply -var-file=prod.tfvars -var="db_password=..."`
3. Trigger **Deploy Staging** workflow
4. `npm run smoke:prod` (or `API_URL=... bash scripts/production-smoke.sh`)
5. Run migrations on RDS (`0005`–`0013`)

### P1 — Launch validation

- Fill live Stripe/SMTP in production env
- Load test: `npm run load-test`
- Backup test: `npm run backup:db`
- Production checklist: `npm run checklist:prod`
- EAS mobile build: `cd mobile && eas build --profile production`

### P2 — Production window

- Deploy Production workflow (manual approval)
- Go/no-go decision

---

## SUCCESS METRICS

| Area | Target | Status |
|------|--------|--------|
| Phase 1–4 code | Complete | ✅ |
| Coverage | ≥60% | ✅ |
| Tests | ≥250 | ✅ 390 |
| Prod templates | Ready | ✅ |
| Staging live | Health + login | 🟡 |
| Prod live | Backups + monitoring | 🟡 |

---

*Updated: 7 July 2026*
