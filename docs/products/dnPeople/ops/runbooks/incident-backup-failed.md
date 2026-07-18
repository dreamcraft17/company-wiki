# Incident Runbook — Backup Failed / Stale

**Alert:** `verify-backup.sh` exit non-zero atau backup age > 26h

## Steps
1. Jalankan `bash scripts/verify-backup.sh` manual — baca error
2. Cek disk space + `BACKUP_S3_URI` credentials
3. Jalankan `bash scripts/backup-database.sh` segera
4. Jika restore diperlukan: ikuti `docs/RESTORE-DRILL-RUNBOOK.md` / `scripts/restore-drill.sh` di **staging** dulu
5. Escalate critical ke Dozer + Finance bila RPO berisiko tembus 1 jam
