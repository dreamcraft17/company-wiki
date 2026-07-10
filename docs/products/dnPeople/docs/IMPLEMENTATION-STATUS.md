# dnPeople — Implementation Status

> Terakhir diperbarui: **10 Juli 2026**  
> Referensi: PRD/SRS/SDD **v3.1** · Repo version **0.4.0**

## Ringkasan

| MVP | Target | Status |
|-----|--------|--------|
| MVP 1 | Core HR (employee, attendance, leave, payroll) | **Done** |
| MVP 2 | Extended ops (shift, OT, claim, loan, calendar…) | **Done** |
| MVP 3 | Strategic HR (recruitment, performance, training…) | **Done** |
| MVP 4 | Enterprise (multi-company, SSO, integrations) | **Done** |

**Typecheck:** Backend ✅ · Frontend ✅

---

## MVP 1 — Core HR

| Fitur | Status |
|-------|--------|
| Auth JWT + RBAC 5 roles | Done |
| Company register / profile | Done |
| Org (dept, position, level, location) | Done |
| Employee master + tax info | Done |
| Attendance clock in/out | Done | Manual / GPS / QR / Selfie |
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
| Surveys API | Done | Dedicated UI `/surveys` |
| Calendar / holidays | Done |
| Approval inbox + rules | Done |
| Advanced reports | Done |
| File upload | Done | Local disk **atau** S3/MinIO (`S3_*`) |
| Payslip PDF | Done | `GET /payroll/:id/payslip.pdf` |
| Email notifications | Done | SMTP atau console log |

Frontend: `/shifts` `/overtime` `/claims` `/loans` `/corrections` `/documents` `/announcements` `/calendar` `/approvals` `/reports`

---

## MVP 3 — Strategic HR

| Fitur | Status | Catatan |
|-------|--------|---------|
| Recruitment & ATS | Done | Jobs, candidates, pipeline, status workflow, AI screen (MVP 4) |
| Public careers portal | Done | `/careers` — kandidat apply tanpa login |
| Onboarding | Done | Plan + checklist default + complete task |
| Performance / KPI | Done | Cycles, generate reviews, self/manager score, KPI/OKR |
| Training & career | Done | Programs, enroll, career paths |
| Assets | Done | CRUD, assign / return |
| Offboarding | Done | Resign request → approve → complete + auto return assets |
| Policies / disciplinary | Done | Kebijakan + SP/warning/suspension |
| Helpdesk | Done | Ticket create, assign, resolve |
| AI HR Assistant | Done | LLM + rule-based fallback |
| Advanced analytics | Done | `/reports/analytics` + UI cards |

Frontend: `/recruitment` `/onboarding` `/performance` `/training` `/assets` `/offboarding` `/helpdesk` `/policies` `/assistant` `/careers`

### Verifikasi MVP 3 (10 Juli 2026)

| Modul PRD | API | UI | Verdict |
|-----------|-----|-----|---------|
| Recruitment & ATS | `/recruitment` | `/recruitment` | ✅ Full |
| Employee Onboarding | `/onboarding` | `/onboarding` | ✅ Full |
| Performance Management | `/performance` | `/performance` | ✅ Full |
| KPI & OKR | `/performance/kpis` | `/performance` | ✅ Full |
| Training & Development | `/training` | `/training` | ✅ Full |
| Career Path | `/training/career-paths` | `/training` | ✅ Full |
| Disciplinary Action | `/policies/disciplinary` | `/policies` | ✅ Full |
| Company Policy | `/policies` | `/policies` | ✅ Full |
| Asset Management | `/assets` | `/assets` | ✅ Full |
| Resignation & Offboarding | `/offboarding` | `/offboarding` | ✅ Full |
| HR Helpdesk | `/helpdesk` | `/helpdesk` | ✅ Full |
| AI HR Assistant | `/assistant/ask` | `/assistant` | ✅ Full |
| Advanced Analytics | `/reports/analytics` | `/reports` | ✅ Full |

**Kesimpulan MVP 3:** **Done (full)** — semua modul PRD punya API + halaman UI + alur CRUD/approval inti. Pinjaman/kasbon ada di MVP 2 (`/loans`).

---

## MVP 4 — Enterprise

| Fitur | Status | Catatan |
|-------|--------|---------|
| Multi-company support | Done | `/platform` SUPER_ADMIN + org links |
| Custom Workflows | Done | Multi-step + activate per module |
| Advanced Approval Rules | Done | Amount-based + workflow resolve |
| API & Integrations | Done | API keys `dnp_…` + webhooks + test |
| SSO (SAML/OAuth) | Done | Google + Microsoft OAuth + SAML ACS/JIT |
| Custom Reports Builder | Done | Save + run |
| AI Document Generator | Done | Offer, SP, SK, resign |
| AI Recruitment Screening | Done | Single + batch |
| Advanced Security (row RBAC) | Done | Rules + list enforce (employees, attendance, leave, claims, loans, OT, corrections, permissions, payroll) |
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
/sso (+ /google|microsoft|saml start+callback/acs, config)
/custom-reports (+ /sources, /:id/run)
/security/access-rules (+ /effective-scope/:resource)
/ai/documents/generate
/ai/recruitment/screen|screen-batch
/assistant/ask  (llm | rule-based)
/uploads  (local | s3)
```

Auth: JWT Bearer **atau** API key `dnp_…` (Bearer).

---

## Optional next (bukan blocker MVP 4)

- SAML XML-DSig full signature verification
- Unit / integration tests + CI/CD
- Redis session / rate-limit store

---

*Last Updated: July 10, 2026*
