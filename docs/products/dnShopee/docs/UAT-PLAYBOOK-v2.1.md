# dnShop Finance v2.1 — UAT Playbook

**Status:** Playbook ready (kode SOPI shipped 6 Agustus 2026)  
Target cohort: 10–50 seller beta — **eksekusi ops**, bukan backlog coding.

## 1) Tujuan UAT

- Validasi onboarding wizard selesai tanpa bantuan manual.
- Validasi connect Shopee live + webhook masuk (butuh partner key prod/sandbox).
- Validasi tier gate (100 lifetime / 5000 mo), upsell, OTP & email flow.
- Validasi UI2 (wizard, theme, Shopee auth status).

## 2) Persiapan

- Pastikan env production/sandbox aktif:
  - `TIER_ENFORCE=true`
  - `SHOPEE_PARTNER_ID` / `SHOPEE_PARTNER_KEY` (live) atau mock untuk dry-run
  - `SMTP_HOST` terisi
  - `OPS_ALERT_WEBHOOK_URL` terisi
- Buat invite dari admin beta invites.
- Baca [STATUS.md](./STATUS.md) + [RUNBOOK-INCIDENT.md](./RUNBOOK-INCIDENT.md).

## 3) Checklist Per Seller

- [ ] Invite diterima dan signup berhasil via `?invite=...`
- [ ] Email verifikasi / OTP diterima
- [ ] Shopee OAuth connect berhasil (`shopeeAuthStatus=authorized`)
- [ ] Wizard pembukuan step-1/2/3 selesai
- [ ] Backfill 30 hari selesai / edge case kosong handled
- [ ] Dashboard chart tampil benar
- [ ] Tier remaining label / upsell muncul sesuai kondisi
- [ ] Export PDF laporan berhasil
- [ ] (Ops) Webhook event masuk; DLQ kosong atau replay OK

## 4) Data yang Dicatat

- Waktu selesai onboarding (menit)
- Error yang muncul (screenshot + endpoint)
- NPS 1–10 + komentar

## 5) Kriteria Lulus Soft Launch

- >= 10 toko live connected
- Wizard completion >= 60%
- Email deliverability >= 95%
- Zero P0 tanpa runbook response ≥7 hari
