# Troubleshooting Guide

**UpdatedAt:** 8 Agustus 2026  

## Can't login
1. Cek email/password; gunakan “Lupa password?” (token 1 jam).  
2. Jika MFA aktif, masukkan kode authenticator.  
3. Tenant SSO: ikuti redirect IdP.  
4. 423 Account locked — tunggu atau minta admin.

## Import Excel gagal
Template resmi, kode karyawan valid, dry-run dulu, file < 5MB, Idempotency-Key.

## Clock-in gagal
GPS dalam geofence; WiFi SSID cocok; selfie butuh provider biometric di production.

## Slip tidak muncul
Menu Slip Gaji; pastikan payroll FINALIZED; unduh perlu login.

## 429 Too Many Requests
Kuota tenant 10k/hari atau RPM; kurangi polling; naikkan quota di tenant-management.

## Laporan export lama
Pakai job async di `/reports` (bukan download sinkron besar).

## Pembayaran gagal / invoice tidak PAID

### Umum
1. Cek `XENDIT_SECRET_KEY` di backend — test mode pakai `xnd_development_…`
2. Cek email billing perusahaan valid (`400 BILLING_EMAIL_REQUIRED`)
3. Status invoice di `/billing` — refresh halaman setelah bayar (auto-sync)
4. Panduan setup: [xendit/XENDIT-PAYMENT-SETUP.md](./xendit/XENDIT-PAYMENT-SETUP.md)

### Webhook
- URL production/staging: `POST https://<domain>/api/v1/webhooks/xendit`
- Header `x-callback-token` harus match `XENDIT_WEBHOOK_TOKEN`
- Lokal: butuh ngrok/tunnel ke port backend `4100`

### Trial vs invoice
- Trial aktif + invoice **DRAFT** = normal — akses fitur dari trial, bukan dari invoice PAID
- Tombol **Bayar** disembunyikan selama trial aktif

### Link invoice publik
- `403 INVALID_SIGNED_URL` — token expired; minta link baru
- Path: `/payment/invoice/:id?token=…`

### Stripe (opsional)
Jika pakai Stripe adapter legacy, cek `STRIPE_SECRET_KEY` dan webhook Stripe terpisah.
