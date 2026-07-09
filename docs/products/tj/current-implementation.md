# Current Implementation — Trusted Jurist (`tj`)

> **Wiki mirror** — salinan dari repo `tj/current-implementation.md`. Index: [00_INDEX.md](./00_INDEX.md)

Snapshot implementasi aktual website company profile **Trusted Jurist Law Firm**.

| | |
|---|---|
| **Versi** | `0.2.0` |
| **Status** | Go-live readiness — kode siap staging; konten & env production menunggu konfirmasi admin |
| **Domain target** | `https://trustedjurist.co.id` |
| **Tanggal dokumen** | 9 Juli 2026 |
| **Bahasa UI** | Bahasa Indonesia |

---

## Ringkasan

Website firma hukum dengan **7 halaman publik**, **1 API route**, desain editorial premium, form kontak berbackend Resend, kebijakan privasi, dan aset SEO (sitemap, robots, OG image, favicon).

```
Sudah berjalan          Menunggu admin
─────────────────       ──────────────────────────────
7 halaman + 404         Nomor telepon / WhatsApp resmi
Backend form (Resend)   Env production (API keys)
Privacy policy          Nama universitas founder
Design system ✅        Deploy + DNS cutover
SEO assets lengkap      Peta kantor (Google Maps)
```

---

## Tech Stack (terpasang)

| Layer | Versi / library |
|-------|-----------------|
| Framework | Next.js **16.2.6** (App Router) |
| UI | React **19.2.4** |
| Bahasa | TypeScript 5 (strict) |
| Styling | Tailwind CSS **v4** + `@tailwindcss/postcss` |
| Animasi | Framer Motion **12.38** |
| Email | Resend **6.12** |
| Ikon | Lucide React **1.16** |
| Utilitas | `clsx` + `tailwind-merge` |
| Tipografi | Cormorant Garamond + Manrope via `next/font` |
| Lint | ESLint 9 + `eslint-config-next` |

**Scripts:** `dev` · `build` · `start` · `lint`

---

## Routes yang Aktif

| Route | Rendering | Implementasi |
|-------|-----------|--------------|
| `/` | Static (SSG) | Homepage 8 section editorial |
| `/about` | Static | Profil, nilai, komitmen |
| `/practice-areas` | Static | 8 bidang + deep link `#id` |
| `/team` | Static | Managing Partner + slot tim |
| `/insights` | Static | 3 artikel (draf / coming-soon) |
| `/contact` | Static | Form konsultasi + kanal kontak |
| `/privacy` | Static | Kebijakan privasi |
| `/api/contact` | Dynamic | `POST` — validasi → reCAPTCHA → Resend |
| `/sitemap.xml` | Generated | `app/sitemap.ts` |
| `/robots.txt` | Generated | `app/robots.ts` |
| `/opengraph-image` | Generated | OG 1200×630 (`ImageResponse`) |
| `/icon` | Generated | Favicon 32×32 |
| 404 | Static | `app/not-found.tsx` |

---

## Struktur Source (aktual)

```
tj/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root: fonts, JSON-LD, Navbar, Footer, RecaptchaScript
│   │   ├── template.tsx            # PageTransition wrapper
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   ├── page.tsx                # Homepage
│   │   ├── about|team|insights|contact|practice-areas|privacy/page.tsx
│   │   ├── api/contact/route.ts    # Backend form
│   │   ├── sitemap.ts · robots.ts
│   │   ├── opengraph-image.tsx · icon.tsx
│   ├── components/
│   │   ├── home/                   # 8 chapter homepage
│   │   ├── layout/                 # Navbar, Footer, HeroSection, PageIntro, Sections
│   │   ├── editorial/ · motion/
│   │   ├── ui/                     # Button, Input, Card, Alert, Badge, FormControls, …
│   │   ├── ContactForm.tsx         # Client form → /api/contact (design kit)
│   │   └── RecaptchaScript.tsx
│   ├── lib/
│   │   ├── data.ts                 # Konten + CONTACT_CONFIG
│   │   ├── constants.ts            # SITE_CONFIG, FOOTER_LEGAL
│   │   ├── design-tokens.ts        # TS tokens (mahogany/brass/parchment)
│   │   ├── contact/                # validate, sanitize, rate-limit, recaptcha, email
│   │   ├── seo.ts · motion.ts · typography.ts · utils.ts
│   │   └── recaptcha-client.ts
│   ├── styles/                     # globals.css, typography.css
│   └── types/index.ts
├── tailwind.config.js              # Design tokens (Tailwind extend)
├── design/                         # Reference pack (00–06) + IMPLEMENTATION.md
├── .env.example
├── package.json                    # version 0.2.0
└── docs/go-live-checklist.md
```

---

## Fitur yang Sudah Impementasi

### Layout & navigasi
- Navbar fixed, scroll-aware di homepage, indikator route aktif (`layoutId`)
- Menu mobile: hamburger, overlay, `aria-expanded` / `role="dialog"`
- Footer: navigasi, 6 tautan praktik ringkas, kontak, disclaimer, copyright, link `/privacy`
- Skip link, transisi halaman, loading state global

### Homepage (`/`)
Section berurutan:
1. `Hero`
2. `HomeTrustColophon`
3. `HomeCredibilityChapter`
4. `HomeAboutSpread`
5. `HomePracticeIndex` (4 dari 8 bidang)
6. `HomeFounderChapter`
7. `HomeStandardsCascade`
8. `HomeInsightsJournal`
9. `HomeClosingComposition`

### Konten seguro
- **About:** profil editorial, trust commitments, 5 nilai inti
- **Practice areas:** 8 bidang (litigasi → advisory) dengan scope / kebutuhan / output + `#anchor`
- **Team:** Dr. Andin Sofyanoor (Managing Partner), kredibilitas founder, 3 slot kosong (Partner / Senior Associate / Associate)
- **Insights:** 3 entri berstatus `editorial-draft` atau `coming-soon` — **tanpa** halaman detail
- **Privacy:** kebijakan privasi lengkap (Bahasa Indonesia)

### Form & backend
| Langkah | File | Perilaku |
|---------|------|----------|
| UI | `ContactForm.tsx` | Varian `default` / `consultation`; error + success; link consent privasi |
| API | `app/api/contact/route.ts` | `POST` JSON |
| Validasi | `lib/contact/validate.ts` | Nama, email, subjek, pesan wajib; batas panjang |
| Rate limit | `lib/contact/rate-limit.ts` | 5 req / menit / IP (in-memory) |
| reCAPTCHA | `lib/contact/recaptcha.ts` | Score ≥ 0.5; dilewati jika secret kosong (dev) |
| Email | `lib/contact/send-contact-email.ts` | Konfirmasi user + notifikasi admin (`replyTo`) via Resend |
| Sanitize | `lib/contact/sanitize.ts` | Escape HTML di template email |

**Dev tanpa env:** form tetap return sukses; payload di-log ke console; reCAPTCHA dilewati.

### SEO & discoverability
- `createMetadata()` di semua halaman (title, description, canonical, OG, Twitter)
- OG image dinamis + favicon dinamis
- Sitemap mencakup semua halaman publik inkl. `/privacy`
- Robots: allow `/`, disallow `/api/`
- JSON-LD `LegalService` di root layout

### Desain & design system

**Status:** ✅ Fully wired (commit `d0e5382`, 9 Jul 2026) — detail di [design/IMPLEMENTATION.md](./design/IMPLEMENTATION.md)

| Layer | Implementasi |
|-------|--------------|
| Tokens | mahogany `#121c2b`, brass `#8a7340`, parchment `#f7f4ef` — CSS vars + `design-tokens.ts` + `tailwind.config.js` |
| Fonts | Cormorant Garamond + Manrope via `next/font` |
| UI kit | `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Card`, `Alert`, `Badge`, `Divider`, design cards |
| Layout | `HeroSection`, `PageIntro`, `ContentSection`, `GridSection`, `TwoColumnSection`, `Breadcrumb` |
| Pages | `/`, `/about`, `/team`, `/practice-areas`, `/contact`, `/careers` |

- Tipografi token via `lib/typography.ts` + CSS
- Framer Motion: reveal, stagger, page transition
- `prefers-reduced-motion` di `globals.css`

---

## Konfigurasi Konten Saat Ini

### `SITE_CONFIG` (`lib/constants.ts`)
- Nama: Trusted Jurist Law Firm  
- Tagline: *Hukum berpihak. Advokasi terukur.*  
- URL: `https://trustedjurist.co.id`  
- Lokasi: Sunter, Jakarta Timur  
- Launch: 26 Juni 2025  

### `CONTACT_CONFIG` (`lib/data.ts`)

| Field | Nilai sekarang | Status |
|-------|----------------|--------|
| Email | `konsultasi@trustedjurist.co.id` | Siap (konfirmasi resmi) |
| Telepon | `+62 21 XXXX XXXX` | **REVIEW** |
| WhatsApp | `628XXXXXXXXXX` | **REVIEW** |
| Alamat | Jl. Sunter Agung Raya, Jakarta Timur 14350 | Siap (nomor unit opsional) |
| Jam | Senin–Jumat, 08:00–17:00 WIB | Siap |
| Timezone | `Asia/Jakarta` | Siap |

### Founder
- Nama & gelar: Dr. Andin Sofyanoor, SH., MH.  
- Placeholder `[Nama Perguruan Tinggi]` sudah dihapus  
- Nama universitas konkret **belum diisi** (menunggu dokumen resmi)

---

## Environment Variables

Template: `.env.example` (commit-safe). Runtime: `.env.local` / env hosting.

| Variable | Production | Dev fallback |
|----------|------------|--------------|
| `RESEND_API_KEY` | Wajib | Log console |
| `RESEND_FROM_EMAIL` | Wajib | Default Resend onboarding |
| `ADMIN_EMAIL` | Wajib | Fallback ke `CONTACT_CONFIG.email` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Wajib | Script tidak dimuat |
| `RECAPTCHA_SECRET_KEY` | Wajib | Verifikasi dilewati |

---

## Belum Diimplementasi

| Item | Prioritas | Catatan |
|------|-----------|---------|
| Nomor telepon & WhatsApp final | P0 | Field masih `XXXX` |
| Env keys production | P0 | Resend + reCAPTCHA |
| Nama universitas founder | P1 | Sengaja kosong |
| Google Maps embed | P1 | `mapNote` placeholder |
| `/insights/[slug]` | P2 | Slug sudah ada di data |
| i18n EN aktif | P2 | Field `*En` siap, belum di-switch |
| Analytics | P3 | — |
| CI/CD + automated tests | P3 | — |
| Rate limit Redis | P2 | Perlu jika multi-instance |
| Hapus aset boilerplate `public/*.svg` | P3 | — |

---

## Cara Menjalankan

```bash
cd tj
npm install
cp .env.example .env.local   # opsional untuk lokal
npm run dev                  # http://localhost:3000
npm run build && npm run start
```

Uji API contact:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Litigasi","message":"Uji form"}'
```

---

## Dokumentasi Terkait

| File | Isi |
|------|-----|
| [README.md](./README.md) | Setup & overview |
| [fitur.md](./fitur.md) | Katalog fitur |
| [audit.md](./audit.md) | Audit teknis v2.0 |
| [changelog.md](./changelog.md) | Riwayat versi |
| [docs/PRD.md](./docs/PRD.md) | Panduan Product Requirements |
| [docs/FEATURES.md](./docs/FEATURES.md) | Fitur lengkap + tech stack |
| [design/IMPLEMENTATION.md](./design/IMPLEMENTATION.md) | Status design system |
| [docs/go-live-checklist.md](./docs/go-live-checklist.md) | Checklist deploy |
| [AGENTS.md](./AGENTS.md) | Catatan untuk AI agent |

---

*Dokumen ini merefleksikan kode yang ada di repo. Perbarui bila ada perubahan arsitektur atau rilis major berikutnya.*
