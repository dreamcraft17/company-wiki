# dnPeople PRD v6 — Enterprise Multi-Tenant Implementation

**Implemented:** 17 July 2026  
**Specification:** `company-wiki/docs/products/dnPeople/PRD/dnpeople-prd-v6-enterprise-multitenant.md`; login refinement `company-wiki/docs/products/dnPeople/PRD/dnpeople-prd-v6.1-login-tenant-discovery.md`

## Delivered

- Tenant isolation policy `POOL`, `SILO`, and `BRIDGE`, Business/Enterprise tier enforcement,
  dedicated database reference metadata, and cross-tenant context blocking.
- Tenant discovery from verified email domains, verified custom hostnames, and user history.
- PRD v6.1 seamless login: `/auth/login` accepts only email/password for normal users,
  routes active-SSO tenants to the IdP, validates password tenants directly, and returns a
  company picker fallback when tenant discovery cannot resolve the company.
- Per-tenant SAML, generic OIDC, Google, and Microsoft policy metadata including audience,
  enforce-SSO, JIT enablement, and default role.
- JIT provisioning scoped by company and allowed domain.
- Organization hierarchy inside a tenant, default organization backfill, and employee assignment.
- User-specific role scopes for organization, department, location, custom values, or all access.
- Tenant-scoped SCIM 2.0 bearer tokens, Users CRUD/deactivation, Groups, and group membership.
- Tenant quota and daily usage models for employees, API calls, storage, concurrent users,
  query timeout, and request-per-minute policy.
- Tenant-specific rate enforcement, usage collection, and isolation breach audit.
- White-label custom domain, DNS verification metadata, accent color, email identity,
  footer, privacy, and terms links.
- Enterprise Tenant Management page for isolation, organization hierarchy, and quota visibility.

## API

Tenant management uses `/api/v1/tenants`:

| Method | Path | Purpose |
|---|---|---|
| POST | `/discover` | Discover tenant from email domain/hostname |
| GET | `/branding/domain` | Resolve public branding for verified hostname |
| GET | `/current` | Current tenant policy and configuration |
| PATCH | `/isolation` | Select POOL/SILO/BRIDGE policy |
| GET/POST/PATCH | `/organizations` | Manage tenant organization hierarchy |
| GET/PUT | `/role-scopes` | Manage user-specific row scopes |
| GET/PATCH | `/quota` | Inspect usage and manage quota |
| GET | `/audit` | Tenant isolation/security audit |
| POST | `/scim-tokens` | Issue a tenant-specific SCIM secret once |

SCIM base path is `/scim/v2/:tenantId`; it implements Users list/create/read/patch/delete
and Groups list/create/patch with `application/scim+json`.

## Deployment

```bash
cd backend
npm ci
npm run db:migrate
npm run build

cd ../frontend
npm ci
npm run build
```

Migration `20260717000000_enterprise_multitenant_v6` creates a `MAIN` organization for each
existing company, assigns existing employees to it, and creates tier-aware default quota rows.
Do not run `db:seed` during a production update.

`SILO` and `BRIDGE` selection records policy and control-plane metadata. Provisioning a dedicated
PostgreSQL database, secret rotation, tenant data copy, cutover, backup/restore, and failback remain
deployment operations and must complete before marking a tenant physically isolated.

## Verification

- Prisma format and validation: pass.
- Backend TypeScript build: pass.
- Backend automated tests: 24/24 pass.
- Frontend production build: pass, 49 routes.

Production acceptance additionally requires an IdP SCIM conformance run, SSO signature/audience
tests, DNS/TLS validation, SILO migration rehearsal, load testing, and backup/restore drills.
