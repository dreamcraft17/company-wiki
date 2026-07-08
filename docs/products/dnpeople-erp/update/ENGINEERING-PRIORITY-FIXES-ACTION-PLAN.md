# ENGINEERING PRIORITY FIXES & IMPROVEMENTS
## dnPeople ERP — Action Plan (CLOSED + FOLLOW-ON)

**From:** CEO  
**To:** Engineering Team  
**Date:** 3 July 2026 (sprint) · **Updated:** 7 July 2026  
**Status:** Sprint **CLOSED** · Phase 1–4 **CLOSED** · Production hardening **CLOSED** · Ops live deploy **OPEN**  
**Latest commit:** `e2f46fc` (production-ready)

---

## EXECUTIVE SUMMARY

Engineering hardening sprint **selesai lebih awal dari deadline**. Tim menutup semua gap blocking (migrations, BaseEntity, enums, GL docs/tests) plus sprint closure (soft delete, performance indexes, E2E, logo branding).

**Follow-on 4 Jul:** implementasi gap analysis Priority 1–2 (AP/AR, auth, HR PPh 21, procurement, sales, manufacturing, projects) + UI i18n EN/ID + verifikasi Docker Postgres/seed.

**Follow-on 5 Jul:** Phase 1 Tier-1 — custom reporting, workflow, integrations, portal auth (commits `af202eb`, `5d10ce3`).

**Hasil akhir (7 Jul 2026):**
- 24 modul backend, 29 halaman frontend, 15 locales
- **390 unit tests** (83 suites), coverage **≥60%**
- Phase 1–4 + production hardening shipped
- Docker prod, Helm production values, smoke/backup scripts

**Masih open (ops):** AWS credentials → live deploy

**Referensi live:**
- [`CEO-TRACKING-SHEET.md`](CEO-TRACKING-SHEET.md) — executive metrics
- [`DOZER-EXECUTIVE-SUMMARY.md`](DOZER-EXECUTIVE-SUMMARY.md) — launch plan
- [`Docs/11-AUDIT-GAP-ANALYSIS.md`](../Docs/11-AUDIT-GAP-ANALYSIS.md) — gap baseline

---

## PRIORITY MATRIX — FINAL

```
BLOCKING (P0) — ALL DONE ✅
├─ P0.1 TypeORM Migrations — 4 files committed
├─ P0.2 Common Fields — BaseEntity + audit + softDeleteByTenant
├─ P0.3 Enum centralization — EnumsController + Doc 19 + useEnums
└─ P0.4 GL Integration — Doc 20 + expanded gl-integration tests

HIGH (P1) — ALL DONE ✅
├─ P1.1 Business rules (Doc 21)
├─ P1.2 FK columns in Doc 18 (~90% modules)
├─ P1.3 Indexing (Doc 22 + migration 0003 + entity @Index)
└─ P1.4 Data retention (Doc 23)

SPRINT CLOSURE — DONE ✅
├─ softDeleteByTenant on 6 modules
├─ Cypress sales-order E2E
├─ FormDialog enumKey prop
└─ AppLogo + logo.png (sidebar, auth, portal, favicon)

MEDIUM (P2) — PARTIAL / OPS BACKLOG
├─ P2.1 Cross-reference docs — mostly done via Docs 00 index
├─ P2.2 Event flow diagram in Doc 20 — basic flow documented
└─ P2.3 Error handling edge cases in Doc 21 — core cases covered
```

---

## P0 DELIVERABLES (COMPLETED)

### P0.1: TypeORM Migrations ✅

```
✅ backend/src/database/data-source.ts
✅ 1730000000000-Baseline.ts
✅ 1730000000001-AddInvoiceDocumentKind.ts
✅ 1730000000002-AddAuditFields.ts
✅ 1730000000003-AddPerformanceIndexes.ts
✅ app.module.ts: synchronize=false in production
✅ pg-mem (DB_MODE=memory) for local demo

⏳ Ops: full migration:generate snapshot (optional)
⏳ Ops: CI db:migrate before deploy
```

### P0.2: Common Fields Standardization ✅

```
✅ BaseEntity + RootEntity — common/entities/base.entity.ts
✅ ~45 entities extend BaseEntity
✅ EntityAuditSubscriber + AuditInterceptor
✅ softDeleteByTenant() — sales, hr, crm, projects, fixed-assets, supply-chain
✅ Migration 0002 adds audit columns
```

### P0.3: Enum Centralization ✅

```
✅ common/enums/ — business, finance, hr-extended, enterprise, crm enums
✅ GET /api/v1/enums + GET /api/v1/enums/:name
✅ Docs/19-ENUMS-REFERENCE.md
✅ frontend/src/hooks/useEnums.ts
✅ FormDialog enumKey prop

⏳ Ops: wire enumKey on all remaining form fields (infra ready)
```

### P0.4: GL Integration Events ✅

```
✅ Docs/20-GL-INTEGRATION-EVENTS.md
✅ event-consumer.service.spec.ts
✅ gl-integration.service.spec.ts — postArReceipt, postApPayment added
✅ 355 tests total, all passing (68 suites · 60.08% stmt coverage)
```

**GL event map (production code):**

| Event / Call | GL Method | Debit | Credit |
|--------------|-----------|-------|--------|
| `sales.order.confirmed` | postSalesRevenue | 1110 AR | 6010 Revenue |
| `procurement.po.received` | postInventoryReceipt | 1210 Inventory | 3010 AP |
| `manufacturing.order.completed` | postManufacturingCompletion | 1230 FG | 8010 WIP |
| AR payment (direct) | postArReceipt | 1010 Cash | 1110 AR |
| AP payment (direct) | postApPayment | 3010 AP | 1010 Cash |

---

## P1 DELIVERABLES (COMPLETED)

| Item | Doc / Code | Status |
|------|------------|--------|
| Business rules | `Docs/21-BUSINESS-RULES-VALIDATION.md` | ✅ |
| FK in schema reference | `Docs/18-MODULE-FEATURES-SCHEMA.md` | ✅ ~90% |
| Indexing strategy | `Docs/22-DATABASE-INDEXING-STRATEGY.md` | ✅ |
| Performance indexes | migration 0003 + entity `@Index` | ✅ |
| Data retention | `Docs/23-DATA-RETENTION-POLICY.md` | ✅ |

**Indexes added (migration 0003 + entities):**
- `invoices`: `(tenantId, type, status)`, `(tenantId, invoiceNumber)`
- `journal_entries`: `(tenantId, entryDate)`
- `sales_orders`: `(tenantId, status)`
- `purchase_orders`: `(tenantId, status)`
- `leave_requests`: `(tenantId, status)`

---

## SPRINT CLOSURE DELIVERABLES (COMPLETED)

| Item | Files |
|------|-------|
| Soft delete util | `backend/src/common/utils/soft-delete.util.ts` |
| Service updates | crm, hr, sales, projects, fixed-assets, supply-chain |
| Cypress E2E | `frontend/cypress/e2e/sales-order.cy.ts`, `smoke.cy.ts` |
| Logo component | `frontend/src/components/AppLogo.tsx` |
| Logo asset | `frontend/public/logo.png` |
| Logo usage | Layout, Login, Register, Forgot/Reset, Portal, favicon |

---

## SUCCESS METRICS — ACTUAL vs TARGET

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| TypeScript errors | 0 | 0 | ✅ |
| Unit tests | 250+ | 390 | ✅ |
| Test coverage | 60% | ≥60% | ✅ |
| Migrations committed | Yes | 11 files (0000–0011) | ✅ |
| BaseEntity adoption | ≥95% | ~45 entities | ✅ |
| Docs 18–23 | Complete | Complete | ✅ |
| Enum API | Live | Live | ✅ |
| Phase 1 Tier-1 | Shipped | 4/4 tracks | ✅ |
| E2E Cypress | Basic flows | smoke + auth + sales + Phase 1 stubs | 🟡 |
| Production build | Green | Green | ✅ |
| Staging deploy | Live | Not yet | 🟡 Ops backlog |

---

## TIMELINE — ACTUAL

```
3 Jul 2026 (Day 1):
  ✅ P0.1–P0.4 engineering hardening (commit eaa1dc2)
  ✅ P1 Docs 19–23
  ✅ Sprint closure: soft delete, indexes, E2E, logo (commit 5500207)
  ✅ All tests green, builds green
  ✅ update/ docs synced

Ops backlog (post-sprint):
  → ~~Test coverage expansion~~ ✅ (5 Jul: 60.08%)
  → ~~Phase 1 Tier-1 features~~ ✅ (5 Jul)
  → AWS staging deploy (Doc 15)
  → Full Phase 1 Cypress E2E
  → Phase 2+ (dashboards, mobile, schema-per-tenant) per Doc 17
```

---

## LOCAL DEVELOPMENT MODES

| Mode | Command | Use Case |
|------|---------|----------|
| **pg-mem** | `DB_MODE=memory npm run start:dev:mem` | Demo/UI tanpa Postgres |
| **Postgres** | `npm run infra:up` + `npm run db:migrate` + `npm run start:dev` | Migration testing |
| **Production** | `NODE_ENV=production` + `npm run db:migrate` | Staging/prod |

Login demo: `admin@demo.com` / `Demo1234!`

---

## NEXT STEPS (OPS)

1. ~~**Test coverage 60%+**~~ ✅ (4 Jul)
2. ~~**CI hardening** (`db:migrate` + coverage gate)~~ ✅
3. ~~**Gap analysis Priority 1–2 + i18n**~~ ✅ (4 Jul)
4. ~~**Phase 1 Tier-1 (4 tracks)**~~ ✅ (5 Jul)
5. **Deploy staging** — AWS secrets + Terraform apply + Helm ← **current blocker**
6. **Staging E2E + load test** (wire Phase 1 Cypress)
7. **Production secrets** — SMTP, Stripe live keys
8. **Phase 2+** — dashboards, mobile, OLAP (long-term)

---

**CEO Signature:** ✍️  
**Sprint closed:** 3 July 2026  
**Feature gap closed:** 4 July 2026  
**Phase 1 closed:** 5 July 2026  
**Next review:** AWS staging go-live
