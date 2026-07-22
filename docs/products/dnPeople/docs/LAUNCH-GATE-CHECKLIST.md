# Launch Gate Checklist — PRD v11.0

Use before **01 Aug 2026 10:00 WIB** go/no-go.

## Monitoring
- [ ] Datadog agent + 6 dashboards
- [ ] PagerDuty test incident
- [ ] 5+ alert monitors (`ops/alerting/alert-rules.yaml`)

## Backup
- [ ] Daily backup verified (`scripts/verify-backup.sh`)
- [ ] Restore drill PASS (`scripts/restore-drill.sh`)
- [ ] RPO/RTO signed (`docs/SLA-COMMITMENT-RPO-RTO.md`)

## Security
- [ ] Pen-test engaged + staging access (`ops/pen-test-staging-prep.md`)
- [ ] Critical findings remediated + re-test

## Performance
- [ ] k6 baseline PASS (`scripts/loadtest/baseline.js`)
- [ ] k6 ramp/spike documented

## Website
- [ ] `/welcome` `/pricing` `/faq` `/demo` `/contact` `/blog` live
- [ ] GA4 `NEXT_PUBLIC_GA_ID` (optional)
- [ ] Lead capture API (`POST /api/v1/public/leads`)

## Beta
- [ ] 10–20 customers onboarded (ops tracker)
- [ ] Playbook: `docs/CUSTOMER-ONBOARDING-PLAYBOOK.md`

## Code
- [ ] Backend tests 32/32
- [ ] `scripts/smoke-test.sh` PASS
- [ ] Zero P0 bugs

**Decision:** Dozer sign-off → LAUNCH
