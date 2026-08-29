# DN Tech — PRD V8 Foundation
## Dasar Product Requirements Document Berikutnya

| | |
|---|---|
| **Dokumen** | Foundation / pre-PRD (bukan spec implementasi final) |
| **Produk** | DN Tech Company Profile — dntech.id |
| **Perusahaan** | PT. Dozer Napitupulu Technology |
| **Owner** | Dozer (CEO + Tech Lead) |
| **Tanggal scan** | 24 Juli 2026 |
| **Repo** | [github.com/dreamcraft17/dntech](https://github.com/dreamcraft17/dntech) |
| **Live** | https://dntech.id · https://api.dntech.id |
| **Versi baseline** | V1–V7 selesai di codebase · V8 belum ditulis |

---

## 1. Executive Summary

DN Tech (`dntech`) adalah **website company profile + CMS admin + mesin lead generation** untuk pasar Indonesia (Bahasa Indonesia, IDR). Stack: **Next.js 16 + Express 5 + PostgreSQL + Prisma**, deploy **PM2/Nginx** (atau Docker Compose dev).

**Perjalanan produk hingga hari ini:**

| Versi | Fokus | Status kode |
|-------|--------|-------------|
| V1 | Spec awal (masih ada data demo) | ✅ Superseded |
| V2 | Production foundation — CMS, design solid, SEO, tanpa fake data | ✅ |
| V3 | UX polish — exit intent, logo, a11y form | ✅ |
| V4 | Performance — debounce, cache, deferred scripts, `next/image` | ✅ |
| V5 | Email SMTP — templates, newsletter double opt-in, email logs | ✅ |
| V6 | Modul **Produk** (`/products`) paralel dengan Layanan | ✅ |
| V7 | Halaman flagship **dnPeople** — pricing tiers, integrasi, comparison, roadmap | ✅ |
| **V8** | **Go-live matang + growth platform** | 📋 **Dokumen ini** |

**Kesimpulan scan:** Platform **sudah feature-complete untuk marketing site V1–V7**, tetapi **belum “operationalmente selesai”** — production DB belum di-push untuk model Product, seed dnPeople belum di production, verifikasi SMTP/Lighthouse/QA belum tercatat, CI/CD tidak ada, dan beberapa fitur auth/docs masih gap.

**V8 bukan rewrite.** V8 adalah fase **hardening, operasi, konversi, dan skala CMS** di atas fondasi yang ada.

---

## 2. Baseline — Apa yang Sudah Ada (Fakta dari Codebase)

### 2.1 Arsitektur

```
dntech/
├── frontend/     Next.js 16 App Router (:3000 prod / Docker)
├── backend/      Express 5 + Prisma (:4000)
├── docs/         V2–V5 specs + IMPLEMENTATION-STATUS
├── design/       V2.1 remediation
└── docker-compose.yml
```

Bukan npm workspaces monorepo — dua app terpisah dengan `package.json` masing-masing.

### 2.2 Surface produk (publik)

| Area | Route | Catatan |
|------|-------|---------|
| Homepage Indonesia Edition | `/` | CMS `homeContent`; tech stack & tim disembunyikan |
| Layanan | `/services`, `/services/[slug]` | Proses 5 langkah, Calendly, FAQ |
| **Produk** | `/products`, `/products/[slug]` | Nav terpisah; V7 fields untuk dnPeople |
| Blog, About, Team, Contact, FAQ, Careers | ✅ | Semua CMS-driven |
| Lead gen | Form 3 langkah, quiz, exit intent, newsletter | SMTP-ready |
| SEO | sitemap, robots, JSON-LD, meta dinamis | ✅ |

### 2.3 Admin CMS

CRUD lengkap: services, **products**, portfolio, blog, team, testimonials, FAQ, careers, leads (+ CSV), media, newsletter, quiz, settings, users, **email logs**, branding (legacy module).

**RBAC:** SuperAdmin · ContentManager · Editor · Viewer

**Login default (dev/seed):** `admin@dntech.id` / `Admin@123456` — **wajib diganti di production.**

### 2.4 Integrasi

| Integrasi | Status kode | Catatan |
|-----------|-------------|---------|
| SMTP (mailspace) | ✅ | `info@dntech.id`; live send belum diverifikasi |
| Google Analytics | ✅ | Deferred idle load |
| Crisp Chat | ✅ | Load on first interaction |
| Calendly | ✅ | Dari site settings |
| SendGrid | ⚠️ Env legacy | Tidak dipakai — SMTP V5 yang aktif |

### 2.5 Seed & konten

| Script | Fungsi |
|--------|--------|
| `npm run db:seed` | Admin + settings kosong saja |
| `npm run db:seed-dnpeople` | Produk dnPeople lengkap (pricing, fitur, roadmap, dll.) |
| `seed-homepage.ts`, `seed-branding.ts` | Opsional — manual `tsx` |

**Kebijakan:** Tidak ada konten marketing hardcoded — semua isi real lewat admin.

### 2.6 Kualitas engineering saat ini

| Check | Status (Jul 2026) |
|-------|-------------------|
| Frontend build | ✅ |
| Backend build | ✅ |
| Frontend lint | ✅ 0 error/warning |
| Loading UX global | ✅ (Jul 13) |
| Public product API hotfix | ✅ SSR resolver production-safe |
| GitHub Actions CI | ❌ Tidak ada |
| Lighthouse terdokumentasi | ⏳ Belum |
| Manual QA browser | ⏳ Belum tercatat |

---

## 3. Gap Analysis — Input untuk PRD V8

### 3.1 Ops / go-live (blocker bisnis)

| ID | Gap | Dampak | Prioritas V8 |
|----|-----|--------|--------------|
| OPS-01 | `prisma db push` production belum untuk kolom Product V6/V7 + EmailLog V5 | `/products`, `/admin/products`, email logs bisa gagal/tidak persist | **P0** |
| OPS-02 | `npm run db:seed-dnpeople` belum di production | Halaman `/products/dnpeople` kosong/tidak lengkap | **P0** |
| OPS-03 | SMTP password production belum diverifikasi end-to-end | Lead/newsletter tidak sampai ke inbox | **P0** |
| OPS-04 | Checklist §18 IMPLEMENTATION-STATUS sebagian besar unchecked | Risiko regresi saat deploy | **P0** |
| OPS-05 | `NEXT_PUBLIC_API_URL` harus benar saat build | SSR produk/konten kosong jika salah URL | **P0** |
| OPS-06 | Password admin default belum diganti | Risiko keamanan | **P0** |

### 3.2 Technical debt (dokumen vs kode)

| ID | Gap | Detail |
|----|-----|--------|
| TD-01 | JWT refresh | `POST /auth/refresh` ada di docs, **tidak diimplementasi** |
| TD-02 | Forgot password | Token dibuat, **email tidak dikirim** (hanya console.log) |
| TD-03 | RBAC Editor | `canWrite()` vs `ROLE_PERMISSIONS` — potensi inkonsistensi |
| TD-04 | Cache in-memory | Tidak aman multi-instance PM2 — perlu Redis jika scale |
| TD-05 | Homepage N+1 fetch | Masih banyak roundtrip API — pertimbangkan endpoint agregat |

### 3.3 Produk & konversi (belum dimaksimalkan)

| ID | Gap | Detail |
|----|-----|--------|
| PRD-01 | Satu produk flagship | dnPeople seeded; produk DN Tech lain (DOVA, dll.) belum di CMS |
| PRD-02 | Komponen konversi | `BookDemoSection` di `/products/[slug]`; `ROICalculator` sengaja **tidak** di halaman produk SaaS (BF-017, Jul 26) |
| PRD-03 | Product admin UX | JSON textarea — sulit untuk tim non-tech; PRD V7 sengaja skip WYSIWYG |
| PRD-04 | Media produk | `heroImage`/`logoUrl` masih URL text — tidak pakai media library upload |
| PRD-05 | Portfolio/konten kosong | Empty state by design — butuh operasi konten marketing |
| PRD-06 | Dark mode | Deferred V2.2+ |

### 3.4 Engineering maturity

| ID | Gap | Detail |
|----|-----|--------|
| ENG-01 | Tidak ada CI | Risiko regressions di `main` |
| ENG-02 | Tidak ada smoke/E2E otomatis | Runbook manual saja |
| ENG-03 | Tidak ada monitoring/uptime formal | PM2 logs + Nginx saja |
| ENG-04 | Playwright / Swagger | Disebut opsional post-MVP |

---

## 4. Visi V8 — North Star

> **DN Tech.id menjadi mesin acquisition yang andal:** cepat, terukur, mudah dioperasikan tim kecil, dan siap menampilkan **beberapa produk DN Tech** (bukan hanya satu halaman dnPeople) dengan konversi lead yang konsisten.

### 4.1 Goals (draft untuk PRD final)

1. **Production truth** — schema DB production = codebase; dnPeople live dengan copy final.
2. **Trustworthy comms** — setiap form lead/newsletter/career terkirim dan ter-audit di email logs.
3. **Measurable quality** — Lighthouse + QA checklist terdokumentasi; baseline angka tercatat.
4. **Operable CMS** — tim marketing bisa publish produk/layanan/blog tanpa JSON manual (minimal guided forms).
5. **Platform hygiene** — CI, smoke test, auth flows lengkap (refresh + reset password).
6. **Conversion uplift** — homepage & product pages memaksimalkan CTA yang sudah dibangun.

### 4.2 Non-goals (V8 — sengaja di luar scope awal)

- Rebuild stack (tetap Next + Express + Prisma)
- Dark mode penuh (bisa V8.2+ atau V9)
- Drag-drop page builder
- Multi-tenant CMS / white-label
- Aplikasi mobile native
- Integrasi MCP / AI chatbot custom

---

## 5. Persona & Stakeholder

| Persona | Kebutuhan V8 |
|---------|--------------|
| **CEO / Product (Dozer)** | dnPeople & DN Tech terlihat profesional; lead masuk ke inbox; metrik konversi |
| **Marketing / Content** | Publish blog, produk, portfolio tanpa dev; upload gambar mudah |
| **Sales / BD** | Lead terstruktur di admin; export CSV; notifikasi email cepat |
| **Dev / DevOps** | Deploy aman, CI hijau, rollback jelas, env documented |
| **Visitor (UMKM/startup ID)** | Site cepat mobile; pricing jelas; CTA konsultasi/produk mudah |

---

## 6. Usulan Scope V8 — Tiga Track Paralel

PRD V8 final bisa dipecah menjadi **tiga track** yang bisa dijadwalkan paralel atau sequential:

### Track A — **V8.0 Go-Live Hardening** (Ops + QA)

**Durasi estimasi:** 2–4 hari  
**Owner:** DevOps + Tech Lead

| # | Deliverable | Acceptance criteria |
|---|-------------|---------------------|
| A1 | Production DB migrate | `prisma db push` sukses; tabel `products`, `email_logs`, field newsletter token ada |
| A2 | Seed dnPeople | `/products/dnpeople` menampilkan pricing, integrasi, comparison, roadmap |
| A3 | SMTP live test | Submit contact → user + admin email diterima < 1 menit; tercatat di `/admin/email-logs` |
| A4 | Security baseline | Admin password diganti; JWT secret production kuat |
| A5 | QA checklist | §18 IMPLEMENTATION-STATUS — item P0 dicentang + bukti screenshot/log |
| A6 | Lighthouse baseline | Mobile + desktop score dicatat (homepage, `/products/dnpeople`, `/contact`) |
| A7 | Frontend rebuild | Build dengan `NEXT_PUBLIC_API_URL=https://api.dntech.id/api/v1` |

**Keluaran:** dokumen **Go-Live Sign-off V8.0** (1 halaman).

---

### Track B — **V8.1 Platform Quality** (Engineering)

**Durasi estimasi:** 3–5 hari  
**Owner:** Backend + Frontend dev

| # | Deliverable | Acceptance criteria |
|---|-------------|---------------------|
| B1 | GitHub Actions CI | PR/push ke `main`: install, build FE+BE, lint/typecheck |
| B2 | Smoke script | `npm run smoke` — health, settings, products, contact POST (API up) |
| B3 | JWT refresh | Implementasi `POST /auth/refresh` sesuai docs atau hapus dari docs |
| B4 | Forgot password email | Token reset dikirim via SMTP; flow `/admin/login` → reset |
| B5 | RBAC audit | Matrix permission Editor vs ContentManager konsisten + test |
| B6 | Redis cache (opsional) | Env `REDIS_URL`; fallback in-memory jika kosong |

**Keluaran:** SRS pendek + test plan untuk auth & CI.

---

### Track C — **V8.2 Growth & CMS Maturity** (Product)

**Durasi estimasi:** 5–10 hari  
**Owner:** Product + Frontend

| # | Deliverable | Acceptance criteria |
|---|-------------|---------------------|
| C1 | Multi-product playbook | Template seed + panduan admin untuk produk ke-2 (mis. DOVA, ERP) |
| C2 | Product media upload | Hero/logo/screenshot via media library, bukan URL manual saja |
| C3 | Guided product editor | Minimal: form terstruktur untuk pricing tiers & FAQ (bukan raw JSON wajib) |
| C4 | Mount conversion widgets | `BookDemoSection` on product pages; **do not** mount `ROICalculator` on SaaS product pages (see BF-017) |
| C5 | Homepage API aggregate (opsional) | Satu endpoint `/homepage` atau BFF — kurangi SSR latency |
| C6 | Product listing polish | Featured products di homepage atau cross-link dnPeople ↔ layanan |
| C7 | Analytics events | Event names standar untuk product CTA clicks (GA4) |

**Keluaran:** PRD detail per epic (C2, C3 bisa jadi V8.2a / V8.2b).

---

## 7. Functional Requirements (Draft — untuk PRD V8 Final)

Format siap di-copy ke SRS.

### 7.1 Go-live & operasi

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-A1 | Sistem harus menjalankan schema DB production yang mencakup semua model Prisma di `main` | Must |
| FR-A2 | Produk dnPeople harus dapat di-seed ulang dengan script versioned | Must |
| FR-A3 | Semua channel lead (contact, quiz, newsletter, career) harus menghasilkan email log dengan status `sent`/`failed`/`skipped` | Must |
| FR-A4 | Deploy checklist harus dapat dijalankan ulang tanpa langkah manual yang tidak terdokumentasi | Should |

### 7.2 Auth & admin

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-B1 | Admin session harus dapat diperpanjang via refresh token atau dokumentasi diperbarui | Must |
| FR-B2 | Forgot password harus mengirim email reset ke user admin | Should |
| FR-B3 | Permission denial harus konsisten FE + BE untuk role Editor | Should |

### 7.3 Produk & konversi

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-C1 | Admin dapat membuat produk marketing-grade tanpa edit JSON mentah untuk field wajib (name, slug, tagline, 1 pricing tier, primary CTA) | Must |
| FR-C2 | Upload gambar produk harus melalui media library yang sama dengan blog/portfolio | Should |
| FR-C3 | Halaman produk harus menampilkan JSON-LD Product + breadcrumb + canonical | Must (sudah ada — regression test) |
| FR-C4 | Minimal 2 produk DN Tech published di `/products` (dnPeople + 1 lain) | Should (content ops) |

### 7.4 Performance & observability

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-D1 | Lighthouse mobile homepage ≥ 80 (baseline dicatat pre-V8) | Should |
| FR-D2 | CI pipeline harus gagal jika build atau lint gagal | Must |
| FR-D3 | Health endpoint `/health` dimonitor uptime eksternal | Could |

---

## 8. Non-Functional Requirements (Draft)

| NFR | Target |
|-----|--------|
| **Bahasa** | UI publik & admin: Bahasa Indonesia |
| **Mata uang** | IDR di pricing produk & form |
| **A11y** | Form WCAG baseline (sudah V3 — regression) |
| **Security** | JWT httpOnly/bearer sesuai implementasi; rate limit tetap aktif |
| **Performance** | TTFB homepage < 1.5s di production (post-V4 — verifikasi) |
| **Availability** | Target 99.5% bulan pertama post-V8.0 (manual monitoring) |
| **Backup** | Postgres backup terjadwal di VPS/provider |

---

## 9. Success Metrics (KPI V8)

| Metrik | Baseline (perkiraan) | Target V8 |
|--------|----------------------|-----------|
| Lighthouse mobile (homepage) | Belum tercatat | ≥ 80 |
| Lead form → admin email | Belum diverifikasi live | 100% success in staging/prod test |
| `/products/dnpeople` completeness | Empty di prod | Semua section V7 ter-render |
| Time-to-publish produk baru | ~2h (JSON manual) | < 45 menit (guided form) |
| CI pass rate on `main` | N/A | 100% |
| Critical bugs post-deploy | Unknown | 0 open P0 > 7 hari |

---

## 10. Dependencies & Relasi Produk Lain

| Dependency | Hubungan |
|------------|----------|
| **dnPeople** | Produk flagship di `/products/dnpeople`; copy dari `company-wiki/docs/products/dnPeople/` |
| **company-wiki** | Source PRD homepage, product section, branding — mirror ke repo `dntech/docs` |
| **DOVA / ERP / produk lain** | Bukan codebase di dntech — **konten CMS + seed script** di V8.2 |
| **SMTP provider** | mailspace — password mailbox dari ops |
| **VPS / DNS** | dntech.id, api.dntech.id, SSL, Nginx |

---

## 11. Risiko

| Risiko | Probabilitas | Mitigasi V8 |
|--------|--------------|-------------|
| Deploy DB push gagal di prod | Medium | Backup + staging dry-run |
| SMTP blocked / spam | Medium | SPF/DKIM check; test ke Gmail/Outlook |
| Build env salah → SSR kosong | Medium | CI check env; resolver fallback (sudah Jul 13) |
| Scope creep WYSIWYG builder | High | Batasi C3 ke guided forms, bukan page builder |
| Tim konten tidak isi CMS | Medium | Track A seed + editorial calendar |

---

## 12. Open Questions (Perlu Keputusan Sebelum PRD Final)

1. **Prioritas track:** A saja dulu (go-live) atau A+B paralel?
2. **Produk ke-2 di `/products`:** DOVA, ERP, atau internal tool lain — urutan publish?
3. **Redis:** Invest now (multi PM2) atau tunggu traffic?
4. **Dark mode:** Masuk V8 atau defer V9?
5. **Newsletter di footer:** Tetap hanya `/resources` atau kembalikan compact footer?
6. **Bahasa Inggris:** Perlu i18n V8 atau tetap ID-only?
7. **Budget monitoring:** Sentry / UptimeRobot / GA4 alerts — tool pilihan?

---

## 13. Rekomendasi Urutan Eksekusi

```
Minggu 1   Track A (V8.0) — db push, seed, SMTP, QA, Lighthouse
Minggu 2   Track B (V8.1) — CI, smoke, auth fixes
Minggu 3–4 Track C (V8.2) — product editor + produk ke-2 + conversion widgets
```

**Quick win 48 jam (jika hanya satu sprint):** A1 + A2 + A3 + A7 → dnPeople live + email works.

---

## 14. Artefak Turunan dari Dokumen Ini

Setelah disetujui, dokumen ini menjadi input untuk:

| Artefak | Isi |
|---------|-----|
| `DN-TECH-PRD-V8.md` | PRD formal (scope, user stories, wireframe acceptance) |
| `DN-TECH-SRS-V8.md` | FR/NFR + test cases |
| `DN-TECH-SDD-V8.md` | CI, Redis, auth refresh, product editor tech design |
| `DN-TECH-V8-IMPLEMENTATION-GUIDE.md` | Step-by-step dev ( pola V4/V5 ) |
| `GO-LIVE-SIGNOFF-V8.0.md` | Checklist ops one-pager |

---

## 15. Referensi Scan

| Sumber | Path |
|--------|------|
| Status implementasi (source of truth) | `docs/IMPLEMENTATION-STATUS.md` |
| Overview teknis | `docs/PROJECT-OVERVIEW.md` |
| Deploy production | `docs/DEPLOYMENT-PRODUCTION.md` |
| Roadmap V1–V5 | `docs/v5/01-COMPLETE-ROADMAP.md` |
| Product Section PRD (V7) | `company-wiki/.../PRD/DN-TECH-PRODUCT-SECTION-PRD.md` |
| Homepage PRD Indonesia | `company-wiki/.../DN-TECH-HOMEPAGE-REDESIGN-PRD-INDONESIA-EDITION.md` |
| Seed dnPeople | `backend/scripts/seed-dnpeople-product.ts` |
| Schema | `backend/prisma/schema.prisma` |
| API entry | `backend/src/index.ts` |

---

## 16. Bottom Line

| Pertanyaan | Jawaban |
|------------|---------|
| Apakah dntech sudah selesai dibangun? | **Ya — V1–V7 feature scope di codebase** |
| Apakah sudah selesai diluncurkan secara operasional? | **Belum sepenuhnya** — DB production, seed dnPeople, SMTP proof, QA |
| Apa fokus PRD berikutnya? | **V8 = hardening + operasi + konversi + CMS maturity**, bukan greenfield |
| Dokumen ini untuk apa? | **Dasar** menulis PRD/SRS/SDD V8 resmi dan prioritas sprint |

---

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DN Tech (DN Tech.id) |
| UpdatedAt | July 24, 2026 |

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
