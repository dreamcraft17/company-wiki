# dnPeople — SDD v11.1
## Landing Page Website - Implementation Guide

**Versi:** 11.1  
**Tanggal:** 22 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Technical implementation details (ready to build)

---

## Quick Start: Which Platform to Use?

### Recommended: Framer (Fastest for 6-day Timeline)

```
Why Framer?
  ✅ No coding needed
  ✅ Templates available
  ✅ Fast to launch (1-2 days)
  ✅ Good mobile experience
  ✅ Form integration easy (Zapier → Convertkit)
  ✅ Publish to custom domain easy

Setup (Total: 6 hours):
  1. Sign up: https://framer.com/
  2. Start project
  3. Choose template or start blank
  4. Add sections (Hero, Features, Pricing, FAQ, CTA, Video, Footer)
  5. Customize colors + content
  6. Connect form to Zapier + Convertkit
  7. Publish to dnpeople.id

Cost: Free while building, $0-30/month when published
```

---

## Section 1: Hero Section Implementation

### HTML (if custom Next.js build)

```jsx
// components/Hero.tsx

export default function Hero() {
  const scrollToForm = () => {
    const element = document.getElementById('email-form');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToVideo = () => {
    const element = document.getElementById('demo-video');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero bg-white py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              HRIS Sederhana untuk SME Indonesia
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Kelola payroll, attendance, dan leave dalam satu dashboard. 
              Tanpa setup rumit. Tanpa hidden cost.
            </p>

            {/* Benefits */}
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-gray-700">
                  Setup 15 menit — import karyawan dan mulai
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-gray-700">
                  BPJS + PPh 21 — compliance built-in
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-gray-700">
                  Support lokal — team yang paham HR Indonesia
                </span>
              </li>
            </ul>

            {/* CTAs */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={scrollToForm}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Mulai 2 Bulan Gratis
              </button>
              <button
                onClick={scrollToVideo}
                className="text-gray-900 border-b-2 border-gray-900 hover:border-orange-500 pb-1 font-semibold transition"
              >
                Lihat Demo →
              </button>
            </div>
          </div>

          {/* Right: Screenshot */}
          <div className="hidden md:block">
            <img
              src="/images/hero-screenshot.png"
              alt="dnPeople dashboard showing payroll overview"
              className="rounded-lg shadow-lg w-full"
              loading="lazy"
            />
          </div>
        </div>

        {/* Mobile image (below text) */}
        <div className="md:hidden mt-8">
          <img
            src="/images/hero-screenshot.png"
            alt="dnPeople dashboard showing payroll overview"
            className="rounded-lg shadow-lg w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
```

### Framer Implementation

```
1. Open Framer → New Project
2. Add Hero component
   - Background: white
   - Layout: 2 columns (desktop), 1 column (mobile)
   - Left: Text frame
     - Add Heading (text: "HRIS Sederhana untuk SME Indonesia")
       Style: 48px, bold, navy color
     - Add Paragraph (subheading text)
       Style: 20px, gray color
     - Add 3 bullet points (✓ Setup 15 menit, etc)
     - Add 2 buttons:
       Primary: "Mulai 2 Bulan Gratis" (orange, full width on mobile)
       Secondary: "Lihat Demo" (outline style)
   - Right: Image component
     - Upload: hero-screenshot.png
     - Fit: contain
     - Shadow: light shadow preset

3. Interactions:
   - Primary button: "On Click" → "Scroll to ID: email-form"
   - Secondary button: "On Click" → "Scroll to ID: demo-video"

4. Mobile responsive:
   - Set breakpoint: 640px
   - At mobile: Stack vertically, buttons full width, font smaller
```

### Copy (Ready to Use)

```
HEADLINE:
  "HRIS Sederhana untuk SME Indonesia"

SUBHEADING:
  "Kelola payroll, attendance, dan leave dalam satu dashboard.
   Tanpa setup rumit. Tanpa hidden cost."

BENEFITS:
  ✓ Setup 15 menit — import karyawan dan mulai
  ✓ BPJS + PPh 21 — compliance built-in
  ✓ Support lokal — team yang paham HR Indonesia

BUTTON TEXTS:
  Primary: "Mulai 2 Bulan Gratis"
  Secondary: "Lihat Demo"
```

---

## Section 2: Features Grid Implementation

### Framer Setup

```
1. Add Features component
   - Title: "Fitur Unggulan"
   - Subtitle: "Semua yang Anda butuhkan dalam satu platform"
   
2. Add Grid: 3 columns (desktop), 1 column (mobile)
   - Gap: 24px
   - Item template: Feature card
   
3. Create Feature Card component:
   - Icon (64px, brand color #1e3a8a)
   - Title (24px, bold, dark gray)
   - Description (16px, medium gray, 2-3 lines)
   - Hover effect: translateY(-2px), shadow increase
   
4. Repeat for 6 features:
   Feature 1: Payroll Otomatis
   Feature 2: Attendance Fleksibel
   Feature 3: Leave Management
   Feature 4: Multi-tenant & SSO
   Feature 5: Reporting & Analytics
   Feature 6: API & Integrations
```

### Feature Copy (Ready to Use)

```
Feature 1: Payroll Otomatis
  Description: "Hitung gaji, BPJS, PPh 21 otomatis. Slip gaji digital 
               untuk setiap karyawan. Laporan pajak siap audit."

Feature 2: Attendance Fleksibel
  Description: "Absensi manual, GPS, QR, atau WiFi. Koreksi absensi 
               dengan bukti. Laporan kehadiran real-time."

Feature 3: Leave Management
  Description: "Jatah cuti otomatis. Approval workflow. Integrasi dengan 
               payroll. History & carry-forward tracking."

Feature 4: Multi-tenant & SSO
  Description: "Multi-cabang dalam satu platform. Login SSO (Google, 
               Microsoft, SAML). Custom domain untuk enterprise."

Feature 5: Reporting & Analytics
  Description: "Laporan attendance, payroll, leave. Export Excel/PDF. 
               Turnover risk, payroll trends. Custom reports builder."

Feature 6: API & Integrations
  Description: "API documentation + SDK. Webhook untuk automation. 
               Partner ecosystem (bank, accounting, HRIS tools)."
```

### Icons (Where to Get)

```
Use Framer's built-in icons OR:
- https://heroicons.com/ (free, MIT licensed)
- https://iconpark.bytedance.com/ (free)
- Custom SVG icons

Icon files needed:
  1. Payroll: money bag or calculator icon
  2. Attendance: clock or check-in icon
  3. Leave: calendar or vacation icon
  4. Multi-tenant: building or network icon
  5. Reporting: chart or bar graph icon
  6. Integrations: plug or integration icon

Size: 64x64px PNG or SVG
Color: Brand navy (#1e3a8a)
```

---

## Section 3: Pricing Table Implementation

### Framer Setup

```
1. Add Pricing component
   - Title: "Transparent Pricing"
   - Subtitle: "Pilih plan sesuai kebutuhan. Bisa upgrade kapan saja."

2. Add Grid: 5 columns (desktop → 2 at tablet → 1 at mobile)
   - Gap: 16px
   - Item template: Pricing card

3. Create Pricing Card component:
   Layout:
   - Plan name (H3, 20px, bold)
   - Employee range (14px, gray, "1-50 emp", "51-300 emp", etc)
   - Price (32px, bold, orange or navy) 
     Format: "Rp 20K" or "Rp 25K"
   - Subtext: "/emp/bulan"
   - Feature list (14px, 6-8 bullets)
   - CTA button (full width, 90% of card)

4. Special styling:
   - FREE tier: No highlight
   - PROFESSIONAL (middle): Badge "Paling Populer" + highlight color
   - ENTERPRISE: "Custom Pricing"

5. Pricing data structure:
   {
     name: "STARTER",
     employees: "1-50 emp",
     price: 20000,
     features: [
       "Payroll basic",
       "Attendance",
       "Leave management",
       ...
     ],
     cta: {
       text: "Start 2 Month Free Trial",
       action: "scroll-to-form"
     }
   }
```

### Pricing Copy & Data

```
TIER 1: FREE
  Employee range: "s/d 100 emp"
  Price: "Rp 0"
  Features:
    ✓ Dashboard
    ✓ Org setup
    ✗ Payroll
    ✗ Attendance
  CTA: "Create Account"

TIER 2: STARTER
  Employee range: "1-50 emp"
  Price: "Rp 20K"
  Subtext: "/emp/bulan"
  Features:
    ✓ Payroll
    ✓ Attendance
    ✓ Leave
    ✓ Basic reports
  CTA: "Start 2 Month Free Trial"

TIER 3: PROFESSIONAL (RECOMMENDED)
  Badge: "Paling Populer"
  Employee range: "51-300 emp"
  Price: "Rp 25K"
  Subtext: "/emp/bulan"
  Features:
    ✓ Payroll
    ✓ Recruitment
    ✓ Performance mgmt
    ✓ Training
    ✓ Talent dev
    ✓ Advanced reports
  CTA: "Start 2 Month Free Trial"

TIER 4: BUSINESS
  Employee range: "300+ emp"
  Price: "Rp 20K"
  Subtext: "/emp/bulan (volume)"
  Features:
    ✓ Multi-cabang
    ✓ Unlimited API
    ✓ Custom domain
    ✓ White-label
    ✓ Dedicated AC
  CTA: "Start 2 Month Free Trial"

TIER 5: ENTERPRISE
  Employee range: "Custom"
  Price: "Custom"
  Features:
    ✓ SSO + SCIM
    ✓ White-label
    ✓ Dedicated support
    ✓ SLA guarantee
    ✓ Custom integrations
  CTA: "Contact Sales"
```

---

## Section 4: FAQ Accordion Implementation

### React Component (if custom build)

```jsx
// components/FAQ.tsx
'use client';
import { useState } from 'react';

const faqItems = [
  {
    q: "Bagaimana cara daftar?",
    a: "Klik 'Mulai 2 Bulan Gratis', isi email, dan buat akun. Tidak perlu kartu kredit."
  },
  {
    q: "Berapa biaya setup?",
    a: "Tidak ada. Setup gratis, tinggal import data + training."
  },
  {
    q: "Bisa upgrade/downgrade kapan saja?",
    a: "Ya, bisa. Charge pro-rata untuk perubahan di tengah bulan."
  },
  {
    q: "Ada trial gratis?",
    a: "Ya, 2 bulan gratis untuk beta customers."
  },
  {
    q: "Accepted payment methods?",
    a: "Xendit (transfer bank, e-wallet, kartu kredit, cicilan)."
  },
  // ... more FAQ items
];

export default function FAQ() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section className="faq py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Pertanyaan Sering Ditanyakan
        </h2>

        <div className="max-w-2xl mx-auto space-y-2">
          {faqItems.map((item, idx) => (
            <details
              key={idx}
              open={expanded === idx}
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              className="border border-gray-300 rounded-lg p-4 cursor-pointer"
            >
              <summary className="font-semibold text-lg text-gray-900 flex justify-between">
                {item.q}
                <span>{expanded === idx ? '−' : '+'}</span>
              </summary>
              <p className="text-gray-700 mt-3 text-base leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Framer Setup

```
1. Add FAQ component
   - Add Accordion component (built-in to Framer)
   - Item: Question + Answer pairs

2. For each item:
   - Click to expand (toggle)
   - Chevron icon shows state (+ open, - closed)
   - Smooth animation (0.3s)
   - One open at a time (or allow multiple)

3. Question styling: 16px, bold, dark
   Answer styling: 16px, regular, gray, with line-height 1.6
```

### FAQ Content (12-15 Items)

```
ACCOUNT & SIGNUP:
Q: Bagaimana cara daftar?
A: Klik "Mulai 2 Bulan Gratis", isi email dan nama, buat akun. Tidak perlu kartu kredit.

Q: Butuh kartu kredit untuk trial?
A: Tidak. Trial gratis tanpa kartu kredit. Kartu kredit hanya diperlukan setelah trial berakhir.

Q: Bisa cancel kapan saja?
A: Ya, tanpa penalty. Cancel via dashboard settings, langsung efektif.

Q: Apa saja yang termasuk dalam 2 bulan gratis?
A: Akses penuh ke plan Anda (tergantung tier). Support gratis. Training gratis.

FEATURES & CAPABILITIES:
Q: Apakah dnPeople support multi-cabang?
A: Ya, untuk tier Business dan Enterprise. Unlimited cabang, unified reporting.

Q: Bisa integrasi dengan sistem akuntansi kami?
A: Ya, via API atau JSON webhooks. Contact us untuk custom integration.

Q: Berapa jumlah karyawan maksimal?
A: Unlimited. Skalabilitas tergantung tier (FREE: 100, STARTER: 50, etc).

Q: Bisa export data?
A: Ya, export employee, payroll, attendance, leave ke Excel/PDF. Juga via API.

COMPLIANCE & SECURITY:
Q: Apakah BPJS + PPh 21 sudah built-in?
A: Ya, sesuai regulasi terbaru Indonesia (PPh 21, PPN, UU PDP, BPJS).

Q: Aman simpan data gaji?
A: Ya. Encrypted AES-256, regular backup, audit logs, compliant UU PDP.

Q: Bagaimana jika ada data breach?
A: Rare, but if happens: we notify within 72 hours, provide incident report, assist recovery.

SUPPORT & TRAINING:
Q: Apakah ada support lokal?
A: Ya, support@dnpeople.id (email), chat, phone. Jam 8am-6pm Jakarta time.

Q: Bagaimana jika ada issue saat setup?
A: Free onboarding call + training video provided. Support team assist via chat/email.

Q: Ada refund policy?
A: Uang kembali 100% selama 14 hari jika tidak puas, no questions asked.
```

---

## Section 5: Email Capture Form Implementation

### Convertkit Form Integration (Zapier)

```
Setup Steps:

1. Create Convertkit form:
   - Login to Convertkit.com
   - Create form (single opt-in, no double opt-in for speed)
   - Form name: "dnPeople Beta Signups"
   - Subscribe to tag: "beta-signups"
   - Form fields:
     [ ] Email (required)
     [ ] Name (required)
     [ ] Company (required)
     [ ] Employee count (required, dropdown)

2. Get Convertkit form ID:
   - In Convertkit: Forms → Select form → Settings
   - Copy form ID (looks like: 1234567)

3. Create Zapier integration:
   - Login to zapier.com
   - Create zap: "Form Submit → Convertkit"
   - Trigger: "Webhook" (set up webhook on website)
   - Action: "Convertkit - Add subscriber"
   - Map fields:
     email → Email
     name → First Name
     company → Custom Field
     employee_count → Custom Field
   - Tag: "beta-signups"

4. Get Zapier webhook URL:
   - In Zapier zap: Webhook trigger
   - Copy webhook URL (looks like: https://hooks.zapier.com/hooks/catch/...)

5. Add webhook to website:
   - In form submit handler:
     fetch(ZAPIER_WEBHOOK_URL, {
       method: 'POST',
       body: JSON.stringify({
         email,
         name,
         company,
         employee_count
       })
     })

6. Verify:
   - Submit test form on website
   - Check Convertkit: new contact should appear
   - Check Convertkit: tag "beta-signups" applied
```

### React Form Component

```jsx
// components/EmailForm.tsx
'use client';
import { useState } from 'react';

export default function EmailForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [employees, setEmployees] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate
      if (!email || !name || !company || !employees) {
        setError('Semua field harus diisi');
        setLoading(false);
        return;
      }

      if (!email.includes('@')) {
        setError('Email tidak valid');
        setLoading(false);
        return;
      }

      // Submit to Zapier webhook
      const response = await fetch(process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK, {
        method: 'POST',
        body: JSON.stringify({ email, name, company, employees }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setSuccess(true);
        setEmail('');
        setName('');
        setCompany('');
        setEmployees('');
      } else {
        setError('Error submitting form. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
        <h3 className="font-bold text-green-900">Terima kasih!</h3>
        <p className="text-green-800 mt-2">Check email Anda untuk instruksi selanjutnya.</p>
        <p className="text-green-800">Tim kami akan hubungi dalam 24 jam.</p>
        <a href="#demo-video" className="text-green-600 underline mt-3 block">
          Jadwalkan onboarding call →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          placeholder="you@company.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Nama Perusahaan
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          placeholder="Acme Corp"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Jumlah Karyawan
        </label>
        <select
          value={employees}
          onChange={(e) => setEmployees(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          required
        >
          <option value="">-- Pilih --</option>
          <option value="10-50">10-50 karyawan</option>
          <option value="51-100">51-100 karyawan</option>
          <option value="101-300">101-300 karyawan</option>
          <option value="300+">300+ karyawan</option>
        </select>
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Daftar Sekarang'}
      </button>
    </form>
  );
}
```

### Framer Form Setup

```
1. Add Form component (Framer built-in)
   - Form name: "beta-signup-form"
   
2. Fields:
   - Email input (type: email, required)
   - Name input (type: text, required)
   - Company input (type: text, required)
   - Employee count select (required)

3. Submit button:
   - Text: "Daftar Sekarang"
   - Style: Full width, orange background
   - On submit: Connect to Zapier webhook
   
4. Success message:
   - "Terima kasih! Check email Anda."
   - Link to "Schedule call" (Calendly)
   
5. Zapier webhook:
   - In Framer form settings:
     When form submits → Send POST to Zapier webhook URL
     Include all form fields
```

---

## Section 6: Demo Video Implementation

### Video Setup

```
Video file:
  - Format: MP4 or WebM (optimized for web)
  - Duration: 2-3 minutes (max)
  - Resolution: 1920x1080 (at least)
  - File size: < 100MB (compressed with ffmpeg)
  - Audio: Voiceover (Indonesian) or background music

Hosting options:
  1. YouTube (embedded):
     - Upload to YouTube (private or unlisted during dev)
     - Get embed code
     - Embed in website
  
  2. Vimeo (paid but better quality):
     - Upload to Vimeo
     - Get embed code
  
  3. Self-hosted (Cloudinary or similar):
     - Upload to Cloudinary
     - Use CDN for delivery
     - Set up adaptive bitrate streaming

Framer implementation:
  1. Add Video component
  2. Choose hosting (YouTube recommended for simplicity)
  3. Paste YouTube video ID
  4. Set aspect ratio: 16:9
  5. Add title/caption below video
  6. Optional: Thumbnail image (if self-hosted)
```

### Video Content Outline (Script)

```
Duration: 2 minutes 30 seconds

00:00-00:15: Intro
  "Welcome to dnPeople. Let's see how it works in 2 minutes."
  Show: logo + product name

00:15-00:45: Login & Dashboard
  "First, login with your email."
  Show: Login page → dashboard
  Highlight: Key metrics (employees, payroll status, leave pending)

00:45-01:15: Payroll
  "Run payroll in 3 clicks. BPJS and PPh 21 calculated automatically."
  Show: Payroll run screen → Configure payroll → Run → Results
  Highlight: Automatic calculation, no errors

01:15-01:45: Attendance
  "Track attendance. Manual entry, GPS, QR, or WiFi."
  Show: Attendance page → Clock in/out → Reports
  Highlight: Multiple check-in methods, real-time data

01:45-02:15: Leave & Reports
  "Manage leave requests and access powerful reports."
  Show: Leave request flow → Approval → Reports
  Highlight: Automatic approval, export to Excel/PDF

02:15-02:30: CTA
  "Start your free 2-month trial today. No credit card required."
  Show: CTA button → Website URL
  Text: "dnpeople.id"
```

---

## Section 7: Analytics & Tracking Setup

### Google Analytics 4 Code

```jsx
// app/layout.tsx or _document.tsx
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        {/* Google Analytics 4 */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Event Tracking Code

```jsx
// Track form submit
const handleFormSubmit = () => {
  // Google Analytics
  gtag('event', 'beta_signup', {
    email: userEmail,
    employee_count: employeeCount
  });
  
  // Convertkit via Zapier (already done above)
};

// Track CTA button click
const handleCTAClick = (buttonName: string) => {
  gtag('event', 'cta_click', {
    button_name: buttonName,
    page_section: 'hero' // or 'footer', 'pricing', etc
  });
};

// Track video play
const handleVideoPlay = () => {
  gtag('event', 'video_play', {
    video_title: 'Product Demo'
  });
};

// Track FAQ expand
const handleFAQExpand = (faqTopic: string) => {
  gtag('event', 'faq_expand', {
    faq_topic: faqTopic
  });
};

// Track section scroll
useEffect(() => {
  const handleScroll = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      const rect = pricingSection.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        gtag('event', 'scroll_to_pricing');
      }
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

## Performance Optimization

### Image Optimization

```bash
# Convert images to WebP (smaller file size)
ffmpeg -i hero-screenshot.png -c:v libwebp -quality 80 hero-screenshot.webp

# Use Next.js Image component for automatic optimization
<Image
  src="/images/hero-screenshot.webp"
  alt="dnPeople dashboard"
  width={1200}
  height={800}
  quality={80}
  priority // for above-fold images
/>
```

### CSS & JS Minification

```
Use Next.js built-in minification (automatic)
Or use Tailwind CSS (minimal CSS classes)
```

### Lazy Loading

```jsx
// Lazy load off-screen sections
<img
  src="feature-screenshot.png"
  alt="..."
  loading="lazy"
/>

// Or React component lazy loading
const PricingSection = dynamic(() => import('./Pricing'), {
  loading: () => <div>Loading...</div>
});
```

---

## Launch Checklist (Implementation)

```
BEFORE PUBLISHING:

Content:
  [ ] All copy reviewed + no typos
  [ ] Prices accurate + formatted correctly
  [ ] FAQ answers complete + helpful
  [ ] Contact email correct (support@dnpeople.id)

Images & Assets:
  [ ] Hero screenshot optimized (WebP, < 500KB)
  [ ] Feature icons all 6 present + correct colors
  [ ] Logo SVG + PNG + favicon ready
  [ ] Video MP4 uploaded (< 100MB)

Form & Integrations:
  [ ] Form validation working (required fields, email format)
  [ ] Zapier webhook URL configured
  [ ] Convertkit form tag "beta-signups" created
  [ ] Test submit: email should appear in Convertkit
  [ ] Thank you message displays + correct
  [ ] Calendly embedded (link or popup)

Responsive Design:
  [ ] Tested on iPhone 12 (390px)
  [ ] Tested on iPad (768px)
  [ ] Tested on desktop (1200px, 1920px)
  [ ] No horizontal scroll on mobile
  [ ] All buttons tappable (48px+ height)
  [ ] Text readable (16px+ on mobile)

Performance:
  [ ] Lighthouse > 90 (run audit)
  [ ] Page load < 3 seconds (real devices)
  [ ] No layout shift (CLS < 0.1)
  [ ] Images lazy-loaded

Analytics:
  [ ] Google Analytics connected + events firing
  [ ] Event tracking tested (form submit, CTA click, video play)
  [ ] Conversion funnel visible in GA

SEO & Meta:
  [ ] Title: "dnPeople — HRIS Sederhana untuk SME Indonesia"
  [ ] Description: "[Short description with keywords]"
  [ ] Open Graph tags present + correct
  [ ] Schema.org data present (Organization, Product)

Security:
  [ ] HTTPS enabled (green lock visible)
  [ ] No API keys/secrets in frontend code
  [ ] Form submissions secure (no email in URL)
  [ ] Content Security Policy header set

Final:
  [ ] DNS configured (dnpeople.id points to hosting)
  [ ] SSL certificate installed + valid
  [ ] Monitoring/uptime alert active
  [ ] Backup configured
  [ ] Dozer final review + approval

✅ ALL ITEMS COMPLETE? GO LIVE!
```

---

## Deployment (Vercel for Next.js or Framer's Hosting)

### Vercel Deployment (if custom Next.js)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variables
vercel env add NEXT_PUBLIC_ZAPIER_WEBHOOK https://hooks.zapier.com/...

# 4. Connect domain
# In Vercel dashboard: Settings → Domains → Add dnpeople.id
# Update DNS (point to Vercel nameservers)

# 5. Deploy branch
git push origin main  # Auto-deploys to Vercel
```

### Framer Deployment

```
1. In Framer: File → Publish
2. Choose domain: dnpeople.id
3. Configure DNS (Framer provides instructions)
4. Enable SSL (automatic)
5. Done!
```

---

*Last Updated: 22 Juli 2026 | Owner: Dozer | Status: Implementation Ready — Build & Launch*
