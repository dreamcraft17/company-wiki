# DN Tech — Testing Framework PRD
## Unit Tests, Integration Tests, E2E Tests & Automation

**Date:** Juli 2026  
**Owner:** QA + Engineering Team  
**Project:** dntech.id (Next.js + Express + PostgreSQL)  
**Status:** ✅ Completed in codebase (Jest + RTL + Supertest + Playwright + k6 scripts)

---

## 1. Executive Summary

**Problem:** V1-V7 codebase belum punya automated testing — semua QA manual, risiko regresi tinggi, CI/CD tidak credible tanpa test results.

**Solution:** Implementasi testing framework multi-layer:
- **Unit tests** (components, services, utilities)
- **Integration tests** (API endpoints + database)
- **E2E tests** (user workflows via Playwright)
- **Performance tests** (load testing via k6)
- **API contract tests** (schema validation)

**Goal:** 
- ✅ Test coverage ≥ 75% critical paths
- ✅ CI fails jika test break
- ✅ Production confidence meningkat
- ✅ Debugging + onboarding lebih cepat

---

## 2. Scope & Test Layers

### Layer 1: Unit Tests (Smallest scope)

**What:** Test individual functions, components, utilities in isolation.

| Layer | Framework | Coverage | Examples |
|-------|-----------|----------|----------|
| **Frontend Components** | Jest + React Testing Library | 70% | Button, Form, Modal, Card |
| **Backend Services** | Jest + Supertest | 75% | EmailService, AuthService, ProductService |
| **Utilities** | Jest | 80% | formatCurrency(), validateEmail(), parseJWT() |
| **Hooks** | @testing-library/react-hooks | 70% | useExitIntent, useSettings, useFetch |

**Tools:**
```json
{
  "devDependencies": {
    "jest": "^29",
    "@testing-library/react": "^14",
    "@testing-library/jest-dom": "^6",
    "ts-jest": "^29",
    "supertest": "^6"
  }
}
```

---

### Layer 2: Integration Tests (Medium scope)

**What:** Test multiple components working together (e.g., API + Database + Email).

| Scenario | Services | Example |
|----------|----------|---------|
| Contact Form → Email | Form validation → API → EmailService → SMTP | Submit form → email sent to info@dntech.id |
| Newsletter Subscribe | Form → API → Database → Email → Confirm link | Subscribe → opt-in email → click link → subscriber confirmed |
| Product CRUD | Admin form → API → Database → Cache invalidation | Create product → GET /products → cache updated |
| Login → Refresh | Login → JWT → Refresh token → new access token | Admin login → wait 15min → auto-refresh → still logged in |

**Tools:**
```json
{
  "devDependencies": {
    "jest": "^29",
    "supertest": "^6",
    "@prisma/client": "^5",
    "node-mocks-http": "^1"
  }
}
```

---

### Layer 3: E2E Tests (Largest scope)

**What:** Test complete user workflows via browser automation.

| Workflow | Steps | Expected Result |
|----------|-------|-----------------|
| **Lead Generation** | 1. Visit homepage 2. Scroll to contact form 3. Fill form 4. Submit | Email received at info@dntech.id within 2min |
| **Newsletter Signup** | 1. Scroll to newsletter CTA 2. Enter email 3. Submit 4. Check email 5. Click confirm | Newsletter subscriber status = confirmed |
| **Browse Product** | 1. Click "Produk" nav 2. See product list 3. Click dnPeople 4. Scroll pricing section | Pricing tiers render, CTA clickable |
| **View Portfolio** | 1. Click "Konsultasi Gratis" 2. Modal/form opens 3. Fill form | Form submission successful |

**Tools:**
```json
{
  "devDependencies": {
    "@playwright/test": "^1.40",
    "dotenv": "^16"
  }
}
```

---

### Layer 4: Performance Tests (Load testing)

**What:** Test system behavior under load.

| Scenario | Load | Duration | Success Criteria |
|----------|------|----------|------------------|
| Homepage load | 100 concurrent users | 5 minutes | p95 latency < 2s, 0 errors |
| Product page | 50 concurrent users | 3 minutes | p95 latency < 1.5s, 200 OK |
| Contact form submit | 20 concurrent submissions | 2 minutes | 100% success, SMTP delivers all |

**Tools:**
```json
{
  "devDependencies": {
    "k6": "^0.43"
  }
}
```

---

## 3. Test Coverage Targets

### Critical Paths (Must test ≥ 80%)

**Frontend:**
```
✅ Hero CTA buttons → navigate to /contact
✅ Contact form 3-step validation → submit → success page
✅ Newsletter signup → email delivery
✅ Navigation mobile toggle → opens/closes
✅ Product pricing tiers → render 5 tiers
```

**Backend:**
```
✅ POST /leads → save to DB + email sent
✅ POST /newsletter/subscribe → token created + email sent
✅ GET /products/dnpeople → return all V7 fields
✅ GET /health → return status = ok
✅ POST /auth/login → JWT issued
✅ POST /auth/refresh → new access token
```

### Target Coverage (% of codebase)

| Layer | Current | Target | Owner |
|-------|---------|--------|-------|
| Frontend components | 0% | 70% | Frontend team |
| Backend services | 0% | 75% | Backend team |
| Utilities | 0% | 80% | Both |
| Integration | 0% | 60% | QA team |
| E2E critical paths | 0% | 90% | QA team |

---

## 4. Test Structure (File Organization)

```
dntech/
├── frontend/
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── components/
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── ContactForm.test.tsx
│   │   │   │   ├── Header.test.tsx
│   │   │   │   └── ...
│   │   │   ├── hooks/
│   │   │   │   ├── useExitIntent.test.ts
│   │   │   │   ├── useSettings.test.ts
│   │   │   │   └── ...
│   │   │   ├── lib/
│   │   │   │   ├── currency.test.ts
│   │   │   │   ├── seo.test.ts
│   │   │   │   └── ...
│   │   │   └── integration/
│   │   │       ├── contact-form.test.ts
│   │   │       ├── newsletter-flow.test.ts
│   │   │       └── ...
│   │   └── jest.config.js
│   └── e2e/
│       ├── playwright.config.ts
│       ├── tests/
│       │   ├── homepage.spec.ts
│       │   ├── contact-form.spec.ts
│       │   ├── product-page.spec.ts
│       │   ├── navbar-mobile.spec.ts
│       │   └── ...
│       └── fixtures/
│           ├── auth.ts
│           ├── data.ts
│           └── ...
│
├── backend/
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── services/
│   │   │   │   ├── EmailService.test.ts
│   │   │   │   ├── ProductService.test.ts
│   │   │   │   ├── AuthService.test.ts
│   │   │   │   └── ...
│   │   │   ├── routes/
│   │   │   │   ├── leads.test.ts
│   │   │   │   ├── products.test.ts
│   │   │   │   ├── auth.test.ts
│   │   │   │   └── ...
│   │   │   ├── utils/
│   │   │   │   ├── jwt.test.ts
│   │   │   │   ├── validators.test.ts
│   │   │   │   └── ...
│   │   │   └── integration/
│   │   │       ├── lead-to-email.test.ts
│   │   │       ├── product-crud.test.ts
│   │   │       ├── auth-flow.test.ts
│   │   │       └── ...
│   │   └── jest.config.js
│   └── performance/
│       ├── k6/
│       │   ├── homepage.js
│       │   ├── contact-form.js
│       │   ├── product-page.js
│       │   └── ...
│       └── results/
│           └── loadtest-results.json
│
└── docs/
    └── TESTING.md (guide + commands)
```

---

## 5. Test Configuration (Jest)

### Backend Jest Config

```javascript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 10000,
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
};
```

### Frontend Jest Config

```javascript
// frontend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.tsx', '**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.tsx',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

---

## 6. GitHub Actions CI Configuration

### .github/workflows/test.yml

```yaml
name: Test

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run test -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend

  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: dntech_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: cd backend && npm ci
      - run: cd backend && npm run lint
      - run: cd backend && npm run test:unit -- --coverage
      - run: cd backend && npm run test:integration
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
          flags: backend

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npx playwright install
      - run: npm run start:backend &
      - run: npm run start:frontend &
      - run: sleep 5  # Wait for services
      
      - run: npm run test:e2e -- --reporter=html
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## 7. Test Commands (package.json scripts)

### Frontend Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:update": "jest --updateSnapshot",
    "test:component": "jest --testPathPattern=components",
    "test:hook": "jest --testPathPattern=hooks",
    "test:e2e": "playwright test",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

### Backend Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:coverage": "jest --coverage",
    "test:smtp": "ts-node scripts/test-smtp.ts",
    "perf:load": "k6 run performance/k6/homepage.js"
  }
}
```

---

## 8. Success Metrics & Acceptance Criteria

| Metric | Target | Acceptance |
|--------|--------|------------|
| **Unit test coverage** | ≥ 75% critical paths | Codecov report shows ≥75% |
| **Integration test pass rate** | 100% | No failing integration tests in CI |
| **E2E test pass rate** | 100% on critical paths | All critical workflows pass |
| **Test execution time** | < 10 min total | Unit + integration < 10 min on CI |
| **E2E test time** | < 5 min | 5 critical workflows < 5 min total |
| **Performance baseline** | p95 latency < 2s | k6 load test shows < 2s p95 |
| **Coverage trend** | +5% month-over-month | Coverage increases each sprint |

---

## 9. Phased Rollout

### Phase 1: Weeks 1-2 (Foundations)
- [x] Jest setup (backend + frontend)
- [x] 20 unit tests (critical services + components)
- [x] CI GitHub Actions pipeline
- [x] Coverage reports

### Phase 2: Weeks 3-4
- [x] 30 more unit tests (total 50+)
- [x] 15 integration tests (API + database flows)
- [x] Coverage-ready CI artifacts
- [x] Test documentation

### Phase 3: Weeks 5-6
- [x] Playwright E2E tests (critical paths)
- [x] k6 performance test scripts
- [x] Test coverage captured and documented
- [x] All CI checks mandatory

---

## 10. Testing Best Practices (For team)

### Unit Test Template

```typescript
// Example: Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button component', () => {
  it('renders with label', () => {
    render(<Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(<Button label="Click" onClick={onClick} />);
    
    await user.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<Button label="Disabled" disabled />);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

### Integration Test Template

```typescript
// Example: leads.test.ts (backend)
import request from 'supertest';
import app from '../index';
import { prisma } from '@/lib/prisma';

describe('POST /api/v1/leads', () => {
  beforeEach(async () => {
    await prisma.formSubmission.deleteMany({});
  });
  
  it('should create lead and send email', async () => {
    const res = await request(app).post('/api/v1/leads').send({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message'
    });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    
    // Verify DB
    const lead = await prisma.formSubmission.findUnique({
      where: { id: res.body.id }
    });
    expect(lead).toBeDefined();
    
    // Verify email log
    const emailLog = await prisma.emailLog.findFirst({
      where: { recipient: 'test@example.com' }
    });
    expect(emailLog?.status).toBe('sent');
  });
});
```

### E2E Test Template

```typescript
// Example: contact-form.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('Contact form flow', () => {
  test('should submit contact form and show success', async ({ page }) => {
    // Navigate
    await page.goto('https://dntech.id/contact');
    
    // Fill form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'Test message');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success (page redirect or message)
    await expect(page).toHaveURL(/.*thank-you/);
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

---

## 11. Roles & Responsibilities

| Role | Responsibility |
|------|-----------------|
| **Backend lead** | Backend unit + integration tests, service mocking |
| **Frontend lead** | Frontend unit + component tests, hook tests |
| **QA lead** | E2E tests, test strategy, test data management |
| **DevOps** | CI pipeline, test result reporting, coverage tracking |
| **All devs** | Write tests as part of feature implementation |

---

## 12. Deliverables

```
✅ Jest configuration (backend + frontend)
✅ Playwright configuration (E2E)
✅ GitHub Actions CI workflow
✅ 50+ unit tests (critical paths)
✅ 15+ integration tests (API + DB)
✅ 5+ E2E test scenarios
✅ k6 performance tests
✅ Coverage reports (Codecov)
✅ Test documentation (TESTING.md)
✅ Test examples + templates for team
```

---

## 13. Non-Goals (Out of scope V1)

❌ 100% code coverage (70% enough for V1)  
❌ Visual regression testing (defer to V8.1)  
❌ Accessibility automated testing (manual audit done)  
❌ Load testing production (staging only in V1)  
❌ Mobile app testing (no mobile app yet)

---

**Version:** Testing Framework PRD v1  
**Owner:** QA + Engineering  
**Date:** Juli 2026  
**Status:** Ready for SDD + SRS

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
