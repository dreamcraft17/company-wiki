# Threads Automation — Engineering & Operating Review

> **Author:** Dozer
> **Date:** 2026-09-16
> **Status:** Internal engineering decision

## Decision

🔴 **Live production is blocked.** The current `auto/` implementation is suitable for dry-run/internal demo use, but requires correctness, security, and reliability gates before live publishing.

## Verified baseline

- Backend tests: **16/16 passed**.
- Backend and frontend builds passed.
- Frontend build has a non-blocking 724 kB bundle warning.
- The implementation uses Express + PostgreSQL + Redis/Bull + Playwright in one PM2 process.
- No OpenAPI/Swagger contract exists, so automated API linting and breaking-change detection are not yet available.

## Highest-risk issues

### Duplicate publishing

The cron due-post scan and Bull queue can process the same `scheduled` post without an atomic claim. Implement an atomic `scheduled → processing` transition and idempotency key before enabling live mode.

### Credential and authorization risk

The current flow stores an encrypted Threads password for session refresh, and any authenticated user can toggle live publishing. The target state is OAuth/token-based authentication, fail-closed production secrets, and an admin-only live permission.

### API contract quality

Create an OpenAPI 3 contract and standardize response fields to camelCase. Convert partial `PUT /posts/:id` behavior to `PATCH`, validate/cap pagination, restrict CORS to known origins, and define JWT revocation behavior for logout.

### Scaling and reliability

The intended 10-second publish throttle is process-local and the single PM2 process combines API, scheduler, worker, and browser automation. Separate scheduler/worker roles after correctness is fixed, then measure queue age, publish latency, failure rate, and duplicate attempts.

## 90-day company operating plan

| Rock | Owner | Definition of done | Priority |
|---|---|---|---|
| Eliminate duplicate publish | Dozer / Engineering | Atomic claim + idempotency + concurrency tests | P0 |
| Validate official Threads API path | Dozer / Engineering | Staging OAuth and text/image publish proof | P0 |
| Close production security gates | Dozer / Security | Default secrets, CORS, live authorization, token lifecycle | P0 |
| Publish API contract | Dozer / Engineering | OpenAPI 3 + lint + contract tests | P1 |
| Establish reliability scorecard | Dozer / Operations | Weekly metrics and alerts active | P1 |

## Weekly scorecard

| Metric | Target | Owner |
|---|---:|---|
| Duplicate publishes | 0 | Dozer |
| Publish success rate | ≥99% | Dozer |
| Jobs within ±60 seconds | ≥99% | Dozer |
| Open P0/P1 issues | 0 | Dozer |
| Contract checks passing | 100% | Dozer |
| Unreviewed live-toggle events | 0 | Dozer |

## Operating cadence

- Weekly 30-minute engineering review using IDS: Identify, Discuss, Solve.
- Every issue gets one owner, one action, and one due date.
- Review rocks and scorecard weekly; re-plan quarterly.
- Live mode remains off until every release-gate item is checked.

## Release gate

- [ ] Atomic claim and idempotency.
- [ ] Official API staging path.
- [ ] Fail-closed secrets.
- [ ] Admin-only live toggle.
- [ ] OpenAPI contract.
- [ ] SLO dashboard and alerting.
- [ ] Security review.

## External reference

Meta documents an official Threads API with OAuth and publishing permissions such as `threads_basic` and `threads_content_publish`: [Meta Threads API](https://www.postman.com/meta/threads/documentation/dht3nzz/threads-api).
