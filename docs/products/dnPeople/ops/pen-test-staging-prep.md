# Penetration Test — Staging Access (PRD v11.0 FR-GOLIVE-003)

## Window
24–28 Juli 2026 (monitoring muted in Datadog/PagerDuty)

## Staging URL
`https://staging.dnpeople.id` (or VPS staging IP)

## Test account (create before window)
| Field | Value |
|-------|--------|
| Email | pentest@dnpeople.id |
| Role | COMPANY_ADMIN |
| Company | Pentest Tenant |

## API
- Scoped API key with `*` or full module scopes
- OpenAPI: `/api/v1/openapi.json`

## Escalation
- Dozer (phone on file)
- Slack: #security-incidents

## Scope reference
`docs/PENTEST-SCOPE.md`
