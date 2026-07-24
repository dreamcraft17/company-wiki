# dnPeople — SDD v12.1
## FREE Tier 50 Employee Enforcement - Technical Implementation

**Versi:** 12.1  
**Tanggal:** 22 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Code-ready (copy-paste)

---

# 1. DATABASE SCHEMA UPDATES

## 1.1 Migration Script

```sql
-- File: migrations/2026-08-01_free-tier-50-emp-enforcement.sql
-- Purpose: Add database constraints for 50 emp limit

-- Update Subscription table
ALTER TABLE Subscription ADD COLUMN IF NOT EXISTS (
  employeeCountCache INT DEFAULT 0 COMMENT 'Cached employee count for performance'
);

-- Create index for fast employee count checks
CREATE INDEX IF NOT EXISTS idx_employees_company_not_deleted
ON employees(companyId, deletedAt)
WHERE deletedAt IS NULL;

-- Add constraint to Subscription table
ALTER TABLE Subscription ADD CONSTRAINT chk_free_tier_max_employees
CHECK (
  CASE 
    WHEN tier = 'FREE' THEN 1 -- Will validate in application
    ELSE 1
  END = 1
);

-- Create EmployeeCountAudit table (for debugging)
CREATE TABLE IF NOT EXISTS EmployeeCountAudit (
  id STRING PRIMARY KEY DEFAULT gen_random_uuid(),
  companyId STRING NOT NULL,
  tier STRING NOT NULL,
  employeeCount INT NOT NULL,
  action STRING, -- 'create', 'delete', 'import', 'soft_delete'
  reason STRING,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY(companyId) REFERENCES Company(id) ON DELETE CASCADE,
  INDEX(companyId, createdAt)
);

-- Create APIUsage table for rate limiting
CREATE TABLE IF NOT EXISTS APIUsage (
  id STRING PRIMARY KEY DEFAULT gen_random_uuid(),
  companyId STRING NOT NULL,
  date DATE NOT NULL,
  callsToday INT DEFAULT 0,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(companyId, date),
  FOREIGN KEY(companyId) REFERENCES Company(id) ON DELETE CASCADE,
  INDEX(companyId, date)
);

-- Seeding: Recalculate trial dates for existing FREE users
UPDATE Subscription
SET trialEndsAt = DATE_ADD(createdAt, INTERVAL 120 DAY)
WHERE tier = 'FREE' AND trialEndsAt IS NULL;

-- Seeding: Populate employeeCountCache
UPDATE Subscription sub
SET employeeCountCache = (
  SELECT COUNT(*) FROM employees e
  WHERE e.companyId = sub.companyId AND e.deletedAt IS NULL
);
```

## 1.2 Prisma Schema Update

```prisma
// prisma/schema.prisma

model Subscription {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String              @unique
  
  tier                  String              @default("FREE") // 'FREE', 'STARTER', etc
  
  // Trial tracking
  startedAt             DateTime            @default(now())
  trialEndsAt           DateTime?
  
  // Billing
  billingPeriodStart    DateTime?
  billingPeriodEnd      DateTime?
  status                String              @default("active") // 'trial', 'active', 'grace_period', 'suspended', 'canceled'
  
  // Payment
  paymentMethodId       String?
  lastChargedAt         DateTime?
  nextChargeDate        DateTime?
  
  // Usage
  employeeCountCache    Int                 @default(0) @comment("Cached for performance, refreshed daily")
  
  // Relations
  apiUsage              APIUsage[]
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@index([tier])
  @@index([status])
  @@index([companyId])
}

model APIUsage {
  id                    String              @id @default(cuid())
  subscription          Subscription        @relation(fields: [companyId], references: [companyId], onDelete: Cascade)
  companyId             String
  date                  DateTime            @db.Date
  callsToday            Int                 @default(0)
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@unique([companyId, date])
  @@index([companyId])
  @@index([date])
}

model EmployeeCountAudit {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String
  tier                  String
  employeeCount         Int
  action                String? // 'create', 'delete', 'import', 'soft_delete'
  reason                String?
  
  createdAt             DateTime            @default(now())
  
  @@index([companyId])
  @@index([companyId, createdAt])
}
```

---

# 2. ENVIRONMENT VARIABLES

```bash
# .env (v12.1 - LOCKED)

# FREE TIER (50 employees)
TIER_FREE_MAX_EMPLOYEES=50
TIER_FREE_TRIAL_MONTHS=4
TIER_FREE_API_CALLS_PER_DAY=1000
TIER_FREE_STORAGE_GB=5
TIER_FREE_PRICE=0

# STARTER TIER (50 employees, Rp 20K)
TIER_STARTER_MAX_EMPLOYEES=50
TIER_STARTER_TRIAL_MONTHS=2
TIER_STARTER_API_CALLS_PER_DAY=10000
TIER_STARTER_STORAGE_GB=50
TIER_STARTER_PRICE=20000

# PROFESSIONAL TIER
TIER_PROFESSIONAL_MAX_EMPLOYEES=300
TIER_PROFESSIONAL_TRIAL_MONTHS=2
TIER_PROFESSIONAL_API_CALLS_PER_DAY=50000
TIER_PROFESSIONAL_STORAGE_GB=500
TIER_PROFESSIONAL_PRICE=25000

# BUSINESS TIER
TIER_BUSINESS_MAX_EMPLOYEES=999999
TIER_BUSINESS_TRIAL_MONTHS=2
TIER_BUSINESS_API_CALLS_PER_DAY=999999
TIER_BUSINESS_STORAGE_GB=999999
TIER_BUSINESS_PRICE=20000

# Rate limiting
RATE_LIMIT_RESET_HOUR=0
RATE_LIMIT_RESET_MINUTE=0
RATE_LIMIT_TIMEZONE=Asia/Jakarta

# Soft limits
FREE_TIER_CAPACITY_WARNING_PERCENT=80
```

---

# 3. BACKEND IMPLEMENTATION

## 3.1 Tier Configuration Service

```typescript
// backend/src/services/tierService.ts

export const TIER_CONFIG = {
  FREE: {
    maxEmployees: parseInt(process.env.TIER_FREE_MAX_EMPLOYEES || '50'),
    trialMonths: parseInt(process.env.TIER_FREE_TRIAL_MONTHS || '4'),
    apiCallsPerDay: parseInt(process.env.TIER_FREE_API_CALLS_PER_DAY || '1000'),
    price: parseInt(process.env.TIER_FREE_PRICE || '0'),
    features: {
      payroll: false,
      attendance: false,
      leave: false,
      recruitment: false,
      performance: false,
      training: false,
      apiKeys: false,
      sso: false,
    }
  },
  STARTER: {
    maxEmployees: parseInt(process.env.TIER_STARTER_MAX_EMPLOYEES || '50'),
    trialMonths: parseInt(process.env.TIER_STARTER_TRIAL_MONTHS || '2'),
    apiCallsPerDay: parseInt(process.env.TIER_STARTER_API_CALLS_PER_DAY || '10000'),
    price: parseInt(process.env.TIER_STARTER_PRICE || '20000'),
    features: {
      payroll: true,
      attendance: true,
      leave: true,
      recruitment: false,
      performance: false,
      training: false,
      apiKeys: false,
      sso: false,
    }
  },
  // ... other tiers
};

export class TierService {
  static getConfig(tier: string) {
    return TIER_CONFIG[tier] || TIER_CONFIG.FREE;
  }

  static getMaxEmployees(tier: string): number {
    return this.getConfig(tier).maxEmployees;
  }

  static isFeatureEnabled(tier: string, feature: string): boolean {
    return this.getConfig(tier).features[feature] === true;
  }

  static getTrialEndDate(startDate: Date, tier: string): Date {
    const months = this.getConfig(tier).trialMonths;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);
    return endDate;
  }
}
```

## 3.2 Employee Count Enforcement Middleware

```typescript
// backend/src/middleware/employeeCountGate.ts

import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/lib/prisma';
import { TierService } from '@/services/tierService';

export async function employeeCountGateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const companyId = req.company?.id;
  if (!companyId || req.method !== 'POST') return next();

  // Only check on employee create/import routes
  if (!req.path.includes('/employees')) return next();

  const subscription = await prisma.subscription.findUnique({
    where: { companyId }
  });

  if (!subscription) return next();

  const maxEmployees = TierService.getMaxEmployees(subscription.tier);
  
  // Count active employees
  const employeeCount = await prisma.employee.count({
    where: { companyId, deletedAt: null }
  });

  // Check soft limit (warning)
  const warningThreshold = Math.floor(maxEmployees * 0.8);
  if (employeeCount >= warningThreshold && employeeCount < maxEmployees) {
    // Send warning email (fire-and-forget)
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (company) {
      sendCapacityWarningEmail(company.adminEmail, employeeCount, maxEmployees, subscription.tier);
    }
  }

  // Check hard limit
  if (employeeCount >= maxEmployees) {
    return res.status(403).json({
      error: 'employee_limit_reached',
      message: `Your ${subscription.tier} plan supports up to ${maxEmployees} employees`,
      current: employeeCount,
      limit: maxEmployees,
      tier: subscription.tier,
      upgrade: subscription.tier === 'FREE' ? 'STARTER' : subscription.tier === 'STARTER' ? 'PROFESSIONAL' : null
    });
  }

  next();
}

// Usage in Express app
app.post('/api/v1/employees', employeeCountGateMiddleware, createEmployeeHandler);
app.post('/api/v1/employees/import', employeeCountGateMiddleware, importEmployeesHandler);
```

## 3.3 API Rate Limiting Middleware

```typescript
// backend/src/middleware/rateLimitGate.ts

import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/lib/prisma';
import { TierService } from '@/services/tierService';

export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const companyId = req.company?.id;
  if (!companyId) return next();

  // Skip UI requests (only rate limit API)
  if (!req.path.startsWith('/api/')) return next();

  const subscription = await prisma.subscription.findUnique({
    where: { companyId }
  });

  if (!subscription) return next();

  const dailyLimit = TierService.getConfig(subscription.tier).apiCallsPerDay;
  if (dailyLimit === 999999) return next(); // Unlimited tiers

  // Get today's usage
  const today = new Date().toISOString().split('T')[0];
  let usage = await prisma.aPIUsage.findUnique({
    where: { companyId_date: { companyId, date: new Date(today) } }
  });

  if (!usage) {
    usage = await prisma.aPIUsage.create({
      data: { companyId, date: new Date(today), callsToday: 0 }
    });
  }

  // Check limit
  if (usage.callsToday >= dailyLimit) {
    // Calculate reset time (midnight UTC+7)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const resetTime = Math.floor(tomorrow.getTime() / 1000); // Unix timestamp

    return res.status(429).json({
      error: 'rate_limit_exceeded',
      message: `Daily API limit exceeded: ${dailyLimit} calls`,
      limit: dailyLimit,
      used: usage.callsToday,
      remaining: 0,
      resetAt: resetTime
    }).set({
      'X-RateLimit-Limit': String(dailyLimit),
      'X-RateLimit-Used': String(usage.callsToday),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(resetTime)
    });
  }

  // Increment counter
  await prisma.aPIUsage.update({
    where: { id: usage.id },
    data: { callsToday: usage.callsToday + 1 }
  });

  // Set response headers
  res.set({
    'X-RateLimit-Limit': String(dailyLimit),
    'X-RateLimit-Used': String(usage.callsToday + 1),
    'X-RateLimit-Remaining': String(Math.max(0, dailyLimit - (usage.callsToday + 1))),
    'X-RateLimit-Reset': String(resetTime)
  });

  next();
}

app.use(rateLimitMiddleware);
```

## 3.4 Feature Gating Middleware

```typescript
// backend/src/middleware/tierFeatureGate.ts

import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/lib/prisma';
import { TierService } from '@/services/tierService';

const FEATURE_ROUTES = {
  payroll: ['/payroll'],
  attendance: ['/attendance', '/corrections'],
  leave: ['/leave'],
  recruitment: ['/recruitment', '/careers'],
  performance: ['/performance'],
  training: ['/training', '/lms'],
  apiKeys: ['/integrations'],
  sso: ['/integrations/sso']
};

export async function tierFeatureGateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const companyId = req.company?.id;
  if (!companyId) return next();

  const subscription = await prisma.subscription.findUnique({
    where: { companyId }
  });

  if (!subscription) return next();

  // Check if this route requires a feature
  for (const [feature, routes] of Object.entries(FEATURE_ROUTES)) {
    if (routes.some(route => req.path.includes(route))) {
      const isEnabled = TierService.isFeatureEnabled(subscription.tier, feature);

      if (!isEnabled) {
        // Find recommended tier
        const tiers = ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'];
        const currentIndex = tiers.indexOf(subscription.tier);
        let recommendedTier = null;

        for (let i = currentIndex + 1; i < tiers.length; i++) {
          if (TierService.isFeatureEnabled(tiers[i], feature)) {
            recommendedTier = tiers[i];
            break;
          }
        }

        return res.status(403).json({
          error: 'feature_not_available',
          message: `Feature '${feature}' is not available in your ${subscription.tier} plan`,
          feature,
          currentTier: subscription.tier,
          recommendedTier: recommendedTier || 'PROFESSIONAL'
        });
      }
      break;
    }
  }

  next();
}

app.use(tierFeatureGateMiddleware);
```

---

# 4. FRONTEND IMPLEMENTATION

## 4.1 Tier Access Hook

```typescript
// frontend/src/hooks/useTierAccess.ts

import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

const TIER_FEATURES = {
  FREE: {
    maxEmployees: 50,
    canAccess: {
      payroll: false,
      attendance: false,
      leave: false,
      recruitment: false,
      performance: false,
      training: false,
      apiKeys: false,
      sso: false
    }
  },
  STARTER: {
    maxEmployees: 50,
    canAccess: {
      payroll: true,
      attendance: true,
      leave: true,
      recruitment: false,
      performance: false,
      training: false,
      apiKeys: false,
      sso: false
    }
  },
  PROFESSIONAL: {
    maxEmployees: 300,
    canAccess: {
      payroll: true,
      attendance: true,
      leave: true,
      recruitment: true,
      performance: true,
      training: true,
      apiKeys: false,
      sso: false
    }
  },
  // ... other tiers
};

export function useTierAccess() {
  const { subscription, company } = useAuth();

  return useMemo(() => {
    const tier = subscription?.tier || 'FREE';
    const config = TIER_FEATURES[tier];

    return {
      tier,
      maxEmployees: config?.maxEmployees || 50,
      currentEmployees: company?.employeeCount || 0,
      hasAccess: (feature: string) => config?.canAccess[feature] === true,
      isAtCapacity: () => company?.employeeCount >= config?.maxEmployees,
      getUpgradeTier: () => {
        const tiers = ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'];
        return tiers[tiers.indexOf(tier) + 1] || null;
      }
    };
  }, [subscription?.tier, company?.employeeCount]);
}
```

## 4.2 Protected Route Wrapper

```typescript
// frontend/src/components/ProtectedRoute.tsx

import { useTierAccess } from '@/hooks/useTierAccess';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  feature: string;
  children: React.ReactNode;
}

export function ProtectedRoute({ feature, children }: ProtectedRouteProps) {
  const { hasAccess, tier } = useTierAccess();

  if (!hasAccess(feature)) {
    return (
      <Navigate
        to={`/upgrade?feature=${feature}&from=${tier}`}
        replace
      />
    );
  }

  return <>{children}</>;
}

// Usage
<ProtectedRoute feature="payroll">
  <PayrollPage />
</ProtectedRoute>
```

## 4.3 Capacity Warning Banner

```typescript
// frontend/src/components/CapacityWarning.tsx

import { useTierAccess } from '@/hooks/useTierAccess';

export function CapacityWarning() {
  const { currentEmployees, maxEmployees, tier } = useTierAccess();

  const percentage = (currentEmployees / maxEmployees) * 100;
  const isWarning = percentage >= 80;
  const isAtCapacity = percentage >= 100;

  if (!isWarning) return null;

  if (isAtCapacity) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-sm font-bold text-red-900">
          Employee capacity reached ({currentEmployees}/{maxEmployees})
        </p>
        <p className="text-xs text-red-700 mt-1">
          You've reached the limit for {tier} plan. Upgrade to continue adding employees.
        </p>
        <button className="text-sm text-red-600 hover:underline mt-2">
          Upgrade Now →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
      <p className="text-sm text-yellow-900">
        You have {currentEmployees}/{maxEmployees} employees ({Math.round(percentage)}%)
      </p>
      <p className="text-xs text-yellow-700 mt-1">
        Ready to scale? Upgrade to {tier === 'FREE' ? 'STARTER' : 'PROFESSIONAL'}.
      </p>
    </div>
  );
}
```

---

# 5. MIGRATION & DEPLOYMENT

## 5.1 Database Migration Command

```bash
# Run migration
npx prisma migrate deploy --name free-tier-50-emp

# Or manual SQL
mysql -u root -p < migrations/2026-08-01_free-tier-50-emp-enforcement.sql

# Verify
SELECT tier, COUNT(*) FROM Subscription GROUP BY tier;
```

## 5.2 Rollback Script (if needed)

```bash
# Rollback to previous version
npx prisma migrate resolve --rolled-back <migration-name>

# Or restore from backup
mysqldump --single-transaction < backup_2026-07-31.sql
```

## 5.3 Deployment Checklist

```bash
# 1. Pre-deployment
[ ] Database backup created
[ ] Migration tested on staging
[ ] Backend compiled + tested
[ ] Frontend built + tested

# 2. Deployment
[ ] Deploy backend code
[ ] Run database migrations
[ ] Deploy frontend code
[ ] Verify employee limit enforced
[ ] Verify feature gating working

# 3. Post-deployment (monitoring)
[ ] Check error logs (Sentry)
[ ] Monitor rate limit hits (logs)
[ ] Monitor upgrade flow (analytics)
[ ] Check customer support tickets
```

---

# 6. TESTING CODE

## 6.1 Unit Tests

```typescript
// backend/src/__tests__/employeeCountGate.test.ts

import { TierService } from '@/services/tierService';

describe('TierService', () => {
  it('should return 50 for FREE tier max employees', () => {
    const max = TierService.getMaxEmployees('FREE');
    expect(max).toBe(50);
  });

  it('should disable payroll for FREE tier', () => {
    const enabled = TierService.isFeatureEnabled('FREE', 'payroll');
    expect(enabled).toBe(false);
  });

  it('should enable payroll for STARTER tier', () => {
    const enabled = TierService.isFeatureEnabled('STARTER', 'payroll');
    expect(enabled).toBe(true);
  });

  it('should calculate trial end date correctly', () => {
    const start = new Date('2026-07-22');
    const end = TierService.getTrialEndDate(start, 'FREE');
    
    expect(end.getMonth()).toBe(10); // November
    expect(end.getDate()).toBe(20);
    expect(end.getFullYear()).toBe(2026);
  });
});
```

## 6.2 Integration Tests

```typescript
// backend/src/__tests__/employee-limit.integration.test.ts

import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

describe('Employee Count Enforcement', () => {
  let companyId: string;
  let token: string;

  beforeAll(async () => {
    // Create company with FREE tier
    const company = await prisma.company.create({
      data: { name: 'Test Company' }
    });
    companyId = company.id;

    // Create subscription
    await prisma.subscription.create({
      data: {
        companyId,
        tier: 'FREE',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    token = 'test-jwt-token'; // Mock auth
  });

  it('should allow creating up to 50 employees', async () => {
    for (let i = 0; i < 50; i++) {
      const res = await request(app)
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Employee ${i}`,
          email: `emp${i}@test.com`
        });

      expect([200, 201]).toContain(res.status);
    }
  });

  it('should block creating 51st employee', async () => {
    const res = await request(app)
      .post('/api/v1/employees')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Employee 51',
        email: 'emp51@test.com'
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('employee_limit_reached');
  });

  it('should show rate limit headers', async () => {
    const res = await request(app)
      .get('/api/v1/employees')
      .set('Authorization', `Bearer ${token}`);

    expect(res.headers['x-ratelimit-limit']).toBe('1000');
    expect(res.headers['x-ratelimit-remaining']).toBeDefined();
  });
});
```

---

# 7. MONITORING & ALERTS

## 7.1 Monitoring Queries

```sql
-- Monitor FREE tier users approaching limit
SELECT 
  c.id, c.name,
  (SELECT COUNT(*) FROM employees e WHERE e.companyId = c.id AND e.deletedAt IS NULL) as emp_count,
  CONCAT(
    ROUND((SELECT COUNT(*) FROM employees e WHERE e.companyId = c.id AND e.deletedAt IS NULL) / 50 * 100), 
    '%'
  ) as capacity
FROM Company c
JOIN Subscription s ON c.id = s.companyId
WHERE s.tier = 'FREE'
AND (SELECT COUNT(*) FROM employees e WHERE e.companyId = c.id AND e.deletedAt IS NULL) >= 40
ORDER BY emp_count DESC;

-- Monitor conversion rate (FREE → STARTER)
SELECT
  DATE(s.createdAt) as signup_date,
  COUNT(*) as free_signups,
  SUM(CASE WHEN s.tier = 'STARTER' THEN 1 ELSE 0 END) as converted,
  ROUND(SUM(CASE WHEN s.tier = 'STARTER' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as conversion_rate
FROM Subscription s
WHERE s.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(s.createdAt);

-- Monitor API rate limit hits (errors)
SELECT
  companyId,
  COUNT(*) as rate_limit_hits,
  DATE(createdAt) as date
FROM (
  SELECT * FROM Logs WHERE message LIKE '%429%' OR error LIKE '%rate_limit%'
) logs
WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY companyId, DATE(createdAt)
ORDER BY rate_limit_hits DESC;
```

## 7.2 Alert Rules

```yaml
# Monitoring config
alerts:
  - name: "HIGH_EMPLOYEE_LIMIT_HITS"
    query: "SELECT COUNT(*) FROM EmployeeCountAudit WHERE action='blocked' OVER LAST 1 HOUR"
    threshold: 10
    action: "Notify Slack #support"
    
  - name: "LOW_CONVERSION_RATE"
    query: "Conversion rate < 20% over last 7 days"
    action: "Notify Dozer (check copy/flow)"
    
  - name: "HIGH_RATE_LIMIT_ERRORS"
    query: "429 errors > 50/day"
    action: "Review rate limit config"
```

---

# 8. QUICK REFERENCE

## Environment Variables
```
TIER_FREE_MAX_EMPLOYEES=50
TIER_FREE_TRIAL_MONTHS=4
TIER_FREE_API_CALLS_PER_DAY=1000
```

## API Responses
```
403: Employee limit reached
429: API rate limit exceeded
```

## Database Tables
```
Subscription (tier, trialEndsAt, employeeCountCache)
APIUsage (companyId, date, callsToday)
EmployeeCountAudit (companyId, action, employeeCount)
```

## Middleware Order
```
1. rateLimitMiddleware
2. tierFeatureGateMiddleware
3. employeeCountGateMiddleware
4. routeHandler
```

---

*Last Updated: 22 Juli 2026 | Version: 12.1 (FINAL) | Status: Code Ready*
