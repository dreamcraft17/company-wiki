# dnShopee — Combined engineering review

> **Status:** Request changes (do not treat as ship-ready)  
> **Last updated:** 2026-09-05  
> **Author:** Dozer  
> **Scope:** `dnShopee/` on `main` @ `120bffd` vs origin  
> **Method:** `/code-review` + code-reviewer scripts + senior-backend pass + AI bug triage + AI QA review  
> **Excluded:** Changelog / Keep-a-Changelog draft (generated internally, not copied here)

## Summary

dnShop Finance is a NestJS + Next.js product (v2.2 accounting depth) with real HMAC helpers, production env guards, shop permission fail-closed, and a green 65-test Jest suite. That is not enough to ship: **access tokens live in `sessionStorage`**, several **unauthenticated write/join surfaces** exist, **webhook failures are swallowed**, and **HTTP “contract” tests describe a login JSON shape the real `AuthService` does not return**.

**Code-reviewer tooling (last 15 commits vs HEAD):** complexity **8 / 10** (Very Complex), **69 files**, **+7627 / −487**. Quality checker: backend **B (86.6)** over 70 files / **390 smells**; frontend **B (86.7)** over 20 files / **79 smells**. God files (`journal.ts` ~1996 lines, `v22-accounting.ts` 1111, catch-all `page.tsx` 1205) dominate the F grades.

**Verdict (review_report_generator scale):** **Request changes** — multiple high-severity behavioral/security issues; analyzer “critical hardcoded secrets” hits were **test fixtures**, not production keys.

**Verification:** Jest **11 suites / 65 tests**, run **3× green** in-band (no flake). Coverage **21.8% statements / 7.1% branches / 6.2% functions**. Playwright E2E was **not executed** in this pass (would start `next dev`); review of `e2e/*.spec.ts` is static. Mutation testing **not run**.

---

## Findings (severity order)

### Critical

| ID | Finding | Where | Why it matters | Fix |
|----|---------|-------|----------------|-----|
| C1 | **Unauthenticated Socket.IO join** | `events-gateway.ts` `@WebSocketGateway({ cors: { origin: true } })` + `join_shop` | Any client can subscribe to `shop:{id}` realtime rooms. CORS `origin: true` reflects any Origin. | Require JWT on handshake; join only shops the user can `access.require`; restrict CORS to `CORS_ORIGINS`. |
| C2 | **Unauthenticated email bounce webhook** | `notifications.ts` `POST /webhooks/email/bounce` `@Public()` | Attacker can mark arbitrary emails bounced (`message_id` / `to_email` from body). | HMAC or shared secret from the ESP; reject unsigned payloads in production. |
| C3 | **Shopee webhook processing is fire-and-forget and errors are dropped** | `shops.ts` `runOrEnqueue(...).catch(() => undefined)` | Invalid work still returns `{ code: 0 }`; handler failures vanish. Duplicate/idempotency can diverge from Shopee retries. | Await (or ACK after persist); log+metric on reject; do not ACK success until the job is durably queued. |

### High

| ID | Finding | Where | Why it matters | Fix |
|----|---------|-------|----------------|-----|
| H1 | **Access JWT in `sessionStorage` (XSS = session theft)** | `auth-form.tsx` `dnshop_token`; `api.ts` Bearer header | Refresh cookie is `httpOnly`; access token is not. Any XSS (or extension) steals a 24h JWT. | Prefer BFF cookie for access, or memory-only token + silent refresh; tighten CSP; shorten `expiresIn` (e.g. 15m). |
| H2 | **Post-login open redirect** | `auth-form.tsx` `router.push(search.get("next") \|\| "/dashboard")` | `?next=https://evil.example` can send a logged-in user off-origin depending on Next routing. | Allow only same-origin relative paths starting with `/` and not `//`. |
| H3 | **OTP and reset secrets in URLs** | `auth.ts` `sendOtp` link `?otp=&email=`; reset `?reset=`; `auth-form` auto-submits OTP from query | URLs leak via Referer, logs, history. Reset token has **no expiry** (stored as `emailVerificationToken`). | OTP in email body only; hashed reset token + TTL; never put OTP in query. |
| H4 | **Production CORS always allows `http://localhost:6000`** | `main.ts` `corsOrigins()` | Stolen cookies/token use from a local origin if the user visits a malicious page while prod cookies apply (credentialed CORS). | Never append localhost in `NODE_ENV=production`. |
| H5 | **Credentialed CORS allows missing `Origin`** | `main.ts` `if (!origin) return callback(null, true)` | Correct for curl; also allows non-browser clients. Combined with cookies, tighten to an allowlist of server peers if needed. | Keep for health checks only on non-cookie routes; do not treat as browser CORS success. |
| H6 | **In-memory auth rate limits and OTP store** | `AuthService` Maps | Multi-instance / restart resets lockouts; OTP/reset abuse. | Redis (already optional) or DB-backed counters; fail closed in production if Redis missing. |
| H7 | **OAuth state race** | `oauth-state.ts` `createState` → `void this.save(...)` | Redirect can start before Redis/memory write completes → flaky Shopee connect. | `await save` before returning state. |
| H8 | **DB TLS `rejectUnauthorized: false` for Supabase** | `app.module.ts` `dbSsl()` | MITM on the Postgres connection. | Use the platform CA; never disable verification in production. |
| H9 | **HTTP login contract does not match production** | `api-http.spec.ts` vs `AuthService.login` | Test mock returns `{ user: { email } }`; real login returns **top-level** `email`. Frontend uses `data.token` (OK) but any consumer of `body.user` is untested. | Mock the real DTO; add assertion `expect(res.body.email).toBe(...)` and `expect(res.body.user).toBeUndefined()`. |
| H10 | **Period lock skipped on empty dates** | `period-lock.ts` + spec *“ignores empty entry dates”* | Callers that omit `entryDate` can post into a locked month. | Fail closed: missing/invalid date → reject. |
| H11 | **JWT HS256 default secret still in strategy** | `auth.ts` `secretOrKey: config.get('JWT_SECRET', 'dev-secret-change-me')` | `validateProductionEnv` helps boot, but any mis-set env in a “non-production” deploy still signs with the well-known default. | Require secret always except explicit local; pin `algorithms: ['HS256']`. |

### Medium

| ID | Finding | Where | Notes |
|----|---------|-------|-------|
| M1 | God modules | `journal.ts` (~2k), `shops.ts`, `v21.ts`, `v22-accounting.ts`, `journal.tsx`, `[...slug]/page.tsx` | Quality score 0–41 (F). Split controllers vs domain services; typed DTOs instead of `body: any`. |
| M2 | Bank CSV import N+1 | `phase2.ts` `import` `findOneBy` per row | Slow and racy; unique index + bulk insert. |
| M3 | Dead-letter array unbounded | `job-queue.ts` | Memory leak under poison messages. Cap + persist. |
| M4 | Health Redis “unknown” on public health | `auth.ts` `extendedHealth` | Does not ping Redis; ops can think Redis is fine. Align with `ObservabilityService.pingService`. |
| M5 | OpenAPI stub vs Nest | `docs/openapi-v1.yaml` login **200**; Nest POST **201** | Contract test only checks path strings exist, not status codes. |
| M6 | `APP_VERSION` drift | `.env.example` `2.1.0` vs health default `2.2.0` | Confuses deploy/smoke. |
| M7 | TypeORM `synchronize` when not production | `app.module.ts` | Staging with `NODE_ENV=staging` still auto-alters schema. Gate on explicit `TYPEORM_SYNC=true`. |
| M8 | Demo credentials prefilled | `auth-form.tsx`, Playwright | Fine for local demo; must be compile-stripped or env-gated for production builds. |
| M9 | `AdminGuard` default `ADMIN_EMAILS=seller@dnshop.id` | `v21.ts` | Demo seller is admin if env forgotten (prod env validation mitigates `ADMIN_EMAILS` default). |
| M10 | Public `/metrics` | `v21.ts` `MetricsController` | Low sensitivity today (tier deny + p95); still scrape-without-auth. Protect with network policy or token. |
| M11 | Journal download duplicates `api.ts` | `journal.tsx` manual `fetch` + Bearer | Drift vs central client (no 401 redirect). Use `download()` / `api()`. |
| M12 | Analyzer “hardcoded secrets” in specs | `api-http.spec.ts`, `api-smoke.spec.ts` | False positive on `Seller123!` / `dev-secret-change-me` in tests. Keep; do not copy into app bundles. |

### Low

| ID | Finding | Notes |
|----|---------|-------|
| L1 | Vague git subjects (`asd`, `ad`, `logo`, `redesing total`) | Conventional Commits linter fails many historical messages; recent `feat`/`fix`/`test` are better. |
| L2 | LoginDto has no password complexity | Register has `@Matches`; login only `@IsString()`. OK for login, inconsistent UX. |
| L3 | Coverage thresholds 15/15/5/3 | Suite is green while ~93% of functions are untested. Raise after extracting services. |
| L4 | Magic COA numbers | `v22-accounting.ts` — expected chart-of-accounts codes; name constants. |

---

## Code-reviewer (scripts + TS/universal rules)

### PR analyzer (HEAD~15…HEAD)

- Complexity **8**, label **Very Complex**.
- **Critical (tool):** hardcoded-secret regex on test files — **downgrade** after human review.
- **Medium:** widespread `any`, one eslint-disable in `v22-accounting.ts`.
- **Commit format:** 7 of last 15 messages fail Conventional Commits (`new hero design`, `asd`, …).
- **Review order (tool):** `auth-form.tsx`, HTTP specs, OpenAPI, v2.2 migration.

### Quality checker (thresholds: fn>50, file>500, nesting>4, complexity>10)

Worst backend files by score:

| Score | Grade | Lines | File |
|------:|:-----|------:|------|
| 0 | F | 1111 | `v22-accounting.ts` |
| 24 | F | 467 | `coa-template.ts` |
| 26 | F | 1146 | `shops.ts` |
| 28 | F | 781 | `demo-data.ts` |
| 31 | F | 1996 | `journal.ts` |
| 54 | F | 681 | `shopee-sync.ts` |
| 57 | F | 966 | `v21.ts` |

Worst frontend:

| Score | Grade | Lines | File |
|------:|:-----|------:|------|
| 25 | F | 1205 | `app/(app)/[...slug]/page.tsx` |
| 41 | F | 1087 | `components/journal.tsx` |
| 69 | D | 397 | `journal-onboarding.tsx` |

Universal hits confirmed in source: **empty/swallowed catch** on webhook enqueue; **unbounded collections** (OTP map, DLQ array); **missing await** on OAuth save; **N+1** CSV import; **overly broad CORS**.

TypeScript hits: pervasive `any` on journal/tax controllers; `console.log` used as structured JSON logger in `main.ts` (acceptable if log shipper expects stdout).

---

## Senior backend

### What is already solid

- Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`).
- Helmet, cookie-parser, request-id, URL redaction for `token`/`otp`/`password`.
- bcrypt cost 12; refresh hashed; login lockout after 5 failures.
- Shop permission metadata fail-closed when `shopId` missing (`ShopPermissionGuard`).
- SOPI webhook HMAC + 5-minute replay window when secret is configured; production refuses missing webhook secret.
- AES-256-GCM for Shopee tokens; prod env validation for `JWT_SECRET` / encryption key / `ADMIN_EMAILS`.
- Throttler 60/min global; tighter on auth routes.
- Parameterized TypeORM / `$1` in demo cleanup (no string-built SQL from user input in the paths reviewed).

### Gaps vs backend skill bar

| Assumption | Status |
|------------|--------|
| Read/write ratio + 1y p99 QPS | **TBD** — not in repo |
| Tenancy | Shared shops via `ShopMember` (multi-tenant) |
| Data sensitivity | **PII + financial** (email, journal, tax, Shopee tokens) |
| SLO + error-budget owner | **TBD** — health 503 exists; no p50/p95/p99 API SLOs named |

Incomplete without stated **latency targets, uptime SLO, RPO/RTO**. Suggested floor until product confirms: p99 API **≤ 600ms** (node-express profile), RPO **≤ 24h** backups, RTO **≤ 4h** — treat as proposal, not measured.

### API / ops notes

- Prefer **401/403 HTTP** on webhook auth failure if Shopee docs allow; today **HTTP 200 + `code: 1`** matches Shopee push style but hides failures in generic uptime checks.
- Inline Bull fallback when Redis down is correct for a VPS; production accounting sync should **not** silently inline unbounded Shopee work on the request thread.
- OpenAPI stub is explicitly partial (~critical routes). Expand before external consumers.

---

## AI bug triage

No CI log dump was supplied. Failures below are **code-derived tickets** (human approval before filing). Dedup fingerprints are SHA-256-style **16-hex labels** from stable anchors (not LLM similarity).

### Ticket A — Realtime room hijack

- **Fingerprint:** `c1joinshopcors0001`
- **Category:** application bug · **Severity:** Critical · **Priority:** P0
- **Component:** `events-gateway`
- **Title:** Socket.IO `join_shop` has no auth; CORS reflects any origin
- **Repro:** Connect to `/realtime`, emit `join_shop` with a victim `shop_id`, observe events.
- **Expected:** Handshake JWT + membership check.
- **Actual:** Any socket can join.
- **Evidence:** `events-gateway.ts` `handleJoin` / `cors: { origin: true }`.
- **Assignee hint:** backend / realtime

### Ticket B — Bounce webhook abuse

- **Fingerprint:** `c2emailbounce00002`
- **Category:** application bug · **Severity:** Critical · **Priority:** P0
- **Component:** `notifications`
- **Title:** Public bounce endpoint accepts unsigned JSON
- **Repro:** `POST /api/v1/webhooks/email/bounce` with another user’s email.
- **Related:** H3 (OTP/reset in mail) — bounce can disrupt verification.

### Ticket C — Webhook ACK vs processing

- **Fingerprint:** `c3webhookswallow03`
- **Category:** application bug · **Severity:** Critical · **Priority:** P1 (P0 if live Shopee)
- **Component:** `shops` / `job-queue`
- **Title:** Webhook returns success while handler promise is discarded
- **Frequency:** every push path (`/shopee/webhook`, `/webhooks/shopee`)

### Ticket D — Contract test lies about login body

- **Fingerprint:** `h9loginshape00004`
- **Category:** test bug · **Severity:** Major · **Priority:** P1
- **Component:** `api-http.spec.ts`
- **Title:** Supertest mock nested `user` does not match `AuthService.login`
- **Related cluster:** OpenAPI 200 vs Nest 201 (M5)

### Ticket E — Period lock bypass

- **Fingerprint:** `h10periodempty005`
- **Category:** application bug · **Severity:** Major · **Priority:** P1
- **Component:** `period-lock`
- **Title:** Empty `entryDate` skips lock
- **Note:** Current unit test **encodes the bug** as desired behavior.

Duplicates: none filed in tracker (no GitHub issue IDs in-repo). Do **not** auto-close anything.

---

## AI QA review

`.agents/qa-project-context.md` is **absent**. Frameworks: **Jest** (backend), **Playwright** (frontend e2e only). No frontend unit tests.

### Findings by file

| File | Severity | Smells | Notes |
|------|----------|--------|-------|
| `api-http.spec.ts` | **High** | Diagnostic, coverage, AI-loop | Mocks invent nested `user`; webhook `timestamp: 1` would fail real 5-min window; Throttler overridden. Does not prove production AuthService. |
| `period-lock.spec.ts` | **High** | Coverage (negative path inverted) | Documents empty-date bypass. |
| `api-smoke.spec.ts` | Medium | Happy-path health | Good 503 + `validateProductionEnv`; Redis/SMTP not exercised. |
| `api-routes.contract.spec.ts` | Medium | Weak assertion | `toContain` path substring only — no method/status/schema. |
| `v21.spec.ts` / `shopee-client.spec.ts` | Low | — | Real HMAC unit tests; keep as regression anchors. |
| `journal.spec.ts` / `v22-accounting.spec.ts` / `phase2.spec.ts` | Medium | Happy path / complexity | God modules under-tested vs line count. |
| `e2e/login.spec.ts` | **High** | Coverage, generic data, no API | Prefills demo password; empty submit only checks URL stays `/login`. **No successful login, no 401, no lockout.** |
| `e2e/landing.spec.ts` | Low | Happy path | Headline/CTA only. |
| `auth.ts` / `shops.ts` (testability) | High | DI OK, but fat services | Extract encrypt, webhook verify, token issue for unit tests without Nest. |

### Smell buckets

| Bucket | Result |
|--------|--------|
| Readability | Obscure setup in HTTP module compile; OK elsewhere. |
| Reliability | No `waitForTimeout` in e2e. Jest 3× green. In-memory rate limits make auth tests environment-sensitive in prod-like multi-node. |
| Diagnostic | Login test asserts `body.user.email` — failure would not match prod. Catch in `api.ts` empty `catch {}` on JSON parse (acceptable). |
| Design | Over-mock of AuthService (entire login). Giant app files force E2E-or-nothing. |
| AI-generated | HTTP/E2E look recently added (`test: add Supertest…`); generic `Seller123!` / `seller@dnshop.id`; closed loop risk (same change set as contracts). |
| Coverage | **Happy path heavy.** Missing: refresh rotation, CSRF on cookie refresh, webhook replay, shop isolation, journal period-lock on createEntry, XSS/open-redirect, socket auth. |

### Testability

- **Good:** `assertPeriodUnlocked` is a pure function.
- **Hard:** `AuthService` owns mail + JWT + maps; `ShopeeWebhookService` mixed verify/persist/queue.
- **Interface:** Controllers take `req: any` / `body: any` — extract DTOs already started in `dto/shopee.dto.ts`.

### PR checklist (changed tests)

- [x] Names mostly readable  
- [ ] Setup matches production (login shape)  
- [x] No sleep waits  
- [ ] Error + boundary paths for auth/webhooks  
- [ ] Assertions specific to real JSON  

### Automated gate (this review)

**Warranted:** raise Jest `coverageThreshold` for new files (`api-http`, `period-lock`) to **lines 80%** on those paths; add ESLint `no-restricted-syntax` for `sessionStorage.setItem("dnshop_token"` until H1 is fixed; Playwright: fail if login password default is present when `CI=true`.

Mutation score: **not recorded** (Stryker not run).

---

## Recommended sequence

1. P0: socket auth (C1), bounce HMAC (C2), webhook ACK (C3).  
2. P1: token storage + open redirect (H1–H2), OTP/reset (H3), CORS prod (H4), period-lock fail-closed (H10), fix HTTP mock (H9).  
3. Split `journal.ts` / catch-all page; raise coverage on extracted modules.  
4. Tag a release only after changelog skill is re-run on a **clean conventional** range (not in this document).

---

## Appendix — evidence commands

```bash
# Backend (3× green in this review)
cd apps/backend && npm test -- --runInBand

# Quality / PR complexity
python3 ../.cursor/skills/code-reviewer/scripts/code_quality_checker.py apps/backend/src --language typescript --json
python3 ../.cursor/skills/code-reviewer/scripts/pr_analyzer.py . --base HEAD~15 --head HEAD --json
```

Playwright: `cd apps/frontend && npm run test:e2e` (not run here).
