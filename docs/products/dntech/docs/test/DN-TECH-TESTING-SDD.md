# DN Tech — Testing SDD
## System Design Detail (Test Infrastructure & Implementation)

**Date:** Juli 2026  
**Owner:** Engineering + QA Team  
**Status:** ✅ Completed in codebase with expanded suites and coverage snapshot

## Implemented Architecture

- Backend test runner: Jest + ts-jest
- Frontend test runner: Jest + React Testing Library
- API integration tests: Supertest
- E2E runner: Playwright (desktop + mobile projects)
- Performance scripts: k6 (`homepage`, `contact-form`, `product-page`)
- CI enforcement: `.github/workflows/ci.yml`

## Operational Guard

- Project-level push guard hook:
  - Config: `.cursor/hooks.json`
  - Script: `.cursor/hooks/ensure-tests-before-push.sh`
  - Behavior: block `git push` jika artifact coverage backend/frontend belum ada

## Validation Snapshot

- Backend coverage run: pass (`45/45`)
- Frontend coverage run: pass (`36/36`)
- E2E list: 5 scenarios (10 executions across 2 projects)

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
