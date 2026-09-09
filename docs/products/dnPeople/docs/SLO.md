# dnPeople — Service Level Objectives (SLO)

> **Author:** Dozer  
> **Date:** 2026-08-23  
> **Status:** Active · **Product:** dnPeople API + App  
> **Related:** [SLA-COMMITMENT-RPO-RTO.md](./SLA-COMMITMENT-RPO-RTO.md)

## Summary

Operational SLO untuk soft launch `hris.dntech.id` / `api.hris.dntech.id`. Error budget konsumsi: on-call + sprint hardening.

## SLI / SLO Targets

| SLI | SLO (30 hari) | Measurement | Error budget |
|-----|---------------|-------------|--------------|
| **Availability** | **99.5%** | `GET /ready` success (prod probe) | 3.6 h downtime/bulan |
| **API latency p95** (authenticated CRUD) | **&lt; 600 ms** | Prometheus `http_request_duration_seconds` | 5% requests boleh exceed |
| **API latency p95** (payroll run 50 emp) | **&lt; 5 s** | Route timing + manual benchmark | Escalate jika 2× breach |
| **Payment webhook processing** | **&lt; 30 s** lag (p95) | `webhook_received → payment SETTLEMENT` | Manual reconcile fallback |
| **Payment return sync** | **&lt; 10 s** | `POST /payments/sync` p95 | Webhook remains source of truth |

## Scope exclusions

- Planned maintenance (announced ≥ 24 h)
- Third-party gateway outages (Xendit/Midtrans status page)
- Demo/sandbox tenant load tests

## Alerting (when configured)

| Condition | Severity | Action |
|-----------|----------|--------|
| `/ready` fail &gt; 2 min | P1 | Page on-call |
| Error rate &gt; 1% 5 min | P1 | Investigate deploy/regression |
| p95 &gt; 2× SLO 15 min | P2 | Profile hot path |
| Webhook 401 spike | P1 | Check `XENDIT_WEBHOOK_TOKEN` rotation |

## Review cadence

- **Weekly:** error budget burn (deployments + incidents)
- **Monthly:** adjust SLO jika traffic pattern berubah
- **Quarterly:** align dengan customer SLA ([SLA-SUPPORT-POLICY.md](./SLA-SUPPORT-POLICY.md))

## Current evidence (repo)

| Check | Status |
|-------|--------|
| Backend unit tests | 125+ pass |
| CI load smoke p95 | &lt; 2 s (health endpoint) |
| Datadog/PagerDuty live | Conditional (ops) |
| Prod SLO dashboard | TBD — wire Prometheus/Datadog |
