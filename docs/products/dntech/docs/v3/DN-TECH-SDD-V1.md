# DN Tech Company Profile Website
## Software Design Document (SDD) v1

**Document Version:** 1.0  
**Date:** Juli 2026  
**Status:** Implementation Ready  
**Owner:** Dozer (CEO + Tech Lead)  
**Audience:** Development Team, DevOps, QA

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  End User (Browser)                     │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
        ┌──────────────┴──────────────┬──────────────┐
        ▼                            ▼               ▼
    ┌────────────────┐       ┌──────────────┐   ┌─────────┐
    │  Next.js Web   │       │ Admin Panel  │   │   CDN   │
    │  Frontend      │       │   (CMS)      │   │ (Assets)│
    │  (Port 3000)   │       │              │   │         │
    └────────┬───────┘       └──────┬───────┘   └────┬────┘
             │                      │                │
             │   REST API (JSON)    │                │
             └──────────┬───────────┴────────────────┘
                        │
              ┌─────────▼─────────┐
              │ Express Backend   │
              │ API (Port 4000)   │
              │ /api/v1/*         │
              └──────────┬────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
    ┌────────────┐ ┌──────────┐ ┌─────────────┐
    │ PostgreSQL │ │ File     │ │ SendGrid    │
    │ Database   │ │ Storage  │ │ Email API   │
    └────────────┘ └──────────┘ └─────────────┘

External Services:
├── Google Analytics 4 (GA4)
├── Crisp Chat API
├── Calendly Embed
└── Sentry (error tracking, optional)
```

### 1.2 Technology Stack (Detailed)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 16.x | App Router, SSR/ISR/Static |
| | React | 19.x | UI library |
| | TypeScript | 5.x | Type safety |
| | Tailwind CSS | 4.x | Styling (solid colors only) |
| | React Hook Form | 7.x | Form state management |
| | Zod | 3.x | Form validation (client) |
| | SWR | 2.x | Data fetching & caching |
| | Lucide React | 0.x | Icons (solid design) |
| **Backend** | Node.js | 18+ | Runtime |
| | Express | 5.x | HTTP server |
| | TypeScript | 5.x | Type safety |
| | Prisma ORM | 6.x | Database access, migrations |
| | PostgreSQL | 13+ | Relational database |
| | JWT | — | Authentication tokens |
| | bcryptjs | 2.4.x | Password hashing |
| | Multer | 1.4.x | File uploads |
| | Helmet | 7.x | Security headers |
| | express-rate-limit | 7.x | API rate limiting |
| **Database** | PostgreSQL | 13+ | Primary data store |
| | Prisma Client | 6.x | Type-safe ORM |
| **Infrastructure** | Docker | latest | Containerization (local dev) |
| | Docker Compose | — | Multi-container orchestration |
| | Nginx | 1.x | Reverse proxy, load balancing |
| | PM2 | 5.x | Process manager (production) |
| | Ubuntu | 22.04 LTS | Server OS |

---

## 2. Component Architecture

### 2.1 Frontend Component Hierarchy

```
app/
├── (public)/
│   ├── page.tsx (HomePage)
│   ├── services/
│   │   ├── page.tsx (ServiceListPage)
│   │   └── [slug]/page.tsx (ServiceDetailPage)
│   ├── blog/
│   │   ├── page.tsx (BlogListPage)
│   │   └── [slug]/page.tsx (BlogDetailPage)
│   ├── about/page.tsx (AboutPage)
│   ├── team/page.tsx (TeamPage)
│   ├── contact/page.tsx (ContactPage)
│   ├── thank-you/page.tsx (ThankYouPage)
│   ├── faq/page.tsx (FAQPage)
│   ├── careers/page.tsx (CareersPage)
│   └── layout.tsx (PublicLayout)
├── admin/
│   ├── login/page.tsx (AdminLoginPage)
│   ├── dashboard/page.tsx (AdminDashboardPage)
│   ├── blog/page.tsx (AdminBlogPage)
│   ├── services/page.tsx (AdminServicesPage)
│   ├── team/page.tsx (AdminTeamPage)
│   ├── leads/page.tsx (AdminLeadsPage)
│   ├── settings/page.tsx (AdminSettingsPage)
│   ├── layout.tsx (AdminLayout)
│   └── middleware.ts (Auth guard)
└── layout.tsx (RootLayout)

components/
├── common/
│   ├── Header.tsx (Navbar with LogoLight)
│   ├── Footer.tsx (Footer with LogoDark)
│   ├── MetaTags.tsx (SEO meta tags)
│   └── JsonLd.tsx (Structured data)
├── branding/
│   ├── LogoLight.tsx (Navbar logo - transparent)
│   └── LogoDark.tsx (Hero/Footer logo - dark)
├── forms/
│   ├── MultiStepForm.tsx (3-step contact form)
│   ├── LoginForm.tsx (Admin auth)
│   └── FormField.tsx (Reusable input wrapper)
├── ui/
│   ├── Button.tsx (Primary, secondary, tertiary)
│   ├── Card.tsx (Basic card component)
│   ├── Input.tsx (Text input with validation)
│   ├── Textarea.tsx (Multi-line input)
│   ├── Select.tsx (Dropdown)
│   ├── Checkbox.tsx (Checkbox input)
│   ├── Modal.tsx (Base modal)
│   ├── Badge.tsx (Status badges)
│   ├── Spinner.tsx (Loading indicator)
│   └── Alert.tsx (Alert message)
├── interactive/
│   ├── ExitIntentModal.tsx (V3 - refined)
│   ├── SolutionQuiz.tsx (Quiz component)
│   ├── NewsletterForm.tsx (Subscribe)
│   ├── BookDemoSection.tsx (Calendly embed)
│   └── CalendlyEmbed.tsx (Reusable Calendly)
├── layout/
│   ├── Hero.tsx (Hero section with LogoDark)
│   ├── TrustBadges.tsx (Why choose us)
│   ├── TeamSpotlight.tsx (Team preview)
│   ├── BlogPreview.tsx (Latest articles)
│   ├── ServiceCard.tsx (Service grid item)
│   ├── BlogCard.tsx (Blog grid item)
│   ├── FAQAccordion.tsx (FAQ component)
│   ├── StickyCTA.tsx (Mobile bottom CTA)
│   └── Breadcrumbs.tsx (Navigation trail)
└── seo/
    ├── JsonLd.tsx (Schema markup renderer)
    └── Metadata.tsx (Dynamic meta tags)

hooks/
├── useExitIntent.ts (V3 - exit modal hook)
├── useSettingsPublic.ts (Fetch public settings)
├── useMediaUpload.ts (File upload handler)
├── usePagination.ts (Pagination logic)
└── useForm.ts (Form state)

lib/
├── seo.ts (buildMetadata function)
├── read-time.ts (Article read time)
├── service-process.ts (5-step process)
├── content-pillars.ts (Blog categories)
├── currency.ts (IDR formatting)
├── validation.ts (Zod schemas)
├── api.ts (API client)
└── settings.ts (Settings cache/helper)
```

### 2.2 Backend API Routes

```
api/v1/
├── services/
│   ├── GET / (list active services)
│   ├── GET /:id (get service detail)
│   └── POST / [admin] (create service)
├── blog/
│   ├── GET / (list published posts)
│   ├── GET /:id (get post detail)
│   └── POST / [admin] (create post)
├── team/
│   ├── GET / (list team members)
│   ├── GET /:id (get member detail)
│   └── POST / [admin] (add member)
├── faq/
│   ├── GET / (list FAQs)
│   └── POST / [admin] (create FAQ)
├── settings/
│   ├── GET / (public settings only)
│   └── PATCH / [admin] (update settings)
├── leads/
│   ├── POST / (submit form lead)
│   ├── GET / [admin] (list leads)
│   ├── PATCH /:id [admin] (update lead status)
│   └── DELETE /:id [admin] (delete lead)
├── newsletter/
│   ├── POST / (subscribe)
│   └── GET / [admin] (list subscribers)
├── quiz/
│   ├── POST / (submit quiz)
│   └── GET / [admin] (view submissions)
├── search/
│   ├── GET / (search posts & services)
├── analytics/
│   ├── POST / (track event)
│   └── GET / [admin] (view analytics)
└── admin/
    ├── auth/
    │   ├── POST /login (JWT login)
    │   ├── POST /logout (Logout)
    │   └── GET /me (Current user)
    ├── users/
    │   ├── GET / [SuperAdmin] (list users)
    │   ├── POST / [SuperAdmin] (create user)
    │   └── PATCH /:id [SuperAdmin] (update role)
    ├── media/
    │   ├── POST / (upload file)
    │   ├── GET / (list files)
    │   └── DELETE /:id (delete file)
    └── backup/
        └── POST /export [SuperAdmin] (export data)
```

---

## 3. Data Flow & State Management

### 3.1 Form Submission Flow (Contact)

```
User fills MultiStepForm
  │
  ├─ Step 1: Personal info (name, email, phone)
  │  └─ Validation: Zod client-side
  │
  ├─ Step 2: Project details (type, budget, timeline, desc)
  │  └─ Validation: Zod client-side
  │
  └─ Step 3: Review & consent
     └─ Checkbox: "Saya setuju dihubungi"
     └─ CTA: "Kirim"
        │
        ▼
     POST /api/v1/leads
        │
        ├─ Server: Zod validation
        ├─ Server: Check duplicate (email + timeline)
        ├─ Database: INSERT into form_submissions
        ├─ Email: SendGrid auto-reply to user
        ├─ Email: SendGrid notification to sales@
        ├─ Analytics: Track conversion event
        │
        └─ Response: { success, leadId, message }
           │
           ▼
        Client: Redirect to /thank-you
        │
        └─ Show: "Terima kasih!"
        └─ Auto-redirect to /blog after 5s
```

### 3.2 Authentication Flow (Admin)

```
Admin visits /admin/login
  │
  ├─ Form input: Email + Password
  │
  └─ POST /api/v1/admin/auth/login
     │
     ├─ Server: Validate email/password
     ├─ Server: Compare hashed password (bcrypt)
     ├─ Server: Generate JWT token (24h expiry)
     │
     └─ Response: { token, user, expiresIn }
        │
        ▼
     Client: Save token to localStorage
        │
        ├─ Set Authorization header: "Bearer {token}"
        │
        └─ Redirect to /admin/dashboard
           │
           └─ Next requests include JWT in headers
              └─ Server: Verify token + extract userId
              └─ Server: Check RBAC (role permissions)
              └─ Server: Allow/deny based on role
```

### 3.3 Data Caching Strategy

| Data Type | Cache Layer | TTL | Strategy |
|-----------|------------|-----|----------|
| Public settings | Client SWR | 5 min | Revalidate on focus |
| Services list | Next.js ISR | 1 hour | On-demand revalidate |
| Blog posts | Next.js ISR | 24 hours | On-demand revalidate |
| Testimonials | Next.js ISR | 24 hours | On-demand revalidate |
| Team members | Next.js ISR | 24 hours | On-demand revalidate |
| Admin data (leads) | SWR | 30 sec | Real-time polling |
| Analytics | Backend cache | 5 min | Aggregated queries |

---

## 4. Database Schema (Key Models)

### 4.1 Core Models (Prisma)

```prisma
// Users & Auth
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String    // bcrypt hash
  role          UserRole  @default(Viewer)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  @@index([email])
}

// Site Configuration
model SiteSettings {
  id                    String   @id @default("1")
  companyName           String
  tagline               String
  heroDescription       String?
  companyEmail          String
  phone                 String?
  address               String?
  businessHours        String?  // JSON string
  
  // Content JSON
  homeStats            String?  // JSON: {key: value}
  trustBadges          String?  // JSON: array
  clientLogos          String?  // JSON: array
  resources            String?  // JSON: array
  aboutContent         String?  // JSON: {story, mission, vision, values, achievements}
  
  // Integrations
  googleAnalyticsId    String?
  crispWebsiteId       String?
  calendlyUrl          String?
  leadMagnetUrl        String?
  
  // Legal
  termsContent         String?  // HTML
  privacyContent       String?  // HTML
  
  updatedAt            DateTime  @updatedAt
}

// Content Models
model Service {
  id            String    @id @default(cuid())
  slug          String    @unique
  title         String
  description   String
  icon          String?
  features      String    // JSON array
  status        ContentStatus
  order         Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  @@index([status])
  @@index([order])
}

model BlogPost {
  id            String    @id @default(cuid())
  slug          String    @unique
  title         String
  content       String
  excerpt       String?
  author        String
  category      String    // "Tech Stack", "Scaling", "Startup Advice", "Insights"
  tags          String    // JSON array
  featuredImage String?
  status        BlogStatus // draft, published, scheduled
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  @@index([status])
  @@index([publishedAt])
  @@index([category])
}

// Lead Generation
model FormSubmission {
  id            String    @id @default(cuid())
  name          String
  email         String
  phone         String?
  company       String?
  
  projectType   String    // "Custom App", "Consulting", etc.
  budget        String?   // Tier: "<5K", "5K-10K", "10K-50K", "50K+"
  timeline      String?   // "ASAP", "1-3 bulan", "3-6 bulan", "Fleksibel"
  description   String
  
  status        LeadStatus @default(new)
  notes         String?   // Internal notes
  
  sourceUrl     String?   // Page where form submitted
  userAgent     String?   // Browser info
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([email])
  @@index([status])
  @@index([createdAt])
}

// Analytics
model AnalyticsEvent {
  id            String    @id @default(cuid())
  type          String    // "page_view", "form_submit", "blog_read", "quiz_complete"
  page          String    // URL
  data          String?   // JSON extra data
  
  sessionId     String    // Track user session
  userId        String?   // If logged in
  
  createdAt     DateTime  @default(now())
  
  @@index([type])
  @@index([sessionId])
  @@index([createdAt])
}

enum UserRole {
  SuperAdmin
  ContentManager
  Editor
  Viewer
}

enum ContentStatus {
  active
  inactive
  archived
}

enum BlogStatus {
  draft
  published
  scheduled
}

enum LeadStatus {
  new
  contacted
  qualified
  converted
  rejected
}
```

---

## 5. API Specifications (Key Endpoints)

### 5.1 POST /api/v1/leads — Submit Contact Form

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+62812345678",
  "company": "PT ABC",
  "projectType": "Custom App",
  "budget": "10K-50K",
  "timeline": "1-3 bulan",
  "description": "Kami ingin develop aplikasi mobile untuk e-commerce"
}
```

**Validation (Zod):**
```typescript
const FormSubmissionSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  projectType: z.enum([...]),
  budget: z.enum([...]).optional(),
  timeline: z.enum([...]).optional(),
  description: z.string().min(10).max(500),
});
```

**Response (Success):**
```json
{
  "success": true,
  "leadId": "cuid123456",
  "message": "Terima kasih! Kami akan hubungi Anda dalam 24 jam.",
  "redirectUrl": "/thank-you"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "details": {
    "email": "Email sudah pernah dikirim form dalam 7 hari terakhir"
  }
}
```

**Server Actions:**
1. ✅ Validate input (Zod)
2. ✅ Check duplicate: `email + projectType` dalam 7 hari
3. ✅ Rate limit: 10 forms/IP/hour
4. ✅ INSERT into `form_submissions`
5. ✅ Send email to user (auto-reply)
6. ✅ Send email to sales@ (notification)
7. ✅ Track analytics event
8. ✅ Broadcast to admin dashboard (WebSocket optional)

---

### 5.2 GET /api/v1/services — List Services

**Query Params:**
```
?limit=10&offset=0&status=active
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "svc123",
      "slug": "custom-app-development",
      "title": "Custom App Development",
      "description": "End-to-end custom application development...",
      "icon": "code",
      "features": [
        "Full-stack development",
        "Responsive design",
        "API integration"
      ],
      "status": "active",
      "order": 1
    }
  ],
  "total": 6,
  "limit": 10,
  "offset": 0
}
```

---

### 5.3 GET /api/v1/blog — List Blog Posts

**Query Params:**
```
?limit=10&offset=0&status=published&category=Tech Stack&sort=publishedAt
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "post123",
      "slug": "mvp-development-guide",
      "title": "MVP Development Guide",
      "excerpt": "Learn how to build an MVP in 8 weeks...",
      "author": "John Doe",
      "category": "Tech Stack",
      "tags": ["mvp", "startup", "development"],
      "featuredImage": "/images/mvp-guide.webp",
      "publishedAt": "2026-07-15T10:00:00Z",
      "readTime": 8
    }
  ],
  "total": 12,
  "limit": 10,
  "offset": 0
}
```

---

### 5.4 POST /api/v1/admin/auth/login — Admin Login

**Request:**
```json
{
  "email": "admin@dntech.id",
  "password": "SecurePassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user123",
    "email": "admin@dntech.id",
    "role": "SuperAdmin"
  },
  "expiresIn": 86400
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Email atau password salah"
}
```

---

## 6. Exit Intent Modal (V3) — Technical Spec

### 6.1 Hook: useExitIntent()

**File:** `frontend/src/hooks/useExitIntent.ts`

**Purpose:** Manage exit intent detection & modal state

**Logic:**
```typescript
export function useExitIntent(options?: {
  onExit?: () => void;
  enabled?: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const sessionStorageKey = 'exitModalShown';

  useEffect(() => {
    // Check if already shown in this session
    const alreadyShown = sessionStorage.getItem(sessionStorageKey) === 'true';
    if (alreadyShown) return;

    // Detect mouse leaving viewport (top edge)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showModal) {
        setShowModal(true);
        sessionStorage.setItem(sessionStorageKey, 'true');
        options?.onExit?.();
      }
    };

    // Detect beforeunload (tab close, navigation)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only trigger if not already shown
      if (sessionStorage.getItem(sessionStorageKey) !== 'true') {
        // Optional: show modal (can't prevent unload anyway)
        sessionStorage.setItem(sessionStorageKey, 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showModal, options]);

  const dismiss = () => {
    setShowModal(false);
  };

  return { showModal, dismiss, setShowModal };
}
```

**Usage in component:**
```typescript
export function ExitIntentModal() {
  const { showModal, dismiss } = useExitIntent({
    onExit: () => {
      // Trigger analytics event
      trackEvent('exit_intent_modal_shown');
    },
  });

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          Tunggu! Sebelum Anda pergi...
        </h2>

        <p className="text-gray-600 mb-6">
          Jangan lewatkan kesempatan untuk mendiskusikan proyek Anda bersama kami.
        </p>

        <div className="flex gap-3">
          <button
            onClick={dismiss}
            className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Tidak, terima kasih
          </button>
          <a
            href="/contact"
            onClick={dismiss}
            className="flex-1 px-4 py-2 bg-blue-900 text-white rounded text-center hover:bg-blue-800"
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </div>
  );
}
```

**Testing checklist:**
- [ ] Modal NOT shown on scroll up/down
- [ ] Modal shown when mouse leaves viewport top
- [ ] Modal shown max 1x per session (sessionStorage flag)
- [ ] Close (X) button closes modal
- [ ] "Hubungi Kami" CTA navigates to /contact
- [ ] Mobile: Modal NEVER shows
- [ ] Desktop: Modal shows as expected
- [ ] No console errors

---

## 7. Logo Component (V3) — Technical Spec

### 7.1 Logo Variants

**LogoLight (Navbar):**
```typescript
// frontend/src/components/branding/LogoLight.tsx
export function LogoLight() {
  return (
    <div className="flex items-center gap-2">
      {/* Icon: Blue square with white text */}
      <div 
        className="w-8 h-8 bg-blue-900 rounded-md flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
      >
        <span className="text-white text-xs font-bold">DN</span>
      </div>
      
      {/* Text: Inherit navbar color (blue-900) */}
      <span className="font-bold text-lg text-blue-900">DN Tech</span>
    </div>
  );
}
```

**LogoDark (Hero/Footer):**
```typescript
// frontend/src/components/branding/LogoDark.tsx
export function LogoDark() {
  return (
    <div className="flex items-center gap-2">
      {/* Icon: White square with blue text (inverted) */}
      <div 
        className="w-8 h-8 bg-white rounded-md flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
      >
        <span className="text-blue-900 text-xs font-bold">DN</span>
      </div>
      
      {/* Text: White on dark background */}
      <span className="font-bold text-lg text-white">DN Tech</span>
    </div>
  );
}
```

### 7.2 Usage

**In Header (navbar):**
```typescript
export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" className="flex items-center hover:opacity-80 transition">
          <LogoLight />
        </a>
        
        {/* Nav items */}
        {/* CTA button */}
      </div>
    </header>
  );
}
```

**In Hero (dark section):**
```typescript
export function Hero() {
  return (
    <section className="bg-blue-900 text-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <LogoDark />
        </div>
        
        <h1 className="text-5xl font-bold mb-4">
          Custom Software Development untuk Startup & SME Indonesia
        </h1>
        
        {/* ... */}
      </div>
    </section>
  );
}
```

**In Footer (dark section):**
```typescript
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <LogoDark />
        </div>
        
        {/* Footer content */}
      </div>
    </footer>
  );
}
```

**Key points:**
- ✅ No background color on logo wrapper
- ✅ No padding creating visual box
- ✅ Icon & text inherit navbar color (blue-900 in navbar, white in footer)
- ✅ Consistent sizing (icon 32px, text 18px)
- ✅ Responsive (icon scales with text)

---

## 8. Performance Optimization

### 8.1 Image Optimization

**Rule:** All images must be:
- ✅ WebP format (with JPEG fallback)
- ✅ Compressed (< 100KB typical, hero < 200KB)
- ✅ Lazy loaded (`loading="lazy"`)
- ✅ Responsive (via Next.js Image component)

**Example:**
```typescript
import Image from 'next/image';

export function TeamPhoto() {
  return (
    <Image
      src="/images/team.webp"
      alt="DN Tech team members"
      width={800}
      height={600}
      loading="lazy"
      className="rounded-lg"
    />
  );
}
```

### 8.2 Code Splitting

**Route-based:**
- Each page route splits into separate bundle
- Admin pages NOT bundled with public pages

**Component-based:**
- Heavy components (forms, quizzes) lazy loaded
- Export with `dynamic()` from Next.js

```typescript
import dynamic from 'next/dynamic';

const ExitIntentModal = dynamic(
  () => import('@/components/interactive/ExitIntentModal'),
  { ssr: false }
);
```

### 8.3 Caching Strategy

| Resource | Browser | CDN | Server |
|----------|---------|-----|--------|
| Static assets (CSS, JS) | 1 year | 1 year | Cache-Control: public, immutable |
| Images | 30 days | 30 days | Cache-Control: public, max-age=2592000 |
| HTML pages | 0 (no-cache) | 5 min | Cache-Control: public, max-age=300 |
| API responses | 5 min | N/A | SWR revalidate |
| Settings | 5 min | N/A | SWR revalidate |

---

## 9. Security Implementation

### 9.1 Authentication

```typescript
// JWT Token generation
const payload = {
  userId: user.id,
  email: user.email,
  role: user.role,
  iat: Date.now(),
  exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
};
const token = jwt.sign(payload, process.env.JWT_SECRET);
```

### 9.2 Password Hashing

```typescript
import bcrypt from 'bcryptjs';

// Hash password (registration)
const hash = await bcrypt.hash(password, 12);

// Verify password (login)
const isMatch = await bcrypt.compare(password, hash);
```

### 9.3 CORS Configuration

```typescript
const ALLOWED_ORIGINS = [
  'https://dntech.id',
  'https://www.dntech.id',
  'http://localhost:3000', // dev
];

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
```

### 9.4 Rate Limiting

```typescript
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: 'Terlalu banyak request dari IP ini',
});

app.use('/api/', limiter);
```

### 9.5 Helmet Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https:", "data:"],
    },
  },
}));
```

---

## 10. Deployment & DevOps

### 10.1 Docker Setup (Development)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: dntech
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/dntech
      NODE_ENV: development
      JWT_SECRET: dev_secret_key
      SENDGRID_API_KEY: ${SENDGRID_API_KEY}
    ports:
      - "4000:4000"
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 10.2 Production Deployment

**Nginx config:**
```nginx
upstream api {
  server localhost:4000;
}

upstream web {
  server localhost:3000;
}

server {
  listen 80;
  server_name dntech.id www.dntech.id;
  
  # Redirect HTTP → HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name dntech.id www.dntech.id;

  ssl_certificate /etc/letsencrypt/live/dntech.id/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/dntech.id/privkey.pem;

  # API proxy
  location /api/ {
    proxy_pass http://api;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Web proxy
  location / {
    proxy_pass http://web;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # Static assets caching
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### 10.3 PM2 Configuration

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'dntech-api',
      script: 'dist/index.js',
      cwd: './backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'dntech-web',
      script: 'node_modules/.bin/next start',
      cwd: './frontend',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

**Framework:** Jest

**Coverage targets:**
- Utility functions: 100%
- Hooks: 80%
- Components: 60%

**Example:**
```typescript
// __tests__/hooks/useExitIntent.test.ts
describe('useExitIntent', () => {
  it('should not show modal on scroll', () => {
    const { result } = renderHook(() => useExitIntent());
    expect(result.current.showModal).toBe(false);
  });

  it('should show modal on mouse leave top', () => {
    // Simulate mouseleave event
    // Assert showModal = true
  });

  it('should not show modal twice in session', () => {
    // Simulate 2 exit intents
    // Assert modal shows only once
  });
});
```

### 11.2 Integration Tests

**Framework:** Cypress or Playwright

**Scenarios:**
```
✅ Form submission flow (step 1 → 2 → 3 → submit)
✅ Admin login & CRUD operations
✅ Exit modal trigger & close
✅ Navigation & page loads
✅ Search functionality
```

### 11.3 Performance Tests

**Tool:** Lighthouse CI

**Targets:**
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90
- Core Web Vitals: All GREEN

---

## 12. Known Issues & Limitations (V3)

### Current Limitations:
- ❌ No real-time notifications (optional future feature)
- ❌ No email capture in exit modal (out of scope)
- ❌ No dark mode (v4 feature)
- ❌ No multi-language support (only Indonesian)

### Browser Support:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11: Not supported

---

## 13. Monitoring & Logging

### 13.1 Error Tracking

**Sentry (optional):**
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 13.2 Application Logging

**Winston (backend):**
```typescript
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

---

## 14. Change Log

### V3.0 (Current)

**Added:**
- ✅ `useExitIntent()` hook with precise trigger logic
- ✅ `ExitIntentModal.tsx` refined component
- ✅ `LogoLight.tsx` & `LogoDark.tsx` logo variants
- ✅ SDD (Software Design Document)

**Fixed:**
- ✅ Exit modal over-triggering issue
- ✅ Navbar logo dark background contrast issue
- ✅ Mobile navigation menu close on link click
- ✅ Form accessibility (aria-* attributes)

**Removed:**
- ✅ Old ExitIntentModal complex logic
- ✅ Hardcoded logo with background

---

## 15. Appendix: Quick Reference

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://api.dntech.id
NEXT_PUBLIC_SITE_URL=https://dntech.id
```

**Backend (.env):**
```
DATABASE_URL=postgresql://user:pass@localhost/dntech
NODE_ENV=production
JWT_SECRET=your_secret_key_here
SENDGRID_API_KEY=SG.xxxxxxx
SENDGRID_FROM_EMAIL=noreply@dntech.id
SALES_EMAIL=sales@dntech.id
```

### Useful Commands

```bash
# Development
npm run dev                  # Start local dev

# Database
npx prisma db push         # Sync schema
npx prisma db seed         # Bootstrap seed
npm run db:clear-content   # Clear demo data

# Build & Deploy
npm run build              # Build for production
npm start                  # Start production server

# Deployment
pm2 restart dntech-api     # Restart backend
pm2 restart dntech-web     # Restart frontend
pm2 logs dntech-api        # View backend logs
```

---

**Document Owner:** Dozer (CEO + Tech Lead)  
**Last Updated:** Juli 2026  
**Next Review:** Agustus 2026

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
