# dnCore — Feature Catalog

**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** dnCore  
**UpdatedAt:** July 19, 2026  
**Snapshot:** HEAD `fdc12c2` · Phase 8 in-repo close-out · **408** tests · **27** modules · **31** pages · **86** entities · migrations through `0017`  

> Produk ERP NestJS — **bukan** HRIS `dnPeople`. Spec: `Docs/prd/`.

## Cara membaca

| Status | Arti |
|--------|------|
| **Available** | Coded + UI/API inti ada |
| **Conditional** | Coded; production butuh vendor/AWS/keys |
| **Roadmap** | Belum existing |

## 1. Platform & identity

| Fitur | Kapabilitas | Status |
|-------|-------------|--------|
| Multi-tenant | Row-level tenantId; optional schema mode | Available |
| Auth JWT + refresh | Login/register, throttling | Available |
| 2FA TOTP | Setup/enable (issuer dnCore) | Available |
| Google SSO | OAuth login | Conditional — credentials |
| Portal JWT | Customer/vendor portal terpisah | Available |
| Plans Free→Enterprise | Seat + module + storage quota | Available |
| Module access guard | Path interceptor by plan | Available |
| GDPR tools | Export, consent, erasure | Available |
| Billing / Stripe | Checkout + **failed-payment retry** + local upgrade | Conditional — live Stripe |
| Email digest | Daily digest via EmailService (SMTP or console) | Available |
| White-label / partner | Platform layer V3 + **reseller admin** | Available |
| Marketplace revenue share | Purchase + platform/partner split (Stripe Connect or MOCK) | Available · Conditional live Connect |

## 2. Finance & tax (Indonesia)

| Fitur | Kapabilitas | Status |
|-------|-------------|--------|
| GL / COA / Journal | Posting, reversal, period close | Available |
| AP / AR / aging | Invoices, payments, statements | Available |
| Financial statements | BS, P&L, cash flow | Available |
| e-Faktur / tax exports | Compliance module SPT stubs | Available · MVP+ |
| Bank recon / 3-way match / dunning | Advanced finance | Available |
| GL integration events | Sales/PO/MO → GL + webhook | Available |

## 3. Sales, supply chain, manufacturing

| Fitur | Kapabilitas | Status |
|-------|-------------|--------|
| Sales orders DRAFT→Confirm | Credit limit, inventory reserve | Available |
| Quotations / volume pricing | QT → SO | Available |
| Inventory / PO / GR | Warehouses, barcode, MRP | Available |
| Manufacturing | BOM, MO, scrap, capacity, QC | Available |
| Enterprise procurement | RFQ, requisitions, cycle count | Available |

## 4. HR & talent-adjacent

| Fitur | Kapabilitas | Status |
|-------|-------------|--------|
| Employees / attendance / leave | Core HR | Available |
| Payroll PPh 21 | Payroll + THR/bonus | Available |
| Recruitment ATS | Pipeline | Available |
| 360° feedback | HR reviews | Available |
| LMS | Courses, enrollments, certificates | Available · MVP+ (V3) |

## 5. CRM, projects, assets

| Fitur | Kapabilitas | Status |
|-------|-------------|--------|
| CRM pipeline | Leads, opportunities | Available |
| Projects / time | Billable, budget, utilization | Available |
| Fixed assets | Depreciation, maintenance | Available |

## 6. Reporting, workflow, analytics

| Fitur | Kapabilitas | Status |
|-------|-------------|--------|
| Custom reports / OLAP | Builder + saved reports | Available |
| Dashboard builder / KPI alerts | Widgets + thresholds | Available |
| Workflow approvals / SLA | Inbox, detail drawer, escalations + webhook | Available |
| Analytics forecast/churn/anomaly | Rule/ensemble MVP + cash-flow + AR risk UI | Available · Conditional depth |

## 7. Documents, integrations, ops

| Fitur | Kapabilitas | Status |
|-------|-------------|--------|
| Documents + e-sign | Upload + search + OCR + e-sign request UI | Available · Conditional — DocuSign/live |
| Outbound webhooks | HMAC + 3× retry + DLQ | Available |
| Shopify → Sales Orders | Sync + inbound webhook creates DRAFT SO | Available · Conditional live shop |
| Shipping JNE/Sicepat | Label + track adapters | Available · Conditional keys |
| Per-tenant API quota | Hourly plan limit (Redis/memory) | Available |
| Slack approve button | Block Kit deep-link | Available · Conditional token |
| Ops restore-test UI | Enterprise hub PASS/FAIL | Available |
| Grafana dashboards | System + SLA provisioned | Available |
| Integration gallery | Gallery + OAuth URL + shipping label UI + marketplace | Conditional — API keys |
| Ops backup monitor | Cron + restore-test log + local drill script | Conditional — AWS RDS/S3 |
| Compliance retention | Policies + real purge | Available |
| Mobile-first web | Drawer &lt;md · all tables scroll · scrollable Tabs · KPI grids | Available · **complete** |
| Mobile Expo | Tabs + offline + biometric + push (foundation) | **On hold** — not expanding |
| Mobile push tokens | Register/unregister + Expo fan-out (API ready) | Available · unused while Expo held |

## 8. Roadmap boundary

- Full microservices split beyond registry scaffold  
- Production ML microservice (Prophet/FastAPI) as dedicated service (in-process ensemble + optional OpenAI hint done)  
- App Store / Play Store parity (Expo **on hold**)  
- SOC 2 Type II certification (process)  
- Phase 5 AWS live credentials  

## Referensi

- [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md)  
- [prd/01-PRD-dnCore-v1.md](./prd/01-PRD-dnCore-v1.md)  
- [v3/IMPLEMENTATION-STATUS.md](./v3/IMPLEMENTATION-STATUS.md)  

Property of DN Tech — PT. Dozer Napitupulu Technology · 2026
