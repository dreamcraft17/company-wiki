# TEST COVERAGE EXPANSION PLAN
## dnPeople — Unit Tests + E2E Tests (20% → 60%+ Target)

**Version:** 1.1 Testing Strategy  
**Date:** 3 July 2026 · **Updated:** 7 July 2026  
**Current Coverage:** **≥60%** (390 tests · 83 suites)  
**Target Coverage:** ✅ **ACHIEVED**  
**Final Goal:** 80%+ (optional future sprint)

---

## 📋 TABLE OF CONTENTS

1. Current Coverage Analysis
2. Testing Strategy by Module
3. Unit Test Writing Guide
4. E2E Test Implementation
5. Coverage Improvement Timeline
6. Tools & Setup
7. CI/CD Integration
8. Maintenance & Best Practices

---

## 1. CURRENT COVERAGE ANALYSIS

### 1.1 Module Coverage Breakdown

```
Module              Current   Sprint 2   Sprint 3   Phase 3   Priority
────────────────────────────────────────────────────────────────────
Auth                  30%      40%       50%       80%       ✅✅✅ P0
Finance               25%      50%       70%       90%       ✅✅✅ P0
Sales                 15%      35%       50%       80%       ✅✅ P1
Supply Chain          10%      30%       50%       75%       ✅✅ P1
HR                    5%       15%       35%       70%       ✅ P2
Manufacturing         8%       20%       40%       75%       ✅ P2
Projects              12%      25%       40%       70%       ✅ P2
CRM                   20%      30%       45%       70%       P3
Fixed Assets          15%      28%       40%       70%       P3
Enterprise            10%      22%       35%       65%       P3
Integrations          8%       15%       30%       60%       P3
Reporting             18%      40%       65%       85%       ✅ P1
Billing               12%      25%       40%       70%       P3
Other (GDPR, Health)  5%       10%       20%       50%       P3
────────────────────────────────────────────────────────────────────
OVERALL               15%      28%       45%       75%
TARGET                          40%       60%
```

### 1.2 Coverage by Test Type

```
Current State:
├─ Unit Tests:        15% coverage (150 test files)
├─ Integration Tests: 10% coverage (50 test files)
├─ E2E Tests:         5% coverage (Cypress smoke tests only)
└─ API Contract Tests: 8% coverage

Target State (Sprint 2):
├─ Unit Tests:        35% coverage (500 test files)
├─ Integration Tests: 20% coverage (150 test files)
├─ E2E Tests:         15% coverage (30+ Cypress tests)
└─ API Contract Tests: 15% coverage
```

---

## 2. TESTING STRATEGY BY MODULE

### 2.1 PRIORITY 0: Auth Module (P0)

**Current:** 30% | **Sprint 2 Target:** 40% | **Sprint 3 Target:** 50%

**Key Areas to Test:**

```typescript
// 1. Login & Token Generation (15 tests)
describe('AuthService.login', () => {
  it('should return JWT + refresh token on valid credentials');
  it('should reject invalid email');
  it('should reject incorrect password');
  it('should throttle after 5 failed attempts');
  it('should track login history');
  it('should lock account after throttle expires');
  it('should update last_login timestamp');
  it('should generate unique session ID');
  it('should hash password correctly');
  it('should validate password strength on register');
  // ... more tests
});

// 2. 2FA & Verification (10 tests)
describe('AuthService.enable2FA', () => {
  it('should generate TOTP secret');
  it('should return QR code');
  it('should require confirmation with valid code');
  it('should reject invalid code');
  it('should store backup codes');
  it('should require 2FA on login');
  it('should accept backup code if TOTP unavailable');
  // ... more tests
});

// 3. OAuth2 & SSO (12 tests)
describe('AuthService.googleOAuth', () => {
  it('should redirect to Google login');
  it('should exchange auth code for token');
  it('should create user if not exists');
  it('should link to existing user if email matches');
  it('should handle Google token expiry');
  // ... more tests
});

// 4. Token Refresh & Expiry (8 tests)
describe('AuthService.refreshToken', () => {
  it('should issue new access token');
  it('should validate refresh token signature');
  it('should reject expired refresh token');
  it('should reject invalidated token');
  it('should update token in user session');
});

// 5. Multi-Tenant Isolation (10 tests)
describe('AuthService.tenantIsolation', () => {
  it('should not allow cross-tenant user access');
  it('should validate tenant_id in JWT payload');
  it('should reject tokens from other tenants');
  it('should verify tenant exists and active');
});
```

**Test Effort:** 2-3 days | **SP:** 8

---

### 2.2 PRIORITY 0: Finance Module (P0)

**Current:** 25% | **Sprint 2 Target:** 50% | **Sprint 3 Target:** 70%

**Key Areas to Test:**

```typescript
// 1. GL Entry Posting (20 tests)
describe('GlService.createJournalEntry', () => {
  it('should validate debit equals credit');
  it('should validate all accounts exist');
  it('should validate period is open');
  it('should post to correct GL accounts');
  it('should create audit trail');
  it('should handle multi-currency GL entries');
  it('should prevent posting to account type mismatch');
  it('should auto-generate entry number');
  it('should create GL detail lines');
  it('should validate GL account hierarchy');
  // ... more tests
});

// 2. AP Invoice Processing (15 tests)
describe('ApService.createInvoice', () => {
  it('should validate vendor exists');
  it('should validate PO exists and open');
  it('should check 3-way match (PO qty, GR qty, Invoice qty)');
  it('should calculate invoice total correctly');
  it('should apply discount if vendor has standing discount');
  it('should hold invoice if variance > threshold');
  it('should match with GL expense account');
  it('should track invoice aging');
  // ... more tests
});

// 3. AR Invoice & Collection (15 tests)
describe('ArService', () => {
  it('should create invoice from order');
  it('should check customer credit limit');
  it('should validate payment terms');
  it('should calculate aging buckets');
  it('should apply payment to invoice');
  it('should handle partial payments');
  it('should track collection history');
  // ... more tests
});

// 4. Period Close (12 tests)
describe('PeriodCloseService', () => {
  it('should validate all transactions entered');
  it('should lock GL period');
  it('should prevent new entries in closed period');
  it('should generate period close report');
  it('should calculate period profit/loss');
  it('should reverse prior period if needed');
  // ... more tests
});

// 5. Trial Balance (8 tests)
describe('TrialBalanceService', () => {
  it('should sum all debit/credit balances');
  it('should ensure debit = credit');
  it('should filter by period');
  it('should exclude zero-balance accounts');
  it('should show beginning/ending balances');
});

// 6. SAK-EP Compliance (10 tests)
describe('SakEpComplianceService', () => {
  it('should validate account hierarchy (5-level)');
  it('should validate account types');
  it('should ensure no single-sided entries');
  it('should check Indonesia tax mapping');
  it('should validate PTKP calculations');
});
```

**Test Effort:** 3-4 days | **SP:** 13

---

### 2.3 PRIORITY 1: Sales Module (P1)

**Current:** 15% | **Sprint 2 Target:** 35% | **Sprint 3 Target:** 50%

**Key Areas to Test:**

```typescript
// 1. Order Creation & Validation (15 tests)
describe('SalesService.createOrder', () => {
  it('should validate customer exists');
  it('should validate customer credit limit');
  it('should validate items in inventory');
  it('should calculate order total');
  it('should apply customer pricing tier');
  it('should generate unique order number');
  it('should create GL entries (auto-post to AR)');
  it('should handle backorder items');
  it('should validate delivery address');
  // ... more tests
});

// 2. Order Confirmation & Fulfillment (12 tests)
describe('SalesService.confirmOrder', () => {
  it('should update order status to CONFIRMED');
  it('should reserve inventory');
  it('should generate picking list');
  it('should validate goods picked match order');
  it('should generate delivery document');
  it('should post GL entry (Inventory → COGS)');
  // ... more tests
});

// 3. Invoice Generation (10 tests)
describe('InvoiceService', () => {
  it('should create invoice from order');
  it('should match invoice to delivery');
  it('should post to AR GL account');
  it('should validate tax calculation');
  it('should send invoice to customer (email)');
  // ... more tests
});

// 4. Credit Limit & Collections (8 tests)
describe('CreditLimitService', () => {
  it('should prevent order if credit limit exceeded');
  it('should calculate aged receivables');
  it('should trigger dunning for overdue invoices');
  it('should update credit score');
});
```

**Test Effort:** 2-3 days | **SP:** 13

---

### 2.4 PRIORITY 1: Supply Chain Module (P1)

**Current:** 10% | **Sprint 2 Target:** 30% | **Sprint 3 Target:** 50%

**Key Areas:**

```typescript
// 1. Purchase Order (12 tests)
describe('PoService', () => {
  it('should validate vendor exists');
  it('should calculate PO total');
  it('should validate lead time');
  it('should check vendor pricing');
  it('should reserve budget');
  it('should route to vendor');
  it('should trigger GL posting');
});

// 2. Goods Receipt (10 tests)
describe('GrService', () => {
  it('should validate GR matches PO');
  it('should update inventory');
  it('should flag variance if qty != PO');
  it('should post GL entry (Inventory received)');
  it('should trigger 3-way match');
});

// 3. Inventory Management (15 tests)
describe('InventoryService', () => {
  it('should track stock by location');
  it('should validate stock before sale');
  it('should calculate reorder points');
  it('should handle stock transfer');
  it('should track FIFO/LIFO valuation');
  it('should post GL entries for adjustments');
  it('should trigger low stock alerts');
});
```

**Test Effort:** 2-3 days | **SP:** 13

---

### 2.5 PRIORITY 1: Reporting Module (P1)

**Current:** 18% | **Sprint 2 Target:** 40% | **Sprint 3 Target:** 65%

**Key Areas:**

```typescript
// 1. Trial Balance Report (8 tests)
describe('ReportingService.trialBalance', () => {
  it('should sum account balances');
  it('should validate debit = credit');
  it('should filter by period');
  it('should show comparative periods');
  it('should validate SAK-EP compliance');
});

// 2. Financial Statements (15 tests)
describe('ReportingService.financialStatements', () => {
  it('should generate balance sheet');
  it('should generate income statement');
  it('should generate cash flow statement');
  it('should validate all balances tie to GL');
  it('should apply Indonesia accounting standard');
  it('should generate notes to statements');
  it('should export to PDF/Excel');
});

// 3. Dashboard KPIs (10 tests)
describe('DashboardService', () => {
  it('should calculate gross margin');
  it('should calculate net margin');
  it('should calculate ROE/ROA');
  it('should calculate working capital');
  it('should track receivables aging');
  it('should track payables aging');
});
```

**Test Effort:** 2-3 days | **SP:** 13

---

## 3. UNIT TEST WRITING GUIDE

### 3.1 Test File Structure

```typescript
// src/modules/finance/services/__tests__/gl.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlService } from '../gl.service';
import { JournalEntry } from '../../entities/journal-entry.entity';
import { ChartOfAccount } from '../../entities/chart-of-account.entity';

describe('GlService', () => {
  let service: GlService;
  let journalRepo: Repository<JournalEntry>;
  let coaRepo: Repository<ChartOfAccount>;

  // Mock data
  const mockTenantId = 'tenant-123';
  const mockChartOfAccount = {
    id: '1',
    code: '1010',
    name: 'Cash',
    tenantId: mockTenantId,
    accountType: 'ASSET_CURRENT',
  };

  beforeEach(async () => {
    // Create mock repositories
    const mockJournalRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockCoaRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    // Create test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlService,
        {
          provide: getRepositoryToken(JournalEntry),
          useValue: mockJournalRepo,
        },
        {
          provide: getRepositoryToken(ChartOfAccount),
          useValue: mockCoaRepo,
        },
      ],
    }).compile();

    service = module.get<GlService>(GlService);
    journalRepo = module.get(getRepositoryToken(JournalEntry));
    coaRepo = module.get(getRepositoryToken(ChartOfAccount));
  });

  // Cleanup after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createJournalEntry', () => {
    it('should create balanced journal entry', async () => {
      // Arrange
      const input = {
        reference: 'JE001',
        period: '202407',
        lines: [
          { accountCode: '1010', debit: 100, credit: 0 },
          { accountCode: '6010', debit: 0, credit: 100 },
        ],
      };

      jest.spyOn(coaRepo, 'findOne').mockResolvedValue(mockChartOfAccount);
      jest.spyOn(journalRepo, 'save').mockResolvedValue({ id: '1', ...input });

      // Act
      const result = await service.createJournalEntry(mockTenantId, input);

      // Assert
      expect(result.id).toBeDefined();
      expect(journalRepo.save).toHaveBeenCalled();
    });

    it('should reject unbalanced entry', async () => {
      // Arrange
      const input = {
        reference: 'JE002',
        lines: [
          { accountCode: '1010', debit: 100, credit: 0 },
          { accountCode: '6010', debit: 0, credit: 50 },
        ],
      };

      // Act & Assert
      await expect(service.createJournalEntry(mockTenantId, input)).rejects.toThrow(
        'Debit must equal credit',
      );
    });

    it('should validate all accounts exist', async () => {
      // Arrange
      jest.spyOn(coaRepo, 'findOne').mockResolvedValueOnce(mockChartOfAccount);
      jest.spyOn(coaRepo, 'findOne').mockResolvedValueOnce(null); // Second account not found

      const input = {
        reference: 'JE003',
        lines: [
          { accountCode: '1010', debit: 100 },
          { accountCode: '9999', debit: 0, credit: 100 }, // Invalid account
        ],
      };

      // Act & Assert
      await expect(service.createJournalEntry(mockTenantId, input)).rejects.toThrow(
        'Account 9999 not found',
      );
    });
  });

  describe('getTrialBalance', () => {
    it('should return balanced trial balance', async () => {
      // Arrange
      const mockTrialBalance = [
        { code: '1010', name: 'Cash', debit: 100, credit: 0 },
        { code: '6010', name: 'Revenue', debit: 0, credit: 100 },
      ];

      jest.spyOn(journalRepo, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockTrialBalance),
      } as any);

      // Act
      const result = await service.getTrialBalance(mockTenantId, '202407');

      // Assert
      expect(result).toHaveLength(2);
      const totalDebit = result.reduce((sum, r) => sum + r.debit, 0);
      const totalCredit = result.reduce((sum, r) => sum + r.credit, 0);
      expect(totalDebit).toBe(totalCredit);
    });
  });
});
```

### 3.2 AAA Pattern (Arrange, Act, Assert)

```typescript
// Always use this pattern:

describe('SomeService', () => {
  it('should do something specific', async () => {
    // ARRANGE: Setup test data & mocks
    const input = { /* test data */ };
    jest.spyOn(repo, 'findOne').mockResolvedValue({ /* mocked entity */ });

    // ACT: Call the method
    const result = await service.someMethod(input);

    // ASSERT: Verify expectations
    expect(result).toEqual({ /* expected output */ });
    expect(repo.findOne).toHaveBeenCalledWith(/* expected params */);
  });
});
```

---

## 4. E2E TEST IMPLEMENTATION

### 4.1 Cypress E2E Tests

```typescript
// cypress/e2e/finance/gl-posting-flow.cy.ts

describe('GL Posting Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid=email]').type('admin@demo.com');
    cy.get('[data-testid=password]').type('Demo1234!');
    cy.get('[data-testid=login-btn]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should create and post journal entry', () => {
    // Navigate to GL module
    cy.visit('/finance/gl/journal-entries');
    cy.get('[data-testid=create-btn]').should('exist').click();

    // Fill form
    cy.get('[data-testid=reference]').type('JE20240703001');
    cy.get('[data-testid=period]').select('202407');

    // Add lines
    cy.get('[data-testid=add-line]').click();
    cy.get('[data-testid=line-0-account]').type('1010'); // Cash account
    cy.get('[data-testid=line-0-debit]').type('1000000');

    cy.get('[data-testid=add-line]').click();
    cy.get('[data-testid=line-1-account]').type('6010'); // Revenue account
    cy.get('[data-testid=line-1-credit]').type('1000000');

    // Save
    cy.get('[data-testid=save-btn]').click();
    cy.get('[data-testid=success-message]').should('contain', 'Journal entry created');

    // Verify in list
    cy.get('[data-testid=journal-table]').should('contain', 'JE20240703001');
  });

  it('should reject unbalanced entry', () => {
    cy.visit('/finance/gl/journal-entries');
    cy.get('[data-testid=create-btn]').click();

    // Fill with unbalanced lines
    cy.get('[data-testid=line-0-debit]').type('1000000');
    cy.get('[data-testid=line-1-credit]').type('500000'); // Unbalanced

    cy.get('[data-testid=save-btn]').click();
    cy.get('[data-testid=error-message]').should('contain', 'Debit must equal credit');
  });

  it('should post GL entry to trial balance', () => {
    // Create and post GL entry (as in first test)
    // ...

    // Navigate to trial balance
    cy.visit('/finance/gl/trial-balance');
    cy.get('[data-testid=period]').select('202407');

    // Verify entry appears
    cy.get('[data-testid=tb-table]').should('contain', '1010'); // Cash account
    cy.get('[data-testid=tb-table]').should('contain', '6010'); // Revenue account

    // Verify balanced
    cy.get('[data-testid=total-debit]').then($debit => {
      const debit = parseFloat($debit.text());
      cy.get('[data-testid=total-credit]').then($credit => {
        const credit = parseFloat($credit.text());
        expect(debit).toBe(credit);
      });
    });
  });
});
```

### 4.2 E2E Test Flow: Sales Order

```typescript
// cypress/e2e/sales/order-to-invoice.cy.ts

describe('Sales Order to Invoice Flow', () => {
  beforeEach(() => {
    // Setup: Login & set test company
    cy.loginAsAdmin();
    cy.setTenant('pt-demo-company');
  });

  it('should create order, confirm, and generate invoice', () => {
    // 1. CREATE ORDER
    cy.visit('/sales/orders');
    cy.get('[data-testid=create-order-btn]').click();

    cy.get('[data-testid=customer]').type('PT ABC');
    cy.selectOption('[data-testid=customer-list]', 'PT ABC Indonesia');

    cy.get('[data-testid=item-code]').type('PROD001');
    cy.selectOption('[data-testid=item-list]', 'PROD001');

    cy.get('[data-testid=quantity]').clear().type('100');
    cy.get('[data-testid=price]').should('have.value', '100000');

    cy.get('[data-testid=total]').should('have.value', '10000000');
    cy.get('[data-testid=create-order-final-btn]').click();

    cy.get('[data-testid=success-message]').should('contain', 'Order created');
    cy.get('[data-testid=order-number]').then($el => {
      const orderNumber = $el.text();
      cy.wrap(orderNumber).as('orderNumber');
    });

    // 2. CONFIRM ORDER
    cy.get('[data-testid=confirm-order-btn]').click();
    cy.get('[data-testid=success-message]').should('contain', 'Order confirmed');

    // Verify GL entry created
    cy.visit('/finance/gl/journal-entries');
    cy.get('@orderNumber').then(orderNumber => {
      cy.get('[data-testid=journal-table]').should('contain', orderNumber);
    });

    // 3. CREATE DELIVERY
    cy.visit('/sales/deliveries');
    cy.get('[data-testid=create-delivery-btn]').click();
    cy.get('@orderNumber').then(orderNumber => {
      cy.selectOption('[data-testid=order-ref]', orderNumber);
    });
    cy.get('[data-testid=create-delivery-final-btn]').click();

    // 4. CREATE INVOICE
    cy.visit('/sales/invoices');
    cy.get('[data-testid=create-invoice-btn]').click();
    cy.get('@orderNumber').then(orderNumber => {
      cy.selectOption('[data-testid=order-ref]', orderNumber);
    });
    cy.get('[data-testid=create-invoice-final-btn]').click();

    cy.get('[data-testid=success-message]').should('contain', 'Invoice created');

    // 5. VERIFY AR POSTED
    cy.visit('/finance/ar');
    cy.get('[data-testid=customer]').type('PT ABC');
    cy.get('[data-testid=invoices-table]').should('contain', '10000000');
  });
});
```

---

## 5. COVERAGE IMPROVEMENT TIMELINE

### Sprint 2 (Week 3-4): 20% → 40%

```
Week 1:
├─ Mon-Tue: Auth module tests (30% → 40%) — 2 days
├─ Wed-Thu: Finance module tests (25% → 50%) — 2 days
└─ Fri: Review + merge

Week 2:
├─ Mon-Tue: Sales module tests (15% → 35%) — 2 days
├─ Wed: Supply chain tests (10% → 30%) — 1 day
├─ Thu: Reporting tests (18% → 40%) — 1 day
└─ Fri: E2E test setup (smoke → 10 tests) — 1 day

RESULT: 40% overall coverage
```

### Sprint 3 (Week 5-6): 40% → 60%+

```
Week 1:
├─ Mon-Tue: HR tests (5% → 15%) — 2 days
├─ Wed-Thu: Manufacturing tests (8% → 20%) — 2 days
└─ Fri: Review

Week 2:
├─ Mon: Projects tests (12% → 25%) — 1 day
├─ Tue-Wed: E2E test expansion (10+ → 20+ tests) — 2 days
├─ Thu: CRM & Enterprise tests (10% → 22%) — 1 day
└─ Fri: Finalize & report

RESULT: 60%+ overall coverage
```

---

## 6. TOOLS & SETUP

### 6.1 Jest Configuration

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s",
      "!**/*.entity.ts",
      "!**/*.module.ts",
      "!**/node_modules/**"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "statements": 40,
        "branches": 35,
        "functions": 40,
        "lines": 40
      },
      "./src/modules/auth/": {
        "statements": 60,
        "branches": 55,
        "functions": 60,
        "lines": 60
      },
      "./src/modules/finance/": {
        "statements": 50,
        "branches": 45,
        "functions": 50,
        "lines": 50
      }
    }
  }
}
```

### 6.2 Run Tests

```bash
# Run all tests
npm test

# Run specific module
npm test -- src/modules/finance

# Run with coverage report
npm run test:cov

# Watch mode (development)
npm run test:watch

# Update snapshots
npm test -- -u

# Debug specific test
node --inspect-brk ./node_modules/.bin/jest --runInBand src/modules/auth/auth.service.spec.ts
```

---

## 7. CI/CD INTEGRATION

### 7.1 GitHub Actions

```yaml
# .github/workflows/test.yml

name: Test Coverage

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm install
      
      # Run tests
      - run: npm test -- --coverage
      
      # Upload coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
      
      # Check coverage threshold
      - name: Check coverage
        run: |
          if [ $(cat coverage/coverage-summary.json | grep -o '"lines":{[^}]*}' | grep -o '[0-9.]*' | head -1) -lt 40 ]; then
            echo "Coverage is below 40%"
            exit 1
          fi
```

---

## 8. MAINTENANCE & BEST PRACTICES

### 8.1 Writing Good Tests

```typescript
// ✅ GOOD: Clear, focused test
it('should reject order if customer credit limit exceeded', async () => {
  // Setup: Create customer with Rp 10M credit limit
  const customer = await createTestCustomer({ creditLimit: 10000000 });
  
  // Act: Try to create order for Rp 15M
  const result = service.createOrder(customer.id, { totalAmount: 15000000 });
  
  // Assert
  expect(result).rejects.toThrow('Credit limit exceeded');
});

// ❌ BAD: Vague, testing multiple things
it('should work correctly', async () => {
  const order = await service.createOrder(...);
  expect(order).toBeDefined();
  expect(order.id).toBeTruthy();
  expect(order.total).toBeGreaterThan(0);
});
```

### 8.2 Test Naming Convention

```typescript
// Naming pattern: should [expected behavior] when [condition]

it('should increment product stock when goods received');
it('should reject invoice when total not matching PO');
it('should post GL entry when order confirmed');
it('should calculate tax correctly for Indonesia PPh 21');
```

### 8.3 Coverage Metrics

```bash
# View coverage report
open coverage/lcov-report/index.html

# Target metrics:
# - Statements: 60%+
# - Branches: 50%+
# - Functions: 60%+
# - Lines: 60%+
```

---

**Timeline:** 4 weeks (Sprint 2 + 3)  
**Owner:** QA + Backend team  
**Status:** Ready for Sprint 2 implementation  
**Last Updated:** 3 July 2026

