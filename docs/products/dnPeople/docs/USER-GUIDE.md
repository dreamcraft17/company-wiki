# dnPeople — Panduan Pengguna (User Guide)

**Versi:** 9.0 launch readiness  
**UpdatedAt:** 19 Juli 2026  
**Audience:** Karyawan, Manager, HR, Finance  

## 1. Memulai

1. Buka URL aplikasi perusahaan Anda.
2. Masuk dengan **email + password** (tanpa Company ID). Sistem menemukan tenant dari domain/history.
3. Jika MFA aktif, masukkan kode 6 digit dari authenticator.
4. Jika tenant memakai SSO, Anda akan diarahkan ke Google / Microsoft / SAML IdP.

**Lupa password:** di halaman login klik “Lupa password?” — tautan reset dikirim ke email (berlaku **1 jam**, sekali pakai).

## 2. Dashboard

Ringkasan sesuai role: headcount, absensi hari ini, approval tertunda, kontrak/probation, dan status payroll (Finance/Admin).

## 3. Karyawan (HR / Admin)

- `/employees` — cari, filter, tambah, ubah, soft-delete.
- Import Excel/CSV dari panel karyawan.
- Panel lifecycle: keluarga, pendidikan, kontak darurat, bank, pajak, kontrak/probation.

## 4. Absensi & Cuti

- `/attendance` — clock-in/out (manual/GPS/QR/selfie/WiFi); offline queue otomatis sync.
- Admin/HR: panel Excel import (template → dry-run → confirm).
- `/leave` — ajukan cuti, lihat saldo; `/permissions` untuk izin/WFH.
- `/approvals` — inbox approval terpadu (cuti, izin, lembur, koreksi, klaim, pinjaman).

## 5. Payroll & Slip Gaji

- Finance: `/payroll` — hitung batch, preview, finalize, tandai paid.
- Semua role: menu **Slip Gaji** → daftar slip milik sendiri; tombol Lihat Slip / unduh PDF.
- Admin dapat **Bagikan Link** slip (berlaku 24 jam).

## 6. Laporan

`/reports` — ringkasan headcount/payroll/turnover. Export bank/tax besar memakai **job async** (status update otomatis + unduh saat siap).

## 7. Keamanan akun

- `/settings/mfa` — aktifkan TOTP (QR code).
- Logout membersihkan sesi cookie + storage lokal.

## Bantuan

Lihat juga: [FAQ](./FAQ-KNOWLEDGE-BASE.md) · [Panduan Admin](./ADMIN-GUIDE.md) · API: `/api/v1/docs`
