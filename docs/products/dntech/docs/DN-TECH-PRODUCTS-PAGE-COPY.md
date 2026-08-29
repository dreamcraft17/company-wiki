# DN Tech — Copy halaman Produk (`/products`)

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer

Copy untuk section produk beranda dan halaman `/products`. Bahasa Indonesia. Keyword dari fitur yang memang ada. Tidak ada klaim 10x, trial semu, atau jumlah klien fiktif.

**Rute publik:** `https://dntech.id/products` (bukan `/produk`).

---

## Summary

Audit 2026-08-29: header “Produk first-party” lemah, tagline mix ID/EN, meta generik. Perbaikan yang **shipped** memakai keyword HRIS / ERP / pembukuan, value prop operasional sendiri, dan CTA jujur (`Lihat {nama}` → halaman produk compro, bukan demo palsu).

| Layer | Lokasi | Override |
|-------|--------|----------|
| Meta `/products` | `dntech/frontend/src/lib/seo.ts` → `PAGE_SEO.products` | Hardcoded |
| H1 listing | `app/(public)/products/page.tsx` | Hardcoded |
| Heading beranda | `homeContent.productsTitle` / `productsSubtitle` | `/admin/settings` JSON |
| Tagline & meta kartu | `/admin/products` | Seed: `npm run db:seed-products` |

---

## 1. Yang tidak dipakai dari draft audit

Draft awal bagus arahnya, tapi beberapa baris **ditolak** karena tidak benar untuk seluruh katalog:

| Draft | Alasan |
|-------|--------|
| “Coba gratis tanpa kartu kredit” di header katalog | Hanya sebagian produk (dnPeople / dnShop) yang punya tier gratis. Threads internal; Nearwork waitlist; DVS request access. |
| “Hemat 10x” / “Hemat 5 jam/minggu” | Tidak ada data publik. Perbandingan harga dnPeople tetap di long-form produk, bukan di kartu. |
| CTA beranda “Lihat Demo” / “Mulai Trial” | Link kartu = `/products/{slug}`, bukan app live. CTA jujur: **Lihat {nama}**. |
| “No hidden fees” di meta katalog | Klaim pricing per produk, bukan halaman daftar. |
| Keyword stuffing di H1 | Sudah pernah ditolak di homepage. Keyword masuk title/description/tagline secara alami. |

---

## 2. Copy yang berlaku (kode default)

### 2.1 Meta `/products`

| Field | Teks | Batas |
|-------|------|-------|
| Title | HRIS, ERP & Pembukuan untuk Bisnis Indonesia | ≤60 |
| Description | Software HRIS, ERP, dan pembukuan Shopee dari DN Tech untuk startup & UKM. Fitur, harga, dan status rilis di setiap halaman produk. | ≤160 |
| Keywords | HRIS Indonesia · ERP software Indonesia · pembukuan Shopee · software UKM Indonesia · dnPeople · dnCore | — |

### 2.2 H1 halaman `/products`

**Produk software siap pakai**

dnPeople (HRIS), dnCore (ERP), dnShop Finance (pembukuan Shopee), dan tool operasional yang kami bangun sendiri. Fitur, harga, dan status rilis ada di halaman masing-masing.

### 2.3 Section beranda

**Produk software siap pakai**

HRIS, ERP, dan pembukuan yang kami bangun dan jalankan sendiri. Setiap halaman mencantumkan fitur, harga, dan status rilis.

CMS: `homeContent.productsTitle` / `productsSubtitle`. Fallback: `DEFAULT_PRODUCTS_SECTION` di `homepage-content.ts`.

CTA kartu unggulan: `Lihat {nama}` → `/products/{slug}`.

---

## 3. Tagline produk (seed / admin)

Paste ke `/admin/products` jika production belum di-reseed.

| Produk | Category | Tagline | Meta title (seed) |
|--------|----------|---------|-------------------|
| dnPeople | HRIS / Payroll | HRIS & payroll untuk UKM — gaji, absensi, cuti di satu dashboard. | dnPeople — HRIS & Payroll untuk UKM |
| dnCore | ERP | ERP keuangan, stok, dan proyek dalam satu platform. | dnCore — ERP Keuangan & Operasional untuk UKM |
| dnShop Finance | FinTech | Pembukuan Shopee seller — sync order, pajak, SAK EMKM. | dnShop Finance — Pembukuan Shopee & SAK EMKM |
| Nearwork | Marketplace | Marketplace freelance Indonesia — job, proposal, kontrak. | Nearwork — Marketplace Freelance Remote & On-site |
| DuaVulnScanner | Security | Scanner web pasif, laporan temuan, dan tracking pentest. | DuaVulnScanner — Scanner Web & Laporan Pentest |
| Threads Automation | Social Media | Caption AI, jadwal, dan auto-publish ke Meta Threads. | Threads Automation — Caption AI & Auto-Publish Meta Threads |
| Trusted Jurist | Client Solutions | Website firma hukum — desain editorial. | Trusted Jurist — Website Firma Hukum |

Nearwork dan Threads: status **beta / waitlist / internal** — jangan tulis “hire sekarang” atau “hemat N jam” seolah GA.

---

## 4. Deploy copy ke production

1. Merge / pull kode frontend (meta + H1 + heading default).
2. Update heading beranda: `/admin/settings` → `homeContent` JSON, **atau** `npm run db:seed-homepage` (menulis `productsTitle` / `productsSubtitle`).
3. Update tagline kartu: `/admin/products` per item, **atau** `npm run db:seed-products` (upsert 7 produk).
4. Build selesai → `pm2 restart dntech-web`.
5. Cek GSC setelah index (bukan jam yang sama).

Seed produk **overwrite** field yang di-set script. Jangan seed jika ada edit dashboard yang belum di-backup.

---

## 5. Checklist editor

- [ ] Unique value prop per produk (bukan template yang sama)
- [ ] 2–3 keyword yang ada di fitur nyata
- [ ] Benefit-first, bukan dump modul
- [ ] CTA sesuai destinasi tautan
- [ ] Bahasa ID (istilah teknis HRIS/ERP/SAK EMKM OK)
- [ ] Tidak ada testimoni / jumlah klien fiktif
- [ ] Klaim angka punya sumber di halaman produk, bukan di kartu katalog

---

*Related: [DN-TECH-DASHBOARD-SEO-MARKETING-COPY.md](./DN-TECH-DASHBOARD-SEO-MARKETING-COPY.md)*
