# dnPeople — Database Indexing Strategy

**Terakhir diperbarui:** 3 Juli 2026  
**ORM:** TypeORM `@Index()` decorators pada entity  
**Database:** PostgreSQL (production) · pg-mem (`DB_MODE=memory`)

Dokumen ini mencatat index yang **sudah didefinisikan di kode** dan rekomendasi composite index tambahan untuk skala production. Skema tabel lengkap: [`18-MODULE-FEATURES-SCHEMA.md`](18-MODULE-FEATURES-SCHEMA.md).

---

## Prinsip Umum

| Prinsip | Implementasi dnPeople |
|---------|----------------------|
| Multi-tenant | Hampir semua index dimulai dengan `tenantId` sebagai leading column |
| Uniqueness bisnis | Nomor dokumen unik per tenant: `(tenantId, *Number)` |
| Lookup FK | Index pada kolom relasi yang sering di-JOIN/filter |
| Audit / time-series | `(tenantId, createdAt)` untuk audit log & reporting |

**Konvensi kolom:** Semua entitas bisnis extend `BaseEntity` dengan `tenantId`, `createdAt`, `updatedAt`, `deletedAt` — lihat [`23-DATA-RETENTION-POLICY.md`](23-DATA-RETENTION-POLICY.md).

---

## Index Existing (dari `@Index` Decorators)

### Auth & Users

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `User` | `(tenantId, email)` | ✅ | `auth/entities/user.entity.ts` |

### Finance

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `ChartOfAccount` | `(tenantId, code)` | ✅ | `finance/entities/chart-of-account.entity.ts` |
| `JournalEntry` | `(tenantId, entryNumber)` | ✅ | `finance/entities/journal-entry.entity.ts` |
| `Invoice` | `(tenantId, invoiceNumber)` | ✅ | `finance/entities/invoice.entity.ts` |
| `Customer` | `(tenantId, code)` | ✅ | `finance/entities/customer.entity.ts` |
| `Vendor` | `(tenantId, code)` | ✅ | `finance/entities/vendor.entity.ts` |
| `AccountingPeriod` | `(tenantId, name)` | ✅ | `finance/entities/accounting-period.entity.ts` |
| `TaxRecord` | `(tenantId, period, taxType)` | — | `finance/entities/tax-record.entity.ts` |
| `EFakturDocument` | `(tenantId, invoiceNumber)` | ✅ | `finance/entities/efaktur-document.entity.ts` |

### Sales

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `SalesOrder` | `(tenantId, orderNumber)` | ✅ | `sales/entities/sales-order.entity.ts` |
| `SalesQuotation` | `(tenantId, quotationNumber)` | ✅ | `sales/entities/sales-quotation.entity.ts` |

### Supply Chain

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `Product` | `(tenantId, sku)` | ✅ | `supply-chain/entities/product.entity.ts` |
| `Warehouse` | `(tenantId, code)` | ✅ | `supply-chain/entities/warehouse.entity.ts` |
| `PurchaseOrder` | `(tenantId, poNumber)` | ✅ | `supply-chain/entities/purchase-order.entity.ts` |
| `StockLevel` | `(tenantId, productId, warehouseId)` | ✅ | `supply-chain/entities/stock-level.entity.ts` |
| `StockMovement` | `(tenantId, referenceNumber)` | ✅ | `supply-chain/entities/stock-movement.entity.ts` |

### Manufacturing

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `BillOfMaterial` | `(tenantId, code)` | ✅ | `manufacturing/entities/bill-of-material.entity.ts` |
| `ManufacturingOrder` | `(tenantId, orderNumber)` | ✅ | `manufacturing/entities/manufacturing-order.entity.ts` |

### HR

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `Employee` | `(tenantId, employeeNumber)` | ✅ | `hr/entities/employee.entity.ts` |
| `AttendanceRecord` | `(tenantId, employeeId, date)` | ✅ | `hr/entities/attendance-record.entity.ts` |
| `PayrollRun` | `(tenantId, periodLabel)` | ✅ | `hr/entities/payroll-run.entity.ts` |
| `OvertimeRecord` | `(tenantId, employeeId, date)` | — | `hr/entities/hr-extended.entity.ts` |

### CRM

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `Lead` | `(tenantId, email)` | — | `crm/entities/crm.entity.ts` |
| `Opportunity` | `(tenantId, title)` | — | `crm/entities/crm.entity.ts` |

### Projects

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `Project` | `(tenantId, code)` | ✅ | `projects/entities/project.entity.ts` |
| `TimeEntry` | `(tenantId, projectId)` | — | `projects/entities/time-entry.entity.ts` |

### Reporting

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `ReportPeriod` | `(tenantId, periodCode)` | ✅ | `reporting/entities/report-period.entity.ts` |
| `ReportBudgetLine` | `(tenantId, periodCode, accountCode)` | ✅ | `reporting/entities/report-budget-line.entity.ts` |
| `FinancialStatementItem` | `(tenantId, reportPeriodId, statementType, lineNumber)` | — | `reporting/entities/financial-statement-item.entity.ts` |
| `TrialBalance` | `(tenantId, reportPeriodId, accountCode)` | — | `reporting/entities/trial-balance.entity.ts` |
| `FinancialNote` | `(tenantId, section)` | ✅ | `reporting/entities/financial-note.entity.ts` |
| `RelatedPartyTransaction` | `(tenantId, periodCode)` | — | `reporting/entities/related-party-transaction.entity.ts` |
| `ReportAuditTrail` | `(tenantId, reportPeriodId)` | — | `reporting/entities/report-audit-trail.entity.ts` |
| `ReportExportFile` | `(downloadToken)` | ✅ | `reporting/entities/report-export-file.entity.ts` |
| `BusinessSegment` | `(tenantId, code)` | ✅ | `reporting/entities/business-segment.entity.ts` |
| `ConsolidationMember` | `(parentTenantId, childTenantId)` | ✅ | `reporting/entities/consolidation-member.entity.ts` |

### Enterprise

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `StockBin` | `(tenantId, warehouseId, code)` | ✅ | `enterprise/entities/enterprise.entity.ts` |
| `PriceList` | `(tenantId, code)` | ✅ | `enterprise/entities/enterprise.entity.ts` |

### Fixed Assets & Finance Advanced

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `FixedAsset` | `(tenantId, assetCode)` | ✅ | `fixed-assets/entities/fixed-asset.entity.ts` |
| `BankAccount` | `(tenantId, accountNumber)` | ✅ | `fixed-assets/entities/fixed-asset.entity.ts` |
| `ExpenseClaim` | `(tenantId, claimNumber)` | ✅ | `fixed-assets/entities/fixed-asset.entity.ts` |

### Integrations & Portal

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `Webhook` | `(tenantId)` | — | `integrations/entities/integration.entity.ts` |
| `ApiKey` | `(tenantId, keyHash)` | ✅ | `integrations/entities/integration.entity.ts` |
| `SupportTicket` | `(tenantId, customerEmail)` | — | `portal/entities/support-ticket.entity.ts` |
| `Notification` | `(tenantId, userId, isRead)` | — | `notifications/entities/notification.entity.ts` |

### Audit (non-BaseEntity)

| Entity | Index | Unique | File |
|--------|-------|--------|------|
| `AuditLog` | `(tenantId, createdAt)` | — | `common/entities/audit-log.entity.ts` |

---

## Query Patterns & Index Coverage

| Query pattern | Service / API | Index yang mendukung |
|---------------|---------------|----------------------|
| List orders by tenant, sort `createdAt DESC` | `SalesService.findAllOrders` | `(tenantId, orderNumber)` unique — **partial**; perlu `(tenantId, createdAt)` |
| AR aging by customer | `ArService.getDetailedAgingReport` | Filter `(tenantId, type, customerId, status)` — **belum ada** |
| Stock lookup | `SupplyChainService.recordMovement` | `(tenantId, productId, warehouseId)` ✅ |
| Journal by date range | `GlService.findAllJournalEntries` | Sort `createdAt` — pertimbangkan `(tenantId, entryDate)` |
| Notifications unread | Notification inbox | `(tenantId, userId, isRead)` ✅ |
| Tax report by period | `FinanceIndonesiaService` | `(tenantId, period, taxType)` ✅ |

---

## Recommended Composite Indexes (Belum di Kode)

Prioritas berdasarkan query volume dan gap dari audit sprint [`update/ENGINEERING-QUICK-ACTION-ITEMS.md`](../update/ENGINEERING-QUICK-ACTION-ITEMS.md):

### P1 — High Impact

```sql
-- Invoice: aging, AR/AP dashboards
CREATE INDEX idx_invoices_tenant_type_status_due
  ON invoices ("tenantId", type, status, "dueDate")
  WHERE "deletedAt" IS NULL;

-- Sales orders: pipeline dashboard
CREATE INDEX idx_sales_orders_tenant_status_created
  ON sales_orders ("tenantId", status, "createdAt" DESC)
  WHERE "deletedAt" IS NULL;

-- Journal entries: GL reporting by date
CREATE INDEX idx_journal_entries_tenant_entry_date
  ON journal_entries ("tenantId", "entryDate" DESC)
  WHERE "deletedAt" IS NULL;

-- Invoices by customer (credit limit, outstanding)
CREATE INDEX idx_invoices_tenant_customer_type
  ON invoices ("tenantId", "customerId", type)
  WHERE "deletedAt" IS NULL AND "customerId" IS NOT NULL;
```

### P2 — Medium Impact

```sql
-- Purchase orders: open PO checklist (period close)
CREATE INDEX idx_po_tenant_status
  ON purchase_orders ("tenantId", status)
  WHERE "deletedAt" IS NULL;

-- Stock movements: audit trail by product
CREATE INDEX idx_stock_movements_tenant_product_created
  ON stock_movements ("tenantId", "productId", "createdAt" DESC);

-- Leave requests: HR approval queue
CREATE INDEX idx_leave_requests_tenant_status
  ON leave_requests ("tenantId", status, "createdAt" DESC);

-- Partial index: soft-deleted rows excluded (global pattern)
CREATE INDEX idx_active_customers
  ON customers ("tenantId", code)
  WHERE "deletedAt" IS NULL;
```

### P3 — Reporting / Analytics

```sql
-- Financial statement generation
CREATE INDEX idx_fsi_tenant_period_type
  ON financial_statement_items ("tenantId", "reportPeriodId", "statementType");

-- Audit log retention purge job
CREATE INDEX idx_audit_logs_created
  ON audit_logs ("tenantId", "createdAt");
-- Already exists ✅
```

---

## TypeORM Migration Notes

1. **Generate migration** setelah menambah `@Index` di entity:
   ```bash
   cd backend && npm run migration:generate -- src/database/migrations/AddCompositeIndexes
   ```

2. **Partial indexes** (`WHERE deletedAt IS NULL`) — perlu raw SQL di migration; TypeORM decorator belum support partial index natively.

3. **Production:** `synchronize: false` — semua index harus via migration. Lihat [`15-PRODUCTION-DEPLOYMENT-GUIDE.md`](15-PRODUCTION-DEPLOYMENT-GUIDE.md).

4. **pg-mem:** Index diterapkan saat schema sync; cocok untuk dev/demo, bukan benchmark performa.

---

## Monitoring

| Metrik | Tool | Threshold |
|--------|------|-----------|
| Sequential scan on large tables | `pg_stat_user_tables` | seq_scan / idx_scan > 10% |
| Missing index | `EXPLAIN ANALYZE` on slow queries | > 100ms p95 |
| Index bloat | `pgstatindex` | reindex if bloat > 30% |

Prometheus metrics endpoint: `/metrics` — [`12-PROJECT-STATUS.md`](12-PROJECT-STATUS.md).

---

## Cross-Reference

| Dokumen | Isi |
|---------|-----|
| [`18-MODULE-FEATURES-SCHEMA.md`](18-MODULE-FEATURES-SCHEMA.md) | Kolom & relasi per tabel |
| [`23-DATA-RETENTION-POLICY.md`](23-DATA-RETENTION-POLICY.md) | Soft delete & purge strategy |
| [`update/ENGINEERING-PRIORITY-FIXES-ACTION-PLAN.md`](../update/ENGINEERING-PRIORITY-FIXES-ACTION-PLAN.md) | P1 indexing task |
