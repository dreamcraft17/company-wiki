---
owner: Dozer
status: active
canonical: true
last_reviewed: 2026-09-15
review_cadence: quarterly
---

# Incident Runbook — Backup Failed / Stale

**Alert:** `verify-backup.sh` exit non-zero atau backup age > 26h

## Steps
### Step 1: Verify the failed backup
- Owner: database on-call rotation (PagerDuty: database-primary)
- Duration: 10 minutes
- Success: `verify-backup.sh` exits with code 0 and log line reports a valid backup
- Failure: command exit code != 0 or log line reports backup age above 26 hours
- Rollback: no rollback; retain the failed backup evidence
- Escalation: Dozer

### Step 2: Check storage and credentials
- Owner: database on-call rotation (PagerDuty: database-primary)
- Duration: 10 minutes
- Success: disk metric shows free space above the configured threshold and secret-manager lookup returns a value
- Failure: disk metric is below threshold or credential lookup returns an error
- Rollback: do not print or commit credentials; restore the previous secret reference
- Escalation: Dozer

### Step 3: Create an immediate replacement backup
- Owner: database on-call rotation (PagerDuty: database-primary)
- Duration: 30 minutes
- Success: `backup-database.sh` exits with code 0 and a new object timestamp is recorded
- Failure: command exit code != 0 or object timestamp is not updated
- Rollback: remove only the failed staging artifact; retain the last verified backup
- Escalation: Dozer and Finance/Risk

### Step 4: Run a staging restore if required
- Owner: database on-call rotation (PagerDuty: database-primary)
- Duration: 60 minutes
- Success: restore drill ticket state = `passed` in staging
- Failure: restore drill ticket state != `passed` or staging integrity check fails
- Rollback: recreate staging from the last verified backup; never restore directly to production
- Escalation: Dozer

### Step 5: Escalate an RPO breach
- Owner: Dozer
- Duration: 10 minutes
- Success: incident ticket state = `risk-accepted-or-remediating` and Finance/Risk is notified
- Failure: RPO calculation is >= 1 hour or notification is not recorded
- Rollback: no rollback; preserve evidence and keep the incident open
- Escalation: Dozer and Finance/Risk
