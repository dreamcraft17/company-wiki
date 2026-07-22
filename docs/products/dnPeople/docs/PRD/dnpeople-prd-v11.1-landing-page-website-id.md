# dnPeople — PRD v11.1
## Landing Page Website (dnpeople.id)

**Versi:** 11.1  
**Owner:** Dozer (CEO + Tech Lead)  
**Tanggal:** 22 Juli 2026  
**Target:** Website LIVE by 28 Juli 2026 (6 hari)  
**Status:** Design + messaging specifications

---

## Executive Summary

**Tujuan Landing Page:**
- Menjelaskan apa itu dnPeople dalam 30 detik
- Show pricing yang transparan (5 tiers)
- Answer common questions (FAQ)
- Drive email capture → beta signup
- Mobile-first experience
- No fake metrics (jujur positioning)

**Messaging Framework:**
```
Headline: "HRIS yang simple untuk SME Indonesia"
Subheading: "Payroll, attendance, leave — dalam satu platform"
CTA: "Mulai 2 Bulan Gratis" atau "Daftar Beta"
```

**Target Audience:**
- HR Managers (50-300 employees)
- Finance Teams
- Startup founders/CEOs
- Solo entrepreneurs

**Success Criteria:**
- ✅ Load time < 3 seconds
- ✅ Mobile responsive (100% on iPhone)
- ✅ Email capture form working (Convertkit)
- ✅ 100+ beta signups (target untuk launch)
- ✅ Lighthouse score > 90
- ✅ No fake metrics on page

---

## Page Structure & Content

### 1. Header / Navigation

```
Logo: dnPeople (left side, clickable to home)

Nav Items (right side, desktop) — stack on mobile:
  - Home
  - Fitur (dropdown → Payroll, Attendance, Leave, Reports)
  - Pricing
  - FAQ
  - Login (button)
  - Signup (CTA button, highlighted)

Mobile: Hamburger menu (3 lines icon)
```

**Design:**
```
Background: White (#FFFFFF)
Logo color: Brand color (navy blue #1e3a8a or similar)
Nav text: Dark gray (#374151)
CTA button: Contrast color (orange #f97316 or bright blue #0ea5e9)
Hover: Subtle shadow or background change
```

---

### 2. Hero Section

**Layout:** 50/50 split (left: text, right: image/screenshot) — stack on mobile

**Left Side (Text):**
```
Headline (H1):
  "HRIS Sederhana untuk SME Indonesia"
  
Subheading:
  "Kelola payroll, attendance, dan leave dalam satu dashboard.
   Tanpa setup rumit. Tanpa hidden cost."

Key benefits (3 bullets):
  ✓ Setup 15 menit — import karyawan dan mulai
  ✓ BPJS + PPh 21 — compliance built-in
  ✓ Support lokal — team yang paham HR Indonesia

CTA Button (PRIMARY):
  Text: "Mulai 2 Bulan Gratis" (or "Daftar Beta")
  Color: Bright contrast (orange or blue)
  Action: Scroll to email form or open modal

Secondary CTA:
  Text: "Lihat Demo" 
  Color: Link style (underline + dark color)
  Action: Jump to demo video section
```

**Right Side (Visual):**
```
Option 1: Product screenshot (dashboard view)
  - Show: Payroll page, employee list, or dashboard
  - Style: Framed (subtle shadow, clean border)
  - Alt text: "dnPeople dashboard showing payroll overview"

Option 2: Illustration (if screenshot not ready)
  - Theme: People, HR, teamwork
  - Style: Minimal, flat design (matches brand)
  - Colors: Use brand colors (navy, orange, white)

Option 3: Video loop (10-15 sec product walkthrough)
  - Silent auto-play
  - Shows: Login → dashboard → payroll flow
```

**Mobile View:**
```
Stack vertically:
  1. Hero text (full width)
  2. CTA button (full width)
  3. Screenshot/visual (full width)
  4. Secondary CTA
```

**Design Details:**
```
Font: Hero heading 48px (desktop), 32px (mobile), bold
Subheading: 20px, regular weight
Button padding: 16px 32px (desktop), 14px 28px (mobile)
Line height: 1.6 (readable)
Max width: 80 characters (readability)
```

---

### 3. Features Section (6 Features Grid)

**Layout:** 3 columns (desktop), 1 column (mobile)

**Each Feature Card:**
```
Layout:
  [ICON]
  Feature Name (H3)
  Description (2-3 sentences)
  Learn more link (if detailed page exists)

Feature 1: Payroll Otomatis
  Icon: Money bag / calculator
  Description:
    "Hitung gaji, BPJS, PPh 21 otomatis. Slip gaji
     digital untuk setiap karyawan. Laporan pajak
     siap audit."
  
Feature 2: Attendance Fleksibel
  Icon: Clock / check-in
  Description:
    "Absensi manual, GPS, QR, atau WiFi. Koreksi
     absensi dengan bukti. Laporan kehadiran real-time."
  
Feature 3: Leave Management
  Icon: Calendar / vacation
  Description:
    "Jatah cuti otomatis. Approval workflow. Integrasi
     dengan payroll. History & carry-forward tracking."
  
Feature 4: Multi-tenant & SSO
  Icon: Building / network
  Description:
    "Multi-cabang dalam satu platform. Login SSO
     (Google, Microsoft, SAML). Custom domain
     untuk enterprise."
  
Feature 5: Reporting & Analytics
  Icon: Chart / bar graph
  Description:
    "Laporan attendance, payroll, leave. Export Excel/PDF.
     Turnover risk, payroll trends. Custom reports builder."
  
Feature 6: API & Integrations
  Icon: Plug / integration
  Description:
    "API documentation + SDK. Webhook untuk automation.
     Partner ecosystem (bank, accounting, HRIS tools)."
```

**Design:**
```
Card background: White or light gray (#f9fafb)
Icon size: 48px or 64px
Icon color: Brand primary (navy or orange)
Border: Subtle (1px light gray)
Hover effect: Slight shadow lift (translate Y: -2px, box-shadow increase)
Spacing: 24px gap between cards
```

---

### 4. Pricing Section

**Title (H2):**
```
"Transparent Pricing"
Subtitle: "Pilih plan sesuai kebutuhan. Bisa upgrade kapan saja."
```

**Pricing Table/Cards (5 Tiers):**

```
┌─────────────────────────────────────────────────────────────────┐
│ FREE           │ STARTER      │ PROFESSIONAL  │ BUSINESS        │
│ s/d 50 emp     │ 1-50 emp     │ 51-300 emp    │ 301+ emp        │
├─────────────────────────────────────────────────────────────────┤
│ Rp 0           │ Rp 20K/emp   │ Rp 25K/emp    │ Rp 20K/emp      │
│               │ /bulan       │ /bulan        │ /bulan (volume) │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Dashboard    │ ✓ Payroll    │ ✓ Payroll     │ ✓ Multi-cabang  │
│ ✓ Org setup    │ ✓ Attendance │ ✓ Recruitment │ ✓ Unlimited API │
│ ✗ Payroll      │ ✓ Leave      │ ✓ Performance │ ✓ Custom domain │
│ ✗ Attendance   │ ✓ Basic      │ ✓ Training    │ ✓ White-label   │
│                │   reports    │ ✓ Talent dev  │ ✓ Dedicated AC  │
│                │              │ ✓ Advanced    │                 │
│                │              │   reports     │                 │
│ → Start Free   │ → $20/mo     │ → $25/mo      │ → Hubungi Sales │
└─────────────────────────────────────────────────────────────────┘

ENTERPRISE (Custom):
  "Need more? Contact us for custom solution"
  - SSO + SCIM
  - White-label
  - Dedicated account manager
  - SLA guarantee
  - Custom integrations
  → Contact Sales button
```

**Pricing Card Style:**
```
Layout: 
  Plan name (H3)
  Employee range (subtitle)
  Price (large bold number)
  "per employee / per bulan"
  Feature list (bullets, 6-8 items)
  Tier-specific CTA:
    - FREE: "Create Account" link
    - Others: "Start 2 Month Free Trial" button
    - ENTERPRISE: "Contact Sales" button

Recommended: Highlight PROFESSIONAL (middle tier) with badge
Badge text: "Paling Populer" (Most Popular)
Highlight: Slightly different background (light blue or gold)
```

**Design:**
```
Card width: Same height for all (150-200px width min)
Background: Free=white, others=light color gradient or solid
Price font: 32px, bold, color: navy or orange
Feature bullets: 14px, dark gray
CTA button: Full width (90% of card), padding 12px
Border: Light (1px), but Recommended has thicker/colored border
Mobile: Stack cards 1 per row (full width)
```

**FAQ inside Pricing:**
```
"Punya pertanyaan tentang pricing?"

Q: Berapa biaya setup?
A: Tidak ada. Setup gratis, tinggal import data + training.

Q: Bisa upgrade/downgrade kapan saja?
A: Ya, bisa. Charge pro-rata untuk perubahan di tengah bulan.

Q: Ada trial gratis?
A: Ya, 2 bulan gratis untuk beta customers.

Q: Accepted payment methods?
A: Xendit (transfer bank, e-wallet, kartu kredit).
```

---

### 5. How It Works Section (3-Step Flow)

**Title (H2):**
```
"Mulai Dalam 3 Langkah"
```

**Step 1: Register**
```
Icon: User + plus sign
Heading: "1. Daftar & Buat Perusahaan"
Description:
  "Isi data perusahaan (nama, industri, jumlah karyawan).
   Buat akun admin. Gratis, tanpa kartu kredit."
CTA: "Start Free"
```

**Step 2: Import & Setup**
```
Icon: Upload / document
Heading: "2. Import Data & Setup"
Description:
  "Upload employee data (CSV atau manual entry).
   Setup structure (departemen, posisi, lokasi).
   Konfigurasi payroll (gaji, allowance, BPJS)."
Estimated time: "~2 jam" atau "15 menit dengan bantuan"
```

**Step 3: Launch**
```
Icon: Rocket / launch
Heading: "3. Invite Karyawan & Go-live"
Description:
  "Invite karyawan untuk login. Mulai tracking attendance.
   Jalankan payroll pertama. Kami siap support."
Support: "Free onboarding call included"
```

**Design:**
```
Layout: Horizontal flow (desktop), vertical stack (mobile)
Connector: Arrow between steps (desktop only)
Icon size: 64px
Icon color: Brand primary + light background circle
Step number: Large, bold, positioned top-left
Card padding: 24px
```

---

### 6. Demo Video Section

**Title (H2):**
```
"Lihat Produk Kami di Aksi"
```

**Video:**
```
Format: MP4 or WebM (optimized for web)
Duration: 2-3 minutes (max)
Content:
  - Login flow
  - Dashboard overview
  - Payroll run walkthrough
  - Attendance quick entry
  - Leave request + approval
  - Report generation & export
  
Audio: Background music + voiceover (Indonesian)
Captions: Yes (for accessibility + conversion)

Thumbnail: Stills from video or custom design
Play button overlay: Centered, semi-transparent

Platform: YouTube embed atau Vimeo (self-hosted option)
```

**Fallback (if video not ready):**
```
Use 3-5 screenshots carousel (auto-advance, manual arrows)
OR embed GIF showing product flow (30-40 sec loop)
```

**Design:**
```
Video container: Aspect ratio 16:9
Max width: 800px (desktop), full width (mobile, with padding)
Border: Subtle shadow (box-shadow: 0 4px 12px rgba(...))
Margin: 40px top/bottom
```

---

### 7. Social Proof / Testimonials Section

**Title (H2):**
```
"Dipercaya oleh Perusahaan di Indonesia"
```

**Format (Beta Launch - Limited):**
```
Since we're just launching, we'll use 2-3 testimonials from beta customers:

Quote card 1:
  Quote: "[Honest testimonial from beta customer]"
  Author: Name, Title (e.g., "HR Manager at Company")
  Company: Logo + name
  Stars: 5-star rating
  
Quote card 2:
  Similar format
  
Quote card 3:
  Similar format

Alternative (if no testimonials yet):
  "Bergabung dengan ribuan perusahaan yang gunakan dnPeople"
  (Show feature list instead, or coming soon message)
```

**Design:**
```
Card layout: 1 column (mobile), 2-3 columns (desktop)
Quote icon: Visual flourish (quotation mark icon, top-left)
Quote text: 14-16px, italic
Author info: Bold name + gray title/company
Star rating: 5 gold stars
Card background: Light gray or white
Border-left: 4px solid (brand color) on left edge
```

---

### 8. CTA Section (Final Call-to-Action)

**Before Footer:**

**Title (H2):**
```
"Siap Memulai?"
Subheading: "Join ribuan HR managers yang sudah percaya dnPeople"
```

**Two Options (Side-by-side):**

```
LEFT BUTTON (Primary):
  Text: "Mulai 2 Bulan Gratis"
  Color: Brand primary (orange or bright blue)
  Padding: 16px 48px
  Action: Scroll to email form OR open signup modal
  
RIGHT BUTTON (Secondary):
  Text: "Jadwalkan Demo"
  Color: Outline style (border only)
  Action: Open Calendly or contact form
```

**Design:**
```
Layout: Full width container with gradient or solid background
Background: Light (could be subtle brand color, #f3f4f6)
Button container: Flex, center aligned, gap 16px
Responsive: Stack buttons on mobile (full width each)
Padding: 60px horizontal (desktop), 24px (mobile)
```

---

### 9. FAQ Section (Accordion)

**Title (H2):**
```
"Pertanyaan Sering Ditanyakan"
```

**FAQ Items (12-15 questions):**

```
ACCOUNT & SIGNUP:
Q: Bagaimana cara daftar?
A: [1-2 sentences]

Q: Butuh kartu kredit untuk trial?
A: Tidak. Trial gratis tanpa kartu kredit.

Q: Bisa cancel kapan saja?
A: Ya, tanpa penalty. Cancel via dashboard settings.

FEATURES & CAPABILITIES:
Q: Apakah dnPeople support multi-cabang?
A: Ya, untuk tier Business dan Enterprise.

Q: Bisa integrasi dengan sistem akuntansi kami?
A: Ya, via API atau JSON webhooks. Contact us untuk integrasi custom.

Q: Berapa jumlah karyawan maksimal?
A: Unlimited. Scale dengan kebutuhan Anda.

COMPLIANCE & SECURITY:
Q: Apakah BPJS + PPh 21 sudah built-in?
A: Ya, sesuai regulasi terbaru Indonesia (PPh 21, PPN, UU PDP).

Q: Aman simpan data gaji?
A: Ya. Encrypted AES-256, regular backup, audit logs.

Q: Bagaimana privacy data karyawan?
A: Compliant dengan UU Perlindungan Data Pribadi (UU PDP).

SUPPORT & TRAINING:
Q: Apakah ada support lokal?
A: Ya, support@dnpeople.id (email + chat).

Q: Bagaimana jika ada issue saat setup?
A: Free onboarding call + training video provided.

Q: Bagaimana jika tidak puas?
A: Uang kembali 14 hari, no questions.
```

**Design:**
```
Accordion style:
  - Question: Bold, clickable, cursor pointer
  - Icon: + (closed) / - (open), float right
  - Answer: Collapse/expand with smooth animation
  - Hover: Slight background change on question
  
Spacing:
  - 16px padding each item
  - 8px gap between items (or border-bottom separator)

Mobile:
  - Full width (100%)
  - Touch-friendly (48px min height per question)
```

---

### 10. Footer

**Content:**

```
Row 1 (Top):
  Column 1: Company Info
    Logo + tagline
    "HRIS sederhana untuk SME Indonesia"
    Social icons: LinkedIn, Twitter (if applicable)
  
  Column 2: Product
    - Fitur
    - Pricing
    - Security
    - Roadmap (atau "Coming Soon")
  
  Column 3: Company
    - About
    - Blog
    - Careers
    - Contact
  
  Column 4: Legal
    - Privacy Policy
    - Terms of Service
    - Data Processing Agreement (DPA)
    - Security

Row 2 (Bottom):
  Copyright: "© 2026 PT. Dozer Napitupulu Technology"
  Contact email: support@dnpeople.id
  Address: Jakarta, Indonesia
```

**Design:**
```
Background: Dark (navy #1e3a8a or dark gray #1f2937)
Text: Light gray (#d1d5db) or white
Link hover: Highlight (lighter color)
Padding: 40px top/bottom (desktop), 24px (mobile)
Border-top: Subtle separator (1px light color)
```

---

## Design System

### Colors

```
Primary Brand Color:  Navy Blue #1e3a8a (or company color)
Secondary:           Orange #f97316 (for CTA buttons)
Tertiary:            Light Blue #0ea5e9 (alternative accent)
Text Primary:        Dark Gray #1f2937 (body text)
Text Secondary:      Medium Gray #6b7280 (secondary text)
Background:          White #ffffff (main) + Light Gray #f9fafb (sections)
Border:              Light Gray #e5e7eb
Success:             Green #10b981
Warning:             Orange #f59e0b
Error:               Red #ef4444
```

### Typography

```
Font Family (Options):
  Option 1 (Professional):
    Headings: Manrope, Inter, or Sora (sans-serif, bold)
    Body: Inter or Roboto (sans-serif, regular)
  
  Option 2 (Classic):
    Headings: Poppins or Montserrat (sans-serif, semi-bold)
    Body: Open Sans or Lato (sans-serif, regular)

Sizing:
  H1 (Hero headline):  48px (desktop), 32px (mobile)
  H2 (Section title):  36px (desktop), 24px (mobile)
  H3 (Card title):     24px (desktop), 18px (mobile)
  Body text:           16px (desktop), 14px (mobile)
  Small text:          14px (desktop), 12px (mobile)

Weight:
  Bold:     600-700 (headings, CTAs)
  Regular:  400 (body, descriptions)
  Light:    300 (secondary text, captions)

Line Height:
  Headings: 1.2
  Body:     1.6
  Labels:   1.4
```

### Spacing & Layout

```
Max container width: 1200px (desktop)
Margin/padding standard: 8px, 16px, 24px, 40px, 60px
Section padding: 60px vertical (desktop), 40px (tablet), 24px (mobile)
Card padding: 24px (desktop), 16px (mobile)
Grid gap: 24px (desktop), 16px (mobile)
```

### Components

```
Buttons:
  Primary: Blue background, white text, 16px padding
  Secondary: White background, blue border, blue text
  Hover: Darker background or shadow lift
  Active/Focus: Visible focus ring (2px blue outline)
  Disabled: Gray background, lighter text, cursor not-allowed

Forms:
  Input: Border 1px light gray, padding 12px, border-radius 4px
  Focus: Border color change to primary color, box-shadow subtle
  Label: 14px, bold, 8px bottom margin
  Error message: Red text, 12px, 4px top margin
  
Links:
  Color: Primary color (blue or navy)
  Decoration: None (underline on hover)
  Visited: Slightly darker shade
```

---

## Conversion Funnel

### Primary Conversion Flow

```
1. User lands on homepage
2. Reads hero section (30 seconds)
3. Scrolls to pricing (checks price point)
4. Scrolls to FAQ (clarifies concerns)
5. Email capture form (prominent, sticky or modal)
6. Submits: "Signup for Beta" or "Start Free Trial"
7. Confirmation email sent (Convertkit/Mailchimp)
8. Redirects to onboarding setup page
9. Schedule onboarding call (Calendly embedded)
```

### Email Capture Form

```
Location: 
  - Email input field visible on page (sticky footer or mid-page)
  - Also in modal (triggered after 15 sec OR on scroll 50%)

Fields:
  1. Email address (required, email validation)
  2. Full name (required, text)
  3. Company name (required, text)
  4. Employee count (required, dropdown: 10-50, 51-100, 101-300, 300+)
  5. (Optional) Phone number (for follow-up)

CTA Button:
  Text: "Daftar Beta Gratis" or "Mulai 2 Bulan Gratis"
  Action: Submit → trigger email (Convertkit) → show thank you message

Thank you message:
  "Terima kasih! Check email Anda untuk instruksi selanjutnya.
   Tim kami akan hubungi dalam 24 jam."
  Link: "Jadwalkan onboarding call" (Calendly)
```

**Design:**
```
Form container: 400px width (desktop), 90vw (mobile)
Input styling: Consistent with design system
Focus state: Subtle shadow + border color change
Error state: Red border + red text message below
Success: Green checkmark animation + thank you message
```

---

## Mobile Responsiveness

### Breakpoints

```
Mobile:   < 640px
Tablet:   640px - 1024px
Desktop:  > 1024px
```

### Responsive Rules

```
Mobile (< 640px):
  - Hero section: Stack text + image vertically
  - Buttons: Full width (90vw)
  - Font: Smaller (32px headings, 14px body)
  - Features: 1 column grid
  - Pricing: Cards full width, scrollable horizontally (if many columns)
  - Navigation: Hamburger menu, overlay drawer
  - Padding: 20px horizontal (instead of 40-60px)
  - CTA buttons: Sticky footer (fixed bottom 0)

Tablet (640px - 1024px):
  - Hero: 50/50 split if space allows, else stack
  - Features: 2 column grid
  - Pricing: 2 columns
  - Navigation: Show most items (hide some or submenu)

Desktop (> 1024px):
  - Full layouts as designed above
  - Max width containers (1200px)
  - Hover effects on buttons + cards
```

---

## Performance & SEO

### Page Load Performance

```
Target:
  - First Contentful Paint (FCP): < 1.5s
  - Largest Contentful Paint (LCP): < 2.5s
  - Cumulative Layout Shift (CLS): < 0.1
  - Lighthouse score: > 90

Optimization:
  - Image compression (WebP format)
  - Lazy loading for off-screen images
  - Minified CSS/JS
  - CDN for static assets
  - Caching (browser + server)
  - No unnecessary animations
```

### SEO & Meta Tags

```
Title: "dnPeople — HRIS Sederhana untuk SME Indonesia"
Meta Description:
  "Payroll, attendance, leave dalam satu dashboard. Setup 15 menit.
   BPJS + PPh 21 built-in. Mulai 2 bulan gratis."

Keywords: HRIS Indonesia, software payroll, manajemen absensi

Open Graph (Social sharing):
  og:title: "dnPeople - HRIS untuk SME"
  og:description: "[meta description]"
  og:image: "[hero image or custom social card]"
  og:url: "https://dnpeople.id"
  og:type: "website"

Twitter Card:
  twitter:card: "summary_large_image"
  twitter:title: "[og:title]"
  twitter:description: "[meta description]"
  twitter:image: "[og:image]"

Structured Data (Schema.org):
  - Organization schema (dnpeople.id info)
  - Product schema (pricing, rating)
  - FAQ schema (FAQ items)
```

### Google Analytics Events

```
Track:
  - Page view (automatic)
  - Email form submit: event="beta_signup", email=[value]
  - "Start Free" button click: event="cta_click", button="hero"
  - "Lihat Demo" click: event="demo_click"
  - Pricing page scroll: event="pricing_view"
  - FAQ item expand: event="faq_expand", faq_topic=[topic]
  - "Contact Sales" click: event="contact_click"
  - Demo video play: event="video_play"
  - Footer link click: event="footer_link", link=[link_name]
```

---

## Content Guidelines

### Tone & Voice

```
✅ DO:
  - Professional but friendly (formal enough for HR, warm enough for startup)
  - Indonesian language (native speakers only)
  - Clear, jargon-free explanations
  - Honest about features + pricing
  - Specific examples (payroll, not "system")
  - Action-oriented CTAs

❌ DON'T:
  - Fake metrics ("used by 10,000+ companies" if not true)
  - Hype language ("revolutionary", "game-changing")
  - Jargon without explanation
  - Empty buzzwords ("AI-powered", "blockchain" unless relevant)
  - Compare negatively to competitors
  - Overstate features not yet built
```

### Copy Principles

```
1. Be honest about what dnPeople does (and doesn't do)
   ✓ "Payroll, attendance, leave management" (what it does)
   ✗ "Complete HR solution" (too vague, implies more than current scope)

2. Focus on benefits, not features
   ✓ "BPJS + PPh 21 calculated automatically" (benefit: less manual work)
   ✗ "Advanced payroll engine" (feature, vague)

3. Use specific numbers, not vague claims
   ✓ "Setup in 2 hours" (or "15 minutes with support")
   ✗ "Quick setup" (vague)

4. Address customer pain points
   ✓ "Stop using Excel for payroll. Reduce errors and save 20 hours/month."
   ✗ "Modern HRIS solution"

5. Show pricing upfront (no surprise costs)
   ✓ Display "Rp 20K per employee per month" clearly
   ✗ "Contact us for pricing"
```

---

## Success Metrics

### Launch KPIs

```
Traffic:
  - 100+ visitors day 1
  - 500+ visitors week 1
  - 2000+ visitors by Aug 15

Conversion:
  - 10% email capture rate (10-20 signups per 100-200 visits)
  - 30% of signups → call booked (via Calendly)
  - 50% of calls → trial signup (via system)

Content:
  - Homepage load: < 3 seconds (real devices)
  - Lighthouse: > 90 score
  - Mobile: 100% responsive test pass

Engagement:
  - Avg time on page: > 2 minutes
  - Scroll depth: 60%+ to FAQ section
  - Video play rate: > 25% (of visitors)
  - CTA click rate: > 5% (of visitors)
```

### Post-Launch Monitoring

```
Daily (first 2 weeks):
  - Visitor count + unique visitors
  - Form submissions + email captures
  - Traffic source breakdown (direct, Google, social, email)
  - Device breakdown (desktop, mobile, tablet)
  
Weekly:
  - Conversion funnel analysis (landing → form → call → signup)
  - Top pages (which sections most visited)
  - Exit pages (where people leave)
  - Top referrers
  
Biweekly:
  - User behavior flow (scroll, clicks, video play)
  - Engagement by section (time spent on hero, pricing, etc)
  - A/B test results (if any button/copy changes)
```

---

## Technical Stack Options

### Option 1: Framer (Fastest for Launch - RECOMMENDED)

```
Pros:
  - Zero coding required
  - Templates available
  - Fast to launch (1-2 days)
  - Good mobile experience
  - Easy to update content
  - Built-in CMS

Cons:
  - Limited customization (design boundaries)
  - Pricing depends on plan (but still < $30/mo)
  - Some performance trade-offs

Setup:
  1. Create Framer account
  2. Choose template or start blank
  3. Add sections (components library)
  4. Customize colors, fonts, content
  5. Connect form to Zapier → Convertkit
  6. Publish to dnpeople.id (custom domain)
```

### Option 2: Webflow (Design Control)

```
Pros:
  - Full design control
  - CMS + dynamic content
  - Good for complex layouts
  - Hosting included

Cons:
  - Steeper learning curve
  - More time to build (~5-7 days)
  - Pricing higher ($12-36/mo + hosting)

Setup:
  1. Create Webflow account
  2. Start from SaaS template
  3. Customize in visual editor
  4. Add interactions + animations
  5. Connect form to Zapier
  6. Publish to dnpeople.id
```

### Option 3: Next.js + React (Developer Custom)

```
Pros:
  - Full control
  - Can integrate with app later
  - Performance optimized
  - Flexible components

Cons:
  - Requires developer time (~7-10 days)
  - Hosting setup (Vercel, AWS, etc)
  - Ongoing maintenance

Setup:
  1. npx create-next-app dnpeople-web --typescript --tailwind
  2. Build pages: /, /pricing, /demo, /faq, /contact
  3. Add components: Hero, Features, Pricing, etc
  4. Connect form to email service
  5. Deploy to Vercel
  6. Setup dnpeople.id domain
```

**RECOMMENDATION for 6-day timeline:** Framer (fastest) or Webflow (design control but still fast)

---

## Deployment & Launch Checklist

```
Pre-launch (27 Jul):
  [ ] Domain dnpeople.id registered
  [ ] SSL certificate installed (HTTPS)
  [ ] All pages built + tested
  [ ] Forms submitting correctly
  [ ] Email confirmation working (Convertkit)
  [ ] Analytics tracking set up (Google Analytics)
  [ ] SEO meta tags + schema.org data added
  [ ] Mobile responsive testing (iPhone + Android)
  [ ] Lighthouse audit run (aim > 90)
  [ ] Dead links checked
  [ ] Images optimized + compressed
  [ ] Performance tested on slow connection
  [ ] Accessibility audit (WCAG 2.1 AA standard)
  [ ] Content proofread (typos, grammar)

Launch Day (28 Jul):
  [ ] Staging review complete (final check)
  [ ] DNS cutover to production
  [ ] SSL certificate verified (green lock)
  [ ] Website LIVE check (open in browser)
  [ ] Form submission test (send test email)
  [ ] Analytics tracking confirmed (test event)
  [ ] Monitoring/uptime alert active (Datadog or Uptime Robot)
  [ ] Backup of website configured
  [ ] Contact email monitored (support@dnpeople.id)
  [ ] Slack alert setup (if page down)

Post-launch (29-30 Jul):
  [ ] Monitor traffic (analytics dashboard)
  [ ] Check form submissions (Convertkit account)
  [ ] Monitor uptime (Datadog/Uptime Robot)
  [ ] Fix any critical issues (fast)
  [ ] Respond to contact form submissions
  [ ] Share on social media (LinkedIn, Twitter, etc)
  [ ] Email announcement to beta customers
```

---

## File Deliverables

```
Assets to prepare:

Images:
  - Hero background or product screenshot (1920x1080, optimized)
  - Feature icons (6x, 256x256 or SVG, PNG)
  - Company logo (SVG, PNG, favicon)
  - Social media cover image (1200x630 for OG)

Video:
  - Product demo/walkthrough (2-3 min, MP4 or WebM)
  - Thumbnail image (1280x720)

Copy:
  - Homepage content (headlines, subheadings, CTAs)
  - Feature descriptions (3 tiers each)
  - Pricing tier details
  - FAQ questions & answers (12-15 pairs)
  - Footer content (links, legal)

Technical:
  - Color palette (hex codes)
  - Font files (if custom, or Google Fonts links)
  - Logo files (SVG + PNG)
  - SEO meta tags (JSON or CSV)
```

---

*Last Updated: 22 Juli 2026 | Owner: Dozer | Status: Design Specifications Ready*
