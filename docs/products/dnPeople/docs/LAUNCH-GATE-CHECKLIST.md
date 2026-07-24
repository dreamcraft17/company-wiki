# Launch Gate Checklist — PRD v11.0 / soft launch Agustus 2026

**Go/no-go target:** minggu pertama Agustus 2026  
**Code freeze readiness (repo):** 24 Juli 2026 — production-safety + smoke expanded  
**Sign-off:** Dozer

Legend: ✅ Done in repo · 🟡 Ready to execute (ops) · ⬜ External dependency

---

## Monitoring

| Gate | Status | Notes |
|------|--------|-------|
| Datadog agent + dashboards | 🟡 | Conf scrape updated (`ops/datadog/conf.d/conf.yaml`); needs `DD_API_KEY` + live agent |
| PagerDuty test incident | ⬜ | Create service + fire test from alert rules |
| 5+ alert monitors | 🟡 | `ops/alerting/alert-rules.yaml` — import into Datadog Monitors |

## Backup

| Gate | Status | Notes |
|------|--------|-------|
| Daily backup verified | 🟡 | `npm run db:verify-backup` / `scripts/verify-backup.sh` |
| Restore drill PASS | 🟡 | `npm run db:restore-drill` — isi tabel di `docs/RESTORE-DRILL-RUNBOOK.md` |
| RPO/RTO signed | ⬜ | Finance/ops sign `docs/SLA-COMMITMENT-RPO-RTO.md` |

## Security

| Gate | Status | Notes |
|------|--------|-------|
| Pen-test engaged + staging | ⬜ | `ops/pen-test-staging-prep.md` |
| Critical findings remediated | ⬜ | After pen-test |
| Prod secrets fail-closed | ✅ | `JWT_SECRET` / payslip / QR / doc signing refuse insecure defaults in production |
| Demo sandbox creds | ✅ | Ditampilkan di UI (public trial); opt-out `NEXT_PUBLIC_SHOW_DEMO_CREDS=false` |

## Performance

| Gate | Status | Notes |
|------|--------|-------|
| k6 baseline | 🟡 | `k6 run scripts/loadtest/baseline.js` on staging |
| k6 ramp/spike documented | 🟡 | `scripts/loadtest/ramp.js`, `spike.js` |

## Website

| Gate | Status | Notes |
|------|--------|-------|
| `/welcome` `/pricing` `/faq` `/demo` `/contact` `/blog` | ✅ | In app; DNS cutover ⬜ |
| `robots.txt` + `sitemap.xml` | ✅ | `frontend/src/app/robots.ts`, `sitemap.ts` |
| GA4 | 🟡 | Set `NEXT_PUBLIC_GA_ID` |
| Lead capture API | ✅ | `POST /api/v1/public/leads` (smoke covers it) |

## Billing honesty

| Gate | Status | Notes |
|------|--------|-------|
| Trial end without provider | ✅ | Creates **DRAFT** invoice — does not fake `lastChargedAt` |
| Live Stripe/Xendit auto-charge | ⬜ | Needs provider keys + webhook |

## Beta

| Gate | Status | Notes |
|------|--------|-------|
| 10–20 customers onboarded | ⬜ | Ops tracker + playbook |
| Onboarding playbook | ✅ | `docs/CUSTOMER-ONBOARDING-PLAYBOOK.md` |

## Code

| Gate | Status | Notes |
|------|--------|-------|
| Backend unit tests | ✅ | `npm test` in `backend/` |
| `scripts/smoke-test.sh` | ✅ | Health + leads (+ optional `WEB_URL` marketing paths) |
| Zero known P0 bugs | ✅ | v8.0 remediation closed |

---

## Commands (release week)

```bash
# API smoke (API up)
API_URL=https://api.staging.example.com bash scripts/smoke-test.sh

# API + marketing pages
API_URL=https://api.staging.example.com WEB_URL=https://staging.example.com bash scripts/smoke-test.sh

cd backend && npm test && npx tsc --noEmit
cd ../frontend && npx tsc --noEmit
```

**Decision:** Dozer sign-off → LAUNCH after 🟡 executed on staging and ⬜ owners confirmed.
