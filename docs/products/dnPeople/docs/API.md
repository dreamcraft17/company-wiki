# dnPeople — API Reference (MVP 1)

**Base URL (dev):** `http://localhost:4100/api/v1`  
**Auth:** `Authorization: Bearer <access_token>`  
**Response shape:** `{ success, data, pagination?, error?, timestamp }`

---

## Auth

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/auth/login` | — | Login (email, password, optional companyId) |
| POST | `/auth/register` | — | Register perusahaan + COMPANY_ADMIN |
| POST | `/auth/logout` | ✓ | Logout (client-side token clear) |
| GET | `/auth/me` | ✓ | Profil user + employee + company |

### Login body

```json
{ "email": "admin@dnpeople.id", "password": "Admin123!" }
```

### Register body

```json
{
  "companyName": "PT Contoh",
  "adminEmail": "hr@contoh.id",
  "adminPassword": "SecurePass1",
  "adminFirstName": "Siti",
  "adminLastName": "Aminah"
}
```

---

## Companies

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET | `/companies` | settings:view | Detail perusahaan |
| PATCH | `/companies` | settings:* | Update profil & jam kerja |

---

## Organization

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET | `/org/departments` | org:view | List departemen |
| POST | `/org/departments` | org:* | Buat departemen |
| PATCH | `/org/departments/:id` | org:* | Update |
| GET | `/org/positions` | org:view | List posisi |
| POST | `/org/positions` | org:* | Buat posisi |
| GET | `/org/levels` | org:view | List level |
| POST | `/org/levels` | org:* | Buat level |
| GET | `/org/work-locations` | org:view | List lokasi |
| POST | `/org/work-locations` | org:* | Buat lokasi |
| GET | `/org/tree` | org:view | Tree dept + employees |

---

## Employees

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET | `/employees` | employees:view | List (search, dept, status, pagination) |
| GET | `/employees/:id` | employees:view | Detail (+ contacts, bank, tax) |
| POST | `/employees` | employees:* | Create (+ optional user account) |
| PATCH | `/employees/:id` | employees:* | Update |
| DELETE | `/employees/:id` | employees:* | Soft-delete (RESIGNED) |

Query: `?search=&departmentId=&status=&page=&pageSize=`

---

## Attendance

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| POST | `/attendance/clock-in` | attendance:self | Clock in |
| POST | `/attendance/clock-out` | attendance:self | Clock out |
| GET | `/attendance/today` | attendance:self | Record hari ini |
| GET | `/attendance` | attendance:view / self | List riwayat |
| GET | `/attendance/summary` | attendance:view | Ringkasan bulanan |
| GET | `/attendance/employee/:id` | attendance:view | Per karyawan |

Clock-in body (optional): `{ latitude, longitude, location, workMode }`

---

## Leave

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET | `/leave/types` | ✓ | Jenis cuti aktif |
| GET | `/leave/balances` | ✓ | Saldo cuti (`?employeeId=&year=`) |
| GET | `/leave` | leave:view / self | List pengajuan |
| POST | `/leave` | leave:self | Ajukan cuti |
| POST | `/leave/:id/approve` | leave:approve | Setujui |
| POST | `/leave/:id/reject` | leave:approve | Tolak |

---

## Permissions (Izin)

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET | `/permissions` | permissions:view / self | List |
| POST | `/permissions` | permissions:self | Ajukan |
| POST | `/permissions/:id/approve` | permissions:approve | Setujui |
| POST | `/permissions/:id/reject` | permissions:approve | Tolak |

Types: `LATE_ARRIVAL`, `EARLY_LEAVE`, `WFH`, `BUSINESS_TRIP`, `OTHER`

---

## Payroll

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET | `/payroll` | payroll:view | List payroll |
| GET | `/payroll/my` | payslips:self | Slip milik sendiri |
| GET | `/payroll/:id` | payroll:view | Detail + items |
| POST | `/payroll/run` | payroll:* | Batch hitung `{ year, month }` |
| POST | `/payroll/:id/finalize` | payroll:* | Finalisasi + buat payslip |
| POST | `/payroll/:id/pay` | payroll:* | Tandai PAID |

---

## Dashboard & Reports

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET | `/dashboard` | ✓ | Admin KPIs atau employee self |
| GET | `/reports/headcount` | reports:view | Headcount per dept |
| GET | `/reports/attendance` | reports:view | Group by status |
| GET | `/reports/payroll-summary` | reports:view | Aggregat payroll |

---

## Audit

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET | `/audit` | audit:view | Log aktivitas (paginated) |

---

## Health

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/health` | `{ status, service, timestamp }` (di root, bukan `/api/v1`) |

---

## Error Codes (umum)

| Code | HTTP | Arti |
|------|------|------|
| VALIDATION_ERROR | 400 | Zod failed |
| UNAUTHORIZED | 401 | Token invalid / missing |
| INVALID_CREDENTIALS | 401 | Login gagal |
| FORBIDDEN | 403 | RBAC deny |
| NOT_FOUND | 404 | Resource hilang |
| DUPLICATE_ERROR | 409 | Unique constraint |
| ACCOUNT_LOCKED | 423 | Terlalu banyak gagal login |
| RATE_LIMIT | 429 | Too many requests |

---

*Last Updated: July 10, 2026*
