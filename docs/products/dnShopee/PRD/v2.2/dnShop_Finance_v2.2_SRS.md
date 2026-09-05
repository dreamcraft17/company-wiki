# dnShop Finance v2.2 — System Requirements Specification

**Document ID:** `dnShop_Finance_v2.2_SRS.md`  
**Version:** 2.2.0  
**Date:** August 2026  
**Owner:** Dozer (CEO + Tech Lead, DN Tech)  
**Status:** **Implemented 100%** (10 Agustus 2026)  
**Related:** [PRD](./dnShop_Finance_v2.2_PRD.md) · [SDD](./dnShop_Finance_v2.2_SDD.md)

---

## 1. Functional Requirements by Epic

### E1: Cash Flow Statement (Indirect Method)

#### FR1.1 — Fetch Cash Flow Data
**Endpoint:** `GET /api/v1/shops/:shopId/journals/cash-flow?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD`

**Flow:**
```
Input: shopId, date_from, date_to
1. Validate date range (max 12 months)
2. Fetch ALL posted journal_entries for period (by date, not created_at)
3. Sum by account + classify (operating/investing/financing)
4. Calculate net income from P&L (income - expense accts)
5. Add back non-cash items (depreciation, amortization)
6. Adjust working capital changes (AR, AP, inventory)
7. Format + return

Output JSON:
{
  "period": { "from": "...", "to": "..." },
  "beginning_cash": 1000000,
  "operating": {
    "net_income": 5000000,
    "adjustments": {
      "depreciation": 500000,
      "change_ar": -200000,
      "change_ap": 300000,
      ...
    },
    "net_operating_cash": 5600000
  },
  "investing": {
    "asset_purchases": -2000000,
    "asset_sales": 1000000,
    "net_investing_cash": -1000000
  },
  "financing": {
    "loan_proceeds": 0,
    "loan_repayment": -500000,
    "net_financing_cash": -500000
  },
  "ending_cash": 5100000,
  "variance_to_bank": 50000  // for reconciliation
}
```

**Acceptance Criteria:**
- [ ] Date range validated (no >12 months)
- [ ] Only POSTED entries counted (not DRAFT)
- [ ] Account classification per CoA mapping (operating/investing/financing)
- [ ] Net income calculated correctly (cross-check P&L)
- [ ] Adjustments (depreciation, AR/AP changes) calculated
- [ ] Ending cash = Beginning + Operating + Investing + Financing
- [ ] Query latency p95 <3s (even for 5000+ journal lines)
- [ ] Multi-currency: if shop has foreign currency, convert to reporting currency at period-end rate

---

#### FR1.2 — Display Cash Flow in UI
**URL:** `/journal/reports/cash-flow?date_from=&date_to=`

**Frontend:**
1. Date range picker (preset: last month, this month, last quarter, YTD)
2. Summary cards: Beginning cash, Operating cash, Investing cash, Financing cash, Ending cash
3. Detail table: Lines for each category + adjustments
4. Variance banner: If variance_to_bank > tolerance, show warning "Bank reconciliation needed"
5. Export buttons: PDF (formatted) + CSV (raw data)

**Acceptance Criteria:**
- [ ] Loads within 3s
- [ ] Summary cards match calculation
- [ ] Detail table reconciles to summary
- [ ] PDF export includes all data + formatting
- [ ] CSV export machine-readable

---

#### FR1.3 — Export Cash Flow Report
**Endpoint:** `POST /api/v1/shops/:shopId/journals/cash-flow/export`

**Body:**
```json
{
  "format": "pdf|csv",
  "include_variance": true
}
```

**Flow:**
1. Generate report using FR1.1 data
2. Format for export (headers, thousands separator, etc.)
3. Generate file (PDF via puppeteer/wkhtml2pdf, CSV via csv library)
4. Upload to temp storage / return download link
5. Log export in `export_audit_log`

**Acceptance Criteria:**
- [ ] PDF renders correctly with all sections
- [ ] CSV valid (OpenOffice/Excel compatible)
- [ ] File size <10MB
- [ ] Audit logged with file hash
- [ ] Link expires in 24h

---

### E2: COGS from Inventory

#### FR2.1 — Trigger COGS Journal on Order Delivered
**Trigger:** Webhook `payment_release` (from Shopee) OR cron (order status polled = DELIVERED)

**Flow:**
```
Input: order_sn (from Shopee order)
1. Fetch order from shopee_orders (shop_id, order_sn, total_qty, item_list)
2. For each item in order:
   a. Fetch inventory_costing (cost_per_unit, method=average)
   b. Calculate: COGS_amount = cost_per_unit × qty_delivered
   c. If no prior COGS entry for this order:
      - Create GL entry (POSTED):
        DR 5110 (HPP)        {total_cogs}
          CR 1210 (Inventory) {total_cogs}
      - Description: "COGS dari order {order_sn} (average cost)"
      - auto_journal_flag = true
      - Save in journal_entries + shopee_orders.cogs_journal_entry_id
      - Log in export_audit_log (action='cogs_auto_journal')
   d. Else: log warning "COGS entry already exists, skipping"

3. Return: { order_sn, cogs_amount, journal_entry_id }
```

**Acceptance Criteria:**
- [ ] Idempotent: running job twice for same order doesn't duplicate journals
- [ ] COGS calculated: cost_per_unit × qty (average method)
- [ ] Journal entry balanced (debit=credit)
- [ ] Reversible: can reverse GL entry if order canceled
- [ ] Logged: audit trail captures all auto-COGS
- [ ] Latency: <5s per order (even if order has 100 items)

---

#### FR2.2 — Maintain Inventory Cost Basis
**Endpoint:** `GET /api/v1/shops/:shopId/inventory/costing`

**Frontend:**
1. Show current cost per unit for each item
2. Allow manual override (seller input: "bought 100 units at Rp 10k each")
3. Apply override to future COGS (not retroactive by default)

**Backend:**
1. On new inventory purchase (manual entry or sync): update inventory_costing.cost_per_unit
2. COGS job consults inventory_costing for cost basis
3. Log each cost adjustment in audit trail

**Acceptance Criteria:**
- [ ] Cost per unit stored + retrievable
- [ ] COGS uses current cost at time of order delivery
- [ ] Manual override possible (seller edit)
- [ ] Audit trail for cost changes

---

#### FR2.3 — Reverse COGS on Order Cancellation
**Trigger:** Order refunded / canceled (from Shopee webhook or manual)

**Flow:**
```
Input: order_sn (refunded)
1. If COGS journal exists for order:
   a. Create reverse entry (DR 1210 / CR 5110) with same amount
   b. Link to original COGS entry
   c. Mark original as "reversed"
   d. Update inventory_costing (add quantity back)
2. Notify seller: "COGS reversed for order {order_sn}"
```

**Acceptance Criteria:**
- [ ] Reverse entry creates balanced GL entry
- [ ] Original marked as reversed (audit trail)
- [ ] Inventory restored

---

### E3: Export to Accounting Software

#### FR3.1 — Define CoA Mapping
**Endpoint:** `POST /api/v1/shops/:shopId/accounting-export/mapping`

**Body:**
```json
{
  "software": "accurate|jurnal|myob",
  "mapping": {
    "1110": "1000",  // dnShop CoA code → software acct code
    "1210": "1100",
    "4110": "4000",
    ...
  }
}
```

**Flow:**
1. Validate software name (accurate / jurnal / myob)
2. Load default template for software
3. Seller edits mapping (can override any mapping)
4. Save in `shops.accounting_export_mapping` JSON
5. Return: saved mapping + preview (show sample GL line with mapped codes)

**Acceptance Criteria:**
- [ ] Default template loaded per software
- [ ] Seller can edit mapping codes
- [ ] Mapping persisted (can re-export with same mapping)
- [ ] Validation: mapped codes match software's CoA (if available in schema)

---

#### FR3.2 — Export GL to Accounting Software Format
**Endpoint:** `POST /api/v1/shops/:shopId/accounting-export/export-gl`

**Body:**
```json
{
  "software": "accurate|jurnal|myob",
  "date_from": "2026-08-01",
  "date_to": "2026-08-31",
  "include_opening_balance": true,
  "file_format": "xlsx|csv"
}
```

**Flow:**
1. Fetch mapping from `shops.accounting_export_mapping[software]`
2. Fetch all journal_entry_lines for period
3. For each line:
   a. Map account_id → account_code (using mapping)
   b. Look up account name from chart_of_accounts
   c. Format row: [date, code, name, debit, credit, reference, description]
4. If include_opening_balance:
   a. Prepend 1 row per account: [period_start, code, name, opening_debit_or_credit, 0, "Opening Balance", ""]
5. Generate XLSX/CSV file
6. Validate file (sample rows, no corruption)
7. Log in export_audit_log (with file hash)
8. Return: download link (expires 24h)

**Sample file format:**
```
date,account_code,account_name,debit,credit,reference,description
2026-08-01,1000,Kas di Bank,50000000,0,OB,Opening Balance
2026-08-05,4000,Penjualan Produk,0,1000000,SN001,Order SN001
2026-08-05,1000,Kas di Bank,1000000,0,SN001,Order SN001
```

**Acceptance Criteria:**
- [ ] Mapping applied correctly (codes match software)
- [ ] Opening balance included if requested
- [ ] File valid XLSX/CSV (parseable by Excel/Sheets/Accurate)
- [ ] No data loss (all GL lines present)
- [ ] Audit logged
- [ ] File expires 24h (temp storage cleanup)

---

#### FR3.3 — Import Validation Checklist (UAT)
**Manual UAT task (not automated):**
1. Export GL to XLSX
2. Open in Accurate/Jurnal/MYOB
3. Attempt import
4. Check: all accounts mapped? all amounts correct? no errors?
5. Log result: success / failed (reason)

**Acceptance Criteria (for docs):**
- [ ] UAT template documented (step-by-step)
- [ ] Pass/fail criteria clear
- [ ] Success = file imports without mapping errors

---

### E4: e-Faktur from Journal

#### FR4.1 — Generate e-Faktur XML
**Endpoint:** `POST /api/v1/shops/:shopId/tax/e-faktur/generate`

**Body:**
```json
{
  "period": "2026-08"  // YYYY-MM
}
```

**Flow:**
1. Fetch all **posted** journal entries where account in PPN class (2110, 4210, etc.)
2. Group by invoice (reference field, or date if no reference)
3. Calculate: total PPN owed per invoice
4. Generate XML per DJP e-Faktur schema:
   ```xml
   <Faktur>
     <FakturHeader>
       <NomorFaktur>...</NomorFaktur>
       <TanggalFaktur>2026-08-05</TanggalFaktur>
       <NpwpPenjual>...</NpwpPenjual>
       <NamaUsaha>Seller name</NamaUsaha>
       ...
     </FakturHeader>
     <FakturDetail>
       <Barang>...</Barang>
       ...
     </FakturDetail>
   </Faktur>
   ```
5. Validate XML against schema (use xmllint or library)
6. If invalid: log error + return `{ error: "XML validation failed", details: [...] }`
7. If valid: save XML file, log in `e_faktur_log` (validation_status='valid')
8. Return: download link

**Acceptance Criteria:**
- [ ] XML schema validation passes 100%
- [ ] All PPN entries captured
- [ ] Seller NPWP / business data embedded correctly
- [ ] Date format per DJP standard (dd-MM-yyyy)
- [ ] File encrypted before download (or SSL only)
- [ ] Audit logged

---

#### FR4.2 — Validate e-Faktur Against DJP Schema
**Internal validation:**
1. Parse XML
2. Check required fields (NomorFaktur, TanggalFaktur, NpwpPenjual, etc.)
3. Validate date format, numeric fields, ranges
4. Check: PPN rate (0%, 10%, etc.) valid
5. Return: pass or detailed error list

**Acceptance Criteria:**
- [ ] Validation catches schema violations
- [ ] Error messages actionable (e.g., "Missing NomorFaktur")

---

### E5: UX & Help Pembukuan Lanjutan

#### FR5.1 — Cash Flow Empty State
**Condition:** User navigates to `/journal/reports/cash-flow` when no posted journals yet

**UX:**
```
Empty State Card:
  Icon: 📊 (chart)
  Headline: "Laporan Arus Kas"
  Subheading: "Persiapkan jurnal ≥20 untuk laporan arus kas"
  CTA: "Kembali ke Buku Besar" → `/journal/ledger`
```

**Acceptance Criteria:**
- [ ] Shows when posted journal count < 20
- [ ] Clear CTA
- [ ] Helpful copy

---

#### FR5.2 — COGS Auto-Journal Indicator
**In GL list view:**
1. Show badge/icon "🤖 Auto-COGS" for entries auto-generated
2. Tooltip: "Otomatis dari order [order_sn] saat barang delivered"
3. Reverse action: allow seller to reverse (creates inverse entry)

**Acceptance Criteria:**
- [ ] Badge shows for all auto-journal COGS
- [ ] Reverse action works
- [ ] Seller can see reason

---

#### FR5.3 — Export Success Confirmation
**After export:**
1. Toast: "Laporan Cash Flow diunduh" or "File diekspor ke XLSX"
2. Show filename + download timestamp
3. Provide re-download link (24h TTL)

**Acceptance Criteria:**
- [ ] Toast shows
- [ ] Link works
- [ ] File doesn't re-generate (uses cache if <1min)

---

#### FR5.4 — Tutup Buku Checklist (P2, optional v2.2)
**URL:** `/journal/close-period`

**Checklist:**
```
□ Reconcile bank statement
□ Approve all pending journal entries
□ Post all entries to GL
□ Generate P&L report (verify net income)
□ Generate balance sheet (verify assets = liabilities + equity)
□ Save archive PDF
□ Lock period (prevent edits after close)
```

**Acceptance Criteria:**
- [ ] Checklist UI intuitive
- [ ] Can mark items done
- [ ] "Close Period" button only active if all checked
- [ ] Period lock prevents post-close edits

---

## 2. Non-Functional Requirements

### 2.1 Performance
| Component | Target p95 | Notes |
|-----------|-----------|-------|
| Cash flow API | <3s | Even for 5000+ journal lines |
| COGS job | <5s per order | Cron can batch many orders |
| Export GL (XLSX) | <5s | File generation + compression |
| e-Faktur XML generation | <2s | Per period |
| Report UI load | <2s | All charts rendered |

### 2.2 Reliability
- **Idempotenent:** COGS job retry-safe (unique constraint on order_sn)
- **Audit trail:** 100% of financial mutations logged (COGS, exports, e-Faktur)
- **Rollback:** Can reverse COGS, re-export if mapping changed
- **Demo seed:** All reports green (mock data + known cost basis)
- **Shopee sync:** Zero regression on order/income sync paths

### 2.3 Security
- **Export credentials:** Never logged; if exporting to API (future), use secrets manager
- **Shop isolation:** All queries by shopId + permission check
- **Audit:** COGS + export logged (who, when, what)
- **File cleanup:** Export files deleted 24h after generation

### 2.4 Compliance
- **e-Faktur:** Valid per current DJP schema (version locked in SDD)
- **SAK EMKM:** CoA mapping respects 45-account structure
- **Audit trail:** Meets Indonesian tax authority audit requirements

---

## 3. Regression Testing Checklist

**Must pass before deployment:**

- [ ] Demo DB seed path green (all queries return expected data)
- [ ] Mock Shopee order sync still works (no API contract broken)
- [ ] Webhook `/api/v1/webhooks/shopee` HMAC verification unchanged
- [ ] v2.1 OAuth token refresh cron unchanged
- [ ] Tier enforcement (Free 100, Starter 5000) unchanged
- [ ] Email + OTP + password reset unchanged
- [ ] Smoke test: create order, deliver, verify COGS journal created
- [ ] Smoke test: generate cash flow, export, verify file valid
- [ ] Smoke test: generate e-Faktur, validate XML schema

---

## 4. Test Strategy

### 4.1 Unit Tests
- Cash flow calculation (operating/investing/financing)
- COGS amount calculation (cost × qty)
- CoA mapping logic
- XML validation

### 4.2 Integration Tests
- Cash flow endpoint (full flow with mock data)
- COGS auto-journal trigger (webhook + cron)
- Export XLSX generation (file valid)
- e-Faktur XML schema validation

### 4.3 E2E Tests (Manual UAT)
- Export to Accurate/Jurnal/MYOB (actual import test)
- e-Faktur uploaded to DJP (if applicable, else validate schema only)
- COGS reverse on order cancel

### 4.4 Regression Tests
- Demo seed all queries green
- Shopee sync path (cron + webhook) unchanged
- v2.1 features (tier, email, OTP) unchanged

---

## 5. Glossary

- **Arus kas** — Cash flow (movement of money)
- **HPP / COGS** — Harga Pokok Penjualan / Cost of Goods Sold
- **Operasional** — Operating activities (from selling)
- **Investasi** — Investing activities (asset purchases/sales)
- **Pendanaan** — Financing activities (loans, equity)
- **e-Faktur** — Elektronik Faktur (DJP tax XML)
- **DJP** — Direktorat Jenderal Pajak
- **SAK EMKM** — Indonesian SME accounting standard
- **Idempotensi** — Safe to retry without duplicating results

---

**Next:** [v2.2 SDD](./dnShop_Finance_v2.2_SDD.md)
