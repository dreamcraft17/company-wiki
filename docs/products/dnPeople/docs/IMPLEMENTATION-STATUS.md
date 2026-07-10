# dnPeople — Implementation Status

> Terakhir diperbarui: **10 Juli 2026**  
> Referensi: PRD/SRS/SDD v3.0 di [../PRD/](../PRD/)  
> Source of truth kode: repo `dnpeople/docs/IMPLEMENTATION-STATUS.md`

## Ringkasan

| MVP | Target | Status |
|-----|--------|--------|
| MVP 1 (Q3 2026) | Employee DB, org, attendance, leave, payroll, dashboard, RBAC, audit | **Implemented (core)** |
| MVP 2 | Recruitment, onboarding, performance, training | Not started |
| MVP 3 | Asset, expense, document management | Not started |
| MVP 4 | Analytics, integrations, mobile app | Not started |

**Typecheck:** Backend ✅ · Frontend ✅ (Juli 10, 2026)

## MVP 1 — Modul

### Auth & Security

| Fitur | Status | Catatan |
|-------|--------|---------|
| JWT login/logout | Done | |
| Register perusahaan + admin | Done | |
| RBAC 5 role | Done | SUPER_ADMIN, COMPANY_ADMIN, MANAGER, FINANCE, EMPLOYEE |
| Account lockout | Done | 5 failed attempts → 30 menit |
| Refresh token rotation | Planned | MVP 2 |
| 2FA | Planned | MVP 2 |
| Password reset email | Planned | MVP 2 |

### Employee Management

| Fitur | Status | Catatan |
|-------|--------|---------|
| CRUD karyawan | Done | API + list UI |
| Kontak darurat | Done | Schema + include API |
| Rekening bank | Done | Schema |
| Info pajak (NPWP, PTKP, BPJS) | Done | |
| Upload dokumen | Schema only | Upload endpoint MVP 2 |
| Import CSV | Planned | MVP 2 |

### Organization

| Fitur | Status | Catatan |
|-------|--------|---------|
| Departemen hierarki | Done | |
| Posisi & level | Done | |
| Lokasi kerja + geo | Done | Schema + API |
| Org chart visual | Planned | MVP 2 |

### Attendance

| Fitur | Status | Catatan |
|-------|--------|---------|
| Clock in/out | Done | UI + API |
| Status terlambat | Done | Berdasarkan `workStartTime` perusahaan |
| Riwayat & summary | Done | |
| Geo-fencing validasi | Partial | Koordinat disimpan, validasi radius belum |
| Shift & jadwal | Planned | MVP 2 |

### Leave & Permissions

| Fitur | Status | Catatan |
|-------|--------|---------|
| Jenis cuti | Done | Seed: annual, sick, maternity |
| Saldo cuti | Done | |
| Pengajuan & approval | Done | UI + API |
| Izin (WFH, dll) | Done | |
| Kalender libur nasional | Planned | MVP 2 |

### Payroll

| Fitur | Status | Catatan |
|-------|--------|---------|
| Run payroll batch | Done | |
| BPJS Kesehatan & Ketenagakerjaan | Done | Tarif standar Indonesia |
| PPh 21 progresif | Done | PTKP + bracket |
| Finalisasi & payslip record | Done | PDF generation MVP 2 |
| THR, lembur, pinjaman | Planned | MVP 2 |
| e-Bupot / DJP | Planned | MVP 4 |

### Dashboard & Reports

| Fitur | Status | Catatan |
|-------|--------|---------|
| HR dashboard (admin) | Done | |
| Employee self dashboard | Done | |
| Headcount by dept | Done | API |
| Attendance report | Done | API |
| Payroll summary | Done | API |
| Export Excel/PDF | Planned | MVP 2 |

### Audit

| Fitur | Status | Catatan |
|-------|--------|---------|
| Audit log table | Done | |
| Log on company create / employee create | Done | |
| Full entity audit coverage | Partial | Perlu diperluas ke semua mutasi |

## File Docs di Repo

| File | Isi |
|------|-----|
| [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) | Ringkasan produk & struktur |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arsitektur sistem |
| [API.md](./API.md) | Referensi endpoint MVP 1 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Local & production setup |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat versi |
| [../README.md](../README.md) | Quick start |

## Belum Diimplementasi (dari SDD penuh)

- ~60 modul tambahan (recruitment, performance, assets, dll)
- Redis session/cache layer
- WebSocket notifikasi real-time
- Multi-company super admin portal
- File storage (S3/MinIO)
- Email notifications
- Unit & integration tests
- CI/CD pipeline

## Cara Verifikasi

```bash
curl http://localhost:4100/health

curl -X POST http://localhost:4100/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@dnpeople.id","password":"Admin123!"}'
```

---

*Last Updated: July 10, 2026*
