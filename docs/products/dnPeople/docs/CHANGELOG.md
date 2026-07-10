# dnPeople Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/).

---

## [0.2.0] — 2026-07-10

### Added — MVP 2 Extended Operations

- Shift management & employee assignment
- Overtime (rate 1.5x/2x/3x) + payroll integration
- Reimbursement/claims + loan (kasbon) with payroll deduction
- Geofence attendance validation + check-in methods
- Attendance correction workflow
- Company documents + contract expiry reminders
- Announcements, surveys API, HR calendar, holidays
- Unified approval inbox + approval rules
- Advanced reports: turnover, overtime by dept, leave usage
- Frontend pages for all MVP 2 modules above

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

- Redis container reserved; belum dipakai di runtime
- Bukan fork dari `ERP/` (DN People ERP NestJS)

---

## Unreleased

- Survey dedicated UI page
- Binary file upload (S3/MinIO)
- QR/selfie camera capture UI
- Payslip PDF + email notifications
- Recruitment / onboarding / performance (MVP 3)
- Unit / integration tests + CI/CD

---

*Last Updated: July 10, 2026*
