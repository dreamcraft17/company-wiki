# dnShop Finance v2.0 - Product Requirements Document
## Dashboard Keuangan + Journaling Terintegrasi untuk Seller Shopee Indonesia

**Version:** 2.0  
**Last Updated:** August 2026  
**Author:** DN Tech  
**Status:** Implemented in repo (lihat `docs/STATUS.md`)  
**Previous:** dnShop Finance v1.0

> ### Addendum produk (5 Agustus 2026) — wajib dibaca
>
> Implementasi memposisikan journaling sebagai **bonus pembukuan di akun seller**, **bukan** produk / silo akuntansi terpisah.
>
> - Nav UI: **Pembukuan** (route tetap `/journal/*`)
> - Entry point juga di Dashboard, Laporan, Pajak, Bank
> - Dashboard charts + filter periode 7d / 30d / custom (di luar scope asli dokumen ini, sudah live)
> - Living docs: [`docs/docs.md`](../docs/docs.md) · [`docs/STATUS.md`](../docs/STATUS.md)
>
> Spesifikasi teknis di bawah (CoA, double-entry, approval, GL/TB/P&L/BS) tetap berlaku; yang berubah adalah **posisi produk & copy UX**.
>
> **Spec berikutnya:** v2.1 Go-live ops (draft) — [`dnShop_Finance_v2.1_PRD.md`](./dnShop_Finance_v2.1_PRD.md) · briefing [`docs/NEXT-PRD-BRIEF.md`](../docs/NEXT-PRD-BRIEF.md)

---

## 1. Executive Summary

**dnShop Finance v2.0** adalah evolusi dari v1.0, menambahkan **modul akuntansi formal (journaling + general ledger)** sambil mempertahankan semua fitur dashboard, reconciliation, dan reporting dari v1.0.

### Apa yang Ada di v2.0
- ✅ All v1.0 features (dashboard, orders, payments, tax reports, bank reconciliation)
- ✨ **NEW: Chart of Accounts (SAK EMKM)**
- ✨ **NEW: Manual Journal Entries (double-entry bookkeeping)**
- ✨ **NEW: Auto-Journal from Shopee Transactions**
- ✨ **NEW: General Ledger + Trial Balance**
- ✨ **NEW: Financial Statements (P&L, Balance Sheet)**
- ✨ **NEW: Approval Workflow (Draft → Pending → Approved → Posted)**
- ✨ **NEW: Immutable Audit Trail (7-year compliance)**

### Target Users
- **Seller UMKM** (10-100M revenue/tahun) yang butuh akuntansi formal
- **Accounting firms** managing multiple UMKM clients
- **Seller yang serius** dengan bank loans, investor meetings, tax audits

### Success Metrics (Q2 2027)
- **Adoption:** 100 sellers with 50+ entries/month
- **Feature usage:** 50% of paid users generate monthly P&L
- **Accuracy:** 99.9% trial balance validation
- **NPS:** 45+ from accountant users

---

## 2. Release Strategy

### 2.1 Backward Compatibility
- All v1.0 features remain unchanged
- Existing sellers see new "Journal" tab (optional to use)
- No migration required from v1.0 → v2.0
- Feature flag: `ENABLE_JOURNALING` (default: enabled)

### 2.2 Pricing Tiers (Updated from v1.0)

| Tier | Price | Features | Users |
|------|-------|----------|-------|
| **Free** | IDR 0 | Dashboard only (no journaling) | Solo trial users |
| **Starter** | IDR 149k (+50k from v1.0) | Dashboard + Limited journal (50 entries/mo) | Micro business |
| **Pro** | IDR 349k (+100k from v1.0) | Dashboard + Unlimited journal + Statements | Small business |
| **Enterprise** | IDR 599k (+100k from v1.0) | Pro + Approval workflow + Audit access + RBAC | Medium business |

### 2.3 Launch Timeline

| Phase | Timeline | Deliverable |
|-------|----------|-------------|
| **Phase 1 (MVP)** | 8 weeks (Q4 2026) | Core journaling: CoA, entries, GL, TB, P&L |
| **Phase 2 (Refinement)** | 4 weeks (Q1 2027) | Approval workflow, reconciliation, PDF export |
| **Phase 3 (Scale)** | 4 weeks (Q2 2027) | COGS automation, accounting software sync |

---

## 3. Problem Statement (Why Journaling?)

### Problem 1: Incomplete Financial Picture
**Shopee data alone doesn't capture:**
- Biaya operasional (rent, electricity, internet, gaji)
- Pembelian barang (COGS)
- Hutang/piutang non-Shopee
- Fixed assets + depreciation

**Result:** PPh 21 calculation in v1.0 overstated (no deductions for real expenses)

### Problem 2: Formal Accounting Requirement
**For serious sellers:**
- Bank loan applications require audited financials
- Investor pitches need formal statements
- Tax audits demand audit trail + evidence

**Solution:** Double-entry bookkeeping provides legally defensible records

### Problem 3: Team Collaboration & Control
**Multi-person shops need:**
- Cashier records entry, accountant approves (separation of duties)
- Audit trail: Who changed what, when, why (fraud prevention)
- Manual override when Shopee data is wrong

---

## 4. Feature Set (v2.0)

### 4.1 Chart of Accounts (NEW)

#### FR-COA-001: Pre-built SAK EMKM Template
- 40-50 standard accounts (Indonesian, SAK EMKM compliant)
- Auto-apply on first setup
- Editable: Can rename or deactivate (archiving, not deletion)
- Example accounts:
  ```
  1100 - Kas (Cash)
  1110 - Bank BRI
  1200 - Piutang Usaha (Accounts Receivable)
  1300 - Persediaan (Inventory)
  2100 - Hutang Usaha (Accounts Payable)
  3100 - Modal Awal (Owner's Capital)
  4100 - Penjualan Shopee (Shopee Sales)
  4200 - Penjualan Offline (Offline Sales)
  5100 - COGS (Cost of Goods Sold)
  5200 - Gaji Karyawan (Payroll)
  5300 - Komisi Shopee (Shopee Commission)
  ```

#### FR-COA-002: Custom Accounts
- Add accounts not in template (e.g., "Biaya Packaging Khusus")
- 4-digit account code (range 1000-9999)
- Account type: Asset | Liability | Equity | Revenue | Expense
- Normal balance: Debit | Credit

### 4.2 Journal Entries (NEW)

#### FR-JE-001: Auto-Journal from Shopee
**Automatic double-entry when:**
- Order paid (DR Bank | CR Revenue)
- Refund issued (DR Revenue | CR Bank)
- Shopee commission deducted (DR Expense | CR Bank)

**Configuration:**
- Per-shop account mapping (which bank, which revenue account)
- Auto-post enabled/disabled

#### FR-JE-002: Manual Journal Entry
**Accountant can record:**
- Biaya operasional (rent, utilities)
- Pembelian barang (supplier invoices)
- Gaji karyawan (payroll)
- Hutang/piutang manual

**Input:**
- Entry date, reference (e.g., "Kuitansi 001")
- Memo (description)
- Line items: Account + Debit/Credit amount
- Validation: Total debit == Total credit

**Status workflow:**
1. DRAFT (accountant creates)
2. PENDING (awaiting approval, if enabled)
3. APPROVED (owner reviewed)
4. POSTED (finalized, immutable)

#### FR-JE-003: Bulk Import
- Upload CSV with multiple entries
- Format: Date | Reference | Account | Amount | Debit/Credit
- Validation + error report
- Useful for month-end batch entry

#### FR-JE-004: Edit/Delete/Reverse
- DRAFT entries: Full edit/delete
- POSTED entries: Cannot edit/delete (create reversing entry instead)
- Reversing entry: Flipped debit/credit, new entry (maintains audit trail)

### 4.3 General Ledger & Trial Balance (NEW)

#### FR-GL-001: View GL per Account
- Select account (e.g., "1110 Bank BRI")
- Select period (month/quarter/year)
- Display: Date | Reference | Memo | Debit | Credit | Running Balance
- Export: CSV, PDF

#### FR-TB-001: Trial Balance
- All accounts in one view
- Show debit/credit balance per account
- Total debit == Total credit? (validates journal accuracy)
- If imbalanced, show diagnostic (missing entry, unposted entries, etc.)

### 4.4 Financial Statements (NEW)

#### FR-FS-001: Income Statement (P&L)
**Format: SAK EMKM**
```
Pendapatan (Revenue)
  Penjualan Shopee        60,000,000
  Penjualan Offline        5,000,000
  ──────────────────────
  Total Revenue           65,000,000

Beban Pokok Penjualan (COGS)
  Persediaan awal          8,000,000
  Pembelian              25,000,000
  Persediaan akhir      (12,000,000)
  ──────────────────────
  Total COGS             21,000,000

Gross Profit            44,000,000

Beban Operasional (Operating Expenses)
  Gaji Karyawan           8,000,000
  Komisi Shopee           2,500,000
  Sewa Tempat             2,000,000
  Listrik & Air           1,000,000
  ──────────────────────
  Total Expenses         13,500,000

Operating Profit        30,500,000

PPh 21 (@1.5%)           (457,500)
──────────────────────
Net Income              30,042,500
```

#### FR-FS-002: Balance Sheet (Optional MVP)
- Assets = Liabilities + Equity check
- Show financial position at period-end

#### FR-FS-003: Cash Flow Statement (Phase 2)
- Operating / Investing / Financing activities
- Optional for MVP

### 4.5 Approval Workflow (NEW)

#### FR-APR-001: Multi-Level Approval
- **Config option 1:** No approval (auto-post immediately)
- **Config option 2:** 1-level (owner approval only)
- **Config option 3:** 2-level (manager + owner)

**Flow:**
1. Cashier/Accountant creates → DRAFT
2. Submits for approval → PENDING
3. Owner reviews + approves → APPROVED
4. Auto-posts after delay (configurable: immediate or 1-24h later)
5. Entry becomes POSTED (immutable)

**Notification:**
- Email to approver: "Journal entry pending approval: [Ref] (IDR [Amount])"
- In-app notification + dashboard badge

### 4.6 Bank Reconciliation (From v1.0, Enhanced)

#### FR-REC-001: Import Bank Statement
- Upload CSV/OFX from bank
- Auto-match to journal entries by amount + date (±2 days)
- Flag unmatched: bank transaction or journal entry
- Manual match available (drag-drop)
- Once reconciled, lock period (no edit without reversing)

### 4.7 Audit Trail & Compliance (NEW)

#### FR-AUDIT-001: Immutable Audit Log
- Capture: User | Action (create/edit/approve/post) | Timestamp | Old/New values
- Posted entries logged as immutable (cannot modify)
- 7-year retention (tax requirement)
- Accessible by owner (tax auditor role in future)

#### FR-AUDIT-002: Export for Tax Filing
- PDF: Formatted financial statements (P&L, TB, Balance Sheet)
- CSV: Journal entries (for tax office)
- XML: e-Faktur integration (future, Phase 3)

### 4.8 Integration with v1.0 Features (Existing)

#### Kept from v1.0
- ✅ Shopee OAuth + synced orders/payments
- ✅ Dashboard (sales, revenue, settlement tracking)
- ✅ Order management + reconciliation
- ✅ Payment & settlement tracking
- ✅ Bank statement upload + auto-matching
- ✅ Tax report (PPh 21, PPN, e-Faktur)
- ✅ User roles & team management

#### Enhanced with v2.0
- Dashboard now shows: "P&L Quick View" (from journal)
- Tax report now shows: "Reconcile with journal for accuracy"
- Bank reconciliation now shows: "Journal entries for unmatched items"
- Reports now available as: Dashboard tables + PDF (from journal P&L)

---

## 5. User Workflows

### Workflow 1: Seller UMKM (First Month)

```
1. Seller upgrades to Pro (Rp 349k/mo)
2. Navigates to /journal
3. System shows: "Chart of Accounts not set up"
4. Click "Create Chart of Accounts"
5. Select "SAK EMKM 2016" template
6. 45 accounts auto-created
7. Seller can start recording:
   - Manual entry: Pembelian barang dari supplier
   - Manual entry: Bayar gaji karyawan
   - Auto: Shopee orders synced automatically
8. Month-end: Click "Generate P&L"
9. See: Revenue 65M, Expense 14.5M, Net 30M
10. Export PDF for bank loan application
```

### Workflow 2: Accountant (Approval)

```
1. Accountant logs in (accountant@shop.id, role: accountant)
2. Creates journal entry: "Kuitansi 001 - Pembelian barang"
3. Clicks "Submit for Approval"
4. Entry status: PENDING
5. Owner receives email: "Entry pending approval"
6. Owner clicks link, reviews entry
7. Owner approves with note: "Verifikasi invoice OK"
8. Entry auto-posts (next day)
9. Accountant sees: "Entry approved + posted"
```

### Workflow 3: Tax Audit

```
1. DJP (tax office) requests: "Show journal entries for Aug 2026"
2. Owner navigates to /journal/audit-trail
3. Downloads PDF report:
   - All entries with signatures block
   - Audit trail (who created, approved, posted)
4. Submits to DJP
5. Tax officer verifies: Complete records, proper approval, immutable
```

---

## 6. Technical Architecture (Overview)

### Module Structure (in dnShop Frontend/Backend)

**Backend (`apps/backend/src/journal/`):**
- `chart-of-accounts/` — CoA management
- `journal-entries/` — Entry creation + validation
- `general-ledger/` — GL calculation + caching
- `trial-balance/` — TB generation
- `financial-statements/` — P&L, B/S generation
- `approval/` — Workflow logic
- `audit/` — Immutable logging
- `jobs/` — Auto-posting, Shopee sync

**Frontend (`apps/frontend/app/journal/`):**
- `page.tsx` — Dashboard (overview)
- `entries/` — Create/edit/view journal entries
- `chart-of-accounts/` — CoA management
- `general-ledger/` — GL viewer
- `trial-balance/` — TB report
- `financial-statements/` — P&L, B/S, CF viewers
- `reconciliation/` — Bank recon
- `approval/` — Pending entries (owner view)
- `audit-trail/` — Audit log viewer

### Database Tables (New)

```
chart_of_accounts (45 fields)
  ├─ account_code (unique per shop)
  ├─ account_name
  ├─ account_type
  ├─ normal_balance
  └─ ...

journal_entries (12 fields)
  ├─ entry_date
  ├─ reference
  ├─ status (Draft | Pending | Approved | Posted)
  ├─ is_system_generated
  └─ ...

journal_entry_lines (6 fields, multiple per entry)
  ├─ account_code
  ├─ debit_amount
  ├─ credit_amount
  └─ ...

account_balances (cache)
  ├─ account_code
  ├─ period_date
  ├─ opening_balance
  ├─ closing_balance
  └─ ...

journal_audit_logs (immutable)
  ├─ user_id
  ├─ action (Create | Edit | Approve | Post)
  ├─ old_values
  ├─ new_values
  └─ created_at (never updated)
```

---

## 7. Success Metrics (v2.0)

| Metric | Target | Timeline |
|--------|--------|----------|
| **Adoption** | 100 sellers with journal entries | Q2 2027 |
| **Entry volume** | 50+ entries/month/seller (avg) | Q2 2027 |
| **Feature usage** | 50% of Pro/Ent users generate P&L | Q2 2027 |
| **Trial balance accuracy** | 99.9% balanced | Q2 2027 |
| **NPS (accountants)** | 45+ | Q2 2027 |
| **Revenue impact** | +30% MRR from tier upgrades | Q2 2027 |

---

## 8. Roadmap

### Phase 1: MVP (Q4 2026)
- [x] PRD/SRS/SDD defined
- [ ] Chart of Accounts (SAK EMKM template)
- [ ] Manual journal entries (create, edit, post)
- [ ] Auto-journal from Shopee
- [ ] General Ledger + Trial Balance
- [ ] Income Statement (P&L)
- [ ] Audit trail (immutable logging)
- [ ] Frontend: /journal module
- [ ] Demo with 2 sellers

### Phase 2: Refinement (Q1 2027)
- [ ] Approval workflow (3-level configurable)
- [ ] Balance Sheet
- [ ] PDF export (statements + audit trail)
- [ ] Bank reconciliation (CSV import + match)
- [ ] Bulk entry import (CSV)
- [ ] Beta: 10 seller UAT
- [ ] Documentation (user guide, accountant guide)

### Phase 3: Scale (Q2 2027)
- [ ] Cash Flow Statement
- [ ] COGS automation (inventory valuation)
- [ ] Accounting software sync (MYOB, Jurnal, Accurate)
- [ ] e-Faktur XML auto-generation
- [ ] Accounting firm white-label (future)
- [ ] Public release

---

## 9. Compliance & Legal

### 9.1 SAK EMKM Compliance
- Chart of Accounts aligned with SAK EMKM 2016
- Financial statements formatted per standard
- Audit trail meets tax audit requirements
- Bookkeeping retention: 7 years (immutable)

### 9.2 Indonesian Tax Law
- PPh 21 calculation (1.5% for UMKM)
- PPN tracking (if registered)
- e-Faktur integration (Phase 3)

### 9.3 Data Protection (UU PDP)
- GDPR + UU PDP 27/2022 compliant
- Right to export: User can download all journal data
- Right to be forgotten: Anonymization (not deletion, for audit trail)

### 9.4 Disclaimer
> "dnShop Finance is a bookkeeping tool to help organize financial data. It is not professional accounting or tax advice. Results should be reviewed by a qualified accountant or tax advisor before filing with tax authorities."

---

## 10. Competitive Positioning

### vs. Mekari Jurnal / Accurate
| Feature | dnShop Finance v2.0 | Mekari Jurnal | Accurate |
|---------|---|---|---|
| **Shopee Integration** | Native, real-time | Plugin, delayed | None |
| **Price** | 349k (Pro) | 499k+ | 600k+ |
| **Chart of Accounts** | ✅ SAK EMKM built-in | ✅ | ✅ |
| **Journal Entries** | ✅ Manual + auto | ✅ | ✅ |
| **Approval Workflow** | ✅ (Phase 2) | ✅ | ✅ |
| **P&L Report** | ✅ | ✅ | ✅ |
| **Tax Compliance** | ✅ PPh 21, PPN, e-Faktur | ✅ | ✅ |
| **Target** | Shopee sellers | General SME | Accounting firms |

**Unique value:**
- Shopee-native (data synced automatically)
- Seller-focused (not general SME software)
- Affordable tier ($3.50 vs $5+ for competitors)

---

## 11. Acceptance Criteria (Overall)

- [ ] Chart of Accounts (SAK EMKM template + custom)
- [ ] Manual journal entries (balance validation)
- [ ] Auto-journal from Shopee (order, refund, commission)
- [ ] General Ledger (per-account + summary)
- [ ] Trial Balance (diagnostic for imbalance)
- [ ] Income Statement (P&L, SAK EMKM format)
- [ ] Audit trail (immutable, 7-year retention)
- [ ] RBAC (owner/accountant/cashier/viewer)
- [ ] Data isolation per shop
- [ ] Zero regressions on v1.0 features
- [ ] Demo data (2 sellers with 100+ entries)
- [ ] Documentation (user guide + admin guide)
- [ ] NPS > 40 (accountant users)
- [ ] Performance: GL render <3s, P&L <5s

---

## 12. Glossary

| Term | Definition |
|------|-----------|
| **Chart of Accounts** | List of all accounts (assets, liabilities, etc.) |
| **Journal Entry** | Record of a transaction (debit + credit sides) |
| **Debit** | Left side (increases assets/expenses) |
| **Credit** | Right side (decreases assets/expenses) |
| **General Ledger** | Transaction history per account |
| **Trial Balance** | All accounts with totals (debit should = credit) |
| **P&L / Income Statement** | Revenue - Expenses = Profit |
| **Balance Sheet / Neraca** | Assets = Liabilities + Equity |
| **Posting** | Finalizing entry (becomes immutable) |
| **SAK EMKM** | Indonesian accounting standard for SMEs |
| **Approval Workflow** | Separation of duties (creator ≠ approver) |

---

**Document End**  
**Next Review:** October 15, 2026  
**Prepared By:** DN Tech  
**Status:** Ready for SRS & SDD Development
