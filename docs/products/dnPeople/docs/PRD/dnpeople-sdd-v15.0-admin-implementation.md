# dnPeople — SDD v15.0
## Admin Dashboard & Control Panel: Technical Implementation

**Versi:** 15.0  
**Tanggal:** 24 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** **Implemented in repo** (26 Jul 2026) — patterns follow existing Express/Prisma/Next code (not a verbatim paste of draft snippets)

---

# 1. DATABASE SCHEMA

## 1.1 Prisma Models (Copy-Paste)

```prisma
// prisma/schema.prisma

model CompanyAuditLog {
  id                String            @id @default(cuid())
  company           Company?          @relation(fields: [companyId], references: [id])
  companyId         String?           // null = system-wide action
  
  admin             User              @relation(fields: [adminId], references: [id])
  adminId           String
  
  action            String            // "impersonate", "extend_trial", "toggle_feature", etc
  description       String?           // Human-readable description
  
  // Before/after state (for audits)
  beforeState       JSON?             // Previous value
  afterState        JSON?             // New value
  
  // Metadata
  ipAddress         String?
  userAgent         String?
  
  createdAt         DateTime          @default(now())
  
  @@index([companyId])
  @@index([adminId])
  @@index([action])
  @@index([createdAt])
  @@map("company_audit_logs")
}

model FeatureFlag {
  id                String            @id @default(cuid())
  
  name              String            @unique // "talent_matrix", "attendance_geofence"
  description       String?
  
  // Status & rollout
  isEnabled         Boolean           @default(false)
  rolloutPercent    Int               @default(0) // 0-100
  
  // Tier gating
  minTierRequired   String            @default("FREE")
  
  // Metadata
  notes             String?
  lastUpdatedBy     String            // Admin ID
  lastUpdatedAt     DateTime          @updatedAt
  
  // History
  history           FeatureFlagHistory[]
  
  createdAt         DateTime          @default(now())
  
  @@index([name])
  @@map("feature_flags")
}

model FeatureFlagHistory {
  id                String            @id @default(cuid())
  flag              FeatureFlag       @relation(fields: [flagId], references: [id], onDelete: Cascade)
  flagId            String
  
  admin             User              @relation(fields: [adminId], references: [id])
  adminId           String
  
  // State change
  previousValue     JSON              // {isEnabled, rolloutPercent}
  newValue          JSON
  reason            String?           // "Testing", "Rolled out", "Bug found"
  
  createdAt         DateTime          @default(now())
  
  @@index([flagId])
  @@index([adminId])
  @@index([createdAt])
  @@map("feature_flag_history")
}

model AdminNotification {
  id                String            @id @default(cuid())
  admin             User              @relation(fields: [adminId], references: [id], onDelete: Cascade)
  adminId           String
  
  type              String            // "api_latency_high", "error_rate_high", "trial_expiring"
  message           String
  severity          String            // "info", "warning", "critical"
  actionUrl         String?           // e.g., /admin/health, /admin/customers/123
  
  isRead            Boolean           @default(false)
  readAt            DateTime?
  acknowledgedAt    DateTime?
  
  createdAt         DateTime          @default(now())
  
  @@index([adminId, isRead])
  @@index([severity])
  @@index([createdAt])
  @@map("admin_notifications")
}

model SupportTicket {
  id                String            @id @default(cuid())
  company           Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId         String
  
  subject           String
  status            String            @default("open") // "open", "waiting", "resolved", "closed"
  priority          String            @default("medium") // "low", "medium", "high", "urgent"
  category          String?           // "bug", "feature_request", "billing", "other"
  
  messages          TicketMessage[]
  assignedTo        User?             @relation(fields: [assignedToId], references: [id])
  assignedToId      String?
  
  resolution        String?           @db.Text // Summary when closed
  satisfactionRating Int?             // 1-5, from customer survey
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  resolvedAt        DateTime?
  
  @@index([companyId])
  @@index([status])
  @@index([priority])
  @@index([createdAt])
  @@map("support_tickets")
}

model TicketMessage {
  id                String            @id @default(cuid())
  ticket            SupportTicket     @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  ticketId          String
  
  sender            String            // "customer" or admin email
  senderEmail       String
  message           String            @db.Text
  
  attachments       String[]          @default([]) // URLs
  isInternal        Boolean           @default(false) // Only admin sees
  
  createdAt         DateTime          @default(now())
  
  @@index([ticketId])
  @@index([createdAt])
  @@map("ticket_messages")
}

// Extend existing User model
model User {
  // ... existing fields ...
  
  isAdmin           Boolean           @default(false) // ROLE_SUPERADMIN
  adminNotifications AdminNotification[]
  auditLogs         CompanyAuditLog[]
  featureFlagChanges FeatureFlagHistory[]
  assignedTickets   SupportTicket[]    @relation("assignedTickets")
}

// Extend existing Company model
model Company {
  // ... existing fields ...
  
  auditLogs         CompanyAuditLog[]
  supportTickets    SupportTicket[]
}
```

---

# 2. BACKEND IMPLEMENTATION

## 2.1 Services (Copy-Paste)

```typescript
// backend/src/services/adminService.ts

import { prisma } from '@/lib/prisma';
import { Request } from 'express';

export class AdminService {
  
  // Get all customers with filters
  static async getCustomers(
    page: number = 1,
    limit: number = 50,
    filters: { tier?: string; status?: string; search?: string } = {}
  ) {
    const skip = (page - 1) * limit;
    let where: any = {};

    if (filters.tier) {
      where.subscription = { tier: filters.tier };
    }

    if (filters.status) {
      // Status: active, trial, churn, inactive
      const now = new Date();
      if (filters.status === 'active') {
        where.subscription = {
          ...where.subscription,
          status: 'active',
          trialEndsAt: { gt: now }
        };
      } else if (filters.status === 'trial') {
        where.subscription = {
          ...where.subscription,
          status: 'active',
          trialEndsAt: { gt: now }
        };
      } else if (filters.status === 'churn') {
        // Inactive or cancelled
        where.subscription = { status: 'cancelled' };
      }
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
        { phone: { contains: filters.search } }
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: { subscription: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.company.count({ where })
    ]);

    return { companies, total, page, pages: Math.ceil(total / limit) };
  }

  // Get customer detail
  static async getCustomerDetail(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: true,
        supportTickets: { take: 5, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!company) throw new Error('Company not found');

    // Calculate usage
    const employees = await prisma.employee.count({
      where: { companyId }
    });

    const apiUsage = await prisma.apiUsage.aggregate({
      where: { companyId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      _sum: { calls: true }
    });

    return {
      company,
      employees,
      employeeLimit: company.subscription?.maxEmployees || 50,
      apiCallsThisMonth: apiUsage._sum.calls || 0,
      apiLimit: 10000 // Example
    };
  }

  // Impersonate customer (create admin session as customer)
  static async impersonate(adminId: string, companyId: string, ipAddress: string) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error('Company not found');

    // Log impersonation start
    await prisma.companyAuditLog.create({
      data: {
        companyId,
        adminId,
        action: 'impersonate_start',
        description: `Admin started impersonating this company`,
        ipAddress
      }
    });

    // Create special JWT for impersonation
    const impersonationToken = generateImpersonationToken(companyId, adminId);
    
    return { impersonationToken, company };
  }

  // End impersonation
  static async endImpersonation(adminId: string, companyId: string, ipAddress: string) {
    await prisma.companyAuditLog.create({
      data: {
        companyId,
        adminId,
        action: 'impersonate_end',
        ipAddress
      }
    });
  }

  // Add internal note to customer
  static async addInternalNote(companyId: string, adminId: string, note: string) {
    return prisma.companyAuditLog.create({
      data: {
        companyId,
        adminId,
        action: 'internal_note',
        description: note
      }
    });
  }

  // Extend trial
  static async extendTrial(companyId: string, adminId: string, days: number, ipAddress: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId }
    });

    if (!subscription) throw new Error('Subscription not found');

    const newTrialEnd = new Date(subscription.trialEndsAt);
    newTrialEnd.setDate(newTrialEnd.getDate() + days);

    const updated = await prisma.subscription.update({
      where: { companyId },
      data: { trialEndsAt: newTrialEnd }
    });

    // Log action
    await prisma.companyAuditLog.create({
      data: {
        companyId,
        adminId,
        action: 'extend_trial',
        description: `Extended trial by ${days} days`,
        beforeState: { trialEndsAt: subscription.trialEndsAt },
        afterState: { trialEndsAt: newTrialEnd },
        ipAddress
      }
    });

    return updated;
  }
}

export class AdminBillingService {
  
  static async getRevenueMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // MRR: Sum of all active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'active' },
      include: { company: true }
    });

    let mrr = 0;
    subscriptions.forEach((sub) => {
      // Calculate MRR based on tier + employees
      const basePrice = getTierPrice(sub.tier);
      const mrrForCompany = basePrice * (sub.employeeCountCache || 1);
      mrr += mrrForCompany;
    });

    const arr = mrr * 12;

    // New customers this month
    const newCustomers = await prisma.company.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });

    // Churn rate
    const churned = await prisma.subscription.count({
      where: {
        status: 'cancelled',
        updatedAt: { gte: thirtyDaysAgo }
      }
    });

    const activeCount = subscriptions.length;
    const churnRate = activeCount > 0 ? (churned / activeCount) * 100 : 0;

    // Tier breakdown
    const tierStats = {};
    subscriptions.forEach((sub) => {
      if (!tierStats[sub.tier]) {
        tierStats[sub.tier] = { count: 0, mrr: 0 };
      }
      tierStats[sub.tier].count += 1;
      tierStats[sub.tier].mrr += getTierPrice(sub.tier) * (sub.employeeCountCache || 1);
    });

    return {
      mrr,
      arr,
      newCustomers,
      churnRate,
      activeCustomers: activeCount,
      tierStats
    };
  }

  static async getRevenueChartData(days: number = 30) {
    // Get daily MRR for last X days
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Get subscriptions active on this date
      const subscriptions = await prisma.subscription.findMany({
        where: {
          status: 'active',
          createdAt: { lte: date }
        }
      });

      let dailyMrr = 0;
      subscriptions.forEach((sub) => {
        dailyMrr += getTierPrice(sub.tier) * (sub.employeeCountCache || 1);
      });

      data.push({ date, mrr: dailyMrr });
    }

    return data;
  }
}

function getTierPrice(tier: string): number {
  const prices = {
    FREE: 0,
    STARTER: 20000,
    PROFESSIONAL: 25000,
    BUSINESS: 20000,
    ENTERPRISE: 0 // Custom
  };
  return prices[tier] || 0;
}

export class AdminAnalyticsService {
  
  static async getFeatureUsage() {
    // Aggregate feature usage per tier
    const tiers = ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'];
    const features = ['payroll', 'attendance', 'leave', 'recruitment', 'performance', 'training', 'talent_matrix'];

    const usage = {};
    for (const tier of tiers) {
      usage[tier] = {};
      
      // Get all companies in this tier
      const companies = await prisma.company.findMany({
        where: { subscription: { tier } }
      });

      for (const feature of features) {
        // Count how many companies used this feature this month
        const used = await prisma.auditLog.count({
          where: {
            companyId: { in: companies.map((c) => c.id) },
            action: { contains: feature }
          }
        });

        usage[tier][feature] = companies.length > 0 ? (used / companies.length) * 100 : 0;
      }
    }

    return usage;
  }

  static async getChurnSignals() {
    const now = new Date();

    // Inactive: No login for 30+ days
    const inactive = await prisma.company.findMany({
      where: {
        lastActivityAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
      },
      include: { subscription: true },
      take: 20
    });

    // Trial ending soon: Trial ends in < 7 days
    const trialExpiring = await prisma.subscription.findMany({
      where: {
        status: 'active',
        trialEndsAt: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: { company: true }
    });

    return {
      inactive: inactive.map((c) => ({
        company: c,
        signal: 'No login 30+ days',
        days: Math.floor((now.getTime() - c.lastActivityAt.getTime()) / (24 * 60 * 60 * 1000))
      })),
      trialExpiring: trialExpiring.map((s) => ({
        company: s.company,
        signal: 'Trial ending soon',
        days: Math.floor((s.trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      }))
    };
  }
}

export class FeatureFlagService {
  
  static async getAllFlags() {
    return prisma.featureFlag.findMany({
      orderBy: { name: 'asc' }
    });
  }

  static async toggleFlag(name: string, isEnabled: boolean, adminId: string, reason: string) {
    const flag = await prisma.featureFlag.findUnique({ where: { name } });
    if (!flag) throw new Error('Flag not found');

    const updated = await prisma.featureFlag.update({
      where: { name },
      data: {
        isEnabled,
        lastUpdatedBy: adminId,
        lastUpdatedAt: new Date()
      }
    });

    // Log change
    await prisma.featureFlagHistory.create({
      data: {
        flagId: flag.id,
        adminId,
        previousValue: { isEnabled: flag.isEnabled, rolloutPercent: flag.rolloutPercent },
        newValue: { isEnabled, rolloutPercent: flag.rolloutPercent },
        reason
      }
    });

    return updated;
  }

  static async setRolloutPercent(name: string, percent: number, adminId: string) {
    const flag = await prisma.featureFlag.findUnique({ where: { name } });
    if (!flag) throw new Error('Flag not found');

    const updated = await prisma.featureFlag.update({
      where: { name },
      data: { rolloutPercent: percent }
    });

    await prisma.featureFlagHistory.create({
      data: {
        flagId: flag.id,
        adminId,
        previousValue: { rolloutPercent: flag.rolloutPercent },
        newValue: { rolloutPercent: percent },
        reason: 'Rollout % adjusted'
      }
    });

    return updated;
  }
}

export class AdminTicketService {
  
  static async getTickets(page: number = 1, limit: number = 20, filters: any = {}) {
    const skip = (page - 1) * limit;
    let where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: { company: true, messages: true },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.supportTicket.count({ where })
    ]);

    return { tickets, total, page, pages: Math.ceil(total / limit) };
  }

  static async addTicketMessage(ticketId: string, sender: string, message: string, isInternal: boolean = false) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new Error('Ticket not found');

    await prisma.ticketMessage.create({
      data: {
        ticketId,
        sender,
        senderEmail: sender,
        message,
        isInternal
      }
    });

    // Update ticket updated time
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    });
  }

  static async closeTicket(ticketId: string, resolution: string, rating?: number) {
    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'closed',
        resolution,
        resolvedAt: new Date(),
        satisfactionRating: rating
      }
    });
  }
}

export class AdminHealthService {
  
  static async getApiHealth() {
    // Get API metrics from monitoring service (Datadog, Prometheus, etc)
    // For now, simplified example
    
    return {
      status: 'up', // up, degraded, down
      uptime24h: 99.95,
      p50: 45,
      p95: 120,
      p99: 280,
      errorRate: 0.2,
      requestsPerSec: 450
    };
  }

  static async getDatabaseHealth() {
    // Check DB connection, get metrics
    const result = await prisma.$queryRaw`SELECT 1`;

    return {
      status: 'up',
      uptime24h: 99.98,
      connections: 45, // current
      maxConnections: 100,
      diskUsed: 250, // GB
      diskTotal: 500
    };
  }

  static async getQueueHealth() {
    // Check Redis + Bull queue
    return {
      status: 'up',
      pendingJobs: 12,
      failedJobs: 0,
      avgLatency: 250 // ms
    };
  }
}
```

## 2.2 API Routes (Express)

```typescript
// backend/src/routes/admin.ts

import { Router } from 'express';
import { protect } from '@/middleware/auth';
import { requireSuperadmin } from '@/middleware/adminAuth';
import { 
  AdminService, 
  AdminBillingService, 
  AdminAnalyticsService,
  FeatureFlagService,
  AdminTicketService,
  AdminHealthService
} from '@/services/adminService';

const router = Router();

// Middleware: Protect all routes + require superadmin
router.use(protect);
router.use(requireSuperadmin);

// CUSTOMERS

router.get('/customers', async (req, res) => {
  const { page = 1, limit = 50, tier, status, search } = req.query;
  const result = await AdminService.getCustomers(
    parseInt(page as string),
    parseInt(limit as string),
    { tier: tier as string, status: status as string, search: search as string }
  );
  res.json(result);
});

router.get('/customers/:id', async (req, res) => {
  const detail = await AdminService.getCustomerDetail(req.params.id);
  res.json(detail);
});

router.post('/customers/:id/impersonate', async (req, res) => {
  const { impersonationToken, company } = await AdminService.impersonate(
    req.user.id,
    req.params.id,
    req.ip
  );
  res.json({ impersonationToken, company });
});

router.post('/customers/:id/extend-trial', async (req, res) => {
  const { days } = req.body;
  const result = await AdminService.extendTrial(req.params.id, req.user.id, days, req.ip);
  res.json(result);
});

router.post('/customers/:id/notes', async (req, res) => {
  const { note } = req.body;
  const result = await AdminService.addInternalNote(req.params.id, req.user.id, note);
  res.json(result);
});

// BILLING & REVENUE

router.get('/analytics/revenue', async (req, res) => {
  const metrics = await AdminBillingService.getRevenueMetrics();
  res.json(metrics);
});

router.get('/analytics/revenue/trend', async (req, res) => {
  const { days = 30 } = req.query;
  const data = await AdminBillingService.getRevenueChartData(parseInt(days as string));
  res.json(data);
});

// ANALYTICS

router.get('/analytics/features', async (req, res) => {
  const usage = await AdminAnalyticsService.getFeatureUsage();
  res.json(usage);
});

router.get('/analytics/churn-signals', async (req, res) => {
  const signals = await AdminAnalyticsService.getChurnSignals();
  res.json(signals);
});

// FEATURE FLAGS

router.get('/feature-flags', async (req, res) => {
  const flags = await FeatureFlagService.getAllFlags();
  res.json(flags);
});

router.post('/feature-flags/:name/toggle', async (req, res) => {
  const { isEnabled, reason } = req.body;
  const flag = await FeatureFlagService.toggleFlag(
    req.params.name,
    isEnabled,
    req.user.id,
    reason
  );
  res.json(flag);
});

router.post('/feature-flags/:name/rollout', async (req, res) => {
  const { percent } = req.body;
  const flag = await FeatureFlagService.setRolloutPercent(
    req.params.name,
    percent,
    req.user.id
  );
  res.json(flag);
});

// SUPPORT TICKETS

router.get('/tickets', async (req, res) => {
  const { page = 1, limit = 20, status, priority } = req.query;
  const result = await AdminTicketService.getTickets(
    parseInt(page as string),
    parseInt(limit as string),
    { status: status as string, priority: priority as string }
  );
  res.json(result);
});

router.post('/tickets/:id/message', async (req, res) => {
  const { message, isInternal } = req.body;
  await AdminTicketService.addTicketMessage(
    req.params.id,
    req.user.email,
    message,
    isInternal
  );
  res.json({ success: true });
});

router.post('/tickets/:id/close', async (req, res) => {
  const { resolution, rating } = req.body;
  const ticket = await AdminTicketService.closeTicket(
    req.params.id,
    resolution,
    rating
  );
  res.json(ticket);
});

// SYSTEM HEALTH

router.get('/health/api', async (req, res) => {
  const health = await AdminHealthService.getApiHealth();
  res.json(health);
});

router.get('/health/database', async (req, res) => {
  const health = await AdminHealthService.getDatabaseHealth();
  res.json(health);
});

router.get('/health/queue', async (req, res) => {
  const health = await AdminHealthService.getQueueHealth();
  res.json(health);
});

// AUDIT LOG

router.get('/audit-log', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const [logs, total] = await Promise.all([
    prisma.companyAuditLog.findMany({
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.companyAuditLog.count()
  ]);

  res.json({ logs, total, page: parseInt(page as string) });
});

export default router;

// Mount in main app:
// app.use('/api/v1/admin', router);
```

---

# 3. MIDDLEWARE

```typescript
// backend/src/middleware/adminAuth.ts

import { Request, Response, NextFunction } from 'express';

export function requireSuperadmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
}

// 2FA middleware (TOTP verification)
export async function verify2FA(req: Request, res: Response, next: NextFunction) {
  const totp = req.body.totp; // 6-digit code from authenticator app
  const adminSecret = req.user.totpSecret; // Stored during setup

  if (!totp || !verifyTOTP(adminSecret, totp)) {
    return res.status(401).json({ error: 'Invalid 2FA code' });
  }

  next();
}

function verifyTOTP(secret: string, token: string): boolean {
  // Use speakeasy or similar library to verify TOTP
  const speakeasy = require('speakeasy');
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2
  });
}

// Session timeout (30 min inactivity)
export function sessionTimeout(req: Request, res: Response, next: NextFunction) {
  const lastActivity = req.session?.lastActivity || Date.now();
  const thirtyMinutes = 30 * 60 * 1000;

  if (Date.now() - lastActivity > thirtyMinutes) {
    return res.status(401).json({ error: 'Session expired' });
  }

  req.session.lastActivity = Date.now();
  next();
}
```

---

# 4. FRONTEND COMPONENTS (React)

```typescript
// frontend/src/pages/admin/dashboard.tsx

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export function AdminDashboard() {
  const { data: revenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => apiClient.get('/api/v1/admin/analytics/revenue')
  });

  const { data: health } = useQuery({
    queryKey: ['admin-health'],
    queryFn: () => apiClient.get('/api/v1/admin/health/api')
  });

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>
      
      {/* Revenue Cards */}
      <div className="metrics-grid">
        <MetricCard 
          label="MRR" 
          value={`Rp ${formatCurrency(revenue?.mrr || 0)}`}
          trend="+12%"
        />
        <MetricCard 
          label="ARR" 
          value={`Rp ${formatCurrency(revenue?.arr || 0)}`}
        />
        <MetricCard 
          label="Active Customers" 
          value={revenue?.activeCustomers || 0}
        />
        <MetricCard 
          label="Churn Rate" 
          value={`${revenue?.churnRate?.toFixed(1)}%`}
        />
      </div>

      {/* API Health */}
      <div className="health-section">
        <h2>System Health</h2>
        <HealthStatus 
          service="API"
          status={health?.status}
          uptime={health?.uptime24h}
          p99={health?.p99}
        />
      </div>
    </div>
  );
}

// Customer List
export function CustomerList() {
  const [page, setPage] = useState(1);
  const [tier, setTier] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, tier, search],
    queryFn: () =>
      apiClient.get('/api/v1/admin/customers', {
        params: { page, tier, search, limit: 50 }
      })
  });

  return (
    <div className="customers-page">
      <h1>Customers</h1>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="">All tiers</option>
          <option value="FREE">FREE</option>
          <option value="STARTER">STARTER</option>
          <option value="PROFESSIONAL">PROFESSIONAL</option>
        </select>
      </div>

      {/* List */}
      <table className="customers-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Tier</th>
            <th>Employees</th>
            <th>MRR</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.companies?.map((company: any) => (
            <tr key={company.id}>
              <td>{company.name}</td>
              <td>{company.subscription?.tier}</td>
              <td>{company.subscription?.employeeCountCache}</td>
              <td>Rp {formatCurrency(company.subscription?.monthlyRevenue || 0)}</td>
              <td>{company.subscription?.status}</td>
              <td>
                <Link href={`/admin/customers/${company.id}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Customer Detail
export function CustomerDetail({ companyId }: { companyId: string }) {
  const { data: customer } = useQuery({
    queryKey: ['admin-customer', companyId],
    queryFn: () => apiClient.get(`/api/v1/admin/customers/${companyId}`)
  });

  const handleImpersonate = async () => {
    const res = await apiClient.post(
      `/api/v1/admin/customers/${companyId}/impersonate`
    );
    // Save token + redirect
    localStorage.setItem('impersonation_token', res.impersonationToken);
    window.location.href = '/dashboard';
  };

  return (
    <div className="customer-detail">
      <h1>{customer?.company?.name}</h1>

      <section>
        <h2>Subscription</h2>
        <p>Tier: {customer?.company?.subscription?.tier}</p>
        <p>MRR: Rp {formatCurrency(customer?.company?.subscription?.monthlyRevenue)}</p>
        <p>Status: {customer?.company?.subscription?.status}</p>
      </section>

      <section>
        <h2>Usage</h2>
        <p>Employees: {customer?.employees} / {customer?.employeeLimit}</p>
        <p>API calls this month: {customer?.apiCallsThisMonth}</p>
      </section>

      <section>
        <h2>Actions</h2>
        <button onClick={handleImpersonate} className="btn-primary">
          Impersonate
        </button>
      </section>
    </div>
  );
}
```

---

# 5. DATABASE MIGRATION

```sql
-- migrations/2026-09-01_admin-dashboard.sql

CREATE TABLE company_audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  companyId VARCHAR(255),
  adminId VARCHAR(255) NOT NULL,
  action VARCHAR(100),
  description TEXT,
  beforeState JSON,
  afterState JSON,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (companyId) REFERENCES companies(id),
  FOREIGN KEY (adminId) REFERENCES users(id),
  INDEX (companyId),
  INDEX (adminId),
  INDEX (action),
  INDEX (createdAt)
);

CREATE TABLE feature_flags (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) UNIQUE,
  description TEXT,
  isEnabled BOOLEAN DEFAULT FALSE,
  rolloutPercent INT DEFAULT 0,
  minTierRequired VARCHAR(50) DEFAULT 'FREE',
  notes TEXT,
  lastUpdatedBy VARCHAR(255),
  lastUpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (name)
);

CREATE TABLE feature_flag_history (
  id VARCHAR(255) PRIMARY KEY,
  flagId VARCHAR(255) NOT NULL,
  adminId VARCHAR(255) NOT NULL,
  previousValue JSON,
  newValue JSON,
  reason VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (flagId) REFERENCES feature_flags(id),
  FOREIGN KEY (adminId) REFERENCES users(id),
  INDEX (flagId),
  INDEX (adminId)
);

CREATE TABLE support_tickets (
  id VARCHAR(255) PRIMARY KEY,
  companyId VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'medium',
  category VARCHAR(100),
  assignedToId VARCHAR(255),
  resolution LONGTEXT,
  satisfactionRating INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolvedAt TIMESTAMP,
  
  FOREIGN KEY (companyId) REFERENCES companies(id),
  FOREIGN KEY (assignedToId) REFERENCES users(id),
  INDEX (companyId),
  INDEX (status),
  INDEX (priority)
);

CREATE TABLE ticket_messages (
  id VARCHAR(255) PRIMARY KEY,
  ticketId VARCHAR(255) NOT NULL,
  sender VARCHAR(255),
  senderEmail VARCHAR(255),
  message LONGTEXT,
  attachments JSON,
  isInternal BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (ticketId) REFERENCES support_tickets(id),
  INDEX (ticketId)
);

-- Run migration
npx prisma migrate deploy --name admin-dashboard
```

---

*Last Updated: 24 Juli 2026 | Version: 15.0 (FINAL SDD) | Status: Code Ready*
