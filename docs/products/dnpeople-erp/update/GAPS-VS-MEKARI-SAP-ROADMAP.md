# Gap Analysis vs Mekari/SAP
## dnPeople ERP — Missing Features & Critical Improvements

**Updated:** 7 July 2026  
**Audience:** Engineering Team, Product, CEO  
**Status:** **~95% code complete** · prod templates ready · AWS live deploy pending

---

## Executive Summary

**Anda punya (well-implemented):**
- ✅ Finance (GL, AP, AR, depreciation)
- ✅ HR basics (payroll, PPh 21, leave, attendance)
- ✅ Supply Chain (PO, inventory, MRP skeleton)
- ✅ Sales (SO, quotation, customer)
- ✅ Manufacturing (BOM, MO basic)
- ✅ Multi-tenant + role-based access
- ✅ Mobile-friendly UI (responsive)

**Kurang dibanding Mekari/SAP (tier 1 — status Jul 2026):**
1. **Advanced Reporting & BI** — ✅ custom builder + dashboard + KPI + OLAP
2. **Workflow Automation** — ✅ engine + inbox + SLA dashboard + escalation
3. **Mobile Native Apps** — ✅ Expo MVP (🟡 App Store submit pending)
4. **Integration Marketplace** — ✅ Stripe/Slack/Zapier/JIRA/shipping (🟡 live OAuth keys pending)
5. **Advanced Analytics** — ✅ forecast, churn, anomalies (Phase 3)
6. **Document Management** — ✅ upload + e-signature (🟡 OCR pending)
7. **Multi-company consolidation** — ✅ consolidated reports (partial GL consolidation)
8. **Advanced HR** — ✅ 360° feedback (🟡 LMS/succession pending)
9. **Advanced Tax** — ✅ e-Faktur, NPWP (🟡 full PPN register automation pending)
10. **Customer/Vendor Portals** — ✅ JWT auth + AR payment (⚠️ full self-service UX Phase 2)

**Kurang (tier 2 — nice to have):**
- Subscription/recurring billing
- Advanced forecasting (AI-driven demand)
- Quality management (full module)
- Serial number/lot tracking
- Budget vs actual drilldown
- Field-level audit trails
- Data masking for PII
- Blockchain traceability (supply chain)

---

## Tier 1: Critical Gaps (Must Have for Mekari/SAP Parity)

### Gap 1: Advanced Reporting & BI — Phase 1 ✅ · Phase 2 pending

**Current state (5 Jul):** Custom report builder live — ReportDefinition, SavedReport, QueryBuilder, filter/groupBy/sort UI, preview, PDF/Excel export, scheduled email delivery. **Still pending:** OLAP drill-down, dashboard builder, KPI alerts.

**What Mekari/SAP do:**
- Custom report builder (drag-drop columns, filters, grouping)
- Pre-built dashboards per role (Finance, Sales, HR, Ops)
- Export Excel/PDF with formatting (header, footer, charts)
- Scheduled report delivery (email, webhook)
- OLAP drill-down (GL → period → account → transaction)
- Real-time KPI alerts (revenue < target, inventory < min, etc.)

**Deliverables:**

```
□ PHASE 1 (2 weeks)
  └─ Custom report builder backend
     ├─ ReportDefinition entity (cols, filters, grouping, sorting)
     ├─ ReportTemplateService CRUD
     ├─ QueryBuilder to generate SQL from definition
     └─ Save/load reports by tenant + role
     
  └─ Frontend: Report Builder UI
     ├─ Drag-drop column selector
     ├─ Filter builder (AND/OR logic)
     ├─ Group by, sort, aggregate (SUM, AVG, COUNT, MAX, MIN)
     ├─ Live preview
     └─ Save as template
     
□ PHASE 2 (1–2 weeks)
  └─ Dashboard Builder
     ├─ DashboardDefinition entity
     ├─ Widget types: KPI card, bar chart, line, pie, table
     ├─ Drill-down links (KPI → detail report)
     └─ Auto-refresh intervals
     
  └─ Export & Scheduling
     ├─ PDF export (ReportPdf service w/ pdfkit or similar)
     ├─ Excel export (xlsx with formatting)
     ├─ Schedule: cron job for email delivery
     └─ Webhook trigger for external systems

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTIMATION: 2 devs × 3–4 weeks | IMPACT: High (finance/sales/hr all need)
DEPENDENCY: None (use existing modules)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Mekari reference:** Dashboard Mekari ada ~15 pre-built dashboards (Finance, Sales, HR, Inventory, Projects).  
**Acceptance:** User dapat membuat custom report tanpa coding; export PDF/Excel terlihat professional.

---

### Gap 2: Workflow Automation — Phase 1 ✅ · polish pending

**Current state (5 Jul):** WorkflowEngine + WorkflowTransitionService, approval inbox, conditional routing, GL posting on complete, Slack/Zapier hooks, daily escalation cron, visual state diagram UI. **Still pending:** full drag-drop canvas designer, SLA dashboard, parallel approval UX polish.

**What Mekari/SAP do:**
- Visual workflow designer (drag-drop states, conditions, actions)
- Conditional branches (if amount > X, route to CFO; else to manager)
- Parallel approvals (both CFO + Treasurer must approve)
- Escalation rules (if pending > N days, escalate)
- Action triggers: email, SMS, webhook on state change
- SLA tracking (due date, breach alerts)

**Deliverables:**

```
□ Workflow Engine (1–2 weeks)
  ├─ WorkflowDefinition entity
  │  ├─ Name, version, trigger (e.g., "Invoice submitted")
  │  ├─ States: SUBMITTED, MANAGER_REVIEW, CFO_REVIEW, APPROVED
  │  ├─ Transitions: conditions, required approvers, escalation
  │  └─ Actions: email, update status, GL posting
  │
  ├─ WorkflowInstance entity (runtime)
  │  ├─ Link to document (Invoice, PO, Leave, etc.)
  │  ├─ Current state + history
  │  ├─ Approvers assigned + votes
  │  └─ Due date, SLA status
  │
  ├─ ApprovalService
  │  ├─ submitForApproval(doc, workflowId) → create instance
  │  ├─ approve(instanceId, userId) → advance state
  │  ├─ reject(instanceId, reason) → revert + notify
  │  └─ escalate if SLA breached
  │
  └─ EventListener
     └─ On state change: trigger email, webhook, GL posting

□ Workflow Builder UI (1–2 weeks)
  ├─ Canvas for workflow design
  │  ├─ Add states (boxes), drag connections
  │  ├─ Configure approvers per state (single/parallel/sequential)
  │  ├─ Set conditions (amount, department, etc.)
  │  └─ Preview trigger scenarios
  │
  ├─ Approval Inbox
  │  ├─ Pending approvals (MY_INBOX) + SLA status
  │  ├─ Bulk approve/reject
  │  ├─ Add comments
  │  └─ View approval history + comments
  │
  └─ SLA Dashboard
     ├─ Breached approvals (red alert)
     ├─ Average approval time by workflow
     └─ Escalation log

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTIMATION: 2–3 devs × 3–4 weeks | IMPACT: Very high (enterprise requirement)
DEPENDENCY: Event system (RabbitMQ/Kafka for scale)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Mekari reference:** Workflow builder ada di Finance → AP Approval, HR → Leave Approval.  
**Acceptance:** Non-technical user dapat set up PO approval: amount ≤ 10jt = manager; > 10jt & ≤ 100jt = CFO; > 100jt = CEO. Otomatis email approval request.

---

### Gap 3: Mobile Native Apps (iOS/Android) — ~8–12 weeks

**Current state:** Web responsive only.

**What Mekari/SAP do:**
- Native iOS/Android apps (not just web wrapper)
- Offline mode (sync when online)
- Push notifications (payment received, PO approved)
- Biometric auth (fingerprint, face recognition)
- Camera integration (receipt scanning, barcode)
- Home screen widgets (KPI)

**Deliverables (MVP):**

```
□ Tech Stack Decision (1 week)
  ├─ Option A: React Native (code sharing with web)
  ├─ Option B: Flutter (better performance, but separate codebase)
  └─ Option C: Native Swift + Kotlin (best UX, highest effort)
  
  RECOMMENDATION: React Native (leverage existing React devs)

□ Phase 1: MVP Mobile (6–8 weeks)
  ├─ Authentication
  │  ├─ Login + 2FA
  │  ├─ Biometric (fingerprint/face)
  │  └─ Session management
  │
  ├─ Finance Module (read-only first)
  │  ├─ Dashboard: cash position, invoices due
  │  ├─ Approve invoices (AR/AP)
  │  ├─ View GL ledger
  │  └─ Export report (PDF email)
  │
  ├─ HR Module
  │  ├─ Check-in/attendance (location + photo)
  │  ├─ View pay slip
  │  ├─ Submit leave request
  │  ├─ View leave balance
  │  └─ Overtime request
  │
  ├─ Sales Module
  │  ├─ View sales orders
  │  ├─ Track shipment (map view)
  │  ├─ Capture delivery proof (photo + signature)
  │  └─ Scan barcode for stock
  │
  ├─ Offline & Sync
  │  ├─ Queue offline approvals, re-sync when online
  │  ├─ Partial sync (last 30 days)
  │  └─ Conflict resolution
  │
  └─ Push Notifications
     ├─ Invoice approved
     ├─ Leave request approved
     ├─ PO received
     └─ Performance badge (KPI hit)

□ Phase 2: Advanced Features (4–6 weeks later)
  ├─ Receipt scanning (OCR via Tesseract/Google Vision)
  ├─ Expense claim submission (photo receipt)
  ├─ Mobile expense entry
  └─ Home screen widgets (dashboard preview)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTIMATION: 2 mobile devs × 8–12 weeks | IMPACT: High (sales force, field staff)
DEPENDENCY: API stability (already there)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Mekari reference:** Mekari app di iOS/Android, approve invoice/PO from phone, attendance offline mode.  
**Acceptance:** Sales rep dapat approve customer order via app; receipt scan + OCR untuk expense claim.

---

### Gap 4: Integration Marketplace — Phase 1 ✅ · live keys pending

**Current state (5 Jul):** IntegrationRegistry with gallery, Stripe/Slack/Zapier providers, OAuth stub, encrypted credentials, sync logs. **Still pending:** live OAuth client IDs, Shopify/JIRA/3PL connectors.

**What Mekari/SAP do:**
- Pre-built connectors: Stripe, PayPal, JIRA, Slack, Zapier, Google Suite
- One-click OAuth connect (store credentials securely)
- Webhook management (trigger on events)
- Integration logs + error retry
- Custom integration builder (advanced users)

**Deliverables:**

```
□ Integration Framework (backend, 2–3 weeks)
  ├─ Integration entity
  │  ├─ Name, type (Stripe, Slack, etc.)
  │  ├─ Credentials (encrypted in Secrets Manager)
  │  ├─ Status (active/inactive)
  │  ├─ Config JSON (per integration)
  │  └─ Audit log (last sync, errors)
  │
  ├─ Pre-built Integrations (priority order)
  │  ├─ 1. Stripe (payment → AR/invoice)
  │  ├─ 2. Slack (notifications)
  │  ├─ 3. Google Drive (file backup)
  │  ├─ 4. Zapier (webhook → action)
  │  ├─ 5. JIRA (project tasks)
  │  ├─ 6. Shopify (sales sync)
  │  └─ 7. 3PL / Shipping (JNE, Tiki, Gojek)
  │
  ├─ OAuth flow
  │  ├─ Redirect to provider (e.g., Stripe.com/connect)
  │  ├─ Callback → store credential token (encrypted)
  │  └─ Test connection before saving
  │
  ├─ Event Emitter
  │  ├─ On order created → trigger integration (send to Zapier, etc.)
  │  ├─ On payment received → sync to Stripe
  │  └─ Retry logic (exponential backoff)
  │
  └─ Admin: Integration Management
     ├─ Enable/disable integrations
     ├─ View sync logs + errors
     ├─ Manual retry
     └─ Re-authenticate

□ Integration UI (2 weeks)
  ├─ Integration Gallery
  │  ├─ Search/filter integrations
  │  ├─ "Connect" button → OAuth flow or API key entry
  │  ├─ Setup wizard (e.g., Stripe: enter bank account)
  │  └─ Test connection → green checkmark
  │
  ├─ Sync Dashboard
  │  ├─ Last sync time per integration
  │  ├─ Error log (red if failed)
  │  ├─ Data flow diagram (GL ← Stripe, PO → JIRA)
  │  └─ Manual sync trigger
  │
  └─ Webhook Management (for advanced)
     ├─ View webhooks (JSON payload preview)
     ├─ Retry failed webhooks
     └─ Custom webhook builder (advanced)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTIMATION: 1–2 backend devs × 2–3 weeks + 1 frontend dev × 2 weeks
IMPACT: High (SME want Stripe, Zapier, Shopify integration out-of-box)
DEPENDENCY: IntegrationService framework (define once, use many)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Mekari reference:** Mekari app marketplace ~50+ integrations; Stripe auto-sync invoices.  
**Acceptance:** One-click "Connect Stripe" → auto-sync payments to AR; Slack notification when PO > 10jt.

---

### Gap 5: Advanced Analytics & Predictive Features — ~4–6 weeks

**Current state:** Basic reporting only.

**What Mekari/SAP do:**
- Demand forecasting (AI-driven, based on historical sales)
- Cash flow forecast (predict shortage next quarter)
- Inventory optimization (reorder points, slow-moving items)
- Sales forecast with confidence interval
- Churn prediction (customer at risk)
- Anomaly detection (unusual transaction)

**Deliverables (MVP):**

```
□ Analytics Engine (2–3 weeks)
  ├─ DataWarehouse service (precompute aggregates)
  │  ├─ Fact tables: daily_sales, daily_inventory, daily_gl
  │  ├─ Dimension tables: product, customer, period, account
  │  ├─ Materialized views for fast dashboard queries
  │  └─ Refresh job (nightly)
  │
  ├─ Forecasting models (using ml5.js or TensorFlow.js)
  │  ├─ Simple: exponential smoothing (sales forecast)
  │  ├─ Seasonal: SARIMA (detect quarterly patterns)
  │  └─ Advanced: LSTM (demand + external factors)
  │
  ├─ Analytics API
  │  ├─ GET /analytics/forecast/sales?months=12
  │  ├─ GET /analytics/forecast/inventory?product_id=123
  │  ├─ GET /analytics/forecast/cash-flow?months=12
  │  └─ GET /analytics/anomalies?threshold=2_sigma
  │
  └─ Cron jobs
     ├─ Nightly: refresh fact tables
     ├─ Weekly: run forecasting models
     └─ Daily: scan anomalies

□ Analytics Dashboard UI (1–2 weeks)
  ├─ Forecast charts (with confidence intervals)
  │  ├─ Sales forecast (next 12 months)
  │  ├─ Inventory forecast (stock level over time)
  │  └─ Cash forecast (projection of bank balance)
  │
  ├─ Insights cards
  │  ├─ "Revenue on track to $2.5M (YTD)"
  │  ├─ "Inventory ABC analysis: 20% items = 80% value"
  │  ├─ "Churn risk: 2 customers" (red alert)
  │  └─ "Slow movers: 15 products" (reorder recommendation)
  │
  └─ Drill-down
     ├─ Click forecast → see components (trend, seasonality, residuals)
     ├─ Click anomaly → see the unusual transaction
     └─ Click slow-mover → see 12-month sales trend

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTIMATION: 1 data scientist + 1 backend dev × 4–6 weeks
IMPACT: Medium-high (sales/finance teams love forecasting)
DEPENDENCY: Data warehouse (materialized views), external ML lib
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Mekari reference:** Mekari Jurnal dashboard shows "Projected cash next 30 days"; Mekari Buku Putih has demand forecast.  
**Acceptance:** Finance can see "Cash balance will hit minimum in 45 days" with recommended actions (accelerate AR, delay payment).

---

### Gap 6: Customer/Vendor Portals — Phase 1 ✅ · UX polish pending

**Current state (5 Jul):** PortalUser JWT auth, `/portal/login`, forgot/reset password, customer invoices + AR payment, vendor PO list, legacy email-query portal retained. **Still pending:** full self-service UX, online Stripe checkout UI, vendor invoice upload/OCR.

**What Mekari/SAP do:**
- Customer portal: view invoices, pay online, download documents, track orders
- Vendor portal: view POs, submit invoices, track payments
- Self-service password reset
- Download statements, tax certificates

**Deliverables:**

```
□ Customer Portal (2 weeks)
  ├─ Features
  │  ├─ View invoices (AR) — filter by date, status
  │  ├─ Pay invoice online (Stripe integration)
  │  ├─ View orders + shipment tracking
  │  ├─ Download documents (statement, tax cert)
  │  ├─ View credit memo & returns
  │  └─ Message support (ticket system)
  │
  ├─ Backend API
  │  ├─ GET /portal/customer/invoices
  │  ├─ POST /portal/customer/invoices/:id/pay
  │  ├─ GET /portal/customer/orders
  │  ├─ GET /portal/customer/shipments/:id/track
  │  └─ POST /portal/support/tickets
  │
  └─ Frontend (React SPA, separate from admin)
     ├─ Login (email/password, 2FA)
     ├─ Dashboard: total due, recent orders
     ├─ Invoice list + detail
     ├─ Payment history
     └─ Support ticket inbox

□ Vendor Portal (1–2 weeks)
  ├─ Features
  │  ├─ View POs (AP) — filter by date, status
  │  ├─ View invoice history
  │  ├─ Submit invoices (upload + OCR)
  │  ├─ View payments received
  │  ├─ Download tax forms (1099, etc.)
  │  └─ Manage bank account (for payments)
  │
  └─ Backend API
     ├─ GET /portal/vendor/pos
     ├─ POST /portal/vendor/invoices (upload)
     ├─ GET /portal/vendor/payments
     └─ PATCH /portal/vendor/banking-info

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTIMATION: 1 backend + 1 frontend dev × 2–3 weeks | IMPACT: High (reduce support tickets)
DEPENDENCY: Existing AR/AP/PO modules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Mekari reference:** Mekari portal untuk customer bayar invoice online.  
**Acceptance:** Customer dapat akses portal tanpa akses ke aplikasi full, lihat invoice, bayar online, track PO.

---

## Tier 2: Important Features (6–12 weeks)

### Gap 7: Document Management & E-Signature — ~3–4 weeks

```
□ Document Manager
  ├─ Upload/store documents (PO, invoice, contract, receipt)
  ├─ OCR scanning (extract data from receipt/invoice image)
  ├─ Full-text search
  ├─ Version control (track edits)
  ├─ Archive (move old docs to cold storage)
  └─ Retention policy (auto-delete per doc type)

□ E-Signature Integration
  ├─ Integrate with DocuSign or similar
  ├─ Sign contract workflow
  └─ Signature validation & audit trail
```

**Effort:** 3–4 weeks  
**Impact:** High (compliance, audit)

---

### Gap 8: Advanced HR Features — ~4–6 weeks

```
□ Performance Management
  ├─ 360° feedback (multi-rater reviews)
  ├─ Goal setting & tracking (OKR framework)
  ├─ Competency mapping
  ├─ Performance curve (bell curve analysis)
  └─ Succession planning

□ Learning Management
  ├─ Course catalog
  ├─ Learning paths per role
  ├─ Completion tracking
  └─ Certificate generation

□ Talent Management
  ├─ Skills inventory
  ├─ Career pathing
  ├─ Internal job matching
  └─ Retention analytics
```

**Effort:** 4–6 weeks  
**Impact:** Medium (nice-to-have for mid-market)

---

### Gap 9: Advanced Inventory & Serial/Lot Tracking — ~3–4 weeks

```
□ Serial Number Tracking
  ├─ Track each unit (warranty, recall, traceability)
  ├─ Associate serial to SO/delivery
  └─ Lifetime tracking (purchase → sale → return)

□ Lot/Batch Tracking
  ├─ Track batch number per stock movement
  ├─ Expiry date management
  ├─ FIFO enforcement (auto pick oldest lot)
  └─ Quality hold per batch
```

**Effort:** 3–4 weeks  
**Impact:** Medium (pharma, F&B, electronics)

---

### Gap 10: Multi-Company Consolidation — ~3–4 weeks

```
□ Consolidation Engine
  ├─ Inter-company transactions (eliminate on consolidation)
  ├─ Exchange rate revaluation (per period)
  ├─ Consolidated P&L, Balance Sheet
  ├─ Elimination journals (auto-generate)
  └─ Consolidation audit trail
```

**Effort:** 3–4 weeks  
**Impact:** High (enterprise customers)

---

### Gap 11: Advanced Tax & Compliance — ~2–3 weeks

```
□ E-Invoicing / e-Receipt
  ├─ Indonesia: PKP integration, e-Faktur auto-submission
  ├─ Auto-generate tax codes per product
  ├─ Tax return filing (annual)
  └─ Audit trail per invoice

□ PPN Register
  ├─ Input/Output PPN tracking
  ├─ Monthly PPN report (SPT Masa)
  ├─ Creditable vs non-creditable analysis
  └─ PPN payment schedule
```

**Effort:** 2–3 weeks (if regulations stable)  
**Impact:** Very high (compliance mandatory)

---

## Tier 3: Scaling & Optimization (8–12 weeks)

### Gap 12: Microservices Architecture & Schema-per-Tenant

```
□ Microservices Refactor (backend split)
  ├─ Finance service (GL, AP, AR, FA)
  ├─ HR service (payroll, leave, recruitment)
  ├─ Sales service (SO, CRM, quotation)
  ├─ Supply Chain service (inventory, PO, MRP)
  └─ Reporting service (aggregations, export)

□ Schema-per-Tenant Database Isolation
  ├─ Automated schema creation per tenant
  ├─ Connection pooling per schema
  ├─ Migration automation (apply to all tenants)
  └─ Data backup per tenant

□ Event-Driven Architecture
  ├─ Replace direct DB calls with event streams
  ├─ RabbitMQ/Kafka for decoupling
  ├─ Saga pattern for distributed transactions
  └─ Dead letter queue handling
```

**Effort:** 8–12 weeks  
**Impact:** Very high (enables 1000+ concurrent users)

---

### Gap 13: Advanced Caching & Performance

```
□ Redis Optimization
  ├─ Cache CoA, products, customers
  ├─ Cache dashboard queries
  ├─ Session store in Redis
  └─ Cache invalidation strategy

□ Database Optimization
  ├─ Partitioning large tables (GL, stock movement)
  ├─ Read replicas for reporting
  ├─ Connection pooling optimization
  └─ Query performance benchmarking
```

**Effort:** 2–3 weeks  
**Impact:** High (enables 10x more transactions)

---

### Gap 14: Advanced Monitoring & Observability

```
□ Application Insights
  ├─ APM (Application Performance Monitoring)
  ├─ Error tracking (Sentry or similar)
  ├─ Custom metrics (business KPIs)
  ├─ Alerting (auto-trigger on anomaly)
  └─ SLA dashboard

□ Infrastructure Monitoring
  ├─ Pod/container health (K8s)
  ├─ Database slow queries
  ├─ Cache hit ratio
  └─ Network latency
```

**Effort:** 1–2 weeks  
**Impact:** High (production operations)

---

## Comparison Table: Current vs Target (Mekari/SAP)

| Feature | Current | Mekari | SAP | Target (After Roadmap) |
|---------|---------|--------|-----|----------------------|
| Core modules (Finance, Sales, HR, SC) | ✅ | ✅ | ✅ | ✅ |
| Multi-tenant | ✅ Basic | ✅ | ✅ | ✅ Advanced |
| Custom reporting | ❌ | ✅ | ✅ | ✅ (Phase 1) |
| Workflow automation | ❌ | ✅ | ✅ | ✅ (Phase 1) |
| Mobile app | ❌ | ✅ | ✅ | ✅ (Phase 1–2) |
| Integration marketplace | ❌ | ✅ | ✅ | ✅ (Phase 1) |
| Predictive analytics | ❌ | Partial | ✅ | ✅ (Phase 2) |
| Customer portal | ❌ | ✅ | ✅ | ✅ (Phase 1) |
| Advanced HR | Basic | ✅ | ✅ | Partial (Phase 2) |
| E-signature | ❌ | ✅ | ✅ | ✅ (Phase 2) |
| Schema-per-tenant | ❌ | ✅ | ✅ | ✅ (Phase 3) |
| Microservices | ❌ | Partial | ✅ | ✅ (Phase 3) |

---

## Implementation Roadmap

```
PHASE 1 (Weeks 1–4 after staging live)
├─ Advanced Reporting & BI
├─ Workflow Automation
├─ Integration Marketplace (Stripe, Slack, Zapier)
└─ Customer/Vendor Portals
└─ TIMELINE: ~4 weeks, ~4 devs

PHASE 2 (Weeks 5–12)
├─ Mobile Native Apps (React Native)
├─ Advanced Analytics & Forecasting
├─ Document Management & OCR
├─ Advanced HR (perf reviews, learning)
└─ TIMELINE: ~8 weeks, ~5 devs

PHASE 3 (Weeks 13+)
├─ Microservices refactor
├─ Schema-per-tenant DB isolation
├─ Advanced caching & performance
└─ TIMELINE: ~12 weeks, ~6 devs

PARALLEL (All phases):
├─ Bug fixes + tech debt
├─ Infrastructure hardening
├─ Security audits & compliance (SOC2)
└─ Support & customer success
```

---

## Quick Priority Matrix (Effort vs Impact)

| Feature | Effort | Impact | Priority | Timeline |
|---------|--------|--------|----------|----------|
| Custom reporting | Low | Very High | **P0** | Week 1–2 |
| Workflow automation | Medium | Very High | **P0** | Week 1–4 |
| Integration marketplace | Medium | High | **P0** | Week 2–4 |
| Customer portal | Medium | High | **P0** | Week 2–3 |
| Mobile apps | High | High | **P1** | Week 5–12 |
| Advanced analytics | Medium | Medium | **P1** | Week 5–8 |
| Document management | Medium | Medium | **P2** | Week 9–12 |
| Advanced HR | Medium | Medium | **P2** | Week 9–12 |
| Microservices | High | Very High | **P2** | Week 13+ |
| Schema-per-tenant | High | Very High | **P2** | Week 13+ |

---

## Getting Started: Pick 3 Items for Month 1

```
RECOMMENDED NEXT (post Phase 1):
  1. AWS staging go-live + E2E validation
  2. Dashboard builder + OLAP (Phase 2)
  3. Mobile native apps (Phase 2)
  4. Live Stripe OAuth keys

PHASE 1–4 COMPLETE (7 Jul 2026):
  ✅ Custom report builder + dashboard + KPI + OLAP
  ✅ Workflow engine + inbox + SLA dashboard
  ✅ Integration marketplace (Stripe/Slack/Zapier/JIRA/shipping)
  ✅ Customer/vendor portal JWT auth
  ✅ Analytics, e-sign, HR 360°, mobile Expo
  ✅ 15 locales, industry templates, production infra

REMAINING (ops):
  🟡 AWS live deploy · live OAuth keys · App Store submit
  ✅ Visible to customers immediately
  ✅ Reduce support tickets (portal + automation)
  ✅ Enable 80% of enterprise feature requests

TEAM: 4 engineers (2 backend, 2 frontend), 1 product
TIMELINE: 4 weeks → production ready
```

---

**Document Owner:** Product & Engineering  
**Updated:** 5 July 2026  
**Next Review:** After staging live
