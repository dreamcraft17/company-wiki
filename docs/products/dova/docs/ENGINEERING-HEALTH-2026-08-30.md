# DOVA — Engineering Health Report

> **Status:** Active · **Last updated:** 2026-08-30 · **Author:** Dozer

## Summary

A combined bug-triage, test-quality, API-design, and CTO-strategy pass against DOVA at repo HEAD `ebd71bd`. No new application bugs were found in the 21 commits reviewed. The two risks that matter most right now are process (a declared P0 that was never verified) and coverage shape (the layer that talks to Postgres is almost untested, even though the suite around it looks healthy). Two small API design defects are cheap to fix now and more disruptive later. Related: [DOVA-BUG-TRIAGE.md](../code/DOVA-BUG-TRIAGE.md) · [current-phase.md](./current-phase.md) · [HANDOFF.md](./HANDOFF.md).

---

## 1. Bug triage update

**Repo HEAD:** `ebd71bd` — 21 commits ahead of `8fb5b5e`, the HEAD the bug-triage doc was last checked against.

| Finding | Severity | Priority | Status |
|---|---|---|---|
| **TRI-001 regression:** "Re-run `smoke:production` after deploy `8fb5b5e`" was flagged P0 on 2026-08-28 and never verified. `ops/logs/` on disk contains only `.gitkeep` — no smoke log exists. 21 commits and 5 features (including admin user-delete) have shipped since without it. | Major | **P0 (escalated)** | Open |
| Unit suite grew from 146 → 160 tests, all passing, verified 2026-08-30. | — | — | ✅ Healthy |
| No new application-code bugs found across the 21-commit range (mix of auth UX, admin delete, docs/CORS fixes). | — | — | ✅ Clean |

**Action:** run `SMOKE_OTP_CODE=123456 npm run smoke:production`, save the log to `ops/logs/smoke-production-latest.log`, close TRI-001. Full detail in [DOVA-BUG-TRIAGE.md](../code/DOVA-BUG-TRIAGE.md) (updated 2026-08-30).

---

## 2. Test-quality review

Sampled ~40% of the suite (19 spec files total), weighted toward the largest and most security/money-critical: `app.service.spec.ts` (1090 lines), `paystack.service.spec.ts`, `database.service.spec.ts`, `jwt-auth.guard.spec.ts`, `api.spec.ts`, `mail.util.spec.ts`.

Overall quality is good: specific assertions, strong negative-path coverage on payments/webhooks, bug-ID traceability in test names, no sleep-based waits, no over-mocking of pure logic. Three real gaps:

| # | Finding | Severity |
|---|---|---|
| 1 | **The real Postgres query layer is ~90% untested.** `DatabaseService` has ~70 methods; only 8 test cases exercise it. The 1090-line `app.service.spec.ts` suite that looks comprehensive runs entirely against an in-memory fake (`database.enabled = false`). This is almost certainly where the documented 52%→80% coverage gap lives — and it's the layer that runs the real SQL for auth, orders, payments, and admin delete cascades in production. | High |
| 2 | **Auth guard's public/optional-auth branches are never tested.** `jwt-auth.guard.spec.ts`'s `beforeEach` hardcodes both `IS_PUBLIC_KEY` and `OPTIONAL_AUTH_KEY` reflector lookups to `false`, so the `@Public()` bypass path and both optional-auth branches (no-token-allowed, invalid-token-allowed) have zero coverage on a security-critical guard. | High |
| 3 | **No test for refresh-token failure during retry.** The frontend `api.spec.ts` covers refresh-succeeds + retry-succeeds, but not refresh itself failing or the retried request 401-ing again — a session-expiry edge case real users will hit. | Medium |

**Recommendation:** don't chase the coverage percentage directly — write `DatabaseService` tests for the highest-blast-radius methods first (order creation/payment write-back, admin user delete cascade, supplier approval), then close the two auth-guard branches.

---

## 3. API design review

No OpenAPI/Swagger spec exists in the repo, so the automated linter/breaking-change/scorecard tooling couldn't run — this review was done by manual read of the single `app.controller.ts` (~67 routes across 10 modules). Versioning (`app.setGlobalPrefix('api/v1')`), `helmet`, and a strict `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`) are already in place and correct.

| # | Finding | Severity |
|---|---|---|
| 1 | **`GET payments/verify` mutates order state.** It calls the same `service.verifyPayment()` as `POST payments/verify`, which marks the order paid — a GET route with a side effect, breaking REST's safety guarantee. Any prefetch, monitoring bot, or proxy retry that follows a GET could trigger an unintended payment-verification write. | High |
| 2 | **PUT used for partial updates instead of PATCH** across ~5 endpoints (`suppliers/products/:id/stock`, `admin/users/:id/active`, `admin/products/:id/active`, `feedback/posts/:id/status`, supplier order status) while `PATCH auth/me` is the only endpoint using the semantically-correct method for a partial update. No endpoint actually uses PUT to replace a full resource. | Medium |
| 3 | **No OpenAPI spec** — acceptable at current scale but blocks automated contract testing and breaking-change detection. | Low (tooling gap, not a bug) |

**Recommendation:** deprecate the GET verify route (or make the frontend always use POST) and swap PUT→PATCH on the partial-update endpoints before more client code accumulates against the current shape.

---

## 4. CTO strategic synthesis

**Bottom line:** close the smoke-verification gap today, then spend this sprint on the DB-layer test gap, before picking up UI polish or new features. Neither carries the blast radius of an unverified deploy or an untested money/data path.

**Why:** for a live marketplace processing real payments (Paystack), the two things that can cause unbounded damage are (a) a silent bug in order/payment/admin SQL, and (b) a "we said we'd verify this" step that quietly doesn't happen. Both are currently unguarded — nothing else reviewed here (UI polish, E2E, domain alias) carries comparable risk if it ships imperfect.

### Prioritized action plan

| Timeframe | Action | Effort |
|---|---|---|
| This week (P0) | Run production smoke test, save log, close TRI-001. Add a post-deploy hook so this can't lapse silently again — the miss was a missing gate, not a one-off. | <1 day |
| This sprint (P1) | Write `DatabaseService` tests for order creation, payment write-back, admin delete cascade, supplier approval — the highest-blast-radius methods, not blanket coverage. | 3–5 days |
| Next sprint (P2) | Fix `GET payments/verify` and swap PUT→PATCH on partial-update endpoints. | ~1 day |
| Backlog | UAT (admin/feedback), v0.5.5 tag, login/register UI polish, E2E Playwright, `dovachain.com` alias — all reasonable next features, none carry data-integrity or money risk. | — |

**Open call for the team:** the four candidates already on the table (UAT, v0.5.5, UI polish, E2E, domain alias) are all fine next steps, but none address the two risks above. Recommend treating the P0/P1 items as a gate before picking from that list, unless there's a business reason (investor demo, launch deadline) that reorders it.

---

## Sources

- Bug triage: [DOVA-BUG-TRIAGE.md](../code/DOVA-BUG-TRIAGE.md)
- Test suite: `apps/backend/src/*.spec.ts`, `apps/frontend/src/lib/*.spec.ts`, `shared/src/*.spec.ts`
- API surface: `apps/backend/src/app.controller.ts`, `apps/backend/src/main.ts`
- Current phase: [current-phase.md](./current-phase.md)
