# dnPeople — Panduan Admin

**Versi:** 9.0 launch readiness  
**UpdatedAt:** 19 Juli 2026  
**Audience:** COMPANY_ADMIN, SUPER_ADMIN, implementer  

## 1. Setup awal tenant

1. Register company atau seed demo.
2. `/org` — departemen, posisi, level, lokasi (geofence + WiFi SSID).
3. `/staff-accounts` — buat akun login (standalone atau linked employee), role, reset password.
4. Import karyawan (`/employees` Excel).
5. `/payroll-settings` — metode pajak, BPJS, komponen gaji, template.
6. Jalankan payroll demo di `/payroll` dan verifikasi slip.

## 2. SSO / IdP

1. `/sso` — pilih Google / Microsoft / SAML.
2. Isi metadata IdP, audience, enforce-SSO bila perlu.
3. Uji ACS/callback; sukses login **set cookie** (JWT tidak lagi di URL).
4. SCIM: token di `/tenant-management` → endpoint `/scim/v2/:tenantId`.

Checklist IdP: Okta · Azure AD · Google Workspace — uji satu user + JIT + deprovision.

## 3. Kuota & rate limit tenant

- Default **10.000 API calls/hari** dan RPM per tenant (`TenantQuota`).
- Melebihi limit → HTTP **429** (`TENANT_DAILY_API_LIMIT` / `TENANT_RATE_LIMIT`).
- Pantau di `/tenant-management` → quota/usage.

## 4. Billing

- `/billing` — lihat paket, upgrade, invoice.
- Bayar invoice: tombol **Xendit** / **Stripe** / **Manual** (memerlukan kredensial provider di env).
- Webhook: `POST /api/v1/subscription/webhooks/:provider`.

## 5. Keamanan production

- Pastikan migrasi terbaru: `npx prisma migrate deploy` (termasuk password reset + indeks v8).
- File hanya via `/api/v1/files/...` (auth).
- API key: scopes wajib; kosong = deny; `*` = admin.
- Backup: `scripts/backup-database.sh` + restore drill (lihat DEPLOYMENT.md).
- Metrics: `/metrics` (opsional `METRICS_TOKEN`); Sentry via `SENTRY_DSN`.

## 6. Onboarding customer

Gunakan playbook 10 langkah: [CUSTOMER-ONBOARDING-PLAYBOOK.md](./CUSTOMER-ONBOARDING-PLAYBOOK.md).

## Referensi

- [USER-GUIDE.md](./USER-GUIDE.md)
- [SLA-SUPPORT-POLICY.md](./SLA-SUPPORT-POLICY.md)
- [UU-PDP-COMPLIANCE-CHECKLIST.md](./UU-PDP-COMPLIANCE-CHECKLIST.md)
- OpenAPI UI: `/api/v1/docs`
