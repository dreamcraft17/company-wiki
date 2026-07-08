# Go-Live Checklist — Trusted Jurist

Checklist lengkap deploy production. Centang setiap item sebelum membuka website ke publik.

**Versi aplikasi:** 0.2.0 · **Terakhir diperbarui:** 19 Mei 2026

---

## A. Environment & Backend

| # | Item | Status |
|---|------|--------|
| A1 | Salin `.env.example` → `.env.local` (lokal) / env vars hosting (production) | ☐ |
| A2 | `RESEND_API_KEY` — daftar & verifikasi domain di [resend.com](https://resend.com) | ☐ |
| A3 | `RESEND_FROM_EMAIL` — alamat pengirim terverifikasi | ☐ |
| A4 | `ADMIN_EMAIL` — inbox notifikasi lead | ☐ |
| A5 | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY` — [reCAPTCHA admin](https://www.google.com/recaptcha/admin) | ☐ |
| A6 | Uji form: submit → email user + admin diterima | ☐ |
| A7 | Uji rate limit: 6 submit cepat → respons 429 | ☐ |

---

## B. Konten & Konfigurasi (`src/lib/data.ts`)

| # | Field | Status |
|---|-------|--------|
| B1 | `CONTACT_CONFIG.email` — `konsultasi@trustedjurist.co.id` (konfirmasi resmi) | ☐ |
| B2 | `phone.display` / `phone.tel` — ganti `XXXX` | ☐ |
| B3 | `whatsapp.number` — format `62XXXXXXXXXX` | ☐ |
| B4 | `address.line1` — nomor unit/ruko jika ada | ☐ |
| B5 | `operatingHours` — sesuai jam kantor resmi | ☐ |
| B6 | `founderCredibility.education` — nama universitas dari dokumen resmi | ☐ |
| B7 | Review `FOOTER_LEGAL.disclaimer` dengan tim legal | ☐ |

---

## C. SEO & Aset

| # | Item | Status |
|---|------|--------|
| C1 | `/sitemap.xml` dapat diakses | ☐ |
| C2 | `/robots.txt` dapat diakses | ☐ |
| C3 | Preview OG: [opengraph.xyz](https://www.opengraph.xyz/) atau Twitter Card Validator | ☐ |
| C4 | Favicon tampil di tab browser | ☐ |
| C5 | `SITE_CONFIG.url` di `constants.ts` = domain production | ☐ |

---

## D. Keamanan & Email Deliverability

| # | Item | Status |
|---|------|--------|
| D1 | HTTPS aktif di domain production | ☐ |
| D2 | SPF record domain email | ☐ |
| D3 | DKIM (dari Resend) | ☐ |
| D4 | DMARC (minimal `p=none`) | ☐ |
| D5 | Uji email: Gmail, Outlook, Apple Mail — tidak masuk spam | ☐ |

---

## E. QA Fungsional

| # | Skenario | Status |
|---|----------|--------|
| E1 | Navigasi semua halaman (7 halaman + 404) | ☐ |
| E2 | Menu mobile buka/tutup, keyboard Tab | ☐ |
| E3 | Form: field kosong → error validasi | ☐ |
| E4 | Form: email invalid → error | ☐ |
| E5 | Form: pesan 5000+ karakter → error | ☐ |
| E6 | Form: karakter unicode (é, 中文) → tampil benar di email | ☐ |
| E7 | WhatsApp link membuka chat dengan pesan default | ☐ |
| E8 | Lighthouse staging: Perf ≥85, A11y ≥95, SEO ≥95 | ☐ |

---

## F. Deploy

| # | Item | Status |
|---|------|--------|
| F1 | `npm run build` sukses tanpa error | ☐ |
| F2 | `npm run lint` — perbaiki error kritis | ☐ |
| F3 | Env vars production di-set di hosting (Vercel/dll.) | ☐ |
| F4 | DNS A/CNAME ke hosting | ☐ |
| F5 | Rollback plan (tag/commit sebelumnya) | ☐ |
| F6 | Tim standby 24 jam pasca-launch | ☐ |

---

## Perintah cepat

```bash
cd tj
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
npm run build
npm run start

# Uji API
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Litigasi","message":"Uji form"}'
```

---

## Dokumen terkait

- [README.md](../README.md) — setup & struktur
- [audit.md](../audit.md) — temuan teknis
- [fitur.md](../fitur.md) — daftar fitur
- [changelog.md](../changelog.md) — riwayat versi
