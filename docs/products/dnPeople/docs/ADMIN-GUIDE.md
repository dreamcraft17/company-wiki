# dnPeople — Panduan Admin

**Versi:** 15.0 Admin Console + 14.0 tutorial & onboarding  
**UpdatedAt:** 26 Juli 2026  
**Audience:** COMPANY_ADMIN, SUPER_ADMIN, implementer  

## 1. Setup awal tenant

1. Register company atau seed demo.
2. `/org` — departemen, posisi, level, lokasi (geofence + WiFi SSID).
3. `/staff-accounts` — buat akun login (standalone atau linked employee), role, reset password.
4. Import karyawan (`/employees` Excel).
5. `/payroll-settings` — metode pajak, BPJS, komponen gaji, template.
6. Jalankan payroll demo di `/payroll` dan verifikasi slip.
7. Pastikan seed tutorial/KB sudah jalan (`prisma/seedTutorials.ts` via `seed.ts`) — tunjukkan Help `?` ke user baru. Matikan dengan `FEATURE_TUTORIALS=false` bila perlu.

## 2. Admin Console (SUPER_ADMIN / DN Tech)

Internal SaaS panel di **`/admin`** (bukan shell customer) — dipakai tim DN Tech untuk mengelola semua client dnPeople. MFA TOTP **opsional** (default off); aktifkan dengan `ADMIN_MFA_REQUIRED=true` bila mau.

### Akun operator (SRS AC-1.1)

| | |
|---|---|
| Tenant | **DN Tech** (PT. Dozer Napitupulu Technology) — internal, bukan customer |
| Email | `dozer@dntech.id`, `admin@dntech.id` (override: `SUPER_ADMIN_EMAILS` atau `SUPER_ADMIN_EMAIL` untuk akun pertama) |
| Password | `SUPER_ADMIN_PASSWORD` (sama untuk semua operator); **dev fallback** `Admin123!` (wajib di-set di production) |
| Role | `SUPER_ADMIN` |
| Seed | `prisma/seedAdmin.ts` (ikut `npm run db:seed`, idempotent) |

Login normal di `/login` — tenant auto-discover dari domain `dntech.id`. Setelah login, buka `/admin` (atau `/platform`). Kredensial ini **tidak** ditampilkan di UI (beda dari demo sandbox FREE).

Tenant DN Tech dibuat ENTERPRISE dengan `isPlatformOperator=true` + subscription Rp0: **bukan customer**. Admin Console mengecualikan operator dari daftar customers, MRR/ARR, churn, cohort, dan feature-adoption analytics. Yang membedakan dari client ENTERPRISE biasa adalah role `SUPER_ADMIN` + akses `/admin`, bukan paket berlangganan.

| Modul | Path | Catatan |
|-------|------|---------|
| Dashboard | `/admin` | Summary revenue + at-risk + health |
| Customers | `/admin/customers` | Sort/filter, detail, trial, notes, block, impersonate |
| Billing | `/admin/billing` | MRR/ARR, payments, refund |
| Analytics | `/admin/analytics/*` | Features, tutorials, churn, support, cohort |
| Support | `/admin/support/tickets` | Reply, escalate, send KB, close + CSAT email |
| Content | `/admin/content/tutorials` | CRUD tutorial & KB + publish |
| Feature flags | `/admin/flags` | Toggle/rollout/tier + history (runtime via `featureAccess`) |
| Health | `/admin/health`, `/admin/health/logs` | API/DB/queue, alerts ack, logs |
| Audit | `/admin/audit-log` | Admin action log |

Impersonation: banner di AppShell customer; end via banner → home token. Subscription mutations diblokir saat impersonating.

Seed flags/tickets: `prisma/seedAdmin.ts` (chained dari `seed.ts`).

## 3. SSO / IdP

1. `/sso` — pilih Google / Microsoft / SAML.
2. Isi metadata IdP, audience, enforce-SSO bila perlu.
3. Uji ACS/callback; sukses login **set cookie** (JWT tidak lagi di URL).
4. SCIM: token di `/tenant-management` → endpoint `/scim/v2/:tenantId`.

Checklist IdP: Okta · Azure AD · Google Workspace — uji satu user + JIT + deprovision.

## 4. Kuota & rate limit tenant

- Default **10.000 API calls/hari** dan RPM per tenant (`TenantQuota`).
- Melebihi limit → HTTP **429** (`TENANT_DAILY_API_LIMIT` / `TENANT_RATE_LIMIT`).
- Pantau di `/tenant-management` → quota/usage.

## 5. Billing

- `/billing` — stat cards paket/status/karyawan/estimasi; pilih tier; riwayat invoice dengan filter **Semua / Perlu bayar / Lunas**; pratinjau trial Rp 0 disembunyikan default.
- Bayar invoice: tombol **Bayar** → redirect Xendit test/live. Metode bayar (JeniusPay, QRIS, ShopeePay, dll.) tampil setelah lunas.
- **Unduh PDF** per invoice — `GET /api/v1/subscription/invoices/:id.pdf`.
- Butuh `XENDIT_SECRET_KEY` + email billing valid. Lihat [xendit/XENDIT-PAYMENT-SETUP.md](./xendit/XENDIT-PAYMENT-SETUP.md).
- Webhook: `POST /api/v1/webhooks/xendit` (bukan legacy Stripe path).

## 6. Keamanan production

- Pastikan migrasi terbaru: `npx prisma migrate deploy` (termasuk admin dashboard v15 + password reset + indeks v8).
- File hanya via `/api/v1/files/...` (auth).
- API key: scopes wajib; kosong = deny; `*` = admin.
- SUPER_ADMIN: MFA Admin Console opsional (`ADMIN_MFA_REQUIRED=true` untuk enforce).
- Backup: `scripts/backup-database.sh` + restore drill (lihat DEPLOYMENT.md).
- Metrics: `/metrics` (opsional `METRICS_TOKEN`); Sentry via `SENTRY_DSN`.

## 7. Onboarding customer

Gunakan playbook 10 langkah: [CUSTOMER-ONBOARDING-PLAYBOOK.md](./CUSTOMER-ONBOARDING-PLAYBOOK.md).

## Referensi

- [USER-GUIDE.md](./USER-GUIDE.md)
- [API.md](./API.md) § Admin console
- [SLA-SUPPORT-POLICY.md](./SLA-SUPPORT-POLICY.md)
- [UU-PDP-COMPLIANCE-CHECKLIST.md](./UU-PDP-COMPLIANCE-CHECKLIST.md)
- OpenAPI UI: `/api/v1/docs`
