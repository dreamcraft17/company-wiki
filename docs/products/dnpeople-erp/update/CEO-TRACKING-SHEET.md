# dnPeople ERP — Status (7 Jul 2026, Production-ready code complete)

## Phase 1–4 — SHIPPED (code)

| Area | Status |
|------|--------|
| Phase 1: Reports, workflow, integrations, portal JWT | ✅ |
| Phase 2: Dashboard, KPI, OLAP, documents, SLA | ✅ |
| Phase 3: Analytics, e-sign, HR 360°, mobile Expo, platform registry | ✅ |
| Phase 4: 15 locales, industry templates, partner-ready infra | ✅ |
| Production hardening: health probes, env validation, metrics, Docker prod | ✅ |
| CI/CD: coverage gate, deploy workflows + smoke tests | ✅ |
| Terraform + Helm production values | ✅ |

## Metrics

| Metrik | Nilai |
|--------|-------|
| Unit tests | **390** (83 suites) |
| Coverage | **≥60%** |
| Migrations | `0005`–`0013` |
| Locales | **15** (EN/ID full, others EN fallback) |
| Industry templates | **5** (retail, mfg, services, hospitality, healthcare) |
| Frontend build | ✅ |
| Mobile | ✅ Expo + SecureStore + EAS profiles |

## Ops — ready to deploy (needs credentials only)

| Item | Status |
|------|--------|
| `docker-compose.prod.yml` | ✅ |
| `scripts/production-smoke.sh` | ✅ |
| `scripts/db-backup.sh` | ✅ |
| `scripts/production-checklist.sh` | ✅ |
| AWS staging live | 🟡 Set GitHub Secrets → `terraform apply` |
| Live API keys (Stripe, Slack, JIRA) | 🟡 `.env.production` template ready |
| App Store / Play Store | 🟡 EAS build profiles ready |

## Deploy commands

```bash
# Local production stack
cp backend/.env.production backend/.env.production.local  # fill secrets
npm run infra:prod

# Post-deploy smoke
npm run smoke:prod

# Production checklist
npm run checklist:prod

# AWS (once credentials set)
cd terraform && terraform apply -var-file=prod.tfvars -var="db_password=..."
```

**Owned by:** [dntech.id](https://dntech.id) — PT. Dozer Napitupulu Technology
