# dnPeople PRD v5 — Subscription Tier Implementation

**Implemented:** 16 July 2026 · **Xendit primary PG:** August 2026
**Specification:** `company-wiki/docs/products/dnPeople/PRD/v5/`

## Delivered

- Five tiers: `FREE`, `STARTER`, `PROFESSIONAL`, `BUSINESS`, and `ENTERPRISE`.
- Default `FREE` subscription for new company registration.
- Idempotent legacy migration to `PROFESSIONAL` without deleting v4 data.
- Subscription, invoice, and subscription-audit data models plus deployment migration.
- Server-side feature enforcement, minimum-tier checks, manual feature overrides, read-only grace mode, and frozen mode.
- Upgrade/downgrade pricing snapshots, prorated invoice creation, cancellation, suspension, and reactivation.
- **Xendit Invoice v2** hosted checkout (primary, Aug 2026): `POST /payments/initiate-payment`, webhook `/webhooks/xendit`, return sync `/payments/sync`, public pay `/public/invoices/:id/pay`.
- Stripe Payment Intent and manual bank-transfer payment request adapters (legacy).
- Signed Stripe webhook handling; Xendit callback-token webhook for payment success/failure.
- API-key Business-tier enforcement, 90-day default expiry, and persistent 1,000 request/hour limit.
- Free/Starter/Professional headcount enforcement and subscription headcount synchronization (**live:** FREE hard **30**, STARTER hard **50**; capacity emails every 7 days at 80%+).
- Professional webhook limit of 10; Business unlocks API keys and custom integrations.
- **PRD v12.1 (Jul 2026):** helpdesk on FREE; shifts on STARTER; Jakarta API daily quota (API keys); storage hard-block; `/upgrade` page; TenantQuota synced from tier.
- Business branch settings on work locations: UMR, tax method, BPJS rates, annual leave, shift multiplier, and approval config.
- Branch settings feed payroll calculation and annual leave allocation; reports accept `workLocationId` filtering.
- Location-scoped row access for branch HR via `DataAccessRule.scopeType = location`.
- Enterprise SSO and public branding enforcement, multi-company dashboard, and secure company-context switching for super admins.
- Frontend subscription context, tier-aware navigation, direct-URL gate, upgrade prompt, read-only banner, **polished billing dashboard** (stat cards, invoice filters, PDF export, Xendit payment labels), invoices, cancellation/reactivation, branch configuration, and multi-company dashboard.
- **Invoice PDF (Aug 2026):** `GET /subscription/invoices/:id.pdf` — logo mark from `backend/src/assets/logo-mark.png`.
- **Marketing pricing SSOT (Jul 2026):** `frontend/src/lib/subscriptionCatalog.ts` mirrors backend `TIER_PRICE_PER_EMPLOYEE` / PRD v5 headcount ranges; shared by `/billing` and public `/welcome` `/pricing`.

## API

Base path: `/api/v1/subscription`

| Method | Path | Purpose |
|---|---|---|
| GET | `/current` | Current subscription, features, access mode, and recent invoices |
| GET | `/features` | Effective feature access including overrides |
| GET | `/invoices` | Invoice history |
| POST | `/invoices/:id/payment` | Create Stripe or manual payment request (legacy) |
| GET | `/audit` | Subscription change history |
| POST | `/upgrade` | Change tier and create a prorated invoice |
| POST | `/cancel` | Cancel with grace/freeze/retention timestamps |
| POST | `/reactivate` | Reactivate a cancelled or suspended subscription |
| PUT | `/features` | Super-admin feature overrides |
| POST | `/webhooks/stripe` | Signed Stripe billing event |

**Xendit (primary):** see [API.md](./API.md#xendit-payments-primary--agustus-2026) and [xendit/XENDIT-PAYMENT-SETUP.md](./xendit/XENDIT-PAYMENT-SETUP.md).

## Deployment

Database baru atau database yang sudah mempunyai Prisma migration history:

```bash
cd backend
npm ci
npm run db:migrate
npm run build
```

Database production legacy yang sebelumnya dikelola dengan `prisma db push` harus mengikuti prosedur
baseline satu kali di [DEPLOYMENT.md](./DEPLOYMENT.md#database-migrations) sebelum `db:migrate`.
Migration v5 sudah melakukan backfill subscription secara idempotent. Jangan menjalankan `db:seed`
pada update production.

Configure **Xendit** in `backend/.env` (`XENDIT_SECRET_KEY`, `XENDIT_WEBHOOK_TOKEN`); test mode uses `xnd_development_…` keys. Without credentials, pay endpoints return `503 BILLING_NOT_CONFIGURED`. Manual bank-transfer fallback via `BILLING_BANK_INSTRUCTIONS` when Xendit is down.

## Verification

- Prisma format and validation: pass.
- Backend TypeScript build: pass.
- Backend automated tests: **80/80** pass.
- Frontend ESLint: 0 errors (pre-existing hook dependency warnings remain).
- Frontend production build: pass, 49 routes.

Production acceptance still requires provider sandbox/live credentials, signed webhook delivery tests, SMTP deliverability, staging migration rehearsal, backup/restore drill, and customer UAT. These are external operational gates, not code gaps.
