# dnCore

Enterprise multi-tenant SaaS ERP — **Phase 0–4 ~95% coded · V3 Phase 5–8 ~85% MVP+ · dnCore PRD v1.0 implemented** (Juli 2026).

**Repository:** [github.com/dreamcraft17/erp](https://github.com/dreamcraft17/erp)  
**Owner:** Dozer (CEO + Tech Lead) · **Company:** DN Tech · **Brand:** dnCore  
**Messaging:** "dnPeople for your people · dnCore for your business."  
**UpdatedAt:** July 19, 2026 · **HEAD:** `5975d91`

| Metrik | Nilai |
|--------|-------|
| Backend modules | **27** domain + `platform/` |
| Frontend pages | **30** halaman React SPA (+ `/enterprise` V3) |
| Unit tests | **404** (86 suites) · coverage **≥60%** |
| TypeORM entities | **84** |
| DB migrations | `0000`–`0016` (**17** files) |
| Locales | **15** languages |
| Mobile | Expo Phase 6 foundation (tabs, offline, biometric, push) |

> **Bukan** produk HRIS `dnPeople` (Express/Next). Spec: [`Docs/prd/`](./Docs/prd/) · Baseline: [`Docs/CURRENT-IMPLEMENTATION.md`](./Docs/CURRENT-IMPLEMENTATION.md) · [`Docs/FEATURE-CATALOG.md`](./Docs/FEATURE-CATALOG.md)

---

## Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | NestJS 10, TypeScript, PostgreSQL 15, TypeORM, JWT |
| Frontend | React 19, Vite, Redux Toolkit, MUI, Tailwind, **Recharts** |
| Mobile | React Native / **Expo** (Phase 6 foundation) |
| Cache | Redis |
| Queue | RabbitMQ (event-driven GL integration) |
| Search | Elasticsearch |
| Email | Nodemailer (SMTP / dev console fallback) |
| Export | ExcelJS + PDFKit |
| Monitoring | Prometheus + Grafana |
| Payments | Stripe (checkout, OAuth stub, dev fallback) |
| Infra | Docker Compose, Kubernetes, Helm, Terraform (AWS), GitHub Actions |

---

## Modul Backend

Setiap modul di-commit terpisah di git history.

| Modul | Path | Fitur utama |
|-------|------|-------------|
| Auth | `backend/src/modules/auth/` | Register, login, JWT, 2FA (TOTP), password reset, SSO Google, login throttling |
| Tenants | `backend/src/modules/tenants/` | Multi-tenant provisioning, subscription plan |
| Finance | `backend/src/modules/finance/` | GL, COA, journal, reversal, period close, AP/AR, aging, balance sheet, P&L, cash flow, e-Faktur |
| Finance Advanced | `backend/src/modules/finance/` | Bank reconciliation, expense claims, 3-way match, dunning, intercompany JE |
| GL Integration | `backend/src/modules/finance/services/gl-integration.service.ts` | Auto-post Sales→AR→GL, PO→Inventory→GL, MO→GL |
| Sales | `backend/src/modules/sales/` | Orders, quotations, credit limit, confirm→invoice event, volume pricing |
| Supply Chain | `backend/src/modules/supply-chain/` | Products, warehouses, stock, PO, goods receipt, barcode, MRP, reorder alerts |
| HR | `backend/src/modules/hr/` | Employees, attendance, leave, payroll (PPh 21), recruitment ATS, **360° feedback** |
| Manufacturing | `backend/src/modules/manufacturing/` | BOM versioning, manufacturing orders, scrap, capacity plan |
| Projects | `backend/src/modules/projects/` | Projects, tasks, time entries, billable time, budget, utilization |
| CRM | `backend/src/modules/crm/` | Leads, opportunities, pipeline, communications |
| Fixed Assets | `backend/src/modules/fixed-assets/` | Asset register, depreciation, maintenance |
| Enterprise | `backend/src/modules/enterprise/` | RFQ, requisitions, cycle count, valuation, price lists, multi-company, FX, QC, work orders |
| Reporting | `backend/src/modules/reporting/` | Custom reports, saved reports, query builder, **dashboard builder**, **KPI alerts**, OLAP drill-down |
| Workflow | `backend/src/modules/workflow/` | Workflow engine, approval inbox, transitions, **SLA dashboard**, drag reorder, Slack/Zapier escalation |
| Analytics | `backend/src/modules/analytics/` | Forecast, churn prediction, anomaly detection, insights API |
| Documents | `backend/src/modules/documents/` | File upload, **e-signature requests** |
| Integrations | `backend/src/modules/integrations/` | Gallery, Stripe/Slack/Zapier/Shopify/JIRA/shipping, OAuth, encrypted credentials |
| Portal | `backend/src/modules/portal/` | PortalUser JWT auth, AR payments, statement, tickets, invoice PDF, vendor upload |
| Users | `backend/src/modules/users/` | User admin, plan limit enforcement |
| Scheduler | `backend/src/modules/scheduler/` | Cron dunning, report schedules, KPI alert checks |
| Billing | `backend/src/modules/billing/` | Plan limits, usage tracking, Stripe checkout |
| GDPR | `backend/src/modules/gdpr/` | Data export, consent, right to erasure |
| Compliance | `backend/src/modules/compliance/` | Tax XML export, retention, audit trail (V3) |
| Ops | `backend/src/modules/ops/` | Backup monitor, restore-test log (V3) |
| LMS | `backend/src/modules/lms/` | Courses, enrollments, certificates (V3) |
| Platform | `backend/src/platform/` | Microservice registry, partner, white-label, ETL |
| Infrastructure | `backend/src/infrastructure/` | Email, export, queue, search, metrics, event consumers |
| Common | `backend/src/common/` | Guards, audit interceptor, **tenant schema interceptor**, audit log, export endpoints |

---

## Frontend

**30** halaman React SPA di `frontend/src/pages/`:

| Halaman | Route | Keterangan |
|---------|-------|------------|
| Dashboard | `/` | Executive overview |
| Finance | `/finance/:section` | GL, AP/AR, advanced finance |
| Sales | `/sales/:section` | Orders, quotations |
| Inventory | `/inventory/:section` | Products, warehouses, stock |
| HR | `/hr/:section` | Employees, payroll, leave |
| Manufacturing | `/manufacturing/:section` | BOM, MO, work orders, QC |
| Projects | `/projects/:section` | Projects, tasks, time |
| CRM | `/crm/:section` | Leads, opportunities |
| Fixed Assets | `/fixed-assets/:section` | Assets, depreciation |
| Reports | `/reports/:section` | P&L, balance sheet, cash flow, OLAP |
| Report Builder | `/report-builder` | Custom report definitions |
| Dashboard Builder | `/dashboard-builder` | Widget layout + KPI charts |
| Analytics | `/analytics` | Forecast, churn, anomalies |
| Documents | `/documents` | Upload + e-sign requests |
| Workflows | `/workflows` | Approval inbox, SLA dashboard |
| Integrations | `/integrations` | Marketplace + OAuth connections |
| Notifications | `/notifications` | In-app notifications |
| Settings | `/settings/general` | API keys, billing, Stripe upgrade |
| Users | `/settings/users` | User management |
| Audit | `/settings/audit` | Audit log viewer |
| 2FA | `/settings/2fa` | Setup & enable |
| GDPR | `/settings/gdpr` | Export, consent, delete |
| Customer Portal | `/portal` | JWT portal (invoices, payments, tickets) |
| Portal Login | `/portal/login` | Portal auth |
| Login / Register | `/login`, `/register` | Admin auth |
| Verify Email | `/verify-email` | Email verification |
| Forgot / Reset Password | `/forgot-password`, `/reset-password` | Password recovery |
| Enterprise V3 | `/enterprise` | Compliance, ops, LMS, analytics hub (6 tabs) |

Shared: `CrudTable`, `FormDialog` — `frontend/src/components/`  
i18n: `frontend/src/i18n/` (EN / ID, default ID)

---

## Mobile (Phase 3 MVP)

Expo scaffold di `mobile/` — login dengan ERP JWT + dashboard ringkas.

```bash
cd mobile && npm install && npm start
```

Set `EXPO_PUBLIC_API_URL` ke API backend (default `http://localhost:3000/api/v1`).

---

## Quick Start

### Prasyarat

- Node.js 20+
- Docker Desktop (PostgreSQL, Redis, RabbitMQ, Elasticsearch, Prometheus, Grafana)

```bash
docker --version && docker compose version
```

### 1. Clone & install

```bash
git clone https://github.com/dreamcraft17/erp.git
cd erp

cd backend && npm install && cp .env.example .env.development
cd ../frontend && npm install
```

### 2. Jalankan infrastructure

```bash
# dari root project
npm run infra:up
```

Services:

| Service | URL |
|---------|-----|
| PostgreSQL | `:5432` |
| Redis | `:6379` |
| RabbitMQ | `:5672` (UI `:15672`) |
| Elasticsearch | `:9200` |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin/admin) |

### 3. Backend (terminal 1)

```bash
npm run dev:backend
# atau: cd backend && npm run start:dev
```

- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api/docs
- Metrics: http://localhost:3000/metrics

### 4. Frontend (terminal 2)

```bash
npm run dev:frontend
# atau: cd frontend && npm run dev
```

- App: http://localhost:5173

### 5. Migrate & seed demo data

```bash
cd backend
npm run db:migrate
npm run db:seed
```

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@demo.com` | `Demo1234!` |
| Portal (customer) | `customer@demo.com` | `Demo1234!` |
| Portal (vendor) | `vendor@demo.com` | `Demo1234!` |

Tenant slug: `demo-company`

Atau register manual di http://localhost:5173/register — Chart of Accounts otomatis ter-seed.

### Full stack via Docker

```bash
npm run infra:all    # build & run semua services
npm run infra:down   # stop semua services
```

### Dev tanpa Docker (in-memory DB)

```bash
npm run dev:mem      # backend dengan SQLite in-memory
```

---

## Scripts (root)

```bash
npm run infra:up        # start postgres, redis, rabbitmq, elasticsearch
npm run infra:down      # stop containers
npm run infra:all       # full docker compose up --build
npm run dev:backend     # nest start --watch
npm run dev:frontend    # vite dev server
npm run dev:mem         # backend in-memory (no Docker)
npm run build           # build backend + frontend
npm run test            # backend unit tests
npm run test:e2e        # Cypress E2E (frontend)
npm run smoke           # staging smoke script
npm run smoke:prod      # production smoke (health + login + metrics)
npm run backup:db       # pg_dump backup
npm run checklist:prod  # verify production readiness
npm run infra:prod      # docker compose production stack
npm run load-test       # k6 load test
```

Backend migrations:

```bash
cd backend
npm run db:migrate      # run pending migrations
npm run db:seed         # seed demo tenant + users
```

---

## API Highlights

```
# Auth
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/sso/login          # Google id_token
POST /api/v1/auth/2fa/setup
POST /api/v1/auth/password-reset/request

# Finance
GET  /api/v1/finance/gl/accounts
GET  /api/v1/finance/gl/balance-sheet
POST /api/v1/finance/gl/journal-entries/:id/reverse
POST /api/v1/finance/gl/periods/:id/close
GET  /api/v1/finance/ar/invoices
POST /api/v1/finance/advanced/dunning/run
POST /api/v1/finance/advanced/three-way-match

# Sales & Supply Chain
POST /api/v1/sales/orders/:id/confirm   # triggers AR invoice + GL
POST /api/v1/supply-chain/purchase-orders/:id/receive

# Reporting & Analytics
GET  /api/v1/reports/dashboard
GET  /api/v1/reports/custom
GET  /api/v1/reporting/dashboards
GET  /api/v1/reporting/kpi-alerts
GET  /api/v1/analytics/forecast
GET  /api/v1/analytics/churn
GET  /api/v1/analytics/anomalies

# Workflow
GET  /api/v1/workflow/inbox
GET  /api/v1/workflow/sla/dashboard
POST /api/v1/workflow/instances/:id/transition

# Documents & E-sign
POST /api/v1/documents/upload
GET  /api/v1/documents/signatures/pending
POST /api/v1/documents/signatures/:id/sign

# Integrations
GET  /api/v1/integrations/gallery
POST /api/v1/integrations/:provider/connect

# Portal (JWT)
POST /api/v1/portal/auth/login
GET  /api/v1/portal/invoices
POST /api/v1/portal/payments/checkout

# HR 360°
GET  /api/v1/hr/feedback-360
POST /api/v1/hr/feedback-360

# Platform
GET  /api/v1/platform/services

# Billing & System
POST /api/v1/billing/checkout           # Stripe
GET  /api/v1/export/accounts/excel
GET  /api/v1/health
GET  /api/v1/audit/logs
GET  /metrics
```

Dokumentasi lengkap: http://localhost:3000/api/docs

---

## Struktur Project

```
ERP/
├── Docs/                          # Spesifikasi 00–22 (PRD, SRS, SDD, schema, indexing)
├── update/                        # Executive tracking & engineering action plans
├── backend/
│   ├── src/
│   │   ├── modules/               # 23 domain modules
│   │   ├── platform/              # Microservice registry scaffold
│   │   ├── infrastructure/        # email, export, queue, search, metrics
│   │   ├── common/                # guards, audit + tenant schema interceptors
│   │   ├── database/              # seed.ts, data-source.ts, migrations/
│   │   └── app.module.ts
│   └── .env.example
├── frontend/
│   └── src/
│       ├── pages/                 # 29 halaman
│       ├── components/            # Layout, CrudTable, FormDialog
│       ├── i18n/                  # EN / ID translations
│       └── api/client.ts
├── mobile/                        # Expo MVP (login + dashboard)
├── monitoring/prometheus.yml
├── terraform/main.tf              # AWS VPC, RDS, ElastiCache
├── k8s/
│   ├── api-deployment.yaml
│   └── helm/                      # Helm chart
├── scripts/                       # smoke test, k6 load test
├── docker-compose.yml
├── .github/workflows/             # ci.yml, deploy-staging.yml, deploy-production.yml
└── package.json
```

---

## Environment Variables

Copy `backend/.env.example` → `backend/.env.development`:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_dev
DB_USER=erp_user
DB_PASSWORD=erp_password_dev

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key-min-32-characters-long
JWT_EXPIRY=3600

CORS_ORIGIN=http://localhost:5173
PORTAL_URL=http://localhost:5173/portal/reset-password

# Optional — Stripe (kosongkan = dev mode)
STRIPE_SECRET_KEY=
STRIPE_CLIENT_ID=

# Optional — Slack / Zapier integrations
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
ZAPIER_HOOK_URL=

# Optional — per-tenant schema isolation (default: row-level tenantId)
TENANT_SCHEMA_MODE=          # set "schema" to enable schema-per-tenant

# Optional — microservice mode flag (scaffold; still monolith)
MICROSERVICE_MODE=monolith

# Optional — SMTP (kosongkan = log ke console)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@dnPeople.com
```

---

## Testing & CI

```bash
cd backend && npm test          # unit tests (Jest, 60% coverage gate)
cd backend && npm run test:cov  # dengan coverage report
cd backend && npm run test:e2e  # e2e (butuh DB running)
cd backend && npm run build
cd frontend && npm run build
cd frontend && npm run test:e2e # Cypress
```

GitHub Actions (`.github/workflows/ci.yml`):

- Backend: migrate → unit tests dengan **60% coverage threshold** → build
- Frontend: build
- E2E: seed DB → start API → Cypress smoke tests

Deploy workflows: `deploy-staging.yml`, `deploy-production.yml` (butuh AWS secrets).

---

## Deployment

| Target | Path | Keterangan |
|--------|------|------------|
| AWS | `terraform/` | VPC, RDS PostgreSQL 15, ElastiCache Redis |
| Kubernetes | `k8s/api-deployment.yaml` | API deployment manifest |
| Helm | `k8s/helm/` | Chart dengan autoscaling & ingress |
| Docker | `docker-compose.yml` | Full local/staging stack + monitoring |
| Staging smoke | `scripts/staging-smoke.sh` | Post-deploy health checks |

**Blocking production launch:** AWS staging live deploy (credentials + `terraform apply`).

---

## Release Phases (coding)

| Phase | Delivered |
|-------|-----------|
| **Phase 1** | Custom reports, workflow engine, integrations gallery, portal JWT auth |
| **Phase 2** | Dashboard builder, KPI alerts, OLAP UI, documents upload, workflow SLA + reorder, portal statement/tickets/PDF |
| **Phase 4** | 15+ locales, industry templates API, production Docker/Helm/Terraform, smoke/backup scripts |

**Outside code scope (credentials only):** AWS secrets → live deploy, live Stripe/Slack keys, App Store submit

---

## Catatan Teknis

- Multi-tenant via kolom `tenantId` (row-level isolation); opsional `TENANT_SCHEMA_MODE=schema` untuk schema-per-tenant
- RabbitMQ & Elasticsearch: graceful fallback jika service belum jalan; events juga dispatch lokal
- Email dev mode: reset link dicetak di backend console log
- Stripe dev mode: checkout fallback ke upgrade plan lokal
- Swagger UI tersedia di `/api/docs` untuk semua endpoint
- Migrations `1730000000005`–`1730000000013` — jalankan `npm run db:migrate` setelah pull

---

## Lisensi

Private — PT. Dozer Napitupulu Technology.  
**Owned by:** [dntech.id](https://dntech.id) — PT. Dozer Napitupulu Technology
