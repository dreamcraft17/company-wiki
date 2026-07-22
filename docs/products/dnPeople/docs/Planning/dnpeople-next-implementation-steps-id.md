# dnPeople — Analisis & Prioritas Next Implementation
## Apa Lagi yang Perlu Diimplement Sebelum Launch Q3 2026

**Tanggal:** 22 Juli 2026 (PRD v11.0 go-live execution complete in repo)  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** MVP 1–5 + PRD v5–**v11.0 DONE in repo** · **Next PRD** = v4 Module 3–8 · external go-live Conditional  

---

## Executive Summary

**Progress saat ini:**
- ✅ MVP 1–5 code complete (**61** pages, **53** routes, **102** models, **32/32** tests)
- ✅ PRD v8.0 security & stability **IMPLEMENTED**
- ✅ PRD v9.0 launch-readiness code **IMPLEMENTED**
- ✅ PRD v10.0 ops artefacts **IMPLEMENTED in repo**
- ✅ PRD v11.0 go-live execution **IMPLEMENTED in repo** (marketing site, leads API, k6, runbooks)
- 🟠 Production ops (Datadog/PagerDuty live, signed restore drill, pen-test sign-off) — Conditional
- 🟠 Go-to-market (dnpeople.id DNS, beta 10–20 customers) — Conditional

**Recommended next PRD themes:** PRD v4 Module 3 (9-box/succession) → Module 4–8

---

## Apa yang Sudah Done ✅

| Item | Status | Evidence |
|------|--------|----------|
| Core HRIS + enterprise + talent | Done | MVP 1–5 |
| PRD v5–v7 | Done | Billing, multi-tenant, Excel attendance |
| **PRD v8.0 P0/P1/P2** | **Done** | Auth files, API scopes, atomic finalize, batch payroll, cookie session, signed payslip, report jobs, email outbox |
| Tenant RPM + **daily 10k hard block** | Done | `authenticate` → `enforceAndRecord` |
| Self-service password reset (1h) | Done | `/auth/forgot-password`, `/reset-password` |
| Billing pay-now | Done | `/billing` → Xendit/Stripe/Manual |
| OpenAPI + Swagger UI | Done | `/api/v1/openapi.json`, `/api/v1/docs` |
| User/Admin/FAQ/SLA/Onboarding/UU PDP docs | Done | `docs/USER-GUIDE.md` dkk. |
| CI + Prometheus + backup scripts | Done | `ci.yml`, `/metrics`, `scripts/backup-*.sh` |

---

## Apa yang Belum (Critical Path) 🔴

### TIER 1 — Ops / eksternal (bukan gap kode v11)

1. **Monitoring & alerting production** — pasang Datadog agent (`scripts/install-datadog-agent.sh`) + PagerDuty (metrics sudah ada).  
2. **Restore drill bertanda tangan** — `scripts/restore-drill.sh` + isi tabel di `docs/RESTORE-DRILL-RUNBOOK.md`.  
3. **Load test authenticated** — k6 baseline/ramp/spike/stress di `scripts/loadtest/`.  
4. **External penetration test** — staging prep: `ops/pen-test-staging-prep.md`.  
5. **DNS dnpeople.id + GA4** (`NEXT_PUBLIC_GA_ID`) + ticketing live (Helpscout/Zendesk).  
6. **Beta 10–20 customers** — template: `ops/onboarding/beta-email-template.md` + `CUSTOMER-ONBOARDING-PLAYBOOK.md`.

### TIER 2 — Post-soft-launch

- Bank auto-reconciliation, DOKU adapter, mobile app, PRD v4 Module 3–8.

---

## Critical Path 2 minggu ke depan (ops-focused)

```
[ ] Jalankan restore drill staging + isi tabel hasil (integrity COUNT otomatis)
[ ] Pasang Datadog agent + scrape /metrics (install-datadog-agent.sh)
[ ] Konfigurasi SMTP production + uji forgot-password + lead notify
[ ] Konfigurasi Xendit/Stripe keys + uji webhook bayar
[ ] Jadwalkan pen-test eksternal (ops/pen-test-staging-prep.md)
[ ] DNS dnpeople.id → marketing site (sudah di codebase)
[ ] Aktifkan support@ + ticketing
[ ] Rekrut 10 beta + jalankan CUSTOMER-ONBOARDING-PLAYBOOK
[ ] Go/no-go: docs/LAUNCH-GATE-CHECKLIST.md
```

---

## Success Criteria (Launch Readiness)

```
✅ All v8.0 P0 bugs fixed + tested
✅ Tenant quota hard-limit + password reset + OpenAPI + customer docs
✅ PRD v11.0 marketing site + lead capture + k6 + launch runbooks
[ ] Monitoring live + alerts working
[ ] Backup restore drill passed (RPO < 1h, RTO < 4h)
[ ] Load test authenticated: p95 target tercapai
[ ] Security penetration test passed
[ ] Website live + pricing clear
[ ] Customer support ticketing operational
[ ] 10–20 beta customers onboarded
```

---

*Last Updated: 19 Juli 2026 | Owner: Dozer | Status: Post-v8.0 / v9.0 code pass*
