# dnPeople — Analisis & Prioritas Next Implementation
## Apa Lagi yang Perlu Diimplement Sebelum Launch Q3 2026

**Tanggal:** 22 Juli 2026 (baseline frozen setelah PRD v10.0 + session redirect)  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** MVP 1–5 + PRD v5–**v10.0 DONE in repo** · **Next PRD** = v4 Module 3–8 + ops go-live  

---

## Executive Summary

**Progress saat ini:**
- ✅ MVP 1–5 code complete (**54** pages, **52** routes, **101** models, **32/32** tests)
- ✅ PRD v8.0 security & stability **IMPLEMENTED**
- ✅ PRD v9.0 launch-readiness code **IMPLEMENTED**
- ✅ PRD v10.0 ops artefacts **IMPLEMENTED in repo**
- ✅ Docs baseline **frozen** (`ce80640`) — mulai PRD berikutnya dari [CURRENT-IMPLEMENTATION.md](../CURRENT-IMPLEMENTATION.md)
- 🟠 Production ops (Datadog/PagerDuty, restore drill, pen-test) — Conditional
- 🟠 Go-to-market (dnpeople.id, beta 10–20 customers) — Conditional

**Recommended next PRD themes:** PRD v4 Module 3 (9-box/succession) → Module 4–8; parallel track ops gates dari PRD v10.0

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

### TIER 1 — Ops / eksternal (bukan gap kode v8)

1. **Monitoring & alerting production** — Datadog/New Relic agent + PagerDuty (kode metrics sudah ada).  
2. **Restore drill bertanda tangan** — ikuti `docs/RESTORE-DRILL-RUNBOOK.md`.  
3. **Load test authenticated** — CI saat ini smoke `/health`; perlu skenario login+payroll di staging.  
4. **External penetration test**.  
5. **Website dnpeople.id + demo video + ticketing live** (Helpscout/Zendesk).  
6. **Beta 10–20 customers** + NPS.

### TIER 2 — Post-soft-launch

- Bank auto-reconciliation, DOKU adapter, mobile app, PRD v4 Module 3–8.

---

## Critical Path 2 minggu ke depan (ops-focused)

```
[ ] Jalankan restore drill staging + isi tabel hasil
[ ] Pasang scrape Prometheus/Datadog ke /metrics
[ ] Konfigurasi SMTP production + uji forgot-password email
[ ] Konfigurasi Xendit/Stripe keys + uji webhook bayar
[ ] Jadwalkan pen-test eksternal
[ ] Landing page dnpeople.id (template OK)
[ ] Aktifkan support@ + ticketing
[ ] Rekrut 10 beta + jalankan CUSTOMER-ONBOARDING-PLAYBOOK
```

---

## Success Criteria (Launch Readiness)

```
✅ All v8.0 P0 bugs fixed + tested
✅ Tenant quota hard-limit + password reset + OpenAPI + customer docs
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
