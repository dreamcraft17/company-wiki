# dnPeople — SDD v12.0
## Subscription Tier Consolidation - Technical Implementation

**Versi:** 12.0  
**Tanggal:** 22 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Implementation guide (ready to code)

---

## Part 1: Database Schema & Migrations

### 1.1 Database Updates

```sql
-- Migration: 2026-07-22_update_subscription_tier_enforcement.sql

-- 1. Update Subscription table with new fields
ALTER TABLE Subscription ADD COLUMN IF NOT EXISTS (
  trialEndsAt TIMESTAMP,
  billingPeriodStart DATE,
  billingPeriodEnd DATE,
  currentEmployeeCount INT DEFAULT 0,
  monthlyAPICallsUsed INT DEFAULT 0,
  paymentMethodId STRING,
  lastChargedAt TIMESTAMP,
  nextChargeDate DATE,
  status ENUM('trial', 'active', 'grace_period', 'suspended', 'canceled') DEFAULT 'trial'
);

-- 2. Create FeatureAccess table for tier-based feature gating
CREATE TABLE IF NOT EXISTS FeatureAccess (
  id STRING PRIMARY KEY DEFAULT gen_random_uuid(),
  tier ENUM('FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE') NOT NULL,
  featureName STRING NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tier, featureName),
  INDEX(tier),
  INDEX(featureName)
);

-- 3. Create APIUsage table for rate limiting tracking
CREATE TABLE IF NOT EXISTS APIUsage (
  id STRING PRIMARY KEY DEFAULT gen_random_uuid(),
  companyId STRING NOT NULL,
  date DATE NOT NULL,
  callsToday INT DEFAULT 0,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(companyId, date),
  INDEX(companyId),
  INDEX(date),
  FOREIGN KEY(companyId) REFERENCES Company(id) ON DELETE CASCADE
);

-- 4. Create BillingHistory table for invoice tracking
CREATE TABLE IF NOT EXISTS BillingHistory (
  id STRING PRIMARY KEY DEFAULT gen_random_uuid(),
  companyId STRING NOT NULL,
  subscriptionId STRING NOT NULL,
  billingPeriod STRING NOT NULL, -- e.g., "2026-07"
  
  tier STRING NOT NULL, -- tier at time of billing
  employeeCount INT NOT NULL,
  pricePerEmployee INT NOT NULL,
  
  chargeAmount INT NOT NULL, -- in Rp
  currency STRING DEFAULT 'IDR',
  
  status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  paidAt TIMESTAMP,
  failureReason STRING,
  
  invoiceNumber STRING UNIQUE,
  invoicePath STRING, -- path to PDF
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX(companyId),
  INDEX(status),
  INDEX(billingPeriod),
  FOREIGN KEY(companyId) REFERENCES Company(id) ON DELETE CASCADE,
  FOREIGN KEY(subscriptionId) REFERENCES Subscription(id) ON DELETE CASCADE
);

-- 5. Seed FeatureAccess table with tier features
INSERT INTO FeatureAccess (tier, featureName, enabled) VALUES
-- FREE tier features
('FREE', 'employee_crud', true),
('FREE', 'org_structure', true),
('FREE', 'staff_accounts', true),
('FREE', 'payroll', false),
('FREE', 'attendance', false),
('FREE', 'leave', false),
('FREE', 'shift', false),
('FREE', 'recruitment', false),
('FREE', 'performance', false),
('FREE', 'training', false),
('FREE', 'api_keys', false),
('FREE', 'sso', false),
('FREE', 'custom_domain', false),
('FREE', 'white_label', false),

-- STARTER tier features
('STARTER', 'employee_crud', true),
('STARTER', 'org_structure', true),
('STARTER', 'staff_accounts', true),
('STARTER', 'payroll', true),
('STARTER', 'attendance', true),
('STARTER', 'leave', true),
('STARTER', 'shift', true),
('STARTER', 'recruitment', false),
('STARTER', 'performance', false),
('STARTER', 'training', false),
('STARTER', 'api_keys', false),
('STARTER', 'sso', false),
('STARTER', 'custom_domain', false),
('STARTER', 'white_label', false),

-- PROFESSIONAL tier features
('PROFESSIONAL', 'employee_crud', true),
('PROFESSIONAL', 'org_structure', true),
('PROFESSIONAL', 'staff_accounts', true),
('PROFESSIONAL', 'payroll', true),
('PROFESSIONAL', 'attendance', true),
('PROFESSIONAL', 'leave', true),
('PROFESSIONAL', 'shift', true),
('PROFESSIONAL', 'recruitment', true),
('PROFESSIONAL', 'performance', true),
('PROFESSIONAL', 'training', true),
('PROFESSIONAL', 'api_keys', false),
('PROFESSIONAL', 'sso', false),
('PROFESSIONAL', 'custom_domain', true),
('PROFESSIONAL', 'white_label', false),

-- BUSINESS tier features
('BUSINESS', 'employee_crud', true),
('BUSINESS', 'org_structure', true),
('BUSINESS', 'staff_accounts', true),
('BUSINESS', 'payroll', true),
('BUSINESS', 'attendance', true),
('BUSINESS', 'leave', true),
('BUSINESS', 'shift', true),
('BUSINESS', 'recruitment', true),
('BUSINESS', 'performance', true),
('BUSINESS', 'training', true),
('BUSINESS', 'api_keys', true),
('BUSINESS', 'sso', false),
('BUSINESS', 'custom_domain', true),
('BUSINESS', 'white_label', false),

-- ENTERPRISE tier features
('ENTERPRISE', 'employee_crud', true),
('ENTERPRISE', 'org_structure', true),
('ENTERPRISE', 'staff_accounts', true),
('ENTERPRISE', 'payroll', true),
('ENTERPRISE', 'attendance', true),
('ENTERPRISE', 'leave', true),
('ENTERPRISE', 'shift', true),
('ENTERPRISE', 'recruitment', true),
('ENTERPRISE', 'performance', true),
('ENTERPRISE', 'training', true),
('ENTERPRISE', 'api_keys', true),
('ENTERPRISE', 'sso', true),
('ENTERPRISE', 'custom_domain', true),
('ENTERPRISE', 'white_label', true);

-- 6. Update existing subscriptions with trial dates
UPDATE Subscription SET
  trialEndsAt = CASE
    WHEN tier = 'FREE' THEN createdAt + INTERVAL '120 days'
    WHEN tier IN ('STARTER', 'PROFESSIONAL', 'BUSINESS') THEN createdAt + INTERVAL '60 days'
    ELSE NULL
  END,
  status = CASE
    WHEN tier = 'FREE' THEN 'active'
    WHEN createdAt + INTERVAL '60 days' > NOW() THEN 'trial'
    ELSE 'active'
  END,
  billingPeriodStart = DATE_TRUNC('month', COALESCE(createdAt, NOW())),
  billingPeriodEnd = DATE_TRUNC('month', COALESCE(createdAt, NOW())) + INTERVAL '1 month' - INTERVAL '1 day'
WHERE trialEndsAt IS NULL;

-- 7. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_tier_status ON Subscription(tier, status);
CREATE INDEX IF NOT EXISTS idx_subscription_trial_ends_at ON Subscription(trialEndsAt);
CREATE INDEX IF NOT EXISTS idx_subscription_next_charge_date ON Subscription(nextChargeDate);
CREATE INDEX IF NOT EXISTS idx_billing_history_company_period ON BillingHistory(companyId, billingPeriod);
```

### 1.2 Prisma Schema Update

```prisma
// prisma/schema.prisma

enum SubscriptionTier {
  FREE
  STARTER
  PROFESSIONAL
  BUSINESS
  ENTERPRISE
}

enum SubscriptionStatus {
  trial
  active
  grace_period
  suspended
  canceled
}

enum BillingStatus {
  pending
  paid
  failed
  refunded
}

model Subscription {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String              @unique
  
  tier                  SubscriptionTier    @default(FREE)
  
  // Trial tracking
  startedAt             DateTime            @default(now())
  trialEndsAt           DateTime?
  
  // Billing
  billingPeriodStart    DateTime?
  billingPeriodEnd      DateTime?
  status                SubscriptionStatus  @default(trial)
  
  // Payment
  paymentMethodId       String?
  lastChargedAt         DateTime?
  nextChargeDate        DateTime?
  
  // Usage tracking
  currentEmployeeCount  Int                 @default(0)
  monthlyAPICallsUsed   Int                 @default(0)
  
  // Relations
  billingHistory        BillingHistory[]
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@index([tier])
  @@index([status])
  @@index([trialEndsAt])
  @@index([nextChargeDate])
}

model FeatureAccess {
  id                    String              @id @default(cuid())
  tier                  SubscriptionTier    @db.VarChar(20)
  featureName           String
  enabled               Boolean             @default(false)
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@unique([tier, featureName])
  @@index([tier])
  @@index([featureName])
}

model APIUsage {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String
  date                  DateTime            @db.Date
  callsToday            Int                 @default(0)
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@unique([companyId, date])
  @@index([companyId])
  @@index([date])
}

model BillingHistory {
  id                    String              @id @default(cuid())
  subscription          Subscription        @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  subscriptionId        String
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String
  
  billingPeriod         String // "2026-07"
  tier                  SubscriptionTier
  employeeCount         Int
  pricePerEmployee      Int
  
  chargeAmount          Int // Rp
  currency              String              @default("IDR")
  status                BillingStatus       @default(pending)
  paidAt                DateTime?
  failureReason         String?
  
  invoiceNumber         String?             @unique
  invoicePath           String?
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@index([companyId])
  @@index([status])
  @@index([billingPeriod])
}
```

---

## Part 2: Environment Variables

```bash
# .env (standardized)

# TIER DEFINITIONS
TIER_FREE_MAX_EMPLOYEES=50
TIER_FREE_TRIAL_MONTHS=4
TIER_FREE_API_CALLS_PER_DAY=1000
TIER_FREE_PRICE=0

TIER_STARTER_MAX_EMPLOYEES=50
TIER_STARTER_TRIAL_MONTHS=2
TIER_STARTER_API_CALLS_PER_DAY=10000
TIER_STARTER_PRICE=20000

TIER_PROFESSIONAL_MAX_EMPLOYEES=300
TIER_PROFESSIONAL_TRIAL_MONTHS=2
TIER_PROFESSIONAL_API_CALLS_PER_DAY=50000
TIER_PROFESSIONAL_PRICE=25000

TIER_BUSINESS_MAX_EMPLOYEES=999999
TIER_BUSINESS_TRIAL_MONTHS=2
TIER_BUSINESS_API_CALLS_PER_DAY=999999
TIER_BUSINESS_PRICE=20000

TIER_ENTERPRISE_MAX_EMPLOYEES=999999
TIER_ENTERPRISE_API_CALLS_PER_DAY=999999
TIER_ENTERPRISE_PRICE=0 # custom

# BILLING
BILLING_GRACE_PERIOD_DAYS=3
BILLING_SUSPEND_DAYS=7
BILLING_AUTO_CANCEL_DAYS=30
BILLING_CURRENCY=IDR

# SOFT LIMITS
TIER_BUSINESS_SOFT_LIMIT_EMPLOYEES=1000
TIER_EMPLOYEE_WARNING_THRESHOLD_PERCENT=80

# EMAIL
TRIAL_REMINDER_DAYS_BEFORE=5
TRIAL_END_REMINDER_DAYS=1
```

---

## Part 3: Backend Implementation

### 3.1 Tier Configuration Service

```typescript
// backend/src/services/tierService.ts

import { SubscriptionTier } from '@prisma/client';

export interface TierConfig {
  maxEmployees: number | 'unlimited';
  pricePerEmployee: number;
  trialMonths: number | null;
  apiCallsPerDay: number | 'unlimited';
  features: string[];
  restrictions: Record<string, 'disabled' | 'enabled'>;
}

export class TierService {
  private tierConfigs: Record<SubscriptionTier, TierConfig>;

  constructor() {
    this.tierConfigs = {
      FREE: {
        maxEmployees: parseInt(process.env.TIER_FREE_MAX_EMPLOYEES || '50'),
        pricePerEmployee: parseInt(process.env.TIER_FREE_PRICE || '0'),
        trialMonths: parseInt(process.env.TIER_FREE_TRIAL_MONTHS || '4'),
        apiCallsPerDay: parseInt(process.env.TIER_FREE_API_CALLS_PER_DAY || '1000'),
        features: ['employee_crud', 'org_structure', 'staff_accounts'],
        restrictions: {
          payroll: 'disabled',
          attendance: 'disabled',
          recruitment: 'disabled',
          api_keys: 'disabled',
          sso: 'disabled',
        }
      },
      
      STARTER: {
        maxEmployees: parseInt(process.env.TIER_STARTER_MAX_EMPLOYEES || '50'),
        pricePerEmployee: parseInt(process.env.TIER_STARTER_PRICE || '20000'),
        trialMonths: parseInt(process.env.TIER_STARTER_TRIAL_MONTHS || '2'),
        apiCallsPerDay: parseInt(process.env.TIER_STARTER_API_CALLS_PER_DAY || '10000'),
        features: ['employee_crud', 'org_structure', 'payroll', 'attendance', 'leave', 'shift'],
        restrictions: {
          recruitment: 'disabled',
          api_keys: 'disabled',
          sso: 'disabled',
        }
      },
      
      PROFESSIONAL: {
        maxEmployees: parseInt(process.env.TIER_PROFESSIONAL_MAX_EMPLOYEES || '300'),
        pricePerEmployee: parseInt(process.env.TIER_PROFESSIONAL_PRICE || '25000'),
        trialMonths: parseInt(process.env.TIER_PROFESSIONAL_TRIAL_MONTHS || '2'),
        apiCallsPerDay: parseInt(process.env.TIER_PROFESSIONAL_API_CALLS_PER_DAY || '50000'),
        features: ['*'], // all features except api_keys, sso, white_label
        restrictions: {
          api_keys: 'disabled',
          sso: 'disabled',
          white_label: 'disabled',
          multi_cabang: 'disabled',
        }
      },
      
      BUSINESS: {
        maxEmployees: 'unlimited',
        pricePerEmployee: parseInt(process.env.TIER_BUSINESS_PRICE || '20000'),
        trialMonths: 2,
        apiCallsPerDay: 'unlimited',
        features: ['*'],
        restrictions: {
          sso: 'disabled',
          white_label: 'disabled',
        }
      },
      
      ENTERPRISE: {
        maxEmployees: 'unlimited',
        pricePerEmployee: 0, // custom
        trialMonths: null,
        apiCallsPerDay: 'unlimited',
        features: ['*'],
        restrictions: {} // no restrictions
      }
    };
  }

  getTierConfig(tier: SubscriptionTier): TierConfig {
    return this.tierConfigs[tier];
  }

  isFeatureEnabled(tier: SubscriptionTier, feature: string): boolean {
    const config = this.tierConfigs[tier];
    if (config.features.includes('*')) return true;
    if (config.restrictions[feature] === 'disabled') return false;
    return config.features.includes(feature);
  }

  getMaxEmployees(tier: SubscriptionTier): number | 'unlimited' {
    return this.tierConfigs[tier].maxEmployees;
  }

  getTrialEndDate(startDate: Date, tier: SubscriptionTier): Date | null {
    const trialMonths = this.tierConfigs[tier].trialMonths;
    if (trialMonths === null) return null;
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + trialMonths);
    return endDate;
  }

  getAllTiers(): SubscriptionTier[] {
    return Object.keys(this.tierConfigs) as SubscriptionTier[];
  }
}

export const tierService = new TierService();
```

### 3.2 Employee Count Enforcement Middleware

```typescript
// backend/src/middleware/employeeCountGate.ts

import { Request, Response, NextFunction } from 'express';
import { db } from '@/lib/db';
import { tierService } from '@/services/tierService';

export async function employeeCountGateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const companyId = req.company?.id;
  if (!companyId) return next();
  
  const subscription = await db.subscription.findUnique({
    where: { companyId }
  });
  
  if (!subscription) return next();
  
  // Check employee count only for relevant endpoints
  if (!req.path.includes('/employees')) return next();
  if (req.method !== 'POST') return next(); // Only enforce on create
  
  const tier = subscription.tier;
  const tierConfig = tierService.getTierConfig(tier);
  
  if (tierConfig.maxEmployees === 'unlimited') return next();
  
  const employeeCount = await db.employee.count({
    where: { companyId, deletedAt: null }
  });
  
  if (employeeCount >= tierConfig.maxEmployees) {
    return res.status(403).json({
      error: 'employee_limit_reached',
      message: `Your ${tier} plan is limited to ${tierConfig.maxEmployees} employees`,
      current: employeeCount,
      limit: tierConfig.maxEmployees,
      tier: tier,
      nextTier: tier === 'STARTER' ? 'PROFESSIONAL' : tier === 'PROFESSIONAL' ? 'BUSINESS' : null
    });
  }
  
  next();
}

// Usage in Express app
app.post('/api/v1/employees', employeeCountGateMiddleware, createEmployeeHandler);
```

### 3.3 Billing Service

```typescript
// backend/src/services/billingService.ts

import { db } from '@/lib/db';
import { tierService } from '@/services/tierService';
import { addDays, addMonths, getLastDayOfMonth } from 'date-fns';
import { sendEmail } from '@/lib/email';

export class BillingService {
  
  async calculateMonthlyCharge(companyId: string): Promise<{
    amount: number;
    employeeCount: number;
    pricePerEmployee: number;
  }> {
    const subscription = await db.subscription.findUnique({
      where: { companyId }
    });
    
    if (!subscription) throw new Error('Subscription not found');
    
    const employeeCount = await db.employee.count({
      where: { companyId, deletedAt: null }
    });
    
    const tierConfig = tierService.getTierConfig(subscription.tier);
    const amount = employeeCount * tierConfig.pricePerEmployee;
    
    return {
      amount,
      employeeCount,
      pricePerEmployee: tierConfig.pricePerEmployee
    };
  }

  async chargeSubscription(companyId: string): Promise<{
    success: boolean;
    invoiceId?: string;
    amount?: number;
    error?: string;
  }> {
    const subscription = await db.subscription.findUnique({
      where: { companyId },
      include: { company: true }
    });
    
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }
    
    if (!subscription.paymentMethodId) {
      return { success: false, error: 'No payment method on file' };
    }
    
    // Calculate charge
    const { amount, employeeCount } = await this.calculateMonthlyCharge(companyId);
    
    if (amount === 0) {
      // Free tier, no charge
      return { success: true };
    }
    
    // Create invoice
    const billingPeriod = new Date().toISOString().substring(0, 7); // YYYY-MM
    const invoice = await db.billingHistory.create({
      data: {
        companyId,
        subscriptionId: subscription.id,
        billingPeriod,
        tier: subscription.tier,
        employeeCount,
        pricePerEmployee: tierService.getTierConfig(subscription.tier).pricePerEmployee,
        chargeAmount: amount,
        status: 'pending',
        invoiceNumber: this.generateInvoiceNumber(companyId)
      }
    });
    
    try {
      // Process payment through Xendit
      const paymentResult = await this.chargeViaXendit(
        subscription.paymentMethodId,
        amount,
        invoice.invoiceNumber
      );
      
      if (paymentResult.success) {
        // Update invoice and subscription
        await db.billingHistory.update({
          where: { id: invoice.id },
          data: {
            status: 'paid',
            paidAt: new Date()
          }
        });
        
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            lastChargedAt: new Date(),
            nextChargeDate: addMonths(new Date(), 1),
            status: 'active'
          }
        });
        
        // Send confirmation email
        await sendEmail({
          to: subscription.company.adminEmail,
          subject: 'Payment Confirmed',
          template: 'payment-confirmation',
          data: {
            invoiceNumber: invoice.invoiceNumber,
            amount: amount,
            tier: subscription.tier,
            employeeCount: employeeCount
          }
        });
        
        return { success: true, invoiceId: invoice.id, amount };
      } else {
        throw new Error(paymentResult.error);
      }
    } catch (error) {
      // Payment failed
      await db.billingHistory.update({
        where: { id: invoice.id },
        data: {
          status: 'failed',
          failureReason: error.message
        }
      });
      
      // Send failure email
      await sendEmail({
        to: subscription.company.adminEmail,
        subject: 'Payment Failed',
        template: 'payment-failure',
        data: {
          invoiceNumber: invoice.invoiceNumber,
          amount: amount,
          reason: error.message,
          retryDate: addDays(new Date(), 3)
        }
      });
      
      return { success: false, error: error.message };
    }
  }

  async checkTrialExpiration(companyId: string): Promise<void> {
    const subscription = await db.subscription.findUnique({
      where: { companyId },
      include: { company: true }
    });
    
    if (!subscription || !subscription.trialEndsAt) return;
    
    const now = new Date();
    if (now <= subscription.trialEndsAt) return; // Still in trial
    
    // Trial expired
    if (subscription.tier === 'FREE') {
      // FREE tier stays free
      return;
    }
    
    // PAID tier: try to charge
    if (subscription.paymentMethodId) {
      await this.chargeSubscription(companyId);
    } else {
      // No payment method, downgrade to FREE
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          tier: 'FREE',
          status: 'trial_expired'
        }
      });
      
      await sendEmail({
        to: subscription.company.adminEmail,
        subject: 'Trial Ended',
        template: 'trial-ended',
        data: {
          tier: subscription.tier,
          action: 'Add payment method to continue'
        }
      });
    }
  }

  private generateInvoiceNumber(companyId: string): string {
    const timestamp = Date.now();
    const hash = companyId.substring(0, 4).toUpperCase();
    return `INV-${hash}-${timestamp}`;
  }

  private async chargeViaXendit(
    paymentMethodId: string,
    amount: number,
    invoiceNumber: string
  ): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement Xendit API call
    // This is a stub
    return { success: true };
  }
}

export const billingService = new BillingService();

// Daily cron job to check trial expirations
export async function dailyCheckTrialExpirations() {
  const allSubscriptions = await db.subscription.findMany({
    where: {
      tier: { in: ['STARTER', 'PROFESSIONAL', 'BUSINESS'] }
    }
  });
  
  for (const sub of allSubscriptions) {
    try {
      await billingService.checkTrialExpiration(sub.companyId);
    } catch (error) {
      console.error(`Error checking trial for ${sub.companyId}:`, error);
    }
  }
}

// Register cron job
import cron from 'node-cron';
cron.schedule('0 0 * * *', () => {
  console.log('Running daily trial expiration check');
  dailyCheckTrialExpirations();
});
```

### 3.4 Feature Gating Middleware

```typescript
// backend/src/middleware/tierFeatureGate.ts

import { Request, Response, NextFunction } from 'express';
import { db } from '@/lib/db';
import { tierService } from '@/services/tierService';

const FEATURE_TO_ENDPOINT_MAP: Record<string, string[]> = {
  payroll: ['/payroll', '/payroll-settings'],
  attendance: ['/attendance', '/corrections', '/shifts'],
  recruitment: ['/recruitment', '/careers'],
  api_keys: ['/integrations'],
  sso: ['/integrations/sso'],
  white_label: ['/branding'],
};

export async function tierFeatureGateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const companyId = req.company?.id;
  if (!companyId) return next();
  
  const subscription = await db.subscription.findUnique({
    where: { companyId }
  });
  
  if (!subscription) return next();
  
  const tier = subscription.tier;
  
  // Check if this endpoint requires a specific feature
  for (const [feature, endpoints] of Object.entries(FEATURE_TO_ENDPOINT_MAP)) {
    if (endpoints.some(endpoint => req.path.startsWith(endpoint))) {
      const isEnabled = tierService.isFeatureEnabled(tier, feature);
      
      if (!isEnabled) {
        return res.status(403).json({
          error: 'feature_not_available',
          message: `Feature '${feature}' is not available in your ${tier} plan`,
          feature: feature,
          currentTier: tier,
          suggestedTier: this.getSuggestedTier(tier, feature)
        });
      }
      break;
    }
  }
  
  next();
}

function getSuggestedTier(currentTier: string, feature: string): string | null {
  const tierOrder = ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'];
  const tiers = tierOrder.slice(tierOrder.indexOf(currentTier) + 1);
  
  for (const tier of tiers) {
    if (tierService.isFeatureEnabled(tier as any, feature)) {
      return tier;
    }
  }
  
  return null;
}

// Usage
app.use(tierFeatureGateMiddleware);
```

---

## Part 4: Frontend Implementation

### 4.1 Tier Access Hook

```typescript
// frontend/src/hooks/useTierAccess.ts

import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

const TIER_FEATURES = {
  FREE: {
    canAccess: {
      payroll: false,
      attendance: false,
      recruitment: false,
      api_keys: false,
      sso: false,
      custom_domain: false,
      white_label: false
    },
    navigation: ['employees', 'org', 'staff-accounts', 'dashboard', 'settings']
  },
  
  STARTER: {
    canAccess: {
      payroll: true,
      attendance: true,
      recruitment: false,
      api_keys: false,
      sso: false,
      custom_domain: false,
      white_label: false
    },
    navigation: [
      'employees', 'org', 'payroll', 'attendance', 'leave', 'shifts',
      'dashboard', 'settings', 'reports'
    ]
  },
  
  PROFESSIONAL: {
    canAccess: {
      payroll: true,
      attendance: true,
      recruitment: true,
      api_keys: false,
      sso: false,
      custom_domain: true,
      white_label: false
    },
    navigation: [
      'employees', 'org', 'payroll', 'attendance', 'leave', 'shifts',
      'recruitment', 'onboarding', 'performance', 'training',
      'dashboard', 'settings', 'reports'
    ]
  },
  
  BUSINESS: {
    canAccess: {
      payroll: true,
      attendance: true,
      recruitment: true,
      api_keys: true,
      sso: false,
      custom_domain: true,
      white_label: false
    },
    navigation: [
      'employees', 'org', 'payroll', 'attendance', 'leave', 'shifts',
      'recruitment', 'onboarding', 'performance', 'training', 'assets',
      'integrations', 'dashboard', 'settings', 'reports'
    ]
  },
  
  ENTERPRISE: {
    canAccess: {
      payroll: true,
      attendance: true,
      recruitment: true,
      api_keys: true,
      sso: true,
      custom_domain: true,
      white_label: true
    },
    navigation: [
      'all' // all routes available
    ]
  }
};

export function useTierAccess() {
  const { subscription } = useAuth();
  
  return useMemo(() => {
    const tier = subscription?.tier || 'FREE';
    const tierConfig = TIER_FEATURES[tier] || TIER_FEATURES['FREE'];
    
    return {
      tier,
      hasAccess: (feature: string) => tierConfig.canAccess[feature] === true,
      canNavigateTo: (route: string) => {
        if (tierConfig.navigation.includes('all')) return true;
        return tierConfig.navigation.includes(route);
      },
      getNavigation: () => tierConfig.navigation,
      getConfig: () => tierConfig
    };
  }, [subscription?.tier]);
}
```

### 4.2 Protected Feature Component

```typescript
// frontend/src/components/ProtectedFeature.tsx

import { useTierAccess } from '@/hooks/useTierAccess';
import { UpgradePrompt } from './UpgradePrompt';

interface ProtectedFeatureProps {
  feature: string;
  children: React.ReactNode;
  upgradePromptVariant?: 'modal' | 'inline' | 'overlay';
}

export function ProtectedFeature({
  feature,
  children,
  upgradePromptVariant = 'inline'
}: ProtectedFeatureProps) {
  const { hasAccess, tier } = useTierAccess();
  
  if (!hasAccess(feature)) {
    if (upgradePromptVariant === 'modal') {
      return <UpgradePrompt feature={feature} tier={tier} variant="modal" />;
    } else if (upgradePromptVariant === 'overlay') {
      return (
        <div className="relative">
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <UpgradePrompt feature={feature} tier={tier} variant="inline" />
          </div>
        </div>
      );
    } else {
      return <UpgradePrompt feature={feature} tier={tier} variant="inline" />;
    }
  }
  
  return <>{children}</>;
}

// Usage
<ProtectedFeature feature="payroll" upgradePromptVariant="inline">
  <PayrollSection />
</ProtectedFeature>
```

### 4.3 Trial Countdown Component

```typescript
// frontend/src/components/TrialCountdown.tsx

import { useEffect, useState } from 'react';
import { differenceInDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export function TrialCountdown() {
  const { subscription } = useAuth();
  const [daysRemaining, setDaysRemaining] = useState(0);
  
  useEffect(() => {
    if (!subscription?.trialEndsAt) return;
    
    const days = differenceInDays(new Date(subscription.trialEndsAt), new Date());
    setDaysRemaining(Math.max(0, days));
  }, [subscription?.trialEndsAt]);
  
  if (daysRemaining <= 0 || !subscription?.trialEndsAt) return null;
  
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
      <p className="text-sm text-blue-700">
        <strong>Trial ending soon:</strong> {daysRemaining} days remaining
      </p>
      <p className="text-xs text-blue-600 mt-1">
        On {new Date(subscription.trialEndsAt).toLocaleDateString()},
        we'll charge Rp {subscription.monthlyCharge?.toLocaleString('id-ID')} per month.
      </p>
      <button className="text-sm text-blue-600 hover:underline mt-2">
        Update payment method →
      </button>
    </div>
  );
}
```

---

## Part 5: Testing Strategy

### 5.1 Unit Tests

```typescript
// backend/src/services/__tests__/tierService.test.ts

import { tierService } from '@/services/tierService';

describe('TierService', () => {
  describe('getTierConfig', () => {
    it('should return correct config for STARTER tier', () => {
      const config = tierService.getTierConfig('STARTER');
      
      expect(config.maxEmployees).toBe(50);
      expect(config.pricePerEmployee).toBe(20000);
      expect(config.trialMonths).toBe(2);
      expect(config.apiCallsPerDay).toBe(10000);
    });
    
    it('should return correct config for PROFESSIONAL tier', () => {
      const config = tierService.getTierConfig('PROFESSIONAL');
      
      expect(config.maxEmployees).toBe(300);
      expect(config.pricePerEmployee).toBe(25000);
    });
    
    it('should return unlimited for BUSINESS tier', () => {
      const config = tierService.getTierConfig('BUSINESS');
      
      expect(config.maxEmployees).toBe('unlimited');
    });
  });
  
  describe('isFeatureEnabled', () => {
    it('should return false for disabled features', () => {
      const isEnabled = tierService.isFeatureEnabled('FREE', 'payroll');
      expect(isEnabled).toBe(false);
    });
    
    it('should return true for enabled features', () => {
      const isEnabled = tierService.isFeatureEnabled('STARTER', 'payroll');
      expect(isEnabled).toBe(true);
    });
    
    it('should return true for all features in ENTERPRISE', () => {
      const payroll = tierService.isFeatureEnabled('ENTERPRISE', 'payroll');
      const sso = tierService.isFeatureEnabled('ENTERPRISE', 'sso');
      
      expect(payroll).toBe(true);
      expect(sso).toBe(true);
    });
  });
  
  describe('getTrialEndDate', () => {
    it('should return 4 months for FREE tier', () => {
      const startDate = new Date('2026-07-22');
      const endDate = tierService.getTrialEndDate(startDate, 'FREE');
      
      expect(endDate?.getMonth()).toBe(10); // November
      expect(endDate?.getFullYear()).toBe(2026);
    });
    
    it('should return 2 months for STARTER tier', () => {
      const startDate = new Date('2026-07-22');
      const endDate = tierService.getTrialEndDate(startDate, 'STARTER');
      
      expect(endDate?.getMonth()).toBe(8); // September
      expect(endDate?.getFullYear()).toBe(2026);
    });
  });
});
```

### 5.2 Integration Tests

```typescript
// backend/src/__tests__/tier-enforcement.test.ts

import { db } from '@/lib/db';
import { billingService } from '@/services/billingService';
import request from 'supertest';
import { app } from '@/app';

describe('Tier Enforcement Integration', () => {
  let companyId: string;
  let authToken: string;
  
  beforeAll(async () => {
    // Setup: create company with STARTER subscription
    const company = await db.company.create({
      data: { name: 'Test Company' }
    });
    companyId = company.id;
    
    await db.subscription.create({
      data: {
        companyId,
        tier: 'STARTER',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
    
    // Get auth token
    authToken = '...'; // mock auth
  });
  
  describe('Employee Count Limit', () => {
    it('should allow creating employees up to limit', async () => {
      for (let i = 0; i < 50; i++) {
        const res = await request(app)
          .post('/api/v1/employees')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Employee ${i}`,
            email: `emp${i}@test.com`
          });
        
        expect([200, 201]).toContain(res.status);
      }
    });
    
    it('should block creating employee beyond limit', async () => {
      const res = await request(app)
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Employee 51',
          email: 'emp51@test.com'
        });
      
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('employee_limit_reached');
    });
  });
  
  describe('Feature Gating', () => {
    it('should allow payroll access for STARTER', async () => {
      const res = await request(app)
        .get('/api/v1/payroll')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect([200, 400]).toContain(res.status); // 200 or 400 (no data), not 403
    });
    
    it('should block recruitment access for STARTER', async () => {
      const res = await request(app)
        .post('/api/v1/recruitment/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Engineer',
          description: 'Test'
        });
      
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('feature_not_available');
    });
  });
  
  describe('Billing', () => {
    it('should calculate monthly charge correctly', async () => {
      const result = await billingService.calculateMonthlyCharge(companyId);
      
      expect(result.employeeCount).toBe(50);
      expect(result.pricePerEmployee).toBe(20000);
      expect(result.amount).toBe(1000000); // 50 * 20K
    });
  });
});
```

---

## Part 6: Migration Plan

### 6.1 Backward Compatibility

```typescript
// backend/src/scripts/migrate-existing-subscriptions.ts

import { db } from '@/lib/db';
import { tierService } from '@/services/tierService';

async function migrateExistingSubscriptions() {
  console.log('Starting subscription migration...');
  
  const subscriptions = await db.subscription.findMany();
  
  for (const sub of subscriptions) {
    // Calculate trial end date based on tier
    const tierConfig = tierService.getTierConfig(sub.tier);
    const trialEndsAt = tierService.getTrialEndDate(sub.createdAt, sub.tier);
    
    // Determine status
    let status = 'active';
    if (trialEndsAt && new Date() <= trialEndsAt) {
      status = 'trial';
    }
    
    // Update subscription
    await db.subscription.update({
      where: { id: sub.id },
      data: {
        trialEndsAt,
        status,
        billingPeriodStart: new Date(sub.createdAt.getFullYear(), sub.createdAt.getMonth(), 1),
        billingPeriodEnd: new Date(sub.createdAt.getFullYear(), sub.createdAt.getMonth() + 1, 0)
      }
    });
    
    console.log(`Migrated subscription ${sub.id} to tier ${sub.tier}, status ${status}`);
  }
  
  console.log('Migration complete!');
}

// Run migration
migrateExistingSubscriptions().catch(console.error);
```

---

## Part 7: Deployment Checklist

```
PRE-DEPLOYMENT:
  [ ] Database migrations tested on staging
  [ ] All environment variables set in prod .env
  [ ] Backup created before migration
  [ ] Rollback plan documented

DEPLOYMENT:
  [ ] Deploy backend code
  [ ] Run database migrations
  [ ] Deploy frontend code
  [ ] Verify tier configs loaded correctly
  [ ] Test employee count enforcement
  [ ] Test feature gating (API + UI)
  [ ] Test billing calculations
  [ ] Monitor error logs (first hour)

POST-DEPLOYMENT:
  [ ] Email all customers about new tier structure
  [ ] Monitor customer support channels
  [ ] Verify all customers can still access expected features
  [ ] Check billing system processing charges correctly
  [ ] Confirm trial expiration jobs running

ROLLBACK (if needed):
  [ ] Revert database migrations
  [ ] Revert code deployment
  [ ] Restore from backup
  [ ] Notify customers
```

---

*Last Updated: 22 Juli 2026 | Owner: Dozer | Status: Implementation Ready*
