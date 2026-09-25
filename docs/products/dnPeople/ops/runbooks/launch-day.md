---
owner: Dozer
status: conditional
canonical: true
last_reviewed: 2026-09-15
review_cadence: per-release
---

# Launch Day Procedure — 1 Agustus 2026 (PRD v11.0)

## Steps

### Step 1: Complete the launch readiness sync
- Owner: Dozer
- Duration: 30 minutes
- Success: launch ticket fields set to `monitoring=green`, `backup=verified`, and `p0_bugs=0`
- Failure: any readiness field is not set to the required value
- Rollback: set launch decision to `hold` and do not open customer access
- Escalation: Dozer

### Step 2: Send customer communications
- Owner: Support lead (Dozer accountable)
- Duration: 30 minutes
- Success: go-live email log line reports sent and support contact page returns HTTP 200
- Failure: email delivery failure or support page returns HTTP 5xx
- Rollback: retract the announcement draft and keep launch status = `hold`
- Escalation: Dozer

### Step 3: Publish the announcement
- Owner: Dozer
- Duration: 30 minutes
- Success: blog post status = `published` and homepage beta banner is visible
- Failure: blog status != `published` or homepage check fails
- Rollback: unpublish the post and remove the banner
- Escalation: Dozer

### Step 4: Open launch monitoring
- Owner: production on-call rotation (PagerDuty: dnpeople-production)
- Duration: 8 hours
- Success: monitoring dashboard records p95, error rate, and payment-webhook events with no P0 alert
- Failure: P0 alert fires or required metric is unavailable
- Rollback: pause new customer access and follow the relevant incident runbook
- Escalation: Dozer

### Step 5: Complete launch check-ins
- Owner: Dozer
- Duration: 15 minutes per check-in
- Success: launch ticket state = `check-in-complete` with DAU, adoption, tickets, and NPS fields recorded
- Failure: a required metric is missing or ticket state != `check-in-complete`
- Rollback: keep support standby active and defer the next launch phase
- Escalation: Dozer
