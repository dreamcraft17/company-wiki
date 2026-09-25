# Incident Response Runbook — dnCore

**Owner:** Dozer (CEO + Tech Lead) · DN Tech  
**Product:** dnCore (NestJS ERP)  
**UpdatedAt:** 19 July 2026  

## Severity

| Sev | Definition | Response |
|-----|------------|----------|
| **P1** | API down / data loss / auth breach | Acknowledge &lt;15 min · MTTR target &lt;30 min |
| **P2** | Module degraded (finance/sales) | Acknowledge &lt;1h |
| **P3** | Non-critical bug / single tenant | Next business day |

## First response checklist

1. Check `/api/v1/health/live` and `/api/v1/health/ready`
2. Check Prometheus `/metrics` and Grafana (if live)
3. Review recent deploys (Helm revision / GitHub Actions)
4. Capture logs: API pod stdout / CloudWatch
5. If DB suspected: do **not** run destructive SQL; snapshot first

## Rollback

```bash
# Helm rollback (staging/prod)
helm rollback dncore <REVISION> -n dncore

# Or redeploy previous image tag
helm upgrade dncore ./k8s/helm -f k8s/helm/values-production.yaml --set image.tag=<prev>
```

## Database restore (AWS RDS — Phase 5)

1. Identify snapshot: `aws rds describe-db-snapshots --db-instance-identifier dncore-prod`
2. Restore to new instance (do not overwrite live until verified)
3. Run `scripts/restore-drill.sh` against restored endpoint (row-count check)
4. Cut over DNS / connection string after verification
5. Log result in Ops backup monitor (`POST /ops/admin/backups/:id/restore-test`)

## Local restore drill (no AWS)

```bash
./scripts/restore-drill.sh
```

## Contacts

| Role | Contact |
|------|---------|
| On-call / Tech Lead | Dozer |
| Escalation | DN Tech leadership |

## Post-incident

- Write timeline + root cause within 48h  
- Open follow-up tickets for prevention  
- Update this runbook if process gaps found  
