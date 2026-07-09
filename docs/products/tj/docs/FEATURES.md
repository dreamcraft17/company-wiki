# Fitur & Tech Stack — Trusted Jurist

Katalog **lengkap & terbaru** fitur produk + tech stack website Trusted Jurist Law Firm.

| | |
|---|---|
| **Versi aplikasi** | `0.2.0` |
| **Status** | Go-live readiness |
| **Domain** | `https://trustedjurist.co.id` |
| **Bahasa UI** | Bahasa Indonesia |
| **Terakhir diperbarui** | 8 Juli 2026 |
| **Repo** | `tj` |

**Dokumen terkait:** [PRD](./PRD.md) · [current-implementation](../current-implementation.md) · [go-live checklist](./go-live-checklist.md)

---

## 1. Tech Stack

### 1.1 Runtime & framework

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | **Next.js** (App Router) | 16.2.6 |
| UI library | **React** / React DOM | 19.2.4 |
| Bahasa | **TypeScript** (strict) | 5.x |
| Bundler | Turbopack (via Next.js) | built-in |

### 1.2 Styling & motion

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| CSS | **Tailwind CSS** | v4 |
| PostCSS | `@tailwindcss/postcss` | v4 |
| Animasi | **Framer Motion** | 12.38 |
| Ikon | **Lucide React** | 1.16 |
| Class utils | `clsx` + `tailwind-merge` | 2.x / 3.x |
| Fonts | Cormorant Garamond + Manrope | `next/font/google` |

### 1.3 Backend & security

| Layer | Teknologi | Versi / catatan |
|-------|-----------|-----------------|
| Email | **Resend** | 6.12 — konfirmasi user + notifikasi admin |
| Anti-bot | **Google reCAPTCHA v3** | Score ≥ 0.5 |
| Rate limit | In-memory per IP | 5 request / menit |
| API | Next.js Route Handler | `POST /api/contact` |

### 1.4 Tooling

| Tool | Versi |
|------|-------|
| ESLint | 9 + `eslint-config-next` 16.2.6 |
| Node types | `@types/node` 20 |
| React types | `@types/react` / `@types/react-dom` 19 |

### 1.5 Scripts npm

```bash
npm run dev      # Development (localhost:3000)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

### 1.6 Environment variables

| Variable | Wajib (prod) | Fungsi |
|----------|--------------|--------|
| `RESEND_API_KEY` | Ya | Auth Resend |
| `RESEND_FROM_EMAIL` | Ya | Pengirim terverifikasi |
| `ADMIN_EMAIL` | Ya | Inbox lead |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Ya | Site key browser |
| `RECAPTCHA_SECRET_KEY` | Ya | Verifikasi server |

Template: `.env.example` · Dev tanpa key: form sukses + log console, reCAPTCHA dilewati.

### 1.7 Design tokens

| Token | Nilai | Penggunaan |
|-------|-------|------------|
| Navy | `#121c2b` | Teks utama, header gelap, CTA |
| Gold | `#8a7340` | Accent, fokus, eyebrow |
| Cream | `#f7f4ef` | Background |
| Border | `#d9d2c6` | Garis & input |
| Muted | `#5c6b7a` | Teks sekunder |

Tipografi: serif (Cormorant) untuk heading · sans (Manrope) untuk body. Skala via `lib/typography.ts`.

---

## 2. Peta Fitur (ringkas)

```
Website Trusted Jurist v0.2.0
├── Layout global          Navbar · Footer · Skip link · 404 · Loading · Transition
├── Halaman publik (7)
│   ├── /                  Homepage 9 section editorial
│   ├── /about             Profil · komitmen · nilai inti
│   ├── /practice-areas    8 bidang + deep link
│   ├── /team              Managing Partner · kredibilitas · slot tim
│   ├── /insights          3 artikel (draf / coming-soon)
│   ├── /contact           Form + email/telepon/WhatsApp
│   └── /privacy           Kebijakan privasi
├── Backend
│   └── POST /api/contact  Validasi · rate limit · reCAPTCHA · Resend
├── SEO
│   ├── Metadata per halaman · JSON-LD LegalService
│   ├── /sitemap.xml · /robots.txt
│   └── /opengraph-image · /icon
└── Data layer             data.ts · constants.ts · types
```

---

## 3. Fitur Global (semua halaman)

| # | Fitur | Detail | Status |
|---|-------|--------|--------|
| G1 | Navbar fixed | Logo, 6 nav link, CTA **Konsultasi** | ✅ |
| G2 | Scroll-aware navbar | Transparan di hero homepage; solid setelah scroll | ✅ |
| G3 | Indikator route aktif | Garis emas animasi `layoutId` | ✅ |
| G4 | Menu mobile | Hamburger, overlay, `aria-expanded`, `role="dialog"` | ✅ |
| G5 | Auto-close menu | Tertutup otomatis saat ganti route | ✅ |
| G6 | Footer lengkap | Brand, navigasi, praktik, kontak, disclaimer, copyright | ✅ |
| G7 | Link kebijakan privasi | Di footer + di bawah form | ✅ |
| G8 | Skip link a11y | “Lewati ke konten utama” → `#main-content` | ✅ |
| G9 | Page transition | Fade via `PageTransition` + `template.tsx` | ✅ |
| G10 | Loading state | `loading.tsx` global | ✅ |
| G11 | Halaman 404 | Branded + CTA beranda / konsultasi | ✅ |
| G12 | `lang="id"` | Dokumen HTML locale Indonesia | ✅ |
| G13 | Reduced motion | `prefers-reduced-motion` di CSS global | ✅ |
| G14 | Responsive | Mobile-first (sm / md / lg) | ✅ |

---

## 4. Fitur per Halaman

### 4.1 Beranda `/`

| # | Section | Komponen | Isi |
|---|---------|----------|-----|
| H1 | Hero | `Hero` | Headline, subheadline, catatan operasional, dual CTA |
| H2 | Trust colophon | `HomeTrustColophon` | Indikator berdiri, lokasi, fokus, pendekatan |
| H3 | Kredibilitas | `HomeCredibilityChapter` | Pilar kredibilitas firma |
| H4 | Tentang preview | `HomeAboutSpread` | Cuplikan profil → `/about` |
| H5 | Indeks praktik | `HomePracticeIndex` | 4 dari 8 bidang unggulan |
| H6 | Founder | `HomeFounderChapter` | Managing Partner highlight |
| H7 | Standar kerja | `HomeStandardsCascade` | Komitmen / standar advokasi |
| H8 | Wawasan preview | `HomeInsightsJournal` | 3 artikel terbaru |
| H9 | Penutup | `HomeClosingComposition` | CTA penutup + email |

### 4.2 Tentang `/about`

| # | Fitur | Status |
|---|-------|--------|
| A1 | Hero ringkas (profil firma) | ✅ |
| A2 | `AboutProfileEditorial` — visi, misi, narasi | ✅ |
| A3 | `TrustCommitments` — janji operasional | ✅ |
| A4 | 5× `ValueCard` — nilai inti | ✅ |
| A5 | `CTASection` konsultasi | ✅ |

### 4.3 Bidang praktik `/practice-areas`

| # | Fitur | Status |
|---|-------|--------|
| P1 | Daftar 8 bidang praktik | ✅ |
| P2 | Kartu detail: deskripsi, scope, kebutuhan klien, output hukum | ✅ |
| P3 | Ikon Lucide via `IconMap` | ✅ |
| P4 | Deep link `#id` per bidang | ✅ |
| P5 | CTA konsultasi | ✅ |

**Delapan bidang:**

1. Litigation & Dispute Resolution  
2. Anti-Corruption & Governance  
3. Corporate & Commercial Law  
4. Mining, Plantation & Natural Resources  
5. Criminal Law & Investigation Support  
6. Public Policy & Regulatory Advisory  
7. Customs, Smuggling & Compliance  
8. Legal Opinion & Strategic Advisory  

### 4.4 Tim `/team`

| # | Fitur | Status |
|---|-------|--------|
| T1 | `TeamCard` Managing Partner — Dr. Andin Sofyanoor, SH., MH. | ✅ |
| T2 | `FounderCredibility` — pendidikan, pengalaman, fokus, kegiatan | ✅* |
| T3 | 3× `TeamRoleSlot` kosong transparan (Partner / SA / Associate) | ✅ |
| T4 | CTA bergabung / kontak | ✅ |

\*UI selesai; nama universitas konkret menunggu dokumen resmi firma.

### 4.5 Wawasan `/insights`

| # | Fitur | Status |
|---|-------|--------|
| I1 | Daftar 3 artikel dengan kategori & estimasi baca | ✅ |
| I2 | Status transparan: `editorial-draft` / `coming-soon` | ✅ |
| I3 | Metadata: konten dalam penyusunan | ✅ |
| I4 | Halaman detail `/insights/[slug]` | ❌ backlog |

| Judul | Kategori | Status konten |
|-------|----------|---------------|
| Membangun Kepercayaan Publik terhadap Penegakan Hukum | Hukum Publik | Draf editorial |
| Peran Advokat dalam Agenda Antikorupsi | Antikorupsi | Draf editorial |
| Kepatuhan Hukum di Sektor Pertambangan dan Perkebunan | Sektor Regulasi | Segera hadir |

### 4.6 Kontak `/contact`

| # | Fitur | Status |
|---|-------|--------|
| C1 | Form konsultasi (varian `consultation`) | ✅ |
| C2 | Field: nama, email, telepon opsional, bidang, ringkasan | ✅ |
| C3 | State: idle → submitting → success → reset | ✅ |
| C4 | Error UI (`role="alert"`) | ✅ |
| C5 | Consent link ke `/privacy` | ✅ |
| C6 | Blok kerahasiaan (belum hubungan advokat–klien) | ✅ |
| C7 | Kanal email (`mailto:`) | ✅ |
| C8 | Kanal telepon (`tel:`) | ✅* |
| C9 | WhatsApp deep link `wa.me` | ✅* |
| C10 | Jam operasional + catatan konfirmasi janji | ✅ |
| C11 | Peta Google Maps | ❌ backlog |

\*Nomor masih placeholder `XXXX` — blocker go-live.

### 4.7 Privasi `/privacy`

| # | Fitur | Status |
|---|-------|--------|
| V1 | Kebijakan privasi lengkap (Bahasa Indonesia) | ✅ |
| V2 | Section: data, penggunaan, keamanan, hak, cookie/pihak ketiga | ✅ |
| V3 | Email firma + link ke form konsultasi | ✅ |
| V4 | Metadata SEO dedicated | ✅ |

---

## 5. Backend Form (`POST /api/contact`)

Pipeline:

```
Client ContactForm
  → (opsional) reCAPTCHA v3 token
  → POST /api/contact
  → Rate limit 5/menit/IP
  → Validasi body
  → Verify reCAPTCHA (prod)
  → Resend: email user (konfirmasi)
  → Resend: email admin (lead + replyTo)
  → JSON { success: true }
```

| # | Fitur | Modul | Status |
|---|-------|-------|--------|
| B1 | Validasi required + email + max length | `lib/contact/validate.ts` | ✅ |
| B2 | Escape HTML di template email | `lib/contact/sanitize.ts` | ✅ |
| B3 | Rate limiting in-memory | `lib/contact/rate-limit.ts` | ✅ |
| B4 | reCAPTCHA score ≥ 0.5 | `lib/contact/recaptcha.ts` | ✅ |
| B5 | Email konfirmasi ke pengirim | `send-contact-email.ts` | ✅ |
| B6 | Email lead ke admin + `replyTo` | `send-contact-email.ts` | ✅ |
| B7 | Dev fallback tanpa API key | log console | ✅ |
| B8 | Script reCAPTCHA di layout | `RecaptchaScript.tsx` | ✅ |
| B9 | Rate limit Redis (multi-instance) | — | ❌ backlog |

---

## 6. SEO & Discoverability

| # | Fitur | Implementasi | Status |
|---|-------|--------------|--------|
| S1 | Metadata unik per halaman | `createMetadata()` di `lib/seo.ts` | ✅ |
| S2 | Canonical URL | `alternates.canonical` | ✅ |
| S3 | Open Graph | type, locale, title, description, images | ✅ |
| S4 | Twitter Card | `summary_large_image` | ✅ |
| S5 | Hreflang-ready | `id` + `en?lang=en` (switch belum live) | ✅* |
| S6 | JSON-LD | `LegalService` di `layout.tsx` | ✅ |
| S7 | Sitemap | `/sitemap.xml` ← `app/sitemap.ts` | ✅ |
| S8 | Robots | `/robots.txt` — allow `/`, disallow `/api/` | ✅ |
| S9 | OG image dinamis | `/opengraph-image` 1200×630 | ✅ |
| S10 | Favicon dinamis | `/icon` 32×32 | ✅ |
| S11 | Keywords firma hukum | di metadata helper | ✅ |
| S12 | Analytics | — | ❌ backlog |

\*Field `*En` di data siap; bahasa Inggris belum di-switch.

---

## 7. Desain, Animasi & Komponen UI

### Design system
- Palette navy / gold / cream (CSS variables + Tailwind theme)
- Tone sections: `tone-cream`, `tone-paper`, `tone-navy`
- Layout editorial: `flow-editorial`, `hairline`, `section-pad`
- Tipografi token: `t.h1`, `t.lead`, `t.eyebrow`, `t.body`, dll.

### Animasi (Framer Motion)
| Fitur | Komponen / util |
|-------|-----------------|
| Reveal on scroll | `AnimatedReveal` |
| Stagger children | `MotionStagger` |
| Page enter | `PageTransition` |
| Navbar indicator | `layoutId` |
| Reduced motion hook | `useReducedMotion` di beberapa komponen |

### UI primitives & shared
| Komponen | Fungsi |
|----------|--------|
| `Button` / `ButtonLink` | Primary, secondary, gold, ghost + loading |
| `Container` | Narrow / default / wide |
| `IconMap` | String nama → Lucide icon |
| `Hero` | Compact / full, dual CTA, colophon |
| `SectionHeader` | Eyebrow + judul + deskripsi |
| `CTASection` | CTA konsultasi berulang |
| `EmptyState` | State kosong |
| `EditorialProse` / `EditorialBlock` | Blok longform |
| `ApproachPillars` | Metodologi kerja |

---

## 8. Data & Konfigurasi

| Sumber | Isi |
|--------|-----|
| `src/lib/constants.ts` | `SITE_CONFIG`, `FOOTER_LEGAL`, CTA labels |
| `src/lib/data.ts` | Navigasi, `CONTACT_CONFIG`, praktik, tim, insights, nilai, form subjects |
| `src/types/index.ts` | TypeScript interfaces semua entitas konten |
| Field `labelEn` / `titleEn` | Siap ekspansi i18n |

**Konten operasional (sebelum go-live):**
- Telepon & WhatsApp masih `REVIEW` / `XXXX`
- Email: `konsultasi@trustedjurist.co.id`
- Jam: Senin–Jumat 08:00–17:00 WIB · timezone `Asia/Jakarta`

---

## 9. Keamanan & Privasi

| # | Fitur | Status |
|---|-------|--------|
| K1 | Secret hanya di env (gitignore `.env*`) | ✅ |
| K2 | Validasi input server-side | ✅ |
| K3 | Escape HTML email (anti XSS di konten email) | ✅ |
| K4 | reCAPTCHA v3 production | ✅ |
| K5 | Rate limiting form | ✅ |
| K6 | Halaman `/privacy` + consent di form | ✅ |
| K7 | Disclaimer hukum di footer | ✅ |
| K8 | `/api/` tidak diindeks robots | ✅ |

---

## 10. Routes lengkap

| Route | Tipe | Fitur utama |
|-------|------|-------------|
| `/` | Static | Homepage editorial |
| `/about` | Static | Profil & nilai |
| `/practice-areas` | Static | 8 bidang + anchors |
| `/team` | Static | MP & struktur tim |
| `/insights` | Static | Daftar wawasan (non-final) |
| `/contact` | Static | Form + kanal kontak |
| `/privacy` | Static | Kebijakan privasi |
| `/api/contact` | Dynamic | Backend email |
| `/sitemap.xml` | Generated | SEO sitemap |
| `/robots.txt` | Generated | Crawler rules |
| `/opengraph-image` | Generated | Share preview |
| `/icon` | Generated | Favicon |
| (404) | Static | Not found branded |

---

## 11. Belum tersedia (backlog)

| Fitur | Prioritas | Catatan |
|-------|-----------|---------|
| Nomor telepon & WhatsApp final | **P0** | Blocker go-live |
| Env production (Resend + reCAPTCHA) | **P0** | Blocker go-live |
| Nama universitas founder | P1 | Dokumen resmi |
| Google Maps embed | P1 | Placeholder di data |
| `/insights/[slug]` | P2 | Slug sudah di data |
| i18n EN live switch | P2 | Field `*En` siap |
| Rate limit Redis | P2 | Multi-instance |
| Analytics | P3 | Setelah privacy final |
| CI/CD + automated tests | P3 | — |
| Foto tim / aset branded | P2 | — |

---

## 12. Cara verifikasi cepat

```bash
cd tj
npm install
cp .env.example .env.local   # opsional lokal
npm run dev

# Halaman
open http://localhost:3000
open http://localhost:3000/privacy
open http://localhost:3000/sitemap.xml

# API form (dev tanpa Resend key → sukses + log)
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Litigasi","message":"Uji fitur"}'
```

---

*Dokumen ini adalah katalog fitur + stack terbaru v0.2.0. Untuk persyaratan produk lihat [PRD.md](./PRD.md); untuk snapshot arsitektur lihat [current-implementation.md](../current-implementation.md).*
