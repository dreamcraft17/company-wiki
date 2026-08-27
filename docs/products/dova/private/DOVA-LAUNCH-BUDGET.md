# DOVA — Yang Perlu Dibeli & Budget Minimum Sebelum Funding

> **Status:** Active · **Terakhir diperbarui:** 2026-08-23 · **Owner:** Dozer / DN Tech  
> **Audience:** BD, investor, ops — **bukan** dokumen teknis  
> **URL live saat ini:** [dova.dntech.id](https://dova.dntech.id) · API [api.dova.dntech.id](https://api.dova.dntech.id/api/v1/health)

---

## Jawaban singkat (2 pertanyaan dari chat)

| Pertanyaan | Jawaban |
|------------|---------|
| **Apa saja yang perlu dibeli agar web bisa dipakai konsumen dan mulai dapat income?** | Hampir **tidak perlu beli fitur baru** — kode MVP sudah jadi. Yang perlu: **(1)** aktivasi **Paystack live** (terima uang nyata), **(2)** infra hosting + database (sebagian **sudah jalan** di DN Tech), **(3)** domain publik (opsional jika tetap pakai `dntech.id`), **(4)** 1–2 supplier pilot dengan stok nyata, **(5)** channel support. |
| **Berapa budget minimum sebelum funding penuh, dan fitur apa yang tercakup?** | **~$15–50/bulan** (~₦25.000–80.000/bulan) jika memakai VPS DN Tech yang sudah ada. Fitur yang tercakup = **seluruh MVP yang sudah dibangun** (shop → cart → checkout → bayar → pesanan → supplier → admin). Budget ini **mengaktifkan go-live**, bukan membangun modul baru. |

---

## Konteks penting

DOVA sudah memiliki:

- ✅ **Kode produk MVP lengkap** — customer, supplier, admin, Paystack integration
- ✅ **Situs live online** — tim bisa coba alur end-to-end hari ini di `dova.dntech.id`
- ✅ **92 unit tests** green di CI

Yang **belum** menghasilkan income nyata:

- ⚠️ Paystack masih **test mode** atau simulasi — uang tidak masuk rekening merchant
- ⚠️ Katalog masih **data demo/seed** — butuh supplier pilot dengan produk & harga nyata
- ⚠️ Soft-launch checklist bisnis belum final (support, tanggal launch, ≥10 transaksi test)

**Kesimpulan:** Tim tidak perlu menunggu funding penuh untuk *membangun* produk. Yang dibutuhkan adalah **budget operasional kecil** untuk *mengaktifkan* produk yang sudah ada.

---

## 1. Apa saja yang perlu dibeli?

### Wajib (supaya konsumen bisa beli & bayar)

| # | Item | Untuk apa | Estimasi biaya | Catatan |
|---|------|-----------|------------------|---------|
| 1 | **Akun Paystack merchant (live)** | Terima pembayaran kartu/transfer NGN | **Gratis** daftar · fee per transaksi ~**1,5% + ₦100** (kartu lokal Nigeria) | Butuh KYC bisnis Nigeria (CAC, rekening, dll.). Tanpa ini = **tidak ada income nyata**. |
| 2 | **Hosting (VPS)** | Menjalankan website + API 24/7 | **$0** (sudah ada) – **$10–20/bulan** | Live sudah di infra DN Tech (`dova.dntech.id`). Jika traffic naik, upgrade VPS. |
| 3 | **Database PostgreSQL** | Simpan user, produk, pesanan | **$0** (di VPS) – **$25/bulan** (managed) | Supabase/Neon free tier cukup untuk soft-launch. |
| 4 | **SSL (HTTPS)** | Keamanan & kepercayaan user | **Gratis** (Let's Encrypt) | Biasanya sudah termasuk di VPS/nginx. |
| 5 | **Domain publik** | URL untuk konsumen | **$0** (subdomain `dova.dntech.id`) – **$10–20/tahun** (`.com.ng`) | Subdomain existing **cukup untuk soft-launch**. Domain brand sendiri bisa nanti. |

**Total wajib (infra saja):** **~$0–20/bulan** jika memakai yang sudah ada.

### Sangat disarankan (tapi bisa ditunda 1–2 minggu)

| # | Item | Untuk apa | Estimasi biaya | Catatan |
|---|------|-----------|------------------|---------|
| 6 | **Email transaksional (Resend)** | Notifikasi order, kontak supplier | **Gratis** (≤3.000 email/bulan) – **$20/bulan** | Backend sudah support; cukup set API key. |
| 7 | **Redis (opsional)** | Session/cache production | **$0** (skip dulu) – **$10/bulan** | Backend **jalan tanpa Redis** — tidak wajib untuk launch. |
| 8 | **Monitoring dasar** | Alert jika server down | **Gratis** (UptimeRobot) | Cukup untuk fase awal. |

### Bukan "beli software" — tapi wajib operasional

| Item | Estimasi | Catatan |
|------|----------|---------|
| **1–3 supplier pilot** | Biaya operasional supplier | Onboarding manual via admin; tidak perlu modul baru |
| **Channel support** | Gratis (WhatsApp Business) | Satu nomor/WA group untuk pertanyaan order |
| **Legal dasar** | Gratis – konsultasi | Terms of Service + Privacy Policy (bisa draft internal dulu) |

---

## 2. Budget minimum — 3 skenario

> Semua angka **estimasi** Agustus 2026. Konversi kasar: **$1 ≈ ₦1.600**. **Harga bisa berubah saat pembelian** — bukan kuota terkunci.

### Skenario A — Pakai infra DN Tech (paling realistis sekarang)

| Item | Bulanan | Satu kali |
|------|---------|-----------|
| VPS (sudah ada) | $0 | — |
| PostgreSQL di VPS | $0 | — |
| SSL | $0 | — |
| Domain `dova.dntech.id` | $0 | — |
| Paystack | $0 fixed | Fee per transaksi saja |
| Email Resend (free tier) | $0 | — |
| **Total** | **~$0–5/bulan** | **~$0** |

**Cocok untuk:** soft-launch, 10–50 transaksi/hari, validasi pasar sebelum funding.

---

### Skenario B — Standalone minimal (tanpa infra DN Tech)

| Item | Bulanan | Satu kali |
|------|---------|-----------|
| VPS kecil (2 GB RAM) | $8–12 | — |
| Domain `.com.ng` | — | $10–20/tahun |
| Supabase free tier | $0 | — |
| Paystack | $0 fixed | Fee per transaksi |
| **Total** | **~$10–15/bulan** | **~$15** |

**Cocok untuk:** jika ingin hosting terpisah dari DN Tech.

---

### Skenario C — Recommended untuk traction (sebelum funding penuh)

| Item | Bulanan | Satu kali |
|------|---------|-----------|
| VPS sedang (4 GB RAM) | $15–25 | — |
| Managed Postgres (Supabase Pro) | $25 | — |
| Resend (jika volume email naik) | $0–20 | — |
| Domain brand | — | $15–20/tahun |
| Monitoring + backup | $0–5 | — |
| **Total infra** | **~$40–75/bulan** | **~$20** |

**Belum termasuk:** marketing/iklan, gaji ops, on-boarding supplier — itu budget bisnis terpisah.

---

### Perbandingan cepat

| Skenario | Budget/bulan | Apa yang didapat |
|----------|--------------|------------------|
| **A — DN Tech (recommended)** | **~$0–5** | Go-live penuh MVP + Paystack live |
| **B — Standalone** | **~$10–15** | Sama, hosting independen |
| **C — Traction** | **~$40–75** | Lebih stabil untuk 100+ user aktif |

**Rekomendasi:** Mulai **Skenario A**. Naik ke C hanya jika traffic/error rate membutuhkan upgrade.

---

## 3. Fitur apa yang sudah tercakup (tanpa development baru)?

Budget minimum di atas **bukan untuk membangun fitur** — fitur sudah ada di kode. Yang dibeli = **infrastruktur + aktivasi pembayaran**.

### Alur konsumen (siap dipakai)

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Daftar & login customer | ✅ Siap | `/auth/register`, `/auth/login` |
| Browse katalog & search | ✅ Siap | Kategori, filter, detail produk |
| Keranjang & minimum order | ✅ Siap | Pickup min **₦3.000** · delivery min **₦5.000** |
| Checkout pickup / delivery | ✅ Siap | Pilih slot Morning / Evening |
| **Bayar via Paystack** | ⚠️ Butuh **live key** | Kode siap; test mode = uang palsu |
| Riwayat pesanan | ✅ Siap | My Orders / Purchase History |
| Form kontak | ✅ Siap | Masuk inbox admin |

### Alur supplier (siap dipakai)

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Registrasi + upload dokumen | ✅ Siap | Admin approve manual |
| Kelola produk & stok | ✅ Siap | Upload foto JPG/PNG/WEBP |
| Terima & proses pesanan | ✅ Siap | Status: processing → shipped → delivered |

### Alur admin (siap dipakai)

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Approve supplier | ✅ Siap | |
| Kelola user, produk, pesanan | ✅ Siap | |
| Inbox contact form | ✅ Siap | |
| Feedback board | ✅ Siap | Native di `/feedback` |

### Yang **tidak** tercakup budget minimum (tunggu funding / roadmap)

| Fitur | Alasan |
|-------|--------|
| Password reset & email verification | Out of MVP |
| Review produk, wishlist, diskon | Out of MVP |
| Courier tracking | Out of MVP |
| Aplikasi mobile native | Out of MVP |
| Marketing / iklan berbayar | Budget bisnis terpisah |

---

## 4. Apa yang harus dilakukan agar income mulai masuk?

Urutan praktis — **bisa dimulai minggu ini**:

| Langkah | Siapa | Biaya | Durasi estimasi |
|---------|-------|-------|-----------------|
| 1. Finalisasi akun **Paystack live** (KYC) | BD / legal Nigeria | Gratis | 3–14 hari (verifikasi Paystack) |
| 2. Ganti `PAYSTACK_SECRET_KEY` ke **`sk_live_...`** + public key di frontend | Tech | $0 | 1 hari |
| 3. Set webhook Paystack ke `api.dova.dntech.id/api/v1/payments/webhook` | Tech | $0 | 1 jam |
| 4. Onboard **1–3 supplier pilot** dengan produk & harga nyata | BD + ops | Operasional | 3–7 hari |
| 5. Jalankan **≥10 transaksi test** di staging (Paystack test) | Tech + BD | $0 | 1–2 hari |
| 6. Soft-launch ke grup kecil (10–20 buyer) | BD | $0 | Minggu 1 |
| 7. Tentukan channel support (WhatsApp) | Ops | $0 | 1 hari |

**Setelah langkah 1–3 selesai:** setiap checkout sukses = **uang masuk rekening Paystack merchant**.

---

## 5. Yang **tidak** perlu dibeli dulu (hemat budget)

| Item | Mengapa skip dulu |
|------|-------------------|
| Development fitur baru | MVP sudah 100% scope Week 1–4 |
| Redis | Backend fallback tanpa Redis |
| FeedLog eksternal | Feedback board native sudah ada |
| E2E test suite (Playwright) | Nice-to-have, bukan blocker launch |
| APM / Datadog | Overkill untuk soft-launch |
| VPS besar | Upgrade saat traffic terbukti naik |
| Domain premium | Subdomain `dova.dntech.id` cukup untuk validasi |

---

## 6. Risiko jika menunggu funding penuh

| Risiko | Dampak |
|--------|--------|
| Idle 1–3 bulan menunggu investor | Kehilangan momentum, tidak ada data usage nyata |
| Tidak ada transaksi real | Pitch deck tanpa bukti traction |
| Supplier pilot kehilangan interest | Harus re-onboard nanti |

**Alternatif:** Launch dengan **~$0–5/bulan** (Skenario A) → kumpulkan data pesanan nyata → tunjukkan ke investor.

---

## 7. Checklist go/no-go soft-launch

Centang sebelum buka ke konsumen luas:

- [ ] Paystack **live** keys aktif + webhook verified
- [ ] ≥10 transaksi **test** sukses di staging
- [ ] Minimal **1 supplier** approved dengan stok nyata
- [ ] Channel support (WhatsApp/nomor) dipublikasikan di Contact
- [ ] Terms & Privacy tersedia (minimal draft)
- [ ] Tim admin siap approve supplier & monitor order harian
- [ ] Smoke test: `npm run smoke:week4` green against staging API

---

## 8. Template balasan WhatsApp (copy-paste)

```
Re: DOVA — mulai sebelum funding

Kabar baik: produk MVP sudah jadi & live di dova.dntech.id.

Yang perlu "dibeli" bukan fitur baru, tapi:
1. Paystack live (gratis daftar, fee per transaksi ~1.5%+₦100)
2. Hosting — sebagian sudah jalan di DN Tech (~$0-5/bulan)
3. 1-3 supplier pilot + channel support WhatsApp

Budget minimum: ~$0-5/bulan infra + biaya transaksi Paystack.
Fitur tercakup: full shop → cart → checkout → bayar → order → supplier → admin (semua sudah built).

Next step: aktivasi Paystack live KYC + onboard supplier pilot → soft launch kecil → kumpulin data untuk investor.

Detail lengkap: company-wiki/docs/products/dova/private/DOVA-LAUNCH-BUDGET.md
```

---

## Dokumen terkait

| Dokumen | Isi |
|---------|-----|
| **CEO summary (PDF)** | [`DOVA-LAUNCH-BUDGET-CEO.md`](./DOVA-LAUNCH-BUDGET-CEO.md) · [`DOVA-Launch-Budget-CEO-Friendly.pdf`](./DOVA-Launch-Budget-CEO-Friendly.pdf) |
| Status teknis | [`../docs/STATUS-LENGKAP.md`](../docs/STATUS-LENGKAP.md) |
| ENV setup | `dova/tests/ENV-SETUP.md` — variabel env untuk Paystack live |
| Staging go-live | [`../docs/STAGING-GO-LIVE.md`](../docs/STAGING-GO-LIVE.md) |

---

## Changelog

| Tanggal | Perubahan |
|---------|-----------|
| 2026-08-23 | Dokumen awal — jawaban budget & pembelian pre-funding untuk stakeholder |
