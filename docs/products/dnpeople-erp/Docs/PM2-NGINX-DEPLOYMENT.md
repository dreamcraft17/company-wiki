# dnCore Deployment — PM2 + Nginx

Dokumen ini adalah runbook deployment utama dnCore pada VPS tanpa Docker.

## Arsitektur runtime

```text
Internet → Nginx :80/:443
             ├── /      → Remix SSR / PM2 :3000
             └── /api/* → Express API / PM2 :3001
```

PostgreSQL, Redis, RabbitMQ, dan Elasticsearch dapat berjalan sebagai service VPS atau managed service. Docker Compose tetap tersedia untuk environment yang memang memerlukannya, tetapi bukan requirement runtime VPS.

## Build dan start

```bash
git pull origin main
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
npm run build

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Jika PM2 process sudah ada:

```bash
npm run build
pm2 reload ecosystem.config.cjs --update-env
pm2 save
```

## Environment minimum

Backend `.env` harus berisi koneksi PostgreSQL, `JWT_SECRET`, dan secret integrasi yang digunakan environment tersebut. Jangan memakai `DB_MODE=memory` untuk production.

Frontend memakai `API_URL=http://127.0.0.1:3001/api/v1` pada server Remix. Public browser traffic tetap masuk melalui hostname Nginx.

## Nginx

Salin [`deploy/nginx/dncore.conf`](../deploy/nginx/dncore.conf), ganti `server_name`, lalu aktifkan site:

```bash
sudo ln -s /etc/nginx/sites-available/dncore.conf /etc/nginx/sites-enabled/dncore.conf
sudo nginx -t
sudo systemctl reload nginx
```

Tambahkan TLS menggunakan Certbot setelah DNS mengarah ke VPS.

## Health check dan operasi

```bash
curl -fsS https://domainmu.com/api/v1/health
curl -fsS https://domainmu.com/api/v1/health/ready
pm2 status
pm2 logs dncore-api
pm2 logs dncore-web
```

Sebelum release, jalankan `npm run build`, `npm test -- --runInBand`, dan `git diff --check`.
