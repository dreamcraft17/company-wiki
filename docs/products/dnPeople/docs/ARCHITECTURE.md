# dnPeople — Architecture

**Version:** 1.0  
**Last Updated:** July 10, 2026  
**Referensi:** SDD v3.0 §1–§5

---

## High-Level

```
┌─────────────┐     JWT      ┌─────────────┐     Prisma     ┌────────────┐
│  Next.js    │ ───────────► │  Express    │ ─────────────► │ PostgreSQL │
│  :3001      │ ◄─────────── │  API :4100  │                │  :5433     │
└─────────────┘   JSON/REST  └─────────────┘                └────────────┘
                                    │
                                    │ (MVP 2+)
                                    ▼
                              ┌──────────┐
                              │  Redis   │
                              │  :6380   │
                              └──────────┘
```

## Multi-Tenancy

Setiap request authenticated membawa `companyId` di JWT. Semua query data bisnis di-scope ke `companyId` (company isolation). Soft-delete via `deletedAt` pada entity kritis (company, user, employee).

## Auth Flow

1. `POST /auth/login` → validasi password (bcrypt) → JWT (`sub`, `email`, `role`, `companyId`)
2. Client menyimpan token di `localStorage` (`dnpeople_token`)
3. Middleware `authenticate` verifikasi Bearer token + load user + employeeId
4. `requirePermission` / `requireRole` enforce RBAC
5. Account lockout setelah 5 failed login (30 menit)

## Domain Modules (MVP 1)

| Module | Responsibility |
|--------|----------------|
| Auth | Login, register company, `/me` |
| Companies | Company profile & work hours |
| Org | Departments, positions, levels, work locations |
| Employees | Master data karyawan + tax info |
| Attendance | Clock in/out, status LATE/PRESENT, summary |
| Leave | Types, balances, request + approve/reject |
| Permissions | WFH / late / early leave / trip |
| Payroll | Batch run, BPJS, PPh 21, finalize, payslip record |
| Dashboard | Admin KPIs / employee self summary |
| Reports | Headcount, attendance, payroll summary |
| Audit | Append-only activity log |

## Payroll Engine

Lokasi: `backend/src/lib/payroll.ts` + `services/payroll.service.ts`

```
gross = baseSalary + salary components (earnings)
bpjsKesehatan = min(gross, 12jt) × 1%
bpjsTK = JHT 2% + JP 1% (capped)
taxable = gross − bpjs
pph21 = progressive annual brackets ÷ 12 (after monthly PTKP)
net = gross − bpjs − pph21
```

## Frontend Architecture

- App Router (`src/app`)
- Route group `(app)` dengan `AppShell` (sidebar + auth gate)
- API client thin wrapper (`lib/api.ts`) — no server actions for MVP 1
- Role-aware UI: admin melihat approval & payroll run; employee self-service

## Security (MVP 1)

- Helmet, CORS allowlist, rate limit API & login
- Password hashed bcrypt (cost 12)
- Zod validation on write endpoints
- RBAC permission matrix di `utils/auth.ts`

## Planned (MVP 2+)

- Redis session / cache
- Refresh token rotation
- File storage (S3/MinIO) untuk dokumen & payslip PDF
- Email notifications
- WebSocket approval notifications

---

*Last Updated: July 10, 2026*
