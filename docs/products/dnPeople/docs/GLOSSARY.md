---
owner: Dozer
status: active
canonical: true
last_reviewed: 2026-09-15
review_cadence: quarterly
---

# dnPeople Canonical Glossary

This is the canonical terminology reference for dnPeople documentation. Feature, PRD, support, and operations documents should link here instead of redefining these terms.

| Term | Canonical definition |
|------|----------------------|
| API | Application Programming Interface; dnPeople's backend exposes versioned REST endpoints under `/api/v1`. |
| HR | Human Resources; the organizational function and the dnPeople role that manages employee operations within its permitted scope. |
| HRIS | Human Resources Information System. |
| QRIS | Quick Response Code Indonesian Standard, the Indonesian national QR payment standard. |
| RPO | Recovery Point Objective: the maximum acceptable amount of data loss measured in time. |
| RTO | Recovery Time Objective: the maximum acceptable time to restore service. |
| SDD | Software Design Document. |
| SRS | Software Requirements Specification. |
| SOP | Standard Operating Procedure. |
| SUPER_ADMIN | Platform-level role for internal administration across companies. |
| COMPANY_ADMIN | Company-level administrator role scoped to one company. |
| Xendit | Current payment provider integration for invoice checkout, billing, and payment webhooks. |

## Terminology rules

1. Use `Xendit` for the current payment provider. Midtrans documents are historical unless explicitly linked as migration/reference material.
2. Use `QRIS` only for the Indonesian QR payment standard; do not expand it as “Unified QR” or “Unified QR Standard.”
3. Use `API` for the interface and `recurring billing` or `subscription billing` for the payment capability; do not use API as a billing synonym.
4. Use role names exactly as implemented in `backend/prisma/schema.prisma`.
