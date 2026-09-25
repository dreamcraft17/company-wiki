---
owner: Dozer
status: active
canonical: true
last_reviewed: 2026-09-15
review_cadence: quarterly
---

# Incident Runbook — High API Latency

**Alert:** API latency p95 > 1s (warning) / > 2s (critical)  
**Related:** FR-OPS-002 AC-2.3

## What this means
Clients melihat respons lambat. Bisa DB, N+1, export besar, atau pool habis.

## Common causes
1. Query lambat / missing index pada payroll/attendance
2. Export sync besar tanpa job async
3. Connection pool saturated
4. Disk I/O tinggi (backup overlapping)

## Steps
### Step 1: Inspect service metrics
- Owner: backend on-call rotation (PagerDuty: backend-primary)
- Duration: 10 minutes
- Success: `/metrics` returns HTTP 200 and the latency/error metrics are recorded
- Failure: `/metrics` returns HTTP 5xx or metrics are unavailable
- Rollback: no rollback; preserve the metric snapshot
- Escalation: Dozer

### Step 2: Identify the slow endpoint
- Owner: backend on-call rotation (PagerDuty: backend-primary)
- Duration: 10 minutes
- Success: Datadog log line identifies the top endpoint and release ID
- Failure: no endpoint or release can be identified from APM/logs
- Rollback: no rollback; continue with database inspection
- Escalation: Dozer

### Step 3: Inspect database activity
- Owner: database on-call rotation (PagerDuty: database-primary)
- Duration: 15 minutes
- Success: query output identifies whether a long-running query or pool saturation is present
- Failure: database query errors or activity output is unavailable
- Rollback: read-only query; no rollback needed
- Escalation: Dozer

### Step 4: Move large exports to the jobs endpoint
- Owner: backend on-call rotation (PagerDuty: backend-primary)
- Duration: 20 minutes
- Success: request log line shows the client using `/reports/jobs` and latency returns below 1 second
- Failure: client continues synchronous export or latency remains above 1 second
- Rollback: restore the previous export route only if the jobs endpoint fails
- Escalation: Dozer

### Step 5: Scale or restart a hung API
- Owner: DevOps on-call rotation (PagerDuty: dnpeople-production)
- Duration: 15 minutes
- Success: service status = `healthy` and p95 latency returns below 1 second
- Failure: service status != `healthy` or p95 latency remains above 1 second
- Rollback: return to the previous capacity or instance after health checks fail
- Escalation: Dozer

### Step 6: Escalate an unresolved incident
- Owner: Dozer
- Duration: 5 minutes
- Success: incident ticket state = `escalated` when no acknowledgement exists after 15 minutes
- Failure: p95 remains above 2 seconds and escalation is not recorded
- Rollback: no rollback; keep incident communications active
- Escalation: Dozer

## Resolve
Incident auto-resolve saat p95 kembali di bawah threshold 5 menit.
