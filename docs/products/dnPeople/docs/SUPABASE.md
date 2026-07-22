# dnPeople — Koneksi Database Supabase

**Last Updated:** July 10, 2026  
**Stack:** Prisma + PostgreSQL (Supabase managed)

> **Default lokal (tanpa Docker):** pakai Supabase Session pooler. Tidak perlu `docker compose` / Postgres lokal.

dnPeople hanya butuh `DATABASE_URL` PostgreSQL. Redis **tidak** dipakai (dihapus dari compose, PRD v8.0 P2-R02).

---

## Cara konek (tanpa Docker) — ringkas

### 1. Ambil string dari Supabase

Dashboard → **Connect** → pilih **Session pooler** (Shared), **bukan** Direct.

Untuk project dnPeople saat ini:

| Field | Value |
|-------|-------|
| Host | `aws-1-ap-northeast-2.pooler.supabase.com` |
| Port | `5432` |
| Database | `postgres` |
| User | `postgres.bikhnyqslizcckusiyrg` |

URI:

```text
postgresql://postgres.bikhnyqslizcckusiyrg:[YOUR-PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

### 2. Isi `backend/.env`

```bash
cd dnpeople/backend
cp .env.example .env
# edit .env — ganti YOUR_PASSWORD
```

Isi minimal:

```env
DATABASE_URL="postgresql://postgres.bikhnyqslizcckusiyrg:YOUR_PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require&schema=public"
JWT_SECRET="ganti-secret-lokal-minimal-32-char"
JWT_EXPIRES_IN="24h"
PORT=4100
FRONTEND_URL="http://localhost:3001"
TRUST_PROXY=false
```

Catatan `.env`:

- Tambahkan `?sslmode=require&schema=public` (Supabase wajib SSL)
- Password dengan `@` `#` dll. → percent-encode (`@` → `%40`)
- File `.env` **jangan di-commit** (sudah di `.gitignore`)
- `.env.example` hanya placeholder `YOUR_PASSWORD`

### 3. Sync schema + seed + jalanin API

```bash
cd dnpeople/backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed          # opsional — demo admin/budi
npm run dev              # http://localhost:4100
```

### 4. Frontend

```bash
cd dnpeople/frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4100/api/v1
npm install
npm run dev              # http://localhost:3001
```

Login demo (setelah seed): `dina.wijaya@demo.dnpeople.id` / `Demo123!` — lihat [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md)

---

## Kenapa Session pooler, bukan Direct?

| Mode | Host | Catatan |
|------|------|---------|
| **Session pooler (pakai ini)** | `aws-1-ap-northeast-2.pooler.supabase.com:5432` | IPv4, cocok laptop/VPS tanpa Docker |
| Direct | `db.bikhnyqslizcckusiyrg.supabase.co:5432` | Sering **IPv6-only** → error `P1001` |

User pooler = `postgres.<project-ref>` (bukan `postgres` saja).

---

## 1. Buat project Supabase (project baru)

1. Buka [https://supabase.com](https://supabase.com) → **New project**
2. Set **Database password** — simpan di password manager
3. **Connect** → **Session pooler** → copy URI ke `DATABASE_URL`
4. Jangan menebak region host (`aws-0-…` vs `aws-1-…`) — selalu copy dari dashboard

### Project dnPeople (sudah ada)

```env
DATABASE_URL="postgresql://postgres.bikhnyqslizcckusiyrg:YOUR_PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require&schema=public"
```

Direct (hanya jika jaringan Anda support IPv6):

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.bikhnyqslizcckusiyrg.supabase.co:5432/postgres?sslmode=require&schema=public"
```

### Agent Skills (opsional)

```bash
cd dnpeople
npx skills add supabase/agent-skills
```

Terpasang di: `.agents/skills/supabase` dan `.agents/skills/supabase-postgres-best-practices`.

---

## 2. Mode connection (referensi)

| Mode | Kapan | Host tipikal |
|------|-------|--------------|
| **Session pooler** | Dev lokal tanpa Docker, VPS IPv4, `db push` / seed | `aws-1-<region>.pooler.supabase.com:5432` |
| **Transaction pooler** | Serverless / banyak koneksi singkat | pooler `:6543` + `pgbouncer=true` |
| **Direct** | Mesin dengan IPv6 / IPv4 add-on Supabase | `db.<ref>.supabase.co:5432` |

### Pola dual-URL (opsional)

Jika runtime pakai transaction pooler, Prisma bisa pakai `directUrl` untuk migrate. Schema repo saat ini hanya `url = env("DATABASE_URL")` — Session pooler saja sudah cukup.

---

## 3. Network / firewall Supabase

**Project Settings → Database → Network Restrictions**

- Dev: izinkan IP Anda, atau sementara allow all saat setup
- Production: allowlist IP VPS
- SSL wajib (`sslmode=require`)

---

## 4. Migrasi schema

```bash
npx prisma db push          # cepat (dev / first deploy)
# nanti production:
# npx prisma migrate deploy
```

Jangan `db:seed` di production customer kecuali bootstrap sengaja.

---

## 5. Troubleshooting

| Gejala | Perbaikan |
|--------|-----------|
| `P1001 Can't reach database` | Pakai **Session pooler**, bukan Direct; cek password & region host dari dashboard |
| `tenant/user … not found` | User harus `postgres.<project-ref>`; host harus region yang benar (`aws-1-ap-northeast-2` untuk project ini) |
| `P1011` / SSL error | Tambah `?sslmode=require` |
| Password gagal parse | Percent-encode karakter khusus |
| Masih pakai Docker? | Opsional saja — `docker compose up -d` lalu `DATABASE_URL` ke `localhost:5433`. **Tidak wajib.** |

---

## 6. Keamanan

- Jangan commit `.env` / password
- Rotate password jika pernah ter-expose di chat/commit
- Backup: aktifkan PITR di plan Supabase yang mendukung
- Supabase Auth / Storage **tidak** dipakai dnPeople MVP — hanya Postgres

---

## Lihat juga

- [DEPLOYMENT.md](./DEPLOYMENT.md) — overview (tanpa Docker = Supabase)
- [VPS.md](./VPS.md) — install API/frontend di VPS
- [ARCHITECTURE.md](./ARCHITECTURE.md)

---

*Last Updated: July 10, 2026*
