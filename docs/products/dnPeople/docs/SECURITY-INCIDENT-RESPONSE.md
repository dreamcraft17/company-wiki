# Security Incident Response Plan

**UpdatedAt:** 19 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**SLA notifikasi breach:** < **72 jam** (UU PDP)

## Severity

| Level | Contoh | Respons |
|-------|--------|---------|
| P0 | PII/payslip leak, RCE, DB compromise | Immediate war room; notify customers < 72h |
| P1 | Auth bypass, privilege escalation | Fix < 7 hari; notify bila data exposed |
| P2 | Medium vuln dari pen-test | Fix per timeline remediation |

## Steps
1. Contain (revoke keys, rotate JWT/`FIELD_ENCRYPTION_KEYS` bila perlu, block IP)
2. Preserve evidence (audit logs, Sentry, metrics)
3. Eradicate + patch
4. Notify: Dozer → Legal → affected customers
5. Postmortem dalam 5 hari kerja

## Contacts
- Primary: Dozer
- Support: support@dnpeople.id
- Escalation: on-call (PagerDuty)

## Related
- `docs/UU-PDP-COMPLIANCE-CHECKLIST.md`
- `ops/runbooks/`
- Pen-test scope: `docs/PENTEST-SCOPE.md`
