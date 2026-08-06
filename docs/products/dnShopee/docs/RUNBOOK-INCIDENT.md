# dnShop Finance Incident Runbook (v2.1)

Dokumen operasional untuk soft-launch dan GA v2.1.

## 1) Prioritas Insiden

- **P0**: API down, login gagal total, data sinkronisasi berhenti total, DB unreachable.
- **P1**: webhook fail rate >5%, email delivery gagal mayoritas, queue dead-letter meningkat.
- **P2**: bug visual, issue minor copy/UI.

## 2) Checklist 5 Menit Pertama

1. Cek `GET /api/v1/auth/health`
2. Cek `pm2 status` (`dnshop-api`, `dnshop-web`)
3. Cek nginx status + error log
4. Cek dead-letter: `GET /api/v1/admin/queues/dead-letter`
5. Cek alert terbaru di `OPS_ALERT_WEBHOOK_URL`

## 3) Komando Diagnostik

```bash
pm2 status
pm2 logs dnshop-api --lines 200
pm2 logs dnshop-web --lines 100
curl -s https://api.shop.dntech.id/api/v1/auth/health
```

## 4) Respons P0

### API 5xx tinggi / service down

1. `pm2 restart dnshop-api --update-env`
2. Validasi env critical (`DB_*`, `JWT_SECRET`, `CORS_ORIGINS`)
3. Jika DB issue: failover connection / cek Supabase status
4. Jika masih gagal >10 menit: rollback ke commit stabil terakhir

### Webhook Shopee gagal

1. Verifikasi `SHOPEE_WEBHOOK_SECRET` / partner key
2. Cek endpoint response harus `202`
3. Cek fail-rate alert; jika >5%, nonaktifkan trigger noisy sementara
4. Jalankan sync manual per toko

### Email settlement/verifikasi gagal

1. Cek `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
2. Trigger test email via admin endpoint
3. Jika SMTP down: fallback log aktif, informasikan delay ke tim ops

## 5) Respons P1

- Dead-letter naik: identifikasi payload terakhir dan replay manual jika aman
- Latency sync tinggi: cek queue mode (`redis` vs `inline`), tambah resource VM bila perlu
- Signup invite error: validasi code expired dan email mismatch

## 6) Postmortem Wajib

Untuk P0/P1, tulis postmortem max 24 jam:

- Timeline kejadian
- Root cause
- Dampak user
- Tindakan perbaikan
- Action item pencegahan

