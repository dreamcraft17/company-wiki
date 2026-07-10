# dnPeople Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/).

---

## [0.1.0] — 2026-07-10

### Added — MVP 1 scaffold

- Monorepo `backend/` + `frontend/` + `docker-compose.yml`
- Prisma schema: company, user, employee, org, attendance, leave, permissions, payroll, audit
- JWT auth, register company, RBAC 5 roles, account lockout
- API modules: employees, org, attendance, leave, permissions, payroll, dashboard, reports, audit
- Payroll Indonesia: BPJS Kesehatan, BPJS Ketenagakerjaan, PPh 21 (PTKP + progressive)
- Frontend: login, dashboard (admin/employee), karyawan, absensi, cuti, izin, payroll
- Seed demo: `admin@dnpeople.id` / `budi@dnpeople.id`
- Docs: PROJECT-OVERVIEW, ARCHITECTURE, API, DEPLOYMENT, IMPLEMENTATION-STATUS

### Notes

- Redis container reserved; belum dipakai di runtime MVP 1
- Geo-fencing radius validation, payslip PDF, email, refresh token → MVP 2+
- Bukan fork dari `ERP/` (DN People ERP NestJS)

---

## Unreleased

- Recruitment, onboarding, performance (MVP 2)
- Document upload & CSV import
- Payslip PDF generation
- National holiday calendar
- Unit / integration tests
- CI/CD pipeline

---

*Last Updated: July 10, 2026*
