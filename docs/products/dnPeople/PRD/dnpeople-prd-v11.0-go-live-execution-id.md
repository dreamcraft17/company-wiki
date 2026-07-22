# dnPeople — PRD v11.0
## Go-Live Execution & Beta Launch (Final Sprint)

**Versi:** 11.0  
**Owner:** Dozer (CEO + Tech Lead)  
**Tanggal:** 22 Juli 2026  
**Target Launch:** 1 Agustus 2026 (10 hari)  
**Status:** **Implemented in repo** (22 Jul 2026); external ops gates Conditional until 1 Aug 2026 launch

---

## Executive Summary

**Status saat ini:**
- ✅ **Code v11.0 complete** (61 pages frontend, 53 API routes, 102 models, tests passing 32/32)
- ✅ **Marketing site + lead capture** in repo
- ✅ **k6 load suite + launch runbooks** in repo
- 🔴 **Ops execution Conditional** (Datadog live, pen-test sign-off, DNS, beta UAT)

**Critical path ini minggu:**
```
22-23 Jul: Datadog + restore drill signed
24-26 Jul: Penetration test IN PROGRESS
27-29 Jul: Website LIVE + beta customers onboarded
30-31 Jul: Final QA + bug fixes
01 Aug:    BETA LAUNCH 🚀
```

**Success = launch with < 5 critical bugs + NPS > 40**

---

## Workstream 1: Infrastructure Validation (Datadog/PagerDuty)

### Target: Production Monitoring Live (by 24 Jul)

**Owner:** DevOps Engineer  
**Deadline:** 24 Juli 2026

```
Day 1 (22 Jul):
  [ ] Datadog account created + paid tier
  [ ] API key obtained
  [ ] Agent installation planned (Docker vs systemd)

Day 2 (23 Jul):
  [ ] Agent installed on production VPS
  [ ] Metrics flowing into Datadog
  [ ] Dashboards created (6 main metrics)
  [ ] Alert rules configured (5 rules minimum)

Day 3 (24 Jul):
  [ ] PagerDuty account + integration tested
  [ ] On-call schedule active
  [ ] Test alert fired + notification verified
  [ ] SLA docs signed (99.9%, p95 < 1s)
```

**Metrics to track (minimum):**
```
1. API Response Time (p95 < 1000ms target)
2. Error Rate (< 0.1% target)
3. Database Connections (< 80% pool)
4. Server CPU (< 80% usage)
5. Payroll Queue (pending jobs)
6. Payment Success Rate (> 99%)
```

**Verification checklist:**
```
[ ] /metrics endpoint returns Prometheus format
[ ] Datadog scrapes successfully every 10s
[ ] Dashboard shows live data (all 6 metrics)
[ ] At least 2 alerts fire correctly + PagerDuty notifies
[ ] Alert does NOT fire on false positives
[ ] On-call rotation schedule active
[ ] Escalation tested (primary → backup after 15 min)
```

---

## Workstream 2: Backup & Disaster Recovery (Signed)

### Target: Restore Drill Passed & Signed (by 25 Jul)

**Owner:** DevOps / Database Admin  
**Deadline:** 25 Juli 2026

```
Day 1 (22 Jul):
  [ ] Backup script verified (daily at 02:00 UTC)
  [ ] S3 backups checked (> 100MB each)
  [ ] Backup encryption working (KMS)

Day 2 (23 Jul):
  [ ] Restore script tested on staging
  [ ] Can restore from latest backup (< 4 hours)
  [ ] Data integrity verified (SELECT COUNT(*) checks)
  [ ] Application connects to restored DB

Day 3 (24 Jul):
  [ ] Restore drill runbook documented
  [ ] RPO/RTO validated (< 1h RPO, < 4h RTO)
  [ ] Signed by Dozer (commitment)
  [ ] Documented in operations manual
```

**Verification checklist:**
```
[ ] Latest backup file exists on S3
[ ] Backup file > 100MB (not suspiciously small)
[ ] Backup encrypted + checksum verified
[ ] Restore script executable + tested
[ ] Restore time documented (must be < 4 hours)
[ ] Data integrity check results saved
[ ] Application tested with restored DB
[ ] No data corruption detected
[ ] Runbook updated + shared with team
[ ] RPO/RTO signed by Dozer + Finance
```

**Runbook contents:**
```
Title: Database Restore Procedure

Scenario: Production DB corrupted or deleted

Step 1: Alert received
  - Datadog alert: database anomaly
  - Decision: restore from backup X hours ago

Step 2: Prepare staging
  - SSH to staging server
  - Stop web application (prevent writes)
  - Kill existing DB connections

Step 3: Execute restore
  - Run: ./scripts/restore-database.sh s3://backup-file.sql.gz
  - Verify: SELECT COUNT(*) FROM employees; (should match prod count)
  - Verify: SELECT COUNT(*) FROM payslip; (should match prod count)

Step 4: Verify application
  - SSH to staging app server
  - curl http://localhost:3000/health → 200 OK
  - curl http://localhost:3000/ready → all checks pass

Step 5: Decision
  - If staging OK: failover to staging (or restore to prod)
  - If staging failed: escalate to Dozer

Expected timeline:
  - Restore script execution: 30-120 min (depending on backup size)
  - Verification: 10 min
  - Failover decision: 10 min
  - Total: < 4 hours
```

---

## Workstream 3: Security Validation (Penetration Test)

### Target: Pen-test In Progress (by 24 Jul) + Findings Resolved (by 31 Jul)

**Owner:** Security / Compliance  
**Deadline:** 31 Juli 2026

```
Day 1 (22 Jul):
  [ ] Penetration test firm ENGAGED
  [ ] Contract signed + testing window confirmed (24-28 Jul)
  [ ] Staging environment prepped + test account ready
  [ ] Monitoring silenced for testing window

Days 2-5 (23-26 Jul):
  [ ] Pen-testing in progress (5 days)
  [ ] Daily summary calls with pen-test team
  [ ] Critical findings reported immediately
  [ ] Preliminary report due 27 Jul

Days 6-7 (27-28 Jul):
  [ ] Final report received + findings reviewed
  [ ] Critical/high findings prioritized
  [ ] Remediation plan created

Days 8-9 (29-30 Jul):
  [ ] Critical fixes implemented + tested
  [ ] Re-test of fixed vulnerabilities
  [ ] Compliance checklist completed
```

**Pen-test scope (final):**
```
Coverage:
  - OWASP Top 10 (injection, auth, access control, etc)
  - Data isolation (multi-tenant)
  - Business logic (payroll calculations)
  - Session management (JWT, cookies)
  - File upload (malware, XXE)
  - API security (rate limiting, auth)
  - Encryption (in-transit, at-rest)

Deliverable (28 Jul):
  - Vulnerability report (CVSS scoring)
  - Proof of concept (if applicable)
  - Remediation timeline
  - Re-test plan
```

**Verification checklist:**
```
[ ] Pen-test firm engaged + contract signed
[ ] Testing window scheduled (24-28 Jul)
[ ] Staging environment ready for testing
[ ] Test account provided to pen-testers
[ ] Monitoring alerts silenced for window
[ ] Escalation contact provided (Dozer phone)
[ ] Daily check-in calls scheduled
[ ] Critical findings reported < 4 hours
[ ] Final report delivered 28 Jul
[ ] Critical findings < 5 total
[ ] High findings < 15 total
[ ] All critical issues remediated by 30 Jul
[ ] Re-test completed (no regression)
```

---

## Workstream 4: Load Testing & Performance (Final Validation)

### Target: Load Test Passed (by 26 Jul)

**Owner:** QA / Performance Engineer  
**Deadline:** 26 Juli 2026

```
Day 1-2 (22-23 Jul):
  [ ] Test environment prepared (staging identical to prod)
  [ ] Test data seeded (5000 employees, 3 years history)
  [ ] k6 scripts ready (baseline + ramp + spike)

Day 3 (24 Jul):
  [ ] Baseline run: 100 concurrent users
    [ ] p95 latency < 1000ms achieved
    [ ] Error rate < 0.1%
    [ ] Results documented

Day 4 (25 Jul):
  [ ] Ramp test: 100 → 500 concurrent users
    [ ] Gradual increase (100 → 200 → 300 → 400 → 500)
    [ ] MSL (maximum sustainable load) identified
    [ ] Bottlenecks documented
    [ ] Optimization recommendations made

Day 5 (26 Jul):
  [ ] Spike test: 100 → 300 concurrent instantly
    [ ] System survives without crash
    [ ] Recovery time < 2 minutes
    [ ] Results documented + approved
```

**Verification checklist:**
```
[ ] Test environment specs match production
[ ] Test data > 5000 employees + 3 years history
[ ] k6 scripts cover 5+ user journeys (login, payroll, attendance, leave, etc)
[ ] Baseline: p95 latency < 1000ms
[ ] Baseline: error rate < 0.1%
[ ] Baseline: 0 timeout errors
[ ] Ramp test: latency increase < 20% per level
[ ] Ramp test: MSL identified (e.g., 400 users max before degradation)
[ ] Spike test: no cascade failure
[ ] Spike test: p95 spike < 5 seconds
[ ] Results exported + saved for reference
[ ] Dozer reviewed + approved test results
```

---

## Workstream 5: Website & Go-to-Market (Live)

### Target: dnpeople.id Live (by 28 Jul)

**Owner:** Marketing / Designer + Developer  
**Deadline:** 28 Juli 2026

```
Day 1 (22 Jul):
  [ ] Domain registered + DNS configured
  [ ] Website template selected (Framer, Webflow, atau Next.js)
  [ ] Content outline approved by Dozer

Day 2-3 (23-24 Jul):
  [ ] Homepage draft complete
    [ ] Hero section + CTA
    [ ] Features grid (6 main features)
    [ ] Pricing table (5 tiers)
    [ ] FAQ (15+ questions)
  [ ] Pricing page content written
  [ ] Demo video script finalized

Day 4 (25 Jul):
  [ ] Homepage & pricing pages built + styled
  [ ] Demo video recorded (2-3 min)
  [ ] Testimonials drafted (use beta customers)
  [ ] Legal pages (privacy, terms, DPA)

Day 5 (26 Jul):
  [ ] Blog articles published (3+ posts)
  [ ] FAQ fully indexed
  [ ] All links tested (no broken links)
  [ ] Mobile responsive verified

Day 6 (27 Jul):
  [ ] SEO optimization (meta tags, Open Graph)
  [ ] Google Analytics + search console setup
  [ ] Email capture form working (Convertkit/Mailchimp)
  [ ] Launch in staging for final QA

Day 7 (28 Jul):
  [ ] DNS cutover to production
  [ ] SSL certificate verified
  [ ] Website LIVE + monitoring
  [ ] Uptime alerts active
```

**Website checklist:**
```
Pages:
  [ ] Homepage (hero, features, pricing, FAQ, CTA)
  [ ] Pricing page (tier comparison, feature matrix)
  [ ] Getting started (signup flow)
  [ ] Demo (video embedded)
  [ ] FAQ (20+ questions, searchable)
  [ ] Blog (3+ launch posts)
  [ ] Privacy policy (UU PDP compliant)
  [ ] Terms of service
  [ ] Contact page
  [ ] About us

Technical:
  [ ] Mobile responsive (tested on iPhone + Android)
  [ ] Desktop view (tested on laptop + tablet)
  [ ] All forms functional (email capture, contact, signup)
  [ ] Email delivery working (test signup)
  [ ] Google Analytics tracking
  [ ] Meta tags correct (title, description)
  [ ] Open Graph (social preview)
  [ ] Favicon + branding
  [ ] SSL/TLS valid (green lock)
  [ ] Performance (Lighthouse > 90)
  [ ] Uptime monitoring active
```

---

## Workstream 6: Beta Customer Onboarding (10-20 Customers)

### Target: First 5 Customers Onboarded (by 28 Jul) + Full Cohort (by 31 Jul)

**Owner:** Sales / Customer Success  
**Deadline:** 31 Juli 2026

```
Recruitment (22-24 Jul):
  [ ] Target list: 30 companies (50-300 employees, Jakarta area)
  [ ] Pitch emails sent (5+ per day)
  [ ] Initial calls scheduled
  [ ] Deals closed: target 10-20 customers
  [ ] NDA + beta agreement signed

Onboarding (25-28 Jul):
  [ ] Customer call 1: discovery (30 min)
    [ ] Understand org structure
    [ ] Discuss payroll config
    [ ] Answer questions
  
  [ ] Customer call 2: setup (1 hour)
    [ ] Import employee data (CSV or manual)
    [ ] Configure departments, positions, locations
    [ ] Configure payroll (salary, allowances)
    [ ] Configure leave types + balance
  
  [ ] Customer call 3: training (1 hour)
    [ ] Admin walkthrough
    [ ] Manager training
    [ ] Employee training
    [ ] Go-live prep

  [ ] System access provided (login credentials)
  [ ] Support contact shared (email + phone)

Go-live (29-31 Jul):
  [ ] Employees start using system
  [ ] Daily check-ins (team available 8am-6pm Jakarta time)
  [ ] Feedback collected
  [ ] Bug tracking + fixes
  [ ] Success metrics tracked (adoption, NPS)
```

**Customer success metrics (target):**
```
NPS (after 1 week):           > 40 (good SaaS standard)
Adoption (employee usage):    > 80% (employees using)
Critical bugs:                < 5 (found + documented)
High bugs:                    < 20 (found + documented)
Support satisfaction:         > 4/5 stars
Customer feedback:            3+ feature requests identified
```

**Onboarding playbook checklist:**
```
[ ] Pre-call: send welcome email + setup agenda
[ ] Call 1: org structure documented in notes
[ ] Between calls: send training videos
[ ] Call 2: payroll config confirmed
[ ] Between calls: import employee data
[ ] Call 3: all staff trained
[ ] After call: send follow-up checklist
[ ] Day 1: admin logs in + confirms access
[ ] Daily: team available for support
[ ] Day 3: check-in call (how's it going?)
[ ] Day 7: NPS survey
[ ] Day 14: retrospective call + collect feedback
```

---

## Workstream 7: Final QA & Bug Fixes

### Target: Zero P0 Bugs at Launch (by 31 Jul)

**Owner:** QA / Testing  
**Deadline:** 31 Juli 2026

```
Daily (22-31 Jul):
  [ ] Regression test suite run (all 32 tests pass)
  [ ] Smoke test run (health, login, payroll, attendance)
  [ ] Bug tracking + triaging
  [ ] Critical bugs fixed same day
  [ ] High bugs fixed within 24 hours

End-to-end flows tested:
  [ ] New customer signup → company creation → admin login
  [ ] Add 10 employees via CSV import
  [ ] Employee login → view dashboard
  [ ] Attendance: clock in/out (manual + GPS)
  [ ] Leave: request → manager approval → payslip deduction
  [ ] Payroll: run → finalize → payslip download
  [ ] Reports: generate + export (Excel + PDF)
  [ ] API: key creation + scope enforcement
  [ ] Integrations: webhook test
  [ ] Audit: trail verification
  [ ] Mobile: responsive design verified (iPhone + Android)
```

**Bug resolution priority:**
```
P0 (Critical):    Fixed same day, can't launch with this
P1 (High):        Fixed within 24 hours
P2 (Medium):      Fixed within 3 days
P3 (Low):         Fixed after launch (nice-to-have)

Launch gate:
  [ ] Zero P0 bugs
  [ ] < 5 P1 bugs (deferred to patch 1.0.1)
```

---

## Workstream 8: Operations Runbook & Support

### Target: Support Team Trained (by 29 Jul)

**Owner:** Operations / Support Lead  
**Deadline:** 29 Juli 2026

```
Day 1 (22 Jul):
  [ ] Ticketing system live (Helpscout/Zendesk)
  [ ] Support email monitored (support@dnpeople.id)
  [ ] Support team trained on product

Day 2-3 (23-24 Jul):
  [ ] Customer onboarding playbook finalized
  [ ] Training materials reviewed
  [ ] FAQ (20+ articles) accessible to customers

Day 4 (25 Jul):
  [ ] Incident response procedure documented
  [ ] Escalation contacts listed
  [ ] On-call schedule confirmed

Day 5 (26 Jul):
  [ ] SLA published (first response 24h, critical < 1h)
  [ ] Support metrics dashboard setup
  [ ] Team confidence validated (role-play scenarios)

Day 6 (27 Jul):
  [ ] Operations manual finalized
  [ ] Runbooks for common issues
  [ ] Monitoring dashboard shared

Day 7 (28 Jul):
  [ ] Support team ready for beta
  [ ] Contact info published on website
```

**Support checklist:**
```
[ ] Ticketing system configured
[ ] Support email active (forward to ticketing)
[ ] Response template created
[ ] FAQ searchable on website
[ ] Onboarding playbook shared with team
[ ] Training videos linked in tickets
[ ] Incident contact (Dozer) documented
[ ] SLA published + communicated
[ ] Team trained + role-play completed
```

---

## Workstream 9: Post-Launch Metrics & Success Tracking

### Target: Metrics Dashboard Live (by 31 Jul)

**Owner:** Analytics / Product  
**Deadline:** 31 Juli 2026

```
Metrics to track:
  [ ] Daily active users (DAU)
  [ ] Employee adoption rate (% logged in)
  [ ] Feature usage (payroll, leave, attendance, reports)
  [ ] API calls per day (track billing)
  [ ] Performance metrics (p95 latency, error rate)
  [ ] Customer support tickets + resolution time
  [ ] NPS score + feedback
  [ ] Churn/retention
  [ ] System availability (uptime %)
```

**Dashboard setup:**
```
[ ] Google Analytics + custom events
[ ] Datadog dashboards (product metrics)
[ ] Helpscout/Zendesk dashboard (support metrics)
[ ] Spreadsheet for manual metrics (NPS, feedback)
[ ] Weekly report prepared (every Monday)
```

**Success criteria (after 2 weeks):**
```
✅ NPS > 40 (good SaaS)
✅ Adoption > 80% (employees using)
✅ Critical bugs < 5 (found + tracked)
✅ Uptime > 99.9% (SLA met)
✅ Support satisfaction > 4/5
✅ Feature adoption visible (payroll #1, leave #2, etc)
✅ Zero security incidents
✅ Zero data loss events
```

---

## Critical Path: Next 10 Days

```
DAY 1 (22 Jul, TODAY):
  [ ] Assign owner to each workstream (9 total)
  [ ] Call Datadog + setup account (2h)
  [ ] Call penetration test firm + sign contract (1h)
  [ ] Review backup/restore scripts (1h)
  [ ] Kick off website build (2h)
  [ ] Recruit first batch beta customers (2h)
  → Team sync: 4pm Jakarta time

DAY 2-3 (23-24 Jul):
  [ ] Datadog agent installed + metrics live (4h)
  [ ] Load test baseline completed (4h)
  [ ] Website homepage draft done (8h)
  [ ] Penetration test starts (monitoring)
  [ ] First 3 beta customers on-boarded

DAY 4-5 (25-26 Jul):
  [ ] Restore drill executed + signed (3h)
  [ ] Load test ramp completed (4h)
  [ ] Website live on staging (4h)
  [ ] Pen-test mid-week update call (1h)
  [ ] 5-10 more beta customers on-boarded

DAY 6-7 (27-28 Jul):
  [ ] Website goes LIVE (dnpeople.id)
  [ ] PagerDuty + alert testing (2h)
  [ ] Pen-test report received (review 2h)
  [ ] 10-20 beta customers active
  [ ] Website traffic monitoring

DAY 8-9 (29-30 Jul):
  [ ] Pen-test critical issues fixed
  [ ] Load test spike/stress completed
  [ ] All workstreams in final verification
  [ ] Final UAT + bug fixes

DAY 10 (31 Jul):
  [ ] Code freeze + final checks
  [ ] All systems green
  [ ] Team ready to launch
  → Pre-launch meeting: 10am Jakarta time

DAY 11 (01 Aug):
  [ ] BETA LAUNCH 🚀
  [ ] 10-20 customers active
  [ ] Team on standby 8am-6pm
  [ ] Monitor metrics closely
```

---

## Success Criteria (Launch)

```
✅ Datadog monitoring live + alerts working
✅ Backup/restore drill passed & signed (RTO < 4h, RPO < 1h)
✅ Load test: 100 users, p95 < 1s, error < 0.1% PASSED
✅ Penetration test: < 5 critical findings, all fixed
✅ Website live (dnpeople.id)
✅ Support ticketing operational
✅ 10-20 beta customers onboarded + active
✅ Zero P0 bugs in code
✅ Team trained + confident
✅ Operations runbook complete
✅ Metrics dashboard live & monitoring

TARGET METRICS (after 2 weeks):
  NPS > 40 ✓
  Adoption > 80% ✓
  Uptime 99.9% ✓
  p95 latency < 1s ✓
  Error rate < 0.1% ✓
```

---

## Risks & Contingencies

```
Risk 1: Datadog setup delayed
  → Contingency: manual monitoring + email alerts (temporary)
  → Mitigation: start today, not tomorrow

Risk 2: Pen-test finds 10+ critical issues
  → Contingency: extend launch by 1 week
  → Mitigation: proactive security review before pen-test

Risk 3: Load test fails (p95 > 2s)
  → Contingency: optimize database queries + add indexes
  → Mitigation: spare 1-2 days in timeline

Risk 4: Website not ready by 28 Jul
  → Contingency: launch MVP landing page only (pricing + FAQ)
  → Mitigation: prioritize homepage + pricing page first

Risk 5: Beta customers can't onboard in time
  → Contingency: reduce to 5 customers, still proceed
  → Mitigation: start recruitment this week, not next
```

---

## Ownership & Accountability

| Workstream | Owner | Accountability |
|------------|-------|-----------------|
| 1. Datadog/PagerDuty | DevOps | Monitoring live by 24 Jul |
| 2. Backup/Restore | DB Admin | Drill passed + signed by 25 Jul |
| 3. Penetration Test | Security | Report received + critical fixed by 30 Jul |
| 4. Load Test | QA/Perf | Test passed + p95 < 1s by 26 Jul |
| 5. Website | Marketing/Dev | Live by 28 Jul |
| 6. Beta Onboarding | Sales/CS | 10-20 customers active by 31 Jul |
| 7. QA/Bug Fixes | QA Lead | Zero P0 bugs by 31 Jul |
| 8. Support/Runbook | Ops Lead | Team trained + ready by 29 Jul |
| 9. Metrics | Analytics | Dashboard live + tracking by 31 Jul |
| **Overall** | **Dozer** | **Launch decision 01 Aug** |

---

*Last Updated: 22 Juli 2026 | Owner: Dozer | Status: Execution Phase Begins*
