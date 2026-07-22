# SLA Commitment — RPO / RTO (PRD v11.0)

**Product:** dnPeople  
**Date:** 22 July 2026  
**Owner:** Dozer (CEO + Tech Lead) · DN Tech

## Commitments

| Metric | Target | Evidence |
|--------|--------|----------|
| **RPO** | < 1 hour | Daily backup 02:00 UTC + continuous WAL optional |
| **RTO** | < 4 hours | Restore drill script + runbook |
| **Uptime SLA** | 99.9% | Datadog + PagerDuty (post beta) |
| **API p95** | < 1s | k6 baseline 100 VU |
| **Error rate** | < 0.1% | Prometheus `http_requests_errors_total` |

## Sign-off

| Role | Name | Date |
|------|------|------|
| CEO / Tech Lead | Dozer | 2026-07-22 |
| Finance / Risk | __________ | __________ |

## Customer-facing
Publish summary on `/legal/terms` and support SLA doc (`docs/SLA-SUPPORT-POLICY.md`).
