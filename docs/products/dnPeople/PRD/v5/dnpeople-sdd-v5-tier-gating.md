# dnPeople — System Design Document (SDD)
## Feature Tier Gating & Subscription Implementation

**Version:** 1.0  
**Date:** July 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Audience:** Engineering, Architecture  
**Refs:** PRD Feature Tier Matrix

---

## 1. System Architecture Overview

### Current State (MVP 1-5)

```
Frontend (Next.js 16)
  ↓
API Gateway (Express 5)
  ↓
Application Services (role-based RBAC)
  ↓
Prisma ORM
  ↓
PostgreSQL 16 (company, users, employees, attendance, payroll, talent)
```

### New: Subscription Tier Layer

```
Frontend (Next.js 16)
  ├─ Feature Gate Components (FeatureGate, UpgradePrompt)
  └─ Role-based Navigation (exclude unavailable tiers)
  ↓
API Gateway (Express 5)
  ├─ Middleware: checkSubscriptionTier()
  └─ Middleware: featureAccess()
  ↓
Application Services
  ├─ Service: subscriptionService (tier lookup, cache)
  └─ Service: featureService (feature availability)
  ↓
Prisma ORM
  ├─ Model: Company (add subscriptionTier, enabledFeatures)
  ├─ Model: Subscription (billing, tier history)
  └─ Model: Feature Access Log (audit)
  ↓
PostgreSQL 16 (+ 3 new tables)
```

---

## 2. Database Schema Changes

### New Tables

#### Table: `Subscription`

```prisma
model Subscription {
  id                    String    @id @default(cuid())
  companyId             String    @unique
  company               Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  tier                  SubscriptionTier  @default(FREE)  // FREE | STARTER | PROFESSIONAL | BUSINESS | ENTERPRISE
  status                SubscriptionStatus @default(ACTIVE)  // ACTIVE | SUSPENDED | CANCELLED | EXPIRED
  
  // Billing
  billingEmail          String
  billingAddress        String?
  paymentMethod         String?    // stripe_pm_xxx, xendit_id_xxx, bank_transfer
  nextBillingDate       DateTime
  billingCycleDays      Int        @default(30)  // 30 (monthly) or 365 (annual)
  
  // Pricing snapshot (for historical tracking)
  pricePerEmployee      Decimal    @db.Decimal(10, 2)  // IDR 100, 150, 120, etc
  totalEmployees        Int
  monthlyAmount         Decimal    @db.Decimal(15, 2)  // Total monthly cost
  currency              String     @default("IDR")
  
  // Contract
  startDate             DateTime
  endDate               DateTime?
  autoRenew             Boolean    @default(true)
  cancelledAt           DateTime?
  cancellationReason    String?
  
  // Custom settings
  enabledFeatures       String[]   @default([])  // Override specific features (manual enable)
  customImplementation  Boolean    @default(false)  // Requires custom development
  
  // Audit
  createdAt             DateTime   @default(now())
  updatedAt             DateTime   @updatedAt
  updatedBy             String?    // User ID who made change
  
  // Relations
  invoices              Invoice[]
  auditLog              SubscriptionAuditLog[]
  
  @@index([companyId])
  @@index([tier])
  @@index([status])
  @@index([nextBillingDate])
}

enum SubscriptionTier {
  FREE
  STARTER
  PROFESSIONAL
  BUSINESS
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  SUSPENDED       // Payment failed
  CANCELLED       // Customer-initiated
  EXPIRED         // Trial ended
}
```

#### Table: `Invoice`

```prisma
model Invoice {
  id                String    @id @default(cuid())
  subscriptionId    String
  subscription      Subscription  @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  // Invoice details
  invoiceNumber     String    @unique
  status            InvoiceStatus  @default(DRAFT)  // DRAFT | SENT | PAID | OVERDUE | CANCELLED
  
  // Line items
  periodStart       DateTime
  periodEnd         DateTime
  employees         Int        // Headcount during period
  pricePerEmployee  Decimal    @db.Decimal(10, 2)
  subtotal          Decimal    @db.Decimal(15, 2)
  tax               Decimal    @db.Decimal(15, 2)  // PPN 11% if applicable
  total             Decimal    @db.Decimal(15, 2)
  currency          String     @default("IDR")
  
  // Payment
  paidAt            DateTime?
  paymentMethod     String?
  paymentReference  String?
  
  // Audit
  issuedAt          DateTime   @default(now())
  dueDate           DateTime
  sentAt            DateTime?
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
  
  @@index([subscriptionId])
  @@index([status])
  @@index([dueDate])
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}
```

#### Table: `SubscriptionAuditLog`

```prisma
model SubscriptionAuditLog {
  id                String    @id @default(cuid())
  subscriptionId    String
  subscription      Subscription  @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  action            String    // tier_changed, status_changed, feature_enabled, payment_failed, etc
  oldValue          String?   // JSON of previous state
  newValue          String?   // JSON of new state
  
  changedBy         String    // User ID or 'system'
  reason            String?   // Why was this changed?
  
  createdAt         DateTime  @default(now())
  
  @@index([subscriptionId])
  @@index([action])
  @@index([createdAt])
}
```

#### Update: `Company` table

```prisma
model Company {
  // ... existing fields ...
  
  // Subscription (link to Subscription table)
  subscriptionId    String?
  subscription      Subscription?  @relation(fields: [subscriptionId], references: [id])
  
  // Legacy (for backward compat, will deprecate)
  subscriptionTier  SubscriptionTier?  @default(FREE)  // DEPRECATED: use subscription.tier
  
  @@index([subscriptionId])
}
```

---

## 3. Backend Implementation

### 3.1 Subscription Service

**File:** `src/services/subscriptionService.ts`

```typescript
import { Subscription, SubscriptionTier } from '@prisma/client';

export class SubscriptionService {
  
  /**
   * Get company subscription tier (cached)
   * Returns FREE if no active subscription
   */
  async getSubscriptionTier(companyId: string): Promise<SubscriptionTier> {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      select: { tier: true, status: true }
    });
    
    if (!subscription || subscription.status !== 'ACTIVE') {
      return 'FREE';
    }
    
    return subscription.tier;
  }
  
  /**
   * Check if feature is available for company tier
   */
  async isFeatureAvailable(
    companyId: string,
    feature: string
  ): Promise<boolean> {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      select: {
        tier: true,
        status: true,
        enabledFeatures: true
      }
    });
    
    if (!subscription || subscription.status !== 'ACTIVE') {
      return false;
    }
    
    // Manual override check
    if (subscription.enabledFeatures?.includes(feature)) {
      return true;
    }
    
    // Tier-based access
    const tierFeatures = this.getTierFeatures(subscription.tier);
    return tierFeatures.includes(feature);
  }
  
  /**
   * Get all features available for a tier
   */
  private getTierFeatures(tier: SubscriptionTier): string[] {
    const features = {
      FREE: [
        'employees',
        'orgChart',
        'documents',
        'announcements',
        'policies',
        'calendar'
      ],
      STARTER: [
        ...features.FREE,
        'attendance',
        'leave',
        'payroll:basic',
        'permissions',
        'dashboard'
      ],
      PROFESSIONAL: [
        ...features.STARTER,
        'shift',
        'overTime',
        'claims',
        'loans',
        'recruitment',
        'onboarding',
        'performance',
        'training',
        'talent:competency',
        'talent:idp',
        'lms',
        'reporting:advanced',
        'webhooks'
      ],
      BUSINESS: [
        ...features.PROFESSIONAL,
        'multiBranch',
        'api:rest',
        'workflows:advanced',
        'security:rbac:advanced',
        'integrations:custom',
        'support:phone'
      ],
      ENTERPRISE: [
        ...features.BUSINESS,
        'multiCompany',
        'sso:saml',
        'sso:oauth',
        'whiteLavel',
        'ai:documents',
        'ai:recruitment',
        'talentMatrix:9box',
        'talentMatrix:succession',
        'carreerMarketplace',
        'ewa',
        'benchmarking',
        'support:24x7'
      ]
    };
    
    return features[tier] || [];
  }
  
  /**
   * Create subscription for new company (default: FREE)
   */
  async createSubscription(
    companyId: string,
    tier: SubscriptionTier = 'FREE'
  ): Promise<Subscription> {
    return prisma.subscription.create({
      data: {
        companyId,
        tier,
        status: 'ACTIVE',
        startDate: new Date(),
        billingEmail: '',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        monthlyAmount: this.getTierPrice(tier, 0)
      }
    });
  }
  
  /**
   * Upgrade/downgrade tier
   */
  async changeTier(
    subscriptionId: string,
    newTier: SubscriptionTier,
    changedBy: string
  ): Promise<Subscription> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    });
    
    if (!subscription) throw new Error('Subscription not found');
    
    // Log change
    await prisma.subscriptionAuditLog.create({
      data: {
        subscriptionId,
        action: 'tier_changed',
        oldValue: JSON.stringify({ tier: subscription.tier }),
        newValue: JSON.stringify({ tier: newTier }),
        changedBy
      }
    });
    
    // Update tier
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { tier: newTier }
    });
  }
  
  /**
   * Calculate monthly cost based on tier and employee count
   */
  private getTierPrice(tier: SubscriptionTier, employees: number): number {
    const pricePerEmp = {
      FREE: 0,
      STARTER: 20000,      // IDR 20K
      PROFESSIONAL: 25000, // IDR 25K
      BUSINESS: 20000,     // IDR 20K (volume discount)
      ENTERPRISE: 0        // Custom pricing
    };
    
    return (pricePerEmp[tier] || 0) * employees;
  }
}
```

### 3.2 Feature Access Middleware

**File:** `src/middleware/featureAccess.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscriptionService';

/**
 * Middleware to check feature access
 * Usage: router.get('/attendance', featureAccess('attendance'), controller)
 */
export function featureAccess(feature: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.company?.id;
      if (!companyId) {
        return res.status(401).json({ error: 'Company not found' });
      }
      
      const hasAccess = await subscriptionService.isFeatureAvailable(
        companyId,
        feature
      );
      
      if (!hasAccess) {
        const tier = await subscriptionService.getSubscriptionTier(companyId);
        return res.status(403).json({
          error: 'Feature not available',
          feature,
          currentTier: tier,
          message: `This feature requires upgrade from ${tier} tier`
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: 'Feature access check failed' });
    }
  };
}

/**
 * Middleware to require minimum tier
 * Usage: router.get('/multiBranch', requireMinTier('BUSINESS'), controller)
 */
export function requireMinTier(minTier: SubscriptionTier) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.company?.id;
      const currentTier = await subscriptionService.getSubscriptionTier(companyId);
      
      const tierOrder = ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'];
      if (tierOrder.indexOf(currentTier) < tierOrder.indexOf(minTier)) {
        return res.status(403).json({
          error: 'Insufficient tier',
          required: minTier,
          current: currentTier
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: 'Tier check failed' });
    }
  };
}
```

### 3.3 Route Updates

**File:** `src/routes/attendance.ts`

```typescript
import { Router } from 'express';
import { auth } from '../middleware/auth';
import { featureAccess, requireMinTier } from '../middleware/featureAccess';

const router = Router();

/**
 * Attendance routes - GATED by STARTER+ tier
 */
router.get(
  '/attendance',
  auth,
  featureAccess('attendance'),  // Check if attendance feature is available
  attendanceController.list
);

router.post(
  '/attendance/clock-in',
  auth,
  requireMinTier('STARTER'),    // Require minimum STARTER tier
  attendanceController.clockIn
);

router.post(
  '/attendance/clock-out',
  auth,
  requireMinTier('STARTER'),
  attendanceController.clockOut
);

// ... other routes ...

export default router;
```

**File:** `src/routes/payroll.ts`

```typescript
router.post(
  '/payroll/run',
  auth,
  featureAccess('payroll:basic'),
  payrollController.run
);

router.get(
  '/payroll/bukti-potong/:id',
  auth,
  requireMinTier('PROFESSIONAL'),  // Advanced payroll only
  payrollController.buktiPotong
);
```

**File:** `src/routes/talent.ts`

```typescript
// Talent development - GATED by PROFESSIONAL+ tier
router.post(
  '/talent/competencies',
  auth,
  featureAccess('talent:competency'),
  talentController.createCompetency
);

router.get(
  '/talent/gap-analysis/:employeeId',
  auth,
  requireMinTier('PROFESSIONAL'),
  talentController.gapAnalysis
);

router.post(
  '/idp/create',
  auth,
  featureAccess('talent:idp'),
  idpController.create
);
```

---

## 4. Frontend Implementation

### 4.1 Feature Gate Component

**File:** `src/components/FeatureGate.tsx`

```tsx
import React from 'react';
import { useSubscription } from '@/lib/useSubscription';
import { UpgradePrompt } from './UpgradePrompt';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  requiredTier?: 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';
  fallback?: React.ReactNode;
}

export function FeatureGate({
  feature,
  children,
  requiredTier,
  fallback
}: FeatureGateProps) {
  const { isFeatureAvailable, tier } = useSubscription();
  
  const hasAccess = isFeatureAvailable(feature);
  
  if (!hasAccess) {
    return fallback || <UpgradePrompt feature={feature} requiredTier={requiredTier} />;
  }
  
  return <>{children}</>;
}

// Usage
<FeatureGate feature="talent:idp" requiredTier="PROFESSIONAL">
  <IdpModule />
</FeatureGate>
```

### 4.2 Hook: useSubscription

**File:** `src/lib/useSubscription.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export function useSubscription() {
  const { data, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await api.get('/subscription/current');
      return response.data;
    }
  });
  
  const tierFeatures = {
    FREE: ['employees', 'orgChart', 'documents'],
    STARTER: ['attendance', 'leave', 'payroll:basic'],
    PROFESSIONAL: ['talent:competency', 'talent:idp', 'lms'],
    BUSINESS: ['multiBranch', 'api:rest'],
    ENTERPRISE: ['multiCompany', 'sso:saml', 'whiteLavel']
  };
  
  return {
    tier: data?.tier || 'FREE',
    status: data?.status || 'EXPIRED',
    isFeatureAvailable: (feature: string) => {
      const features = tierFeatures[data?.tier || 'FREE'] || [];
      return features.includes(feature);
    },
    isLoading
  };
}
```

### 4.3 Navigation Gate

**File:** `src/lib/getNavigation.ts`

```typescript
export function getNavigation(tier: SubscriptionTier) {
  const baseNav = [
    { label: 'Dashboard', href: '/dashboard', feature: 'dashboard' },
    { label: 'Employees', href: '/employees', feature: 'employees' },
    { label: 'Documents', href: '/documents', feature: 'documents' }
  ];
  
  const starterNav = [
    ...baseNav,
    { label: 'Attendance', href: '/attendance', feature: 'attendance' },
    { label: 'Leave', href: '/leave', feature: 'leave' },
    { label: 'Payroll', href: '/payroll', feature: 'payroll:basic' }
  ];
  
  const professionalNav = [
    ...starterNav,
    { label: 'Recruitment', href: '/recruitment', feature: 'recruitment' },
    { label: 'Performance', href: '/performance', feature: 'performance' },
    { label: 'Talent Dev', href: '/talent', feature: 'talent:competency' },
    { label: 'LMS', href: '/lms', feature: 'lms' }
  ];
  
  const businessNav = [
    ...professionalNav,
    { label: 'Integrations', href: '/integrations', feature: 'api:rest' },
    { label: 'Workflows', href: '/workflows', feature: 'workflows:advanced' }
  ];
  
  const enterpriseNav = [
    ...businessNav,
    { label: 'Platform', href: '/platform', feature: 'multiCompany' },
    { label: 'SSO', href: '/sso', feature: 'sso:saml' },
    { label: 'Branding', href: '/branding', feature: 'whiteLavel' }
  ];
  
  const navByTier = {
    FREE: baseNav,
    STARTER: starterNav,
    PROFESSIONAL: professionalNav,
    BUSINESS: businessNav,
    ENTERPRISE: enterpriseNav
  };
  
  return navByTier[tier];
}
```

### 4.4 Upgrade Prompt Component

**File:** `src/components/UpgradePrompt.tsx`

```tsx
export function UpgradePrompt({
  feature,
  requiredTier
}: {
  feature: string;
  requiredTier?: string;
}) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="font-semibold text-blue-900">Fitur Terkunci</h3>
      <p className="text-sm text-blue-700 mt-2">
        Fitur ini memerlukan tier {requiredTier || 'lebih tinggi'}.
      </p>
      <a href="/upgrade" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">
        Upgrade Sekarang
      </a>
    </div>
  );
}
```

---

## 5. API Endpoints (New)

### GET /api/subscription/current

Get current subscription details.

**Response:**
```json
{
  "id": "sub_abc123",
  "companyId": "comp_xyz789",
  "tier": "PROFESSIONAL",
  "status": "ACTIVE",
  "billingEmail": "billing@company.com",
  "nextBillingDate": "2026-08-16",
  "monthlyAmount": 3750000,
  "employees": 150,
  "startDate": "2026-07-16",
  "autoRenew": true
}
```

### POST /api/subscription/upgrade

Upgrade to a new tier.

**Request:**
```json
{
  "newTier": "BUSINESS",
  "effectiveDate": "2026-07-20"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": { ... },
  "invoiceId": "inv_123456",
  "message": "Upgrade successful. Please review your new invoice."
}
```

### GET /api/subscription/features

Get available features for current tier.

**Response:**
```json
{
  "tier": "PROFESSIONAL",
  "features": [
    "employees",
    "attendance",
    "leave",
    "payroll:basic",
    "talent:competency",
    "talent:idp",
    "lms",
    ...
  ]
}
```

### POST /api/subscription/cancel

Cancel subscription.

**Request:**
```json
{
  "reason": "Switching to competitor",
  "effectiveDate": "2026-08-16",
  "feedback": "..."
}
```

---

## 6. Billing Integration

### Stripe Integration (Payment)

```typescript
// src/services/billingService.ts

export class BillingService {
  async createStripeCustomer(companyId: string, email: string) {
    const customer = await stripe.customers.create({
      email,
      metadata: { companyId }
    });
    
    await prisma.subscription.update({
      where: { companyId },
      data: { paymentMethod: `stripe_${customer.id}` }
    });
  }
  
  async chargeMonthly(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    });
    
    const amount = subscription.monthlyAmount;
    const stripeCustomerId = subscription.paymentMethod;
    
    try {
      const charge = await stripe.charges.create({
        amount: Math.round(amount * 100), // cents
        currency: 'idr',
        customer: stripeCustomerId
      });
      
      // Create invoice
      await prisma.invoice.create({
        data: {
          subscriptionId,
          status: 'PAID',
          paidAt: new Date(),
          paymentReference: charge.id,
          ...
        }
      });
    } catch (error) {
      // Payment failed → suspend
      await this.suspendSubscription(subscriptionId, 'Payment failed');
    }
  }
  
  async suspendSubscription(subscriptionId: string, reason: string) {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'SUSPENDED'
      }
    });
    
    await prisma.subscriptionAuditLog.create({
      data: {
        subscriptionId,
        action: 'suspended',
        reason,
        changedBy: 'system'
      }
    });
  }
}
```

---

## 7. Testing Strategy

### Unit Tests

```typescript
// tests/services/subscriptionService.test.ts

describe('SubscriptionService', () => {
  it('should return FREE tier for no subscription', async () => {
    const tier = await subscriptionService.getSubscriptionTier('comp_unknown');
    expect(tier).toBe('FREE');
  });
  
  it('should check feature availability by tier', async () => {
    const available = await subscriptionService.isFeatureAvailable(
      'comp_professional',
      'talent:idp'
    );
    expect(available).toBe(true);
  });
  
  it('should block FREE tier from attendance', async () => {
    const available = await subscriptionService.isFeatureAvailable(
      'comp_free',
      'attendance'
    );
    expect(available).toBe(false);
  });
});
```

### Integration Tests

```typescript
// tests/routes/attendance.test.ts

describe('Attendance Routes', () => {
  it('should allow STARTER+ to clock in', async () => {
    const response = await request(app)
      .post('/api/attendance/clock-in')
      .set('Authorization', `Bearer ${starterToken}`)
      .send({ latitude: 0, longitude: 0 });
    
    expect(response.status).toBe(200);
  });
  
  it('should reject FREE tier from clock-in', async () => {
    const response = await request(app)
      .post('/api/attendance/clock-in')
      .set('Authorization', `Bearer ${freeToken}`)
      .send({ latitude: 0, longitude: 0 });
    
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Feature not available');
  });
});
```

---

## 8. Deployment Checklist

- [ ] Add new tables to Prisma migration
- [ ] Deploy migration to production
- [ ] Update backend routes with feature gating middleware
- [ ] Update frontend components with FeatureGate wrappers
- [ ] Update navigation menu to exclude unavailable tier features
- [ ] Set up Stripe webhook for payment events
- [ ] Create billing dashboard UI
- [ ] Create upgrade/downgrade flows
- [ ] Document tier requirements in API docs
- [ ] Add feature availability to API responses
- [ ] Create monitoring for failed payments
- [ ] Create customer communication templates (suspension warnings, upgrade prompts)

---

*Last Updated: July 16, 2026*
