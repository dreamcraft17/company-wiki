# Trusted Jurist Law Firm — Company Profile Website

Website company profile profesional untuk **Trusted Jurist Law Firm** (Jakarta Timur). Dibangun sebagai aplikasi web modern siap produksi: arsitektur terstruktur, UI editorial premium, backend form, SEO lengkap, dan codebase yang mudah dirawat.

**Versi saat ini:** `0.2.0` (go-live readiness) · **Domain:** [trustedjurist.co.id](https://trustedjurist.co.id)

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | **Next.js 16** (App Router) + **React 19** |
| Bahasa | **TypeScript** (strict) |
| Styling | **Tailwind CSS** v4 |
| Animasi | **Framer Motion** |
| Email | **Resend** (`/api/contact`) |
| Keamanan form | **reCAPTCHA v3** + rate limiting |
| Ikon | **Lucide React** |
| Utilitas | **clsx** + **tailwind-merge** |
| Tipografi | **Cormorant Garamond** + **Manrope** (`next/font`) |

---

## Halaman & Route

| Route | Tipe | Deskripsi |
|-------|------|-----------|
| `/` | Static | Homepage — 8 section editorial |
| `/about` | Static | Profil firma, nilai, komitmen |
| `/practice-areas` | Static | 8 bidang praktik + anchor `#id` |
| `/team` | Static | Managing Partner & struktur tim |
| `/insights` | Static | Daftar wawasan (draf / coming soon) |
| `/contact` | Static | Form konsultasi + kanal kontak |
| `/privacy` | Static | Kebijakan privasi |
| `/api/contact` | Dynamic | POST — kirim email via Resend |
| `/sitemap.xml` | Generated | Sitemap SEO |
| `/robots.txt` | Generated | Robots + referensi sitemap |
| `/opengraph-image` | Generated | OG image 1200×630 |
| `/icon` | Generated | Favicon 32×32 |

---

## Struktur Proyek

```
src/
  app/
    api/contact/          # Backend form
    privacy/              # Kebijakan privasi
    sitemap.ts            # Sitemap
    robots.ts             # Robots
    opengraph-image.tsx   # OG image
    icon.tsx              # Favicon
    not-found.tsx         # 404
  components/
    home/                 # Section homepage
    layout/               # Navbar, Footer
    ContactForm.tsx
    RecaptchaScript.tsx
  lib/
    contact/              # validate, rate-limit, recaptcha, email
    data.ts               # Konten & CONTACT_CONFIG
    constants.ts          # SITE_CONFIG, FOOTER_LEGAL
    seo.ts                # Metadata helpers
  styles/
  types/
.env.example              # Template environment variables
docs/
  go-live-checklist.md    # Checklist deploy & konfirmasi admin
```

---

## Setup

```bash
cd tj
npm install
cp .env.example .env.local   # isi sebelum production
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Wajib (prod) | Keterangan |
|----------|--------------|------------|
| `RESEND_API_KEY` | Ya | API key dari [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | Ya | Pengirim terverifikasi, mis. `Trusted Jurist <noreply@trustedjurist.co.id>` |
| `ADMIN_EMAIL` | Ya | Inbox notifikasi lead |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Ya | reCAPTCHA v3 site key |
| `RECAPTCHA_SECRET_KEY` | Ya | reCAPTCHA secret |

Tanpa env di **development**: form tetap sukses (email di-log ke console, reCAPTCHA dilewati).

---

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

---

## Konfigurasi Konten

| File | Isi |
|------|-----|
| `src/lib/constants.ts` | Nama situs, URL, tagline, `FOOTER_LEGAL` |
| `src/lib/data.ts` | `CONTACT_CONFIG`, navigasi, praktik, tim, wawasan |

**Sebelum go-live:** ganti nilai `REVIEW` / `XXXX` di `CONTACT_CONFIG` (telepon, WhatsApp, nomor ruko).

---

## Engineering Highlights

- **SEO:** metadata per halaman, OG image, Twitter card, canonical, JSON-LD `LegalService`, sitemap, robots
- **Form:** validasi server, Resend (user + admin), rate limit 5/menit/IP, reCAPTCHA v3
- **Privasi:** halaman `/privacy`, consent link di form, disclaimer footer
- **A11y:** semantic HTML, skip link, focus states, `prefers-reduced-motion`
- **Performance:** Server Components, `next/font`, animasi viewport-aware
- **Architecture:** data-driven content, modul `lib/contact/`

---

## Dokumentasi

| File | Isi |
|------|-----|
| [fitur.md](./fitur.md) | Daftar fitur lengkap |
| [audit.md](./audit.md) | Audit teknis & checklist go-live |
| [changelog.md](./changelog.md) | Riwayat versi |
| [docs/go-live-checklist.md](./docs/go-live-checklist.md) | Checklist admin & deploy |

---

## Catatan Konten

- Tidak ada testimonial, penghargaan, atau riwayat kasus palsu
- Telepon & WhatsApp di `CONTACT_CONFIG` masih bertanda **REVIEW** — isi nomor resmi firma
- Nama universitas founder sengaja tidak diisi — lengkapi dari dokumen resmi
- Peta kantor: siap integrasi Google Maps pada fase berikutnya

---

## Lisensi

Proprietary — Trusted Jurist Law Firm.
