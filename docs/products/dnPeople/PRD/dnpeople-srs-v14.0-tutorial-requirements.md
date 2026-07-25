# dnPeople — SRS v14.0
## In-App Tutorial & Onboarding: Requirements & Acceptance Criteria

**Versi:** 14.0  
**Tanggal:** 24 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Ready for QA

> **Scope override — 25 July 2026:** Video tutorial, Video Library, and all FR/AC related exclusively to video are removed from v14.0. QA scope is interactive tutorials, progress/tier gating, Help navigation, and Knowledge Base.

---

## FR-TUTORIAL-001: Tutorial Discovery & Menu

**ID:** FR-TUTORIAL-001  
**Priority:** P1 (High)  
**Owner:** Frontend Engineer

### Requirement

```
Users can discover tutorials via dropdown menu in top navigation.
Menu shows: Getting Started tutorials, Video Library, Knowledge Base, Get Help.
Tutorials available based on user tier (tier gating).
```

### Acceptance Criteria

```
AC-1.1: Tutorial dropdown appears in top nav
  Given: User logged in (any tier, any company)
  When: Viewing any page with navigation
  Then:
    - Top right nav has "Help" or "?" icon
    - Click → Dropdown menu appears
    - Menu shows: "Getting Started" | "Video Library" | "Knowledge Base" | "Get Help"
    
Test case:
  T1.1: Dropdown visible on dashboard
    - Login as any user
    - GET /dashboard
    - ✓ See Help icon in top nav
    - Click icon
    - ✓ Dropdown menu visible with 4 sections

AC-1.2: Getting Started shows available tutorials
  Given: Dropdown open, clicking "Getting Started"
  When: View tutorial list
  Then:
    - Shows: Employee Creation, Payroll Setup, Attendance, Leave, Performance
    - Each shows: Title, Duration (3 min, 5 min, etc), Difficulty (Easy/Medium)
    - Sort: By tier minimum requirement, then by difficulty
    - Button: "Start Tutorial" per item
    
Test case:
  T1.2: List all tutorials
    - Click "Getting Started" in dropdown
    - ✓ See 5 tutorials (or more)
    - ✓ Employee Creation shows "3 min, Easy"
    - ✓ Click "Start Tutorial" for any item

AC-1.3: Tier gating on tutorials
  Given: Different user tiers
  When: Viewing tutorial list
  Then:
    - FREE user sees: Employee Creation, Attendance, Leave (basic only)
    - STARTER user sees: + Payroll Setup
    - PROFESSIONAL sees: + Performance Review
    - Locked tutorials show: "Requires STARTER" badge
    
Test case:
  T1.3: Tier filtering
    - Login as FREE tier user
    - View Getting Started
    - ✓ "Payroll Setup" shows "Requires STARTER" (locked)
    - Login as STARTER user
    - ✓ "Payroll Setup" now available (clickable)

AC-1.4: Resume in-progress tutorial
  Given: User started tutorial before, then logged out
  When: Opening Help dropdown again
  Then:
    - In-progress tutorial shows progress indicator: "Step 2 of 6"
    - Button: "Resume Tutorial" (instead of "Start Tutorial")
    - Can view completed tutorials (checkmark icon)
    
Test case:
  T1.4: Resume progress
    - Start tutorial, complete step 1
    - Close browser, logout
    - Login again
    - ✓ Tutorial shows "Step 2 of 6" and "Resume" button
```

---

## FR-TUTORIAL-002: Step-By-Step Walkthrough

**ID:** FR-TUTORIAL-002  
**Priority:** P0 (Critical)  
**Owner:** Frontend Engineer

### Requirement

```
User clicks "Start Tutorial" → Interactive modal opens.
Modal shows: Step title, instructions, screenshot/video, progress bar.
User follows instructions, then clicks "Next" to move to next step.
Page elements can be highlighted to guide user.
```

### Acceptance Criteria

```
AC-2.1: Tutorial modal opens
  Given: User clicks "Start Tutorial" (e.g., Employee Creation)
  When: Modal loads
  Then:
    - Modal shows:
      * Title: "Employee Creation"
      * Progress: "Step 1 of 6"
      * Timer: "3 min remaining"
      * Content: Step title + instruction text
      * Screenshot: How-to image (PNG/JPG)
      * Buttons: [Skip] [Next: Step 2]
    - Background dimmed
    - Close button [X] on modal
    
Test case:
  T2.1: Modal opens
    - Click "Start Tutorial"
    - ✓ Modal visible, not full-page
    - ✓ Step 1 content displays
    - ✓ Progress bar shows 1/6

AC-2.2: Element highlighting
  Given: Tutorial step mentions element (e.g., "Employees button")
  When: Step displayed
  Then:
    - Button/element pulsates (animation)
    - Background slightly dimmed (focus user attention)
    - Tooltip near element: "Click here"
    - If user clicks element: Modal doesn't close, but shows success
    
Test case:
  T2.2: Highlight element
    - Step 1: "Click Employees in left sidebar"
    - ✓ Left nav "Employees" link highlighted/pulsating
    - ✓ Tooltip visible: "Click here to continue"
    - User clicks Employees link
    - ✓ Modal shows: "Good! Now fill the form..."

AC-2.3: Video embed in step
  Given: Tutorial step includes video
  When: Step displayed
  Then:
    - YouTube iframe embedded below instructions
    - Video title + duration shown
    - User can play inside modal (or expand full-screen)
    - Video auto-paused if modal closed
    
Test case:
  T2.3: Video in tutorial
    - Payroll Setup, Step 2: "Watch payroll overview"
    - ✓ YouTube video embedded in modal
    - ✓ "Play" button visible
    - Click play
    - ✓ Video plays inside modal
    - Pause/resume works
    - Click [Next] → Video paused, user moves to step 3

AC-2.4: Form hints appear during tutorial
  Given: Tutorial for form-filling (Employee Creation)
  When: Step instructs to fill field
  Then:
    - Actual form field shows tooltip/hint
    - Hint explains: "What goes here? Examples: ..."
    - Validation: If user enters wrong format, hint shows: "Try [example]"
    - Hint disappears after user fills (or moves to next step)
    
Test case:
  T2.4: Form hints
    - Step 3: "Enter employee name"
    - Name input field highlights + shows hint: "Full name, e.g., 'John Doe'"
    - User types "John"
    - ✓ Hint updates: "Try 'John Doe' (first + last)"
    - User types "John Doe"
    - ✓ Hint disappears (correct format)
    - Click [Next]
    - ✓ Move to next step

AC-2.5: Progress bar & timer
  Given: Tutorial in progress
  When: Viewing modal
  Then:
    - Progress bar shows: █████░░░░ (5 of 10 steps, for example)
    - Timer shows: "5 min remaining" (or "30 sec remaining")
    - Timer counts down in real-time
    - Can skip tutorial anytime (button: [Skip Tutorial])
    
Test case:
  T2.5: Progress tracking
    - Start tutorial (6 steps, 15 min total)
    - Step 1: "15 min remaining"
    - After 5 min: "10 min remaining"
    - Step 4: Progress bar 4/6
    - ✓ All display correctly

AC-2.6: Tutorial completion
  Given: User completes last step
  When: Finishing step 6
  Then:
    - Modal shows: "Congratulations! You completed Employee Creation!"
    - Shows checkmark ✓
    - Suggests: "Next: Learn about Payroll" (related tutorial)
    - Button: [Close] or [Next Tutorial]
    
Test case:
  T2.6: Completion screen
    - Complete step 6 of Employee Creation
    - ✓ Congratulations screen shown
    - ✓ Completion tracked in DB (TutorialProgress.isCompleted = true)
    - Click [Close]
    - ✓ Modal closes
    - Help menu shows: Employee Creation ✓ (checkmark)
```

---

## FR-TUTORIAL-003: Knowledge Base Search

**ID:** FR-TUTORIAL-003  
**Priority:** P1 (High)  
**Owner:** Frontend Engineer + Backend Engineer

### Requirement

```
Users can search knowledge base articles via search bar.
Search queries matched against article titles + content.
Results show: Title, category, excerpt, helpful rating.
Articles linked to related tutorials.
```

### Acceptance Criteria

```
AC-3.1: Search bar appears in Help menu
  Given: User opens Help dropdown
  When: Viewing "Knowledge Base" section
  Then:
    - Search input visible: "Search help articles..."
    - Placeholder text helpful
    - Real-time search (results update as user types)
    
Test case:
  T3.1: Search input visible
    - Click Help → Knowledge Base
    - ✓ Search bar visible
    - Type "payroll"
    - ✓ Results appear (< 1 sec)

AC-3.2: Search results
  Given: User searches "payroll"
  When: Results displayed
  Then:
    - List shows: Title | Category | Excerpt | Rating
    - Example result:
      "What is Payroll?" | Payroll | "Payroll is the process of..."
      ⭐⭐⭐⭐⭐ (92% helpful, 456 views)
    - Results sorted: By relevance (title match first), then by helpfulness
    - Limit: Top 10 results (paginate if more)
    
Test case:
  T3.2: Search results
    - Search "payroll"
    - ✓ See 5-10 results
    - ✓ Each shows title, category, excerpt
    - ✓ Rating visible (stars + %)

AC-3.3: Click article to view detail
  Given: Article in results
  When: User clicks title
  Then:
    - Full article opens in new section (or modal)
    - Shows: Title, Content (markdown rendered), Category, Tags
    - Content includes: Screenshots, embedded videos (if any)
    - Bottom: "Was this helpful? [Yes] [No]"
    - Sidebar: Related articles, Related tutorials
    
Test case:
  T3.3: Article detail
    - Search "payroll"
    - Click "What is Payroll?"
    - ✓ Full article loads
    - ✓ Content readable (markdown rendered, images shown)
    - ✓ "Was this helpful?" buttons visible
    - Click "Yes"
    - ✓ Vote recorded (helpfulYes count increments)

AC-3.4: Category filter
  Given: Knowledge base search page
  When: User filters by category
  Then:
    - Filter options: All | Payroll | Attendance | Leave | etc
    - Selecting category filters search results
    - Can combine: Search query + category filter
    
Test case:
  T3.4: Category filtering
    - Search "salary"
    - Results: 10 articles (from all categories)
    - Click filter "Payroll"
    - ✓ Results filtered to only Payroll category
    - ✓ Count shows "3 results" (example)

AC-3.5: Related content
  Given: Article open
  When: Viewing article detail
  Then:
    - "Related Articles" sidebar shows: 2-3 similar articles
    - "Related Tutorial" shows: If tutorial covers this topic, link to it
    - Clicking related link loads that content
    
Test case:
  T3.5: Related content
    - Open article "What is Payroll?"
    - Sidebar shows: "Related Articles" → "How to run payroll", "Salary calculation"
    - Sidebar shows: "Related Tutorial" → "Payroll Setup (15 min)"
    - Click tutorial link
    - ✓ Help menu opens, Payroll Setup tutorial ready to start
```

---

## FR-TUTORIAL-004: Video Library

**ID:** FR-TUTORIAL-004  
**Priority:** P1 (High)  
**Owner:** Frontend Engineer

### Requirement

```
Users can browse video library (YouTube playlist embeds).
Videos organized by category.
Each video shows: Title, duration, view count, description.
Videos can be watched inside app or externally.
```

### Acceptance Criteria

```
AC-4.1: Video library page
  Given: User clicks "Video Library" in Help menu
  When: Page loads
  Then:
    - Grid of video thumbnails (4 per row, responsive)
    - Each shows: Thumbnail | Title | Duration (e.g., "5:23") | View count
    - Filter by category: All | Payroll | Attendance | Mobile | etc
    - Sorting: By date (newest first) or by popularity
    
Test case:
  T4.1: Video grid
    - Click Help → Video Library
    - ✓ See 20+ video thumbnails
    - ✓ Each shows thumbnail, title, duration
    - ✓ Grid responsive (4 col on desktop, 2 on mobile)

AC-4.2: Play video
  Given: User clicks video thumbnail
  When: Video opens
  Then:
    - YouTube iframe embedded in modal/overlay
    - Video title + description above player
    - Play button visible (YouTube player)
    - Can expand full-screen
    - Auto-pause if modal closed
    
Test case:
  T4.2: Play video
    - Click "Payroll Basics (5:23)"
    - ✓ YouTube player opens
    - Click play
    - ✓ Video plays (sound + video)
    - Click fullscreen
    - ✓ Fullscreen mode works
    - Close modal
    - ✓ Video pauses

AC-4.3: Video description & metadata
  Given: Video modal open
  When: Viewing video
  Then:
    - Shows: Title, Duration, Upload date, View count
    - Shows: Full description (from YouTube or DB)
    - Related tutorials (if any)
    - "Open in YouTube" link (watch original)
    
Test case:
  T4.3: Video metadata
    - Open video
    - ✓ See title, "5:23", "1.2K views", upload date
    - ✓ Description visible below player
    - ✓ "Watch on YouTube" link clickable

AC-4.4: Video search
  Given: Video library page
  When: User searches within videos
  Then:
    - Search bar filters videos by title/description
    - Results update in real-time
    - Shows matching videos only
    
Test case:
  T4.4: Video search
    - Type "attendance" in video library search
    - ✓ Results show only attendance-related videos (3-5 videos)
    - Type "payroll"
    - ✓ Results update to payroll videos
```

---

## FR-TUTORIAL-005: Progress Tracking & Analytics

**ID:** FR-TUTORIAL-005  
**Priority:** P2 (Medium)  
**Owner:** Backend Engineer

### Requirement

```
System tracks: Which tutorials user started, completed, time spent.
Analytics dashboard shows: Usage, completion rates, helpful ratings.
Data used to improve content + personalize recommendations.
```

### Acceptance Criteria

```
AC-5.1: Tutorial progress saved
  Given: User starts tutorial and completes some steps
  When: Closing app or navigating away
  Then:
    - Progress saved to TutorialProgress table
    - currentStep updated
    - lastActivityAt updated
    - If all steps done: isCompleted = true, completedAt = now
    
Test case:
  T5.1: Progress persistence
    - Start Employee Creation
    - Complete steps 1-3
    - Close browser
    - Login again
    - Help → Getting Started → Employee Creation
    - ✓ Shows "Step 4 of 6" (progress saved)
    - ✓ No need to re-do steps 1-3

AC-5.2: Tutorial completion recorded
  Given: User finishes all steps
  When: Clicking [Next] on last step
  Then:
    - TutorialProgress.isCompleted = true
    - TutorialProgress.completedAt = now
    - Tutorial shows checkmark ✓ in list
    - Completion event sent to analytics
    
Test case:
  T5.2: Completion tracking
    - Complete all 6 steps of Employee Creation
    - ✓ Completion screen shows
    - Help menu shows: Employee Creation ✓ (checkmark)
    - Analytics (Datadog/GA4): "tutorial_completed" event fired

AC-5.3: Helpful rating
  Given: Article or tutorial viewed
  When: User sees "Was this helpful? [Yes] [No]"
  Then:
    - Click Yes/No → Vote recorded
    - For articles: KnowledgeBaseArticle.helpfulYes / helpfulNo incremented
    - For tutorials: Can add optional comment
    - Rating affects search ranking (more helpful = higher)
    
Test case:
  T5.3: Helpful rating
    - View KB article "How to create payroll?"
    - Click [Yes]
    - ✓ Vote recorded
    - ✓ Helpful % updates (e.g., "92% helpful")
    - Other users see updated rating

AC-5.4: Time spent tracking
  Given: User goes through tutorial
  When: Tutorial in progress
  Then:
    - Backend tracks: Start time, steps completed, end time
    - totalTimeSpent calculated: completedAt - startedAt
    - Used for: Analytics, tutorial difficulty rating
    - Example: Tutorial says "3 min", but average user: "4 min 30 sec"
    
Test case:
  T5.4: Time tracking
    - Start tutorial at 10:00:00
    - Complete at 10:05:30
    - ✓ TutorialProgress.totalTimeSpent = 330 (seconds)
    - Analytics: "Tutorial completed in 5 min 30 sec"

AC-5.5: Analytics dashboard (internal)
  Given: HR/Admin/Support team
  When: Viewing analytics
  Then:
    - Can see: Total tutorial views, completions, completion rate
    - By tutorial: "Employee Creation: 45 views, 32 completions (71%)"
    - By module: "Payroll: 120 views, 85 completions"
    - Helpful articles: "What is Payroll? (96% helpful)"
    - Unhelpful articles: Alert if article < 50% helpful
    
Test case:
  T5.5: Analytics visibility
    - Backend endpoint: GET /api/v1/admin/analytics/tutorials
    - ✓ Returns: { tutorial_stats: [...], article_stats: [...] }
    - Shows completion rates, ratings, usage trends
```

---

## FR-TUTORIAL-006: Tier Gating

**ID:** FR-TUTORIAL-006  
**Priority:** P1 (High)  
**Owner:** Backend Engineer

### Requirement

```
Some tutorials only available for certain tiers (Tier gating).
FREE users see: Basic tutorials (Employee, Attendance, Leave).
STARTER+ see: Advanced (Payroll, Performance).
Locked tutorials show: "Requires STARTER" badge + upgrade CTA.
```

### Acceptance Criteria

```
AC-6.1: Tutorial tier requirement
  Given: Tutorial has minTier = "STARTER"
  When: FREE user views tutorials
  Then:
    - Tutorial shows: Badge "Requires STARTER"
    - Button: "Start Tutorial" disabled (grayed out)
    - Hover: Tooltip "Upgrade to STARTER to access"
    - Click badge → Upgrade page
    
Test case:
  T6.1: Tier lock display
    - Login as FREE tier user
    - Help → Getting Started
    - ✓ "Payroll Setup" shows "Requires STARTER" badge
    - "Start Tutorial" button disabled
    - Click badge
    - ✓ Redirect to /upgrade?feature=tutorial_payroll

AC-6.2: Server-side tier check
  Given: STARTER user tries to access Payroll tutorial
  When: Clicking "Start Tutorial"
  Then:
    - API: POST /api/v1/tutorials/{id}/start
    - Backend checks: Subscription.tier >= Tutorial.minTier
    - If true: Tutorial progress created, allowed
    - If false: Returns 403 "Feature requires higher tier"
    
Test case:
  T6.2: Backend tier gate
    - FREE user: POST /api/v1/tutorials/payroll-setup/start
    - ✓ API returns 403 (forbidden)
    - STARTER user: POST /api/v1/tutorials/payroll-setup/start
    - ✓ API returns 200 (allowed)

AC-6.3: Tier matrix
  Given: Different user tiers
  When: Viewing tutorial list
  Then:
    Tier      | Available Tutorials
    ──────────┼────────────────────────────────────
    FREE      | Employee, Attendance, Leave
    STARTER   | + Payroll Setup
    PROF      | + Performance Review
    BUSINESS  | + Advanced workflows
    
Test case:
  T6.3: Tier availability
    - FREE: 3 tutorials available
    - STARTER: 4 tutorials available
    - PROFESSIONAL: 5 tutorials available
    - ✓ Each tier shows correct count
```

---

## Launch Gate Checklist

```
CONTENT:
  [ ] 5 tutorials fully written (steps, instructions, screenshots)
  [ ] 5 tutorial videos produced/sourced (YouTube)
  [ ] 30+ KB articles written + published
  [ ] All media (screenshots, videos) current + error-free

FEATURES:
  [ ] Tutorial dropdown accessible in top nav
  [ ] Step-by-step walkthrough works (all 5 tutorials)
  [ ] Element highlighting functional (no JS errors)
  [ ] Video embeds play (YouTube)
  [ ] Knowledge base search functional (< 1s response)
  [ ] Video library grid responsive
  [ ] Tier gating enforced (backend + frontend)
  [ ] Tutorial progress saved per user
  [ ] Completion tracking accurate

UI/UX:
  [ ] Modal responsive (mobile ≤ 400px width)
  [ ] Accessibility: WCAG 2.1 AA (tested)
  [ ] Keyboard nav: Can tab through steps, Enter to continue
  [ ] Dark mode compatible (if supported)

TESTING:
  [ ] Unit: Tier gating logic
  [ ] Integration: Tutorial start → save progress → resume
  [ ] E2E: Complete full tutorial flow
  [ ] Performance: Search < 1s (50 articles), video load < 2s
  [ ] Browser: Chrome, Firefox, Safari (desktop + mobile)
  [ ] Video: Play, pause, fullscreen all work

ANALYTICS:
  [ ] Tutorial views tracked
  [ ] Tutorial completions tracked
  [ ] Time spent tracked
  [ ] Helpful votes tracked
  [ ] Dashboard shows data accurately

DEPLOYMENT:
  [ ] Database migrations run (Tutorial + KnowledgeBase tables)
  [ ] API endpoints working (/api/v1/tutorials/*, /api/v1/kb/*)
  [ ] Frontend pages deployed (/help/tutorials, /help/kb, etc)
  [ ] Help menu visible to all users

✅ ALL GREEN? DEPLOY v14.0 🚀
```

---

*Last Updated: 24 Juli 2026 | Version: 14.0 (FINAL SRS) | Owner: Dozer*
