# Audit — Trusted Jurist Website

Penilaian teknis, konten, dan kesiapan go-live proyek **Trusted Jurist Law Firm**.

**Terakhir diperbarui:** 19 Mei 2026 · **Versi audit:** 2.0 · **Versi aplikasi:** 0.2.0

Skala prioritas: **P0** (bloker go-live) · **P1** (penting pasca-launch) · **P2** (peningkatan) · **P3** (nice-to-have)

---

## Ringkasan Eksekutif

| Area | Status | Catatan |
|------|--------|---------|
| Arsitektur & codebase | Baik | Modular, TypeScript, `lib/contact/` terpisah |
| UI/UX & brand | Baik | Editorial premium, design tokens konsisten |
| SEO | Baik | Sitemap, robots, OG image, metadata lengkap |
| Aksesibilitas | Baik | Landmarks, form labels, reduced motion global |
| Performa | Baik | SSG + client minimal; belum diukur di production |
| Keamanan & privasi | Cukup | Backend form + privacy page; perlu env production |
| Kesiapan konten | Perlu konfirmasi | Nomor kontak REVIEW; universitas founder |

**Rekomendasi:** Siap **staging** setelah env production diisi. Go-live publik setelah konfirmasi nomor kontak resmi dan review legal disclaimer.

---

## 1. Arsitektur & Kode

### Kekuatan

- Next.js App Router — 7 halaman statis + 1 API route
- Konten di `src/lib/data.ts`, konfigurasi di `src/lib/constants.ts`
- Modul `src/lib/contact/` — validate, sanitize, rate-limit, recaptcha, email
- Komponen homepage modular (`components/home/`)
- Build production sukses (TypeScript strict)

### Temuan terbuka

| ID | Prioritas | Temuan | Rekomendasi |
|----|-----------|--------|-------------|
| A1 | P2 | Tidak ada automated test | Smoke test API + halaman kritis |
| A2 | P2 | `contactInfo` deprecated masih dipakai | Migrasi penuh ke `CONTACT_CONFIG` |
| A3 | P3 | Aset boilerplate Next di `public/` | Hapus sebelum production |
| A4 | P3 | Tidak ada CI/CD | Workflow `build` + `lint` di GitHub Actions |

---

## 2. SEO & Discoverability

### Sudah diimplementasi

- [x] `createMetadata()` di semua halaman termasuk `/privacy`
- [x] Open Graph + Twitter card + `openGraph.images`
- [x] `app/sitemap.ts` → `/sitemap.xml`
- [x] `app/robots.ts` → `/robots.txt` (disallow `/api/`)
- [x] `app/opengraph-image.tsx` — OG 1200×630 dinamis
- [x] JSON-LD `LegalService` di root layout
- [x] Canonical URL per halaman

### Temuan terbuka

| ID | Prioritas | Temuan | Rekomendasi |
|----|-----------|--------|-------------|
| S1 | P2 | `?lang=en` belum aktif | i18n atau hapus alternate |
| S2 | P2 | Tidak ada `/insights/[slug]` | Tambah saat artikel dipublikasi |
| S3 | P3 | Belum ada analytics | Plausible/GA4 setelah privasi final |

---

## 3. Aksesibilitas

### Sudah diimplementasi

- [x] `lang="id"`, skip link, landmarks
- [x] Form: label, `aria-label`, `role="alert"` / `role="status"`
- [x] Navbar mobile: `aria-expanded`, `aria-controls`, `role="dialog"`
- [x] `prefers-reduced-motion` di `globals.css`
- [x] Focus ring pada input

### Temuan terbuka

| ID | Prioritas | Temuan | Rekomendasi |
|----|-----------|--------|-------------|
| X1 | P2 | Focus trap menu mobile belum diaudit | Manual test + axe DevTools |
| X2 | P3 | Kontras gold/cream | Uji WCAG AA |

---

## 4. Performa

| ID | Prioritas | Temuan | Rekomendasi |
|----|-----------|--------|-------------|
| P1 | P1 | Belum Lighthouse di staging production | Target: Perf ≥85, A11y ≥95, SEO ≥95 |
| P2 | P3 | Belum ada foto tim/hero | `next/image` saat aset siap |

---

## 5. Keamanan & Privasi

### Sudah diimplementasi

- [x] `POST /api/contact` — validasi input, escape HTML email
- [x] Rate limit 5 request/menit/IP (in-memory)
- [x] reCAPTCHA v3 (wajib production, opsional dev)
- [x] Halaman `/privacy` + link di form & footer
- [x] Tidak ada secret di repo; `.env*` di gitignore

### Temuan terbuka

| ID | Prioritas | Temuan | Rekomendasi |
|----|-----------|--------|-------------|
| K1 | P0 | Env production belum diisi | `RESEND_*`, reCAPTCHA di Vercel/hosting |
| K2 | P1 | Rate limit in-memory | Upstash Redis jika multi-instance |
| K3 | P1 | Nomor kontak placeholder | Update `CONTACT_CONFIG` |
| K4 | P2 | Verifikasi domain Resend + SPF/DKIM | MXToolbox sebelum go-live |

---

## 6. Konten & Kepatuhan Hukum

### Kekuatan

- Tidak ada testimonial atau case history palsu
- Wawasan berlabel draf / coming soon
- Disclaimer footer diperbarui (bukan nasihat hukum, hubungan advokat–klien)
- Placeholder perguruan founder dihapus (hindari data palsu)

### Temuan terbuka

| ID | Prioritas | Temuan | Rekomendasi |
|----|-----------|--------|-------------|
| C1 | P0 | Telepon & WhatsApp `XXXX` | Konfirmasi admin firma |
| C2 | P1 | Nama universitas founder belum diisi | Dokumen resmi firma |
| C3 | P1 | Peta kantor belum ada | Google Maps embed |
| C4 | P2 | Slot tim tanpa nama individu | Umumkan saat roster siap |

---

## 7. UX & Fungsionalitas

### Sudah diimplementasi

- [x] 7 halaman + 404 kustom
- [x] Form backend dengan error handling
- [x] Navbar scroll-aware + menu mobile
- [x] Deep link praktik `#id`
- [x] Footer + tautan privasi

### Temuan terbuka

| ID | Prioritas | Temuan | Rekomendasi |
|----|-----------|--------|-------------|
| U1 | P2 | Artikel tidak dapat diklik | `/insights/[slug]` saat live |
| U2 | P3 | i18n belum aktif | Roadmap |

---

## 8. Checklist Go-Live

### P0 — Wajib

- [x] Backend form (`/api/contact` + Resend)
- [x] Halaman Kebijakan Privasi
- [x] OG image, sitemap, robots, favicon
- [ ] Isi env production (Resend, reCAPTCHA)
- [ ] Update `CONTACT_CONFIG` — telepon & WhatsApp resmi
- [ ] Review disclaimer dengan tim legal

### P1 — Segera setelah launch

- [ ] Deploy staging + Lighthouse audit
- [ ] Uji email (Gmail, Outlook, Apple Mail)
- [ ] Verifikasi SPF/DKIM/DMARC domain email
- [ ] Integrasi peta kantor
- [ ] Lengkapi data universitas founder

### P2 — Backlog

- [ ] `/insights/[slug]`
- [ ] i18n bahasa Inggris
- [ ] Analytics
- [ ] CI/CD + automated tests
- [ ] Rate limit Redis (multi-region)

---

## Riwayat Audit

| Tanggal | Versi | Catatan |
|---------|-------|---------|
| 2026-05-19 | 1.0 | Baseline v0.1.0 |
| 2026-05-19 | 2.0 | Pasca v0.2.0 — backend, SEO assets, privacy |
