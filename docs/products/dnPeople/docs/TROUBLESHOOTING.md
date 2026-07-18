# Troubleshooting Guide

**UpdatedAt:** 19 Juli 2026  

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

## Pembayaran gagal
Cek kredensial Xendit/Stripe; webhook URL; status invoice di `/billing`.
