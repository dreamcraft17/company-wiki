# dnPeople — Koneksi Database Supabase

**Last Updated:** July 10, 2026  
**Stack:** Prisma + PostgreSQL (Supabase managed)

dnPeople memakai PostgreSQL biasa lewat `DATABASE_URL`. Supabase cocok sebagai DB production/staging tanpa menjalankan Postgres di VPS.

---

## 1. Buat project Supabase

1. Buka [https://supabase.com](https://supabase.com) → **New project**
2. Pilih org, nama project (mis. `dnpeople-prod`), region terdekat (Singapore / Jakarta jika tersedia)
3. Set **Database password** kuat — simpan di password manager
4. Tunggu project siap (~1–2 menit)

---

## 2. Ambil connection string

Di dashboard Supabase:

**Project Settings → Database → Connection string**

Pilih mode yang sesuai:

| Mode | Kapan dipakai | Port / host tipikal |
|------|---------------|---------------------|
| **URI (Direct)** | Migrasi Prisma, `db push`, seed, admin tools | `db.<ref>.supabase.co:5432` |
| **Transaction pooler (Supavisor)** | App runtime (API Express) di serverless / banyak koneksi | `aws-0-<region>.pooler.supabase.com:6543` |
| **Session pooler** | Alternatif jika IPv6/direct bermasalah dari VPS | pooler `:5432` |

### Format Direct (disarankan untuk Prisma migrate / push)

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require&schema=public"
```

### Format Pooler (disarankan untuk runtime API di production)

```env
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&schema=public"
```

> Ganti `YOUR_PASSWORD` (URL-encode karakter khusus: `@` → `%40`, `#` → `%23`, dll.).  
> Region host pooler mengikuti project Anda — copy dari dashboard, jangan menebak.

### Pola dual-URL (opsional, best practice)

Prisma mendukung `directUrl` untuk migrate saat `url` memakai pooler. Jika ingin pola ini, ubah `schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")       // pooler (runtime)
  directUrl = env("DIRECT_URL")         // direct :5432 (migrate)
}
```

Lalu di `.env`:

```env
DATABASE_URL="postgresql://postgres.REF:PASS@...pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&schema=public"
DIRECT_URL="postgresql://postgres:PASS@db.REF.supabase.co:5432/postgres?sslmode=require&schema=public"
```

Schema repo saat ini hanya memakai `url = env("DATABASE_URL")`. Untuk mulai cepat, pakai **Direct URL** saja di `DATABASE_URL` sampai traffic tinggi.

---

## 3. Network / firewall Supabase

**Project Settings → Database → Network Restrictions**

- Dev lokal: izinkan IP Anda, atau sementara **Allow all** (0.0.0.0/0) hanya untuk setup
- Production: allowlist IP VPS saja
- Pastikan **SSL** aktif (`sslmode=require`)

---

## 4. Hubungkan dari mesin lokal / CI

```bash
cd dnpeople/backend
cp .env.example .env
# Edit DATABASE_URL → string Supabase (direct + sslmode=require)
# Edit JWT_SECRET → secret production

npm install
npx prisma generate
npx prisma db push
# Opsional demo data (jangan di production customer):
# npm run db:seed
```

Cek koneksi:

```bash
npx prisma db pull --print
# atau
node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.\$queryRaw\`select 1\`.then(console.log).finally(()=>p.\$disconnect())"
```

---

## 5. Backend `.env` contoh (Supabase)

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres?sslmode=require&schema=public"
JWT_SECRET="ganti-dengan-random-32-chars-minimum"
JWT_EXPIRES_IN="24h"
PORT=4100
FRONTEND_URL="https://app.yourdomain.com"
TRUST_PROXY=1
```

Frontend tidak perlu kredensial Supabase — hanya memanggil API:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

---

## 6. Migrasi schema

**Dev / first deploy:**

```bash
npx prisma db push
```

**Production yang lebih aman (setelah migrate history ada):**

```bash
npx prisma migrate deploy
```

Jangan jalankan `db:seed` di production kecuali bootstrap admin yang disengaja.

---

## 7. Troubleshooting

| Gejala | Penyebab umum | Perbaikan |
|--------|---------------|-----------|
| `P1001 Can't reach database` | IP diblokir / password salah / salah host | Cek Network Restrictions, password, copy ulang URI |
| `P1011 TLS` / SSL error | `sslmode` hilang | Tambah `?sslmode=require` |
| `prepared statement already exists` | Pooler transaction + Prisma tanpa `pgbouncer=true` | Pakai direct untuk migrate, atau `?pgbouncer=true` di pooler URL |
| Timeout dari VPS | IPv6-only / firewall | Coba **Session mode** pooler, atau enable IPv4 add-on Supabase |
| Password dengan `@` gagal parse | Karakter khusus di URL | URL-encode password |

---

## 8. Keamanan

- Jangan commit `.env` / connection string
- Rotate DB password jika bocor
- Pakai role terbatas jika memungkinkan (bukan hanya `postgres` superuser jangka panjang)
- Backup: aktifkan Point-in-Time Recovery di Supabase plan yang mendukung
- Supabase Auth / Storage **tidak** dipakai dnPeople MVP — hanya Postgres

---

## Lihat juga

- [DEPLOYMENT.md](./DEPLOYMENT.md) — overview deploy
- [VPS.md](./VPS.md) — instal API + frontend di VPS (DB tetap bisa Supabase)
- [ARCHITECTURE.md](./ARCHITECTURE.md)

---

*Last Updated: July 10, 2026*
