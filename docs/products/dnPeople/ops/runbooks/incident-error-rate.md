---
owner: Dozer
status: active
canonical: true
last_reviewed: 2026-09-15
review_cadence: quarterly
---

# Incident Runbook — Elevated Error Rate

**Alert:** 5xx error rate > 1% / > 5%

## Steps
### Step 1: Inspect the latest exceptions
- Owner: backend on-call rotation (PagerDuty: backend-primary)
- Duration: 10 minutes
- Success: Sentry query returns a grouped exception list with timestamps and release IDs
- Failure: Sentry query returns an access error or no timestamped result
- Rollback: no rollback; preserve the redacted exception evidence
- Escalation: Dozer

### Step 2: Check service readiness
- Owner: backend on-call rotation (PagerDuty: backend-primary)
- Duration: 5 minutes
- Success: `/ready` returns HTTP 200 and database status = `ok`
- Failure: `/ready` returns HTTP 5xx or database status != `ok`
- Rollback: no rollback; continue to deployment inspection
- Escalation: Dozer

### Step 3: Identify the recent deployment or migration
- Owner: backend on-call rotation (PagerDuty: backend-primary)
- Duration: 10 minutes
- Success: deployment log line identifies the last release and migration hash
- Failure: release or migration hash is not available in logs
- Rollback: no rollback; keep the incident acknowledged
- Escalation: Dozer

### Step 4: Roll back a confirmed regression
- Owner: backend on-call rotation (PagerDuty: backend-primary)
- Duration: 20 minutes
- Success: deployment status = `rolled-back` and error rate returns below 1%
- Failure: rollback status != `rolled-back` or error rate remains above 1%
- Rollback: redeploy the last known-good release if the first rollback fails
- Escalation: Dozer

### Step 5: Notify customers when impact is sustained
- Owner: Dozer
- Duration: 15 minutes
- Success: status-page ticket state = `published` when critical impact exceeds 15 minutes
- Failure: impact exceeds 15 minutes and status-page ticket state != `published`
- Rollback: correct the published notice through an updated status entry
- Escalation: Dozer and Support
