# SDD V3 — dnPeople System Design Document
## Enterprise Architecture, Scalability, Disaster Recovery

**Document ID:** Doc 27-SDD-V3  
**Version:** 3.0  
**Date:** 7 July 2026  
**Owner:** PT. Dozer Napitupulu Technology (dntech.id)  
**Architecture Owner:** VP Engineering + CTO  
**Baseline:** Doc 03 (Original SDD, Phase 0–4)

> **Scope:** Enterprise-grade system design for V3.0 go-live (Phase 5) + roadmap through Phase 8. Covers: production infrastructure, disaster recovery, scalability blueprint, security architecture, data governance, and optional microservices transition.

---

## 1. Architecture Vision & Evolution

### 1.1 Current State (Phase 0–4)

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients Layer                        │
│  React SPA (Vite) | Expo Mobile MVP | Portal SPA            │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                   NestJS Monolith (Single Instance)         │
│  ├─ Auth Module (2FA, JWT, SSO)                             │
│  ├─ 24 Domain Modules (Finance, HR, Sales, etc.)           │
│  ├─ Platform Registry (microservice scaffold)              │
│  └─ Common Infrastructure (Guards, Audit, Validation)      │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                        Data Layer                           │
│  PostgreSQL 15 | Redis 7 | Elasticsearch 8.11              │
└─────────────────────────────────────────────────────────────┘
```

**Limitations:**
- Single NestJS instance → vertical scaling only
- Monolithic coupling → hard to scale individual modules
- Synchronous transaction chains → blocking requests
- Manual scaling → needs load balancer + multiple instances

### 1.2 V3.0 Target (Phase 5 — Production Grade)

```
┌──────────────────────────────────────────────────────────────────┐
│                        CDN Layer                                 │
│  Cloudflare | CloudFront (static assets, images)                │
└──────────────────────────────────────────────────────────────────┘
                                │
┌──────────────────────────────┼──────────────────────────────────┐
│                   AWS Load Balancer (ALB)                       │
│  ├─ TLS 1.3 termination                                         │
│  ├─ Health check (every 10s)                                    │
│  ├─ Cross-AZ sticky sessions (opt.)                            │
│  └─ Path-based routing (/api, /portal, /static)                │
└──────────────────────────────┼──────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼─────────┐  ┌──────────▼──────────┐  ┌────────▼────────┐
│  EKS Pod 1      │  │   EKS Pod 2        │  │  EKS Pod 3      │
│  (NestJS App)   │  │  (NestJS App)      │  │ (NestJS App)    │
│  ├─ 2 replicas  │  │  ├─ 2 replicas     │  │  ├─ 2 replicas  │
│  ├─ HPA enabled │  │  ├─ HPA enabled    │  │  ├─ HPA enabled │
│  └─ Redis conn  │  │  └─ Redis conn     │  │  └─ Redis conn  │
└─────────────────┘  └────────────────────┘  └─────────────────┘
        │                    │                      │
        └────────────────────┼──────────────────────┘
                             │
      ┌──────────────────────┼──────────────────────┐
      │                      │                      │
┌─────▼──────┐      ┌────────▼──────┐    ┌─────────▼─────┐
│  PostgreSQL│      │     Redis     │    │  Elasticsearch│
│  15 (RDS)  │      │   7 Cluster   │    │    8 Cluster  │
│ Multi-AZ   │      │  ElastiCache  │    │   3+ nodes    │
│ Read rep.  │      │   Multi-AZ    │    │   Multi-AZ    │
└────────────┘      └───────────────┘    └───────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                   Async & Background Processing                   │
│  RabbitMQ (Multi-AZ) | Scheduler (CronJob) | SQS (optional)      │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    Monitoring & Observability                     │
│  Prometheus | Grafana | ELK Stack | Sentry | DataDog (opt.)      │
└───────────────────────────────────────────────────────────────────┘
```

**Improvements:**
- ✅ Horizontal scaling (multiple EKS pods, auto-scaling)
- ✅ High availability (multi-AZ deployment, active-active)
- ✅ Resilience (circuit breaker, retry logic, fallbacks)
- ✅ Observability (logs, metrics, traces, error tracking)

### 1.3 V3.2+ Target (Optional Microservices Evolution)

For Phase 7+ only if throughput demand >5000 concurrent users:

```
┌─────────────────────────────────────────────────┐
│          API Gateway (Kong / AWS APIGW)         │
│  ├─ JWT validation                              │
│  ├─ Rate limiting                               │
│  ├─ Request/response transformation             │
│  └─ Service routing                             │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────┐
    │            │            │          │
┌───▼──┐ ┌──────▼───┐ ┌──────▼────┐ ┌──▼──────┐
│Auth  │ │Finance   │ │Sales      │ │HR       │
│Svc   │ │Service   │ │Service    │ │Service  │
└──────┘ └──────────┘ └───────────┘ └─────────┘
    │         │           │          │
    └─────────┼───────────┼──────────┘
              │
    ┌─────────▼──────────┐
    │  Service Bus       │
    │  (RabbitMQ / Kafka)│
    └──────────────────┘
              │
    ┌─────────▼──────────────────┐
    │  Shared Data Layer          │
    │  ├─ PostgreSQL (events log) │
    │  ├─ Redis (cache)           │
    │  └─ Elasticsearch (search)  │
    └────────────────────────────┘
```

**Trade-offs:**
- ✅ Independent scaling per service
- ✅ Independent deployments
- ✅ Polyglot tech (optional)
- ❌ Complexity (service discovery, retries, tracing)
- ❌ Increased ops overhead
- ❌ Distributed transaction challenges

**Decision:** Keep monolith through Phase 6; transition to microservices in Phase 7+ only if demand justifies.

---

## 2. Infrastructure Architecture (V3.0 Production)

### 2.1 AWS Cloud Infrastructure

#### 2.1.1 Networking

**VPC Design:**

```yaml
VPC: dnpeople-vpc (10.0.0.0/16)
├── Public Subnets (for ALB)
│   ├── AZ-1: 10.0.1.0/24 (us-east-1a)
│   ├── AZ-2: 10.0.2.0/24 (us-east-1b)
│   └── AZ-3: 10.0.3.0/24 (us-east-1c)
├── Private Subnets (for EKS nodes)
│   ├── AZ-1: 10.0.11.0/24
│   ├── AZ-2: 10.0.12.0/24
│   └── AZ-3: 10.0.13.0/24
├── Database Subnets (RDS)
│   ├── AZ-1: 10.0.21.0/24
│   ├── AZ-2: 10.0.22.0/24
│   └── AZ-3: 10.0.23.0/24
└── Cache Subnets (ElastiCache)
    ├── AZ-1: 10.0.31.0/24
    ├── AZ-2: 10.0.32.0/24
    └── AZ-3: 10.0.33.0/24

NAT Gateways: 1 per public subnet (high availability, auto-failover)
Internet Gateway: 1 (ingress for clients)
VPN/Direct Connect: Optional (for on-prem integration, Phase 7+)
```

**Security Groups:**

```yaml
sg-alb:
  Inbound:
    - HTTP 80 (0.0.0.0/0, redirect to 443)
    - HTTPS 443 (0.0.0.0/0)
  Outbound:
    - All traffic to EKS (sg-eks)

sg-eks:
  Inbound:
    - Custom TCP 3000 (from sg-alb)
    - Custom TCP 9090 (Prometheus, from sg-monitoring)
  Outbound:
    - PostgreSQL 5432 (to sg-rds)
    - Redis 6379 (to sg-elasticache)
    - Elasticsearch 9200 (to sg-elasticsearch)
    - RabbitMQ 5672 (to sg-rabbitmq)
    - HTTPS 443 (external APIs: Stripe, Slack, etc.)

sg-rds:
  Inbound:
    - PostgreSQL 5432 (from sg-eks only)

sg-elasticache:
  Inbound:
    - Redis 6379 (from sg-eks only)

sg-elasticsearch:
  Inbound:
    - Elasticsearch 9200 (from sg-eks only)

sg-rabbitmq:
  Inbound:
    - RabbitMQ 5672 (from sg-eks only)
```

#### 2.1.2 Compute (EKS Cluster)

**EKS Configuration:**

```yaml
Cluster Name: dnpeople-prod
Kubernetes Version: 1.28+ (auto-patch)

Node Groups:
  primary-ng:
    Instance type: t4g.medium (2 CPU, 4GB RAM) - spot eligible
    Min nodes: 3 (one per AZ)
    Max nodes: 10 (auto-scale per CPU/mem pressure)
    Disk: 50GB gp3 (auto-expanded)
    IAM role: dnpeople-node-role (ECR access, EBS, CloudWatch)
    
  compute-ng (optional, for heavy workloads):
    Instance type: t4g.large (2 CPU, 8GB RAM)
    Min nodes: 0 (on-demand only)
    Max nodes: 3

Add-ons:
  ✅ VPC CNI (networking)
  ✅ kube-proxy
  ✅ CoreDNS
  ✅ EBS CSI Driver (persistent volumes)
  ✅ CloudWatch Container Insights (monitoring)
  ✅ AWS Load Balancer Controller (ALB/NLB integration)

RBAC:
  Service account: dnpeople-app (K8s workload identity)
  IAM role: dnpeople-app-role (limited permissions)
```

**Helm Deployments:**

```yaml
Namespace: production

Releases:
  1. dnpeople-api (NestJS application)
     Chart: ./k8s/helm/dnpeople-api
     Replicas: 3 (min), 10 (max) via HPA
     CPU request: 250m | limit: 500m
     Memory request: 512Mi | limit: 1Gi
     Health checks:
       Liveness: GET /health (every 30s, timeout 10s)
       Readiness: GET /health/ready (every 10s)
     
  2. dnpeople-frontend (React SPA)
     Chart: ./k8s/helm/dnpeople-frontend
     Replicas: 2 (min), 5 (max)
     Served via nginx in container
     Cache: 1h for JS/CSS, 5min for HTML
     
  3. dnpeople-scheduler (cron jobs)
     Chart: ./k8s/helm/dnpeople-scheduler
     Replicas: 1 (no scaling, time-sensitive)
     Runs: dunning, KPI alerts, report exports
     
  4. dnpeople-monitoring
     Chart: prometheus-community/kube-prometheus-stack
     Namespace: monitoring
     Components: Prometheus, Grafana, AlertManager
```

#### 2.1.3 Databases & Caching

**PostgreSQL (RDS):**

```yaml
Instance Class: db.t4g.large (2 vCPU, 8GB RAM) for production
Engine: PostgreSQL 15.4
Multi-AZ: ✅ (automatic failover in <2 min)
Backup:
  Automatic daily backup: 30 days retention
  Backup window: 03:00–04:00 UTC (off-peak)
  Restore testing: Monthly (automated)

Replicas:
  Read replica 1 (same AZ, standby failover)
  Read replica 2 (another region, optional Phase 7)

Parameter Groups:
  max_connections: 300 (EKS default)
  shared_buffers: 2GB (25% RAM)
  effective_cache_size: 6GB (75% RAM)
  work_mem: 20MB
  maintenance_work_mem: 1GB
  random_page_cost: 1.1 (SSD friendly)
  log_statement: 'all' (audit trail)
  log_min_duration_statement: 1000ms (slow query)

Monitoring:
  RDS Enhanced Monitoring (agent-based)
  CloudWatch Alarms: CPU >80%, connections >250, storage >80%
  Slow query log: sent to CloudWatch Logs → Splunk (optional)

Backup Strategy:
  - Point-in-time restore (PITR) up to 30 days
  - Monthly snapshot export to S3 (encrypted)
  - Backup tested monthly: restore to staging, run smoke tests
```

**Redis Cluster (ElastiCache):**

```yaml
Engine: Redis 7.0 (cluster mode enabled)
Node type: cache.t4g.medium (2 vCPU, 1.55GB RAM)
Cluster Configuration:
  Shards: 2 (for high throughput)
  Replicas per shard: 1 (high availability)
  Nodes: 4 total (2 primary + 2 replica)
  Multi-AZ: ✅

Use cases:
  - Session storage (JWT refresh tokens)
  - Cache layer (query results, API responses)
  - Rate limiting (sliding window counters)
  - Pub/sub (notification channels)

Eviction policy: allkeys-lru (least recently used)
Memory limit: ~1.2GB (alert at 80%)

Monitoring:
  ElastiCache metrics: CPU, network, evictions
  Alerts: Eviction rate >1000/sec, connection failures
```

**Elasticsearch Cluster:**

```yaml
Version: 8.11
Deployment: Managed by AWS OpenSearch (Elasticsearch-compatible)
Node configuration:
  Node type: r6g.large.elasticsearch (2 vCPU, 16GB RAM)
  Nodes: 3 (1 per AZ, minimum for HA)
  Storage: 200GB per node (gp3), auto-expand
  
Shards:
  Default index shard count: 5
  Replicas: 1 (high availability)
  
Index lifecycle:
  Daily rotation (logs, audit trails)
  30-day retention (old indices deleted)
  Warm phase: after 7 days (compress, move to cheaper storage)

Use cases:
  - Full-text search (PO, invoice, document)
  - Audit log indexing
  - Analytics pre-aggregation

Monitoring:
  Index health: yellow/red alerts
  Disk usage: alert >80%
  Query latency: p99 <1s
  Index size: alert if >50GB
```

#### 2.1.4 Message Queue (RabbitMQ)

```yaml
Deployment: Managed by AWS MQ (RabbitMQ 3.12)
Node type: mq.t3.micro (1 vCPU, 1GB RAM)
Deployment mode: Multi-AZ (broker replication)
Brokers: 2 (automatic failover)

Virtual hosts:
  /erp-prod (main application)
  /integration (webhooks, external APIs)
  /notifications (email, in-app)

Exchanges:
  erp.events (fanout, domain events)
  integration.webhooks (topic)
  notifications.requests (direct)

Queues:
  email.queue (100K max length)
  analytics.ingest (streaming)
  webhook.retry (dead-letter queue)

Configuration:
  Auto-acknowledge: disabled (manual ack for durability)
  Message TTL: 24 hours (prevent stale messages)
  Queue TTL: 7 days (auto-expire dead messages)
  Max retries: 3 before dead-letter queue

Monitoring:
  Queue depth: alert if >10K messages
  Consumer lag: alert if >60s
  Broker health: alerts for connection failures
```

### 2.2 Storage & Backup

**S3 Buckets:**

```yaml
Buckets:
  1. dnpeople-uploads (user-generated files)
     Encryption: SSE-S3 (default)
     Versioning: ✅ (30-day rollback)
     Lifecycle: 
       - Glacier after 90 days (cost optimization)
       - Delete after 7 years (compliance retention)
     Backup: Already versioned, multi-region optional

  2. dnpeople-backups (database exports)
     Encryption: SSE-S3 + customer-managed KMS key
     Versioning: ✅
     Lifecycle:
       - Standard for 30 days
       - Glacier for 1 year
     Access: VPC endpoint (no internet traffic)

  3. dnpeople-cdn-cache (static assets)
     CloudFront distribution: ✅
     Cache policy: 1h for JS/CSS, 5min for HTML
     Compress: gzip/brotli enabled

Access Control:
  Cross-Origin Resource Sharing (CORS): Allow React/Mobile origin only
  Block Public Access: ✅ (all buckets private)
  Bucket policies: Least privilege (signed URLs for files)
```

**Disaster Recovery:**

```yaml
Backup Strategy:
  Database:
    - RDS automated backup (30 days, daily)
    - Weekly S3 export (encrypted, versioned)
    - Restore test: monthly (staging environment)
    - RTO: 1 hour | RPO: 5 minutes
    
  Configuration:
    - Infrastructure as Code (Terraform) in GitHub
    - Helm charts in Git (tagged releases)
    - Database schemas in TypeORM migrations
    
  Application State:
    - Redis persistence (RDB snapshots)
    - RabbitMQ queue persistence (published messages)

Failover Process:
  1. Health check detects failure (10s detection time)
  2. RDS automatic failover to read replica (2min)
  3. EKS reschedules pods to healthy nodes (30s)
  4. ALB removes unhealthy targets (instant)
  → Total RTO: ~5 minutes for single node failure
  → Total RTO: ~20 minutes for full region failure (rare)

Disaster Recovery Drill:
  Frequency: Quarterly
  Test: Restore from backup to staging, run smoke tests
  Owner: DevOps team
  Success criteria: Full restore in <1h with zero data loss
```

---

## 3. Application Architecture

### 3.1 API Design & Versioning

**REST API Contract:**

```typescript
// Base URL: https://api.dnpeople.id/api/v1/

// Request format (all endpoints)
{
  "method": "GET|POST|PUT|DELETE",
  "path": "/api/v1/{resource}/{id}?filter=...&sort=...&page=1&limit=50",
  "headers": {
    "Authorization": "Bearer {jwt_token}",
    "Content-Type": "application/json",
    "X-Tenant-ID": "{tenantId}", // Multi-tenancy
    "X-Request-ID": "{uuid}" // Tracing
  }
}

// Response format (standardized)
{
  "success": true,
  "data": { /* resource or array */ },
  "meta": {
    "timestamp": "2026-07-07T10:30:00Z",
    "requestId": "{uuid}",
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1000,
      "hasNext": true
    }
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "meta": { "timestamp": "...", "requestId": "..." }
}

// API versioning strategy:
// - v1: current (2026)
// - v2: planned for Phase 7 (breaking changes)
// - Deprecation period: 12 months (v1 support ends Q3 2027)
// - Consumer notification: 6 months advance warning via email + changelog
```

**Endpoint Categories:**

```
Core ERP:
  /api/v1/finance/* (GL, AP, AR, tax)
  /api/v1/sales/* (orders, quotations, AR)
  /api/v1/supply-chain/* (PO, inventory, MRP)
  /api/v1/hr/* (payroll, leave, employees)
  /api/v1/manufacturing/* (BOM, MO, capacity)
  /api/v1/projects/* (tasks, budgets, timesheets)
  /api/v1/crm/* (leads, opportunities, accounts)
  /api/v1/fixed-assets/* (register, depreciation)

Admin & Reporting:
  /api/v1/reports/* (CRUD custom reports)
  /api/v1/analytics/* (ML predictions, charts)
  /api/v1/dashboards/* (dashboard builder)
  /api/v1/workflows/* (workflow engine, inbox, SLA)

Multi-tenancy:
  /api/v1/tenants/* (provision, suspend, billing)
  /api/v1/users/* (manage users per tenant)

Platform:
  /api/v1/integrations/* (3rd-party apps gallery)
  /api/v1/webhooks/* (outbound events)
  /api/v1/platform/registry (microservice registry)

Portal (separate JWT):
  /api/v1/portal/login (customer/vendor portal)
  /api/v1/portal/invoices (portal customer: view invoices)
  /api/v1/portal/orders (portal vendor: confirm POs)
  /api/v1/portal/tickets (support tickets)
```

### 3.2 Authentication & Authorization

**Multi-Tenant JWT Architecture:**

```typescript
// Access Token (15 min expiry)
{
  "sub": "user-uuid",
  "email": "user@company.com",
  "tenantId": "tenant-uuid",
  "roles": ["admin", "finance_manager"],
  "permissions": ["read:finance", "write:reports"],
  "org": "PT Contoh Teknologi",
  "type": "access",
  "iat": 1720337400,
  "exp": 1720338300,
  "aud": "dnpeople-web"
}

// Refresh Token (7 days expiry)
{
  "sub": "user-uuid",
  "tenantId": "tenant-uuid",
  "type": "refresh",
  "iat": 1720337400,
  "exp": 1720942200
}

// Portal Token (separate, for B2B2C portal access)
{
  "sub": "vendor-uuid",
  "vendorId": "vendor-uuid",
  "type": "portal",
  "permissions": ["read:portal_orders", "write:portal_uploads"],
  "exp": 1720942200,
  "aud": "dnpeople-portal"
}

// Token issuance flow:
POST /api/v1/auth/login
  → Validate email + password (bcrypt compare)
  → Check MFA required? (TOTP backup code)
  → Verify tenant active (not suspended)
  → Generate access + refresh tokens
  → Return both tokens + user metadata

// Refresh token flow:
POST /api/v1/auth/refresh
  → Validate refresh token signature + expiry
  → Check revocation list (Redis blacklist)
  → Issue new access token
  → Option: rotate refresh token (7-day rolling window)

// Logout:
POST /api/v1/auth/logout
  → Add refresh token to Redis blacklist (24h TTL)
  → Clear session cookies (frontend handles)
  → Optionally revoke all sessions (logout all devices)

// 2FA Setup (TOTP):
POST /api/v1/auth/2fa/setup
  → Generate TOTP secret (otplib)
  → Return QR code + backup codes
  → Verify with user-provided code before enabling

// SSO (Google OAuth 2.0):
GET /api/v1/auth/google/callback
  → Exchange code for Google ID token
  → Extract email + profile
  → Auto-provision user if tenant allows
  → Issue dnPeople access + refresh tokens
```

**RBAC Model:**

```yaml
Roles hierarchy (tenant-level):
  admin:
    - All permissions in tenant
    - User management, billing, integrations
    
  finance_manager:
    - AP/AR/GL module full access
    - Cannot: delete transactions, change chart of accounts
    
  sales_manager:
    - SO/quotation/credit limit management
    - Cannot: modify pricing, change discount policy
    
  hr_manager:
    - Payroll, leave, employee records
    - Cannot: delete employees, view compensation
    
  viewer:
    - Read-only access to assigned modules
    - No write permissions

Permissions model (granular):
  resource:action (e.g., "finance:write", "reports:delete")
  Checked at route guard level:
    @UseGuards(RolesGuard)
    @RequirePermissions('finance:write', 'finance:read')
    async updateGLAccount() { ... }

Field-level encryption (PII):
  Applies to: email, phone, bank account, NPWP, salary
  Encryption: AES-256-GCM
  Key rotation: Quarterly
  Access audit: Every field-level read logged
```

### 3.3 Data Model & Multi-Tenancy

**Tenant Isolation Strategy:**

```yaml
Row-level isolation (current default):
  Every table has tenantId column
  Row-level security policy (PostgreSQL):
    CREATE POLICY tenant_isolation ON users
      USING (tenant_id = current_user_id::uuid)
  
  Pros:
    ✅ Simpler operations (single database)
    ✅ Easier backup/restore
    ✅ Lower infrastructure cost
    ✅ Easier cross-tenant queries (reporting)
  
  Cons:
    ❌ One tenant can affect others (noisy neighbor)
    ❌ Harder to scale individual tenant (all in same DB)

Schema-per-tenant isolation (optional, Phase 7):
  Enable via ENV: TENANT_SCHEMA_MODE=schema
  Creates separate schema per tenant:
    public (shared config, users)
    tenant_uuid_1 (GL, orders, employees for tenant 1)
    tenant_uuid_2 (GL, orders, employees for tenant 2)
  
  Migration logic:
    On tenant signup:
      1. Create schema: CREATE SCHEMA tenant_{uuid}
      2. Run migrations: TypeORM migration:run (target schema)
      3. Register in platform registry
  
  Pros:
    ✅ Complete isolation (data + schema)
    ✅ Per-tenant customization (extra columns)
    ✅ Better performance under heavy load
    ✅ Easy data deletion (DROP SCHEMA)
  
  Cons:
    ❌ Complex deployment (N schemas = N migration runs)
    ❌ Shared connection pool issues
    ❌ Reporting across tenants harder
    ❌ Backup/restore per tenant (slower)

Hybrid approach (recommended):
  - Row-level for Startup/Professional tiers (shared schema)
  - Schema-per-tenant for Enterprise tier (dedicated resources)
  - Gradual migration path as tenant grows
  - Feature flag: TENANT_ISOLATION_LEVEL env var
```

**Key entities for V3.0:**

```typescript
// Core multi-tenant tables
interface Tenant {
  id: UUID;
  name: string;
  legalName: string;
  npwpNumber: string;
  taxRegime: "normal" | "ppn_exemption";
  planId: string; // "starter" | "professional" | "enterprise"
  status: "active" | "suspended" | "trial";
  createdAt: Date;
  deletedAt?: Date; // Soft delete for GDPR
}

interface User {
  id: UUID;
  tenantId: UUID;
  email: string; // Indexed (encrypted)
  passwordHash: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  mfaEnabled: boolean;
  mfaSecret?: string; // Encrypted
  lastLogin?: Date;
  createdAt: Date;
  deletedAt?: Date; // GDPR erasure
}

interface AuditLog {
  id: UUID;
  tenantId: UUID;
  userId: UUID;
  action: "CREATE" | "READ" | "UPDATE" | "DELETE";
  resourceType: string;
  resourceId: UUID;
  changes?: Record<string, [before, after]>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  immutable: boolean; // Cannot be deleted (compliance)
}

// Domain entities (all have tenantId)
interface GlAccount { tenantId, code, name, accountType, ... }
interface SalesOrder { tenantId, orderNumber, customerId, items, ... }
interface Employee { tenantId, employeeId, firstName, salary, ... }
// ... and 24 other domain models
```

---

## 4. Security Architecture

### 4.1 Defense in Depth

```
Layer 1: Perimeter
  └─ Cloudflare DDoS protection + WAF
  └─ AWS Shield Standard (auto-enable)
  └─ Rate limiting: 100 req/min per IP (sliding window)

Layer 2: Transport
  └─ TLS 1.3 only (HTTP/2)
  └─ Certificate: AWS Certificate Manager (auto-renew)
  └─ HSTS header: "max-age=31536000; includeSubDomains"

Layer 3: Authentication
  └─ JWT access tokens (15 min) + refresh (7 days)
  └─ 2FA TOTP (optional, enforced for admin)
  └─ Backup codes (10 single-use, encrypted)
  └─ SSO: Google OAuth 2.0, SAML (Phase 7)

Layer 4: Authorization
  └─ RBAC (role-based access control)
  └─ Field-level encryption (PII)
  └─ Row-level security (PostgreSQL policies)
  └─ API-level permission checks

Layer 5: Input Validation
  └─ Zod schema validation (TypeScript)
  └─ Max file size: 100MB
  └─ File type whitelist: PDF, DOC, XLSX, PNG, JPG
  └─ SQL injection prevention: Parameterized queries (TypeORM)

Layer 6: Data Protection
  └─ Encryption at rest (AES-256)
  └─ Field encryption (PII, bank accounts)
  └─ Secrets management (AWS Secrets Manager)
  └─ Database activity monitoring (CloudTrail)

Layer 7: Observability
  └─ Security logging (Cloudtrail, VPC Flow Logs)
  └─ Failed login tracking (alert after 5 failures)
  └─ Unusual activity detection (ML anomaly, Phase 6)
  └─ Incident response playbook (RACI matrix)
```

### 4.2 Compliance Controls

**SOC 2 Type II Mapping:**

```yaml
CC (Common Criteria) Controls:

CC6 (Logical & Physical Access):
  CC6.1: Enforce authentication
    → JWT + 2FA TOTP + Google SSO
    → Test: Quarterly penetration test
  
  CC6.2: Role-based access
    → RBAC model + granular permissions
    → Test: Access matrix review (monthly)
  
  CC6.3: Encrypt sensitive data
    → AES-256 at rest + TLS 1.3 in transit
    → Test: Encryption key audit (quarterly)

CC7 (System Monitoring):
  CC7.1: Monitor user activity
    → Audit log in Elasticsearch
    → Immutable log entries
    → Retention: 7 years (compliance)
  
  CC7.2: Detect anomalies
    → Failed login attempts >5 = block 30min
    → Unusual API activity = alert + investigation
    → Test: Simulated attack quarterly

CC8 (Change Management):
  CC8.1: Change authorization
    → GitHub PR review (2 approvals + CODEOWNERS)
    → Deployment to prod requires approval
    → Audit trail: who deployed what when
  
  CC8.2: Test changes
    → Unit tests (≥60% coverage)
    → E2E tests (Cypress 15 specs)
    → Staging env (production clone)
    → Load testing (k6) before prod release

CC9 (Risk Assessment):
  CC9.1: Identify assets
    → Inventory: 24 modules + 3 tiers
    → Sensitivity: PII, financial, tax data
  
  CC9.2: Assess vulnerabilities
    → Dependency scanning (Snyk, npm audit)
    → Code scanning (SonarQube)
    → Penetration test (annual, Q1)
    → CVSS 9+ severity = immediate patching

Test Frequency:
  - Automated (continuous): Snyk, SonarQube, npm audit
  - Manual (quarterly): Penetration test, access review
  - Tabletop (semi-annual): Incident response simulation
```

**UU PDP (Indonesian Data Protection) Compliance:**

```yaml
Requirements (from Indonesian Privacy Law):

1. Consent Management
   - Explicit opt-in for data processing
   - Consent form at signup (checkbox)
   - Audit trail: when, what, how user consented
   - Right to withdraw (UI button → anonymization)

2. Data Minimization
   - Only collect necessary data (purpose-bound)
   - No secondary use without new consent
   - Regular review: delete unused fields

3. Subject Access Rights
   - API: GET /api/v1/gdpr/export
   - Response: JSON dump of all personal data (24h)
   - Format: Machine-readable (GDPR-compatible)
   - No additional charge

4. Right to Erasure
   - API: DELETE /api/v1/gdpr/erase
   - Hard-delete (not soft-delete) or anonymization
   - 30-day grace period (reversible)
   - After 30 days: permanent deletion + S3 purge
   - Audit: log who requested erasure, when, why

5. Breach Notification
   - Detect breach within 72 hours
   - Notify data subjects within 72 hours (email)
   - Notify Indonesian Data Protection Authority
   - Document: breach date, affected data, impact, measures

6. Data Protection Officer
   - Designated: VP Eng or external DPO
   - Responsible for: policy, consent, breach response
   - Contact published on website

Implementation:
  - Privacy policy (translated to Indonesian)
  - Data Processing Agreement (DPA) template
  - Standard Contractual Clauses (SCCs) for cross-border
  - Incident response plan (30-person-day scenario)
```

---

## 5. Scalability & Performance

### 5.1 Scaling Strategy

**Horizontal Scaling (Pod/Instance):**

```yaml
Kubernetes Horizontal Pod Autoscaler (HPA):
  - Metric: CPU usage
  - Target: 70% average CPU per pod
  - Min replicas: 3 (minimum HA)
  - Max replicas: 10 (cost control)
  - Scale-up delay: 30s (instant response)
  - Scale-down delay: 300s (avoid flapping)
  
  Example:
    If CPU > 70% for 1 min → add pod
    If CPU < 50% for 5 min → remove pod (if >3 running)

Predictive Scaling (optional, Phase 6):
  - Historical traffic patterns (time-of-day, day-of-week)
  - Pre-scale before peak (e.g., scale up at 8am before business day)
  - Reduce cost by 20% (fewer sudden scale-ups)
```

**Vertical Scaling (Database):**

```yaml
RDS Parameter Changes (as data grows):
  0–100GB: db.t4g.large (2 vCPU, 8GB RAM)
  100–500GB: db.r6g.xlarge (4 vCPU, 32GB RAM)
  500GB–1TB: db.r6g.2xlarge (8 vCPU, 64GB RAM)
  >1TB: Consider read replicas or sharding strategy
  
  Apply changes: During scheduled maintenance window (7–8am UTC, 0-downtime failover)
```

**Database Query Optimization:**

```sql
-- Slow queries (monitored via log_min_duration_statement: 1000)

-- Problem: N+1 queries on large datasets
-- Solution: Use JOIN or batch queries
SELECT o.id, o.customer_id, c.name FROM sales_order o
JOIN customer c ON o.customer_id = c.id
WHERE o.tenant_id = $1 LIMIT 1000;

-- Problem: Full table scan on large audit table
-- Solution: Composite index
CREATE INDEX idx_audit_tenant_timestamp ON audit_log(tenant_id, timestamp DESC);

-- Problem: Elasticsearch slow aggregations
-- Solution: Pre-aggregation, smaller indices
DELETE FROM audit_log WHERE tenant_id = $1 AND timestamp < NOW() - INTERVAL '90 days';
```

**Caching Strategy (Redis):**

```yaml
Query result cache:
  - Finance dashboards: 5 min TTL
  - Sales pipeline: 1 min TTL
  - Reports: 10 min TTL (user-specific)
  - Master data (chart of accounts): 1 day TTL

User session cache:
  - JWT payload cache: 15 min (invalidate on permission change)
  - Permission cache: 1 hour (sync with DB)
  - Feature flags: 10 min (enable A/B testing)

Rate limiting:
  - Sliding window counter (Redis ZSET)
  - 100 requests per 60 seconds per IP
  - 1000 requests per 60 seconds per tenant (API quota)
  - 10 concurrent exports per tenant

Pub/Sub channels:
  - Notifications: real-time alerts to client
  - Cache invalidation: broadcast to all pods
  - Workflow events: SLA monitoring
```

### 5.2 Performance Benchmarks

**Target Metrics (V3.0 GA):**

```
API Latency:
  p50: <100ms (median request)
  p95: <500ms (95% of requests)
  p99: <2s   (99% of requests)
  
  Goal: Support 1000 concurrent users with p95 <500ms

Frontend Performance:
  First Contentful Paint (FCP): <2s
  Largest Contentful Paint (LCP): <2.5s
  Cumulative Layout Shift (CLS): <0.1
  Time to Interactive (TTI): <3s
  
  Measured via: Google Lighthouse, Web Vitals
  Target: Lighthouse score >90

Search Performance (Elasticsearch):
  Full-text search: <200ms (p99)
  Aggregations: <500ms (p99)
  Indexed documents: 100M+ (scalable)

Database Performance:
  Transaction commit latency: <50ms (p99)
  Query latency (p99): <1s (no full table scans)
  Replication lag: <5s (read replica)

Load Test Results (k6 script):
  1000 VUs (virtual users) simultaneous
  100 requests per second sustained
  Connection pool: 300 (PostgreSQL max)
  Error rate: <0.1% (target)
```

---

## 6. Disaster Recovery & Business Continuity

### 6.1 RTO/RPO Targets

| Failure Scenario | RTO | RPO | Strategy |
|------------------|-----|-----|----------|
| Single pod crash | 30s | 0 | Auto-restart via K8s |
| Single node failure | 2min | 0 | Pod reschedule, persistent vol |
| Database node failure | 2min | 0 | RDS Multi-AZ failover |
| Redis cache loss | 1min | 0 | Recompute on-miss, allow stale |
| RabbitMQ failure | 5min | 0 | Multi-AZ broker replication |
| Entire AZ down | 15min | 5min | Load balancer → other AZs |
| Entire region down | 4h | 1h | Restore from backup to DR region |
| Major security breach | 1h | 5min | Incident response team activated |

### 6.2 Backup & Restore Procedures

**Automated Backups:**

```bash
#!/bin/bash
# Daily backup script (runs at 3am UTC)

# 1. PostgreSQL backup
aws rds create-db-snapshot \
  --db-instance-identifier dnpeople-prod \
  --db-snapshot-identifier dnpeople-prod-$(date +%Y%m%d)

# 2. S3 bucket versioning (automatic)
# 3. Elasticsearch snapshot (daily via plugin)
# 4. Config backup (Terraform state, Helm values)
git -C /path/to/infrastructure pull --ff-only
git -C /path/to/infrastructure tag backup-$(date +%Y%m%d)
git -C /path/to/infrastructure push --tags

# 5. Retention
# Keep: 30 daily, 4 weekly, 12 monthly
aws rds describe-db-snapshots \
  --query 'DBSnapshots[?SnapshotCreateTime<`2026-06-07`].DBSnapshotIdentifier' \
  --output text | xargs -I {} aws rds delete-db-snapshot --db-snapshot-identifier {}
```

**Restore Testing:**

```bash
#!/bin/bash
# Monthly restore test (non-production environment)

# 1. Restore RDS from backup to staging
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier dnpeople-staging-restore \
  --db-snapshot-identifier dnpeople-prod-$(date +%Y%m%d -d "30 days ago")

# 2. Run smoke tests
cd /path/to/api && npm run test:smoke

# 3. Verify data integrity
SELECT COUNT(*) FROM sales_order WHERE tenant_id = '...';
-- Compare with production count

# 4. Cleanup
aws rds delete-db-instance \
  --db-instance-identifier dnpeople-staging-restore \
  --skip-final-snapshot
```

### 6.3 Incident Response Playbook

**Severity Levels:**

```yaml
Level 1 (Critical): Service completely down, data loss risk
  - SLA: <30min to fix or escalate
  - Notification: CEO, CTO, on-call engineer
  - Communication: Customer email every 15min

Level 2 (Major): Partial outage, core features unavailable
  - SLA: <2h to fix or escalate
  - Notification: Engineering team + customer success
  - Communication: Customer Slack channel, every 30min

Level 3 (Minor): Degraded performance, single feature affected
  - SLA: <4h to fix
  - Notification: On-call engineer + team chat
  - Communication: Status page update

Example: Database connection pool exhaustion (Level 2)
  
  Detect:
    - CloudWatch alarm: "RDS Connections >250" fires
    - Alert → Slack #incidents channel + PagerDuty
    
  Initial response (5min):
    - Page on-call engineer
    - Declare SEV-2 incident in war room (Slack thread)
    - Start timeline tracking
    
  Diagnosis (10min):
    - Check RDS connections: SELECT count(*) FROM pg_stat_activity
    - Check EKS pod logs: kubectl logs -f deployment/dnpeople-api
    - Hypothesis: Slow query blocking connections
    
  Mitigation (20min):
    - Kill long-running query: SELECT pg_terminate_backend(pid)
    - Scale up EKS pods: kubectl scale deployment dnpeople-api --replicas=5
    - Monitor for recovery
    
  Post-incident (next day):
    - Root cause analysis meeting
    - Implement monitoring alert for slow queries
    - Add connection pooling optimization
    - Update runbook with lesson learned
```

---

## 7. Monitoring & Observability

### 7.1 Metrics Stack

**Prometheus Targets:**

```yaml
Targets:
  - NestJS app (port 9090): CPU, memory, request count, latency
  - PostgreSQL (via postgres_exporter): connections, queries, replication
  - Redis (via redis_exporter): memory, keys, operations
  - Elasticsearch (native): cluster health, indexing rate
  - Kubernetes (kubelet): pod CPU/memory, node status
  - AWS (CloudWatch exporter): RDS, S3, ALB metrics

Retention: 15 days (local) + 1 year (S3 archive)
Scrape interval: 15 seconds (default)
Query examples:
  - API p95 latency: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
  - Error rate: rate(http_requests_total{status=~"5.."}[5m])
  - Pod CPU: sum(container_cpu_usage_seconds_total) by (pod_name)
```

**Grafana Dashboards:**

```yaml
Dashboards:
  1. System Health (1 dashboard)
     - API uptime (green/red)
     - Error rate (5min rolling)
     - Request latency (p50/p95/p99)
     - Database connections
     - Redis memory usage
     
  2. Business Metrics (by domain)
     - Finance: GL transactions/day, AP aging, AR days
     - Sales: Orders/day, pipeline value, quote-to-order
     - HR: Payroll processing time, leave utilization
     - Inventory: Stock turnover, reorder point violations
     
  3. Infrastructure (EKS + RDS)
     - Node CPU/memory
     - Pod restart count
     - RDS CPU/connections/storage
     - Network I/O
     
  4. Compliance & Security
     - Failed login attempts
     - API key usage (integrations)
     - Data export requests (GDPR)
     - Audit log volume
```

### 7.2 Logging Stack (ELK)

```yaml
Log Sources:
  - NestJS logs (stdout → Docker → ELK): json format
  - PostgreSQL logs: slow query log (>1s)
  - Nginx access logs: reverse proxy traffic
  - Cloudtrail logs: AWS API calls
  - VPC Flow Logs: network traffic

Log Format (structured JSON):
  {
    "timestamp": "2026-07-07T10:30:00.123Z",
    "level": "info|warn|error",
    "service": "dnpeople-api",
    "pod": "dnpeople-api-xyz",
    "message": "Order created",
    "userId": "user-uuid",
    "tenantId": "tenant-uuid",
    "requestId": "req-uuid",
    "duration_ms": 145,
    "status": 201,
    "metadata": { /* custom fields */ }
  }

Index lifecycle:
  - Daily rotation: logs-dnpeople-2026.07.07
  - 30-day retention (delete old indices)
  - Warm phase: compress + move to cheaper storage after 7 days

Queries:
  - Errors in last hour: level:error AND timestamp:[now-1h TO now]
  - Slow API calls: duration_ms:>1000
  - User audit trail: userId:"abc-def" OR tenantId:"xyz"
  - Failed logins: message:"Login failed" AND timestamp:[now-24h TO now]

Alerting:
  - 5 errors in 5 min → alert
  - API latency p99 >2s for 10 min → alert
  - No logs for 30 min (potential crash) → alert
```

### 7.3 Distributed Tracing (optional Phase 6)

```yaml
Technology: Jaeger (open-source) or Datadog APM

Instrumentation:
  Every request traced (sample rate: 10% in prod)
  Spans:
    - HTTP request → response
    - Database query
    - Redis operation
    - RabbitMQ publish
    - External API call (Stripe, Slack)

Correlation:
  X-Request-ID header propagated across services
  Allows end-to-end trace: frontend → API → DB

Use cases:
  - Latency debugging (which operation is slow?)
  - Dependency analysis (service call graph)
  - Performance profiling (hot path identification)
```

---

## 8. Deployment & Release Management

### 8.1 Deployment Pipeline

```yaml
Branch strategy: GitHub Flow
  - main branch: production-ready (tag releases)
  - feature branches: develop features, PR review
  - hotfix branches: emergency production fixes

CI/CD pipeline (GitHub Actions):
  Push to PR:
    1. Lint (ESLint, Prettier)
    2. Unit tests (Jest, >60% coverage gate)
    3. Security scan (Snyk, npm audit)
    4. Build Docker image
    5. E2E tests (Cypress, staging environment)
    6. Code review required (2 approvals)

  Merge to main:
    1. Build production Docker image
    2. Tag: git tag v3.0.1 (semver)
    3. Push to ECR (AWS Elastic Container Registry)
    4. Create GitHub release with changelog

  Deployment:
    Staging (on every main commit):
      1. Deploy to staging EKS cluster
      2. Smoke tests (10 min)
      3. Notify team on Slack
      4. Available for manual testing
    
    Production (manual trigger via GitHub UI):
      1. Create deployment request (approvals required)
      2. Deploy to prod EKS (blue-green deployment)
      3. Health checks (5 min)
      4. Smoke tests (10 min)
      5. Canary release: route 10% traffic to new version (5 min)
      6. Gradual rollout: 25% → 50% → 100% (10 min each)
      7. Monitor error rate (alert if >0.1% errors)
      8. Optionally: rollback to previous version
    
    Rollback (if issues detected):
      kubectl rollout undo deployment/dnpeople-api -n production
```

### 8.2 Release Management

```yaml
Release cadence: Bi-weekly (every 2 weeks)
  - Sprint planning (Mon 10am)
  - Development (Mon–Thu)
  - Testing (Fri)
  - Release (Tue following week)
  
  Features + bug fixes batched per release
  Hotfixes deployed immediately (out-of-cycle)

Versioning:
  Semantic Versioning (MAJOR.MINOR.PATCH)
  - v3.0.0 (Phase 5 go-live, Q3 2026)
  - v3.0.1 (bug fixes)
  - v3.1.0 (Phase 6 features, Q4 2026)
  - v4.0.0 (breaking API changes, Phase 7)

Changelog:
  Auto-generated from commit messages (Conventional Commits)
  Format:
    feat: Add AI copilot for natural language queries
    fix: Resolve GL reconciliation bug with intercompany
    perf: Optimize invoice search latency (p99 <500ms)
    docs: Update SOC 2 compliance procedures

Database migrations:
  Every release includes schema changes (if any)
  Migrations: TypeORM migration:generate
  Deployment: Auto-run before app startup
  Testing: Dry-run on staging first
  Rollback: Keep old migrations available
```

---

## 9. Technology Stack Summary (V3.0)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19 | UI |
| | Vite | 8 | Build tool |
| | TypeScript | 6 | Type safety |
| | Tailwind CSS | 4 | Styling |
| | Redux Toolkit | 2 | State management |
| **Backend** | NestJS | 10 | API framework |
| | TypeScript | 5.1 | Language |
| | TypeORM | 0.3 | ORM |
| **Database** | PostgreSQL | 15 | OLTP |
| | Redis | 7 | Cache + sessions |
| | Elasticsearch | 8.11 | Search + logging |
| **Message Queue** | RabbitMQ | 3.12 | Async processing |
| **Container** | Docker | Latest | Containerization |
| **Orchestration** | Kubernetes (EKS) | 1.28 | Container orchestration |
| **IaC** | Terraform | 1.5 | Infrastructure as Code |
| **CI/CD** | GitHub Actions | Native | Pipeline automation |
| **Monitoring** | Prometheus | 2.x | Metrics collection |
| | Grafana | 10.x | Dashboards |
| | ELK Stack | 8.x | Centralized logging |
| | Sentry | Latest | Error tracking |
| **Cloud** | AWS | — | Cloud provider |
| | CloudFront | — | CDN |
| | Cloudflare | — | DDoS + WAF |

---

## 10. Appendices

### 10.1 Configuration Management

```yaml
Environment Variables (12-factor app):

Production (dnpeople-prod):
  NODE_ENV=production
  LOG_LEVEL=info
  DB_HOST=dnpeople-prod.xxx.rds.amazonaws.com
  DB_PORT=5432
  DB_DATABASE=dnpeople_prod
  DB_USER={from AWS Secrets Manager}
  DB_PASSWORD={from AWS Secrets Manager}
  REDIS_URL=redis://dnpeople-redis-prod.xxx.cache.amazonaws.com:6379
  ELASTICSEARCH_URL=https://dnpeople-es-prod.us-east-1.es.amazonaws.com
  RABBITMQ_URL=amqps://user:pass@dnpeople-mq-prod.xxx.mq.amazonaws.com:5671
  JWT_SECRET={from AWS Secrets Manager}
  JWT_EXPIRATION=900 (15 min)
  REFRESH_TOKEN_EXPIRATION=604800 (7 days)
  STRIPE_SECRET_KEY={from AWS Secrets Manager}
  STRIPE_WEBHOOK_SECRET={from AWS Secrets Manager}
  SMTP_HOST=smtp.sendgrid.net
  SMTP_PORT=587
  SMTP_USER=apikey
  SMTP_PASSWORD={from AWS Secrets Manager}
  TENANT_ISOLATION_LEVEL=row-level # row-level or schema
  SOC2_MODE=enabled
  GDPR_MODE=enabled
  UU_PDP_MODE=enabled (Indonesia compliance)
  FEATURE_AI_COPILOT=false (enable in Phase 6)
  FEATURE_ADVANCED_BI=false (enable in Phase 6)
  FEATURE_OCR=false (enable in Phase 7)
  SENTRY_DSN={from AWS Secrets Manager}
  DATADOG_API_KEY={from AWS Secrets Manager} (optional)

Staging (dnpeople-staging):
  Similar to production but:
  - LOG_LEVEL=debug
  - DB_DATABASE=dnpeople_staging
  - Smaller resource limits
  - Feature flags all enabled (for testing)
  - Shorter log retention (7 days vs 30 days)
```

### 10.2 Runbooks

**Runbook: High CPU Usage Incident**

```markdown
## Symptom
CloudWatch alarm: "EKS Node CPU >90%" fires

## Detection
- Prometheus metric: node_cpu_usage_percent > 90
- Alert → PagerDuty → Slack #incidents
- Check time: usually during batch processing (night)

## Steps
1. Identify which pod is consuming CPU:
   $ kubectl top pods -n production --sort-by=cpu
   → Look for outlier (e.g., dnpeople-scheduler pod)

2. Check logs:
   $ kubectl logs -f deployment/dnpeople-api --tail=100 -n production
   → Look for slow query patterns or infinite loops

3. If database query is slow:
   $ psql -h dnpeople-prod.xxx.rds.amazonaws.com
   SELECT query, calls, mean_time FROM pg_stat_statements 
   ORDER BY mean_time DESC LIMIT 10;
   → Kill long-running query: SELECT pg_terminate_backend(pid)

4. If pod is stuck:
   $ kubectl restart deployment/dnpeople-api -n production
   → Kubernetes will scale down + up

5. If still high after 5 min:
   $ kubectl scale deployment/dnpeople-api --replicas=5 -n production
   → Add more replicas to distribute load

6. Root cause investigation:
   - Check Git commit log: any recent changes?
   - Check application metrics: new reports being run?
   - Check Elasticsearch: heavy indexing operation?

## Prevention
- Add alerts for database connection saturation
- Optimize slow queries (quarterly)
- Load test before releases (k6 script)
```

**Runbook: Database Connection Pool Exhausted**

```markdown
## Symptom
Application slowdown, "Too many connections" error in logs

## Diagnosis
$ psql -h dnpeople-prod.xxx.rds.amazonaws.com
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
→ Look for open idle connections

## Fix Options
1. Increase pool size (temporary):
   kubectl set env deployment/dnpeople-api DB_POOL_SIZE=50 -n production

2. Kill idle connections:
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
   WHERE state = 'idle' AND query_start < NOW() - INTERVAL '10 min';

3. Scale RDS instance:
   aws rds modify-db-instance \
     --db-instance-identifier dnpeople-prod \
     --db-instance-class db.r6g.xlarge \
     --apply-immediately

## Prevention
- Monitor connection count (alert at 250)
- Set idle connection timeout (10 min)
- Implement connection pooling (PgBouncer, Phase 6)
```

---

**Document Approval:**
- [ ] VP Engineering
- [ ] CTO
- [ ] DevOps Lead
- [ ] Security Officer

**Version History:**
- V1.0 (Jan 2025): Phase 0–3 monolith architecture
- V2.0 (May 2026): Phase 4 scalability improvements
- **V3.0 (Jul 2026)**: Production-ready enterprise architecture

*Maintained by: VP Engineering · PT. Dozer Napitupulu Technology*
