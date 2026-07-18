# dnPeople — Feature, Bug & Performance Audit

**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** DnPeople  
**UpdatedAt:** July 18, 2026  
**Audit date:** 18 July 2026  
**Remediation:** PRD v8.0 (same day) — see [PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md](./PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md)  
**Method:** Static code review against `frontend/`, `backend/`, Prisma schema, CI, and feature catalog — not a production load/Lighthouse lab run.

---

## 1. Summary

| Area | Verdict |
|------|---------|
| Feature completeness | **Strong** — MVP 1–5 + PRD v5–v8.0 implemented in code |
| Correctness / security bugs | Audit found **3× P0**, **5× P1** — **remediated in PRD v8.0** |
| Performance | Payroll N+1 (**P01**) batched; report exports capped |
| Tests | Unit helpers **28/28** (incl. API scopes + upload validation) |
| Production readiness | **Conditional** — code P0s fixed; ops UAT (IdP/SMTP/S3/biometric) still required |

**Remediation shipped (v8.0):** lock down uploads, enforce API-key scopes, atomic payroll finalize, batch payroll run, employee payslip + MFA nav, import idempotency, upload magic bytes, report caps.

---

## 2. Inventory (post v8.0)

| Metric | Value |
|--------|-------|
| Frontend `page.tsx` | **50** (+ `/settings/mfa`) |
| Backend route modules | **50** (+ `files`) |
| Prisma models | **99** |
| Backend unit tests | **28** cases |
| Frontend tests | **0** |
| Next.js / React | `16.2.9` / `19.2.4` |
| Express / Prisma | `^5.1.0` / `^6.9.0` |
| CI | `.github/workflows/ci.yml` + `backup.yml` |
| Redis | In `docker-compose.yml` — **not used** by app runtime |

---

## 3. Remediation status (was open at audit)

| ID | Sev | Finding | Status |
|----|-----|---------|--------|
| B01 | P0 | Public `/uploads` static | **Fixed** — removed static; `GET /api/v1/files/*` + payslip PDF auth/audit |
| B02 | P0 | API key always COMPANY_ADMIN | **Fixed** — `apiScopes` + `assertApiKeyScope` |
| B03 | P0 | Finalize race / double loan | **Fixed** — `updateMany` where DRAFT inside tx |
| P01 | P0 | Payroll run N+1 | **Fixed** — batch fetch by `employeeId IN (...)` |
| B04 | P1 | Employee payslip nav | **Fixed** — Slip Gaji `/payroll` for all |
| B05 | P1 | MFA admin-only | **Fixed** — `/settings/mfa` |
| B06 | P1 | Import concurrency | **Fixed** — `Idempotency-Key` / body key |
| B07 | P1 | Offline sync overwrite | **Fixed** — fill-empty only |
| B08 | P1 | Upload MIME OR-ext | **Fixed** — MIME + magic bytes |
| P02 | P1 | Unbounded reports | **Fixed** — `take: 1000` |

### Residual / ops (not code P0)

- Excel import memory for very large sheets (P04) — monitor; prefer chunked import later  
- Production IdP/SCIM, SMTP, S3, biometric vendor UAT  
- Domain integration tests for finalize concurrency under load  

---

## 4. Feature Health

Unchanged strong coverage across auth, org, attendance (incl. Excel import), leave, payroll, talent, enterprise. See [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) and [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md).

---

## 5. Original recommended order (completed)

1. ~~B01 — Lock down `/uploads`~~  
2. ~~B02 — Enforce API-key scopes~~  
3. ~~B03 — Atomic payroll finalize~~  
4. ~~P01 — Batch payroll run~~  
5. ~~B04/B05 — Employee payslip + MFA~~  
6. ~~B06–B08 + P02~~  
7. Unit tests for scopes / upload validation  

---

**Owner note:** Do not claim production-accepted until ops UAT gates in CURRENT-IMPLEMENTATION are signed.
