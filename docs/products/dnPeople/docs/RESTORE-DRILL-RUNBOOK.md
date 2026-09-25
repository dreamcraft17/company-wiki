---
owner: Dozer
status: active
canonical: true
last_reviewed: 2026-09-15
review_cadence: quarterly
---

# dnPeople — Restore Drill Runbook

**UpdatedAt:** 22 Juli 2026  
**Target:** RPO < 1 jam · RTO < 4 jam  
**Related:** [SLA-COMMITMENT-RPO-RTO.md](./SLA-COMMITMENT-RPO-RTO.md) · [ops/runbooks/database-restore.md](../ops/runbooks/database-restore.md)

## Prasyarat

- `BACKUP_DATABASE_URL` / cron `scripts/backup-database.sh` berjalan harian (lihat `.github/workflows/backup.yml`)
- Akses object storage atau path lokal hasil backup
- Staging DB terpisah (jangan restore langsung ke production tanpa freeze)

## Langkah drill (staging)

### Step 1: Select and identify the backup
- Owner: Dozer or database on-call rotation (PagerDuty: database-primary)
- Duration: 5 minutes
- Success: ticket field set to `backup_hash_recorded=true` with the start time and SHA-256 hash
- Failure: backup verification log line reports unreadable backup or missing hash
- Rollback: no database mutation; select another verified backup
- Escalation: Dozer
### Step 2: Restore the isolated staging database
- Owner: database on-call rotation (PagerDuty: database-primary)
- Duration: 30 minutes
- Success: `restore-drill.sh` exits with code 0 and reports integrity checks
- Failure: restore command exit code != 0 or restore log line reports a connection/integrity error
- Rollback: recreate only staging; never run this against production
- Escalation: Dozer
### Step 3: Apply pending migrations
- Owner: database on-call rotation (PagerDuty: database-primary)
- Duration: 10 minutes
- Success: Prisma exits with code 0 and reports no failed migration
- Failure: migration log line reports exit code != 0 or a failed migration
- Rollback: restore the staging snapshot before retrying
- Escalation: backend owner via Dozer
### Step 4: Run API and smoke checks
- Owner: backend on-call rotation (PagerDuty: backend-primary)
- Duration: 15 minutes
- Success: smoke test exits 0 and admin login, payslip, and attendance checks return expected data
- Failure: smoke test failure, HTTP 5xx, or missing record
- Rollback: stop staging and return to the pre-drill snapshot
- Escalation: backend on-call rotation (PagerDuty: backend-primary)
### Step 5: Verify restored record counts
- Owner: database on-call rotation (PagerDuty: database-primary)
- Duration: 10 minutes
- Success: `employees`, `payslips`, `attendance_records`, and `leave_requests` each return a non-zero count
- Failure: any query returns zero or errors
- Rollback: preserve the failed staging database; do not overwrite production
- Escalation: Dozer
### Step 6: Calculate recovery time
- Owner: database on-call rotation (PagerDuty: database-primary)
- Duration: 5 minutes
- Success: RTO field set to `< 4 hours` in the ops ticket
- Failure: RTO field set to `>= 4 hours` or the finish time is missing
- Rollback: no rollback; open a remediation ticket
- Escalation: Dozer and Finance/Risk
### Step 7: Calculate recovery point
- Owner: database on-call rotation (PagerDuty: database-primary)
- Duration: 10 minutes
- Success: RPO field set to `< 1 hour` in the ops ticket
- Failure: RPO field set to `>= 1 hour` or the production timestamp is unavailable
- Rollback: no rollback; preserve evidence and open a backup remediation ticket
- Escalation: Dozer and Finance/Risk
### Step 8: Close the drill with evidence
- Owner: Dozer
- Duration: 10 minutes
- Success: ticket state = `restore-drill-complete` and all evidence fields are present
- Failure: ticket state != `restore-drill-complete` or a required field is blank
- Rollback: no rollback; keep the drill open until complete
- Escalation: Dozer

## Hasil drill

| Tanggal | Operator | Backup dipakai | RPO | RTO | Lulus? | Catatan |
|---------|----------|----------------|-----|-----|--------|---------|
| | | | | | [ ] | |

## Failover catatan

- Single VPS: restore = primary recovery path hingga HA tersedia.  
- Setelah restore production: rotate `JWT` secrets hanya jika dicurigai compromise; notify customers bila RPO > SLA.
