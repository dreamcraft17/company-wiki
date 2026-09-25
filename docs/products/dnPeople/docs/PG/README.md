---
owner: Dozer
status: review-required
canonical: false
last_reviewed: 2026-09-16
review_cadence: annual
---

# Payment Gateway — Xendit · Midtrans · DOKU · DOKU SNAP (admin-switchable)

**Status (21 Sep 2026):** Empat provider checkout tersedia; **super-admin memilih gateway aktif** dari `/admin/payment-gateway` (feature flag `platform:active-payment-provider`). Gateway aktif/default sekarang **DOKU**. Webhook DOKU, DOKU SNAP, Midtrans, dan Xendit tetap ter-mount sesuai provider yang dipilih.

> **Perubahan precedence (commit `33bedda`):** env `PAYMENT_PROVIDER` sekarang **menang di atas** pilihan admin di DB (`platform:active-payment-provider` flag) — sebelumnya sebaliknya (DB flag menang atas env). Jika `PAYMENT_PROVIDER` di-set di environment server, admin **tidak bisa lagi override lewat UI** tanpa mengubah env var itu juga. Perlu dipastikan ini disengaja — kalau tidak, admin console switch bisa terasa "tidak nge-save" di production.

| Gateway | Library | Webhook | Metode | Status |
|---------|---------|---------|--------|--------|
| Xendit | `backend/src/lib/xendit.ts` | `/webhooks/xendit` | Invoice v2 hosted checkout | Alternatif |
| Midtrans | `backend/src/lib/midtrans.ts` | `/webhooks/midtrans` | SNAP | Aktif (bukan legacy) |
| DOKU | `backend/src/lib/doku.ts` | `/webhooks/doku` | Checkout Non-SNAP, QRIS | **Gateway aktif/default; production live** |
| DOKU SNAP | `backend/src/lib/dokuSnap.ts` + `dokuSnapQris.ts` | `/webhooks/doku-snap` | Direct API — QRIS (Phase 1) | Jalur terpisah; status channel/env mengikuti konfigurasi SNAP |

### DOKU SNAP — beda arsitektur dari DOKU Checkout Non-SNAP

**provider id `doku_snap`, terpisah dari `doku`.** Tidak ada hosted checkout page — tiap channel (QRIS, VA per bank, e-wallet per provider, direct debit) adalah API terpisah yang di-render sendiri di app (lihat `frontend/src/components/Payment/DokuQrisPayment.tsx`).

**Auth 2 tahap:** (1) token B2B — signature RSA-SHA256 pakai private key kita sendiri (`DOKU_SNAP_PRIVATE_KEY`, digenerate via `openssl genrsa`, public key-nya didaftarkan manual ke DOKU Back Office); (2) tiap request pakai Bearer token + signature HMAC-SHA512 (`DOKU_SNAP_CLIENT_SECRET`). Lihat `backend/.env.example` untuk daftar env var lengkap.

**Kenapa polling, bukan cuma webhook:** dokumentasi resmi DOKU untuk SNAP QRIS **tidak mempublikasikan bentuk payload notifikasi webhook**, dan juga tidak mempublikasikan tabel kode pasti untuk `latestTransactionStatus` di Query API (dicek 2026-09-16). Jadi webhook (`processDokuSnapWebhook`) di sini cuma dipakai sebagai *trigger* re-verifikasi ke Query API — tidak pernah dipercaya isinya untuk state pembayaran. Ada 3 lapis: (a) frontend polling tiap 4 detik selagi QR ditampilkan, (b) webhook best-effort, (c) reconciliation harian (`reconcilePendingPayments`) sebagai jaring pengaman terakhir. Kode status `'00'/'01'/'05'` di `dokuSnapQris.ts` untuk `queryQrisStatus` **belum terverifikasi** terhadap sandbox asli — kode manapun yang tidak dikenali di-treat `UNKNOWN` (bukan asal ditebak sukses/gagal).

**Dashboard DOKU Back Office (dicek 2026-09-16, Settings → Account → API Keys)** ternyata cuma punya 1 halaman kredensial, tidak ada halaman terpisah khusus SNAP:

| Field di dashboard | Env var | Catatan |
|---|---|---|
| Client ID (`BRN-0260-...`) | `DOKU_SNAP_CLIENT_ID` | Prefix `BRN-`, beda dari contoh dokumentasi (`MCH-...`) — itu normal, bukan berarti salah akun |
| Active Secret Key (`SK-...`, klik "Reveal Key") | `DOKU_SNAP_CLIENT_SECRET` | Dipakai untuk HMAC-SHA512 |
| API Key (`doku_key_...`) | — (tidak dipakai) | Belum jelas fungsinya, sepertinya untuk produk DOKU lain (Payment Link/PayChat), bukan untuk signing SNAP |
| DOKU Public Key | — (belum dipakai) | Punya DOKU, buat verifikasi signature DARI DOKU — disimpan untuk fase mendatang |
| **Merchant Public Key** ("Edit Merchant Public Key") | *(upload manual)* | **Di sinilah** public key kita (dari `openssl genrsa`) di-paste |
| Pengaturan SNAP → Token URL ("Edit Token URL") | *(daftarkan manual)* | Kemungkinan slot notification/webhook URL SNAP — isi `https://api.hris.dntech.id/api/v1/webhooks/doku-snap` |

Tidak ada field "Partner ID" terpisah — `DOKU_SNAP_PARTNER_ID` sekarang **opsional**, default ke `DOKU_SNAP_CLIENT_ID` (lihat `partnerId()` di `dokuSnap.ts`).

**Catatan konfigurasi DOKU SNAP:**
1. Isi `DOKU_SNAP_CLIENT_ID`/`_CLIENT_SECRET` di `.env` jika jalur SNAP digunakan. `_PARTNER_ID` boleh dikosongkan.
2. Upload public key kita ke "Merchant Public Key" di dashboard, dan cek "Edit Token URL" di Pengaturan SNAP.
3. Konfirmasi `DOKU_SNAP_MERCHANT_ID` yang benar untuk field `merchantId` di request generate QRIS (sementara fallback ke Client ID, belum dikonfirmasi apakah itu benar).
4. Untuk perubahan channel SNAP, lakukan transaksi uji dan cek raw response `queryQrisStatus` serta payload webhook.
5. Jalankan `npm run db:migrate` di VPS setelah migration channel diterapkan.

Config: `paymentProviderConfig.ts` — `getActivePaymentProvider()` memakai `PAYMENT_PROVIDER` jika diset, lalu DB flag, lalu default **`doku`**. `providerConfigured()` menolak switch admin ke provider yang belum punya env key terisi.

**DOKU (baru):** Non-SNAP HMAC-SHA256 signature (`Client-Id`/`Request-Id`/`Request-Timestamp`/`Request-Target`/`Digest` → `Signature: HMACSHA256=...`), endpoint `POST /checkout/v1/payment`, default payment method `QRIS`. Env: `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY`, opsional `DOKU_IS_PRODUCTION`, `DOKU_NOTIFICATION_URL`, `DOKU_PAYMENT_METHOD_TYPES`. Diverifikasi terhadap dokumentasi resmi [developers.doku.com](https://developers.doku.com) — endpoint, signature scheme, dan enum `payment_method_types` sudah sesuai. **Gap diketahui:** belum ada unit test khusus untuk `doku.ts` (signature verification, checkout error path) — Xendit dan Midtrans sudah punya, DOKU belum.

Dokumen PRD/SRS/SDD Midtrans di folder ini tetap referensi historis untuk spesifikasi awal SNAP:

| Doc | Status |
|-----|--------|
| [dnpeople-prd-midtrans-payment-sandbox-v1.0-id.md](./dnpeople-prd-midtrans-payment-sandbox-v1.0-id.md) | Historical spec |
| [dnpeople-srs-midtrans-payment-sandbox-v1.0-id.md](./dnpeople-srs-midtrans-payment-sandbox-v1.0-id.md) | Historical spec |
| [dnpeople-sdd-midtrans-payment-sandbox-v1.0-id.md](./dnpeople-sdd-midtrans-payment-sandbox-v1.0-id.md) | Historical spec |
| [dnpeople-prd-midtrans-comprehensive-v2.0-id.md](./dnpeople-prd-midtrans-comprehensive-v2.0-id.md) | Historical spec (v2) |

Xendit setup legacy/alternatif: [xendit/XENDIT-PAYMENT-SETUP.md](../xendit/XENDIT-PAYMENT-SETUP.md).
