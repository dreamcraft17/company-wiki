# dnPeople PRD v5 — Subscription Tier Implementation

**Implemented:** 16 July 2026
**Specification:** `company-wiki/docs/products/dnPeople/PRD/v5/`

## Delivered

- Five tiers: `FREE`, `STARTER`, `PROFESSIONAL`, `BUSINESS`, and `ENTERPRISE`.
- Default `FREE` subscription for new company registration.
- Idempotent legacy migration to `PROFESSIONAL` without deleting v4 data.
- Subscription, invoice, and subscription-audit data models plus deployment migration.
- Server-side feature enforcement, minimum-tier checks, manual feature overrides, read-only grace mode, and frozen mode.
- Upgrade/downgrade pricing snapshots, prorated invoice creation, cancellation, suspension, and reactivation.
- Stripe Payment Intent, Xendit Invoice, and manual bank-transfer payment request adapters.
- Signed Stripe/Xendit webhook handling for payment success/failure and automatic suspension.
- API-key Business-tier enforcement, 90-day default expiry, and persistent 1,000 request/hour limit.
- Free/Starter/Professional headcount enforcement and subscription headcount synchronization.
- Professional webhook limit of 10; Business unlocks API keys and custom integrations.
- Business branch settings on work locations: UMR, tax method, BPJS rates, annual leave, shift multiplier, and approval config.
- Branch settings feed payroll calculation and annual leave allocation; reports accept `workLocationId` filtering.
- Location-scoped row access for branch HR via `DataAccessRule.scopeType = location`.
- Enterprise SSO and public branding enforcement, multi-company dashboard, and secure company-context switching for super admins.
- Frontend subscription context, tier-aware navigation, direct-URL gate, upgrade prompt, read-only banner, billing dashboard, invoices, cancellation/reactivation, branch configuration, and multi-company dashboard.

## API

Base path: `/api/v1/subscription`

| Method | Path | Purpose |
|---|---|---|
| GET | `/current` | Current subscription, features, access mode, and recent invoices |
| GET | `/features` | Effective feature access including overrides |
| GET | `/invoices` | Invoice history |
| POST | `/invoices/:id/payment` | Create Stripe, Xendit, or manual payment request |
| GET | `/audit` | Subscription change history |
| POST | `/upgrade` | Change tier and create a prorated invoice |
| POST | `/cancel` | Cancel with grace/freeze/retention timestamps |
| POST | `/reactivate` | Reactivate a cancelled or suspended subscription |
| PUT | `/features` | Super-admin feature overrides |
| POST | `/webhooks/stripe` | Signed Stripe billing event |
| POST | `/webhooks/xendit` | Token-authenticated Xendit billing event |

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

Configure at least one billing provider in `backend/.env`; without provider credentials, manual bank-transfer instructions remain available.

## Verification

- Prisma format and validation: pass.
- Backend TypeScript build: pass.
- Backend automated tests: 24/24 pass.
- Frontend ESLint: 0 errors (pre-existing hook dependency warnings remain).
- Frontend production build: pass, 49 routes.

Production acceptance still requires provider sandbox/live credentials, signed webhook delivery tests, SMTP deliverability, staging migration rehearsal, backup/restore drill, and customer UAT. These are external operational gates, not code gaps.
