# PRD / SRS / SDD — SEO + Marketing Improvement

**DN Tech Dashboard & Content Management System**

Status: Draft · Revision: 1 · Date: 2026-08-29

---

## 1. Executive Summary

Dokumen ini menggabungkan PRD, SRS, dan SDD untuk memperbaiki dan mengkonsolidasikan sistem SEO & marketing DN Tech (dntech.id). Saat ini, beberapa field SEO hanya tersedia di admin dashboard untuk modul Produk, sementara Layanan, Blog, dan Portfolio tidak memiliki UI SEO terpisah. Copywriting campuran ID/EN dan beberapa CTA/meta hardcoded di frontend tanpa opsi dashboard.

**Tujuan proyek:**
- Sentralisasi semua meta SEO (title, description, keywords) ke admin dashboard
- Konsistenkan bahasa (prioritas: Bahasa Indonesia utama)
- Hapus hardcoding CTA dan meta dari frontend — semuanya via dashboard
- Tambah UI SEO untuk Layanan, Blog, Portfolio (feature parity dengan Produk)
- Implementasi anti-slop rules (jangan klaim klien/testimonial fiktif)

### Scope & Out of Scope

**IN SCOPE:**
- SEO UI form untuk Layanan, Blog, Portfolio (kartu meta seperti Produk)
- Template SEO global di /admin/settings (seoTitleTemplate, seoDescriptionTemplate)
- Dashboard management untuk PAGE_SEO (alih dari seo.ts hardcoding)
- Audit & update copy—pastikan tidak ada klaim klien/testimoni fiktif
- Migrasi CTA hero ke dashboard (alih dari HomeHero.tsx hardcoding)
- Konsistensi bahasa & anti-mixing ID/EN di UI public

**OUT OF SCOPE:**
- Tuning SEO teknis (JSON-LD, sitemap audit) — lihat V2 SEO Guide
- Redesign UI admin — hanya expand field SEO existing
- Content creation — hanya structure & management layer
- Analytics integration beyond GA ID

---

## 2. Product Requirements Document (PRD)

### 2.1 Business Objectives

- Tingkatkan kontrol dan fleksibilitas content marketing via dashboard (reduce hardcoding)
- Pastikan SEO parity di semua tipe konten (produk, layanan, blog, portfolio)
- Kurangi risk marketing slop — implementasi guardrails (anti-fiktif klaim)
- Sederhanakan onboarding marketing team — dashboard-first workflow

### 2.2 User Stories & Acceptance Criteria

#### Story 1: Admin SEO untuk Layanan
- **Sebagai:** Admin marketing
- **Aku ingin:** Edit Meta Title, Description, Keywords untuk setiap Layanan (dari /admin/services)
- **Sehingga:** Setiap layanan punya SEO meta yang optimal tanpa hardcoding
- **AC:**
  - Form SEO muncul sebagai kartu terpisah
  - Field identik dengan Produk
  - Save ke DB layanan
  - Render di `<head>` halaman /services/<slug>

#### Story 2: SEO untuk Blog Posts
- **Sebagai:** Content writer
- **Aku ingin:** Edit meta SEO saat nulis/edit blog post
- **Sehingga:** Setiap artikel punya title/desc/keywords optimal
- **AC:**
  - Form SEO inline di /admin/blog/new & /admin/blog/[id]/edit
  - Preview meta tag
  - Save to DB

#### Story 3: Portfolio + Meta SEO
- **Sebagai:** Admin
- **Aku ingin:** Set meta SEO untuk portfolio entries (case studies) untuk indexed unique content
- **Sehingga:** Setiap case study punya SEO footprint
- **AC:**
  - Form SEO di /admin/portfolio/<id>
  - Render meta tag di halaman portfolio

#### Story 4: Global SEO Template
- **Sebagai:** Admin
- **Aku ingin:** Set template title & description global (contoh: '%s | DN Tech', '%s — DN Tech')
- **Sehingga:** Semua halaman pakai template konsisten tanpa edit per-page
- **AC:**
  - Fields seoTitleTemplate & seoDescriptionTemplate di /admin/settings
  - Frontend render dengan variabel fallback

#### Story 5: Dashboard PAGE_SEO Management
- **Sebagai:** Admin
- **Aku ingin:** Edit meta SEO per halaman statis (/, /services, /about, /blog, /contact, /faq) via dashboard
- **Sehingga:** Tidak perlu deploy frontend untuk tweak meta
- **AC:**
  - Tabel PAGE_SEO di dashboard
  - CRUD per halaman
  - Revalidate cache saat save

#### Story 6: CTA Hero Management
- **Sebagai:** Marketing team
- **Aku ingin:** Ubah CTA hero homepage (text, link) via dashboard
- **Sehingga:** Campaign bisa update CTA tanpa code deployment
- **AC:**
  - Field di /admin/settings (homeCtaText, homeCtaLink, homeCtaVariant)
  - Render di HomeHero component

#### Story 7: Anti-Slop Rules & Empty States
- **Sebagai:** Content reviewer
- **Aku ingin:** Sistem warn jika ada claim jumlah klien/testimoni tanpa bukti published
- **Sehingga:** Marketing tidak klaim fiktif — gunakan honest empty state
- **AC:**
  - Validation rule di admin (jika field 'jumlahKlien' diisi, harus ada file referensi)
  - Atau gunakan empty-state message default

---

## 3. Software Requirements Specification (SRS)

### 3.1 Functional Requirements (FRs)

#### FR-1: SEO Form untuk Layanan, Blog, Portfolio
- Buat component reusable SeoMetaForm (title, description, keywords, canonical)
- Integrasi ke /admin/services/<id>, /admin/blog/<id>, /admin/portfolio/<id>
- Simpan ke Service, BlogPost, PortfolioEntry schema (Prisma)
- Render meta di `<head>` halaman publik (seoTitle → `<meta name=og:title>`)

#### FR-2: Global SEO Template Management
- Add fields ke SiteSettings: seoTitleTemplate, seoDescriptionTemplate (string)
- UI di /admin/settings/seo (tab baru atau section SiteSettings)
- Help text: 'Gunakan %s untuk placeholder halaman title · Contoh: %s | DN Tech'
- Frontend: fallback jika tidak ada custom seoTitle, gunakan template + halaman title

#### FR-3: PAGE_SEO Dashboard CRUD
- Migrate PAGE_SEO list dari seo.ts ke database (tabel PageMetadata atau SiteSettings.pageMetadata JSON)
- UI di /admin/settings/pages-meta — tabel dengan kolom: path, title, description, edit action
- CRUD modal untuk edit per-path
- Save trigger revalidate route using revalidatePath() atau NEXT_PUBLIC_REVALIDATE_SECRET webhook

#### FR-4: CTA Hero Dashboard Control
- Add SiteSettings fields: homeCtaText, homeCtaLink, homeCtaVariant (button style)
- UI di /admin/settings (kartu Hero CTA atau section Beranda)
- HomeHero.tsx membaca dari SiteSettings (via getSettings() API call)

#### FR-5: Copy Audit & Anti-Slop Rules
- Field validation: jika kompetitorStats, clientTestimonials, atau similar punya value, harus ada file reference (URL / proof)
- Copy templating: gunakan empty-state message default jika field kosong (jangan biarkan undefined)
- Audit script: scan homepage-content.ts & seed scripts untuk hardcoded claim tanpa bukti

### 3.2 Non-Functional Requirements (NFRs)

- **Performance:** Meta fetch <100ms (cached)
- **Caching:** SEO data cache invalidate 5 menit (atau on-save revalidate)
- **Consistency:** Semua SEO form pakai struktur sama (title char limit 60, description 160)
- **Bahasa:** Default semua copy Bahasa Indonesia · EN hanya di label advantage produk (jelas marked)
- **Accessibility:** Form label ARIA, keyboard nav, color contrast
- **Data validation:** Title max 60 char, description max 160 char, keywords comma-separated

---

## 4. Software Design Document (SDD)

### 4.1 Database Schema Changes

Extend Prisma schema (`backend/prisma/schema.prisma`):

```prisma
model Service {
  id String @id @default(cuid())
  name String
  description String
  // NEW SEO fields
  seoTitle String?
  seoDescription String?
  keywords String? // comma-separated
  canonical String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model BlogPost {
  id String @id @default(cuid())
  title String
  content String @db.Text
  // NEW SEO fields
  seoTitle String?
  seoDescription String?
  keywords String?
  canonical String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PortfolioEntry {
  id String @id @default(cuid())
  title String
  description String
  // NEW SEO fields
  seoTitle String?
  seoDescription String?
  keywords String?
  canonical String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SiteSettings {
  id String @id @default(cuid())
  // ... existing fields ...
  
  // NEW SEO global template
  seoTitleTemplate String?  // e.g. "%s | DN Tech"
  seoDescriptionTemplate String?  // e.g. "%s — DN Tech"
  
  // NEW PAGE_SEO (alternative: separate table)
  pageMetadata Json? // { "/": { title: "...", description: "..." }, "/about": {...} }
  
  // NEW CTA Hero
  homeCtaText String? // e.g. "Mulai Konsultasi Gratis"
  homeCtaLink String? // e.g. "/contact"
  homeCtaVariant String? // e.g. "primary", "secondary"
}
```

### 4.2 Backend API Changes

Endpoints (existing pattern, extend dengan SEO fields):

- `PUT /api/services/[id]` — tambah seoTitle, seoDescription, keywords, canonical
- `PUT /api/blog/[id]` — tambah SEO fields
- `PUT /api/portfolio/[id]` — tambah SEO fields
- `PUT /api/settings` — tambah seoTitleTemplate, seoDescriptionTemplate, pageMetadata, homeCtaText/Link/Variant
- `GET /api/settings` — return complete SiteSettings + SEO fields

### 4.3 Frontend Components & Pages

**New Components:**
- `components/admin/SeoMetaForm.tsx` — reusable form (title, desc, keywords, canonical)
- `components/admin/SeoCharCounter.tsx` — real-time char count (60 title, 160 desc)
- `components/admin/PageMetadataTable.tsx` — CRUD tabel PAGE_SEO

**Modified Pages:**
- `app/admin/services/[id]/page.tsx` — add `<SeoMetaForm />`
- `app/admin/blog/[id]/page.tsx` — add `<SeoMetaForm />`
- `app/admin/portfolio/[id]/page.tsx` — add `<SeoMetaForm />`
- `app/admin/settings/page.tsx` — tambah section SEO global + PAGE_SEO table + CTA hero

**Modified Components (public):**
- `components/layout/Head.tsx` — render meta dari DB (seoTitle, seoDescription, template fallback)
- `components/homepage/HomeHero.tsx` — read homeCtaText, homeCtaLink dari SiteSettings
- `app/layout.tsx` — apply global seoTitleTemplate saat render page title

### 4.4 Implementation Sequence (Phases)

#### Phase 1 — Database & API (Week 1-2)
- Prisma migration: add SEO fields ke Service, BlogPost, PortfolioEntry, SiteSettings
- Write API endpoints (PUT routes)
- Seed script update: default SiteSettings dengan template & CTA

#### Phase 2 — Admin UI Components (Week 2-3)
- Build SeoMetaForm & char counter components
- Integrate ke /admin/services, /admin/blog, /admin/portfolio pages
- Test save & DB update

#### Phase 3 — Settings & Global Config (Week 3)
- Add SEO section ke /admin/settings (template fields, PAGE_SEO table, CTA hero)
- Implement PageMetadataTable CRUD

#### Phase 4 — Frontend Integration (Week 4)
- Update Head.tsx untuk read seoTitle, seoDescription dari route context
- Update HomeHero untuk read homeCtaText, homeCtaLink dari SiteSettings
- Implement cache invalidation (revalidatePath on save)

#### Phase 5 — Copy Audit & Anti-Slop (Week 4-5)
- Scan existing copy untuk fiktif claims
- Update home-content.ts & seed data dengan honest copy
- Add validation rules di admin form

---

## 5. Gap Analysis

| Item | Current State | Target State | Priority |
|------|---------------|--------------|----------|
| SEO form Layanan | Tidak ada | Form lengkap (title, desc, keywords, canonical) | High |
| SEO form Blog | Tidak ada | Form inline edit | High |
| SEO form Portfolio | Tidak ada | Form per entry | High |
| Global SEO template | DB field ada, UI tidak | UI dashboard | Medium |
| PAGE_SEO management | Hardcoded di seo.ts | Dashboard CRUD | High |
| CTA hero control | Hardcoded di HomeHero.tsx | Dashboard field | Medium |
| Copy audit rules | Tidak ada | Validation + guardrails | Medium |
| Bahasa consistency | Campuran ID/EN | ID primary, EN di specific area only | Low |

---

## 6. Testing & Acceptance Criteria

### Functional Testing
- [ ] SeoMetaForm dapat edit & save data ke DB untuk Layanan/Blog/Portfolio
- [ ] Meta tag render di `<head>` halaman publik (inspect element)
- [ ] PAGE_SEO table CRUD berfungsi (create, update, delete entry)
- [ ] Global template field save & apply ke halaman tanpa custom meta
- [ ] CTA hero update via dashboard reflect di homepage tanpa deploy

### SEO Testing
- [ ] Meta title & description muncul di Google search preview
- [ ] Keywords field diekstrak benar (comma-separated)
- [ ] Canonical URL (jika diset) render di `<head>`
- [ ] JSON-LD diupdate dengan new meta data

### Copy Quality Testing
- [ ] Tidak ada hardcoded client count (atau ada referensi proof)
- [ ] Testimonial section gunakan empty-state jika kosong (bukan placeholder)
- [ ] Semua CTA text jelas dan konsisten

---

## 7. Implementation Roadmap

| Phase | Timeline | Tasks | Assignee |
|-------|----------|-------|----------|
| Phase 1 | Week 1-2 | Prisma + API endpoints + seed | Backend |
| Phase 2 | Week 2-3 | SeoMetaForm component + /admin integration | Frontend |
| Phase 3 | Week 3 | /admin/settings SEO section + PAGE_SEO table | Frontend |
| Phase 4 | Week 4 | Head.tsx, HomeHero integration + caching | Frontend |
| Phase 5 | Week 4-5 | Copy audit + validation rules | Dozer (review) |
| Phase 6 | Week 5 | QA + testing + deploy | QA |

---

## 8. Dependencies & Risks

### Dependencies
- Admin auth system working (already live)
- Revalidation webhook / ISR setup (untuk cache busting)
- Prisma migrations dapat run di prod

### Risks
- **R1:** Copy audit menemukan banyak hardcoded klaim fiktif
  - Solusi: honest empty-state + template default
- **R2:** Cache revalidation delay (user edit dashboard, perubahan lambat muncul)
  - Solusi: immediate ISR + optional manual refresh
- **R3:** SEO form terlalu kompleks untuk marketing team
  - Solusi: help text detail + inline preview

---

## 9. Deliverables & Success Metrics

### Deliverables
- Prisma migration file (SEO field additions)
- Backend API docs (updated endpoints)
- React component library (SeoMetaForm, SeoCharCounter, PageMetadataTable)
- Admin dashboard pages (updated /admin/services, /admin/blog, /admin/portfolio, /admin/settings)
- QA test plan + checklist
- Copy audit report + fixes

### Success Metrics
- 100% of product/service/blog/portfolio pages punya unique SEO meta
- Zero hardcoded CTA/meta di frontend (all from dashboard)
- Marketing team dapat self-service edit SEO tanpa dev request
- Zero fiktif claims di public-facing copy (audit passed)
- Cache hit rate >95% untuk meta pages (perf metric)

---

## 10. References & Related Docs

- DN-TECH-DASHBOARD-SEO-MARKETING-COPY.md — Current state audit (existing)
- V2/DN-TECH-SEO-GUIDE-V2.md — Technical SEO checklist (JSON-LD, sitemap)
- launch/DN-TECH-HOMEPAGE-SYSTEM-PLAN.md — Homepage LCP & optimization
- launch/DN-TECH-RELAUNCH-ANTI-SLOP-DESIGN.md — Copy audit design
- MULTI-PRODUCT-PLAYBOOK.md — Product seed workflow
- frontend/LIGHTHOUSE-BASELINE.md — Performance baseline
