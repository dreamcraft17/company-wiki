# dnAccounting Product Requirements Document (PRD)
**Version:** 1.0  
**Date:** August 2026  
**Author:** Dozer Fernando Saroha Daniel Napitupulu  
**Status:** Ready for Implementation  

---

## 1. EXECUTIVE SUMMARY

**Produk:** dnAccounting - Cloud-based accounting software untuk SME Indonesia  
**Target Market:** UKM dengan revenue Rp 1M-20M/tahun, frustasi dengan Accurate's limited features + high multi-user cost  
**MVP Launch:** Q4 2026 (16 minggu development)  
**Revenue Model:** Freemium SaaS (Starter free, Growth/Pro/Plus tiers)  
**Key Diferensiator:** 65% lebih murah dari Accurate, mobile-first, AI automation (roadmap), industry templates

---

## 2. MARKET OPPORTUNITY

### Market Size
- **Total addressable market (TAM):** ~400k SME di Indonesia yang butuh cloud accounting
- **Serviceable addressable market (SAM):** ~50k SME ready to migrate dari Excel/Accurate
- **Target Y1 market share:** 2.5% = 1250 users = Rp 300M+ ARR

### Competitive Positioning
| Faktor | Accurate | Business Central | Mekari Jurnal | **dnAccounting** |
|--------|----------|------------------|---------------|-----------------|
| Harga (1 user) | Rp 333k | $70/user (Rp 1.1M) | Rp 200k | **Rp 199k** |
| Harga (3 user) | Rp 999k | Rp 3.3M | Rp 600k | **Rp 199k** |
| Inventory costing | Tidak ada | Ada | Tidak ada | **FIFO/FEFO/AVCO** |
| Mobile app | Limited | No | Web only | **Native mobile** |
| Tax automation | Manual config | Manual config | Manual config | **Guided wizard** |
| Speed-to-value | 2-3 hari | 1-2 bulan | 1 hari | **15 menit** |

---

## 3. PRODUCT VISION & GOALS

### Vision Statement
**"Akuntansi yang lebih cepat, lebih smart, lebih murah. Dari start-up hingga Rp 50M revenue."**

### OKRs (Year 1)
1. **User Growth:** 1000+ paid users (Rp 300M+ ARR)
2. **Product Quality:** 4.5+ star rating (G2/ProductHunt), <1% churn
3. **Margin:** 70%+ gross margin by month 12
4. **Ecosystem:** 5+ integrations live (POS, bank, e-commerce, payment gateway, expense tracker)

---

## 4. USER PERSONAS

### Persona 1: Budi - Pemilik Toko Retail
- **Age:** 35 | **Business Size:** Rp 2-5M/bulan | **Employees:** 3-5
- **Pain points:** 
  - Accounting di Excel, sering error
  - Tidak tahu gross margin per produk
  - Pajak bulanan stressful (takut denda)
  - Harus bayar akuntan Rp 500k/bulan tapi lambat
- **Budget:** Mau bayar Rp 200-300k/bulan, bukan Rp 500k+
- **Tech savviness:** Medium (bisa e-banking, Tokopedia seller center)

### Persona 2: Siti - Accounting Manager (F&B)
- **Age:** 28 | **Business Size:** Rp 10-50M/tahun | **Employees:** 15+
- **Pain points:**
  - Pakai Accurate tapi inventory tracking jelek
  - COGS calculation manual, sering salah
  - Multi-location approval workflow ribet
  - PPN/PPh configuration confusing
- **Budget:** Rp 500k-1M/bulan (willing to upgrade dari Accurate)
- **Tech savviness:** High (SQL, Excel formulas, system integration)

### Persona 3: Rina - Freelance Accountant
- **Age:** 32 | **Handles:** 10-15 SME clients
- **Pain points:**
  - Setiap klien setup chart of accounts manual (repetitive)
  - Waiting for client invoices/payments tracking manual
  - Closing period manual checking semua GL accounts
  - Tax filing preparation butuh 2-3 hari per klien
- **Budget:** Bayar Rp 1-2M/bulan untuk software yang scale dengan banyak klien
- **Tech savviness:** Very high (Excel power user, sistem integration)

---

## 5. MVP SCOPE (Weeks 1-16)

### Must-Have (Launch V1.0)
#### Core Accounting Module
- [ ] Chart of accounts (COA) setup with templates
- [ ] Journal entry + batch posting
- [ ] General ledger (GL) view + filter
- [ ] Automatic posting rules (e.g., sales invoice auto-GL post)
- [ ] Trial balance + balance sheet + P&L report (real-time)
- [ ] Cash flow statement (basic)

#### Accounts Receivable (AR)
- [ ] Invoice creation + batch generate
- [ ] Customer master + aging report
- [ ] Payment tracking (received, partial, overdue)
- [ ] Auto-reminder email for overdue invoices
- [ ] AR aging analysis (0-30d, 30-60d, 60+ days)

#### Accounts Payable (AP)
- [ ] Bill creation + tracking
- [ ] Vendor master + payment scheduling
- [ ] Bill approval workflow (1-3 level approvers)
- [ ] Payment reconciliation (manual mark-paid)
- [ ] AP aging report + payment forecast

#### Inventory (Basic - Quantity Only)
- [ ] Stock master (item master)
- [ ] Stock in/out transactions
- [ ] Stock valuation (inventory asset GL entry)
- [ ] Stock aging report
- [ ] Low-stock alert

#### Tax Compliance (Indonesia)
- [ ] PPN 11% auto-calculation (on purchase/sales)
- [ ] PPh 23 (vendor withholding) auto-calculate
- [ ] e-Faktur export (SPT masa format)
- [ ] Tax summary report (monthly)
- [ ] Compliance checklist (monthly/quarterly/annual)

#### User & Security
- [ ] Multi-user support (up to tier limit)
- [ ] Role-based access control (Admin, Accountant, Manager, Viewer)
- [ ] Approval workflow (2-3 level approval for transactions)
- [ ] Audit log (who changed what, when)
- [ ] Email notifications (approval request, payment reminder, report ready)

#### Reporting
- [ ] Standard financial reports (P&L, balance sheet, trial balance, CF)
- [ ] Custom date range + department filter
- [ ] PDF export + email scheduled report
- [ ] Budget vs actual (if budget set)

#### Data Import/Export
- [ ] Import chart of accounts from Excel template
- [ ] Import opening balances (customer list, vendor list, GL balances)
- [ ] Export transactions to Excel
- [ ] Export to e-Faktur format

---

### Should-Have (V1.0 or V1.1 - Weeks 13-20)
- [ ] Mobile web app (read invoices, approve, view P&L)
- [ ] Bank OKE file sync (auto-import statement)
- [ ] Invoice OCR (photo/scan → auto-extract vendor, amount, tax)
- [ ] Bank reconciliation auto-match (80%+ match rate)
- [ ] Inventory costing (FIFO/FEFO)
- [ ] Multi-branch support
- [ ] Accounting helpdesk (WhatsApp Q&A add-on)

---

### Won't Have (V1 - Defer to V2+)
- ❌ Manufacturing (job costing, WIP)
- ❌ Payroll (separate product: dnPeople)
- ❌ HR module
- ❌ Advanced project accounting
- ❌ Multi-currency
- ❌ Interbranch transactions
- ❌ Consolidated reporting
- ❌ Real-time collaboration (version 2+)

---

## 6. PRICING STRATEGY

### Pricing Tiers
| Tier | Monthly | Annual | Users | Max Co | Fitur |
|------|---------|--------|-------|--------|-------|
| **Starter** | FREE | FREE | 1 | Rp 100M | Journal, GL, basic reports |
| **Growth** | Rp 199k | Rp 2.1M (Rp 175k/mo) | 3 | Rp 500M | Growth + AR/AP + approval + basic inventory |
| **Pro** | Rp 399k | Rp 4.2M (Rp 350k/mo) | 10 | Rp 5B | Pro + inventory costing (FIFO/FEFO) + OCR invoice + mobile |
| **Plus** | Rp 699k | Rp 7.2M (Rp 600k/mo) | Unlimited | Unlimited | Plus + tax kit + templates + API + multi-branch |
| **Enterprise** | Custom | Custom | Unlimited | Unlimited | Plus + dedicated support + SLA |

### Add-Ons (Monthly)
- **Accounting Helpdesk:** Rp 500k/mo (unlimited WhatsApp Q&A to accountant)
- **Advanced Inventory Costing:** Rp 199k/mo (FIFO/FEFO/AVCO variance analysis)
- **OCR Invoice Automation:** Rp 299k/mo (100 scans/month, Rp 5k per scan beyond)
- **Bank Sync:** Rp 199k/mo (auto-import from 10+ banks)

### Competitor Pricing Comparison
```
1-user scenario (typical SME):
- Accurate: Rp 333k/mo
- Business Central: Rp 1.1M/mo
- Mekari Jurnal: Rp 200k/mo (accounting only)
- dnAccounting Growth: Rp 199k/mo (accounting + AR/AP + inventory)
  → 40% cheaper than Accurate, same as Mekari but 10x more features

3-user scenario (growing SME):
- Accurate: Rp 999k/mo (Rp 333k x 3)
- Business Central: Rp 3.3M/mo
- dnAccounting Growth: Rp 199k/mo (all 3 users included!)
  → 80% cheaper than Accurate
```

---

## 7. USER STORIES & ACCEPTANCE CRITERIA

### Epic 1: Core Accounting Setup
**US-1.1: Setup Chart of Accounts (COA) from Template**
- *As a* business owner
- *I want to* quickly set up my accounting structure without needing an accountant
- *So that* I can start recording transactions immediately

**Acceptance Criteria:**
- [ ] Select industry (retail, F&B, jasa, trading, manufac kecil)
- [ ] System pre-populate COA with 50-100 standard GL accounts
- [ ] Ability to add/remove/rename accounts
- [ ] Validate chart before save (no duplicate account codes)
- [ ] Estimate: <15 minutes for basic SME

---

### Epic 2: Transaction Entry
**US-2.1: Record Journal Entries**
- *As an* accountant
- *I want to* record journal entries with multiple GL lines
- *So that* I have complete audit trail of all transactions

**Acceptance Criteria:**
- [ ] Create journal entry (date, description, GL code + debit/credit)
- [ ] Support batch posting (multiple GL lines in one entry)
- [ ] Validate debit = credit before save
- [ ] Support recurring entry template (save & reuse monthly entries)
- [ ] Approval workflow (if approval enabled, require sign-off before posting)
- [ ] Audit log (who created, when, any edits)

---

### Epic 3: AR Management
**US-3.1: Create & Track Invoices**
- *As a* business owner
- *I want to* create invoices and track which customers have paid
- *So that* I know who owes money and can follow up

**Acceptance Criteria:**
- [ ] Create invoice (customer, line items, tax calculation)
- [ ] Auto-calculate PPN 11% (if applicable)
- [ ] Generate invoice PDF + unique invoice number
- [ ] Mark invoice status (draft, sent, partially paid, paid, overdue)
- [ ] Track payment (date received, amount, payment method)
- [ ] Auto-GL posting (AR debit, revenue credit, PPN payable)
- [ ] Email invoice to customer automatically

---

### Epic 4: AP Management
**US-4.1: Bill Approval Workflow**
- *As a* manager
- *I want to* control which bills are paid via approval workflow
- *So that* I prevent unauthorized payments and catch errors

**Acceptance Criteria:**
- [ ] Bill entry (vendor, amount, description, due date)
- [ ] Assign approver(s) (1-3 levels)
- [ ] Email notification to approver with bill details
- [ ] Approver can approve/reject via email link (one-click)
- [ ] Bill moves to "approved" status only after all approvals
- [ ] GL posting happens only when approved
- [ ] Audit trail shows who approved, when, any comments

---

### Epic 5: Inventory Tracking
**US-5.1: Track Stock Levels & Valuation**
- *As a* business owner
- *I want to* see current stock levels and inventory value
- *So that* I know what's in warehouse and can calculate COGS

**Acceptance Criteria:**
- [ ] Add item master (item code, description, unit, unit cost)
- [ ] Record stock in (purchase order received)
- [ ] Record stock out (sales, waste, sample)
- [ ] Auto-adjust inventory GL account (inventory asset entry)
- [ ] Stock aging report (how old each item, reorder status)
- [ ] Low-stock alert (notify if below reorder level)
- [ ] Inventory valuation report (total stock value by GL account)

---

### Epic 6: Reporting
**US-6.1: Generate Financial Reports**
- *As an* accountant
- *I want to* pull standard financial reports in real-time
- *So that* I can close books quickly and provide management with insights

**Acceptance Criteria:**
- [ ] P&L statement (by date range, department filter)
- [ ] Balance sheet (as-of date, asset/liability/equity breakdown)
- [ ] Trial balance (all GL accounts + balances)
- [ ] Cash flow statement (basic: receipts - payments)
- [ ] AR aging report (0-30d, 30-60d, 60+)
- [ ] AP aging report (same buckets)
- [ ] Tax summary (PPN, PPh, tax payable)
- [ ] All reports: PDF export + email schedule option

---

### Epic 7: Tax Compliance
**US-7.1: Auto-Calculate Tax Liability**
- *As a* business owner
- *I want to* know how much tax I owe without manual calculation
- *So that* I don't underpay or overpay tax

**Acceptance Criteria:**
- [ ] PPN 11% auto-calc on sales invoice (if registered)
- [ ] PPh 23 auto-calc on vendor payments (if applicable)
- [ ] Tax summary report (monthly: PPN in/out, PPh withholding)
- [ ] Tax forecast (estimate annual liability based on YTD)
- [ ] Compliance checklist (reminders: SPT masa, annual reporting)
- [ ] e-Faktur export (ready for DJP submission)

---

## 8. FEATURE PRIORITIZATION (MoSCoW)

### Must Have (Sprint 1-8)
1. Chart of accounts + GL posting
2. Invoice creation + AR tracking
3. Bill tracking + AP aging
4. Approval workflow
5. Basic financial reports (P&L, balance sheet, trial balance)
6. Multi-user + role-based access
7. Email notifications
8. PPN/PPh tax calculation

### Should Have (Sprint 9-12)
1. Inventory tracking (qty only)
2. Bank OKE import
3. Mobile web app (read-only for approval)
4. Standard templates (4 verticals)
5. Audit log
6. PDF export + scheduled reports

### Could Have (Sprint 13-16 / V1.1)
1. OCR invoice
2. Auto bank reconciliation
3. Accounting helpdesk integration
4. Advanced inventory costing (FIFO/FEFO)

### Won't Have (V1)
- Multi-currency
- Payroll module
- Manufacturing module
- Real-time collaboration

---

## 9. SUCCESS METRICS

### User Acquisition
- Week 16 (launch): 100 signups, 5% conversion to Growth tier = 5 paid users
- Month 6: 500 signups, 15% conversion = 75 paid users = Rp 15M MRR
- Month 12: 3000 signups, 10% blended conversion = 300 paid users = Rp 101M MRR

### Retention & Engagement
- Month 1 retention: >70% (users who use app at least 2x/week)
- Churn rate: <5% monthly (target <2% by year 2)
- NPS: >40 (calculate after month 3)

### Product Quality
- Uptime: 99.5%+ (target 99.9% by Y2)
- Response time: <500ms (p95)
- Bug resolution: Critical bugs <24h, major <1 week
- G2 rating: 4.5+ stars

### Revenue
- End Y1: Rp 300M ARR
- Gross margin: 70%+
- CAC (customer acquisition cost): <Rp 50k
- LTV (lifetime value): >Rp 2M (40+ months payback)

---

## 10. RELEASE TIMELINE

### Phase 1: MVP Launch (Weeks 1-16)
- **Soft Launch** (Week 13): Beta with 20 SME friends
- **Public Launch** (Week 16): Open to public, Starter + Growth tiers

### Phase 2: Premium Features (Weeks 17-24)
- **Launch Pro Tier** (Week 20): OCR invoice + mobile app + inventory costing
- **Integrations** (Week 20-24): Bank sync, payment gateway, POS integration

### Phase 3: Compliance & Automation (Weeks 25-32)
- **Launch Plus Tier** (Week 28): Tax compliance kit + templates + API
- **Industry Templates** (Week 28-32): Retail, F&B, jasa, trading pre-configs

---

## 11. ASSUMPTIONS & DEPENDENCIES

### Key Assumptions
1. SME market is ready to migrate from Accurate (proven by research)
2. Cloud accounting adoption will increase 20%+ YoY in Indonesia
3. Price elasticity: reducing Accurate's price by 40% will capture 10% market share
4. Tax compliance automation is valuable enough for SME to pay premium
5. 80%+ of target users can onboard without phone support (guided UX)

### Dependencies
- **Google Cloud (email, storage):** Gmail API for invoice send, Cloud Storage for PDF
- **Bank APIs:** OKE file format (standard in Indonesia)
- **DJP Integration:** e-Faktur API (likely Phase 2, manual export in V1)
- **Payment gateway:** Midtrans/DOKU for payment link (roadmap)
- **POS systems:** Kidzania, NCR (Phase 2 integration)

### External Risks
- **Regulatory:** Tax law changes (mitigate: modular tax config)
- **Competition:** Accurate launches free tier (mitigate: faster feature iteration, customer loyalty)
- **Market:** Economic downturn reduces SME software spend (mitigate: freemium model lowers barrier)

---

## 12. APPENDIX

### A. Industry Vertical Differences (Templates)

#### Retail Template
- Standard GL accounts: Sales revenue, COGS, inventory, shrinkage
- Inventory tracking: Item master with barcode, reorder levels
- Reports: Gross margin %, inventory turnover, shrinkage analysis
- Integrations: POS systems (Kidzania, NCR), online channels (Tokopedia, Shopee)

#### F&B Template
- Standard GL accounts: Food cost, beverage cost, preparation labor
- Inventory: Recipe costing, COGS % tracking per menu item
- Reports: Food cost %, menu profitability, inventory aging
- Compliance: BPJS calculation, employee meals accrual

#### Jasa/Agency Template
- Standard GL accounts: Labor revenue, consultant fees, subcontractor cost
- Tracking: Billable hours, project allocation, retainer vs project revenue
- Reports: Project P&L, utilization rate, consultant billing
- Integrations: Time tracking apps (Toggl, Clockify)

#### Trading/Distributor Template
- Standard GL accounts: COGS, sales commission, freight cost
- Inventory: Multi-warehouse, push/transfer rules, distributor pricing tiers
- Reports: Sales commission accrual, gross margin by customer, ABC analysis
- Integrations: Supplier POs, customer portal

---

**END OF PRD**
