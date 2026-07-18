# Integrations Guide

**UpdatedAt:** 19 Juli 2026  

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
