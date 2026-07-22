# Integrations Guide

**UpdatedAt:** 22 Juli 2026  

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

## OpenAPI
- UI: `/api/v1/docs`  
- JSON: `/api/v1/openapi.json`  
- Markdown: `docs/API.md`

## SCIM
`/scim/v2/:tenantId` dengan token tenant (Enterprise).

## SSO
`/sso` — Google / Microsoft / SAML + JIT.
