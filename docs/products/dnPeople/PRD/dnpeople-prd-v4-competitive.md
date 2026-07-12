# dnPeople HRIS - Product Requirements Document (PRD v4)

**Version:** 4.0 - Competitive Alignment Edition  
**Date:** July 2026  
**Target:** Position dnPeople at feature parity + differentiation vs Mekari Talenta by Q4 2026  
**Audience:** Product, Engineering, Marketing, Customer Success

---

## Executive Summary: Competitive Positioning

### Current State vs Market Leader

**Mekari Talenta** (market leader, $50M+ ARR):
- Comprehensive HCM solution with end-to-end features from recruitment and payroll to performance management, with competitive talent management via 9-box matrix and Individual Development Plans, accessible via mobile app for thousands of employees
- Pre-built PPh 21 and BPJS formulas with rapid regulatory updates (1-2 weeks), familiar UI for new users, complete mobile app for employees, but template-based workflow approval with limited customization for complex approval chains
- Positioning: Enterprise-grade HCM for mid-market + enterprise, unified Mekari ecosystem play
- Weakness: Limited customization for highly complex multi-branch workflows; pricing scales significantly for advanced features

**dnPeople (Current Implementation)**:
- Available now: Employee lifecycle, attendance, leave, payroll (BPJS/PPh 21), recruitment, onboarding, performance, training, asset management, offboarding
- Advanced features ready: Digital offer, multi-company platform, API integrations, custom workflows, AI assistants, row-level security
- **Gap vs Talenta:** Talent development (IDP/succession/competency mapping), integrated LMS, 9-box matrix, earned wage access, industry-specific configurations, advanced talent mobility features

### PRD v4 Objective

**Make dnPeople the most customizable, developer-friendly Indonesian HRIS that competes directly with Talenta on feature completeness while offering:**

1. **Superior customization** for multi-branch companies with differential UMR, workflows, and approval chains per region
2. **Best-in-class talent development** via integrated LMS, competency frameworks, automated 9-box analysis, and succession readiness scoring
3. **Developer-first integrations** (API-first, webhook-first, custom workflows without clicking)
4. **Cost-effective pricing** for mid-market segment without feature-tier escalation
5. **Earned wage access** for working-class workforce (manufacturing, retail, F&B)
6. **Vertical solutions** for manufacturing, retail, hospitality with pre-built shift/payroll configurations

**Release timeline:**
- Q3 2026: Talent development MVP (competency framework, IDP, basic succession)
- Q4 2026: Integrated LMS, 9-box matrix automation, earned wage access
- Q1 2027: Industry-specific solutions, advanced mobility features, talent analytics
- H2 2027: Vertical specialization, advanced AI/predictive HR

---

## 1. Talent Development & Strategic HR (NEW - Modules 1-5)

### Module 1: Competency Framework & Mapping

#### Feature 1.1: Competency Framework Management
**As a** HR Director  
**I want to** define organizational competencies and map them to roles/levels  
**So that** I can identify skill gaps and guide development

**Requirements:**
- Create competency library (behavioral, technical, leadership)
- Define proficiency levels (1-5 or custom scale)
- Map competencies to positions, departments, levels
- Version control on frameworks
- Bulk import from Excel
- Competency importance weighting per role

**Data Model:**
```
Table: competency_frameworks
- id: UUID
- company_id: UUID
- name: String (e.g., "Leadership Competencies")
- description: Text
- proficiency_scale: Int (3, 4, 5 levels)
- status: Enum (draft, active, archived)

Table: competencies
- id: UUID
- framework_id: UUID
- name: String (e.g., "Communication")
- description: Text
- category: Enum (behavioral, technical, leadership)
- proficiency_levels: JSON (e.g., [{level: 1, description: "Basic"}, ...])

Table: role_competencies (junction)
- id: UUID
- position_id: UUID
- competency_id: UUID
- required_level: Int
- importance_weight: Decimal (1-5)
- development_priority: Boolean
```

**API Endpoints:**
```
POST/GET/PATCH/DELETE /api/competency-frameworks
POST/GET /api/competencies
POST/GET /api/role-competencies
GET /api/competencies/gap-analysis/{employeeId} (skill gaps)
POST /api/competencies/bulk-import
```

**UI:**
- Competency library with search, category filter
- Position competency matrix (position → required competencies → level)
- Employee current vs required skills visualization
- Bulk assignment interface

---

#### Feature 1.2: Competency Assessment
**As a** Manager  
**I want to** evaluate current competency levels of team members  
**So that** I can identify development priorities

**Requirements:**
- Self-assessment by employee
- Manager assessment
- Peer review (optional)
- Multi-rater assessment
- Assessment history/timeline
- Comparison: current vs required for target role

**Data Model:**
```
Table: competency_assessments
- id: UUID
- employee_id: UUID
- assessed_by_user_id: UUID
- assessment_type: Enum (self, manager, peer, 360)
- date: Date
- competencies: JSON (array of {competency_id, assessed_level, comment})
- status: Enum (draft, submitted, approved)
```

**Workflow:**
1. Manager initiates competency assessment
2. Employee self-assess
3. Manager reviews & confirms
4. System generates skill gap report
5. IDP recommendations auto-generated

---

### Module 2: Individual Development Plan (IDP) with LMS Integration

#### Feature 2.1: IDP Creation & Management
**As a** Manager  
**I want to** create structured development plans for high-potential employees  
**So that** they have clear career progression roadmap

**Requirements:**
- Template-based IDP (role-based, level-based)
- Short-term (6-month) & long-term (2-year) goals
- Competency gap → learning path auto-mapping
- On-the-job training assignments
- Mentoring/coaching relationships
- Review & progress tracking
- Idempotent IDP generation (avoid duplicates)

**Data Model:**
```
Table: idps
- id: UUID
- employee_id: UUID
- created_by_user_id: UUID
- start_date: Date
- end_date: Date
- target_role_id: UUID (nullable)
- current_role_id: UUID
- status: Enum (draft, active, completed, archived)
- completion_percentage: Decimal
- last_reviewed_date: Date
- review_frequency: Enum (monthly, quarterly, semi_annual)

Table: idp_goals
- id: UUID
- idp_id: UUID
- goal_type: Enum (competency_development, role_readiness, technical_skill)
- goal_description: String
- target_competency_id: UUID (nullable)
- target_level: Int
- start_date: Date
- target_date: Date
- status: Enum (not_started, in_progress, completed, on_hold)

Table: idp_learning_paths
- id: UUID
- idp_goal_id: UUID
- learning_method: Enum (course, on_the_job, mentoring, project_assignment)
- resource_id: UUID (course_id, training_id, mentor_id, etc)
- required: Boolean
- status: Enum (planned, in_progress, completed)

Table: idp_progress_tracking
- id: UUID
- idp_id: UUID
- review_date: Date
- reviewed_by_user_id: UUID
- competency_id: UUID
- current_level: Int
- target_level: Int
- assessment: Text
- recommendations: Text
```

**API Endpoints:**
```
POST /api/idps (auto-generate from competency gap analysis)
GET /api/idps/{employeeId}
PATCH /api/idps/{idpId}
GET /api/idps/{idpId}/progress
POST /api/idps/{idpId}/review
GET /api/idps/templates
POST /api/idps/bulk-generate (by role/level/department)
```

**Integration with LMS:**
- IDP → auto-suggest courses from LMS library
- Course completion → update IDP progress
- Learning transcript visible in IDP

---

#### Feature 2.2: Learning Path & Skill Building
**As an** Employee  
**I want to** see my personalized learning path and enroll in relevant courses  
**So that** I can develop skills for career progression

**Requirements:**
- LMS course library (create, assign, track)
- Learning paths (structured curriculum)
- Micro-learning support
- Video, document, quiz, assignment types
- Completion tracking & certification
- Skill tagging (tie course to competencies)
- Mobile-first learning access

**Data Model:**
```
Table: learning_programs
- id: UUID
- company_id: UUID
- name: String
- description: Text
- program_type: Enum (course, learning_path, certification)
- duration_hours: Int
- difficulty_level: Enum (beginner, intermediate, advanced)
- competencies: Array of UUID (skills taught)
- created_by_user_id: UUID
- status: Enum (draft, published, archived)

Table: learning_modules
- id: UUID
- program_id: UUID
- module_order: Int
- title: String
- content_type: Enum (video, document, interactive, quiz)
- content_url: String
- duration_minutes: Int

Table: employee_enrollments
- id: UUID
- employee_id: UUID
- program_id: UUID
- enrolled_date: Date
- enrolled_by: Enum (self, manager_assigned, system_required)
- enrollment_status: Enum (active, completed, dropped)
- start_date: Date
- completion_date: Date (nullable)
- completion_percentage: Decimal
- final_score: Decimal (nullable, for quizzes)

Table: module_completions
- id: UUID
- enrollment_id: UUID
- module_id: UUID
- completed_at: Timestamp
- score: Decimal (for assessments)
- notes: Text
```

**LMS Features:**
- Course catalog with search, difficulty, duration filters
- Mandatory courses (compliance training, onboarding)
- Recommended courses (based on IDP, competency gap)
- Learning progress dashboard (mobile-optimized)
- Completion certificate generation
- Manager can assign courses
- Learning transcript for performance reviews
- Integration with performance bonus (learning completion → bonus eligibility)

**API Endpoints:**
```
GET /api/lms/programs (search, filter)
POST /api/lms/programs (create course)
POST /api/lms/enrollments (enroll employee)
GET /api/lms/enrollments/{employeeId} (my courses)
PATCH /api/lms/enrollments/{enrollmentId}/progress
GET /api/lms/certificates/{enrollmentId}
GET /api/lms/transcript (learning history for employee)
```

---

### Module 3: 9-Box Matrix & Talent Analytics

#### Feature 3.1: Automated 9-Box Matrix
**As a** HR Director  
**I want to** automatically generate 9-box matrix based on performance & potential  
**So that** I can visually map talent and make promotion/development decisions

**Requirements:**
- Auto-populate from performance reviews (annual/ongoing scores)
- Auto-calculate potential index (leadership readiness score)
- Potential factors: KPI achievement, 360-feedback, learning agility, promotion history
- 9-box visualization with employee names/positions
- Drill-down capability (click box → employee list → individual profiles)
- Calibration session tracking (manager discussions)
- Export to Excel/PDF
- Recommendation engine per box
- Historical tracking (9-box evolution over time)

**Potential Calculation Algorithm:**
```
potential_score = (
  0.3 * leadership_readiness_score +  // from 360-feedback or assessment
  0.25 * learning_agility_score +      // from learning program completion & performance improvement trend
  0.2 * kpi_consistency_score +        // consistency across periods
  0.15 * peer_feedback_score +         // collaboration, influence
  0.1 * promotion_readiness_score      // manager assessment
)

performance_score = (
  0.6 * kpi_achievement_vs_target +   // latest 3-month average
  0.2 * quality_of_work_score +       // from manager review
  0.2 * team_impact_score             // peer feedback
)

9_box_position = (
  x_axis: performance_score (0-100),
  y_axis: potential_score (0-100),
  box: determine_box(x, y)  // 3x3 grid
)
```

**Data Model:**
```
Table: talent_matrices
- id: UUID
- company_id: UUID
- period_date: Date (annual calibration date)
- assessment_type: Enum (annual, quarterly)
- creation_date: Timestamp
- created_by_user_id: UUID
- status: Enum (draft, calibrated, approved, archived)

Table: talent_matrix_entries
- id: UUID
- matrix_id: UUID
- employee_id: UUID
- performance_score: Decimal (0-100)
- potential_score: Decimal (0-100)
- box_position: String (e.g., "9", "5", "1") // 3x3 = positions 1-9
- box_category: String (e.g., "High Performer High Potential", "Solid Contributor", etc)
- development_recommendation: Text
- manager_comment: Text
```

**9-Box Categories & Recommended Actions:**

| Box | Label | Performance | Potential | Recommended Action |
|-----|-------|-------------|-----------|-------------------|
| 1 | Star | High | High | Accelerate for leadership roles, mentoring, high-visibility projects |
| 2 | High Potential | Medium | High | Cross-functional assignments, leadership training, succession prep |
| 3 | Emerging | Low | High | Intensive coaching, skill development, clear performance expectations |
| 4 | Solid Performer | High | Medium | Lateral moves, expertise development, specialist career track |
| 5 | Steady Contributor | Medium | Medium | Maintain engagement, continuous learning, stability focus |
| 6 | Developing | Low | Medium | Performance improvement plan, training, role optimization |
| 7 | Proven Expert | High | Low | Expert/specialist roles, knowledge transfer, mentoring |
| 8 | At Risk | Medium | Low | Explore role fit, performance support, retention strategy |
| 9 | Underperformer | Low | Low | Performance improvement plan, transition planning |

**API Endpoints:**
```
POST /api/talent-matrices/generate (auto-calculate from performance data)
GET /api/talent-matrices/{matrixId} (view matrix)
GET /api/talent-matrices/{matrixId}/9box (visualization data)
GET /api/talent-matrices/{matrixId}/box/{position} (employees in a box)
POST /api/talent-matrices/{matrixId}/calibrate (manager calibration session)
PATCH /api/talent-matrix-entries/{entryId} (update entry)
GET /api/talent-matrices/report (Excel export)
```

**UI Components:**
- 3x3 grid with bubbles (size = headcount per box)
- Interactive: hover → see employees, click → drill down
- Manager notes/recommendations per box
- Calibration workflow: "Enter Calibration Mode" → review entries → approve
- Timeline: view 2024, 2025, 2026 matrices side-by-side to track movement

---

#### Feature 3.2: Succession Planning & Readiness
**As a** HR Director / CEO  
**I want to** identify successor candidates for critical roles and track their readiness  
**So that** we can maintain continuity when leaders transition

**Requirements:**
- Define critical/key positions (CEO, VP, etc)
- Successor pools per critical role (primary, secondary, tertiary)
- Readiness levels: "Ready Now", "Ready in 1-2 Years", "Ready in 3+ Years"
- Readiness scoring (role-specific requirements vs employee competencies)
- Gap analysis per successor (missing skills, experience)
- Recommended development actions
- Succession readiness report
- Succession events timeline (planned retirements, promotions)

**Data Model:**
```
Table: critical_positions
- id: UUID
- company_id: UUID
- position_id: UUID
- criticality_level: Enum (critical, strategic, important)
- replacement_urgency: Enum (immediate, 1_year, 2_years, 3_plus_years)
- current_holder_id: UUID (employee_id)
- transition_plan: Text
- required_competencies: Array of UUID (must-have skills)

Table: successor_pools
- id: UUID
- critical_position_id: UUID
- successor_rank: Int (1=primary, 2=secondary, 3=tertiary)
- employee_id: UUID
- readiness_level: Enum (ready_now, ready_1_2_years, ready_3_plus_years)
- readiness_score: Decimal (0-100)
- readiness_factors: JSON
  {
    competency_readiness: Decimal,
    experience_readiness: Decimal,
    leadership_readiness: Decimal,
    learning_velocity: Decimal
  }
- development_gaps: Array of {competency_id, current_level, required_level}
- recommended_actions: Text (e.g., "Complete MBA", "Lead cross-functional project")
- assessment_date: Date
- assessment_by_user_id: UUID
- status: Enum (candidate, active_successor, promoted, exited)
```

**Readiness Calculation:**
```
readiness_score = (
  0.25 * competency_readiness +
  0.3 * role_experience_years_normalized +
  0.25 * leadership_readiness +
  0.2 * cultural_fit_assessment
)

readiness_level:
  if readiness_score >= 80: "Ready Now"
  elif readiness_score >= 60: "Ready in 1-2 Years"
  else: "Ready in 3+ Years"
```

**API Endpoints:**
```
POST /api/succession-planning/critical-positions
GET /api/succession-planning/critical-positions
POST /api/succession-planning/successor-pools
GET /api/succession-planning/successor-pools/{positionId}
PATCH /api/succession-planning/successor-pools/{poolId}
GET /api/succession-planning/readiness-report
POST /api/succession-planning/succession-events (track timeline)
```

**Features:**
- Succession tree visualization (current role → successors ranked)
- Readiness heatmap (red/yellow/green by competency)
- Development plan auto-generated per successor
- Succession event: trigger actions when promotion occurs
- Retention alerts (when potential successor is at risk of leaving)

---

### Module 4: Talent Mobility & Internal Movement

#### Feature 4.1: Internal Career Marketplace
**As an** Employee  
**I want to** see open internal opportunities aligned with my skills and career goals  
**So that** I can pursue internal mobility

**Requirements:**
- Internal job postings (internal-only or internal-first)
- Career interest survey (employees indicate interests, skills)
- Career path visibility (current → target role roadmap)
- Match score (employee profile vs job requirements)
- Internal applications tracking
- Manager approval/coaching for internal moves
- Transfer records & career history visualization

**Data Model:**
```
Table: internal_opportunities
- id: UUID
- company_id: UUID
- position_id: UUID
- posting_date: Date
- closing_date: Date (nullable, for rolling openings)
- priority_level: Enum (internal_only, internal_first, open)
- required_competencies: Array of UUID
- preferred_experience_months: Int
- mobility_type: Enum (promotion, lateral_move, rotation, expatriate)
- assignment_duration: Int (months, nullable for permanent)
- brief_description: String
- application_status: Enum (open, reviewing, offer_made, closed)

Table: employee_career_interests
- id: UUID
- employee_id: UUID
- target_role_id: UUID (nullable)
- target_function_area: String (optional)
- preferred_location: Array of String
- willing_to_relocate: Boolean
- preferred_assignment_type: Array of String (rotation, expatriate, etc)
- last_updated: Date

Table: internal_applications
- id: UUID
- opportunity_id: UUID
- applicant_employee_id: UUID
- application_date: Date
- match_score: Decimal (0-100)
- match_details: JSON (competency matches, skill gaps)
- application_status: Enum (applied, shortlisted, interviewed, offer_made, accepted, rejected)
- manager_recommendation: Text
- hiring_manager_feedback: Text
```

**Match Algorithm:**
```
match_score = (
  0.4 * competency_match_score +
  0.3 * experience_match_score +
  0.2 * performance_score +
  0.1 * cultural_fit_score
)

competency_match_score = (
  SUM(has_required_competency * competency_importance_weight) / 
  SUM(competency_importance_weight)
)
```

**API Endpoints:**
```
GET /api/internal-opportunities (search, filter by role, location)
POST /api/career-interests (save my interests)
GET /api/career-paths/{employeeId} (visualization)
POST /api/internal-applications (apply for internal role)
GET /api/internal-applications/{employeeId} (my applications)
PATCH /api/internal-applications/{appId}/status
GET /api/internal-opportunities/{oppId}/applicants (for hiring manager)
```

---

#### Feature 4.2: Rotation & Cross-Functional Programs
**As a** Manager / HR  
**I want to** assign high-potential employees to rotation programs or cross-functional projects  
**So that** they gain exposure and accelerate readiness for leadership

**Requirements:**
- Rotation program templates (duration, target roles, learning objectives)
- Cross-functional project assignments (with defined learning outcomes)
- Assignment tracking (start, planned end, actual end)
- Host manager feedback on rotee
- Competency development tracking during rotation
- Return-to-home-role management
- Talent mobility analytics (internal mover vs stayer performance comparison)

---

## 2. Payroll & Employee Finance Enhancements (Updates to existing modules)

### Module 5: Earned Wage Access (EWA)

#### Feature 5.1: On-Demand Wage Advances
**As an** Employee  
**I want to** access earned wages early if I need cash  
**So that** I don't need to borrow from informal lenders

**Use Case:**
- Manufacturing: Line workers earning IDR 50-100K/day
- Retail/F&B: Shift workers, daily wage basis
- Gig workers: Project-based earnings
- Status: Critical feature for Talenta adoption in manufacturing/retail segments

**Requirements:**
- On-demand advance requests (employee submits amount, reason)
- Advance calculation (based on YTD earned but unpaid wages)
- Fee structure (transaction fee, optional interest)
- Daily/weekly limits (configurable)
- Approval workflow (auto-approve up to limit, manager for excess)
- Deduction from next salary
- Transaction history
- Mobile-first interface

**Data Model:**
```
Table: ewa_policies
- id: UUID
- company_id: UUID
- enabled: Boolean
- daily_limit: Decimal
- monthly_limit: Decimal
- advance_fee_type: Enum (fixed, percentage, none)
- advance_fee_amount: Decimal
- maximum_advance_days: Int (e.g., 7 days of wages max)
- processing_time_hours: Int (when funds available)
- auto_approve_threshold: Decimal (auto-approve < this amount)

Table: ewa_advances
- id: UUID
- employee_id: UUID
- request_date: Timestamp
- requested_amount: Decimal
- approved_amount: Decimal
- fee_amount: Decimal
- net_amount: Decimal (approved - fee)
- reason: String
- status: Enum (pending, approved, rejected, paid, deducted_from_payroll)
- processed_at: Timestamp
- deducted_from_payroll_id: UUID (link to payroll deduction)
```

**Workflow:**
1. Employee opens mobile app → EWA widget
2. Checks current balance (earned but unpaid wages)
3. Requests advance amount
4. System auto-approves if within policy limits
5. Funds transferred to employee bank account (next business day)
6. Automatic deduction from next salary
7. Notification to employee

**Pricing Model (for dnPeople monetization):**
- White-label EWA: Platform charges 0.5% of transaction volume to company
- Company decides if fees passed to employee or absorbed

**API Endpoints:**
```
GET /api/ewa/balance/{employeeId} (earned but unpaid)
POST /api/ewa/advances (request advance)
GET /api/ewa/advances/{employeeId} (my advances)
PATCH /api/ewa/advances/{advanceId}/approve
PATCH /api/ewa/advances/{advanceId}/reject
GET /api/ewa/policy (current settings)
PATCH /api/ewa/policy (update by Finance)
```

**Security & Compliance:**
- KYC verification (collect bank details securely)
- Fraud detection (unusual patterns, repeat requests)
- Audit trail (who requested, approved, transferred, deducted)
- Compliance: Align with Bank Indonesia guidelines (if applicable)

---

### Module 6: Dynamic Salary Revision & Benchmarking (NEW)

#### Feature 6.1: Salary Benchmarking & Adjustment Workflows
**As a** Finance / HR Director  
**I want to** conduct annual salary review with market benchmarks  
**So that** we stay competitive and fair

**Requirements:**
- Link to market salary data (e.g., Salary.com, LinkedIn Salary insights)
- Benchmark positions against market (50th percentile, 75th percentile, etc)
- Identify under/over-paid employees
- Salary adjustment recommendations (merit, promotion, market correction)
- Bulk approval workflow
- Effective date management (Jan 1, staggered dates per department)
- Historical tracking of salary changes
- Transparency report (who got raises, total budget)

**Workflow:**
1. HR imports market benchmarks for key roles
2. System compares current salary vs market 50th percentile
3. Flags employees: red (significantly below market), yellow (slightly below), green (market-aligned)
4. HR/Manager proposes adjustments
5. Finance approves within budget envelope
6. Effective date triggers automatic payroll component update
7. Notifications to employees and managers

---

## 3. Industry-Specific Configurations (NEW - Roadmap)

### Module 7: Manufacturing-Specific Solutions

**Key differences for manufacturing (1000+ employees, shift-based):**

#### Feature 7.1: Complex Shift Scheduling
- Overnight shift support with extra pay multiplier
- Shift rotation patterns (5-2-5-3 rotating)
- Shift swap with cross-shift premium
- Machine downtime → automatic attendance override
- Night shift BPJS contribution adjustment (higher rate)

#### Feature 7.2: Production Incentives & Bonus
- Output-based incentives (pieces per hour, defect rate)
- Line/machine-based bonus calculation
- Team bonus pools (line bonuses split among team)
- Quarterly performance bonuses (quality, safety, attendance)
- Automatic calculation from production system data (API integration)

#### Feature 7.3: Safety & Compliance
- Incident reporting & investigation workflow
- Safety certification tracking
- Training requirements per role (PPE, machinery operation)
- Discipline for safety violations
- Safety metrics dashboard (TRIR, LTIR, lost-time injuries)

#### Feature 7.4: Earned Wage Access (EWA) Pre-built
- Daily wage calculation (many manufacturers pay daily)
- EWA enabled by default for manufacturing companies
- Advance limits tied to weekly earnings
- Multiple bank account support (employee has multiple accounts)

---

### Module 8: Retail & F&B Solutions

**Key differences for retail/hospitality (high turnover, gig-like):**

#### Feature 8.1: Task Management & Scheduling
- Crew scheduling (who works which shift)
- Task assignment (manage, train, serve, etc)
- Real-time readiness (know which crew members clocked in)
- Duty assignment (POS, kitchen, floor, management)

#### Feature 8.2: Tips & Service Charges
- Tip collection tracking (card tips, cash tips, pool)
- Automatic tip distribution rules (by hours worked, role)
- Tax withholding on tips
- Dispute handling (customer complaint → tip clawback)

#### Feature 8.3: High-Volume Recruitment
- Quick hire workflow (apply, approve, onboard same day)
- Batch hiring (recruit 50 people for new outlet)
- Bulk onboarding (assign to shift, training playlist)
- Quick exit (resignation, termination, asset return)

---

## 4. Advanced Customization & Multi-Branch Governance

### Module 9: Differential Configuration by Region/Branch

**Current limitation (Talenta weakness that dnPeople differentiates on):**
- Template-based workflows don't handle: UMR differs by city, approval chains differ, shift patterns differ, local regulations differ

**dnPeople v4 Solution:**

#### Feature 9.1: Branch/Region Configuration Profiles
```
branch_config = {
  branch_id: UUID,
  umr: Decimal (minimum wage),
  umr_effective_date: Date,
  work_schedule: { start_time, end_time, work_days },
  leave_policies: { annual_leave_days, sick_leave_policy },
  tax_treatment: "GROSS" | "NET" | "GROSS_UP",
  bpjs_rates: { kesehatan_employee, ketenagakerjaan_employee },
  approval_workflows: custom_approval_tree,
  shift_multipliers: { night_shift: 1.35, weekend: 1.5 },
  local_regulations: { comment: "Per Bandung regional reg", ... }
}
```

#### Feature 9.2: Rule-Based Payroll Routing
- Rule engine: "IF department='Manufacturing' AND branch='Jakarta' → use_shift_multiplier AND apply_night_premium"
- No template selection; rules auto-apply based on employee context
- Audit trail: which rule applied to which employee

#### Feature 9.3: Approval Chain per Organization Context
- Not just role-based; also location/department/hierarchy context
- E.g., "Jakarta manufacturing cuti approval: Employee → Line Lead → Department Manager → Jakarta HR → Finance"
- E.g., "Bandung retail: Employee → Store Manager → Bandung HR"
- Conditional routing: "If amount > IDR 10M → Finance Director approval"

---

## 5. Performance & Scalability NFR

### Non-Functional Requirements

#### Scalability
- Support 500K+ employee database (current: 50K tested)
- Handle 100K+ concurrent clock-in requests during shift change
- Payroll for 50K employees in <10 minutes
- Report generation for 100K rows in <5 seconds

#### Performance
- API p95 latency: <200ms (current baseline)
- Mobile app: First meaningful paint <2s
- Chart rendering: <1s for dashboards with 1000+ data points

#### Security
- Field-level encryption for: salary, NPWP, bank account, tax ID
- Audit trail: every API call logged with before/after values
- SAML/SSO for enterprise customers
- Row-level security: Manager sees only own department

#### Compliance
- UU PDP (Indonesian Data Protection Law) compliance
- Right to be forgotten: Soft-delete with 30-day purge
- GDPR-ready (for future SEA expansion)
- Tax compliance: E-faktur integration ready (not MVP)

---

## 6. Competitive Pricing & Packaging (NEW)

**Problem:** Talenta pricing escalates significantly (3-5x) when adding advanced features

**dnPeople v4 Strategy:** Flat feature set per tier (no feature segregation by advanced/premium)

### Pricing Tiers (per employee/month)

| Tier | Employees | Monthly Cost | Included |
|------|-----------|--------------|----------|
| **Starter** | 10-50 | IDR 100K ($6) | Core HR, attendance, basic leave, simple payroll |
| **Professional** | 50-200 | IDR 150K ($9) | + Payroll automation, BPJS/PPh 21, shift management, overtime, EWA |
| **Enterprise** | 200-1000 | IDR 200K ($12) | + Talent management (IDP, 9-box, succession), LMS, advanced workflows |
| **Enterprise+** | 1000+ | IDR 150K ($9) | + Vertical solutions, custom integrations, dedicated support |

**Key differentiator:** NO feature gatekeeping. All 3 talent management modules (IDP, 9-box, succession) in Professional tier.

**Add-ons:** (separate line items)
- Industry-specific package: +IDR 50K (manufacturing, retail)
- Earned wage access: +IDR 25K (+ 0.5% of transaction volume to company)
- Advanced analytics: +IDR 75K
- Custom integrations: +IDR 100K-500K (per integration)
- White-label: +IDR 500K/month

---

## 7. Go-to-Market Strategy

### Positioning Statement
**"dnPeople is the most customizable Indonesian HRIS for mid-market companies that outgrow Talenta's template limitations. Purpose-built for complex multi-branch operations, talent development, and developer integration—without 3x pricing escalation."**

### Target Segments

**Primary:**
- Manufacturing (500-5000 employees): Complex shift, multi-branch payroll, safety compliance
- Retail/F&B chains (100-2000 employees): High hiring velocity, EWA, crew scheduling
- Mid-market finance/services (200-1000 employees): Complex approval workflows, talent mobility

**Secondary:**
- IT/tech companies (50-500): Developer-friendly APIs, custom workflows, on-premises option
- Government/NGO: Compliance-heavy, regulatory reporting (future)

### Success Metrics (Year 1)

- **Customer acquisition:** 200 paying customers by end of 2026, 500 by end of 2027
- **ARR:** IDR 3B ($180K) by end of 2026, IDR 10B ($600K) by end of 2027
- **Customer satisfaction:** NPS >50, <5% monthly churn
- **Feature adoption:** 70% of customers use talent management module within first 6 months
- **Competitive win rate:** Win 30% of Talenta comparison deals in manufacturing segment

---

## 8. Development Roadmap

### Q3 2026 (3 months): Talent Development Foundation
- Competency framework CRUD
- Competency assessment (self, manager)
- Basic IDP creation & goal tracking
- LMS course library (CRUD, enroll, track)

### Q4 2026 (3 months): Talent Analytics & Mobility
- 9-box matrix automation & visualization
- Succession planning module
- Internal career marketplace
- Earned wage access MVP
- Salary benchmarking tool

### Q1 2027 (3 months): Advanced Features & Vertical Solutions
- Rotation/cross-functional programs
- Manufacturing-specific package (shift complexity, incentives, safety)
- Retail-specific package (crew scheduling, tips, high-volume hiring)
- Dynamic salary revision workflows
- Advanced talent analytics (mobility metrics, prediction models)

### Q2-H2 2027: Enterprise Scale & AI
- Predictive attrition modeling
- AI-powered talent recommendations
- Accounting system integrations (Jurnal, E-faktur)
- Mobile-app feature parity with web
- Industry-specific SaaS certifications

---

## 9. Success Criteria & Acceptance

### PRD Acceptance Gates

**Product:**
- ✅ Feature parity with Talenta on core HRIS (✓ current implementation)
- ✅ Talent management feature spec complete (this document)
- ✅ Pricing & positioning approved by leadership
- ✅ Customer advisory board feedback incorporated (>70% positive)

**Engineering:**
- ✅ Competency framework API tested & documented
- ✅ 9-box matrix algorithm validated with HR sample data
- ✅ LMS schema designed & scalable for 10K+ courses
- ✅ EWA bank integration partner confirmed
- ✅ Performance testing on 500K employee dataset

**Marketing:**
- ✅ Competitive positioning deck ready
- ✅ Manufacturing customer case study (pilot)
- ✅ Website updated with talent management messaging
- ✅ Sales training materials (vs Talenta comparison)

**Customer Success:**
- ✅ Onboarding playbook for talent management
- ✅ Training videos for IDP, 9-box, LMS
- ✅ Success metric tracking (adoption rate)

---

## 10. Appendix: Feature Comparison Matrix

| Feature | dnPeople v3 | dnPeople v4 | Talenta 2026 | Differentiator |
|---------|------------|------------|-------------|---------------|
| **Core HRIS** | ✓ | ✓ | ✓ | Parity |
| Employee master | ✓ | ✓ | ✓ | Parity |
| Attendance | ✓ | ✓ | ✓ | Parity |
| Leave mgmt | ✓ | ✓ | ✓ | Parity |
| Payroll | ✓ | ✓ | ✓ | Parity |
| Recruitment | ✓ | ✓ | ✓ | Parity |
| **Talent Development** | ✗ | ✓ | ✓ | **dnPeople: No additional cost; Talenta: +IDR 200K/mo** |
| Competency framework | ✗ | ✓ | ✓ | dnPeople: v4 |
| IDP | ✗ | ✓ | ✓ | dnPeople: v4 |
| LMS | ✗ | ✓ | ✓ | dnPeople: v4 |
| 9-box matrix | ✗ | ✓ | ✓ | dnPeople: Automated + visualization |
| Succession planning | ✗ | ✓ | ✓ | dnPeople: v4 |
| **Customization** | Partial | Advanced | Template-based | **dnPeople: Rule-based, no limits** |
| Multi-branch differential UMR | Limited | ✓ | Limited | dnPeople: Advanced rule engine |
| Custom approval chains | ✓ | ✓ | Template | dnPeople: Flexible |
| **Vertical Solutions** | ✗ | ✓ | ✓ | dnPeople: Purpose-built configs |
| Manufacturing | ✗ | ✓ (v1) | ✓ | dnPeople: Complex shift, incentives |
| Retail/F&B | ✗ | ✓ (v1) | ✓ | dnPeople: EWA, crew scheduling |
| **Employee Finance** | Partial | ✓ | Partial | dnPeople: EWA, salary benchmarking |
| Earned wage access | ✗ | ✓ | Limited | dnPeople: v4 |
| Employee loans | ✓ | ✓ | ✓ | Parity |
| Claims | ✓ | ✓ | ✓ | Parity |
| **Pricing** | Transparent | Flat per tier | Escalates | **dnPeople: No feature tier-up; Talenta: 3-5x for advanced** |
| Talent mgmt cost | Free (v4) | Incl. | +IDR 200K | dnPeople: Competitive |

---

## Glossary & Definitions

- **IDP:** Individual Development Plan; career development roadmap for employee
- **9-Box Matrix:** 2x2 grid mapping performance vs potential to categorize talent
- **Competency:** Skill, behavior, or capability required for a role
- **Succession Planning:** Identifying & preparing replacements for critical roles
- **EWA:** Earned Wage Access; on-demand salary advance
- **UMR:** Upah Minimum Regional (regional minimum wage, varies by city)
- **PTKP:** Personal non-taxable income threshold (Indonesia tax)
- **LMS:** Learning Management System; course delivery & tracking
- **OKR:** Objectives & Key Results; goal-setting framework
- **KPI:** Key Performance Indicator; quantified metric

---

## Document History & Review

| Version | Date | Author | Status |
|---------|------|--------|--------|
| 1.0 | 2024-06-01 | Dozer | Initial (v3) |
| 2.0 | 2025-01-15 | Dozer | Added MVP 2 |
| 3.0 | 2026-07-09 | Dozer | Extended features |
| 4.0 | 2026-07-12 | Dozer | **Competitive alignment vs Talenta** |

**Next review:** August 2026 (after market research, customer feedback)

**Stakeholders to approve:**
- [ ] Product Lead
- [ ] Engineering Lead
- [ ] Finance/Pricing
- [ ] Customer Advisory Board (manufacturing + retail representatives)
