---
owner: Dozer
status: review-required
canonical: false
last_reviewed: 2026-09-16
review_cadence: annual
---

# Integrations Guide

**UpdatedAt:** 16 September 2026  

## Public lead capture (PRD v11.0)

No API key required; rate-limited (20 req / 15 min per IP):

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/public/leads` | Newsletter / contact form |
| POST | `/api/v1/public/beta-interest` | Beta program signup |

Env: `LEADS_NOTIFY_EMAIL`, `SMTP_HOST` for sales notifications.

## API keys
`/integrations` → buat key `dnp_…` dengan scopes eksplisit (`payroll:view`, `attendance:*`, atau `*`). Kosong = deny.

## Webhooks
Daftarkan URL; uji via “Test delivery”.

### Payment gateway (subscription billing) — admin-switchable

Tiga gateway aktif; admin memilih satu via `/admin/payment-gateway` (feature flag `platform:active-payment-provider`). Detail: [PG/README.md](./PG/README.md).

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/v1/webhooks/xendit` | `x-callback-token` header | Invoice paid / payment status updates |
| POST | `/api/v1/webhooks/midtrans` | `signature_key` (SHA-512) | Transaction status notification |
| POST | `/api/v1/webhooks/doku` | `Signature` header (HMACSHA256) | Checkout notification (non-SNAP) |

Env utama: `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY`, `DOKU_IS_PRODUCTION`, `DOKU_NOTIFICATION_URL`; `FRONTEND_URL`. Xendit dan Midtrans tetap tersedia sebagai alternatif/admin switch.
Panduan lengkap: [PG/README.md](./PG/README.md).

## OpenAPI
- UI: `/api/v1/docs`  
- JSON: `/api/v1/openapi.json`  
- Markdown: `docs/API.md`

## SCIM
`/scim/v2/:tenantId` dengan token tenant (Enterprise).

## SSO
`/sso` — Google / Microsoft / SAML + JIT.
