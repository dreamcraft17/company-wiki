# Runbook: VPS Postgres — tunnel, cek, dan seed

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer

| Field | Value |
|-------|-------|
| Severity | P2 (ops relaunch; bukan incident) |
| On-call | Dozer |
| Last verified | 2026-08-29 |

## Summary

Cara mengisi PostgreSQL production DN Tech **dari laptop** lewat SSH tunnel, tanpa membuka port `5432` ke internet. Dokumen ini mencatat perintah yang **benar-benar dijalankan** pada 2026-08-29, plus langkah ulang yang aman.

Jangan paste `DATABASE_URL`, password, atau isi `.env` ke chat / git.

## When to use

- Relaunch: seed branding jujur + katalog first-party ke DB VPS.
- Cek apakah Postgres di VPS hidup sebelum seed.
- Laptop perlu Prisma/`psql` ke DB yang hanya listen `127.0.0.1:5432` di VPS.

Ticket terkait: BF-013 (ops seed production). Lihat [BUG_FIXES.md](../BUG_FIXES.md).

## Prerequisites

- SSH host alias `dntech` di `~/.ssh/config` (User / IdentityFile / HostName — jangan commit).
- Repo lokal `dntech/` dengan `scripts/db-vps.sh` executable.
- npm di `backend/` (`db:vps`, `db:vps:tunnel`, `db:vps:seed`).
- Env **nama saja:** `DATABASE_URL` (dibaca dari VPS `~/dntech/backend/.env`, ditulis ke `backend/.env.vps` yang gitignored), `ADMIN_PASSWORD` (wajib di **shell laptop** untuk `db:vps:seed` / `db:seed`), `NODE_ENV` (skrip seed full set `production`).
- Postgres di VPS bind localhost only — jangan buka `5432` publik.

## Hasil sesi 2026-08-29 (faktual)

Urutan di bawah adalah yang dijalankan. Output disanitasi (tanpa URL, password, UUID).

### 1. Cek Postgres di VPS (SSH)

Sesi yang sama (sebelum seed laptop): host alias `dntech`.

| Cek | Hasil |
|-----|--------|
| PostgreSQL | 16.15, cluster `16/main` online |
| Listen | `127.0.0.1:5432` saja |
| Database | `dntech` (plus `postgres`) |
| App `.env` | `~/dntech/backend/.env` ada |

Perintah setara (jalankan sendiri di VPS jika perlu ulang):

```bash
ssh dntech
sudo systemctl status postgresql@16-main
sudo ss -tlnp | grep 5432
```

### 2. Tunnel laptop → VPS

```bash
cd /path/to/dntech
bash scripts/db-vps.sh status
# atau dari backend/:
npm run db:vps:tunnel
```

**Hasil 2026-08-29:** `tunnel: up  127.0.0.1:5433  (ssh dntech)`.

Tunnel mem-forward `127.0.0.1:5433` (laptop) → `127.0.0.1:5432` (VPS). Skrip menulis `backend/.env.vps` (mode 600, gitignored) dari `DATABASE_URL` VPS dengan host diganti ke tunnel.

### 3. Ping schema (baca saja)

Via `scripts/db-vps.sh with` + Prisma (tanpa dump isi rahasia):

| Metrik | Sebelum seed branding/produk | Sesudah |
|--------|------------------------------|---------|
| Tabel `public` | 24 | 24 |
| `products` | 7 | 7 |
| `users` | 1 | 1 (tidak diubah) |
| `brandContent` | 0 | 1 |
| `coreValues` | 0 | 5 |
| `competitiveAdvantages` | — | 4 |
| `siteSettings` | 1 | 1 (`aboutContent` terisi) |
| `stats` | 0 | 4 |

User app: `dntech_user`, database: `dntech`.

### 4. `ADMIN_PASSWORD` di VPS — blokir seed admin

Klasifikasi **tanpa mencetak nilai:** file `.env` VPS ada, baris `ADMIN_PASSWORD=` **tidak ada** (`CLASS=missing`).

Karena itu `npm run db:seed` tidak dijalankan: `db-vps.sh seed` set `NODE_ENV=production`, dan production menolak password kosong / default (`Admin@123456`, dll.). Memutar hash admin tanpa password yang kamu pegang akan mengunci login `/admin`.

### 5. `db:vps:seed` (full) — ditolak seperti dirancang

```bash
cd backend
npm run db:vps:seed
```

**Hasil:**

```text
error: export ADMIN_PASSWORD in this shell first (min 12 chars; VPS seed refuses defaults)
```

Exit code 1. Tidak ada perubahan DB dari langkah ini.

### 6. Seed yang berhasil (tunnel sudah up)

```bash
cd /path/to/dntech
bash scripts/db-vps.sh with npm run db:seed-branding
bash scripts/db-vps.sh with npm run db:seed-products
```

**Branding:** `Branding seed complete`.

**Produk (7, exclude DOVA):**

| slug | name |
|------|------|
| `dncore` | dnCore |
| `dnpeople` | dnPeople |
| `dnshop-finance` | dnShop Finance |
| `duavulnscanner` | DuaVulnScanner |
| `nearwork` | Nearwork |
| `threads-automation` | Threads Automation |
| `trusted-jurist` | Trusted Jurist |

Semua `status: active` setelah seed.

`db:seed-homepage` **tidak** dijalankan (bukan bagian `db-vps.sh seed`).

`npx prisma db push` **tidak** dijalankan; schema sudah punya 24 tabel dan 7 produk sebelum re-seed.

**Backup `pg_dump` sebelum seed tidak diambil.** Product seed menimpa baris katalog yang sudah ada.

Stat branding yang tertulis ke DB (dari `seed-branding.ts`, bukan hasil hitung test di mesin ini): Produk First-Party `6`, Produk Live / Beta `4`, Tahun Membangun `3`, Automated Tests `81`. Ada 7 baris `products` — angka `6` vs `7` berasal dari seed, bukan dari query terpisah.

## Procedure (ulang di mesin lain)

1. Pastikan tunnel:

   ```bash
   cd backend
   npm run db:vps:tunnel
   npm run db:vps -- status
   ```

2. (Opsional) backup dulu — lihat [POSTGRES-VPS-ACCESS.md](../POSTGRES-VPS-ACCESS.md) §9. **Tidak dijalankan** pada sesi 2026-08-29.

3. Branding + katalog (aman tanpa `ADMIN_PASSWORD`). `with` **menolak** `db:seed` (bootstrap admin):

   ```bash
   npm run db:vps -- with npm run db:seed-branding
   npm run db:vps -- with npm run db:seed-products
   ```

4. Bootstrap admin **hanya** jika kamu sudah punya password kuat (≥12, bukan default) di **shell laptop**, lalu samakan di VPS `.env`:

   ```bash
   export ADMIN_PASSWORD='…'   # jangan commit; jangan default dokumentasi
   npm run db:vps:seed
   ```

   `db:vps:seed` = `db:seed` + `db:seed-branding` + `db:seed-products` dengan `NODE_ENV=production` dan `ROTATE_ADMIN=1` (memutar hash admin).

   Schema push ke VPS:

   ```bash
   CONFIRM_VPS_PUSH=1 npm run db:vps -- push
   ```

5. Tutup tunnel jika selesai:

   ```bash
   npm run db:vps -- stop
   ```

## Rollback

- **Branding:** `seed-branding` `deleteMany` lalu insert ulang. Rollback = restore dump, atau jalankan lagi seed dari commit yang diinginkan.
- **Produk:** upsert per slug. Rollback = restore dump atau seed ulang dari git lama.
- **Admin (`db:seed`):** tidak dijalankan 2026-08-29. Hash hanya berubah jika `ROTATE_ADMIN=1` (lewat `db:vps:seed`). Simpan password yang di-export, update `ADMIN_PASSWORD` di VPS `.env`.

## Escalation

Jika tunnel gagal: cek `ssh dntech` (BatchMode), `lsof` port `5433`, Postgres `postgresql@16-main` di VPS.

Jika seed admin gagal di production: set `ADMIN_PASSWORD` valid di laptop **dan** VPS `.env`; jangan pakai `Admin@123456`.

Stuck >15 menit: Dozer (akses SSH + `.env` VPS).

## Related

- [POSTGRES-VPS-ACCESS.md](../POSTGRES-VPS-ACCESS.md) — stub; SSOT `psql`/tunnel: [private-wiki/dntech/infra/POSTGRES-VPS-ACCESS.md](../../../private-wiki/dntech/infra/POSTGRES-VPS-ACCESS.md)
- `scripts/db-vps.sh` — tunnel, `.env.vps`, `push` / `seed` / `with`
- `backend/package.json` — `db:vps`, `db:vps:tunnel`, `db:vps:seed`, `db:seed-*`
- [DEPLOYMENT-PRODUCTION.md](../DEPLOYMENT-PRODUCTION.md)
- [launch/README.md](../launch/README.md)
