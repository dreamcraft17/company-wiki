# DOVA — AI QA review (batch)

> **Author:** Dozer
> **Date:** 2026-09-01
> **Scope:** Whole Jest suite in `dova/` (not a single PR). App HEAD `8c5f4ca` on branch `stg`.
> **Context:** No `.agents/qa-project-context.md`. Framework: Jest + ts-jest, `testEnvironment: node`. No Playwright. `npm test` = `test:unit` (Jest) then `test:backend` (Nest **compile**, not tests).

## Verification

| Run | Command | Result | Wall time |
|-----|---------|--------|-----------|
| 1 | `npx jest --config jest.config.js --runInBand` (via `npm run test:unit`) | **160 passed**, 0 failed, 20 suites | ~40.1 s summed assertion duration |
| 2 | `npx jest --config jest.config.js --runInBand` | **160 passed** | 41.1 s |
| 3 | `npx jest --config jest.config.js --runInBand` | **160 passed** | 40.7 s |

No flakiness across three consecutive green runs.

**Slowest tests (run 1):** bcrypt-heavy auth in `app.service.spec.ts` — change-password **1782 ms**, reset-password **1390 ms**, OTP tokens **1135 ms**. Suite-level performance smell, not flake.

**Mutation score:** not recorded. Stryker is not in the repo; this pass did not add it. Closed-AI-loop risk on service specs remains qualitative.

**Automated gate:** none committed. Warranted next: (1) rename `apps/backend` `test`/`test:compile` so a workspace `npm test` cannot be mistaken for Jest; (2) `eslint-plugin-jest` `no-conditional-in-test` for the `it.each` + `if` pattern. Adding a full ESLint toolchain was out of scope for this review.

---

## Smell dimensions

### Readability

Giant `makeService()` database stub (~60 `jest.fn` fields) in `app.service.spec.ts`. Tests that only exercise auth still construct the full admin/supplier/payment surface. Extract a typed `AppServiceTestDoubles` factory with overrides.

Generic emails (`jane@example.com`, `user@test.com`) throughout. Not harmful for a marketplace fixture, but they are not the demo accounts in `DEMO-ACCOUNTS.md`.

### Reliability

No sleep-based waits in specs. No real Paystack/SMTP. Order independence looks OK (`clearMocks: true`, in-memory `AppService`). **N/A** for Playwright locators.

### Diagnostic

Several `toBe(true)` / `toBeDefined()` assertions (email verified timestamps, bcrypt compare, SQL `queries.some(...)`). Failures say “expected true” instead of the missing SQL fragment or timestamp.

`feedback.service.spec.ts` packs list+search, comments+admin-reply+forbidden into single cases — multiple failure causes.

### Design

Conditional setup inside `it.each` registration validation (`if` valid email then send code). Split rows: invalid email vs password mismatch.

`payment.spec.ts` uses `if (originalLocation)` in teardown — environment branching in the test body.

### AI-generated

Imports resolve. No hallucinated `data-testid`. `user@test.com` in feedback specs matches the generic-data smell. Closed loop likely on `app.service.spec.ts` (implementation + tests in the same service file history).

### Coverage

Happy-path heavy on HTTP: **no** `app.controller.spec.ts`, **no** `openapi-spec.spec.ts`, **no** tests for `RegistrationSuccessModal`. Controller discovery routes (`GET /`, `GET openapi.json`) can regress without a red suite. Manual UAT still missing Admin / Feedback / live Paystack (see triage).

---

## Findings (one row per reviewed file)

| File | Tests (approx) | Severity | Findings |
|------|----------------|----------|----------|
| `apps/backend/src/app.service.spec.ts` | 68 | **High** | Giant fixture; bcrypt-slow (~40 s suite); `it.each` + `if`; weak `toBeDefined` on timestamps; OTP codes logged to console (noise) |
| `apps/backend/src/paystack.service.spec.ts` | ~13 | Medium | One test toggles test vs live mode (multiple causes). HMAC assertions are specific — keep |
| `apps/backend/src/feedback.service.spec.ts` | 6 | Medium | Combined behaviors; `user@test.com`; `toBe(true)` on search |
| `apps/frontend/src/lib/payment.spec.ts` | ~6 | Medium | Conditional teardown; no test for initialize failure / missing `authorization_url` |
| `apps/frontend/src/lib/api.spec.ts` | 9 | Low | Strong refresh/401 coverage; generic `a@b.c` |
| `apps/backend/src/database.service.spec.ts` | 9 | Low | `queries.some(...).toBe(true)` — prefer `toContain` on captured SQL |
| `apps/backend/src/jwt-auth.guard.spec.ts` | 3 | Medium | Missing `@Public` / optional-auth paths |
| `apps/backend/src/env-guard.spec.ts` | 4 | Low | Clear negative cases |
| `apps/backend/src/mail.util.spec.ts` | 10 | Low | Boundary at mailer; good |
| `apps/backend/src/notification.service.spec.ts` | 10 | Low | Jane Doe / example.com |
| `apps/backend/src/file-validation.spec.ts` | 4 | Low | Sampled OK |
| `apps/backend/src/upload-storage.service.spec.ts` | 3 | Low | Buffer equality `toBe(true)` |
| `apps/backend/src/email-templates.spec.ts` | 4 | Low | Sampled OK |
| `apps/frontend/src/lib/auth-session.spec.ts` | 5 | Low | OK |
| `apps/frontend/src/lib/feedlog.spec.ts` | 4 | Low | OK |
| `shared/src/product-units.spec.ts` | 16 | Low | Table-driven units — good |
| `shared/src/index.spec.ts` | 8 | Low | `toBe(true)` on validators — acceptable for booleans |
| `shared/src/otp.spec.ts` | 3 | Low | OK |
| `shared/src/product-images.spec.ts` | 6 | Low | Uses example.com as **negative** URL — fine |
| `shared/src/build-exports.spec.ts` | 2 | Low | Build artifact check |
| **Missing:** `app.controller.ts` / `openapi-spec.ts` / `RegistrationSuccessModal.tsx` | 0 | **High** | Untested since `8c5f4ca` and BUG-016 |

---

## Testability (application code)

`AppService` is constructor-injected (JWT, database, redis, Paystack, notifications) — **testable**. Tests already substitute the DB with `enabled: false`.

`AppController` wires cookies, throttling, and uploads inline — hard to unit-test without Nest testing module. Extract discovery handlers (`apiIndex`, `openapi`) as trivial functions or add a Nest `TestingModule` spec.

`RegistrationSuccessModal` mixes timers + document listeners — needs `@testing-library/react` (not in `jest` env today; frontend specs are Node, not jsdom). Adding RTL would be a framework change.

---

## High-severity remediations

1. **TRI-001 still open:** `dova/ops/logs/` is empty (`.gitkeep` only). Re-run `SMOKE_OTP_CODE=… npm run smoke:production` after deploying `stg` and save the log. Until then, production smoke is unproven for admin-delete and later commits.

2. **Add Jest for discovery:** assert `DOVA_OPENAPI.openapi === '3.0.3'`, required path keys, and (with Nest testing) `GET /` returns `{ service: 'dova-api', version: 'v1' }`.

3. **Split bcrypt cost in unit tests** (or `bcrypt.hash` with cost 4 via env) so the suite is not 40 s of hashing. Failures today look like hangs.

4. **Do not treat `npm run test -w apps/backend` as the unit suite** — it only compiles.
