# dnPeople — FAQ & Knowledge Base

**UpdatedAt:** 19 Juli 2026  

## Login

**Q: Saya tidak punya Company ID.**  
A: Tidak perlu. Masukkan email + password; sistem menemukan tenant dari domain terverifikasi atau riwayat akun.

**Q: Lupa password.**  
A: Klik “Lupa password?” di login. Cek email untuk tautan (1 jam). Jika email tidak masuk, cek spam atau minta admin reset di `/staff-accounts`.

**Q: MFA hilang / ganti HP.**  
A: Minta admin menonaktifkan MFA sementara, lalu setup ulang di `/settings/mfa`.

## Absensi

**Q: Import Excel gagal.**  
A: Gunakan template resmi, pastikan kode karyawan valid, tidak ada jam yang bentrok. Dry-run dulu. Header `Idempotency-Key` mencegah double import.

**Q: Offline clock tidak muncul.**  
A: Pastikan browser online lalu buka lagi `/attendance` — sync fill-empty tidak menimpa jam yang sudah ada.

## Payroll

**Q: Finalize error / double cicilan pinjaman.**  
A: Finalize bersifat atomik. Jika status sudah FINALIZED, request ulang mengembalikan sukses (idempotent).

**Q: Slip tidak bisa diunduh.**  
A: Unduhan membutuhkan login. Link “Bagikan Link” hanya berlaku 24 jam.

## Billing

**Q: Bagaimana bayar invoice?**  
A: `/billing` → tombol Xendit/Stripe/Manual pada invoice DRAFT/SENT/OVERDUE.

**Q: Berapa harga dnPeople?**  
A: Starter ~Rp20.000/karyawan/bulan; Professional ~Rp25.000; Business/Enterprise sesuai paket — lihat `/billing` atau sales@dnpeople.id.

**Q: Bisa ganti paket?**  
A: Ya, upgrade/cancel/reactivate di `/billing`.

## Karyawan & organisasi

**Q: Bagaimana menambah karyawan?**  
A: `/employees` → tambah manual atau import Excel/CSV.

**Q: Bagaimana ubah struktur departemen?**  
A: `/org` (Admin/HR).

## Cuti

**Q: Bagaimana ajukan cuti?**  
A: `/leave` → pilih jenis, tanggal, alasan → submit ke approval.

**Q: Saldo cuti dari mana?**  
A: Leave balance per tahun; carry-forward sesuai policy company.

## Compliance

**Q: Apa itu PPh 21 / BPJS?**  
A: Pajak penghasilan karyawan dan jaminan sosial — dihitung otomatis di payroll (lihat `docs/COMPLIANCE.md`).

**Q: Data apa yang disimpan?**  
A: Data HR operasional; field sensitif dienkripsi. Privacy: `docs/legal/PRIVACY-POLICY.md`. Export: `GET /api/v1/privacy/export`.

## Support

**Q: Bagaimana hubungi support?**  
A: support@dnpeople.id — SLA di `docs/SLA-SUPPORT-POLICY.md` (target respons < 24 jam bisnis).

**Q: Bagaimana data dilindungi?**  
A: RBAC, enkripsi, audit, MFA, file ber-auth — lihat `docs/SECURITY.md`.

## API

**Q: Di mana dokumentasi API?**  
A: Swagger UI `/api/v1/docs` · OpenAPI JSON `/api/v1/openapi.json` · Markdown `docs/API.md`.

**Q: 429 Too Many Requests.**  
A: Global 200 req/menit atau kuota tenant (RPM / 10k per hari). Naikkan kuota di tenant management atau kurangi polling.

## Troubleshooting cepat

| Gejala | Cek |
|--------|-----|
| 401 | Cookie/session expired — login ulang |
| 403 | Role/permission atau API key scope |
| 423 | Akun terkunci — tunggu atau admin unlock |
| Import 5MB+ | Perkecil file atau pecah batch |

Lihat juga: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
