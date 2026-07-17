# dnPeople PRD v6 — Enterprise Multi-Tenant Implementation

**Implemented:** 17 July 2026  
**Source implementation:** `dnpeople/docs/V6-ENTERPRISE-MULTITENANT-IMPLEMENTATION.md`

## Implementation status

PRD v6 control-plane and product surfaces are implemented:

- POOL/SILO/BRIDGE tenant policy with tier enforcement and isolation audit;
- verified-domain tenant discovery and per-tenant SSO/JIT policy;
- organization hierarchy and organization/department/location role scopes;
- tenant-scoped SCIM 2.0 Users and Groups endpoints;
- tenant quota, daily usage, rate enforcement, and monitoring API;
- verified custom-domain branding metadata and public resolution;
- Enterprise Tenant Management web page;
- backward-compatible migration and legacy organization/quota backfill.

## Operational boundary

Choosing `SILO` or `BRIDGE` stores the approved isolation policy and dedicated database reference.
Physical database provisioning, secret management, data copy, cutover, backup/restore, and failback
are infrastructure operations. A tenant must not be represented as physically isolated until those
steps have passed an isolation and restore drill.

## Evidence

- Prisma schema validation: pass.
- Backend TypeScript build: pass.
- Backend tests: 24/24 pass.
- Frontend production build: pass, 49 routes.

See the implementation repository document for API contracts, migration name, and deployment steps.
