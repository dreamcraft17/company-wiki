# Status Implementasi vs PRD / SRS / SDD

> **Author:** Dozer  
> **Date:** 2026-10-18

## FR (SRS §3)

| ID | Status | Lokasi |
|----|--------|--------|
| FR-01 Autentikasi (register, OTP, lockout, S&K) | ✅ | `AuthController`, `OtpService`, `BusinessRules` |
| FR-02 Profil pengguna | ✅ | `ProfileController`, `web/src/pages/ProfilePage.tsx` |
| FR-03 Pendaftaran & verifikasi mitra | ✅ | `PartnersController`, `AdminController`, enkripsi dokumen |
| FR-04 Pencarian mitra | ✅ | `PartnersController` GET, `BrowseListPage` (grid v3) |
| FR-05 Booking | ✅ | `BookingsController`, validasi lokasi (min. 3 karakter) |
| FR-06 Pembayaran (held, fee, release) | ✅ mock DOKU | `PaymentsController`, `PacaRentBackgroundService`, admin release |
| FR-07 Selesai & pembatalan | ✅ | `BookingsController`, kebijakan refund |
| FR-08 Ulasan | ✅ | `ReviewsController`, `BookingsPage` |
| FR-09 Pelaporan & moderasi | ✅ | `ReportsController`, `AdminController` |
| FR-10 Panel admin | ✅ | `AdminController`, `AdminPage.tsx` |
| FR-11 Notifikasi | ✅ | `NotificationService`, email mock + in-app API |
| FR-12 Membership (Plus/Pro/Pendamping Pro) | ✅ mock | `SubscriptionsController`, `/membership`, migrasi `AddMembershipSubscriptions` |

## NFR

| ID | Status | Catatan |
|----|--------|---------|
| NFR-01 Keamanan | ✅ | JWT, BCrypt, rate limit auth, enkripsi dokumen, webhook signature hook |
| NFR-02 UU PDP | ✅ partial | Export data `GET /api/profile/export`, penghapusan `DELETE /api/profile` |
| NFR-03 Kinerja | ⚙️ | Target angka TBD di SRS |
| NFR-04 Skalabilitas | ✅ | Kategori/kota via DB |
| NFR-05 Backup | 📋 | Prosedur di SDD; skrip backup di VPS (manual) |
| NFR-06 Kegunaan | ✅ | UI ID, responsif CSS |
| NFR-07 Audit | ✅ | `AuditLog`, admin view |

## SDD

| Bagian | Status |
|--------|--------|
| Stack .NET 8 + React + PostgreSQL + Nginx + systemd | ✅ |
| Model data §7 | ✅ EF entities + migration `InitialCreate` |
| API §9 | ✅ semua endpoint utama |
| Background job §8.1 | ✅ auto-cancel, in_progress, release setelah claim |
| Deploy §13 | ✅ `deploy/` + `docker-compose.yml` untuk Postgres |

## PRD non-goals

Mobile native, chat media, recurring billing DOKU live, kategori fase 2 — belum / partial. **Membership UI + tier gating** (cap booking gratis, Pro prioritas, Pendamping Pro boost) — shipped 2026-10-17 (mock checkout).

## Produksi (checklist)

- [ ] Konfirmasi DOKU kategori bisnis + escrow/disbursement
- [ ] Isi `/etc/pacarrent/api.env` (secret JWT, encryption key)
- [ ] OTP SMS/WA + SMTP transaksional
- [ ] TLS (Certbot) + domain di `deploy/nginx/pacarrent.conf`
- [ ] Konsultasi hukum sebelum launch publik
