# Software Requirements Specification (SRS) — dnCore v1.0

**Product Name:** dnCore  
**Version:** 1.0  
**Date:** 19 July 2026  
**Owner:** Dozer (CEO + Tech Lead) · PT. Dozer Napitupulu Technology · [dntech.id](https://dntech.id)  
**Repository:** [github.com/dreamcraft17/erp](https://github.com/dreamcraft17/erp)  
**Branch:** `main` · HEAD `2aaf9f9`  
**Status:** Phase 0–4 implementation complete ✅ · Phase 5–8 roadmap specified 📋  

> **Purpose:** Detailed functional + non-functional requirements untuk dnCore. Dokumen ini menguraikan "apa yang harus dibangun" pada level implementasi.

---

## 1. Functional Requirements

### 1.1 Authentication & Identity (Auth Module)

#### FR-AUTH-001: User Registration
- **Requirement:** System shall allow new users to register with email + password
- **Input:** email, password (8+ chars, 1 uppercase, 1 digit, 1 special char), company name
- **Process:** Validate email uniqueness, hash password bcrypt(cost:12), send verification email
- **Output:** Email verification link (24h expiry), store User + Tenant provisioned
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Email uniqueness check prevents duplicate registration
  - Password meets complexity rules
  - Verification email sent within 2 seconds
  - Verified user can login immediately

#### FR-AUTH-002: User Login
- **Requirement:** System shall authenticate user via email + password
- **Input:** email, password
- **Process:** Check account active, verify password hash, throttle (5 attempts / 5min / IP)
- **Output:** Access JWT (15 min), Refresh JWT (7d), user metadata
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Failed login locks account after 5 attempts (30 min lockout)
  - Successful login returns JWT tokens in httpOnly cookies
  - Refresh token rotated on use

#### FR-AUTH-003: 2FA TOTP Setup
- **Requirement:** User can opt-in to 2FA (TOTP authenticator app)
- **Input:** (POST /auth/2fa/setup) → returns QR code + secret
- **Process:** Generate TOTP secret (RFC 6238), store encrypted, send QR
- **Output:** QR code (otplib), user scans in authenticator app (Google Authenticator, Authy, etc)
- **Follow-up:** FR-AUTH-004 (verify TOTP on login)
- **Status:** ✅ Available
- **Acceptance criteria:**
  - QR code generated correctly (standard TOTP format)
  - User can verify 6-digit code from authenticator app
  - Backup codes generated (10 codes, store encrypted)

#### FR-AUTH-004: Login with 2FA Verification
- **Requirement:** If 2FA enabled, prompt for TOTP after password verification
- **Input:** email, password (valid) → 2FA prompt → 6-digit TOTP code
- **Process:** Validate TOTP code (30 sec window), throttle (3 attempts / 5min)
- **Output:** Access JWT + Refresh JWT (on valid TOTP)
- **Status:** ✅ Available
- **Acceptance criteria:**
  - TOTP code required if 2FA enabled
  - Code valid for ±30 seconds (one-time use)
  - Backup code (8-digit) accepted as fallback

#### FR-AUTH-005: Google OAuth Login
- **Requirement:** User can login via Google OAuth (idP-initiated)
- **Input:** Google authorization code
- **Process:** Exchange code for ID token, auto-create/link User if new
- **Output:** Access JWT + Refresh JWT
- **Status:** ✅ Available
- **Activation:** Requires Google Console credentials (prod conditional)
- **Acceptance criteria:**
  - OAuth flow completes <3 sec
  - User created with email from Google account
  - Existing user linked if email matches

#### FR-AUTH-006: Password Reset
- **Requirement:** User can reset forgotten password
- **Input:** email
- **Process:** Send password reset link (24h expiry), no email confirmation required
- **Output:** Reset link sent, user clicks → password input form
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Reset link single-use, 24h expiry
  - Password meets complexity rules
  - Old password not required for reset

#### FR-AUTH-007: Token Refresh
- **Requirement:** Client can refresh access token via refresh token
- **Input:** Refresh JWT (in httpOnly cookie)
- **Process:** Validate refresh token, issue new access JWT + new refresh JWT (rotation)
- **Output:** New access + refresh JWTs
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Refresh token rotated on every use
  - Old refresh token invalidated
  - Failed refresh returns 401 (force re-login)

#### FR-AUTH-008: Logout
- **Requirement:** User can logout (invalidate tokens)
- **Input:** (POST /auth/logout)
- **Process:** Blacklist refresh token (add to Redis)
- **Output:** HTTP 200, user session cleared
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Refresh token added to blacklist (24h TTL)
  - Blacklisted token rejected on subsequent use

---

### 1.2 Multi-Tenancy (Tenants Module)

#### FR-TENANT-001: Tenant Provisioning
- **Requirement:** System shall provision new tenant (company) on user registration
- **Input:** company name, industry vertical (optional)
- **Process:** Create Tenant record, initialize default COA (chart of accounts), seed demo data
- **Output:** Tenant ID, default settings, seeded GL
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Tenant created synchronously with user registration
  - COA seeded based on industry vertical (or default SAK-EP)
  - Tenant ID immutable

#### FR-TENANT-002: Subscription Plan Management
- **Requirement:** System shall manage tenant subscription (tier, module access, quota)
- **Input:** (Admin UI) plan selection (Free/Starter/Professional/Enterprise)
- **Process:** Update Tenant.plan, enforce module access, enforce user seat limit
- **Output:** Plan active, quota visible on billing page
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Plan change effective immediately (or at period end)
  - Users exceeding plan limit (seats) get warning → block on next login
  - Downgrade removes access to higher-tier modules gracefully

#### FR-TENANT-003: Quota Enforcement
- **Requirement:** System shall enforce per-tenant quotas (seats, data storage, API calls)
- **Input:** Tenant plan, quota limits
- **Process:** Check quota before action (e.g., invite user, create report)
- **Output:** Block action with reason, or allow
- **Status:** ✅ Available
- **Acceptance criteria:**
  - User invitation blocked if seat limit reached
  - Storage quota checked on document upload
  - API quota checked on 1000th request/hour (rate limit)

#### FR-TENANT-004: Tenant Data Isolation
- **Requirement:** System shall isolate data per tenant (no cross-tenant leakage)
- **Input:** Query with tenant context from JWT
- **Process:** Inject `tenantId` filter on all queries (interceptor-level)
- **Output:** Only tenant's data returned
- **Status:** ✅ Available
- **Acceptance criteria:**
  - No query returns cross-tenant data
  - Interceptor enforces filter before repo access
  - Integration tests verify isolation per module

---

### 1.3 Finance Module

#### FR-FIN-001: Chart of Accounts (COA)
- **Requirement:** System shall support configurable COA per SAK-EP (Indonesia GAAP)
- **Input:** Account creation → account code (4–6 digits), name, type (Asset/Liability/Equity/Revenue/Expense), category
- **Process:** Validate unique account code per tenant, validate type mapping
- **Output:** Account record created, available in GL
- **Status:** ✅ Available
- **Acceptance criteria:**
  - COA follows SAK-EP structure (10 standard accounts minimum)
  - Account code unique per tenant + fiscal year
  - Account type enforces debit/credit logic in GL posting

#### FR-FIN-002: General Ledger (GL) Posting
- **Requirement:** System shall record GL entries (debit/credit) from sales, purchases, HR, manufacturing
- **Input:** GL entry request (date, account_debit, account_credit, amount, description, reference module)
- **Process:** Validate debit = credit, validate account type, post to GL_Entry table
- **Output:** GL entry recorded, async event published (for downstream audit)
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Debit must equal credit (double-entry validation)
  - Posting date cannot be in future (or within closed period)
  - GL entry immutable (no edit; only reverse via new entry)

#### FR-FIN-003: Period Close
- **Requirement:** System shall close fiscal period (month/quarter/year) preventing new GL entries
- **Input:** (Admin UI) select period end date
- **Process:** Mark period as closed, validation block GL posts to closed period, carry forward balances
- **Output:** Period closed, trial balance locked
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Closed period prevents GL posting (HTTP 400)
  - Reopening period allowed (audit trail recorded)
  - Balances carry forward to next period correctly

#### FR-FIN-004: Accounts Payable (AP) Management
- **Requirement:** System shall manage vendor invoices, payments, aging
- **Input:** PO receipt → create AP invoice (vendor, amount, due date, terms)
- **Process:** Post AP liability GL, create payment schedule
- **Output:** Invoice tracked, aging report available
- **Status:** ✅ Available
- **Acceptance criteria:**
  - AP invoice creates GL liability entry (credit)
  - Payment reduces AP balance + creates cash GL entry (debit)
  - Aging report shows overdue invoices (>30/60/90 days)

#### FR-FIN-005: Accounts Receivable (AR) Management
- **Requirement:** System shall manage customer invoices, receipts, aging
- **Input:** Sales order confirm → create AR invoice (customer, amount, due date, terms)
- **Process:** Post AR asset GL, create payment schedule, track receipts
- **Output:** Invoice tracked, aging report available, revenue recognized
- **Status:** ✅ Available
- **Acceptance criteria:**
  - AR invoice creates GL asset entry (debit)
  - Payment reduces AR balance + creates cash GL entry (credit)
  - Aging report shows overdue invoices

#### FR-FIN-006: Bank Reconciliation
- **Requirement:** System shall support 3-way bank reconciliation (bank stmt ↔ GL cash ↔ AP/AR cleared)
- **Input:** Bank statement (download CSV), match GL entries
- **Process:** Auto-match by date/amount, flag unmatched, resolve discrepancies
- **Output:** Reconciliation status (cleared/unmatched), variance report
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Bank balance = GL cash balance (after reconciliation)
  - Unmatched items flagged for investigation
  - Reconciliation history immutable

#### FR-FIN-007: Financial Statements (BS/P&L/CF)
- **Requirement:** System shall generate Balance Sheet, Profit & Loss, Cash Flow statements (SAK-EP format)
- **Input:** Period selection (month/quarter/year)
- **Process:** Query GL trial balance, calculate subtotals, format per SAK-EP
- **Output:** Statements in PDF (printable), Excel, API JSON
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Balance Sheet: Assets = Liabilities + Equity
  - P&L: Revenue - Expenses = Net Income
  - Cash Flow: Opening balance + inflows - outflows = closing
  - Comparative (YoY, YTD) available

#### FR-FIN-008: Multi-Currency GL
- **Requirement:** System shall support multi-currency GL posting (IDR primary, others secondary)
- **Input:** GL entry in foreign currency (USD, SGD, etc) + FX rate
- **Process:** Post in foreign currency + converted to IDR (at historical rate)
- **Output:** GL entry dual-currency, FX gain/loss calculated end-of-month
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Conversion rate applied per posting date
  - Conversion tracked for FX audit trail
  - Monthly FX settlement (gain/loss) posted to GL

#### FR-FIN-009: e-Faktur Export (Indonesia Tax)
- **Requirement:** System shall export AR invoices in e-Faktur XML format (KEMENKEU spec)
- **Input:** AR invoice list (date range), company NPWP
- **Process:** Serialize to e-Faktur XML (namespace: `urn:ebappg:formats:schema:efattura:v2.02`)
- **Output:** XML file download, validation checksum
- **Status:** ✅ Available
- **Acceptance criteria:**
  - XML validates against KEMENKEU XSD schema
  - Checksum correct (SHA256)
  - File uploadable to e-Faktur portal

#### FR-FIN-010: Intercompany Settlement
- **Requirement:** System shall support intercompany transactions (one entity sells to another in same tenant)
- **Input:** Intercompany order (entity A → entity B)
- **Process:** GL entries: A posts AR (debit A receivable), B posts AP (credit B payable), net settlement
- **Output:** Intercompany balance eliminable in consolidation
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Intercompany sale/purchase both recorded in GL
  - Settlement GL entry (credit A receivable, debit B payable)
  - No external AR/AP impact (internal only)

#### FR-FIN-011: Dunning (Late Payment Reminder Automation)
- **Requirement:** System shall auto-send dunning notices for overdue AR (1st, 2nd, 3rd notice escalation)
- **Input:** AR aging >30/60/90 days, email template
- **Process:** Scheduler cron (daily), send email to customer (notice 1 @ 30d, notice 2 @ 60d, notice 3 @ 90d)
- **Output:** Email sent, dunning log recorded
- **Status:** ✅ Available
- **Acceptance criteria:**
  - 1st dunning sent at >30 days overdue
  - 2nd dunning at >60 days (if not paid)
  - 3rd dunning at >90 days + escalate to manager
  - Dunning log visible in AR detail page

---

### 1.4 Sales Module

#### FR-SALES-001: Sales Order Creation
- **Requirement:** System shall allow creation of sales orders (items, quantity, unit price, total)
- **Input:** Customer selection, line items (product, qty, unit price), discount, tax
- **Process:** Calculate total (qty × price - discount + tax), validate customer credit limit
- **Output:** SO created, SO number assigned, SO status = Draft
- **Status:** ✅ Available
- **Acceptance criteria:**
  - SO number auto-generated (format: SO-YYYY-MM-NNNNN)
  - Customer credit limit checked (error if exceeded unless override)
  - Tax calculated per item (standard 10% PPN Indonesia)

#### FR-SALES-002: Sales Order Confirmation
- **Requirement:** System shall confirm SO (lock items, reserve inventory, trigger AR + GL posting)
- **Input:** SO ID, confirm action
- **Process:** Check inventory availability, create AR invoice, post GL (debit AR, credit revenue)
- **Output:** SO status = Confirmed, AR invoice created, GL entries posted
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Inventory reserved (reduce available qty)
  - AR invoice created synchronously
  - GL posting via event (async RabbitMQ)
  - Cannot confirm if inventory insufficient (error)

#### FR-SALES-003: Sales Quotation
- **Requirement:** System shall create quotations (non-binding quote for customer review)
- **Input:** Customer, line items, validity period (e.g., 30 days)
- **Process:** Calculate total, set expiry date, quote status = Active
- **Output:** Quote number assigned (format: QT-YYYY-MM-NNNNN), shareable link
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Quote can be converted to SO (one-click)
  - Quote expires after validity period (status = Expired)
  - Multiple quotes per customer allowed

#### FR-SALES-004: Credit Limit Management
- **Requirement:** System shall enforce per-customer credit limit (prevent SO over limit)
- **Input:** Customer record, credit limit (IDR)
- **Process:** Check customer's unpaid AR + open SO total vs limit
- **Output:** Allow/block SO confirmation based on credit check
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Credit limit = max open AR + open SO
  - SO rejected if would exceed limit (unless admin override)
  - Limit adjustable per customer (audit trail)

#### FR-SALES-005: Volume-Based Pricing
- **Requirement:** System shall support tiered pricing (qty 1–10 @ 100K, 11–50 @ 95K, 51+ @ 90K)
- **Input:** Product ID, quantity
- **Process:** Look up pricing tier based on quantity
- **Output:** Unit price determined, SO line total calculated
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Tier pricing applied automatically on SO creation
  - Quantity change updates tier (if threshold crossed)
  - Historical pricing preserved (versioned)

#### FR-SALES-006: Delivery Tracking
- **Requirement:** System shall track shipment status (Pending → Shipped → Delivered → Invoiced)
- **Input:** SO ID, shipping carrier (JNE, Sicepat), tracking number
- **Process:** Update SO status, fetch tracking data from carrier API (optional)
- **Output:** Tracking visible to customer (portal), status transitions logged
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Delivery status visible in customer portal
  - Carrier tracking link clickable (if API available)
  - AR invoice created post-delivery (not post-SO confirm)

---

### 1.5 Supply Chain Module

#### FR-SC-001: Product Master
- **Requirement:** System shall maintain product database (SKU, name, category, cost, selling price, unit)
- **Input:** Product creation (SKU, name, category, UOM, cost, selling price)
- **Process:** Validate SKU uniqueness, default unit = piece
- **Output:** Product record created, available in sales/procurement
- **Status:** ✅ Available
- **Acceptance criteria:**
  - SKU unique per tenant
  - Unit options: piece, box, carton, kg, liter, etc
  - Cost price vs selling price tracked separately

#### FR-SC-002: Warehouse Management
- **Requirement:** System shall track inventory across multiple warehouses (central, regional)
- **Input:** Warehouse creation (name, location, capacity)
- **Process:** Create warehouse record, enable inventory tracking per warehouse
- **Output:** Warehouse created, inventory by warehouse reportable
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Multiple warehouses per tenant supported
  - Inventory moves between warehouses (transfer orders)
  - Warehouse capacity limits (warning if exceeded)

#### FR-SC-003: Inventory Tracking
- **Requirement:** System shall track inventory levels (on-hand, reserved, available)
- **Input:** Goods receipt (PO), sales order, inventory transfer
- **Process:** Update inventory on-hand qty, calculate available (on-hand - reserved)
- **Output:** Real-time inventory visible (dashboard, reports)
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Inventory updated immediately on GR/SO/transfer
  - Available qty = on-hand - reserved
  - Low-stock alert (configurable threshold)

#### FR-SC-004: Purchase Order (PO)
- **Requirement:** System shall create and manage purchase orders (vendor, items, qty, unit price, total)
- **Input:** Vendor selection, line items, terms (delivery date, payment terms)
- **Process:** Calculate total, auto-assign PO number (PO-YYYY-MM-NNNNN)
- **Output:** PO created, status = Draft
- **Status:** ✅ Available
- **Acceptance criteria:**
  - PO number auto-generated
  - Delivery date can be in future
  - Payment terms tracked (COD, Net-30, etc)

#### FR-SC-005: Goods Receipt (GR)
- **Requirement:** System shall record goods receipt against PO (qty received, damage inspection)
- **Input:** PO ID, received qty, damaged qty, receipt notes
- **Process:** Update inventory (on-hand), create AP invoice (if not pre-invoiced), close PO if full receipt
- **Output:** GR recorded, inventory updated, AP created
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Received qty cannot exceed PO qty (error if over-receipt)
  - Damaged qty deducted (inventory loss recorded)
  - GR closes PO (if qty = PO qty)

#### FR-SC-006: MRP (Material Requirements Planning)
- **Requirement:** System shall calculate material requirements based on sales forecast + BOM
- **Input:** Sales forecast (monthly), BOM per product
- **Process:** Explode BOM, calculate gross requirements, net requirements (current inv), plan orders
- **Output:** Planned PO suggestions, buying plan
- **Status:** ✅ Available
- **Acceptance criteria:**
  - MRP considers lead times (vendor, internal)
  - Planned orders suggest quantity + date
  - Safety stock configurable per product

#### FR-SC-007: Barcode Scanning
- **Requirement:** System shall support barcode scanning (receive, pick, transfer) via mobile/tablet
- **Input:** Barcode (EAN-13, Code-128) scanned via device
- **Process:** Lookup product, update inventory (GR/pick/transfer), record timestamp
- **Output:** Inventory updated, scan log recorded
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Barcode lookup fast (<1 sec)
  - Invalid barcode shows error message
  - Scan log tamper-proof (immutable)

#### FR-SC-008: Inventory Transfer
- **Requirement:** System shall support inventory movement between warehouses
- **Input:** Transfer order (from warehouse, to warehouse, items, qty)
- **Process:** Reserve qty in from-warehouse, create transfer order, close on delivery to to-warehouse
- **Output:** Inventory updated in both warehouses
- **Status:** ✅ Available
- **Acceptance criteria:**
  - From-warehouse qty decreases, to-warehouse increases
  - In-transit inventory visible separately
  - Transfer order immutable (only close/reopen)

---

### 1.6 Manufacturing Module

#### FR-MFG-001: Bill of Materials (BOM)
- **Requirement:** System shall define BOM (component list + quantities per finished product)
- **Input:** Product (finished good), components (materials, sub-assemblies), qty per FG, unit
- **Process:** Create BOM record, version tracking (v1.0, v1.1 = ECN approved)
- **Output:** BOM stored, available for MO explosion + costing
- **Status:** ✅ Available
- **Acceptance criteria:**
  - BOM versioned (immutable history)
  - Multi-level BOM supported (sub-assemblies)
  - Component cost roll-up calculated per BOM version

#### FR-MFG-002: Manufacturing Order (MO)
- **Requirement:** System shall create MO (schedule production of finished good from BOM)
- **Input:** Product (finished good), qty, target completion date, BOM version
- **Process:** Explode BOM, reserve component inventory, assign to work center
- **Output:** MO created, component reservations made, MO status = Planned
- **Status:** ✅ Available
- **Acceptance criteria:**
  - MO number auto-generated (MO-YYYY-MM-NNNNN)
  - Component inventory reserved (unavailable for sales)
  - Cannot create MO if component inventory insufficient (unless override)

#### FR-MFG-003: Work Order Execution
- **Requirement:** System shall track MO execution (start, in-progress, complete)
- **Input:** MO ID, action (start, report progress, complete)
- **Process:** Update MO status, log timestamps, capture labor hours (if time tracking enabled)
- **Output:** MO progress visible, completion recorded
- **Status:** ✅ Available
- **Acceptance criteria:**
  - MO start records production start time
  - Progress updates trackable (% complete, labor hours)
  - MO completion updates inventory (add finished goods, consume components)

#### FR-MFG-004: Scrap Tracking
- **Requirement:** System shall record scrap/defect during production
- **Input:** MO ID, component SKU, scrap qty, reason
- **Process:** Create scrap entry, deduct from component inventory, calculate scrap %, log reason
- **Output:** Scrap recorded, inventory adjusted, scrap report available
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Scrap qty deducted from component inventory
  - Scrap reason tracked (quality, spillage, damage, etc)
  - Scrap % visible on MO report

#### FR-MFG-005: Capacity Planning
- **Requirement:** System shall check work center capacity before confirming MO
- **Input:** Work center, required hours (from MO), capacity available
- **Process:** Sum planned hours across all open MOs, check vs available capacity
- **Output:** Capacity check result (OK/Over-capacity)
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Over-capacity MO creation blocked (error message)
  - Capacity visible on work center dashboard
  - Lead time adjusted if over-capacity (push delivery date)

#### FR-MFG-006: Quality Control (QC)
- **Requirement:** System shall enforce QC inspection before MO completion
- **Input:** MO ID, inspection criteria (visual, dimensional, functional), pass/fail
- **Process:** Record QC check, block completion if failed, log QC data
- **Output:** QC record created, MO completion conditional
- **Status:** ✅ Available
- **Acceptance criteria:**
  - QC entry required before "Mark as Complete" action
  - Failed QC blocks inventory receipt (components not released)
  - QC history immutable

---

### 1.7 Human Resources (HR) Module

#### FR-HR-001: Employee Master
- **Requirement:** System shall maintain employee database (name, DOB, SSN, department, position, salary)
- **Input:** Employee creation (personal info, employment details)
- **Process:** Validate unique SSN/NPWP, assign employee ID (auto-generated)
- **Output:** Employee record created, available for payroll/attendance/leave
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Employee ID auto-generated (EMP-NNNNN)
  - PII encrypted (SSN, passport) in database
  - Employment history tracked (hire date, position changes)

#### FR-HR-002: Attendance Tracking
- **Requirement:** System shall track employee attendance (check-in, check-out, daily presence)
- **Input:** Employee ID, date, check-in time, check-out time
- **Process:** Calculate work hours (check-out - check-in), flag if <8h (late) or >10h (overtime)
- **Output:** Attendance record created, summary report available
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Attendance mandatory (default 8-hour day)
  - Late/early departure flagged (with reason)
  - Overtime hours calculated (>8h threshold)

#### FR-HR-003: Leave Management
- **Requirement:** System shall manage leave requests (annual, sick, unpaid) with approval workflow
- **Input:** Leave request (type, start date, end date, reason)
- **Process:** Check leave balance (annual = 12 days/year), submit for approval, approve/reject
- **Output:** Leave request created, approval forwarded to manager
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Leave balance tracked per employee per year (accrual-based)
  - Request requires manager approval (workflow)
  - Approved leave deducts from balance
  - Cannot take leave if balance insufficient

#### FR-HR-004: Payroll Processing (PPh 21 Compliance)
- **Requirement:** System shall process monthly payroll with Indonesia tax (PPh 21) calculation
- **Input:** Employee salary, deductions (insurance, tax), allowances (meal, transport)
- **Process:** Gross = salary + allowances, deductions = PPh 21 + insurance, Net = Gross - deductions
- **Output:** Payroll slip per employee, PPh 21 withholding tax calculated
- **Status:** ✅ Available
- **Acceptance criteria:**
  - PPh 21 tax calculated per KEMENKEU formula (tax brackets)
  - Payroll slip generated (printable)
  - Tax deposit scheduled (monthly to SKP account)
  - Payroll GL posting (salary expense, payable)

#### FR-HR-005: THR & Bonus Processing
- **Requirement:** System shall calculate and process THR (Tunjangan Hari Raya = Ramadan bonus) + annual bonus
- **Input:** Annual bonus %, THR formula (1 month salary × tenure / 12 months)
- **Process:** Calculate per employee, add to payroll, post GL
- **Output:** THR + bonus calculated, payroll updated
- **Status:** ✅ Available
- **Acceptance criteria:**
  - THR = 1 month salary (if tenure ≥ 12 months)
  - Bonus = salary × bonus % (annual)
  - Separate GL posting for THR/bonus (not base salary)

#### FR-HR-006: Recruitment ATS (Applicant Tracking System)
- **Requirement:** System shall track job openings, applications, interviews, hires
- **Input:** Job opening (title, description, department), candidate application (resume, email)
- **Process:** Pipeline stages (Applied → Screened → Interviewed → Offered → Hired)
- **Output:** Candidate tracked, stage visible, interview notes recorded
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Application imported from email (optional parser)
  - Interview scheduling (calendar integration planned)
  - Offer generation (template-based)
  - Hired candidate auto-creates Employee record

#### FR-HR-007: 360° Feedback (Performance Review)
- **Requirement:** System shall enable 360-degree feedback (self, manager, peers, direct reports)
- **Input:** Feedback form (questionnaire, rating scale 1–5), rater, ratee
- **Process:** Collect feedback from multiple raters, aggregate scores, generate summary
- **Output:** Feedback report (confidential), performance trend visible
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Multiple raters per employee (manager, 2–3 peers, direct reports)
  - Feedback anonymous (rater name not visible to ratee)
  - Scores aggregated (average, median)
  - Report generated quarterly

---

### 1.8 CRM Module

#### FR-CRM-001: Lead Management
- **Requirement:** System shall track sales leads (prospect contact, company, interest, qualification)
- **Input:** Lead creation (name, email, company, contact info, source)
- **Process:** Assign to sales rep, set follow-up date, track interactions (calls, emails)
- **Output:** Lead record created, pipeline visible
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Lead source tracked (website, referral, event, cold call)
  - Lead qualification score (hot/warm/cold)
  - Auto-assignment to sales rep (round-robin or rule-based)

#### FR-CRM-002: Opportunity Pipeline
- **Requirement:** System shall track sales opportunities (qualified leads + deal value + stage)
- **Input:** Opportunity creation (prospect, deal value, expected close date, stage)
- **Process:** Move through stages (Qualification → Proposal → Negotiation → Won/Lost), track probability
- **Output:** Pipeline value visible (total open opportunities)
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Probability per stage (50% Proposal, 75% Negotiation, 95% Closing)
  - Revenue forecast based on opportunity value × probability
  - Lost opportunities tracked (reason for loss)

#### FR-CRM-003: Communication History
- **Requirement:** System shall track all communications (calls, emails, meetings) per lead/opportunity
- **Input:** Communication log (type, date, notes, outcome, next action)
- **Process:** Store chronologically, link to lead/opportunity, search full-text
- **Output:** Communication thread visible (lead/opp detail page)
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Email forwarding to CRM (capture from SMTP logs)
  - Call notes logged manually (no phone integration)
  - Meeting notes attached (supports document linking)
  - Searchable by keyword

---

### 1.9 Reporting & BI Module

#### FR-REP-001: Custom Reports
- **Requirement:** System shall allow creation of custom reports (SQL queries, filtering, grouping, sorting)
- **Input:** Report builder (table selection, column selection, filters, grouping, sorting)
- **Process:** Generate SQL, execute query, return result set
- **Output:** Report display (table, paginated), export to Excel/PDF
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Drag-drop column selection (no SQL required)
  - Filter builder (visual condition builder: field = value)
  - Grouping by multiple columns
  - Export to Excel/PDF on-demand

#### FR-REP-002: Report Builder (UI)
- **Requirement:** System shall provide visual report builder (drag-drop, no coding)
- **Input:** Available tables/fields, filter conditions, grouping, sorting
- **Process:** Generate report query, execute, cache result
- **Output:** Report displayed, reusable report definition saved
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Available fields listed per table
  - Joins supported (GL ↔ Journal Entry)
  - Filter UI (dropdown, text input, date range)
  - Report saved with version control

#### FR-REP-003: Dashboard Builder
- **Requirement:** System shall allow creation of custom dashboards (widgets: numbers, charts, tables)
- **Input:** Widget palette (card, bar chart, line chart, table), data binding
- **Process:** Drag widgets onto canvas, bind to report data, save dashboard
- **Output:** Dashboard display (real-time or 5-min refresh), shareable link
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Widgets: KPI card, bar chart, line chart, table, pie chart
  - Real-time data update (refresh interval configurable)
  - Dashboard sharing (read-only link)
  - Responsive layout (desktop, tablet, mobile)

#### FR-REP-004: KPI Alerts
- **Requirement:** System shall send alerts when KPI crosses threshold (e.g., revenue <target, AR aging >90d)
- **Input:** KPI definition (metric, threshold, condition, alert recipient)
- **Process:** Scheduler evaluates KPI hourly, compares to threshold, send email/notification if breached
- **Output:** Alert logged, email sent to recipient
- **Status:** ✅ Available
- **Acceptance criteria:**
  - KPI evaluated hourly (configurable interval)
  - Alert sent once per breach (no spam)
  - Alert includes snapshot data + context
  - Alert history visible (dashboard)

#### FR-REP-005: OLAP Analytics
- **Requirement:** System shall support OLAP queries (dimension reduction, aggregation, drill-down)
- **Input:** Fact table (GL entries), dimensions (account, period, department), measures (amount)
- **Process:** Build fact table in memory, execute OLAP query (Sum, Average, Count), cache results
- **Output:** Pivot table (interactive), drill-down to detail
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Dimensions selectable (account, period, vendor, project)
  - Measures calculated (sum, average, count)
  - Drill-down: click number → detail rows
  - Export pivot table to Excel

---

### 1.10 Workflow & Approval Engine

#### FR-WF-001: Approval Workflow Definition
- **Requirement:** System shall allow definition of approval workflows (multi-stage, multi-approver)
- **Input:** Workflow definition (name, stages, approvers per stage, conditions)
- **Process:** Define workflow (e.g., PO approval: Manager → Finance → Director), store template
- **Output:** Workflow template created, available for process instantiation
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Stages sequential (stage 1 → stage 2 → ...)
  - Approvers per stage (one or multiple)
  - Conditions: route based on amount (PO < 10M → Manager only, > 50M → Director)

#### FR-WF-002: Workflow Inbox
- **Requirement:** System shall display inbox of approval tasks (pending approvals) for user
- **Input:** Workflow instance assigned to user
- **Process:** Query pending tasks for user, display with summary (object type, amount, requester, due date)
- **Output:** Inbox list (paginated), click to detail → approve/reject
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Inbox shows pending items only (not completed)
  - Sort by due date (overdue first)
  - Bulk actions (approve multiple items)

#### FR-WF-003: SLA Management
- **Requirement:** System shall enforce SLA (Service Level Agreement) for approval tasks
- **Input:** SLA rule (task type, approval deadline, escalation)
- **Process:** Track elapsed time, notify if approaching SLA, escalate if breached
- **Output:** SLA status visible, escalation logged
- **Status:** ✅ Available
- **Acceptance criteria:**
  - SLA deadline per task type (e.g., PO approval 2 days)
  - Warning notification 1 day before deadline
  - Automatic escalation to manager if overdue
  - SLA breach report available

#### FR-WF-004: Workflow Reorder
- **Requirement:** System shall reorder items within workflow queue (prioritization)
- **Input:** Workflow instance, reorder action (move to top)
- **Process:** Change item priority in queue, new priority persisted
- **Output:** Item moved in inbox (top of list)
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Reorder via drag-drop or priority dropdown
  - History recorded (who reordered, when)

---

### 1.11 Integrations

#### FR-INT-001: Stripe Payment Integration
- **Requirement:** System shall integrate Stripe for payment processing (checkout, invoicing)
- **Input:** Payment amount, customer email, return URL
- **Process:** Create Stripe session, redirect to Stripe checkout, handle callback (webhook), update subscription
- **Output:** Payment captured, subscription activated
- **Status:** ✅ Available (conditional: live Stripe key required)
- **Acceptance criteria:**
  - Checkout flow <2 sec redirect
  - Payment success webhook updates billing DB
  - Failed payment retry logic

#### FR-INT-002: Slack Notifications
- **Requirement:** System shall send critical alerts to Slack (approval pending, SLA breach, errors)
- **Input:** Slack channel, webhook URL, message template
- **Process:** Format alert message, POST to Slack webhook
- **Output:** Message appears in Slack channel
- **Status:** ✅ Available (conditional: Slack app token required)
- **Acceptance criteria:**
  - Approval pending → Slack notification with approve button
  - SLA breach → warning message
  - Error logs aggregated in #errors channel

#### FR-INT-003: Shopify Sync
- **Requirement:** System shall sync Shopify orders into dnCore (create SO)
- **Input:** Shopify order (webhook: order.paid)
- **Process:** Listen to webhook, parse order data, create SO in dnCore, update Shopify order with SO#
- **Output:** SO created, Shopify order status updated
- **Status:** 🟡 Conditional (requires Shopify API key)
- **Acceptance criteria:**
  - Order imported within 1 min of payment
  - SO number visible in Shopify order notes
  - Sync log tracks all imports

#### FR-INT-004: JNE / Sicepat Shipping Integration
- **Requirement:** System shall integrate shipping carriers (generate labels, fetch tracking)
- **Input:** SO ID, shipping address
- **Process:** Call carrier API (JNE/Sicepat), generate shipping label, assign tracking number
- **Output:** Label PDF (printable), tracking number recorded, SO updated
- **Status:** 🟡 Conditional (requires carrier API key)
- **Acceptance criteria:**
  - Label generated within 5 sec
  - Tracking number linked to SO
  - Customer can track shipment (portal)

---

### 1.12 Portal (Customer/Vendor Self-Service)

#### FR-PORTAL-001: Portal Login
- **Requirement:** Portal users (vendors, customers) can login via separate JWT
- **Input:** email (must have @company.id domain), password
- **Process:** Authenticate against Portal user table, issue Portal JWT
- **Output:** Portal JWT (separate from main app), user in portal context
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Portal login isolated (separate user table)
  - Portal JWT different from main app JWT

#### FR-PORTAL-002: Customer Portal
- **Requirement:** Customers can view invoices, payments, statements, create support tickets
- **Input:** Portal access (account email verified)
- **Process:** Display AR invoices (read-only), payment history, account statement
- **Output:** Invoice list (filterable by date), detail view (downloadable PDF)
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Only own invoices visible (multi-tenant isolation)
  - Statement generation (30/60/90 days aging)
  - Ticket creation (issue tracking)

#### FR-PORTAL-003: Vendor Portal
- **Requirement:** Vendors can view POs, upload invoices, view payment status
- **Input:** Portal access, vendor account
- **Process:** Display POs (read-only), AP invoices, payment records
- **Output:** PO list (linked to SO), invoice upload form, payment history
- **Status:** ✅ Available
- **Acceptance criteria:**
  - Vendor sees only own POs
  - Invoice upload (PDF accepted, stored in S3)
  - Payment status visible (paid / pending)

---

## 2. Non-Functional Requirements

### 2.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **API response time (P95)** | <500ms | Measured via Prometheus (request_duration) |
| **API response time (P99)** | <1s | Peak load (1000 RPS) |
| **DB query P95** | <100ms | Indexed queries only |
| **Page load time (FCP)** | <1.5s | Measured via lighthouse (Vite build) |
| **Large report generation** | <5s (10K rows) | Cached or OLAP acceleration |
| **Barcode scan processing** | <1s | Lookup + inventory update |
| **Concurrent users supported** | 100 per tenant | K8s HPA scales to 10 pods × 20 connections = 200 |

### 2.2 Scalability

| Dimension | Capacity | Strategy |
|-----------|----------|----------|
| **Tenants (customers)** | Unlimited | Row-level isolation, sharding Phase 7 |
| **Users per tenant** | 5000 | Seat limit by plan (free=10, starter=500, pro=2000) |
| **Data size per tenant** | 100GB (GL entries, documents) | Archival Phase 6 (move old GL to cold storage) |
| **API RPS** | 10K (peak 1000 per tenant) | K8s HPA, load balancer |
| **Concurrent connections** | 10K | DB connection pooling, Redis cluster |
| **Storage (S3)** | 1PB | Unlimited (pay-per-GB) |

### 2.3 Availability & Reliability

| Requirement | Target | Mechanism |
|-------------|--------|-----------|
| **Uptime** | 99.5% | K8s auto-restart, health probes, multi-AZ RDS |
| **MTTR (Mean Time To Recover)** | <30 min | Automated rollback, blue-green deployment |
| **MTBF (Mean Time Between Failures)** | >720h (30 days) | Graceful shutdown, circuit breaker patterns |
| **Data loss** | Zero | RDS automated backups (hourly), WAL replication |
| **Backup restore time** | <1h | RDS restore-from-snapshot |

### 2.4 Security

| Requirement | Standard | Implementation |
|-------------|----------|-----------------|
| **Transport security** | TLS 1.3 | HTTPS only, Helmet, CORS restricted |
| **Authentication** | JWT + TOTP | httpOnly cookies, refresh rotation, 2FA optional |
| **Authorization** | RBAC + tenant isolation | Guard decorators, tenant interceptor |
| **Data encryption** | AES-256 (at-rest), TLS (in-transit) | AWS KMS, Secrets Manager |
| **PII protection** | Encrypted storage | Database-level encryption for SSN, passport |
| **Audit trail** | Immutable log | audit_log table (append-only) |
| **SQL injection** | Parameterized queries | TypeORM (no string concatenation) |
| **XSS protection** | CSP headers | Helmet CSP policy, React escaping |
| **CSRF** | SameSite cookie, CSRF token | Automatic via httpOnly + SameSite=Strict |
| **Rate limiting** | 100 req/min per user | @nestjs/throttler, Redis store |
| **Account lockout** | 5 failed logins = 30 min lockout | Database flag + TTL |

### 2.5 Compliance & Regulatory

| Requirement | Standard | Scope | Status |
|-------------|----------|-------|--------|
| **e-Faktur export** | KEMENKEU spec | AR invoices → XML | ✅ Available |
| **PPh 21 tax calculation** | Tax brackets (KEMENKEU 2024) | Employee payroll | ✅ Available |
| **SAK-EP reporting** | Indonesia GAAP | Financial statements | ✅ Available |
| **GDPR data export** | GDPR Article 15 | All user data + audit trail | ✅ Available |
| **GDPR data erasure** | GDPR Article 17 | Soft delete + anonymization | ✅ Available |
| **Data retention** | Industry standard 7 years | Archive GL, compliance module | ✅ Available |
| **Audit trail immutability** | Non-repudiation | Append-only, hash verification | ✅ Available |
| **SOC 2 Type II** | Annual third-party audit | Control environment, risk management | 📋 Roadmap (Phase 8) |

### 2.6 Usability & Accessibility

| Requirement | Standard | Implementation |
|-------------|----------|-----------------|
| **Responsive design** | WCAG 2.1 AA | MUI components, tested on mobile/tablet/desktop |
| **Keyboard navigation** | WCAG 2.1 AA | Tab order, arrow keys, enter to submit |
| **Contrast ratio** | WCAG 2.1 AA (4.5:1 text) | MUI color tokens, enforced via design system |
| **Localization** | 15 locales | React context i18n, RTL support for Arabic |
| **Offline support** | MVP only | Phase 6: IndexedDB cache for Expo |
| **Mobile responsiveness** | <600px width | Tailwind responsive (sm, md, lg breakpoints) |

### 2.7 Maintainability

| Requirement | Target | Mechanism |
|-------------|--------|-----------|
| **Code coverage** | ≥60% | Jest unit tests, CI gate blocks <60% |
| **Cyclomatic complexity** | <10 per function | ESLint rule (max-statements: 30) |
| **Test execution time** | <5 min (unit + integration) | Parallel jest workers, pg-mem (no DB setup) |
| **Documentation** | Up-to-date | Markdown in repo, Swagger API docs |
| **Dependency updates** | Quarterly | Dependabot, automated PRs |

---

## 3. Constraints & Dependencies

### 3.1 Technical Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| **PostgreSQL 15 only** | No MySQL/Oracle support | Evaluate Phase 7 |
| **NestJS monolith** | Scaling limited by single codebase | Microservices split Phase 7 |
| **Node.js 20 LTS** | EOL Apr 2026 (end of support) | Plan upgrade to Node 22 LTS in Q1 2027 |
| **TypeORM migration tooling** | No UI-based migration (only CLI) | Phase 6: migration UI builder |
| **Elasticsearch optional** | Fulltext search fallback to ILIKE | Fallback to LIKE for dev/small deployments |

### 3.2 Business Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| **AWS credentials required** | Production live blocked | Secure setup end-Aug 2026 |
| **Stripe live keys** | Payment processing conditional | Partner onboarding, fallback to manual invoicing |
| **Email SMTP setup** | Transactional emails conditional | sendgrid/AWS SES, fallback to console logging (dev) |
| **i18n full translation** | 13 locales EN fallback only | Professional translation Q1 2027 |
| **Mobile App Store submission** | iOS/Android distribution blocked | EAS profiles ready, submission Phase 6 |

### 3.3 Integration Dependencies

| Dependency | Purpose | Status | Activation |
|-----------|---------|--------|------------|
| **Google OAuth credentials** | SSO login | Ready (dev) | Prod key required |
| **Slack app token** | Notifications | Ready (scaffold) | Slack workspace setup |
| **Shopify API key** | Order sync | Scaffold | Partner account |
| **JNE / Sicepat API** | Shipping labels | Scaffold | Carrier account + API key |
| **DocuSign / Qualified** | e-signature | Stub only | Phase 6 integration |

---

## 4. Data Requirements

### 4.1 Data Volume Estimates

| Entity | Records (Year 1) | Growth/month | Notes |
|--------|------------------|--------------|-------|
| **Users** | 5000 | 500 | Across 50 companies |
| **GL Entries** | 50K | 5K | ~1000/company/month |
| **AR Invoices** | 10K | 1K | SME typical |
| **Employees** | 2500 | 250 | 50 employees × 50 companies |
| **Documents (S3)** | 10K files | 1K/month | Average 2MB per file = 20GB |
| **Audit logs** | 1M entries | 100K/month | Immutable, never deleted |

### 4.2 Database Schema (Entity Relationship)

**Major entities:**
- **Users** ← → Tenants, Roles, Sessions
- **Tenants** → Subscriptions, COA, Settings
- **Chart of Accounts (COA)** → Journal Entries, GL entries
- **Customers** → AR Invoices, SO, Credit limit
- **Vendors** → AP Invoices, PO
- **Products** → SO line items, PO line items, BOM
- **Employees** → Payroll, Leave, Attendance
- **Manufacturing Order** → BOM, Components, Scrap

**Schema size (PostgreSQL):** ~200 tables (83 core + audit + cache tables)

---

## 5. Integration Requirements

### 5.1 API Contracts

**All APIs:**
- Prefix: `/api/v1`
- Content-type: `application/json`
- Response wrapper: `{ success: boolean, data: T, timestamp: ISO8601, meta?: {}, errors?: [] }`

**Example:**
```json
GET /api/v1/finance/gl-entries?tenantId=X&skip=0&limit=20

Response:
{
  "success": true,
  "data": [
    { "id": "GLX001", "date": "2026-07-19", "account": "1100", "debit": 1000000, "credit": 0 }
  ],
  "meta": { "total": 50000, "page": 1 }
}
```

### 5.2 Webhook Events (Outbound)

**Planned Phase 5–6:**
- `sales.order.confirmed`
- `purchase.order.created`
- `invoice.paid`
- `gl.entry.posted`
- `workflow.approved`

**Webhook payload format:**
```json
{
  "event": "sales.order.confirmed",
  "timestamp": "2026-07-19T10:30:00Z",
  "tenantId": "X",
  "data": { "soId": "SO-2026-07-0001", "amount": 5000000 },
  "signature": "HMAC-SHA256(payload, secret)"
}
```

---

## 6. Acceptance Criteria (End-to-End)

### Phase 5: Go-Live

**Deployment acceptance:**
- [ ] AWS EKS cluster up (3 nodes, auto-scaling 3–10)
- [ ] RDS PostgreSQL 15 Multi-AZ live
- [ ] Frontend SPA deployed to CloudFront
- [ ] API endpoints responding (<200ms P95)
- [ ] Database migrations applied (0005–0013)
- [ ] Backup automated (hourly snapshots)
- [ ] Monitoring active (Prometheus + Grafana)

**Functional acceptance:**
- [ ] 5+ pilot customers onboarded (different verticals)
- [ ] GL posting tested (sample data; debit=credit verified)
- [ ] AR/AP invoice creation working
- [ ] Payroll PPh 21 calculation correct (tax samples)
- [ ] e-Faktur export generating valid XML
- [ ] Workflow approvals (PO 10M threshold) working
- [ ] Email notifications sending (Slack + email)

**Security acceptance:**
- [ ] SSL/TLS verified (HTTPS only)
- [ ] 2FA tested (TOTP code valid)
- [ ] Audit log immutable (tested via direct DB insert prevention)
- [ ] Tenant isolation verified (no cross-tenant data leak)
- [ ] Rate limiting active (100 req/min per user)

**Performance acceptance:**
- [ ] API P95 <500ms under 100 concurrent users
- [ ] GL query (trial balance) <2s (10K entries)
- [ ] Report generation (10K rows) <5s
- [ ] Database connection pool stable (<20 connections)

---

## 7. Changelog

| Version | Date | Changes |
|---------|------|---------|
| **1.0** | 19 Jul 2026 | Initial SRS — Phase 0–4 functional requirements, NFRs, constraints, data requirements, acceptance criteria |

---

**Owner:** Dozer (CEO + Tech Lead) · PT. Dozer Napitupulu Technology  
**Last Updated:** 19 July 2026  
**Next Review:** Phase 5 UAT (target Sep 2026)  

---

*Dokumen ini adalah kontrak teknis antara product dan engineering. Perubahan requirements harus disetujui via PRD update.*
