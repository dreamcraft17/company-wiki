# DN Tech — Status Implementasi & Audit Performa

Dokumen ini mencatat **semua yang sudah diimplementasikan di codebase** untuk website DN Tech, termasuk migrasi production-ready, penghapusan data demo, implementasi PRD/Design System/SEO Guide V2, refinement V3, dan optimasi performa V4.

**Terakhir diperbarui:** 13 Juli 2026
**Branch:** `main`  
**Commit referensi terbaru:** Homepage PRD Indonesia Edition + tuning harga & section (Jul 9 malam)  
**Rentang Jul 9:** footer redesign, homepage PRD full, hide tech stack & tim di beranda, harga UMKM-friendly  
**Commit sebelumnya:** `352140f` — V2.1 design remediation  
**Status build terakhir:** ✅ `npm run build` frontend sukses (Next.js 16.2.9)  
**Status working tree:** ✅ Clean (sync dengan `origin/main`)

---

## Daftar Isi

1. [Ringkasan](#1-ringkasan)
2. [Design System V2](#2-design-system-v2)
3. [Website Publik](#3-website-publik)
4. [Form & Lead Generation](#4-form--lead-generation)
5. [SEO & Structured Data](#5-seo--structured-data)
6. [Backend & Database](#6-backend--database)
7. [Admin Dashboard (CMS)](#7-admin-dashboard-cms)
8. [Integrasi & Email](#8-integrasi--email)
9. [Infrastruktur & Deploy](#9-infrastruktur--deploy)
10. [File & Modul Baru](#10-file--modul-baru)
11. [Yang Sengaja Tidak Di-hardcode](#11-yang-sengaja-tidak-di-hardcode)
12. [Implementasi V3](#12-implementasi-v3)
13. [Implementasi V4](#13-implementasi-v4)
14. [Implementasi V5](#14-implementasi-v5)
15. [Implementasi V6 — Modul Produk](#15-implementasi-v6--modul-produk)
16. [Implementasi V7 — Product Section PRD (dnPeople Flagship)](#16-implementasi-v7--product-section-prd-dnpeople-flagship)
17. [Audit Performa: Kenapa Web Lambat](#17-audit-performa-kenapa-web-lambat)
18. [Checklist Verifikasi Cepat](#18-checklist-verifikasi-cepat)
19. [Loading UX Global](#19-loading-ux-global)
20. [Referensi Dokumen](#20-referensi-dokumen)

---

## 1. Ringkasan

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Bahasa UI | ✅ | Seluruh situs & admin dalam Bahasa Indonesia |
| Mata uang | ✅ | Rupiah (IDR) di form, kalkulator, quiz |
| Database | ✅ | PostgreSQL + Prisma ORM |
| Data demo | ✅ | Dihapus — seed hanya bootstrap admin |
| Design V2 | ✅ | Solid color, tanpa gradient/glassmorphism |
| Design V2.1 | ✅ | Remediation audit — UI kit, palet unified, mandat CEO/Tech Lead |
| Hotfix button text (Jul 9) | ✅ | `Button href` + `tailwind-merge` + variant `inverse` |
| Branding `rlogo2` (Jul 9) | ✅ | Logo PNG navbar/footer/admin; favicon 32px; hero tipografi |
| About CMS live (Jul 9) | ✅ | Client fetch + `force-dynamic`; visi/misi dari `aboutContent` |
| Admin UX (Jul 9) | ✅ | Toast simpan settings + validasi JSON |
| Branding section full (Jul 9) | ✅ | API `/branding/*`, homepage 6 section branding, admin `/admin/branding` |
| Branding spec 100% (Jul 9) | ✅ | Prisma models dedicated, admin CRUD `/admin/branding/*`, testimonials carousel, seed script |
| Footer redesign (Jul 9) | ✅ | Layout horizontal putih; `FooterBrand` wordmark; tanpa newsletter di footer |
| Homepage PRD Indonesia (Jul 9) | ✅ | Section direct-market; `homeContent` CMS; komponen `components/homepage/*` |
| Homepage tuning (Jul 9 malam) | ✅ | Tech stack & tim disembunyikan di beranda; harga paket diturunkan (UMKM) |
| Design maturity (estimasi) | ✅ | ~9/10 — lihat [design_audit.md](./design_audit.md) |
| Konten real | ✅ | Semua konten dari DB via admin |
| PRD V2 (teknis) | ✅ | ~85–90% fitur kode selesai |
| PRD V3 (refinement) | ✅ | Exit intent, logo variants, mobile nav, form accessibility |
| PRD V4 (performance) | ✅ | Search debounce, deferred scripts, cached settings, streaming homepage, image optimization, backend cache, font/build fix |
| PRD V5 (email) | ✅ | SMTP nodemailer, templates, retry/logging, newsletter confirm/unsubscribe, admin email logs |
| V6 Modul Produk (Jul 12) | ✅ | Content type `Product` paralel dengan `Service`; public `/products`, `/products/[slug]`; admin CRUD `/admin/products`; nav "Produk" terpisah dari "Layanan"; DB push ke production belum dijalankan |
| V7 Product Section PRD (Jul 12) | ✅ | `Product` diperluas: pricing tiers, fitur per kategori, use case, integrasi, comparison table, testimoni, roadmap, multi-CTA; halaman dnPeople lengkap; seed `db:seed-dnpeople`; DB push + seed ke production belum dijalankan |
| Footer dokumen `.md` | ✅ | Semua Markdown memiliki footer `Property of DN Tech - PT. Dozer Napitupulu Technology . 2026` |
| Production build | ✅ | Frontend + backend build sukses |
| Lint full repo | ✅ | Frontend lint sukses tanpa error/warning |
| Performance audit awal | ✅ | Bottleneck utama sudah ditangani di V4; perlu Lighthouse/field verification setelah deploy |
| Loading UX global (Jul 13) | ✅ | Route fallback public/admin/root, overlay request API concurrency-safe, indikator sesi dan initial CRUD |
| Public products API hotfix (Jul 13) | ✅ | Listing/detail SSR memakai resolver bersama; production menolak localhost dan log fetch failure |

---

## 2. Design System V2

Implementasi berdasarkan `docs/V2/DN-TECH-DESIGN-SYSTEM-V2.md`.

### Warna & Typography

| Token | Nilai | Implementasi |
|-------|-------|--------------|
| Primary | `#1E3A8A` (blue-900) | Button, hero, link, focus ring |
| Secondary | `#0D9488` (teal-600) | Badge kategori, accent tim |
| Background | `#FFFFFF`, gray-50 | Section alternatif |
| Teks | gray-900 / gray-600 | Body & secondary text |
| Font | System Inter stack | `globals.css`, tanpa `next/font/google` dependency |
| Body min | 16px | Default di `globals.css` |
| Touch target | min 48px | Button lg, input, nav mobile |

### Komponen UI (diperbarui)

| Komponen | File | Perubahan |
|----------|------|-----------|
| Button | `frontend/src/components/ui/Button.tsx` | Primary blue-900, secondary teal outline, min-height 48px |
| Card | `frontend/src/components/ui/Card.tsx` | Flat border, tanpa shadow berat |
| Input / Select / Textarea | `frontend/src/components/ui/Input.tsx` | Focus blue-900, min-height 48px, aria error |
| Header | `frontend/src/components/common/Header.tsx` | Sticky solid white, tanpa backdrop-blur |
| Footer | `frontend/src/components/common/Footer.tsx` | Putih, link horizontal 2 baris, CTA, kontak inline dari settings |
| FooterBrand | `frontend/src/components/layout/FooterBrand.tsx` | Logo kecil + teks **DN Tech.id** (bukan logo bulat besar) |
| StickyCTA | `frontend/src/components/layout/StickyCTA.tsx` | Mobile CTA blue-900 |
| TrustBadges | `frontend/src/components/layout/TrustBadges.tsx` | Section "Mengapa Memilih Kami" |
| TeamSpotlight | `frontend/src/components/layout/TeamSpotlight.tsx` | Avatar solid (bukan gradient) |
| ExitIntentModal | `frontend/src/components/interactive/ExitIntentModal.tsx` | V3 exit intent; V2.1 refactor ke `Modal` component |
| ExitIntent hook | `frontend/src/hooks/useExitIntent.ts` | Session flag, `beforeunload`, `visibilitychange`, focus restore |
| Alert | `frontend/src/components/ui/Alert.tsx` | 4 variants, aria role |
| Badge | `frontend/src/components/ui/Badge.tsx` | Tag/chip solid colors |
| Modal | `frontend/src/components/ui/Modal.tsx` | Flat border dialog |
| PortfolioCard | `frontend/src/components/cards/PortfolioCard.tsx` | CMS image atau solid fallback |

### Anti-pattern yang dihapus

- [x] Hero gradient (`from-blue-600 via-blue-700`)
- [x] Glassmorphism / `backdrop-blur` di header
- [x] Gradient avatar tim
- [x] Shadow berat di card (`shadow-lg`, `hover:shadow-md`)
- [x] Warna primary lama `#2563eb` → diganti `#1E3A8A`

### V2.1 Remediation (9 Jul 2026)

Implementasi penuh per `design/DN-TECH-DESIGN-V2.1-SDD.md` + mandat CEO/Tech Lead:

- [x] Gradient placeholder dihapus dari portfolio & case studies
- [x] `backdrop-blur` dihapus dari case study detail
- [x] `shadow-xl` dihapus dari admin login (flat border)
- [x] Link accent distandarkan ke `text-blue-900`
- [x] Komponen baru: `Alert`, `Badge`, `Modal` + barrel `components/ui/index.ts`
- [x] `PortfolioCard`, `design-tokens.ts`, `prefers-reduced-motion` di globals.css
- [x] Admin sidebar: `bg-blue-900` (bukan slate-900)
- [x] Palet `slate-*` → `gray-*` di seluruh frontend
- [x] Exit intent memakai `Modal` component
- [x] Semua inline alert utama → `Alert` component (contact, newsletter, quiz, ROI, settings, login)

**Verifikasi V2.1 (grep codebase, 9 Jul 2026):**

| Check | Hasil |
|-------|-------|
| `gradient-to-*` | ✅ 0 |
| `backdrop-blur` | ✅ 0 |
| `shadow-xl` / `shadow-2xl` | ✅ 0 |
| `slate-*` | ✅ 0 |
| `components/ui/index.ts` barrel | ✅ Alert, Badge, Button, Card, Input, Modal |

**Dokumentasi:** [docs/DESIGN_SUMMARY.md](./DESIGN_SUMMARY.md) · [docs/design_audit.md](./design_audit.md) · [design/IMPLEMENTATION.md](../design/IMPLEMENTATION.md) · [design/DN-TECH-DESIGN-V2.1-SDD.md](../design/DN-TECH-DESIGN-V2.1-SDD.md)

**Deviasi yang masih disengaja:**
- Avatar tim: inisial (menunggu foto CMS)
- Font: system stack (trade-off performa V4)
- Dark mode: belum (V2.2+)

### Hotfix — Button Text & Modal Close (9 Jul 2026)

| Issue | Root cause | Fix |
|-------|------------|-----|
| Hero / CTA tombol kosong | `<Link><Button>` = HTML tidak valid (`<a><button>`) | `Button` mendukung prop `href` → render sebagai `<Link>` |
| Modal X tidak responsif | Layout + event handling | `Modal`: Escape key, `stopPropagation`, close `shrink-0` |
| Footer "Langganan" terpotong | Flex shrink pada tombol | `NewsletterForm` compact: `shrink-0 whitespace-nowrap` (homepage saja; **footer Jul 9 malam** — newsletter dihapus dari footer) |
| Tombol putih tanpa teks (CSS) | `cn()` tanpa `tailwind-merge` → `text-white` + `text-blue-900` bentrok | `tailwind-merge` di `utils.ts` + variant `inverse` / `outline-on-dark` |

**File utama:** `components/ui/Button.tsx`, `Modal.tsx`, `page.tsx` (hero), `NewsletterForm.tsx`, `ExitIntentModal.tsx` + 10 halaman CTA lainnya.

**Referensi:** [company-wiki fix doc](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/fix/DN-TECH-QUICK-FIX-BUTTON-TEXT.md)

### Polish — About, Branding & Admin (9 Jul 2026, siang)

| Area | Perubahan | File / commit |
|------|-----------|---------------|
| `/about` kosong di web | SSR cache + API URL salah; fetch client-side | `AboutPageContent.tsx`, `getApiBaseUrl()` — `c8b9b3c` |
| Logo resmi | `rlogo2.png` menggantikan placeholder teks DN | `Logo.tsx`, `LogoLight`, `LogoDark` — `3c6fa94` |
| Favicon tab | 32×32 + 180×180 dari `rlogo2` | `app/icon.png`, `app/apple-icon.png` — `748c203` |
| Navbar wordmark | Teks **DN Tech.id** di samping logo | `LogoLight.tsx` — `f8edac1` |
| Hero beranda | Hapus logo bulat di `bg-blue-900`; pakai `HeroBrand` tipografi | `HeroBrand.tsx`, `page.tsx` — `0f6877c` |
| Admin simpan | Toast sukses/error + validasi JSON (tidak silent fail) | `Toast.tsx`, `admin/settings/page.tsx` — `ae64b6b` |
| Cache bust | `POST /api/revalidate` setelah simpan settings (opsional env) | `api/revalidate/route.ts` — `7e69b5a` |

**Asset branding:**

| File | Pemakaian |
|------|-----------|
| `frontend/public/rlogo2.png` | Logo utama (navbar, footer, admin, OG fallback) |
| `frontend/public/icon.png` | Favicon 32×32 |
| `frontend/public/apple-icon.png` | Apple touch icon |
| `frontend/public/logo.png` | Legacy — tidak dipakai UI publik |

**Env production wajib:** `NEXT_PUBLIC_API_URL=https://api.dntech.id/api/v1` (bukan `dntech.id/api` — 404).

### Branding Section Rollout (9 Jul 2026, sore)

| Area | Implementasi | File |
|------|---------------|------|
| API publik branding | `GET /branding/content|values|advantages|team|testimonials|stats` | `backend/src/routes/branding.ts`, `backend/src/index.ts` |
| Data layer frontend | Fetch + cache branding API | `frontend/src/lib/branding.ts` |
| Homepage section baru | `BrandStats`, `BrandStory`, `CoreValues`, `CompetitiveAdvantages`, `TeamSpotlight`, `BrandTestimonials` | `frontend/src/app/(public)/page.tsx` + `components/branding/*` |
| Admin branding CMS | Kelola story, mission, values, advantages, stats | `frontend/src/app/admin/branding/page.tsx` |
| Navigasi admin | Menu sidebar "Branding" | `frontend/src/components/admin/AdminSidebar.tsx` |

**Catatan desain (update v2):** tetap patuh V2.1 (solid, no gradient/glass); source of truth branding kini memakai model dedicated (`BrandContent`, `CoreValue`, `CompetitiveAdvantage`, `Stat`) + mapping terkontrol untuk team/testimonials existing.

### Footer Redesign (9 Jul 2026, malam)

| Sebelum (ditolak) | Sesudah |
|-------------------|---------|
| `bg-gray-900` gelap + `LogoDark` logo bulat besar | `bg-white` + `border-t` — selaras header |
| 3 kolom vertikal (logo+newsletter \| PERUSAHAAN \| LAYANAN) | Brand + tagline + CTA; link **horizontal** 2 baris |
| Newsletter compact di footer | Newsletter **hanya** di section homepage (`NewsletterForm`) |
| Logo PNG besar di background gelap | `FooterBrand` — logo `sm` + wordmark **DN Tech.id** |

**Layout footer saat ini:**

1. Bar atas — `FooterBrand` + tagline CMS (kiri), tombol **Konsultasi Gratis** (kanan)
2. Navigasi — primary links (Beranda, Layanan, Tentang, Blog, Kontak) + secondary links (Studi Kasus, FAQ, dll.)
3. Kontak inline — email · telepon · alamat dari `SiteSettings`
4. Bar bawah — copyright + Syarat & Ketentuan / Kebijakan Privasi

**File:** `components/common/Footer.tsx`, `components/layout/FooterBrand.tsx` · `LogoDark.tsx` kini untuk admin/dark chrome saja (bukan footer publik).

### Homepage PRD Indonesia Edition (9 Jul 2026)

Implementasi penuh per `company-wiki/.../DN-TECH-HOMEPAGE-REDESIGN-PRD-INDONESIA-EDITION.md` — tone direct, tanpa fluff, fokus startup & UMKM.

| Area | Implementasi |
|------|--------------|
| Hero | `HomeHero` — CTA 30 menit + portfolio; copy dari settings / `homeContent` |
| Layanan | `HomeServices` — max 6 dari API atau default PRD |
| Proses kerja | `HomeProcess` — 6 langkah bernomor |
| Kenapa pilih kami | `HomeAdvantages` — 6 kartu |
| Portfolio | `HomePortfolio` — case studies API atau coming soon |
| Testimoni | `HomeTestimonials` — API atau coming soon |
| FAQ | `HomeFaq` — accordion; CMS `/faq` atau default PRD |
| Harga & paket | `HomePricing` — 3 paket transparan |
| CTA kontak | `HomeContactCta` — email, telepon, Calendly |
| CMS | `SiteSettings.homeContent` (JSON) + admin Pengaturan Situs |
| Seed | `backend/scripts/seed-homepage.ts` |

**Section disembunyikan di beranda (komponen tetap ada di codebase):**

| Section | Alasan | Halaman alternatif |
|---------|--------|-------------------|
| Tech stack (`HomeTechStack`) | Permintaan produk — tidak perlu di fold utama | — |
| Tim & hiring (`HomeTeam`) | Permintaan produk — profil tim tidak di homepage | `/team`, `/careers` |

**Harga default (UMKM-friendly, Jul 9 malam):**

| Paket | Harga |
|-------|-------|
| Custom project | Mulai **Rp 25 juta** (1–4 bulan) |
| Hourly consulting | Mulai **Rp 150.000/jam** |
| Maintenance | Mulai **Rp 2 juta/bulan** |
| FAQ development | Landing/fitur sederhana dari Rp 25 juta; MVP Rp 50–150 juta |

> Override via Admin → Pengaturan → **Konten Beranda (JSON)** atau edit FAQ di admin.

**Menggantikan di homepage:** section branding lama (`BrandStats`, `BrandStory`, `CoreValues`, `CompetitiveAdvantages`, blog preview, newsletter) — modul branding admin tetap ada untuk halaman lain jika diperlukan.

---

## 3. Website Publik

### Navigasi (V2 — startup-focused)

Menu utama yang ditampilkan:

| Route | Label |
|-------|-------|
| `/` | Beranda |
| `/services` | Layanan |
| `/about` | Tentang |
| `/blog` | Blog |
| `/contact` | Kontak |

CTA header: **"Konsultasi Gratis"**

Halaman `/quiz`, `/case-studies`, `/testimonials`, `/resources` **masih ada** tapi **tidak** di nav utama (sesuai V2 P2/P3).

### Homepage (`/`)

| Section | Status | Implementasi |
|---------|--------|--------------|
| Hero | ✅ | `HomeHero` — PRD Indonesia Edition |
| Layanan | ✅ | `HomeServices` — API atau default 6 kartu |
| Proses kerja | ✅ | `HomeProcess` |
| Kenapa pilih kami | ✅ | `HomeAdvantages` |
| Tech stack | 🔒 Hidden | `HomeTechStack` — tidak dirender di `page.tsx` |
| Portfolio | ✅ | `HomePortfolio` |
| Tim & hiring | 🔒 Hidden | `HomeTeam` — gunakan `/team`, `/careers` |
| Testimoni | ✅ | `HomeTestimonials` |
| FAQ | ✅ | `HomeFaq` |
| Harga & paket | ✅ | `HomePricing` |
| CTA kontak | ✅ | `HomeContactCta` |

**Tidak lagi di homepage:** `BrandStats`, `BrandStory`, `CoreValues`, blog preview, newsletter, branding carousel lama.

**Halaman terpisah masih aktif:** `/team`, `/careers`, `/blog`, `/case-studies`, modul branding admin.

### Halaman Layanan

| Halaman | Fitur |
|---------|-------|
| `/services` | List layanan aktif dari DB |
| `/services/[slug]` | Deskripsi, fitur, **proses kerja 5 langkah**, FAQ accordion, artikel terkait, Calendly embed, CTA konsultasi |

Proses kerja: `frontend/src/lib/service-process.ts`

### Halaman Produk (V6)

| Halaman | Fitur |
|---------|-------|
| `/products` | List produk aktif dari DB, filter kategori, search |
| `/products/[slug]` | Deskripsi, fitur produk, FAQ accordion, artikel terkait, produk terkait, CTA "Hubungi Kami" |

Menu "Produk" berdiri sendiri di nav publik (`Header.tsx`), sejajar dengan "Layanan" — bukan dropdown/submenu. Tidak memakai proses kerja 5 langkah atau Calendly embed milik Layanan (alur konsultasi jasa tidak relevan untuk produk).

### Blog

| Fitur | File |
|-------|------|
| List + filter kategori + pagination | `blog/page.tsx` |
| Estimasi waktu baca | `lib/read-time.ts` |
| Content pillars V2 | `lib/content-pillars.ts` |
| Internal linking dinamis | `blog/[slug]/page.tsx` |
| Author & tanggal publish | Dari DB |

**Pillar kategori V2:**
- Tech Stack Indonesia
- Scaling Proyek Software
- Saran Teknologi Startup
- Insight Kasus

### Tentang & Tim

| Halaman | Fitur |
|---------|-------|
| `/about` | Story, mission, vision, values, achievements dari `SiteSettings.aboutContent` (JSON); **client fetch** agar selalu fresh |
| `/team` | Profil tim dari DB, empty state, schema `Person` JSON-LD |

### Kontak & Thank You

| Halaman | Fitur |
|---------|-------|
| `/contact` | Info kontak dari settings, form multi-step, Calendly |
| `/thank-you` | Konfirmasi 24 jam, auto-redirect ke `/blog` setelah 5 detik |

### Halaman P2 (empty state, bukan fake data)

| Halaman | Perilaku |
|---------|----------|
| `/portfolio` | Kosong sampai ada proyek real |
| `/case-studies` | Empty state + link ke blog |
| `/testimonials` | Kosong sampai ada testimoni real |
| `/resources` | Dari `SiteSettings.resources` JSON |
| `/quiz` | Rekomendasi dari layanan aktif di DB |
| `/careers` | Dari DB, field `level` & `benefits` |

### Halaman lain (sudah ada, production-ready)

- `/faq` — FAQ dari DB + FAQPage schema
- `/terms`, `/privacy` — dari settings legal
- `/sitemap.xml`, `/robots.txt` — auto-generated
- `/admin/*` — dashboard CMS lengkap

---

## 4. Form & Lead Generation

### Form Kontak 3 Langkah (PRD V2 §4.7)

| Step | Field |
|------|-------|
| 1 — Info Kontak | Nama*, Email*, Telepon, Perusahaan |
| 2 — Detail Proyek | Jenis proyek*, Layanan (opsional), Anggaran, Timeline*, Deskripsi 50–500 char* |
| 3 — Konfirmasi | Review data + checkbox consent + link privacy |

**Jenis proyek:** Aplikasi Kustom, Konsultasi IT, Pemeliharaan & Support, Lainnya

**Timeline:** ASAP, 1–3 bulan, 3–6 bulan, Fleksibel

**Anggaran:** Tier IDR (`lib/currency.ts`)

File: `frontend/src/components/forms/MultiStepForm.tsx`

### Backend Lead

| Fitur | Implementasi |
|-------|--------------|
| POST `/api/v1/leads` | Simpan ke `form_submissions` |
| Field `timeline` | Kolom baru di schema |
| Duplicate check | `/leads/check-duplicate` |
| Rate limit | 10 submission/jam |
| Analytics event | `form_submit` + conversion funnel |
| Email user | Auto-reply via SMTP/nodemailer |
| Email admin | Notifikasi ke `ADMIN_EMAIL` / `info@dntech.id` |

### Komponen interaktif lain

| Komponen | Status |
|----------|--------|
| NewsletterForm | ✅ Subscribe ke DB |
| SolutionQuiz | ✅ Rekomendasi dari layanan DB |
| ExitIntentModal | ✅ Desktop only, trigger top-edge exit, max 1x/session |
| ROICalculator | ✅ Masih ada (halaman terpisah, tidak di homepage) |
| CalendlyEmbed | ✅ Dari `SiteSettings.calendlyUrl` |
| CrispChatLoader | ✅ Dari `SiteSettings.crispWebsiteId` |
| PageTracker | ✅ Analytics events |

---

## 5. SEO & Structured Data

Implementasi berdasarkan `docs/V2/DN-TECH-SEO-GUIDE-V2.md`.

### Meta & Keywords

| Item | File |
|------|------|
| `buildMetadata()` | `lib/seo.ts` |
| Keywords startup Indonesia | `DEFAULT_KEYWORDS`, `PAGE_SEO` |
| Auto-truncate title ≤60, desc ≤160 | `buildMetadata()` |
| Canonical URL | Per halaman |
| Locale `id_ID` | Open Graph |

### JSON-LD Schema

| Schema | Halaman |
|--------|---------|
| `Organization` | Layout publik |
| `LocalBusiness` | Layout publik |
| `WebSite` | Layout publik |
| `Service` | Detail layanan |
| `BlogPosting` | Artikel blog |
| `FAQPage` | FAQ & detail layanan |
| `Person` | Halaman tim |
| `BreadcrumbList` | Blog, layanan, tim |
| `ItemList` | Blog list |

File: `frontend/src/components/seo/JsonLd.tsx`

### SEO dinamis (bukan hardcode)

- Kontak, footer, hero → `SiteSettings`
- Internal links blog → layanan terkait by category
- Content pillars → link generik (bukan slug demo)

---

## 6. Backend & Database

### Schema (`backend/prisma/schema.prisma`)

**Model utama:** User, Service, Product, PortfolioItem, BlogPost, TeamMember, Testimonial, Faq, Career, FormSubmission, SiteSettings, Media, AnalyticsEvent, NewsletterSubscriber, QuizSubmission, dll.

**Field baru / diperbarui:**

| Model | Field |
|-------|-------|
| `SiteSettings` | `homeStats`, `resources`, `heroDescription`, `businessHours` |
| `SiteSettings` | `primaryColor` default `#1E3A8A` |
| `FormSubmission` | `timeline` |
| `Career` | `level`, `benefits` |

### Seed (`backend/prisma/seed.ts`)

- Hanya create **admin user** + **site settings kosong**
- Tidak ada layanan, blog, testimoni, portfolio demo

### Script utilitas

| Script | Perintah | Fungsi |
|--------|----------|--------|
| Bootstrap seed | `npm run db:seed` | Admin + settings kosong |
| Clear demo content | `npm run db:clear-content` | Hapus semua konten, keep admin |
| Prebuild | `npm run build` | Auto `prisma generate` |

File clear: `backend/scripts/clear-content.ts`

### API Routes

| Prefix | Fungsi |
|--------|--------|
| `/api/v1/services` | Layanan publik |
| `/api/v1/products` | Produk publik (V6) |
| `/api/v1/blog` | Artikel publik |
| `/api/v1/team` | Tim |
| `/api/v1/faq` | FAQ |
| `/api/v1/settings` | Settings publik |
| `/api/v1/leads` | Submit lead |
| `/api/v1/quiz` | Submit quiz (rekomendasi dari DB) |
| `/api/v1/newsletter` | Subscribe |
| `/api/v1/search` | Pencarian sitewide |
| `/api/v1/admin/*` | CRUD CMS + analytics |

### Keamanan

- JWT auth + RBAC (SuperAdmin, ContentManager, Editor, Viewer)
- bcrypt password hashing
- Helmet, CORS (www + apex), rate limiting
- Trust proxy untuk Nginx (`TRUST_PROXY=1`)
- Validasi Zod di routes

---

## 7. Admin Dashboard (CMS)

Semua halaman admin sudah ada dan mendukung konten real:

| Route | Fungsi |
|-------|--------|
| `/admin/login` | JWT login |
| `/admin/dashboard` | Metrik leads & traffic |
| `/admin/analytics` | Conversion funnel |
| `/admin/services` | CRUD layanan |
| `/admin/products` | CRUD produk (V6) |
| `/admin/portfolio` | CRUD portfolio/studi kasus |
| `/admin/blog` | CRUD blog (draft/published/scheduled) |
| `/admin/team` | CRUD tim |
| `/admin/testimonials` | CRUD testimoni |
| `/admin/faqs` | CRUD FAQ |
| `/admin/careers` | CRUD lowongan (+ level, benefits) |
| `/admin/leads` | Manajemen leads + export CSV |
| `/admin/media` | Upload file |
| `/admin/newsletter` | Daftar subscriber |
| `/admin/quiz` | Submission kuis |
| `/admin/settings` | **Pengaturan situs lengkap** |
| `/admin/users` | Manajemen user |

### Admin Settings — field yang bisa diisi

| Field | Tipe |
|-------|------|
| companyName, tagline, heroDescription | Text |
| companyEmail, phone, address, businessHours | Text |
| homeStats | JSON |
| trustBadges, clientLogos | JSON |
| resources, aboutContent | JSON |
| calendlyUrl, leadMagnetUrl | URL |
| googleAnalyticsId, crispWebsiteId | Text |
| termsContent, privacyContent | HTML |

File: `frontend/src/app/admin/settings/page.tsx`

---

## 8. Integrasi & Email

| Integrasi | Status | Konfigurasi |
|-----------|--------|-------------|
| SMTP mailspace | ✅ Kode siap | `SMTP_HOST=mx8.mailspace.id`, `SMTP_PORT=465`, `SMTP_USER=info@dntech.id` |
| Admin notification | ✅ | `ADMIN_EMAIL=info@dntech.id` |
| Welcome email lead | ✅ | Konfirmasi ke user + admin alert |
| Newsletter confirm/welcome | ✅ | Double opt-in token + unsubscribe token |
| Quiz follow-up | ✅ | Rekomendasi dikirim ke user jika email tersedia |
| Career email | ✅ | Admin notification + applicant confirmation |
| Email logs | ✅ | `email_logs` table + `/admin/email-logs` |
| SendGrid legacy | ⚠️ | Env lama masih ada untuk kompatibilitas, SMTP V5 menjadi jalur utama |
| Google Analytics | ✅ Loader | `SiteSettings.googleAnalyticsId` |
| Crisp Chat | ✅ Loader | `SiteSettings.crispWebsiteId` |
| Calendly | ✅ Embed | `SiteSettings.calendlyUrl` |

File email: `backend/src/services/EmailService.ts`

---

## 9. Infrastruktur & Deploy

| Item | Status |
|------|--------|
| PostgreSQL production | ✅ |
| Docker Compose (dev) | ✅ |
| PM2 (`dntech-api`, `dntech-web`) | ✅ Dokumentasi |
| Nginx reverse proxy | ✅ CORS www/apex, trust proxy |
| `NEXT_PUBLIC_API_URL` build-time | ✅ |
| Panduan deploy | `docs/DEPLOYMENT-PRODUCTION.md` |
| Dokumentasi proyek | `docs/PROJECT-OVERVIEW.md` |
| Dokumentasi V2 specs | `docs/V2/*.md` |

### Production domains

| Service | URL |
|---------|-----|
| Website | `https://dntech.id` / `https://www.dntech.id` |
| API | `https://api.dntech.id` |
| Admin | `https://dntech.id/admin/login` |

---

## 10. File & Modul Baru

| File | Fungsi |
|------|--------|
| `frontend/src/lib/settings.ts` | Helper fetch public settings |
| `frontend/src/lib/read-time.ts` | Estimasi waktu baca artikel |
| `frontend/src/lib/service-process.ts` | 5 langkah proses layanan V2 |
| `frontend/src/hooks/useExitIntent.ts` | Hook exit intent V3 |
| `frontend/src/components/branding/LogoLight.tsx` | Navbar: `rlogo2.png` + teks **DN Tech.id** |
| `frontend/src/components/branding/LogoDark.tsx` | Admin / dark bg: `rlogo2.png` (bukan footer publik) |
| `frontend/src/components/layout/FooterBrand.tsx` | Footer wordmark kecil + **DN Tech.id** |
| `frontend/src/components/layout/HeroBrand.tsx` | Hero beranda: wordmark tipografi (tanpa logo PNG) |
| `frontend/src/components/branding/BrandStats.tsx` | Statistik branding beranda |
| `frontend/src/components/branding/BrandStory.tsx` | Section cerita brand |
| `frontend/src/components/branding/CoreValues.tsx` | Grid core values |
| `frontend/src/components/branding/CompetitiveAdvantages.tsx` | Section why choose us |
| `frontend/src/components/branding/BrandTestimonials.tsx` | Testimonials beranda |
| `frontend/src/components/content/AboutPageContent.tsx` | Halaman about — fetch CMS client-side |
| `frontend/src/components/ui/Toast.tsx` | Notifikasi admin (simpan settings) |
| `frontend/src/app/api/revalidate/route.ts` | Bust cache Next setelah update settings |
| `frontend/src/lib/branding.ts` | Helper fetch/cache endpoint branding (legacy helper) |
| `backend/src/routes/branding.ts` | Router API branding publik |
| `backend/src/routes/admin-branding.ts` | Router admin CRUD branding (`/api/v1/admin/branding/*`) |
| `backend/scripts/seed-branding.ts` | Seed data branding awal |
| `frontend/src/app/admin/branding/page.tsx` | Admin brand content |
| `frontend/src/app/admin/branding/values/page.tsx` | Admin core values CRUD |
| `frontend/src/app/admin/branding/advantages/page.tsx` | Admin competitive advantages CRUD |
| `frontend/src/app/admin/branding/stats/page.tsx` | Admin stats CRUD |
| `frontend/src/lib/homepage-content.ts` | Default PRD Indonesia + `resolveHomeContent()` |
| `frontend/src/components/homepage/*` | Section beranda PRD (Hero, Services, Process, dll.) |
| `backend/scripts/seed-homepage.ts` | Seed tagline, `homeContent`, FAQ default |
| `frontend/public/rlogo2.png` | Logo resmi DN Tech |
| `frontend/src/app/icon.png` | Favicon 32×32 (dari rlogo2) |
| `frontend/src/components/interactive/ExitIntentModalLoader.tsx` | Lazy client loader untuk modal exit intent |
| `frontend/src/components/interactive/ThankYouRedirect.tsx` | Auto-redirect thank-you → blog |
| `backend/scripts/clear-content.ts` | Hapus konten demo dari DB |
| `docs/PROJECT-OVERVIEW.md` | Dokumentasi lengkap proyek |
| `docs/V2/` | PRD, Design System, SEO Guide V2 |
| `design/` | V2.1 remediation PRD, SDD, SRS, Action Plan, IMPLEMENTATION |
| `frontend/src/lib/design-tokens.ts` | Token TS mirror (primary, secondary, spacing) |
| `frontend/src/components/ui/Alert.tsx` | Alert 4 variants (V2.1) |
| `frontend/src/components/ui/Badge.tsx` | Badge chip solid colors (V2.1) |
| `frontend/src/components/ui/Modal.tsx` | Modal flat border dialog (V2.1) |
| `frontend/src/components/ui/index.ts` | Barrel export UI kit (V2.1) |
| `frontend/src/components/cards/PortfolioCard.tsx` | Kartu portofolio tanpa gradient (V2.1) |
| `docs/DESIGN_SUMMARY.md` | Ringkasan desain + mandat leadership |
| `docs/design_audit.md` | Audit desain + status pasca-V2.1 |
| `backend/src/routes/products.ts` | Router publik produk (list + detail by slug) (V6) |
| `backend/prisma/schema.prisma` (`Product` model) | Content type produk, field identik `Service` (V6) |
| `frontend/src/app/(public)/products/page.tsx` | Listing produk publik (V6) |
| `frontend/src/app/(public)/products/[slug]/page.tsx` | Detail produk publik (V6) |
| `frontend/src/app/admin/products/page.tsx` | Admin CRUD produk (V6) |
| `frontend/src/types/index.ts` (`Product` interface) | Tipe TS produk (V6) |
| `frontend/src/components/seo/JsonLd.tsx` (`productSchema`) | JSON-LD schema.org Product (V6) |

---

## 11. Yang Sengaja Tidak Di-hardcode

Sesuai kebijakan production — konten ini **harus diisi via Admin**, bukan di kode:

| Konten | Sumber |
|--------|--------|
| Tagline & hero description | Admin → Settings |
| Statistik beranda | Admin → Settings → homeStats JSON |
| Trust badges / differentiators | Admin → Settings |
| Logo klien | Admin → Settings |
| Layanan | Admin → Services |
| Blog artikel | Admin → Blog |
| Tim & foto | Admin → Team |
| FAQ | Admin → FAQs |
| Testimoni | Admin → Testimonials |
| Portfolio / studi kasus | Admin → Portfolio |
| Sumber daya / lead magnet | Admin → Settings → resources |
| About (story, mission, vision) | Admin → Settings → aboutContent |
| Info kontak | Admin → Settings |

---

## 12. Implementasi V3

Implementasi berdasarkan dokumen di `docs/v3/`.

### Scope V3 yang sudah masuk ke codebase

| Area | Status | File |
|------|--------|------|
| Exit intent hook | ✅ | `frontend/src/hooks/useExitIntent.ts` |
| Exit modal UI | ✅ | `frontend/src/components/interactive/ExitIntentModal.tsx` |
| Lazy loader modal | ✅ | `frontend/src/components/interactive/ExitIntentModalLoader.tsx` |
| Logo navbar | ✅ | `LogoLight.tsx` — `rlogo2.png` + **DN Tech.id** |
| Logo footer | ✅ | `FooterBrand.tsx` — logo `sm` + **DN Tech.id** (putih, horizontal layout) |
| Logo admin | ✅ | `LogoDark.tsx` / `Logo.tsx` — `rlogo2.png` |
| Hero beranda | ✅ | `HeroBrand.tsx` — tipografi; **bukan** logo PNG di `bg-blue-900` |
| Favicon | ✅ | `app/icon.png`, metadata `layout.tsx` |
| Mobile nav close on link click | ✅ | Sudah ada dan dipertahankan di `Header.tsx` |
| Form accessibility | ✅ | `Input.tsx`, `MultiStepForm.tsx` |
| Env rollback modal | ✅ | `NEXT_PUBLIC_ENABLE_EXIT_MODAL=false` |

### Perilaku exit intent saat ini

- Modal hanya muncul di desktop/non-touch.
- Trigger utama: mouse keluar dari viewport lewat sisi atas (`clientY <= 0`).
- Modal hanya muncul 1x per session via `sessionStorage.exitIntentModalShown`.
- `beforeunload` dan `visibilitychange` dipakai untuk menandai sesi, bukan memaksa render modal saat tab benar-benar ditutup.
- Close button memindahkan fokus ke modal saat terbuka dan restore fokus setelah dismiss.

### Verifikasi terakhir

| Check | Hasil | Catatan |
|-------|-------|---------|
| `npm run build` frontend | ✅ Sukses | Setelah V4 tidak perlu network Google Fonts |
| ESLint file V3 | ✅ Tidak ada error | Setelah V4 full frontend lint juga bersih |
| `npm run lint` seluruh repo frontend | ✅ Hijau | 0 error, 0 warning |
| Manual QA browser | ⏳ Belum dicatat | Perlu test Chrome/Safari/Firefox + mobile |
| Lighthouse | ⏳ Belum dicatat | Belum ada angka lab audit resmi |

---

## 13. Implementasi V4

Implementasi berdasarkan dokumen di `docs/v4/`.

### Scope V4 yang sudah masuk ke codebase

| Area | Status | File |
|------|--------|------|
| Search debounce + request cancel | ✅ | `frontend/src/components/common/Header.tsx` |
| Settings server cache/dedupe | ✅ | `frontend/src/lib/settings.ts` |
| GA defer until idle | ✅ | `frontend/src/components/seo/AnalyticsLoader.tsx` |
| Crisp defer until interaction | ✅ | `frontend/src/components/interactive/CrispChatLoader.tsx` |
| Page tracking defer until idle | ✅ | `frontend/src/components/common/PageTracker.tsx` |
| Homepage streaming | ✅ | `frontend/src/app/(public)/page.tsx` |
| `next/image` migration | ✅ | Blog detail, team page, team spotlight, case study detail, admin media |
| Image remote patterns + AVIF/WebP | ✅ | `frontend/next.config.ts` |
| Build root warning fix | ✅ | `frontend/next.config.ts` (`turbopack.root`) |
| Remove Google Fonts build dependency | ✅ | `frontend/src/app/layout.tsx`, `frontend/src/app/globals.css` |
| Backend memory cache | ✅ | `backend/src/services/CacheService.ts` |
| Public endpoint caching | ✅ | Services, blog list, team, settings |
| Admin cache invalidation | ✅ | Service/blog/team/settings mutations clear cache |
| Frontend lint cleanup | ✅ | Admin load effects, React Hook Form watch warning, unused import |

### Perilaku performa saat ini

- Homepage initial render hanya menunggu settings + services; blog dan team preview stream lewat `Suspense`.
- `getPublicSettings()` memakai React `cache()` sehingga server components dalam satu render tidak fetch settings berulang.
- GA baru dimount saat browser idle; Crisp baru dimuat setelah interaksi user.
- Search header menunggu 300ms setelah user berhenti mengetik dan membatalkan request sebelumnya.
- Public API `services`, `blog`, `team`, dan `settings` punya memory TTL cache.
- Admin mutation untuk service, blog, team, dan settings membersihkan cache supaya konten publik tidak stale terlalu lama.
- Build frontend tidak lagi membutuhkan `fonts.googleapis.com`.

### Verifikasi terakhir V4

| Check | Hasil | Catatan |
|-------|-------|---------|
| `npm run lint` frontend | ✅ Sukses | 0 error, 0 warning |
| `npm run build` frontend | ✅ Sukses | Perlu eskalasi sandbox karena Turbopack internal process, bukan karena network font |
| `npm run build` backend | ✅ Sukses | Prisma generate + TypeScript compile sukses |
| Scan `<img>` publik | ✅ Bersih | Tidak ada raw `<img>` tersisa di `frontend/src` |
| Google Fonts dependency | ✅ Dihapus | Tidak ada `next/font/google` / `fonts.googleapis` di source |
| Lighthouse | ⏳ Belum dicatat | Perlu lab/field test setelah deploy |

---

## 14. Implementasi V5

Implementasi berdasarkan dokumen di `docs/v5/`.

### Scope V5 yang sudah masuk ke codebase

| Area | Status | File |
|------|--------|------|
| SMTP service nodemailer | ✅ | `backend/src/services/EmailService.ts` |
| Email retry + rate limit pool | ✅ | `EMAIL_RETRY_ATTEMPTS`, `EMAIL_RATE_LIMIT` |
| Email templates | ✅ | `backend/src/templates/emailTemplates.ts` |
| Email queue in-memory | ✅ | `backend/src/services/EmailQueueService.ts` |
| Email log database model | ✅ | `backend/prisma/schema.prisma` (`EmailLog`) |
| Newsletter token fields | ✅ | `NewsletterSubscriber.status`, `confirmToken`, `unsubToken`, timestamps |
| Lead confirmation email | ✅ | `LeadService.createLead()` |
| Admin lead notification | ✅ | `LeadService.createLead()` → `ADMIN_EMAIL` |
| Generic forms email | ✅ | `forms/contact`, `forms/service-request`, `forms/career` |
| Career email flow | ✅ | Admin notification + applicant confirmation |
| Newsletter confirm flow | ✅ | `/newsletter/subscribe`, `/newsletter/confirm`, `/newsletter/unsubscribe` |
| Quiz follow-up | ✅ | `/quiz/submit` uses V5 template/service |
| Admin email monitoring | ✅ | `/admin/email-logs`, `/admin/email-stats`, frontend `/admin/email-logs` |
| Env documentation | ✅ | `backend/.env.example` |

### Perilaku email saat ini

- Semua lead/contact/service request mengirim konfirmasi ke user dan notifikasi admin ke `ADMIN_EMAIL` (`info@dntech.id` di production).
- Newsletter memakai double opt-in: subscribe → email confirmation → confirm → welcome email.
- Newsletter unsubscribe memakai token unik.
- Quiz follow-up dikirim jika user mengisi email.
- Career application mengirim notifikasi ke admin dan confirmation ke pelamar.
- Semua attempt email dicatat di tabel `email_logs`.
- Jika SMTP credentials belum diisi, email tidak membuat aplikasi crash; attempt dicatat sebagai `skipped` dan di-log ke console.

### Konfigurasi SMTP V5

| Variable | Nilai produksi |
|----------|----------------|
| `SMTP_HOST` | `mx8.mailspace.id` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | `info@dntech.id` |
| `SMTP_PASSWORD` | Password mailbox dari provider |
| `SMTP_FROM_NAME` | `DN Tech` |
| `SMTP_FROM_EMAIL` | `info@dntech.id` |
| `ADMIN_EMAIL` | `info@dntech.id` |

### Verifikasi terakhir V5

| Check | Hasil | Catatan |
|-------|-------|---------|
| `npm run build` backend | ✅ Sukses | Prisma generate + TypeScript compile sukses |
| `npm run lint` frontend | ✅ Sukses | Admin email logs page lint OK |
| `npm run build` frontend | ✅ Sukses | Route `/admin/email-logs` ter-generate |
| SMTP live send | ⏳ Belum dicatat | Perlu password mailbox production |
| DB migration/push | ⏳ Belum dijalankan di production | Perlu `npx prisma db push` / migration di VPS |

---

## 15. Implementasi V6 — Modul Produk

Menambahkan content type "Produk" yang berdiri sendiri, terpisah dari "Layanan" — sesuai permintaan agar situs punya nav khusus produk selain jasa/layanan. Dibangun dengan meniru struktur `Service` yang sudah production-ready secara 1:1 (model data, route publik, admin CRUD, halaman frontend), bukan pola baru.

### Scope V6 yang sudah masuk ke codebase

| Area | Status | File |
|------|--------|------|
| Model `Product` (field identik `Service`) | ✅ | `backend/prisma/schema.prisma` |
| Relasi `User.products` | ✅ | `backend/prisma/schema.prisma` |
| Route publik `GET /products`, `GET /products/:slug` | ✅ | `backend/src/routes/products.ts` |
| Admin CRUD `/admin/products` (+ `:id`, `/reorder`) | ✅ | `backend/src/routes/admin.ts` |
| Mount route di app | ✅ | `backend/src/index.ts` |
| Produk masuk sitewide search (`type: 'product'`) | ✅ | `backend/src/routes/search.ts` |
| Halaman publik list + detail | ✅ | `frontend/src/app/(public)/products/**` |
| Halaman admin CRUD | ✅ | `frontend/src/app/admin/products/page.tsx` |
| Nav "Produk" terpisah dari "Layanan" (flat, bukan dropdown) | ✅ | `frontend/src/components/common/Header.tsx` |
| Sidebar admin "Produk" | ✅ | `frontend/src/components/admin/AdminSidebar.tsx` |
| Tipe TS `Product` | ✅ | `frontend/src/types/index.ts` |
| JSON-LD `productSchema` + `PAGE_SEO.products` | ✅ | `frontend/src/components/seo/JsonLd.tsx`, `frontend/src/lib/seo.ts` |
| Produk masuk `sitemap.xml` | ✅ | `frontend/src/app/sitemap.ts` |

### Keputusan desain

- **Nav flat, bukan dropdown** — codebase tidak punya pola dropdown/submenu sama sekali sebelumnya; menambah "Produk" sebagai item nav baru yang sejajar "Layanan" konsisten dengan pola yang ada dan sesuai preferensi yang dikonfirmasi.
- **Parity penuh dengan `Service`** — field model, alur CRUD admin, dan cache/permission (`requireWrite`, `logActivity`, `cacheService`) sama persis, supaya tidak ada dua pola berbeda untuk dua content type yang serupa.
- **Halaman detail produk lebih sederhana dari layanan** — tidak memakai `SERVICE_PROCESS_STEPS` atau `CalendlyEmbed`, karena keduanya memodelkan alur konsultasi penjualan jasa yang tidak relevan untuk produk siap pakai.

### Verifikasi terakhir V6

| Check | Hasil | Catatan |
|-------|-------|---------|
| `npx prisma generate` | ✅ Sukses | Schema-only, tanpa koneksi DB |
| `npm run build` / `tsc --noEmit` backend | ✅ Sukses | |
| `tsc --noEmit` frontend | ✅ Sukses | |
| `npm run build` frontend | ✅ Sukses | Route `/products`, `/products/[slug]`, `/admin/products` ter-generate |
| Backend boot test lokal | ✅ Sukses | `/health` merespons setelah mount route baru |
| `npx prisma db push` ke production | ⏳ Belum dijalankan | Tabel `products` belum ada di DB production — perlu dijalankan pemilik repo sebelum `/admin/products` bisa menyimpan data |

---

## 16. Implementasi V7 — Product Section PRD (dnPeople Flagship)

Memperluas model `Product` generik dari V6 menjadi halaman produk marketing-grade untuk dnPeople: pricing tiers, fitur per kategori, use case per segmen, integrasi, tabel perbandingan kompetitor, testimoni, roadmap, dan multi-CTA. Referensi: `company-wiki/docs/products/dntech/PRD/DN-TECH-PRODUCT-SECTION-PRD.md`.

**Keputusan desain kunci:** PRD mengusulkan "rich JSON editor / form builder" dengan drag-drop di admin. Codebase ini tidak punya pola seperti itu di manapun — pola yang sudah ada dan production-proven untuk konten JSON bebas-bentuk adalah `admin/settings/page.tsx` (textarea JSON pretty-printed + `parseJsonField` helper, tanpa validasi zod mendalam di backend). Implementasi ini meniru pola itu persis, bukan membangun library editor baru.

### Kolom baru di model `Product` (semua nullable/additive)

| Kolom | Tipe | Kegunaan |
|-------|------|----------|
| `tagline` | String? | Sub-judul pendek di hero |
| `heroImage`, `heroAlt` | String? | Gambar hero + alt text |
| `logoUrl` | String? | Logo produk |
| `screenshotUrls` | Json? | Array URL screenshot |
| `keywords`, `canonical` | String? | SEO tambahan |
| `featured` | Boolean | Tandai produk unggulan di listing |
| `publishedAt` | DateTime? | Tanggal publish (pola sama seperti `BlogPost`) |
| `launchStatus` | String? | `launched` \| `beta` \| `coming_soon` |
| `freemiumEnabled`, `freeLimit`, `trialDays` | Boolean/String?/Int? | Info tier gratis |
| `customerCount` | String? | Social proof, contoh `"500+"` |
| `techStack` | Json? | Array teknologi (opsional) |
| `pricingTiers` | Json? | Array tier harga (id, name, pricing, features, cta) |
| `integrations` | Json? | Array integrasi (name, category, status, url) |
| `useCases` | Json? | Array segmen use case + testimoni + CTA per segmen |
| `testimonials` | Json? | Array testimoni |
| `caseStudies` | Json? | Array studi kasus (opsional) |
| `comparisonTable` | Json? | `{ competitors: string[], rows: [...] }` |
| `roadmap` | Json? | Array `{ quarter, status, features }` |
| `primaryCta`, `secondaryCtas` | Json? | CTA utama + alternatif |
| `pricingCalcUrl`, `demoUrl` | String? | Link kalkulator harga & booking demo |
| `longFormContent` | String? (Text) | Konten panjang/markdown opsional |
| `faq` | Json? | FAQ khusus produk ini (fallback ke `/faq` global jika kosong) |

`features` (sudah ada sejak V6) sekarang mendukung dua bentuk: flat `[{title, description}]` (produk sederhana) atau grouped `[{category, icon, features: [{name, description}]}]` (dnPeople) — dideteksi otomatis di frontend, tanpa migrasi.

### Scope V7 yang sudah masuk ke codebase

| Area | Status | File |
|------|--------|------|
| Kolom baru di `Product` model | ✅ | `backend/prisma/schema.prisma` |
| `productSchema` admin diperlebar (scalar tervalidasi, JSON longgar) | ✅ | `backend/src/routes/admin.ts` |
| Field baru di `select` list publik | ✅ | `backend/src/routes/products.ts` |
| Seed dnPeople (5 pricing tier, 5 kategori fitur, 6 integrasi, 3 use case, 3 testimoni, comparison table, roadmap 4 quarter) | ✅ | `backend/scripts/seed-dnpeople-product.ts`, `npm run db:seed-dnpeople` |
| Tipe TS diperluas (`PricingTier`, `ProductFeatureGroup`, `UseCaseSegment`, dll) | ✅ | `frontend/src/types/index.ts` |
| Admin form 8 section (Info Dasar, SEO, Media & CTA, Pricing, Fitur & Use Case, Integrasi & Perbandingan, Sosial Proof, Roadmap & FAQ, Status & Publishing) | ✅ | `frontend/src/app/admin/products/page.tsx` |
| List publik: tagline, badge unggulan, "Mulai dari Rp X" | ✅ | `frontend/src/app/(public)/products/page.tsx` |
| Detail publik: Use Cases, Pricing Tiers, Integrations, Comparison Table, Testimonials, Roadmap, FAQ produk-spesifik, bottom CTA band — semua render kondisional | ✅ | `frontend/src/app/(public)/products/[slug]/page.tsx` |
| `formatCurrencyIDR` helper | ✅ | `frontend/src/lib/utils.ts` |

### Di luar scope (alasan di plan implementasi)

- Section "Value Proposition" — tidak ada field data di PRD sendiri (`[From copywriting]`), tidak ada yang bisa di-wire.
- Rich/WYSIWYG atau drag-drop JSON builder — sengaja dihindari, memakai pola JSON-textarea yang sudah ada.
- Upload widget untuk `heroImage`/`logoUrl`/`screenshotUrls` — tetap text/JSON URL biasa, konsisten dengan `iconUrl` yang sudah ada.

### Verifikasi terakhir V7

| Check | Hasil | Catatan |
|-------|-------|---------|
| `npx prisma generate` | ✅ Sukses | Schema-only |
| `tsc --noEmit` backend | ✅ Sukses | |
| `tsc --noEmit` + `npm run build` frontend | ✅ Sukses | `/products`, `/products/[slug]`, `/admin/products` ter-generate |
| Backend boot test lokal | ✅ Sukses | `/health` 200; `/products` 500 hanya karena tidak ada Postgres lokal di mesin dev, bukan bug kode |
| `npx prisma db push` + `npm run db:seed-dnpeople` ke production | ⏳ Belum dijalankan | Perlu dijalankan pemilik repo sebelum halaman `/products/dnpeople` menampilkan data lengkap |

---

## 17. Audit Performa: Kenapa Web Lambat

Audit ini awalnya adalah hasil review kode dan build, bukan hasil Lighthouse lab run. Kolom status menunjukkan kondisi setelah implementasi V4.

### Ringkasan penyebab utama

| Prioritas | Temuan | Status V4 |
|-----------|--------|-----------|
| P0 | Homepage SSR menunggu beberapa request API | ✅ Ditangani dengan Suspense streaming + cache |
| P0 | `settings` di-fetch lebih dari sekali | ✅ Ditangani server cache + props ke loader |
| P1 | Client loader melakukan request tambahan setelah hydration | ✅ GA/Crisp tidak fetch settings lagi |
| P1 | Third-party scripts GA/Crisp dimuat terlalu awal | ✅ GA idle, Crisp first interaction |
| P1 | Beberapa gambar masih pakai `<img>` biasa | ✅ Migrasi ke `next/image` |
| P2 | Header search tidak debounce | ✅ Debounce 300ms + AbortController |
| P2 | Font/build dependency eksternal | ✅ Google Fonts dependency dihapus |
| P2 | Build warnings root inference | ✅ `turbopack.root` dikonfigurasi |

### Detail temuan

#### 1. Homepage menunggu 4 API request sebelum render

File: `frontend/src/app/(public)/page.tsx`

Sebelum V4, homepage menjalankan:

- `GET /services`
- `GET /blog?pageSize=4`
- `GET /team`
- `GET /settings`

Semua request memang diparalelkan dengan `Promise.all`, tapi halaman server-render tetap harus menunggu semuanya selesai untuk menghasilkan HTML.

Status V4:

- Blog dan team preview sudah dipindah ke async section dalam `Suspense`.
- Initial render homepage hanya menunggu settings + services.
- Backend public endpoints sudah memakai memory TTL cache.

#### 2. `settings` di-fetch berulang

File terkait:

- `frontend/src/app/(public)/layout.tsx`
- `frontend/src/app/(public)/page.tsx`
- `frontend/src/components/interactive/CrispChatLoader.tsx`
- `frontend/src/components/seo/AnalyticsLoader.tsx`

Sebelum V4, layout publik fetch `getPublicSettings()`, homepage fetch `/settings` lagi di `getHomeData()`, lalu `CrispChatLoader` dan `AnalyticsLoader` fetch `/settings` dari browser.

Status V4:

- `getPublicSettings()` dibungkus React `cache()`.
- Layout mengirim `googleAnalyticsId` dan `crispWebsiteId` langsung ke loader.
- Loader GA/Crisp tidak lagi fetch `/settings` sendiri.
- Backend `/settings` punya memory TTL cache.

#### 3. Tracking dan chat menambah request setelah hydration

File terkait:

- `frontend/src/components/common/PageTracker.tsx`
- `frontend/src/components/seo/AnalyticsLoader.tsx`
- `frontend/src/components/interactive/CrispChatLoader.tsx`

Sebelum V4, saat halaman publik dibuka browser dapat melakukan:

- `POST /analytics/track`
- `GET /settings` untuk GA
- `GET /settings` untuk Crisp
- request script GA dari Google
- request script Crisp dari Crisp CDN

Ini tidak selalu memblokir HTML awal, tetapi bisa membuat halaman terasa berat di koneksi lambat atau device low-end.

Status V4:

- GA dimount saat browser idle.
- Crisp dimuat pada interaksi pertama user.
- PageTracker POST juga didefer sampai idle/fallback delay.

#### 4. Gambar belum seluruhnya pakai Next Image

Sebelum V4, file ini masih memakai `<img>`:

- `frontend/src/app/(public)/blog/[slug]/page.tsx`
- `frontend/src/app/(public)/team/page.tsx`
- `frontend/src/components/layout/TeamSpotlight.tsx`
- `frontend/src/app/(public)/case-studies/[slug]/page.tsx`
- `frontend/src/app/admin/media/page.tsx`

Dampak:

- Browser tidak dapat automatic image optimization dari Next.
- Risiko CLS jika width/height/aspect ratio tidak stabil.
- Risiko bandwidth besar jika gambar upload tidak dikompresi.

Status V4:

- Semua raw `<img>` di `frontend/src` sudah dimigrasi ke `next/image`.
- `remotePatterns` sudah mencakup localhost, `dntech.id`, `www.dntech.id`, dan `api.dntech.id`.
- `formats` mencakup AVIF dan WebP.

#### 5. `next/font/google` butuh network saat build

File: `frontend/src/app/layout.tsx`

Sebelum V4, build pernah gagal ketika sandbox tidak punya akses ke `fonts.googleapis.com`. Ini bisa membuat deploy VPS gagal kalau outbound network dibatasi.

Status V4:

- Import `next/font/google` sudah dihapus.
- CSS memakai system Inter stack lewat `--font-inter`.
- Build tidak lagi perlu akses Google Fonts.

#### 6. Header search belum debounce

File: `frontend/src/components/common/Header.tsx`

Sebelum V4, setiap perubahan input search dengan panjang query >= 2 memanggil `/search`. Ini bukan masalah first load, tetapi bisa membuat API terasa berat saat user mengetik cepat.

Status V4:

- Search header memakai debounce 300ms.
- Request sebelumnya dibatalkan dengan `AbortController`.

#### 7. Build warning root lockfile

Sebelum V4, Next menampilkan warning bahwa workspace root terdeteksi dari lockfile di parent directory, sementara project juga punya `frontend/package-lock.json`.

Dampak:

- Bukan runtime issue.
- Bisa bikin cache/build path membingungkan di local/CI.

Status V4:

- `turbopack.root` sudah diset ke `process.cwd()` di `frontend/next.config.ts`.

### Prioritas optimasi berikutnya setelah V4

| Urutan | Action | Ekspektasi impact |
|--------|--------|-------------------|
| 1 | Jalankan Lighthouse mobile/desktop setelah deploy | Validasi angka LCP/CLS/TTFB aktual |
| 2 | Cek Network tab produksi untuk request `/settings` dan scripts | Pastikan tidak ada regresi duplicate fetch |
| 3 | Pertimbangkan Redis jika traffic multi-instance | Memory cache saat ini per-process |
| 4 | Tambahkan CDN/image resize pipeline untuk uploads besar | Next Image membantu, tapi upload original masih perlu governance |
| 5 | Endpoint agregat homepage jika API latency masih tinggi | Mengurangi roundtrip antar frontend-backend |

---

## 18. Checklist Verifikasi Cepat

Setelah deploy, pastikan:

- [ ] `npx prisma db push` sukses (field `timeline`, `level`, `benefits`)
- [ ] `npm run build` backend & frontend sukses
- [ ] Homepage tanpa gradient, nav 5 item
- [ ] Form kontak 3 langkah + consent
- [ ] Tidak ada email/telepon fake di footer
- [ ] `/case-studies` empty state (bukan data demo)
- [ ] Login admin → isi settings & konten
- [ ] Exit modal hanya muncul desktop saat mouse keluar dari top edge
- [ ] Exit modal tidak muncul ulang setelah refresh di session yang sama
- [ ] Navbar logo tidak punya background PNG hitam
- [ ] Network tab: tidak ada request `/settings` berulang yang tidak perlu
- [ ] Lighthouse mobile + desktop dicatat setelah deploy
- [ ] Search hanya memanggil API setelah debounce
- [ ] GA muncul setelah idle, Crisp muncul setelah interaksi
- [ ] Gambar publik lewat `/_next/image`
- [ ] Cache publik refresh setelah update konten admin
- [ ] `npx prisma db push` menciptakan/menambah `email_logs` dan field newsletter token
- [ ] SMTP `.env` production diisi untuk `info@dntech.id`
- [ ] Submit form kontak → user dapat confirmation + admin dapat alert
- [ ] Newsletter subscribe → confirm email → welcome email
- [ ] `/admin/email-logs` menampilkan status pengiriman

### Design V2.1 (setelah deploy)

- [ ] `/portfolio` — kartu tanpa gradient; fallback `bg-blue-900/10` atau gambar CMS
- [ ] `/case-studies/[slug]` — hero solid atau overlay `bg-black/45`; tanpa `backdrop-blur`
- [ ] `/admin/login` — form flat border; error pakai `Alert`
- [ ] Admin sidebar — `bg-blue-900` (bukan slate)
- [ ] Form kontak / newsletter / quiz — success & error pakai `Alert`
- [ ] Exit intent — modal flat border via `Modal` component
- [ ] Grep production artifact: 0 `gradient-to-*`, 0 `backdrop-blur`

### Jul 9 polish (setelah deploy)

- [ ] Navbar: logo `rlogo2` + teks **DN Tech.id**
- [ ] Hero: wordmark kecil + H1 tagline (tanpa lingkaran logo)
- [ ] Favicon tab browser = logo DN Tech (hard refresh jika cache lama)
- [ ] `/about` — visi & misi tampil setelah isi `aboutContent` di admin
- [ ] Admin settings — toast hijau saat simpan berhasil
- [ ] `NEXT_PUBLIC_API_URL=https://api.dntech.id/api/v1` di build production

---

## 19. Loading UX Global

Implementasi 13 Juli 2026 memastikan aplikasi selalu memberi feedback visual ketika navigasi atau request data masih berjalan.

| Area | Implementasi |
|------|---------------|
| Initial application load | `app/loading.tsx` menampilkan full-screen branded loader |
| Public route navigation | `(public)/loading.tsx` menyediakan Suspense fallback instan |
| Admin route navigation | `admin/loading.tsx` menampilkan fallback di area panel admin |
| Session validation | Admin layout memakai `PageLoading` dengan label pemeriksaan sesi |
| Client API request | `apiFetch` dan `apiFetchPaginated` memicu overlay global |
| Parallel request | Counter request memastikan overlay baru hilang setelah seluruh request selesai |
| Fast request | Delay 180 ms mencegah flicker pada request yang selesai cepat |
| Initial CRUD fetch | Tabel admin menampilkan “Memuat data...” sebelum empty state |
| Accessibility | `role=status`, `aria-live`, label eksplisit, serta dukungan reduced motion global |

Komponen utama:

- `frontend/src/components/ui/PageLoading.tsx`
- `frontend/src/components/ui/GlobalLoadingIndicator.tsx`
- `frontend/src/lib/loading-events.ts`

Verifikasi: TypeScript ✅ · ESLint 0 error/warning ✅ · Next.js production build 48 route ✅.

### Hotfix produk publik tidak tampil

Gejala production: produk aktif terlihat di admin, tetapi `/products` menampilkan empty state. Verifikasi menunjukkan endpoint `https://api.dntech.id/api/v1/products` mengembalikan produk aktif, sedangkan server-rendered HTML tetap berisi daftar kosong.

Root cause:

- admin memakai `getApiBaseUrl()`;
- halaman produk publik sebelumnya membaca `NEXT_PUBLIC_API_URL` langsung;
- `.env.local` build berisi URL localhost;
- kegagalan SSR fetch ditelan dan dikonversi menjadi array kosong.

Perbaikan:

- listing dan detail produk memakai resolver API yang sama;
- production otomatis menolak `localhost`/`127.0.0.1` dan memakai `https://api.dntech.id/api/v1`;
- konfigurasi lama `https://dntech.id/api/...` tetap dinormalisasi ke subdomain API;
- fetch failure dicatat di server log agar tidak lagi terlihat seperti data kosong biasa.

Deployment frontend wajib menjalankan build ulang karena `NEXT_PUBLIC_*` dibake ke artifact.

---

## 20. Referensi Dokumen

| Dokumen | Isi |
|---------|-----|
| [`docs/PROJECT-OVERVIEW.md`](./PROJECT-OVERVIEW.md) | Overview teknis proyek |
| [`docs/V2/README-V2-CHANGES.md`](./V2/README-V2-CHANGES.md) | Perubahan v1 → v2 |
| [`docs/V2/DN-TECH-PRD-V2.md`](./V2/DN-TECH-PRD-V2.md) | Product requirements |
| [`docs/V2/DN-TECH-DESIGN-SYSTEM-V2.md`](./V2/DN-TECH-DESIGN-SYSTEM-V2.md) | Design system |
| [`docs/V2/DN-TECH-SEO-GUIDE-V2.md`](./V2/DN-TECH-SEO-GUIDE-V2.md) | SEO guide |
| [`docs/v3/00-START-HERE.md`](./v3/00-START-HERE.md) | Paket dokumen V3 |
| [`docs/v3/DN-TECH-PRD-V3.md`](./v3/DN-TECH-PRD-V3.md) | Refinement PRD V3 |
| [`docs/v3/DN-TECH-V3-IMPLEMENTATION-GUIDE.md`](./v3/DN-TECH-V3-IMPLEMENTATION-GUIDE.md) | Panduan implementasi V3 |
| [`docs/v4/DN-TECH-PRD-V4.md`](./v4/DN-TECH-PRD-V4.md) | Performance PRD V4 |
| [`docs/v4/DN-TECH-V4-IMPLEMENTATION-GUIDE.md`](./v4/DN-TECH-V4-IMPLEMENTATION-GUIDE.md) | Panduan implementasi V4 |
| [`docs/v4/DN-TECH-V4-SUMMARY.md`](./v4/DN-TECH-V4-SUMMARY.md) | Ringkasan V4 |
| [`docs/v5/01-COMPLETE-ROADMAP.md`](./v5/01-COMPLETE-ROADMAP.md) | Roadmap V1-V5 |
| [`docs/v5/DN-TECH-PRD-V5.md`](./v5/DN-TECH-PRD-V5.md) | Email PRD V5 |
| [`docs/v5/DN-TECH-V5-IMPLEMENTATION-GUIDE.md`](./v5/DN-TECH-V5-IMPLEMENTATION-GUIDE.md) | Panduan implementasi V5 |
| [`docs/v5/DN-TECH-V5-SUMMARY.md`](./v5/DN-TECH-V5-SUMMARY.md) | Ringkasan V5 |
| [`docs/DEPLOYMENT-PRODUCTION.md`](./DEPLOYMENT-PRODUCTION.md) | Panduan deploy |
| [`docs/DESIGN_SUMMARY.md`](./DESIGN_SUMMARY.md) | Ringkasan desain V2 + mandat CEO/Tech Lead |
| [`docs/design_audit.md`](./design_audit.md) | Audit desain + status pasca-V2.1 |
| [`design/IMPLEMENTATION.md`](../design/IMPLEMENTATION.md) | Status mapping design → kode |
| [`design/DN-TECH-DESIGN-V2.1-PRD.md`](../design/DN-TECH-DESIGN-V2.1-PRD.md) | PRD remediation V2.1 |
| [`design/DN-TECH-DESIGN-V2.1-SDD.md`](../design/DN-TECH-DESIGN-V2.1-SDD.md) | SDD implementasi V2.1 |
| [`design/DN-TECH-DESIGN-V2.1-ACTION-PLAN.md`](../design/DN-TECH-DESIGN-V2.1-ACTION-PLAN.md) | Quick action plan V2.1 |

---

*Dokumen ini hanya mencatat implementasi teknis yang sudah selesai. Untuk konten marketing (artikel blog, foto tim, GA4 setup), lihat checklist operasional di `docs/V2/README-V2-CHANGES.md`.*

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
