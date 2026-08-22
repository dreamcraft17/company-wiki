# Midtrans Production Setup — dnPeople

**Updated:** 17 Agustus 2026  
**API webhook:** `POST https://api.hris.dntech.id/api/v1/webhooks/midtrans`

---

## 1. Ambil production keys dari Midtrans Dashboard

1. Login [Midtrans Dashboard](https://dashboard.midtrans.com) → **Settings → Access Keys**
2. Copy **Server Key** (`Mid-server-…`) dan **Client Key** (`Mid-client-…`)
3. Jangan pakai key sandbox (`SB-Mid-…`) di production

---

## 2. Set environment backend (VPS)

Edit `backend/.env` di server:

```bash
# Switch ke production
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxx

# Opsional: hapus atau comment sandbox keys lama
# MIDTRANS_SERVER_KEY_SANDBOX=
# MIDTRANS_CLIENT_KEY_SANDBOX=
```

Rebuild & restart backend setelah edit env.

---

## 3. Webhook notifikasi pembayaran

Midtrans dashboard versi baru: **SETTINGS → PAYMENT** (bukan "Configuration").
Cari field **Payment notification URL** / **Notification URL**.

```
https://api.hris.dntech.id/api/v1/webhooks/midtrans
```

**Kalau field-nya tidak ada di dashboard** — tidak masalah. dnPeople otomatis mengirim webhook URL per transaksi via header `X-Override-Notification` saat buat SNAP checkout.

Pastikan env backend:
```bash
API_PUBLIC_URL=https://api.hris.dntech.id
# atau override eksplisit:
# MIDTRANS_NOTIFICATION_URL=https://api.hris.dntech.id/api/v1/webhooks/midtrans
```

Webhook tetap harus bisa diakses publik (HTTPS, port 443).

---

## 4. Aktifkan Midtrans di Admin Console

1. Login SUPER_ADMIN → `/admin/payment-gateway`
2. Pastikan badge Midtrans: **CONFIGURED** + **PRODUCTION**
3. Klik **Aktifkan gateway ini** (switch dari Xendit jika perlu)

---

## 5. Verifikasi E2E (wajib sebelum go-live)

- [ ] Buat invoice di `/billing` (tier berbayar, bukan trial Rp0)
- [ ] Klik bayar → SNAP modal terbuka (domain `app.midtrans.com`, bukan sandbox)
- [ ] Bayar dengan metode real (VA/kartu/e-wallet sesuai merchant)
- [ ] Webhook diterima → invoice status **PAID**
- [ ] Cek Admin → Payments / audit log

---

## Rollback ke sandbox

```bash
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY_SANDBOX=SB-Mid-server-xxx   # atau Mid-server-xxx (dashboard baru)
MIDTRANS_CLIENT_KEY_SANDBOX=SB-Mid-client-xxx   # atau Mid-client-xxx
# comment/unset MIDTRANS_SERVER_KEY / MIDTRANS_CLIENT_KEY
```

Mode sandbox ditentukan oleh `MIDTRANS_IS_PRODUCTION=false` + key di env `*_SANDBOX`, bukan dari prefix key.

Restart backend. Admin Console akan tampil badge **SANDBOX**.

---

## Troubleshooting

| Gejala | Penyebab | Fix |
|--------|----------|-----|
| `MIDTRANS_KEY_MISMATCH` | Production flag true tapi key sandbox (`SB-Mid-*`) | Set key production atau `MIDTRANS_IS_PRODUCTION=false` |
| `BILLING_NOT_CONFIGURED` | Key env kosong | Isi key sesuai mode |
| SNAP sandbox URL muncul | `MIDTRANS_IS_PRODUCTION` belum true | Set flag + restart |
| Webhook tidak update invoice | URL salah / signature fail | Cek URL dashboard + server key production |
