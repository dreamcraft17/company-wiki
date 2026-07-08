# PRIORITY IMPLEMENTATION ROADMAP
## dnPeople — Production-Ready Feature Development

**Version:** 1.1  
**Date:** 3 July 2026 · **Updated:** 7 July 2026  
**Timeline:** ✅ Code complete (Phase 1–4) · Live deploy pending AWS credentials  
**Status:** All coding items below **SHIPPED** — remaining = ops execution only

---

## 📊 ROADMAP OVERVIEW

```
WEEK 1-2: SPRINT 1 — Production Foundation
├─ [P0] TypeORM Migrations generation & execution
├─ [P0] AWS Secrets Manager setup
├─ [P0] RDS backups & disaster recovery
├─ [P1] Staging environment deploy
└─ Est. 80 story points

WEEK 3-4: SPRINT 2 — Testing & Monitoring
├─ [P1] Unit test coverage 20% → 40%
├─ [P1] E2E test expansion (key flows)
├─ [P1] Prometheus + Grafana alerts
├─ [P2] Payroll PPh 21 - Phase 1
└─ Est. 100 story points

WEEK 5-6: SPRINT 3 — Features & Hardening
├─ [P2] Payroll PPh 21 - Phase 2
├─ [P2] HR Performance Reviews (Phase 1)
├─ [P2] Manufacturing MRP Advanced
├─ [P3] Custom Report Builder UI
├─ [P3] Login UX fix (remove tenant slug)
└─ Est. 120 story points

WEEK 7: SPRINT 4 — Go-Live Preparation
├─ [P0] Security audit (OWASP)
├─ [P0] Load test (1000 concurrent users)
├─ [P0] Backup/restore validation
├─ [P0] On-call & runbook finalization
└─ Est. 60 story points

WEEK 8+: POST-PRODUCTION
├─ [P2] HR Performance Reviews (Phase 2)
├─ [P3] Demand forecasting & MRP optimization
└─ Phase 3 features (microservices split, mobile, etc.)
```

---

## 🎯 SPRINT 1 (WEEK 1-2) — PRODUCTION FOUNDATION

**Goal:** Make project production-safe (migrations, secrets, backups)

### Task 1.1 — TypeORM Migrations [P0]
**Status:** ❌ Blocking  
**Owner:** Backend Lead  
**Effort:** 2-3 days  
**Story Points:** 13

**Checklist:**
```bash
# Day 1
□ Generate initial migration from all entities
  npx typeorm migration:generate -d src/database/data-source.ts src/database/migrations/1700000001-initial

□ Review generated migration file
  cat src/database/migrations/1700000001-initial.ts

□ Test locally
  npm run db:migrate
  npm run db:seed
  npm test  # Verify all still works

# Day 2
□ Generate migration #2 (if any entity changes post-Phase 2)
□ Create migration for existing data (if any schema cleanup needed)
□ Document migration procedure in runbook

# Day 3
□ Add migration automation to CI/CD
□ Test rollback procedure
□ Create migration checklist for production deploy
```

**Success Criteria:**
- ✅ All entities have corresponding migration
- ✅ Migrations run successfully on clean DB
- ✅ Rollback tested & documented
- ✅ Added to CI/CD pipeline

---

### Task 1.2 — AWS Secrets Manager [P0]
**Status:** ⚠️ Partial (some .env files exist)  
**Owner:** DevOps  
**Effort:** 2 days  
**Story Points:** 8

**Setup:**
```bash
# Create secrets in AWS
aws secretsmanager create-secret \
  --name dntech-erp/prod/db-password \
  --secret-string "$(openssl rand -base64 32)"

aws secretsmanager create-secret \
  --name dntech-erp/prod/jwt-secret \
  --secret-string "$(openssl rand -base64 64)"

aws secretsmanager create-secret \
  --name dntech-erp/prod/stripe-api-key \
  --secret-string "sk_live_..."

aws secretsmanager create-secret \
  --name dntech-erp/prod/sendgrid-api-key \
  --secret-string "SG...."
```

**Update .env.production:**
```bash
# Don't hardcode secrets!
DB_PASSWORD=@aws:secretsmanager:dntech-erp/prod/db-password
JWT_SECRET=@aws:secretsmanager:dntech-erp/prod/jwt-secret
STRIPE_API_KEY=@aws:secretsmanager:dntech-erp/prod/stripe-api-key
```

**Backend integration:**
```typescript
// backend/src/config/secrets.config.ts
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

export async function loadSecrets() {
  const client = new SecretsManager({ region: process.env.AWS_REGION });
  
  const secrets = {
    dbPassword: await getSecret('dntech-erp/prod/db-password'),
    jwtSecret: await getSecret('dntech-erp/prod/jwt-secret'),
    // ... more secrets
  };
  
  return secrets;
}
```

**Success Criteria:**
- ✅ All secrets in AWS Secrets Manager
- ✅ .env.production only has references (no hardcoded values)
- ✅ Backend loads secrets on startup
- ✅ Rotation procedure documented

---

### Task 1.3 — RDS Backups & Disaster Recovery [P0]
**Status:** ❌ Not configured  
**Owner:** DevOps  
**Effort:** 1 day  
**Story Points:** 5

**Setup:**
```bash
# Enable automated backups (AWS CLI)
aws rds modify-db-instance \
  --db-instance-identifier erp-prod-db \
  --backup-retention-period 30 \
  --preferred-backup-window "02:00-03:00" \
  --preferred-maintenance-window "sun:03:00-sun:04:00" \
  --apply-immediately

# Enable Multi-AZ
aws rds modify-db-instance \
  --db-instance-identifier erp-prod-db \
  --multi-az \
  --apply-immediately

# Enable enhanced monitoring
aws rds modify-db-instance \
  --db-instance-identifier erp-prod-db \
  --enable-cloudwatch-logs-exports postgresql \
  --apply-immediately

# Test restore procedure (monthly)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier erp-prod-db-restore-test \
  --db-snapshot-identifier erp-prod-db-snapshot-2026-07-03
```

**Disaster Recovery Plan:**
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 15 minutes
- Test monthly: Full restore from snapshot
- Document in runbook

**Success Criteria:**
- ✅ Automated backups enabled (30-day retention)
- ✅ Multi-AZ enabled
- ✅ CloudWatch logs streaming
- ✅ Restore test successful
- ✅ RTO/RPO met

---

### Task 1.4 — Staging Environment Deploy [P1]
**Status:** ❌ Not deployed  
**Owner:** DevOps  
**Effort:** 2-3 days  
**Story Points:** 13

**Steps:**
```bash
# 1. Create AWS resources (Terraform)
cd terraform
terraform workspace new staging
terraform plan -var-file=staging.tfvars
terraform apply -var-file=staging.tfvars

# 2. Deploy via Helm
helm upgrade --install dntech-erp k8s/helm \
  --namespace dntech-staging \
  --values k8s/helm/values-staging.yaml

# 3. Verify
kubectl get pods -n dntech-staging
kubectl logs -n dntech-staging deployment/api

# 4. Test
curl https://staging.dntech-erp.com/api/health
npm run test:e2e -- --config-file=staging.config.js
```

**Staging Environment Specs:**
- Database: RDS (same size as prod for realistic testing)
- Traffic: Staging subdomain (staging.dntech-erp.com)
- SSL: Auto-provisioned by ACM
- Monitoring: Same Prometheus setup as prod
- Backup: Daily (7-day retention)

**Success Criteria:**
- ✅ Staging deployed & accessible
- ✅ All endpoints responding
- ✅ Database mirrored from prod (anonymized)
- ✅ Smoke tests passing

---

## 📊 SPRINT 2 (WEEK 3-4) — TESTING & MONITORING

**Goal:** Improve visibility & confidence (tests, monitoring, alerts)

### Task 2.1 — Unit Test Coverage 20% → 40% [P1]
**Status:** ⚠️ 20% coverage  
**Owner:** QA + Backend  
**Effort:** 2-3 weeks (ongoing)  
**Story Points:** 21

**Priority Modules (40% target):**
```
Finance Module: 35% → 50%
├─ gl.service.spec.ts (GL posting validation, period close)
├─ ap.service.spec.ts (Invoice matching, payment)
└─ ar.service.spec.ts (Credit limit, collections)

Auth Module: 25% → 40%
├─ auth.service.spec.ts (Login, 2FA, token refresh)
└─ oauth.service.spec.ts (SSO Google, client_credentials)

Sales Module: 15% → 35%
├─ order.service.spec.ts (Order creation, status transitions)
├─ credit-limit.service.spec.ts (Credit check)
└─ invoice.service.spec.ts (Invoice generation)

Supply Chain: 10% → 30%
├─ po.service.spec.ts (PO creation, approval)
└─ inventory.service.spec.ts (Stock movements)
```

**Test Examples:**
```typescript
// Finance: GL posting validation
describe('GlService.validateGlEntry', () => {
  it('should reject unbalanced entries', async () => {
    const result = await service.validateGlEntry('tenant', {
      lines: [
        { debit: 100, credit: 0 },
        { debit: 0, credit: 50 },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it('should reject closed period', async () => {
    // Mock period as CLOSED
    const result = await service.validateGlEntry('tenant', dto);
    expect(result.errors).toContain('Period is closed');
  });
});

// Auth: Login flow
describe('AuthService.login', () => {
  it('should return JWT token on valid credentials', async () => {
    const result = await service.login('test@example.com', 'password');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should throttle after 5 failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await service.login('test@example.com', 'wrong');
    }
    await expect(service.login('test@example.com', 'wrong')).rejects.toThrow('Too many attempts');
  });
});
```

**Success Criteria:**
- ✅ Finance module: 50% coverage
- ✅ Auth module: 40% coverage
- ✅ Sales module: 35% coverage
- ✅ Supply chain: 30% coverage
- ✅ Overall: 40%+ coverage

---

### Task 2.2 — E2E Test Expansion [P1]
**Status:** ⚠️ Smoke tests only  
**Owner:** QA  
**Effort:** 2 weeks  
**Story Points:** 13

**Key Flows to Test:**
```
Auth Flow:
├─ Register new company → login → verify tenant created
├─ Login with invalid credentials → throttle after 5 attempts
├─ Login with 2FA → verify code required
└─ Refresh token → verify new token issued

Finance Flow:
├─ Create GL entry → validate balance → confirm posting
├─ Create AP invoice → match with PO → approve → pay
├─ Create AR invoice → customer payment → reconcile
└─ Period close → lock GL → verify no new entries allowed

Sales Flow:
├─ Create order → add items → validate credit limit
├─ Confirm order → auto-create GL entries
├─ Create invoice from order
└─ Customer payment → reconcile AR

Supply Chain Flow:
├─ Create PO → send to vendor
├─ Receive goods → match with PO
├─ Invoice received → 3-way match
└─ Create stock transfer → verify inventory balance
```

**Cypress Test Examples:**
```typescript
// cypress/e2e/sales-order-flow.cy.ts
describe('Sales Order Flow', () => {
  it('should create order and auto-generate GL entries', () => {
    // Login
    cy.visit('/login');
    cy.get('[data-testid=email]').type('admin@demo.com');
    cy.get('[data-testid=password]').type('Demo1234!');
    cy.get('[data-testid=login-btn]').click();
    
    // Create order
    cy.visit('/sales/orders');
    cy.get('[data-testid=create-btn]').click();
    cy.get('[data-testid=customer]').type('PT ABC');
    cy.get('[data-testid=item-code]').type('PROD001');
    cy.get('[data-testid=qty]').type('10');
    cy.get('[data-testid=save-btn]').click();
    
    // Verify GL entries created
    cy.visit('/finance/journal-entries');
    cy.contains('SO-20240703001').should('exist');
  });
});
```

**Success Criteria:**
- ✅ 10+ E2E tests covering main flows
- ✅ All tests passing
- ✅ Cypress runs in CI/CD pipeline
- ✅ Test data cleanup working

---

### Task 2.3 — Prometheus + Grafana Alerts [P1]
**Status:** ⚠️ Prometheus local only, no alerts  
**Owner:** DevOps  
**Effort:** 2-3 days  
**Story Points:** 8

**Setup:**
```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - 'alert-rules.yml'

scrape_configs:
  - job_name: 'dntech-erp'
    static_configs:
      - targets: ['api:3000']
```

```yaml
# prometheus/alert-rules.yml
groups:
  - name: dntech-erp
    rules:
      # CPU Alert
      - alert: HighCPUUsage
        expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
        for: 5m
        annotations:
          summary: "High CPU usage detected"

      # Memory Alert
      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.85
        for: 5m

      # API Error Rate Alert
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m

      # Database Slow Queries
      - alert: SlowQueries
        expr: histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m])) > 2
```

**Grafana Dashboards:**
- System metrics (CPU, Memory, Disk)
- API metrics (Request count, latency, error rate)
- Database metrics (Query time, connections)
- Business metrics (Orders/day, invoices created)

**Alert Destinations:**
- PagerDuty integration (for on-call)
- Slack channel (#dntech-alerts)
- Email to ops team

**Success Criteria:**
- ✅ All alert rules configured
- ✅ Grafana dashboards created & visible
- ✅ PagerDuty integration working
- ✅ Alert thresholds tuned (no false positives)

---

### Task 2.4 — Payroll PPh 21 - Phase 1 [P2]
**Status:** ⚠️ Basic calculation only  
**Owner:** Backend (Finance)  
**Effort:** 2-3 weeks (ongoing to Phase 2)  
**Story Points:** 21

**Scope Phase 1:**
```
✅ Database entities for payroll
✅ PTKP configuration (2024 rates)
✅ Basic PPh 21 calculation formula
✅ Monthly withholding posting to GL
⚠️ Phase 2: Annual reconciliation, Form 1721
```

**See:** 14-PAYROLL-AUTOMATION-SPECS.md for full detail

---

## 🎯 SPRINT 3 (WEEK 5-6) — FEATURES & HARDENING

**Goal:** Complete SRS gaps & harden for production

### Task 3.1 — Payroll PPh 21 - Phase 2 [P2]
**Effort:** 2 weeks  
**Story Points:** 13  
**Status:** Continuation of Sprint 2 Task 2.4

---

### Task 3.2 — HR Performance Reviews (Phase 1) [P2]
**Status:** ❌ Not implemented  
**Owner:** Backend + Frontend  
**Effort:** 2 weeks  
**Story Points:** 13

**Scope Phase 1:**
```
✅ Review templates (predefined + custom)
✅ Review period setup
✅ Reviewer assignment (1:1, 360, skip-level)
✅ Review form & questions
⚠️ Phase 2: Feedback collection, approval workflow, compensation impact
```

---

### Task 3.3 — Manufacturing MRP Advanced [P2]
**Status:** ⚠️ Basic reorder points only  
**Owner:** Backend (Supply Chain)  
**Effort:** 2-3 weeks  
**Story Points:** 16

**Features:**
- Demand forecasting (simple linear)
- Safety stock calculation
- Economic order quantity (EOQ)
- Lead time variance handling
- MRP planning run

---

### Task 3.4 — Custom Report Builder UI [P3]
**Status:** ⚠️ Backend ready, Frontend missing  
**Owner:** Frontend  
**Effort:** 2 weeks  
**Story Points:** 13

**Scope:**
- Visual report builder (drag-drop)
- Field selection
- Filter/sort UI
- Chart preview
- Save & schedule reports

---

### Task 3.5 — Login UX Fix (Remove Tenant Slug) [P3]
**Status:** ⚠️ Minor cleanup  
**Owner:** Frontend  
**Effort:** 0.5 days  
**Story Points:** 2

**Changes:**
- Remove slug input from login form
- Auto-detect tenant from email lookup
- Same for registration (slug auto-generated from company name)

---

## 🚀 SPRINT 4 (WEEK 7) — GO-LIVE PREP

**Goal:** Final validation before production deploy

### Task 4.1 — Security Audit (OWASP) [P0]
**Owner:** Security lead or external audit  
**Effort:** 3-5 days  
**Story Points:** 13

**Checklist:**
```
OWASP Top 10:
☐ A01:2021 Broken Access Control
☐ A02:2021 Cryptographic Failures
☐ A03:2021 Injection
☐ A04:2021 Insecure Design
☐ A05:2021 Security Misconfiguration
☐ A06:2021 Vulnerable & Outdated Components
☐ A07:2021 Identification & Authentication Failures
☐ A08:2021 Software & Data Integrity Failures
☐ A09:2021 Logging & Monitoring Failures
☐ A10:2021 Server-Side Request Forgery (SSRF)

Indonesia Compliance:
☐ Personal data handling (GDPR-equivalent)
☐ Tax data security (PPh, PPN)
```

---

### Task 4.2 — Load Testing [P0]
**Owner:** QA  
**Effort:** 2-3 days  
**Story Points:** 8

**Test Scenarios:**
- 100 concurrent users (baseline)
- 500 concurrent users (stress)
- 1000 concurrent users (breaking point)
- 15 minute sustained load
- API response time baseline: p95 < 500ms, p99 < 2s

**Tools:** JMeter, k6, or Locust

---

### Task 4.3 — Backup/Restore Validation [P0]
**Owner:** DevOps  
**Effort:** 1 day  
**Story Points:** 5

- [ ] Full restore from latest backup
- [ ] Data integrity verified
- [ ] Time to restore < 1 hour (RTO)
- [ ] Point-in-time restore tested

---

### Task 4.4 — Runbook & On-Call Setup [P0]
**Owner:** DevOps + PM  
**Effort:** 2-3 days  
**Story Points:** 8

**Runbook Topics:**
- Deployment procedure
- Rollback procedure
- Database failover
- SSL certificate renewal
- Incident response
- Scaling procedures

**On-Call:**
- Primary on-call engineer (24x7)
- Escalation path
- Alert response SLA (15 min critical, 1 hour high)
- Monthly on-call rotation

---

## 📈 EFFORT & TIMELINE SUMMARY

```
Sprint 1: 80 pts → 2 weeks → Foundation (Migrations, Secrets, Backups)
Sprint 2: 100 pts → 2 weeks → Testing & Monitoring
Sprint 3: 120 pts → 2 weeks → Features & Hardening
Sprint 4: 60 pts → 1 week → Go-Live Prep

TOTAL: 360 story points | 7 weeks | ~51 developer-weeks
```

**Assuming 2 backend + 1 frontend + 1 devops:**
- Parallelizable work: Can compress to 4-6 weeks if team size increased

---

## 🎯 SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Coverage | 60%+ | `npm run test:cov` |
| E2E Tests | 10+ flows | Cypress dashboard |
| API Uptime (Staging) | 99.9% | CloudWatch metrics |
| Response Time | p95 < 500ms | Prometheus |
| Error Rate | < 0.5% | Application logs |
| Security Issues | 0 critical | OWASP audit |

---

**Next Review:** 10 July 2026 (end of Sprint 1)  
**Document Owner:** Engineering Lead  
**Last Updated:** 3 July 2026

