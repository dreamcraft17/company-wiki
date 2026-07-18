# Incident Runbook — Elevated Error Rate

**Alert:** 5xx error rate > 1% / > 5%

## Steps
1. Cek Sentry (redacted) untuk exception terbaru
2. Cek `/ready` — database ok?
3. Cek deploy terakhir / migrasi
4. Rollback jika regresi jelas
5. Notify customers via status page / email bila > 15 menit critical
