# dnShop Finance v1.0 - Product Requirements Document

**Version:** 1.0  
**Last Updated:** August 2026  
**Author:** DN Tech  
**Status:** Draft for Development  

---

## 1. Product Overview

### 1.1 Product Name & Tagline
**dnShop Finance** — Financial Dashboard & Reporting Platform untuk Shopee Sellers Indonesia

### 1.2 Executive Summary
dnShop Finance adalah SaaS web application yang mengintegrasikan data finansial Shopee sellers secara real-time untuk memberikan visibility penuh terhadap revenue, inventory, settlements, dan compliance pajak (PPh 21, PPN, e-Faktur). Platform ini mendukung semua ukuran seller (micro hingga medium business) dengan interface intuitif dan laporan otomatis.

### 1.3 Product Vision
Menjadi single source of truth untuk financial health semua Shopee sellers Indonesia melalui automated data sync, intelligent reconciliation, dan tax compliance automation.

---

## 2. Target Users & Personas

### 2.1 Primary User Personas
1. **Solo Seller / Microbusiness** (<50M revenue/bulan)
   - Punya 1-2 products, manual everything
   - Butuh basic sales tracking
   - Concern: pajak, settlement delays

2. **Small Business Owner** (50M-500M/bulan)
   - Manage multiple products/SKUs
   - Need inventory visibility
   - Concern: order reconciliation, cash flow

3. **Medium Business** (500M-2B/bulan)
   - Multiple shops or high volume
   - Need detailed financial reporting
   - Concern: tax compliance, automation

### 2.2 User Segments By Market
- Solo entrepreneurs (etsy-like operators)
- Small retailers (toko online)
- Resellers/dropshippers
- Brand owners (official mall)

### 2.3 User Needs (Research-backed)
- Real-time visibility ke sales & revenue
- Inventory sync across Shopee
- Automatic order reconciliation
- Settlement tracking & disputes
- Tax calculation (PPh 21, PPN)
- Financial reports (cash flow, P&L)
- Multi-shop support (future)

---

## 3. Product Scope

### 3.1 MVP Features (Phase 1 - Go-Live Q4 2026)

#### 3.1.1 Dashboard & Analytics
- **Sales Dashboard**
  - Total revenue (today, week, month, custom range)
  - Order count & average order value
  - Top products by sales
  - Revenue breakdown by payment method
  - Real-time order activity feed

- **Financial Summary Widget**
  - Gross sales vs. net revenue
  - Fees deducted (Shopee commission, logistics, etc.)
  - Pending settlement amount
  - Settled balance (YTD)

- **Inventory Overview**
  - Total active listings
  - Low stock alerts (<5 units)
  - Slow-moving products
  - Stock value estimation

#### 3.1.2 Orders & Reconciliation
- **Order List View**
  - Filter by status (pending, processing, shipped, delivered, cancelled, returned)
  - Filter by date range
  - Search by order ID / buyer name
  - Bulk actions (mark as shipped, print label)
  - Order detail page: items, shipping address, buyer info, payment status

- **Payment Reconciliation**
  - Match Shopee orders with bank settlements
  - Flag mismatches/discrepancies
  - Settlement history (dates, amounts, fees)
  - Pending payout tracking

- **Returns & Refunds Tracking**
  - Return requests list
  - Refund status tracking
  - Dispute resolution history

#### 3.1.3 Inventory Management
- **Product List**
  - All products with SKU, price, current stock
  - Quick edit: price, stock, active/inactive
  - Bulk upload stock updates (CSV)
  - Category filtering

- **Stock Sync**
  - Auto-sync from Shopee (hourly)
  - Low stock notifications
  - Stock history log (sold, added, adjusted)

#### 3.1.4 Financial Reports
- **Sales Report**
  - Revenue by date range
  - Revenue by category
  - Revenue by payment method
  - CSV/PDF export

- **Expense Report**
  - Shopee commission breakdown
  - Logistics costs
  - Refund & return costs
  - Net revenue calculation

- **Tax Report Generator**
  - Monthly PPh 21 calculation (1.5% on sales)
  - Monthly PPN tracking (if applicable)
  - e-Faktur readiness (structured data export)
  - Reportable period summary

- **Cash Flow Report**
  - Inflow (sales, refund reversals)
  - Outflow (fees, refunds)
  - Net cash position
  - Forecast based on trends

#### 3.1.5 Settlement & Payout
- **Payout History**
  - All payouts received from Shopee
  - Payout date, amount, method, status
  - Fee breakdown per payout
  - Escrow tracking (if applicable)

- **Settlement Details**
  - Sales amount
  - Less: commission, refunds, chargebacks
  - Equals: settlement amount
  - Pro forma calculation for next payout

#### 3.1.6 Shop Configuration
- **Shop Profile**
  - Linked Shopee shop(s)
  - Shop name, address, contact
  - API credentials status

- **User Management** (Phase 2)
  - Add team members (cashier, accountant roles)
  - Permission levels (read-only, edit, admin)
  - Activity log

- **Notification Settings**
  - Low stock alerts
  - High-value order alerts
  - Settlement notifications
  - Email/SMS preferences

---

## 4. Shopee API Integration Map

### 4.1 Required Shopee APIs
| Module | Endpoint | Purpose | Frequency |
|--------|----------|---------|-----------|
| **Shop** | GET /shop/get_shop_info | Get shop name, rating, followers | Daily |
| **Product** | GET /product/get_item_list | List all products | Daily |
| | GET /product/get_item_base_info | Product details (price, stock) | Hourly |
| **Order** | GET /order/orders/search | Search orders by date/status | Real-time (push) |
| | GET /order/get_order_detail | Order items, amounts, shipping | Real-time |
| **Logistics** | GET /logistics/get_tracking_no | Tracking numbers | Real-time |
| | GET /return/search | Return requests | Daily |
| **Payment** | GET /payment/transaction_list | Payments received | Daily |
| | GET /payment/get_escrow_detail | Escrow amounts | Daily |
| | GET /payment/get_income_detail | Settlement payouts | Daily |
| **Push Notifications** | Subscribe to order, payment, return events | Real-time updates | On event |

### 4.2 Authentication Flow
1. User clicks "Connect Shopee"
2. Redirected to Shopee OAuth (open.shopee.com)
3. User approves app permissions
4. Shopee redirects with authorization code
5. Backend exchanges code for access_token & shop_id
6. Tokens stored securely in DB
7. Initial data sync begins

### 4.3 Data Sync Strategy
- **Push notifications** for orders, payments (real-time)
- **Hourly sync** for products, inventory
- **Daily sync** for settlements, reconciliation
- **Weekly** for reports generation & caching

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Page load: <3s (initial load), <1s (subsequent)
- API response: <500ms
- Dashboard data: real-time (delay <1 minute for Shopee sync)
- Support: 1000+ concurrent users by EOY 2026

### 5.2 Scalability
- Horizontal scaling via Load Balancer + multiple NestJS instances
- Database: PostgreSQL with read replicas
- Cache: Redis for frequently accessed data
- File storage: S3 for reports & exports

### 5.3 Security
- OAuth 2.0 for Shopee integration (no password storage)
- AES-256 encryption for sensitive data (tokens, PII)
- HTTPS/TLS 1.3 for all communication
- Row-level security (users see only own data)
- PCI-DSS compliance for payment data (if stored)

### 5.4 Compliance
- GDPR + Indonesian UU PDP (personal data protection)
- Tax regulation alignment (PPh 21, PPN, e-Faktur)
- Audit logging for all financial transactions
- Data retention: 7 years minimum (tax requirement)

### 5.5 Availability
- 99.9% uptime SLA
- Automated backup (daily)
- Disaster recovery plan (RTO: 4h, RPO: 1h)
- Status page for transparency

### 5.6 Localization
- Language: Indonesian (id-ID) + English (en-US)
- Currency: IDR primary, support other Shopee countries later
- Date format: DD/MM/YYYY (Indonesian standard)
- Tax regulations: Indonesia-first, expandable to TH/MY/PH

---

## 6. User Workflows

### 6.1 Onboarding Flow
1. User signs up (email)
2. Email verification
3. Select business size (micro/small/medium)
4. Click "Connect Shopee"
5. Shopee OAuth flow
6. Initial data sync (products, recent orders)
7. Dashboard shown
8. Tax setup wizard (optional)

### 6.2 Daily User Flow
1. Login to dashboard
2. Check sales summary (today's revenue, new orders)
3. Review low-stock alerts
4. Check pending settlements
5. Download reports if needed

### 6.3 Monthly Financial Flow
1. End of month: Review financial summary
2. Generate tax report
3. Export data for accountant
4. Reconcile bank deposits vs. Shopee settlements
5. Archive month's data

### 6.4 Multi-Shop Flow (Future)
- User can add multiple Shopee shops
- Dashboard aggregates data across shops
- Reports can be per-shop or consolidated

---

## 7. Key Features Detail

### 7.1 Smart Reconciliation Engine
**Problem:** Orders exist in Shopee, payments in bank, reconciliation is manual  
**Solution:** Automated matching by:
- Order ID pattern matching
- Amount matching (with tolerance for fees)
- Date proximity (<2 days)
- Flag mismatches for manual review

**User action:** Review flagged items, click "Reconcile" or "Investigate"

### 7.2 Tax Calculation Engine
**Inputs:**
- Total monthly sales (from Shopee)
- Business type (solo/UMKM/CV/PT)
- Applicable tax rates

**Outputs:**
- PPh 21 amount (1.5% for UMKM, variable for others)
- PPN if registered (10%)
- Withholding (21% on certain income)
- e-Faktur-ready XML

**User action:** Review, adjust if needed, export for tax filing

### 7.3 Settlement Tracking
**Data sources:**
- Shopee Payment API (daily sync)
- Bank statement (manual upload or future: bank API)

**Displays:**
- When was money deducted from escrow?
- When does it land in bank? (T+1, T+2)
- Any pending disputes?
- Fee breakdown per payout

### 7.4 Inventory Health Score
**Metrics:**
- Stock turnover (units sold / avg stock)
- Sell-through rate (units sold / total available)
- Days of supply
- Dead stock percentage

**Action:** Recommend restock/discount for slow-moving items

---

## 8. Competitive Positioning

### 8.1 Market Alternatives
| Feature | dnShop Finance | Mekari Jurnal | Accurate | ManualExcel |
|---------|---|---|---|---|
| **Shopee Integration** | Native, Real-time | Via plugin, Delayed | No | Manual |
| **Tax Compliance ID** | ✅ PPh21, PPN, e-Faktur | ✅ | ✅ | ❌ |
| **Inventory Sync** | ✅ Hourly | ❌ | ✅ | ❌ |
| **Order Reconciliation** | ✅ Automated | ❌ | ❌ | ❌ |
| **Price (IDR/mo)** | 99k-499k (freemium) | 499k+ | 600k+ | Free |
| **Target** | SME ecommerce | General SME | Accounting | Solo |

### 8.2 Unique Value Props
1. **Shopee-native:** Built by Shopee sellers for sellers
2. **Indonesia-first:** Tax compliance baked in
3. **Affordable:** Freemium model (99k-499k)
4. **Automated:** No manual data entry
5. **Real-time:** Push notifications for events

---

## 9. Pricing Model (Launch Strategy)

### 9.1 Tier Structure
| Tier | Price | Features | Target |
|------|-------|----------|--------|
| **Free** | IDR 0 | Dashboard, last 30 orders, basic reports | Micro/trial |
| **Starter** | IDR 99,000/mo | Unlimited orders, 1 shop, 3 months reports | Micro business |
| **Pro** | IDR 249,000/mo | All Starter + tax report, 12 months history | Small business |
| **Enterprise** | IDR 499,000/mo | All Pro + multiple shops, API access, support | Medium business |

### 9.2 Revenue Projections (Year 1)
- Target: 500 paying users by EOY 2026
- Free-to-paid conversion: 5%
- ARPU (Average Revenue Per User): 150k IDR
- MRR by Dec 2026: ~75M IDR

---

## 10. Go-to-Market Strategy

### 10.1 Launch Phase (Oct-Dec 2026)
- Beta with 50 pilot sellers
- Feedback loop & iteration
- Public launch with free tier
- Content: "How to track Shopee finances"

### 10.2 Growth Phase (Jan-Mar 2027)
- Expand to Shopee Malaysia, Thailand
- Team onboarding integrations
- Partner with accounting firms
- Affiliate program launch

### 10.3 Scale Phase (Apr-Jun 2027)
- Multi-marketplace support (Tokopedia, Lazada)
- Enterprise SaaS model
- White-label option for accountants

---

## 11. Success Metrics (KPIs)

### 11.1 Product Metrics
- **Adoption:** Users with linked Shopee account
- **Engagement:** DAU (daily active users), sessions/week
- **Retention:** 30-day, 60-day, 90-day cohort retention
- **Feature usage:** % of users generating tax reports

### 11.2 Business Metrics
- **MRR** (Monthly Recurring Revenue)
- **Churn rate:** <5% month-over-month
- **CAC** (Customer Acquisition Cost)
- **LTV** (Lifetime Value): Target 3+ years
- **NPS** (Net Promoter Score): Target 50+

### 11.3 Technical Metrics
- **Uptime:** 99.9%
- **API latency:** <500ms p99
- **Data sync accuracy:** 99.99%
- **Support response time:** <4 hours

---

## 12. Constraints & Risks

### 12.1 Technical Risks
- Shopee API rate limits (100 req/min)
- Shopee API changes/deprecation
- Large data volumes (1000+ products)
- Real-time sync consistency

### 12.2 Business Risks
- Market adoption (sellers prefer manual)
- Competition from Mekari
- Regulatory changes (tax law)
- Seller churn if Shopee changes commission

### 12.3 Operational Risks
- Payment processing integration complexity
- Tax law interpretation (PPN, PPh21, e-Faktur)
- Support burden (seller education)

### 12.4 Mitigation Strategies
- Regular Shopee API monitoring
- Legal consultation on tax compliance
- In-app tutorials & onboarding
- Freemium funnel to drive adoption
- Community feedback loop

---

## 13. Roadmap

### Phase 1: MVP (Aug-Oct 2026)
- [x] Shopee OAuth integration
- [x] Sales dashboard
- [x] Order sync & reconciliation
- [x] Inventory tracking
- [x] Financial reports
- [x] Tax report (basic)
- [x] Beta launch (50 users)

### Phase 2: Refinement (Nov-Dec 2026)
- [ ] Multi-shop support
- [ ] Advanced tax rules
- [ ] Bank statement upload
- [ ] User roles & permissions
- [ ] Public launch

### Phase 3: Expansion (Jan-Mar 2027)
- [ ] Shopee Malaysia/Thailand
- [ ] Tokopedia integration
- [ ] Accounting firm partnerships
- [ ] Mobile app (React Native)

### Phase 4: Enterprise (Apr-Jun 2027)
- [ ] Multi-marketplace aggregation
- [ ] API for partners
- [ ] White-label platform
- [ ] Advanced analytics/BI

---

## 14. Glossary & Terminology

| Term | Definition |
|------|-----------|
| **Gross Sales** | Total revenue before deductions |
| **Net Revenue** | Sales minus Shopee fees, refunds |
| **Settlement** | Shopee pays out to seller bank |
| **Escrow** | Funds held by Shopee during dispute period |
| **PPh 21** | Indonesian income tax (~1.5% for UMKM) |
| **PPN** | Indonesian value-added tax (10%) |
| **e-Faktur** | Electronic invoice (tax requirement) |
| **SKU** | Stock keeping unit (product identifier) |
| **ARPU** | Average revenue per user |
| **Churn** | Users who stop paying |

---

## 15. Appendix

### A. Shopee API Rate Limits & Quotas
- General: 100 requests/minute per partner
- Shop-specific: 50 requests/minute per shop
- Batch operations: 1000 items per request
- Data retention: 90 days in sandbox, unlimited in production

### B. Indonesian Tax Compliance References
- PPh 21: Tax Law No. 8/1997 (Article 21)
- PPN: Tax Law No. 8/1997 (Article 8-16)
- e-Faktur: Ministry of Finance Regulation No. 16/2014
- UU PDP (Data Protection): Law No. 27/2022

### C. Accessibility & Localization
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- RTL-ready (for future Arabic expansion)

---

**Document End**  
**Next Review:** Sep 30, 2026
