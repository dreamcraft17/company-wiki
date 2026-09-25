---
owner: Dozer
status: active
canonical: true
last_reviewed: 2026-09-15
review_cadence: quarterly
---

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
### Step 1: Contain the incident
- Owner: security on-call rotation (PagerDuty: security-primary)
- Duration: 15 minutes
- Success: credential status = `revoked` and the incident ticket records containment time
- Failure: credential status != `revoked` or the alert remains active
- Rollback: do not restore revoked credentials; issue new scoped credentials only after approval
- Escalation: Dozer
### Step 2: Preserve evidence
- Owner: security on-call rotation (PagerDuty: security-primary)
- Duration: 30 minutes
- Success: evidence manifest field set to `verified=true` with timestamps and hashes
- Failure: evidence manifest field set to `verified=false` or the restricted location is inaccessible
- Rollback: no rollback; preserve the original source and escalate
- Escalation: Dozer
### Step 3: Eradicate and patch
- Owner: backend owner (Dozer accountable)
- Duration: 4 hours
- Success: security test log line reports pass and the health endpoint returns HTTP 200
- Failure: security test log line reports failure or the health endpoint returns HTTP 5xx
- Rollback: revert to the last known-good commit and keep containment active
- Escalation: Dozer
### Step 4: Decide and send notifications
- Owner: Dozer
- Duration: 60 minutes
- Success: notification ticket state = `approved-and-recorded` with recipients and timestamp
- Failure: notification ticket state != `approved-and-recorded` or customer scope is unknown
- Rollback: notifications cannot be recalled; obtain Legal approval before sending
- Escalation: Dozer and Legal
### Step 5: Complete the postmortem
- Owner: Dozer
- Duration: 5 days
- Success: postmortem ticket state = `approved` and every action has an owner and due date
- Failure: postmortem ticket state != `approved` or evidence is incomplete
- Rollback: no rollback; keep the incident in remediation status
- Escalation: Dozer

## Contacts
- Primary: Dozer
- Support: info@dnpeople.id
- Escalation: on-call (PagerDuty)

## Related
- `docs/UU-PDP-COMPLIANCE-CHECKLIST.md`
- `ops/runbooks/`
- Pen-test scope: `docs/PENTEST-SCOPE.md`
