# PAYROLL AUTOMATION SPECIFICATIONS
## PPh 21 (Personal Income Tax) - Indonesia Compliance

**Version:** 1.0 Implementation Spec  
**Date:** 3 July 2026  
**Status:** Ready for Phase 1 Development  
**Target Module:** HR / Finance  
**Effort:** 3-4 weeks (Phase 1 + 2)

---

## 📋 TABLE OF CONTENTS

1. Overview & Compliance Requirements
2. Database Schema & Entities
3. Configuration & PTKP Settings
4. Calculation Engine Specifications
5. GL Integration & Posting
6. Reports & Exports
7. Annual Reconciliation (Form 1721)
8. Testing Strategy

---

## 1. OVERVIEW & COMPLIANCE REQUIREMENTS

### 1.1 PPh 21 Basics

**Definition:** Pajak Penghasilan Pasal 21 = Personal income tax withheld by employer

**Withholding Rate:** 5-30% (progressive, based on PTKP)

**PTKP (Personal Non-Taxable Income) 2024:**
```
Single:                   Rp 54,000,000
Married:                  Rp 58,500,000
Married + 1 child:        Rp 60,500,000
Married + 2 children:     Rp 63,000,000
Married + 3 children:     Rp 63,000,000 (max)

Extra for wife earner:    Rp 54,000,000
Extra per child (max 3):  Rp 4,500,000 each
```

**Gross Salary Components:**
```
Base Salary
+ Performance Bonus
+ Transport Allowance
+ Meal Allowance
+ Overtime Pay
+ Back Pay (if any)
= GROSS INCOME

LESS:
- Employee Health Insurance (JKN/Kesehatan)
- Employee Pension (JPK)
= NET INCOME (for PPh 21 calculation)
```

**Taxable Income Calculation:**
```
NET INCOME (monthly)
- PTKP (based on status)
= TAXABLE INCOME

If TAXABLE INCOME ≤ 0 → PPh 21 = Rp 0
If TAXABLE INCOME > 0 → Apply progressive tax brackets
```

**Progressive Tax Brackets (2024):**
```
0 - 60,000,000      : 5%
60,000,001 - 250,000,000 : 15%
250,000,001 - 500,000,000: 25%
> 500,000,000       : 30%
```

### 1.2 Regulatory Compliance

**Forms & Filings:**
```
Bulanan (Monthly):
├─ Payroll register (internal, for audit trail)
├─ Kartu Absensi (attendance card)
└─ Journal entry to GL (Salary Expense → PPh 21 Payable)

Tahunan (Annual):
├─ SPT Tahunan (Annual Tax Return) — filing March next year
├─ Form 1721 (Individual income tax certificate) — for employees
├─ Form 1721-A1 (Summary of employees' tax) — for company
└─ Laporan Pajak Bulanan (Monthly tax reports)

Government Reporting:
├─ e-Filing SPT Tahunan to DJP (Direktorat Jenderal Pajak)
├─ Form 1721 to employees (for personal tax file)
└─ Tax clearance letter (Surat Keterangan Bebas Pajak)
```

**Indonesia Accounting Standard (SAK-EP):**
```
Balance Sheet:
├─ Current Liability: PPh 21 Payable (monthly accrual)

Income Statement:
├─ Expense: Salary Expense (gross)
├─ Less: PPh 21 Withholding (offset)
```

---

## 2. DATABASE SCHEMA & ENTITIES

### 2.1 Payroll Configuration Entity

```typescript
// backend/src/modules/hr/entities/payroll-config.entity.ts

import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

@Entity('payroll_config')
export class PayrollConfig extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  tenant: Tenant;

  // PTKP Configuration
  @Column({ type: 'decimal', precision: 18, scale: 0, default: 54000000 })
  ptkpSingle: number; // Rp 54,000,000 (2024)

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 58500000 })
  ptkpMarried: number; // Rp 58,500,000

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 60500000 })
  ptkpMarriedChild1: number; // + 1 child

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 63000000 })
  ptkpMarriedChild2: number; // + 2 children

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 63000000 })
  ptkpMarriedChild3: number; // + 3 children (max)

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 54000000 })
  ptkpSpouseExtra: number; // Wife earner

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 4500000 })
  ptkpChildExtra: number; // Per child

  // Tax Brackets (5% bracket)
  @Column({ type: 'decimal', precision: 18, scale: 0, default: 60000000 })
  taxBracket1Limit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5.00 })
  taxBracket1Rate: number;

  // 15% bracket
  @Column({ type: 'decimal', precision: 18, scale: 0, default: 250000000 })
  taxBracket2Limit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15.00 })
  taxBracket2Rate: number;

  // 25% bracket
  @Column({ type: 'decimal', precision: 18, scale: 0, default: 500000000 })
  taxBracket3Limit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 25.00 })
  taxBracket3Rate: number;

  // 30% bracket (above bracket 3)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 30.00 })
  taxBracket4Rate: number;

  // Insurance Deductions
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 4.00 }) // 4%
  jknEmployeeRate: number; // Kesehatan (Health)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 3.75 }) // 3.75%
  jpkEmployeeRate: number; // Pensiun (Pension)

  // GL Account Mapping
  @Column({ type: 'varchar', length: 20 })
  salaryExpenseAccount: string; // GL account code (e.g., '6110')

  @Column({ type: 'varchar', length: 20 })
  pph21PayableAccount: string; // GL account code (e.g., '2130')

  @Column({ type: 'varchar', length: 20 })
  jknPayableAccount: string; // GL account code (e.g., '2140')

  @Column({ type: 'varchar', length: 20 })
  jpkPayableAccount: string; // GL account code (e.g., '2150')

  // Effective Period
  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;
}
```

### 2.2 Employee Tax Status Entity

```typescript
// backend/src/modules/hr/entities/employee-tax-status.entity.ts

@Entity('employee_tax_status')
export class EmployeeTaxStatus extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  // Tax Status
  @Column({ type: 'enum', enum: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'] })
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

  @Column({ type: 'integer', default: 0 })
  numberOfDependents: number; // 0-3 (max 3)

  @Column({ type: 'boolean', default: false })
  spouseIsEarner: boolean;

  // NPWP (Tax ID)
  @Column({ type: 'varchar', length: 20, nullable: true })
  npwp: string; // Format: XX.XXX.XXX.X-XXX.XXX

  @Column({ type: 'date', nullable: true })
  npwpIssueDate: Date;

  // PTKP Determination
  @Column({ type: 'varchar', length: 10 })
  ptkpCode: string; // e.g., 'TK', 'K1', 'K2', 'K3', 'K3B'

  @Column({ type: 'decimal', precision: 18, scale: 0 })
  ptkpAmount: number; // Calculated based on status

  @Column({ type: 'boolean', default: false })
  is1040Form: boolean; // Karyawan dengan PKP Lebih Tinggi

  // Effective Period
  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
```

### 2.3 Monthly Payroll Register Entity

```typescript
// backend/src/modules/hr/entities/payroll-register.entity.ts

@Entity('payroll_register')
export class PayrollRegister extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'varchar', length: 20 })
  employeeCode: string;

  @Column({ type: 'varchar', length: 100 })
  employeeName: string;

  @Column({ type: 'varchar', length: 10 })
  payrollMonth: string; // YYYY-MM format

  // Salary Components
  @Column({ type: 'decimal', precision: 18, scale: 0 })
  baseSalary: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 0 })
  allowancesTransport: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 0 })
  allowancesMeal: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 0 })
  bonusPerformance: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 0 })
  overtimePay: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 0 })
  backPay: number;

  @Column({ type: 'decimal', precision: 18, scale: 0 })
  grossIncome: number; // SUM of above

  // Deductions
  @Column({ type: 'decimal', precision: 18, scale: 0, default: 0 })
  jknDeduction: number; // Health insurance

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 0 })
  jpkDeduction: number; // Pension

  @Column({ type: 'decimal', precision: 18, scale: 0 })
  netIncome: number; // Gross - Deductions

  // PPh 21 Calculation
  @Column({ type: 'varchar', length: 10 })
  ptkpCode: string; // TK, K1, K2, etc.

  @Column({ type: 'decimal', precision: 18, scale: 0 })
  ptkpAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 0 })
  taxableIncome: number; // Net Income - PTKP

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 0 })
  pph21Amount: number; // Calculated tax

  // Payment
  @Column({ type: 'decimal', precision: 18, scale: 0 })
  netPayment: number; // Net Income - PPh 21

  // Status
  @Column({ type: 'enum', enum: ['DRAFT', 'CALCULATED', 'APPROVED', 'PAID'], default: 'DRAFT' })
  status: string;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  // Audit Trail
  @Column({ type: 'uuid', nullable: true })
  calculatedBy: string; // User ID

  @Column({ type: 'timestamp', nullable: true })
  calculatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'boolean', default: false })
  glPosted: boolean; // Whether GL entries created
}
```

---

## 3. CONFIGURATION & PTKP SETTINGS

### 3.1 Initial Setup API

```typescript
// backend/src/modules/hr/controllers/payroll.controller.ts

@Controller('hr/payroll')
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  // Configure PTKP for tenant
  @Post('config')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async setupPayrollConfig(
    @CurrentTenant() tenantId: string,
    @Body() dto: PayrollConfigDto,
  ) {
    return this.payrollService.savePayrollConfig(tenantId, dto);
  }

  // Get current config
  @Get('config')
  @UseGuards(JwtAuthGuard)
  async getPayrollConfig(@CurrentTenant() tenantId: string) {
    return this.payrollService.getPayrollConfig(tenantId);
  }

  // Update employee tax status
  @Put('employees/:employeeId/tax-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateEmployeeTaxStatus(
    @CurrentTenant() tenantId: string,
    @Param('employeeId') employeeId: string,
    @Body() dto: EmployeeTaxStatusDto,
  ) {
    return this.payrollService.updateEmployeeTaxStatus(tenantId, employeeId, dto);
  }
}
```

### 3.2 PTKP DTO Validation

```typescript
// backend/src/modules/hr/dto/payroll-config.dto.ts

import { IsNumber, IsString, IsOptional, IsPositive } from 'class-validator';

export class PayrollConfigDto {
  @IsNumber()
  @IsPositive()
  ptkpSingle: number;

  @IsNumber()
  @IsPositive()
  ptkpMarried: number;

  @IsNumber()
  @IsPositive()
  ptkpMarriedChild1: number;

  // ... other PTKP fields

  @IsString()
  salaryExpenseAccount: string; // GL code

  @IsString()
  pph21PayableAccount: string;

  // GL accounts for JKN, JPK, etc.
}

export class EmployeeTaxStatusDto {
  @IsString()
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

  @IsNumber()
  numberOfDependents: number;

  @IsOptional()
  @IsString()
  npwp: string;

  @IsString()
  ptkpCode: string; // TK, K1, K2, K3
}
```

---

## 4. CALCULATION ENGINE SPECIFICATIONS

### 4.1 PPh 21 Calculation Service

```typescript
// backend/src/modules/hr/services/pph21-calculation.service.ts

@Injectable()
export class Pph21CalculationService {
  constructor(
    @InjectRepository(PayrollRegister) private payrollRepo: Repository<PayrollRegister>,
    @InjectRepository(PayrollConfig) private configRepo: Repository<PayrollConfig>,
    @InjectRepository(EmployeeTaxStatus) private taxStatusRepo: Repository<EmployeeTaxStatus>,
  ) {}

  /**
   * Calculate PPh 21 for an employee in given month
   */
  async calculatePph21(
    tenantId: string,
    employeeId: string,
    month: string, // YYYY-MM
    salaryData: {
      baseSalary: number;
      allowancesTransport?: number;
      allowancesMeal?: number;
      bonusPerformance?: number;
      overtimePay?: number;
      backPay?: number;
      jknDeduction?: number;
      jpkDeduction?: number;
    },
  ): Promise<{
    grossIncome: number;
    netIncome: number;
    taxableIncome: number;
    pph21Amount: number;
    netPayment: number;
    calculation: CalculationBreakdown;
  }> {
    // 1. Get PTKP amount for employee
    const taxStatus = await this.taxStatusRepo.findOne({
      where: { tenantId, employeeId, isActive: true },
    });

    if (!taxStatus) {
      throw new Error('Employee tax status not configured');
    }

    const ptkpAmount = taxStatus.ptkpAmount;

    // 2. Calculate Gross Income
    const grossIncome =
      salaryData.baseSalary +
      (salaryData.allowancesTransport || 0) +
      (salaryData.allowancesMeal || 0) +
      (salaryData.bonusPerformance || 0) +
      (salaryData.overtimePay || 0) +
      (salaryData.backPay || 0);

    // 3. Calculate Net Income (after JKN, JPK deductions)
    const jknDeduction = salaryData.jknDeduction || this.calculateJkn(grossIncome);
    const jpkDeduction = salaryData.jpkDeduction || this.calculateJpk(grossIncome);

    const netIncome = grossIncome - jknDeduction - jpkDeduction;

    // 4. Calculate Taxable Income (Net - PTKP)
    const taxableIncome = Math.max(0, netIncome - ptkpAmount);

    // 5. Calculate PPh 21 using progressive brackets
    const pph21Amount = this.calculateProgressiveTax(taxableIncome);

    // 6. Calculate Net Payment
    const netPayment = netIncome - pph21Amount;

    return {
      grossIncome,
      netIncome,
      taxableIncome,
      pph21Amount,
      netPayment,
      calculation: {
        ptkpCode: taxStatus.ptkpCode,
        ptkpAmount,
        jknDeduction,
        jpkDeduction,
        breakdown: this.getBreakdownDetails(grossIncome, netIncome, pph21Amount),
      },
    };
  }

  /**
   * Calculate JKN (Health Insurance) 4% of gross
   */
  private calculateJkn(grossIncome: number): number {
    const config = this.getConfig(); // Get latest PTKP config
    return Math.round(grossIncome * (config.jknEmployeeRate / 100));
  }

  /**
   * Calculate JPK (Pension) 3.75% of gross
   */
  private calculateJpk(grossIncome: number): number {
    const config = this.getConfig();
    return Math.round(grossIncome * (config.jpkEmployeeRate / 100));
  }

  /**
   * Calculate tax using progressive brackets
   * Bracket 1: 0 - 60M = 5%
   * Bracket 2: 60M - 250M = 15%
   * Bracket 3: 250M - 500M = 25%
   * Bracket 4: > 500M = 30%
   */
  private calculateProgressiveTax(taxableIncome: number): number {
    const config = this.getConfig();

    if (taxableIncome <= 0) return 0;

    let tax = 0;

    // Bracket 1
    const bracket1Income = Math.min(
      taxableIncome,
      config.taxBracket1Limit,
    );
    tax += bracket1Income * (config.taxBracket1Rate / 100);

    // Bracket 2
    if (taxableIncome > config.taxBracket1Limit) {
      const bracket2Income = Math.min(
        taxableIncome - config.taxBracket1Limit,
        config.taxBracket2Limit - config.taxBracket1Limit,
      );
      tax += bracket2Income * (config.taxBracket2Rate / 100);
    }

    // Bracket 3
    if (taxableIncome > config.taxBracket2Limit) {
      const bracket3Income = Math.min(
        taxableIncome - config.taxBracket2Limit,
        config.taxBracket3Limit - config.taxBracket2Limit,
      );
      tax += bracket3Income * (config.taxBracket3Rate / 100);
    }

    // Bracket 4
    if (taxableIncome > config.taxBracket3Limit) {
      const bracket4Income = taxableIncome - config.taxBracket3Limit;
      tax += bracket4Income * (config.taxBracket4Rate / 100);
    }

    return Math.round(tax);
  }

  /**
   * Get breakdown details for reporting
   */
  private getBreakdownDetails(
    grossIncome: number,
    netIncome: number,
    pph21: number,
  ) {
    return {
      grossIncome: this.formatCurrency(grossIncome),
      deductions: {
        jkn: this.formatCurrency(this.calculateJkn(grossIncome)),
        jpk: this.formatCurrency(this.calculateJpk(grossIncome)),
      },
      netIncome: this.formatCurrency(netIncome),
      pph21Withholding: this.formatCurrency(pph21),
      netPayment: this.formatCurrency(netIncome - pph21),
    };
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  private getConfig() {
    // Get latest active payroll config
    // Implementation: Query DB
  }
}
```

### 4.2 Example Calculation

```
Employee: Budi Santoso
Status: K/1 (Married + 1 child)
Month: July 2024

Salary Components:
├─ Base Salary:          Rp 10,000,000
├─ Transport Allowance:  Rp    750,000
├─ Meal Allowance:       Rp    500,000
├─ Performance Bonus:    Rp  2,000,000
└─ GROSS INCOME:         Rp 13,250,000

Less Deductions:
├─ JKN (4%):             Rp    530,000
├─ JPK (3.75%):          Rp    496,875
└─ NET INCOME:           Rp 12,223,125

Less PTKP:
├─ PTKP Code:            K/1 = Rp 60,500,000 (annual)
├─ PTKP Monthly:         Rp  5,041,667 (60,500,000 / 12)
└─ TAXABLE INCOME:       Rp  7,181,458

PPh 21 Calculation:
├─ Bracket 1 (5%):       Rp 7,181,458 × 5% = Rp 359,073
└─ PPh 21 AMOUNT:        Rp 359,073

Final Calculation:
├─ Net Income:           Rp 12,223,125
├─ Less PPh 21:          Rp    359,073
└─ NET PAYMENT:          Rp 11,864,052
```

---

## 5. GL INTEGRATION & POSTING

### 5.1 GL Posting After Payroll Calculation

```typescript
// backend/src/modules/hr/services/payroll-gl-integration.service.ts

@Injectable()
export class PayrollGlIntegrationService {
  constructor(
    @InjectRepository(PayrollRegister) private payrollRepo: Repository<PayrollRegister>,
    private glService: GlService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Post payroll to GL (monthly)
   * Creates journal entry: Salary Expense → Salary Payable, PPh 21 Payable, JKN Payable
   */
  async postPayrollToGl(
    tenantId: string,
    payrollMonth: string, // YYYY-MM
  ): Promise<{
    journalEntryId: string;
    lines: any[];
    totalDebit: number;
    totalCredit: number;
  }> {
    // 1. Get all payroll records for the month
    const payrolls = await this.payrollRepo.find({
      where: {
        tenantId,
        payrollMonth,
        status: 'APPROVED',
        glPosted: false,
      },
    });

    if (payrolls.length === 0) {
      throw new Error('No approved payroll records found for posting');
    }

    // 2. Get GL accounts from config
    const config = await this.getPayrollConfig(tenantId);

    // 3. Aggregate amounts
    const totalSalary = payrolls.reduce((sum, p) => sum + p.grossIncome, 0);
    const totalPph21 = payrolls.reduce((sum, p) => sum + p.pph21Amount, 0);
    const totalJkn = payrolls.reduce((sum, p) => sum + p.jknDeduction, 0);
    const totalJpk = payrolls.reduce((sum, p) => sum + p.jpkDeduction, 0);
    const totalSalaryPayable = payrolls.reduce((sum, p) => sum + p.netPayment, 0);

    // 4. Create GL entry with multiple lines
    const glEntry = await this.glService.createJournalEntry(tenantId, {
      reference: `PAYROLL-${payrollMonth.replace('-', '')}`,
      period: payrollMonth.replace('-', ''),
      description: `Monthly Payroll - ${payrollMonth}`,
      lines: [
        // DEBIT: Salary Expense
        {
          accountCode: config.salaryExpenseAccount,
          accountName: 'Salary Expense',
          debit: totalSalary,
          credit: 0,
          description: `Gross salary for ${payrolls.length} employees`,
        },
        // CREDIT: Salary Payable
        {
          accountCode: '2120', // Accrued Salary Payable
          accountName: 'Salary Payable',
          debit: 0,
          credit: totalSalaryPayable,
          description: `Net salary payable`,
        },
        // CREDIT: PPh 21 Payable
        {
          accountCode: config.pph21PayableAccount, // '2130'
          accountName: 'PPh 21 Payable',
          debit: 0,
          credit: totalPph21,
          description: `PPh 21 withholding`,
        },
        // CREDIT: JKN Payable
        {
          accountCode: config.jknPayableAccount, // '2140'
          accountName: 'JKN (Health Insurance) Payable',
          debit: 0,
          credit: totalJkn,
          description: `Health insurance contribution`,
        },
        // CREDIT: JPK Payable
        {
          accountCode: config.jpkPayableAccount, // '2150'
          accountName: 'JPK (Pension) Payable',
          debit: 0,
          credit: totalJpk,
          description: `Pension contribution`,
        },
      ],
    });

    // 5. Mark payroll records as GL posted
    await this.payrollRepo.update(
      { tenantId, payrollMonth },
      { glPosted: true },
    );

    // 6. Emit event for audit trail
    this.eventEmitter.emit('payroll.gl-posted', {
      tenantId,
      payrollMonth,
      journalEntryId: glEntry.id,
      recordsPosted: payrolls.length,
      totalAmount: totalSalary,
    });

    return {
      journalEntryId: glEntry.id,
      lines: glEntry.lines,
      totalDebit: totalSalary,
      totalCredit: totalSalaryPayable + totalPph21 + totalJkn + totalJpk,
    };
  }

  /**
   * Verify GL entry is balanced
   */
  private validateGlBalance(lines: any[]): boolean {
    const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
    return totalDebit === totalCredit;
  }
}
```

### 5.2 GL Account Chart

```
2110 Salary Payable (Current Liability)
2120 Accrued Salary Payable
2130 PPh 21 Payable
2140 JKN (Health Insurance) Payable
2150 JPK (Pension) Payable
2160 Overtime Payable (if accrued)

6110 Salary Expense (Expense)
6120 Overtime Expense
6130 Bonus Expense
6140 Allowance Expense
6150 Social Contribution Expense (Company's JKN/JPK)
```

---

## 6. REPORTS & EXPORTS

### 6.1 Monthly Payroll Register Report

**Report Format:**

```
PT ABC INDONESIA
MONTHLY PAYROLL REGISTER — JULY 2024

Employee  Name              Base Sal    Allowances  Gross Income  JKN      JPK     Net Income  PTKP    Taxable   PPh 21   Net Payment
Code                        IDR         IDR         IDR          IDR      IDR      IDR        IDR     IDR      IDR     IDR
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
E001      Budi Santoso     10,000,000  1,250,000  13,250,000   530,000  496,875 12,223,125 5,041,667 7,181,458 359,073 11,864,052
E002      Siti Nurhaliza   12,000,000    900,000  12,900,000   516,000  483,75  12,400,250 5,041,667 7,358,583 367,929 12,032,321
...
TOTAL                                              Rp 26,150,000 1,046K   980K    Rp 24,623,375         Rp 15,000K 727K    Rp 23,896K

Generated: 3 Jul 2026
Prepared by: Finance Manager
Approved by: CFO
```

### 6.2 API Endpoint — Generate Payroll Report

```typescript
@Get('payroll/register/:month')
@UseGuards(JwtAuthGuard)
async getPayrollRegister(
  @CurrentTenant() tenantId: string,
  @Param('month') month: string, // YYYY-MM
  @Query('format') format: 'json' | 'pdf' | 'excel' = 'json',
) {
  const report = await this.payrollService.generatePayrollRegister(tenantId, month);
  
  if (format === 'pdf') {
    return this.exportService.generatePdf(report, 'payroll-register.pdf');
  } else if (format === 'excel') {
    return this.exportService.generateExcel(report, 'payroll-register.xlsx');
  }
  
  return report;
}
```

---

## 7. ANNUAL RECONCILIATION (FORM 1721)

### 7.1 Form 1721 Components

**Form 1721 = Individual Tax Certificate issued to each employee**

```
PT ABC INDONESIA
SURAT KETERANGAN PAJAK PENGHASILAN PASAL 21
TAHUN PAJAK 2024

Nama Karyawan:           BUDI SANTOSO
NPWP:                    12.345.678.9-101.001
NIK:                     1234567890123456
Status Perkawinan:       Married + 1 child (K/1)

INCOME SUMMARY (Jan - Dec 2024):
Gross Income:            Rp 157,800,000
JKN Deduction:           Rp   6,312,000
JPK Deduction:           Rp   5,917,500
Net Income:              Rp 145,570,500

PTKP:                    Rp  60,500,000 (annual K/1)
Taxable Income:          Rp  85,070,500

PPh 21 CALCULATION:
Bracket 1 (0-60M @ 5%):  Rp   3,000,000
Bracket 2 (60-85M @ 15%): Rp   3,760,575
Total PPh 21 Withheld:   Rp   6,760,575

Monthly Average:         Rp     563,381
```

### 7.2 Form 1721 Generation Service (Phase 2)

```typescript
// backend/src/modules/hr/services/form-1721.service.ts

@Injectable()
export class Form1721Service {
  async generateForm1721(
    tenantId: string,
    employeeId: string,
    year: number, // 2024
  ): Promise<Form1721Dto> {
    // 1. Get employee & tax status
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
    const taxStatus = await this.taxStatusRepo.findOne({
      where: { tenantId, employeeId },
    });

    // 2. Aggregate payroll data for entire year
    const yearlyPayroll = await this.getYearlyPayrollData(tenantId, employeeId, year);

    // 3. Calculate annual PPh 21
    const annualPph21 = yearlyPayroll.reduce((sum, p) => sum + p.pph21Amount, 0);

    // 4. Format Form 1721
    return {
      employeeName: employee.name,
      npwp: taxStatus.npwp,
      nppkp: employee.jobPosition,
      grossIncome: yearlyPayroll.reduce((sum, p) => sum + p.grossIncome, 0),
      deductions: {
        jkn: yearlyPayroll.reduce((sum, p) => sum + p.jknDeduction, 0),
        jpk: yearlyPayroll.reduce((sum, p) => sum + p.jpkDeduction, 0),
      },
      netIncome: yearlyPayroll.reduce((sum, p) => sum + p.netIncome, 0),
      ptkpAmount: taxStatus.ptkpAmount,
      taxableIncome: yearlyPayroll.reduce((sum, p) => sum + p.taxableIncome, 0),
      pph21Withheld: annualPph21,
      certificateDate: new Date(),
      certificateNumber: `1721-${tenantId}-${employeeId}-${year}`,
    };
  }

  /**
   * Generate Form 1721-A1 (Summary for company SPT filing)
   */
  async generateForm1721A1(
    tenantId: string,
    year: number,
  ): Promise<Form1721A1Dto> {
    const employees = await this.getEmployeesWithPayroll(tenantId, year);

    return {
      companyName: this.getTenantName(tenantId),
      npwp: this.getTenantNpwp(tenantId),
      year,
      totalEmployees: employees.length,
      totalGrossIncome: employees.reduce((sum, e) => sum + e.totalGrossIncome, 0),
      totalNetIncome: employees.reduce((sum, e) => sum + e.totalNetIncome, 0),
      totalPph21Withheld: employees.reduce((sum, e) => sum + e.totalPph21, 0),
      reportDate: new Date(),
      submittedBy: 'Finance Manager',
    };
  }
}
```

---

## 8. TESTING STRATEGY

### 8.1 Unit Tests

```typescript
// backend/src/modules/hr/services/pph21-calculation.service.spec.ts

describe('Pph21CalculationService', () => {
  let service: Pph21CalculationService;

  beforeEach(async () => {
    // Setup test module
  });

  describe('calculatePph21', () => {
    it('should return 0 PPh 21 if net income <= PTKP', async () => {
      const result = await service.calculatePph21('tenant-1', 'emp-1', '202407', {
        baseSalary: 50000000, // Below PTKP
      });
      expect(result.pph21Amount).toBe(0);
    });

    it('should calculate correctly for K/1 status', async () => {
      // Example: Budi Santoso calculation from section 4.2
      const result = await service.calculatePph21('tenant-1', 'emp-1', '202407', {
        baseSalary: 10000000,
        allowancesTransport: 750000,
        allowancesMeal: 500000,
        bonusPerformance: 2000000,
      });
      expect(result.pph21Amount).toBeCloseTo(359073, -2);
      expect(result.netPayment).toBeCloseTo(11864052, -2);
    });

    it('should apply progressive tax brackets correctly', async () => {
      // Test bracket 2, 3, 4 scenarios
    });

    it('should deduct JKN and JPK before PTKP', async () => {
      const result = await service.calculatePph21('tenant-1', 'emp-1', '202407', {
        baseSalary: 100000000,
        jknDeduction: 4000000,
        jpkDeduction: 3750000,
      });
      expect(result.netIncome).toBe(100000000 - 4000000 - 3750000);
    });
  });
});
```

### 8.2 Integration Tests

```typescript
// Test payroll → GL posting flow
describe('Payroll GL Integration', () => {
  it('should post payroll to GL with balanced entry', async () => {
    // 1. Create payroll records
    // 2. Approve payroll
    // 3. Post to GL
    // 4. Verify GL entry is balanced
    // 5. Verify accounts have correct balances
  });
});
```

---

## 9. IMPLEMENTATION PHASES

### Phase 1 (Week 1-2)
```
✅ Database entities
✅ PTKP configuration
✅ Basic PPh 21 calculation
✅ Monthly payroll register
✅ GL posting integration
✅ Unit tests (20+ tests)
```

### Phase 2 (Week 3-4)
```
✅ Annual reconciliation logic
✅ Form 1721 generation
✅ Form 1721-A1 generation
✅ SPT Tahunan preparation (XML export)
✅ Integration tests
✅ E2E tests (payroll flow)
✅ Frontend: Payroll module UI
```

---

**Estimated Effort:** 3-4 weeks total (Phase 1 + 2)  
**Owner:** Backend (Finance/HR), Frontend  
**Status:** Ready for Sprint 2 implementation  
**Last Updated:** 3 July 2026

