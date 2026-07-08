# dnPeople — Data Retention Policy

**Terakhir diperbarui:** 3 Juli 2026  
**Scope:** Retensi data regulasi Indonesia + mekanisme soft delete di codebase

Kebijakan ini mengacu implementasi aktual (`BaseEntity`, `audit_logs`) dan requirement regulasi untuk ERP Indonesia. Skema entity: [`18-MODULE-FEATURES-SCHEMA.md`](18-MODULE-FEATURES-SCHEMA.md). Compliance pajak: [`08-FINANCE-MODULE-INDONESIA.md`](08-FINANCE-MODULE-INDONESIA.md).

---

## Ringkasan Eksekutif

| Kategori data | Retensi minimum (regulasi ID) | Mekanisme dnPeople | Status kode |
|---------------|----------------------------|-------------------|-------------|
| Buku & catatan akuntansi | **10 tahun** | Hard retain + soft delete | ✅ Entity + migration |
| Dokumen perpajakan (PPN, PPh) | **10 tahun** | `TaxRecord`, `EFakturDocument` | ✅ Stored |
| Payroll & PPh 21 | **10 tahun** | `PayrollRun`, payslip export | ✅ Partial automation |
| Audit trail sistem | **7–10 tahun** (best practice) | `audit_logs` table | ✅ Interceptor |
| Data operasional (CRM, notifikasi) | 3–5 tahun | Soft delete + purge job | 🟡 Policy only |
| Log aplikasi / metrics | 90–365 hari | Prometheus / log rotation | Infra config |

> **Catatan implementasi:** Soft delete via `deletedAt` sudah ada di schema, tetapi sebagian service masih memakai **hard delete** (`repository.delete()`). Migrasi ke soft delete konsisten adalah item hardening — lihat [`update/ENGINEERING-QUICK-ACTION-ITEMS.md`](../update/ENGINEERING-QUICK-ACTION-ITEMS.md).

---

## Regulasi Indonesia — Referensi Retensi

### Perpajakan (UU KUP, PMK terkait)

| Jenis dokumen | Dasar hukum | Retensi |
|---------------|-------------|---------|
| Faktur Pajak / e-Faktur | UU KUP Pasal 28, PMK PPN | **10 tahun** sejak akhir tahun pajak |
| Bukti potong PPh 21/23 | UU PPh, PMK | **10 tahun** |
| SPT Masa & Tahunan | UU KUP | **10 tahun** |
| Jurnal & buku besar | UU KUP | **10 tahun** |

**Entity terkait:** `Invoice`, `JournalEntry`, `TaxRecord`, `EFakturDocument`, `ChartOfAccount`

### Akuntansi & Perseroan

| Jenis | Dasar | Retensi |
|-------|-------|---------|
| Laporan keuangan (SAK-EP) | UU Perseroan Pasal 66 | **10 tahun** |
| Aktiva tetap & depresiasi | PSAK / SAK | **10 tahun** setelah disposal |
| Rapat & keputusan (corporate) | UU Perseroan | **10 tahun** |

**Entity terkait:** `ReportPeriod`, `FinancialStatementItem`, `TrialBalance`, `FixedAsset`

### Ketenagakerjaan

| Jenis | Dasar | Retensi |
|-------|-------|---------|
| Data payroll & payslip | UU Ketenagakerjaan, PP 35/2021 | **Min. 5 tahun** (best practice **10 tahun**) |
| Absensi & lembur | Peraturan perusahaan / audit | **5–10 tahun** |

**Entity terkait:** `Employee`, `PayrollRun`, `AttendanceRecord`, `OvertimeRecord`, `LeaveRequest`

### Perlindungan Data Pribadi

| Aspek | Dasar | Implikasi dnPeople |
|-------|-------|-------------------|
| Consent & hak akses | UU PDP No. 27/2022 | Entity `GdprConsent` (fixed-assets module) |
| Anonymization setelah retensi | Best practice GDPR/PDP | Purge PII, retain aggregate stats |

---

## Soft Delete — BaseEntity

### Implementasi

**File:** `backend/src/common/entities/base.entity.ts`

```typescript
@DeleteDateColumn({ nullable: true })
deletedAt: Date | null;
```

Kolom audit tambahan:

| Kolom | Fungsi |
|-------|--------|
| `tenantId` | Isolasi multi-tenant |
| `createdAt` / `updatedAt` | Timestamp otomatis TypeORM |
| `createdBy` / `updatedBy` | Diisi `EntityAuditSubscriber` dari JWT user |
| `deletedAt` | Soft delete — row tersembunyi dari query default |

### Migration

**File:** `backend/src/database/migrations/1730000000002-AddAuditFields.ts`

Menambahkan `createdBy`, `updatedBy`, `deletedAt` ke semua tabel tenant-scoped.

### Entity yang Extend BaseEntity

Semua entitas bisnis utama (~60+ entity) extend `BaseEntity`, termasuk:

- Finance: `Invoice`, `JournalEntry`, `Customer`, `Vendor`, `ChartOfAccount`
- Sales: `SalesOrder`, `SalesQuotation`
- Supply Chain: `Product`, `PurchaseOrder`, `StockLevel`, `StockMovement`
- HR: `Employee`, `LeaveRequest`, `PayrollRun`
- Reporting: `ReportPeriod`, `TrialBalance`, dll.

**Exception:** `AuditLog` extends standalone (no soft delete — append-only). `Tenant` extends `RootEntity` (no `tenantId`, no soft delete).

### Perilaku TypeORM

| Operasi | Efek |
|---------|------|
| `repository.softRemove(entity)` | Set `deletedAt = NOW()` |
| `repository.find()` | Exclude rows where `deletedAt IS NOT NULL` |
| `repository.find({ withDeleted: true })` | Include soft-deleted |
| `repository.delete()` | **Hard delete** — masih dipakai di beberapa service |

### Gap: Hard Delete Masih Ada

Service berikut masih hard delete (perlu migrasi ke soft delete):

| Service | Method |
|---------|--------|
| `SalesService` | `deleteOrder`, `deleteQuotation` |
| `SupplyChainService` | `deleteProduct` |

**Rekomendasi:** Ganti ke `softRemove()` + filter `deletedAt IS NULL` di list queries.

---

## Audit Trail (Append-Only)

### AuditLog Entity

**File:** `backend/src/common/entities/audit-log.entity.ts`

| Kolom | Isi |
|-------|-----|
| `tenantId`, `userId` | Konteks |
| `action`, `entity`, `entityId` | Apa yang dilakukan |
| `metadata` | JSONB detail perubahan |
| `ipAddress` | IP request |
| `createdAt` | Timestamp (immutable) |

**Index:** `(tenantId, createdAt)` — efisien untuk query & purge by date.

### Interceptor

**File:** `backend/src/common/interceptors/audit.interceptor.ts`

Mencatat mutasi HTTP penting ke `audit_logs`. **Tidak dihapus** via soft delete — retensi via scheduled purge saja.

### EntityAuditSubscriber

**File:** `backend/src/common/subscribers/entity-audit.subscriber.ts`

Auto-set `createdBy` / `updatedBy` pada insert/update entity yang punya field tersebut.

---

## Retensi per Kategori Data

### Tier 1 — Legal Hold (Never Purge Before 10 Years)

| Data | Tabel | Purge |
|------|-------|-------|
| Journal entries & lines | `journal_entries`, `journal_lines` | ❌ Block |
| Invoices AR/AP | `invoices`, `invoice_lines` | ❌ Block |
| e-Faktur XML | `efaktur_documents` | ❌ Block |
| Tax records | `tax_records` | ❌ Block |
| Financial reports published | `report_periods`, `financial_statement_items` | ❌ Block |
| Payroll runs | `payroll_runs` | ❌ Block |

**Implementasi disarankan:** Flag `legalHold = true` atau jangan jalankan purge job pada tabel ini.

### Tier 2 — Soft Delete + Purge After Retention

| Data | Retensi aktif | Retensi arsip | Purge |
|------|---------------|---------------|-------|
| CRM leads/opportunities | Selama aktif | 3 tahun setelah `LOST` | Soft delete → anonymize |
| Notifications | 90 hari | — | Hard delete |
| Support tickets | 2 tahun | 5 tahun arsip | Soft delete |
| Search index | Real-time | N/A | Elasticsearch TTL |

### Tier 3 — Operational / Ephemeral

| Data | Retensi |
|------|---------|
| Session / refresh tokens | Sampai expire |
| Password reset tokens | 24 jam |
| Report export download tokens | 7 hari (`ReportExportFile`) |
| Login attempt counters | In-memory / Redis TTL |

---

## Scheduled Jobs (Rekomendasi Production)

Belum diimplementasi penuh — spesifikasi untuk ops:

```typescript
// Pseudocode — retention cron (NestJS @Cron)
async purgeExpiredNotifications() {
  // DELETE FROM notifications WHERE createdAt < NOW() - INTERVAL '90 days'
}

async purgeSoftDeletedCrm() {
  // Hard delete FROM leads WHERE deletedAt < NOW() - INTERVAL '3 years'
  // Anonymize email, phone before delete
}

async archiveAuditLogs() {
  // Move audit_logs older than 7 years to cold storage (S3/Glacier)
  // Keep summary aggregates in DB
}
```

**Scheduler existing:** Dunning cron di `finance-advanced` — pattern yang sama bisa dipakai untuk retention.

---

## GDPR / UU PDP — Hak Subjek Data

| Hak | Implementasi dnPeople |
|-----|----------------------|
| Akses data | Export via API / portal |
| Koreksi | Update entity via CRUD |
| Penghapusan | Soft delete + eventual purge (kecuali Tier 1 legal hold) |
| Consent | `GdprConsent` entity |

**Conflict resolution:** Permintaan hapus data karyawan/customer **tidak** menghapus jurnal akuntansi terkait — anonymize referensi (`customerId` → hash) sambil retain transaksi finansial (SAK + UU KUP).

---

## Backup & Disaster Recovery

| Aspek | Target | Referensi |
|-------|--------|-----------|
| DB backup frequency | Daily full + WAL continuous | [`15-PRODUCTION-DEPLOYMENT-GUIDE.md`](15-PRODUCTION-DEPLOYMENT-GUIDE.md) |
| Backup retention | Min. 10 tahun untuk snapshot bulanan finansial | Ops policy |
| pg-mem demo | **Tidak persistent** — data hilang saat restart | Dev only |

---

## Checklist Compliance

| # | Item | Status |
|---|------|--------|
| 1 | `deletedAt` column on tenant entities | ✅ Migration 1730000000002 |
| 2 | Audit log append-only | ✅ |
| 3 | e-Faktur & tax records retained | ✅ Entity exists |
| 4 | Consistent soft delete in all services | 🟡 Partial |
| 5 | Automated retention purge jobs | 🔴 Not implemented |
| 6 | Cold storage archive for audit logs | 🔴 Not implemented |
| 7 | Legal hold flag on financial records | 🔴 Not implemented |

---

## Cross-Reference

| Dokumen | Isi |
|---------|-----|
| [`18-MODULE-FEATURES-SCHEMA.md`](18-MODULE-FEATURES-SCHEMA.md) | Skema tabel & kolom audit |
| [`22-DATABASE-INDEXING-STRATEGY.md`](22-DATABASE-INDEXING-STRATEGY.md) | Index untuk purge by date |
| [`08-FINANCE-MODULE-INDONESIA.md`](08-FINANCE-MODULE-INDONESIA.md) | PPN/PPh retention context |
| [`12-PROJECT-STATUS.md`](12-PROJECT-STATUS.md) | Status hardening sprint |
| [`update/ENGINEERING-PRIORITY-FIXES-ACTION-PLAN.md`](../update/ENGINEERING-PRIORITY-FIXES-ACTION-PLAN.md) | BaseEntity & migration tasks |
| [`update/CEO-TRACKING-SHEET.md`](../update/CEO-TRACKING-SHEET.md) | Executive tracking |

---

## Changelog

| Tanggal | Perubahan |
|---------|-----------|
| 3 Jul 2026 | Dokumen awal — berdasarkan `BaseEntity`, migration AddAuditFields, regulasi ID |
