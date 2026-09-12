# Runbook: VPS PostgreSQL untuk DOVA staging (`stg`)

> **Status:** Active · **Last updated:** 2026-09-11 · **Author:** Dozer  
> **Audience:** Ops / engineering  
> **App:** [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova) branch **`stg`**  
> **Related:** [VPS-DEPLOY.md](./VPS-DEPLOY.md) · [ENV-SETUP.md](./ENV-SETUP.md) · [STAGING-GO-LIVE.md](./STAGING-GO-LIVE.md) · [vps-backend.env.example](./vps-backend.env.example) · app `.env.staging.example`

Panduan ini hanya untuk **membuat dan menghubungkan database PostgreSQL di dalam VPS** supaya API staging jalan dengan `USE_IN_MEMORY=false`. Bukan deploy Nginx/PM2 lengkap (itu [VPS-DEPLOY.md](./VPS-DEPLOY.md)).

---

## When to use

- VPS staging baru, atau Postgres belum terpasang.
- Staging masih in-memory / data hilang tiap restart.
- Staging **satu VPS dengan production** dan kamu butuh DB **terpisah** (jangan pakai database `dova` produksi).

---

## Prerequisites

- Ubuntu **22.04 / 24.04** (lihat [VPS-DEPLOY.md](./VPS-DEPLOY.md))
- SSH sudo
- Repo DOVA di VPS (contoh path: `/var/www/dova`, `~/dova`, atau `/var/www/dntech/dova`)
- Branch **`stg`** di-checkout untuk proses migrate/seed
- Node 20 + `npm` (migrate memakai `npm run db:migrate`)

**Jangan** buka port `5432` ke internet. App dan `psql` cukup lewat `127.0.0.1`.

---

## Naming (wajib kalau prod sudah di VPS yang sama)

| Item | Staging (disarankan) | Production (jangan sentuh) |
|------|----------------------|----------------------------|
| Database | `dova_staging` | `dova` (template VPS prod) |
| Role | `dova_stg` | `dova` |
| `DATABASE_URL` host | `127.0.0.1:5432` | `127.0.0.1:5432` |

Nama `dova_staging` mengikuti template repo `.env.staging.example`. Kalau VPS **hanya** untuk stg, nama `dova` / `dova_stg` boleh — tetap `USE_IN_MEMORY=false`.

Password: generate, jangan commit. Kalau password berisi `@ : / # %`, URL-encode di `DATABASE_URL`.

```bash
openssl rand -base64 24
```

---

## Procedure

### 1. Install PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
sudo systemctl status postgresql --no-pager
```

### 2. Buat role + database staging

Ganti `STG_DB_PASSWORD` dengan hasil `openssl`. Jangan copy password ke tiket/chat.

```bash
sudo -u postgres psql <<'SQL'
CREATE USER dova_stg WITH PASSWORD 'STG_DB_PASSWORD';
CREATE DATABASE dova_staging OWNER dova_stg;
GRANT ALL PRIVILEGES ON DATABASE dova_staging TO dova_stg;
SQL
```

Kalau error `already exists`, cek dulu — **jangan** `DROP DATABASE` kalau ragu itu DB prod:

```bash
sudo -u postgres psql -c '\l'
sudo -u postgres psql -c '\du'
```

### 3. Cek login lokal

```bash
psql "postgresql://dova_stg:STG_DB_PASSWORD@127.0.0.1:5432/dova_staging" -c 'SELECT current_database(), current_user;'
```

Harus tampil `dova_staging` / `dova_stg`.

Opsional — pastikan cluster hanya listen localhost:

```bash
sudo ss -lntp | grep 5432 || true
```

Kalau terlihat `0.0.0.0:5432`, perbaiki `listen_addresses` di `postgresql.conf` ke `localhost` lalu `sudo systemctl reload postgresql`. Jangan expose DB ke publik.

### 4. Isi `DATABASE_URL` di env API staging

`scripts/migrate.js` dan `scripts/seed.js` load **root** `.env` lalu **`apps/backend/.env`** (`scripts/load-env.js`). Di VPS biasanya cukup file backend.

Di `apps/backend/.env` (proses staging / PM2 stg):

```env
USE_IN_MEMORY=false
DATABASE_URL=postgresql://dova_stg:STG_DB_PASSWORD@127.0.0.1:5432/dova_staging
```

Nama env lain (JWT, Paystack, `FRONTEND_URL`) ada di [vps-backend.env.example](./vps-backend.env.example) dan `.env.staging.example`. **Jangan** mengarahkan PM2 production ke URL `dova_staging` atau sebaliknya.

### 5. Migrate (branch `stg`)

Dari root repo di VPS:

```bash
cd /var/www/dova   # sesuaikan path
git fetch origin
git checkout stg
git pull
npm ci             # atau npm install jika itu yang dipakai VPS ini
npm run db:migrate
```

Script menerapkan `database/migrations/*.sql` berurutan (`001` … `008` saat dokumen ini ditulis) dan mencatat nama file di tabel `schema_migrations`. File yang sudah applied di-skip.

Kalau `DATABASE_URL is required`: file `.env` belum kebaca — cek path `apps/backend/.env` dan jalankan ulang dari **root** repo.

### 6. Seed demo (opsional, staging saja)

```bash
npm run db:seed
```

Ini upsert `admin@dova.local` / `supplier@dova.local` (password dari `ADMIN_PASSWORD` / `SUPPLIER_PASSWORD` di env, default di seed: `admin1234` / `supplier1234`). **Jangan** jalankan seed ke database production.

Reset password demo saja: `npm run db:reset-logins`. Catalog extra: `npm run db:sync-catalog`. Week-3 extras: `npm run db:seed:week3` (lihat [STAGING-GO-LIVE.md](./STAGING-GO-LIVE.md)).

### 7. Restart API staging

```bash
pm2 restart <nama-proses-stg> --update-env
curl -sS http://127.0.0.1:<PORT>/api/v1/health
```

Nama PM2 production di runbook: `dova-backend` / `dova-api`. Proses **stg** bisa beda — cek `pm2 status`. Port API prod di salah satu contoh env wiki: `4201`; template VPS: `3000`. Pakai `PORT` yang ada di `.env` staging.

---

## Verify

```bash
sudo -u postgres psql -d dova_staging -c '\dt'
sudo -u postgres psql -d dova_staging -c 'SELECT filename FROM schema_migrations ORDER BY filename;'
```

Harus ada tabel aplikasi (`users`, `products`, …) plus `schema_migrations`. Login API dengan demo seed, atau smoke:

```bash
# dari mesin yang bisa hit API staging (sesuaikan URL)
npm run smoke:staging
# atau: API_URL=https://<host-api-stg>/api/v1 npm run smoke:week4
```

`smoke:staging` di `package.json` = `scripts/smoke-production-api.js` — butuh API URL/env sesuai script itu, bukan tebakan hostname. Kalau hostname staging belum ada, smoke lewat `curl` health + login Cukup untuk gate DB.

---

## Rollback

- **Salah migrate di staging:** restore dump staging (bukan prod).
- **Salah DB (nembak prod):** segera hentikan PM2 stg, cek `DATABASE_URL`, restore prod dari backup. Jangan `DROP DATABASE dova`.

Dump sebelum eksperimen:

```bash
sudo -u postgres pg_dump -Fc dova_staging -f /var/backups/dova_staging_$(date +%Y%m%d).dump
# restore:
# sudo -u postgres pg_restore -d dova_staging --clean /var/backups/dova_staging_YYYYMMDD.dump
```

Hapus DB staging (hanya jika yakin nama `dova_staging`):

```bash
sudo -u postgres psql -c 'DROP DATABASE IF EXISTS dova_staging;'
sudo -u postgres psql -c 'DROP ROLE IF EXISTS dova_stg;'
```

---

## Troubleshooting

| Gejala | Arti |
|--------|------|
| `DATABASE_URL is required` | `.env` tidak ter-load; jalankan migrate dari root repo |
| `password authentication failed` | Role/password tidak match URL |
| `database "dova_staging" does not exist` | Step 2 belum dijalankan |
| `permission denied` pada `CREATE TABLE` | Database bukan `OWNER dova_stg` |
| API hidup tapi data hilang | Masih `USE_IN_MEMORY=true` |
| Login toast / catalog aneh | Bukan soal Postgres; lihat [DOVA-INTEGRATION-QA.md](./DOVA-INTEGRATION-QA.md) |

---

## Escalation

Kalau `psql` lokal gagal setelah 10 menit: cek `journalctl -u postgresql -n 80` lalu ping owner VPS / Dozer. Jangan ubah `pg_hba.conf` ke `trust` di production host.

*Author: Dozer · 2026-09-11*
