# dnPeople — API Reference

**Base URL (dev):** `http://localhost:4100/api/v1`  
**Auth:** httpOnly cookie `dnpeople_session` **atau** `Authorization: Bearer <jwt|dnp_…>`  
**OpenAPI:** [`/api/v1/openapi.json`](http://localhost:4100/api/v1/openapi.json) · Swagger UI [`/api/v1/docs`](http://localhost:4100/api/v1/docs)  
**Response shape:** `{ success, data, pagination?, error?, timestamp }`

> Detail tabel di bawah mencakup core API; endpoint enterprise v6 dan SCIM diringkas di bagian akhir.

---

## Auth

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/auth/login` | — | Login email/password tanpa Company ID; backend auto-discover tenant, route SSO/password, atau tampilkan picker |
| POST | `/auth/register` | — | Register perusahaan + COMPANY_ADMIN |
| POST | `/auth/forgot-password` | — | Minta tautan reset (email, TTL 1 jam; selalu 200) |
| POST | `/auth/reset-password` | — | Konsumsi token reset sekali pakai |
| POST | `/auth/logout` | ✓ | Logout + clear cookie |
| GET | `/auth/me` | ✓ | Profil user + employee + company |

### Login body

```json
{ "email": "admin@dnpeople.id", "password": "Admin123!" }
```

`companyId` hanya dikirim saat user memilih tenant dari fallback company picker:

```json
{ "email": "admin@dnpeople.id", "password": "Admin123!", "companyId": "tenant-uuid" }
```

### Login responses

Email/password tenant:

```json
{
  "status": "success",
  "access_token": "jwt",
  "token": "jwt",
  "redirectUrl": "/dashboard",
  "user": { "id": "user-id", "email": "admin@dnpeople.id", "companyId": "tenant-uuid" }
}
```

SSO tenant:

```json
{
  "status": "sso_required",
  "redirect": "https://api.example.com/api/v1/sso/saml/start?companyId=tenant-uuid",
  "companyId": "tenant-uuid",
  "provider": "SAML"
}
```

Unresolved tenant:

```json
{
  "status": "company_not_found",
  "showPicker": true,
  "message": "Mana company Anda?",
  "companies": [{ "id": "tenant-uuid", "name": "Company A", "domain": "company-a.com" }]
}
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

## Staff Accounts

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET | `/staff-accounts` | settings:* | List/search akun login tenant |
| GET | `/staff-accounts/available-employees` | settings:* | Karyawan yang belum memiliki akun |
| POST | `/staff-accounts` | settings:* | Buat akun standalone atau linked employee |
| PATCH | `/staff-accounts/:id` | settings:* | Ubah role atau status aktif |
| POST | `/staff-accounts/:id/reset-password` | settings:* | Reset password dan tampilkan temporary password sekali |

Akun `SUPER_ADMIN` dan `COMPANY_ADMIN` dilindungi dari perubahan melalui endpoint staff.
Admin juga tidak dapat menonaktifkan atau mengubah role akunnya sendiri.

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
| GET | `/attendance/template/download` | attendance:view + SUPER_ADMIN/COMPANY_ADMIN/HR | Download template Excel Attendance/Instructions/Employee List |
| POST | `/attendance/import` | attendance:view + SUPER_ADMIN/COMPANY_ADMIN/HR | Upload `.xlsx`, dry-run validate/preview atau confirm import |
| GET | `/attendance/imports` | attendance:view + SUPER_ADMIN/COMPANY_ADMIN/HR | Recent import history dari audit log |

Clock-in body: `{ latitude?, longitude?, location?, workMode?, checkInMethod?, selfieUrl?, qrToken?, wifiSsid? }`. Metode `SELFIE` menjalankan liveness/face-match provider; clock-out menghasilkan penanda `earlyLeave`.

Excel attendance import memakai `multipart/form-data` dengan field `file` dan `dryRun=true|false`. Template wajib memakai sheet `Attendance` dan header `Employee ID`, `Date`, `Clock-In`, `Clock-Out`, `Status`, `Notes`. Server memvalidasi `.xlsx` asli, ukuran ≤5 MB, employee dalam tenant, format tanggal `YYYY-MM-DD`, jam `HH:MM`/`H:MM AM/PM`, durasi 15 menit–24 jam, status `PRESENT|ABSENT|LATE|SICK`, tanggal tidak future/lebih dari 90 hari, dan tidak ada duplikat employee+tanggal di file maupun database. Confirm import menyimpan record dengan `checkInMethod=MANUAL_UPLOAD` dan histori import di audit log. List `/attendance` menerima filter tambahan `sourceType=MANUAL_UPLOAD` dan `status=PRESENT|ABSENT|LATE|SICK`.

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
| GET | `/payroll/verify/:payslipId` | payroll:view / payslips:self | Verifikasi signature/hash payslip |
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

## Talent Development (PRD v4 — Module 1 & 2)

### Competency framework & assessment

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET/POST | `/competency-frameworks` | talent:view / talent:* | List/buat framework kompetensi (`?status=`) |
| PATCH/DELETE | `/competency-frameworks/:id` | talent:* | Update / archive |
| POST | `/competency-frameworks/:id/new-version` | talent:* | Clone framework + kompetensi + role mapping ke versi baru |
| GET/POST | `/competencies` | talent:view / talent:* | List/buat kompetensi (`?frameworkId=&category=&search=`) |
| PATCH/DELETE | `/competencies/:id` | talent:* | Update / soft-deactivate |
| GET | `/competencies/gap-analysis/:employeeId` | talent:view atau self | Gap current vs required, priority-ranked |
| POST | `/competencies/bulk-import` | talent:* | Import Excel/CSV (`multipart/form-data`, field `file` + `frameworkId`) |
| GET/POST | `/role-competencies` | talent:view / talent:* | Mapping posisi ↔ kompetensi (`requiredLevel`, `importanceWeight`, `developmentPriority`) |
| DELETE | `/role-competencies/:id` | talent:* | Hapus mapping |
| GET/POST | `/competency-assessments` | talent:view/self, talent:assess/self | List/buat assessment (`SELF`/`MANAGER`/`PEER`/`360`) |
| PATCH | `/competency-assessments/:id` | pemilik draft | Edit item assessment berstatus `DRAFT` |
| POST | `/competency-assessments/:id/submit` | pemilik draft | Submit untuk approval |
| POST | `/competency-assessments/:id/approve` | talent:* | Approve assessment `SUBMITTED` |

Self-service: `EMPLOYEE` (permission `talent:self`) dapat melihat/membuat assessment `SELF` miliknya sendiri dan gap analysis dirinya sendiri tanpa `talent:view`/`talent:assess`.

### Individual Development Plan (IDP)

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET | `/idps` | talent:view / self | List IDP (`?employeeId=`); employee hanya melihat miliknya |
| POST | `/idps` | talent:* / MANAGER | Buat IDP; `autoGenerateFromGaps: true` men-generate goal dari gap kompetensi teratas, idempotent per `employeeId+startDate+endDate` |
| GET | `/idps/:id` | talent:view / self | Detail + goals + review |
| PATCH | `/idps/:id` | talent:* / MANAGER | Update status/tanggal/target posisi |
| POST | `/idps/:id/goals` | talent:* / MANAGER | Tambah goal |
| PATCH | `/idps/goals/:goalId` | talent:* / MANAGER / pemilik IDP | Update status & completion goal |
| POST | `/idps/:id/review` | talent:* / MANAGER | Catat review, recompute `completionPercentage` IDP |

### Learning Management System (LMS)

| Method | Path | Permission | Deskripsi |
|--------|------|------------|-----------|
| GET | `/lms/programs` | ✓ (company-scoped) | Katalog course (`?status=&difficultyLevel=&search=`) |
| POST | `/lms/programs` | lms:* | Buat course + modules nested |
| PATCH | `/lms/programs/:id` | lms:* | Update/publish/archive |
| POST | `/lms/programs/:id/modules` | lms:* | Tambah modul |
| GET/POST | `/lms/enrollments` | lms:self / lms:view / lms:assign / lms:* | List/daftarkan enrollment (self-enroll atau manager assign) |
| PATCH | `/lms/enrollments/:id/complete-module` | pemilik enrollment / talent-manager | Catat penyelesaian modul; auto-hitung `completionPercentage`/`finalScore`, generate sertifikat saat 100% & lulus `passingScore` |
| GET | `/lms/transcript/:employeeId` | lms:view / self | Riwayat course selesai + sertifikat |

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
| POST | `/uploads` | auth | Binary upload (local disk atau S3); validasi ekstensi + MIME + magic bytes |
| GET | `/files/*` | auth | Unduh file terautentikasi (company-scoped); payslip path butuh payroll/payslip scope |
| GET | `/payroll/:id/payslip.pdf` | payroll | Payslip PDF |
| GET | `/payroll/verify/:payslipId` | payroll | Verifikasi signature payslip |
| GET | `/attendance/qr/today` | attendance:view | Daily office QR token (API tetap; admin UI generator dihapus Jul 18) |
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

## PRD v5 Subscription & Billing

Base path: `/api/v1/subscription` · UI: `/billing`

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/subscription/current` | Current subscription, features, access mode, invoices |
| GET | `/subscription/features` | Effective feature access |
| GET | `/subscription/invoices` | Invoice history |
| POST | `/subscription/invoices/:id/payment` | Stripe / Xendit / manual payment |
| GET | `/subscription/audit` | Subscription change history |
| POST | `/subscription/upgrade` | Change tier + prorated invoice |
| POST | `/subscription/cancel` | Cancel with grace/freeze |
| POST | `/subscription/reactivate` | Reactivate cancelled/suspended |
| PUT | `/subscription/features` | Super-admin feature overrides |
| POST | `/subscription/webhooks/stripe` | Stripe webhook |
| POST | `/subscription/webhooks/xendit` | Xendit webhook |

---

## PRD v6 Enterprise Multi-Tenant

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/tenants/discover` | — | Tenant discovery dari email domain atau hostname |
| GET | `/tenants/branding/domain` | — | Branding berdasarkan verified custom domain |
| GET | `/tenants/current` | ✓ | Isolation, SSO, branding, dan quota tenant aktif |
| PATCH | `/tenants/isolation` | settings:* | Ubah POOL/SILO/BRIDGE policy |
| GET/POST/PATCH | `/tenants/organizations[/:id]` | org:* | Hierarki organisasi internal |
| GET | `/tenants/role-scopes` | settings:view | Daftar scope user |
| PUT | `/tenants/role-scopes/:userId` | settings:* | Upsert scope organisasi/departemen/lokasi |
| GET/PATCH | `/tenants/quota` | settings:* | Usage status dan quota policy |
| GET | `/tenants/audit` | audit:view | Audit tenant/isolation |
| POST | `/tenants/scim-tokens` | settings:* | Membuat secret SCIM sekali tampil |

SCIM menggunakan base URL terpisah dari `/api/v1`:

```text
/scim/v2/:tenantId/Users
/scim/v2/:tenantId/Users/:userId
/scim/v2/:tenantId/Groups
/scim/v2/:tenantId/Groups/:groupId
```

Endpoint SCIM menerima tenant-specific bearer token dan mengembalikan
`application/scim+json`. `DELETE Users` melakukan deactivation agar histori HR tetap terjaga.

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

*Last Updated: July 18, 2026*

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| UpdatedAt | July 18, 2026 |
