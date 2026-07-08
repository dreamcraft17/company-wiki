# SOC 2 Readiness Checklist — dnPeople ERP

**Version:** 1.0  
**Date:** 3 July 2026 · **Updated:** 7 July 2026  
**Status:** Foundation in place + production hardening (health probes, env validation, backup scripts) — formal certification requires external audit

---

## Security Controls (Implemented)

| Control | Status | Reference |
|---------|--------|-----------|
| Authentication (JWT, 2FA, SSO) | ✅ | `modules/auth/` |
| Email verification | ✅ | `auth.service.ts` |
| Login throttling | ✅ | `login-attempt.service.ts` |
| RBAC / role hierarchy | ✅ | `user.enums.ts`, guards |
| Audit logging | ✅ | `AuditInterceptor`, `audit_logs` |
| GDPR export/erasure | ✅ | `modules/gdpr/` |
| Field encryption (AES-256) | ✅ | finance sensitive fields |
| API key auth | ✅ | `integrations/` |

## Availability & Operations

| Control | Status | Notes |
|---------|--------|-------|
| Health probes | ✅ | `/api/v1/health` |
| Prometheus metrics | ✅ | `/metrics` |
| ELK structured logging | ✅ | `ElkLoggerService` |
| Helm + K8s manifests | ✅ | `k8s/helm/templates/` |
| CI pipeline | ✅ | `.github/workflows/ci.yml` |
| Staging deploy workflow | ✅ | `deploy-staging.yml` |
| DB migrations in CI | ✅ | `db:migrate` step |

## Data Protection

| Control | Status | Reference |
|---------|--------|-----------|
| Soft delete | ✅ | `softDeleteByTenant` |
| Data retention policy | ✅ | `Docs/23-DATA-RETENTION-POLICY.md` |
| Tenant isolation (row-level) | ✅ | `tenantId` on all entities |
| Schema-per-tenant hook | ✅ | `TenantSchemaService` (opt-in) |

## Remaining for Formal SOC 2

- External auditor engagement (Type I / Type II)
- Penetration testing report
- Incident response runbook execution drills
- Vendor management documentation
- Change management formal sign-off process

---

See also: [`Docs/15-PRODUCTION-DEPLOYMENT-GUIDE.md`](15-PRODUCTION-DEPLOYMENT-GUIDE.md)
