# dnPeople — PRD v9.0
## Launch Readiness Checklist (MVP Q3 2026)

**Versi:** 9.0.1 (status sync 19 Jul 2026)  
**Owner:** Dozer (CEO + Tech Lead)  
**Tanggal:** 19 Juli 2026  
**Tujuan:** Ensure MVP ready untuk public launch  
**Target Launch:** 30 September 2026

---

## Executive Summary

```
1. ✅ CRITICAL kode: PRD v8.0 security fixes IMPLEMENTED
2. 🟠 HIGH: Infrastructure ops (monitoring SaaS, restore drill signed, HA)
3. 🟠 HIGH: Go-to-market (website, video, ticketing accounts)
4. ✅ Code pass v9.0: tenant daily quota, password reset, billing pay UI,
   OpenAPI/Swagger, user/admin/FAQ/SLA/onboarding/UU PDP docs
```

---

## Domain 1: Product Quality

```
✅ Core features (MVP 1–5)
✅ Multi-tenant isolated
✅ API complete
✅ Excel attendance import
✅ P0/P1 v8.0 fixed
🟠 Authenticated load test (CI health smoke only)
🟠 External security retest
✅ User docs drafted (USER-GUIDE, ADMIN-GUIDE, FAQ)
```

---

## Domain 2: Infrastructure & Ops

```
✅ VPS / Postgres / CI/CD
✅ Prometheus /metrics + /health /ready
✅ Backup + restore scripts + RESTORE-DRILL-RUNBOOK
✅ Rate limiting global + per-tenant RPM + daily 10k hard block
❌ Datadog/PagerDuty account wiring (ops)
❌ Auto-scaling / multi-instance sticky session proof
❌ Restore drill hasil terisi (ops)
```

**Checklist:**
```
[x] Metrics endpoint siap di-scrape
[ ] Datadog/agent + alert rules
[ ] PagerDuty / on-call
[ ] Daily backup + restore verified (isi runbook)
[x] Rate limiting tenant (RPM + daily)
[ ] Reverse proxy TLS production verified
[ ] Slow query review berkala
```

---

## Domain 3: Security & Compliance

```
[x] v8.0-B01 Payslip/files authenticated + logged
[x] v8.0-B02 API key scopes enforced
[x] v8.0-B03 Payroll finalize atomic (+ idempotent)
[x] v8.0-P01 Payroll batch queries
[x] v8.0-B04/B05 Payslip nav + MFA UI
[x] v8.0-B06 Import idempotent
[x] v8.0-B08 Upload magic-byte validation
[x] Password reset token expires < 1 hour
[x] JWT configurable (default 24h) + httpOnly cookie
[x] API key revoke instantly
[ ] External penetration test
[x] UU PDP checklist drafted
[ ] BPJS/PPh sample verification signed by Finance UAT
```

---

## Domain 4: Testing & QA

```
[x] Unit tests passing (31+)
[x] CI performance smoke (/health)
[ ] Authenticated load profile
[ ] Pen-test
[ ] Restore drill completed
[ ] Beta UAT 10–20
```

---

## Domain 5: Documentation

```
[x] User Guide
[x] Admin Guide
[x] API OpenAPI + Swagger UI + API.md
[x] FAQ / Knowledge Base
[x] SLA & support policy
[x] Onboarding playbook 10-point
[x] UU PDP checklist
[x] Restore drill runbook
[ ] Video tutorials (produksi)
[ ] Help center hosted (Notion/Zendesk)
```

---

## Domain 6: Website & Marketing

```
[ ] dnpeople.id live
[ ] Landing / pricing / FAQ web
[ ] Demo video
[ ] Case study
[ ] Analytics
```

*(Copywriting seed tersedia di company-wiki `copywriting/`.)*

---

## Domain 7: Customer Support

```
[x] Playbook + SLA dokumen
[ ] support@dnpeople.id monitored
[ ] Ticketing system live
[ ] Training videos
```

---

## Domain 8: Billing & Operations

```
[x] Pricing + tiers + feature gating
[x] Invoice generation + /billing UI
[x] Pay-now (Xendit / Stripe / Manual)
[x] Usage tracking + daily API hard limit
[ ] Live provider credentials + webhook E2E production
[ ] Dunning automation
[ ] DOKU adapter (opsional)
```

---

## Go-to-Market (sisa)

```
Week 1–2: restore drill + monitoring SaaS + SMTP/Xendit keys
Week 2–3: authenticated load + pen-test schedule
Week 3–5: website + ticketing
Week 6–8: beta onboarding + launch
```

---

*Last Updated: 19 Juli 2026 | Owner: Dozer | Status: Launch Preparation (code ahead of ops)*
