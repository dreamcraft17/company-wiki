# dnPeople — Feature Catalog

**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** DnPeople  
**UpdatedAt:** July 22, 2026  


**Snapshot:** 22 July 2026 · HEAD `54273f8` · **baseline frozen** for next PRD  
**Specification baseline:** PRD/SRS/SDD v3.1 + PRD v4–**v10.0** (complete in repo)  
**Next PRD scope (recommended):** PRD v4 **Module 3–8** + PRD v10 ops go-live gates  
**Latest audit:** [AUDIT-FEATURE-BUG-PERFORMANCE.md](./AUDIT-FEATURE-BUG-PERFORMANCE.md) (P0/P1 remediated in v8.0)  
**Scope:** fitur yang tersedia pada codebase `dnpeople` (web + API), plus batas integrasi production dan roadmap eksplisit  
**Audience:** Product, Business Analyst, Sales, Engineering, QA, Implementation, dan penyusun PRD berikutnya

## Cara membaca

| Status | Arti |
|--------|------|
| **Available** | UI dan API/alur inti tersedia di codebase. Tetap memerlukan deployment, konfigurasi, dan UAT customer. |
| **Conditional** | Implementasi tersedia, tetapi fungsi production bergantung provider, kredensial, data, atau acceptance eksternal. |
| **Roadmap** | Belum menjadi fitur produk saat ini; jangan dijanjikan sebagai fitur existing. |

Role utama: `SUPER_ADMIN`, `COMPANY_ADMIN`, `HR`, `MANAGER`, `FINANCE`, dan `EMPLOYEE`. Akses final tetap ditentukan permission backend serta role scope `all`, `organization`, `department`, `location`, `self`, atau `custom`.

## Ringkasan produk

dnPeople adalah HRIS multi-tenant untuk perusahaan Indonesia. Implementasi saat ini memiliki **~54 halaman frontend**, **~52 modul route backend**, **101 model Prisma**, **32** backend unit tests, mobile-first web shell, marketing MVP `/welcome`, dan domain fitur dari core HR sampai talent + enterprise. Auth session memakai httpOnly cookie `dnpeople_session`.

## 1. Identity, authentication, dan access control

| Fitur | Kapabilitas | Pengguna utama | Surface | Status |
|-------|-------------|----------------|---------|--------|
| Login dan session | Email/password tanpa Company ID; session httpOnly cookie `dnpeople_session` + sessionStorage Bearer fallback; Next `/api/v1` rewrite same-origin; logout membersihkan cookie + storage; expired/invalid session auto-redirect ke `/login` dari halaman mana pun | Semua role | `/login`, `/auth` | Available — PRD v8.0 |
| Forgot / reset password | Self-service email reset; token hashed TTL **1 jam** sekali pakai | Semua role | `/login`, `/reset-password`, `/auth/forgot-password` | Available — PRD v9.0 |
| Registrasi perusahaan | Membuat company dan akun administrator awal | Calon customer/admin | `/auth/register` | Available |
| Proteksi akun | Password hashing, minimum password, failed-login lockout | Semua role | Auth service | Available |
| MFA TOTP | Setup (QR), verifikasi, enable/disable; `/security` mengarahkan ke MFA | Semua role | `/settings/mfa`, `/auth/mfa/*` | Available — PRD v8.0 |
| OAuth | Login Google dan Microsoft; sukses SSO set cookie (bukan JWT di query URL) | Semua role | `/sso` | Conditional — provider credentials |
| SAML SSO + JIT | Konfigurasi IdP, ACS, just-in-time user provisioning; cookie session setelah ACS | Enterprise admin | `/sso`, `/sso/saml/*` | Conditional — IdP UAT |
| Tenant discovery | Routing tenant dari verified email domain, custom hostname, atau user history; fallback company picker untuk edge case | Semua role | `/tenants/discover`, `/auth/login` | Available |
| Per-tenant IdP policy | SAML/OIDC/Google/Microsoft, audience, enforce-SSO, default role dan JIT policy per tenant | Enterprise admin | `/sso` | Conditional — IdP credentials/UAT |
| SCIM 2.0 | Tenant-token-scoped Users/Groups provisioning dan deprovisioning | Enterprise/IdP | `/scim/v2/:tenantId/*` | Available; IdP UAT required |
| API-key authentication | Scoped key `dnp_…` dengan enforce scopes (default deny; `*` = admin; `resource:*` wajib untuk wildcard action); revoke, last-used | Admin/integrator | `/integrations`, `/integrations/api-keys` | Available — PRD v8.0 |
| Role management | Membuat linked account, assign role, temporary password sekali tampil | Company admin | Employee lifecycle panel | Available |
| Akun staff terpusat | List/search akun, buat akun standalone/linked employee, role, aktivasi, dan reset password | Company admin | `/staff-accounts` | Available |
| RBAC | Enam role dan permission per resource/action | Semua role | Backend authorization | Available |
| Row-level access | Scope all/organization/department/location/self/custom dan effective-scope inspection | Admin/manager | `/security`, `/tenants/role-scopes` | Available |
| Tenant isolation | POOL/SILO/BRIDGE policy, tier enforcement, context guard dan blocked-attempt audit | Semua role | Seluruh API, `/tenant-management` | Conditional — dedicated SILO database provisioning/routing is an operational deployment step |

## 2. Company, organization, dan employee master

| Fitur | Kapabilitas | Pengguna utama | Surface | Status |
|-------|-------------|----------------|---------|--------|
| Profil perusahaan | Identitas company, jam kerja, jadwal dan konfigurasi dasar | Company admin/HR | Company API | Available |
| Departemen | CRUD departemen dan hierarchy | Admin/HR | `/org` | Available |
| Posisi/jabatan | CRUD posisi dan mapping organisasi | Admin/HR | `/org` | Available |
| Level/grade | CRUD level karyawan | Admin/HR | `/org` | Available |
| Lokasi kerja | Alamat, koordinat, radius geofence, SSID WiFi | Admin/HR | `/org` | Available |
| Organization tree | Struktur manager, unit, posisi, dan link antar-company | Admin/HR | `/org`, `/platform` | Available |
| Legal organization units | Hierarki unit/legal entity dalam tenant, policy cross-org, employee assignment | Admin/HR | `/tenant-management`, `/tenants/organizations` | Available |
| Employee CRUD | Tambah, lihat, ubah, pencarian, pagination, soft delete | Admin/HR | `/employees` | Available |
| Import karyawan | Excel/CSV bulk import dengan validasi | Admin/HR | `/employees` | Available |
| Filter employee | Departemen, posisi, lokasi, employment type, status | Admin/HR/manager | `/employees` | Available |
| Data personal | Identitas, alamat/kontak, employment detail | HR/employee sesuai scope | Employee panel | Available |
| Family dan dependant | Anggota keluarga dan tanggungan | HR/employee sesuai scope | Employee lifecycle API/UI | Available |
| Pendidikan | Riwayat pendidikan | HR/employee sesuai scope | Employee lifecycle API/UI | Available |
| Emergency contact | Kontak darurat | HR/employee sesuai scope | Employee lifecycle API/UI | Available |
| Bank dan pajak | Rekening, NPWP, PTKP dan data payroll terkait | HR/Finance sesuai izin | Employee lifecycle API/UI | Available |
| Kontrak dan probation | Tanggal kontrak/probation, review, reminder, conversion | HR/manager | Employee lifecycle panel | Available |
| Status history | Riwayat perubahan status employment | HR | Employee lifecycle panel | Available |
| Enkripsi field sensitif | AES-256-GCM untuk salary, NPWP, dan nomor rekening; key rotation | Platform/security | Backend/data | Available |

## 3. Attendance, shift, leave, dan permission

| Fitur | Kapabilitas | Pengguna utama | Surface | Status |
|-------|-------------|----------------|---------|--------|
| Clock-in/out | Absensi masuk/keluar dan status hari ini | Employee | `/attendance` | Available |
| Metode absensi | Manual/cepat, GPS, QR, selfie, dan WiFi (employee self-service) | Employee | `/attendance` | Available |
| Admin office QR panel | Generator QR kantor di UI admin | Admin/HR | `/attendance` | Removed from admin UI (Jul 18); API `GET /attendance/qr/today` tetap ada |
| Geofence | Validasi koordinat dan radius lokasi kerja | Employee/admin | Attendance + organization | Available |
| WiFi attendance | Validasi SSID kantor | Employee/admin | Attendance + organization | Available |
| Selfie/liveness | Adapter face-match/liveness dan production fail-closed | Employee/admin | Attendance API | Conditional — biometric provider |
| Work mode | Pencatatan office/WFH dan konteks kerja | Employee/HR | `/attendance` | Available |
| Late/early leave | Deteksi terlambat dan pulang cepat | Employee/HR | `/attendance`, reports | Available |
| Offline attendance | Queue lokal dan sync fill-empty (tidak overwrite jam yang sudah ada) | Employee | `/attendance` | Available — PRD v8.0 |
| Attendance history/summary | Riwayat, ringkasan dan filter periode | Employee/HR/manager | `/attendance` | Available |
| Excel manual attendance import | Template `.xlsx`, dry-run, preview, confirm; `Idempotency-Key` (header atau hash file); scope API key `attendance:*`; `MANUAL_UPLOAD` + audit history | SUPER_ADMIN/COMPANY_ADMIN/HR | `/attendance`, `/attendance/import*` | Available — PRD v7.0 + v8.0 |
| Koreksi absensi | Request dengan bukti wajib dan nilai before/after | Employee/HR | `/corrections` | Available |
| Bulk correction/approval | Koreksi dan approval massal | HR/manager | `/corrections` | Available |
| Shift master | CRUD jam shift dan pay multiplier | Admin/HR | `/shifts` | Available |
| Shift assignment | Satu assignment employee per hari dengan validasi tenant/status | Admin/HR | `/shifts` | Available |
| Rotasi shift | Penjadwalan rotasi karyawan | Admin/HR | `/shifts` | Available |
| Shift swap | Request tukar shift dan approval | Employee/manager | `/shifts` | Available |
| Leave type | Paid/unpaid type, policy dan auto-approve sick leave | Admin/HR | `/leave` | Available |
| Leave balance | Saldo, deduction, overlap validation | Employee/HR | `/leave` | Available |
| Leave request/approval | Submit, approve/reject dan approval scope | Semua role terkait | `/leave`, `/approvals` | Available |
| Carry-forward/expiry | Proses tahunan, carry-forward dan kedaluwarsa saldo | HR | Leave admin API | Available |
| Replacement/handover | Rekan pengganti, coverage dan acknowledgement | Employee/manager | `/leave` | Available |
| Permission | Izin terlambat, pulang awal, WFH, perjalanan dinas, lainnya | Employee/manager | `/permissions` | Available |
| Attendance synchronization | Approval cuti/izin memperbarui catatan attendance | HR/system | Leave/permission service | Available |
| Overtime | Request, approval/reject, weekday/weekend/holiday multiplier | Employee/manager | `/overtime` | Available |
| Overtime to payroll | Lembur approved otomatis masuk payroll period | Finance/payroll admin | Payroll service | Available |

## 4. Payroll, tax, benefits, dan employee finance

| Fitur | Kapabilitas | Pengguna utama | Surface | Status |
|-------|-------------|----------------|---------|--------|
| Payroll configuration | Working-day divisor, tax method, BPJS, overtime, claim/loan policy | Company admin/Finance | `/payroll-settings` | Available |
| Salary component | Earning, deduction, employer contribution, effective date | Company admin/Finance | `/payroll-settings` | Available |
| Payroll template | Template berdasar departemen/posisi dan idempotent application | Company admin/Finance | `/payroll-settings` | Available |
| Employee component | Komponen recurring/period-specific per karyawan | Finance | `/payroll-settings` | Available |
| PPh 21 | PTKP lengkap, tax bracket versioning, gross/net/gross-up | Finance | Payroll settings/service | Available |
| BPJS | Kesehatan, JHT, JP; rate/cap employee dan employer | Finance | Payroll settings/service | Available |
| Monthly payroll | Batch calculate (batched OT/claims/loans/variables/attendance/leave/shift), preview/detail, **atomic finalize** (`DRAFT`→`FINALIZED`), idempotent re-finalize → 200, paid status | Finance/admin | `/payroll` | Available — PRD v8.0 |
| Payroll inputs | Attendance, unpaid leave, shift premium, overtime, claim, loan, variable pay | Finance/system | Payroll service | Available |
| Proration | Join/exit mid-period, divisor, eligible days, full-month cap, explanation | Finance/employee | `/payroll`, payslip | Available |
| THR | Annual THR generation | Finance/admin | `/payroll/thr/run` | Available |
| Bonus dan commission | Variable compensation, approval, period assignment, paid tracking | Finance/admin | `/payroll-settings` | Available |
| KPI bonus | Idempotent generation dari performance ke pending payroll bonus | HR/Finance | Performance/payroll | Available |
| Payslip portal | Nav Slip Gaji semua role; employee `/payroll/my` + in-app “Lihat Slip”; admin inline preview | Employee + Finance/admin | `/payroll` | Available — PRD v8.0 |
| Payslip PDF | Landscape, password, tabel earning/deduction, branding; download ber-auth + audit `PAYSLIP_DOWNLOAD` | Employee/Finance | `/payroll/:id/payslip.pdf` | Available — PRD v8.0 |
| Signed payslip link | Generate link TTL 24 jam (`POST …/payslip-link`); unduh via `GET /payroll/signed-payslip/:token`; UI “Bagikan Link” | Finance/admin | `/payroll` | Available — PRD v8.0 |
| Payslip verification | Signature/tamper-evidence verification | Employee/auditor | `/payroll/verify/:payslipId` | Available |
| Bukti potong | Dokumen PPh 21 per employee | Finance/employee | Payroll API | Available |
| Claim category/policy | Kategori, limit harian/bulanan, receipt wajib | Admin/Finance | `/claims` | Available |
| Reimbursement claim | Submit bukti, multi-step approval, paid/payroll inclusion | Employee/manager/Finance | `/claims`, `/approvals` | Available |
| Loan simulation | Simulasi cicilan dan affordability ratio | Employee/Finance | `/loans` | Available |
| Employee loan | One-active-loan policy, Manager/Finance approval, payroll deduction | Employee/manager/Finance | `/loans`, `/approvals` | Available |
| Bank upload/reconciliation | Export data transfer/reconciliation payroll | Finance | `/reports` | Available; bukan eksekusi transfer |
| Tax/YTD export | Payroll/tax detail dan year-to-date export | Finance | `/reports` | Available |

## 5. Recruitment dan onboarding

| Fitur | Kapabilitas | Pengguna utama | Surface | Status |
|-------|-------------|----------------|---------|--------|
| Job requisition/posting | CRUD lowongan, publish, close | HR/recruiter | `/recruitment` | Available |
| Public career portal | Listing company/job tanpa login | Candidate | `/careers/*` | Available |
| Online application | Form lamaran dan upload CV | Candidate | `/careers/[companyKey]/[jobId]` | Available |
| Candidate database | Kandidat dan application records | HR/recruiter | `/recruitment` | Available |
| ATS pipeline | Status workflow dan bulk status action | HR/recruiter | `/recruitment` | Available |
| Interview data | Schedule/detail interview dalam pipeline | HR/recruiter/manager | `/recruitment` | Available |
| Candidate communication | Komunikasi bulk/status notification | HR/recruiter | Recruitment service | Conditional — SMTP |
| AI screening | Single/batch screening dan ranking helper | HR/recruiter | `/recruitment`, `/ai/recruitment/*` | Conditional — LLM provider; rule fallback |
| Digital offer | Generate/send offer, expiry dan public token | HR/candidate | `/recruitment`, `/careers/offer/[token]` | Available |
| Offer acceptance | Accept/reject, consent signature dan tamper evidence | Candidate | Public offer page | Available |
| Auto-hire | Accepted offer membuat employee dan onboarding | HR/system | Recruitment service | Available |
| Onboarding plan | Default/custom plan dan buddy | HR | `/onboarding` | Available |
| Onboarding checklist | Dokumen, training, equipment, culture, probation task | HR/owner task | `/onboarding` | Available |
| Scoped completion | Penyelesaian task oleh owner yang sesuai | HR/manager/employee | `/onboarding` | Available |

## 6. Performance, competency, IDP, dan learning

| Fitur | Kapabilitas | Pengguna utama | Surface | Status |
|-------|-------------|----------------|---------|--------|
| Performance cycle | Membuat cycle dan generate review | HR | `/performance` | Available |
| Performance review | Self score, manager score, final score | Employee/manager/HR | `/performance` | Available |
| KPI dan OKR | Target, progress, score dan bonus handoff | Employee/manager/HR | `/performance` | Available |
| Training program | Program, enrollment, start/complete | HR/employee | `/training` | Available |
| Career path record | Jalur karier dan requirement | HR/employee | `/training` | Available |
| Competency framework | CRUD, versioning dan clone mapping | HR/admin | `/talent` | Available |
| Competency library | Definisi kompetensi dan proficiency levels | HR/admin | `/talent` | Available |
| Competency import | Bulk Excel/CSV | HR/admin | `/talent` | Available |
| Role-competency mapping | Required level, importance weight, priority | HR/admin | `/talent` | Available |
| Competency assessment | Self/manager/peer/360, draft-submit-approve | Employee/manager/HR | `/talent` | Available |
| Gap analysis | Gap × importance ranking per employee/role | Employee/manager/HR | `/talent` | Available |
| IDP | Manual CRUD dan plan period/status | Employee/manager/HR | `/idp` | Available |
| IDP auto-generation | Idempotent goals dari top competency gaps | Employee/manager/HR | `/idp` | Available |
| IDP goal/review | Goal status/progress dan review completion | Employee/manager/HR | `/idp` | Available |
| LMS program/module | Program dan ordered learning module | HR/admin | `/lms` | Available (basic) |
| LMS enrollment | Self-enroll atau assigned enrollment | Employee/manager | `/lms` | Available (basic) |
| Learning progress | Module completion, percentage, final score | Employee/manager | `/lms` | Available (basic) |
| Certificate/transcript | Certificate code/expiry dan personal transcript | Employee/HR | `/lms` | Available (basic) |

## 7. Employee services dan workplace operations

| Fitur | Kapabilitas | Pengguna utama | Surface | Status |
|-------|-------------|----------------|---------|--------|
| Asset inventory | CRUD aset dan status | HR/admin | `/assets` | Available |
| Asset assignment/return | Serah-terima dan pengembalian termasuk offboarding | HR/employee | `/assets`, `/offboarding` | Available |
| Resignation | Employee request, approve/reject, complete | Employee/manager/HR | `/offboarding` | Available |
| Offboarding workflow | Checklist dan asset-return support | HR/employee | `/offboarding` | Available |
| Company documents | Upload/list/delete dokumen perusahaan | HR/employee sesuai izin | `/documents` | Available |
| Employee documents | Upload/list dokumen employee | HR/employee sesuai scope | `/documents` | Available |
| Contract reminders | Kontrak expiring dan trigger reminder | HR | `/documents` | Conditional — SMTP |
| Policies | CRUD/publish kebijakan perusahaan | HR/employee | `/policies` | Available |
| Discipline | Warning/SP/suspension records | HR/manager | `/policies` | Available |
| Helpdesk | Create ticket, assignment, status, resolution | Employee/HR | `/helpdesk` | Available |

## 8. Communication dan engagement

| Fitur | Kapabilitas | Pengguna utama | Surface | Status |
|-------|-------------|----------------|---------|--------|
| Announcements | Publish dan konsumsi pengumuman | HR/semua role | `/announcements` | Available |
| Survey | Form pertanyaan dan response | HR/employee | `/surveys` | Available |
| Poll | Quick poll dan choice question | HR/employee | `/surveys` | Available |
| HR calendar | Event HR, holiday dan payroll schedule | Semua role | `/calendar` | Available |
| Notification center | Persistent unread/read notification di header | Semua role | Header, `/notifications` | Available |
| Browser notification | Permission dan notification browser | Semua role | Web Notification API | Conditional — browser permission |
| Email notification | Workflow email melalui SMTP | Semua role | Backend mailer | Conditional — SMTP |

## 9. Dashboard, analytics, dan reporting

| Fitur | Kapabilitas | Pengguna utama | Surface | Status |
|-------|-------------|----------------|---------|--------|
| Role-aware dashboard | Data sesuai role/scope | Semua role | `/dashboard` | Available |
| Workforce dashboard | Total/active, department/type/status breakdown | HR/admin/manager | `/dashboard` | Available |
| Operational dashboard | Attendance, pending approval, contracts, probation, birthday | HR/manager | `/dashboard` | Available |
| Payroll dashboard | Payroll period/status yang diizinkan | Finance/admin | `/dashboard` | Available |
| Attendance report | Detail, date/employee filter, pattern analysis, Excel/PDF (cap 1000 baris) | HR/manager | `/reports` | Available — PRD v8.0 |
| Leave report | Detail, peak/future analysis, Excel/PDF (cap 1000 baris) | HR/manager | `/reports` | Available — PRD v8.0 |
| Payroll report | Component, tax, BPJS, department, bank dan YTD (cap 1000) | Finance/admin | `/reports` | Available — PRD v8.0 |
| Async report export jobs | Queue bank/tax export (`POST /reports/jobs`), status poll, download saat ready + email outbox | Finance/admin | `/reports` | Available — PRD v8.0 |
| Turnover analytics | Trend, department, reason, heuristic risk | HR/admin | `/reports` | Available; human review wajib |
| Custom reports | Source definition, saved config dan execution | Enterprise admin | `/custom-reports` | Available |
| Spreadsheet safety | Formula-injection protection; upload magic-byte + MIME validation | Admin/Finance | Reporting/import/upload | Available — PRD v8.0 |

## 10. Approval, workflow, AI, dan integrations

| Fitur | Kapabilitas | Pengguna utama | Surface | Status |
|-------|-------------|----------------|---------|--------|
| Approval inbox | Cuti, izin, lembur, koreksi, claim, loan | Manager/HR/Finance | `/approvals` | Available |
| Approval rules | Rule berdasarkan module, role, amount | Admin | `/approvals` | Available |
| Custom workflow | Multi-step workflow CRUD dan activation | Enterprise admin | `/workflows` | Available |
| Workflow resolution | Resolve workflow aktif per module/context | System/admin | Workflow API | Available |
| AI HR assistant | Tanya jawab HR dengan LLM/rule fallback | Semua role | `/assistant` | Conditional — LLM untuk hasil generatif |
| AI document generator | Offer, SP, SK, resignation document | HR/admin | `/ai-docs` | Conditional — LLM provider |
| Integration registry | Webhook/custom integration config dan status | Enterprise admin | `/integrations` | Available framework |
| Test delivery | Menguji konfigurasi integration/webhook | Enterprise admin | `/integrations` | Available framework |
| Upload storage | Local disk atau S3; unduh hanya via auth `GET /api/v1/files/...` (tidak ada public `express.static('/uploads')`); magic-byte + MIME | System/admin | `/api/v1/files`, `/uploads` POST | Available — PRD v8.0 |
| Email outbox | Antrian email + retry (3 immediate lalu queue); notifikasi report job siap | System | `email_outbox` scheduler | Available — PRD v8.0 |

## 10b. Subscription & billing (PRD v5)

| Fitur | Kapabilitas | Pengguna utama | Surface | Status |
|-------|-------------|----------------|---------|--------|
| Current subscription | Tier, features, access mode, recent invoices | Company admin | `/billing`, `/subscription/current` | Available |
| Tier catalog | FREE / STARTER / PROFESSIONAL / BUSINESS / ENTERPRISE | Company admin | `/billing`, `/subscription/tiers` | Available |
| Invoices | List/detail invoice subscription | Company admin | `/billing` | Available |
| Cancel / reactivate | Cancel atau reactivate subscription | Company admin | `/billing` | Available |
| Feature gating | Server-side tier checks + UI nav hide + upgrade prompt | Semua role | Middleware `featureAccess`, AppShell | Available |
| Grace / freeze | Read-only / freeze mode saat overdue | Company admin | Billing + middleware | Available |
| Headcount sync | Enforce employee quota per tier | Company admin/HR | Employee create + subscription service | Available |
| Payment adapter | Adapter pembayaran Xendit/Stripe + UI Bayar di `/billing`; webhook provider | Company admin | `/subscription`, `/billing` | Conditional — provider credentials |

## 11. Platform, branding, security, dan operations

| Fitur | Kapabilitas | Pengguna utama | Surface | Status |
|-------|-------------|----------------|---------|--------|
| Multi-company console | Company listing dan platform visibility | Super admin | `/platform` | Available |
| Organization links | Relasi/hierarchy antar-company | Super admin | `/platform` | Available |
| White-label branding | App name, logo, color dan public branding | Company admin | `/branding` | Available |
| Custom tenant domain | Verified hostname, DNS CNAME metadata, tenant discovery, favicon/email/legal links | Enterprise admin | `/branding`, `/tenants/branding/domain` | Available; DNS/TLS operational |
| Tenant quota | Employee, API/day, storage, concurrent users, query timeout dan request/minute limits | Enterprise admin | `/tenant-management`, `/tenants/quota` | Available |
| Tenant usage monitoring | Daily API/employee/storage usage, quota status dan per-tenant rate enforcement | Admin/operations | `/tenants/quota` | Available |
| Isolation audit | Cross-tenant header attempt blocking dan dedicated tenant audit log | Security/auditor | `/tenants/audit` | Available |
| Audit trail | Actor/action/resource, filter, export, before/after redacted | Admin/auditor | `/audit` | Available |
| Immutable audit | Append-only PostgreSQL enforcement | Platform/security | Database | Available |
| Sensitive-data redaction | Password/token/secret/PII tidak masuk log/telemetry | Platform/security | Backend | Available |
| Health/readiness | Liveness dan DB readiness terpisah | Operations | `/health`, `/ready` | Available |
| Metrics | Prometheus metrics | Operations | `/metrics` | Available |
| Error telemetry | Redacted Sentry integration | Operations | Backend/frontend | Conditional — Sentry config |
| Backup/restore | Daily backup workflow dan restore tooling | Operations | Deployment scripts | Conditional — storage/restore drill |
| CI quality gates | Typecheck, tests, migration/DB control dan load-test workflow | Engineering | CI | Available |
| OpenAPI / Swagger | Spec inti + Swagger UI CDN | Integrator | `/api/v1/openapi.json`, `/api/v1/docs` | Available — PRD v9.0 |
| Tenant API quota | RPM + hard block 10.000 calls/hari | Semua API auth | `authenticate` middleware | Available — PRD v9.0 |
| Privacy / UU PDP export | Export data pribadi, deletion request, daftar processors | Employee/HR/Admin | `/privacy/*`, `docs/legal/` | Available — PRD v10.0 |
| Ops observability | `/alive`, enriched `/health`/`/ready`, Prometheus histogram + rate_limit + payroll_jobs | Operations | `/metrics`, `ops/` | Available — PRD v10.0; Datadog account Conditional |
| Marketing landing MVP | Hero, pricing tiers, FAQ singkat, legal links | Publik | `/welcome`, `/legal/*` | Available — PRD v10.0; DNS Conditional |
| Responsive web | Mobile drawer, responsive forms/cards, local table scroll | Semua role | Seluruh web app | Available |
| Header actions | Notification dan logout di header/navbar kanan | Semua role | App shell | Available |

## 12. Fitur yang belum tersedia (roadmap boundary)

| Fitur roadmap | Status/catatan |
|---------------|----------------|
| Native Android/iOS | Roadmap; produk saat ini mobile-first web |
| 9-box talent matrix | Roadmap PRD v4 Module 3 |
| Succession planning/readiness | Roadmap PRD v4 Module 3 |
| Internal career marketplace | Roadmap PRD v4 Module 4 |
| Rotation/cross-functional program | Roadmap PRD v4 Module 4; berbeda dari rotasi shift yang sudah tersedia |
| Earned wage access | Roadmap PRD v4 Module 5; membutuhkan partner bank |
| External salary benchmarking | Roadmap PRD v4 Module 6; membutuhkan sumber market data |
| Manufacturing vertical package | Roadmap PRD v4 Module 7 |
| Retail vertical package | Roadmap PRD v4 Module 8 |
| Direct bank transfer execution | Belum tersedia; saat ini export/upload/reconciliation data |
| Direct DJP/BPJS submission | Belum tersedia |
| Named accounting ledger integration | Belum tersedia |
| Certified third-party e-sign | Belum tersedia; offer memakai consent + tamper evidence |
| Automated predictive HR decision | Tidak tersedia; turnover risk hanya heuristic decision support |

## 13. Production/UAT dependencies

Fitur berstatus Available berarti implementasi ada, bukan otomatis production-accepted. Go-live perlu memverifikasi:

- migrasi database terbaru, tenant isolation, permission matrix, dan sample data;
- biometric provider, consent, retention, liveness dan false-match acceptance;
- IdP SAML/OAuth, SMTP, browser notification, S3/object storage dan Sentry;
- encryption-key rotation, backup restore drill, RPO/RTO dan audit retention;
- format bank/tax sesuai target customer;
- browser UAT bertanda tangan untuk HR, Manager, Finance, dan Employee;
- authenticated load test terhadap volume data production.

## Referensi source of truth

- [Current implementation baseline](./CURRENT-IMPLEMENTATION.md)
- [Implementation status](./IMPLEMENTATION-STATUS.md)
- [PRD compliance matrix](./PRD-COMPLIANCE-MATRIX.md)
- [API reference](./API.md)
- [Security and NFR evidence](./SECURITY-NFR-EVIDENCE.md)
- Source code: `frontend/src/app`, `frontend/src/components/AppShell.tsx`, `backend/src/routes`, `backend/src/utils/auth.ts`, dan `backend/prisma/schema.prisma`

Jika catalog dan PRD berbeda, verifikasi code/API terbaru lalu perbarui catalog sebelum menyatakan fitur sebagai existing.

---

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| UpdatedAt | July 22, 2026 |
| HEAD | `54273f8` |
| Spec | PRD v4–v10.0 complete · next = v4 Module 3–8 |
