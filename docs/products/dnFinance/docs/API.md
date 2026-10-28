# dnFinance — API Reference (summary)

**Base URL:** `http://localhost:3000/api/v1` (dev)  
**Swagger:** `http://localhost:3000/api/docs` (interactive, v2.0)  
**Auth:** `Authorization: Bearer <token>`

## Public

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Stack status (postgres, email, redis) |
| GET | `/demo` | Demo credentials hint |
| POST | `/auth/register` | Register tenant |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh token |
| GET | `/approvals/token/:token` | Preview approval (no auth) |
| POST | `/approvals/token/:token` | Decide approve/reject (no auth) |

## Auth & dashboard

| Method | Path |
|--------|------|
| POST | `/auth/logout` |
| GET | `/dashboard` |

## Accounts & GL

| Method | Path |
|--------|------|
| GET/POST | `/accounts` |
| GET | `/accounts/templates` |
| POST | `/accounts/templates/:industry/apply` |
| POST | `/accounts/import` |
| GET | `/departments` |
| GET/POST | `/journal-entries` |
| POST | `/journal-entries/:id/post` |
| POST | `/journal-entries/:id/submit-for-approval` |
| POST | `/journal-approvals/:id/approve` |
| GET | `/general-ledger` |
| GET/POST | `/recurring-templates` |
| POST | `/recurring-templates/:id/post` |
| POST | `/settings/journal-approval` |

## AR / AP

| Method | Path |
|--------|------|
| GET/POST | `/customers`, `/vendors` |
| GET/POST | `/invoices`, `/invoices/batch` |
| POST | `/invoices/:id/send`, `/invoices/:id/payments` |
| GET | `/invoices/:id/pdf` |
| GET/POST | `/bills` |
| POST | `/bills/:id/submit-for-approval`, `/bills/:id/mark-paid` |
| GET | `/approvals/pending` |
| POST | `/approvals/:id/approve`, `/approvals/:id/reject` |

## Inventory & import

| Method | Path |
|--------|------|
| GET/POST | `/items` |
| POST | `/stock-movements` |
| POST | `/import/opening-balances`, `/import/customers`, `/import/vendors` |

## Reports

| Method | Path |
|--------|------|
| GET | `/reports/trial-balance`, `/reports/p-and-l`, `/reports/balance-sheet` |
| GET | `/reports/cash-flow`, `/reports/tax-summary`, `/reports/ar-aging` |
| GET | `/reports/ap-aging`, `/reports/ap-forecast`, `/reports/budget-vs-actual` |
| GET | `/reports/inventory-valuation` |
| GET | `/reports/export/transactions.csv`, `/reports/export/efaktur.csv` |
| GET/POST | `/scheduled-reports` |
| POST | `/scheduled-reports/:id/cancel` |

## Admin

| Method | Path |
|--------|------|
| GET/POST | `/admin/users` |
| GET | `/admin/audit-logs`, `/email-log` |
| POST | `/demo/reset` |
| POST | `/budgets`, `/compliance/:id/complete` |

> Full request/response schemas: Swagger UI at `/api/docs`.
