# dnPeople — PRD v14.0
## In-App Tutorial & Onboarding: Interactive Guides & Knowledge Base

**Versi:** 14.0  
**Tanggal:** 24 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Baseline:** Post v13.0 (Talent Matrix complete)  
**Status:** Ready for SRS/SDD

> **Scope override — 25 July 2026:** Video tutorial and Video Library are removed from v14.0 by product decision. The implemented scope is interactive tutorials + searchable Knowledge Base. Any video references below are historical proposal text, not current acceptance criteria.

---

## Executive Summary

**Tutorial System** adds in-app, interactive walkthroughs for key HRIS workflows. Not just video or docs—interactive guides with step-by-step instructions, tooltips, form hints, and video embeds.

**MVP Scope:** 5 core tutorials for most-common workflows
- Employee Creation (core HR)
- Payroll Cycle Setup (finance)
- Attendance Clock-In (daily ops)
- Leave Request (employee self-service)
- Performance Review Creation (HR/Manager)

**Secondary:** Video library (YouTube embeds) + knowledge base (searchable articles)

---

## 1. Problem & Business Outcome

### Current State
```
✗ New users login → "What do I do first?"
✗ No in-app guidance
✗ Support tickets: "How do I add an employee?"
✗ Training takes 2-3 hours per new customer
✗ High churn: Users give up if onboarding is hard
```

### Desired State
```
✓ User logs in → Tutorial dropdown "Getting Started"
✓ Click "Add Employee" → Step-by-step walkthrough (3 min)
✓ Form hints + validation messages guide user
✓ Video for complex workflows (Payroll)
✓ Knowledge base: Search "How to create payroll" → instant answer
✓ Result: Users self-sufficient in 30 min (not 3 hours)
```

### Business Impact
- **Onboarding:** 30 min vs 3 hours (faster activation)
- **Support:** -30% tutorial-related tickets
- **Retention:** Better user experience, lower churn
- **Upsell:** Happy customers = more likely to upgrade tiers

---

## 2. Personas & User Journeys

### HR / COMPANY_ADMIN
```
Goal: Onboard employees, set up payroll, run performance reviews
Pain: "I'm new to HRIS, need to learn quickly"

Journey:
  1. Login → See "Tutorial" dropdown in top nav
  2. Click "Getting Started" → Suggested tutorials (top 5)
  3. Start "Employee Creation"
     - Step 1: Upload employee data (or manual form)
     - Step 2: Set department/role
     - Step 3: Configure payroll (optional)
     - Video embedded: "Bulk import employees" (2 min)
  4. Complete → "Next: Set up Payroll Cycle"
  5. Result: Ready to run payroll in 15 min
```

### MANAGER
```
Goal: Submit performance reviews, approve leave requests
Pain: "How do I create a review?"

Journey:
  1. Click "Performance" → New Review
  2. Tooltip: "Start a performance cycle to gather feedback"
  3. Click tooltip → In-app tutorial overlay
  4. Step-by-step: Create cycle → Assign assessors → Gather feedback
  5. Video: "Performance cycles explained" (3 min, embedded)
  6. Complete → Review ready to send
```

### EMPLOYEE (Self-Service)
```
Goal: Check attendance, request leave
Pain: "Where do I clock in?"

Journey:
  1. Click "Attendance" → See "How to clock in" tooltip
  2. Tutorial: "Tap clock-in button (location shown), selfie/QR required"
  3. Video: "Mobile attendance walkthrough" (1 min)
  4. Click "Request Leave" → Similar walkthrough
  5. Know exactly what to do
```

---

## 3. In Scope

### 3.1 Tutorial System (Interactive)

```
5 Core Tutorials (MVP):

1. EMPLOYEE CREATION (HR)
   Steps:
     - Step 1: Navigate to Employees
     - Step 2: Click "Add Employee" button
     - Step 3: Fill form (Name, Email, Role, Dept)
     - Step 4: Set salary (if STARTER+)
     - Step 5: Assign manager
     - Step 6: Save
   
   Media: 
     - Form hints on each field
     - Video: "Bulk import" (optional, for step 2)
     - Expected time: 3 min
     - Difficulty: Easy
   
   Completion: Employee created successfully

2. PAYROLL CYCLE SETUP (Finance/HR)
   Steps:
     - Step 1: Navigate to Payroll > Cycles
     - Step 2: Click "Create Cycle"
     - Step 3: Select period (monthly, bi-weekly)
     - Step 4: Choose components (gross, BPJS, PPh)
     - Step 5: Review calculator
     - Step 6: Run batch (confirm)
   
   Media:
     - Video: "Payroll cycle walkthrough" (5 min, embedded YouTube)
     - Form tooltips for each field
     - Calculator explanation
     - Warning: "This will deduct salaries"
     - Expected time: 15 min
     - Difficulty: Medium
   
   Completion: Payroll slip generated (ready to approve)

3. ATTENDANCE CLOCK-IN (All employees)
   Steps:
     - Step 1: Navigate to Attendance (mobile or web)
     - Step 2: See clock-in button
     - Step 3: Tap "Clock In" (or "Clock Out")
     - Step 4: Required: Selfie / QR / Location (depends on config)
     - Step 5: Confirm
   
   Media:
     - Short video: "Mobile attendance demo" (1 min)
     - Screenshots: How to take selfie, QR scan
     - Tooltip: "Why we need selfie? Anti-spoofing"
     - Expected time: 2 min
     - Difficulty: Very Easy
   
   Completion: Attendance recorded (visible in report)

4. LEAVE REQUEST (Employee self-service)
   Steps:
     - Step 1: Navigate to Leave
     - Step 2: Click "Request Leave"
     - Step 3: Select leave type (Annual, Sick, etc)
     - Step 4: Pick date range (start/end)
     - Step 5: Add reason (optional)
     - Step 6: Submit (waits manager approval)
   
   Media:
     - Inline form hints
     - Calendar picker visual guide
     - Video: "Leave workflow" (2 min)
     - Shows: Balance remaining, pending leaves
     - Expected time: 3 min
     - Difficulty: Easy
   
   Completion: Leave request submitted (manager notified)

5. PERFORMANCE REVIEW (HR/Manager)
   Steps:
     - Step 1: Navigate to Performance
     - Step 2: Click "Create Cycle"
     - Step 3: Set evaluation period
     - Step 4: Assign direct reports to assess
     - Step 5: Select assessment template (360 / self / manager)
     - Step 6: Send invitations
   
   Media:
     - Video: "Performance cycle deep dive" (4 min)
     - Form hints on each field
     - Template preview (what assessors will see)
     - Expected time: 10 min
     - Difficulty: Medium
   
   Completion: Assessment cycle live (responses incoming)
```

### 3.2 Tutorial Discovery & Navigation

```
Tutorial Dropdown (Top Nav):
  ├─ Getting Started
  │  ├─ Employee Creation (3 min, Easy)
  │  ├─ Payroll Setup (15 min, Medium)
  │  ├─ Attendance (2 min, Very Easy)
  │  ├─ Leave Request (3 min, Easy)
  │  └─ Performance Review (10 min, Medium)
  │
  ├─ Video Library (YouTube playlist)
  │  ├─ Payroll basics (5 min)
  │  ├─ Attendance explained (3 min)
  │  ├─ Mobile app tour (8 min)
  │  └─ ... (more videos)
  │
  ├─ Knowledge Base
  │  └─ Search: "How to...", "What is...", "Where to..."
  │
  └─ Get Help
     ├─ Chat with support
     ├─ Email: info@dnpeople.id
     └─ Schedule demo call
```

### 3.3 Tutorial Overlay (In-App)

```
When user clicks tutorial:

Modal opens:
  ┌─────────────────────────────────────┐
  │ Employee Creation              [X]  │
  │ Step 1 of 6: Navigate to Employees  │
  ├─────────────────────────────────────┤
  │                                     │
  │ Click the "Employees" menu on the   │
  │ left sidebar.                       │
  │                                     │
  │ [Screenshot of left nav]            │
  │                                     │
  │ ⏱ 3 min remaining                  │
  │ 📊 Progress: ████░░ (Step 1/6)      │
  │                                     │
  │ [← Back] [Next: Fill Form →]        │
  └─────────────────────────────────────┘

Features:
  - Highlight element on page (pulse animation)
  - Dim background (focus user attention)
  - Progress bar (6 steps)
  - Estimated time remaining
  - Prev/Next buttons
  - Can skip tutorial
  - Video embed (if applicable)
  - Form hints (inline in actual form)
  - Completion: "You did it! Next suggested: Payroll"
```

### 3.4 Video Library

```
Embed platform: YouTube (public playlist)
Company: dnPeople channel
Videos:
  - Employee creation (3 min)
  - Payroll cycle (5 min)
  - Attendance explained (3 min)
  - Mobile app (8 min)
  - Performance cycle (4 min)
  - ... (more as we grow)

Inside app:
  → Click "Video Library" in tutorial dropdown
  → Shows: Playlist with thumbnails + descriptions
  → Click video → Embedded player (YouTube iframe)
  → Can watch full-screen or in modal
```

### 3.5 Knowledge Base

```
Articles (markdown format):
  - "How do I add an employee?"
  - "What is a performance cycle?"
  - "Why does my salary calculation show this number?"
  - "How to clock in via mobile?"
  - "What's the difference between leave types?"
  - ... (50+ articles)

Frontend:
  - Search bar: Real-time search
  - Category filter: By module (payroll, attendance, etc)
  - Related articles (suggested after article)
  - Ratings: "Was this helpful? Yes/No"

Sync with tutorials:
  - Tutorial step 3 → Link to related KB article
  - KB article → "See interactive tutorial" button
  - Video embedded in some articles
```

### 3.6 Tier Gating

```
Tier Matrix:

Feature                | FREE | STARTER | PROF | BUS | ENT
───────────────────────────────────────────────────────────
Basic tutorials        | ✓    | ✓       | ✓    | ✓   | ✓
(Employee creation)    |      |         |      |     |
Video library (basic)  | ✓    | ✓       | ✓    | ✓   | ✓
Knowledge base         | ✓    | ✓       | ✓    | ✓   | ✓
Advanced tutorials     | ✗    | ✓       | ✓    | ✓   | ✓
(Payroll setup, Perf)  |      |         |      |     |
Custom training        | ✗    | ✗       | ✗    | ✓   | ✓
(white-label videos)   |      |         |      |     |

Default: Knowledge base + basic tutorials = free
Advanced tutorials (payroll, performance) = STARTER+
```

---

## 4. Out of Scope

```
❌ Live webinar/instructor-led training (future)
❌ Certification program (future)
❌ Custom video production per customer (future, Enterprise only)
❌ Chatbot AI assistant (future)
❌ Auto-detection: "You're struggling with X, want tutorial?" (future)
❌ Multi-language (English only for MVP)
```

---

## 5. Data Model & Content Structure

### 5.1 Tutorial Entity

```typescript
// Prisma model
model Tutorial {
  id                String            @id @default(cuid())
  company           Company?          @relation(fields: [companyId], references: [id])
  companyId         String?           // null = global tutorial
  
  title             String            // "Employee Creation"
  slug              String            @unique // "employee-creation"
  description       String            // One-liner
  category          String            // "Getting Started", "Advanced", etc
  
  // Content
  steps             TutorialStep[]
  videoUrl          String?           // YouTube embed URL (optional)
  expectedMinutes   Int               // 3, 5, 15, etc
  difficulty        String            // "Easy", "Medium", "Hard"
  
  // Metadata
  tier              String            @default("FREE") // Minimum tier required
  modules           String[]          @default([]) // Which modules touched: "payroll", "attendance", etc
  order             Int               @default(0) // Display order
  isActive          Boolean           @default(true)
  
  // Analytics
  views             Int               @default(0)
  completions       Int               @default(0)
  avgCompletionTime Int?              // seconds
  helpfulRating     Float?            // 1-5 from user feedback
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
}

model TutorialStep {
  id                String            @id @default(cuid())
  tutorial          Tutorial          @relation(fields: [tutorialId], references: [id], onDelete: Cascade)
  tutorialId        String
  
  stepNumber        Int               // 1, 2, 3, ...
  title             String            // "Navigate to Employees"
  instruction       String            @db.Text // Markdown format
  
  // Visual hints
  elementSelector   String?           // CSS selector to highlight (e.g., "[data-testid='employees-btn']")
  highlightColor    String?           // "blue", "green", "yellow"
  
  // Media
  screenshotUrl     String?           // Image URL
  videoUrl          String?           // YouTube embed (for this step)
  
  // Validation
  validationScript  String?           // Client-side check: "completed this step?" (JS)
  successMessage    String?           // "Great! Now click Next"
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@unique([tutorialId, stepNumber])
}

model TutorialProgress {
  id                String            @id @default(cuid())
  user              User              @relation(fields: [userId], references: [id])
  userId            String
  
  tutorial          Tutorial          @relation(fields: [tutorialId], references: [id])
  tutorialId        String
  
  // Progress tracking
  currentStep       Int               // 1-6 (where user is)
  isCompleted       Boolean           @default(false)
  completedAt       DateTime?
  
  // Time tracking
  startedAt         DateTime          @default(now())
  lastActivityAt    DateTime          @updatedAt
  totalTimeSpent    Int               @default(0) // seconds
  
  // Feedback
  isHelpful         Boolean?          // null = no feedback yet, true/false = user feedback
  feedbackComment   String?
  
  @@unique([userId, tutorialId])
}

model KnowledgeBaseArticle {
  id                String            @id @default(cuid())
  slug              String            @unique
  
  title             String
  content           String            @db.LongText // Markdown
  category          String            // "Payroll", "Attendance", "General", etc
  tags              String[]          @default([])
  
  // SEO + discovery
  description       String?           // Meta description
  relatedArticles   String[]          @default([]) // Article IDs
  relatedTutorials  String[]          @default([]) // Tutorial IDs
  
  // Metadata
  order             Int               @default(0)
  isPublished       Boolean           @default(true)
  views             Int               @default(0)
  helpfulYes        Int               @default(0)
  helpfulNo         Int               @default(0)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@index([category])
  @@fulltext([title, content]) // For search
}
```

---

## 6. API Contracts

### Get Available Tutorials

```
GET /api/v1/tutorials?category=getting-started&tier=PROFESSIONAL

Response:
{
  tutorials: [
    {
      id: "uuid",
      title: "Employee Creation",
      slug: "employee-creation",
      description: "Add employees to your company",
      category: "Getting Started",
      expectedMinutes: 3,
      difficulty: "Easy",
      tier: "FREE",
      videoUrl: "https://youtube.com/...",
      steps: 6,
      progress: { currentStep: 2, isCompleted: false } // If user started
    },
    ...
  ]
}
```

### Start / Continue Tutorial

```
POST /api/v1/tutorials/{tutorialId}/start
{ stepNumber: 1 }

Response:
{
  progress: {
    tutorialId,
    currentStep: 1,
    isCompleted: false,
    startedAt: "2026-07-24T..."
  },
  step: {
    stepNumber: 1,
    title: "Navigate to Employees",
    instruction: "Click the 'Employees' menu...",
    elementSelector: "[data-testid='nav-employees']",
    screenshotUrl: "...",
    videoUrl: null
  }
}
```

### Mark Step Complete

```
POST /api/v1/tutorials/{tutorialId}/steps/{stepNumber}/complete

Response:
{
  success: true,
  nextStep: 2,
  message: "Great! Click Next to continue."
}
```

### Search Knowledge Base

```
GET /api/v1/knowledge-base/search?q=payroll&limit=10

Response:
{
  articles: [
    {
      id: "uuid",
      slug: "what-is-payroll",
      title: "What is Payroll?",
      description: "Explanation of payroll and salary calculations",
      category: "Payroll",
      views: 450,
      helpfulPercent: 92,
      tags: ["payroll", "salary", "basic"]
    },
    ...
  ],
  total: 3
}
```

---

## 7. Frontend Pages & Components

```
New routes:
  /help                     - Tutorial hub (dropdown menu)
  /help/tutorials           - List all tutorials
  /help/tutorials/{slug}    - Tutorial player (overlay)
  /help/videos              - Video library
  /help/kb                  - Knowledge base search
  /help/kb/{slug}           - Article detail

New components:
  <TutorialModal>           - Step overlay
  <TutorialDropdown>        - Top nav menu
  <TutorialProgress>        - Step progress bar
  <KnowledgeBaseSearch>     - Search + filter
  <VideoEmbed>              - YouTube iframe wrapper
  <HighlightElement>        - CSS highlight + dim background
```

---

## 8. Security & Privacy

```
✓ Knowledge base: Public (no auth required for URLs)
✓ Tutorial progress: User-scoped (private)
✓ Video embeds: YouTube public videos (no sensitive data)
✓ Analytics: Aggregate only (no user PII)
✓ Content: Markdown sanitized (XSS protection)
✓ Tier gating: Server-side check (not client-side only)
```

---

## 9. Non-Functional Requirements

```
NFR-1: Performance
  - Tutorial list load: < 500ms
  - Tutorial step overlay: < 300ms
  - KB search: < 1s (with 50+ articles)
  - YouTube embed: auto-lazy-load

NFR-2: Accessibility
  - WCAG 2.1 AA compliance
  - Keyboard nav: Tab through steps, Enter to continue
  - Screen reader: Alt text on screenshots, video transcripts
  - Color: Not color-only for highlighting (use text + icon)

NFR-3: Mobile
  - Tutorials responsive (modal fits < 400px)
  - Video aspect ratio: 16:9 (responsive)
  - Touch-friendly buttons (min 44px)

NFR-4: Internationalization (future)
  - Content structure ready for i18n
  - No hardcoded text (all in DB/config)
```

---

## 10. Launch Plan

### Timeline

```
Pre-Launch (Aug 1-31):
  - [ ] Write 5 tutorials (steps, instructions)
  - [ ] Produce 5 videos (or source from YouTube)
  - [ ] Write 30 KB articles
  - [ ] Design tutorial UI/UX
  - [ ] Implement backend + frontend
  - [ ] QA test all tutorials end-to-end

Launch (Sep 1):
  - [ ] Deploy tutorial system
  - [ ] Enable for all tiers (basic tutorials free)
  - [ ] Announce in welcome email
  - [ ] Monitor: Usage analytics

Post-Launch (Sep-Oct):
  - [ ] Gather feedback (ratings)
  - [ ] Improve content based on feedback
  - [ ] Add 5 more tutorials (advanced)
  - [ ] Monitor: Completion rates, time spent
```

---

## Success Criteria

```
✅ FEATURE:
  - All 5 tutorials accessible + completable
  - Video embeds work (YouTube)
  - KB search functional
  - Tutorial progress saved per user
  - Tutorial completion tracked

✅ BUSINESS:
  - Tutorial usage: 50%+ of new users start tutorial (month 1)
  - Average completion: 80%+ (for started tutorials)
  - Support ticket reduction: -20% (tutorial-related)
  - Engagement: Avg 15 min/user in first week

✅ TECHNICAL:
  - Zero XSS vulnerabilities
  - Analytics: Accurate completion tracking
  - Performance: < 500ms tutorial list load
  - Mobile: 100% responsive, touch-friendly

✅ QUALITY:
  - All tutorials tested (QA)
  - Videos clear audio, proper lighting
  - No broken links in KB
  - Screenshots current (not outdated)
```

---

## Rollback Plan

```
If issues found:

Option 1: Disable tutorials (< 1 min)
  - Set environment variable: FEATURE_TUTORIALS=false
  - Hide tutorial menu
  - Users: No impact (just missing new feature)

Option 2: Revert content (< 5 min)
  - Restore previous version from Git
  - Restart API server
  - Tutorials show old content

Trigger: If > 10% of tutorial starts fail, or video CDN down
```

---

# SUMMARY: PRD v14.0 (Tutorial System)

```
Feature: In-App Tutorial & Onboarding
MVP Scope: 5 core tutorials + video library + knowledge base
Minimum Tier: FREE (basic) → STARTER+ (advanced)
Users: HR/MANAGER/EMPLOYEE (all roles supported)
Time to Implement: 3 weeks (Aug 1-31)
Launch: Sep 1
Success Metric: 50%+ new users complete tutorial within 1 week
```

**Status: Ready for SRS + SDD** ✅

---

*Last Updated: 24 Juli 2026 | Version: 14.0 (FINAL PRD) | Owner: Dozer*
