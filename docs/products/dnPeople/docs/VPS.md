# dnPeople — Instalasi di VPS

**Last Updated:** July 10, 2026  
**Target:** Ubuntu 22.04 / 24.04 LTS (mirip untuk Debian)

Panduan ini meng-install **backend (Express :4100)** dan **frontend (Next.js :3001)** di satu VPS, dengan database di **Supabase** (disarankan) atau Postgres lokal.

---

## Arsitektur rekomendasi

```
Internet
   │
   ▼
 Nginx / Caddy (TLS :443)
   ├── app.yourdomain.com  → 127.0.0.1:3001  (Next.js)
   └── api.yourdomain.com  → 127.0.0.1:4100  (Express)
                                    │
                                    ▼
                         Supabase PostgreSQL (managed)
```

Alternatif: Postgres di VPS via Docker — lihat bagian [Postgres lokal di VPS](#postgres-lokal-di-vps-opsional).

---

## 1. Persiapan server

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw nginx

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v20.x
npm -v

# PM2
sudo npm install -g pm2
```

Firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Buat user deploy (opsional tapi disarankan):

```bash
sudo adduser --disabled-password --gecos "" dnpeople
sudo usermod -aG sudo dnpeople
# login sebagai dnpeople untuk langkah berikutnya
```

---

## 2. Clone repo

```bash
cd /opt   # atau $HOME
sudo mkdir -p /opt/dnpeople
sudo chown $USER:$USER /opt/dnpeople
git clone https://github.com/dreamcraft17/dnpeople.git /opt/dnpeople
cd /opt/dnpeople
```

---

## 3. Database (Supabase)

Ikuti [SUPABASE.md](./SUPABASE.md), lalu siapkan connection string.

```bash
cd /opt/dnpeople/backend
cp .env.example .env
nano .env
```

Contoh production `.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres?sslmode=require&schema=public"
JWT_SECRET="ganti-dengan-openssl-rand-hex-32"
JWT_EXPIRES_IN="24h"
PORT=4100
FRONTEND_URL="https://app.yourdomain.com"
TRUST_PROXY=1
```

Generate secret:

```bash
openssl rand -hex 32
```

Push schema:

```bash
npm ci
npx prisma generate
npx prisma db push
# Hanya bootstrap pertama (opsional):
# npm run db:seed
```

---

## 4. Build & jalankan backend

```bash
cd /opt/dnpeople/backend
npm ci
npm run build
pm2 start dist/index.js --name dnpeople-api
pm2 save
```

Cek:

```bash
curl http://127.0.0.1:4100/health
# {"status":"ok","service":"dnpeople-api",...}
```

---

## 5. Build & jalankan frontend

```bash
cd /opt/dnpeople/frontend
cp .env.example .env.local
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

> `NEXT_PUBLIC_*` di-bake saat `next build`. Ganti domain **sebelum** build.

```bash
npm ci
npm run build
pm2 start npm --name dnpeople-web -- start
pm2 save
pm2 startup
# jalankan perintah systemd yang dicetak PM2
```

Cek lokal:

```bash
curl -I http://127.0.0.1:3001
```

---

## 6. Nginx reverse proxy + TLS

DNS: arahkan `A` record:

- `app.yourdomain.com` → IP VPS  
- `api.yourdomain.com` → IP VPS  

### Config Nginx

```bash
sudo nano /etc/nginx/sites-available/dnpeople
```

```nginx
# Frontend
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:4100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/dnpeople /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Certbot (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.yourdomain.com -d api.yourdomain.com
```

Pastikan backend `FRONTEND_URL=https://app.yourdomain.com` dan `TRUST_PROXY=1`.

---

## 7. Operasional harian

```bash
pm2 status
pm2 logs dnpeople-api --lines 100
pm2 logs dnpeople-web --lines 100
pm2 restart dnpeople-api
pm2 restart dnpeople-web
```

### Update versi baru

```bash
cd /opt/dnpeople
git pull origin main

cd backend
npm ci
npx prisma generate
npx prisma db push   # atau: npx prisma migrate deploy
npm run build
pm2 restart dnpeople-api

cd ../frontend
# pastikan .env.local masih benar
npm ci
npm run build
pm2 restart dnpeople-web
```

---

## Postgres lokal di VPS (opsional)

Jika tidak memakai Supabase:

```bash
# Docker
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
# re-login

cd /opt/dnpeople
docker compose up -d postgres
```

`.env` backend:

```env
DATABASE_URL="postgresql://dnpeople:dnpeople@127.0.0.1:5433/dnpeople?schema=public"
```

> Ganti password default sebelum production. Backup volume `dnpeople_pg_data` secara berkala.

---

## Production dnTech (contoh live)

| Service | Domain | Upstream |
|---------|--------|----------|
| Frontend | `https://hris.dntech.id` | `127.0.0.1:3001` |
| API | `https://api.hris.dntech.id` | `127.0.0.1:4100` |

**Backend `.env` (VPS):**

```env
FRONTEND_URL="https://hris.dntech.id"
TRUST_PROXY=1
# DATABASE_URL = Session pooler Supabase (lihat SUPABASE.md)
```

**Frontend `.env.local` (harus di-set sebelum `npm run build`):**

```env
NEXT_PUBLIC_API_URL=https://api.hris.dntech.id/api/v1
```

Setelah ubah `NEXT_PUBLIC_*`:

```bash
cd /var/www/dntech/hris/frontend   # path deploy Anda
npm run build
pm2 restart dnpeople-web --update-env
```

---

## Checklist go-live

- [ ] `JWT_SECRET` kuat & unik
- [ ] `FRONTEND_URL` = HTTPS app domain (`https://hris.dntech.id`)
- [ ] `NEXT_PUBLIC_API_URL` = HTTPS API `/api/v1` lalu **rebuild** frontend
- [ ] `TRUST_PROXY=1`
- [ ] TLS valid untuk **kedua** hostname (app + api) — Certbot **atau** Cloudflare Universal SSL
- [ ] Supabase network allowlist = IP VPS
- [ ] `pm2 startup` aktif setelah reboot
- [ ] Seed demo **tidak** dipakai di production customer
- [ ] `curl https://api.hris.dntech.id/health` OK dari laptop
- [ ] Login dari `https://hris.dntech.id`

---

## Troubleshooting VPS

| Gejala | Perbaikan |
|--------|-----------|
| CORS error di browser | `FRONTEND_URL` harus exact origin app (termasuk `https://`) |
| 502 Bad Gateway | `pm2 status` — pastikan proses listen 3001/4100 |
| API OK lokal (`curl :4100`), gagal dari browser | Nginx / Cloudflare / TLS pada hostname API |
| Frontend hit `localhost:4100` | Rebuild setelah set `NEXT_PUBLIC_API_URL` production |
| DB timeout | Lihat [SUPABASE.md](./SUPABASE.md) troubleshooting |
| **`Failed to fetch` + `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` pada `api.*`** | Lihat [TLS / Cloudflare di bawah](#err_ssl_version_or_cipher_mismatch-api-subdomain) |

### `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` (API subdomain)

Gejala: `hris.dntech.id` buka normal, login gagal, console:

```text
https://api.hris.dntech.id/api/v1/auth/login
net::ERR_SSL_VERSION_OR_CIPHER_MISMATCH
```

Sementara di VPS:

```bash
curl http://127.0.0.1:4100/health   # OK
curl -I http://127.0.0.1:3001       # OK
```

Artinya **Node/PM2 sehat** — yang rusak adalah **TLS di edge** (Cloudflare / Nginx) untuk hostname API.

Domain dnTech memakai **Cloudflare**. Frontend `hris.dntech.id` sudah punya sertifikat; `api.hris.dntech.id` sering belum tercakup → handshake gagal (tidak ada peer certificate).

**Perbaikan (pilih salah satu):**

#### A. Tetap pakai `api.hris.dntech.id` (pilihan dnTech)

Universal SSL gratis Cloudflare hanya cover `*.dntech.id` (satu level).  
`api.hris.dntech.id` = **dua level** → tidak tercakup → `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`.

Pilih **salah satu**:

##### A1. Cloudflare Advanced Certificate (tetap Proxied / oranye)

1. Cloudflare → `dntech.id` → **SSL/TLS** → **Edge Certificates**
2. **Order Advanced Certificate** (atau Total TLS / custom hostname)
3. Hostnames: `api.hris.dntech.id` dan/atau `*.hris.dntech.id`
4. Tunggu Active
5. **SSL/TLS** overview: mode **Full (strict)**
6. Origin Nginx tetap proxy ke `:4100` (boleh HTTP ke origin jika Cloudflare “Flexible” — **jangan**; pakai Full + cert origin atau Cloudflare Origin CA)

Cek:

```bash
curl -I https://api.hris.dntech.id/health
```

##### A2. DNS only (abu) + Certbot di VPS (gratis, tanpa Advanced Cert)

1. Cloudflare DNS → `api.hris` → **Proxy status: DNS only** (abu)
2. Di VPS, pastikan Nginx punya `server_name api.hris.dntech.id;` → `proxy_pass http://127.0.0.1:4100;`
3. Issue cert:

```bash
sudo certbot --nginx -d api.hris.dntech.id
sudo nginx -t && sudo systemctl reload nginx
```

4. Frontend tetap:

```env
NEXT_PUBLIC_API_URL=https://api.hris.dntech.id/api/v1
```

Rebuild frontend jika baru diubah, lalu `pm2 restart dnpeople-web`.

5. Backend `.env`:

```env
FRONTEND_URL="https://hris.dntech.id"
TRUST_PROXY=1
```

`pm2 restart dnpeople-api --update-env`

> Catatan: dengan DNS only, traffic API **tidak** lewat Cloudflare WAF/CDN (langsung ke VPS). Frontend `hris.dntech.id` bisa tetap Proxied.

#### B. Origin Certbot (sama dengan A2)

```bash
sudo certbot --nginx -d api.hris.dntech.id
sudo nginx -t && sudo systemctl reload nginx
```

Cloudflare untuk `api.hris` harus **DNS only**, atau Proxied + Advanced Cert (A1).

#### C. Alternatif arsitektur (hindari subdomain kedua)

Proxy API di path yang sama dengan frontend:

```nginx
# di server hris.dntech.id
location /api/ {
    proxy_pass http://127.0.0.1:4100/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Lalu frontend:

```env
NEXT_PUBLIC_API_URL=https://hris.dntech.id/api/v1
```

Rebuild frontend. Satu hostname = satu sertifikat Cloudflare (sudah jalan).

**Diagnosa cepat di VPS:**

```bash
# Nginx sites
sudo nginx -t
sudo ls /etc/nginx/sites-enabled/
curl -Ik https://127.0.0.1/health -H 'Host: api.hris.dntech.id' 2>&1 | head -20

# Certbot
sudo certbot certificates
```

---

## Lihat juga

- [SUPABASE.md](./SUPABASE.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [API.md](./API.md)

---

*Last Updated: July 10, 2026*
