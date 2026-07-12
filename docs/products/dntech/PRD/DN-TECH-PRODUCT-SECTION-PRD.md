# DN Tech Product Section — PRD
## Struktur & CMS untuk Product Pages (dnPeople Flagship)

**Date:** Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Product:** dnPeople HRIS (v1.0)  
**Use case:** Showcase produk dengan detailed pricing tiers, features, integrations, use cases  
**Reference:** V6 codebase + copywriting dnPeople

---

## 🎯 Overview

**Current state:** V6 "Modul Produk" sudah di-code (model `Product`, route publik `/products`, admin CRUD `/admin/products`).

**Missing:** Detailed field mapping untuk dnPeople + struktur kolom yang bisa menampilkan:
- Pricing tiers (free, starter, pro, business, enterprise) dengan detail harga
- Feature list dengan kategori (Core, Talent Dev, Integrations, dll)
- Use case segments (Manufacturing, Retail, Startup, dll) dengan custom messaging
- Competitor comparison table
- Integration logos & descriptions
- Testimonials per segment
- Roadmap & upcoming features
- Multiple CTA paths (free trial, pricing calculator, demo, contact sales)

**Goal:** Provide struktur CMS yang flexible untuk dnPeople sekarang, dan reusable untuk produk DN Tech di masa depan.

---

## 📊 Database Schema (Product Model)

### Core Fields (Dari V6, sudah ada)

```prisma
model Product {
  id                String      @id @default(cuid())
  name              String      // "dnPeople"
  slug              String      @unique // "dnpeople"
  category          String      // "HRIS" | "Invoicing" | "Accounting" (future)
  tagline           String      // "Payroll & HR jadi mudah"
  description       String      @db.Text // Long form description
  heroImage         String?     // URL ke hero image
  heroAlt           String?     // Alt text untuk hero
  
  // SEO
  metaTitle         String?
  metaDescription   String?
  keywords          String?     // Comma-separated
  canonical         String?
  
  // Status
  published         Boolean     @default(false)
  featured          Boolean     @default(false)
  order             Int         @default(0)
  publishedAt       DateTime?
  
  // Relations
  authorId          String
  author            User        @relation(fields: [authorId], references: [id])
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}
```

### Extended Fields (NEW — untuk product detail)

```prisma
extend model Product {
  // Pricing
  pricingTiers      Json        // Array of pricing tier objects (see below)
  freemiumEnabled   Boolean     @default(false)
  freeLimit         String?     // "100 employees" or "5 projects"
  trialDays         Int         @default(30)
  
  // Features & Specs
  features          Json        // Array of feature objects (grouped by category)
  integrations      Json        // Array of integration objects
  techStack         Json?       // Technologies used: ["React", "Node.js", etc]
  
  // Use Cases & Segments
  useCases          Json        // Array of use case objects (who this is for)
  targetAudience    Json?       // Array of audience segments
  
  // Social Proof
  testimonials      Json        // Array of testimonial objects
  caseStudies       Json?       // Array of case study objects
  customerCount     Int?        // "500+" customers
  
  // Comparison
  comparisonTable   Json?       // Competitor comparison data
  
  // Roadmap
  roadmap           Json?       // Upcoming features with timeline
  
  // CTAs & Conversion
  primaryCta        Json        // { label, url, type: "trial"|"demo"|"pricing" }
  secondaryCta      Json?       // Alternative CTAs
  pricingCalcUrl    String?     // URL to pricing calculator (external or internal)
  demoUrl           String?     // Calendly or demo booking
  
  // Assets & Media
  screenshotUrls    String?     // JSON array of screenshot URLs
  logoUrl           String?     // Product logo
  
  // Markdown content (for flexibility)
  longFormContent   String?     @db.Text // Extended description/story
  faqJson           Json?       // FAQ data
  
  // Metadata
  tags              String?     // Tags: "HRIS", "HR", "Payroll", "SME", etc
  category          String      // Primary category
  status            String      // "launched" | "beta" | "comingsoon"
}
```

---

## 🏗️ Data Structure (JSON Fields)

### 1. Pricing Tiers (`pricingTiers` JSON)

```json
[
  {
    "id": "free",
    "name": "Gratis",
    "icon": "gift",
    "tagline": "Forever free untuk startup",
    "popular": false,
    "featured": false,
    "pricing": {
      "amount": 0,
      "currency": "IDR",
      "billingPeriod": "forever",
      "description": "Sampai 100 karyawan"
    },
    "features": [
      "Employee database unlimited",
      "Org chart & reporting",
      "Attendance & leave management",
      "Employee portal",
      "Mobile browser-friendly"
    ],
    "cta": {
      "label": "Mulai Gratis",
      "url": "https://app.dnpeople.id/signup",
      "type": "trial"
    },
    "saveLabel": null
  },
  {
    "id": "starter",
    "name": "Starter",
    "icon": "rocket",
    "tagline": "Untuk 1-50 karyawan",
    "popular": false,
    "featured": false,
    "pricing": {
      "amount": 20000,
      "currency": "IDR",
      "billingPeriod": "per employee per month",
      "description": "30 karyawan = IDR 600K/bulan = IDR 7.2M/tahun"
    },
    "features": [
      "Payroll otomatis",
      "Attendance & leave",
      "Email support",
      "Basic reporting",
      "Webhooks"
    ],
    "cta": {
      "label": "Coba Sekarang",
      "url": "https://app.dnpeople.id/signup",
      "type": "trial"
    },
    "saveLabel": null
  },
  {
    "id": "professional",
    "name": "Professional",
    "icon": "star",
    "tagline": "Recommended untuk 50-300 karyawan",
    "popular": true,
    "featured": true,
    "pricing": {
      "amount": 25000,
      "currency": "IDR",
      "billingPeriod": "per employee per month",
      "description": "150 karyawan = IDR 3.75M/bulan = IDR 45M/tahun"
    },
    "features": [
      "Everything di Starter +",
      "Talent development (IDP, competency framework)",
      "Advanced leave management",
      "Overtime & claims",
      "Chat support (8 jam response)",
      "Basic customization",
      "Webhooks + 100 API calls/day",
      "Hemat IDR 225M/tahun vs Talenta"
    ],
    "cta": {
      "label": "Pilih Professional",
      "url": "https://app.dnpeople.id/signup?plan=pro",
      "type": "trial"
    },
    "saveLabel": null
  },
  {
    "id": "business",
    "name": "Business",
    "icon": "building",
    "tagline": "Untuk 300+ karyawan",
    "popular": false,
    "featured": false,
    "pricing": {
      "amount": 20000,
      "currency": "IDR",
      "billingPeriod": "per employee per month",
      "description": "500 karyawan = IDR 10M/bulan = IDR 120M/tahun"
    },
    "features": [
      "Everything di Professional +",
      "Multi-branch support",
      "Custom workflows (up to 3 approval levels)",
      "REST API unlimited",
      "Priority support (4 jam response)",
      "Phone support",
      "Quarterly business reviews",
      "Hemat IDR 600M/tahun vs Talenta"
    ],
    "cta": {
      "label": "Hubungi Sales",
      "url": "https://calendly.com/dntech/demo",
      "type": "demo"
    },
    "saveLabel": null
  },
  {
    "id": "enterprise",
    "name": "Enterprise",
    "icon": "crown",
    "tagline": "Untuk 500+ karyawan atau kebutuhan custom",
    "popular": false,
    "featured": false,
    "pricing": {
      "amount": null,
      "currency": "IDR",
      "billingPeriod": "custom",
      "description": "Custom pricing (usually IDR 15-18K/emp with volume)"
    },
    "features": [
      "Everything di Business +",
      "Dedicated account manager",
      "Custom implementation",
      "White-label option",
      "SLA 99.5% uptime",
      "Priority development roadmap"
    ],
    "cta": {
      "label": "Konsultasi Gratis",
      "url": "https://calendly.com/dntech/enterprise",
      "type": "demo"
    },
    "saveLabel": null
  }
]
```

### 2. Features by Category (`features` JSON)

```json
[
  {
    "category": "Core Payroll",
    "icon": "credit-card",
    "features": [
      {
        "name": "Payroll Otomatis",
        "description": "Kalkulasi otomatis dari attendance + overtime"
      },
      {
        "name": "BPJS & PPh 21",
        "description": "Compliance penuh dengan regulasi Indonesia"
      },
      {
        "name": "Multi-component Salary",
        "description": "Unlimited tunjangan, bonus, potongan"
      },
      {
        "name": "Bayar Banyak Rekening",
        "description": "Gaji ke berbagai bank sekaligus"
      },
      {
        "name": "Payslip Digital",
        "description": "Otomatis dikirim ke karyawan"
      }
    ]
  },
  {
    "category": "Talent Development",
    "icon": "trending-up",
    "features": [
      {
        "name": "IDP (Individual Development Plan)",
        "description": "Career roadmap per karyawan"
      },
      {
        "name": "Competency Framework",
        "description": "Define skill framework untuk org Anda"
      },
      {
        "name": "9-Box Matrix",
        "description": "Identifikasi high performer & high potential"
      },
      {
        "name": "Succession Planning",
        "description": "Plan siapa pengganti critical roles"
      },
      {
        "name": "LMS (Learning Management)",
        "description": "Training + skill tracking untuk employees"
      }
    ]
  },
  {
    "category": "Attendance & Leave",
    "icon": "calendar",
    "features": [
      {
        "name": "Geolocation Check-in",
        "description": "Absen dari mana saja, bukan hanya kantor"
      },
      {
        "name": "Overtime Tracking",
        "description": "Otomatis deteksi dan calculate lembur"
      },
      {
        "name": "Leave Balance Real-time",
        "description": "Karyawan bisa cek saldo cuti sendiri"
      },
      {
        "name": "Multiple Leave Types",
        "description": "Cuti tahunan, sakit, izin, dll"
      },
      {
        "name": "Carry-forward & Expired",
        "description": "Tracking automatic untuk sisa cuti"
      }
    ]
  },
  {
    "category": "Customization & Advanced",
    "icon": "sliders",
    "features": [
      {
        "name": "Custom Approval Workflows",
        "description": "Multi-level approval dengan conditional routing"
      },
      {
        "name": "Differential UMR",
        "description": "Different minimum wage per kota"
      },
      {
        "name": "Multi-branch Management",
        "description": "Handle multiple kantor dalam satu dashboard"
      },
      {
        "name": "Custom Fields & Reporting",
        "description": "Flexible reporting sesuai kebutuhan"
      }
    ]
  },
  {
    "category": "Developer & Integration",
    "icon": "code",
    "features": [
      {
        "name": "REST API",
        "description": "Open API untuk integrasi dengan sistem lain"
      },
      {
        "name": "Webhooks",
        "description": "Real-time event notifications"
      },
      {
        "name": "Pre-built Integrations",
        "description": "Connect dengan Jurnal, Xendit, major banks"
      },
      {
        "name": "Complete Documentation",
        "description": "API docs, SDKs, code samples"
      }
    ]
  }
]
```

### 3. Integrations (`integrations` JSON)

```json
[
  {
    "name": "Jurnal",
    "logo": "https://cdn.dntech.id/integrations/jurnal.png",
    "category": "Accounting",
    "description": "Sync payroll ke Jurnal untuk accurate financial reporting",
    "status": "available",
    "url": "https://dnpeople.id/integrations/jurnal"
  },
  {
    "name": "Xendit",
    "logo": "https://cdn.dntech.id/integrations/xendit.png",
    "category": "Payments",
    "description": "Proses pembayaran gaji via Xendit API",
    "status": "available",
    "url": "https://dnpeople.id/integrations/xendit"
  },
  {
    "name": "BCA API",
    "logo": "https://cdn.dntech.id/integrations/bca.png",
    "category": "Banking",
    "description": "Direct bank transfer ke rekening karyawan",
    "status": "available",
    "url": "https://dnpeople.id/integrations/bca"
  },
  {
    "name": "Mandiri API",
    "logo": "https://cdn.dntech.id/integrations/mandiri.png",
    "category": "Banking",
    "description": "Direct bank transfer via Mandiri",
    "status": "available",
    "url": "https://dnpeople.id/integrations/mandiri"
  },
  {
    "name": "Slack",
    "logo": "https://cdn.dntech.id/integrations/slack.png",
    "category": "Communication",
    "description": "Get payroll alerts & notifications di Slack",
    "status": "coming_soon",
    "url": "https://dnpeople.id/integrations/slack"
  },
  {
    "name": "Google Workspace",
    "logo": "https://cdn.dntech.id/integrations/google.png",
    "category": "Authentication",
    "description": "SSO with Google Workspace",
    "status": "available",
    "url": "https://dnpeople.id/integrations/google"
  }
]
```

### 4. Use Cases by Segment (`useCases` JSON)

```json
[
  {
    "id": "manufacturing",
    "segment": "Manufaktur & Pabrik",
    "icon": "factory",
    "description": "HR solution untuk pabrik dengan shift kompleks & multi-branch",
    "uniqueFeatures": [
      "Shift scheduling (rotation, swap)",
      "Night shift premium calculation",
      "Production incentives",
      "Safety incident tracking"
    ],
    "testimonial": {
      "quote": "Hemat IDR 200 juta per tahun dari Talenta. Setup multi-branch dengan UMR berbeda jadi simple.",
      "author": "HR Director",
      "company": "Manufaktur 500 orang",
      "location": "Jakarta"
    },
    "stats": {
      "savings": "IDR 200M/tahun",
      "timeToPayroll": "10 menit",
      "setupTime": "1 hari"
    },
    "cta": {
      "label": "Lihat Demo untuk Manufaktur",
      "url": "https://calendly.com/dntech/demo-manufacturing"
    }
  },
  {
    "id": "retail",
    "segment": "Retail & F&B",
    "icon": "shopping-bag",
    "description": "HR platform untuk retail & food & beverage dengan crew scheduling & tip pooling",
    "uniqueFeatures": [
      "Crew scheduling dashboard",
      "Tip pooling & distribution",
      "High-volume bulk hiring",
      "Quick onboarding/offboarding",
      "Shift flexibility"
    ],
    "testimonial": {
      "quote": "Crew scheduling jadi automated. Tidak lagi conflict antar shift. Crew happy, we happy.",
      "author": "People Manager",
      "company": "Retail Chain 300 orang",
      "location": "Surabaya"
    },
    "stats": {
      "savings": "IDR 90M/tahun",
      "timeToPayroll": "10 menit",
      "setupTime": "3 hari"
    },
    "cta": {
      "label": "Lihat Demo untuk Retail",
      "url": "https://calendly.com/dntech/demo-retail"
    }
  },
  {
    "id": "startup",
    "segment": "Startup & Tech",
    "icon": "rocket",
    "description": "Modern HRIS untuk startup: free tier generous, API-first, mobile-friendly",
    "uniqueFeatures": [
      "Free tier untuk 100 employees",
      "API-first architecture",
      "Webhooks & integrations",
      "Mobile browser-responsive",
      "Flexible payment (month-to-month)"
    ],
    "testimonial": {
      "quote": "Coba free tier dulu, terus upgrade ke Professional. Harganya terjangkau, fiturnya lengkap.",
      "author": "CEO",
      "company": "Tech Startup 50 orang",
      "location": "Bandung"
    },
    "stats": {
      "savings": "IDR 25M/tahun (vs Talenta)",
      "timeToPayroll": "10 menit",
      "setupTime": "30 menit"
    },
    "cta": {
      "label": "Mulai Gratis Sekarang",
      "url": "https://app.dnpeople.id/signup"
    }
  }
]
```

### 5. Testimonials (`testimonials` JSON)

```json
[
  {
    "id": "testimonial-1",
    "quote": "Hemat IDR 200 juta per tahun dari Talenta. Talent development yang included sangat membantu untuk succession planning kami.",
    "author": "HR Director",
    "company": "Perusahaan Manufaktur",
    "employeeCount": "500 karyawan",
    "location": "Jakarta",
    "industry": "Manufacturing",
    "avatar": "https://cdn.dntech.id/testimonials/avatar-1.jpg",
    "rating": 5,
    "videoUrl": null,
    "segment": "manufacturing"
  },
  {
    "id": "testimonial-2",
    "quote": "Setup payroll yang complicated dengan multiple branches jadi simple. Support team mereka sangat responsif.",
    "author": "People Manager",
    "company": "Retail Chain",
    "employeeCount": "300 karyawan",
    "location": "Surabaya",
    "industry": "Retail",
    "avatar": "https://cdn.dntech.id/testimonials/avatar-2.jpg",
    "rating": 5,
    "videoUrl": null,
    "segment": "retail"
  },
  {
    "id": "testimonial-3",
    "quote": "Coba free tier dulu, terus upgrade ke Professional. Harganya terjangkau, fiturnya lengkap. Tidak perlu cari system lain.",
    "author": "CEO",
    "company": "Tech Startup",
    "employeeCount": "50 karyawan",
    "location": "Bandung",
    "industry": "Technology",
    "avatar": "https://cdn.dnpeople.id/testimonials/avatar-3.jpg",
    "rating": 5,
    "videoUrl": null,
    "segment": "startup"
  }
]
```

### 6. Competitor Comparison (`comparisonTable` JSON)

```json
{
  "title": "dnPeople vs Kompetitor",
  "competitors": ["dnPeople", "Talenta", "Gadjian", "Gajihub"],
  "rows": [
    {
      "feature": "Harga per Employee",
      "dnpeople": "IDR 20-25K",
      "talenta": "IDR 100-150K",
      "gadjian": "IDR 12-20K",
      "gajihub": "IDR 11.9K",
      "category": "pricing"
    },
    {
      "feature": "Payroll",
      "dnpeople": "✅",
      "talenta": "✅",
      "gadjian": "✅",
      "gajihub": "✅",
      "category": "core"
    },
    {
      "feature": "Talent Development",
      "dnpeople": "✅ Included",
      "talenta": "❌ +IDR 200K",
      "gadjian": "⚠️ Limited",
      "gajihub": "❌",
      "category": "features"
    },
    {
      "feature": "API",
      "dnpeople": "✅ Included",
      "talenta": "❌ No",
      "gadjian": "⚠️ Limited",
      "gajihub": "❌",
      "category": "features"
    },
    {
      "feature": "Customization",
      "dnpeople": "✅ Advanced",
      "talenta": "⚠️ Basic",
      "gadjian": "⚠️ Basic",
      "gajihub": "⚠️ Limited",
      "category": "features"
    },
    {
      "feature": "Mobile App",
      "dnpeople": "🚧 Q3 2027",
      "talenta": "✅",
      "gadjian": "⚠️ Web only",
      "gajihub": "✅",
      "category": "features"
    },
    {
      "feature": "Transparent Pricing",
      "dnpeople": "✅",
      "talenta": "❌ Contact sales",
      "gadjian": "✅",
      "gajihub": "✅",
      "category": "pricing"
    }
  ]
}
```

### 7. Roadmap (`roadmap` JSON)

```json
[
  {
    "quarter": "Q3 2026",
    "status": "launched",
    "features": [
      {
        "name": "Core Payroll & Talent Development",
        "description": "Payroll otomatis, IDP, 9-box matrix, succession planning"
      },
      {
        "name": "API v1",
        "description": "REST API untuk integrasi"
      }
    ]
  },
  {
    "quarter": "Q4 2026",
    "status": "in_progress",
    "features": [
      {
        "name": "LMS (Learning Management System)",
        "description": "Training program tracking & management"
      },
      {
        "name": "Advanced Reporting",
        "description": "Custom dashboards & report builder"
      },
      {
        "name": "Bank Integrations",
        "description": "BCA, Mandiri, BRI untuk auto-transfer gaji"
      }
    ]
  },
  {
    "quarter": "Q1 2027",
    "status": "planned",
    "features": [
      {
        "name": "Employee Self-Service Portal Upgrade",
        "description": "Better UX untuk employee profile management"
      },
      {
        "name": "Performance Management Module",
        "description": "Annual review, goal tracking, 360 feedback"
      }
    ]
  },
  {
    "quarter": "Q3 2027",
    "status": "planned",
    "features": [
      {
        "name": "Native Mobile App",
        "description": "iOS & Android app untuk attendance & leave"
      }
    ]
  }
]
```

### 8. Primary & Secondary CTAs (`primaryCta`, `secondaryCta` JSON)

```json
{
  "primaryCta": {
    "label": "Mulai Gratis Sekarang",
    "url": "https://app.dnpeople.id/signup",
    "type": "trial",
    "color": "blue",
    "size": "lg"
  },
  "secondaryCtas": [
    {
      "label": "Lihat Pricing",
      "url": "#pricing",
      "type": "link"
    },
    {
      "label": "Schedule Demo (15 min)",
      "url": "https://calendly.com/dntech/demo",
      "type": "demo"
    },
    {
      "label": "Lihat Dokumentasi",
      "url": "https://docs.dnpeople.id",
      "type": "documentation"
    }
  ]
}
```

---

## 🖼️ Frontend Components Layout

### Product Page Structure (`/products/[slug]`)

```
1. Hero Section
   ├─ Product logo
   ├─ Product name + tagline
   ├─ Hero image
   ├─ Description (1-2 paragraphs)
   └─ Primary CTA + Secondary CTAs

2. Value Proposition (3 columns)
   ├─ Icon + Headline + Body (per unique value)
   └─ [From copywriting]

3. Features by Category
   ├─ Category tabs / accordion
   ├─ Feature name + description
   └─ [From features JSON]

4. Use Cases (By segment)
   ├─ Segment card (Manufacturing, Retail, Startup, etc)
   ├─ Unique features per segment
   ├─ Testimonial per segment
   └─ Segment-specific CTA

5. Pricing Tiers
   ├─ Pricing tier cards (free, starter, pro, business, enterprise)
   ├─ Per-tier features list
   ├─ Per-tier CTA button
   └─ [Optional] Pricing calculator

6. Integrations
   ├─ Integration grid (logo + name + category)
   ├─ Integration status (available, coming soon)
   └─ Link to integration docs

7. Competitor Comparison
   ├─ Comparison table (dnPeople vs Talenta vs Gadjian vs Gajihub)
   └─ Conclusion copy (why dnPeople wins)

8. Testimonials
   ├─ Testimonial carousel or cards
   ├─ Quote + author + company + rating
   └─ Filter by segment option

9. Roadmap
   ├─ Timeline (Q3 2026, Q4 2026, Q1 2027, Q3 2027)
   ├─ Status per quarter (launched, in_progress, planned)
   └─ Features per quarter

10. FAQ Accordion
    ├─ Q&A pairs
    └─ [From FAQ JSON or default from copywriting]

11. Bottom CTA
    ├─ "Ready to start?" + Primary CTA
    └─ Alternative paths (pricing, support, etc)

12. Footer
    ├─ Related products
    ├─ Contact info
    └─ Links
```

### Product List Page (`/products`)

```
1. Hero
   ├─ "Our Products"
   ├─ Short tagline
   └─ Filter/search (optional)

2. Product Grid (3 cols)
   ├─ Per product:
   │  ├─ Logo
   │  ├─ Product name
   │  ├─ Tagline
   │  ├─ Short description
   │  ├─ "Starting from IDR XXK" (if applicable)
   │  ├─ Key features (3 bullets)
   │  └─ CTA: "Learn More" / "Try Free"
   └─ [Show dnPeople, plus empty slots for future products]

3. Product Details (Featured)
   ├─ Full product card for dnPeople
   ├─ Larger description
   └─ Multiple CTAs
```

---

## 📋 Admin Interface (`/admin/products`)

### Product CRUD Page

**Create/Edit Product Form:**

```
1. Basic Info
   ├─ Product Name: [_______________]
   ├─ Slug: [_______________] (auto-generate from name)
   ├─ Category: [Dropdown: HRIS, Invoicing, Accounting, etc]
   ├─ Tagline: [_______________]
   └─ Description: [Large textarea]

2. SEO
   ├─ Meta Title: [_______________]
   ├─ Meta Description: [_______________]
   ├─ Keywords: [_______________]
   └─ Canonical URL: [_______________]

3. Media
   ├─ Hero Image: [Upload button]
   ├─ Hero Alt Text: [_______________]
   ├─ Product Logo: [Upload button]
   ├─ Screenshots: [Multiple file upload]
   └─ Featured Image: [Upload button]

4. Pricing Tiers (JSON Editor)
   ├─ [Rich JSON editor or form builder]
   ├─ Add tier button
   └─ Delete tier button

5. Features (JSON Editor or Form Builder)
   ├─ Add feature category
   ├─ Add feature to category
   └─ Reorder via drag-drop

6. Use Cases (JSON Editor or Form Builder)
   ├─ Add use case segment
   ├─ Fill unique features per segment
   ├─ Add testimonial per segment
   └─ Set segment-specific CTA

7. Testimonials (Relational or JSON)
   ├─ [Select from existing testimonials or create new]
   ├─ Add testimonial
   └─ Assign to segment

8. Integrations (Multi-select or JSON)
   ├─ [Checkbox or drag-drop to add integrations]
   └─ Reorder integrations

9. Competitor Comparison (JSON Editor)
   ├─ [Rich editor for comparison table]
   └─ Add/remove competitor

10. Roadmap (JSON Editor or Timeline Builder)
    ├─ Add quarter
    ├─ Add feature to quarter
    └─ Set status (launched, in_progress, planned)

11. CTAs
    ├─ Primary CTA Label: [_______________]
    ├─ Primary CTA URL: [_______________]
    ├─ Primary CTA Type: [Dropdown: trial, demo, pricing]
    ├─ Secondary CTAs: [Repeatable JSON array or form]
    └─ Pricing Calculator URL (external or internal): [_______________]

12. Status & Publishing
    ├─ Status: [Dropdown: draft, published, archived]
    ├─ Featured: [Checkbox]
    ├─ Publish Date: [Date picker]
    ├─ Order (sort): [Number input]
    └─ Tags: [Text input, comma-separated]

13. FAQ
    ├─ [Optional] Use default FAQ from copywriting
    ├─ Or upload custom FAQ (JSON)
    └─ [Rich editor for FAQ accordion]

14. Save
    ├─ [Save Draft] [Publish] [Preview]
    └─ Toast notification on success
```

---

## 🗂️ Content Template (dnPeople Sample)

**Minimal required fields untuk product hidup:**

```yaml
name: "dnPeople"
slug: "dnpeople"
category: "HRIS"
tagline: "Payroll & HR jadi mudah. Harga terjangkau."
description: "dnPeople adalah solusi HRIS untuk SME Indonesia..."

published: true
featured: true
status: "launched"

pricingTiers: [5 tiers from JSON above]
features: [5 categories from JSON above]
integrations: [6 integrations from JSON above]
useCases: [3 segments from JSON above]
testimonials: [3+ testimonials from JSON above]
comparisonTable: [comparison vs Talenta/Gadjian/Gajihub]
roadmap: [Q3 2026 - Q3 2027]

primaryCta:
  label: "Mulai Gratis Sekarang"
  url: "https://app.dnpeople.id/signup"
  type: "trial"

secondaryCtas:
  - label: "Lihat Pricing"
    url: "#pricing"
  - label: "Schedule Demo"
    url: "https://calendly.com/dntech/demo"
```

---

## 📝 Page Copy (From Copywriting Document)

**Hero:**
- [From section 1 of copywriting doc]

**Value Proposition:**
- Hemat Biaya: [From section 2, col 1]
- Semua Fitur Ada: [From section 2, col 2]
- Harga Transparan: [From section 2, col 3]

**Features:**
- [From section 3 feature cards]

**Pricing:**
- [From section 4 pricing cards + annual discount]

**Comparison:**
- [From section 5 comparison table]

**Testimonials:**
- [From section 6]

**FAQ:**
- [From section 7]

**CTAs:**
- [From section 8 & 9]

---

## 🎯 Migration Path (Existing V6 to Full dnPeople)

### Step 1: Update Prisma Schema
```bash
# Add fields to Product model (see database schema above)
npx prisma migrate dev --name add_product_pricing_features
npx prisma db push
```

### Step 2: Seed dnPeople Product
```bash
# Create seed script with dnPeople data (JSON from above)
npm run db:seed-dnpeople
```

### Step 3: Update Admin UI
```
# Admin pages: /admin/products/[id]/edit
# Add JSON editors for:
# - pricingTiers
# - features
# - useCases
# - integrations
# - testimonials
# - comparisonTable
# - roadmap
# - CTAs
```

### Step 4: Update Frontend `/products/[slug]`
```
# Create components for:
# - ProductHero
# - ProductValueProps
# - ProductFeatures
# - ProductUseCases
# - ProductPricingTiers
# - ProductIntegrations
# - ProductComparison
# - ProductTestimonials
# - ProductRoadmap
# - ProductFaq
# - ProductCta
```

### Step 5: Add to Product Listing `/products`
```
# Show dnPeople in product grid
# Featured section untuk dnPeople
```

---

## 📊 Future Products Template

Template ini reusable untuk produk DN Tech di masa depan (misal: **dnInvoicing**, **dnAccounting**, dll).

**Yang akan sama:**
- Pricing tiers structure
- Features categorization
- Integrations list
- Testimonials
- Use cases
- Comparison table
- Roadmap
- FAQ

**Yang bisa berbeda:**
- Specific features per product
- Pricing tier counts & names
- Integrations per product
- Use cases per industry
- Comparison competitors

---

## ✅ Acceptance Criteria

- [ ] Prisma schema updated (Product model extended)
- [ ] Database migration created & applied
- [ ] Admin CRUD `/admin/products` working
- [ ] JSON editors functional (pricing, features, use cases, etc)
- [ ] `/products` list page shows dnPeople
- [ ] `/products/dnpeople` detail page fully rendered
- [ ] All copywriting from doc integrated into CMS data
- [ ] Pricing tiers render correctly
- [ ] Feature categories display with icons
- [ ] Use case segments with testimonials work
- [ ] Comparison table renders
- [ ] Roadmap timeline displays
- [ ] CTAs functional (link to trial, calendly, docs)
- [ ] Testimonials carousel/cards work
- [ ] Mobile responsive
- [ ] SEO: meta tags render correctly
- [ ] Lighthouse ≥85

---

## 🚀 Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | 1-2 days | Prisma schema update + migration |
| **Phase 2** | 2-3 days | Admin CRUD + JSON editors |
| **Phase 3** | 3-4 days | Frontend components + layout |
| **Phase 4** | 1-2 days | Seed dnPeople data |
| **Phase 5** | 1 day | Testing + QA |
| **Total** | ~2 weeks | Full implementation |

---

**Status:** 📋 PRD ready for implementation  
**Next:** Assign to backend dev (Prisma) + frontend dev (React components)  
**Reference:** V6 codebase + copywriting document

---

**Owner:** Dozer (Founder & CEO)  
**Date:** Juli 2026  
**Version:** Product Section PRD v1
