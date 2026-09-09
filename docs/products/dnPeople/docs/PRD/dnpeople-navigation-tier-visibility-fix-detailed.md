# dnPeople — Demo Account Navigation Tier Visibility Fix
## Dedicated Implementation Guide

**Versi:** 1.0  
**Tanggal:** 24 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Specification ready

---

## Problem Statement

### Current Issue

```
Scenario: Demo account created on FREE tier
  - Demo company: Subscription.tier = "FREE"
  - Demo data: 1000 employees, full payroll, recruitment, training data (seeded)
  - Current behavior (WRONG):
    * Navigation shows: Employees, Payroll, Attendance, Leave, Recruitment, Performance, Training
    * User thinks: "Wow, all features available in free plan?"
    * Reality: Features are hidden/blocked behind tier gate
    * UX: Confusing. User clicks "Payroll" → redirected to /upgrade
    * Perception: Cheap trick, feels like bait-and-switch

Expected behavior (CORRECT):
  - Navigation shows ONLY FREE-tier features: Employees, Org, Dashboard, Documents, Helpdesk, Settings
  - Hidden items: Payroll, Attendance, Leave, Recruitment, Performance, Training, Talent, Integrations
  - User understands: "Free plan has core HR, upgrade for payroll/attendance/etc"
  - UX: Honest, clear value proposition
  - Demo is useful: Shows what FREE includes, why upgrade
```

### Why This Matters

```
BUSINESS:
  - Pricing credibility: If FREE shows everything, why pay?
  - Upsell clarity: Demo should highlight gaps (why upgrade?)
  - Conversion: Users see value of paid tiers, not feel tricked

UX/PRODUCT:
  - No confusion: Nav matches actual access
  - Reduces support: Fewer "Why is this blocked?" questions
  - Better product understanding: Demo shows tier boundaries

TECHNICAL:
  - Navigation driven by Subscription.tier (single source of truth)
  - Consistent with backend tier gating
  - No nav item exists "hidden" (clean DOM, no CSS display:none)
```

---

## Solution Design

### Architecture: Tier-Driven Navigation (Not Data-Driven)

```
Current (WRONG):
  Navigation.tsx
    ├─ Renders ALL possible nav items
    ├─ Uses CSS/display:none to hide some
    ├─ Result: DOM has hidden elements
    └─ User sees hover/inspection reveals what's "hidden"

Correct (NEW):
  Navigation.tsx
    ├─ Query: Subscription.tier from backend
    ├─ Build: feature_map[tier] → [available_features]
    ├─ Filter: Only render nav items in available_features
    ├─ Result: Clean DOM, only enabled items exist
    └─ User sees: Exactly what's available for their tier
```

### Single Source of Truth (SSOT)

```
Backend file: backend/src/lib/tierFeatures.ts
  → Defines: tier → [features]
  → Used by: API middleware (tier gate), navigation query

Frontend file: frontend/src/lib/tierFeatures.ts
  → Mirror of backend (same structure)
  → Used by: Navigation component, routes, UI logic

Sync rule:
  - Keep both in sync (reference backend in code comments)
  - If changing tiers/features, update both files
  - Test: Verify nav matches backend tier gate
```

### Implementation Flow

```
1. User login (any company, any tier)
   ↓
2. Auth context loads: { company, subscription, user }
   ↓
3. Query Subscription.tier: FREE / STARTER / PROFESSIONAL / BUSINESS / ENTERPRISE
   ↓
4. Navigation component loads
   ├─ Calls useTierAccess() hook
   ├─ Hook returns: hasAccess(feature) function
   ├─ For each nav item: hasAccess(item.feature)?
   ├─ If true: render
   ├─ If false: skip (return null, no DOM element)
   ↓
5. Result: Nav shows ONLY available features for tier
   ├─ FREE tier nav: 6 items (core HR)
   ├─ PROFESSIONAL nav: 10 items (+payroll, +talent, etc)
   ├─ BUSINESS nav: 12 items (+integrations, +api)
   └─ ENTERPRISE nav: All (14+ items)

Demo account:
  - Create with Subscription.tier = "FREE"
  - Seed with full sample data (doesn't matter)
  - Load app → Nav shows only FREE features
  - User sees: "This is what free includes"
  - User feels: Clear, honest demo
```

---

## Tier Feature Matrix (SSOT)

### Backend Definition

```typescript
// backend/src/lib/tierFeatures.ts

export const TIER_FEATURES = {
  FREE: {
    maxEmployees: 50,
    features: [
      'core_hr',        // employees, org, documents, calendar
      'helpdesk',       // announcements, support tickets
      'dashboard'       // basic dashboard
    ]
  },

  STARTER: {
    maxEmployees: 50,
    features: [
      'core_hr',
      'payroll',        // NEW
      'attendance',     // NEW
      'leave',          // NEW
      'shift',          // NEW
      'helpdesk',
      'dashboard',
      'basic_reports'   // NEW
    ]
  },

  PROFESSIONAL: {
    maxEmployees: 300,
    features: [
      'core_hr',
      'payroll',
      'attendance',
      'leave',
      'shift',
      'recruitment',    // NEW
      'performance',    // NEW
      'training',       // NEW
      'talent_matrix',  // NEW (Module 3)
      'helpdesk',
      'dashboard',
      'reports',        // Enhanced
      'custom_reports'  // NEW
    ]
  },

  BUSINESS: {
    maxEmployees: 999999,
    features: [
      // All PROFESSIONAL features +
      'api_keys',       // NEW
      'webhooks',       // NEW
      'integrations',   // NEW
      'workflows',      // NEW
      'assets',         // NEW
      'offboarding'     // NEW
    ]
  },

  ENTERPRISE: {
    maxEmployees: 999999,
    features: [
      // All BUSINESS features +
      'sso',            // NEW (SAML/Google/Microsoft)
      'scim',           // NEW
      'white_label',    // NEW
      'custom_domain',  // NEW
      'branding',       // NEW
      'audit_export',   // NEW
      'api_limit_custom' // NEW
    ]
  }
};

// Helper function (used by API middleware)
export function hasFeature(tier: string, feature: string): boolean {
  return TIER_FEATURES[tier]?.features.includes(feature) ?? false;
}
```

### Frontend Mirror

```typescript
// frontend/src/lib/tierFeatures.ts

export const TIER_FEATURES = {
  FREE: {
    features: [
      'core_hr',
      'helpdesk',
      'dashboard'
    ]
  },

  STARTER: {
    features: [
      'core_hr',
      'payroll',
      'attendance',
      'leave',
      'shift',
      'helpdesk',
      'dashboard',
      'basic_reports'
    ]
  },

  PROFESSIONAL: {
    features: [
      'core_hr',
      'payroll',
      'attendance',
      'leave',
      'shift',
      'recruitment',
      'performance',
      'training',
      'talent_matrix',
      'helpdesk',
      'dashboard',
      'reports',
      'custom_reports'
    ]
  },

  BUSINESS: {
    features: [
      // All PROFESSIONAL features +
      'api_keys',
      'webhooks',
      'integrations',
      'workflows',
      'assets',
      'offboarding'
    ]
  },

  ENTERPRISE: {
    features: [
      // All BUSINESS features +
      'sso',
      'scim',
      'white_label',
      'custom_domain',
      'branding',
      'audit_export',
      'api_limit_custom'
    ]
  }
};

// Helper (used by frontend navigation)
export function hasFeature(tier: string, feature: string): boolean {
  return TIER_FEATURES[tier]?.features.includes(feature) ?? false;
}
```

---

## Navigation Menu Definition

### Nav Structure (Tied to Features)

```typescript
// frontend/src/lib/navigationMenu.ts

export const NAVIGATION_MENU = [
  {
    key: 'employees',
    label: 'Employees',
    href: '/employees',
    feature: 'core_hr',
    icon: 'users'
  },
  {
    key: 'org',
    label: 'Organization',
    href: '/org',
    feature: 'core_hr',
    icon: 'network'
  },
  {
    key: 'payroll',
    label: 'Payroll',
    href: '/payroll',
    feature: 'payroll',
    icon: 'cash'
  },
  {
    key: 'attendance',
    label: 'Attendance',
    href: '/attendance',
    feature: 'attendance',
    icon: 'clock'
  },
  {
    key: 'leave',
    label: 'Leave',
    href: '/leave',
    feature: 'leave',
    icon: 'calendar'
  },
  {
    key: 'recruitment',
    label: 'Recruitment',
    href: '/recruitment',
    feature: 'recruitment',
    icon: 'briefcase'
  },
  {
    key: 'performance',
    label: 'Performance',
    href: '/performance',
    feature: 'performance',
    icon: 'chart'
  },
  {
    key: 'training',
    label: 'Training',
    href: '/training',
    feature: 'training',
    icon: 'book'
  },
  {
    key: 'talent',
    label: 'Talent',
    href: '/talent',
    feature: 'talent_matrix',
    icon: 'star'
  },
  {
    key: 'integrations',
    label: 'Integrations',
    href: '/integrations',
    feature: 'integrations',
    icon: 'plug'
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    feature: 'dashboard',
    icon: 'home'
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/settings',
    feature: 'core_hr', // Core feature
    icon: 'gear'
  }
];
```

---

## Implementation Code (Copy-Paste)

### 1. Hook: useTierAccess (Frontend)

```typescript
// frontend/src/hooks/useTierAccess.ts

import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { hasFeature } from '@/lib/tierFeatures';

export function useTierAccess() {
  const auth = useAuth();
  const { subscription } = auth;

  return {
    tier: subscription?.tier || 'FREE',
    
    hasAccess: (feature: string) => {
      if (!subscription) return false;
      return hasFeature(subscription.tier, feature);
    },

    canAccess: (features: string[]) => {
      // Check if user has access to ANY of these features
      if (!subscription) return false;
      return features.some(f => hasFeature(subscription.tier, f));
    },

    requiresUpgrade: (feature: string) => {
      // Return next tier that has this feature
      const tiers = ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'];
      const currentIndex = tiers.indexOf(subscription?.tier || 'FREE');
      
      for (let i = currentIndex + 1; i < tiers.length; i++) {
        if (hasFeature(tiers[i], feature)) {
          return tiers[i];
        }
      }
      return null;
    }
  };
}
```

### 2. Navigation Component (Frontend)

```typescript
// frontend/src/components/Navigation.tsx

import React from 'react';
import Link from 'next/link';
import { useTierAccess } from '@/hooks/useTierAccess';
import { NAVIGATION_MENU } from '@/lib/navigationMenu';

export function Navigation() {
  const { hasAccess } = useTierAccess();

  return (
    <nav className="sidebar-nav">
      <div className="nav-menu">
        {NAVIGATION_MENU.map((item) => {
          // CRITICAL: Only render if tier has access to feature
          if (!hasAccess(item.feature)) {
            return null; // Don't render hidden items
          }

          return (
            <Link key={item.key} href={item.href}>
              <a 
                className="nav-item"
                aria-label={item.label}
                title={item.label}
              >
                <span className={`icon icon-${item.icon}`} />
                <span className="label">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### 3. Route Protection (Frontend)

```typescript
// frontend/src/middleware/tierGate.ts

import { useRouter } from 'next/router';
import { useTierAccess } from '@/hooks/useTierAccess';

export function withTierGate(feature: string) {
  return (Component: React.ComponentType<any>) => {
    return function ProtectedComponent(props: any) {
      const router = useRouter();
      const { hasAccess, requiresUpgrade } = useTierAccess();

      if (!hasAccess(feature)) {
        const upgradeTier = requiresUpgrade(feature);
        
        router.replace(
          `/upgrade?feature=${feature}&required_tier=${upgradeTier}`
        );
        return null;
      }

      return <Component {...props} />;
    };
  };
}

// Usage in page:
export default withTierGate('payroll')(PayrollPage);
```

### 4. API Middleware (Backend)

```typescript
// backend/src/middleware/tierFeatureGate.ts

import { Request, Response, NextFunction } from 'express';
import { hasFeature } from '@/lib/tierFeatures';

export function tierFeatureGateMiddleware(requiredFeature: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const subscription = req.subscription;
    
    if (!subscription) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if tier has feature
    if (!hasFeature(subscription.tier, requiredFeature)) {
      return res.status(403).json({
        error: 'feature_not_available',
        message: `Feature '${requiredFeature}' not available in your ${subscription.tier} plan`,
        required_tier: findTierWithFeature(requiredFeature) || 'PROFESSIONAL'
      });
    }

    next();
  };
}

// Helper
function findTierWithFeature(feature: string): string | null {
  const tiers = ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'];
  for (const tier of tiers) {
    if (hasFeature(tier, feature)) {
      return tier;
    }
  }
  return null;
}

// Usage in routes
app.get('/api/v1/payroll', tierFeatureGateMiddleware('payroll'), payrollHandler);
```

---

## Demo Account Setup (Data Seeding)

### Demo Company Creation

```typescript
// backend/src/scripts/seedDemoAccount.ts

import { prisma } from '@/lib/prisma';
import { v4 as uuid } from 'uuid';

export async function createDemoAccount() {
  const demoCompanyId = uuid();
  
  // 1. Create company
  const company = await prisma.company.create({
    data: {
      id: demoCompanyId,
      name: 'PT Demo Indonesia',
      industry: 'Technology',
      employees: 150 // Sample data size
    }
  });

  // 2. Create subscription (IMPORTANT: tier = FREE!)
  const subscription = await prisma.subscription.create({
    data: {
      companyId: demoCompanyId,
      tier: 'FREE', // ← KEY: Demo is FREE tier
      status: 'active',
      trialEndsAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months
      employeeCountCache: 0 // Will be updated during seed
    }
  });

  // 3. Seed sample data (employees, payroll, recruitment, etc.)
  // This data is for API testing, but UI nav respects tier limit
  const employees = await seedEmployees(demoCompanyId, 150);
  const payrollRecords = await seedPayroll(demoCompanyId, 150);
  const recruitment = await seedRecruitment(demoCompanyId, 20);
  const trainings = await seedTraining(demoCompanyId, 5);

  // 4. Update employee count
  await prisma.subscription.update({
    where: { companyId: demoCompanyId },
    data: { employeeCountCache: employees.length }
  });

  console.log(`Demo account created:`);
  console.log(`  Company: ${company.name}`);
  console.log(`  Tier: FREE`);
  console.log(`  Sample data: ${employees.length} employees, ${payrollRecords.length} payroll records, etc`);
  console.log(`  Nav will show: Employees, Org, Dashboard, Documents, Helpdesk, Settings`);
  console.log(`  Nav hidden: Payroll, Attendance, Leave, Recruitment, etc (require upgrade)`);

  return company;
}

// Run: npx ts-node backend/src/scripts/seedDemoAccount.ts
```

### What Happens When Demo User Logs In

```
Scenario: User accesses demo.dnpeople.id (or demo account on main site)

Step 1: Login
  - Email: demo@example.com
  - Password: demo123
  - Auth server issues JWT + session cookie

Step 2: Frontend loads Auth context
  - Query: GET /api/v1/me
  - Response: { company: {id, name}, subscription: {tier: 'FREE'} }

Step 3: Navigation component renders
  - Calls: useTierAccess().hasAccess(feature)
  - For 'payroll': hasFeature('FREE', 'payroll') → false
  - Result: Nav item NOT rendered

Step 4: DOM Result
  Sidebar nav shows:
    ☑ Employees
    ☑ Organization
    ☑ Dashboard
    ☑ Documents
    ☑ Helpdesk
    ☑ Settings
  
  Hidden (not in DOM):
    ☐ Payroll (feature not available)
    ☐ Attendance
    ☐ Leave
    ☐ Recruitment
    ☐ Performance
    ☐ Training
    ☐ Talent
    ☐ Integrations

Step 5: User tries direct URL (e.g., /payroll)
  - Route middleware checks: hasAccess('payroll')
  - Result: false
  - Redirect: /upgrade?feature=payroll&tier=STARTER

Step 6: Upgrade page
  - Shows: "Payroll available in STARTER plan"
  - Shows STARTER benefits + pricing
  - Call-to-action: "Start 2-Month Trial"
  - User understands: Free shows core HR, payroll is paid feature
```

---

## Testing: Navigation Visibility Per Tier

### Unit Test

```typescript
// frontend/src/__tests__/tierFeatures.test.ts

import { hasFeature } from '@/lib/tierFeatures';

describe('Tier Features', () => {
  it('should give correct features for FREE tier', () => {
    expect(hasFeature('FREE', 'core_hr')).toBe(true);
    expect(hasFeature('FREE', 'payroll')).toBe(false);
    expect(hasFeature('FREE', 'talent_matrix')).toBe(false);
  });

  it('should give correct features for PROFESSIONAL tier', () => {
    expect(hasFeature('PROFESSIONAL', 'core_hr')).toBe(true);
    expect(hasFeature('PROFESSIONAL', 'payroll')).toBe(true);
    expect(hasFeature('PROFESSIONAL', 'talent_matrix')).toBe(true);
    expect(hasFeature('PROFESSIONAL', 'integrations')).toBe(false);
  });

  it('should give correct features for BUSINESS tier', () => {
    expect(hasFeature('BUSINESS', 'integrations')).toBe(true);
    expect(hasFeature('BUSINESS', 'sso')).toBe(false);
  });

  it('should give correct features for ENTERPRISE tier', () => {
    expect(hasFeature('ENTERPRISE', 'sso')).toBe(true);
    expect(hasFeature('ENTERPRISE', 'white_label')).toBe(true);
  });
});
```

### Integration Test

```typescript
// frontend/src/__tests__/navigation.integration.test.ts

import { render, screen } from '@testing-library/react';
import { Navigation } from '@/components/Navigation';
import { AuthContext } from '@/contexts/AuthContext';

describe('Navigation Visibility', () => {
  it('should only show FREE tier menu items for FREE users', () => {
    const mockAuth = {
      subscription: { tier: 'FREE' }
    };

    render(
      <AuthContext.Provider value={mockAuth}>
        <Navigation />
      </AuthContext.Provider>
    );

    // Should show
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Should NOT show
    expect(screen.queryByText('Payroll')).not.toBeInTheDocument();
    expect(screen.queryByText('Recruitment')).not.toBeInTheDocument();
    expect(screen.queryByText('Talent')).not.toBeInTheDocument();
  });

  it('should show PROFESSIONAL menu items for PROFESSIONAL users', () => {
    const mockAuth = {
      subscription: { tier: 'PROFESSIONAL' }
    };

    render(
      <AuthContext.Provider value={mockAuth}>
        <Navigation />
      </AuthContext.Provider>
    );

    // Should show
    expect(screen.getByText('Payroll')).toBeInTheDocument();
    expect(screen.getByText('Recruitment')).toBeInTheDocument();
    expect(screen.getByText('Talent')).toBeInTheDocument();

    // Should NOT show
    expect(screen.queryByText('Integrations')).not.toBeInTheDocument();
  });

  it('should show all menu items for ENTERPRISE users', () => {
    const mockAuth = {
      subscription: { tier: 'ENTERPRISE' }
    };

    render(
      <AuthContext.Provider value={mockAuth}>
        <Navigation />
      </AuthContext.Provider>
    );

    // All should show
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Payroll')).toBeInTheDocument();
    expect(screen.getByText('Talent')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
  });
});
```

### E2E Test (Demo Account)

```typescript
// e2e/demo-account-navigation.spec.ts

describe('Demo Account Navigation', () => {
  it('should show FREE tier menu items for demo account', () => {
    cy.visit('https://demo.dnpeople.id');
    
    // Login as demo
    cy.get('input[name="email"]').type('demo@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('button[type="submit"]').click();

    // Wait for dashboard
    cy.get('[data-testid="dashboard"]').should('be.visible');

    // Check navigation
    cy.get('nav.sidebar-nav').within(() => {
      // Should see
      cy.contains('Employees').should('be.visible');
      cy.contains('Organization').should('be.visible');
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Settings').should('be.visible');

      // Should NOT see (not in DOM)
      cy.contains('Payroll').should('not.exist');
      cy.contains('Recruitment').should('not.exist');
      cy.contains('Talent').should('not.exist');
    });
  });

  it('should redirect to /upgrade when trying /payroll on demo', () => {
    cy.visit('https://demo.dnpeople.id/payroll');
    
    // Should redirect
    cy.url().should('include', '/upgrade');
    cy.contains('Payroll available in STARTER plan').should('be.visible');
  });

  it('should allow viewing employee list (FREE feature)', () => {
    cy.visit('https://demo.dnpeople.id');
    cy.login('demo@example.com', 'demo123');

    cy.get('a[href="/employees"]').click();
    cy.get('[data-testid="employee-list"]').should('be.visible');
    
    // Should show sample data
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });
});
```

---

## Rollout Checklist

```
PRE-DEPLOY:
  [ ] Verify tierFeatures.ts matches backend and frontend
  [ ] Test Navigation component with all 5 tiers
  [ ] Verify demo account seeded with tier=FREE
  [ ] Test: Free user nav shows 6 items, no more
  [ ] Test: PROFESSIONAL user nav shows 12 items
  [ ] Test: Direct URL /payroll redirects to /upgrade (FREE user)
  [ ] Test: API /payroll returns 403 for FREE (backend gate)
  [ ] Audit trail: Check no "hidden" elements in DOM inspection

DEPLOY:
  [ ] Deploy backend tierFeatureGate middleware
  [ ] Deploy frontend Navigation component (new logic)
  [ ] Deploy tierFeatures.ts (both)
  [ ] Run database migrations (none needed, config only)
  [ ] Seed demo account with FREE tier
  [ ] Test on staging: All tier levels

POST-DEPLOY (Monitor 24h):
  [ ] Free tier users: Check nav only shows 6 items
  [ ] Demo account: Verify nav is clean (no hidden items)
  [ ] Error logs: Any 404 from missing nav links?
  [ ] Analytics: Track upgrades from /upgrade redirect
  [ ] Feedback: Any user confusion about menu?
```

---

## Before/After Comparison

### Before (WRONG)

```
Demo account on FREE tier:

Navigation (rendered):
  ☑ Employees
  ☑ Organization
  ☐ Payroll (hidden via CSS display:none)
  ☐ Attendance (hidden)
  ☐ Leave (hidden)
  ☐ Recruitment (hidden)
  ☐ Performance (hidden)
  ☐ Training (hidden)
  ☐ Talent (hidden)
  ☑ Dashboard
  ☑ Settings

Problem:
  - 9 hidden items in DOM (bad for accessibility)
  - User inspects → sees Payroll in HTML (confusion)
  - Hover reveals "hidden" items (feels deceptive)
  - Takes longer to understand: Is this included or not?
```

### After (CORRECT)

```
Demo account on FREE tier:

Navigation (rendered):
  ☑ Employees
  ☑ Organization
  ☑ Dashboard
  ☑ Documents
  ☑ Helpdesk
  ☑ Settings

Result:
  - Clean DOM: only 6 items exist
  - User understands: These are free features
  - No "hidden" items to confuse
  - Clear upgrade path: Click Employees → see all data, but click Payroll → upgrade page
  - Honest demo: Shows exactly what free includes
```

---

## Summary

```
KEY POINTS:

1. Tier-Driven Navigation (not data-driven)
   - Nav = Subscription.tier → hasAccess(feature)
   - Demo with tier=FREE shows only FREE menu
   - Demo can have full data (doesn't matter for nav)

2. Single Source of Truth (SSOT)
   - tierFeatures.ts (backend + frontend)
   - One place: tier → [features]
   - Update once: both nav + API middleware respect it

3. Clean Implementation
   - Navigation filters items (return null if no access)
   - No hidden DOM elements
   - No CSS display:none tricks
   - No confusion

4. Demo Account Clarity
   - Demo = FREE tier by default
   - Nav shows: 6 items (core HR)
   - User understands: This is what free includes
   - Upgrade CTA: Clear and honest

5. Testing
   - Unit: hasFeature('FREE', 'payroll') === false
   - Integration: Navigation renders 6 items for FREE
   - E2E: Demo account shows clean nav + redirects to upgrade

✅ Result: Honest, clear, no bait-and-switch feeling
```

---

*Last Updated: 24 Juli 2026 | Owner: Dozer | Status: Implementation Ready*
