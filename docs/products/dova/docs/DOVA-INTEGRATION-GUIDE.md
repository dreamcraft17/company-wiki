# DOVA — Panduan Integrasi (Masuk / Keluar)

> **Status:** Active · **Last updated:** 2026-09-09 · **Author:** Dozer  
> **Audience:** partner (Botpress / aplikasi resmi) dan ops VPS  
> **App commit:** `fff674c` pada `main` (`dreamcraft17/dova`)  
> **Kontrak HTTP:** [API Documention.md](./API%20Documention.md) · OpenAPI `GET /api/v1/openapi.json` (butuh `X-Api-Key`)

Dokumen ini menjelaskan **siapa yang boleh memanggil API**, **arah trafik**, dan **cara minta kunci**. Bukan daftar lengkap endpoint (itu ada di integrator guide).

**Production live:** kunci ini **baru aktif setelah VPS di-deploy** dengan env di bawah. Tanpa itu, katalog masih bisa di-GET tanpa `X-Api-Key`.

---

## 01 — Ringkasan arah

```
MASUK ke DOVA (orang / bot memanggil kita)
  Official client
    -> HTTPS https://api.dova.dntech.id/api/v1/...
    -> header X-Api-Key (wajib, kecuali 2 rute)
    -> kalau cart/order/payment: Authorization Bearer JWT user

  Browser pelanggan
    -> https://dova.dntech.id/api/gateway/...
    -> Next.js menempelkan X-Api-Key di server (bukan di JS publik)
    -> Nest

  Paystack
    -> POST /api/v1/payments/webhook
    -> HMAC x-paystack-signature (bukan X-Api-Key, bukan JWT)

KELUAR dari DOVA (kita yang memanggil pihak lain)
  Nest ChatService
    -> https://chat.botpress.cloud/<BOTPRESS_WEBHOOK_ID>/...
    -> teks chat saja; JWT pelanggan tidak dikirim

  Nest PaystackService
    -> API Paystack (initialize / verify) pakai PAYSTACK_SECRET_KEY
```

Tidak ada webhook Nest yang menerima event dari Botpress. Integrasi AI resmi = HTTP tool Botpress ke REST Chain + `X-Api-Key` yang Dozer terbitkan.

---

## 02 — Apa yang tertutup vs terbuka

| Rute | Auth |
|------|------|
| Hampir semua JSON di `/api/v1` | `X-Api-Key` |
| Catalog, login, OpenAPI, contact | `X-Api-Key` saja (JWT tidak wajib) |
| Cart, order, payment init/verify, `/auth/me` | `X-Api-Key` **dan** JWT |
| `GET /health` | Tidak ada kunci (liveness) |
| `POST /payments/webhook` | Signature Paystack |
| `/uploads/...` | File statis; **bukan** JSON API, belum pakai `X-Api-Key` |

`@Public()` di Nest artinya **skip JWT**, bukan skip integration key.

Kode: `apps/backend/src/integration-key.guard.ts`, skip di `GET health` dan `POST payments/webhook` (`SkipIntegration`).

---

## 03 — Minta akses resmi (partner)

1. Kirim ke Dozer: nama klien (contoh `botpress`), environment (prod/local), IP/asal kalau ada.
2. Dozer menambah baris di **backend** `DOVA_INTEGRATION_KEYS` (format `nama:secret`, koma jika banyak). Contoh pola (bukan secret asli):

   ```
   DOVA_INTEGRATION_KEYS=storefront:...,botpress:...
   ```

3. Partner **hanya** menerima secret miliknya. Jangan pakai secret storefront.
4. Setiap request:

   ```http
   GET /api/v1/products?search=rice HTTP/1.1
   Host: api.dova.dntech.id
   X-Api-Key: <secret partner>
   ```

5. Untuk belanja: login/register dulu (`X-Api-Key` + body), simpan `accessToken`, lalu:

   ```http
   Authorization: Bearer <accessToken>
   X-Api-Key: <secret partner>
   ```

JWT access ~15 menit; refresh `POST /api/v1/auth/refresh`. Detail path: [API Documention.md](./API%20Documention.md).

Cabut akses: hapus pasangan `nama:secret` itu dari env, restart backend.

---

## 04 — Storefront (keluar dari browser, masuk ke API)

Browser **tidak** boleh memegang `X-Api-Key`.

| Env frontend (server) | Isi |
|------------------------|-----|
| `NEXT_PUBLIC_API_URL` | `/api/gateway` |
| `DOVA_BACKEND_URL` | `https://api.dova.dntech.id/api/v1` (lokal: `http://localhost:3000/api/v1`) |
| `DOVA_INTEGRATION_KEY` | Secret **storefront** yang sama dengan entri `storefront:` di backend |

Kode proxy: `apps/frontend/src/pages/api/gateway/[...path].ts`.

Jangan taruh kunci di `NEXT_PUBLIC_*`.

---

## 05 — Chat AI (keluar ke Botpress)

| Env backend | Fungsi |
|-------------|--------|
| `BOTPRESS_WEBHOOK_ID` | ID Chat API Botpress Cloud |
| `BOTPRESS_CHAT_API_URL` | Default `https://chat.botpress.cloud` |
| `BOTPRESS_REPLY_TIMEOUT_MS` | Default `20000` |

Alur: user login di DOVA → `POST /api/v1/chat/messages` (JWT + `X-Api-Key` via gateway) → Nest forward teks ke Botpress. Tanpa `BOTPRESS_WEBHOOK_ID`, assistant “not configured”.

Agar bot **membaca katalog / membuat order**, itu tool HTTP **di Botpress** ke `api.dova.dntech.id` dengan **kunci partner**, bukan webhook ke Nest.

---

## 06 — Pembayaran (keluar ke Paystack, masuk webhook)

Keluar: `POST /payments/initialize` (JWT + integration key) → Paystack.

Masuk: dashboard Paystack webhook:

```
POST https://api.dova.dntech.id/api/v1/payments/webhook
```

Event: `charge.success`. Header `x-paystack-signature`. Secret: `PAYSTACK_SECRET_KEY` di backend. **Jangan** pakai `X-Api-Key` di webhook Paystack.

AI **tidak** boleh mengklaim bayar sukses tanpa `GET /payments/verify` (JWT + integration key).

---

## 07 — Cek cepat

Tanpa kunci (harus 401 setelah deploy, kecuali health):

```bash
curl -sS -o /dev/null -w "%{http_code}\n" \
  "https://api.dova.dntech.id/api/v1/products?limit=1"
```

Dengan kunci (ganti secret; jangan commit hasil):

```bash
curl -sS -H "X-Api-Key: $DOVA_INTEGRATION_KEY" \
  "https://api.dova.dntech.id/api/v1/products?limit=1"
```

Health (tanpa kunci, 200):

```bash
curl -sS "https://api.dova.dntech.id/api/v1/health"
```

Lokal: `DOVA_INTEGRATION_KEYS=storefront:dev-storefront-key` di `.env.example` backend; frontend `.env.dev` memakai `DOVA_INTEGRATION_KEY=dev-storefront-key`.

---

## 08 — Troubleshooting

| Gejala | Arti |
|--------|------|
| `401` + `INTEGRATION_REQUIRED` | Header `X-Api-Key` hilang / salah / env backend kosong |
| `401` tanpa kode itu, path cart/order | JWT hilang / expired |
| `403` | Role salah (bukan customer/supplier/admin yang diizinkan) |
| Storefront katalog 401 setelah deploy backend | Frontend belum `/api/gateway` atau `DOVA_INTEGRATION_KEY` tidak match `storefront:` |
| Chat timeout | `BOTPRESS_WEBHOOK_ID` kosong atau Botpress lambat (`BOTPRESS_REPLY_TIMEOUT_MS`) |

---

## 09 — File terkait

- [API Documention.md](./API%20Documention.md) — path REST
- [ENV-SETUP.md](./ENV-SETUP.md) — env VPS umum
- [vps-backend.env.example](./vps-backend.env.example) · [vps-frontend.env.example](./vps-frontend.env.example)
- Kode: `integration-key.guard.ts`, `chat.service.ts`, `pages/api/gateway/[...path].ts`

*Author: Dozer · 2026-09-09*
