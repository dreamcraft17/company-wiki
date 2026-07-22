# dnPeople — Tier Consolidation Summary
## v11.1 → v12.0: Key Changes & Standardization

**Tanggal:** 22 Juli 2026  
**Version:** v12.0 (Subscription Tier Consolidation)  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Ready for implementation

---

## Overview

**PRD v12.0** mendefinisikan tier structure yang seragam dengan employee limits, trial durations, feature gating, dan billing logic yang jelas. Tujuannya adalah untuk **mengeliminasi inconsistencies** antara code, marketing, dan customer expectations.

---

## Key Standardizations (Seragam di Semua Tier)

### 1. Employee Limits (HARD)

```
┌─────────────┬──────────────┐
│ TIER        │ MAX EMPLOYEES│
├─────────────┼──────────────┤
│ FREE        │ 50           │ ← Hard limit
│ STARTER     │ 50           │ ← Hard limit
│ PROFESSIONAL│ 300          │ ← Hard limit
│ BUSINESS    │ Unlimited*   │ ← Soft limit at 1000
│ ENTERPRISE  │ Unlimited    │ ← No limit
└─────────────┴──────────────┘

* BUSINESS: Soft limit warning at 1000 employees
```

**Enforcement:**
- ✅ Checked at API level (middleware)
- ✅ Checked at employee create/import
- ✅ Returns 403 if exceeded
- ✅ Soft warning at 80% of limit

---

### 2. Trial Durations (STANDARDIZED)

```
┌─────────────┬──────────────┬─────────────────────┐
│ TIER        │ DURATION     │ AUTO-CHARGE         │
├─────────────┼──────────────┼─────────────────────┤
│ FREE        │ 4 months     │ Never (permanent)   │
│ STARTER     │ 2 months     │ Auto (month 3)      │
│ PROFESSIONAL│ 2 months     │ Auto (month 3)      │
│ BUSINESS    │ 2 months     │ Auto (month 3)      │
│ ENTERPRISE  │ N/A          │ Negotiated          │
└─────────────┴──────────────┴─────────────────────┘
```

**Changes from v11.1:**
- ✅ FREE tier now has **4-month trial** (was unclear)
- ✅ All PAID tiers have **2-month trial** (consistent)
- ✅ Auto-charge after trial (if payment method exists)
- ✅ If no payment → downgrade to FREE (not suspend)

---

### 3. Pricing (STANDARDIZED)

```
┌─────────────┬──────────────────┬─────────────────────────┐
│ TIER        │ PRICE/EMPLOYEE   │ MIN MONTHLY CHARGE      │
├─────────────┼──────────────────┼─────────────────────────┤
│ FREE        │ Rp 0 (perpetual) │ Rp 0 (free selamanya)   │
│ STARTER     │ Rp 20.000        │ Rp 20.000 (1 emp)       │
│ PROFESSIONAL│ Rp 25.000        │ Rp 25.000 (1 emp)       │
│ BUSINESS    │ Rp 20.000        │ Rp 6.000.000 (300 emp)  │
│ ENTERPRISE  │ Custom/Negotiated│ Custom (from Rp 15M/yr) │
└─────────────┴──────────────────┴─────────────────────────┘

Example charges:
  STARTER (30 emp) = 30 × Rp 20.000 = Rp 600.000/bulan
  PROFESSIONAL (100 emp) = 100 × Rp 25.000 = Rp 2.500.000/bulan
  BUSINESS (500 emp) = 500 × Rp 20.000 = Rp 10.000.000/bulan
```

**Changes from v11.1:**
- ✅ Pricing is **now locked** (no variations)
- ✅ Pro-rata calculation on upgrade/downgrade
- ✅ Monthly billing auto-renews same day each month

---

### 4. Feature Matrix (SERAGAM)

**Changes from v11.1:**
- ✅ Feature gating now **consistent** between code + marketing
- ✅ All 14 major features defined per tier
- ✅ Feature access enforced at **API level** (middleware)
- ✅ Feature visibility enforced at **UI level** (routing + navigation)

```
FEATURE GROUP             │ FREE │ STARTER │ PROF │ BUS │ ENT
──────────────────────────┼──────┼─────────┼──────┼─────┼────
Core HR (emp, org, staff) │ ✓    │ ✓       │ ✓    │ ✓   │ ✓
Payroll & Compensation    │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
Attendance & Time         │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
Leave & Permissions       │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
Recruitment               │ ✗    │ ✗       │ ✓    │ ✓   │ ✓
Learning & Development    │ ✗    │ ✗       │ ✓    │ ✓   │ ✓
Reporting & Analytics     │ Limited│ Basic  │ ✓    │ ✓   │ ✓
Integration & Security    │ ✗    │ ✗       │ Limited│ ✓  │ ✓
Support                   │ Email│ Email+Chat│ Phone│ 24/5│ Dedicated

(Full matrix in PRD v12.0)
```

---

## What Changed from v11.1?

### ✅ NEW in v12.0

```
1. FREE Tier Trial Duration
   - Explicitly set to 4 months (was unclear in v11.1)
   - After 4 months: stays FREE (permanent)

2. Employee Count Enforcement
   - Hard limits now enforced at API level
   - Soft warnings at 80% threshold
   - Cannot exceed limit (403 Forbidden)

3. API Rate Limits
   - FREE: 1,000 calls/day
   - STARTER: 10,000 calls/day
   - PROFESSIONAL: 50,000 calls/day
   - BUSINESS: Unlimited
   - ENTERPRISE: Unlimited

4. Feature Gating Matrix
   - Comprehensive (all 14 features defined per tier)
   - Enforced in code (middleware + UI)
   - Consistent between API and frontend

5. Billing Calculation
   - Monthly charges = employees × price per employee
   - Pro-rata charges on upgrade/downgrade
   - Auto-charge after trial (if payment method exists)

6. Grace Period & Suspension
   - 3-day grace period on payment failure
   - 7-day suspension threshold
   - 30-day data retention before deletion
   - Reactivation by updating payment method

7. Trial Expiration Handling
   - Automatic per-tier
   - Paid tier without payment → downgrade to FREE
   - Paid tier with payment → auto-charge first month
```

### ⚠️ CHANGES from v11.1

```
❌ BEFORE (v11.1):
  - FREE trial duration unclear ("perpetual" vs "4 months")
  - Employee limits mentioned in PRD but not enforced in code
  - Feature matrix documented but not consistent in code
  - No API rate limiting
  - Billing logic incomplete (no pro-rata, no grace period)
  - API gating missing

✅ AFTER (v12.0):
  - FREE trial = 4 months (explicit, then permanent free)
  - Employee limits = hardcoded + enforced (403 if exceeded)
  - Feature matrix = seragam + enforced in code (API + UI)
  - API rate limiting = enforced per tier
  - Billing logic = complete (auto-charge, pro-rata, grace period)
  - API gating = middleware enforced per request
```

### 📝 BACKWARD COMPATIBILITY

```
✅ Existing customers NOT disrupted:
  - Subscriptions recalculated (trial dates from createdAt)
  - Features assigned based on current tier
  - No price changes (uses existing tier)
  - No data loss or forced migration
  - Subscription status calculated automatically

Migration path:
  1. Database migration (add new columns)
  2. Calculate trial dates for existing subscriptions
  3. Assign features based on tier
  4. Update API to enforce new rules
  5. Update UI to reflect new features
  6. Communicate to customers (email)
```

---

## Implementation Timeline

```
WEEK 1 (Jul 22-26):
  [ ] Review & approve PRD v12.0
  [ ] Finalize tier definitions
  [ ] Database schema review

WEEK 2 (Jul 29 - Aug 2):
  [ ] Database migrations
  [ ] Backend implementation
    - TierService
    - Middleware (feature gate, employee count, API rate limit)
    - BillingService
    - Trial expiration cron job
  [ ] Backend testing (unit + integration)

WEEK 3 (Aug 5-9):
  [ ] Frontend implementation
    - useTierAccess hook
    - ProtectedFeature component
    - Navigation gating
    - UI prompts (upgrade, trial countdown)
  [ ] Frontend testing
  [ ] Migration script (existing subscriptions)

WEEK 4 (Aug 12-16):
  [ ] QA testing (all tier combinations)
  [ ] Load testing (high employee count)
  [ ] Customer communication
  [ ] Rollback plan verification

WEEK 5 (Aug 19-22):
  [ ] Deployment to staging
  [ ] Final UAT
  [ ] Deployment to production
  [ ] Post-launch monitoring
```

---

## Files Generated

```
✅ PRD v12.0 — Product Definition (61 KB)
   - 9 parts, 8 sections
   - Tier structure, feature matrix, billing logic, enforcement
   - UI/UX messaging, migration plan

✅ SRS v12.0 — Requirements Specification (48 KB)
   - 8 functional requirements (FR-TIER-001 to 008)
   - 4+ acceptance criteria per FR
   - 100+ test cases
   - Launch gate checklist

✅ SDD v12.0 — Technical Implementation (76 KB)
   - Database schema (SQL + Prisma)
   - Environment variables
   - Backend services (Tier, Billing, Middleware)
   - Frontend hooks & components
   - Unit & integration tests
   - Migration strategy
```

---

## Critical Points (Jangan Lupa!)

### 🚨 MUST ENFORCE

```
1. Employee Limits (HARD)
   - Cannot exceed limit even by 1 employee
   - Returns 403 Forbidden with clear message
   - Soft warning at 80%

2. Trial Expiration
   - Automatic per tier (not manual)
   - FREE: stays free after 4 months
   - PAID: auto-charge or downgrade

3. Feature Gating
   - API level (return 403 for unauthorized)
   - UI level (hide navigation)
   - Consistent message: "Requires [TIER]"

4. Billing Accuracy
   - No double-charging
   - Pro-rata calculations correct
   - Invoices generated for all charges
```

### 🔐 SECURITY

```
1. No data loss during migration
2. Backward compatibility maintained
3. Audit trail for all tier changes
4. Payment method validation
5. No sensitive data in logs
```

### 📧 COMMUNICATION

```
1. Email all customers about:
   - New tier structure
   - Employee limits
   - Trial durations
   - Feature access changes

2. Timeline: 2 weeks before launch
3. Include:
   - What changed
   - How it affects them
   - What to do if needed
   - Support contact info
```

---

## Success Criteria (Launch)

```
✅ FUNCTIONALITY:
  - All 5 tiers working correctly
  - Employee limits enforced
  - Trial periods automatic
  - Features gated (API + UI)
  - Billing calculating correctly
  - Upgrade/downgrade working
  - Grace period + suspension working

✅ DATA:
  - No data loss in migration
  - All existing subscriptions migrated
  - Trial dates calculated correctly
  - Features assigned correctly

✅ TESTING:
  - 100+ test cases passing
  - All tier combinations tested
  - Backward compatibility verified
  - Payment flows tested

✅ DEPLOYMENT:
  - Database migration successful
  - Rollback plan documented
  - Monitoring active
  - Support team trained

✅ CUSTOMER:
  - All features accessible per tier
  - Trial countdown showing correctly
  - No unexpected charges
  - Support responsive to issues
```

---

## Comparison: v11.1 → v12.0

| Aspect | v11.1 | v12.0 | Status |
|--------|-------|-------|--------|
| Tier definitions | Partial | Complete | ✅ Standardized |
| Employee limits | Documented | Enforced | ✅ Hardcoded + API |
| Trial duration | Unclear | Clear (4/2 months) | ✅ Explicit per tier |
| Feature matrix | Listed | Matrix + Enforced | ✅ Comprehensive |
| API gating | Missing | Complete | ✅ Middleware |
| Billing logic | Incomplete | Complete | ✅ Full cycle |
| Grace period | No | Yes (3 days) | ✅ New |
| Pro-rata charges | No | Yes | ✅ On upgrade/downgrade |
| Backward compat | N/A | Maintained | ✅ No disruption |

---

## Key Metrics (Expected)

### Pre-v12.0 (current)
```
- Unclear tier structure → customer confusion
- No employee limit enforcement → potential abuse
- Billing incomplete → revenue leakage
- Feature access unclear → support overhead
```

### Post-v12.0 (expected)
```
- Clear tier structure → less confusion
- Hard employee limits → predictable billing
- Complete billing → revenue captured
- Feature access clear → lower support load
- Trial expiration automatic → less manual work
```

---

## Questions to Discuss

```
1. Pricing lock?
   - Should prices be locked quarterly?
   - Any discounts for multi-year contracts?

2. Employee limit exceptions?
   - Can we allow temporary exceeding (with penalty)?
   - Or hard limit always?

3. Enterprise negotiation?
   - Custom trial duration?
   - Custom pricing model?

4. Migration window?
   - Immediate enforcement or grace period?
   - Communication timeline?

5. Payment provider?
   - Still using Xendit?
   - Stripe integration?
```

---

## Next Steps

```
1. ✅ Dozer reviews PRD/SRS/SDD v12.0
2. ✅ Stakeholder approval (if needed)
3. 📋 Engineering implements backend
4. 📋 QA tests all scenarios
5. 📋 Prepare customer communication
6. 📋 Deploy to production
7. 📋 Post-launch monitoring
```

---

## Documents Reference

```
All files located in: /mnt/user-data/outputs/

📄 dnpeople-prd-v12.0-tier-consolidation-id.md
   ├─ Part 1: Tier Structure (SERAGAM)
   ├─ Part 2: Feature Matrix
   ├─ Part 3: Enforcement Logic (API & UI)
   ├─ Part 4: Billing & Enforcement
   ├─ Part 5: Upgrade & Downgrade
   ├─ Part 6: Grace Period & Suspension
   ├─ Part 7: Standardization in Code
   ├─ Part 8: UI/UX Messaging
   └─ Part 9: Transition Plan

📄 dnpeople-srs-v12.0-tier-consolidation-id.md
   ├─ FR-TIER-001: Tier Definitions Enforcement
   ├─ FR-TIER-002: Employee Count Limits
   ├─ FR-TIER-003: Trial Duration Enforcement
   ├─ FR-TIER-004: API-Level Feature Gating
   ├─ FR-TIER-005: UI-Level Feature Gating
   ├─ FR-TIER-006: Billing & Charging Logic
   ├─ FR-TIER-007: Upgrade & Downgrade Flow
   ├─ FR-TIER-008: Grace Period & Suspension
   └─ Launch Gate Checklist

📄 dnpeople-sdd-v12.0-tier-consolidation-id.md
   ├─ Part 1: Database Schema & Migrations
   ├─ Part 2: Environment Variables
   ├─ Part 3: Backend Implementation
   │  ├─ 3.1 TierService
   │  ├─ 3.2 Employee Count Enforcement
   │  ├─ 3.3 BillingService
   │  └─ 3.4 Feature Gating Middleware
   ├─ Part 4: Frontend Implementation
   │  ├─ 4.1 useTierAccess Hook
   │  ├─ 4.2 ProtectedFeature Component
   │  └─ 4.3 Trial Countdown Component
   ├─ Part 5: Testing Strategy
   ├─ Part 6: Migration Plan
   └─ Part 7: Deployment Checklist
```

---

**Status: READY FOR DEVELOPMENT** 🚀

Semua spec sudah lengkap dan detailed. Tim engineering bisa langsung mulai development sesuai timeline. Semua edge cases sudah dicovered di SRS + SDD.

---

*Last Updated: 22 Juli 2026 | Owner: Dozer | Scope: v12.0 Complete*
