# dnPeople — SRS v10.0
## Operations & Launch Readiness Requirements

**Versi:** 10.0  
**Tanggal:** 19 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Detailed requirements untuk operations team

---

## FR-OPS-001: Monitoring & Observability

**ID:** FR-OPS-001  
**Priority:** P0 (Critical for launch)  
**Owner:** DevOps / Operations

### Requirement

```
Backend application HARUS expose Prometheus-compatible metrics
sehingga monitoring system dapat scrape data real-time.

Acceptance Criteria:

AC-1.1: Metrics Endpoint
  Given endpoint /metrics
  When GET request made (no auth required)
  Then system returns Prometheus format:
    - Request count (http_requests_total)
    - Request duration histogram (http_request_duration_seconds)
    - Database connection pool (db_connections_active, db_connections_waiting)
    - Error rate (http_requests_errors_total)
    - Payroll jobs processed (payroll_jobs_total)
    - API rate limit (rate_limit_exceeded_total)
    
  Format:
    # HELP http_requests_total Total HTTP requests
    # TYPE http_requests_total counter
    http_requests_total{method="GET", status="200"} 12345
    http_requests_total{method="POST", status="201"} 789
    
AC-1.2: Datadog Integration
  Given Datadog account created + agent installed
  When agent configured to scrape /metrics every 10s
  Then:
    - Metrics appear in Datadog UI within 1 minute
    - Historical data stored for 13 months
    - Can create dashboard with:
      [ ] Request rate (req/sec)
      [ ] Latency p95/p99 (ms)
      [ ] Error rate (%)
      [ ] Database connections (active/waiting)
      [ ] Payroll job queue (pending/completed)
      [ ] API rate limit (daily quota used)
  
AC-1.3: Health Endpoint
  Given /health endpoint
  When GET request made
  Then return:
    {
      "status": "ok",
      "timestamp": "2026-07-19T10:30:00Z",
      "uptime": "48h30m",
      "version": "1.0.0"
    }
  
AC-1.4: Readiness Endpoint
  Given /ready endpoint
  When GET request made
  Then return:
    {
      "ready": true,
      "checks": {
        "database": "ok",
        "cache": "ok",
        "smtp": "ok",
        "s3": "ok"
      }
    }
  
  If ANY check fails: return HTTP 503 Service Unavailable

AC-1.5: Liveness Probe
  Given /alive endpoint
  When container healthy
  Then return HTTP 200 immediately (< 10ms)
  
  Used by Kubernetes/orchestration for auto-restart

Test Cases:
  T1.1: Metrics scrape successful
    - GET /metrics
    - ✓ HTTP 200
    - ✓ Contains at least 20 metric series
    - ✓ Datadog scrapes successfully
    
  T1.2: Monitoring dashboard shows data
    - Wait 5 minutes after agent starts
    - View Datadog dashboard
    - ✓ All 6 metric categories populated
    
  T1.3: Health check works during incident
    - Database connection pool maxed out
    - GET /health
    - ✓ Still returns 200 (app alive but degraded)
    - GET /ready
    - ✓ Returns 503 (database not ready)
```

---

## FR-OPS-002: Alerting & Incident Response

**ID:** FR-OPS-002  
**Priority:** P0 (Critical)  
**Owner:** DevOps / Incident Commander

### Requirement

```
Monitoring system HARUS trigger alerts when thresholds breached.
PagerDuty HARUS notify on-call engineer.

Acceptance Criteria:

AC-2.1: Alert Rules Configured
  Given Datadog monitoring live
  When metric exceeds threshold
  Then PagerDuty incident created + on-call notified
  
  Alert thresholds:
    [ ] API latency p95 > 1000ms (warning) > 2000ms (critical)
    [ ] Error rate > 1% (warning) > 5% (critical)
    [ ] Database CPU > 80% (warning) > 95% (critical)
    [ ] Database connections > 80% pool (warning) > 90% (critical)
    [ ] Disk usage > 80% (warning) > 90% (critical)
    [ ] Failed payment webhooks > 5/hour (critical)
    [ ] Backup failed last 24h (critical)
    [ ] Unhandled exceptions > 10/min (critical)

AC-2.2: PagerDuty Integration
  Given Datadog alert triggered
  When threshold exceeded
  Then:
    - Incident created in PagerDuty
    - On-call engineer notified (SMS + email + push)
    - Escalation after 15 min (to secondary)
    - Escalation after 30 min (to manager)
    - Resolve incident automatically when metric recovers

AC-2.3: Incident Runbook
  Given critical alert (e.g., "API latency p99 > 2s")
  When engineer opens incident
  Then PagerDuty shows:
    - What is this alert?
    - Common causes
    - Troubleshooting steps
    - Escalation path
    - Contact list

AC-2.4: On-Call Rotation
  Given PagerDuty schedule active
  When Monday 00:00 UTC
  Then:
    - Engineer A on-call Mon-Wed
    - Engineer B on-call Wed-Fri
    - Engineer C on-call Fri-Sun
    - Rotation repeats weekly
    - Allows for primary + backup

AC-2.5: Alert Silence
  Given maintenance window scheduled (e.g., 02:00-03:00)
  When scheduled time arrives
  Then:
    - Alerts silenced for 1 hour
    - Maintenance work performed
    - Alerts resume automatically after
    - Maintenance logged in incident history

Test Cases:
  T2.1: Alert fired on high latency
    - Simulate slow queries
    - Monitor latency p95
    - ✓ Alert fires within 2 minutes
    - ✓ PagerDuty incident created
    - ✓ Engineer notified
    
  T2.2: Escalation after 15 min
    - Alert fired
    - Wait 15 minutes (no acknowledgment)
    - ✓ Second engineer notified (escalation)
    
  T2.3: Auto-resolve when recovered
    - Alert fired (latency high)
    - Fix applied (query optimized)
    - Latency drops below threshold
    - ✓ Incident auto-resolved in PagerDuty
```

---

## FR-OPS-003: Backup & Disaster Recovery

**ID:** FR-OPS-003  
**Priority:** P0 (Critical)  
**Owner:** DevOps / Database Admin

### Requirement

```
Backup HARUS run daily, storage HARUS be verified, restore HARUS be tested.
RPO < 1 hour, RTO < 4 hours.

Acceptance Criteria:

AC-3.1: Daily Backup Schedule
  Given cron job scheduled
  When 02:00 UTC (off-peak)
  Then:
    - Full database backup executed
    - Backup compressed (gzip)
    - Backup encrypted (KMS key)
    - Backup uploaded to S3 multi-region
    - Backup manifest with checksum

AC-3.2: Backup Verification
  Given backup completed
  When daily verification job runs (04:00 UTC)
  Then:
    - S3 checksum verified (no corruption)
    - Backup size reasonable (> 100MB, < 50GB)
    - Backup timestamp recent (< 2h old)
    - Backup encrypted key accessible
    - Alert if verification fails

AC-3.3: Point-in-Time Recovery
  Given backup taken at 01:50
  When restore requested at 10:00
  Then:
    - Can restore to 01:50 (full backup)
    - Can restore to 02:30 (incremental, if available)
    - Restore time < 4 hours
    - Restored data integrity verified

AC-3.4: Restore Drill
  Given scheduled restore drill (weekly)
  When Wednesday 16:00 UTC
  Then:
    - Restore database to staging (1 week old backup)
    - Verify restored data (sample queries)
    - Test application connection
    - Document restore time + any issues
    - Update runbook if needed
    - Notify team of completion

AC-3.5: RPO/RTO Signed
  Given backup policy documented
  When reviewed by Dozer + Finance
  Then:
    - RPO: < 1 hour (maximize data retention)
    - RTO: < 4 hours (restore by end of business day)
    - Commitment signed + dated
    - Communicated to customers in SLA

Test Cases:
  T3.1: Backup runs daily
    - Check cron logs
    - ✓ Backup executed at 02:00 UTC
    - ✓ S3 object created with correct size
    - ✓ Backup timestamp in manifest correct
    
  T3.2: Restore drill completed
    - Run restore script on staging
    - ✓ Restore completes in < 4 hours
    - ✓ Data integrity checks pass
    - ✓ Application connects successfully
    - ✓ Runbook updated with results
    
  T3.3: Multi-week backup retention
    - List S3 backups
    - ✓ Backups available for past 30 days
    - ✓ Older backups archived to glacier
```

---

## FR-OPS-004: Load Testing & Performance Validation

**ID:** FR-OPS-004  
**Priority:** P0 (Critical)  
**Owner:** QA / Performance Engineer

### Requirement

```
Load test HARUS validate system handles launch volume.
Target: 100 concurrent users initially, 1000 for scale.

Acceptance Criteria:

AC-4.1: Test Environment Setup
  Given staging environment identical to production
  When test data seeded
  Then:
    - 5000 employees (production-like scale)
    - 3 years of payroll/attendance/leave history
    - 20 companies (multi-tenant load)
    - All indexes created
    - Caches warmed (Redis if used)

AC-4.2: Baseline Run (100 users)
  Given k6 test script (login + payroll + attendance)
  When test runs for 5 minutes
  Then:
    - p95 latency < 1000ms
    - p99 latency < 2000ms
    - Error rate < 0.1%
    - Successful requests: > 99%
    - Response times recorded

AC-4.3: Ramp Test (100→500 users)
  Given gradual load increase
  When 10 min per level (100→200→300→400→500)
  Then:
    - Find maximum sustainable load (MSL)
    - Latency increase < 20% per level
    - No hung requests (timeout handling works)
    - Database connection pool healthy
    - Memory leak check (stable over time)

AC-4.4: Spike Test (sudden load)
  Given normal load 100 users
  When spike to 300 users instantly
  Then:
    - System survives (no crash)
    - p95 latency spike < 5 seconds
    - Error rate spike < 5%
    - Recovery time < 2 minutes
    - Auto-scaling triggers (if applicable)

AC-4.5: Stress Test (beyond capacity)
  Given maximum load reached (MSL)
  When load increased by 50%
  Then:
    - Graceful degradation (no cascade failure)
    - Errors returned cleanly (not 500)
    - Rate limiting working (hard block at 10k/day)
    - Queue builds up (background jobs wait)
    - System recovers when load normalizes

Test Cases:
  T4.1: 100-user baseline
    - Run k6 script (5 min)
    - ✓ p95 < 1s achieved
    - ✓ Error rate < 0.1%
    - ✓ Results saved as baseline
    
  T4.2: Ramp test 100→500
    - Run gradual ramp script
    - ✓ MSL identified (e.g., 400 users max)
    - ✓ Bottleneck documented (database queries?)
    - ✓ Optimization recommendations made
    
  T4.3: Load test after optimization
    - Apply fixes (indexes, caching)
    - Rerun baseline
    - ✓ p95 improves by 30%
    - ✓ MSL increases to 700 users
```

---

## FR-OPS-005: Security Testing & Compliance

**ID:** FR-OPS-005  
**Priority:** P0 (Critical)  
**Owner:** Security / Compliance

### Requirement

```
External penetration test MUST validate security posture.
UU PDP compliance MUST be verified.

Acceptance Criteria:

AC-5.1: Penetration Test Scheduled
  Given security firm identified (5-7 days)
  When engagement starts
  Then:
    - Scope defined (web app, API, data)
    - Timeline set (daily updates)
    - Deliverables clear (report + remediation plan)
    - Testing window coordinated (not during live customers)

AC-5.2: Vulnerability Categories Tested
  Given pen-test in progress
  When tester probes for vulnerabilities
  Then:
    - OWASP Top 10 covered (injection, auth, etc)
    - Business logic tested (payroll calculations)
    - Data isolation tested (multi-tenant)
    - Session management tested (cookies, tokens)
    - File upload tested (malware, XXE)
    - Rate limiting tested (bypass attempts)
    - Encryption tested (transit, at-rest)

AC-5.3: Report & Remediation
  Given pen-test completed
  When report delivered
  Then:
    - Vulnerabilities categorized (critical/high/medium/low)
    - Each finding has remediation steps
    - Remediation timeline agreed (critical: 1 week)
    - Re-test scheduled after fixes

AC-5.4: UU PDP Compliance
  Given compliance checklist
  When Dozer + Legal review
  Then:
    [ ] Privacy policy published + accessible
    [ ] Consent for data processing obtained
    [ ] Data retention policy documented (5 years)
    [ ] Employee data access logged + auditable
    [ ] Data export available (employee request)
    [ ] Data deletion workflow (soft delete)
    [ ] Encryption keys + rotation policy
    [ ] Third-party processors listed + DPA signed
    [ ] Security incident response plan (< 72h notification)
    [ ] DPA template ready for customers

Test Cases:
  T5.1: Penetration test started
    - Call security firm
    - ✓ Engagement letter signed
    - ✓ Testing window scheduled
    - ✓ Scope documented
    
  T5.2: Report received
    - Review findings
    - ✓ < 5 critical vulnerabilities
    - ✓ All remediable (no design flaws)
    - ✓ Re-test scheduled
    
  T5.3: Compliance checklist complete
    - Review all 10 items
    - ✓ All items completed or planned
    - ✓ Signed by Dozer (commitment)
```

---

## NFR-OPS-001: SLA Commitments

```
Uptime:          99.9% (8.76 hours downtime/year acceptable)
Response time:   p95 < 1 second, p99 < 2 seconds
Error rate:      < 0.1% unhandled errors
Backup RPO:      < 1 hour (data loss tolerance)
Restore RTO:     < 4 hours (max downtime)
Availability:    24/5 support (off-peak weekend acceptable)
```

---

## Testing Strategy

### Smoke Test (Every deployment)

```
[ ] /health returns 200
[ ] /ready returns 200 (all checks pass)
[ ] /metrics returns Prometheus format
[ ] Login works (test account)
[ ] Dashboard loads (basic employee can view)
```

### Functional Test (Before beta launch)

```
[ ] Payroll run end-to-end (sample 10 employees)
[ ] Attendance import + validation
[ ] Leave request approval workflow
[ ] Payslip generate + download
[ ] Report export (attendance, payroll)
[ ] MFA setup + login
[ ] API key authentication
```

### Performance Test (Before beta launch)

```
[ ] Load test: 100 concurrent users
[ ] Response time p95 < 1s
[ ] Error rate < 0.1%
[ ] Backup/restore < 4 hours
[ ] Failover recovery < 5 minutes (if applicable)
```

### Security Test (Before beta launch)

```
[ ] External penetration test (in progress)
[ ] File upload malware check
[ ] SQL injection attempt fails
[ ] Cross-tenant access attempt blocked
[ ] Rate limiting enforced (10k/day hard block)
[ ] Sensitive data redacted from logs
```

---

## Rollout Plan (Beta Launch)

```
PHASE 1: Soft Launch (10 customers)
  - Close monitoring 24/5
  - Daily check-ins
  - Rapid bug fix turnaround
  - Collect feedback
  
PHASE 2: Scale to 20-50 customers
  - Gradually increase load
  - Monitor performance metrics
  - Implement optimizations if needed
  - Increase support coverage (24/5 → 24/7 if needed)
  
PHASE 3: Public Launch (September)
  - Marketing campaign
  - Website SEO
  - Sales outreach
  - Support team fully staffed
```

---

*Last Updated: 19 Juli 2026 | Owner: Dozer | Status: Detailed Requirements Ready*
