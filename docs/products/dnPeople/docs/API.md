# dnPeople — API Reference

**Base URL (dev):** `http://localhost:4100/api/v1`  
**Auth:** `Authorization: Bearer <access_token>` **atau** `Bearer dnp_<api_key>`  
**Response shape:** `{ success, data, pagination?, error?, timestamp }`

> Detail tabel di bawah = **MVP 1 core**. Ringkasan endpoint **MVP 2–3** dan **MVP 4** ada di bagian akhir dokumen.

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
| PUT | `/employees/:id/access` | settings:* | Buat akun atau ubah role HR/Manager/Finance/Employee; password sementara hanya tampil sekali |
| GET/POST | `/employees/:id/family` | employees:view/* | Data keluarga |
| GET/POST | `/employees/:id/educations` | employees:view/* | Pendidikan |
| GET | `/employees/:id/status-history` | employees:view | Riwayat status |
| POST | `/employees/:id/status-transition` | employees:* | Transisi status kontrak/kerja |
| GET/POST | `/employees/:id/probation-reviews` | employees:view/* | Evaluasi probation |

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
| GET | `/attendance/qr/today` | attendance:view | QR harian bertanda tangan |
| POST | `/attendance/offline-sync` | attendance:self | Sinkronisasi antrean offline |

Clock-in body: `{ latitude?, longitude?, location?, workMode?, checkInMethod?, selfieUrl?, qrToken?, wifiSsid? }`. Metode `SELFIE` menjalankan liveness/face-match provider; clock-out menghasilkan penanda `earlyLeave`.

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
| GET | `/leave/coworkers` | leave:self | Kandidat pengganti |
| GET | `/leave/coverage/mine` | leave:self | Assignment pengganti |
| POST | `/leave/coverage/:id/acknowledge` | leave:self | Konfirmasi handover |
| POST | `/leave/admin/process-year` | leave:* | Carry-forward dan expiry tahunan |

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
| GET | `/payroll/:id/payslip.pdf` | payroll:view / payslips:self | Payslip landscape terlindungi password |
| GET | `/payroll/:id/verify` | payroll:view / payslips:self | Verifikasi signature/hash payslip |
| GET/PATCH | `/payroll-settings/configuration` | payroll:view/* | Pajak, BPJS, proration, overtime, loan policy |
| GET/POST | `/payroll-settings/templates` | payroll:view/* | Template komponen gaji |
| GET/POST | `/payroll-settings/tax-rates` | payroll:view/* | Tarif pajak berversi |

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

## MVP 2–3 (ringkas)

| Prefix | Modul |
|--------|-------|
| `/shifts` | Shift & assignment |
| `/overtime` | Lembur + approve |
| `/corrections` | Koreksi absensi |
| `/claims` | Klaim/reimbursement |
| `/loans` | Pinjaman/kasbon |
| `/documents` | Dokumen perusahaan |
| `/announcements` | Pengumuman |
| `/surveys` | Survey API |
| `/calendar` | Kalender & holidays |
| `/approvals` | Inbox + approval rules |
| `/recruitment` | Jobs, candidates, applications |
| `/onboarding` | Onboarding plans |
| `/performance` | Cycles, reviews, KPIs |
| `/training` | Programs + career paths |
| `/assets` | Asset assign/return |
| `/offboarding` | Resign workflow |
| `/helpdesk` | Tickets |
| `/policies` | Kebijakan + disciplinary |
| `/assistant/ask` | AI HR assistant (rule-based) |
| `/reports/analytics` | Advanced analytics |

## MVP 4 Enterprise

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET/POST | `/platform/companies` | SUPER_ADMIN | List / create tenant |
| GET | `/platform/org-tree` | SUPER_ADMIN | Companies + parent/child links |
| POST/DELETE | `/platform/org-links` | SUPER_ADMIN | Link subsidiaries |
| GET/POST/DELETE | `/integrations/api-keys` | integrations:* | API keys (`dnp_…`, plain once) |
| GET/POST/PATCH | `/integrations` | integrations:* | Webhook/Slack/etc |
| POST | `/integrations/:id/test` | integrations:* | Test webhook delivery |
| GET/POST/PATCH | `/workflows` | workflows:* | Custom approval workflows |
| POST | `/workflows/:id/activate` | workflows:* | One active per module |
| GET | `/workflows/resolve/:module` | workflows:view | Resolve steps (workflow or rules) |
| GET/PUT | `/branding` | settings:* | White-label branding |
| GET | `/branding/public/:companyId` | — | Public branding for login |
| GET/PUT | `/sso` | settings:* | SSO IdP config |
| GET | `/sso/google/start` | — | Start Google OAuth (`?companyId=`) |
| GET | `/sso/google/callback` | — | OAuth callback → redirect frontend |
| GET | `/sso/microsoft/start` | — | Start Microsoft OAuth |
| GET | `/sso/microsoft/callback` | — | Microsoft callback → JWT |
| GET | `/sso/saml/start` | — | SAML AuthnRequest redirect |
| GET/POST | `/sso/saml/acs` | — | SAML Assertion Consumer Service |
| GET | `/sso/saml/metadata` | — | SP metadata XML |
| POST | `/sso/initiate` | settings:view | Return startUrl for configured provider |
| GET | `/careers/:companyKey` | — | Public open jobs |
| GET | `/careers/:companyKey/jobs/:jobId` | — | Public job detail |
| POST | `/careers/:companyKey/jobs/:jobId/apply` | — | Public apply |
| POST | `/uploads` | auth | Binary upload (local disk atau S3) |
| GET | `/payroll/:id/payslip.pdf` | payroll | Payslip PDF |
| GET | `/attendance/qr/today` | attendance:view | Daily office QR token |
| POST | `/assistant/ask` | auth | LLM atau rule-based HR Q&A |
| GET/POST | `/custom-reports` | reports:* | Report builder |
| GET | `/custom-reports/sources` | reports:view | Available data sources |
| POST | `/custom-reports/:id/run` | reports:view | Execute report |
| GET/POST/PATCH/DELETE | `/security/access-rules` | settings:* | Row-level RBAC |
| GET | `/security/effective-scope/:resource` | settings:view | Effective scope for caller |
| POST | `/ai/documents/generate` | documents:* | AI HR letter templates |
| POST | `/ai/recruitment/screen` | recruitment:* | Screen one application |
| POST | `/ai/recruitment/screen-batch` | recruitment:* | Screen all APPLIED/SCREENING |

### API key usage

```http
Authorization: Bearer dnp_<secret>
```

Key dibuat via `POST /integrations/api-keys` (plain text hanya sekali). Prefix disimpan; hash bcrypt di DB.

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
