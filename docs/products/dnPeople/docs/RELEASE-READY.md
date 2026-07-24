# dnPeople — Release Ready (Agustus 2026)

| | |
|---|---|
| **Date** | 24 July 2026 |
| **Goal** | Soft launch minggu pertama Agustus |
| **Repo status** | **Release-ready in code** — ops gates masih harus dijalankan di staging/prod |

## Apa yang sudah dikunci di kode (24 Jul)

1. Production secrets **fail-closed** (`JWT_SECRET`, payslip, attendance QR, document HMAC).
2. Kredensial demo **tidak** di-hardcode di production UI (flag `NEXT_PUBLIC_SHOW_DEMO_CREDS`).
3. Trial expiry **tidak** mengklaim charge tanpa Stripe/Xendit (invoice `DRAFT`).
4. Smoke test diperluas (health + public leads + optional marketing URLs).
5. `robots.ts` + `sitemap.ts` untuk SEO soft launch.
6. Datadog scrape metrics diselaraskan dengan Prometheus exporter.
7. `.env.example` frontend/backend dilengkapi var launch + `TIER_*` overrides.
8. Launch checklist diperbarui dengan status jujur (✅ / 🟡 / ⬜).
9. **PRD v12.1:** FREE/STARTER hard **50** emp, helpdesk on FREE, shifts on STARTER, Jakarta API quota (API keys), storage hard-block, capacity emails 7d, `/upgrade`.

## Apa yang harus selesai minggu ini (ops)

| Owner | Action |
|-------|--------|
| Ops | DNS `dnpeople.id` + TLS API |
| Ops | Datadog agent + PagerDuty test |
| Ops | Restore drill bertanda tangan + isi runbook |
| Security | Pen-test window + remediasi |
| Growth | Beta 10–20 + GA4 / demo video URL |
| Finance | RPO/RTO + billing provider keys jika auto-charge |

## Jangan klaim

- “Pembayaran kartu live” sebelum Stripe/Xendit webhook verified  
- “99.9% SLA” sebelum monitoring + on-call live  
- “Pen-test passed” sebelum report eksternal  

Lihat: [LAUNCH-GATE-CHECKLIST.md](./LAUNCH-GATE-CHECKLIST.md) · [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md)
