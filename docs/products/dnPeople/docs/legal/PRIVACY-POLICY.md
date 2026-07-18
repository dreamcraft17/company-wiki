# Privacy Policy — dnPeople

**Effective:** 19 Juli 2026  
**Controller:** DN Tech (PT. Dozer Napitupulu Technology) — brand DnPeople  

## Data yang kami proses
Identitas karyawan, kontak, absensi, cuti, payroll/pajak (terenkripsi untuk field sensitif), dokumen HR, log audit.

## Tujuan
Menyediakan layanan HRIS, kepatuhan pajak/BPJS, keamanan akun, dukungan pelanggan.

## Dasar pemrosesan
Kontrak dengan perusahaan pelanggan; kepentingan sah operasional HR; kewajiban hukum.

## Retensi
Default **5 tahun** sejak berakhirnya hubungan kerja/kontrak pelanggan (atau lebih lama bila wajib hukum). Diatur `DATA_RETENTION_YEARS`.

## Hak subjek data
Akses/koreksi via HR; export via `GET /api/v1/privacy/export`; permintaan hapus via `/api/v1/privacy/deletion-request` + offboarding.

## Sub-processor
SMTP, object storage, Sentry, payment gateway, IdP — lihat `GET /api/v1/privacy/processors`.

## Keamanan
TLS, enkripsi field, RBAC, audit trail, MFA opsional.

## Kontak
privacy@dnpeople.id · support@dnpeople.id

Ini dokumen template produk; review counsel sebelum publikasi di dnpeople.id.
