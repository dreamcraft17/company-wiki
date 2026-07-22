# dnPeople — Restore Drill Runbook

**UpdatedAt:** 22 Juli 2026  
**Target:** RPO < 1 jam · RTO < 4 jam  
**Related:** [SLA-COMMITMENT-RPO-RTO.md](./SLA-COMMITMENT-RPO-RTO.md) · [ops/runbooks/database-restore.md](../ops/runbooks/database-restore.md)

## Prasyarat

- `BACKUP_DATABASE_URL` / cron `scripts/backup-database.sh` berjalan harian (lihat `.github/workflows/backup.yml`)
- Akses object storage atau path lokal hasil backup
- Staging DB terpisah (jangan restore langsung ke production tanpa freeze)

## Langkah drill (staging)

1. Catat waktu mulai + hash file backup yang dipilih.  
2. `bash scripts/restore-drill.sh <backup-file>` ke database staging (wrapper restore + integrity COUNT).  
   Atau manual: `bash scripts/restore-database.sh <backup-file>`.
3. `npx prisma migrate deploy` bila perlu.  
4. Boot API + smoke: `bash scripts/smoke-test.sh` + login admin, buka 1 payslip, 1 attendance.  
5. Verifikasi integrity output: `employees`, `payslips`, `attendance_records`, `leave_requests` COUNT > 0 (staging dengan data).  
6. Catat waktu selesai → hitung RTO.  
7. Bandingkan timestamp backup vs last write production → hitung RPO.  
8. Isi hasil di tabel di bawah; simpan log di ticket ops.

## Hasil drill

| Tanggal | Operator | Backup dipakai | RPO | RTO | Lulus? | Catatan |
|---------|----------|----------------|-----|-----|--------|---------|
| | | | | | [ ] | |

## Failover catatan

- Single VPS: restore = primary recovery path hingga HA tersedia.  
- Setelah restore production: rotate `JWT` secrets hanya jika dicurigai compromise; notify customers bila RPO > SLA.
