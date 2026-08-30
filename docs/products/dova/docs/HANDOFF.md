# Handoff — DOVA

> **Author:** Dozer
> **Date:** 2026-08-30

## Goal of next session

Not specified beyond "project dova." No work was done in the session that generated this handoff — it opened directly with a handoff request before any task was given. Treat this as a fresh-start briefing on where DOVA stands, not a continuation of prior in-session work. Confirm with the user which item to tackle (candidates below) unless they've already said.

## State of play

- Repo: `dova` (GitHub `dreamcraft17/dova`). Working tree clean, `main` up to date with origin, HEAD `ebd71bd`.
- Product: DOVA — food/agri supply marketplace (Nigeria, NGN, Paystack). **Production live** at https://dova.dntech.id, API at https://api.dova.dntech.id/api/v1/health. Tag `v0.5.4` + unreleased auth UX.
- Phase per [current-phase.md](./current-phase.md): **Production live — post-launch UX hardening**. 158 unit tests, 29+10 smoke tests passing, inline registration OTP shipped, register success modal (Bug-016) shipped, QA security checklist 4/4 pass.
- Two commits exist beyond what `current-phase.md` / `00_INDEX.md` document as HEAD (`642b165`/`129ba96`): `129ba96` (CORS align for backend `.env.dev` with frontend port 3001) and `ebd71bd` (README local-dev link fix). Both are minor/docs, not new features — but the documented HEAD pointer is stale by one doc commit.
- This wiki repo (`dova-comp-wiki`) is the docs SSOT, mirrored (read-only, generated) into `company-wiki/docs/products/dova/` via `scripts/sync-to-company-wiki.sh`. Don't hand-edit the company-wiki copy — edit here and re-run the sync script.

## Open decisions

- What's next, per the "in progress / optional" column in [current-phase.md](./current-phase.md): manual UAT of admin/feedback UI, tagging `v0.5.5`, login/register UI polish (frontend), E2E Playwright coverage, or a `dovachain.com` domain alias. No priority order has been set.
- Whether to bump the documented HEAD (`642b165`→`ebd71bd`) as routine housekeeping, or leave it since the two pending commits are trivial.

## Skills to use

- `senior-fullstack` or `senior-frontend` if the target is login/register UI polish.
- `playwright-pro` / `mobile-testing` if the target is E2E Playwright coverage.
- `release-readiness` if the target is cutting `v0.5.5` or another go/no-go check.
- `md-generator` (or direct edits) if the target is just syncing the `current-phase.md` / `00_INDEX.md` HEAD pointers.
- `handoff` again at the end of the next session, so state stays current.

## Artifacts (do not duplicate — reference only)

- [current-phase.md](./current-phase.md) — one-line status, live vs in-progress table, production URLs, verify-production commands.
- [00_INDEX.md](../00_INDEX.md) — full doc index (operations, code/QA, specs).
- [DOVA-RELEASE-READINESS-AUDIT.md](./DOVA-RELEASE-READINESS-AUDIT.md) — release readiness audit.
- [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) and [All-features.md](../All-features.md) — feature inventory (101 features).
- [SMOKE-PRODUCTION-RESULT.md](./SMOKE-PRODUCTION-RESULT.md) — latest production smoke log.
- [DOVA-BUG-TRIAGE.md](./DOVA-BUG-TRIAGE.md), [BUG_FIXES.md](./BUG_FIXES.md), [UAT-BUG-FIXES.md](./UAT-BUG-FIXES.md) — bug logs.
- App repo commit history: last 20 commits span `ebd71bd` down to `cbce2c8`, all landed, working tree clean.
