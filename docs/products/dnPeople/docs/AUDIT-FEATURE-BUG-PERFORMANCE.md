# dnPeople — Feature, Bug & Performance Audit

**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** DnPeople  
**UpdatedAt:** July 18, 2026  
**Audit date:** 18 July 2026  
**HEAD:** `73a730b` (`docs: align docs to HEAD with PRD v7.0 attendance Excel`)  
**Method:** Static code review against `frontend/`, `backend/`, Prisma schema, CI, and feature catalog — not a production load/Lighthouse lab run.

---

## 1. Summary

| Area | Verdict |
|------|---------|
| Feature completeness | **Strong** — MVP 1–5 + PRD v5–v7.0 implemented in code |
| Correctness / security bugs | **3× P0**, **5× P1**, several P2 / risks |
| Performance | **1× P0** (payroll N+1), several P1 list/export/import bounds |
| Tests | Unit helpers **24/24**; weak coverage of domain workflows |
| Production readiness | **Conditional** — fix P0s + ops UAT (IdP/SMTP/S3/biometric) before go-live claim |

**Top actions:** lock down `/uploads`, enforce API-key scopes, make payroll finalize atomic, batch payroll run queries, expose employee payslip + MFA in nav.

---

## 2. Inventory

| Metric | Value |
|--------|-------|
| Frontend `page.tsx` | **49** |
| Backend route modules | **49** (+ SCIM `/scim/v2`) |
| Prisma models | **99** |
| Backend unit tests | **24** cases / **10** files |
| Frontend tests | **0** |
| Next.js / React | `16.2.9` / `19.2.4` |
| Express / Prisma | `^5.1.0` / `^6.9.0` |
| CI | `.github/workflows/ci.yml` + `backup.yml` |
| Redis | In `docker-compose.yml` — **not used** by app runtime |

---

## 3. Feature Health

### Available (code + UI/API)

| Domain | Notes |
|--------|-------|
| Auth | Login discovery (v6.1), JWT, lockout, MFA TOTP API |
| Org / employees | CRUD, Excel employee import, encrypted salary/NPWP/bank |
| Attendance | Manual/GPS/QR/selfie/WiFi, offline sync, **Excel import v7.0** (admin Excel-first; office QR UI removed) |
| Leave / permission / shift / OT / corrections | Full request + approval flows |
| Payroll | Batch run, BPJS/PPh21, THR, proration, admin payslip preview, PDF |
| Claims / loans / documents / calendar / surveys | Available |
| Recruitment / onboarding / performance / training | Available |
| Talent / IDP / LMS | Foundation (PRD v4 M1–2) |
| Enterprise | Platform, workflows, SSO+JIT, branding, custom reports, row rules |
| Subscription | `/billing` + `/subscription/*` feature gating |
| Staff accounts | `/staff-accounts` |
| Ops | Health/ready, metrics, audit trail, CI |

### Conditional (code yes, production depends)

| Area | Dependency |
|------|------------|
| Selfie/liveness | Biometric provider URL |
| SSO Google/Microsoft/SAML | IdP credentials + UAT |
| Billing webhooks | Stripe/Xendit secrets |
| Email notifications | SMTP |
| Object storage | S3 env (else local disk) |
| LLM assistant / AI docs | LLM API key |
| SILO isolation | Physical DB provisioning |

### Product/UX gaps vs catalog (verified)

| Gap | Evidence |
|-----|----------|
| Employee payslip portal | API `/payroll/my` exists; AppShell `roles: 'admin'` hides `/payroll` from EMPLOYEE |
| MFA for all roles | API `/auth/mfa/*` exists; `/security` nav is admin-only |
| Admin office QR panel | Intentionally removed Jul 18; API `GET /attendance/qr/today` remains |

### Roadmap (not in product)

Native mobile apps, 9-box/succession, career marketplace, EWA, salary benchmarking, vertical packs, direct bank/DJP submission — see FEATURE-CATALOG §12.

---

## 4. Bug Findings

| Sev | ID | Location | Finding | Suggested fix |
|-----|----|----------|---------|---------------|
| **P0** | B01 | `backend/src/index.ts:111-114` | **`/uploads` is public `express.static`** — payslips under `{companyId}/payslips/...` reachable without auth if URL guessed | Authenticated/signed download; never serve payslips via public static |
| **P0** | B02 | `backend/src/middleware/auth.ts:67-73` | API keys store `scopes` but auth always elevates to **`COMPANY_ADMIN`** and never checks scopes | Enforce `matched.scopes` per route; default deny if empty |
| **P0** | B03 | `backend/src/services/payroll.service.ts:351-389` | **Finalize race:** `findFirst(DRAFT)` then `update({ id })` without status guard — concurrent finalize can **double-apply loan installments** | `updateMany({ where: { id, status: DRAFT }})`; abort if `count===0`; lock loans in same tx |
| **P1** | B04 | `frontend/src/components/AppShell.tsx:78` | Employees cannot open payslip portal from nav | Nav `/payroll` (or “Slip Gaji”) for `roles: 'all'` with page role split |
| **P1** | B05 | `AppShell.tsx:102` + `security/page.tsx` | MFA UI only for SUPER/COMPANY_ADMIN | Profile/settings MFA for all authenticated users |
| **P1** | B06 | `backend/src/routes/attendance.ts` import confirm | Concurrent confirm / TOCTOU vs dry-run uniqueness check | Idempotent import token; `createMany` + unique handling |
| **P1** | B07 | `attendance.ts` offline-sync | Check-then-upsert without strong concurrency control | Conditional upsert when `clockInTime` null |
| **P1** | B08 | `backend/src/routes/uploads.ts` | File filter: extension **OR** mimetype (spoofable); no magic-byte sniff | Require both + content sniff |
| **P2** | B09 | `frontend/src/lib/api.ts` | JWT in `localStorage` — XSS-exfiltrable | Prefer httpOnly cookie session + CSP |
| **P2** | B10 | `attendance/page.tsx`, `payroll/page.tsx` | Some loads use raw fetch / `.catch(console.error)` without user-visible error | Use shared `api` + loading/error UI |
| **P2** | B11 | `payroll.service.ts` email after finalize | Failures swallowed | Log + retry queue |
| **Risk** | R01 | `GET /payroll/my` | Filters by `employeeId` only (no explicit `companyId`) | Always add `companyScope` |
| **Risk** | R02 | Redis | Compose service unused | Wire sessions/queues or remove |

---

## 5. Performance Findings

| Sev | ID | Location | Finding | Suggested fix |
|-----|----|----------|---------|---------------|
| **P0** | P01 | `payroll.service.ts:115-165` | **N+1 on payroll run** — per-employee queries for OT/claims/loans/adjustments/variables | Batch by period keyed by `employeeId` |
| **P1** | P02 | `reports.ts` + `reportExport.ts` | Unbounded `findMany` + sync Excel/PDF on request thread | Cap rows / stream / background job |
| **P1** | P03 | `attendance.ts` Excel import | Full workbook in memory + all employees map (multer 5MB) | Stream rows; page employees |
| **P1** | P04 | `announcements`, `policies`, `documents`, `platform` lists | Missing pagination / hard cap | `take` + cursor or page |
| **P2** | P05 | `schema.prisma` Employee / AuditLog | Indexes often `[companyId]` only | Composite indexes for common filters |
| **P2** | P06 | Frontend tables | No virtualization; heavy client pages | Virtualize; lazy-load tabs |
| **P2** | P07 | Payslip PDF / large exports | Sync generation on HTTP | Worker/queue for heavy jobs |

---

## 6. Test Gaps

| Covered today | Missing / weak |
|---------------|----------------|
| RBAC matrix, encryption, spreadsheet safety | HTTP integration: auth middleware, tenant isolation |
| Payroll extras / THR helpers | Payroll finalize race / loan deduction |
| Biometric adapter stubs | Attendance Excel import confirm |
| Subscription feature flags | API-key scope enforcement |
| CI typecheck + unit + migrate | Frontend unit/E2E; MFA flow; offline-sync |

---

## 7. Recommended Priorities (Top 10)

1. **B01** — Lock down `/uploads` (auth or signed URLs)  
2. **B02** — Enforce API key `scopes`  
3. **B03** — Atomic payroll finalize + loan updates  
4. **P01** — Batch payroll run queries (kill N+1)  
5. **B04 / B05** — Employee payslip + MFA navigation  
6. **P02** — Cap/stream report exports  
7. **B06** — Attendance import idempotency  
8. **P05** — Composite DB indexes for hot filters  
9. **B09** — Move JWT off `localStorage` (or harden CSP)  
10. **Tests** — Integration coverage for import, finalize, API-key scopes, `companyId` on sensitive GETs  

---

## 8. Related Documents

- [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) — baseline + audit snapshot section  
- [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) — status matrix + open defects  
- [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) — feature inventory  
- [SECURITY-NFR-EVIDENCE.md](./SECURITY-NFR-EVIDENCE.md) — automated gates  

---

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| UpdatedAt | July 18, 2026 |
| HEAD | `73a730b` |

Property of DN Tech — PT. Dozer Napitupulu Technology · 2026
