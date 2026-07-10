# dnPeople — Implementation Status

> Terakhir diperbarui: **10 Juli 2026**  
> Referensi: PRD/SRS/SDD **v3.1** · Repo version **0.4.0**

## Ringkasan

| MVP | Target | Status |
|-----|--------|--------|
| MVP 1 | Core HR (employee, attendance, leave, payroll) | **Done** |
| MVP 2 | Extended ops (shift, OT, claim, loan, calendar…) | **Done** |
| MVP 3 | Strategic HR (recruitment, performance, training…) | **Done (core)** |
| MVP 4 | Enterprise (multi-company, SSO, integrations) | **Done (core)** |

**Typecheck:** Backend ✅ · Frontend ✅

---

## MVP 1 — Core HR

| Fitur | Status |
|-------|--------|
| Auth JWT + RBAC 5 roles | Done |
| Company register / profile | Done |
| Org (dept, position, level, location) | Done |
| Employee master + tax info | Done |
| Attendance clock in/out | Done |
| Leave types, balance, approve | Done |
| Permissions (WFH/izin) | Done |
| Payroll BPJS + PPh 21 | Done |
| Dashboard + basic reports | Done |
| Audit trail | Done |

Frontend: `/dashboard` `/employees` `/attendance` `/leave` `/permissions` `/payroll`

---

## MVP 2 — Extended Ops

| Fitur | Status |
|-------|--------|
| Shift + assignment | Done |
| Overtime (+ payroll) | Done |
| Claims / reimbursement | Done |
| Loans (kasbon) | Done |
| Geofence attendance | Done |
| Attendance corrections | Done |
| Documents + announcements | Done |
| Surveys API | Done (UI dedicated still polish) |
| Calendar / holidays | Done |
| Approval inbox + rules | Done |
| Advanced reports | Done |

Frontend: `/shifts` `/overtime` `/claims` `/loans` `/corrections` `/documents` `/announcements` `/calendar` `/approvals` `/reports`

---

## MVP 3 — Strategic HR

| Fitur | Status | Catatan |
|-------|--------|---------|
| Recruitment & ATS | Done | Jobs, candidates, pipeline |
| Onboarding | Done | Checklist default |
| Performance / KPI | Done | Cycles, reviews, OKR |
| Training & career | Done | Enroll + paths |
| Assets | Done | Assign / return |
| Offboarding | Done | Resign → return assets |
| Policies / disciplinary | Done | |
| Helpdesk | Done | Tickets |
| AI HR Assistant | Done | Rule-based |
| Advanced analytics | Done | `/reports/analytics` |

Frontend: `/recruitment` `/onboarding` `/performance` `/training` `/assets` `/offboarding` `/helpdesk` `/policies` `/assistant`

---

## MVP 4 — Enterprise

| Fitur | Status | Catatan |
|-------|--------|---------|
| Multi-company support | Done | `/platform` SUPER_ADMIN + org links |
| Custom Workflows | Done | Multi-step + activate per module |
| Advanced Approval Rules | Done | Amount-based + workflow resolve |
| API & Integrations | Done | API keys `dnp_…` + webhooks + test |
| SSO (SAML/OAuth) | Partial | Config + initiate stub |
| Custom Reports Builder | Done | Save + run |
| AI Document Generator | Done | Offer, SP, SK, resign |
| AI Recruitment Screening | Done | Single + batch |
| Advanced Security (row RBAC) | Done | Rules + effective-scope |
| White-label | Done | Branding + public endpoint |

### Frontend routes MVP 4

`/platform` `/integrations` `/workflows` `/branding` `/sso` `/security` `/custom-reports` `/ai-docs`  
(+ AI Screen di `/recruitment`)

### API surface MVP 4

```
/platform/companies|org-tree|org-links
/integrations (+ /api-keys, /:id/test)
/workflows (+ /:id/activate, /resolve/:module)
/branding (+ /public/:companyId)
/sso (+ /initiate)
/custom-reports (+ /sources, /:id/run)
/security/access-rules (+ /effective-scope/:resource)
/ai/documents/generate
/ai/recruitment/screen|screen-batch
```

Auth: JWT Bearer **atau** API key `dnp_…` (Bearer).

---

## Partial / polish (lintas MVP)

- Full OAuth/SAML handshake + JIT provisioning
- Enforce row-level filters on all list queries
- Survey dedicated UI, binary file upload (S3/MinIO)
- Payslip PDF + email notifications
- LLM-powered assistant + public careers portal
- Unit / integration tests + CI/CD

---

*Last Updated: July 10, 2026*
