# SRS V3 — dnPeople Software Requirements Specification
## Functional & Non-Functional Requirements, Enterprise Grade

**Document ID:** Doc 28-SRS-V3  
**Version:** 3.0  
**Date:** 7 July 2026  
**Owner:** PT. Dozer Napitupulu Technology (dntech.id)  
**Product Owner:** VP Product  
**Baseline:** Doc 02 (Original SRS, Phase 0–4)

> **Scope:** Detailed functional, non-functional, and compliance requirements for V3.0 (go-live, Phase 5) through Phase 8. Target: production-ready enterprise ERP comparable to SAP/Odoo/Mekari for Indonesia SMEs.

---

## 1. Functional Requirements Overview

### 1.1 Requirement Traceability Matrix (RTM)

**Total Requirements: 240+** (140+ from Phase 0–4 + 100+ for Phase 5–8)

| Category | Phase 0–4 | Phase 5 (V3.0) | Phase 6 | Phase 7 | Total |
|----------|-----------|------------------|---------|---------|-------|
| Core ERP | 140+ | — | — | — | 140+ |
| Go-live/Compliance | — | 30+ | — | — | 30+ |
| AI/Analytics | — | — | 25+ | — | 25+ |
| Enterprise Tier-2 | — | — | — | 35+ | 35+ |
| Platform/Ecosystem | — | — | — | 15+ | 15+ |
| **TOTAL** | **140+** | **30+** | **25+** | **35+** | **240+** |

---

## 2. Finance Module Requirements (FR-FIN-*)

### 2.1 General Ledger (FR-FIN-GL-*)

#### FR-FIN-GL-001: Chart of Accounts Management
**Description:** System shall allow admin to create, update, and delete chart of accounts (COA).  
**Acceptance Criteria:**
- ✅ COA structure: Account code (max 20 char) + description + type (asset/liability/equity/revenue/expense)
- ✅ Parent-child relationship (hierarchical): GL 1000 → 1100 → 1110
- ✅ Validation: Cannot delete if transactions exist; soft-delete option
- ✅ Audit trail: Who changed account description, when, before/after values
- ✅ Export: Excel format with hierarchy preserved
**Priority:** P0 (Critical)  
**Status:** ✅ Implemented (Phase 0)  
**API:** POST/PUT/DELETE `/api/v1/finance/coa`

#### FR-FIN-GL-002: Journal Entry & GL Posting
**Description:** Finance users shall post debit/credit journal entries to GL accounts with full audit.  
**Acceptance Criteria:**
- ✅ Journal entry form: description + entry date + line items (account + debit/credit + memo)
- ✅ Double-entry validation: Total debit = Total credit (error if not)
- ✅ Posting logic: GL posting once approved (workflow)
- ✅ Reversal: Allow reversal of posted entries (create reverse entry, original marked "reversed")
- ✅ Approval workflow: Pending → Manager approved → Finance approved → Posted
- ✅ Document attachment: Optional file upload (PDF, image)
- ✅ Drill-down: GL balance → GL account detail → individual JE
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST/GET `/api/v1/finance/journal-entries`  
**UI:** Finance → Journal Entries page

#### FR-FIN-GL-003: Trial Balance Report
**Description:** Generate trial balance showing GL account balances as of date.  
**Acceptance Criteria:**
- ✅ Report parameters: As of date (required), filter by account code pattern (optional)
- ✅ Output: Account code, description, debit balance, credit balance, net balance
- ✅ Calculations: SUM(debit) - SUM(credit) per account
- ✅ Export: Excel, PDF, CSV
- ✅ Drill-down: Click account → show transactions
- ✅ Performance: <5s for 10,000 GL entries
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** GET `/api/v1/finance/reports/trial-balance`

---

### 2.2 Accounts Payable (FR-FIN-AP-*)

#### FR-FIN-AP-001: Purchase Order (PO) Integration
**Description:** AP shall track POs from Supply Chain module and create AP liabilities.  
**Acceptance Criteria:**
- ✅ PO receipt: Auto-create AP invoice from PO when goods receipt (GR) posted
- ✅ Three-way matching: PO (qty) + GR (qty) + Invoice (qty) must match, else flag
- ✅ Tolerance: Allow 2% variance, system auto-matches if within tolerance
- ✅ Unmatched invoices: Dashboard showing invoice age, amount, GR status
- ✅ GL posting: Debit inventory account, credit AP (vendor liability)
- ✅ Audit trail: Every match/unmatch logged with user + timestamp
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST/GET `/api/v1/finance/ap/invoices`

#### FR-FIN-AP-002: Vendor Payment & Reconciliation
**Description:** Record payments to vendors and reconcile against AP balance.  
**Acceptance Criteria:**
- ✅ Payment methods: Bank transfer, check, cash
- ✅ Payment form: Vendor + invoices to pay (select) + amount + payment method + date
- ✅ GL posting: Debit AP, credit bank account
- ✅ Bank reconciliation: Match payment with bank statement
- ✅ Aging report: 0–30 days, 30–60 days, 60–90 days, >90 days
- ✅ Payment due date alert: Auto-email AP user 5 days before due date
- ✅ Dunning: Auto-send vendor payment reminder (Phase 5 automation)
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST `/api/v1/finance/ap/payments`  
**Notification:** Scheduler cron job (daily at 8am)

#### FR-FIN-AP-003: Vendor Master Data
**Description:** Maintain vendor information and payment terms.  
**Acceptance Criteria:**
- ✅ Fields: Vendor name, code (NPWP if available), address, contact, payment terms (Net 30/60), bank account, tax ID
- ✅ Validation: NPWP format if provided (Indonesian format: XX.XXX.XXX.X-XXX.XXX)
- ✅ Payment terms: Days offset from invoice date (e.g., Net 30 = pay 30 days later)
- ✅ Tax: Tax ID linked to tax calculation (withheld tax percentage)
- ✅ Currency: Default payment currency (IDR, USD, etc.)
- ✅ Deactivation: Soft-delete; prevent deletion if invoices exist
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST/GET/PUT `/api/v1/finance/vendors`

---

### 2.3 Accounts Receivable (FR-FIN-AR-*)

#### FR-FIN-AR-001: Sales Order to AR Conversion
**Description:** Auto-create AR invoice from Sales Order upon customer acceptance.  
**Acceptance Criteria:**
- ✅ SO flow: SO approved → SO shipped → AR invoice auto-created
- ✅ AR invoice: Copy SO line items (description, qty, price, total)
- ✅ GL posting: Debit AR (customer receivable), credit sales revenue
- ✅ Tax: Add PPN (VAT) line if customer is taxable (e-Faktur)
- ✅ Invoice number: Auto-generated sequential (INV-2026-0001, INV-2026-0002, ...)
- ✅ Due date: Calculated per customer payment terms (e.g., Net 30)
- ✅ Workflow: Only finance can convert (approval required)
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST `/api/v1/finance/ar/invoices` (triggered by sales module)

#### FR-FIN-AR-002: Customer Payment & Reconciliation
**Description:** Record customer payments and reconcile against AR balance.  
**Acceptance Criteria:**
- ✅ Payment methods: Bank transfer, check, cash, credit card
- ✅ Receipt form: Customer + invoices to pay (select) + amount + date + reference
- ✅ Partial payment: Allow customer to pay portion of invoice (remainder due later)
- ✅ Overpayment: If payment >invoice, create credit note for future use
- ✅ GL posting: Debit bank/cash, credit AR
- ✅ Aging report: 0–30, 30–60, 60–90, >90 days overdue
- ✅ Days sales outstanding (DSO): KPI metric (avg days to collect)
- ✅ Auto-dunning: Send payment reminder when 15 days overdue (Phase 5)
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST `/api/v1/finance/ar/payments`

#### FR-FIN-AR-003: Credit Note & Debit Note
**Description:** Process returns (credit notes) and adjustments (debit notes).  
**Acceptance Criteria:**
- ✅ Credit note: Reverse sales transaction (e.g., customer return)
- ✅ Debit note: Additional charges (e.g., shipping surcharge)
- ✅ GL impact: Credit note reverses revenue + AP; Debit note adds revenue + AP
- ✅ Reference: Link to original invoice
- ✅ Approval: Workflow approval before posting
- ✅ e-Faktur: Immediately cancel corresponding e-Faktur if exists
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST `/api/v1/finance/ar/credit-notes`, `/api/v1/finance/ar/debit-notes`

---

### 2.4 Tax Compliance (FR-FIN-TAX-*)

#### FR-FIN-TAX-001: e-Faktur (Electronic Invoice) Integration
**Description:** Indonesia Ministry of Finance e-Faktur API integration for VAT compliance.  
**Acceptance Criteria:**
- ✅ API integration: Real-time posting to e-Faktur system
- ✅ Invoice details: Invoice number, date, customer (NPWP), amount, PPN, PPnBM
- ✅ Status tracking: Pending → Posted → Approved → Cancelled
- ✅ Rejection handling: If e-Faktur API rejects (duplicate, format error), retry with user notification
- ✅ Serial number: e-Faktur returns serial number (KD_JENIS_TRX, NOMOR_FAKTUR, etc.)
- ✅ Cancellation: If invoice cancelled in system, immediately cancel in e-Faktur
- ✅ Compliance: 100% of taxable invoices must be e-Faktur compliant (audit trail)
- ✅ Error logging: Every API call logged (timestamp, request, response, status)
**Priority:** P0 (Critical for Indonesia market)  
**Status:** ✅ Implemented (Phase 0)  
**API:** POST `/api/v1/finance/efaktur/submit`  
**Monitoring:** Sentry alert if e-Faktur API down >10 min

#### FR-FIN-TAX-002: PPh 21 (Income Tax) Calculation
**Description:** Automatic PPh 21 calculation for employee salaries per Indonesia tax law.  
**Acceptance Criteria:**
- ✅ Tax tables: Built-in 2026 tax brackets (subject to annual update)
  - Non-taxable: 0–54M (annual) = 0%
  - 54M–162M = 5%
  - 162M–500M = 15%
  - >500M = 30%
- ✅ Deductions: PTKP (Personal Tax Allowance) = 54M/year (standard)
- ✅ Withholding: Employer withholds PPh 21 from salary
- ✅ SPT (Tax Return): Monthly/annual SPT-1721 ready for export to Tax Authority
- ✅ Compliance: Audit trail showing calculation method
- ✅ Multi-employee: Batch calculate PPh 21 for all employees (monthly)
- ✅ Tolerance: Allow manual override (with audit log) if employee disputes
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST `/api/v1/finance/payroll/calculate-pph21`

#### FR-FIN-TAX-003: PPN (Value Added Tax) Calculation & Reporting
**Description:** PPN 11% (or 12% if updated) calculation on sales/purchases.  
**Acceptance Criteria:**
- ✅ PPN rate: Configurable (currently 11%, can update to 12%)
- ✅ Calculation: Auto-calculate PPN on invoice (item total × 11%)
- ✅ Tax treatment: Taxable, non-taxable, exempt (per item type)
- ✅ Input tax (PPn Masukan): PPN from vendor invoices (eligible for deduction)
- ✅ Output tax (PPn Keluaran): PPN from customer invoices (must remit to gov)
- ✅ SPT PPN: Monthly/quarterly SPT ready for e-Filing to DJP
- ✅ Reconciliation: System show input vs output PPN (tax position)
- ✅ Reporting: e-Faktur integration ensures all invoices reported
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** GET `/api/v1/finance/reports/ppt-pnn-summary`

#### FR-FIN-TAX-004: Tax Compliance Reporting (V3.0)
**Description:** Generate compliance reports for tax authorities (new in Phase 5).  
**Acceptance Criteria:**
- ✅ SPT-1721 export: Employee income tax report (for Tax Authority)
- ✅ SPT-PPN export: VAT report (monthly/quarterly)
- ✅ PPh 23/26 report: Withholding tax on services/rent
- ✅ Format: XML format per DJP specification (e-Filing compatible)
- ✅ Validation: Auto-validate before export (balances must match)
- ✅ Audit trail: Export history (who exported, when, for which period)
- ✅ Digital signature: Option to digitally sign export (Phase 7 with certificate)
**Priority:** P0  
**Status:** 🆕 New in V3.0  
**API:** GET `/api/v1/finance/compliance/export-spt`

---

### 2.5 Financial Reporting (FR-FIN-REPORT-*)

#### FR-FIN-REPORT-001: Balance Sheet (SAK-EP)
**Description:** Generate balance sheet per SAK-EP (Indonesian GAAP).  
**Acceptance Criteria:**
- ✅ Structure: Assets (current + non-current) = Liabilities + Equity
- ✅ Accounts: Grouped per account type (asset/liability/equity)
- ✅ Reclassification: Support reclassification entries (e.g., long-term → current if due within 12mo)
- ✅ Consolidation: If multi-entity, show consolidated + individual entity (Phase 7)
- ✅ Comparative: Show current + prior year/period for comparison
- ✅ Totals: Auto-calculate subtotals, verify equation (A=L+E)
- ✅ Notes: Support for note disclosures (linkable to balance sheet)
- ✅ Format: Excel, PDF, XML
- ✅ SAK-EP compliance: Footnote reference to SAK-EP standards
**Priority:** P0  
**Status:** ✅ Implemented (Phase 2)  
**API:** GET `/api/v1/finance/reports/balance-sheet`

#### FR-FIN-REPORT-002: Income Statement
**Description:** Generate P&L statement per SAK-EP.  
**Acceptance Criteria:**
- ✅ Structure: Revenue - COGS = Gross profit; Gross profit - OpEx = EBIT; EBIT - interest/tax = Net income
- ✅ Accounts: Grouped by revenue/COGS/OpEx/finance costs/tax
- ✅ Metrics: Gross margin %, Operating margin %, Net margin % (calculated)
- ✅ Comparative: Current + prior year (column format)
- ✅ Segments: Optional breakdown by sales channel (Phase 6)
- ✅ Drill-down: Click revenue → show SO detail → show line items
- ✅ Format: Excel, PDF
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** GET `/api/v1/finance/reports/income-statement`

#### FR-FIN-REPORT-003: Cash Flow Statement
**Description:** Generate cash flow statement (3-way split: operating, investing, financing).  
**Acceptance Criteria:**
- ✅ Operating activities: Net income ± adjustments (depreciation, AR changes, AP changes)
- ✅ Investing activities: CapEx, asset sales
- ✅ Financing activities: Loan proceeds, dividend paid
- ✅ Ending cash: Beginning cash + operating + investing + financing = ending cash
- ✅ Reconciliation: Verify reconciliation with GL cash account
- ✅ Format: Excel, PDF
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** GET `/api/v1/finance/reports/cash-flow`

---

## 3. Sales Module Requirements (FR-SALES-*)

### 3.1 Sales Order Management (FR-SALES-SO-*)

#### FR-SALES-SO-001: Create Sales Order (SO)
**Description:** Sales users shall create SO with customer, line items, price, delivery terms.  
**Acceptance Criteria:**
- ✅ Form fields: Customer (dropdown, existing + new), order date, delivery date, delivery address, line items (product, qty, unit price, discount %)
- ✅ Calculation: Line total = qty × unit price × (1 - discount %), Invoice total = SUM(line totals) + freight/tax
- ✅ Customer credit limit: Check against customer credit limit; block if exceeding (configurable)
- ✅ Stock availability: Check inventory; warn if insufficient (allow backorder option)
- ✅ Approval workflow: Created → Sales manager approved → Finance approved → Confirmed
- ✅ Status: Draft → Approved → Confirmed → Shipped → AR invoice → Closed
- ✅ References: PO number, customer requisition, internal notes
- ✅ Currency: Support multi-currency (IDR, USD, etc.) with auto-exchange rate (daily)
- ✅ Audit trail: All changes logged
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST/GET/PUT `/api/v1/sales/orders`

#### FR-SALES-SO-002: Credit Limit Management
**Description:** Track customer credit limit and AR balance; warn/block if exceeding.  
**Acceptance Criteria:**
- ✅ Credit limit: Configurable per customer (default 0 = cash only)
- ✅ Calculation: Total AR outstanding ÷ credit limit = utilization %
- ✅ Warning: If >80%, warn sales user during SO creation
- ✅ Block: If >100%, block SO creation (unless manager override)
- ✅ Hold: If 90–100% and invoice overdue >30 days, auto-hold new orders
- ✅ Release: Finance can manually release hold after payment received
- ✅ Report: Dashboard showing credit utilization by customer
**Priority:** P1 (Important)  
**Status:** ✅ Implemented  
**API:** GET `/api/v1/sales/credit-limits`

---

### 3.2 Quotation & Order Pipeline (FR-SALES-QUOTE-*)

#### FR-SALES-QUOTE-001: Create Quotation
**Description:** Sales can create quotation (price proposal) before SO.  
**Acceptance Criteria:**
- ✅ Quote form: Customer + line items + expiration date + notes
- ✅ Versioning: Track quote versions (Quote v1, v2, v3...)
- ✅ Expiration: Auto-expire after date; block if customer tries to confirm expired quote
- ✅ Status: Draft → Sent → Accepted → Rejected → Lost
- ✅ Convert to SO: With 1-click convert quote → SO (auto-populate fields)
- ✅ Tracking: Sales pipeline dashboard showing quote stage, win/loss reason
**Priority:** P1  
**Status:** ✅ Implemented  
**API:** POST/GET `/api/v1/sales/quotations`

---

## 4. Supply Chain Module Requirements (FR-SC-*)

### 4.1 Purchase Order (FR-SC-PO-*)

#### FR-SC-PO-001: Create Purchase Order
**Description:** Procurement user creates PO for vendor with items, qty, delivery.  
**Acceptance Criteria:**
- ✅ PO fields: Vendor + line items (product, qty, unit price, delivery date)
- ✅ Approval workflow: Draft → Manager approved → Finance approved → Sent to vendor
- ✅ Vendor communication: Email PO to vendor (auto-generated PDF)
- ✅ Status: Draft → Sent → Acknowledged (vendor) → Partial GR → Complete GR → Invoiced → Closed
- ✅ Reference: Link to requisition (if created from requisition)
- ✅ GL posting: (None until GR; then create GL entry)
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST/GET/PUT `/api/v1/supply-chain/pos`

#### FR-SC-PO-002: Goods Receipt (GR)
**Description:** Record receipt of goods from PO.  
**Acceptance Criteria:**
- ✅ GR form: PO reference + line items (qty received, qty accepted, qty rejected)
- ✅ QC check: QC department can mark accepted/rejected
- ✅ Inventory update: Accepted qty added to inventory
- ✅ GL posting: Debit inventory, credit AP
- ✅ AP invoice match: GR qty must match invoice qty (3-way match, Phase 2)
- ✅ Partial GR: Allow partial receipt (multiple GRs for 1 PO)
- ✅ Barcode: Scan product barcode to auto-populate item (optional, Phase 4)
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST `/api/v1/supply-chain/goods-receipts`

#### FR-SC-PO-003: MRP (Material Requirements Planning)
**Description:** System calculates optimal order qty based on sales forecast & current inventory.  
**Acceptance Criteria:**
- ✅ MRP logic: EOQ (Economic Order Quantity) = √(2DS/H) where D=demand, S=order cost, H=holding cost
- ✅ Lead time: Account for vendor lead time (e.g., 14 days)
- ✅ Safety stock: Optional buffer stock based on demand variability
- ✅ Reorder point: When inventory ≤ safety stock + lead-time demand, auto-suggest PO
- ✅ Report: MRP suggestions report (products to order, qty, by vendor)
- ✅ Auto-PO: Optional auto-generate PO from MRP (for frequent orders)
- ✅ Dashboard: Stock status (optimal/low/high)
**Priority:** P1  
**Status:** ✅ Implemented  
**API:** GET `/api/v1/supply-chain/mrp/suggestions`

---

### 4.2 Inventory Management (FR-SC-INV-*)

#### FR-SC-INV-001: Inventory Master
**Description:** Track products: SKU, description, UOM, cost, reorder point.  
**Acceptance Criteria:**
- ✅ Fields: SKU (unique), description, UOM (pcs, kg, ltr), cost (FIFO/LIFO/average), reorder point, lead time
- ✅ Barcode: Auto-generate or scan barcode for tracking
- ✅ Multi-warehouse: Support inventory at multiple locations (Phase 5: basic, Phase 7: advanced)
- ✅ Categories: Organize by product category (electronics, consumables, etc.)
- ✅ Inactive: Mark inactive products (prevent new use, allow historical access)
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST/GET/PUT `/api/v1/supply-chain/products`

#### FR-SC-INV-002: Stock Count & Adjustment
**Description:** Physical inventory count and variance adjustment.  
**Acceptance Criteria:**
- ✅ Cycle count: Periodic count of inventory (monthly, quarterly)
- ✅ Count form: Product, expected qty (from system), physical qty (counted), variance
- ✅ Variance: Investigate if variance >5% (investigate reasons: shrinkage, theft, data entry)
- ✅ Adjustment JE: Post GL adjustment entry (debit inventory, credit COG variance account)
- ✅ Approval: Finance approval required for large variances (>$1K)
**Priority:** P1  
**Status:** ✅ Implemented  
**API:** POST `/api/v1/supply-chain/stock-adjustments`

---

## 5. HR Module Requirements (FR-HR-*)

### 5.1 Payroll (FR-HR-PAYROLL-*)

#### FR-HR-PAYROLL-001: Employee Master Data
**Description:** Maintain employee records: personal, employment, compensation.  
**Acceptance Criteria:**
- ✅ Fields: Employee ID, name, email, phone, NPWP, KTP, birth date, gender, address
- ✅ Employment: Start date, end date, position, department, supervisor, salary
- ✅ Salary components: Base salary, allowances (transport, meal, housing), deductions (health insurance, pension)
- ✅ Tax: PPh 21 status (married with N children = PTKP allocation), withholding percentage
- ✅ Bank account: Bank name, account number (for salary transfer)
- ✅ Status: Active, suspended, terminated
- ✅ Salary history: Track salary changes over time (audit trail)
- ✅ Salary confidentiality: Only HR + Finance can view salary (field-level encryption)
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST/GET/PUT `/api/v1/hr/employees`

#### FR-HR-PAYROLL-002: Monthly Payroll Calculation
**Description:** Calculate monthly payroll (salary + allowances - deductions - tax).  
**Acceptance Criteria:**
- ✅ Payroll run: Select month, calculate for all active employees
- ✅ Calculation: Gross = base + allowances; Deductions = insurance + pension; Tax = PPh 21; Net = Gross - deductions - tax
- ✅ Overtime: Support overtime calculation (1.5× or 2× rate)
- ✅ Absence: Deduct salary if absent (days × (salary ÷ working days))
- ✅ Bonuses: Optional one-time bonus (e.g., year-end, performance)
- ✅ Approval workflow: Draft → HR approved → Finance approved → Posted
- ✅ GL posting: Debit salary expense (GL 6100), credit bank (liability until paid)
- ✅ SPT-1721 impact: Each payroll updates employee annual income (for tax return)
- ✅ Payslip: Generate payslip PDF per employee (confidential)
- ✅ Direct deposit: Export bank transfer file (CSV format per bank spec)
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST `/api/v1/hr/payroll/runs`

#### FR-HR-PAYROLL-003: Tax & Compliance
**Description:** Ensure tax calculations per Indonesia law (PPh 21, health insurance, pension).  
**Acceptance Criteria:**
- ✅ PPh 21: Auto-calculate per tax bracket (Phase 0)
- ✅ Health insurance (BPJS): 4% employer contribution (optional employee deduction 1%)
- ✅ Pension (iuran): Employer 3%, employee 2% of salary
- ✅ SPT-1721: Annual employee tax return (prepared for signature)
- ✅ Tax certificate: Issue annual tax certificate to employee (proof of withholding)
- ✅ Compliance: 100% withholding rate must be calculated per employee
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** GET `/api/v1/hr/payroll/tax-compliance`

#### FR-HR-PAYROLL-004: Annual Bonus & Incentive (V3.0)
**Description:** Track and calculate annual bonuses, variable pay, incentives (new in Phase 5).  
**Acceptance Criteria:**
- ✅ Bonus types: Year-end bonus (THR, common in Indonesia), performance bonus, sales commission
- ✅ Calculation: By formula (e.g., bonus = monthly salary × 2 for THR)
- ✅ Approval: HR + Finance approval required
- ✅ GL posting: Debit incentive expense, credit bank
- ✅ Tax impact: Bonuses subject to PPh 21 (included in annual calculation)
**Priority:** P1  
**Status:** 🆕 New in V3.0  
**API:** POST `/api/v1/hr/bonuses`

---

### 5.2 Leave Management (FR-HR-LEAVE-*)

#### FR-HR-LEAVE-001: Leave Policy & Entitlements
**Description:** Define leave types and annual entitlement per employee.  
**Acceptance Criteria:**
- ✅ Leave types: Annual leave, sick leave, personal leave, bereavement, maternity/paternity
- ✅ Entitlements: Annual leave = 12 days (configurable per company policy)
- ✅ Accrual: Leave accrued monthly (12 ÷ 12 = 1 day/month)
- ✅ Carryover: Option to allow carryover to next year (max 5 days, rest forfeited)
- ✅ Tracking: System tracks used, available, pending approval
**Priority:** P1  
**Status:** ✅ Implemented  
**API:** POST/GET `/api/v1/hr/leave-types`, `/api/v1/hr/leave-entitlements`

#### FR-HR-LEAVE-002: Leave Request & Approval
**Description:** Employee request leave, manager approves.  
**Acceptance Criteria:**
- ✅ Leave form: Leave type + start date + end date + reason (optional)
- ✅ Validation: Check available balance (error if requesting more than available)
- ✅ Approval workflow: Employee submit → Manager approved → HR confirmed
- ✅ Calendar view: Show approved leave on team calendar (privacy: manager can see, others cannot)
- ✅ Rejection: Manager can reject with reason (employee notified)
- ✅ Cancellation: Employee can cancel pending/approved leave
**Priority:** P1  
**Status:** ✅ Implemented  
**API:** POST/GET `/api/v1/hr/leave-requests`

---

### 5.3 360° Feedback (FR-HR-360-*)

#### FR-HR-360-001: Feedback Round Setup
**Description:** Create 360° feedback round (self-review, peer feedback, manager feedback).  
**Acceptance Criteria:**
- ✅ Round: Define period (start date, deadline)
- ✅ Participants: Select reviewers (self, 2+ peers, 1+ manager, opt. skip-level)
- ✅ Questions: Template (leadership, communication, teamwork) + custom questions
- ✅ Anonymous: Option to allow anonymous feedback (improves honesty)
**Priority:** P1  
**Status:** ✅ Implemented (Phase 3)  
**API:** POST `/api/v1/hr/feedback/rounds`

#### FR-HR-360-002: Feedback Submission
**Description:** Reviewers provide feedback on target employee.  
**Acceptance Criteria:**
- ✅ Survey form: Questions + Likert scale (1–5) + open feedback
- ✅ Tracking: System tracks who submitted, who hasn't (reminder emails)
- ✅ Confidentiality: Peer feedback anonymous; manager feedback attributed
- ✅ Deadline: Submissions close at deadline (no further entries allowed)
**Priority:** P1  
**Status:** ✅ Implemented  
**API:** POST `/api/v1/hr/feedback/responses`

---

## 6. Manufacturing Module Requirements (FR-MFG-*)

### 6.1 BOM (Bill of Materials) (FR-MFG-BOM-*)

#### FR-MFG-BOM-001: BOM Creation & Versioning
**Description:** Define BOM for finished products showing components, qty, operations.  
**Acceptance Criteria:**
- ✅ BOM form: Finished product + line items (component, qty, UOM, scrap %)
- ✅ Routing: Define manufacturing operations (e.g., cutting, welding, painting)
- ✅ Lead time: Each operation has lead time (hrs)
- ✅ Versioning: Support multiple BOM versions (active, historical)
- ✅ Costing: Calculate standard cost of product (component cost + labor)
- ✅ Effectivity: Date range (from/to) for BOM applicability
**Priority:** P1  
**Status:** ✅ Implemented  
**API:** POST/GET `/api/v1/manufacturing/boms`

#### FR-MFG-BOM-002: Manufacturing Order (MO)
**Description:** Create manufacturing order to produce finished goods.  
**Acceptance Criteria:**
- ✅ MO form: Finished product + qty to produce + start date + BOM version
- ✅ Component requirement: System explodes BOM to show material requirements
- ✅ Reservation: Auto-reserve components from inventory (or create backorder)
- ✅ Status: Draft → Released → In progress → Complete → Closed
- ✅ GL posting: Debit inventory (finished goods), credit materials (component consumed)
- ✅ Yield: Track scrap/reject qty (compare actual vs BOM %)
- ✅ Costing: Track actual labor cost vs standard cost (variance analysis)
**Priority:** P1  
**Status:** ✅ Implemented  
**API:** POST/GET `/api/v1/manufacturing/orders`

---

## 7. Projects Module Requirements (FR-PROJ-*)

### 7.1 Project Management (FR-PROJ-*)

#### FR-PROJ-001: Create Project
**Description:** Project manager creates project with tasks, timeline, budget.  
**Acceptance Criteria:**
- ✅ Project form: Name, description, customer, start date, end date, budget, project manager
- ✅ Tasks: Add tasks with dependencies (task B depends on task A)
- ✅ Gantt chart: Visual timeline showing task bars + dependencies
- ✅ Team: Assign resources (employees) to tasks
- ✅ Budget: Allocate budget per task (for billable projects)
**Priority:** P1  
**Status:** ✅ Implemented  
**API:** POST/GET `/api/v1/projects`

#### FR-PROJ-002: Time Tracking
**Description:** Team members log time spent on tasks (for billable projects).  
**Acceptance Criteria:**
- ✅ Timesheet form: Date, task, hours, description of work
- ✅ Approval: Manager approves timesheet (before billing)
- ✅ Billable: Flag time as billable/non-billable
- ✅ Rate: Hourly rate per employee/project
- ✅ Invoice: Create AR invoice from approved timesheets (Phase 7: auto-invoice)
**Priority:** P1  
**Status:** ✅ Implemented  
**API:** POST/GET `/api/v1/projects/timesheets`

---

## 8. CRM Module Requirements (FR-CRM-*)

### 8.1 Customer Management (FR-CRM-LEAD-*)

#### FR-CRM-001: Lead Management
**Description:** Capture new sales opportunities (leads) in sales pipeline.  
**Acceptance Criteria:**
- ✅ Lead form: Company name, contact person, email, phone, description, potential value
- ✅ Status: New → Qualified → Proposal sent → Negotiation → Won → Lost
- ✅ Probability: Assign win probability (0–100%) per stage
- ✅ Pipeline value: Expected value = deal size × probability
- ✅ Activity: Log calls, meetings, emails per lead (phase 5: basic, phase 6: full CRM)
- ✅ Conversion: Convert lead → customer once won
**Priority:** P1  
**Status:** ✅ Implemented  
**API:** POST/GET `/api/v1/crm/leads`

---

## 9. Compliance & Data Governance (FR-COMP-*)

### 9.1 Audit Trail (FR-COMP-AUDIT-*)

#### FR-COMP-AUDIT-001: Immutable Audit Log
**Description:** Track all user actions (create, read, update, delete) for compliance.  
**Acceptance Criteria:**
- ✅ Log entry: User ID, action type (C/R/U/D), resource (GL account, SO, etc.), timestamp, IP address, user agent
- ✅ Change tracking: Show before/after values for updates (e.g., "SO status changed from 'Draft' to 'Approved'")
- ✅ Immutability: Audit logs cannot be deleted or modified (only append-only)
- ✅ Retention: 7 years (compliance requirement)
- ✅ Query: Search audit log by user, resource, date range (Elasticsearch)
- ✅ Report: Audit trail report per compliance requirement (SOC 2, UU PDP)
- ✅ Financial impact: Highlight transactions (GL posting, invoice, payment) for forensics
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** GET `/api/v1/compliance/audit-logs`

---

### 9.2 GDPR & UU PDP (FR-COMP-GDPR-*)

#### FR-COMP-GDPR-001: Data Subject Rights
**Description:** Support GDPR + UU PDP data subject access, export, erasure.  
**Acceptance Criteria:**
- ✅ Export request: User submits export request (GET /api/v1/gdpr/export)
- ✅ Data format: JSON dump of all personal data (user profile, transactions, activity)
- ✅ Scope: Include all PII (email, phone, address, salary, etc.)
- ✅ Response time: 30 days to provide export (regulatory requirement)
- ✅ Erasure request: User submits erasure request (DELETE /api/v1/gdpr/erase)
- ✅ Hard delete: Permanently delete user data + associated records (or anonymize)
- ✅ Grace period: 30-day window before permanent deletion (reversible)
- ✅ Audit: Log all requests (who, when, reason)
**Priority:** P0  
**Status:** ✅ Implemented (Phase 4)  
**API:** GET/DELETE `/api/v1/gdpr/*`

---

### 9.3 E-Signature & Document Signing (FR-COMP-ESIGN-*)

#### FR-COMP-ESIGN-001: E-Signature Integration
**Description:** Support e-signature for contracts, invoices, POs (Phase 5 MVP).  
**Acceptance Criteria:**
- ✅ Document upload: Upload PDF for signing
- ✅ Signature request: Send document to recipient + sign request email
- ✅ Signature process: Recipient signs (e-signature provider handles)
- ✅ Proof: Signed document stored with timestamp + signer certificate
- ✅ Workflow: PO requires vendor signature; contract requires customer signature
- ✅ Provider: Integration with e-signature provider (e.g., DocuSign, Phase 7) or local option
- ✅ Legal validity: Signatures comply with Indonesian law (UU ITE)
**Priority:** P1  
**Status:** 🆕 New in V3.0 (MVP basic, advanced in Phase 7)  
**API:** POST `/api/v1/documents/sign-requests`

---

## 10. Go-Live & Operations (FR-OPS-*)

### 10.1 Multi-Tenancy (FR-OPS-TENANT-*)

#### FR-OPS-TENANT-001: Tenant Provisioning
**Description:** Auto-provision new tenant with databases, configuration, sample data.  
**Acceptance Criteria:**
- ✅ Signup flow: Admin signs up → auto-create tenant
- ✅ Configuration: Set company name, legal name, NPWP, tax regime
- ✅ Chart of accounts: Auto-create default COA (Indonesia standard)
- ✅ Users: Create initial admin user + assign to tenant
- ✅ Sample data: Optional demo GL accounts, products, customers (for learning)
- ✅ Isolation: Tenant data strictly isolated (row-level tenantId on all tables)
- ✅ Subscription: Link tenant to subscription plan (Startup/Professional/Enterprise)
**Priority:** P0  
**Status:** ✅ Implemented  
**API:** POST `/api/v1/tenants/provision`

#### FR-OPS-TENANT-002: Tenant Suspension & Deletion
**Description:** Suspend or delete tenant (compliance + operations).  
**Acceptance Criteria:**
- ✅ Suspension: Admin suspend tenant (stop access, retain data)
- ✅ Deletion: Delete tenant (hard-delete data or archive to S3)
- ✅ Data retention: Option to retain data for compliance period (7 years)
- ✅ Export: Tenant data export before deletion (S3 backup)
- ✅ Audit: Log suspension/deletion with reason + approver
**Priority:** P1  
**Status:** ✅ Implemented  
**API:** PUT `/api/v1/tenants/{id}/suspend`, DELETE `/api/v1/tenants/{id}`

---

### 10.2 Backup & Recovery (FR-OPS-BACKUP-*)

#### FR-OPS-BACKUP-001: Automated Backup
**Description:** Automatic daily backup with 30-day retention (compliance).  
**Acceptance Criteria:**
- ✅ Frequency: Daily backup (automated, no user action)
- ✅ Retention: 30-day retention (auto-delete older backups)
- ✅ Encryption: Backups encrypted (S3 SSE-S3 or KMS)
- ✅ Verification: Monthly restore test (staging environment)
- ✅ Audit: Log all backups (timestamp, size, status)
**Priority:** P0  
**Status:** ✅ Implemented (Phase 4)  
**API:** GET `/api/v1/admin/backups` (monitoring)

---

## 11. Non-Functional Requirements

### 11.1 Performance Requirements (NFR-PERF-*)

#### NFR-PERF-001: API Response Latency
**Requirement:** API endpoints shall respond within acceptable latency.  
**Criteria:**
- p50 latency: <100ms (median)
- p95 latency: <500ms (95th percentile)
- p99 latency: <2s (99th percentile)
- Database queries: <1s (p99)
- Measurement: Prometheus metrics, DataDog APM

#### NFR-PERF-002: Concurrent User Support
**Requirement:** System shall support minimum 1000 concurrent users.  
**Criteria:**
- Load test: k6 script with 1000 VUs (Virtual Users)
- Sustained: Maintain 100 req/s for 10 minutes
- Error rate: <0.1%
- Resource: EKS auto-scale up to 10 pods

#### NFR-PERF-003: Database Query Optimization
**Requirement:** Database queries shall be optimized for speed.  
**Criteria:**
- No N+1 queries (use JOIN/batch queries)
- Indexes on frequently filtered columns (tenantId, date, status)
- Explain plans reviewed for all slow queries (>1s)
- Query coverage: >90% of queries <100ms

#### NFR-PERF-004: Frontend Performance
**Requirement:** Web UI shall load quickly and be responsive.  
**Criteria:**
- First Contentful Paint (FCP): <2s
- Largest Contentful Paint (LCP): <2.5s
- Cumulative Layout Shift (CLS): <0.1
- Lighthouse score: >90
- Mobile performance: >80 on Lighthouse

---

### 11.2 Security Requirements (NFR-SEC-*)

#### NFR-SEC-001: Authentication & Authorization
**Requirement:** Only authorized users can access data.  
**Criteria:**
- JWT token expiry: 15 min (access token)
- 2FA: TOTP enabled for admin users (optional for others)
- SSO: Google OAuth 2.0, SAML 2.0 (Phase 7)
- RBAC: Role-based access control with granular permissions

#### NFR-SEC-002: Encryption
**Requirement:** Sensitive data encrypted at rest and in transit.  
**Criteria:**
- In-transit: TLS 1.3 only (HTTPS)
- At-rest: AES-256 encryption (PII fields: email, phone, NPWP, salary)
- Key management: AWS KMS (keys rotated quarterly)

#### NFR-SEC-003: Vulnerability & Patch Management
**Requirement:** System regularly scanned for vulnerabilities.  
**Criteria:**
- Dependency scanning: Snyk (continuous)
- Code scanning: SonarQube (CI pipeline)
- Penetration test: Annual (Q1)
- Patch management: Critical vulnerabilities patched within 24h

#### NFR-SEC-004: Incident Response
**Requirement:** System detects and responds to security incidents.  
**Criteria:**
- Alert threshold: Failed login >5 in 15 min = block 30 min
- Unusual activity: API call spike, data export requests
- Response time: <15 min for critical incidents
- Incident log: All incidents logged (audit trail)

---

### 11.3 Availability & Disaster Recovery (NFR-AVAIL-*)

#### NFR-AVAIL-001: Uptime SLA
**Requirement:** System available 99.9% (8.76 hours downtime/year).  
**Criteria:**
- Multi-AZ deployment: EKS pods across 3 AZs
- Auto-failover: Automatic pod restart if crashed
- Load balancing: Traffic distributed across healthy pods
- Monitoring: Continuous health checks + alerts

#### NFR-AVAIL-002: Backup & Recovery
**Requirement:** Data backed up daily; recovery within 1 hour.  
**Criteria:**
- RTO: 1 hour (recover service after failure)
- RPO: 5 minutes (data loss acceptable up to 5 min)
- Backup retention: 30 days (auto-delete older)
- Backup testing: Monthly restore test (staging)

#### NFR-AVAIL-003: Database Redundancy
**Requirement:** Database protected against single-node failure.  
**Criteria:**
- Multi-AZ RDS: Primary + failover replica
- Failover time: <2 minutes (automatic)
- Replication lag: <5 seconds

---

### 11.4 Compliance Requirements (NFR-COMP-*)

#### NFR-COMP-001: SOC 2 Type II
**Requirement:** System audited for SOC 2 Type II controls.  
**Criteria:**
- Audit scope: Controls in place, operating effectively
- Common Criteria: CC6 (access), CC7 (monitoring), CC8 (change mgmt), CC9 (risk)
- Assessment: Annual audit by Big 4 firm
- Report: SOC 2 Type II report published for customers

#### NFR-COMP-002: ISO 27001
**Requirement:** Information Security Management System.  
**Criteria:**
- ISMS: Policies, procedures, risk register
- Controls: 114 controls across 14 domains
- Certification: Target 2027 Q2
- Annual review: Risk assessment + control effectiveness

#### NFR-COMP-003: UU PDP Compliance
**Requirement:** Indonesian Data Protection Law compliance.  
**Criteria:**
- Consent: Explicit opt-in for data processing
- DPIA: Data protection impact assessment completed
- Privacy policy: Published in Indonesian + English
- DPA: Standard contractual clauses signed
- Right to erasure: Implemented + tested

#### NFR-COMP-004: Indonesia Tax Law
**Requirement:** e-Faktur, PPh 21, PPN compliance.  
**Criteria:**
- e-Faktur: 100% of taxable invoices submitted (real-time API)
- PPh 21: Calculated correctly per tax tables
- PPN: Tracked (input/output), SPT-PPN ready for e-Filing
- SPT-1721: Employee tax return ready for employee signature

---

### 11.5 Scalability Requirements (NFR-SCALE-*)

#### NFR-SCALE-001: Data Volume
**Requirement:** System handles growing data without performance degradation.  
**Criteria:**
- Database: Support up to 1TB data (current: 100GB; target year 3: 1TB)
- Scaling strategy: Vertical scaling (RDS instance upgrade) + optional read replicas
- Elasticsearch: Support 100M+ documents (sharding if needed)
- Archive: Auto-archive data >2 years to S3 (cold storage)

#### NFR-SCALE-002: User Growth
**Requirement:** Support tenant growth (users, companies, transactions).  
**Criteria:**
- Tenants: Support 500–5000 tenants (Phase 5–7)
- Users per tenant: 1–100 users (Startup → Enterprise)
- Transactions: 1K–10M monthly (scale linearly)
- Horizontal scaling: Auto-scale EKS pods (min 3, max 10)

---

### 11.6 Monitoring & Observability (NFR-MONITOR-*)

#### NFR-MONITOR-001: Metrics Collection
**Requirement:** System metrics collected for performance monitoring.  
**Criteria:**
- Prometheus: Scrape metrics every 15s
- Metrics: API latency, error rate, database connections, cache hits
- Alerting: Alert on anomalies (e.g., error rate >0.1%)

#### NFR-MONITOR-002: Centralized Logging
**Requirement:** All logs centralized for debugging & compliance.  
**Criteria:**
- ELK stack: Collect logs from all services
- Retention: 30 days (older → S3 archive)
- Searchability: Full-text search on logs (keyword, date range)
- Compliance: Audit logs immutable (append-only)

#### NFR-MONITOR-003: Distributed Tracing
**Requirement:** Track requests end-to-end across services.  
**Criteria:**
- Tool: Jaeger (or Datadog APM, Phase 6)
- Sample rate: 10% in production (cost-optimized)
- Span details: Service name, operation, duration, error status

---

## 12. Requirement Status & Roadmap

### 12.1 Phase 0–4 Completion (140+ requirements)
✅ **Status: 95%+ Implemented** (confirmed in Doc 25)

All core ERP modules deployed:
- Finance (GL, AP, AR, tax)
- Sales (SO, quotation, credit limit)
- Supply Chain (PO, GR, MRP, inventory)
- HR (payroll, leave, 360° feedback)
- Manufacturing (BOM, MO)
- Projects (tasks, time tracking)
- CRM (leads, opportunities)
- Reporting (custom reports, KPI)
- Workflow (automation, SLA)
- Integrations (Stripe, Slack, Zapier, JIRA, shipping)

### 12.2 Phase 5 (V3.0) New Requirements (30+)

| Req ID | Title | Status | Target |
|--------|-------|--------|--------|
| FR-OPS-BACKUP-001 | Automated backup | 🆕 In progress | Q3 2026 |
| FR-FIN-TAX-004 | Tax compliance reporting | 🆕 In progress | Q3 2026 |
| FR-COMP-ESIGN-001 | E-signature (basic) | 🆕 Planned | Q3 2026 |
| FR-HR-PAYROLL-004 | Annual bonus/incentive | 🆕 Planned | Q3 2026 |
| NFR-COMP-001 | SOC 2 Type II | 🆕 Audit process | Q3 2026 |
| NFR-COMP-003 | UU PDP compliance | 🆕 Audit process | Q3 2026 |

### 12.3 Phase 6 Requirements (25+)

| Feature | Count | Target |
|---------|-------|--------|
| AI copilot (NLP) | 5+ | Q4 2026 |
| Predictive analytics | 8+ | Q4 2026 |
| Advanced BI | 12+ | Q4 2026 |
| **Subtotal** | **25+** | **Q4 2026** |

### 12.4 Phase 7 Requirements (35+)

| Feature | Count | Target |
|---------|-------|--------|
| OCR (invoice, document) | 8+ | Q1 2027 |
| LMS (learning management) | 10+ | Q1 2027 |
| BPMN workflow designer | 8+ | Q1 2027 |
| Consolidation engine | 6+ | Q1 2027 |
| Enterprise SSO (Azure, SAML) | 3+ | Q1 2027 |
| **Subtotal** | **35+** | **Q1 2027** |

---

## 13. Appendices

### 13.1 Glossary (Functional Terms)

| Term | Definition |
|------|-----------|
| **Chart of Accounts (COA)** | Hierarchical list of GL accounts (e.g., 1000 Assets → 1100 Current) |
| **Double-entry** | Accounting principle: every transaction has equal debit + credit |
| **e-Faktur** | Electronic invoice system (Indonesia Ministry of Finance) |
| **PPh 21** | Income tax on employee salaries (Indonesia) |
| **PPN** | Value added tax (VAT, Indonesia 11%) |
| **Dunning** | Automated payment reminder (late invoice follow-up) |
| **AR/AP** | Accounts Receivable / Accounts Payable |
| **GL posting** | Recording transaction in General Ledger |
| **MRP** | Material Requirements Planning (order qty calculation) |
| **EOQ** | Economic Order Quantity (optimal order size) |
| **BOM** | Bill of Materials (component list for product) |
| **Payroll run** | Monthly salary calculation for all employees |
| **PTKP** | Personal Tax Allowance (Indonesia: 54M/year per person) |
| **360° feedback** | Multi-source feedback (self, peer, manager) |
| **BPMN** | Business Process Model & Notation (workflow) |
| **SOC 2** | Service Organization Control (audited security framework) |
| **UU PDP** | Indonesian Data Protection Law (right to privacy, erasure, consent) |

### 13.2 Related Documents

- **Doc 25**: PRD Baseline Current State (Phase 0–4 completion)
- **Doc 26**: PRD V3 Enterprise Edition (this document's companion)
- **Doc 27**: SDD V3 System Design (architecture, scalability)
- **Doc 03**: Original SDD Phase 0–3
- **Doc 02**: Original SRS Phase 0–3
- **Doc 08**: Finance Indonesia Rules & Compliance
- **Doc 10**: Reporting SAK-EP Financial Standards
- **Doc 15**: Deployment & Operations Runbook

### 13.3 Approval Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Product Owner** | — | — | — |
| **Engineering Lead** | — | — | — |
| **QA Lead** | — | — | — |
| **Compliance Officer** | — | — | — |
| **VP Product** | — | — | — |

---

## 14. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2025 | Initial SRS (Phase 0–3) |
| 2.0 | May 2026 | Phase 4 updates (mobile, i18n, industry templates) |
| **3.0** | **Jul 2026** | **Phase 5 go-live + Phase 6–8 roadmap (enterprise grade)** |

---

**Maintained by:** Product Owner · PT. Dozer Napitupulu Technology  
**Last updated:** 7 July 2026  
**Next review:** Post go-live (Q3 2026) for Phase 6 planning
