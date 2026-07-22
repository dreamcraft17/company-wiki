# Database Disaster Recovery Runbook — PRD v11.0

## Scenario
Production PostgreSQL unavailable or corrupted. Restore from latest verified S3/local backup.

## Timeline (target RTO < 4 hours, RPO < 1 hour)

| Step | Action | Target |
|------|--------|--------|
| 1 | Datadog alert / manual detect | 0–15 min |
| 2 | Stop app writes, notify #incidents | 15–30 min |
| 3 | `verify-backup.sh` + `restore-database.sh` | 30–180 min |
| 4 | Integrity COUNT + smoke `/health` `/ready` | 180–210 min |
| 5 | Failover traffic / post-mortem | 210+ min |

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
