# Xendit Payment — Setup & Test Mode

**Updated:** 10 Agustus 2026  
**Status:** Implemented in repo (`commit 2776a08+`) — **sandbox verification Conditional** (butuh key test + 1× E2E bayar)

---

## Ringkasan

dnPeople memakai **Xendit Invoice API v2** (hosted checkout) sebagai payment gateway **primary**. Midtrans SNAP (`docs/PG/`) diganti — kode legacy Midtrans di-comment, tidak di-mount.

| Flow | UI | API |
|------|-----|-----|
| Bayar dari app (login) | `/billing` → filter **Perlu bayar** → **Bayar**; metode bayar tampil setelah lunas; **PDF** untuk export | `POST /api/v1/payments/initiate-payment` |
| Bayar link invoice publik | `/payment/invoice/:id?token=…` | `POST /api/v1/public/invoices/:id/pay` |
| Webhook Xendit | — | `POST /api/v1/webhooks/xendit` |
| Sync setelah redirect | query `?payment=success&order_id=` | `POST /api/v1/payments/sync` atau `POST /api/v1/public/invoices/:id/sync` |

Setelah **SETTLEMENT**: invoice → `PAID`, subscription → `ACTIVE`, email konfirmasi terkirim.

---

## Test mode vs live

Mode ditentukan **hanya dari secret key** — tidak ada flag `XENDIT_IS_PRODUCTION`.

| Key prefix | Mode |
|------------|------|
| `xnd_development_…` | **Test / sandbox** — uang tidak real |
| `xnd_production_…` | **Live** — uang real |

Dashboard Xendit: pastikan toggle **Test mode** aktif saat development.

---

## Environment (backend)

Tambahkan di `backend/.env`:

```env
# Xendit — test mode (development key)
XENDIT_SECRET_KEY=xnd_development_xxx
XENDIT_WEBHOOK_TOKEN=your-callback-verification-token
FRONTEND_URL=http://localhost:3001
```

| Variable | Wajib | Keterangan |
|----------|-------|------------|
| `XENDIT_SECRET_KEY` | Ya | Secret key dari Xendit Dashboard (Test atau Live) |
| `XENDIT_WEBHOOK_TOKEN` | Ya (prod) | Callback verification token — header `x-callback-token` |
| `FRONTEND_URL` | Ya | Base URL frontend untuk redirect sukses/gagal |
| `BILLING_BANK_INSTRUCTIONS` | Opsional | Fallback email manual jika Xendit down >1 jam |

Tanpa `XENDIT_SECRET_KEY`, endpoint bayar mengembalikan `503 BILLING_NOT_CONFIGURED`.

---

## Database migration

```bash
cd backend
npm run db:migrate   # includes 20260808100000_xendit_payment_fields
```

Field baru di model `Payment`: `paymentRequestId`, `checkoutUrl`, `paymentProvider` (default `xendit`).

---

## Webhook (disarankan)

1. Xendit Dashboard → **Developers → Webhooks** (mode Test)
2. URL: `https://<domain>/api/v1/webhooks/xendit`
3. Callback verification token = sama dengan `XENDIT_WEBHOOK_TOKEN`
4. Event: invoice paid / payment succeeded (Invoice v2)

**Lokal dev:** expose backend `:4100` via ngrok / Cloudflare Tunnel.

Jika webhook belum terpasang, status tetap bisa update lewat **sync** saat user kembali dari halaman Xendit (fallback built-in).

---

## Checklist test sandbox

- [ ] `XENDIT_SECRET_KEY` = development key
- [ ] Migration applied
- [ ] Perusahaan punya **email billing valid** (wajib sebelum checkout)
- [ ] Login → `/billing` → **Bayar** invoice → selesaikan di Xendit test
- [ ] Redirect kembali → banner sukses, invoice **PAID**
- [ ] (Opsional) Test link publik `/payment/invoice/…?token=…`
- [ ] (Opsional) Webhook delivery sukses di Xendit Dashboard

---

## Troubleshooting

| Gejala | Penyebab / solusi |
|--------|-------------------|
| `503 BILLING_NOT_CONFIGURED` | `XENDIT_SECRET_KEY` kosong |
| `400 BILLING_EMAIL_REQUIRED` | Isi email perusahaan / billing subscription |
| Bayar sukses di Xendit, invoice masih SENT | Webhook belum jalan — refresh `/billing` (sync otomatis) atau cek webhook URL |
| `403 INVALID_SIGNED_URL` (link publik) | Token expired — generate link baru dari admin/finance |
| Trial aktif, invoice DRAFT | Normal — akses fitur dari trial, bukan dari invoice PAID |

---

## Go live (nanti)

1. Ganti ke `xnd_production_…`
2. Webhook production URL terpisah di dashboard Live
3. Verifikasi akun Xendit (KYC) selesai
4. UAT 1× bayar real kecil + refund test

---

## Spesifikasi lengkap

| Doc | Path |
|-----|------|
| PRD | [dnpeople-prd-xendit-payment-v1.0-id.md](./dnpeople-prd-xendit-payment-v1.0-id.md) |
| SRS | [dnpeople-srs-xendit-payment-v1.0-id.md](./dnpeople-srs-xendit-payment-v1.0-id.md) |
| SDD | [dnpeople-sdd-xendit-payment-v1.0-id.md](./dnpeople-sdd-xendit-payment-v1.0-id.md) |
| API mapping | [xendit-api-mapping-dnpeople-analysis.md](./xendit-api-mapping-dnpeople-analysis.md) |
| Legacy Midtrans | [../PG/README.md](../PG/README.md) |

## Kode

| Area | Path |
|------|------|
| Xendit client | `backend/src/lib/xendit.ts` |
| Payment service | `backend/src/services/payment.service.ts` |
| Routes | `backend/src/routes/payments.ts`, `backend/src/routes/public.ts` |
| Frontend billing | `frontend/src/app/(app)/billing/page.tsx` — stat cards, tier picker, invoice filters (Semua/Perlu bayar/Lunas), trial preview toggle, **Bayar** + **PDF** actions, Xendit payment method column |
| Invoice PDF | `backend/src/lib/subscriptionInvoicePdf.ts` · `GET /subscription/invoices/:id.pdf` |
| Public pay | `frontend/src/app/payment/invoice/[invoiceId]/page.tsx` |
| Return sync | `frontend/src/lib/paymentReturn.ts` |
