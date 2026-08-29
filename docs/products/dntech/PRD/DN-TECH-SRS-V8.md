# DN Tech — SRS V8
## System Requirements Specification (Test Cases & Acceptance Criteria)

**Date:** Juli 2026  
**Owner:** QA + Engineering Team  
**Reference:** [PRD V8](./DN-TECH-PRD-V8.md) + [SDD V8](./DN-TECH-SDD-V8.md)

---

## 1. Functional Requirements (Track A: Go-live)

### FR-A1: Database Schema Synchronization

**Requirement:** Production database schema matches Prisma `schema.prisma` on `main`.

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-A1-1 | Run `npx prisma db push --skip-generate` on staging DB | No errors, schema updated | ⏳ |
| TC-A1-2 | Verify tables exist: Product, EmailLog, NewsletterSubscriber, FormSubmission | `SELECT count(*) FROM information_schema.tables WHERE table_schema='public'` ≥ 15 | ⏳ |
| TC-A1-3 | Verify Product table has all V7 fields (pricingTiers, features, integrations, roadmap, etc.) | `SELECT column_name FROM information_schema.columns WHERE table_name='Product'` includes all fields | ⏳ |
| TC-A1-4 | Check for broken foreign keys | `PRAGMA foreign_key_check()` empty (or PostgreSQL equivalent) | ⏳ |
| TC-A1-5 | Backup production DB before push | Backup file exists: `/backups/dntech-2026-07-25.sql.gz` | ⏳ |
| TC-A1-6 | Run migration on production (after approval) | No errors, zero downtime | ⏳ |

**Acceptance Criteria:**
- ✅ All required tables exist with correct schema
- ✅ No data loss from previous versions
- ✅ Indexes created for performance
- ✅ Backup file > 100KB (non-empty)
- ✅ Migration rollback documented (if needed)

---

### FR-A2: Seed dnPeople Product

**Requirement:** dnPeople product seeded to production with all V7 fields populated.

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-A2-1 | Run `npm run db:seed-dnpeople` | Script completes without error | ⏳ |
| TC-A2-2 | Query `SELECT * FROM "Product" WHERE slug='dnpeople'` | 1 record found with published=true, featured=true | ⏳ |
| TC-A2-3 | Verify pricingTiers JSON | 5 tiers present (free, starter, professional, business, enterprise) | ⏳ |
| TC-A2-4 | Verify features JSON | 5 categories with 20+ features total | ⏳ |
| TC-A2-5 | Verify integrations | 6 integrations present (Jurnal, Xendit, BCA, Mandiri, Google, Slack) | ⏳ |
| TC-A2-6 | Verify useCases | 3 segments (Manufacturing, Retail, Startup) with testimonials | ⏳ |
| TC-A2-7 | Verify roadmap | 4 quarters (Q3 2026, Q4 2026, Q1 2027, Q3 2027) | ⏳ |
| TC-A2-8 | Access `/products/dnpeople` in browser | Page renders fully, all sections visible, no 500 error | ⏳ |
| TC-A2-9 | Run seed script twice (idempotency) | No duplicate product created, script skips with message | ⏳ |

**Acceptance Criteria:**
- ✅ All V7 sections fully populated in database
- ✅ Page renders without SSR errors
- ✅ JSON data valid (no truncation or corruption)
- ✅ Script is idempotent (safe to run multiple times)

---

### FR-A3: SMTP Email Verification

**Requirement:** Email delivery from contact form, newsletter, career form reaches admin inbox.

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-A3-1 | Test SMTP connection: `nc -zv mx8.mailspace.id 465` | Connected successfully | ⏳ |
| TC-A3-2 | Fill contact form on homepage | Email received at info@dntech.id within 2 minutes | ⏳ |
| TC-A3-3 | Check email log entry | `SELECT * FROM "EmailLog" WHERE recipient='...'` status='sent' | ⏳ |
| TC-A3-4 | Sign up for newsletter | Opt-in email received with activation link | ⏳ |
| TC-A3-5 | Click newsletter activation link | Subscriber confirmed in DB | ⏳ |
| TC-A3-6 | Submit career form | Email to applicant + admin notification received | ⏳ |
| TC-A3-7 | Test MX records via MXToolbox | SPF/DKIM configured (or documented as pending) | ⏳ |
| TC-A3-8 | Send test email to Gmail/Outlook | Email arrives in inbox, not spam | ⏳ |

**Acceptance Criteria:**
- ✅ Contact form → admin email (100% delivery in test)
- ✅ Newsletter opt-in → email with link
- ✅ Email logs show status='sent' for all test emails
- ✅ No emails to spam folder
- ✅ SPF/DKIM records setup or documented

---

### FR-A4: QA Baseline & Lighthouse

**Requirement:** Lighthouse and accessibility baseline measured and documented.

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-A4-1 | Run Lighthouse on production homepage (mobile) | Performance ≥ 75, Accessibility ≥ 75, Best Practices ≥ 75 | ⏳ |
| TC-A4-2 | Test form accessibility (tab navigation) | All inputs reachable via keyboard | ⏳ |
| TC-A4-3 | Test form accessibility (screen reader) | Labels + error messages announced | ⏳ |
| TC-A4-4 | Test mobile responsiveness (320px) | No horizontal scroll, buttons tappable (≥48px) | ⏳ |
| TC-A4-5 | Test mobile responsiveness (640px) | Layout correct, font readable | ⏳ |
| TC-A4-6 | Test mobile responsiveness (1024px, 1440px) | Responsive grid works | ⏳ |
| TC-A4-7 | Screenshot Lighthouse report | File saved: `lighthouse-v8-baseline.html` | ⏳ |
| TC-A4-8 | Document mobile test matrix | Checklist saved to `docs/QA-CHECKLIST-V8.md` | ⏳ |

**Acceptance Criteria:**
- ✅ Lighthouse mobile score ≥ 75 (all categories)
- ✅ WCAG form accessibility verified
- ✅ Mobile responsive at 320px, 640px, 1024px, 1440px
- ✅ Baseline screenshot captured and stored
- ✅ QA checklist documented

---

### FR-A5: Environment Variable Validation

**Requirement:** Build-time validation of required environment variables.

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-A5-1 | Run build with all required env vars set | Build succeeds | ⏳ |
| TC-A5-2 | Run build with missing `NEXT_PUBLIC_API_URL` | Build fails with error message | ⏳ |
| TC-A5-3 | Run build with invalid `NEXT_PUBLIC_API_URL` (no https://) | Build fails with validation error | ⏳ |
| TC-A5-4 | Set `NEXT_PUBLIC_API_URL` to valid production URL | Homepage loads product data (SSR works) | ⏳ |
| TC-A5-5 | Fallback resolver test: temporarily disable API | Homepage renders (minimal UI, no blank page) | ⏳ |

**Acceptance Criteria:**
- ✅ Build fails if any required env var missing
- ✅ Build validates env var format (e.g., https:// prefix)
- ✅ Production API URL correct at runtime
- ✅ Graceful fallback if API temporarily down

---

### FR-A6: Admin Password Security

**Requirement:** Default admin password changed and documented.

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-A6-1 | Try login with default (admin@dntech.id / Admin@123456) | Access granted (before change) OR denied (after change) | ⏳ |
| TC-A6-2 | Change password via admin settings | New password accepted | ⏳ |
| TC-A6-3 | Login with new password | Access granted | ⏳ |
| TC-A6-4 | Try login with old password | Access denied | ⏳ |
| TC-A6-5 | Verify password stored in secure vault (1Password) | Entry documented | ⏳ |

**Acceptance Criteria:**
- ✅ Default password changed before go-live
- ✅ New password ≥ 12 characters, uppercase, number, special char
- ✅ Old password disabled
- ✅ New password stored in secure vault

---

## 2. Functional Requirements (Track B: Engineering Maturity)

### FR-B1: GitHub Actions CI

**Requirement:** Automated linting and building on every push/PR.

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-B1-1 | Push clean code to PR branch | CI runs, lint + build pass | ⏳ |
| TC-B1-2 | Push code with lint errors | CI runs, lint fails, PR cannot merge | ⏳ |
| TC-B1-3 | Push code that breaks build | CI runs, build fails, PR cannot merge | ⏳ |
| TC-B1-4 | Merge PR to main | CI pass is required status check | ⏳ |
| TC-B1-5 | View CI logs in GitHub | All steps visible, timestamps accurate | ⏳ |

**Acceptance Criteria:**
- ✅ CI pipeline defined in `.github/workflows/ci.yml`
- ✅ CI runs on push and PR
- ✅ PR merge requires CI pass
- ✅ All steps (lint, build) complete < 10 minutes

---

### FR-B2: JWT Refresh Token

**Requirement:** Admin session refresh functionality implemented.

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-B2-1 | Login to admin panel | Access token + refresh token issued | ⏳ |
| TC-B2-2 | Wait for access token near expiry (15 min) | Call `POST /auth/refresh` with refresh token | ⏳ |
| TC-B2-3 | Verify new access token returned | New token valid, user can access admin | ⏳ |
| TC-B2-4 | Try to use old access token | Request fails with 401 Unauthorized | ⏳ |
| TC-B2-5 | Refresh with invalid refresh token | Request fails with 401 | ⏳ |

**Acceptance Criteria:**
- ✅ Access token expires in 15 minutes
- ✅ Refresh token expires in 7 days
- ✅ New access token issued successfully
- ✅ Old tokens properly invalidated

---

### FR-B3: Forgot Password Email

**Requirement:** Password reset via email link implemented.

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-B3-1 | Submit forgot password form with valid email | Email sent within 2 minutes | ⏳ |
| TC-B3-2 | Email contains password reset link | Link is unique token (expires in 1 hour) | ⏳ |
| TC-B3-3 | Click reset link | Reset password form displayed | ⏳ |
| TC-B3-4 | Enter new password + submit | Password updated in database | ⏳ |
| TC-B3-5 | Login with new password | Access granted | ⏳ |
| TC-B3-6 | Use expired reset link | "Link expired" message shown | ⏳ |
| TC-B3-7 | Try to use same reset link twice | Second use fails | ⏳ |

**Acceptance Criteria:**
- ✅ Reset email sent successfully
- ✅ Reset token expires after 1 hour
- ✅ Token is single-use
- ✅ Password updated correctly

---

### FR-B4: Health Endpoint

**Requirement:** Health check endpoint accessible for monitoring.

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-B4-1 | GET `/health` when API is up | HTTP 200, status='ok' | ⏳ |
| TC-B4-2 | Check database connection in response | Response includes uptime, timestamp | ⏳ |
| TC-B4-3 | GET `/health` when database is down | HTTP 503, status='unhealthy' | ⏳ |

**Acceptance Criteria:**
- ✅ Health endpoint returns 200 when OK
- ✅ Health endpoint returns 503 when unhealthy
- ✅ Response includes timestamp, uptime, environment

---

## 3. Non-Functional Requirements

| NFR | Requirement | Test | Target | Status |
|----|-------------|------|--------|--------|
| **Language** | UI + admin in Bahasa Indonesia | Scan all text strings | 100% Indonesian | ⏳ |
| **Currency** | Pricing in IDR | Check Product pricingTiers | IDR for all pricing | ⏳ |
| **Accessibility** | WCAG 2.1 AA baseline form | Form tab nav + screen reader | Pass axe audit | ⏳ |
| **Security** | JWT httpOnly + rate limiting | Check auth headers + rate limit response | No auth bypass | ⏳ |
| **Performance** | Homepage TTFB < 1.5s (prod) | `curl -w '%{time_total}'` https://dntech.id | < 1500ms | ⏳ |
| **Availability** | Target 99.5% uptime Month 1 | Monitor via UptimeRobot or similar | ≥ 99.5% | ⏳ |
| **Backup** | PostgreSQL backup scheduled | Check cron job / provider settings | Weekly backup | ⏳ |

---

## 4. Track C Requirements (Product Platform)

### FR-C1: Product Media Upload

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-C1-1 | Upload image to `/admin/products/[id]/` | Image saved to `/uploads/products/[id]/` | ⏳ |
| TC-C1-2 | Verify image URL auto-filled in form | Form field shows correct path | ⏳ |
| TC-C1-3 | Verify image displays on public product page | Hero image renders without 404 | ⏳ |
| TC-C1-4 | Upload file > 10MB | Upload rejected with error | ⏳ |
| TC-C1-5 | Upload non-image file (e.g., .txt) | Upload rejected | ⏳ |

**Acceptance Criteria:**
- ✅ Image upload works via drag-drop or file picker
- ✅ Images stored in correct directory
- ✅ URL auto-populated in product form
- ✅ File size limit enforced (≤ 10MB)
- ✅ Only image formats accepted (JPEG, PNG, WebP)

---

### FR-C2: Guided Product Editor

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TC-C2-1 | Add pricing tier via form | Tier added to JSON structure | ⏳ |
| TC-C2-2 | Edit tier name + price | Changes saved to database | ⏳ |
| TC-C2-3 | Delete tier | Tier removed from JSON | ⏳ |
| TC-C2-4 | Add FAQ Q+A via form | Entry added to faqJson | ⏳ |
| TC-C2-5 | Edit FAQ answer | Changes reflected on public page | ⏳ |

**Acceptance Criteria:**
- ✅ Form-based editor (no raw JSON required)
- ✅ Changes saved to database automatically
- ✅ Changes visible on public product page within 5 sec

---

## 5. Regression Tests (Safety Checks)

**Baseline tests that must pass to prevent regressions:**

| Check | Test | Expected |
|-------|------|----------|
| **Homepage load** | GET `/` | 200 OK, loads < 2s |
| **Contact form** | Fill + submit | Email sent, no 500 error |
| **Newsletter signup** | Subscribe email | Opt-in email received |
| **Admin login** | Login attempt | Auth works, session created |
| **Product page** | GET `/products/dnpeople` | All sections render |
| **JSON-LD** | Check page source | JSON-LD Product schema present |
| **SEO meta** | Check head tags | title, description, og:image present |
| **Mobile menu** | Toggle menu | Menu opens/closes correctly |
| **Dark mode (if applicable)** | Toggle dark mode | Styles apply correctly |

---

## 6. Test Execution Plan

### Phase 1: Staging (3 days)
- Deploy to staging environment
- Run all Track A tests (A1–A6)
- Document any issues
- Fix + re-test

### Phase 2: UAT (1 day)
- Dozer / key stakeholders test manually
- Sign off on Track A

### Phase 3: Production Deployment (1 day)
- Deploy to production
- Run smoke tests (A1, A3, A4)
- Monitor for 24 hours
- Document metrics (Lighthouse, uptime, etc.)

### Phase 4: Track B & C (Optional)
- If time allows, implement Track B (engineering maturity)
- Track C deferred to V8.1 if needed

---

## 7. Test Summary Report (Post-V8)

| Category | Pass | Fail | Status |
|----------|------|------|--------|
| Track A: Go-live | / | / | ⏳ |
| Track B: Engineering | / | / | ⏳ |
| Track C: Product | / | / | ⏳ |
| Regression tests | / | / | ⏳ |
| **Overall** | | | ⏳ |

---

## 8. Sign-Off

| Role | Approval | Date |
|------|----------|------|
| QA Lead | [ ] | |
| Engineering Lead | [ ] | |
| Product Owner (Dozer) | [ ] | |

---

**Version:** V8 (SRS)  
**Owner:** QA + Engineering Team  
**Date:** Juli 2026  
**Next:** Execute test plan per timeline
