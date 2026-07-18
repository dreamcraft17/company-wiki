# dnPeople — SDD v10.0
## Operations & Launch Readiness - Implementation Details

**Versi:** 10.0  
**Tanggal:** 19 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Technical implementation guide

---

## Part 1: Monitoring Setup (Datadog)

### Step 1: Create Datadog Account

```bash
# 1. Sign up for Datadog (free trial 14 days)
# https://www.datadoghq.com/free-datadog-trial/
# Region: Asia-Pacific (Singapore) for latency optimization
# Tier: Pro (30 days trial sufficient for testing)

# 2. Get API key from Datadog UI
# Settings → API Keys → Copy "API key"
```

### Step 2: Install Datadog Agent

**Option A: Docker (if using Docker Compose)**

```yaml
# docker-compose.yml - add datadog service

services:
  datadog:
    image: datadog/agent:latest
    env_file: .env.datadog
    environment:
      - DD_AGENT_VERSION=latest
      - DD_SITE=datadoghq.eu  # Change if needed
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /proc/:/host/proc/:ro
      - /sys/fs/cgroup/:/host/sys/fs/cgroup:ro
    labels:
      com.datadoghq.ad.check_names: '["prometheus"]'
      com.datadoghq.ad.init_configs: '[{}]'
      com.datadoghq.ad.instances: |
        [
          {
            "prometheus_url": "http://localhost:9090/metrics"
          }
        ]
```

**.env.datadog:**
```
DD_API_KEY=your_api_key_here
DD_APP_KEY=your_app_key_here
DD_ENABLED=true
```

**Option B: Linux systemd (if VPS)**

```bash
#!/bin/bash
# install-datadog-agent.sh

# Add Datadog repository
echo "deb https://apt.datadoghq.com/ stable 7" | sudo tee /etc/apt/sources.list.d/datadog.list > /dev/null
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys A2923DFF56EF722938FDD6923C6559CD5B5F4B4A

# Install agent
sudo apt-get update
sudo apt-get install -y datadog-agent

# Configure
sudo cp /etc/datadog-agent/datadog.yaml.example /etc/datadog-agent/datadog.yaml
sudo sed -i 's/# api_key:.*/api_key: YOUR_API_KEY_HERE/' /etc/datadog-agent/datadog.yaml

# Enable Prometheus check
cat > /etc/datadog-agent/conf.d/prometheus.d/conf.yaml << EOF
instances:
  - prometheus_url: http://localhost:9090/metrics
    tags:
      - dnpeople
EOF

# Restart agent
sudo systemctl restart datadog-agent
```

### Step 3: Configure Prometheus Scrape

```bash
# Backend MUST expose /metrics in Prometheus format
# Existing code in backend/src/utils/metrics.ts should be active

# Verify endpoint:
curl http://localhost:3000/metrics | head -20

# Example output:
# # HELP http_requests_total Total HTTP requests
# # TYPE http_requests_total counter
# http_requests_total{method="GET",status="200"} 12345
```

### Step 4: Create Datadog Dashboard

```typescript
// dashboard-config.json (or use Datadog UI)

{
  "title": "dnPeople Production Monitoring",
  "description": "Real-time health dashboard",
  "widgets": [
    {
      "type": "timeseries",
      "query": "avg:http.requests.duration{*}",
      "title": "API Response Time (p95)",
      "yaxis": {
        "label": "Milliseconds",
        "min": 0,
        "max": 5000
      }
    },
    {
      "type": "gauge",
      "query": "avg:system.cpu.user{*}",
      "title": "Server CPU Usage",
      "thresholds": {
        "critical": 95,
        "warning": 80,
        "ok": 50
      }
    },
    {
      "type": "number",
      "query": "sum:http.requests.errors{*}",
      "title": "Error Count (24h)"
    },
    {
      "type": "graph",
      "query": "avg:postgresql.db.connections{*}",
      "title": "Database Connections"
    }
  ]
}
```

---

## Part 2: Alerting Setup (PagerDuty)

### Step 1: Create PagerDuty Account

```bash
# 1. Sign up for PagerDuty
# https://www.pagerduty.com/sign-up/
# Team: 2 people (Dozer + 1 engineer)

# 2. Create on-call schedule
# Services → Create Service
# Service name: "dnPeople Production"
# Integration: Datadog (automatic)
```

### Step 2: Configure Datadog → PagerDuty Integration

```
# In Datadog:
# Integrations → PagerDuty
# Click "Authorize"
# Select PagerDuty account
# Copy "Integration URL"

# In PagerDuty:
# Services → dnPeople Production → Integrations
# Paste Datadog Integration URL
# Save
```

### Step 3: Create Alert Rules

```
# Datadog Monitors → Create Monitor

Monitor 1: API Latency High
  Metric: avg:http.requests.duration{*}
  Condition: When average >= 2000ms for last 5 minutes
  Alert title: "API latency P95 critically high (>2s)"
  Notify: PagerDuty Service "dnPeople Production"
  
Monitor 2: Error Rate High
  Metric: sum:http.requests.errors{*} / sum:http.requests{*}
  Condition: When ratio > 0.05 (5%) for last 5 minutes
  Alert title: "Error rate critical (>5%)"
  Notify: PagerDuty Service
  
Monitor 3: Database Connections
  Metric: max:postgresql.db.connections{*}
  Condition: When >= 90 for last 3 minutes
  Alert title: "Database connection pool near limit"
  Notify: PagerDuty Service
  
Monitor 4: Payment Webhook Failure
  Metric: sum:payment.webhook.errors{*}
  Condition: When > 5 for last 1 hour
  Alert title: "Payment webhook failures detected"
  Notify: PagerDuty Service (CRITICAL)
  Severity: Critical
```

### Step 4: PagerDuty On-Call Schedule

```
Schedule name: "dnPeople On-Call"
Time zone: Asia/Jakarta (UTC+7)

Week 1:
  Mon-Wed: Dozer (primary)
  Wed-Fri: Engineer A (backup)
  Fri-Sun: Engineer B (backup)
  
Week 2:
  Rotation

Escalation policy:
  Level 1: On-call (immediate)
  Level 2: +15 min if not acknowledged
  Level 3: +30 min to manager

Notification:
  [ ] SMS to phone
  [ ] Email to inbox
  [ ] Push to PagerDuty app
```

---

## Part 3: Backup & Restore

### Step 1: Backup Script

```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/backups/postgresql"
S3_BUCKET="s3://dnpeople-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/dnpeople_$TIMESTAMP.sql.gz"

# Create backup
mkdir -p $BACKUP_DIR
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

# Calculate checksum
md5sum $BACKUP_FILE > $BACKUP_FILE.md5

# Upload to S3
aws s3 cp $BACKUP_FILE $S3_BUCKET/
aws s3 cp $BACKUP_FILE.md5 $S3_BUCKET/

# Keep only last 30 days locally
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete

# Log backup
echo "Backup completed: $BACKUP_FILE ($(du -h $BACKUP_FILE | cut -f1))" >> /var/log/dnpeople-backup.log

# Alert if backup size anomaly
SIZE=$(stat --format=%s $BACKUP_FILE)
if [ $SIZE -lt 100000000 ]; then
  echo "WARNING: Backup size suspiciously small: $SIZE bytes" | mail -s "Backup Alert" ops@dnpeople.id
fi
```

### Step 2: Schedule Daily Backup (crontab)

```bash
# crontab -e

# Run daily at 02:00 UTC (off-peak)
0 2 * * * /usr/local/bin/backup-database.sh

# Run weekly restore test on staging (Wednesday 16:00 UTC)
0 16 * * 3 /usr/local/bin/restore-drill.sh
```

### Step 3: Restore Script

```bash
#!/bin/bash
# scripts/restore-database.sh

BACKUP_FILE=$1  # e.g., s3://dnpeople-backups/dnpeople_20260719_020000.sql.gz

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: restore-database.sh <backup_file_path>"
  exit 1
fi

echo "Restoring from: $BACKUP_FILE"
START_TIME=$(date +%s)

# Download from S3 if needed
if [[ $BACKUP_FILE == s3://* ]]; then
  LOCAL_FILE="/tmp/restore_$(date +%s).sql.gz"
  aws s3 cp $BACKUP_FILE $LOCAL_FILE
  BACKUP_FILE=$LOCAL_FILE
fi

# Verify checksum
md5sum -c ${BACKUP_FILE}.md5

# Kill existing connections
psql -h $DB_HOST -U $DB_USER -d postgres << EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
  AND pid <> pg_backend_pid();
EOF

# Drop and recreate database
dropdb -h $DB_HOST -U $DB_USER $DB_NAME
createdb -h $DB_HOST -U $DB_USER $DB_NAME

# Restore
gunzip < $BACKUP_FILE | psql -h $DB_HOST -U $DB_USER -d $DB_NAME

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "Restore completed in $DURATION seconds"
echo "Restore completed in $((DURATION / 60)) minutes $((DURATION % 60)) seconds" >> /var/log/dnpeople-restore.log
```

### Step 4: Restore Drill (Weekly)

```bash
#!/bin/bash
# scripts/restore-drill.sh

# Restore to staging from production backup
STAGING_DB="dnpeople_staging_restore"
LATEST_BACKUP=$(aws s3 ls s3://dnpeople-backups/ | tail -1 | awk '{print $NF}')

echo "Starting restore drill with backup: $LATEST_BACKUP"
echo "Timestamp: $(date)" >> /var/log/restore-drill.log

# Download backup
aws s3 cp "s3://dnpeople-backups/$LATEST_BACKUP" /tmp/

# Restore to staging
dropdb -h staging-db $STAGING_DB || true
createdb -h staging-db $STAGING_DB
gunzip < /tmp/$LATEST_BACKUP | psql -h staging-db -d $STAGING_DB

# Verify data integrity (sample queries)
psql -h staging-db -d $STAGING_DB << EOF
SELECT COUNT(*) FROM employees;
SELECT COUNT(*) FROM payslip;
SELECT COUNT(*) FROM attendance;
EOF

# Test application connection
curl -X GET "http://staging-app:3000/health" -H "Authorization: Bearer $TEST_TOKEN"

# If successful
if [ $? -eq 0 ]; then
  echo "✓ Restore drill PASSED" >> /var/log/restore-drill.log
  echo "✓ Restore drill PASSED"
  exit 0
else
  echo "✗ Restore drill FAILED" >> /var/log/restore-drill.log
  echo "✗ Restore drill FAILED - notifying ops"
  echo "Restore drill failed for backup $LATEST_BACKUP" | mail -s "ALERT: Restore Drill Failed" ops@dnpeople.id
  exit 1
fi
```

---

## Part 4: Load Testing (k6)

### Step 1: Write k6 Test Script

```javascript
// loadtest/payroll-scenario.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],  // API latency targets
    'http_req_failed': ['rate<0.001'],  // Error rate target
  },
};

export default function() {
  // Login
  let loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, {
    email: 'hr@company.id',
    password: 'password123',
  });
  
  check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'login has token': (r) => r.json('token') !== undefined,
  });

  let token = loginRes.json('token');
  let headers = { 'Authorization': `Bearer ${token}` };

  sleep(1);

  // Get payroll list
  let payrollRes = http.get(
    `${BASE_URL}/api/v1/payroll`,
    { headers: headers }
  );
  
  check(payrollRes, {
    'payroll list status 200': (r) => r.status === 200,
    'payroll has data': (r) => r.json('data.length') > 0,
  });

  sleep(2);

  // Get attendance
  let attendanceRes = http.get(
    `${BASE_URL}/api/v1/attendance?limit=50`,
    { headers: headers }
  );
  
  check(attendanceRes, {
    'attendance status 200': (r) => r.status === 200,
  });

  sleep(1);

  // Create leave request
  let leaveRes = http.post(
    `${BASE_URL}/api/v1/leave/request`,
    JSON.stringify({
      leaveTypeId: 'annual',
      startDate: '2026-08-01',
      endDate: '2026-08-05',
      reason: 'Vacation',
    }),
    { headers: headers }
  );
  
  check(leaveRes, {
    'leave request status 201': (r) => r.status === 201,
  });

  sleep(2);
}
```

### Step 2: Run Load Test

```bash
# Install k6
brew install k6  # macOS
# or docker pull grafana/k6:latest

# Run test
k6 run --vus 50 --duration 30s loadtest/payroll-scenario.js

# Output:
# running (0s/30s), 00/50 VUs, 1234 complete
# ✓ login status 200
# ✓ login has token
# ✓ payroll list status 200
# ...
# 
# checks................: 99.5% ✓ 12340 ✗ 60
# http_req_duration....: avg=250ms, p(95)=850ms, p(99)=1200ms
# http_req_failed......: 0.48%
```

### Step 3: Load Test with CloudFlare (optional)

```javascript
// loadtest/cloudflare-distribution.js
// Run test across multiple geographic regions

import http from 'k6/http';

export let options = {
  ext: {
    loadimpact: {
      projectID: 123456,
      name: 'dnPeople Production Load Test',
      note: 'Pre-launch validation',
      zones: [
        { name: 'Asia Pacific (Singapore)', percentage: 50 },
        { name: 'Asia Pacific (Tokyo)', percentage: 30 },
        { name: 'North America (US East)', percentage: 20 },
      ],
    },
  },
};

export default function() {
  // Same as above
}
```

---

## Part 5: Security Testing

### Penetration Test Checklist (for external firm)

```markdown
# dnPeople Penetration Test Scope

## Application Scope
- URL: https://dnpeople.id
- Auth methods: Email/password, OAuth, SAML, API keys
- API: /api/v1/* endpoints
- Main flows: Login, Payroll, Attendance, Leave

## Security Domains to Test
1. Authentication & Session Management
   - Password reset token expiry
   - Session timeout enforcement
   - Cookie flags (httpOnly, Secure, SameSite)
   - MFA bypass attempts
   - OAuth/SAML replay attacks

2. Authorization & Access Control
   - Role escalation (employee → admin)
   - Cross-tenant data access
   - Row-level access control bypass
   - API key scope enforcement

3. Data Protection
   - Encryption in transit (TLS)
   - Encryption at rest (sensitive fields)
   - PII disclosure (logs, errors)
   - SQL injection
   - XXE / XML attacks

4. Business Logic
   - Payroll calculation manipulation
   - Leave balance tampering
   - Attendance correction bypass
   - Loan amount manipulation

5. File Handling
   - Excel upload malware
   - Path traversal
   - File download access control
   - File size limits

6. API Security
   - Rate limiting bypass
   - DDoS mitigation
   - API key in logs
   - Webhook security

## Testing Conditions
- Testing window: July 22-26, 2026
- Staging environment: https://staging.dnpeople.id
- Prod access: View-only read (no modification)
- Testing hours: 08:00-17:00 Jakarta time
- Escalation: Contact Dozer if critical finding discovered

## Deliverables
1. Detailed vulnerability report
2. CVSS score per finding
3. Proof of concept (if applicable)
4. Remediation recommendations
5. Timeline: 2 business days
6. Re-test after fixes: July 29-30
```

---

## Part 6: Checklist - Ready for Beta Launch

```
MONITORING & ALERTING:
  [x] /metrics endpoint working
  [x] Datadog agent installed
  [ ] Dashboard created + viewing data
  [ ] Alert rules configured (5+ rules)
  [ ] PagerDuty integration tested
  [ ] On-call schedule active
  [ ] Test alert fired + notification received

BACKUP & RECOVERY:
  [ ] Backup script running daily
  [ ] S3 backups verified
  [ ] Restore script tested
  [ ] Restore drill completed < 4 hours
  [ ] RPO/RTO signed (< 1h RPO, < 4h RTO)
  [ ] Backup runbook documented + shared

LOAD TESTING:
  [ ] Test environment identical to prod
  [ ] Test data seeded (5000 employees)
  [ ] k6 scripts written
  [ ] Baseline run: 100 users
    [ ] p95 < 1000ms achieved
    [ ] Error rate < 0.1%
  [ ] Ramp test: 100→500 users
    [ ] MSL identified
    [ ] Bottlenecks documented
  [ ] Results documented + approved

SECURITY:
  [ ] Pen-test firm selected + engaged
  [ ] Testing window scheduled
  [ ] Staging environment prepped
  [ ] Test account credentials provided
  [ ] Monitoring alerts silenced for test window
  [ ] Incident contact provided

OPERATIONS:
  [ ] Support ticketing system live (Helpscout/Zendesk)
  [ ] Support email: support@dnpeople.id monitored
  [ ] Customer onboarding playbook written
  [ ] Training videos recorded
  [ ] FAQ (20+ articles) documented
  [ ] SLA documented + signed
  [ ] Escalation procedure defined
  [ ] Team trained + confident
```

---

*Last Updated: 19 Juli 2026 | Owner: Dozer | Status: Implementation Ready*
