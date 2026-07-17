# dnPeople — PRD Index & Version History

**Master Index of Product Requirements**  
**Owner:** Dozer (CEO + Tech Lead)  
**Last Updated:** July 16, 2026  
**Current Version:** v5 (Subscription Tier & Feature Gating)

---

## PRD Versions Overview

| Version | Focus | Status | Date | File |
|---------|-------|--------|------|------|
| **v3** | Core HR (MVP 1-3) | ✅ Implemented | Q3-Q4 2026 | `dnpeople-prd.md` |
| **v4** | Competitive + Talent Dev (MVP 4-5) | ✅ Implemented | Q1-Q2 2027 | `dnpeople-prd-v4-*.md` |
| **v5** | Feature Tier & Subscription | ✅ Implemented | July 2026 | `dnpeople-prd-v5-*.md` |
| **v6** | Post-launch (roadmap) | ⏳ Pending | 2027+ | TBD |

---

## Detailed Version Breakdown

### 📄 PRD v3 — Core HR & MVP Roadmap

**File:** `dnpeople-prd.md` (25 KB)

**Scope:**
- Employee lifecycle (hire, profile, documents, offboarding)
- Attendance (clock-in/out, corrections, reports)
- Leave management (request, approval, balance)
- Payroll (BPJS, PPh 21, payslip, salary components)
- Dashboard & basic reports
- Audit trail & compliance (UU PDP, PPh, BPJS)

**MVPs Covered:**
- ✅ MVP 1: Core (Q3 2026)
- ✅ MVP 2: Extended ops (Q4 2026)
- ✅ MVP 3: Strategic HR (Q1 2027)

**Personas:** 5 user personas (HR Manager, Finance, Employee, Manager, Admin)

**Acceptance Criteria:** 30+ user stories with AC

**Status:** IMPLEMENTED (all features live)

---

### 📄 PRD v4 — Competitive Positioning & Talent Development

**Files:**
- `dnpeople-prd-v4-competitive.md` (36 KB) — English
- `dnpeople-prd-v4-indonesia.md` (20 KB) — Bahasa Indonesia

**Scope:**
- Competitive analysis vs Mekari Talenta, Gadjian, Gajihub
- 9 new modules (Competency Framework, IDP, LMS, 9-box matrix, succession planning, internal career marketplace, manufacturing package, retail/F&B package, EWA)
- Advanced customization features
- Pricing strategy (IDR 20-25K/emp/month)
- Financial projections & success metrics

**MVPs Covered:**
- ✅ MVP 4: Enterprise (Q2 2027)
- ✅ MVP 5: Talent Dev Foundation (Q3 2027)
- 🚧 MVP 6+: Advanced modules (Q4 2027+)

**Key Sections:**
1. Executive summary (market positioning)
2. Competitive feature matrix
3. Pricing tiers (5-tier model preview)
4. New modules detailed specs
5. Development roadmap Q3 2026 → H2 2027
6. Financial projections

**Status:** PARTIALLY IMPLEMENTED
- ✅ MVP 5 Module 1-2 (Competency, IDP, LMS basics) — done
- 🚧 MVP 5 Module 3-8 (9-box, succession, EWA, etc) — roadmap

---

### 📄 PRD v5 — Feature Tier & Subscription Strategy

**Files:**
- `dnpeople-prd-v5-tier-matrix.md` (20 KB) — Feature matrix & pricing
- `dnpeople-sdd-v5-tier-gating.md` (23 KB) — Technical implementation
- `dnpeople-srs-v5-tier-requirements.md` (24 KB) — Acceptance criteria

**Scope:**
- 5-tier feature matrix (Gratis → Starter → Professional → Business → Enterprise)
- Feature gating per tier (backend + frontend)
- Attendance **blocked for Free tier** (upgrade incentive)
- Subscription management (create, upgrade, downgrade, cancel, suspend)
- Billing integration (Stripe/Xendit)
- Upgrade paths & revenue projections

**Key Decision:**
- **Gratis:** Employee DB only (no attendance)
- **Starter:** +Attendance, leave, basic payroll
- **Professional:** +Talent dev, shift, OT, claims, recruitment (MAIN REVENUE)
- **Business:** +Multi-branch, API, advanced workflows (VOLUME)
- **Enterprise:** +Multi-company, SSO, white-label (PREMIUM)

**Revenue Model:**
- Year 1: IDR 9.06B (175 paid customers)
- Year 2: IDR 38.16B (550 paid customers)

**Status:** SPECIFIED (ready to implement)

---

## Implementation Timeline

### Phase 1: Core HR (MVP 1-3) ✅ DONE
- PRD v3 specs → Implementation (Q3-Q4 2026, Q1 2027)
- Features: Employee, attendance, leave, payroll, recruitment, performance, training
- Status: LIVE

### Phase 2: Talent Development Foundation (MVP 4-5) ✅ MOSTLY DONE
- PRD v4 specs (Module 1-2) → Implementation (Q2-Q3 2027)
- Features: Competency framework, IDP, LMS basics
- Status: IMPLEMENTED

### Phase 3: Feature Tier Gating (PRD v5) ✅ IMPLEMENTED
- PRD v5 specs → Backend middleware + Frontend components
- Timeline: Q3-Q4 2026 (before/alongside public launch)
- Status: IMPLEMENTED — see `../../docs/V5-SUBSCRIPTION-IMPLEMENTATION.md`

### Phase 4: Advanced Talent Modules (MVP 6+) ⏳ ROADMAP
- PRD v4 specs (Module 3-8) → Implementation
- Features: 9-box matrix, succession planning, internal career marketplace, EWA, salary benchmarking
- Timeline: Q4 2026 - Q2 2027
- Status: BACKLOG

---

## How Versions Relate

```
PRD v3 (Core)
    ↓
    ├─→ Implemented as MVP 1-3
    ├─→ Live in production (Q3 2026)
    └─→ Foundation for v4

PRD v4 (Competitive + Talent)
    ├─→ Competitive analysis vs market
    ├─→ New 9 modules defined
    ├─→ MVP 4-5 (Module 1-2) implemented
    ├─→ Module 3-8 in roadmap
    └─→ Pricing strategy defined

PRD v5 (Subscription Tier)
    ├─→ Implements pricing tiers from v4
    ├─→ Feature gating per tier
    ├─→ Attendance blocked for Free (upgrade driver)
    ├─→ Billing integration
    └─→ Revenue model + projections
```

---

## Quick Navigation

### If you need to...

**Understand core product features:**
→ Read `dnpeople-prd.md` (v3)

**Understand competitive positioning & talent dev:**
→ Read `dnpeople-prd-v4-*.md` (v4)

**Understand subscription tiers & feature gating:**
→ Read `dnpeople-prd-v5-tier-matrix.md` (v5)

**Understand technical implementation of tiers:**
→ Read `dnpeople-sdd-v5-tier-gating.md` (v5 SDD)

**Understand test cases & acceptance criteria for tiers:**
→ Read `dnpeople-srs-v5-tier-requirements.md` (v5 SRS)

**Understand full stack (PRD → SRS → SDD):**
→ Read all above in order

---

## File Structure

```
/mnt/user-data/outputs/
├── dnpeople-prd.md                      # PRD v3 (Core)
├── dnpeople-prd-v4-competitive.md       # PRD v4 (English)
├── dnpeople-prd-v4-indonesia.md         # PRD v4 (Bahasa Indonesia)
├── dnpeople-srs.md                      # SRS v3
├── dnpeople-sdd.md                      # SDD v3
│
├── dnpeople-prd-v5-tier-matrix.md       # PRD v5 (Tier strategy)
├── dnpeople-sdd-v5-tier-gating.md       # SDD v5 (Technical)
├── dnpeople-srs-v5-tier-requirements.md # SRS v5 (Acceptance criteria)
├── dnpeople-prd-00-INDEX.md             # This file
│
├── dnpeople-copywriting-honest-launch.md        # Website copy
├── dnpeople-website-copywriting-id.md           # Website sections
├── dnpeople-pricing-final-20-25k.md             # Pricing strategy
│
└── [other supporting docs...]
```

---

## Version Compatibility

### v3 → v4
- **Backward compatible:** All v3 features remain in v4
- **Additive:** v4 adds 9 new modules (competency, IDP, LMS, 9-box, etc)
- **Pricing:** v4 introduces pricing tiers (but not implemented until v5)

### v4 → v5
- **Backward compatible:** All v4 features remain gated by tier
- **Additive:** v5 adds subscription management & tier gating
- **Impact:** Features now gatekept by subscription tier
  - Free tier: No attendance
  - Starter+: Attendance unlocked
  - Professional+: Talent dev unlocked
  - Business+: API + multi-branch unlocked
  - Enterprise: Multi-company + SSO + white-label unlocked

### Migration Strategy (v4 → v5)
1. All existing customers assigned to **Professional tier** (full features, no restrictions)
2. Gradually move to tier-based pricing as contracts renew
3. Freemium tier (Gratis) available for new sign-ups only
4. Existing Starter tier gets all Professional features (legacy pricing)

---

## Key Metrics by Version

### PRD v3
- Features: 12 core modules
- Personas: 5 (HR, Finance, Employee, Manager, Admin)
- User stories: 30+
- Role-based access: 6 tiers (SUPER_ADMIN → EMPLOYEE)

### PRD v4
- New modules: 9 (competency, IDP, LMS, 9-box, succession, career marketplace, EWA, manufacturing, retail)
- Competitive advantages: 5 key differentiators
- Pricing tiers defined: 5 tiers
- Revenue projection: IDR 9.06B (Year 1)

### PRD v5
- Subscription tiers: 5 (Gratis, Starter, Professional, Business, Enterprise)
- Gated features: 50+
- Backend gateways: 2 middleware functions
- Frontend components: 3 (FeatureGate, UpgradePrompt, Navigation)
- Projected customers Year 1: 175 (paid) + 500 (free)

---

## Approval & Sign-Off

| Role | Name | Approval | Date |
|------|------|----------|------|
| CEO + Tech Lead | Dozer | 👤 | July 16, 2026 |
| Head of Product | TBD | ⬜ | — |
| Engineering Lead | TBD | ⬜ | — |
| Finance | TBD | ⬜ | — |

---

## Next Steps

- [ ] **PRD v5 approval** from product & engineering leadership
- [x] **Backend implementation** of subscription service & middleware (SDD v5)
- [x] **Frontend implementation** of feature gates & upgrade prompts
- [x] **Billing adapters** for Stripe/Xendit/manual transfer (production credentials remain an operational gate)
- [x] **Automated verification** of tier matrix plus backend/frontend builds
- [ ] **Launch & monitoring** of tier-based gating

---

*Last Updated: July 16, 2026 | Owner: Dozer (CEO + Tech Lead)*
