# dnPeople — System Requirements Specification (SRS)
## Subscription Tier Features & Acceptance Criteria

**Version:** 1.0  
**Date:** July 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Audience:** QA, Product, Engineering  
**Refs:** PRD Feature Tier Matrix, SDD Feature Tier Gating

---

## Functional Requirements by Tier

### FR-SUB-001: Subscription Management (All tiers)

#### FR-SUB-001.1: Company Free Trial (Gratis Tier)

**Requirement:**
Every new company automatically starts with Gratis tier (FREE), unlimited access to free features, no credit card required.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| New company registration | Tier = FREE automatically | 1. Register new company → Verify subscription.tier = 'FREE' |
| Free features available | Can access employees, org chart, documents | 2. Login as EMPLOYEE free account → Navigate /employees → Verify success |
| Paid features blocked | Cannot access attendance | 3. Try POST /attendance/clock-in (free tier) → Expect 403 "Feature not available" |
| Trial notification | UI shows "Upgrade to unlock" | 4. Navigate to attendance page → Verify upgrade prompt |
| No payment method | Never asks for credit card during onboarding | 5. Complete signup → Verify no payment screen |
| Data retention | All data preserved if no upgrade | 6. Create 10 employees in free tier → Verify data intact after 6 months |

**Non-Functional:**
- No credit card capture during registration
- Free tier persists indefinitely if not upgraded
- No automatic charge

---

#### FR-SUB-001.2: Subscription Tier Assignment

**Requirement:**
Admin can upgrade company to Starter/Professional/Business/Enterprise tier, with effective date and invoice generation.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Upgrade to Starter | Tier changes, features unlock | 1. POST /api/subscription/upgrade (newTier: STARTER) → Verify tier = STARTER |
| Attendance unlocked | After upgrade to Starter, can clock-in | 2. POST /api/attendance/clock-in → Expect 200 |
| Pricing snapshot | Monthly cost calculated (20K × emp count) | 3. Upgrade with 50 employees → Verify monthlyAmount = 1M |
| Invoice generated | First invoice created with effective date | 4. Upgrade on 2026-07-20 → Verify invoice.periodStart = 2026-07-20 |
| Audit trail | Change logged with changer ID | 5. Check SubscriptionAuditLog → Verify action = 'tier_changed', oldValue/newValue recorded |
| Pro-rated billing | If mid-month upgrade, charge pro-rated | 6. Upgrade mid-month (day 15/30) → Verify invoice amount = 50% |

---

#### FR-SUB-001.3: Subscription Cancellation & Suspension

**Requirement:**
Admin can cancel subscription (with 30-day notice) or system auto-suspends if payment fails.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Manual cancellation | Status = CANCELLED, features start blocking | 1. POST /api/subscription/cancel (effectiveDate: 2026-08-20) → Verify status = CANCELLED |
| Cancellation feedback | Optional reason captured | 2. Include reason = "Too expensive" → Verify stored in DB |
| Grace period | Features still work for 7 days after cancel | 3. Cancel on day 1 → Try clock-in on day 5 → Expect 200 |
| Read-only after grace | On day 8, features become read-only | 4. On day 8 → Try POST /attendance/clock-in → Expect 403 "Account suspended" |
| Payment failure suspension | Auto-suspend after failed Stripe charge | 5. Mock Stripe charge failure → Verify status = SUSPENDED |
| Suspension notification | Email sent to billing contact | 6. Trigger suspension → Verify email sent to billingEmail |
| Reactivation | Can resume paid subscription by updating payment method | 7. Update Stripe PM → POST /subscription/reactivate → Verify status = ACTIVE |

---

### FR-ATT-001: Attendance Features (Starter+ Tiers)

#### FR-ATT-001.1: Clock In/Out (Starter+)

**Requirement:**
Employees can clock in/out via multiple methods (manual, GPS, QR, WiFi). Feature blocked for FREE tier.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Manual clock-in (Starter) | Can POST /attendance/clock-in (no location) | 1. POST /api/attendance/clock-in (method: MANUAL) → Expect 200 |
| GPS clock-in (Starter) | Can POST with geolocation data | 2. POST /api/attendance/clock-in (lat: -6.2, lon: 106.8) → Expect 200 |
| QR code (Starter) | Can POST /qr-verify to clock-in | 3. POST /api/qr-verify (qrCode: ABC123) → Expect 200 |
| WiFi check-in (Professional) | Additional method via WiFi SSID | 4. Tier: PROFESSIONAL, POST with WiFi SSID match → Expect 200 |
| Offline queue (Professional) | Can queue clock-in when offline | 5. Tier: PROFESSIONAL, lose connection → Queue action → Reconnect → Verify synced |
| FREE tier blocked | GET /attendance returns 403 | 6. Tier: FREE, try POST /attendance/clock-in → Expect 403 |
| Rate limiting | Max 5 clock actions per day per employee | 7. Clock-in 6 times in 1 hour → Expect 429 "Rate limit" on 6th |
| Duplicate prevention | Cannot clock-in twice without clock-out | 8. Clock-in, try clock-in again → Expect 400 "Already clocked in" |

---

#### FR-ATT-001.2: Attendance Corrections (Starter+)

**Requirement:**
Employees can request attendance corrections (with evidence), manager approves. Corrections audited.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Correction request | POST /corrections (date, reason, evidence) | 1. POST /api/corrections (date: 2026-07-15, reason: "Clock failed", file: receipt) → Expect 201 |
| Evidence required | Cannot submit without file attachment | 2. POST /corrections (no file) → Expect 400 "Evidence required" |
| Manager approval | Correction shows in manager inbox | 3. POST /corrections → Manager sees in /approvals → Expect pending status |
| Approval updates attendance | On approve, attendance record updated | 4. Manager POST /corrections/:id/approve → Verify attendance.status = APPROVED_CORRECTION |
| Audit trail | Correction shows before/after state | 5. Check audit log → Verify oldTime, newTime, reason recorded |
| Bulk corrections (Professional) | Manager can bulk-correct multiple employees | 6. Tier: PROFESSIONAL, POST /corrections/bulk (csv: […]) → Expect 200 with count |
| FREE tier blocked | Tier: FREE, cannot submit correction | 7. Tier: FREE, POST /corrections → Expect 403 |

---

### FR-PAY-001: Payroll (Starter+ Tiers)

#### FR-PAY-001.1: Basic Payroll (Starter)

**Requirement:**
Simple payroll with BPJS & PPh 21 calculation, monthly runs, payslip generation.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Monthly payroll run | POST /payroll/run (month: 2026-07) → Process | 1. POST /api/payroll/run (month: 2026-07) → Expect status = COMPLETED |
| Salary component | Employee with base salary 10M | 2. Employee salary = 10M → Verify in payslip gross = 10M |
| BPJS calculation | BPJS kesehatan 4% employee | 3. Calculate BPJS → Verify 10M × 4% = 400K deduction |
| PPh 21 calculation | PPh 21 using standard tables | 4. Calculate PPh 21 for 10M salary → Verify formula applied (5%-35% brackets) |
| Payslip generation | PDF generated per employee | 5. GET /payroll/:id/payslip.pdf → Expect PDF file |
| Payslip delivery | Email sent to employee | 6. Verify payslip email sent to employee.email with PDF attachment |
| NET calculation | Net = Gross - BPJS - PPh 21 | 7. Verify NET = 10M - 400K - PPh = ~9.2M |
| FREE tier blocked | Tier: FREE, cannot run payroll | 8. Tier: FREE, POST /payroll/run → Expect 403 |
| Payroll reports | CSV export of payroll data | 9. GET /payroll/report (format: csv) → Expect CSV with all employees |

---

#### FR-PAY-001.2: Advanced Payroll (Professional+)

**Requirement:**
Complex payroll with tax methods (GROSS/NET/GROSS-UP), employer contributions, proration, variable components.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Tax method GROSS | Employee salary = 10M gross | 1. Set tax method GROSS → Salary 10M → PPh calculated on 10M |
| Tax method NET | Employee net salary = 9M, PPh added | 2. Set tax method NET → Salary 9M → PPh calculated, gross = 9M + PPh |
| Tax method GROSS-UP | Gross calculated to net desired amount | 3. Set tax method GROSS-UP → Desired net 9M → Gross = 9M / (1-tax%) |
| PTKP allowances | PTKP varies by marital/dependents | 4. Married + 2 children → Higher PTKP → Lower PPh |
| Employer contribution | Employer BPJS 3.25% + 0.8% | 5. Verify employer_bpjs = salary × 3.25% + 0.8% |
| Variable components | Bonus, allowance, commission | 6. Add bonus 2M to payroll run → Gross = 12M |
| Multiple components | Unlimited tunjangan/potongan per employee | 7. Add 5 components (gaji, tunjangan transport, tunjangan makan, bonus, potongan seragam) → Verify all calculated |
| Proration | Mid-month join (15th) → pro-rated 50% | 8. Employee join 2026-07-15 → Salary 10M → Verify payslip = ~5M |
| THR calculation | THR = 1 month salary in Dec/before Ramadan | 9. POST /payroll/thr/run (month: 12) → Verify THR = monthly salary |
| Payroll calendar | Set scheduled payroll runs | 10. POST /payroll/calendar (day: 25) → Verify monthly run on 25th |

---

### FR-TAL-001: Talent Development (Professional+ Tiers)

#### FR-TAL-001.1: Competency Framework (Professional+)

**Requirement:**
Define competencies per organization, map to roles, version-control frameworks.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Framework creation | POST /competencies/frameworks (name, scale) | 1. POST /api/competencies/frameworks (name: "Leadership", scale: 5) → Expect 201 |
| Competency definition | Add competencies (name, description, category) | 2. Add competency "Strategic Thinking" to framework → Verify in framework.competencies |
| Proficiency levels | Define levels (1-5 or custom) | 3. Set levels: Beginner → Intermediate → Advanced → Expert → Master |
| Role mapping | Map competencies to positions with required level | 4. POST /role-competencies (positionId, competencyId, requiredLevel: 4) → Expect 201 |
| Importance weight | Each competency has importance for role | 5. Set "Strategic Thinking" importance = 5 (max) for Manager role |
| Development priority | Mark competencies for development focus | 6. Set "Strategic Thinking" developmentPriority = true → Track in IDP generation |
| Framework versioning | Clone framework → "v2" → Change v2, keep v1 | 7. POST /competencies/frameworks/:id/new-version → Expect v2 created, v1 archived |
| Bulk import | Upload CSV of competencies | 8. POST /competencies/bulk-import (csv file) → Verify 50 competencies imported |
| FREE tier blocked | Tier: FREE, cannot create framework | 9. Tier: FREE, POST /competencies → Expect 403 |

---

#### FR-TAL-001.2: Competency Assessment (Professional+)

**Requirement:**
Self, manager, and peer assessments. Gap analysis. Priority-ranked by importance weight.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Self-assessment | Employee rates own competency (1-5) | 1. Employee POST /assessments (selfRating: 4 for "Communication") → Expect 201 |
| Manager assessment | Manager rates employee (1-5) | 2. Manager POST /assessments (managerRating: 3) → Expect 201 |
| Peer review (360) | Peer rates competency | 3. Peer POST /assessments (peerRating: 4) → Expect 201 |
| Assessment workflow | Draft → Submit → Approve → Close | 4. Assessment status transitions: draft → submitted → approved → completed |
| Gap analysis | Required level vs actual level | 5. GET /competencies/gap-analysis/{empId} → Expect gap = requiredLevel - averageRating |
| Priority ranking | Sort gaps by importance weight | 6. Gaps returned sorted by (gap × importance_weight) DESC |
| Development goals | Gaps auto-populate to IDP | 7. Run gap analysis → IDP goals auto-create from top gaps |
| Assessment history | Previous assessments visible | 8. GET /assessments?history=true → Show 2023, 2024, 2025 assessments |

---

#### FR-TAL-001.3: Individual Development Plan (IDP) (Professional+)

**Requirement:**
Auto-generate from gaps or manual creation. Goal tracking. Review + recompute.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Auto-generate IDP | Based on gap analysis | 1. POST /idps/auto-generate/{empId} (based on gaps) → Expect IDP with goals from top 5 gaps |
| Manual IDP | Create custom goals (non-auto) | 2. POST /idps (goals: [...custom...]) → Expect 201 |
| Idempotent generation | Call auto-generate twice, get same IDP | 3. POST twice on same employee → Verify same IDP returned (not duplicate) |
| Goal definition | Goal type, description, target level, date | 4. Goal: "Master Strategic Thinking by 2027-12-31" → Verify all fields |
| Goal status | Not started → In progress → Completed | 5. Progress: 0% → 50% → 100% |
| Learning path | Assign courses/training to goal | 6. POST /idps/goals/:id/learning-paths (courseId) → Expect path added |
| Progress tracking | Track completion % of goals | 7. Complete course → Goal progress updated → IDP completion % increases |
| IDP review | Scheduled review (quarterly/annually) | 8. POST /idps/:id/review (comments, recommendations) → Expect review created |
| Recompute | After review, recompute priorities | 9. POST /idps/:id/recompute (updated gaps) → Verify goals reordered |
| Employee self-service | Employee can view own IDP + update progress | 10. ROLE: EMPLOYEE, GET /idps/self → Expect own IDP, can POST progress update |

---

#### FR-TAL-001.4: Learning Management System (Professional+)

**Requirement:**
Course creation, enrollment, completion tracking, certificates, learning transcripts.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Course creation | Define course (name, description, modules, duration) | 1. POST /lms/programs (name: "Leadership Essentials", modules: 5) → Expect 201 |
| Module content | Text, video, quiz, assignment | 2. Add module with video (YouTube embed) → Verify embeddable |
| Mandatory courses | Mark courses as required | 3. Set course mandatory = true → All employees must enroll |
| Recommended courses | Auto-assign based on IDP | 4. Link course to competency "Strategic Thinking" → Auto-assign to employees with gap |
| Employee enrollment | Self-enroll or assigned | 5. Employee POST /lms/enroll/:courseId → Expect enrolled |
| Enrollment tracking | View all enrolled employees | 6. GET /lms/programs/:id/enrollments → Expect list of employees |
| Completion tracking | Mark modules complete → Course complete | 7. POST /lms/modules/:id/complete → Verify progress % increased |
| Certificate generation | Auto-generate on course complete | 8. Complete course → GET /lms/certificates/:id → Expect PDF certificate |
| Certificate details | Name, course, date, score | 9. Certificate includes employee name, course name, completion date |
| Learning transcript | Show all completed courses + certificates | 10. ROLE: EMPLOYEE, GET /lms/transcript → Expect all certificates |
| Skill tagging | Map courses to competencies | 11. Course "Strategic Thinking 101" tagged to competency "Strategic Thinking" |
| Mobile access | Mobile-responsive learning platform | 12. Access LMS on mobile → Expect responsive layout |

---

### FR-BUS-001: Business Features (Business+ Tiers)

#### FR-BUS-001.1: Multi-Branch Configuration (Business+)

**Requirement:**
Different UMR, payroll rules, approval chains per branch/location.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Branch creation | Create branches (Jakarta, Surabaya, Bandung) | 1. POST /branches (name: "Jakarta", city: "Jakarta", umr: 4500000) → Expect 201 |
| Differential UMR | Jakarta 4.5M, Surabaya 3.5M | 2. Employee at Jakarta branch → UMR = 4.5M; Surabaya → UMR = 3.5M |
| Branch-specific workflows | Approval chain differs per branch | 3. Jakarta: Emp → Mgr → HR → Fin; Surabaya: Emp → Mgr → HR (no Finance) |
| Branch-specific leave | Jakarta: 12 annual days; Surabaya: 14 days | 4. Employee in Surabaya → annual leave allowance = 14 |
| Shift multiplier variance | Jakarta night shift 1.35x, Surabaya 1.2x | 5. Calculate OT pay for night shift → Jakarta 1.35x vs Surabaya 1.2x |
| Tax treatment per branch | Different tax methods per location | 6. Jakarta: GROSS-UP; Surabaya: NET → Verify different PPh calculations |
| BPJS rates differ | Kesehatan: Jakarta 4%, Surabaya 3.5% | 7. BPJS calculation → Jakarta × 4%, Surabaya × 3.5% |
| Reports by branch | Filter reports per location | 8. GET /reports/payroll?branch=Jakarta → Expect Jakarta employees only |
| Branch RBAC | HR user scoped to one branch | 9. Jakarta HR cannot see Surabaya data |

---

#### FR-BUS-001.2: Advanced Workflows (Business+)

**Requirement:**
Multi-step approval, conditional routing, amount-based escalation.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Multi-level approval | 5+ levels (Emp → Mgr → Dept Head → Finance → CEO) | 1. Create workflow with 5 approvers → Verify chain |
| Conditional routing | "If amount > 50M → escalate to CFO" | 2. Claim 60M → Route includes CFO; Claim 30M → Route excludes CFO |
| Department routing | "If dept == Engineering → Route to Eng Manager" | 3. Engineer claim → Routes to Eng Manager; Finance claim → Routes to Finance Manager |
| Location routing | "If location == Surabaya → Surabaya HR must approve" | 4. Surabaya employee claim → Surabaya HR in chain |
| Escalation rules | "If pending 3 days → Escalate to VP" | 5. Approval stuck for 3 days → Auto-escalate to VP |
| Rejection reasons | Approver can reject with reason | 6. Approver POST /approvals/:id/reject (reason: "Missing receipt") → Employee sees reason |
| Re-submit after rejection | Employee can re-submit with corrections | 7. Reject claim → Employee re-submit → Re-enters workflow |
| Approval history | Track all approvers & comments | 8. View approval log → See who approved/rejected when |

---

#### FR-BUS-001.3: REST API (Business+)

**Requirement:**
Unlimited API access for third-party integrations. Webhooks, rate limits, documentation.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| API keys | Generate API key (dnp_...) for service | 1. POST /api-keys → Expect key generated |
| Bearer auth | Authenticate with API key | 2. POST /attendance/clock-in with Bearer {key} → Expect 200 |
| Rate limits | Standard: 1000 req/hour per API key | 3. Make 1001 requests in 1 hour → 1001st returns 429 "Rate limit exceeded" |
| Unlimited webhooks | No limit on webhook count (vs Professional 10) | 4. Create 50 webhooks → Expect all active |
| Webhook events | Payroll run, Leave approved, Employee created, Attendance corrected | 5. Trigger event → Webhook payload sent to configured URL |
| Webhook retry | Failed webhook retried 3 times | 6. Webhook fails → Retry after 1min, 5min, 15min |
| API documentation | Full OpenAPI/Swagger spec | 7. GET /api/docs → Expect Swagger UI with all endpoints |
| Batch operations | POST /employees/batch (create 1000 employees) | 8. POST with array of 1000 → Expect 201 with count |
| Testing environment | Sandbox API available | 9. API key can be set to sandbox mode |

---

### FR-ENT-001: Enterprise Features (Enterprise Tier Only)

#### FR-ENT-001.1: Multi-Company (Enterprise)

**Requirement:**
Hold multiple organizations under one account. Centralized user mgmt, cross-company reporting.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| Create company link | Super Admin links multiple companies | 1. POST /platform/org-links (company1, company2) → Create link |
| Centralized dashboard | View all companies summary | 2. GET /platform/dashboard → Expect data from all linked companies |
| Cross-company user | One user login for all companies | 3. SUPER_ADMIN logs in → Can switch between companies |
| Org tree visualization | See all companies in tree | 4. GET /platform/org-tree → Expect tree with all companies |
| Cross-company reports | Compare metrics across orgs | 5. GET /reports/employees?groupBy=company → Expect headcount per company |
| Company isolation | Data not leaked between companies | 6. User in Company A cannot see Company B's salary data |

---

#### FR-ENT-001.2: SSO/SAML (Enterprise)

**Requirement:**
SAML 2.0 + Google OAuth + Microsoft Azure AD integration. JIT provisioning.

**Acceptance Criteria:**

| Criteria | Expected | Test Case |
|----------|----------|-----------|
| SAML config | Upload IdP metadata | 1. POST /sso/saml/config (metadataUrl) → Expect validated |
| SAML login | Redirect to IdP → Authenticate → Auto-login to dnPeople | 2. Click "SSO Login" → Redirect to company IdP → Login → Auto-logged in |
| Google OAuth | Client ID/Secret configured | 3. POST /sso/google/start → Redirect to Google → User approves → Auto-login |
| Microsoft Azure | Azure AD integration | 4. POST /sso/microsoft/start → Redirect to Azure → User approves → Auto-login |
| JIT provisioning | New users auto-created on first SSO login | 5. New employee logs in via SSO → User auto-created, role determined |
| Logout redirect | Logout redirects to company IdP | 6. POST /auth/logout → Redirect to IdP logout endpoint |

---

## Test Data Requirements

### Seed Data

```sql
-- Free tier company (100 employees)
INSERT INTO Company (id, name, tier) VALUES ('comp_free_001', 'Test Free Company', 'FREE');
INSERT INTO Subscription (id, companyId, tier, status) VALUES 
  ('sub_free_001', 'comp_free_001', 'FREE', 'ACTIVE');

-- Starter tier company (50 employees)
INSERT INTO Company (id, name, tier) VALUES ('comp_starter_001', 'Test Starter Company', 'STARTER');
INSERT INTO Subscription (id, companyId, tier, status, monthlyAmount) VALUES 
  ('sub_starter_001', 'comp_starter_001', 'STARTER', 'ACTIVE', 1000000);

-- Professional tier company (150 employees)
INSERT INTO Company (id, name, tier) VALUES ('comp_prof_001', 'Test Professional Company', 'PROFESSIONAL');
INSERT INTO Subscription (id, companyId, tier, status, monthlyAmount) VALUES 
  ('sub_prof_001', 'comp_prof_001', 'PROFESSIONAL', 'ACTIVE', 3750000);

-- Business tier company (500 employees, multi-branch)
INSERT INTO Company (id, name, tier) VALUES ('comp_bus_001', 'Test Business Company', 'BUSINESS');
INSERT INTO Subscription (id, companyId, tier, status, monthlyAmount) VALUES 
  ('sub_bus_001', 'comp_bus_001', 'BUSINESS', 'ACTIVE', 10000000);

-- Enterprise tier company (2000 employees, multi-company)
INSERT INTO Company (id, name, tier) VALUES ('comp_ent_001', 'Test Enterprise Company', 'ENTERPRISE');
INSERT INTO Subscription (id, companyId, tier, status, monthlyAmount) VALUES 
  ('sub_ent_001', 'comp_ent_001', 'ENTERPRISE', 'ACTIVE', 30000000);
```

---

## Performance Requirements

| Requirement | Target | Method |
|-------------|--------|--------|
| Subscription check latency | <50ms | Redis cache tier lookups |
| Feature gating overhead | <1ms per request | In-memory feature map |
| Tier-based list filtering | <500ms for 10K records | Database index on subscriptionTier |
| API rate limiting | Consistent 1000 req/hour | Token bucket algorithm |

---

## Security Requirements

| Requirement | Implementation |
|-------------|-----------------|
| API key theft | Keys rotated every 90 days, can be regenerated anytime |
| Subscription bypass | All features check subscription tier server-side (not client) |
| Data isolation | Row-level security ensures user only sees their company data |
| Audit trail | Every tier change, feature enable, payment logged |

---

*Last Updated: July 16, 2026*
