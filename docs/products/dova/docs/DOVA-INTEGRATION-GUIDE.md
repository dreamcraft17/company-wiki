# DOVA — Panduan Integrasi (Masuk / Keluar)

> **Status:** Active · **Last updated:** 2026-09-09 · **Author:** Dozer  
> **Audience:** partner (Botpress / aplikasi resmi) dan ops VPS  
> **App commit:** `21eb77d` pada `main` (`dreamcraft17/dova`)  
> **Kontrak HTTP:** [API Documention.md](./API%20Documention.md) · OpenAPI `GET /api/v1/openapi.json` (partner: butuh `X-Api-Key`)

Dokumen ini menjelaskan **siapa yang boleh memanggil API**, **arah trafik**, dan **cara minta kunci**. Bukan daftar lengkap endpoint (itu ada di integrator guide).

**Production live:** kunci katalog **baru aktif setelah VPS di-deploy** dengan `DOVA_INTEGRATION_KEYS`. Tanpa env itu, katalog masih bisa di-GET tanpa `X-Api-Key`.

---

## 01 — Ringkasan arah

```
MASUK ke DOVA
  Pelanggan / supplier di storefront
    -> https://dova.dntech.id (browser)
    -> Origin storefront; login/cart/produk supplier = JWT saja
    -> GET katalog dari browser diizinkan lewat Origin (bukan X-Api-Key)

  Partner / bot (luar)
    -> HTTPS https://api.dova.dntech.id/api/v1/products (dll.)
    -> header X-Api-Key (katalog + OpenAPI)
    -> cart/order: JWT user (tanpa X-Api-Key)

  Paystack
    -> POST /api/v1/payments/webhook
    -> HMAC x-paystack-signature

KELUAR dari DOVA
  Nest ChatService -> Botpress (teks saja; JWT tidak dikirim)
  Nest PaystackService -> API Paystack
```

Tidak ada webhook Nest yang menerima event dari Botpress. Integrasi AI resmi = HTTP tool Botpress ke REST Chain + `X-Api-Key` yang Dozer terbitkan **untuk baca katalog**.

---

## 02 — Apa yang tertutup vs terbuka

| Rute | Auth |
|------|------|
| Login, register, OTP, logout, refresh | Publik (rate-limit). **Tidak** butuh `X-Api-Key` |
| Cart, order, payment init/verify, `/auth/me` | JWT role `customer` |
| Supplier produk / stok / order | JWT role `supplier` (approved) |
| `GET /categories`, `/products`, `/products/:id`, `/openapi.json` | Partner: `X-Api-Key`. Storefront: `Origin`/`Referer` = `FRONTEND_URL` / `CORS_ORIGINS` |
| `GET /health` | Tidak ada kunci (liveness) |
| `POST /payments/webhook` | Signature Paystack |
| `/uploads/...` | File statis |

`@Public()` di Nest artinya **skip JWT**. `@RequireIntegration()` artinya kunci partner **hanya** di rute katalog/OpenAPI. Login dan cart **tidak** memakai decorator itu.

Kode: `apps/backend/src/integration-key.guard.ts`.

---

## 03 — Minta akses resmi (partner)

1. Kirim ke Dozer: nama klien (contoh `botpress`), environment (prod/local), IP/asal kalau ada.
2. Dozer menambah baris di **backend** `DOVA_INTEGRATION_KEYS` (format `nama:secret`, koma jika banyak). Contoh pola (bukan secret asli):

   ```
   DOVA_INTEGRATION_KEYS=botpress:...
   ```

3. Partner **hanya** menerima secret miliknya.
4. Baca katalog:

   ```http
   GET /api/v1/products?search=rice HTTP/1.1
   Host: api.dova.dntech.id
   X-Api-Key: <secret partner>
   ```

5. Belanja atas nama user: login/register **tanpa** `X-Api-Key`, simpan `accessToken`, lalu JWT di cart/order. Partner tidak perlu kunci untuk cart.

JWT access ~15 menit; refresh `POST /api/v1/auth/refresh`. Detail path: [API Documention.md](./API%20Documention.md).

Cabut akses: hapus pasangan `nama:secret` itu dari env, restart backend.

---

## 04 — Storefront

Browser pelanggan **tidak** perlu `X-Api-Key`. Cukup origin situs (`FRONTEND_URL` di backend, misalnya `https://dova.dntech.id`).

Gateway `/api/gateway` **opsional** (bisa tetap dipakai). Jangan taruh kunci di `NEXT_PUBLIC_*`.

---

## 05 — Chat AI (keluar ke Botpress)

| Env backend | Fungsi |
|-------------|--------|
| `BOTPRESS_WEBHOOK_ID` | ID Chat API Botpress Cloud |
| `BOTPRESS_CHAT_API_URL` | Default `https://chat.botpress.cloud` |
| `BOTPRESS_REPLY_TIMEOUT_MS` | Default `20000` |

Alur: user login di DOVA → `POST /api/v1/chat/messages` (JWT) → Nest forward teks ke Botpress. Tanpa `BOTPRESS_WEBHOOK_ID`, assistant “not configured”.

Agar bot **membaca katalog**, tool HTTP di Botpress ke `api.dova.dntech.id` dengan **kunci partner**.

---

## 06 — Pembayaran (keluar ke Paystack, masuk webhook)

Keluar: `POST /payments/initialize` (JWT customer).

Masuk: dashboard Paystack webhook:

```
POST https://api.dova.dntech.id/api/v1/payments/webhook
```

Event: `charge.success`. Header `x-paystack-signature`. Secret: `PAYSTACK_SECRET_KEY` di backend. **Jangan** pakai `X-Api-Key` di webhook Paystack.

AI **tidak** boleh mengklaim bayar sukses tanpa `GET /payments/verify` (JWT).

---

## 07 — Cek cepat

Tanpa kunci, **bukan** dari Origin storefront (harus 401 setelah deploy + `DOVA_INTEGRATION_KEYS` terisi):

```bash
curl -sS -o /dev/null -w "%{http_code}\n" \
  "https://api.dova.dntech.id/api/v1/products?limit=1"
```

Login tanpa kunci (harus bukan `INTEGRATION_REQUIRED`):

```bash
curl -sS -o /dev/null -w "%{http_code}\n" \
  -H "Content-Type: application/json" \
  -d '{"email":"x@y.z","password":"nope"}' \
  "https://api.dova.dntech.id/api/v1/auth/login"
```

Dengan kunci partner:

```bash
curl -sS -H "X-Api-Key: $DOVA_INTEGRATION_KEY" \
  "https://api.dova.dntech.id/api/v1/products?limit=1"
```

Health (tanpa kunci, 200):

```bash
curl -sS "https://api.dova.dntech.id/api/v1/health"
```

---

## 08 — Troubleshooting

| Gejala | Arti |
|--------|------|
| `401` + `INTEGRATION_REQUIRED` pada `/products` dari curl/bot | `X-Api-Key` hilang/salah, atau env backend belum diisi |
| Toast login `Integration is not configured` | Build lama (kunci global). Deploy `21eb77d`+ |
| `401` tanpa kode itu, path cart/order | JWT hilang / expired |
| `403` | Role salah |
| Katalog storefront 401 | `FRONTEND_URL` / `CORS_ORIGINS` tidak match Origin halaman |
| Chat timeout | `BOTPRESS_WEBHOOK_ID` kosong atau Botpress lambat |

---

## 09 — File terkait

- [API Documention.md](./API%20Documention.md) — path REST
- [DOVA-INTEGRATION-QA.md](./DOVA-INTEGRATION-QA.md) — checklist QA (storefront + curl)
- [ENV-SETUP.md](./ENV-SETUP.md) — env VPS umum
- [vps-backend.env.example](./vps-backend.env.example) · [vps-frontend.env.example](./vps-frontend.env.example)
- Kode: `integration-key.guard.ts`, `chat.service.ts`

*Author: Dozer · 2026-09-09*
