---
owner: Dozer
status: active
canonical: true
last_reviewed: 2026-09-15
review_cadence: quarterly
---

# Database Disaster Recovery Runbook — PRD v11.0

## Scenario
Production PostgreSQL unavailable or corrupted. Restore from latest verified S3/local backup.

## Steps

### Step 1: Acknowledge and declare the incident
- Owner: production on-call rotation (PagerDuty: dnpeople-production)
- Duration: 15 minutes
- Success: incident ticket state = `acknowledged` and Datadog alert is linked
- Failure: ticket state != `acknowledged` or alert owner is missing
- Rollback: no rollback; continue incident handling and escalate
- Escalation: Dozer

### Step 2: Stop application writes
- Owner: backend on-call rotation (PagerDuty: dnpeople-production)
- Duration: 15 minutes
- Success: write-disable health check field set to `enabled=true`
- Failure: write traffic remains non-zero in the request metric
- Rollback: restore write access only after database integrity is verified
- Escalation: Dozer

### Step 3: Verify and restore the backup
- Owner: database on-call rotation (PagerDuty: database-primary)
- Duration: 150 minutes
- Success: `restore-database.sh` exits with code 0 and restore log line reports integrity pass
- Failure: command exit code != 0 or restore log line reports an error
- Rollback: restore only the isolated staging database; preserve production
- Escalation: Dozer and Finance/Risk

### Step 4: Verify integrity and smoke checks
- Owner: backend on-call rotation (PagerDuty: backend-primary)
- Duration: 30 minutes
- Success: `/health` and `/ready` return HTTP 200 and smoke test exits 0
- Failure: either endpoint returns HTTP 5xx or smoke test exits non-zero
- Rollback: return to the pre-restore snapshot and keep writes disabled
- Escalation: Dozer

### Step 5: Restore traffic and document the incident
- Owner: Dozer
- Duration: 30 minutes
- Success: traffic dashboard shows normal error rate and incident ticket state = `resolved`
- Failure: error rate remains above threshold or ticket state != `resolved`
- Rollback: route traffic back to the last known-good instance and keep writes guarded
- Escalation: Dozer and DevOps on-call rotation (PagerDuty: dnpeople-production)

## Commands

```bash
export ALLOW_RESTORE=true
export DATABASE_URL='postgresql://...staging...'
./scripts/verify-backup.sh ./backups/dnpeople-LATEST.dump
./scripts/restore-drill.sh ./backups/dnpeople-LATEST.dump
./scripts/smoke-test.sh
```

## Contacts
- Dozer (CEO / Tech Lead)
- DevOps on-call (PagerDuty: dnpeople-production)

## Sign-off
Record drill date + duration in `docs/RESTORE-DRILL-RUNBOOK.md`.
