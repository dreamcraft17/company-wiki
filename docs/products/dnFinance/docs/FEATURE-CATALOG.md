# dnFinance — Feature Catalog (V2)

**Owner:** Dozer · **Company:** DN Tech  
**UpdatedAt:** 2 August 2026  
**Spec:** PRD/SRS/SDD V2.0  
**Path:** `dnFinance/`

## Cara membaca

| Status | Arti |
|--------|------|
| **Available** | Ada di UI/API codebase |
| **Conditional** | Ada, tapi butuh env (Postgres/Redis/Gmail) |
| **Roadmap** | Belum produk; jangan dijual sebagai existing |

## 1. Identity & multi-tenant

| Fitur | Surface | Status |
|-------|---------|--------|
| Register company + industry | `/register`, `POST /auth/register` | Available |
| Login / refresh / logout | `/login`, `/auth/*` | Available |
| RBAC (admin, accountant, manager, viewer) | Nav + API guards | Available |
| Tier user limits | `POST /admin/users` | Available |
| Demo tenant seed | `/demo`, login shortcut | Available |

## 2. Chart of Accounts

| Fitur | Surface | Status |
|-------|---------|--------|
| 5 industry templates | `/accounts/templates` | Available |
| Manual account CRUD | `/accounts` | Available |
| Department tag on account | Accounts page | Available |
| Import COA CSV | `/accounts/import` | Available |
| Import opening balances | `/import/opening-balances` | Available |

## 3. General Ledger & Journal

| Fitur | Surface | Status |
|-------|---------|--------|
| Multi-line journal draft | `/journal` | Available |
| Post balanced entry | `POST /journal-entries/:id/post` | Available |
| Journal approval workflow | Submit → approve → post | Available |
| Recurring templates | `/recurring-templates` | Available |
| GL transaction list | `/general-ledger` | Available |
| Auto-posting (invoice, bill, stock) | Internal `postGl()` | Available |

## 4. Accounts Receivable

| Fitur | Surface | Status |
|-------|---------|--------|
| Customer master + import CSV | `/customers`, `/import/customers` | Available |
| Invoice + PPN 11% | `/invoices` | Available |
| Send invoice + email + GL | `POST /invoices/:id/send` | Available |
| Partial payment | `POST /invoices/:id/payments` | Available |
| AR aging + overdue reminders | `/reports/ar-aging` | Available |
| Invoice PDF | `GET /invoices/:id/pdf` | Available |
| Batch invoices | `POST /invoices/batch` | Available |

## 5. Accounts Payable

| Fitur | Surface | Status |
|-------|---------|--------|
| Vendor master + import CSV | `/vendors`, `/import/vendors` | Available |
| Bill + PPh 23 + PPN input | `/bills` | Available |
| Multi-step approval (UI) | Bills page + `/approvals/*` | Available |
| Email approval token (24h) | `/approve/:token` | Available |
| Mark paid + schedule payment | `/bills/:id/mark-paid` | Available |
| AP aging + forecast | `/reports/ap-aging`, `/reports/ap-forecast` | Available |

## 6. Inventory

| Fitur | Surface | Status |
|-------|---------|--------|
| Item master | `/items` | Available |
| Stock in / out | `/stock-movements` | Available |
| Valuation report | `/reports/inventory-valuation` | Available |
| Low stock alert (email) | On stock movement | Conditional |
| FIFO costing | — | Roadmap |

## 7. Reports & tax

| Fitur | Surface | Status |
|-------|---------|--------|
| Trial balance, P&L, BS, CF | `/reports` | Available |
| P&L by department | `?department=` param | Available |
| Tax summary + compliance checklist | `/reports/tax-summary` | Available |
| Budget vs actual | `/reports/budget-vs-actual` | Available |
| e-Faktur CSV + GL CSV export | `/reports/export/*` | Available |
| Scheduled report emails | Reports page + cron | Conditional |
| Report Redis cache (5 min) | Cache service | Roadmap |

## 8. Infrastructure (V2)

| Fitur | Status |
|-------|--------|
| PostgreSQL JSONB snapshot | Conditional |
| Bull email/PDF queue | Conditional |
| Redis cache | Conditional |
| Winston → Datadog | Conditional |
| Rate limit 100 req/min | Available |
| GitHub Actions staging deploy | Conditional |
| Cloud Storage PDFs | Roadmap |
