# SDD: DNTECH Website Improvements

**Software Design Document v2.0**  
**Juli 2026 | Architecture, API Design & Implementation**

---

## 1. System Architecture Overview

System menggunakan existing layered architecture dengan penambahan modul baru untuk lead management & analytics.

### Architecture Stack

| Layer | Technology | Key Additions |
|---|---|---|
| Frontend | Next.js 16 + React 19 | Quiz component, ROI calculator, exit-intent modal |
| Backend | Express 5 + Node.js 18 | Case study endpoints, conversion funnel tracking |
| ORM | Prisma 6 | CaseStudy, Testimonial, ConversionFunnel schemas |
| Database | PostgreSQL 13+ (prod) | Indexes on lead source, conversion status, timestamps |
| Email | SendGrid / Mailchimp API | Automated sequences, newsletter segmentation |
| Cache | Redis (optional) | Quiz results, calculator cache |

### Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Client Layer                     │
│  ┌──────────────────┐  ┌──────────────┐ │
│  │ Public Website   │  │ Admin Panel   │ │
│  │ (Next.js)        │  │ (Next.js)     │ │
│  └────────┬─────────┘  └────────┬──────┘ │
└───────────┼──────────────────────┼────────┘
            │                      │
            └──────────────────────┘
                     ↓
            HTTPS REST API
                     ↓
┌─────────────────────────────────────────┐
│      Application Layer                   │
│  ┌─────────────────────────────────────┐ │
│  │ Express API Server (/api/v1)        │ │
│  │ • Routes & Controllers              │ │
│  │ • Middleware (Auth, Validation)     │ │
│  │ • Services (Business Logic)         │ │
│  └─────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
      ┌────────┼────────┐
      ↓        ↓        ↓
┌──────────┐ ┌──────────┐ ┌─────────────┐
│PostgreSQL│ │ Uploads/ │ │ Redis Cache │
│Database  │ │ Storage  │ │ (optional)  │
└──────────┘ └──────────┘ └─────────────┘

External Services:
  • SendGrid (Email)
  • Mailchimp (Newsletter)
  • Crisp (Live Chat - optional)
```

---

## 2. API Design & Endpoints

### 2.1 Public Endpoints (Website)

#### POST /api/v1/leads
Submit contact form
```json
Request: {
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+62812345678",
  "companyName": "Tech Startup",
  "serviceType": "web-development",
  "budget": "50000-100000",
  "message": "We need help building..."
}

Response: {
  "leadId": "lead_abc123",
  "confirmationMessage": "Thank you for contacting us!"
}
```
**Rate limit:** 10/hour per IP  
**Response time:** <500ms  
**Status codes:** 201 (Created), 400 (Validation error), 429 (Rate limited)

#### GET /api/v1/case-studies
List all case studies
```json
Query: ?page=1&limit=10&sort=latest

Response: {
  "items": [
    {
      "id": "cs_001",
      "slug": "erp-manufaktur",
      "title": "ERP Implementation for Manufacturing",
      "description": "Short description...",
      "metrics": {
        "revenue_growth": "45%",
        "implementation_time": "3 months"
      },
      "clientName": "PT Manufacturing Indonesia"
    }
  ],
  "total": 15,
  "pages": 2
}
```
**Caching:** ISR (revalidate: 3600 seconds)  
**Response time:** <200ms

#### GET /api/v1/case-studies/:slug
Get single case study
```json
Response: {
  "id": "cs_001",
  "slug": "erp-manufaktur",
  "title": "ERP Implementation...",
  "challenge": "Client had legacy systems...",
  "solution": "We implemented...",
  "results": "Within 3 months...",
  "metrics": {...},
  "clientName": "PT Manufacturing",
  "clientLogo": "https://..."
}
```

#### GET /api/v1/testimonials
Get approved testimonials (cached, TTL 1 hour)
```json
Response: {
  "items": [
    {
      "id": "test_001",
      "clientName": "John Manager",
      "title": "CTO at TechCorp",
      "content": "DNTECH helped us transform...",
      "videoUrl": "https://vimeo.com/...",
      "rating": 5,
      "publishedAt": "2026-06-01"
    }
  ],
  "total": 12
}
```

#### POST /api/v1/analytics/track
Track page views and interactions
```json
Request: {
  "eventType": "page_view",
  "page": "/services/web-development",
  "leadSource": "organic",
  "deviceType": "mobile",
  "sessionId": "sess_abc123"
}

Response: {
  "tracked": true,
  "timestamp": "2026-07-07T12:00:00Z"
}
```
**Async:** Fire-and-forget (no blocking)

### 2.2 Admin Endpoints (Protected with JWT)

#### POST /api/v1/admin/case-studies
Create case study
```bash
Headers: Authorization: Bearer <JWT_TOKEN>

Request: {
  "title": "New Case Study",
  "description": "Short description",
  "heroImage": "base64_image_data",
  "challenge": "Client problem...",
  "solution": "Our approach...",
  "results": "Outcomes achieved...",
  "metrics": {
    "revenue_growth": "45%",
    "implementation_time": "3 months"
  },
  "clientName": "Company Name"
}

Response: {
  "id": "cs_abc123",
  "slug": "case-study-slug",
  "createdAt": "2026-07-07T12:00:00Z"
}
```

#### GET /api/v1/admin/leads
List all leads with filtering
```bash
Query: ?status=new&serviceType=web-dev&page=1&limit=20

Response: {
  "items": [
    {
      "id": "lead_001",
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Tech Startup",
      "serviceType": "web-development",
      "budget": "50000-100000",
      "status": "new",
      "source": "contact-form",
      "createdAt": "2026-07-07T10:00:00Z"
    }
  ],
  "total": 156,
  "pages": 8,
  "conversionRate": 0.025
}
```

#### PATCH /api/v1/admin/leads/:id
Update lead status & notes
```json
Request: {
  "status": "contacted",
  "notes": "Called on 2026-07-07, interested in demo",
  "assignedTo": "user_budi"
}

Response: {
  "id": "lead_001",
  "status": "contacted",
  "updatedAt": "2026-07-07T14:00:00Z"
}
```

#### GET /api/v1/admin/analytics/dashboard
Dashboard metrics
```json
Response: {
  "todayLeads": 5,
  "monthLeads": 87,
  "monthTrend": [
    {"date": "2026-07-01", "leads": 3},
    {"date": "2026-07-02", "leads": 4},
    // ... more days
  ],
  "conversionRate": 0.035,
  "topPages": [
    {"page": "/services/web-development", "views": 234, "leads": 8},
    {"page": "/", "views": 421, "leads": 5}
  ],
  "topLeadSources": {
    "organic": 45,
    "direct": 25,
    "referral": 12,
    "paid": 5
  }
}
```

---

## 3. Frontend Components & Features

### 3.1 New/Enhanced Components

| Component | Location | Functionality |
|---|---|---|
| MultiStepForm | /components/forms/ | Progressive form with validation, step indicators, auto-save |
| CaseStudyCard | /components/cards/ | Display case study summary with CTA button |
| TestimonialCarousel | /components/sliders/ | Swipeable testimonials with ratings & video support |
| SolutionQuiz | /components/interactive/ | 5-step quiz with conditional logic, result mapping |
| ROICalculator | /components/interactive/ | Form inputs → calculation → downloadable estimate PDF |
| ExitIntentModal | /components/modals/ | Trigger on mouse leave viewport, lead capture form |
| StickyHeader | /components/layout/ | Persistent header with CTA button on scroll |
| AnalyticsDashboard | /admin/components/ | Charts, tables, lead status tracking |

### 3.2 File Structure

```
frontend/src/
├── app/
│   ├── (public)/
│   │   ├── case-studies/
│   │   │   ├── page.tsx              # Case study listing
│   │   │   └── [slug]/page.tsx       # Single case study detail
│   │   ├── quiz/page.tsx             # Solution finder quiz
│   │   ├── layout.tsx                # Public layout
│   │   └── page.tsx                  # Home page
│   ├── admin/
│   │   ├── case-studies/
│   │   │   ├── page.tsx              # Case study management
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── leads/
│   │   │   ├── page.tsx              # Lead management
│   │   │   └── [id]/page.tsx         # Lead detail
│   │   ├── analytics/page.tsx        # Dashboard
│   │   └── layout.tsx                # Admin layout
│   └── api/
│       ├── crons/                    # Scheduled tasks
│       └── webhooks/                 # External integrations
├── components/
│   ├── interactive/
│   │   ├── SolutionQuiz.tsx
│   │   ├── ROICalculator.tsx
│   │   └── ExitIntentModal.tsx
│   ├── forms/
│   │   ├── MultiStepForm.tsx
│   │   └── LeadForm.tsx
│   ├── sliders/
│   │   └── TestimonialCarousel.tsx
│   ├── cards/
│   │   ├── CaseStudyCard.tsx
│   │   └── TestimonialCard.tsx
│   ├── layout/
│   │   ├── StickyHeader.tsx
│   │   └── Footer.tsx
│   └── admin/
│       ├── LeadsTable.tsx
│       ├── ConversionChart.tsx
│       └── AnalyticsDashboard.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts        # API client with interceptors
│   │   ├── leads.ts
│   │   ├── caseStudies.ts
│   │   └── analytics.ts
│   ├── hooks/
│   │   ├── useConversionTracking.ts
│   │   ├── useLeadForm.ts
│   │   └── useExitIntent.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── tracking.ts
│   │   └── analytics.ts
│   └── types/
│       ├── lead.ts
│       ├── caseStudy.ts
│       └── analytics.ts
├── styles/
│   └── globals.css
└── public/
    └── assets/
```

---

## 4. Backend Implementation

### 4.1 New Routes & Services

| Module | Routes | Services |
|---|---|---|
| Case Studies | GET /case-studies, POST /admin/case-studies | CaseStudyService, SlugGenerator |
| Lead Management | POST /leads, GET /admin/leads, PATCH /admin/leads/:id | LeadService, LeadCategorizer, EmailService |
| Conversion Tracking | POST /analytics/track | ConversionFunnelService, AttributionService |
| Analytics | GET /admin/analytics/dashboard | AnalyticsService, MetricsCalculator |

### 4.2 Key Services Implementation

#### LeadService
```typescript
// Create new lead
async createLead(data: LeadInput): Promise<Lead> {
  // Validate input
  // Check for duplicate email
  // Auto-categorize by service + budget
  // Save to database
  // Trigger welcome email
}

// Check for duplicates
async getDuplicateCheck(email: string): Promise<boolean> {
  // Query database for existing email
}

// Auto-categorize lead
async autoCategory(serviceType: string, budget: string): Promise<string> {
  // Map to sales category for routing
}

// Send welcome email
async sendWelcomeEmail(lead: Lead): Promise<void> {
  // Call SendGrid API
  // Use welcome email template
}
```

#### ConversionFunnelService
```typescript
// Track conversion events
async trackEvent(sessionId: string, eventType: string, page: string): Promise<void> {
  // Log event to database
  // Async (fire-and-forget)
}

// Get funnel metrics
async getFunnelMetrics(dateRange: DateRange): Promise<FunnelMetrics> {
  // Query database
  // Calculate: visitors, leads, conversion rate
}

// Calculate conversion rate
calculateConversionRate(leads: number, visitors: number): number {
  // Return percentage: (leads / visitors) * 100
}
```

#### AnalyticsService
```typescript
// Get dashboard metrics
async getDashboardMetrics(): Promise<DashboardData> {
  // Today's leads count
  // Month trend data
  // Conversion rate
  // Top pages
  // Lead sources breakdown
}

// Get detailed report
async getConversionReport(dateRange: DateRange): Promise<Report> {
  // Full funnel report with filtering
}
```

### 4.3 Directory Structure

```
backend/src/
├── routes/
│   ├── case-studies.ts
│   ├── leads.ts
│   ├── analytics.ts
│   └── admin.ts
├── middleware/
│   ├── auth.ts              # JWT verification
│   ├── validation.ts        # Input validation
│   ├── errorHandler.ts
│   └── rateLimit.ts
├── services/
│   ├── LeadService.ts
│   ├── CaseStudyService.ts
│   ├── ConversionFunnelService.ts
│   ├── AnalyticsService.ts
│   └── EmailService.ts
├── utils/
│   ├── validators.ts
│   ├── generators.ts        # Slug, ID generation
│   └── helpers.ts
├── types/
│   └── index.ts
└── index.ts
```

---

## 5. Database Schema Updates

### Prisma Schema Additions

```prisma
model CaseStudy {
  id        String   @id @default(cuid())
  slug      String   @unique @index
  title     String
  description String @db.Text
  heroImage String?
  challenge String   @db.Text
  solution  String   @db.Text
  results   String   @db.Text
  metrics   Json?    // {revenue_growth: 45%, implementation_time: "3 months"}
  clientName String
  clientLogo String?
  
  publishedAt DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([publishedAt])
}

model ConversionFunnel {
  id            String @id @default(cuid())
  sessionId     String @index
  eventType     String // "page_view" | "form_visit" | "form_submit"
  pageUrl       String
  leadSource    String @index // "organic" | "direct" | "referral" | "paid"
  convertedToLead Boolean @default(false)
  
  timestamp     DateTime @default(now()) @index
  
  @@index([leadSource])
  @@index([timestamp])
}

model Lead {
  id          String    @id @default(cuid())
  name        String
  email       String    @unique @index
  phone       String?
  company     String?
  serviceType String?   @index
  budget      String?
  message     String?   @db.Text
  
  status      String    @default("new") @index // "new" | "contacted" | "qualified" | "closed"
  source      String    @default("contact-form") // "contact-form" | "quiz" | "calculator"
  
  assignedTo  String?
  notes       String?   @db.Text
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([status])
  @@index([createdAt])
}

model AnalyticsEvent {
  id              String @id @default(cuid())
  eventType       String // "page_view" | "form_submit" | "quiz_complete"
  pageUrl         String @index
  leadSource      String @index
  deviceType      String // "mobile" | "tablet" | "desktop"
  conversionStatus String?
  
  timestamp       DateTime @default(now()) @index
  
  @@index([timestamp])
}
```

---

## 6. Deployment & Infrastructure

### 6.1 Docker Setup

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
RUN npm ci --only=production

EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push && npm start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

### 6.2 Environment Variables (New)

```env
# Email Service
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@dntech.id
SENDGRID_WELCOME_TEMPLATE_ID=d-xxxxx

# Newsletter (Optional)
MAILCHIMP_API_KEY=xxxxx
MAILCHIMP_SERVER_PREFIX=us9
MAILCHIMP_LIST_ID=xxxxx

# Live Chat (Optional)
CRISP_PLUGIN_ID=xxxxx

# Cache
REDIS_URL=redis://localhost:6379

# Analytics
ANALYTICS_PROVIDER=mixpanel  # or posthog
MIXPANEL_TOKEN=xxxxx
```

### 6.3 Performance Optimization

- **Image optimization:** Use next/image with srcSet
- **Code splitting:** Dynamic imports for Quiz & Calculator
- **Caching strategy:** ISR for case studies (revalidate: 3600)
- **CDN:** Cloudflare caching for static assets
- **Database indexing:** Indexes on frequently queried columns

---

## 7. Security Considerations

- **CSRF protection:** Implement CSRF tokens via csrf middleware
- **Rate limiting:** 10 form submissions per IP per hour
- **Input validation:** Use Zod for all form inputs
- **Email validation:** Verify format & check for disposable emails
- **Data privacy:** Never log email addresses in plain text
- **API authentication:** JWT tokens with 24h expiry for admin endpoints
- **HTTPS enforcement:** TLS 1.2+ required

---

## 8. Testing Strategy

### Unit Tests
- LeadService.createLead() - validation & DB insert
- ConversionFunnelService.getFunnelMetrics() - data aggregation
- AnalyticsService dashboard calculations

### E2E Tests
- Lead form submission → email delivery → admin visibility
- Quiz completion → result mapping → lead capture
- Case study CRUD operations

### Performance Tests
- Page load time <2.5s with 100 concurrent users
- API response time <200ms for case studies list
- Database query performance with 1M records

### Load Testing
```bash
# Using k6 or Apache JMeter
- Lead form endpoint: 100 requests/second
- Case studies API: 500 requests/second
- Dashboard: 50 concurrent users
```

---

## 9. Monitoring & Observability

```
Metrics to Track:
- API response times (p50, p95, p99)
- Error rates (4xx, 5xx)
- Database query performance
- Email delivery success rate
- Conversion funnel completion rates
- Page load times (Core Web Vitals)

Tools:
- Datadog or New Relic for APM
- Sentry for error tracking
- Cloudflare Analytics for CDN metrics
```

---

**Document Version: 2.0 | Last Updated: Juli 2026**

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
