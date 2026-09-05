# Changelog

> **Author:** Dozer
> **Date:** 2026-09-05

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.1] - 2026-09-05

Patch after v2.2.0 (`6b27974`..this release). SemVer bump from conventional commits: **patch** (fixes only; no `feat` / breaking). Tags: `v2.2.0` on the accounting-depth ship commit, `v2.2.1` on this changelog.

### Added
- OpenAPI stub for critical routes (`docs/openapi-v1.yaml`)
- API smoke tests (health 200/503), period-lock unit tests, and production env-guard tests
- Supertest HTTP contract tests (`api-http.spec.ts`) — login, health, Shopee status, webhook HMAC
- Playwright E2E smoke (`apps/frontend/e2e/`) — landing and login UI

### Fixed
- Period lock, tax static route `summary` (before `:taxId`), and API contracts
- Health default `APP_VERSION` aligned to 2.2.0

<!-- recommended-semver-bump: patch -->

## [2.2.0] - 2026-08-21

### Added
- Accounting depth: cash flow, auto-COGS, Accurate/Jurnal/MYOB export, e-Faktur
- Comparative amounts in CALK / Laba Rugi / Neraca
- CALK (Catatan atas Laporan Keuangan) page

### Changed
- Journal YTD comparative walk no longer double-walks the chain
- `refreshBalances` batched instead of one DB round-trip per account
- Landing hero typeface → Plus Jakarta Sans

### Fixed
- Nest DI crash-loop from v22↔phase2 circular import
- balanceSheet carry-forward cold-query ordering
- Journal bugs found against real Postgres
- Favicon/logo duplication on landing hero
