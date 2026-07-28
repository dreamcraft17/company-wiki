# DN Tech Testing Guide

Testing framework DN Tech mengimplementasikan target dari:
- `docs/test/DN-TECH-TESTING-PRD.md`
- `docs/test/DN-TECH-TESTING-SRS.md`
- `docs/test/DN-TECH-TESTING-SDD.md`

## Coverage layer yang tersedia

1. **Backend unit tests** (`backend/src/__tests__/utils`, `services`, `templates`)
2. **Backend integration tests** (`backend/src/__tests__/integration`)
3. **Frontend unit tests** (`frontend/src/__tests__`)
4. **E2E critical-path tests** (`frontend/e2e/tests`)
5. **Performance scripts** (`backend/performance/k6`)

## Perintah utama

### Backend

```bash
cd backend
npm run test
npm run test:unit
npm run test:integration
npm run test:coverage
```

### Frontend

```bash
cd frontend
npm run test
npm run test:coverage
npm run test:e2e
```

### Performance (k6)

```bash
cd backend
npm run perf:homepage
npm run perf:contact
npm run perf:product
```

## Hasil aktual (Jul 28, 2026)

- Backend `npm run test:coverage`: **45/45 passed**  
  Coverage: **76.17% statements**, **62.25% branches**, **75.40% functions**, **77.28% lines**
- Frontend `npm run test:coverage`: **36/36 passed**  
  Coverage: **67.33% statements**, **42.95% branches**, **78.00% functions**, **69.36% lines**
- Integration tests: **15+ scenarios**
- E2E tests: **5 scenarios** (`--list` = 10 runs across desktop+mobile projects)

## CI pipeline

Workflow `.github/workflows/ci.yml` menjalankan:
- Backend lint + Prisma push + unit + integration + build
- Frontend lint + unit test + build
- Frontend Playwright smoke E2E

## Local auto-guard (Cursor hook)

Project hook di `.cursor/hooks.json`:
- Event: `beforeShellExecution`
- Matcher: `git push`
- Script: `.cursor/hooks/ensure-tests-before-push.sh`

Behavior:
- Jika artifact `backend/coverage/coverage-summary.json` atau `frontend/coverage/coverage-summary.json` belum ada, `git push` akan ditolak dengan instruksi menjalankan test coverage.

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
