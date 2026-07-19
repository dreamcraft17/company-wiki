# dnPeople ERP — Feature Catalog

**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** dnPeople ERP  
**UpdatedAt:** July 19, 2026  
**Snapshot:** HEAD `9bf15e2` · **392** tests · **27** modules · **30** pages · **83** entities  

> Produk ERP NestJS — **bukan** HRIS `dnpeople`. Spec V3: `Docs/v3/`.

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
| 2FA TOTP | Setup/enable | Available |
| Google SSO | OAuth login | Conditional — credentials |
| Portal JWT | Customer/vendor portal terpisah | Available |
| GDPR tools | Export, consent, erasure | Available |
| Billing / Stripe | Plan limits, checkout | Conditional — live Stripe |
| White-label / partner | Platform layer V3 | Available · MVP+ |

## 2. Finance & tax (Indonesia)

| Fitur | Kapabilitas | Status |
|-------|-------------|--------|
| GL / COA / Journal | Posting, reversal, period close | Available |
| AP / AR / aging | Invoices, payments, statements | Available |
| Financial statements | BS, P&L, cash flow | Available |
| e-Faktur / tax exports | Compliance module SPT stubs | Available · MVP+ |
| Bank recon / 3-way match / dunning | Advanced finance | Available |
| GL integration events | Sales/PO/MO → GL | Available |

## 3. Sales, supply chain, manufacturing

| Fitur | Kapabilitas | Status |
|-------|-------------|--------|
| Sales orders / quotations | Credit limit, volume pricing | Available |
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
| Workflow approvals / SLA | Inbox, escalations | Available |
| Analytics forecast/churn/anomaly | Rule/ensemble MVP | Available · Conditional depth |

## 7. Documents, integrations, ops

| Fitur | Kapabilitas | Status |
|-------|-------------|--------|
| Documents + e-sign | Upload + stub certificate | Conditional — DocuSign/live |
| Integration gallery | Slack, Zapier, Shopify, JIRA, shipping | Conditional — API keys |
| Ops backup monitor | Cron + restore-test log | Conditional — AWS RDS/S3 |
| Compliance retention | Policies + purge cron | Available · MVP+ |
| Mobile Expo | Login + dashboard | Conditional — store |

## 8. Roadmap boundary

- Full microservices split beyond registry scaffold  
- Production ML microservice (Prophet/FastAPI)  
- App Store / Play Store parity  
- SOC 2 Type II certification (process)  

## Referensi

- [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md)  
- [v3/IMPLEMENTATION-STATUS.md](./v3/IMPLEMENTATION-STATUS.md)  
- [18-MODULE-FEATURES-SCHEMA.md](./18-MODULE-FEATURES-SCHEMA.md)  

Property of DN Tech — PT. Dozer Napitupulu Technology · 2026
