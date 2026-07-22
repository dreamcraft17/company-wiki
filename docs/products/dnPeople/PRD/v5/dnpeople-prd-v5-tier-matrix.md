# dnPeople — Feature Tier Matrix & Subscription PRD

**Version:** 1.0 (Tier-based gating)  
**Date:** July 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Product specification for tier differentiation  
**Audience:** Product, Engineering, Finance, Marketing

---

## Executive Summary

dnPeople menawarkan **5 tier** yang progressively unlock fitur sesuai kebutuhan dan budget customer:

| Tier | Price | Headcount | Strategy |
|------|-------|-----------|----------|
| **Gratis** | IDR 0 | ≤50 | Viral acquisition (no attendance) |
| **Starter** | IDR 20K/emp | 1-50 | Entry-level SME + attendance unlocked |
| **Professional** | IDR 25K/emp | 51-300 | Core + talent development (main revenue) |
| **Business** | IDR 20K/emp | 301+ | Volume + enterprise features |
| **Enterprise** | Custom | 500+ | Full white-label + support |

**Key constraint:** Attendance hanya di Starter+ (tidak di Free tier) untuk mendorong upgrade.

---

## Feature Tier Matrix

### Tier 1: GRATIS (Free Forever)

**Target:** Viral adoption, founder/startup dengan s/d 50 karyawan

**Available Features:**
```
✅ Employee Database
   - Unlimited employee records
   - Basic profile (name, email, position, department, join date)
   - Contact information
   - Family/education data (view only)
   - Org chart visualization
   - Bulk import/export (CSV)

✅ Organization Structure
   - Create departments
   - Manage positions & levels
   - Work locations
   - Holiday calendar
   - Company settings

✅ Employee Portal
   - View own profile
   - Download documents (policies, contracts)
   - Announcements
   - Company news

✅ Basic Reporting
   - Employee list export
   - Org structure export
   - Headcount summary

❌ BLOCKED:
   - Attendance & leave management
   - Payroll
   - Recruitment
   - Performance management
   - Talent development
   - API access
   - Custom workflows
   - Multi-company
   - SSO/White-label
```

**Rationale:** Freemium = viral, tapi blocked attendance = clear upgrade path.

---

### Tier 2: STARTER (IDR 20K/emp/month)

**Target:** 1-50 employee SME, basic HR needs

**Upgrade from Free:** Attendance + Basic Payroll + Leave

**Available Features:**
```
✅ ALL from Gratis +

✅ Attendance & Leave Management
   - Clock in/out (manual, GPS, QR, WiFi)
   - Attendance tracking & corrections
   - Geofence support
   - QR code check-in
   - Leave types (annual, sick, unpaid)
   - Leave balance tracking
   - Leave request/approval workflow
   - Carry-forward rules
   - Auto-approve sick leave (max 2 days)
   - Attendance reports (CSV/PDF)

✅ Basic Payroll
   - Simple salary components (base + tunjangan/potongan)
   - BPJS calculation (basic)
   - PPh 21 calculation (simplified, standard rates)
   - Payslip generation (PDF)
   - Monthly payroll run
   - Payslip email to employees
   - Bank upload format (for manual transfer)

✅ Permissions
   - WFH request
   - Late permission
   - Business trip
   - Permission approval workflow

✅ Dashboard
   - Attendance overview (this month)
   - Payroll schedule
   - Upcoming leaves
   - Leave balance summary

✅ Email Support
   - 24-hour response

❌ BLOCKED:
   - Shift management & pay differential
   - Overtime tracking
   - Claims/reimbursement
   - Loans (kasbon)
   - Advanced leave features (carry-forward expiry, coverage assignment)
   - Advanced payroll (tax methods, variable comp, employer contribution detail)
   - Recruitment/ATS
   - Performance management
   - Training & development
   - Talent development (competency, IDP, LMS)
   - Multi-company
   - API access
   - Custom workflows
   - Advanced analytics
   - SSO/White-label
   - Webhooks
```

**Rationale:** Covers micro-SME minimum (payroll + attendance), no enterprise features.

---

### Tier 3: PROFESSIONAL (IDR 25K/emp/month) ⭐ MOST POPULAR

**Target:** 51-300 employee growing SME, talent management focus

**Upgrade from Starter:** Advanced HR + Talent Development + APIs

**Available Features:**
```
✅ ALL from Starter +

✅ Advanced Shift Management
   - Shift creation & assignment
   - Shift rotation patterns
   - Shift swap requests & approval
   - WiFi-based check-in
   - Offline attendance (local queue)
   - Early-leave detection
   - Pay multiplier for shifts (night shift 1.35x, weekend 1.5x, etc)

✅ Advanced Payroll
   - Complex salary components (unlimited tunjangan/potongan)
   - Tax methods (GROSS, NET, GROSS-UP)
   - Full BPJS calculation (kesehatan, ketenagakerjaan, JKK, JKM)
   - Advanced PPh 21 (progressive brackets, PTKP, family allowance)
   - Employer contribution calculation
   - THR calculation & payment
   - Payroll proration (mid-month join/exit)
   - Multiple salary components per employee
   - Payroll on calendar (scheduled runs)
   - Detailed payslip (landscape, components table, proration detail)
   - Password-protected PDF
   - Bank upload (multiple format support)
   - Payroll reports (detail, summary, tax, bukti potong)

✅ Advanced Leave Management
   - Multiple leave types (annual, sick, unpaid, maternity, study, etc)
   - Leave carry-forward with expiry
   - Replacement/coverage assignment during leave
   - Leave balance forecasting
   - Annual leave processing (reset, carry-forward calculation)
   - Leave notifications & reminders
   - Leave detail reports

✅ Overtime Management
   - OT logging (manual or auto from attendance)
   - OT approval workflow
   - OT payroll deduction (rate configurable)
   - OT reports

✅ Claims & Reimbursement
   - Claim types (travel, accommodation, meals, etc)
   - Receipt upload
   - Multi-step approval
   - Bank transfer integration
   - Claim reports

✅ Loans (Kasbon)
   - Employee loan requests
   - Loan approval workflow
   - Loan schedule tracking
   - Auto-deduction from payroll
   - Loan reports

✅ Recruitment & Onboarding
   - Job postings (internal & external)
   - Candidate pipeline
   - Interview scheduling
   - Candidate assessment
   - Digital offer letter (e-sign)
   - Auto-create employee on offer accept
   - Onboarding checklist
   - Contract document upload

✅ Performance Management
   - Performance review cycles
   - Self-review & manager review
   - KPI tracking
   - Performance scoring
   - Review history

✅ Training & Development
   - Training programs
   - Course catalog
   - Employee enrollment
   - Completion tracking
   - Training history

✅ Talent Development (IDP + Competency + LMS)
   - Competency framework definition
   - Role-competency mapping
   - Competency assessment (self/manager/peer/360)
   - Gap analysis (priority-ranked)
   - Individual Development Plan (auto-generate or manual)
   - IDP goal tracking
   - Learning Management System (LMS)
     - Course creation & management
     - Mandatory vs recommended courses
     - Employee enrollment (self or assigned)
     - Completion tracking
     - Certificate generation
     - Learning transcript
     - Skill tagging to competencies

✅ Advanced Reporting
   - Custom report builder
   - Attendance detail (by employee, location, date range)
   - Leave detail (by type, employee, approval status)
   - Payroll detail (breakdown per employee/component)
   - Tax reports (PPh 21, BPJS)
   - Turnover & trend analysis
   - Employee analytics (tenure, department, level distribution)
   - Export: CSV, Excel, PDF

✅ Chat Support
   - 8-hour response time
   - Support ticket system

✅ Webhooks
   - Limited webhooks (up to 10 per company)
   - Payroll run completed
   - Leave approved
   - Employee created
   - Attendance corrected

❌ BLOCKED:
   - Multi-branch with different UMR/rules per location
   - Unlimited custom workflows
   - REST API (100+ calls/day)
   - Advanced security (row-level RBAC)
   - Multi-company support
   - SSO (SAML/OAuth)
   - White-label
   - Advanced integrations (Jurnal, custom)
   - AI document generation
   - AI recruitment screening
   - 9-box matrix automation
   - Succession planning
   - Internal career marketplace
   - Earned wage access (EWA)
   - Salary benchmarking
   - Industry-specific packages (manufacturing, retail)
```

**Rationale:** Core SME product - everything they need except enterprise scale/customization.

---

### Tier 4: BUSINESS (IDR 20K/emp/month) — VOLUME DISCOUNT

**Target:** 301+ employees, multi-location, advanced customization

**Upgrade from Professional:** Enterprise features + API + Multi-branch

**Available Features:**
```
✅ ALL from Professional +

✅ Multi-Branch / Multi-Location
   - Different UMR per location
   - Differential payroll rules per branch (tax treatment, BPJS rates)
   - Location-specific approval workflows
   - Location-specific leave policies
   - Shift multiplier variance by location
   - Reports by branch/location

✅ Advanced Custom Workflows
   - Multi-step approval chains (5+ levels)
   - Conditional routing (role, location, amount, department)
   - Approval amount thresholds
   - Escalation rules
   - Workflow history & audit

✅ REST API (Unlimited)
   - Full API access for integrations
   - Webhooks (unlimited)
   - API keys & rate limits
   - API documentation
   - Sandbox environment
   - Batch operations (bulk create/update)

✅ Advanced Security & RBAC
   - Row-level access control (scope-based)
   - Department-level restrictions
   - Custom role creation
   - Audit trail with detailed changes
   - Data export restrictions per role
   - Session management

✅ Advanced Analytics
   - Custom dashboards
   - Real-time metrics
   - Workforce planning models
   - Predictive analytics (turnover risk heuristic)
   - Export to BI tools (Tableau, Power BI ready)
   - Advanced data visualization

✅ Custom Reports (Advanced)
   - Unlimited custom report builder
   - Scheduled reports (email delivery)
   - Report sharing
   - Report history & versioning

✅ Phone Support
   - 4-hour response time
   - Priority queue
   - Dedicated support contact
   - Quarterly business reviews

✅ Document Management
   - Document templates (contract, offer, SK, SP)
   - Document generation (batch)
   - E-signature integration
   - Document archival

✅ Assets Management
   - Asset allocation & tracking
   - Asset check-in/check-out
   - Depreciation tracking
   - Asset reports
   - Auto-return on offboarding

✅ Offboarding
   - Offboarding checklist
   - Resignation request workflow
   - Final payroll calculation
   - Exit interview template
   - Asset return tracking
   - Clearance sign-off

❌ BLOCKED:
   - Multi-company (separate org)
   - SSO (SAML/OAuth)
   - White-label / Custom branding
   - AI document generation (batch)
   - AI recruitment screening
   - 9-box matrix automation
   - Succession planning
   - Internal career marketplace
   - Earned wage access (EWA)
   - Salary benchmarking
   - Industry-specific packages
   - Custom integrations (Jurnal sync, etc)
```

**Rationale:** For mid-market: customization + API for integrations, but no white-label.

---

### Tier 5: ENTERPRISE (Custom Pricing)

**Target:** 500+ employees or specialized needs

**Upgrade from Business:** Everything unlocked + dedicated support + white-label

**Available Features:**
```
✅ ALL from Business +

✅ Multi-Company Support
   - Hold multiple company organizations
   - Centralized user management
   - Cross-company reporting
   - Consolidated analytics
   - Org tree visualization

✅ SSO / Advanced Auth
   - SAML 2.0 configuration
   - Google Workspace SSO
   - Microsoft Azure AD SSO
   - Custom IdP support
   - Just-in-Time (JIT) user provisioning
   - Logout redirect

✅ White-Label / Custom Branding
   - Custom domain (e.g., hr.company.com)
   - Custom logo & colors
   - Custom email templates
   - Custom terms & privacy policy
   - Removal of dnPeople branding
   - Custom favicon

✅ Dedicated Account Manager
   - Strategic consultation
   - Roadmap alignment
   - Custom training program
   - Quarterly business reviews
   - Priority feature requests

✅ SLA & Premium Support
   - 99.5% uptime SLA
   - 1-hour response time (critical)
   - 24/7 phone support
   - Slack integration for support
   - Dedicated support channel

✅ Custom Development & Integration
   - Custom feature development (scope-defined)
   - Jurnal (accounting software) integration
   - Custom ERP integration
   - Custom system sync
   - API wrapper development
   - On-premises option (if required)

✅ Advanced Security
   - Penetration testing support
   - Custom data encryption
   - Advanced audit controls
   - Data residency guarantee (Indonesia)
   - HIPAA/SOC2 readiness (if needed)
   - Advanced compliance reporting (UU PDP, GDPR, etc)

✅ Implementation & Migration
   - On-site implementation (2-4 weeks included)
   - Data migration from legacy system
   - Custom workflows setup
   - Staff training & certification
   - Go-live support

✅ All Previous Tier Features
   - All from Professional + Business tiers
   - No feature restrictions
```

**Rationale:** Full-service enterprise offering.

---

## Feature Availability Summary Matrix

| Feature | Gratis | Starter | Professional | Business | Enterprise |
|---------|--------|---------|--------------|----------|-----------|
| **Employee Management** | ✅ | ✅ | ✅ | ✅ | ✅ |
| Attendance | ❌ | ✅ | ✅ | ✅ | ✅ |
| Leave Management | ❌ | ✅ | ✅ | ✅ | ✅ |
| Basic Payroll | ❌ | ✅ | ✅ | ✅ | ✅ |
| Advanced Payroll | ❌ | ❌ | ✅ | ✅ | ✅ |
| Shift Management | ❌ | ❌ | ✅ | ✅ | ✅ |
| Overtime | ❌ | ❌ | ✅ | ✅ | ✅ |
| Claims & Loans | ❌ | ❌ | ✅ | ✅ | ✅ |
| Recruitment | ❌ | ❌ | ✅ | ✅ | ✅ |
| Performance Management | ❌ | ❌ | ✅ | ✅ | ✅ |
| Training & Development | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Talent Dev (IDP/Competency/LMS)** | ❌ | ❌ | ✅ | ✅ | ✅ |
| Advanced Workflows | ❌ | ❌ | Limited | ✅ | ✅ |
| Multi-Branch Differential | ❌ | ❌ | ❌ | ✅ | ✅ |
| REST API | ❌ | ❌ | Webhooks | ✅ | ✅ |
| Advanced RBAC | ❌ | ❌ | ❌ | ✅ | ✅ |
| Custom Reports (Advanced) | ❌ | Basic | Standard | ✅ | ✅ |
| Analytics | ❌ | ❌ | Standard | Advanced | ✅ |
| SSO/SAML | ❌ | ❌ | ❌ | ❌ | ✅ |
| White-Label | ❌ | ❌ | ❌ | ❌ | ✅ |
| Multi-Company | ❌ | ❌ | ❌ | ❌ | ✅ |
| Dedicated Support | ❌ | ❌ | Chat | Phone | 24/7 + AM |
| Custom Development | ❌ | ❌ | ❌ | Limited | ✅ |
| 9-Box Matrix (Automated) | ❌ | ❌ | ❌ | ❌ | ✅ (roadmap) |
| Succession Planning | ❌ | ❌ | ❌ | ❌ | ✅ (roadmap) |
| Internal Career Marketplace | ❌ | ❌ | ❌ | ❌ | ✅ (roadmap) |
| Earned Wage Access (EWA) | ❌ | ❌ | ❌ | ❌ | ✅ (roadmap) |

---

## Upgrade Path & Pricing Examples

### Scenario 1: Startup 30 people

- **Start:** Gratis (explore, no attendance)
- **Month 3:** Grow to 50 people → upgrade to Starter (IDR 20K × 50 = IDR 1M/month)
- **Month 12:** Scale to 150 people → upgrade to Professional (IDR 25K × 150 = IDR 3.75M/month)

**Total Year 1 revenue:** IDR 30M (freemium funnel)

---

### Scenario 2: Manufacturing 500 people

- **Start:** Business (IDR 20K × 500 = IDR 10M/month)
- **Features need:** Multi-branch UMR, custom workflows, API integration with ERP
- **Support:** Chat (Professional baseline, can upgrade to phone via add-on or Enterprise)

**Annual revenue:** IDR 120M

---

### Scenario 3: Enterprise 2000 people, multi-location, multi-company

- **Tier:** Enterprise (custom pricing, likely IDR 15-18K/emp due to volume)
- **Cost:** ~IDR 30-36M/month
- **Includes:** Multi-company, SSO, white-label, dedicated AM, custom integrations

**Annual revenue:** IDR 360-432M + custom dev fees

---

## Implementation Notes

### Backend Gatekeeping (Node.js/Express)

```typescript
// Middleware to check feature access
async function checkFeatureAccess(req, res, next) {
  const { companyId } = req.params;
  const company = await getCompany(companyId);
  
  const tierFeatures = {
    free: ['employees', 'orgChart', 'documents'],
    starter: ['attendance', 'leave', 'basicPayroll', ...tierFeatures.free],
    professional: ['shift', 'overTime', 'claims', 'recruitment', 'talent', 'lms', ...tierFeatures.starter],
    business: ['multiBranch', 'api', 'advancedWorkflows', ...tierFeatures.professional],
    enterprise: ['multiCompany', 'sso', 'whiteLavel', ...tierFeatures.business]
  };
  
  const tier = company.subscriptionTier; // 'free' | 'starter' | 'professional' | 'business' | 'enterprise'
  const allowedFeatures = tierFeatures[tier];
  
  if (!allowedFeatures.includes(req.feature)) {
    return res.status(403).json({ error: 'Feature not available in this tier' });
  }
  
  next();
}
```

### Frontend Gatekeeping (Next.js/React)

```tsx
// Component to show/hide feature based on tier
export function FeatureGate({ feature, children, tier }) {
  const tierFeatures = {
    free: ['employees', 'orgChart'],
    starter: [...tierFeatures.free, 'attendance', 'leave'],
    professional: [...tierFeatures.starter, 'talent', 'lms'],
    business: [...tierFeatures.professional, 'multiCompranch', 'api'],
    enterprise: [...tierFeatures.business, 'multiCompany', 'sso'],
  };
  
  if (!tierFeatures[tier].includes(feature)) {
    return <UpgradePrompt feature={feature} requiredTier={getRequiredTier(feature)} />;
  }
  
  return children;
}

// Usage
<FeatureGate feature="attendance" tier={company.tier}>
  <AttendanceModule />
</FeatureGate>
```

### Database Flagging

Add `subscriptionTier` and `enabledFeatures` to company model:

```prisma
model Company {
  id String @id @default(cuid())
  name String
  subscriptionTier Enum @default(FREE) // FREE | STARTER | PROFESSIONAL | BUSINESS | ENTERPRISE
  enabledFeatures String[] // Manual override for specific features
  // ... rest of fields
}
```

---

## Transition Rules

### Downgrade from Professional to Starter
- Keep last 30 days of data
- Attendance/leave data exportable
- Payroll archived (no new runs)
- Talent development features disabled with 7-day warning
- All data preserved (no deletion)

### Upgrade from Starter to Professional
- All existing data immediately accessible
- New features enabled
- No data loss

### Suspended (Payment failed)
- Features gradually blocked (after 7 days)
- Day 7: Read-only access
- Day 30: Account frozen (data preserved)
- Day 90: Data deleted

---

## Revenue Projections

### Year 1 (Q3 2026 - Q2 2027)

| Tier | Customers | Avg Size | Monthly Revenue | Annual Revenue |
|------|-----------|----------|-----------------|-----------------|
| Gratis | 500 | — | IDR 0 | IDR 0 |
| Starter | 50 | 30 emp | IDR 30M | IDR 360M |
| Professional | 100 | 150 emp | IDR 375M | IDR 4.5B |
| Business | 20 | 500 emp | IDR 200M | IDR 2.4B |
| Enterprise | 5 | 2000 emp | IDR 150M | IDR 1.8B |
| **Total** | **675** | — | **IDR 755M** | **IDR 9.06B** |

### Year 2 (Q3 2027 - Q2 2028)

| Tier | Customers | Avg Size | Monthly Revenue | Annual Revenue |
|------|-----------|----------|-----------------|-----------------|
| Gratis | 1500 | — | IDR 0 | IDR 0 |
| Starter | 150 | 40 emp | IDR 120M | IDR 1.44B |
| Professional | 300 | 180 emp | IDR 1.35B | IDR 16.2B |
| Business | 80 | 600 emp | IDR 960M | IDR 11.52B |
| Enterprise | 20 | 2500 emp | IDR 750M | IDR 9B |
| **Total** | **2050** | — | **IDR 3.18B** | **IDR 38.16B** |

---

## Success Metrics

| KPI | Target Year 1 | Target Year 2 |
|-----|---------------|---------------|
| Total customers | 175 (paid) | 550 (paid) |
| Freemium-to-paid conversion | 10% | 15% |
| NPS | >50 | >55 |
| Monthly churn | <3% | <2% |
| ARPU (paid customers avg) | IDR 4.3M | IDR 5.8M |
| MRR (month-end) | IDR 755M | IDR 3.18B |

---

## Next Steps

1. ✅ Finalize tier feature matrix (this doc)
2. ⬜ Update backend middleware for feature gating (SDD)
3. ⬜ Update frontend components for feature gates (SDD)
4. ⬜ Create SRS per-tier with acceptance criteria
5. ⬜ Update pricing page with tier comparison
6. ⬜ Create customer onboarding flow per tier
7. ⬜ Set up billing system (Stripe/Xendit) with tier mapping

---

*Last Updated: July 16, 2026*
