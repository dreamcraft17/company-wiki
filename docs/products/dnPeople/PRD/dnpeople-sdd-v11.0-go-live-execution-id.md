# dnPeople — SDD v11.0
## Go-Live Execution - Technical Implementation Guide

**Versi:** 11.0  
**Tanggal:** 22 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Implemented in repo (22 Jul 2026); external ops Conditional

---

## Quick Start: Today's Action Items (22 Jul)

```bash
# URGENT (Do this TODAY):

# 1. Call Datadog (sales team)
# URL: https://www.datadoghq.com/
# Budget: $300-500/month for 3 months trial
# Action: Create trial account, get API key

# 2. Call penetration test firm
# Firms: Ethical Hackers Indonesia, Hacktiv8, SevurityPlatform
# Scope: 5 days (24-28 Jul), report 28 Jul
# Cost: IDR 50-100 juta (negotiate)
# Action: Sign contract, arrange staging access

# 3. Setup S3 backup verification (if not already)
# AWS S3 bucket: dnpeople-backups
# Verify: Latest backup > 100MB + recent timestamp
# Action: Run backup script manually + verify

# 4. Start website build
# Assign: 1 designer + 1 developer
# Tools: Framer, Webflow, atau Next.js
# Content: Homepage, pricing, FAQ, demo video section
# Action: Content review with Dozer by EOD

# 5. Beta customer outreach
# Assign: Sales/BD person
# Target: 30 companies, close 10-20 deals
# Script: "We're launching HR software, need 10-20 beta customers for launch"
# Action: First 5 pitch emails sent today
```

---

## Workstream 1: Datadog Monitoring Setup (Detailed)

### Step 1: Create Trial Account

```
1. Go to https://www.datadoghq.com/free-datadog-trial/
2. Sign up for free trial (14 days, then paid)
3. Region: Asia-Pacific (Singapore) for latency
4. Tier: Pro (needed for Prometheus scraping + PagerDuty integration)
5. Create account → you'll receive API key + app key
```

### Step 2: Install Agent (Choose One)

**Option A: Docker (if using Docker Compose)**

```yaml
# docker-compose.yml

services:
  datadog:
    image: datadog/agent:latest
    env_file: .env.datadog
    environment:
      - DD_AGENT_VERSION=latest
      - DD_SITE=datadoghq.eu  # Change to datadoghq.com if US
      - DD_LOGS_ENABLED=true
      - DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /proc/:/host/proc/:ro
      - /sys/fs/cgroup/:/host/sys/fs/cgroup:ro
    ports:
      - "8125:8125/udp"  # StatsD port
      - "8126:8126/tcp"  # Trace collection port
    labels:
      com.datadoghq.ad.check_names: '["prometheus"]'
      com.datadoghq.ad.init_configs: '[{}]'
      com.datadoghq.ad.instances: |
        [
          {
            "prometheus_url": "http://web:3000/metrics",
            "namespace": "dnpeople",
            "metrics": ["*"]
          }
        ]
    restart: always
```

**.env.datadog (create this file):**

```
DD_API_KEY=your_api_key_from_datadog_here
DD_APP_KEY=your_app_key_from_datadog_here
DD_HOSTNAME=dnpeople-production
DD_ENV=production
DD_SERVICE=dnpeople
```

**Start:**

```bash
docker-compose up -d datadog
docker logs datadog  # Wait for "Datadog Agent Ready"
```

---

**Option B: Linux VPS (systemd)**

```bash
#!/bin/bash
# install-datadog-agent.sh

# Add Datadog repo
echo "deb https://apt.datadoghq.com/ stable 7" | sudo tee /etc/apt/sources.list.d/datadog.list > /dev/null
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys A2923DFF56EF722938FDD6923C6559CD5B5F4B4A

# Install agent
sudo apt-get update
sudo apt-get install -y datadog-agent

# Configure API key
sudo sed -i 's/# api_key:.*/api_key: YOUR_API_KEY_HERE/' /etc/datadog-agent/datadog.yaml

# Configure hostname
sudo sed -i 's/# hostname:.*/hostname: dnpeople-production/' /etc/datadog-agent/datadog.yaml

# Configure environment
sudo sed -i 's/# env:.*/env: production/' /etc/datadog-agent/datadog.yaml

# Enable Prometheus check
sudo mkdir -p /etc/datadog-agent/conf.d/prometheus.d

sudo cat > /etc/datadog-agent/conf.d/prometheus.d/conf.yaml << 'EOF'
init_config:

instances:
  - prometheus_url: http://localhost:3000/metrics
    namespace: "dnpeople"
    metrics:
      - '*'
    tags:
      - "env:production"
      - "service:dnpeople"
EOF

# Start agent
sudo systemctl restart datadog-agent

# Verify
sudo datadog-agent status

# Check logs
tail -f /var/log/datadog/agent.log
```

### Step 3: Verify Metrics Flowing

```bash
# Check if backend exposes metrics
curl http://localhost:3000/metrics | head -20

# Expected output:
# # HELP http_requests_total Total HTTP requests
# # TYPE http_requests_total counter
# http_requests_total{method="GET",status="200"} 12345

# Wait 2-5 minutes, then check Datadog UI:
# Dashboards → Metrics Explorer → search "http_requests"
# You should see data points
```

### Step 4: Create Datadog Dashboards

Go to Datadog UI: **Dashboards → Create Dashboard**

**Dashboard 1: Application Health**

```
Title: "dnPeople - Application Health"

Widgets:
  1. Timeseries: http_request_duration (p95)
     Query: avg:http.requests.duration{quantile:0.95}
     Label: "API Response Time (p95)"
     Yaxis: 0-5000ms
  
  2. Gauge: Request Rate
     Query: rate(http_requests_total[5m])
     Threshold: critical 0, warning 0
  
  3. Number: Error Rate (24h)
     Query: sum(increase(http_requests_errors_total[24h])) / sum(increase(http_requests_total[24h])) * 100
     Threshold: critical 5%, warning 1%
  
  4. Timeseries: Success Rate
     Query: 1 - (rate(http_requests_errors_total[5m]) / rate(http_requests_total[5m]))
     Label: "Success Rate %"
```

**Dashboard 2: Database**

```
Title: "dnPeople - Database"

Widgets:
  1. Timeseries: Connections
     Query: postgresql_stat_activity_count
     Label: "Active DB Connections"
  
  2. Timeseries: Slow Queries
     Query: rate(postgresql_slow_queries_total[5m])
     Label: "Slow Queries/sec"
  
  3. Number: Current Connections
     Query: max(postgresql_stat_activity_count)
     Threshold: critical 90, warning 80
```

**Dashboard 3: Server Resources**

```
Title: "dnPeople - Server Resources"

Widgets:
  1. Timeseries: CPU Usage
     Query: avg(system.cpu.user{*})
     Label: "CPU Usage %"
  
  2. Timeseries: Memory
     Query: avg(system.mem.pct_usable{*})
     Label: "Memory Available %"
  
  3. Timeseries: Disk
     Query: avg(system.disk.in_use{*})
     Label: "Disk Usage %"
```

### Step 5: Create Alert Rules

**Alert 1: High Latency**

```
Metric: avg:http.requests.duration{quantile:0.95}
Condition: When average >= 2000 for the last 5 minutes
Severity: CRITICAL
Notification: @pagerduty-dnpeople-production

Message: 🚨 API latency critical: P95 is {{ value }}ms (target <1000ms)
  Runbook: https://docs.dnpeople.id/incidents/high-latency.md
  Dashboard: https://app.datadoghq.com/dashboards/...
```

**Alert 2: High Error Rate**

```
Metric: rate(http_requests_errors_total[5m]) / rate(http_requests_total[5m]) * 100
Condition: When average >= 5 for the last 5 minutes
Severity: CRITICAL
Notification: @pagerduty-dnpeople-production

Message: 🚨 Error rate critical: {{ value }}% (target <0.1%)
```

**Alert 3: Database Connection Pool**

```
Metric: postgresql_stat_activity_count
Condition: When maximum >= 90 for the last 3 minutes
Severity: WARNING
Notification: @pagerduty-dnpeople-production

Message: ⚠️ DB connection pool near limit: {{ value }}/100 connections
```

**Alert 4: Disk Space**

```
Metric: avg(system.disk.in_use{*})
Condition: When average >= 90 for the last 5 minutes
Severity: CRITICAL
Notification: @pagerduty-dnpeople-production

Message: 🚨 Disk usage critical: {{ value }}% full
  Action: Check /var, /home, /opt for large files
```

**Alert 5: Payment Webhook Failure**

```
Metric: rate(payment_webhook_errors_total[1h])
Condition: When sum >= 5 for the last 1 hour
Severity: CRITICAL
Notification: @pagerduty-dnpeople-production

Message: 🚨 Payment webhook failures: {{ value }}/hour
  Impact: Billing may be delayed
```

---

## Workstream 2: Backup & Restore Scripts

### Backup Script (Daily at 02:00 UTC)

```bash
#!/bin/bash
# scripts/backup-database.sh

set -euo pipefail

BACKUP_DIR="/backups/postgresql"
S3_BUCKET="s3://dnpeople-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/dnpeople_$TIMESTAMP.sql.gz"
LOG_FILE="/var/log/dnpeople-backup.log"

# Create backup directory
mkdir -p $BACKUP_DIR

# Log start
echo "[$(date)] Starting backup..." >> $LOG_FILE

# Create backup
pg_dump \
  -h ${DB_HOST:-localhost} \
  -U ${DB_USER:-postgres} \
  -d ${DB_NAME:-dnpeople} \
  --format=custom \
  --verbose \
  | gzip > $BACKUP_FILE

BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
echo "[$(date)] Backup completed: $BACKUP_FILE ($BACKUP_SIZE)" >> $LOG_FILE

# Calculate checksum
md5sum $BACKUP_FILE > ${BACKUP_FILE}.md5
echo "[$(date)] Checksum: $(cat ${BACKUP_FILE}.md5)" >> $LOG_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE $S3_BUCKET/ --sse AES256
aws s3 cp ${BACKUP_FILE}.md5 $S3_BUCKET/ --sse AES256
echo "[$(date)] Uploaded to S3" >> $LOG_FILE

# Backup verification
if [ -f "${BACKUP_FILE}.md5" ]; then
  md5sum -c "${BACKUP_FILE}.md5" > /dev/null 2>&1 && {
    echo "[$(date)] Verification PASSED" >> $LOG_FILE
  } || {
    echo "[$(date)] Verification FAILED!" >> $LOG_FILE
    echo "Backup verification failed for $BACKUP_FILE" | \
      mail -s "ALERT: Backup Verification Failed" ops@dnpeople.id
    exit 1
  }
fi

# Delete backups older than 30 days
echo "[$(date)] Cleaning up old backups..." >> $LOG_FILE
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete

# Alert if backup size suspicious
SIZE=$(stat --format=%s $BACKUP_FILE)
if [ $SIZE -lt 100000000 ]; then
  echo "WARNING: Backup size suspiciously small: $SIZE bytes" | \
    mail -s "Backup Alert" ops@dnpeople.id
fi

echo "[$(date)] Backup process completed successfully" >> $LOG_FILE
```

### Restore Script

```bash
#!/bin/bash
# scripts/restore-database.sh

set -euo pipefail

BACKUP_FILE=$1
LOG_FILE="/var/log/dnpeople-restore.log"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: restore-database.sh <backup_file_path>"
  echo "Example: restore-database.sh s3://dnpeople-backups/dnpeople_20260722_020000.sql.gz"
  exit 1
fi

echo "Starting restore from: $BACKUP_FILE" | tee -a $LOG_FILE
START_TIME=$(date +%s)

# Download from S3 if needed
if [[ $BACKUP_FILE == s3://* ]]; then
  LOCAL_FILE="/tmp/restore_$(date +%s).sql.gz"
  echo "Downloading from S3..." | tee -a $LOG_FILE
  aws s3 cp $BACKUP_FILE $LOCAL_FILE
  BACKUP_FILE=$LOCAL_FILE
fi

# Verify checksum
echo "Verifying backup integrity..." | tee -a $LOG_FILE
if [ -f "${BACKUP_FILE}.md5" ]; then
  md5sum -c "${BACKUP_FILE}.md5" || {
    echo "Checksum verification failed!" | tee -a $LOG_FILE
    exit 1
  }
fi

# Kill existing connections
echo "Killing existing database connections..." | tee -a $LOG_FILE
psql -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} -d postgres << EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '${DB_NAME:-dnpeople}'
  AND pid <> pg_backend_pid();
EOF

# Drop existing database
echo "Dropping existing database..." | tee -a $LOG_FILE
dropdb -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} ${DB_NAME:-dnpeople} 2>/dev/null || true

# Create new database
echo "Creating new database..." | tee -a $LOG_FILE
createdb -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} ${DB_NAME:-dnpeople}

# Restore backup
echo "Restoring database (this may take several minutes)..." | tee -a $LOG_FILE
gunzip < $BACKUP_FILE | psql -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} -d ${DB_NAME:-dnpeople}

# Verify data integrity
echo "Verifying restored data..." | tee -a $LOG_FILE
COUNT_EMPLOYEES=$(psql -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} -d ${DB_NAME:-dnpeople} -tc "SELECT COUNT(*) FROM employees;")
echo "Employees: $COUNT_EMPLOYEES" | tee -a $LOG_FILE

COUNT_PAYSLIP=$(psql -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} -d ${DB_NAME:-dnpeople} -tc "SELECT COUNT(*) FROM payslip;")
echo "Payslips: $COUNT_PAYSLIP" | tee -a $LOG_FILE

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "" | tee -a $LOG_FILE
echo "✓ Restore completed in $DURATION seconds ($((DURATION / 60)) min $((DURATION % 60)) sec)" | tee -a $LOG_FILE
```

### Crontab Setup

```bash
# crontab -e

# Run daily backup at 02:00 UTC (off-peak)
0 2 * * * /usr/local/bin/backup-database.sh

# Run restore drill weekly (Wednesday 16:00 UTC)
0 16 * * 3 /usr/local/bin/restore-drill.sh
```

---

## Workstream 5: Website Build (Quick Guide)

### Option 1: Framer (Fastest)

```
1. Go to https://framer.com/
2. Create free project
3. Import template or start blank
4. Add sections:
   - Hero (logo + tagline + CTA button)
   - Features (6 grid: payroll, attendance, leave, reports, security, integrations)
   - Pricing (5 tiers: FREE, STARTER, PROFESSIONAL, BUSINESS, ENTERPRISE)
   - FAQ (use Framer accordion component)
   - CTA: "Get Started" button → signup form
5. Connect forms to Zapier → email capture
6. Publish to custom domain (dnpeople.id)
7. Setup Google Analytics
```

### Option 2: Webflow (Designer Control)

```
1. Go to https://webflow.com/
2. Start with template (search "SaaS pricing")
3. Customize colors + branding
4. Update content (replace placeholder with real copy)
5. Setup CMS for blog (future-proof for content)
6. Connect forms to Zapier
7. Publish to dnpeople.id
```

### Option 3: Next.js (Developer Control)

```bash
# If building custom:

npx create-next-app@latest dnpeople-web --typescript --tailwind

# File structure:
# src/pages/
#   index.tsx           (homepage)
#   /pricing            (pricing page)
#   /demo               (demo video)
#   /faq                (FAQ)
#   /contact            (contact form)

# Content to create:
# - Hero section (1-2 lines + CTA)
# - Features (6 cards)
# - Pricing table (5 tiers)
# - FAQ (20 questions)
# - Demo video embed (YouTube)
# - Blog (3+ launch posts)

# Deploy: Vercel (vercel.com)
# Domain: Connect dnpeople.id via DNS
```

---

## Workstream 6: Beta Customer Outreach

### Email Template

```
Subject: Join dnPeople Beta → Get 2 Months FREE HRIS

Hi [Name],

We're dnPeople — building the HR software for Indonesia. 

In 2 weeks, we're launching our platform to SMEs (50-300 employees). Before we go public, we need 10-20 beta customers to help us test and refine the product.

As a beta customer, you get:
✅ 2 months free (normally IDR 5-10M value)
✅ Priority support + direct access to our team
✅ Your feedback shapes our roadmap
✅ Exclusive beta customer badge on our site

We handle:
- Import your employee data (CSV)
- Setup company structure (departments, roles, locations)
- Configure payroll (salary, allowances, BPJS, PPh 21)
- Train your team (admin + employees)

All covered in our onboarding calls.

Interested? Let's do a quick 15-min intro call this week.

🔗 Calendly: [link to 15-min time slots]

Looking forward,
Dozer
Co-Founder, dnPeople
```

### Recruitment Process

```
Phase 1: Outreach (22-24 Jul)
  - Send 50+ pitch emails
  - Track opens + clicks (Gmail tracking)
  - Follow up 2-3x if no response

Phase 2: Discovery (25-26 Jul)
  - 15-min intro call
  - Qualify: HR tech buyer? 50-300 employees? Jakarta area?
  - Close: "Can you go-live end of July?"

Phase 3: Onboarding (27-29 Jul)
  - Send NDA + beta agreement
  - Provide login credentials
  - Schedule 3 setup calls (discovery, setup, training)
  - Import employee data

Phase 4: Go-Live (30-31 Jul)
  - Employees can access system
  - Daily support available (8am-6pm)
  - Collect feedback daily
  - Fix bugs as found

Success Metrics (Target):
  - 10-20 companies signed (40+ would be amazing)
  - > 80% employee adoption rate
  - NPS > 40 (survey on day 7)
  - < 5 critical bugs found
  - 0 customer churn during beta
```

---

## Workstream 7-9: Final Checklists

### Load Testing (k6)

```bash
# Install k6
brew install k6  # macOS
# or: apt-get install k6  # Linux

# Run baseline
k6 run --vus 100 --duration 5m loadtest/baseline.js

# Run ramp test
k6 run --vus 100-500 loadtest/ramp.js

# Expected output:
# ✓ p95 < 1000ms
# ✓ error_rate < 0.1%
# Test PASSED
```

### Penetration Test Prep

```
1. Create test account:
   Email: pentest@dnpeople.id
   Password: [strong random password]
   Role: COMPANY_ADMIN
   Scope: Full access to staging

2. Silence monitoring (don't trigger false alarms):
   Datadog: mute alerts 24-28 Jul
   PagerDuty: silence notifications for testing period

3. Provide access:
   - Staging URL: https://staging.dnpeople.id
   - Database: read-only access (if needed)
   - API: test API key with all scopes
   - Admin panel: full access

4. Escalation contact:
   Dozer's phone: [number]
   Slack: #security-incidents
```

### Post-Launch Metrics

```bash
# Setup Google Analytics
# 1. Go to Google Analytics 4
# 2. Create property: dnpeople.id
# 3. Install tracking snippet (Framer/Webflow handles)
# 4. Track events:
#    - Signup form submit
#    - Demo video play
#    - Pricing page view
#    - CTA button click

# Setup Datadog product metrics
# 1. Create dashboard: "dnPeople - Product Metrics"
# 2. Metrics to track:
#    - DAU (daily active users)
#    - Feature usage (payroll, leave, attendance)
#    - API calls per customer
#    - Revenue (if applicable)
```

---

## Launch Day Procedure (01 Aug)

```
08:00 - Team Sync (30 min)
  [ ] All systems green? (monitoring, backups, website, support)
  [ ] Any critical issues? (bugs, performance, security)
  [ ] Beta customers ready? (10-20 signed + access working)
  [ ] Dozer gives final approval?

09:00 - Customer Communications
  [ ] Send "Go-Live" email to beta customers
  [ ] Share system access (login link + credentials)
  [ ] Share support contact info (email + phone)
  [ ] Share training video links

09:30 - Website Announcement
  [ ] Publish "dnPeople Launches Public Beta" blog post
  [ ] Update dnpeople.id homepage (add "Beta Launch" banner)
  [ ] Share on LinkedIn (Dozer's account)
  [ ] Share on Twitter (if account exists)

10:00 - LAUNCH 🚀
  [ ] Send Slack announcement: "dnPeople is live for beta customers!"
  [ ] Monitor metrics dashboard (uptime, latency, errors)
  [ ] Team available for support (8am-6pm Jakarta time)
  [ ] Log all activity for retrospective

16:00 - First Day Check-in
  [ ] How many customers logged in?
  [ ] Any P0 bugs found? (fix immediately)
  [ ] Customer feedback? (Slack #feedback channel)
  [ ] Metrics looking good? (p95 latency, error rate)

20:00 - End of Day Sync
  [ ] Debrief: what went well? what didn't?
  [ ] Any urgent fixes needed for day 2?
  [ ] Plan for day 2 support
```

---

## Runbook Template (Save as Markdown)

**File:** `/docs/runbooks/database-restore.md`

```markdown
# Database Disaster Recovery Runbook

## Scenario
Production database is corrupted or inaccessible. Decision: restore from backup.

## Timeline (Target: < 4 hours total)

### Step 1: Detect Issue (0-15 min)
- Datadog alert fires: "DB connection error"
- On-call engineer investigates
- Confirms: database offline or corrupted data

### Step 2: Prepare (15-30 min)
- SSH to production server
- Stop web application: `docker-compose stop web`
- Alert team in Slack #incidents
- Contact Dozer (phone if critical)

### Step 3: Restore (30-180 min)
- Get latest backup from S3
- Run restore script: `./scripts/restore-database.sh s3://...`
- Verify data: COUNT queries match backup manifest
- Wait for restore to complete

### Step 4: Failover (180-210 min)
- Test application connection to restored DB
- Run smoke tests: login, payroll, attendance
- Verify no data corruption
- Switch traffic to recovered DB

### Step 5: Post-Incident (210+ min)
- Document what happened + why
- Create post-mortem within 24 hours
- Identify fixes to prevent recurrence
- Update this runbook if needed
- Notify customers (if applicable)

## Contacts
- Dozer (CEO): [phone]
- Database Admin: [phone]
- DevOps Lead: [phone]

## Success Criteria
- [ ] Database online
- [ ] Data integrity verified (no corruption)
- [ ] Application connects successfully
- [ ] Smoke tests pass
- [ ] Users can log in
- Total time: < 4 hours
```

---

*Last Updated: 22 Juli 2026 | Owner: Dozer | Status: Implementation Ready — Begin Execution*
