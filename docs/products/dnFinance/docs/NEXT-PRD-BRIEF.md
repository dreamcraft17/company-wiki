# dnAccounting — Next PRD Brief (Phase 3)

**Date:** August 2026  
**After:** V2 production launch (Q1 2027 target)  
**Owner:** Dozer

## Context

V2 delivers production hardening (~78%) + P1 features (approval, scheduler, departments). Remaining gaps: full relational Postgres schema, GCS PDFs, Datadog APM, load/security audit.

## Recommended Phase 3 themes

### 1. Full database migration (P0)
- Replace JSONB snapshot with normalized TypeORM entities per SDD §4
- Zero file store reads in production
- Migration scripts from existing snapshot export

### 2. Bank & reconciliation (P1)
- OKE/CSV bank statement import
- Auto-match rules → GL reconcile
- Unmatched transaction queue

### 3. OCR invoice capture (P1)
- Photo/scan → extract vendor, amount, tax
- Draft bill pre-fill for accountant review

### 4. Mobile / PWA (P2)
- API already mobile-ready
- React Native or PWA for owner dashboard + approvals

### 5. Integrations (P2)
- POS (Kidzania, NCR)
- E-commerce order → invoice sync

## Success metrics (draft)

| Metric | Target |
|--------|--------|
| Paying customers | 50 SME beta |
| NPS | 40+ |
| Uptime SLA | 99.5% |
| Support response (critical) | 4h |

## Out of scope (explicit)

- Multi-currency (IDR only until Q3 2027)
- Full ERP (HR, payroll — use dnPeople)
- White-label reseller portal

## References

- [PRD/PRD-V2.md](./PRD/PRD-V2.md) § Phase 3 planning
- [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)
