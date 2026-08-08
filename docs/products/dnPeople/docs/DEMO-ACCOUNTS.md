# dnPeople — Akun Demo (Seed)

**Tier:** `FREE` (nav menampilkan hanya fitur FREE — honest demo)  
**Domain tenant:** `demo.dnpeople.id`  
**Password semua akun:** `Demo123!`  
**Perusahaan:** DN People Demo (PT DN People Indonesia)

> **Public sandbox:** kredensial demo **ditampilkan** di `/login`, `/demo`, dan `/welcome` supaya pengunjung bisa mencoba. Set `NEXT_PUBLIC_SHOW_DEMO_CREDS=false` hanya jika perlu disembunyikan.
>
> Seed tetap boleh berisi data sample payroll/rekrutmen untuk uji API, tetapi **UI & API tier gate** menyembunyikan modul berbayar sampai upgrade.

Jalankan seed:

```bash
cd backend
npm run db:seed
```

## Akun login

| Role | Email | Nama |
|------|-------|------|
| COMPANY_ADMIN | `dina.wijaya@demo.dnpeople.id` | Dina Wijaya |
| HR | `maya.putri@demo.dnpeople.id` | Maya Putri |
| MANAGER | `raka.pratama@demo.dnpeople.id` | Raka Pratama |
| FINANCE | `sinta.wijaya@demo.dnpeople.id` | Sinta Wijaya |
| EMPLOYEE | `budi.santoso@demo.dnpeople.id` | Budi Santoso |
| EMPLOYEE | `nina.aulia@demo.dnpeople.id` | Nina Aulia |
| EMPLOYEE | `rio.mahendra@demo.dnpeople.id` | Rio Mahendra |
| EMPLOYEE | `dewi.lestari@demo.dnpeople.id` | Dewi Lestari |

## Akun operator DN Tech (bukan demo)

Akun `SUPER_ADMIN` untuk Admin Console `/admin` **terpisah** dari sandbox ini dan tidak ditampilkan di UI: tenant **DN Tech**, email `dozer@dntech.id`, password dari `SUPER_ADMIN_PASSWORD` (dev fallback `Admin123!`). Detail: [ADMIN-GUIDE.md](./ADMIN-GUIDE.md) §2.

## Yang terlihat di nav (FREE)

Termasuk: dashboard, karyawan, organisasi, dokumen, kebijakan, pengumuman, kalender, helpdesk, MFA, paket & billing.

**Tidak di-render di nav** (perlu upgrade): payroll, absensi, cuti, shift, rekrutmen, performance, training, talent matrix, IDP, LMS, integrasi, SSO, dll. Akses URL langsung → halaman `/upgrade`.

## Tips

- Login di `/login` — tenant auto-discover dari domain email `@demo.dnpeople.id`.
- Akun **Dina** (COMPANY_ADMIN) untuk uji billing/upgrade & admin FREE.
- Upgrade tier di `/billing` atau `/upgrade` untuk membuka modul berbayar di lingkungan non-demo / setelah ubah subscription.

## Referensi

- [FEATURE-CATALOG.md](./FEATURE-CATALOG.md)
- [README.md](../README.md)
