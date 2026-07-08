# dnPeople — Business Rules & Validation

**Terakhir diperbarui:** 3 Juli 2026  
**Scope:** Aturan bisnis utama yang **ditegakkan di kode** (bukan hanya di SRS)

Dokumen ini merujuk file service/controller aktual. Untuk skema data terkait, lihat [`18-MODULE-FEATURES-SCHEMA.md`](18-MODULE-FEATURES-SCHEMA.md). Status implementasi: [`12-PROJECT-STATUS.md`](12-PROJECT-STATUS.md).

---

## Finance / General Ledger

### BR-GL-01: Jurnal harus balanced (debit = credit)

| Aspek | Detail |
|-------|--------|
| **Rule** | Total debit dan total credit harus sama (toleransi ± Rp 0,01) |
| **Error** | `BadRequestException: Journal entry must be balanced (debits = credits)` |
| **File** | `backend/src/modules/finance/services/gl.service.ts` — `createJournalEntry()` baris 83–88 |
| **DTO** | `JournalLineDto`: `@Min(0)` pada debit/credit — `dto/gl.dto.ts` |

```typescript
if (Math.abs(totalDebit - totalCredit) > 0.01) {
  throw new BadRequestException('Journal entry must be balanced (debits = credits)');
}
```

---

### BR-GL-02: Tidak boleh posting ke periode closed

| Aspek | Detail |
|-------|--------|
| **Rule** | `entryDate` tidak boleh jatuh dalam rentang periode berstatus `CLOSED` |
| **Error** | `Cannot post to closed period {name}` |
| **File** | `gl.service.ts` — `assertPeriodOpen()` (private), dipanggil di `createJournalEntry()` |
| **Enum** | `PeriodStatus.OPEN` / `CLOSED` — [`business.enums.ts`](../backend/src/common/enums/business.enums.ts) |

---

### BR-GL-03: Period close checklist

| Aspek | Detail |
|-------|--------|
| **Rule** | Periode hanya bisa ditutup jika semua blocker = 0 |
| **Blockers** | AP invoice pending, AR invoice pending, PO belum received, trial balance tidak balanced |
| **Error** | `Cannot close period: {blockers joined}` |
| **File** | `gl.service.ts` — `getPreCloseChecklist()`, `closePeriod()` |
| **API** | `GET /api/v1/finance/gl/periods/:id/pre-close-checklist` |
| **Side effect** | Closing entry: tutup akun income/expense → Laba Ditahan (`5320` atau `3000`) |

---

### BR-GL-04: Reversal journal

| Aspek | Detail |
|-------|--------|
| **Rule** | Entry yang sudah `REVERSED` tidak bisa di-reverse lagi |
| **File** | `gl.service.ts` — `reverseJournalEntry()` |
| **Efek** | Buat jurnal baru dengan debit/credit ditukar; status asli → `JournalStatus.REVERSED` |

---

### BR-GL-05: Kode akun unik per tenant

| Aspek | Detail |
|-------|--------|
| **Rule** | `code` CoA tidak boleh duplikat dalam satu tenant |
| **File** | `gl.service.ts` — `createAccount()`; `finance-indonesia.service.ts` |

---

## Accounts Receivable (AR)

### BR-AR-01: Credit limit check saat create sales order

| Aspek | Detail |
|-------|--------|
| **Rule** | `outstanding + orderAmount <= creditLimit` (jika limit > 0) |
| **Error** | `Credit limit exceeded. Outstanding: X, Limit: Y, Order: Z` |
| **File** | `ar.service.ts` — `checkCreditLimit()` |
| **Dipanggil dari** | `sales.service.ts` — `createOrder()` (subtotal + PPN 11%) |

---

### BR-AR-02: Customer credit blocked

| Aspek | Detail |
|-------|--------|
| **Rule** | Invoice AR tidak bisa dibuat jika `customer.creditBlocked === true` |
| **Error** | `Customer {name} is blocked due to overdue payments` |
| **File** | `ar.service.ts` — `createInvoice()`, `checkCreditLimit()` |
| **Set blocked** | `finance-advanced.service.ts` — `runDunning()` tier `BLOCK` (>90 hari overdue) |
| **Unblock** | `recordPayment()` jika outstanding customer = 0 |

---

### BR-AR-03: Payment tidak melebihi outstanding

| Aspek | Detail |
|-------|--------|
| **Rule** | `amount <= totalAmount - paidAmount` (+ toleransi 0.01) |
| **File** | `ar.service.ts` — `recordPayment()` |

---

### BR-AR-04: PPN 11% otomatis pada invoice AR

| Aspek | Detail |
|-------|--------|
| **Rule** | `taxAmount = subtotal × 0.11`; `totalAmount = subtotal + taxAmount` |
| **File** | `ar.service.ts` — `createInvoice()`, `sales.service.ts` — `createOrder()` |

---

## Accounts Payable (AP)

### BR-AP-01: Payment hanya untuk status valid

| Aspek | Detail |
|-------|--------|
| **Rule** | Invoice AP harus `APPROVED` atau `PENDING` untuk menerima payment |
| **Error** | `Invoice cannot receive payment in current status` |
| **File** | `ap.service.ts` — `recordPayment()` |

---

### BR-AP-02: Tidak approve invoice yang sudah paid

| Aspek | Detail |
|-------|--------|
| **Rule** | — |
| **Error** | `Invoice already paid` |
| **File** | `ap.service.ts` — `approveInvoice()` |

---

## Three-Way Match (Procurement)

### BR-PROC-01: PO harus received sebelum match

| Aspek | Detail |
|-------|--------|
| **Rule** | `po.status === PurchaseOrderStatus.RECEIVED` |
| **Error** | `PO must be received before 3-way match` |
| **File** | `finance-advanced.service.ts` — `threeWayMatch()`, `threeWayMatchDetailed()` |
| **API** | `POST /api/v1/finance/advanced/three-way-match` |

---

### BR-PROC-02: Total PO vs invoice harus match

| Aspek | Detail |
|-------|--------|
| **Rule (simple)** | `|poTotal - invoiceTotal| < 0.01` → set invoice `APPROVED` |
| **Rule (detailed)** | Toleransi default 2% per header dan per line |
| **File** | `finance-advanced.service.ts` — `threeWayMatch()` baris 80–87; `threeWayMatchDetailed()` baris 159–176 |

**Alur 3-way match:**

1. **PO** — approved & issued
2. **Goods Receipt** — `receivePurchaseOrder` → status `RECEIVED`, stock IN
3. **Vendor Invoice** — AP invoice dibuat
4. **Match** — bandingkan total/line → approve invoice jika match

---

## Supply Chain / Inventory

### BR-INV-01: Stok tidak boleh negatif

| Aspek | Detail |
|-------|--------|
| **Rule** | Movement `OUT`: `stock.quantity >= qty` |
| **Error** | `Insufficient stock` |
| **File** | `supply-chain.service.ts` — `recordMovement()` baris 91–95 |

---

### BR-INV-02: Transfer gudang — source ≠ destination

| Aspek | Detail |
|-------|--------|
| **Rule** | `fromWarehouseId !== toWarehouseId` |
| **Error** | `Source and destination warehouse must differ` |
| **File** | `supply-chain.service.ts` — `transferStock()` |

---

## Sales

### BR-SALES-01: Delivery hanya dari confirmed/shipped

| Aspek | Detail |
|-------|--------|
| **Rule** | Status harus `CONFIRMED` atau `SHIPPED` |
| **Error** | `Order must be confirmed or shipped before delivery` |
| **File** | `sales.service.ts` — `deliverOrder()` |

---

## HR

### BR-HR-01: Saldo cuti cukup

| Aspek | Detail |
|-------|--------|
| **Rule** | `requestedDays <= balance.remaining` |
| **Error** | `Insufficient leave balance...` |
| **File** | `hr.service.ts` — `createLeaveRequest()`, `approveLeave()` |

---

### BR-HR-02: Absensi unik per employee per hari

| Aspek | Detail |
|-------|--------|
| **Rule** | DB constraint — index unique `(tenantId, employeeId, date)` |
| **File** | `attendance-record.entity.ts` |

---

## Enterprise / Procurement

### BR-ENT-01: Requisition harus approved sebelum convert ke PO

| Aspek | Detail |
|-------|--------|
| **Rule** | `requisition.status === APPROVED` |
| **Error** | `Requisition must be approved before converting to PO` |
| **File** | `enterprise.service.ts` |

---

### BR-ENT-02: RFQ closed tidak bisa di-update

| Aspek | Detail |
|-------|--------|
| **Rule** | — |
| **Error** | `RFQ already closed` |
| **File** | `enterprise.service.ts` |

---

## Auth & Tenancy

### BR-AUTH-01: Login tanpa slug

| Aspek | Detail |
|-------|--------|
| **Rule** | `tenantSlug` tidak boleh di-input saat login |
| **File** | `auth.service.ts` — `login()` |

---

### BR-AUTH-02: User limit per plan

| Aspek | Detail |
|-------|--------|
| **Rule** | `canAddUser` dari `BillingService.getPlan()` |
| **Error** | `User limit reached for current plan` |
| **File** | `users.service.ts` |

---

## Indonesia Compliance

### BR-ID-01: Validasi NPWP e-Faktur

| Aspek | Detail |
|-------|--------|
| **Rule** | NPWP harus valid sebelum generate e-Faktur |
| **File** | `efaktur.service.ts` |

---

### BR-ID-02: Akun pajak di CoA seed

| Aspek | Detail |
|-------|--------|
| **Rule** | Akun PPN/PPh mapped via `taxCode` di `INDONESIA_COA` |
| **File** | `finance/data/indonesia-coa.ts`, [`08-FINANCE-MODULE-INDONESIA.md`](08-FINANCE-MODULE-INDONESIA.md) |

---

## Ringkasan Matrix

| Area | Rule ID | Severity | Enforced in |
|------|---------|----------|-------------|
| GL | BR-GL-01 | Block | `gl.service.ts` |
| GL | BR-GL-02 | Block | `gl.service.ts` |
| GL | BR-GL-03 | Block | `gl.service.ts` |
| AR | BR-AR-01 | Block | `ar.service.ts` + `sales.service.ts` |
| AR | BR-AR-02 | Block | `ar.service.ts` |
| AP | BR-AP-01 | Block | `ap.service.ts` |
| Proc | BR-PROC-01 | Block | `finance-advanced.service.ts` |
| Proc | BR-PROC-02 | Conditional | `finance-advanced.service.ts` |
| Inv | BR-INV-01 | Block | `supply-chain.service.ts` |
| HR | BR-HR-01 | Block | `hr.service.ts` |

---

## Cross-Reference

| Dokumen | Isi |
|---------|-----|
| [`20-GL-INTEGRATION-EVENTS.md`](20-GL-INTEGRATION-EVENTS.md) | Posting GL otomatis |
| [`19-ENUMS-REFERENCE.md`](19-ENUMS-REFERENCE.md) | Status enum & transisi |
| [`02-SRS-ERP-System.md`](02-SRS-ERP-System.md) | Requirement asli |
| [`11-AUDIT-GAP-ANALYSIS.md`](11-AUDIT-GAP-ANALYSIS.md) | Gap historis vs kode |
| [`update/ENGINEERING-PRIORITY-FIXES-ACTION-PLAN.md`](../update/ENGINEERING-PRIORITY-FIXES-ACTION-PLAN.md) | Hardening sprint |

**Unit tests yang cover rules:** `gl.service.spec.ts`, `ar.service.spec.ts`, `sales.service.spec.ts`
