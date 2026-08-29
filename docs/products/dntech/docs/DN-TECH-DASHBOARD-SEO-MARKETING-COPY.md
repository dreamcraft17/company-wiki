# DN Tech — SEO & Marketing Copy (Dashboard Reference)

> **Author:** Dozer  
> **Date:** 2026-08-29  
> **Status:** Active · Living reference  
> **Repo HEAD:** `da52085`

Dokumen ini merangkum **kata-kata marketing dan SEO** yang dipakai di situs `dntech.id` — sumbernya dari admin dashboard (CMS), seed database, dan default di kode frontend. Gunakan sebagai referensi copywriting, audit anti-slop, dan input PRD berikutnya.

**SSOT hierarchy:**

```text
Kode default (homepage-content.ts, seo.ts)
        ↓ override via dashboard
SiteSettings / BrandContent / Product / FAQ di database
        ↓ tampil di frontend
Halaman publik + meta tag + JSON-LD
```

---

## Summary

| Layer | Lokasi admin | Field utama | Bahasa |
|-------|--------------|-------------|--------|
| **Situs global** | `/admin/settings` | tagline, hero, homeContent JSON, GA ID | ID |
| **Branding / About** | `/admin/branding/*` | story, mission, values, stats | ID (+ EN di advantages) |
| **Produk** | `/admin/products` | meta title/description, keywords, tagline, CTA | ID / EN mix |
| **FAQ** | `/admin/faqs` | pertanyaan + jawaban | ID |
| **Meta halaman statis** | *(tidak di dashboard)* | `frontend/src/lib/seo.ts` | ID |
| **CTA hero** | *(hardcoded UI)* | `HomeHero.tsx` | ID |

---

## 1. Admin Dashboard — Peta Field

### 1.1 Pengaturan Situs (`/admin/settings`)

| Kartu | Label field (UI) | Key DB / API | Dipakai di |
|-------|------------------|--------------|------------|
| **Umum** | Nama Perusahaan | `companyName` | Footer, JSON-LD, legal |
| | Slogan (Tagline) | `tagline` | Fallback H1 hero jika `homeContent.heroTitle` kosong |
| | Deskripsi Hero (Beranda) | `heroDescription` | Fallback paragraf hero |
| | Email, Telepon, Alamat | `companyEmail`, dll. | Contact, footer |
| | Jam Operasional | `businessHours` | Contact — placeholder: `Sen - Jum, 9:00 - 18:00 WIB` |
| | Warna Utama | `primaryColor` | CSS `--primary` (default load UI: `#2563eb`) |
| **Beranda** | Konten Beranda — PRD Indonesia (JSON) | `homeContent` | Section homepage — lihat §3 |
| | Statistik Beranda (JSON) | `homeStats` | Legacy — tidak dipakai homepage baru |
| **Tentang Kami** | Konten About (JSON) | `aboutContent` | `/about` — merge dengan BrandContent |
| **Sumber Daya** | Daftar Sumber Daya (JSON) | `resources` | `/resources` |
| **Kepercayaan & Konversi** | URL Calendly | `calendlyUrl` | Exit intent, produk demo |
| | URL Lead Magnet | `leadMagnetUrl` | Lead gen |
| | ID Situs Web Crisp Chat | `crispWebsiteId` | Live chat |
| | Lencana Kepercayaan (JSON) | `trustBadges` | Trust section |
| | Logo Klien (JSON) | `clientLogos` | Social proof |
| **SEO** | ID Google Analytics | `googleAnalyticsId` | Satu-satunya field SEO di halaman ini |
| **Hukum** | Syarat Layanan (HTML) | `termsContent` | `/terms` |
| | Kebijakan Privasi (HTML) | `privacyContent` | `/privacy` |

**Help text penting (Beranda):**

> Override section homepage per PRD Indonesia Edition. Kosongkan field untuk pakai default di kode.

**Shape JSON `homeContent`** (kontrak frontend):

```json
{
  "heroTitle": "...",
  "heroSubtitle": "...",
  "heroBadges": ["Web Apps", "Mobile Apps", "Custom Solutions"],
  "heroSupporting": "...",
  "processSteps": [{ "step": 1, "title": "...", "description": "..." }],
  "advantages": [{ "title": "...", "description": "..." }],
  "techStack": [{ "category": "Frontend", "items": ["React", "Next.js"] }],
  "pricing": [{ "name": "...", "price": "...", "included": ["..."] }],
  "defaultServices": [{ "name": "...", "description": "..." }],
  "hiringRoles": ["..."],
  "hiringEmail": "careers@dntech.id",
  "portfolioMessage": "...",
  "testimonialsMessage": "..."
}
```

**Ada di DB tapi belum di UI admin:** `seoTitleTemplate`, `seoDescriptionTemplate`, `socialLinks`, `logoId`, `faviconId`, `isMaintenanceMode`.

---

### 1.2 Branding (`/admin/branding`)

| Halaman | Field | Catatan |
|---------|-------|---------|
| **Brand Story** | Tagline Section | Placeholder: `Tentang DN Tech` |
| | Story (150-300 kata) | Narasi studio — seed §4 |
| | Mission Statement | |
| | Image URL (opsional) | |
| **Core Values** | Nama, Deskripsi, Icon Lucide, Urutan | 5 nilai default — seed §4 |
| **Competitive Advantages** | Judul, Deskripsi, Icon, Urutan | Label EN — seed §4 |
| **Stats** | Label, Nilai, Icon, Urutan | `Produk First-Party: 7`, `Tahun Membangun: 3` |

Subtitle halaman: *Kelola Brand Story, Core Values, Competitive Advantage, dan statistik beranda.*

---

### 1.3 Produk (`/admin/products`)

Satu-satunya modul admin dengan **kartu SEO lengkap**:

| Label UI | Field DB |
|----------|----------|
| Meta Title | `seoTitle` |
| Meta Description | `seoDescription` |
| Keywords (comma-separated) | `keywords` |
| Canonical URL | `canonical` |

Field marketing lain di form yang sama: `Nama`, `Slug`, `Tagline`, `Kategori`, `Deskripsi`, `Konten Panjang`, hero/logo/CTA/pricing/FAQ JSON.

**Modul tanpa UI SEO** (field ada di schema, dipakai frontend jika diisi via API/DB): Layanan, Blog, Portfolio.

---

### 1.4 Modul marketing lain

| Route | Field copy | SEO UI |
|-------|------------|--------|
| `/admin/faqs` | Pertanyaan, Jawaban, Kategori, Urutan | — |
| `/admin/services` | Nama, Kategori, Deskripsi, Status, Urutan | — |
| `/admin/blog` | Judul, Kategori, Cuplikan, Konten HTML, Status | — |
| `/admin/portfolio` | Judul, Klien, Ringkasan, Tantangan, Solusi, Hasil | — |

Help layanan: *Hanya layanan berstatus Aktif yang tampil di homepage dan halaman /services.*

---

## 2. Meta SEO — Halaman Statis (`seo.ts`)

File: `frontend/src/lib/seo.ts` · Site: `https://dntech.id` · Locale OG: `id_ID`

### 2.1 Keywords global (selalu digabung ke setiap halaman)

```
software development Indonesia
custom app development Jakarta
startup tech consultant
sewa developer Indonesia
tim development outsource
DN Tech
```

### 2.2 Meta per halaman (`PAGE_SEO`)

| Halaman | Title | Description |
|---------|-------|-------------|
| `/` (home) | Software Development Indonesia untuk Startup & UMKM | DN Tech — partner pengembangan aplikasi kustom dan konsultasi teknologi untuk startup & bisnis di Indonesia. |
| `/services` | Layanan Pengembangan Software & Konsultasi IT | Aplikasi kustom, konsultasi teknologi, dan pemeliharaan sistem untuk startup dan UMKM di Indonesia. |
| `/products` | Produk Digital Siap Pakai untuk Bisnis Anda | Produk software siap pakai dari DN Tech untuk mempercepat operasional startup dan UMKM di Indonesia. |
| `/blog` | Blog Teknologi untuk Founder & Tim Produk | Artikel tentang tech stack, scaling software, dan saran teknologi untuk startup Indonesia. |
| `/case-studies` | Portfolio & Studi Kasus | Proyek nyata dari klien DN Tech — hanya dipublikasikan dengan izin klien. |
| `/about` | Tentang DN Tech | Software house Indonesia yang fokus pada pengembangan aplikasi kustom dan konsultasi teknologi untuk startup. |
| `/contact` | Hubungi Kami — Konsultasi Gratis | Mulai konsultasi gratis dengan tim DN Tech. Respons dalam 24 jam kerja. |
| `/faq` | Pertanyaan Umum (FAQ) | Jawaban tentang layanan, proses kerja, pricing, dan dukungan DN Tech. |
| `/quiz` | Temukan Solusi Teknologi Anda | Kuis singkat untuk menemukan layanan DN Tech yang sesuai kebutuhan bisnis Anda. |
| `/resources` | Sumber Daya & Panduan | Panduan dan checklist gratis dari DN Tech. |

### 2.3 Root layout default (`layout.tsx`)

| Field | Nilai |
|-------|-------|
| Title default | `DN Tech - Solusi Teknologi Terpercaya` |
| Title template | `%s \| DN Tech` |
| Description | DN Tech — software house Indonesia untuk pengembangan aplikasi kustom dan konsultasi teknologi startup. |
| Twitter | `@dntech` |

### 2.4 Halaman dengan metadata hardcoded (di luar `PAGE_SEO`)

| Halaman | Title | Description |
|---------|-------|-------------|
| `/team` | Tim Kami | Kenali tim DN Tech... |
| `/resources` (alternatif) | Sumber Daya | Panduan, whitepaper, dan wawasan dari DN Tech. |

Detail produk/layanan/blog: override dari DB `seoTitle` / `seoDescription` jika terisi.

---

## 3. Homepage — Default Copy (`homepage-content.ts`)

Dipakai ketika field CMS kosong. Seed production: `npm run db:seed-homepage` (script `backend/scripts/seed-homepage.ts`).

### 3.1 Hero

| Elemen | Teks default |
|--------|--------------|
| **H1** | Jasa Custom Software Development untuk Startup & UMKM Indonesia |
| **Badges** | Web Apps · Mobile Apps · Custom Solutions |
| **Supporting** | Kami software house lokal yang build custom software untuk startup dan UMKM. Proses jelas, harga transparan, timeline yang pasti. |
| **Subtitle fallback** | DN Tech.id |
| **CTA primary** *(hardcoded `HomeHero.tsx`)* | Konsultasi Gratis — 30 Menit |
| **CTA secondary** | Lihat Produk |

**Prioritas resolve:** `homeContent.heroTitle` → `SiteSettings.tagline` → `DEFAULT_HERO.title`

### 3.2 Layanan default (6 kartu)

| Nama | Deskripsi singkat |
|------|-------------------|
| Web App Development | Dashboard, portal, dan web application modern untuk operasional bisnis Anda. |
| Mobile App Development | Aplikasi iOS & Android untuk menjangkau pelanggan di mana saja. |
| Custom Software | Solusi sesuai kebutuhan bisnis Anda — dari MVP sampai sistem operasional. |
| Maintenance & Support | Update berkala, perbaikan bug, dan optimasi performa setelah go live. |
| Technical Consulting | Diskusi arsitektur, strategi teknologi, dan feasibility sebelum development. |
| Integration & API Development | Integrasi dengan sistem existing, custom API, dan koneksi third-party. |

### 3.3 Proses kerja (6 langkah)

| # | Judul | Inti copy |
|---|-------|-----------|
| 1 | Hubungi Kami | Konsultasi awal gratis 30 menit |
| 2 | Scope & Quote | Proposal tanpa hidden fees |
| 3 | Kick-off | Timeline jelas setelah approval |
| 4 | Development + Check-in | Sprint 2 minggu, update mingguan |
| 5 | QA & Testing | Test fungsi, keamanan, mobile — approve sebelum go live |
| 6 | Launch & Support | Deploy + training + 30 hari free bug fix |

### 3.4 Keunggulan (6 poin)

| Judul | Tema |
|-------|------|
| Harga Transparan | No hidden fees, biaya pasti dari awal |
| Timeline Jelas | Planning dengan deadline realistis |
| Bisa Hubungi Langsung | Founder terlibat — tanpa middleman |
| Tech Stack Modern | React, Next.js, PostgreSQL — stack produk first-party |
| Support Sesudah Launch | Paket maintenance berkelanjutan |
| Lokal, Paham Konteks | Timezone & konteks bisnis Indonesia |

### 3.5 Pricing default

| Paket | Harga | Catatan |
|-------|-------|---------|
| Custom Project | Mulai Rp 25 juta | 1–4 bulan · design, dev, testing, 30 hari support |
| Hourly Consulting | Mulai Rp 150.000/jam | Strategy, feasibility, quick tasks |
| Maintenance Package | Mulai Rp 2 juta/bulan | Update, bug fix, monitoring dasar |

### 3.6 FAQ beranda (8 pertanyaan)

| Pertanyaan | Jawaban (ringkas) |
|------------|-------------------|
| Berapa harga development? | Mulai ~Rp 25 juta (simple) · MVP Rp 50–150 juta · konsultasi gratis |
| Berapa lama timeline? | MVP typical 3–6 bulan |
| Bisa mulai kapan? | 2–4 minggu setelah agreement |
| Apa garansi kualitas? | Code review, testing, 30 hari free bug fix |
| Siapa yang handle project saya? | Tim DN Tech + Dozer di project penting |
| Perubahan setelah launch? | 30 hari bug fix gratis · lalu maintenance atau hire sendiri |
| Budget kecil, bisa? | Hourly consulting, revenue share, skema fleksibel |
| Konsultasi gratis? | 30 menit, no pressure |

### 3.7 Empty-state (honest copy)

| Section | Pesan default |
|---------|---------------|
| Portfolio | Studi kasus publik akan muncul setelah klien memberi izin. Sementara lihat produk first-party. |
| Testimonials | Belum ada testimoni publik. Hanya kutipan dengan izin tertulis. |

### 3.8 Tech stack (kategori)

Frontend · Backend · Database · Infrastructure · Payments & Integrations · Deployment — detail item di `homepage-content.ts` (`DEFAULT_TECH_STACK`).

---

## 4. Branding Seed (`db:seed-branding`)

Script: `backend/scripts/seed-branding.ts`

### Brand Story

| Field | Copy |
|-------|------|
| Tagline Section | Tentang DN Tech |
| **Mission** | Kami membangun software yang memberdayakan bisnis Indonesia — HRIS, ERP, dan tools operasional — dengan harga transparan untuk startup dan UMKM. |
| **Vision** | Produk first-party yang bisa dicoba publik, plus custom development dengan harga dan timeline yang ditulis di depan. |
| **Story** | DN Tech studio produk digital · dnPeople, dnCore, dnShop · fokus produk nyata bukan angka klien fiktif · custom dev via conversation |

### Core Values (ID)

| Nama | Deskripsi |
|------|-----------|
| Pragmatik | Solusi yang kerja, bukan fancy tapi useless |
| Jujur | Pricing transparan, timeline realistis, status produk jelas |
| Fokus Produk | Platform internal = bukti teknis, bukan logo klien fiktif |
| Quality First | Code bersih, tested, documented |
| Growth Mindset | Terus belajar dan improve |

### Competitive Advantages (EN label)

| Judul | Deskripsi |
|-------|-----------|
| Local + expert | Tim Indonesia paham bisnis lokal |
| Transparent | Fixed price, jelas timeline, no hidden fees |
| Hands-on | Founder involved di setiap project |
| Long-term support | Maintenance + training included |

### Stats

- **Produk First-Party:** 7  
- **Tahun Membangun:** 3  

---

## 5. SEO Produk First-Party (seed scripts)

Di-edit via `/admin/products` → kartu **SEO**. Seed: `npm run db:seed-products`.

| Produk | Meta Title | Keywords (cuplikan) |
|--------|------------|---------------------|
| **dnPeople** | dnPeople — Payroll & HR Jadi Mudah, Harga Terjangkau | HRIS Indonesia, payroll software, HRIS harga terjangkau |
| **dnCore** | dnCore — ERP Terintegrasi untuk SME Indonesia | ERP Indonesia, software ERP SME, ERP UMKM |
| **dnShop Finance** | dnShop Finance — Dashboard Shopee + Pembukuan untuk Seller Indonesia | dashboard shopee, pembukuan seller, SAK EMKM |
| **Nearwork** | Nearwork — Marketplace Freelance Remote & On-site | marketplace freelance Indonesia, platform hiring |
| **DuaVulnScanner** | DuaVulnScanner — Platform Pentest All-in-One | penetration testing platform, UU PDP, DevSecOps |
| **Threads Automation** | Threads Automation — AI Caption & Auto-Publish untuk Meta Threads | threads automation, AI caption generator |
| **Trusted Jurist** | Trusted Jurist — Law Firm Website by DN Tech | website firma hukum, company profile law firm |

Meta description lengkap ada di masing-masing `backend/scripts/seed-*-product.ts`.

---

## 6. Blog — Content Pillars (`content-pillars.ts`)

Pilar SEO internal linking di halaman blog:

| ID | Label | Kategori blog | Deskripsi |
|----|-------|---------------|-----------|
| tech-stack | Tech Stack Indonesia | Tech Stack | Next.js, PostgreSQL, DevOps untuk startup lokal |
| scaling | Scaling Proyek Software | Scaling | Tim remote, version control, strategi testing |
| startup | Saran Teknologi Startup | Startup | MVP, optimasi biaya, keamanan dasar |
| insights | Insight Kasus | Case Insights | Pelajaran dari proyek nyata (jika tersedia) |

Link CTA per pilar: Layanan Kami, Konsultasi Gratis, FAQ Proses Kerja, Portfolio, dll.

---

## 7. Seed & Perintah Operasional

| Tujuan | Perintah | File |
|--------|----------|------|
| Homepage + FAQ | `npx ts-node scripts/seed-homepage.ts` | `seed-homepage.ts` |
| Branding + About | `npm run db:seed-branding` | `seed-branding.ts` |
| 7 produk + SEO | `npm run db:seed-products` | `seed-all-products.ts` |
| Production (VPS) | Lihat runbook | `docs/runbooks/vps-postgres-seed.md` |

Setelah edit di dashboard: **Simpan Pengaturan** → toast `Pengaturan berhasil disimpan!` → revalidate `/` dan `/about` jika `NEXT_PUBLIC_REVALIDATE_SECRET` ter-set.

---

## 8. Gap & Catatan Editor

| Item | Status |
|------|--------|
| Template SEO global (`seoTitleTemplate`) | Ada di DB/API · **belum di UI** |
| Meta layanan / blog / portfolio | Schema ada · **hanya produk punya UI SEO** |
| CTA hero homepage | **Hardcoded** — ubah di `HomeHero.tsx`, bukan dashboard |
| `PAGE_SEO` | **Hardcoded** — ubah di `seo.ts` + deploy |
| Campuran bahasa | UI admin = ID · beberapa advantage produk = EN · keywords campuran ID/EN |
| Anti-slop rule | Jangan klaim jumlah klien / testimoni fiktif — gunakan empty-state honest copy §3.7 |

---

## 9. Dokumen Terkait

| Doc | Topik |
|-----|-------|
| [V2/DN-TECH-SEO-GUIDE-V2.md](./V2/DN-TECH-SEO-GUIDE-V2.md) | Checklist SEO teknis, JSON-LD, sitemap |
| [launch/DN-TECH-HOMEPAGE-SYSTEM-PLAN.md](./launch/DN-TECH-HOMEPAGE-SYSTEM-PLAN.md) | PRD homepage LCP & section trim |
| [launch/DN-TECH-RELAUNCH-ANTI-SLOP-DESIGN.md](./launch/DN-TECH-RELAUNCH-ANTI-SLOP-DESIGN.md) | Audit copy visual |
| [MULTI-PRODUCT-PLAYBOOK.md](./MULTI-PRODUCT-PLAYBOOK.md) | Workflow seed produk + SEO |
| [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) | Status modul CMS |
| [frontend/LIGHTHOUSE-BASELINE.md](./frontend/LIGHTHOUSE-BASELINE.md) | Baseline perf/SEO prod |

---

## 10. Quick File Index

```text
frontend/src/lib/seo.ts                 # PAGE_SEO, DEFAULT_KEYWORDS
frontend/src/lib/homepage-content.ts    # Default homepage copy
frontend/src/lib/content-pillars.ts     # Blog SEO pillars
frontend/src/app/admin/settings/page.tsx
frontend/src/app/admin/branding/
frontend/src/app/admin/products/page.tsx
frontend/src/components/homepage/HomeHero.tsx   # CTA hardcoded
backend/prisma/schema.prisma            # SiteSettings, Product SEO fields
backend/scripts/seed-homepage.ts
backend/scripts/seed-branding.ts
backend/scripts/seed-*-product.ts
```
