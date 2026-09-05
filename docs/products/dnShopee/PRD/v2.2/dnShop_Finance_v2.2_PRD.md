# dnShop Finance v2.2 — Accounting Depth & Reporting

**Document ID:** `dnShop_Finance_v2.2_PRD.md`  
**Version:** 2.2.0  
**Date:** August 2026  
**Owner:** Dozer (CEO + Tech Lead, DN Tech)  
**Status:** **Implemented 100%** (10 Agustus 2026)  
**Baseline:** v2.1 SOPI go-live (shipped) + UI2 ops desk (shipped)  
**Related:** [v2.2 SRS](./dnShop_Finance_v2.2_SRS.md) · [v2.2 SDD](./dnShop_Finance_v2.2_SDD.md)  
**Prep brief:** [`docs/PRD-v2.2-Accounting-Depth-PREP.md`](../../docs/PRD-v2.2-Accounting-Depth-PREP.md)

---

## 1. Executive Summary

**v2.1 is live:** Shopee OAuth, order/payment auto-sync, onboarding, tier enforcement, email, observability. **10–50 sellers** connected, production stable.

**v2.2 goes deeper:** Seller pembukuan needs **cash flow reporting, automatic COGS, and export to accounting software** (Accurate, Jurnal, MYOB) — without manual double-entry. Also: **e-Faktur XML generation** from journal entries.

**Non-negotiable constraint:** v2.2 **must not** rewrite or break OAuth, webhook, order/income sync, or any Shopee OpenAPI integration from v2.1. All new features work **in demo/mock AND live Shopee**, with zero regression.

**Outcome (8 weeks):** Seller dengan pembukuan aktif generate cash flow reports, auto-journal COGS from inventory, export to Accurate/Jurnal, dan ekspor e-Faktur—semua **tanpa ganggu** jalur Shopee yang sudah berjalan.

---

## 2. Problem Statement

### 2.1 Current Gaps (Post-v2.1)
- ✅ Pembukuan basic (GL, P&L, BS, audit trail)
- ✅ Shopee order/payment auto-sync + tier enforcement
- ❌ Cash flow statement (tidak ada indirect method report)
- ❌ COGS automation (seller manual input atau skip = laba rugi salah)
- ❌ Export to MYOB/Jurnal/Accurate (seller harus copy-paste, risk korupsi)
- ❌ e-Faktur XML from journal (seller harus rekap manual untuk pajak)
- ❌ Inventory cost basis tracking (FIFO vs average unclear)

### 2.2 Impact
- **Seller perception:** "Pembukuan v2 tidak lengkap" — gap vs professional accounting software
- **Revenue leak:** Freemium features alone insufficient to drive Starter/Pro conversion
- **Compliance risk:** Seller can't export to accountant / e-Faktur without manual workaround
- **Partner value:** Shopee expects connected app to deliver **full accounting workflow**, not just GL sandbox

### 2.3 Opportunity
- **Competitive moat:** No Indonesian marketplace seller app does COGS + e-Faktur + software sync natively
- **Revenue driver:** Cash flow + COGS + export = Starter/Pro upsell (Rp 99k–299k/bulan justified)
- **Market fit:** Target SME accountant adoption ("Saya bisa kasih software ini ke klien Shopee")

---

## 3. Goals & Success Metrics

### 3.1 Product Goals
1. **Cash Flow visibility** — Seller can generate indirect method cash flow statement per period
2. **COGS automation** — Order delivered → auto-journal HPP, no manual entry
3. **Export-ready data** — Mapping + export to Accurate/Jurnal/MYOB (CSV + future API)
4. **Tax compliance** — e-Faktur XML generation from PPN journal entries
5. **Operational safety** — Zero regression on Shopee sync / OAuth / webhook paths

### 3.2 Success Metrics (8 weeks)
| Metric | Target | Rationale |
|--------|--------|-----------|
| Seller generate Cash Flow report | ≥40% toko dengan ≥20 journal posted/bulan | Core feature adoption |
| Orders delivered punya COGS entry | ≥80% | Auto-journal accuracy |
| Export Accurate/Jurnal UAT pass | ≥10 toko test successful import | Validation |
| e-Faktur XML valid per DJP schema | 100% generated entries lulus validation | Tax compliance |
| Demo seed path green | 100% | No regression |
| Shopee sync smoke test green | 100% webhook + cron post-deploy | Critical safety |
| Zero breaking changes in Shopee API contract | 100% | Non-negotiable constraint |

---

## 4. In Scope (v2.2)

### E1 — Cash Flow Statement (P0, 3 weeks)

**What:** Laporan arus kas **indirect method** (dari operating/investing/financing akun di journal)

**User story:** Seller mau tahu: dari mana uang masuk, kemana pergi, saldo berapa akhir periode.

**Acceptance:**
- Endpoint: `GET /api/v1/shops/:shopId/journals/cash-flow?date_from=&date_to=`
- Return: Operating activities (net income + adj) + Investing (asset sales, purchases) + Financing (loan, equity)
- Match: Ending cash ≈ bank reconciliation ±tolerance (dalam PRD detail)
- UI: `/journal/reports/cash-flow` + export PDF/CSV
- Akun mapping: CoA auto-map ke category (operating/investing/financing) per SAK EMKM guidance
- Periodic: month/quarter/year selectable

---

### E2 — COGS from Inventory (P0, 3 weeks)

**What:** Auto-journal HPP saat order **delivered** or **settlement confirmed**

**Method:** Average cost (FIFO as P1 option, not v2.2)

**User story:** Order delivered → system creates DR HPP / CR Inventory auto-journal, seller sees P&L dengan COGS top-line.

**Acceptance:**
- Trigger: order status = DELIVERED (from Shopee) or settlement confirmed
- Calculation: `COGS = cost_per_unit × qty_delivered`
- Journal: DR 5110 (HPP) / CR 1210 (Inventory)
- Idempotent: 1 order → max 1 COGS entry (reverse+repost if needed, controlled)
- Idempotensi: re-running job doesn't duplicate journals
- UI: Show COGS entries in GL + flag as auto-generated
- Cost basis: Inventory terdocumentasi cost (dari Shopee + manual adjustments)
- Audit: COGS journal entry logged + reversible

---

### E3 — Export to Accounting Software (P1, 4 weeks)

**What:** Mapping CoA dnShop → Accurate/Jurnal/MYOB codes, export GL ready to import

**Prioritas:** 
1. Accurate (Mekari, popular SME)
2. Jurnal (Mekari, online)
3. MYOB (international)

**Acceptance:**
- Endpoint: `POST /api/v1/shops/:shopId/exports/accounting`
- Body: `{ software: "accurate|jurnal|myob", date_from, date_to, include_opening_balance }`
- Return: URL to download XLSX / CSV file
- File format: Columns [date, account_code, account_name, debit, credit, reference, description]
- Account mapping: Stored in `shops.accounting_export_mapping` (customizable)
- Opening balance: Included as 1st entry if `include_opening_balance=true`
- Validation: Template per software pre-populated, seller can edit
- Testing: File valid for Accurate/Jurnal UAT import (checklist in SDD)

---

### E4 — e-Faktur from Journal (P1, 2 weeks)

**What:** Generate XML e-Faktur from PPN **posted** journal entries

**Scope:** Extend existing tax module (v1.0) — don't rebuild

**Acceptance:**
- Endpoint: `POST /api/v1/shops/:shopId/tax/e-faktur/generate`
- Body: `{ period: "2026-08" }`
- Return: XML file valid per DJP e-Faktur schema (current version locked in SDD)
- Source: All PPN journal entries (DR/CR akun 2110/4210 class) in period
- Validation: XML schema validation before download
- Audit: Generated e-Faktur logged + date-stamped

---

### E5 — UX & Help Pembukuan Lanjutan (P2, 1 week)

**What:** Empty states, seller-friendly copy, tutup buku checklist

**Not in scope:** Redesign UI2, shell navigation, Shopee connect panel

**Acceptance:**
- Empty state: Cash Flow report (before data) shows "Persiapkan jurnal ≥20 untuk laporan arus kas"
- Checklist: `/journal/close-period` shows tasks (reconcile bank, approve pending, post all)
- Copy: All financial terms glosarium (e.g., "Arus kas operasional" = cash from selling stuff)

---

## 5. Out of Scope (Explicit)

- **Rewrite OAuth / webhook / cron Shopee sync** — use v2.1 as-is
- **Rework onboarding / email / tier / observability** — no epic around v2.1 features
- **Multi-marketplace (Tokopedia, Lazada)** → v3.0
- **Payroll, fixed assets, consolidation** → future
- **Mobile app** → future
- **Redesign UI2 / shell** → separate initiative
- **Partner verification remediation** → Ops track, not coding epic

---

## 6. Data Model (No Breaking Changes)

### 6.1 New Tables / Columns

```sql
-- Existing: shopee_orders, shopee_income_entries, journal_entries, chart_of_accounts

-- New: COGS tracking
ALTER TABLE shopee_orders ADD COLUMN (
  cogs_journal_entry_id BIGINT REFERENCES journal_entries(id),
  cogs_amount NUMERIC(14, 2),
  cogs_cost_basis NUMERIC(10, 6),  -- avg cost per unit
  cogs_qty NUMERIC(10, 2),
  cogs_method VARCHAR(50) DEFAULT 'average'  -- average, fifo
);

-- New: COGS method + inventory cost tracking
CREATE TABLE inventory_costing (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id),
  item_id BIGINT,  -- from Shopee / product
  cost_per_unit NUMERIC(14, 2),
  method VARCHAR(50) DEFAULT 'average',  -- average, fifo
  updated_at TIMESTAMP
);

-- New: Accounting software export mapping
ALTER TABLE shops ADD COLUMN (
  accounting_export_mapping JSONB,  -- { "accurate": { "1110": "1000", ... }, "jurnal": { ... } }
  last_cash_flow_generated_at TIMESTAMP,
  last_cogs_sync_at TIMESTAMP
);

-- New: Cash flow category mapping (for indirect method)
CREATE TABLE cash_flow_category_mapping (
  id BIGSERIAL PRIMARY KEY,
  chart_of_accounts_id BIGINT REFERENCES chart_of_accounts(id),
  cash_flow_category VARCHAR(50),  -- operating, investing, financing
  shop_id BIGINT NOT NULL REFERENCES shops(id),
  UNIQUE(shop_id, chart_of_accounts_id)
);

-- New: Export audit log
CREATE TABLE export_audit_log (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id),
  export_type VARCHAR(50),  -- cash_flow, cogs, accounting_software, e_faktur
  file_name VARCHAR(255),
  file_hash VARCHAR(255),
  export_date DATE,
  created_at TIMESTAMP DEFAULT now(),
  INDEX idx_shop_created (shop_id, created_at DESC)
);

-- New: e-Faktur generation log
CREATE TABLE e_faktur_log (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id),
  period VARCHAR(7),  -- YYYY-MM
  xml_file_name VARCHAR(255),
  xml_hash VARCHAR(255),
  validation_status VARCHAR(50),  -- valid, invalid, pending
  djp_submission_status VARCHAR(50),  -- pending, submitted, accepted, rejected
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now(),
  submitted_at TIMESTAMP,
  INDEX idx_shop_period (shop_id, period DESC)
);
```

---

## 7. Key Business Rules

### 7.1 Cash Flow Calculation (Indirect Method)

```
Operating Activities = Net Income (P&L) + Adjustments
  + Depreciation / Amortization
  - Increase in AR
  + Increase in AP
  + Decrease in Inventory (from COGS journal)
  ...

Investing Activities = Asset Sales - Asset Purchases
Financing Activities = Loan Proceeds - Loan Repay - Dividend

Ending Cash = Beginning Cash + Operating + Investing + Financing
```

**Mapping SAK EMKM CoA:**
- Akun 1xxx (assets) → Investing
- Akun 2xxx (liabilities) → Financing  
- Akun 4/5xxx (income/expense) + non-cash adj → Operating

---

### 7.2 COGS Calculation (Average Cost Method)

```
COGS = cost_per_unit (from inventory) × qty_delivered

Journal entry (posted automatically):
  DR 5110 (HPP / COGS)      {amount}
    CR 1210 (Inventory)            {amount}

Reversible:
  If seller refunds / cancel order → reverse COGS entry, adjust inventory back
```

---

### 7.3 Export Mapping Strategy

**Template per software:**
```
Accurate: 1110 (Kas di Bank) → "1000" (Checking account)
Jurnal: 1110 → "1000"
MYOB: 1110 → "200" (Bank account)
```

**Seller customization:** Edit mapping in UI → re-export uses custom codes

---

## 8. NFR & Constraints

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| Cash Flow latency p95 | <3s per period | Dashboard refresh |
| COGS accuracy | 100% debit=credit | GL balance critical |
| Export file size | <10MB | Email delivery |
| e-Faktur XML validity | 100% DJP schema | Tax compliance |
| Demo seed latency | <5s all reports | UAT experience |
| Security: export credentials | Never logged/exposed | Accounting software API keys (if used) |
| Audit trail: COGS + export | 100% logged | Financial audit trail |
| Idempotensi: COGS job | Re-run safe | Cron retry safety |
| Isolation: shop data | 100% query by shopId | Multi-tenant |
| Regression: Shopee sync | 0 breaking changes | v2.1 live path safety |

---

## 9. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| COGS wrong → laba salah | High | Default average cost; flag estimates; reverse control; UAT with known seed costs |
| CoA mapping ≠ Accurate/Jurnal | Medium | Pre-template + UI edit; don't promise 2-way sync v2.2 |
| e-Faktur schema outdated | Low | Pin schema version; adapter layer for updates |
| Export breaks accounting software | Medium | UAT checklist per software; file validation before download |
| COGS duplicates (job retry) | Medium | Unique constraint order_id+delivered_date; idempotent upsert |
| Shopee sync break (accidental) | **Critical** | Code review gate: no diff in shopee-* / webhook files without justification + smoke test green |
| Cash flow report performance | Low | Snapshot / async job (pattern from existing reports) |

---

## 10. Timeline & Milestones (8 weeks)

| Week | Milestone | Deliverables |
|------|-----------|-------------|
| 1 | Design finalized | SRS/SDD reviewed, DB schema locked, API spec signed-off |
| 2–3 | E1 + E2 | Cash flow endpoint live, COGS job working, demo seed green |
| 4 | E3 prep | Accurate mapping template, export endpoint, file validation |
| 5 | E3 integration | XLSX export functional, UAT w/ Accurate sandbox |
| 6 | E4 | e-Faktur XML generation, DJP validation, smoke test |
| 7 | E5 | UX, help, checklist, copy finalized |
| 8 | UAT + hardening | 10–50 seller cohort, regression suite green, runbook updated |

**Go-live:** Week 9 (soft launch, beta group)

---

## 11. Success Criteria Summary

✅ Cash flow statement generated for ≥40% active toko  
✅ ≥80% delivered orders have auto-journal COGS entry  
✅ Export to Accurate/Jurnal successful (≥10 toko UAT)  
✅ e-Faktur XML 100% valid per DJP schema  
✅ Demo seed all reports green  
✅ Zero regression: Shopee OAuth + webhook + order/income sync  
✅ All financial entries audit-logged (COGS, export, e-Faktur)  
✅ Runbook + observability updated  

---

## 12. Glossary

- **Arus Kas Indirect** — Cash flow calculated from net income + adjustments (vs direct from bank)
- **HPP / COGS** — Harga Pokok Penjualan (cost of goods sold)
- **FIFO vs Average** — Inventory costing method (v2.2 starts with Average)
- **e-Faktur** — Elektronik faktur (DJP tax compliance XML format)
- **DJP** — Direktorat Jenderal Pajak (Indonesian tax authority)
- **SAK EMKM** — Indonesian SME accounting standard (45-account CoA)
- **Reconcile** — Match journal entries to bank statement

---

**Next:** [v2.2 SRS](./dnShop_Finance_v2.2_SRS.md)
