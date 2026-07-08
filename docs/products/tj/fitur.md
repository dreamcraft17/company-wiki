# Fitur — Trusted Jurist Website

Daftar fitur yang **sudah diimplementasi** pada website Trusted Jurist Law Firm (v0.2.0).

---

## Navigasi & Layout Global

| Fitur | Deskripsi |
|-------|-----------|
| Navbar tetap | Logo, 6 link navigasi, CTA Konsultasi |
| Mode hero homepage | Transparan di atas hero; solid setelah scroll |
| Indikator halaman aktif | Garis emas animasi (`layoutId`) |
| Menu mobile | Hamburger, overlay, `aria-expanded` / `role="dialog"` |
| Auto-close menu | Tertutup saat ganti route |
| Footer | Navigasi, 8 tautan praktik, kontak, disclaimer, copyright |
| Tautan legal | Kebijakan Privasi di footer |
| Skip link | Lewati ke `#main-content` |
| Transisi halaman | `PageTransition` via `template.tsx` |
| Loading state | `loading.tsx` global |
| Halaman 404 | `not-found.tsx` branded |

---

## Halaman Beranda (`/`)

| Section | Komponen |
|---------|----------|
| Hero editorial | `Hero` |
| Trust colophon | `HomeTrustColophon` |
| Kredibilitas | `HomeCredibilityChapter` |
| Tentang preview | `HomeAboutSpread` |
| Indeks praktik | `HomePracticeIndex` (4 dari 8) |
| Founder | `HomeFounderChapter` |
| Standar kerja | `HomeStandardsCascade` |
| Wawasan preview | `HomeInsightsJournal` |
| Penutup | `HomeClosingComposition` |

---

## Halaman Tentang (`/about`)

- Hero ringkas
- `AboutProfileEditorial` — visi, misi, narasi
- `TrustCommitments`
- 5× `ValueCard` — nilai inti
- `CTASection`

---

## Halaman Bidang Praktik (`/practice-areas`)

- 8 bidang dengan `PracticeAreaCard` (scope, kebutuhan klien, output)
- Deep link: `/practice-areas#litigation`, `#anticorruption`, dll.
- Ikon via `IconMap` + Lucide

1. Litigation & Dispute Resolution  
2. Anti-Corruption & Governance  
3. Corporate & Commercial Law  
4. Mining, Plantation & Natural Resources  
5. Criminal Law & Investigation Support  
6. Public Policy & Regulatory Advisory  
7. Customs, Smuggling & Compliance  
8. Legal Opinion & Strategic Advisory  

---

## Halaman Tim (`/team`)

- `TeamCard` — Dr. Andin Sofyanoor, SH., MH.
- `FounderCredibility` — pendidikan, pengalaman, fokus, kegiatan profesional
- 3× `TeamRoleSlot` — Partner, Senior Associate, Associate (slot kosong, transparan)

---

## Halaman Wawasan (`/insights`)

| Judul | Kategori | Status |
|-------|----------|--------|
| Membangun Kepercayaan Publik terhadap Penegakan Hukum | Hukum Publik | Draf editorial |
| Peran Advokat dalam Agenda Antikorupsi | Antikorupsi | Draf editorial |
| Kepatuhan Hukum di Sektor Pertambangan dan Perkebunan | Sektor Regulasi | Segera hadir |

- Tanpa halaman detail (sesuai status belum dipublikasi)
- Metadata SEO menyatakan konten dalam penyusunan

---

## Halaman Kontak (`/contact`)

| Fitur | Deskripsi |
|-------|-----------|
| Form konsultasi | Varian `consultation`, POST ke `/api/contact` |
| Blok kerahasiaan | Protokol informasi rahasia |
| Kanal langsung | Email, telepon, WhatsApp (`wa.me`) |
| Error handling | Pesan error di UI (`role="alert"`) |
| Consent privasi | Tautan ke `/privacy` di bawah form |
| State | idle → submitting → success → reset |

**Field:** nama, email, telepon (opsional), bidang perkara, ringkasan.

---

## Backend Form (`POST /api/contact`)

| Fitur | Implementasi |
|-------|----------------|
| Validasi | `lib/contact/validate.ts` — required, email, panjang max |
| Sanitasi email HTML | `escapeHtml` di `lib/contact/sanitize.ts` |
| Rate limiting | 5 req/menit/IP — `lib/contact/rate-limit.ts` |
| reCAPTCHA v3 | `lib/contact/recaptcha.ts` — score ≥ 0.5 |
| Email pengguna | Konfirmasi terima permintaan |
| Email admin | Notifikasi lead + `replyTo` pengguna |
| Provider | Resend — `lib/contact/send-contact-email.ts` |
| Dev fallback | Tanpa API key: log console, response sukses |

---

## Halaman Privasi (`/privacy`)

- Kebijakan privasi lengkap (Bahasa Indonesia)
- Section: data dikumpulkan, penggunaan, keamanan, hak pengguna, cookie/pihak ketiga
- Tautan ke email firma & formulir kontak
- Metadata SEO dedicated

---

## SEO & Metadata

| Fitur | Route / file |
|-------|----------------|
| Metadata per halaman | `lib/seo.ts` → `createMetadata()` |
| Open Graph image | `/opengraph-image` — `app/opengraph-image.tsx` |
| Favicon | `/icon` — `app/icon.tsx` |
| Sitemap | `/sitemap.xml` — `app/sitemap.ts` |
| Robots | `/robots.txt` — `app/robots.ts` |
| JSON-LD | `LegalService` di `layout.tsx` |
| Canonical & hreflang-ready | `alternates` id/en |

---

## Keamanan

- Env vars tidak di-commit (`.env*` di gitignore, `.env.example` sebagai template)
- Input divalidasi di server
- reCAPTCHA di production
- `/api/` di-disallow di robots.txt

---

## Desain & Animasi

- Palette navy / gold / cream (CSS variables)
- Tipografi Cormorant Garamond + Manrope
- Framer Motion: reveal, stagger, page transition, navbar
- `prefers-reduced-motion` global
- Responsive mobile-first

---

## Data & Konfigurasi

| Sumber | Isi |
|--------|-----|
| `lib/constants.ts` | `SITE_CONFIG`, `FOOTER_LEGAL`, CTA |
| `lib/data.ts` | Navigasi, `CONTACT_CONFIG`, konten editorial |
| `footerLegalLinks` | Tautan privasi |
| Field `*En` | Siap ekspansi i18n |

---

## Belum Tersedia (backlog)

| Fitur | Prioritas |
|-------|-----------|
| Halaman detail `/insights/[slug]` | P2 |
| i18n bahasa Inggris aktif | P2 |
| Peta Google Maps | P1 |
| Analytics (Plausible / GA4) | P3 |
| CI/CD & automated tests | P3 |
| Rate limit Redis (multi-instance) | P2 |
| Foto tim & aset visual branded | P2 |
| Nomor kontak final (admin firma) | P0 |

Lihat [audit.md](./audit.md) untuk detail checklist go-live.
