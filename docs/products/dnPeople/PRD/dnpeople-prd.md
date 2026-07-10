# dnPeople HRIS - Product Requirements Document (PRD)

**Version:** 3.1  
**Last Updated:** July 10, 2026  
**Status:** Active Development — **MVP 1–4 core implemented** in repo `dnpeople`  
**Product Owner:** Dozer (DN Tech CEO)

> **Implementation:** Lihat [../docs/IMPLEMENTATION-STATUS.md](../docs/IMPLEMENTATION-STATUS.md) · [../current-implementation.md](../current-implementation.md) · [../00_INDEX.md](../00_INDEX.md) · kode di folder `dnpeople/`

---

## 1. Executive Summary

dnPeople adalah aplikasi HRIS (Human Resource Information System) end-to-end yang mengelola lifecycle karyawan dari recruitment hingga offboarding. Dirancang untuk startup, UMKM, dan perusahaan menengah di Indonesia dengan fitur payroll lokal (BPJS, PPh 21, THR) dan workflow approval yang fleksibel.

**Target Launch:** Q3 2026 (MVP 1) — **shipped core through MVP 4 (enterprise)** as of July 2026  
**MVP Scope (original):** Employee Database, Attendance, Leave, Payroll, Payslip, Reports  
**Implemented now:** MVP 1–4 core (ops, strategic HR, multi-company, integrations, SSO config, white-label, AI docs/screening)  
**Full Product:** 30 modul + AI HR Assistant  
**Repo:** `dnpeople` (Express + Next.js) — **bukan** sama dengan `ERP/` (DN People ERP NestJS)

---

## 2. Product Vision & Strategy

### Vision Statement
"Menjadi platform HRIS terpercaya yang mempermudah perusahaan Indonesia mengelola SDM secara digital, dari recruitment hingga offboarding."

### Core Values
- **Simplicity:** UI/UX yang intuitif untuk SME
- **Compliance:** Sesuai regulasi Indonesia (UU PDP, e-Faktur, PPh 21, PPN)
- **Flexibility:** Customizable sesuai kebutuhan perusahaan
- **Security:** Data karyawan aman dan terenkripsi
- **Scalability:** Dari 10 hingga 10,000+ karyawan

### Strategic Goals
1. Capture 5% market share HRIS di Indonesia dalam 18 bulan
2. Reduce HR operational cost untuk klien hingga 40%
3. Build network effect melalui integrations (payroll, e-sign, banking)
4. Establish dnPeople sebagai standard HRIS untuk SME Indonesia

---

## 3. Market Analysis

### Target Market

**Primary (MVP 1):**
- Startup (50-200 karyawan)
- UMKM (30-100 karyawan)
- Department HR perusahaan menengah

**Secondary (MVP 2-3):**
- Konsultan HR/Payroll (multi-client)
- Perusahaan dengan work model hybrid/remote/shift

### Market Size
- ~1.2M UMKM di Indonesia
- ~50K small/medium enterprises dengan HR dept
- Current HRIS penetration: ~15% (target: 35% dalam 3 tahun)

### Competitors
- SAP SuccessFactors (enterprise, mahal)
- Odoo HRIS (open-source, complex)
- Mekari Talenta (focus payroll, not complete HRIS)
- Simple HR (limited features)
- Custom built (expensive, maintenance overhead)

### Competitive Advantage
- Designed specifically for Indonesia compliance
- All-in-one (tidak perlu multiple systems)
- Affordable pricing ($5-50/employee/month)
- Modular (beli fitur sesuai kebutuhan)
- Bahasa Indonesia native
- Local payment integration (Midtrans, BRI, BCA)

---

## 4. User Personas & Jobs to be Done

### Persona 1: Budi - HR Manager (UMKM)
- **Age:** 32, Jakarta
- **Company:** Retail company 80 employees
- **Pain Points:** 
  - Manage absensi manual (spreadsheet)
  - Payroll calculation nglanau tiap bulan
  - Sulit track employee documents
  - No audit trail
- **Jobs to be Done:** 
  - Input absensi, calculate payroll, generate slip gaji
  - Track dokumen karyawan
  - Make HR decisions based on data

### Persona 2: Siti - Finance/Payroll Officer
- **Age:** 28, Surabaya
- **Company:** Manufacturing company 150 employees
- **Pain Points:**
  - Manual input komponen gaji
  - Kesalahan kalkulasi pajak/BPJS
  - Slip gaji bentuknya tidak konsisten
  - Butuh waktu lama untuk audit payroll
- **Jobs to be Done:**
  - Manage payroll components
  - Calculate tax & BPJS correctly
  - Generate & distribute payslips
  - Reconcile payroll data

### Persona 3: Ahmad - Department Manager
- **Age:** 35, Bandung
- **Company:** Tech startup 60 employees
- **Pain Points:**
  - Cannot see real-time attendance of team
  - Manual approval of leave/overtime
  - No visibility into team performance
  - Cannot track who approved what
- **Jobs to be Done:**
  - Approve employee requests (leave, overtime, permission)
  - Monitor team performance & KPI
  - Make staffing decisions

### Persona 4: Rina - Employee
- **Age:** 26, Jakarta
- **Company:** Tech startup 60 employees
- **Pain Points:**
  - Don't know sisa cuti balance
  - Slip gaji datang lewat email tidak aman
  - Sulit submit dokumen HR
  - No visibility into career path
- **Jobs to be Done:**
  - Check attendance & leave balance
  - Download payslip
  - Submit leave/permission requests
  - Access company policies

### Persona 5: Dewi - HR Director (Enterprise)
- **Age:** 40, Jakarta
- **Company:** Insurance company 500 employees
- **Pain Points:**
  - Complex approval workflows
  - Need multi-level hierarchy
  - Require compliance reports
  - Need integration with existing systems
- **Jobs to be Done:**
  - Design & manage HR policies
  - Access compliance & analytics
  - Integrate with legacy systems
  - Make strategic HR decisions

---

## 5. User Stories & Core Features

### Theme 1: Employee Lifecycle Management

#### Story 1.1: Employee Database
**As a** HR Admin  
**I want to** maintain complete employee database  
**So that** I have single source of truth for all employee data

**Acceptance Criteria:**
- Create, read, update employee records
- Support multiple data types (personal, contact, family, education, bank account)
- Upload and organize employee documents (KTP, NPWP, KK, contracts)
- Track data changes with audit trail
- Filter & search by department, position, status, location
- Bulk import via Excel

**Priority:** CRITICAL (MVP 1)

#### Story 1.2: Employee Status Tracking
**As a** HR Admin  
**I want to** track employee status (permanent, contract, intern, probation, freelance)  
**So that** I can manage different employment types correctly

**Acceptance Criteria:**
- Set employment status per employee
- Track status history & changes
- Auto-flag contracts near expiration
- Create probation period checklists
- Generate contract renewal reminders
- Support status transitions (probation → permanent)

**Priority:** HIGH (MVP 1)

### Theme 2: Attendance & Time Tracking

#### Story 2.1: Basic Attendance Tracking
**As an** Employee  
**I want to** clock in/clock out via web or mobile  
**So that** my attendance is automatically recorded

**Acceptance Criteria:**
- Clock in/out with single click/tap
- System records timestamp, location (optional GPS)
- Show current status (on-time, late, early leave)
- Mobile & web interface
- Offline capability (sync when online)
- Support multiple work modes (WFO, WFH, hybrid)

**Priority:** CRITICAL (MVP 1)

#### Story 2.2: Advanced Attendance
**As a** System  
**I want to** support multiple check-in methods  
**So that** companies can choose appropriate method

**Acceptance Criteria:**
- QR code scanning
- Selfie verification (facial recognition ready)
- GPS-based location verification
- WiFi-based (office network)
- Support geofencing (define office radius)

**Priority:** MEDIUM (MVP 2)

#### Story 2.3: Attendance Correction
**As an** Employee  
**I want to** submit attendance correction if system made error  
**So that** my attendance record is accurate

**Acceptance Criteria:**
- Submit correction request with evidence
- Manager can approve/reject correction
- System logs who approved & when
- Original & corrected data visible in audit trail
- Bulk correction support for managers

**Priority:** MEDIUM (MVP 2)

#### Story 2.4: Work Shift Management
**As a** HR Admin  
**I want to** create and manage work shifts (morning, afternoon, night)  
**So that** I can support shift-based operations

**Acceptance Criteria:**
- Create shift schedules (flexible times)
- Assign employees to shifts
- Support shift rotation
- Allow employees to swap shifts (with approval)
- Detect scheduling conflicts
- Calculate shift-based pay differences

**Priority:** HIGH (MVP 2)

### Theme 3: Leave & Permission Management

#### Story 3.1: Leave Request & Approval
**As an** Employee  
**I want to** request leave online with automatic balance check  
**So that** my request goes directly to manager without manual processing

**Acceptance Criteria:**
- Self-service leave request form
- System shows available balance before submission
- Support multiple leave types (annual, sick, maternity, marriage, bereavement, unpaid)
- Auto-approve sick leave (with max days limit)
- Escalate to manager for other types
- Manager gets notification & can approve/reject
- Email confirmation to employee
- Automatic balance deduction upon approval
- Carry-forward & expiration tracking

**Priority:** CRITICAL (MVP 1)

#### Story 3.2: Permission Management
**As an** Employee  
**I want to** request permission for (late arrival, early leave, going out, WFH, etc)  
**So that** manager knows my status in real-time

**Acceptance Criteria:**
- Quick permission request (no complex form)
- Support permission types (late, early leave, outing, WFH, dinas)
- Same-day processing
- Mobile notification to manager
- Manager can approve instantly
- Auto-update attendance status

**Priority:** HIGH (MVP 1)

#### Story 3.3: Leave Calendar & Reporting
**As a** HR Manager  
**I want to** see team leave calendar & plan coverage  
**So that** I can ensure business continuity

**Acceptance Criteria:**
- Visual calendar showing all team members' leave
- Filter by employee, department, leave type
- Export leave report (Excel, PDF)
- Identify periods with high leave concentration
- Send replacement assignment notifications

**Priority:** MEDIUM (MVP 2)

### Theme 4: Payroll & Compensation

#### Story 4.1: Payroll Setup & Configuration
**As a** Finance Officer  
**I want to** configure payroll components (salary, allowances, deductions)  
**So that** payroll calculation is consistent and accurate

**Acceptance Criteria:**
- Create salary components (basic, transport, meal, position allowance, etc)
- Define deduction types (BPJS, PPh 21, employee loans, etc)
- Set tax calculation method (monthly, annual, gross/net)
- Configure BPJS rates (employer/employee contribution)
- Support commission & bonus structures
- Set overtime rates (weekday, weekend, holiday)
- Create payroll templates (per department/position)

**Priority:** CRITICAL (MVP 1)

#### Story 4.2: Monthly Payroll Processing
**As a** Finance Officer  
**I want to** auto-calculate payroll based on attendance, overtime, leave, reimbursement  
**So that** payroll is accurate and processed quickly

**Acceptance Criteria:**
- Import attendance data automatically
- Import overtime records automatically
- Fetch leave deductions automatically
- Include approved reimbursements
- Calculate gross salary (all earnings)
- Calculate deductions (BPJS, tax, loans)
- Calculate net salary
- Generate payroll preview before finalization
- Show calculation breakdown
- Support proration for mid-month joins/exits
- Batch process multiple employees

**Priority:** CRITICAL (MVP 1)

#### Story 4.3: Tax & BPJS Compliance
**As a** Finance Officer  
**I want to** system auto-calculates tax & BPJS per Indonesian regulation  
**So that** compliance is guaranteed

**Acceptance Criteria:**
- Calculate PPh 21 based on PTKP & gross income
- Support different PTKP status (TK/0, TK/1, K/0, K/3, etc)
- Calculate BPJS Kesehatan (employee + employer)
- Calculate BPJS Ketenagakerjaan (employer)
- Generate bukti potong tax document
- Annual tax reconciliation (PPh 21)
- Export pajak data untuk laporan ke pajak
- Auto-update tax rates yearly

**Priority:** CRITICAL (MVP 1)

#### Story 4.4: Payslip Generation & Distribution
**As a** Finance Officer  
**I want to** generate payslips for all employees  
**So that** employees can access salary details

**Acceptance Criteria:**
- Generate payslip per employee per month
- Show detailed breakdown (earnings, deductions, net)
- Digital signature on payslip
- PDF download
- Email delivery to employee
- Password-protected access
- Payslip visible in employee portal (last 12 months)
- Print-friendly format
- Custom payslip branding

**Priority:** CRITICAL (MVP 1)

#### Story 4.5: Overtime & Bonus Management
**As a** HR Manager  
**I want to** track and manage overtime & bonus  
**So that** compensation is accurate and fair

**Acceptance Criteria:**
- Submit overtime request (with task description)
- Manager approves overtime
- Calculate overtime pay (1.5x weekday, 2x weekend, 3x holiday)
- Include approved overtime in payroll
- Track overtime per employee & month
- Report overtime by department
- Support bonus input (KPI-based, performance-based)
- Integrate bonus into payroll calculation

**Priority:** HIGH (MVP 2)

#### Story 4.6: Reimbursement & Claim Management
**As an** Employee  
**I want to** submit expense claim with receipt  
**So that** I get reimbursed for company expenses

**Acceptance Criteria:**
- Submit reimbursement request (transport, meal, hotel, medical, internet, etc)
- Upload receipt/invoice
- Set daily/monthly limit per category
- Manager reviews & approves
- Auto-include in next payroll
- Payment status tracking (pending, approved, paid)
- Rejected reason notification

**Priority:** MEDIUM (MVP 2)

#### Story 4.7: Employee Loan Management
**As a** Finance Officer  
**I want to** manage employee loans (kasbon)  
**So that** I can track loan disbursement & repayment

**Acceptance Criteria:**
- Employee submits loan request
- Manager & Finance approve
- Set loan amount & installment period
- Auto-deduct from monthly payroll
- Loan status tracking (pending, active, paid)
- Simulation calculator for employee
- Prevent over-borrowing

**Priority:** MEDIUM (MVP 2)

### Theme 5: Reporting & Analytics

#### Story 5.1: HR Dashboard & Summary
**As a** HR Manager  
**I want to** see HR summary in dashboard  
**So that** I can quickly understand HR status

**Acceptance Criteria:**
- Total active employees
- Employee breakdown (by department, status, location)
- Today's attendance summary (present, late, absent)
- Ongoing leave/permission
- Upcoming contract expirations
- Monthly payroll status
- Recent resignations
- Birthday reminders
- Pending approvals
- Charts & visualizations

**Priority:** CRITICAL (MVP 1)

#### Story 5.2: Attendance Report
**As a** HR Manager  
**I want to** generate attendance reports  
**So that** I can monitor attendance trends

**Acceptance Criteria:**
- Daily attendance report (who present/late/absent)
- Monthly attendance summary per employee
- Late arrival tracking & patterns
- Early leave tracking
- Absent-without-leave tracking
- Export to Excel/PDF
- Filter by date range, department, employee
- Tardiness distribution analysis

**Priority:** HIGH (MVP 1)

#### Story 5.3: Payroll Report
**As a** Finance Officer  
**I want to** generate payroll reports  
**So that** I can audit and reconcile payroll

**Acceptance Criteria:**
- Payroll summary (total payroll, total deduction)
- Per-employee payroll detail
- Component breakdown (earnings, deductions)
- Tax summary
- BPJS summary
- Payroll by department
- Export to Excel (for bank upload)
- Year-to-date summary

**Priority:** CRITICAL (MVP 1)

#### Story 5.4: Leave Report
**As a** HR Manager  
**I want to** generate leave usage reports  
**So that** I can plan staffing

**Acceptance Criteria:**
- Leave usage by employee
- Leave usage by type
- Leave balance summary
- Peak leave periods
- Future leave planning
- Export to Excel/PDF

**Priority:** MEDIUM (MVP 2)

#### Story 5.5: Resignation & Turnover Analysis
**As a** HR Director  
**I want to** analyze turnover trends  
**So that** I can identify retention issues

**Acceptance Criteria:**
- Resignation by department, position
- Turnover rate calculation
- Resignation reasons tracking
- Exit interview summary
- Trend analysis (monthly, quarterly, yearly)
- Department comparison
- Predictive turnover insights

**Priority:** HIGH (MVP 3)

### Theme 6: Compliance & Security

#### Story 6.1: Role-Based Access Control
**As a** System  
**I want to** enforce role-based permissions  
**So that** users only access data they need

**Acceptance Criteria:**
- 5 roles: Super Admin, Company Admin, Manager, Finance Officer, Employee
- Granular permission per module & action
- Restrict data access (own dept, own data, etc)
- HR can see all employees, manager only own dept
- Employee only sees own data
- Finance can see payroll, HR can see all except salary
- Audit trail of all access

**Priority:** CRITICAL (All Versions)

#### Story 6.2: Data Security & Privacy
**As a** Company  
**I want to** protect sensitive employee data  
**So that** privacy compliance is maintained

**Acceptance Criteria:**
- Encrypt sensitive fields (NPWP, bank account, salary)
- HTTPS for all data transmission
- Database encryption at rest
- Password hashing with bcrypt
- Session timeout (30 min inactivity)
- Multi-factor authentication support
- Backup & disaster recovery (daily)
- GDPR/UU PDP compliance

**Priority:** CRITICAL (All Versions)

#### Story 6.3: Audit Trail & Compliance
**As a** Compliance Officer  
**I want to** track all data changes  
**So that** I have compliance evidence

**Acceptance Criteria:**
- Log all user actions (login, CRUD)
- Record who changed what & when
- Store before/after values
- Cannot delete audit logs
- Audit log retention (7 years)
- Export compliance reports
- Digital signature on documents
- Document version control

**Priority:** HIGH (MVP 1)

### Theme 7: Recruitment & Onboarding

#### Story 7.1: Job Posting & Application Management
**As a** HR Manager  
**I want to** post jobs and track applications  
**So that** I can manage recruitment efficiently

**Acceptance Criteria:**
- Create job posting (title, description, requirements)
- Publish to career page
- Online application form
- CV upload
- Application status tracking (applied, shortlisted, interview, offering, hired, rejected)
- Candidate screening & ranking
- Interview scheduling
- Offer management
- Bulk operations (send offers, rejections)

**Priority:** MEDIUM (MVP 3)

#### Story 7.2: Employee Onboarding
**As a** HR Manager  
**I want to** manage new employee onboarding  
**So that** new hires have smooth integration

**Acceptance Criteria:**
- Onboarding checklist (docs, training, equipment)
- Document upload (KTP, NPWP, etc)
- Digital contract signing
- Equipment assignment tracking
- Training assignment
- Probation period management
- Probation evaluation
- Auto-conversion to permanent upon approval

**Priority:** MEDIUM (MVP 3)

---

## 6. Technical Requirements

### Technology Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Express 5, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Deployment:** Docker, DigitalOcean
- **CI/CD:** GitHub Actions
- **Email:** SendGrid / AWS SES
- **Storage:** DigitalOcean Spaces / AWS S3
- **Authentication:** JWT + 2FA ready
- **Payment:** Stripe / Midtrans (future)

### Infrastructure Requirements
- Scalable to 100K+ employees
- 99.9% uptime SLA
- Sub-2s response time
- Daily automated backups
- CDN for static assets
- Load balancing for API

### Mobile Support
- Responsive design (mobile-first)
- Native mobile app (React Native, future)
- Offline capability for attendance

### Integration Requirements
- Bank API (salary transfer)
- E-signature API
- Email delivery
- Payroll software (future)
- Accounting software (future)
- HRIS competitors (future migration)

---

## 7. Success Metrics & KPIs

### Business Metrics
- **MRR (Monthly Recurring Revenue):** Target $50K by end of 2027
- **Customer Acquisition:** 50 customers by end of 2026, 500 by end of 2027
- **CAC (Customer Acquisition Cost):** <$500 per customer
- **LTV (Lifetime Value):** >$15K (3 years retention)
- **Churn Rate:** <5% monthly
- **NPS (Net Promoter Score):** >50

### Product Metrics
- **Feature Adoption:** 70% of users use >5 modules in first month
- **User Engagement:** Daily active users >30% of total users
- **Support Tickets:** <0.5 per user per month
- **System Uptime:** >99.9%
- **Page Load Time:** <2 seconds (95th percentile)
- **Mobile Usage:** >40% of traffic

### User Satisfaction
- **Feature Satisfaction:** 4.5/5.0 average rating
- **Onboarding Time:** <4 hours to first payroll calculation
- **Support Resolution:** 24-hour response time, 48-hour resolution
- **Employee Adoption:** >80% of users access portal monthly

---

## 8. Release Roadmap

> **Implementation note (July 10, 2026):** Core modules for MVP 1–4 are implemented in `dnpeople/` (version **0.4.0**). Dates below remain commercial/GTM targets; engineering status = **Done (core)** with polish items listed in [IMPLEMENTATION-STATUS.md](../docs/IMPLEMENTATION-STATUS.md).

### MVP 1 (Q3 2026) - Core HR Functions — **Done**
**Target:** 50 customers, 5K+ total employees

**Included Modules:**
- User Management & Login
- Employee Database (complete profiles)
- Organization Structure
- Attendance (clock in/out, basic tracking)
- Leave Management (request & approval)
- Permission Management (quick approval)
- Payroll (basic calculation)
- Payslip (generation & distribution)
- HR Dashboard
- Basic Reports (attendance, leave, payroll)
- Audit Trail & Access Control
- Company Profile Setup

**Release Date:** September 2026 · **Code status:** Done

### MVP 2 (Q4 2026) - Extended Operations — **Done**
**Target:** 150 customers, 20K+ total employees

**Added Modules:**
- Shift Management
- Overtime Management
- Reimbursement & Claim
- Advanced Attendance (QR, selfie, GPS)
- Attendance Correction Workflow
- Contract Management & Reminders
- Document Management
- Internal Announcements
- Employee Engagement (survey, polling)
- Advanced Reports (turnover, analytics)
- Calendar HR (integrated shifts, payroll, events)
- Approval Workflow Engine

**Release Date:** December 2026 · **Code status:** Done

### MVP 3 (Q1-Q2 2027) - Strategic HR — **Done (core)**
**Target:** 300 customers, 50K+ total employees

**Added Modules:**
- Recruitment & ATS
- Employee Onboarding
- Performance Management (appraisals)
- KPI & OKR Management
- Training & Development
- Career Path & Promotion
- Disciplinary Action
- Company Policy Management
- Employee Loan (Kasbon)
- Asset Management
- Resignation & Offboarding
- HR Helpdesk
- AI HR Assistant (basic)
- Advanced Analytics

**Release Date:** June 2027 · **Code status:** Done (core)

### MVP 4 (Q3-Q4 2027) - Enterprise Features — **Done (core)**
**Target:** 500 customers, 100K+ total employees

**Added Modules:**
- Multi-company support
- Custom Workflows
- Advanced Approval Rules
- API & Integrations
- SSO (SAML/OAuth)
- Custom Reports Builder
- AI Document Generator
- AI Recruitment Screening
- Advanced Security (RBAC per data row)
- White-label capability

**Release Date:** December 2027 · **Code status:** Done (core) — SSO handshake & full row-level enforce still polish

---

## 9. Pricing Strategy

### Pricing Model
Per-user, per-month SaaS model with module selection

### Tier 1: Startup (Free → Upgrade)
- **Price:** Free for ≤10 employees, $30/month for 11-50
- **Modules:** Employee DB, Attendance, Leave, Basic Dashboard
- **Target:** Freemium conversion to Paid

### Tier 2: Growth ($5-10/employee/month)
- **Price:** $150-500/month (≤50 employees)
- **Modules:** All MVP 1 + Payroll, Payslip, Reports, Document Mgmt
- **Target:** UMKM (30-50 employees)

### Tier 3: Professional ($3-7/employee/month)
- **Price:** $300-1000/month (50-200 employees)
- **Modules:** All MVP 2 + Shift, Overtime, Reimbursement, Analytics
- **Target:** SME (50-200 employees)

### Tier 4: Enterprise (Custom)
- **Price:** Custom pricing based on headcount + features
- **Modules:** All MVP 3 + Recruitment, Performance, Training
- **Target:** Large SME & Enterprise (200+ employees)
- **Support:** Dedicated account manager

### Premium Add-ons
- AI HR Assistant: $50/month
- Advanced Analytics: $100/month
- API Access: $200/month
- White-label: $500/month
- Integrations: $50-200/month per integration

---

## 10. Success Definition

**MVP 1 Success Criteria (Q3 2026):**
- Launch 30 days on schedule
- 50 paying customers within 3 months
- 4.5+ NPS score
- >99% uptime
- <1% bug rate (critical bugs per 100 employees)

**Year 1 Success (End 2026):**
- 150 paying customers
- $150K ARR (Annual Recurring Revenue)
- 25K+ total employee records managed
- <5% monthly churn
- 40+ integrations ready

**Year 2 Success (End 2027):**
- 500 paying customers
- $600K ARR
- 100K+ total employee records managed
- >70% customer retention
- Industry recognition (Top 5 HRIS in Indonesia)

---

## 11. Dependencies & Assumptions

### Key Assumptions
- Market demand for affordable HRIS in SME segment is high
- Indonesian SMEs can adopt cloud-based HR solutions
- Compliance with local regulations is critical for adoption
- Payroll accuracy is non-negotiable requirement

### External Dependencies
- Bank APIs for salary transfer (available Q4 2026)
- E-signature providers (already integrated)
- Email delivery service (third-party SaaS)

### Internal Dependencies
- DN Tech engineering capacity: 3-4 engineers per sprint
- Product/design: 1 full-time product manager
- Customer support: 1 part-time initially, scale with growth

---

## Appendix: Glossary

- **HRIS:** Human Resource Information System
- **BPJS:** Badan Penyelenggara Jaminan Sosial (social security)
- **PPh 21:** Personal income tax in Indonesia
- **PTKP:** Personal non-taxable income threshold
- **THR:** Tunjangan Hari Raya (holiday bonus)
- **NPWP:** Nomor Pokok Wajib Pajak (tax ID)
- **WFO:** Work From Office
- **WFH:** Work From Home
- **KPI:** Key Performance Indicator
- **OKR:** Objectives & Key Results
- **ATS:** Applicant Tracking System
- **MRR:** Monthly Recurring Revenue
- **CAC:** Customer Acquisition Cost
- **LTV:** Lifetime Value
- **NPS:** Net Promoter Score

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | 2026-07-09 | Spec baseline v3 |
| 3.1 | 2026-07-10 | Status sync: MVP 1–4 core implemented in `dnpeople` 0.4.0 |
