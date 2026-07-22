# dnPeople — SRS v11.1
## Landing Page Website - Functional Requirements

**Versi:** 11.1  
**Tanggal:** 22 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Acceptance criteria for each section

---

## FR-LP-001: Hero Section Functionality

**ID:** FR-LP-001  
**Priority:** P0 (Critical)  
**Owner:** Frontend Developer

### Requirement

```
Hero section MUST display immediately on page load.
CTA buttons MUST be clickable and functional.
Content MUST be responsive on all devices.

Acceptance Criteria:

AC-1.1: Hero Section Renders Correctly
  Given user opens dnpeople.id on desktop/mobile
  When page loads
  Then:
    - Hero section displays within 2 seconds
    - Headline visible: "HRIS Sederhana untuk SME Indonesia"
    - Subheading visible (2 lines max on desktop, 3 on mobile)
    - Hero image/screenshot displays (optimized, < 500KB)
    - All text readable (no text overlap)
    
Test case:
  T1.1: Visual test on desktop
    - Open https://dnpeople.id on Chrome/Firefox/Safari
    - ✓ Hero section visible immediately
    - ✓ Headline bold + large (48px desktop)
    - ✓ Hero image loaded + visible
    - ✓ No layout shift (CLS < 0.1)

AC-1.2: CTA Buttons Functional
  Given user sees hero section
  When user clicks "Mulai 2 Bulan Gratis" button
  Then:
    - Button changes appearance (slight visual feedback)
    - Page scrolls down to email form (or modal opens)
    - Email form focused (cursor in email input)
    
Test case:
  T1.2: CTA button click
    - Click "Mulai 2 Bulan Gratis" button
    - ✓ Button changes color/shadow (visual feedback)
    - ✓ Page scrolls to email form
    - ✓ Email input focused (cursor visible)
    - ✓ No JavaScript errors in console

AC-1.3: Secondary CTA ("Lihat Demo") Works
  Given user sees "Lihat Demo" link
  When user clicks link
  Then:
    - Page scrolls to demo video section smoothly
    - Video section highlighted/visible
    
Test case:
  T1.3: Demo link click
    - Click "Lihat Demo"
    - ✓ Smooth scroll to video section
    - ✓ Video playable immediately
    - ✓ Play button centered + visible

AC-1.4: Mobile Responsive
  Given user opens on mobile device (iPhone)
  When page loads
  Then:
    - Text stack vertically
    - Hero image scales down (doesn't overflow)
    - CTA button full width (90vw)
    - Font sizes appropriate for mobile (32px headline)
    - No horizontal scrolling
    
Test case:
  T1.4: Mobile view (iPhone 12, 390px width)
    - Open in mobile browser
    - ✓ No horizontal scroll
    - ✓ Text readable (> 16px)
    - ✓ Button full width + tappable (48px min height)
    - ✓ Image visible (not cut off)
```

---

## FR-LP-002: Features Section Grid

**ID:** FR-LP-002  
**Priority:** P0 (Critical)  
**Owner:** Frontend Developer

### Requirement

```
Features section MUST display 6 feature cards in grid.
Cards MUST be clickable/tappable.
Grid MUST be responsive (3 cols → 2 cols → 1 col).

Acceptance Criteria:

AC-2.1: Features Grid Renders
  Given user scrolls to features section
  When section loads
  Then:
    - All 6 feature cards display
    - Cards arranged in 3 columns (desktop), 2 (tablet), 1 (mobile)
    - Card spacing equal (no overlap)
    - Icons visible + colored correctly (brand color)
    
Test case:
  T2.1: Feature cards grid
    - Desktop (1200px): 3x2 grid
    - Tablet (768px): 2x3 grid
    - Mobile (390px): 1x6 grid
    - ✓ All cards visible (no overflow)
    - ✓ Equal spacing between cards

AC-2.2: Feature Card Hover/Tap Effect
  Given user hovers over (desktop) or taps (mobile) feature card
  When hover/tap occurs
  Then:
    - Card background changes slightly (shadow lift or color change)
    - Transition smooth (0.3s)
    - Cursor changes to pointer (desktop)
    
Test case:
  T2.2: Hover effect
    - Hover over card on desktop
    - ✓ Card moves up 2px (translate Y: -2px)
    - ✓ Shadow increases
    - ✓ Transition smooth (not instant)

AC-2.3: Icons + Text Display
  Given user views feature cards
  When cards render
  Then:
    - Each card has:
      [ ] Icon (64px, centered, brand color)
      [ ] Feature name (H3, bold, 24px desktop)
      [ ] Description (16px, gray text, 2-3 lines)
      [ ] All text aligned left (or center if icon-first layout)
    
Test case:
  T2.3: Feature card content
    - Each card has all elements
    - ✓ Icon loads + color correct (#1e3a8a or brand color)
    - ✓ Text aligned properly (no weird wrapping)
    - ✓ Read time: < 5 sec per card description
```

---

## FR-LP-003: Pricing Section with Comparison Table

**ID:** FR-LP-003  
**Priority:** P0 (Critical)  
**Owner:** Frontend Developer

### Requirement

```
Pricing section MUST display 5 pricing tiers.
Prices MUST be clear + correct.
Feature matrix MUST be obvious (what's included per tier).

Acceptance Criteria:

AC-3.1: Pricing Cards Display
  Given user scrolls to pricing section
  When section renders
  Then:
    - All 5 pricing cards visible
    - Cards display price prominently (large number, Rp notation)
    - Price per employee shown (e.g., "Rp 20K/emp/bulan")
    - Cards arranged horizontally (desktop), vertically (mobile)
    - Recommended card (PROFESSIONAL) has visual distinction (badge + different background)
    
Test case:
  T3.1: Pricing cards render
    - Desktop: 5 cards in row (scrollable or full width)
    - Mobile: Stack vertically
    - ✓ All prices visible + readable
    - ✓ "Paling Populer" badge on PROFESSIONAL card
    - ✓ Free card clearly marked

AC-3.2: Feature Matrix Visible
  Given user views pricing card
  When card renders
  Then:
    - Each card shows 6-8 features (bulleted list)
    - Features included: ✓ checkmark
    - Features NOT included: ✗ or gray out or omit
    - Feature text clear + readable
    
Test case:
  T3.2: Feature list per tier
    - FREE tier: fewer features listed (correctly missing payroll, attendance)
    - STARTER: payroll + attendance + leave (✓ visible)
    - PROFESSIONAL: more features (✓ recruitment, talent dev)
    - Click/scroll on mobile to see all features
    - ✓ All features read clearly

AC-3.3: CTA Button Per Tier
  Given user views pricing card
  When card loads
  Then:
    - Each card has CTA button (full width, 90% of card)
    - FREE tier: "Create Account" link (not button)
    - PAID tiers: "Start 2 Month Free Trial" button
    - ENTERPRISE: "Contact Sales" button
    - Button text clear + action obvious
    
Test case:
  T3.3: CTA button clicks
    - Click FREE card button → redirects to signup
    - Click STARTER button → opens signup modal or redirects
    - Click ENTERPRISE "Contact Sales" → opens contact form
    - ✓ All buttons functional (no 404s)

AC-3.4: Pricing Comparison Tooltip (Optional)
  Given user hovers over feature name (on desktop)
  When hover occurs
  Then:
    - Tooltip shows explanation (e.g., "What is BPJS?")
    - Tooltip appears near cursor (not obstructing view)
    - Tooltip disappears on mouse leave
    
Test case:
  T3.4: Hover tooltips (desktop)
    - Hover over feature name (e.g., "Multi-cabang")
    - ✓ Tooltip appears with explanation
    - ✓ No layout shift from tooltip
    - ✓ Tooltip readable (proper contrast)
```

---

## FR-LP-004: FAQ Accordion Section

**ID:** FR-LP-004  
**Priority:** P1 (High)  
**Owner:** Frontend Developer

### Requirement

```
FAQ section MUST have accordion-style Q&A.
Each FAQ item expandable/collapsible.
All questions visible (list not scrollable).

Acceptance Criteria:

AC-4.1: FAQ Items Display
  Given user scrolls to FAQ section
  When section renders
  Then:
    - All FAQ questions visible (not scrollable list)
    - Questions closed by default (answers hidden)
    - Icons/chevrons show expand/collapse state (+ for closed, - for open)
    
Test case:
  T4.1: FAQ accordion loads
    - Count FAQ items: 12-15 questions
    - ✓ All questions visible (no truncation)
    - ✓ All answers hidden initially
    - ✓ Chevron icons show state (+ closed, - open)

AC-4.2: Expand/Collapse Functionality
  Given user clicks on FAQ question
  When click occurs
  Then:
    - Answer smoothly expands (0.3s animation)
    - Chevron changes from + to -
    - Other answers remain closed (only 1 open at a time, or allow multiple)
    - Click again collapses answer
    - Smooth scroll to top of item (if below viewport)
    
Test case:
  T4.2: Click to expand
    - Click question 1
    - ✓ Answer appears (animated smoothly)
    - ✓ Chevron changes to -
    - ✓ Answer text readable
    - Click another question
    - ✓ Question 1 closes (or stays open if multiple allowed)
    - Click question 1 again
    - ✓ Answer disappears

AC-4.3: Answer Content Quality
  Given FAQ item expanded
  When user reads answer
  Then:
    - Answer is 1-3 sentences (concise)
    - Answer addresses the question directly
    - Links included if applicable (e.g., to pricing page, support email)
    - Answer text readable (16px, dark color)
    
Test case:
  T4.3: Read answer content
    - Expand all FAQ items
    - ✓ Each answer concise (< 3 sentences)
    - ✓ Each answer directly answers question
    - ✓ Text readable + no typos
    - ✓ Links work (test a few)

AC-4.4: Mobile Responsive
  Given user opens FAQ on mobile
  When section renders
  Then:
    - Questions full width (no horizontal scroll)
    - Answer text readable on mobile
    - Tap to expand (same as hover on desktop)
    - Expandable area large enough (48px min touch target)
    
Test case:
  T4.4: Mobile FAQ test
    - Open on iPhone (390px)
    - ✓ No horizontal scroll
    - ✓ Tap area large (48px+)
    - ✓ Text readable (16px+)
    - ✓ Answer expands smoothly
```

---

## FR-LP-005: Email Capture Form

**ID:** FR-LP-005  
**Priority:** P0 (Critical)  
**Owner:** Frontend Developer + Backend Integration

### Requirement

```
Email capture form MUST collect email + basic info.
Form submission MUST trigger email signup (Convertkit).
Form validation MUST work (no empty fields, valid email).

Acceptance Criteria:

AC-5.1: Form Fields Display
  Given user scrolls to email form (or modal opens)
  When form renders
  Then:
    - Email input field visible (focused, cursor ready)
    - Name input field visible
    - Company name input field visible
    - Employee count dropdown visible (5 options)
    - Submit button visible + prominent
    - All fields labeled clearly
    
Test case:
  T5.1: Form renders
    - ✓ All 4 input fields present
    - ✓ Email input focused (cursor blinking)
    - ✓ Labels above each field
    - ✓ Submit button large + contrasting color

AC-5.2: Form Validation
  Given user enters invalid data
  When user tries to submit
  Then:
    - Empty email: "Email is required" error shown
    - Invalid email: "Please enter valid email" error shown
    - Empty name: "Name is required" error shown
    - Empty company: "Company name is required" error shown
    - Employee count not selected: "Please select" error shown
    - Error messages clear + red colored
    
Test case:
  T5.2: Validation errors
    - Leave email blank, submit
    - ✓ Error message appears (red text)
    - ✓ Form NOT submitted
    - Enter "invalid-email", submit
    - ✓ Email format error shown
    - ✓ Form NOT submitted
    - Fill all fields correctly, submit
    - ✓ Form submits (no error)

AC-5.3: Form Submission to Convertkit
  Given user enters valid data + submits
  When submit button clicked
  Then:
    - Form data sent to Convertkit API
    - Email captured in Convertkit list (tag: "beta-signups")
    - Contact info stored (name, company, employee count)
    - Thank you message shown
    - Email confirmation sent to user
    - No error (HTTP 200)
    
Test case:
  T5.3: Submit form end-to-end
    - Fill form: email@example.com, John Doe, Acme Corp, 100 employees
    - Click submit
    - ✓ Loading spinner shows briefly
    - ✓ Thank you message appears ("Check your email...")
    - ✓ Email received in inbox (Convertkit confirmation)
    - ✓ Convertkit account shows new contact

AC-5.4: Thank You Message
  Given form submitted successfully
  When thank you message appears
  Then:
    - Message text: "Terima kasih! Check email Anda untuk instruksi selanjutnya."
    - Secondary message: "Tim kami akan hubungi dalam 24 jam."
    - Link to "Jadwalkan onboarding call" (Calendly)
    - Option to close/dismiss message
    
Test case:
  T5.4: Thank you page
    - See thank you message
    - ✓ Message text clear + encouraging
    - ✓ "Schedule call" link clickable
    - ✓ Link opens Calendly in new tab (or modal)

AC-5.5: Sticky Footer Form (Mobile)
  Given user on mobile view
  When scrolling page
  Then:
    - Email form appears as sticky footer (fixed bottom)
    - Form compact (not taking up > 1/3 of screen)
    - Can dismiss (X button)
    - User can still access rest of page
    
Test case:
  T5.5: Sticky footer on mobile
    - Open on iPhone
    - Scroll down
    - ✓ Sticky form appears at bottom
    - ✓ Doesn't cover critical content
    - ✓ Can dismiss form (X button)
    - ✓ Form reappears on scroll down
```

---

## FR-LP-006: Demo Video Section

**ID:** FR-LP-006  
**Priority:** P1 (High)  
**Owner:** Frontend Developer + Video Editor

### Requirement

```
Demo video MUST be embedded + playable.
Video MUST be optimized for web.
Play button visible + clickable.

Acceptance Criteria:

AC-6.1: Video Embed
  Given user scrolls to demo section
  When section renders
  Then:
    - Video player visible (16:9 aspect ratio)
    - Video thumbnail showing (from first frame or custom)
    - Play button centered + visible
    - Video title/caption visible below
    
Test case:
  T6.1: Video renders
    - ✓ Video player loads (no errors in console)
    - ✓ Thumbnail visible
    - ✓ Play button centered + 48px+ for mobile
    - ✓ No autoplay (silent auto-loop OK, but recommended manual play)

AC-6.2: Video Playback
  Given user clicks play button
  When click occurs
  Then:
    - Video starts playing (buffering < 2 sec)
    - Full-screen option available (on desktop + mobile)
    - Volume control visible
    - Progress bar shows current time
    - Video plays smoothly (no stuttering)
    
Test case:
  T6.2: Play video
    - Click play button
    - ✓ Video starts within 1-2 seconds
    - ✓ Audio plays (if audio present)
    - ✓ Video controls visible (play, pause, volume, timeline)
    - ✓ No stuttering or buffering pauses
    - ✓ Full-screen works (F key or button)

AC-6.3: Video Duration + Captions
  Given video plays
  When user watches
  Then:
    - Duration: 2-3 minutes (max)
    - Captions available (CC button or auto-generated)
    - Content: Login → dashboard → payroll → attendance → leave → report
    - Audio: Clear voiceover (Indonesian) or background music
    - No branding overlays (clean video)
    
Test case:
  T6.3: Watch video
    - Play video end-to-end
    - ✓ Duration < 3 minutes (not too long)
    - ✓ Content shows main flows
    - ✓ Captions available + readable
    - ✓ Audio clear + understandable

AC-6.4: Mobile Video Responsive
  Given user opens video on mobile
  When video loads
  Then:
    - Video fits screen width (full width, 90vw)
    - Player height scales proportionally (16:9 ratio)
    - Play button tappable (48px+)
    - Full-screen works on mobile
    
Test case:
  T6.4: Mobile video
    - Open on iPhone
    - ✓ Video full width (no overflow)
    - ✓ Aspect ratio correct (not squished)
    - ✓ Tap to play works
    - ✓ Full-screen portrait/landscape works
```

---

## FR-LP-007: Navigation & Header

**ID:** FR-LP-007  
**Priority:** P0 (Critical)  
**Owner:** Frontend Developer

### Requirement

```
Navigation MUST be accessible on all devices.
Logo clickable (returns to home).
Mobile menu functional (hamburger on small screens).

Acceptance Criteria:

AC-7.1: Desktop Navigation
  Given user on desktop (> 1024px)
  When page loads
  Then:
    - Header fixed at top (sticky)
    - Logo on left (clickable, links to home)
    - Nav items visible: Home, Fitur, Pricing, FAQ, Login, Signup
    - Dropdown on "Fitur" shows sub-items (Payroll, Attendance, Leave, Reports)
    - Signup button highlighted (CTA color)
    - No hamburger menu visible
    
Test case:
  T7.1: Desktop nav
    - Desktop view (1200px)
    - ✓ All nav items visible
    - ✓ Hover over "Fitur" → dropdown appears
    - ✓ Click logo → returns to home
    - ✓ Click "Signup" → scrolls to form or opens modal

AC-7.2: Mobile Navigation (Hamburger Menu)
  Given user on mobile (< 640px)
  When page loads
  Then:
    - Header compact (logo + hamburger icon)
    - Hamburger menu (3 lines icon) on right
    - Nav items NOT visible by default (hidden)
    - Click hamburger → menu overlay appears (full screen or slide)
    - Menu items: Home, Fitur, Pricing, FAQ, Login, Signup
    - Close button or click outside to dismiss menu
    
Test case:
  T7.2: Mobile nav
    - Mobile view (390px iPhone)
    - ✓ Hamburger icon visible + tappable (48px+)
    - Nav items hidden initially
    - Click hamburger
    - ✓ Menu overlay appears (full screen)
    - ✓ All nav items visible
    - ✓ Tap item → navigates + closes menu
    - ✓ Click X or outside → menu closes

AC-7.3: Logo Functionality
  Given user anywhere on page
  When user clicks logo
  Then:
    - Page scrolls to top (or navigates to home if separate page)
    - Logo links back to dnpeople.id/
    
Test case:
  T7.3: Logo click
    - Scroll down page
    - Click logo
    - ✓ Page scrolls to top smoothly
    - ✓ URL remains dnpeople.id (or redirects to home)

AC-7.4: Active Link Indicator
  Given user on a page
  When nav shows
  Then:
    - Current page nav item highlighted (bold or different color)
    - Home page: "Home" item highlighted
    - If nav links to sections: "Pricing" highlighted when on pricing section
    
Test case:
  T7.4: Active nav state
    - On homepage
    - ✓ "Home" nav item appears active (bold or color change)
    - Scroll to pricing section
    - ✓ "Pricing" nav item highlights (if section nav implemented)
```

---

## FR-LP-008: Footer & Legal Links

**ID:** FR-LP-008  
**Priority:** P2 (Medium)  
**Owner:** Frontend Developer

### Requirement

```
Footer MUST be visible at bottom of every page.
Links MUST work + lead to correct pages.
Legal pages accessible (privacy, terms, DPA).

Acceptance Criteria:

AC-8.1: Footer Display
  Given user scrolls to bottom of page
  When footer visible
  Then:
    - Footer dark background (navy or dark gray)
    - Footer content organized in columns:
      [ ] Company info (logo, tagline)
      [ ] Product links (Fitur, Pricing, Roadmap)
      [ ] Company links (About, Blog, Careers)
      [ ] Legal links (Privacy, Terms, DPA, Security)
    - Social icons (LinkedIn, Twitter if applicable)
    - Copyright text: "© 2026 PT. Dozer Napitupulu Technology"
    - Contact email: support@dnpeople.id
    
Test case:
  T8.1: Footer renders
    - Scroll to bottom
    - ✓ Footer visible (dark background)
    - ✓ All sections present (4 columns)
    - ✓ Links organized + readable
    - ✓ Contact email displayed

AC-8.2: Footer Links Functional
  Given user clicks on footer link
  When click occurs
  Then:
    - Link navigates to correct page (or external site)
    - Page/site loads successfully (no 404s)
    - External links open in new tab (target="_blank")
    - Internal links navigate within same tab
    
Test case:
  T8.2: Click footer links
    - Click "Privacy Policy" → navigates to /privacy (or page loads)
    - ✓ Page displays correctly (no errors)
    - ✓ Privacy content visible
    - Click "LinkedIn" → opens LinkedIn profile in new tab
    - ✓ URL correct
    - Click "Pricing" (in footer) → scrolls/navigates to pricing section
    - ✓ No 404 or error

AC-8.3: Legal Pages Exist
  Given user clicks legal link (Privacy, Terms, DPA)
  When page loads
  Then:
    - Privacy Policy page exists + displays content
    - Terms of Service page exists + displays content
    - Data Processing Agreement (DPA) page exists + displays content
    - All pages:
      [ ] Have footer (consistent)
      [ ] Have header/nav (back to home option)
      [ ] Content readable + formatted well
      [ ] No lorem ipsum placeholder text
    
Test case:
  T8.3: Legal pages
    - Open /privacy
    - ✓ Privacy policy visible + complete (> 500 words)
    - ✓ UU PDP referenced (if applicable)
    - ✓ No placeholder text
    - Open /terms
    - ✓ Terms of service visible + complete
    - Open /dpa
    - ✓ Data Processing Agreement visible + complete
```

---

## NFR-LP-001: Performance & Accessibility

```
NFR-1: Page Load Performance
  Target: First Contentful Paint < 1.5s
  Target: Largest Contentful Paint < 2.5s
  Target: Cumulative Layout Shift < 0.1
  Target: Lighthouse score > 90

Test cases:
  T-NFR-1.1: Lighthouse audit
    - Run Lighthouse on dnpeople.id
    - ✓ Score > 90 (all categories)
    - ✓ FCP < 1.5s
    - ✓ LCP < 2.5s
    - ✓ CLS < 0.1

NFR-2: Mobile Responsive
  Breakpoints tested: 320px, 375px (iPhone), 768px (iPad), 1024px (desktop)
  All pages must be responsive (no horizontal scroll, readable text)

Test cases:
  T-NFR-2.1: Responsive on all devices
    - 320px: ✓ readable, no scroll
    - 375px (iPhone): ✓ readable, all tappable
    - 768px (iPad): ✓ good layout
    - 1024px (desktop): ✓ full experience

NFR-3: Accessibility (WCAG 2.1 AA)
  Target: WAVE audit < 10 errors
  Keyboard navigation working
  Screen reader compatible (alt text for images)

Test cases:
  T-NFR-3.1: Accessibility audit
    - Run WAVE tool on dnpeople.id
    - ✓ < 10 errors
    - ✓ All images have alt text
    - ✓ Color contrast adequate (WCAG AA)
    - ✓ Tab navigation works (keyboard only)
    - ✓ Screen reader (NVDA or JAWS) can read content

NFR-4: SEO
  Title tag correct
  Meta description present
  Open Graph tags present
  Structured data (schema.org) present

Test cases:
  T-NFR-4.1: SEO check
    - View page source
    - ✓ <title>dnPeople — HRIS Sederhana...</title>
    - ✓ <meta name="description" content="Payroll, attendance...">
    - ✓ og:title, og:description, og:image present
    - ✓ JSON-LD schema present
```

---

## Launch Gate Checklist (Landing Page)

```
FUNCTIONALITY:
  [ ] Hero section renders + CTA buttons work
  [ ] Features section displays correctly (3 col grid)
  [ ] Pricing section shows all 5 tiers + CTA buttons
  [ ] FAQ accordion functional (expand/collapse)
  [ ] Email form submits to Convertkit successfully
  [ ] Demo video plays + is optimized
  [ ] Navigation works (desktop + mobile)
  [ ] Footer displays + all links functional
  [ ] Legal pages exist + readable

PERFORMANCE:
  [ ] Lighthouse score > 90
  [ ] Page load < 3 seconds (FCP < 1.5s)
  [ ] No layout shift (CLS < 0.1)
  [ ] Images optimized (WebP, < 500KB total)
  [ ] Mobile responsive (tested 320px, 375px, 768px, 1024px)

SEO & ANALYTICS:
  [ ] Meta tags correct (title, description, OG)
  [ ] Schema.org structured data present
  [ ] Google Analytics tracking active
  [ ] Conversion events tracked (form submit, CTA click, video play)
  [ ] Email capture form connected to Convertkit

CONTENT:
  [ ] No typos or grammar errors
  [ ] No fake metrics (honest copy)
  [ ] Pricing accurate + clear
  [ ] FAQ Q&A helpful + complete
  [ ] All links working (no 404s)
  [ ] Contact email correct (support@dnpeople.id)

SECURITY:
  [ ] HTTPS only (green lock visible)
  [ ] No API keys/secrets exposed in frontend code
  [ ] Form submissions secure (no sensitive data in URL)
  [ ] No third-party scripts loading insecure resources

ACCESSIBILITY:
  [ ] WAVE audit < 10 errors
  [ ] Color contrast adequate (WCAG AA)
  [ ] Images have alt text
  [ ] Keyboard navigation works
  [ ] Screen reader compatible

✅ ALL ITEMS GREEN? LAUNCH WEBSITE 🚀
```

---

*Last Updated: 22 Juli 2026 | Owner: Dozer | Status: Acceptance Criteria Complete*
