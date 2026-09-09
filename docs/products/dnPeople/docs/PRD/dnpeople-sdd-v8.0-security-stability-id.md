# dnPeople — SDD v8.0
## Security & Stability Implementation Details (Bahasa Indonesia)

**Versi:** 8.0  
**Tanggal:** 18 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Siap untuk Development

---

## Part 1: Architecture Changes

### Current (Buruk) vs Proposed (Baik)

```
CURRENT (BURUK):
┌─────────────────────────────────────┐
│ Frontend                            │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│ Backend API                         │
│ - No scope check (B02)              │
│ - Payroll race condition (B03)      │
└────────────┬───────────────────────┘
             │
┌────────────▼────────────────────────┐
│ File Storage                        │
│ /uploads/ PUBLIC express.static (B01)
│ → Anyone can guess + download      │
└─────────────────────────────────────┘

PROPOSED (BAIK):
┌─────────────────────────────────────┐
│ Frontend                            │
│ - Payslip menu untuk employee      │
│ - MFA setup untuk semua            │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│ Backend API                         │
│ - Auth middleware check scopes      │
│ - Payroll atomic transaction        │
│ - N+1 fix: batch queries            │
└────────────┬───────────────────────┘
             │
             ├─→ Authenticated payslip endpoint
             │   (no public static)
             │
             ├─→ Scope enforcement
             │   per route
             │
             └─→ File upload validation
                 (extension + MIME + magic bytes)
```

---

## Part 2: Implementasi Detail

### Fix 1: Secure Payslip Download (P0-B01)

**Step 1: Remove public /uploads**

```typescript
// BEFORE (bad):
app.use('/uploads', express.static('uploads'));

// AFTER (good):
// Remove this line completely!
// Don't serve uploads as public static files
```

**Step 2: New authenticated endpoint**

```typescript
// src/routes/payroll.ts

/**
 * GET /api/v1/payroll/:id/payslip.pdf
 * Download payslip PDF (authenticated)
 */
router.get('/:id/payslip.pdf', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const companyId = req.user.companyId;
    
    // Fetch payslip
    const payslip = await prisma.payslip.findFirst({
      where: {
        id,
        companyId, // ← Tenant isolation
        // Verify: employee owns payslip OR user is admin/finance
        OR: [
          { employeeId: userId }, // Employee own payslip
          { createdBy: userId }   // Creator
        ]
      },
      include: { employee: true, payroll: true }
    });
    
    if (!payslip) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Alternative: check role
    if (req.user.role === 'EMPLOYEE') {
      if (payslip.employeeId !== userId) {
        return res.status(403).json({ error: 'Cannot access other payslips' });
      }
    }
    
    // Generate or fetch PDF
    const pdfBuffer = await generatePayslipPdf(payslip);
    
    // Audit log
    await auditService.log({
      companyId,
      userId,
      action: 'PAYSLIP_DOWNLOAD',
      metadata: { payslipId: id, employeeId: payslip.employeeId }
    });
    
    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="payslip_${payslip.employeeId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Payslip download error:', error);
    res.status(500).json({ error: 'Failed to download payslip' });
  }
});

/**
 * Alternative: Signed URL (short-lived)
 * GET /payslip/download/{signed_token}
 */
router.get('/download/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Verify signed token (JWT with short expiry)
    const payload = jwt.verify(token, process.env.PAYSLIP_SECRET, {
      maxAge: '24h'
    });
    
    // Extract payslipId + companyId from token
    const { payslipId, companyId } = payload;
    
    // Fetch payslip
    const payslip = await prisma.payslip.findFirst({
      where: { id: payslipId, companyId }
    });
    
    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }
    
    // Generate PDF
    const pdfBuffer = await generatePayslipPdf(payslip);
    
    // Send
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(403).json({ error: 'Invalid or expired link' });
  }
});

/**
 * POST /api/v1/payroll/:id/generate-signed-link
 * Admin generate shareable link
 */
router.post('/:id/generate-signed-link', auth, requireRole('COMPANY_ADMIN', 'FINANCE'), 
  async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { expiresInHours = 24 } = req.body;
    
    // Generate signed token
    const token = jwt.sign(
      { payslipId: id, companyId: req.user.companyId },
      process.env.PAYSLIP_SECRET,
      { expiresIn: `${expiresInHours}h` }
    );
    
    // Generate URL
    const url = `${process.env.BASE_URL}/payslip/download/${token}`;
    
    res.json({ url, expiresIn: expiresInHours });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate link' });
  }
});
```

---

### Fix 2: Enforce API Key Scopes (P0-B02)

**Step 1: Define route scopes**

```typescript
// src/config/scopes.ts

export const ROUTE_SCOPES = {
  'GET /attendance': ['attendance:read'],
  'POST /attendance': ['attendance:write'],
  'PATCH /attendance': ['attendance:write'],
  'DELETE /attendance': ['attendance:write'],
  
  'GET /payroll': ['payroll:read'],
  'POST /payroll/run': ['payroll:write'],
  'POST /payroll/finalize': ['payroll:write'],
  
  'GET /employees': ['employee:read'],
  'POST /employees': ['employee:write'],
  'PATCH /employees': ['employee:write'],
  
  'GET /reports': ['reports:read'],
  'POST /reports/export': ['reports:read'],
};

// Wildcard scopes
export const WILDCARD_SCOPES = {
  '*': ['*'], // admin - all scopes
  'admin:*': ['*'],
};
```

**Step 2: Auth middleware check scopes**

```typescript
// src/middleware/auth.ts

export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }
    
    // Check Bearer token (JWT)
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      req.authType = 'jwt';
      return next();
    }
    
    // Check API key
    if (authHeader.startsWith('ApiKey ')) {
      const apiKeyStr = authHeader.slice(7);
      
      const apiKey = await prisma.apiKey.findFirst({
        where: { key: apiKeyStr, enabled: true }
      });
      
      if (!apiKey) {
        return res.status(401).json({ error: 'Invalid API key' });
      }
      
      // Attach to request
      req.user = {
        id: apiKey.createdBy,
        companyId: apiKey.companyId,
        role: 'API_KEY',
        scopes: apiKey.scopes || [] // ← CRITICAL: attach scopes
      };
      req.authType = 'apikey';
      req.apiKeyId = apiKey.id;
      return next();
    }
    
    return res.status(401).json({ error: 'Invalid authorization' });
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Middleware: Enforce scope for specific route
 */
export function requireScope(allowedScopes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // JWT bypass (full access)
    if (req.authType === 'jwt') {
      return next();
    }
    
    // API key: check scopes
    if (req.authType === 'apikey') {
      const userScopes = req.user.scopes || [];
      
      // Check: user has at least one required scope
      const hasScope = allowedScopes.some(required => {
        // Wildcard check
        if (userScopes.includes('*')) return true;
        // Exact match
        if (userScopes.includes(required)) return true;
        // Prefix match (e.g., "attendance:*" matches "attendance:read")
        if (required.includes(':')) {
          const prefix = required.split(':')[0];
          if (userScopes.includes(`${prefix}:*`)) return true;
        }
        return false;
      });
      
      if (!hasScope) {
        // Audit: scope violation attempt
        auditService.log({
          companyId: req.user.companyId,
          userId: req.user.id,
          action: 'SCOPE_VIOLATION_ATTEMPT',
          metadata: {
            apiKeyId: req.apiKeyId,
            requiredScopes: allowedScopes,
            userScopes: userScopes,
            route: `${req.method} ${req.path}`
          }
        });
        
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: allowedScopes,
          message: `API key missing scope: ${allowedScopes.join(' or ')}`
        });
      }
    }
    
    next();
  };
}
```

**Step 3: Use in routes**

```typescript
// src/routes/attendance.ts

router.get(
  '/',
  auth,
  requireScope(['attendance:read']),  // ← Enforce scope
  async (req: Request, res: Response) => {
    // Route logic
  }
);

router.post(
  '/import',
  auth,
  requireScope(['attendance:write']),  // ← Enforce scope
  async (req: Request, res: Response) => {
    // Route logic
  }
);
```

---

### Fix 3: Atomic Payroll Finalize (P0-B03)

**Step 1: Prisma transaction**

```typescript
// src/services/payroll.service.ts

async function finalizePayroll(payrollId: string, companyId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Lock payroll (UPDATE WHERE status=DRAFT)
      const payroll = await tx.payroll.findFirst({
        where: { id: payrollId, companyId, status: 'DRAFT' },
        include: { employee: true }
      });
      
      if (!payroll) {
        throw new Error('Payroll not found or already finalized');
      }
      
      // Step 2: Update status to PROCESSING (lock)
      await tx.payroll.update({
        where: { id: payrollId },
        data: { status: 'PROCESSING' }
      });
      
      // Step 3: Calculate all components in THIS transaction
      
      // A. Calculate OT deductions
      const otRecords = await tx.overtime.findMany({
        where: {
          employeeId: payroll.employeeId,
          date: {
            gte: payroll.periodStart,
            lte: payroll.periodEnd
          }
        }
      });
      const otCost = calculateOTCost(otRecords, payroll.employee);
      
      // B. Calculate claims
      const claims = await tx.claim.findMany({
        where: {
          employeeId: payroll.employeeId,
          status: 'APPROVED',
          date: {
            gte: payroll.periodStart,
            lte: payroll.periodEnd
          }
        }
      });
      const claimTotal = claims.reduce((sum, c) => sum + c.amount, 0);
      
      // C. Calculate loan installments (CRITICAL - must be in transaction)
      const loans = await tx.loan.findMany({
        where: {
          employeeId: payroll.employeeId,
          status: 'ACTIVE'
        }
      });
      
      let loanDeduction = 0;
      for (const loan of loans) {
        if (loan.remainingBalance > 0) {
          const installment = Math.min(loan.monthlyInstallment, loan.remainingBalance);
          loanDeduction += installment;
          
          // Update loan remaining balance
          await tx.loan.update({
            where: { id: loan.id },
            data: {
              remainingBalance: loan.remainingBalance - installment,
              paidInstallments: { increment: 1 }
            }
          });
          
          // Create loan transaction record
          await tx.loanTransaction.create({
            data: {
              loanId: loan.id,
              payrollId: payrollId,
              amount: installment,
              type: 'DEDUCTION'
            }
          });
        }
      }
      
      // D. Calculate tax adjustments
      const taxAdjustment = calculateTax(payroll.grossSalary);
      
      // Step 4: Update payroll with all calculations
      const finalizedPayroll = await tx.payroll.update({
        where: { id: payrollId },
        data: {
          status: 'FINALIZED',
          otDeduction: otCost,
          claimReimbursement: claimTotal,
          loanDeduction: loanDeduction,
          taxAdjustment: taxAdjustment,
          finalizedAt: new Date(),
          finalizedBy: userId,
          netSalary: payroll.grossSalary + claimTotal - otCost - loanDeduction - taxAdjustment
        }
      });
      
      // Step 5: Create audit log (dalam transaction)
      await tx.auditLog.create({
        data: {
          companyId,
          userId,
          action: 'PAYROLL_FINALIZED',
          metadata: {
            payrollId,
            employeeId: payroll.employeeId,
            grossSalary: payroll.grossSalary,
            netSalary: finalizedPayroll.netSalary,
            loanDeduction
          }
        }
      });
      
      return finalizedPayroll;
    }, {
      isolationLevel: 'SERIALIZABLE' // ← Strongest isolation
    });
    
    // Step 6: Send email (AFTER transaction committed)
    await sendPayrollEmailAsync(result);
    
    return result;
  } catch (error) {
    console.error('Finalize payroll error:', error);
    // Transaction automatically rolled back by Prisma
    throw error;
  }
}
```

**Step 2: Idempotent endpoint**

```typescript
// src/routes/payroll.ts

router.post(
  '/:id/finalize',
  auth,
  requireScope(['payroll:write']),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const companyId = req.user.companyId;
      
      // Finalize (atomic transaction inside)
      const payroll = await payrollService.finalizePayroll(id, companyId, userId);
      
      res.json({
        status: 'success',
        payrollId: id,
        finalizedAt: payroll.finalizedAt,
        netSalary: payroll.netSalary
      });
    } catch (error) {
      if (error.message.includes('already finalized')) {
        return res.status(409).json({ 
          error: 'Payroll already finalized',
          message: 'This payroll was already finalized'
        });
      }
      res.status(500).json({ error: error.message });
    }
  }
);
```

---

### Fix 4: Batch Queries (N+1 Fix) (P0-P01)

**BEFORE (Buruk - N+1):**

```typescript
// For each employee, query separately
for (const employee of employees) {
  const overtime = await prisma.overtime.findMany({
    where: { employeeId: employee.id }
  }); // Query 1
  
  const claims = await prisma.claim.findMany({
    where: { employeeId: employee.id }
  }); // Query 2
  
  const loans = await prisma.loan.findMany({
    where: { employeeId: employee.id }
  }); // Query 3
  
  // ... calculate payroll
}
// Total: 100 employees × 3 queries = 300 queries ❌
```

**AFTER (Baik - Batch):**

```typescript
// Batch load everything
const employeeIds = employees.map(e => e.id);

const overtimeMap = await prisma.overtime.findMany({
  where: { employeeId: { in: employeeIds } }
}).then(records => {
  const map = {};
  records.forEach(r => {
    if (!map[r.employeeId]) map[r.employeeId] = [];
    map[r.employeeId].push(r);
  });
  return map;
}); // Query 1: all OT

const claimsMap = await prisma.claim.findMany({
  where: { employeeId: { in: employeeIds } }
}).then(records => {
  const map = {};
  records.forEach(r => {
    if (!map[r.employeeId]) map[r.employeeId] = [];
    map[r.employeeId].push(r);
  });
  return map;
}); // Query 2: all claims

const loansMap = await prisma.loan.findMany({
  where: { employeeId: { in: employeeIds } }
}).then(records => {
  const map = {};
  records.forEach(r => {
    if (!map[r.employeeId]) map[r.employeeId] = [];
    map[r.employeeId].push(r);
  });
  return map;
}); // Query 3: all loans

// Now calculate (using pre-fetched data)
for (const employee of employees) {
  const ot = overtimeMap[employee.id] || [];
  const claims = claimsMap[employee.id] || [];
  const loans = loansMap[employee.id] || [];
  
  // Calculate using data from memory (no more queries)
}
// Total: 100 employees × 0 new queries = 3 queries ✓
```

**Refactored service:**

```typescript
async function runPayrollBatch(companyId: string, periodStart: Date, periodEnd: Date) {
  // Fetch all employees once
  const employees = await prisma.employee.findMany({
    where: { companyId }
  });
  
  const employeeIds = employees.map(e => e.id);
  
  // Batch load all OT/claims/loans
  const [overtimeRecords, claimsRecords, loansRecords] = await Promise.all([
    prisma.overtime.findMany({
      where: {
        employeeId: { in: employeeIds },
        date: { gte: periodStart, lte: periodEnd }
      }
    }),
    prisma.claim.findMany({
      where: {
        employeeId: { in: employeeIds },
        status: 'APPROVED'
      }
    }),
    prisma.loan.findMany({
      where: { employeeId: { in: employeeIds }, status: 'ACTIVE' }
    })
  ]);
  
  // Create maps for O(1) lookup
  const overtimeMap = groupBy(overtimeRecords, 'employeeId');
  const claimsMap = groupBy(claimsRecords, 'employeeId');
  const loansMap = groupBy(loansRecords, 'employeeId');
  
  // Calculate payroll (all in-memory)
  const payrolls = [];
  for (const employee of employees) {
    const ot = overtimeMap[employee.id] || [];
    const claims = claimsMap[employee.id] || [];
    const loans = loansMap[employee.id] || [];
    
    const payroll = calculatePayroll(employee, ot, claims, loans);
    payrolls.push(payroll);
  }
  
  // Batch insert
  await prisma.payroll.createMany({ data: payrolls });
}

function groupBy(records: any[], key: string) {
  const map = {};
  records.forEach(r => {
    if (!map[r[key]]) map[r[key]] = [];
    map[r[key]].push(r);
  });
  return map;
}
```

---

### Fix 5: File Upload Validation (P1-B08)

```typescript
// src/middleware/fileUpload.ts

import { execSync } from 'child_process';

export async function validateExcelFile(file: Express.Multer.File) {
  const errors: string[] = [];
  
  // 1. Extension check
  if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
    errors.push('File must have .xlsx extension');
  }
  
  // 2. MIME type check
  if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    errors.push('MIME type must be application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }
  
  // 3. Magic byte check (PK = 0x50 0x4B)
  const magicBytes = file.buffer.slice(0, 2);
  const isExcel = magicBytes[0] === 0x50 && magicBytes[1] === 0x4B;
  if (!isExcel) {
    errors.push('File header does not match Excel format');
  }
  
  // 4. File size
  if (file.size > 5 * 1024 * 1024) {
    errors.push('File size exceeds 5MB limit');
  }
  
  // 5. Try parse (ensures it's valid Excel)
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    
    if (!workbook.getWorksheet('Attendance')) {
      errors.push('Sheet "Attendance" not found');
    }
  } catch (error) {
    errors.push('File is not a valid Excel file');
  }
  
  // Return results
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, errors: [] };
}

// Usage in route
router.post('/import', auth, 
  upload.single('file'),
  async (req: Request, res: Response) => {
    const validation = await validateExcelFile(req.file);
    
    if (!validation.valid) {
      return res.status(400).json({
        error: 'File validation failed',
        errors: validation.errors
      });
    }
    
    // Proceed with import
  }
);
```

---

## Part 3: Navigation Changes

### Employee Payslip Menu

```tsx
// src/components/AppShell.tsx

const navItems = [
  // ... existing items
  {
    label: 'Slip Gaji',
    href: '/payroll/my',
    icon: 'document',
    roles: ['EMPLOYEE', 'MANAGER'] // Employee dapat akses
  },
  {
    label: 'Pengaturan',
    href: '/settings',
    icon: 'cog',
    roles: ['all'] // Semua bisa akses settings
  }
];

// Settings page includes MFA setup
// src/pages/settings/mfa.tsx
```

---

## Part 4: Database Indexes

```sql
-- Optimize common queries
CREATE INDEX idx_payroll_status ON payroll(company_id, status);
CREATE INDEX idx_overtime_employee_date ON overtime(employee_id, date);
CREATE INDEX idx_claim_employee_date ON claim(employee_id, status, date);
CREATE INDEX idx_loan_employee ON loan(employee_id, status);
CREATE INDEX idx_payslip_company_date ON payslip(company_id, created_at);
CREATE INDEX idx_audit_log_company_action ON audit_log(company_id, action);
```

---

## Part 5: Testing Checklist

```
Security Tests:
  [ ] Payslip cannot be accessed unauthenticated
  [ ] API key cannot bypass scopes
  [ ] Concurrent finalize only processes 1x
  [ ] Loan not double-charged
  [ ] File upload rejects malware
  
Performance Tests:
  [ ] Payroll run 100 employees < 5 seconds
  [ ] Query count ~5 (not 500)
  [ ] API latency p95 < 100ms
  
Functional Tests:
  [ ] Employee can view own payslip
  [ ] Employee can setup MFA
  [ ] Attendance import idempotent
  [ ] Payroll locked during finalize
```

---

## Implementasi Priority

```
HARI 1-2:
  1. Remove /uploads express.static
  2. Create authenticated payslip endpoint
  3. Add scope enforcement middleware
  4. Test P0-B01 + P0-B02

HARI 3-4:
  5. Atomic payroll finalize
  6. Batch query fix
  7. Test P0-B03 + P0-P01

HARI 5:
  8. Employee nav fix
  9. File upload validation
  10. All tests green
```

---

*Last Updated: 18 Juli 2026 | Owner: Dozer | Status: Siap untuk Development*
