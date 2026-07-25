# dnPeople — Panduan Pengguna (User Guide)

**Versi:** 14.0 tutorial & onboarding  
**UpdatedAt:** 25 Juli 2026  
**Audience:** Karyawan, Manager, HR, Finance  

## 1. Memulai

1. Buka URL aplikasi perusahaan Anda.
2. Masuk dengan **email + password** (tanpa Company ID). Sistem menemukan tenant dari domain/history.
3. Jika MFA aktif, masukkan kode 6 digit dari authenticator.
4. Jika tenant memakai SSO, Anda akan diarahkan ke Google / Microsoft / SAML IdP.
5. Klik ikon **?** di header (Help) → **Getting Started** untuk tutorial interaktif, atau **Knowledge Base** untuk artikel panduan.

**Lupa password:** di halaman login klik “Lupa password?” — tautan reset dikirim ke email (berlaku **1 jam**, sekali pakai).

## 2. Dashboard

**HR / Admin / Manager:** kartu KPI (aktif, cuti/izin menunggu, hadir bulan ini) plus diagram:
- Donut absensi bulan ini & hari ini
- Donut status karyawan
- Bar horizontal per departemen & lokasi
- Daftar kontrak ≤30 hari, ulang tahun mendatang, cuplikan payroll

**Karyawan:** absensi hari ini, cuti menunggu, donut saldo cuti, slip gaji terbaru.

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
- Tutorial payroll tersedia di Help jika paket STARTER+.

## 6. Laporan

`/reports` — ringkasan headcount/payroll/turnover. Export bank/tax besar memakai **job async** (status update otomatis + unduh saat siap).

## 7. Bantuan in-app (PRD v14.0)

| Halaman | Isi |
|---------|-----|
| `/help` | Ringkasan Getting Started / KB / Get Help |
| `/help/tutorials` | 5 tutorial interaktif + progress; badge lock jika tier belum cukup |
| `/help/kb` | Cari artikel knowledge base |
| `/help/kb/[slug]` | Detail artikel + vote helpful |

Tidak ada pustaka video di v14.0.

## 8. Keamanan akun

- `/settings/mfa` — aktifkan TOTP (QR code).
- Logout membersihkan sesi cookie + storage lokal.

## Bantuan

Lihat juga: [FAQ](./FAQ-KNOWLEDGE-BASE.md) · [Panduan Admin](./ADMIN-GUIDE.md) · API: `/api/v1/docs`
