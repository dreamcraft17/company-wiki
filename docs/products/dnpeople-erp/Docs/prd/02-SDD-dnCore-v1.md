# System Design Document (SDD) — dnCore v1.0

**Product Name:** dnCore  
**Version:** 1.0  
**Date:** 19 July 2026  
**Owner:** Dozer (CEO + Tech Lead) · PT. Dozer Napitupulu Technology · [dntech.id](https://dntech.id)  
**Repository:** [github.com/dreamcraft17/erp](https://github.com/dreamcraft17/erp)  
**Branch:** `main` · HEAD `f197e07`  
**Status:** Phase 0–4 production architecture ✅  

> **Purpose:** Technical architecture, data design, infrastructure topology, scalability strategy untuk dnCore. Dokumen ini adalah source of truth untuk engineering implementation decisions.

---

## 1. System Architecture Overview

### 1.1 High-Level Topology

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  React SPA (Vite)  │  Expo Mobile MVP  │  Portal SPA        │
│  (localhost:5173)  │  (EAS build)      │  (/portal routes)  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────┴──────────────────────────────────┐
│                    API GATEWAY / LOAD BALANCER               │
│                  (Nginx/ALB, CORS, rate limit)              │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                   NESTJS MONOLITH (API Layer)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ AUTH + IDENTITY LAYER ────────────────────┐             │
│  │ • JWT + refresh token rotation            │             │
│  │ • 2FA TOTP setup/verify                   │             │
│  │ • Google SSO OAuth                        │             │
│  │ • Portal JWT (separate auth)              │             │
│  │ • Throttling + account lockout            │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
│  ┌─ 27 DOMAIN MODULES (IN-PROCESS) ──────────┐             │
│  │ • Auth, Tenants, Finance, Sales, Supply   │             │
│  │   Chain, HR, Manufacturing, Projects,     │             │
│  │   CRM, Fixed Assets, Enterprise,          │             │
│  │   Reporting, Workflow, Analytics,         │             │
│  │   Documents, Integrations, Portal,        │             │
│  │   Billing, GDPR, Compliance, Ops, LMS,   │             │
│  │   Industry, Notifications, Scheduler,    │             │
│  │   Users, Health                           │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
│  ┌─ PLATFORM LAYER (Scaffold) ────────────────┐             │
│  │ • Microservice registry (Phase 7 ready)   │             │
│  │ • ETL framework                           │             │
│  │ • White-label hooks                       │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
│  ┌─ GL INTEGRATION ENGINE ────────────────────┐             │
│  │ • Event-driven GL posting from modules   │             │
│  │ • Double-entry balance validation         │             │
│  │ • Intercompany settlement                 │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
└─────────────────────────┬──────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│   DATA LAYER │  │ CACHE LAYER │  │ SEARCH ENG  │
├──────────────┤  ├─────────────┤  ├─────────────┤
│ PostgreSQL15 │  │  Redis 7    │  │Elasticsearch│
│   (RDS prod) │  │  (cluster)  │  │   8.11      │
│              │  │             │  │             │
│ • 84 entities│  │ • Session   │  │ • Fulltext  │
│ • 15 migr.   │  │ • App cache │  │ • Analytics │
│ • Audit trail│  │ • Queue BLK │  │ • Indexing  │
└──────────────┘  └─────────────┘  └─────────────┘
        │                 │                 │
        └─────────────────┴─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│  ASYNC QUEUE │  │  SCHEDULER  │  │   S3 BLOB  │
├──────────────┤  ├─────────────┤  ├─────────────┤
│ RabbitMQ 3.12│  │ Native cron │  │ AWS S3     │
│  (message    │  │ @nestjs/    │  │ (backups,  │
│   broker)    │  │ schedule    │  │  documents)│
│              │  │             │  │            │
│ • GL events  │  │ • Dunning   │  │ • Archive  │
│ • Workflows  │  │ • Reports   │  │ • Restore  │
│ • Integr.    │  │ • KPI alert │  │   test log │
└──────────────┘  └─────────────┘  └────────────┘
```

### 1.2 Deployment Model

```
┌──────────────────────────────────────────────────────────┐
│              AWS (Production Target)                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─ EKS CLUSTER ──────────────────────────────────┐    │
│  │ • Helm releases: api, frontend, portal         │    │
│  │ • Pod autoscaling (HPA), node groups          │    │
│  │ • Istio service mesh (optional Phase 7)       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ DATA LAYER (RDS + ElastiCache) ──────────────┐    │
│  │ • PostgreSQL 15 Multi-AZ (ap-southeast-3)    │    │
│  │ • Redis cluster (ap-southeast-3)             │    │
│  │ • Automated backups + restore-test           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ STORAGE + CDN ────────────────────────────────┐    │
│  │ • S3 (documents, backups, exports)           │    │
│  │ • CloudFront (frontend SPA, API geo-routing) │    │
│  │ • Elastic Search (managed; optional)         │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ MONITORING + LOGS ────────────────────────────┐    │
│  │ • CloudWatch (logs, metrics, alarms)         │    │
│  │ • Prometheus (app metrics from /metrics)     │    │
│  │ • Grafana (dashboard, SLA tracking)          │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ NETWORKING ───────────────────────────────────┐    │
│  │ • VPC (private subnets for API/data)         │    │
│  │ • NAT GW (outbound SMTP, external APIs)      │    │
│  │ • Security groups (ingress 443 only)         │    │
│  │ • WAF (optional; DDoS protection Phase 7)    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Alternative (on-prem / dev):** `docker-compose.yml` (full stack) · `docker-compose.prod.yml` (hardened)

---

## 2. Technology Stack (Validated)

### 2.1 Runtime & Languages

| Component | Version | Rationale |
|-----------|---------|-----------|
| **Node.js** | 20 LTS | Stable, long-term support (maintained until Apr 2026) |
| **TypeScript** | 5.x | Type safety, better refactoring tooling for monolith |
| **npm** | 10.x | Workspace monorepo support, faster install |

### 2.2 Backend Stack (NestJS 10)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | NestJS | 10.x | Modular architecture, middleware, guards, interceptors |
| **ORM** | TypeORM | 0.3.x | Entity-driven schema, migrations, relation mgmt |
| **Database** | PostgreSQL | 15 | ACID, JSON support, array types, materialized views |
| **Auth** | @nestjs/jwt, Passport | — | JWT, OAuth, TOTP strategies |
| **Validation** | class-validator, class-transformer | — | DTO validation + serialization |
| **API Docs** | Swagger (@nestjs/swagger) | — | OpenAPI 3.0, disabled in production |
| **Scheduling** | @nestjs/schedule | — | Cron jobs, interval tasks |
| **Events** | @nestjs/event-emitter | — | In-process pub/sub for GL events |
| **Queue** | RabbitMQ + Bull (optional) | 3.12 / — | Async job processing |
| **Cache** | Redis + @nestjs/cache-manager | 7.x | Session, query cache, rate limit |
| **Search** | Elasticsearch | 8.11 | Fulltext indexing, fallback graceful |
| **Email** | Nodemailer | — | SMTP, HTML templates, console fallback |
| **Export** | ExcelJS, PDFKit | — | Excel/PDF generation on-demand |
| **Metrics** | prom-client | — | Prometheus `/metrics` endpoint |
| **Security** | Helmet, bcrypt, @nestjs/throttler | — | HTTP headers, password hashing, DDoS throttle |
| **Testing** | Jest, supertest, pg-mem | 29.x | Unit tests, integration tests, in-memory DB mock |

**API Convention:** REST · prefix `/api/v1` · response wrapper: `{ success: boolean, data: T, timestamp: ISO8601, meta?: {} }`

### 2.3 Frontend Stack (React 19 SPA)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 19.x | Component model, hooks, suspense |
| **Build** | Vite | 8.x | Fast HMR, ESM, TypeScript out-of-box |
| **State** | Redux Toolkit | 2.x | Global state, auth + tenant context |
| **Routing** | React Router | 7.x | Client-side SPA routing, nested routes |
| **UI Library** | MUI (Material-UI) | 9.x | Pre-built components, theming |
| **Styling** | Tailwind CSS | 4.x | Utility-first, custom design tokens (dntech brand) |
| **Forms** | react-hook-form, Zod | — | Lightweight, schema validation |
| **Charts** | Recharts | 3.x | React charting, responsive dashboards |
| **HTTP** | Axios | — | Request interceptor (auto token refresh), error handling |
| **i18n** | Custom context (next: i18next) | — | 15 locales, runtime switching |
| **E2E Tests** | Cypress | 15.x | Browser automation, 15+ spec files |

**Build output:** ~450KB gzip (SPA bundle); optimized for <3s LCP on 4G

### 2.4 Mobile Stack (Expo — ON HOLD)

> Native expansion paused Jul 2026. Prefer **mobile-first web SPA** (`frontend/`). Foundation kept under `/mobile`.

| Component | Technology | Notes |
|-----------|-----------|-------|
| **Framework** | React Native (Expo) | ~52.x |
| **Navigation** | React Navigation | 7.x |
| **Storage** | expo-secure-store | JWT encrypted storage |
| **Build** | EAS Build | Staging + production profiles |
| **Scope** | Foundation (tabs/offline/biometric/push) — **paused** | Restart later; web responsive is primary |

### 2.5 Infrastructure & DevOps

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Containerization** | Docker | `docker-compose.yml` (dev) · `docker-compose.prod.yml` (prod) |
| **Orchestration** | Kubernetes | EKS (AWS) |
| **Deployment** | Helm | Charts: api, frontend, postgres (optional) |
| **IaC** | Terraform | VPC, RDS, ElastiCache, EKS node groups |
| **CI/CD** | GitHub Actions | `.github/workflows/ci.yml`, `deploy-*.yml` |
| **Monitoring** | Prometheus + Grafana | Metrics scrape, dashboard, SLA tracking |
| **Logs** | CloudWatch (AWS) | Centralized log aggregation |
| **Load test** | k6 | Smoke + performance testing (`scripts/load-test/`) |

---

## 3. Data Layer Design

### 3.1 Database Schema Philosophy

**Tenant isolation:** Row-level `tenantId` (default) + optional schema-per-tenant mode  
**Audit trail:** Immutable `audit_log` table (all changes tracked)  
**Multi-currency:** GL supports foreign exchange, settlement per month  
**Double-entry:** Finance module enforces balanced journal entries  

### 3.2 Entity Inventory (83 total)

**Core domains:**
- **Auth:** User, Session, 2FA, OAuth provider
- **Tenants:** Tenant, Subscription plan, Quota
- **Finance:** JournalEntry, Account (COA), AP/AR invoice, Bank recon
- **Sales:** SalesOrder, Quotation, Customer credit limit
- **Supply Chain:** Product, Warehouse, PO, GR, Inventory
- **HR:** Employee, Leave, Attendance, Payroll, Recruitment
- **Manufacturing:** BOM, MO, ScrapEntry, Capacity
- **Projects:** Project, Task, TimeEntry
- **CRM:** Lead, Opportunity, Communication
- **Fixed Assets:** Asset register, Depreciation
- **Reporting:** Report definition, Dashboard, KPI
- **Workflow:** WorkflowDef, Inbox, SLA
- **Documents:** Document, e-sign request
- **Analytics:** Forecast model, Anomaly detection
- **Compliance:** AuditLog, TaxExport, DataRetention

**Indexing strategy:**
- Composite index: `(tenantId, status, createdAt)` for list queries
- B-tree: foreign keys, search columns (name, email)
- Partial: active records only (where soft_delete IS NULL)
- Materialized view: GL trial balance (rebuilt nightly)

### 3.3 Migration Strategy

**Current migrations:** `0005`–`0013` (9 total)  
**Philosophy:** Immutable, timestamped, reversible  
**Tools:** TypeORM migrations CLI  
**Validation:** Dev env runs all migrations; CI tests against pg-mem

**Typical flow:**
```bash
npm run typeorm migration:create src/database/migrations/NAME
# Edit migration .ts
npm run typeorm migration:run  # dev
npm run db:migrate             # prod via CI/CD
```

---

## 4. Backend Architecture — Module Design

### 4.1 Module Structure (NestJS)

Each module follows **feature-scoped structure:**

```
backend/src/modules/MODULE_NAME/
├── MODULE_NAME.module.ts          # NestJS module definition
├── controllers/
│   ├── MODULE_NAME.controller.ts   # HTTP routes
│   └── (nested sub-resources)
├── services/
│   ├── MODULE_NAME.service.ts      # Business logic, transactions
│   └── (helper services)
├── entities/
│   └── MODULE_NAME.entity.ts       # TypeORM entity
├── dtos/
│   ├── create-MODULE_NAME.dto.ts
│   ├── update-MODULE_NAME.dto.ts
│   └── query-MODULE_NAME.dto.ts
├── guards/
│   └── MODULE_NAME.guard.ts        # Authorization logic
├── interceptors/
│   └── MODULE_NAME.interceptor.ts  # Logging, transformation
└── __tests__/
    ├── MODULE_NAME.service.spec.ts (60%+ coverage)
    └── MODULE_NAME.controller.spec.ts
```

### 4.2 Cross-Cutting Concerns (Common Layer)

```
backend/src/common/
├── guards/
│   ├── auth.guard.ts              # JWT validation
│   ├── tenant.guard.ts            # Multi-tenant isolation
│   └── rbac.guard.ts              # Role-based access
├── interceptors/
│   ├── audit.interceptor.ts       # Immutable audit trail
│   ├── transform.interceptor.ts   # Response wrapper
│   └── tenant.interceptor.ts      # Tenant context injection
├── filters/
│   └── exception.filter.ts        # Global error handling
├── decorators/
│   ├── @Tenant()                  # Extract tenant ID
│   ├── @CurrentUser()             # Extract user JWT
│   └── @RequireRole()             # Check RBAC
└── utilities/
    ├── encryption.ts              # AES-256 field encryption
    ├── export.ts                  # Excel/PDF generation
    └── validators.ts              # Custom validation rules
```

### 4.3 GL Integration Engine

**Pattern:** Event-driven GL posting  
**Flow:**
1. Sales confirm → `SalesConfirmedEvent`
2. Event listener in Finance module → GL entry created
3. Validation: debit = credit
4. Posting: async to RabbitMQ, retry on failure

**Modules that trigger GL:**
- Sales (AR), Purchases (AP), Manufacturing (COGS), HR (expense), Fixed Assets (depreciation)

### 4.4 API Versioning & Deprecation

**Current:** `/api/v1/`  
**Strategy:** Additive (new fields), non-breaking (soft deprecation)  
**Phase 5:** Introduce v2 (if breaking change needed), maintain v1 for 6 months

---

## 5. Frontend Architecture

### 5.1 Directory Structure (React Vite)

```
frontend/src/
├── pages/                         # Page components (29)
│   ├── dashboard.tsx
│   ├── finance/
│   │   ├── gl.tsx, ap.tsx, ar.tsx
│   │   └── statements.tsx
│   ├── sales/, inventory/, hr/, mfg/, crm/, ...
│   ├── report-builder/            # Drag-drop report builder
│   ├── dashboard-builder/         # Widget dashboard designer
│   ├── workflows/, integrations/, documents/
│   ├── settings/, audit-log/, notifications/
│   ├── auth/                      # Login, register, password reset
│   └── portal/                    # Portal routes (separate auth)
├── components/                    # Reusable components
│   ├── Layout/                    # App shell, navigation
│   ├── Forms/                     # React-hook-form wrappers
│   ├── Tables/                    # CRUD table, pagination
│   ├── Charts/                    # Recharts wrappers
│   ├── Modals/                    # Dialog, confirmation
│   └── ...
├── hooks/                         # Custom React hooks
│   ├── useAuth.ts                 # JWT, refresh, logout
│   ├── useTenant.ts               # Tenant context
│   ├── useApi.ts                  # Axios with interceptor
│   └── ...
├── store/                         # Redux Toolkit state
│   ├── authSlice.ts               # Auth state + async thunks
│   ├── tenantSlice.ts
│   ├── notificationSlice.ts
│   └── store.ts
├── i18n/                          # Localization
│   ├── supportedLocales.ts        # 15 locales registry
│   ├── en.json, id.json, ...
│   └── LocaleContext.tsx
├── utils/                         # Utility functions
│   ├── format.ts                  # Date, number, currency formatting
│   ├── api-client.ts              # Axios instance + error handling
│   └── validators.ts
├── types/                         # TypeScript interfaces (API contracts)
│   ├── api.types.ts               # Generated from Swagger
│   ├── common.types.ts
│   └── ...
├── assets/                        # Images, logos, fonts
├── styles/                        # Global CSS, Tailwind overrides
│   └── globals.css
└── App.tsx, main.tsx
```

### 5.2 State Management (Redux Toolkit)

```
Store hierarchy:
auth
├── user (User object, JWT token, permissions)
├── isLoading
└── error

tenant
├── current (Tenant object, plan, quota usage)
├── isLoading
└── list

notifications
├── items (array of toasts/alerts)
└── unread count

ui
├── sidebarOpen
├── theme (light/dark)
└── locale
```

### 5.3 Component Patterns

**CRUD Table pattern:**
```tsx
<CrudTable
  data={items}
  columns={[{ key: 'name', label: 'Name' }, ...]}
  onEdit={handleEdit}
  onDelete={handleDelete}
  pagination={{ page, pageSize, total }}
/>
```

**Form pattern:**
```tsx
<FormDialog title="Create Item" onSubmit={handleSubmit}>
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => <TextField {...field} />}
  />
</FormDialog>
```

**Data fetching pattern (React Query alternative):**
```tsx
const { data, isLoading } = useApi<Item[]>('/api/v1/items');
```

---

## 6. Security & Compliance Design

### 6.1 Authentication Flow

```
┌──────────────┐
│  User Login  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ POST /auth/login     │
│ + Email + Password   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Throttle check       │
│ (5 attempts/5min)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Hash verify +        │
│ Account active?      │
└──────┬───────────────┘
       │
       ├─ Invalid? → HTTP 401
       │
       ▼
┌──────────────────────┐
│ 2FA enabled?         │
└──────┬───────────────┘
       │
       ├─ Yes → POST /auth/verify-2fa (send TOTP prompt)
       │
       ▼
┌──────────────────────┐
│ Issue JWT access    │
│ (15 min expiry)     │
│ + refresh token     │
│ (7 day expiry)      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Return tokens +     │
│ User metadata       │
└──────────────────────┘
```

### 6.2 Token Management

| Token type | Purpose | Expiry | Storage | Refresh |
|-----------|---------|--------|---------|---------|
| **Access JWT** | API authorization | 15 min | Memory (httpOnly cookie) | Via refresh endpoint |
| **Refresh JWT** | Access token renewal | 7 days | httpOnly cookie | Automatic on 401 |
| **Portal JWT** | Vendor/customer portal | 30 days | httpOnly cookie (portal domain) | Manual re-login |

### 6.3 Multi-Tenancy Isolation

**Row-level enforcement:**
- Every query filters `WHERE tenantId = :tenantId`
- Interceptor injects `tenantId` from JWT claims
- No cross-tenant data exposure possible

**Schema-per-tenant mode (optional):**
- Alternative: separate schema per customer
- Activation: env var `TENANT_SCHEMA_MODE=schema`
- Migration: Phase 6–7 roadmap

### 6.4 Encryption & Sensitive Data

| Data | Field | Method | Key management |
|------|-------|--------|-----------------|
| **PII** (SSN, passport) | Employee table | AES-256 (database-level) | Secrets Manager (AWS) |
| **Passwords** | User table | bcrypt (cost: 12) | Hash only, no retrieval |
| **API keys** (Stripe, etc) | Integrations table | AES-256 | Secrets Manager (AWS) |
| **Bank account** | Vendor table | AES-256 | Secrets Manager (AWS) |

### 6.5 RBAC (Role-Based Access Control)

**Roles:**
- `admin` — all permissions, tenant-wide
- `manager` — module-scoped (e.g., Finance manager, HR manager)
- `user` — view/approve workflows, limited CRUD
- `portal_vendor` — portal only (invoices, payments)
- `portal_customer` — portal only (statements, tickets)

**Permission matrix:** Defined per module; evaluated via guards + database role checks

### 6.6 Audit & Compliance

**Audit trail:**
- Every INSERT/UPDATE logged to `audit_log` (immutable)
- Captures: user, timestamp, entity, action, before/after delta
- Retention: permanent (GDPR export = audit trail included)

**Compliance exports:**
- e-Faktur XML (Finance module)
- Tax SPT stubs (Finance module)
- GDPR export (all tenant data + audit trail)
- GDPR erasure (soft delete + anonymization per policy)

---

## 7. Scalability & Performance Strategy

### 7.1 Caching Strategy

| Data | Cache layer | TTL | Invalidation |
|------|-------------|-----|--------------|
| **User session** | Redis | 24h | Logout |
| **Tenant config** | Redis | 12h | Manual purge on change |
| **COA (chart of accounts)** | Redis | 24h | Manual purge on change |
| **Exchange rates** | Redis | 24h | Daily refresh via cron |
| **Dashboard queries** | Redis | 5 min | Real-time update via WebSocket (future) |
| **Reporting dataset** | None (on-demand) | — | Query at request time |

### 7.2 Query Optimization

**Bottleneck:** GL queries (large posting volume)  
**Strategy:**
- Materialized view: trial balance (rebuilt nightly via cron)
- Index: `(tenantId, account_id, period, status)`
- Partition: optional by fiscal year (Phase 7)

**Pagination:** Default 20 items/page, max 1000

### 7.3 Async Processing

| Job | Queue | Processor | Retry |
|-----|-------|-----------|-------|
| **GL posting** | RabbitMQ | Finance module | 3x exponential |
| **E-Faktur export** | RabbitMQ | Compliance module | 3x |
| **Scheduled reports** | Cron | Scheduler module | 1x (next schedule) |
| **Email sending** | Nodemailer + fallback | Email service | 5x (5 sec intervals) |
| **Webhook outbound** | RabbitMQ | Integration module | 3x |

### 7.4 Load Balancing & Auto-Scaling

**Kubernetes HPA (Horizontal Pod Autoscaler):**
```yaml
minReplicas: 3  # Always running
maxReplicas: 10
targetCPUUtilizationPercentage: 70
targetMemoryUtilizationPercentage: 80
```

**Database connection pool:** 20 connections per pod (max 200 at 10 pods)  
**Redis:** Cluster mode (6 nodes); auto-failover

---

## 8. Integration Architecture

### 8.1 Integration Gallery (Available + Conditional)

| Integration | Type | Purpose | Status | Activation |
|-------------|------|---------|--------|------------|
| **Stripe** | Payment | Checkout, invoicing | ✅ Available | Live Stripe key |
| **Google OAuth** | SSO | Employee login via Google | ✅ Available | Google Console creds |
| **Slack** | Chat notification | Workflow alerts, approval requests | 🟡 Conditional | Slack app token |
| **Zapier** | Workflow | Trigger external actions | 🟡 Conditional | Zapier CLI integration |
| **Shopify** | E-commerce sync | Order → Sales module | 🟡 Conditional | Shopify API key |
| **JIRA** | Project sync | Tasks ↔ JIRA issues | 🟡 Conditional | JIRA API token |
| **JNE / Sicepat** | Shipping | Tracking, label generation | 🟡 Conditional | Carrier API key |
| **SendGrid / AWS SES** | Email | Transactional emails | ✅ Available | SMTP credentials |

### 8.2 Webhook Pattern (Outbound)

**For future integrations:**
```
1. Define webhook event (e.g., SalesOrderConfirmed)
2. Register subscriber URL (integrations table)
3. Event triggered → async RabbitMQ job
4. POST to subscriber with signed payload (HMAC-SHA256)
5. Retry 3x on 5xx; delete after 30 days failed
```

### 8.3 API Gateway Pattern (Inbound)

**For partner API access (Phase 7):**
```
1. Partner registers app (API client)
2. OAuth 2.0 authorization code grant
3. Issue access token (1h) + refresh (30d)
4. Partner calls `/api/v1/partner/*` endpoints
5. Rate limit: 1000 req/hour per partner
```

---

## 9. Deployment Architecture

### 9.1 Environments

| Env | Infrastructure | Data | CI/CD trigger | Notes |
|-----|----------------|------|---------------|-------|
| **dev** | Docker Compose local | Seeded demo data | Manual (`npm run start:dev`) | Full stack locally |
| **staging** | AWS EKS (1 node) | Production-like copy | Push to `develop` branch | Smoke tests post-deploy |
| **production** | AWS EKS (3+ nodes) | Live customer data | Tag-based release | Blue-green deployment |

### 9.2 CI/CD Pipeline (GitHub Actions)

```yaml
Trigger: Push to main → Run:
1. Lint (ESLint, Prettier)
2. Unit tests (Jest, ≥60% coverage gate)
3. Build Docker image
4. Push to ECR (AWS Elastic Container Registry)
5. Deploy to staging via Helm
6. Smoke tests (HTTP health checks, sample API calls)
7. Manual approval → Deploy to production (blue-green)
```

**Rollback:** Previous Helm release (instant, no downtime)

### 9.3 Helm Charts

```
k8s/helm/
├── api/
│   ├── Chart.yaml
│   ├── values.yaml             # Dev defaults
│   ├── values-staging.yaml     # Staging overrides
│   ├── values-production.yaml  # Prod overrides
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── configmap.yaml
│       ├── secrets.yaml (SOPS encrypted)
│       ├── hpa.yaml
│       └── pdb.yaml (Pod Disruption Budget)
├── frontend/
│   └── (similar structure)
└── postgres/ (optional; use RDS instead)
```

### 9.4 Terraform IaC

```
terraform/
├── main.tf                # AWS provider, region (ap-southeast-3)
├── vpc.tf                 # VPC, subnets, NAT gateway, security groups
├── rds.tf                 # PostgreSQL 15 Multi-AZ, automated backup
├── elasticache.tf         # Redis cluster
├── eks.tf                 # EKS cluster, node groups, RBAC
├── s3.tf                  # S3 buckets (documents, backups)
├── cloudfront.tf          # CDN for frontend SPA
├── iam.tf                 # Roles, policies for EKS, RDS, S3
├── monitoring.tf          # CloudWatch alarms, SNS topics
├── prod.tfvars            # Production variables (DB size, node count, etc)
└── dev.tfvars             # Development variables
```

**Workflow:**
```bash
# Validate
terraform plan -var-file=prod.tfvars -out=tf.plan

# Apply (requires approval)
terraform apply tf.plan

# Destroy (rarely; preserve data)
terraform destroy -var-file=prod.tfvars -auto-approve
```

### 9.5 Monitoring & Observability

**Metrics (Prometheus):**
- API response time (P50, P95, P99)
- Request rate (success, errors, 4xx, 5xx)
- Database connection pool usage
- Redis memory usage
- Pod CPU/memory

**Logs (CloudWatch):**
- Application logs (stdout → CloudWatch)
- Access logs (ALB)
- Audit trail (database)

**Dashboards (Grafana):**
- System health (uptime, errors, latency)
- Business metrics (revenue, active users, churn)
- SLA tracking (API uptime, support SLA)

---

## 10. Disaster Recovery & Backup

### 10.1 RTO & RPO Targets

| Component | RTO | RPO | Strategy |
|-----------|-----|-----|----------|
| **API (stateless)** | 5 min | 0 | Auto-scaling, health checks |
| **Database** | 30 min | 1 hour | Multi-AZ RDS, automated backup |
| **Redis (cache)** | 5 min | 0 | Cluster replication; cache rebuild |
| **S3 (documents)** | 1 hour | 1 hour | Cross-region replication (Phase 7) |

### 10.2 Backup Schedule

| Resource | Frequency | Retention | Test frequency |
|----------|-----------|-----------|-----------------|
| **PostgreSQL** | Hourly automated | 35 days | Weekly (restore-test to staging) |
| **S3** | Continuous versioning | 90 days | Monthly |
| **RDS snapshots** | Daily manual | 30 days | On-demand |

### 10.3 Recovery Procedures

**Database restore (Phase 5):**
```bash
# 1. Identify backup timestamp
aws rds describe-db-snapshots --db-instance-identifier dncore-prod

# 2. Restore to new instance
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier dncore-prod-restore \
  --db-snapshot-identifier <snapshot-id>

# 3. Update DNS to new instance
# (Blue-green deployment via Route53)

# 4. Verify data integrity
psql -U admin -d dncore -c "SELECT COUNT(*) FROM users;"
```

---

## 11. Documentation & Operations Runbooks

| Runbook | Path | Owner |
|---------|------|-------|
| **Local dev setup** | `README.md` · `scripts/setup-dev.sh` | All engineers |
| **Deployment (staging)** | `.github/workflows/deploy-staging.yml` | DevOps |
| **Deployment (production)** | `.github/workflows/deploy-production.yml` · `scripts/production-checklist.sh` | DevOps + Tech Lead |
| **Database migration** | `scripts/db-migrate.sh` · `backend/src/database/migrations/` | Backend engineers |
| **Production smoke test** | `scripts/production-smoke.sh` | DevOps (post-deploy) |
| **Incident response** | `docs/incident-response.md` | On-call engineer |
| **Data retention & purge** | `scripts/purge-old-data.sh` · `backend/src/modules/compliance` | DPO |

---

## 12. Future Architecture Directions (Phase 6–8)

### Phase 6: Microservices Scaffold → Full Split

- Decouple Finance (GL events) → separate FastAPI service (optional)
- Message broker (RabbitMQ) becomes primary integration bus
- Service registry (Consul, Eureka) for dynamic discovery

### Phase 7: ML-Powered Analytics

- FastAPI microservice (Python: Prophet, scikit-learn)
- Forecast / anomaly detection / what-if scenarios
- Real-time ML model updates (hourly cron)

### Phase 8: Multi-Region & Advanced Compliance

- Active-active across 2 regions (ap-southeast-3, ap-south-1)
- Event streaming (AWS Kinesis) for cross-region sync
- SOC 2 Type II certification (external audit)

---

## 13. Changelog

| Version | Date | Changes |
|---------|------|---------|
| **1.0** | 19 Jul 2026 | Initial SDD — Phase 0–4 architecture, Tech stack (validated), Deployment (AWS/K8s/Terraform), Security & Compliance |

---

**Owner:** Dozer (CEO + Tech Lead) · PT. Dozer Napitupulu Technology  
**Last Updated:** 19 July 2026  
**Next Review:** Phase 5 production hardening (target Aug 2026)  

---

*Dokumen ini adalah sumber kebenaran teknis untuk implementasi dnCore. Semua keputusan arsitektur harus dirujuk ke dokumen ini sebelum diubah.*
