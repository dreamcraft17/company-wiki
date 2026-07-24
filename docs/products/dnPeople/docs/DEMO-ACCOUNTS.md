# dnPeople — Akun Demo (Seed)

**Tier:** `PROFESSIONAL` (bukan Enterprise)  
**Domain tenant:** `demo.dnpeople.id`  
**Password semua akun:** `Demo123!`  
**Perusahaan:** DN People Demo (PT DN People Indonesia)

> **Public sandbox:** kredensial demo **ditampilkan** di `/login`, `/demo`, dan `/welcome` supaya pengunjung bisa mencoba. Set `NEXT_PUBLIC_SHOW_DEMO_CREDS=false` hanya jika perlu disembunyikan.

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

## Fitur tier Professional

Termasuk: core HR, absensi lanjutan, payroll lanjutan, shift/OT, klaim, pinjaman, rekrutmen, onboarding, performance, training, competency/IDP/LMS, laporan lanjutan, surveys, helpdesk, webhooks.

**Tidak termasuk** (Business/Enterprise): SSO, white-label custom domain, multi-company platform, custom reports builder, API keys, SCIM, advanced workflows.

## Tips

- Login di `/login` — tenant auto-discover dari domain email `@demo.dnpeople.id`.
- Akun **Budi** punya payslip finalized + data operasional paling lengkap untuk uji employee self-service.
- Akun **Dina** (COMPANY_ADMIN) untuk uji admin/settings; bukan username `admin`.
- Soft launch: lihat [RELEASE-READY.md](./RELEASE-READY.md).

*Updated: July 24, 2026*
