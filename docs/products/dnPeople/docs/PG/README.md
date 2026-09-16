---
owner: Dozer
status: review-required
canonical: false
last_reviewed: 2026-09-16
review_cadence: annual
---

# Payment Gateway — Xendit · Midtrans · DOKU (admin-switchable)

**Status (16 Sep 2026):** Tiga gateway checkout tersedia sekaligus; **super-admin memilih gateway aktif** dari `/admin/payment-gateway` (feature flag `platform:active-payment-provider`). Default gateway sekarang **DOKU** (diubah dari Xendit di commit `33bedda` "Doku jadi default"). Ini memperbaiki catatan lama di dokumen ini yang bilang Midtrans "deprecated/disabled" — itu sudah tidak akurat sejak fitur admin-switch ditambahkan; webhook Midtrans (`/webhooks/midtrans`) **aktif ter-mount**, bukan disabled.

> **Perubahan precedence (commit `33bedda`):** env `PAYMENT_PROVIDER` sekarang **menang di atas** pilihan admin di DB (`platform:active-payment-provider` flag) — sebelumnya sebaliknya (DB flag menang atas env). Jika `PAYMENT_PROVIDER` di-set di environment server, admin **tidak bisa lagi override lewat UI** tanpa mengubah env var itu juga. Perlu dipastikan ini disengaja — kalau tidak, admin console switch bisa terasa "tidak nge-save" di production.

| Gateway | Library | Webhook | Metode | Status |
|---------|---------|---------|--------|--------|
| Xendit | `backend/src/lib/xendit.ts` | `/webhooks/xendit` | Invoice v2 hosted checkout | Default, live E2E conditional |
| Midtrans | `backend/src/lib/midtrans.ts` | `/webhooks/midtrans` | SNAP | Aktif (bukan legacy) |
| DOKU | `backend/src/lib/doku.ts` | `/webhooks/doku` | Checkout Non-SNAP, QRIS | Ditambahkan 16 Sep 2026 (commit `772eb28`, `29cf306`) |

Config: `paymentProviderConfig.ts` — `getActivePaymentProvider()` baca DB flag, fallback `PAYMENT_PROVIDER` env, default `xendit`. `providerConfigured()` menolak switch admin ke provider yang belum punya env key terisi.

**DOKU (baru):** Non-SNAP HMAC-SHA256 signature (`Client-Id`/`Request-Id`/`Request-Timestamp`/`Request-Target`/`Digest` → `Signature: HMACSHA256=...`), endpoint `POST /checkout/v1/payment`, default payment method `QRIS`. Env: `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY`, opsional `DOKU_IS_PRODUCTION`, `DOKU_NOTIFICATION_URL`, `DOKU_PAYMENT_METHOD_TYPES`. Diverifikasi terhadap dokumentasi resmi [developers.doku.com](https://developers.doku.com) — endpoint, signature scheme, dan enum `payment_method_types` sudah sesuai. **Gap diketahui:** belum ada unit test khusus untuk `doku.ts` (signature verification, checkout error path) — Xendit dan Midtrans sudah punya, DOKU belum.

Dokumen PRD/SRS/SDD Midtrans di folder ini tetap referensi historis untuk spesifikasi awal SNAP:

| Doc | Status |
|-----|--------|
| [dnpeople-prd-midtrans-payment-sandbox-v1.0-id.md](./dnpeople-prd-midtrans-payment-sandbox-v1.0-id.md) | Historical spec |
| [dnpeople-srs-midtrans-payment-sandbox-v1.0-id.md](./dnpeople-srs-midtrans-payment-sandbox-v1.0-id.md) | Historical spec |
| [dnpeople-sdd-midtrans-payment-sandbox-v1.0-id.md](./dnpeople-sdd-midtrans-payment-sandbox-v1.0-id.md) | Historical spec |
| [dnpeople-prd-midtrans-comprehensive-v2.0-id.md](./dnpeople-prd-midtrans-comprehensive-v2.0-id.md) | Historical spec (v2) |

Xendit setup: [xendit/XENDIT-PAYMENT-SETUP.md](../xendit/XENDIT-PAYMENT-SETUP.md).
