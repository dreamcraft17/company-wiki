# Incident Runbook — High API Latency

**Alert:** API latency p95 > 1s (warning) / > 2s (critical)  
**Related:** FR-OPS-002 AC-2.3

## What this means
Clients melihat respons lambat. Bisa DB, N+1, export besar, atau pool habis.

## Common causes
1. Query lambat / missing index pada payroll/attendance
2. Export sync besar tanpa job async
3. Connection pool saturated
4. Disk I/O tinggi (backup overlapping)

## Steps
1. Buka `/metrics` — cek `http_request_duration_seconds`, `db_connections_*`, `http_requests_errors_total`
2. Cek Datadog APM/logs untuk endpoint teratas
3. `SELECT * FROM pg_stat_activity` (staging/prod) — long queries
4. Jika export: pastikan client pakai `/reports/jobs`
5. Scale vertically sementara / restart API jika hung
6. Escalate ke Dozer jika > 15 menit tanpa ack

## Resolve
Incident auto-resolve saat p95 kembali di bawah threshold 5 menit.
