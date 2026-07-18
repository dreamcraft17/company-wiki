# dnPeople — Security & NFR Verification Evidence

**Verification date:** 12 July 2026
**Scope:** PRD/SRS/SDD v3.1 completion hardening

This document records reproducible engineering evidence. Production-provider acceptance and business UAT remain deployment gates and must not be inferred from local/CI results.

## Automated verification

| Gate | Command / CI job | Observed result |
|------|------------------|-----------------|
| Backend type safety | `npx tsc --noEmit` | Pass |
| Frontend type safety | `npx tsc --noEmit` | Pass |
| Backend build | `npm run build` | Pass |
| Frontend production build | `npm run build` | Pass, 44 routes |
| Unit/security tests | `npm test` | 24/24 pass |
| Dependency security | `npm audit --omit=dev` | 0 known vulnerabilities |
| Prisma validation | `npx prisma validate` | Pass |
| Clean database migration | CI `database-schema` | PostgreSQL 16 migration + schema diff gate |
| Database controls | `npm run test:database` | Audit immutability and required correction evidence |
| Performance | CI `performance-smoke` | 5,000 requests, 1,000 logical concurrent users, p95 <2s gate |

Latest verification-host load result:

```json
{
  "requests": 5000,
  "concurrency": 1000,
  "maxSockets": 200,
  "failures": 0,
  "requestsPerSecond": 23318.72,
  "p50Ms": 33.25,
  "p95Ms": 55.71,
  "p99Ms": 208.45
}
```

The performance test exercises the real compiled Express application and `/health` liveness path using keep-alive pooling representative of a production reverse proxy. Database-heavy endpoint capacity must still be validated against the selected production database tier and dataset.

## Security controls

| Control | Evidence |
|---------|----------|
| Authentication/RBAC | JWT/API-key middleware; automated HR, Manager, Finance, Employee permission tests |
| Salary separation | HR cannot access payroll; employee API omits salary without payroll/owner access |
| Field encryption | AES-256-GCM for salary, NPWP, bank account; current + fallback keys support rotation |
| Auditability | Redacted global mutation/sensitive-read audit plus before/after domain logs |
| Audit immutability | PostgreSQL trigger rejects update/delete; verified by clean-DB CI script |
| Attendance evidence | `evidence_url` is required by API validation and database `NOT NULL` constraint |
| Biometric attendance | Provider-neutral liveness/face-match; production fails closed without provider |
| Error tracking | Optional Sentry integration with PII, salary, credential, cookie and token redaction |
| Spreadsheet security | Vulnerable SheetJS removed; ExcelJS/csv-parse used; formula-injection escaping tested |
| Backup/restore | Daily workflow, checksum, encrypted object-storage option, explicit restore guard |

## Production acceptance gates

- Run migrations and `npm run test:database` against a clean staging PostgreSQL 16 instance.
- Run `npm run security:migrate-fields` once for legacy plaintext data, then verify sampled records.
- Test encryption-key rotation with current and previous key configured from a secret manager.
- Perform a backup restore drill to an isolated database and record RPO/RTO.
- Validate Sentry delivery and confirm event payloads contain no PII or credentials.
- Complete biometric-provider liveness/face-match UAT with consent and retention policy.
- Repeat load testing against authenticated, database-heavy workflows using production-sized data.
- Execute HR, Finance, Manager, and Employee browser UAT and retain signed evidence.

## Related documents

- [PRD compliance matrix](./PRD-COMPLIANCE-MATRIX.md)
- [Deployment guide](./DEPLOYMENT.md)
- [Implementation status](./IMPLEMENTATION-STATUS.md)
- [API reference](./API.md)
