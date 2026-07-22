# dnPeople — PRD v12.0
## Subscription Tier Consolidation & Enforcement

**Versi:** 12.0  
**Owner:** Dozer (CEO + Tech Lead)  
**Tanggal:** 22 Juli 2026  
**Tujuan:** Seragamkan semua tier (employee limits, trial duration, features, billing)  
**Status:** Standardization phase (untuk consistency di code, UI, marketing)

---

## Executive Summary

**Problem Statement:**
```
Saat ini ada inconsistencies di tier structure:
- FREE tier: berapa bulan max? 4 bulan atau unlimited?
- Employee limits: apakah hardcoded atau enforced?
- Feature matrix: apa per-tier differences di code vs marketing?
- Trial period: 2 bulan untuk semua tier atau berbeda?
- Billing: kapan dicharge, bagaimana enforcement?

Solusi: Satu SSOT (Single Source of Truth) untuk semua tier
```

**PRD v12.0 Mendefinisikan:**
1. ✅ Tier structure yang seragam (5 tiers: FREE, STARTER, PROFESSIONAL, BUSINESS, ENTERPRISE)
2. ✅ Employee limit per tier (hardcoded dan enforced)
3. ✅ Trial duration per tier (FREE: 4 bulan, PAID: 2 bulan)
4. ✅ Feature matrix per tier (apa bisa, apa tidak)
5. ✅ Billing & enforcement logic (upgrade, downgrade, charge)
6. ✅ UI/API gating per tier (yang harus di-block/show)

---

## Part 1: Tier Structure (SERAGAM)

### Tier Definitions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TIER    │ MAX EMP  │ PRICE/EMP    │ TRIAL    │ BILLING      │ TARGET      │
├─────────────────────────────────────────────────────────────────────────────┤
│ FREE    │ 50       │ Rp 0         │ 4 bulan  │ -            │ Solo/tiny   │
│         │ (hard)   │ (perpetual)  │ (hard)   │              │ biz         │
├─────────────────────────────────────────────────────────────────────────────┤
│ STARTER │ 50       │ Rp 20.000/mo │ 2 bulan  │ Monthly      │ Small       │
│         │ (hard)   │ (per emp)    │ free*    │ auto-renew   │ business    │
├─────────────────────────────────────────────────────────────────────────────┤
│ PROF    │ 300      │ Rp 25.000/mo │ 2 bulan  │ Monthly      │ Mid-size    │
│         │ (hard)   │ (per emp)    │ free*    │ auto-renew   │ company     │
├─────────────────────────────────────────────────────────────────────────────┤
│ BUSINESS│ unlimited│ Rp 20.000/mo │ 2 bulan  │ Monthly      │ Large       │
│         │ (soft**)  │ (per emp,    │ free*    │ auto-renew   │ company     │
│         │          │ volume disc) │          │              │ (301+)      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ENTERPRISE│ unlimited│ Custom (IDR)│ N/A      │ Annual/custom│ Enterprise │
│         │ (soft)   │              │          │ (negotiated) │ (500+)      │
└─────────────────────────────────────────────────────────────────────────────┘

* TRIAL: First 2 months of PAID tier = free (charge 0 until month 3)
** SOFT LIMIT: Can exceed temporarily (email warning, then forced downgrade)
```

### Tier Details

```
TIER 1: FREE (Selamanya Gratis)
  Target user: Solo entrepreneur, micro business (s/d 50 karyawan)
  
  Pricing:
    - Price per employee: Rp 0 (free selamanya)
    - Trial: 4 bulan unlimited, kemudian jadi permanent free
    - Limit: MAX 50 karyawan (hard limit)
    - Billing: None (no payment needed)
  
  Access:
    - Feature gating: Basic HR features only
    - API calls: 1,000 calls/day (soft limit, warning at 800)
    - Support: Email only (24h response target)
    - Storage: 5GB total
  
  Restrictions:
    - No payroll (disabled)
    - No attendance (disabled)
    - No recruitment/onboarding
    - No advanced reports
    - No API/webhooks (for integration)
    - No custom domain (use dnpeople.id)
    - No SAML/SSO
    - No white-label


TIER 2: STARTER (Rp 20K/karyawan/bulan)
  Target user: Small business (1-50 karyawan)
  
  Pricing:
    - Price per employee: Rp 20.000 per bulan
    - Trial: 2 bulan GRATIS (bulan 3+ di-charge)
    - Limit: MAX 50 karyawan (hard limit)
    - Billing: Monthly auto-renew (charge on day 1 each month)
    - Min charge: Rp 20.000 (minimum 1 employee)
  
  Access:
    - Feature gating: Core HRIS (payroll, attendance, leave)
    - API calls: 10,000 calls/day (hard block at 10k)
    - Support: Email + chat (8 business hours)
    - Storage: 50GB total
  
  Restrictions:
    - No recruitment/onboarding
    - No performance management
    - No training/talent development
    - No advanced reports (only basic)
    - No API/webhooks
    - No custom domain
    - No SAML/SSO
    - No white-label


TIER 3: PROFESSIONAL (Rp 25K/karyawan/bulan)
  Target user: Mid-size company (51-300 karyawan)
  
  Pricing:
    - Price per employee: Rp 25.000 per bulan
    - Trial: 2 bulan GRATIS (bulan 3+ di-charge)
    - Limit: MAX 300 karyawan (hard limit)
    - Billing: Monthly auto-renew
    - Min charge: Rp 25.000 (minimum 1 employee)
  
  Access:
    - Feature gating: Full HR suite (all STARTER + recruitment, talent dev)
    - API calls: 50,000 calls/day (hard block at 50k)
    - Support: Email + chat + phone (business hours + escalation)
    - Storage: 500GB total
    - Custom domain: Available (*.dnpeople.id)
  
  Includes:
    - Payroll
    - Attendance
    - Leave management
    - Recruitment & onboarding
    - Performance management
    - Training & development
    - Competency framework
    - Advanced reports
    - Workflow automation
  
  Restrictions:
    - No multi-cabang (single org unit)
    - No API/webhooks (standard integrations only)
    - No SAML/SSO
    - No white-label
    - No dedicated account manager


TIER 4: BUSINESS (Rp 20K/karyawan/bulan, volume discount)
  Target user: Large company (301+ karyawan)
  
  Pricing:
    - Price per employee: Rp 20.000 per bulan (volume discount from 25k)
    - Trial: 2 bulan GRATIS
    - Limit: Unlimited employees (soft limit at 1000, then contact for upgrade)
    - Billing: Monthly auto-renew
    - Min charge: Rp 6.000.000 (minimum 300 employees)
  
  Access:
    - Feature gating: Full HR suite + multi-tenant features
    - API calls: Unlimited (rate limited at 100 req/sec)
    - Support: Email + chat + phone (24/5, escalation available)
    - Storage: Unlimited
    - Custom domain: Full subdomain
  
  Includes:
    - All PROFESSIONAL features
    - Multi-cabang/organizational units
    - API keys + webhooks + custom integrations
    - Advanced reporting + custom reports builder
    - Audit trails + compliance exports
    - Custom workflows
    - Bulk operations API
  
  Restrictions:
    - No SAML/SSO (single organization only)
    - No white-label
    - No dedicated account manager (unless negotiated)


TIER 5: ENTERPRISE (Custom Pricing)
  Target user: Large enterprise (500+ karyawan)
  
  Pricing:
    - Price: Custom negotiation (typically Rp 15-18K/emp or flat fee)
    - Trial: By negotiation
    - Limit: Unlimited employees
    - Billing: Annual or custom (negotiated)
    - Min: Rp 15.000.000/tahun (flat or per-employee)
  
  Access:
    - Feature gating: Everything + unrestricted
    - API calls: Unlimited (custom rate limits)
    - Support: Dedicated account manager + 24/7 response
    - Storage: Unlimited
    - Custom domain: Full whitelabel
  
  Includes:
    - All BUSINESS features
    - SAML/SSO + SCIM provisioning
    - White-label branding (domain, logo, emails)
    - Dedicated Slack channel for support
    - Quarterly business reviews
    - Custom development (if scoped separately)
    - SLA guarantee (99.9% uptime)
    - Multi-organization support
    - Advanced audit + security features
```

---

## Part 2: Feature Matrix (SERAGAMKAN)

### Feature Access Per Tier

```
FEATURE GROUP                  │ FREE │ STARTER │ PROF │ BUS │ ENT
──────────────────────────────┼──────┼─────────┼──────┼─────┼────
CORE HR FEATURES              │      │         │      │     │
  Employee CRUD + import       │ ✓    │ ✓       │ ✓    │ ✓   │ ✓
  Org structure (dept/pos/loc) │ ✓    │ ✓       │ ✓    │ ✓   │ ✓
  Staff account management     │ ✓    │ ✓       │ ✓    │ ✓   │ ✓
PAYROLL & COMPENSATION         │      │         │      │     │
  Payroll processing           │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
  BPJS + PPh 21 calculation    │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
  Variable compensation        │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
  Payslip generation           │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
  Tax compliance               │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
ATTENDANCE & TIME              │      │         │      │     │
  Clock in/out (manual+GPS+QR) │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
  Shift management             │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
  Attendance reports           │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
  Overtime tracking            │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
LEAVE & PERMISSIONS            │      │         │      │     │
  Leave request + approval     │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
  Leave balance tracking       │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
  Permission (WFH/izin)        │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
RECRUITMENT                    │      │         │      │     │
  Job posting + applications   │ ✗    │ ✗       │ ✓    │ ✓   │ ✓
  Candidate tracking           │ ✗    │ ✗       │ ✓    │ ✓   │ ✓
  Offer + onboarding           │ ✗    │ ✗       │ ✓    │ ✓   │ ✓
LEARNING & DEVELOPMENT         │      │         │      │     │
  Training + LMS               │ ✗    │ ✗       │ ✓    │ ✓   │ ✓
  Competency framework         │ ✗    │ ✗       │ ✓    │ ✓   │ ✓
  Performance management       │ ✗    │ ✗       │ ✓    │ ✓   │ ✓
REPORTING & INSIGHTS           │      │         │      │     │
  Basic reports (PDF/Excel)    │ Limited│ ✓     │ ✓    │ ✓   │ ✓
  Advanced analytics           │ ✗    │ Limited │ ✓    │ ✓   │ ✓
  Custom reports builder       │ ✗    │ ✗       │ ✓    │ ✓   │ ✓
ADMINISTRATION & CONTROL       │      │         │      │     │
  Role-based access control    │ Basic │ Standard│ Full │ Full│ Full
  Audit trail                  │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
  Data export                  │ Limited│ ✓     │ ✓    │ ✓   │ ✓
  Multi-cabang support         │ ✗    │ ✗       │ ✗    │ ✓   │ ✓
INTEGRATION & SECURITY         │      │         │      │     │
  API keys + webhooks          │ ✗    │ ✗       │ ✗    │ ✓   │ ✓
  SAML/SSO login               │ ✗    │ ✗       │ ✗    │ ✗   │ ✓
  SCIM provisioning            │ ✗    │ ✗       │ ✗    │ ✗   │ ✓
  Custom domain                │ ✗    │ ✗       │ ✓*   │ ✓   │ ✓
  White-label                  │ ✗    │ ✗       │ ✗    │ ✗   │ ✓
SUPPORT                        │      │         │      │     │
  Email support                │ ✓    │ ✓       │ ✓    │ ✓   │ ✓
  Chat support                 │ ✗    │ ✓       │ ✓    │ ✓   │ ✓
  Phone support                │ ✗    │ ✗       │ ✓*   │ ✓   │ ✓
  Dedicated account manager    │ ✗    │ ✗       │ ✗    │ ✗*  │ ✓
API LIMITS                     │      │         │      │     │
  API calls/day                │ 1K   │ 10K     │ 50K  │ Unlimited│ Unlimited
  Storage                      │ 5GB  │ 50GB    │ 500GB│ Unlimited│ Unlimited

* = Upgrade to BUSINESS/ENTERPRISE for this feature
```

---

## Part 3: Enforcement Logic (API & UI Level)

### API Tier Gating

```javascript
// backend/src/middleware/tierGating.ts

const TIER_FEATURES = {
  FREE: {
    features: ['employee_crud', 'org_structure'],
    apiCallsPerDay: 1000,
    maxEmployees: 50,
    trialMonths: 4, // permanent free
    restrictions: {
      payroll: 'disabled',
      attendance: 'disabled',
      recruitment: 'disabled',
      api_keys: 'disabled',
      sso: 'disabled'
    }
  },
  
  STARTER: {
    features: ['payroll', 'attendance', 'leave', 'shift'],
    apiCallsPerDay: 10000,
    maxEmployees: 50,
    trialMonths: 2,
    price: 20000, // Rp per employee per month
    restrictions: {
      recruitment: 'disabled',
      api_keys: 'disabled',
      sso: 'disabled',
      white_label: 'disabled'
    }
  },
  
  PROFESSIONAL: {
    features: ['payroll', 'attendance', 'leave', 'shift', 'recruitment', 
               'training', 'performance', 'custom_reports'],
    apiCallsPerDay: 50000,
    maxEmployees: 300,
    trialMonths: 2,
    price: 25000,
    restrictions: {
      api_keys: 'disabled',
      sso: 'disabled',
      white_label: 'disabled',
      multi_cabang: 'disabled'
    }
  },
  
  BUSINESS: {
    features: ['*'], // all features
    apiCallsPerDay: 'unlimited',
    maxEmployees: 'unlimited', // soft limit at 1000
    trialMonths: 2,
    price: 20000,
    restrictions: {
      sso: 'disabled',
      white_label: 'disabled'
    }
  },
  
  ENTERPRISE: {
    features: ['*'],
    apiCallsPerDay: 'unlimited',
    maxEmployees: 'unlimited',
    trialMonths: null, // negotiated
    price: 'custom',
    restrictions: {} // no restrictions
  }
};

// Middleware untuk check tier permission
export async function tierGateMiddleware(req, res, next) {
  const company = req.company; // from auth context
  const tier = company.subscriptionTier; // e.g., 'STARTER'
  const endpoint = req.path; // e.g., '/payroll'
  
  const tierConfig = TIER_FEATURES[tier];
  
  // Check if endpoint requires feature
  if (endpoint.startsWith('/payroll')) {
    if (tierConfig.restrictions.payroll === 'disabled') {
      return res.status(403).json({
        error: 'Feature not available in your plan',
        feature: 'payroll',
        currentTier: tier,
        upgrade: 'STARTER'
      });
    }
  }
  
  if (endpoint.startsWith('/attendance')) {
    if (tierConfig.restrictions.attendance === 'disabled') {
      return res.status(403).json({
        error: 'Attendance requires STARTER tier or higher',
        currentTier: tier,
        upgrade: 'STARTER'
      });
    }
  }
  
  // Check API rate limit
  const callsToday = await countAPICalls(company.id, 'today');
  if (tierConfig.apiCallsPerDay !== 'unlimited' && 
      callsToday >= tierConfig.apiCallsPerDay) {
    return res.status(429).json({
      error: 'Daily API limit exceeded',
      limit: tierConfig.apiCallsPerDay,
      used: callsToday,
      resetAt: getNextMidnight()
    });
  }
  
  // Log API call for rate limiting
  await logAPICall(company.id);
  
  next();
}

// Check employee count limit
export async function employeeCountGate(companyId, tier) {
  const tierConfig = TIER_FEATURES[tier];
  const employeeCount = await db.employee.count({
    where: { companyId }
  });
  
  if (tierConfig.maxEmployees !== 'unlimited' && 
      employeeCount >= tierConfig.maxEmployees) {
    return {
      allowed: false,
      reason: 'employee_limit_reached',
      current: employeeCount,
      limit: tierConfig.maxEmployees,
      tier: tier,
      message: `Your ${tier} plan is limited to ${tierConfig.maxEmployees} employees. Upgrade to add more.`
    };
  }
  
  return { allowed: true };
}
```

### UI Tier Gating

```jsx
// frontend/src/lib/tierAccess.ts

export const tierAccess = {
  FREE: {
    canAccess: {
      payroll: false,
      attendance: false,
      recruitment: false,
      apiKeys: false,
      sso: false
    },
    navigation: ['employees', 'org', 'staff-accounts', 'dashboard']
  },
  
  STARTER: {
    canAccess: {
      payroll: true,
      attendance: true,
      recruitment: false,
      apiKeys: false,
      sso: false
    },
    navigation: ['employees', 'org', 'payroll', 'attendance', 'leave', 'shifts', 'dashboard']
  },
  
  PROFESSIONAL: {
    canAccess: {
      payroll: true,
      attendance: true,
      recruitment: true,
      apiKeys: false,
      sso: false,
      multiCabang: false
    },
    navigation: ['all'] // except integrations, sso
  },
  
  BUSINESS: {
    canAccess: {
      // all features except sso, white_label
    },
    navigation: ['all']
  },
  
  ENTERPRISE: {
    canAccess: { all: true },
    navigation: ['all']
  }
};

// Component guard
export function useHasTierAccess(feature: string) {
  const { subscription } = useAuth();
  const tier = subscription.tier; // 'STARTER', 'PROFESSIONAL', etc
  
  return tierAccess[tier].canAccess[feature] === true;
}

// In component
<ProtectedFeature feature="payroll" tier={userTier}>
  <PayrollSection />
  <UpgradePrompt tier={userTier} nextTier="STARTER" />
</ProtectedFeature>
```

---

## Part 4: Billing & Enforcement

### Subscription Lifecycle

```
USER SIGNUP (Free Tier)
  ↓
  Day 1-120 (4 bulan): FREE tier active
    - 50 employees max
    - All basic features available
    - No charge
  ↓
  Day 121: FREE trial expired
    ↓
    Option A: Upgrade to STARTER/PROFESSIONAL/BUSINESS
      - Setup billing (Xendit, Stripe)
      - Charge Rp 20K-25K per employee for first month
      - Auto-renew monthly
    ↓
    Option B: Stay on FREE
      - Locked if > 50 employees
      - Downgrade to 50 employees (or delete excess)
      - Permanent free access (limited features)

USER PAID SIGNUP (STARTER/PROFESSIONAL/BUSINESS)
  ↓
  Day 1-60 (2 bulan): TRIAL PERIOD (FREE)
    - Full features for tier
    - No charge
    - Day 55: Reminder email "Trial ending in 5 days"
  ↓
  Day 61: Trial expired → Billing starts
    - Auto-charge amount = employees × price per employee
    - E.g., 30 employees × Rp 20K = Rp 600.000
    - Invoice generated
    - Charge repeats on same day each month
  ↓
  Payment Options:
    - Success: Subscription continues
    - Failed: Grace period (3 days)
      - Day 4: Access restricted (read-only mode)
      - Day 8: Subscription suspended
  ↓
  Upgrade/Downgrade:
    - Charge prorated
    - Example: Upgrade mid-month
      - Used STARTER 15 days (50% of month)
      - Paid: Rp 300.000 (50% of Rp 600K)
      - New tier PROFESSIONAL charged for remaining 15 days
      - Pro-rate calculated: (remaining days / 30) × (new price - old price)
```

### Trial Enforcement

```typescript
// backend/src/services/subscriptionService.ts

export async function checkTrialStatus(companyId: string) {
  const subscription = await db.subscription.findUnique({
    where: { companyId }
  });
  
  const trialStartDate = subscription.createdAt;
  const trialDurationDays = TIER_FEATURES[subscription.tier].trialMonths * 30;
  const trialEndDate = addDays(trialStartDate, trialDurationDays);
  
  const today = new Date();
  
  if (today > trialEndDate) {
    // Trial expired
    if (!subscription.hasPaymentMethod) {
      // Expire to FREE tier
      await updateSubscription(companyId, {
        tier: subscription.tier === 'FREE' ? 'FREE' : 'EXPIRED',
        status: 'trial_expired'
      });
      
      // Notify user
      await sendEmail(company.adminEmail, 'Trial Expired', {
        message: 'Your trial has ended. Upgrade to continue using dnPeople.',
        cta: '/billing/upgrade'
      });
    } else {
      // Auto-charge for first month
      await chargeSubscription(companyId);
    }
  }
  
  return {
    isTrialing: today <= trialEndDate,
    trialEndsAt: trialEndDate,
    daysRemaining: differenceInDays(trialEndDate, today),
    tier: subscription.tier
  };
}

// Daily job: Check trial expirations
export async function dailyCheckTrialExpirations() {
  const expiredTrials = await db.subscription.findMany({
    where: {
      createdAt: {
        lte: subDays(new Date(), TRIAL_DURATION_DAYS)
      },
      status: 'active',
      tier: { in: ['STARTER', 'PROFESSIONAL', 'BUSINESS'] }
    }
  });
  
  for (const sub of expiredTrials) {
    await checkTrialStatus(sub.companyId);
  }
}
```

### Employee Count Enforcement

```typescript
export async function enforceEmployeeLimit(companyId: string) {
  const subscription = await db.subscription.findUnique({
    where: { companyId }
  });
  
  const tier = subscription.tier;
  const maxEmployees = TIER_FEATURES[tier].maxEmployees;
  
  if (maxEmployees === 'unlimited') return; // No enforcement for unlimited
  
  const employeeCount = await db.employee.count({
    where: { 
      companyId,
      deletedAt: null // active employees only
    }
  });
  
  if (employeeCount >= maxEmployees) {
    // HARD LIMIT: Prevent adding more
    if (employeeCount > maxEmployees) {
      // Soft limit exceeded - send warning
      await notifyCompanyAdmin(companyId, {
        type: 'EMPLOYEE_LIMIT_EXCEEDED',
        currentCount: employeeCount,
        limit: maxEmployees,
        tier: tier,
        action: 'Delete employees or upgrade tier'
      });
    }
  }
  
  return {
    limited: true,
    current: employeeCount,
    limit: maxEmployees,
    remaining: Math.max(0, maxEmployees - employeeCount)
  };
}

// Check before creating employee
export async function canCreateEmployee(companyId: string) {
  const enforcement = await enforceEmployeeLimit(companyId);
  
  if (enforcement.limited && enforcement.remaining <= 0) {
    return {
      allowed: false,
      reason: 'Employee limit reached',
      upgrade: true
    };
  }
  
  return { allowed: true };
}
```

---

## Part 5: Upgrade & Downgrade Flow

### Upgrade Path

```
User on STARTER (30 employees) → Wants to upgrade to PROFESSIONAL

Current subscription:
  - Tier: STARTER
  - Employees: 30
  - Price: Rp 20K/emp
  - Monthly charge: Rp 600.000
  - Days used in current month: 15/30
  - Remaining days: 15

Upgrade calculation:
  - Current charge (daily rate): Rp 600.000 / 30 = Rp 20K/day
  - Days remaining: 15
  - Credit from current month: Rp 20K × 15 = Rp 300K
  
  - New tier: PROFESSIONAL
  - New price: Rp 25K/emp
  - New monthly charge: Rp 750.000
  - Daily rate for new tier: Rp 750K / 30 = Rp 25K/day
  - Charge for 15 remaining days: Rp 25K × 15 = Rp 375K
  
  - Upgrade charge: Rp 375K - Rp 300K = Rp 75K
  - Next billing date: Same as current (stays aligned)

Billing flow:
  1. Process upgrade charge (Rp 75K)
  2. Update subscription tier to PROFESSIONAL
  3. Send confirmation email with new features
  4. Update nav/features in real-time
```

### Downgrade Path

```
User on PROFESSIONAL (100 employees) → Wants to downgrade to STARTER

Downgrade rules:
  - PROFESSIONAL max: 300 employees
  - STARTER max: 50 employees
  - User has 100 employees → CANNOT downgrade to STARTER
  
  Options:
  1. Downgrade only if employees <= 50 (delete 50 employees first)
  2. Keep PROFESSIONAL and accept higher price
  3. Contact sales for custom tier

If employee count allows:
  - Downgrade effective: End of current billing period
  - No refund for current period
  - Next month: New lower price kicks in
```

---

## Part 6: Grace Period & Suspension

### Payment Failure Handling

```
Timeline for failed payment:

Day 1: Payment attempt fails (e.g., card declined, expired)
  → Send email: "Payment failed, please update payment method"
  → Link: /billing/update-payment
  → Retry auto in 3 days

Day 4: Retry fails again
  → Send urgent email: "Your subscription will be suspended in 3 days"
  → Show banner in app: "Payment Required to Continue"
  → Features still accessible (grace period)

Day 7: Subscription suspended
  → Company locked to READ-ONLY mode
  → Cannot create/edit/delete data
  → Cannot run payroll
  → Email: "Subscription Suspended"
  → Link: /billing/update-payment to re-activate

Day 30: Suspended subscription auto-canceled
  → Data not deleted (kept for 90 days)
  → Email: "Subscription Canceled"
  → Offer to re-activate or export data

Re-activation:
  - Update payment method
  - Click "Re-activate"
  - Charge cleared payment + prorated amount for current month
  - Full access restored immediately
```

---

## Part 7: Standardization in Code

### Database Schema Alignment

```sql
-- Subscription table (standardized)
CREATE TABLE Subscription (
  id STRING PRIMARY KEY,
  companyId STRING UNIQUE NOT NULL,
  tier ENUM('FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'),
  
  -- Trial tracking
  startedAt TIMESTAMP NOT NULL,
  trialEndsAt TIMESTAMP, -- calculated from tier + startDate
  trialActive BOOLEAN,
  
  -- Billing
  billingPeriodStart DATE,
  billingPeriodEnd DATE,
  status ENUM('trial', 'active', 'grace_period', 'suspended', 'canceled'),
  
  -- Payment
  paymentMethodId STRING, -- Xendit/Stripe ID
  lastChargedAt TIMESTAMP,
  nextChargeDate DATE,
  
  -- Usage tracking
  currentEmployeeCount INT,
  monthlyAPICallsUsed INT,
  
  -- Audit
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  
  INDEX(companyId),
  INDEX(tier),
  INDEX(status),
  INDEX(trialActive)
);

-- Feature toggles per tier
CREATE TABLE FeatureAccess (
  id STRING PRIMARY KEY,
  tier ENUM('FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'),
  featureName STRING, -- 'payroll', 'attendance', 'recruitment', etc
  enabled BOOLEAN,
  
  UNIQUE(tier, featureName)
);

-- Usage tracking (for rate limiting)
CREATE TABLE APIUsage (
  id STRING PRIMARY KEY,
  companyId STRING NOT NULL,
  date DATE,
  callsToday INT,
  
  INDEX(companyId, date)
);
```

### Environment Variables

```bash
# .env (standardized for all tiers)

# Tier limits
TIER_FREE_MAX_EMPLOYEES=50
TIER_FREE_TRIAL_MONTHS=4
TIER_FREE_API_CALLS_PER_DAY=1000

TIER_STARTER_MAX_EMPLOYEES=50
TIER_STARTER_TRIAL_MONTHS=2
TIER_STARTER_API_CALLS_PER_DAY=10000
TIER_STARTER_PRICE=20000

TIER_PROFESSIONAL_MAX_EMPLOYEES=300
TIER_PROFESSIONAL_TRIAL_MONTHS=2
TIER_PROFESSIONAL_API_CALLS_PER_DAY=50000
TIER_PROFESSIONAL_PRICE=25000

TIER_BUSINESS_MAX_EMPLOYEES=unlimited
TIER_BUSINESS_TRIAL_MONTHS=2
TIER_BUSINESS_API_CALLS_PER_DAY=unlimited
TIER_BUSINESS_PRICE=20000

TIER_ENTERPRISE_MAX_EMPLOYEES=unlimited
TIER_ENTERPRISE_API_CALLS_PER_DAY=unlimited
TIER_ENTERPRISE_PRICE=custom

# Billing
BILLING_GRACE_PERIOD_DAYS=3
BILLING_SUSPEND_DAYS=7
BILLING_AUTO_CANCEL_DAYS=30

# Trial
TRIAL_AUTO_CHARGE=true
TRIAL_REMINDER_DAYS_BEFORE=5
```

---

## Part 8: UI/UX Messaging Per Tier

### In-App Upgrade Prompts

```
When user (FREE tier) tries to access PAYROLL feature:
  ┌─────────────────────────────────────────┐
  │ 🔒 Feature Not Available                │
  │                                         │
  │ "Payroll" is only available in          │
  │ STARTER tier and higher.                │
  │                                         │
  │ Your plan: FREE (0 features)            │
  │ Needed: STARTER (Rp 20K/emp/month)      │
  │                                         │
  │ [Upgrade to STARTER] [Learn More]       │
  └─────────────────────────────────────────┘

When user (STARTER, 40 emp) approaches limit (50):
  ┌─────────────────────────────────────────┐
  │ ⚠️  Employee Limit Warning               │
  │                                         │
  │ You have 40/50 employees in your        │
  │ STARTER plan. Only 10 more available.   │
  │                                         │
  │ To add more, upgrade to PROFESSIONAL    │
  │ (supports up to 300 employees)          │
  │                                         │
  │ [Upgrade Now]                           │
  └─────────────────────────────────────────┘

When user (PROFESSIONAL, trial) has 5 days left:
  ┌─────────────────────────────────────────┐
  │ ⏰ Trial Ending Soon                     │
  │                                         │
  │ Your 2-month free trial ends in         │
  │ 5 days. After that, we'll charge:       │
  │                                         │
  │ Rp 2.500.000/month (100 emp × Rp 25K)  │
  │                                         │
  │ [Update Payment] [Downgrade] [Cancel]   │
  └─────────────────────────────────────────┘
```

---

## Part 9: Transition Plan

### Migration from current inconsistent state

```
Current state issues:
  ✗ FREE tier trial duration unclear
  ✗ Feature matrix not consistent between code/marketing
  ✗ Employee limit enforcement missing
  ✗ API call limits not enforced
  ✗ Billing logic incomplete

Migration steps:

Phase 1 (Week 1): Define SSOT
  [ ] Agree on tier definitions (this PRD)
  [ ] Approve feature matrix
  [ ] Decide on trial durations
  
Phase 2 (Week 2): Backend Implementation
  [ ] Update Subscription model in database
  [ ] Implement tier gating middleware
  [ ] Add employee count enforcement
  [ ] Add API rate limiting
  [ ] Test with existing customers
  
Phase 3 (Week 3): Frontend Implementation
  [ ] Update navigation/routes per tier
  [ ] Add upgrade prompts
  [ ] Update pricing display
  [ ] Add trial countdown
  
Phase 4 (Week 4): Customer Communication
  [ ] Email existing customers about changes
  [ ] Explain new tier structure
  [ ] Offer grandfathering if needed
  [ ] Update marketing site
  
Phase 5 (Week 5): Launch
  [ ] Enable tier enforcement
  [ ] Monitor for issues
  [ ] Support for customers
```

---

## Success Criteria (PRD v12.0)

```
✅ Tier structure documented (single SSOT)
✅ Employee limits enforced in code
✅ Trial periods enforced per tier
✅ Feature matrix consistent (code + marketing)
✅ API rate limits enforced
✅ Billing logic complete (trial → charge → upgrade/downgrade)
✅ UI prompts updated per tier
✅ Database schema aligned
✅ Environment variables standardized
✅ Existing customers migrated without interruption
✅ Support team trained on new structure
```

---

*Last Updated: 22 Juli 2026 | Owner: Dozer | Status: Standardization Specifications*
