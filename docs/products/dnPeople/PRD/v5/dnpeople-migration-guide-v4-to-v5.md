# dnPeople — Migration Guide: PRD v4 → PRD v5
## Implementing Feature Tier & Subscription Gating

**Version:** 1.0  
**Owner:** Dozer (CEO + Tech Lead)  
**Date:** July 16, 2026  
**Audience:** Product, Engineering, Finance, Operations  
**Timeline:** Q3-Q4 2026 (before public launch)

---

## Executive Summary

PRD v4 defined **competitive features & talent development**. PRD v5 adds **subscription tier gating** to monetize features. This guide explains:

1. What changes between v4 → v5
2. How existing implementations are affected
3. Migration roadmap & timeline
4. Risk mitigation

**TL;DR:**
- v4 features remain implemented (no removal)
- v5 adds tier gating (feature blocking per subscription)
- Existing dev customers assigned to Professional tier (no disruption)
- New sign-ups get Gratis tier (freemium funnel)

---

## What Changes: v4 vs v5

### PRD v4 (Current State)

```
Single-tier product:
- All features available to all customers
- No feature restrictions
- Pricing: IDR 20-25K/emp/month (flat)
- No subscription management
- Assumed infinite runway
```

### PRD v5 (New State)

```
Multi-tier product:
- 5 subscription tiers
- Features gated by tier
- Tiered pricing (FREE → 20K → 25K → 20K → custom)
- Subscription management UI
- Revenue-focused monetization
```

### Change Impact Matrix

| Aspect | v4 | v5 | Impact | Mitigation |
|--------|----|----|--------|-----------|
| **Feature availability** | All features for all | Features gated by tier | Users may see "upgrade needed" | Clear messaging + upgrade prompt |
| **Pricing** | Flat IDR 20-25K/emp | Tiered (FREE/20K/25K/20K/custom) | Same price for Professional tier | No price change for existing customers |
| **Attendance feature** | Available to all | Only Starter+ (blocks Free) | Free users cannot clock-in | Upgrade path clearly shown |
| **Code complexity** | None (all features live) | Middleware + gating logic | Dev effort ~2-3 weeks | Modular design, no breaking changes |
| **Database schema** | No subscription table | New: Subscription, Invoice, AuditLog | Schema migration needed | One-time DB push, no data loss |
| **Billing** | Manual invoicing | Automated (Stripe/Xendit) | New payment infrastructure | Third-party integration, tested |

---

## Migration Roadmap

### Phase 1: Preparation (Week 1-2)

**Tasks:**
1. ✅ Finalize PRD v5 specs (done)
2. ⬜ Approve with leadership
3. ⬜ Plan database migration
4. ⬜ Design billing integration
5. ⬜ Set up Stripe/Xendit sandbox

**Deliverables:**
- Architecture review + sign-off
- Database migration plan
- Billing setup checklist

**Owner:** Dozer, Engineering Lead

---

### Phase 2: Backend Implementation (Week 3-5)

**Tasks:**
1. ⬜ Update Prisma schema (Subscription, Invoice, AuditLog tables)
2. ⬜ Implement SubscriptionService (tier lookup, feature check)
3. ⬜ Add featureAccess() middleware to Express
4. ⬜ Add feature gating to all route handlers
5. ⬜ Implement billing API endpoints (/api/subscription/*)
6. ⬜ Add Stripe webhook handlers
7. ⬜ Unit tests for subscription logic

**Deliverables:**
- `prisma/schema.prisma` updated
- `src/services/subscriptionService.ts` implemented
- `src/middleware/featureAccess.ts` implemented
- All routes gated by feature middleware
- Stripe webhook handler live
- Test coverage >80%

**Owner:** Backend Engineer

**Testing:**
- Mock: Free tier → blocked from attendance ✅
- Mock: Starter tier → allowed attendance ✅
- Mock: Tier upgrade → features unlock immediately ✅
- Mock: Payment failure → auto-suspend ✅

---

### Phase 3: Frontend Implementation (Week 6-7)

**Tasks:**
1. ⬜ Implement `useSubscription()` hook
2. ⬜ Create `<FeatureGate>` component
3. ⬜ Create `<UpgradePrompt>` component
4. ⬜ Update navigation menu (hide unavailable features)
5. ⬜ Add upgrade CTA on blocked features
6. ⬜ Create billing dashboard UI (/billing)
7. ⬜ Create upgrade flow UI

**Deliverables:**
- `src/lib/useSubscription.ts` hook
- `src/components/FeatureGate.tsx` component
- `src/components/UpgradePrompt.tsx` component
- Updated `/app/(app)/navigation.tsx`
- New `/app/billing` pages (dashboard, upgrade, cancel)
- Screenshot of upgrade flow

**Owner:** Frontend Engineer

**Testing:**
- Free user navigates to /attendance → UpgradePrompt shown ✅
- Professional user navigates to /talent → Content loads ✅
- Click "Upgrade" → Navigate to /billing/upgrade ✅
- Mobile responsive ✅

---

### Phase 4: Integration & QA (Week 8)

**Tasks:**
1. ⬜ End-to-end test: signup → free tier → upgrade → professional
2. ⬜ End-to-end test: payment failure → suspension
3. ⬜ End-to-end test: multi-branch features blocked for non-Business
4. ⬜ Load testing (5K concurrent users, tier lookups <50ms)
5. ⬜ Security testing (API key bypass attempts)
6. ⬜ Backup/restore verification

**Deliverables:**
- E2E test suite (Playwright)
- Load test results
- Security audit report
- Deployment checklist

**Owner:** QA Lead, Security Engineer

---

### Phase 5: Soft Launch & Monitoring (Week 9)

**Tasks:**
1. ⬜ Deploy to staging (replica of production)
2. ⬜ Internal testing (team uses app as customers)
3. ⬜ Monitoring setup (Sentry, Prometheus alerts)
4. ⬜ Customer communication prep (email templates)
5. ⬜ Support documentation (FAQ, tier comparison)

**Deliverables:**
- Staging environment live
- Monitoring dashboards configured
- Email templates ready
- Support docs published

**Owner:** DevOps, Operations

---

### Phase 6: Production Launch (Week 10)

**Tasks:**
1. ⬜ Database migration (add 3 new tables)
2. ⬜ Deploy PRD v5 backend to production
3. ⬜ Deploy PRD v5 frontend to production
4. ⬜ Assign existing customers to Professional tier
5. ⬜ Verify tier gating works end-to-end
6. ⬜ Monitor for 24 hours
7. ⬜ Send "Welcome to v5" email to all customers

**Timeline:**
- Deploy backend: Monday 2:00 AM (UTC+7, low traffic)
- Deploy frontend: Monday 2:30 AM
- Verify: Monday 3:00 AM
- Monitor: Monday 3:00 AM - Tuesday 3:00 AM
- Customer email: Tuesday 9:00 AM

**Rollback plan:**
- If critical issue: Revert code to v4 (feature gating disabled)
- Data: All tier/subscription data preserved (can re-enable gating later)

**Owner:** DevOps, Dozer

---

### Phase 7: Post-Launch (Week 11+)

**Tasks:**
1. ⬜ Monitor subscription system for 2 weeks
2. ⬜ Collect customer feedback on tier model
3. ⬜ Fix bugs (if any)
4. ⬜ Publish success metrics (signups, conversions, MRR)
5. ⬜ Plan Phase 2 (advanced features: 9-box, EWA, etc)

**Owner:** Product, Engineering

---

## Existing Customer Handling

### Current Customers (v4 users)

**Status:** Not affected during v5 launch

**Assignment:** Automatically assigned to **Professional tier**
- All v4 features remain available
- No pricing change (keep existing contract terms)
- Can see "You have Professional" in billing dashboard
- No action required from customer

**Migration timeline:**
- At contract renewal: Offer to move to new tier model
- Option 1: Stay on custom Professional pricing (legacy)
- Option 2: Move to standard Professional pricing (if lower, they upgrade tier)
- Option 3: Move to Business/Enterprise if they want multi-branch/API

### Free Trial Customers

**Status:** Will get Gratis tier

**Assignment:** Automatically assigned to **Gratis tier**
- Can use employees, org chart, documents (v4 features available in Free)
- **Cannot** use attendance (new gate in v5)
- See "Upgrade to unlock attendance" on attendance page
- Automatically offered Starter or Professional tier after 7 days

---

## Database Migration

### Schema Changes

```sql
-- NEW TABLES (add to Prisma schema)

table Subscription {
  - id (String, primary key)
  - companyId (String, unique FK to Company)
  - tier (SubscriptionTier enum: FREE | STARTER | PROFESSIONAL | BUSINESS | ENTERPRISE)
  - status (SubscriptionStatus enum: ACTIVE | SUSPENDED | CANCELLED | EXPIRED)
  - billingEmail (String)
  - paymentMethod (String)
  - nextBillingDate (DateTime)
  - monthlyAmount (Decimal)
  - startDate (DateTime)
  - endDate (DateTime nullable)
  - enabledFeatures (String array)
  - ... (see SDD v5 for full schema)
}

table Invoice {
  - id (String, primary key)
  - subscriptionId (String, FK)
  - invoiceNumber (String, unique)
  - status (InvoiceStatus enum)
  - periodStart (DateTime)
  - periodEnd (DateTime)
  - total (Decimal)
  - paidAt (DateTime nullable)
  - ... (see SDD v5 for full schema)
}

table SubscriptionAuditLog {
  - id (String, primary key)
  - subscriptionId (String, FK)
  - action (String)
  - oldValue (String nullable JSON)
  - newValue (String nullable JSON)
  - changedBy (String)
  - createdAt (DateTime)
  - ... (see SDD v5 for full schema)
}

-- UPDATED TABLE

table Company {
  + subscriptionId (String nullable FK)
  ... (existing fields remain)
}
```

### Migration Script

```bash
# 1. Create migration
npx prisma migrate dev --name add_subscription_tables

# 2. Review migration file
cat prisma/migrations/*/migration.sql

# 3. Apply to production
npx prisma migrate deploy

# 4. Seed initial subscriptions
npx ts-node scripts/seed-subscriptions.ts
```

### Seed Script

```typescript
// scripts/seed-subscriptions.ts
async function seedSubscriptions() {
  // For each existing company, create Subscription record
  const companies = await prisma.company.findMany();
  
  for (const company of companies) {
    const subscription = await prisma.subscription.create({
      data: {
        companyId: company.id,
        tier: 'PROFESSIONAL',  // Legacy customers = Professional
        status: 'ACTIVE',
        startDate: company.createdAt,
        billingEmail: company.email,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        monthlyAmount: 0,  // Legacy: no charge (existing contracts)
      }
    });
    
    console.log(`✅ Created subscription for ${company.name}`);
  }
}
```

### Rollback Plan

If issues occur:

```bash
# Revert to previous migration
npx prisma migrate resolve --rolled-back {migration_name}

# Or: Keep tables but disable gating (set all tier checks to FREE = allow all)
# Update subscriptionService to return 'PROFESSIONAL' for everyone temporarily
```

---

## Feature Gating Implementation Checklist

### Backend Routes

- [ ] `/api/attendance/*` → `requireMinTier('STARTER')`
- [ ] `/api/leave/*` → `requireMinTier('STARTER')`
- [ ] `/api/payroll/*` → `requireMinTier('STARTER')`
- [ ] `/api/recruitment/*` → `requireMinTier('PROFESSIONAL')`
- [ ] `/api/performance/*` → `requireMinTier('PROFESSIONAL')`
- [ ] `/api/talent/*` → `featureAccess('talent:*')`
- [ ] `/api/lms/*` → `requireMinTier('PROFESSIONAL')`
- [ ] `/api/multiBranch/*` → `requireMinTier('BUSINESS')`
- [ ] `/api/integrations/*` → `requireMinTier('BUSINESS')`
- [ ] `/api/platform/*` → `requireMinTier('ENTERPRISE')`

### Frontend Routes

- [ ] `/attendance` → `<FeatureGate feature="attendance">`
- [ ] `/leave` → `<FeatureGate feature="leave">`
- [ ] `/payroll` → `<FeatureGate feature="payroll">`
- [ ] `/recruitment` → `<FeatureGate feature="recruitment">`
- [ ] `/performance` → `<FeatureGate feature="performance">`
- [ ] `/talent` → `<FeatureGate feature="talent:*">`
- [ ] `/lms` → `<FeatureGate feature="lms">`
- [ ] `/branches` → `<FeatureGate feature="multiBranch">`
- [ ] `/integrations` → `<FeatureGate feature="api:rest">`
- [ ] `/platform` → `<FeatureGate feature="multiCompany">`

### Navigation Updates

- [ ] Update `getNavigation(tier)` to hide unavailable menu items
- [ ] Test on all tier levels (Free → Enterprise)
- [ ] Mobile navigation responsive

---

## Risk Mitigation

### Risk 1: Payment Processing Failure
**Risk:** Stripe down → customers cannot pay → revenue disruption

**Mitigation:**
- Graceful degradation: If payment fails, send email warning (7 days grace)
- Fallback: Manual invoice + bank transfer option
- Monitoring: Alert on payment failures >5% of attempts

---

### Risk 2: Customers Blocked from Attendance (Free → Gratis upgrade)
**Risk:** Existing free trial users suddenly cannot use attendance

**Mitigation:**
- Clear communication: "Update available: Attendance now requires Starter tier"
- Upgrade discount: 50% off for first 50 customers (6-month lock-in)
- Grace period: 7 days free access to attendance before gating active
- Support: Dedicated helpdesk for tier questions

---

### Risk 3: Data Loss During Migration
**Risk:** Subscription table creation fails → data corruption

**Mitigation:**
- Test on staging replica first (same data as production)
- Backup before migration: `pg_dump dnpeople_prod > backup_v4.sql`
- Run migration in low-traffic window (2 AM UTC+7)
- Rollback plan ready (30-min restore from backup)
- Monitor for 24 hours post-deployment

---

### Risk 4: Feature Gating Bypass
**Risk:** Client-side check bypassed → user accesses paid feature

**Mitigation:**
- **All checks server-side** (Express middleware, not JavaScript)
- API rejects unpaid tier requests with 403
- Frontend checks are UX only (prevent wasted requests)
- Security audit before launch

---

### Risk 5: Performance Degradation
**Risk:** Tier lookup adds latency → p95 > 200ms

**Mitigation:**
- Tier cached in Redis (3-hour TTL)
- Feature list cached in-memory on backend
- Load test: 5K concurrent users, tier checks <50ms
- Monitor p95 latency post-launch

---

## Communication Plan

### Before Launch (1 week)
- [ ] Email to all customers: "PRD v5 coming: subscription tiers launching"
- [ ] FAQ published on blog
- [ ] Tier comparison chart shared

### Launch Day
- [ ] Announcement email: "PRD v5 live: new tier model"
- [ ] In-app banner: "Welcome to subscriptions"
- [ ] Support ready for questions

### After Launch (Week 2)
- [ ] Customer survey: Tier satisfaction
- [ ] Blog post: "How to choose your tier"
- [ ] Success story: Early adopters

---

## Success Metrics

### Immediate (Week 1)
- ✅ Zero critical bugs
- ✅ Payment system working (0% failure rate)
- ✅ Tier gating blocking Free users from attendance
- ✅ Upgrade prompt showing on blocked features

### Short-term (Month 1)
- ✅ 50+ new sign-ups
- ✅ 10% conversion from Free → Starter/Professional
- ✅ MRR >IDR 100M
- ✅ NPS >40

### Medium-term (Quarter 1)
- ✅ 175 paid customers
- ✅ Churn <3%
- ✅ MRR IDR 755M
- ✅ NPS >50

---

## Approval & Sign-Off

| Role | Name | Approval | Date |
|------|------|----------|------|
| CEO + Tech Lead | Dozer | 👤 | July 16, 2026 |
| Engineering Lead | TBD | ⬜ | — |
| Finance | TBD | ⬜ | — |

---

## Appendix: Quick Reference

### File Changes

**Backend:**
- `prisma/schema.prisma` — Add 3 tables
- `src/services/subscriptionService.ts` — New service
- `src/middleware/featureAccess.ts` — New middleware
- `src/routes/*.ts` — Add middleware to routes

**Frontend:**
- `src/lib/useSubscription.ts` — New hook
- `src/components/FeatureGate.tsx` — New component
- `src/app/(app)/navigation.tsx` — Update to gate menu items
- `src/app/billing/*` — New billing pages

**Database:**
- `prisma/migrations/*/add_subscription_tables.sql` — New migration

---

*Last Updated: July 16, 2026 | Owner: Dozer (CEO + Tech Lead)*
