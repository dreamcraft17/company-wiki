# dnPeople — Current Implementation Snapshot

**Date:** July 10, 2026  
**Repo:** `dnpeople`  
**Version:** 0.1.0 (MVP 1 scaffold)

---

## Apa yang sudah hidup di kode

### Backend (`dnpeople/backend`)

- Express 5 API di `/api/v1`
- Prisma schema multi-tenant (`companyId` scope)
- Routes: auth, companies, org, employees, attendance, leave, permissions, payroll, dashboard, reports, audit
- Services: attendance, leave, payroll, audit
- Payroll lib: BPJS Kesehatan, BPJS TK, PPh 21
- Seed: company demo + admin + 1 employee + leave balances

### Frontend (`dnpeople/frontend`)

| Route | Fungsi |
|-------|--------|
| `/login` | JWT login |
| `/dashboard` | Admin KPIs / employee self |
| `/employees` | List karyawan (admin) |
| `/attendance` | Clock in/out + riwayat |
| `/leave` | Ajukan / approve cuti |
| `/permissions` | Ajukan / approve izin |
| `/payroll` | Run / finalize / payslip view |

### Infra

- `docker-compose.yml` — Postgres 16 (`5433`), Redis 7 (`6380`)
- Typecheck backend & frontend: passing

## Belum / Partial

- Docker CLI belum tersedia di beberapa environment lokal — butuh Docker Desktop untuk `compose up`
- Geo-fence radius validation
- Payslip PDF, email, refresh token, Redis runtime
- Modul MVP 2–4 (lihat IMPLEMENTATION-STATUS)

## Cara sync docs

Saat mengubah docs di repo `dnpeople/docs/`, salin ke wiki:

```bash
cp dnpeople/docs/*.md company-wiki/docs/products/dnPeople/docs/
cp dnpeople/README.md company-wiki/docs/products/dnPeople/README.md
```

---

*Last Updated: July 10, 2026*
