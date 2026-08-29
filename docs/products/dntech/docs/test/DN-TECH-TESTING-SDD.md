# DN Tech — Testing SDD
## System Design Detail (Test Infrastructure & Implementation)

**Date:** Juli 2026  
**Owner:** Engineering + QA Team  
**Reference:** [Testing PRD](./DN-TECH-TESTING-PRD.md)

---

## 1. Jest Setup (Backend & Frontend)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
npm install --save-dev node-mocks-http

# Frontend
cd frontend
npm install --save-dev jest ts-jest @types/jest
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
```

---

### Step 2: Backend Jest Config

**File: `backend/jest.config.js`**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  modulePathIgnorePatterns: ['dist'],
  
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/migrations/**',
  ],
  
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
    './src/services/**/*.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
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

**File: `backend/src/__tests__/setup.ts`**

```typescript
import dotenv from 'dotenv';

// Load test env
dotenv.config({ path: '.env.test' });

// Mock environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.SMTP_HOST = 'smtp.test.example.com';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost/dntech_test';

// Silence logs
jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'warn').mockImplementation();
jest.spyOn(console, 'error').mockImplementation();
```

---

### Step 3: Frontend Jest Config

**File: `frontend/jest.config.js`**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.tsx', '**/__tests__/**/*.test.ts'],
  modulePathIgnorePatterns: ['<rootDir>/.next'],
  
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/__tests__/**',
    '!src/app/**',  // Skip Next.js app dir pages for now
  ],
  
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
    './src/components/**/*.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  testTimeout: 10000,
  
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
};
```

**File: `frontend/src/__tests__/setup.ts`**

```typescript
import '@testing-library/jest-dom';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Silence logs
jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'warn').mockImplementation();
jest.spyOn(console, 'error').mockImplementation();
```

---

### Step 4: NPM Scripts

**File: `backend/package.json`**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern='(?<!integration)' --exclude='**/integration/**'",
    "test:integration": "jest --testPathPattern='integration'",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

**File: `frontend/package.json`**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## 2. Unit Test Examples

### Backend: EmailService Unit Test

**File: `backend/src/__tests__/services/EmailService.test.ts`**

```typescript
import { EmailService } from '@/services/EmailService';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

jest.mock('nodemailer');
jest.mock('@/lib/prisma');

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: any;

  beforeEach(() => {
    // Mock transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
    };
    
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    emailService = new EmailService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email and log success', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      (prisma.emailLog.create as jest.Mock).mockResolvedValue({
        id: '1',
        status: 'sent',
      });

      const result = await emailService.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Test',
        })
      );

      expect(prisma.emailLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipient: 'test@example.com',
            status: 'sent',
          }),
        })
      );
    });

    it('should log failure if send fails', async () => {
      const error = new Error('SMTP failed');
      mockTransporter.sendMail.mockRejectedValue(error);

      (prisma.emailLog.create as jest.Mock).mockResolvedValue({
        id: '1',
        status: 'failed',
      });

      await expect(
        emailService.sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('SMTP failed');

      expect(prisma.emailLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'failed',
            errorMessage: 'SMTP failed',
          }),
        })
      );
    });

    it('should not send if SMTP credentials missing', async () => {
      process.env.SMTP_HOST = '';
      
      await expect(
        emailService.sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('SMTP not configured');

      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });
  });
});
```

---

### Frontend: Button Component Unit Test

**File: `frontend/src/__tests__/components/Button.test.tsx`**

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders href as link when href prop provided', () => {
    render(<Button href="/about">About</Button>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/about');
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-900');

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('border-blue-900');
  });
});
```

---

## 3. Integration Test Examples

### Backend: Contact Form → Email Integration

**File: `backend/src/__tests__/integration/contact-form.test.ts`**

```typescript
import request from 'supertest';
import app from '@/index';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/services/EmailService';

jest.mock('@/services/EmailService');

describe('Contact form integration', () => {
  beforeEach(async () => {
    await prisma.formSubmission.deleteMany({});
    await prisma.emailLog.deleteMany({});
  });

  it('should submit form, save to DB, and send emails', async () => {
    const mockEmailService = EmailService as jest.MockedClass<typeof EmailService>;
    mockEmailService.prototype.sendEmail.mockResolvedValue({ messageId: 'id' });

    const response = await request(app)
      .post('/api/v1/leads')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test inquiry',
        timeline: '1-3 months',
      });

    // Verify response
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('john@example.com');

    // Verify DB save
    const submission = await prisma.formSubmission.findUnique({
      where: { id: response.body.id },
    });
    expect(submission).toBeDefined();
    expect(submission?.email).toBe('john@example.com');

    // Verify email sent to admin
    expect(mockEmailService.prototype.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: process.env.ADMIN_EMAIL,
        subject: expect.stringContaining('New Lead'),
      })
    );

    // Verify email sent to user
    expect(mockEmailService.prototype.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'john@example.com',
        subject: expect.stringContaining('Terima kasih'),
      })
    );
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/v1/leads')
      .send({
        name: 'John',
        // missing email and message
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  it('should handle email sending failure gracefully', async () => {
    const mockEmailService = EmailService as jest.MockedClass<typeof EmailService>;
    mockEmailService.prototype.sendEmail.mockRejectedValue(
      new Error('SMTP failed')
    );

    const response = await request(app)
      .post('/api/v1/leads')
      .send({
        name: 'John',
        email: 'john@example.com',
        message: 'Test',
        timeline: '1-3 months',
      });

    // Form should save even if email fails
    expect(response.status).toBe(201);
    
    // Email log should record failure
    const emailLog = await prisma.emailLog.findFirst({
      where: { recipient: process.env.ADMIN_EMAIL },
    });
    expect(emailLog?.status).toBe('failed');
  });
});
```

---

## 4. Playwright E2E Setup

### Install & Configure

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**File: `frontend/playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
      },
});
```

---

### E2E Test Example

**File: `frontend/e2e/tests/contact-form.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Contact form flow', () => {
  test('should submit contact form successfully', async ({ page }) => {
    // Navigate to contact page
    await page.goto('/contact');

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Kontak Kami');

    // Fill form (assuming 3-step form)
    // Step 1: Contact info
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+6281234567890');
    
    await page.click('button:has-text("Lanjut")');
    
    // Wait for step 2
    await expect(page.locator('text=Jenis Proyek')).toBeVisible();
    
    // Step 2: Project details
    await page.selectOption('select[name="projectType"]', 'web');
    await page.selectOption('select[name="timeline"]', '1-3 months');
    await page.fill('textarea[name="description"]', 'Test project description');
    
    await page.click('button:has-text("Lanjut")');
    
    // Step 3: Review & confirm
    await expect(page.locator('text=Review Data')).toBeVisible();
    await page.check('input[name="consent"]');
    
    // Submit
    await page.click('button:has-text("Kirim")');

    // Verify success
    await expect(page).toHaveURL(/.*thank-you/);
    await expect(page.locator('text=Terima kasih')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/contact');

    // Try to submit empty form
    await page.click('button:has-text("Lanjut")');

    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/contact');
    
    // Form should be accessible on mobile
    await page.fill('input[name="name"]', 'Mobile User');
    await page.fill('input[name="email"]', 'mobile@example.com');
    
    // CTA button should be tappable (≥48px)
    const button = page.locator('button:has-text("Lanjut")');
    const box = await button.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(48);
    expect(box!.width).toBeGreaterThanOrEqual(48);
  });
});
```

---

## 5. Performance Testing (k6)

**File: `backend/performance/k6/homepage.js`**

```javascript
import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up
    { duration: '1m30s', target: 20 }, // Stay
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],   // 95% < 2s
    http_req_failed: ['rate<0.1'],       // Error rate < 10%
  },
};

export default function () {
  group('Homepage', () => {
    const res = http.get('https://dntech.id/');
    
    check(res, {
      'status is 200': (r) => r.status === 200,
      'load time < 2s': (r) => r.timings.duration < 2000,
      'has hero section': (r) => r.body.includes('DN Tech'),
    });
  });

  sleep(1);
}
```

**Run performance test:**

```bash
k6 run backend/performance/k6/homepage.js
```

---

## 6. GitHub Actions CI Workflow

**File: `.github/workflows/test.yml`**

```yaml
name: Test CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-test:
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
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install backend dependencies
        run: cd backend && npm ci
      
      - name: Run backend lint
        run: cd backend && npm run lint
      
      - name: Run backend unit tests
        run: cd backend && npm run test:unit -- --coverage
        env:
          TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dntech_test
      
      - name: Run backend integration tests
        run: cd backend && npm run test:integration
        env:
          TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dntech_test
      
      - name: Upload backend coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
          flags: backend

  frontend-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install frontend dependencies
        run: cd frontend && npm ci
      
      - name: Run frontend lint
        run: cd frontend && npm run lint
      
      - name: Run frontend unit tests
        run: cd frontend && npm run test:coverage
      
      - name: Upload frontend coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend

  e2e-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start services
        run: |
          cd backend && npm ci && npm run build &
          cd frontend && npm ci && npm run build &
          sleep 10
      
      - name: Run E2E tests
        run: cd frontend && npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

**Status:** ✅ Completed in codebase with expanded test suites and documented coverage  
**Next:** Maintain trend and add new tests alongside each feature change

---

**Owner:** Engineering + QA Team  
**Date:** Juli 2026
