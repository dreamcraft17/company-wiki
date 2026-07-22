# dnPeople — PRD v10.0
## Operations & Launch Readiness

**Versi:** 10.0  
**Owner:** Dozer (CEO + Tech Lead)  
**Tanggal:** 19 Juli 2026  
**Tujuan:** Siapkan produksi sebelum soft launch beta (target 1 Agustus 2026)  
**Status:** Code artefacts **implemented in repo** (Jul 2026); extended by **PRD v11.0**; SaaS accounts / DNS / external pen-test remain Conditional  
**Baseline:** Frozen — next PRD should extend [CURRENT-IMPLEMENTATION.md](../CURRENT-IMPLEMENTATION.md) § suggested scope (PRD v4 Module 3–8 + ops gates)

### Implementation status (repo)

| Area | In repo | Still ops/external |
|------|---------|-------------------|
| Core product (61 pages, 53 routes, 102 models) | ✅ | — |
| Backend tests | ✅ **32/32** | CI on every release |
| Session expired UX | ✅ global redirect `/login?reason=session_expired` | — |
| Metrics /health /ready /alive | ✅ enriched | Datadog agent + dashboards |
| Alert rules + runbooks | ✅ `ops/alerting`, `ops/runbooks` | PagerDuty account + on-call |
| Backup verify + restore drill scripts | ✅ | Signed drill on staging |
| Authenticated k6 loadtest | ✅ `scripts/loadtest/` | Run against staging at scale |
| Privacy export + legal templates | ✅ | Publish on dnpeople.id + counsel |
| Marketing `/welcome` | ✅ MVP landing | Domain + full GTM |
| Pen-test scope doc | ✅ | Engage firm |

---

## Executive Summary

**Status saat ini:**
- ✅ Core product DONE (**54** pages, **52** API routes, **101** models, **32/32** tests)
- ✅ Security fixes DONE (v8.0: P0/P1/P2 semua fixed)
- ✅ Acceptance wiring DONE (v9.0: tenant quota, password reset, billing, OpenAPI, docs)
- ✅ Ops artefacts DONE in repo (v10.0: metrics, backup scripts, k6, privacy, legal, `/welcome`)
- ✅ Docs baseline **frozen** for next PRD (22 Jul 2026)
- 🔴 **Blocking launch:** Infrastructure ops, testing, GTM tidak ready

**Yang perlu dilakukan minggu ini (19 Jul - 26 Jul):**

```
PRIORITY 1 (CRITICAL):
  [ ] Setup monitoring (Datadog/Prometheus)
  [ ] Setup alerting (PagerDuty)
  [ ] Backup/restore drill signed
  [ ] Load test authenticated (production data scale)
  
PRIORITY 2 (HIGH):
  [ ] External penetration test scheduled
  [ ] Website (dnpeople.id) design/template
  [ ] Support ticketing system setup
  [ ] Customer onboarding playbook
  
PRIORITY 3 (MEDIUM):
  [ ] Demo video production
  [ ] Case studies dari beta customers
  [ ] FAQ/knowledge base content
```

---

## Domain 1: Infrastructure Monitoring & Observability

### Requirement: Production Visibility

**Tujuan:** Ketika production launch, tim ops harus bisa:
1. Monitor uptime 24/7
2. Alert pada anomali (CPU, memory, error rate, latency)
3. Debug issues cepat (logs, traces, metrics)
4. Prove SLA 99.9%

### Checklist Implementasi

```
✅ Aplikasi expose metrics di /metrics (Prometheus format)
✅ Readiness check di /ready
✅ Health check di /health
❌ Datadog agent installed + metrics flowing
❌ Alert rules configured (critical + warning)
❌ PagerDuty integration (on-call rotation)
❌ Log aggregation (ELK atau Datadog)
❌ Trace sampling configured (Sentry atau Datadog)
```

### Datadog Setup Checklist

```
[ ] Datadog account created (paid tier for 30 days)
[ ] Agent installed di VPS production (docker run atau systemd)
[ ] Dashboards created:
    [ ] Application health (uptime, latency p95, error rate)
    [ ] Database (queries/sec, slow queries, connections)
    [ ] Infra (CPU, memory, disk, network)
    [ ] Billing (API calls per day, concurrent users)
[ ] Alert rules:
    [ ] API latency p95 > 2s (warning) > 5s (critical)
    [ ] Error rate > 1% (warning) > 5% (critical)
    [ ] Database connection pool near limit
    [ ] Disk usage > 80% (warning) > 90% (critical)
    [ ] Payment failures (critical)
    [ ] Security events (critical)
[ ] Notification channels:
    [ ] Slack #incidents
    [ ] PagerDuty for critical
    [ ] Email for warnings
```

### SLA Target

```
Uptime:          99.9% (8.76 hours downtime per year)
Response time:   p95 < 1 second
Error rate:      < 0.1%
Backup RPO:      < 1 hour
Database backup: Daily, tested weekly
```

---

## Domain 2: Backup & Disaster Recovery

### Requirement: Data Safety & Recovery

**Tujuan:** Jika terjadi:
- Database crash → restore dalam < 4 jam
- Corrupted data → rollback 1 jam sebelumnya
- Server down → failover ke standby

### Backup Architecture

```
Daily:
  - Full database backup (S3 atau cold storage)
  - Incremental backup (untuk fast recovery)
  - Backup verification log
  
Weekly:
  - Restore drill (test recover 1 minggu lalu)
  - Backup integrity check
  
Monthly:
  - Disaster recovery drill (full failover test)
  - Documented recovery time
```

### Checklist Implementasi

```
[ ] Backup script exist (scripts/backup-database.sh)
[ ] Backup runs daily at 02:00 UTC (off-peak)
[ ] Backup stored:
    [ ] S3 (AWS) atau equivalent
    [ ] Encrypted (KMS key rotation)
    [ ] Multi-region (disaster recovery)
[ ] Restore script tested:
    [ ] Can restore to point-in-time
    [ ] Can restore to different server
    [ ] Time to restore: < 4 hours documented
[ ] Backup verification:
    [ ] Automated integrity check
    [ ] Random sample restore test weekly
    [ ] Documented results in runbook
[ ] RPO/RTO signed:
    [ ] RPO: < 1 hour (commitment)
    [ ] RTO: < 4 hours (commitment)
    [ ] Document signed by Dozer (finance/compliance)
```

### Restore Drill Runbook

```
Scenario: Database corruption detected (08:00)
Timeline:
  08:00 - Alert: data inconsistency detected
  08:15 - Decision: restore from backup 07:00 (lose 1 hour data)
  08:20 - Begin restore process
  08:50 - Restore complete, verify data
  09:00 - Resume operations
  
Total RTO: 1 hour (target < 4 hours, achieved)
Data loss: 1 hour (RPO < 1 hour, acceptable)

Costs:
  - Lost transactions: ~50 payroll API calls
  - Manual reconciliation: ~30 min ops time
  - Customer notification: ~15 min
```

---

## Domain 3: Load Testing & Performance Validation

### Requirement: Handle Launch Volume

**Tujuan:** Jamin sistem handle:
- 100 concurrent users (soft launch)
- 1000 concurrent users (scale target Q4 2026)
- 10.000 API calls/day per customer (rate limit hard block)

### Load Test Plan

**Phase 1: Staging Load Test (minggu ini)**

```
Scenario: 100 concurrent users, 5 min ramp
  - 50% login/payroll read
  - 30% attendance create
  - 20% leave/claim actions

Target results:
  - p95 latency < 1 second
  - p99 latency < 2 seconds
  - Error rate < 0.1%
  - DB connection pool < 80%
  - No timeouts

Tool: k6 atau Apache JMeter
Data: Production-like scale (5000 employees, 3 years history)
```

**Phase 2: Ramp Test (before beta launch)**

```
Gradual increase:
  10 → 50 → 100 → 200 → 500 concurrent users
  
Each level hold 10 minutes
Monitor:
  - Where does latency spike?
  - DB connection pool usage
  - Memory growth
  - Cache hit rate
  
Find: Maximum sustainable load (MSL)
Document: Result + timestamp
```

### Checklist Implementasi

```
[ ] Test environment setup (staging identical to prod)
[ ] Test data seeding (5000 employees, 3 years payroll)
[ ] k6 atau JMeter scripts:
    [ ] Login → dashboard → payroll
    [ ] Attendance clock-in/out
    [ ] Leave request flow
    [ ] Payroll report export
    [ ] API integrations
[ ] Baseline run (establish control)
[ ] Load test 100 users (Phase 1)
  [ ] Results documented
  [ ] p95 < 1 second? → YES/NO
  [ ] Error rate < 0.1%? → YES/NO
  [ ] Bottleneck identified? → where?
[ ] Performance optimization (if needed)
  [ ] Database indexes review
  [ ] Query optimization
  [ ] Cache strategy
  [ ] Connection pooling
[ ] Retest after optimization
[ ] Ramp test 500 users (Phase 2)
[ ] Results signed by Dozer (engineering sign-off)
```

---

## Domain 4: Security Testing & Compliance

### Requirement: Penetration Test Scheduled

**Tujuan:** Validasi keamanan sebelum customer data masuk

### Penetration Test Scope

```
Timing: Minggu depan (call external firm hari ini)
Duration: 5-7 days
Coverage:
  [ ] Web application security (OWASP top 10)
  [ ] API security (injection, auth bypass, rate limiting)
  [ ] Data encryption (in-transit, at-rest)
  [ ] Access control (RBAC, row-level)
  [ ] Data isolation (multi-tenant)
  [ ] Session management (cookies, tokens)
  [ ] File upload (malware, XXE, etc)
  [ ] Business logic (payroll calculations, leave balance)

Deliverable:
  - Vulnerability report (critical/high/medium/low)
  - Remediation timeline
  - Re-test after fixes
  
Cost: IDR 50-100 juta (budget untuk 1 firm, 1 minggu)
```

### UU PDP Compliance Checklist

```
[ ] Privacy policy published (dnpeople.id)
[ ] Data retention policy set (default: 5 years)
[ ] Consent for data processing (signup/welcome email)
[ ] Employee data access logged (audit trail for sensitivity)
[ ] Data export available (GDPR-style `GET /data/export`)
[ ] Data deletion available (GDPR-style soft delete)
[ ] Encryption keys backed up + rotatable
[ ] Third-party processors listed (SMTP, S3, Sentry)
[ ] Security incident response plan documented
[ ] Data breach notification plan (< 72h)
[ ] DPA (Data Processing Agreement) template ready for customers
```

---

## Domain 5: Customer Support & Operations

### Requirement: Support Infrastructure Ready

**Tujuan:** Customer dapat request help, tim ops bisa handle 24/5

### Support Ticketing Setup

```
Platform: Helpscout atau Zendesk
[ ] Account created
[ ] Email alias: support@dnpeople.id
[ ] Incoming emails → auto-ticket
[ ] Ticket routing (product issue vs billing vs onboarding)
[ ] SLA: first response < 24 business hours
[ ] Knowledge base: 10+ FAQ articles
[ ] Automation: auto-reply on incoming
[ ] Email templates (response, resolution, escalation)
[ ] Team access (add support staff)
[ ] Escalation to Dozer for P0 issues
```

### Customer Onboarding Playbook

```
Day 1: Welcome
  - Send login credentials
  - Send onboarding guide (PDF)
  - Schedule setup call
  
Day 2-3: Setup Call (30-60 min)
  - Discuss org structure
  - Discuss payroll config
  - Discuss compliance needs (BPJS, PPh)
  - Answer questions
  
Day 4-7: Configuration
  - Import employee data (CSV atau manual)
  - Setup departments, positions, locations
  - Configure payroll (salary, allowances, deductions)
  - Configure leave (types, balances, policies)
  
Day 8-10: Testing
  - Test attendance (clock-in/out)
  - Test leave request flow
  - Run test payroll
  - Verify calculations
  
Day 11-14: Training
  - Admin training (30 min video + live Q&A)
  - Manager training (15 min video)
  - Employee training (email + FAQ)
  
Day 15: Go-live
  - Employee can access system
  - Support team on standby
  - 24-hour check-in call
```

### Training Materials

```
[ ] Admin Setup Guide (written, 10 pages)
[ ] Admin Training Video (recorded, 30 min)
[ ] Manager Guide (written, 5 pages)
[ ] Manager Training Video (recorded, 15 min)
[ ] Employee FAQ (written, 5 pages)
[ ] Employee Training Email (template)
[ ] Troubleshooting Guide (FAQ, 20+ articles)
    [ ] "Can't login"
    [ ] "How to request leave"
    [ ] "How to clock-in"
    [ ] "How to view payslip"
    [ ] "Attendance correction process"
    [ ] "Payroll questions"
```

---

## Domain 6: Website & Go-to-Market

### Requirement: dnpeople.id Live

**Tujuan:** Calon customer bisa lihat:
- Apa itu dnPeople?
- Berapa harganya?
- Bagaimana signup?
- Bagaimana support?

### Website Content Structure

```
Homepage:
  [ ] Hero section (tagline, screenshot, CTA)
  [ ] Features grid (6 main features with icons)
  [ ] Pricing section (5 tiers with comparison)
  [ ] FAQ accordion (15+ questions)
  [ ] Testimonials (use beta customers)
  [ ] Footer (contact, legal, social)

Pricing page:
  [ ] Tier comparison table
  [ ] Feature matrix per tier
  [ ] FAQ (billing questions)
  [ ] Contact sales button

Demo / Video:
  [ ] Product walkthrough (2-3 min)
  [ ] Features tour
  [ ] Customer success story (1 video)

Getting Started:
  [ ] Signup form
  [ ] Onboarding flow
  [ ] Setup wizard
  
Legal:
  [ ] Privacy Policy
  [ ] Terms of Service
  [ ] DPA (Data Processing Agreement)
```

### Website Launch Checklist

```
Week 1:
  [ ] Domain: dnpeople.id registered + SSL cert
  [ ] Website template selected (Next.js, Framer, atau Webflow)
  [ ] Content written (homepage, pricing, FAQ)
  [ ] Design (mobile responsive, brand colors)
  
Week 2:
  [ ] Build homepage + pricing page
  [ ] Setup email capture (Convertkit atau Mailchimp)
  [ ] Setup analytics (Google Analytics + Hotjar)
  [ ] Setup SEO (meta tags, Open Graph)
  
Week 3:
  [ ] Demo video recorded + uploaded
  [ ] Case study content (beta customer 1-2)
  [ ] FAQ page content complete
  [ ] Legal pages (privacy, terms, DPA)
  
Week 4:
  [ ] QA: responsive test (mobile, tablet, desktop)
  [ ] QA: form submission test (email delivery)
  [ ] QA: link check (no broken links)
  [ ] Setup monitoring (uptime alerts)
  [ ] Launch! 🚀
```

---

## Domain 7: Beta Customer Program

### Requirement: 10-20 Beta Customers Onboarded

**Tujuan:** Validate product + get testimonials + find bugs

### Beta Customer Selection

```
Target: 10-20 customers
Industry: SME (50-300 employees)
Location: Jakarta, Surabaya, Bandung (timezone support easy)
Profile:
  - Tech-savvy HR/Finance team
  - Willing to provide feedback
  - Willing to sign NDA
  - Willing to go live mid-August
  
Incentive:
  - 2-month free trial (normally IDR 5-10M)
  - Priority support
  - Feedback loop (weekly calls)
  - Testimonial feature on website
```

### Beta Launch Timeline

```
Week 1: Recruit
  [ ] List 30 candidate companies
  [ ] Send pitch emails
  [ ] Schedule discovery calls
  [ ] Close 10-20 deals
  [ ] Send NDA + beta agreement

Week 2-3: Onboard
  [ ] Onboarding call per customer (scripted 30 min)
  [ ] Employee data import
  [ ] Basic configuration
  [ ] User training (async video + live Q&A)
  
Week 4-5: Go-live + Support
  [ ] Employees start using system
  [ ] Support team on standby (8am-6pm)
  [ ] Collect feedback (daily check-ins)
  [ ] Bug tracking + fixes
  
Week 6-8: Gather Testimonials
  [ ] Record customer testimonials (video + written)
  [ ] Get permission to use on website
  [ ] Document success metrics (adoption, NPS)
```

### Success Metrics (Beta)

```
NPS target:        > 40 (good SaaS standard)
Adoption:          > 80% employees using system
Bug discovery:     < 5 critical, < 20 high
Customer feedback: 2+ feature requests identified
Testimonials:      3-5 quotes + 1-2 case studies
Support load:      < 10 tickets per customer/month
```

---

## Domain 8: Documentation & Knowledge Base

### Requirement: Self-Service Support Available

**Tujuan:** 70% customer questions answered dari docs (reduce support load)

### Documentation Structure

```
/docs/
  ├── USER-GUIDE.md (existing)
  ├── ADMIN-GUIDE.md (existing)
  ├── API.md (existing)
  ├── FAQ.md (20+ questions)
  ├── TROUBLESHOOTING.md
  ├── COMPLIANCE.md (BPJS, PPh, UU PDP)
  ├── INTEGRATIONS.md (API keys, webhooks)
  ├── SECURITY.md (password, MFA, SSO)
  └── VIDEOS/
      ├── getting-started.mp4
      ├── first-payroll.mp4
      ├── leave-request.mp4
      └── attendance.mp4
```

### FAQ Content (sample)

```
Account & Login:
  [ ] How do I reset my password?
  [ ] How do I enable 2FA?
  [ ] Can I have multiple accounts?
  
Employees & Organization:
  [ ] How do I add a new employee?
  [ ] How do I import employees from Excel?
  [ ] How do I change department structure?
  
Attendance:
  [ ] How do I clock in?
  [ ] What if I forget to clock out?
  [ ] How do I submit correction?
  
Leave & Permission:
  [ ] How do I request leave?
  [ ] How much leave do I have?
  [ ] How are leave balances calculated?
  
Payroll:
  [ ] When do I get paid?
  [ ] How do I view my payslip?
  [ ] How do I submit claims?
  [ ] How is salary calculated?
  
Compliance & Taxes:
  [ ] What is PPh 21?
  [ ] What is BPJS?
  [ ] What data does dnPeople store?
  
Billing:
  [ ] How much does dnPeople cost?
  [ ] Can I change my plan?
  [ ] Can I get a discount for annual?
  
Support:
  [ ] How do I contact support?
  [ ] What's the support SLA?
  [ ] How is my data protected?
```

---

## Critical Path: Next 7 Days (19-26 Jul)

```
DAY 1 (19 Jul, Hari Ini):
  [ ] Call Datadog + setup account (2h)
  [ ] Schedule penetration test firm (1h)
  [ ] Start website template selection (2h)
  [ ] Assign owner untuk setiap workstream
  
DAY 2-3 (20-21 Jul):
  [ ] Datadog agent installed + metrics live (4h)
  [ ] Backup/restore script verified (2h)
  [ ] Load test environment prepared (4h)
  
DAY 4-5 (22-23 Jul):
  [ ] Alert rules configured + tested (3h)
  [ ] Restore drill executed + signed (3h)
  [ ] Load test 100 users completed (4h)
  
DAY 6-7 (24-26 Jul):
  [ ] Penetration test started (ongoing)
  [ ] Website content drafted (8h)
  [ ] Support ticketing system ready (2h)
  [ ] Beta customer recruitment started (2h)
```

---

## Success Criteria (Launch Ready)

```
✅ Monitoring live + alerts working
✅ Backup restore drill passed + signed (RTO < 4h, RPO < 1h)
✅ Load test: 100 users, p95 < 1s, error < 0.1%
✅ Penetration test scheduled + in progress
✅ Website design complete (ready to build)
✅ Support ticketing system live
✅ Customer onboarding playbook documented
✅ Beta customer program kicked off (5+ signed)
✅ All team members trained + confident
```

---

*Last Updated: 19 Juli 2026 | Owner: Dozer | Status: Launch Readiness Planning*
