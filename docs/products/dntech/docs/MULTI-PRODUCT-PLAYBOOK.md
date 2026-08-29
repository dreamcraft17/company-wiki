# Multi-Product Playbook (V8 — C4)

Panduan untuk menambahkan produk baru ke `/products` mengikuti pola yang sudah dipakai dnPeople.

## Produk DN Tech saat ini (Agustus 2026)

| Produk | Slug | Script | Status |
|--------|------|--------|--------|
| dnPeople HRIS | `dnpeople` | `db:seed-dnpeople` | Launched · flagship |
| dnCore ERP | `dncore` | `db:seed-dncore` | Beta |
| dnShop Finance | `dnshop-finance` | `db:seed-dnshop` | Launched |
| Nearwork | `nearwork` | `db:seed-nearwork` | Beta |
| DuaVulnScanner | `duavulnscanner` | `db:seed-dvs` | Beta |
| Threads Automation | `threads-automation` | `db:seed-threads-automation` | Launched (internal) |
| Trusted Jurist | `trusted-jurist` | `db:seed-trusted-jurist` | Launched (client showcase) |

**Seed semua sekaligus (kecuali DOVA):**

```bash
cd backend
npm run db:seed-products
```

## 1. Siapkan konten

Kumpulkan copywriting untuk semua section berikut (idealnya di satu file markdown/doc, seperti pola dnPeople di `company-wiki/docs/products/<nama-produk>/copywriting/`):

- Nama, slug, tagline, deskripsi singkat & panjang
- Kategori (mis. "HRIS", "ERP", "CRM")
- Pricing tiers (nama, harga, fitur per tier, CTA)
- Fitur (flat list atau grouped by category)
- Integrasi pihak ketiga
- Use cases per segmen pelanggan (dengan testimonial opsional)
- Testimonials
- Roadmap per kuarter
- Comparison table vs kompetitor
- FAQ khusus produk (opsional — fallback ke FAQ global jika kosong)
- Primary/secondary CTA, demo URL (Calendly), pricing calculator URL
- Hero image, logo, screenshots

## 2. Buat script seed

Duplikasi `backend/scripts/seed-dnpeople-product.ts` menjadi `backend/scripts/seed-<slug>-product.ts`. Gunakan `prisma.product.upsert({ where: { slug: '<slug>' }, ... })` supaya idempotent (aman dijalankan berulang kali).

Tambahkan npm script di `backend/package.json`:

```json
"db:seed-<slug>": "tsx scripts/seed-<slug>-product.ts"
```

Jalankan:

```bash
cd backend
npm run db:seed-<slug>
```

## 3. Upload media

Gunakan admin panel `/admin/products` → buka/`Tambah Produk` → upload hero image, logo, dan screenshots lewat drag-drop atau file picker (tersimpan otomatis ke media library, URL auto-terisi). Atau upload manual dulu di `/admin/media` lalu salin URL-nya ke field terkait.

## 4. Isi pricing tiers & FAQ lewat guided form

Di editor produk, gunakan form "Pricing" untuk menambah tier satu per satu (nama, harga, fitur per baris, CTA) dan form "FAQ" untuk menambah pasangan pertanyaan-jawaban — tidak perlu menulis JSON manual.

Field lain (fitur per kategori, use cases, integrasi, comparison table, roadmap, testimonials) masih menggunakan JSON textarea; ikuti placeholder yang tersedia di tiap field sebagai contoh format.

## 5. Publish & QA

1. Set `status: 'active'`, `launchStatus` (`launched`/`beta`/`coming_soon`), dan centang `featured` bila perlu di tab "Status & Publishing".
2. Isi SEO (meta title, description, keywords, canonical).
3. Simpan, lalu buka `/products/<slug>` di browser — pastikan semua section render tanpa error, cek console browser untuk error SSR.
4. Verifikasi minimal 2 produk published tampil di `/products` (dnPeople + produk lain).
5. Jalankan checklist mobile responsiveness (320px/640px/1024px/1440px) — lihat `docs/QA-CHECKLIST-V8.md`.

## 6. Checklist ringkas

- [ ] Script seed dibuat & idempotent (upsert by slug)
- [ ] Seed dijalankan di staging, lalu production
- [ ] Hero image, logo, screenshots ter-upload
- [ ] Pricing tiers terisi via guided form
- [ ] FAQ terisi via guided form (atau sengaja dikosongkan untuk fallback global)
- [ ] Status published + featured sesuai kebutuhan
- [ ] `/products/<slug>` render penuh tanpa error
- [ ] Muncul di listing `/products`
