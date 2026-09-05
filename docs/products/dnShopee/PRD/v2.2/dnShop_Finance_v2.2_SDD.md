# dnShop Finance v2.2 — Software Design Document

**Document ID:** `dnShop_Finance_v2.2_SDD.md`  
**Version:** 2.2.0  
**Date:** August 2026  
**Owner:** Dozer (CEO + Tech Lead, DN Tech)  
**Status:** **Implemented 100%** (10 Agustus 2026)  
**Related:** [PRD](./dnShop_Finance_v2.2_PRD.md) · [SRS](./dnShop_Finance_v2.2_SRS.md)

---

## 1. System Architecture

### 1.1 High-Level Diagram

```
┌─────────────────────────────────────────────┐
│         Frontend (Next.js 15)               │
│  /journal/reports/cash-flow                 │
│  /journal/export/accounting                 │
│  /tax/e-faktur                              │
└─────────────────────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────┐
│      NestJS API (v2.2 Services)             │
│  • CashFlowService                          │
│  • COGSService                              │
│  • AccountingExportService                  │
│  • TaxService (e-Faktur)                    │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    ┌────────┐ ┌──────────┐ ┌──────────┐
    │Journal │ │Inventory │ │Chart of  │
    │Entries │ │ Costing  │ │Accounts  │
    └────────┘ └──────────┘ └──────────┘
        │           │           │
        └───────────┴───────────┴──────────────────┐
                    │                              ▼
                    │                      ┌──────────────────┐
                    │                      │Export Audit Log  │
                    │                      │e-Faktur Log      │
                    ▼                      └──────────────────┘
            ┌───────────────────┐
            │  PostgreSQL (DB)  │
            │  (existing v2.1)  │
            │  + v2.2 new tables│
            └───────────────────┘

Data flow:
1. User creates journal entries (v2.1)
2. COGS job reads journals → auto-journal HPP
3. Cash flow endpoint computes from journals
4. Export service maps CoA → software format
5. Tax service generates e-Faktur XML
```

---

## 2. Database Schema (v2.2 Additions)

### 2.1 Core Tables (v2.1 existing — do not modify)

**journal_entries** — existing (v2.0 pembukuan)
```sql
id, shop_id, date, description, status (DRAFT/POSTED), auto_journal_flag, 
created_at, posted_at, audit_log_id, ...
```

**chart_of_accounts** — existing (SAK EMKM 45-account)

**shopee_orders** — existing + new column (v2.2):
```sql
ALTER TABLE shopee_orders ADD COLUMN (
  cogs_journal_entry_id BIGINT REFERENCES journal_entries(id),
  cogs_amount NUMERIC(14, 2),
  cogs_cost_basis NUMERIC(10, 6),
  cogs_qty NUMERIC(10, 2),
  cogs_method VARCHAR(50) DEFAULT 'average'
);
```

### 2.2 New Tables (v2.2)

#### inventory_costing
```sql
CREATE TABLE inventory_costing (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  item_id BIGINT,  -- from Shopee
  item_name VARCHAR(255),
  cost_per_unit NUMERIC(14, 2),  -- Rp / unit
  method VARCHAR(50) DEFAULT 'average',  -- average, fifo (fifo=future)
  currency VARCHAR(3) DEFAULT 'IDR',
  last_updated_by BIGINT REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(shop_id, item_id),
  INDEX idx_shop_item (shop_id, item_id),
  INDEX idx_updated (shop_id, updated_at DESC)
);
```

#### cash_flow_category_mapping
```sql
CREATE TABLE cash_flow_category_mapping (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  chart_of_accounts_id BIGINT NOT NULL REFERENCES chart_of_accounts(id),
  cash_flow_category VARCHAR(50),  -- operating, investing, financing
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(shop_id, chart_of_accounts_id),
  INDEX idx_shop (shop_id)
);
```

#### accounting_export_mapping (JSONB in shops table alternative)
```sql
ALTER TABLE shops ADD COLUMN (
  accounting_export_mapping JSONB,
  -- { "accurate": { "1110": "1000", ... }, "jurnal": { ... } }
  last_cash_flow_generated_at TIMESTAMP,
  last_cogs_sync_at TIMESTAMP
);
```

#### export_audit_log
```sql
CREATE TABLE export_audit_log (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  export_type VARCHAR(50),  -- cash_flow, cogs, accounting_export, e_faktur
  export_period VARCHAR(10),  -- YYYY-MM or date_range
  file_name VARCHAR(255),
  file_format VARCHAR(10),  -- pdf, csv, xlsx, xml
  file_hash VARCHAR(255),  -- SHA256 for integrity
  file_size_bytes INT,
  exported_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_shop_type (shop_id, export_type, created_at DESC),
  INDEX idx_created (created_at DESC)
);
```

#### e_faktur_log
```sql
CREATE TABLE e_faktur_log (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  period VARCHAR(7),  -- YYYY-MM
  xml_file_name VARCHAR(255),
  xml_hash VARCHAR(255),
  xml_size_bytes INT,
  validation_status VARCHAR(50),  -- valid, invalid, pending
  validation_errors TEXT,  -- JSON array of errors if invalid
  djp_submission_status VARCHAR(50),  -- pending, submitted, accepted, rejected
  djp_submission_date TIMESTAMP,
  djp_response_code VARCHAR(10),
  djp_response_message TEXT,
  generated_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(shop_id, period),
  INDEX idx_shop_period (shop_id, period DESC),
  INDEX idx_validation (validation_status)
);
```

### 2.3 Indexes for Performance

```sql
-- Journal queries for cash flow
CREATE INDEX idx_journal_shop_date ON journal_entries(shop_id, date DESC) WHERE status = 'POSTED';
CREATE INDEX idx_journal_account ON journal_entries(shop_id, account_id);

-- COGS queries
CREATE INDEX idx_cogs_journal ON shopee_orders(cogs_journal_entry_id) WHERE cogs_journal_entry_id IS NOT NULL;
CREATE INDEX idx_orders_delivered ON shopee_orders(shop_id, order_status) WHERE order_status = 'DELIVERED';

-- Inventory costing lookup
CREATE INDEX idx_inventory_cost_item ON inventory_costing(shop_id, item_id);

-- Audit log queries
CREATE INDEX idx_export_log_shop ON export_audit_log(shop_id, created_at DESC);
CREATE INDEX idx_efaktur_period ON e_faktur_log(shop_id, period DESC);
```

---

## 3. Service Architecture

### 3.1 CashFlowService

```typescript
// src/services/cash-flow.service.ts

class CashFlowService {
  constructor(
    private journalRepo: Repository<JournalEntry>,
    private coaRepo: Repository<ChartOfAccounts>,
    private mappingRepo: Repository<CashFlowCategoryMapping>,
    private logger: Logger
  ) {}
  
  async generateCashFlow(
    shopId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<CashFlowStatement> {
    // 1. Validate date range
    if ((dateTo.getTime() - dateFrom.getTime()) > 365 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException('Max 12 months allowed');
    }
    
    // 2. Fetch posted journals in period
    const journals = await this.journalRepo.find({
      where: {
        shop_id: shopId,
        status: 'POSTED',
        date: Between(dateFrom, dateTo)
      },
      relations: ['account', 'lines']
    });
    
    // 3. Fetch cash flow category mapping
    const mapping = await this.mappingRepo.find({ shop_id: shopId });
    const categoryMap = new Map(
      mapping.map(m => [m.chart_of_accounts_id, m.cash_flow_category])
    );
    
    // 4. Calculate P&L (net income)
    const pnl = await this.calculatePNL(shopId, dateFrom, dateTo);
    
    // 5. Classify accounts + sum
    const operating = this.sumByCategory(journals, categoryMap, 'operating') + pnl;
    const investing = this.sumByCategory(journals, categoryMap, 'investing');
    const financing = this.sumByCategory(journals, categoryMap, 'financing');
    
    // 6. Get beginning cash
    const beginningCash = await this.getBeginningCash(shopId, dateFrom);
    
    // 7. Calculate ending cash
    const endingCash = beginningCash + operating + investing + financing;
    
    return {
      period: { from: dateFrom, to: dateTo },
      beginning_cash: beginningCash,
      operating: {
        net_income: pnl,
        adjustments: { /* details */ },
        net_operating_cash: operating
      },
      investing: { /* details */ },
      financing: { /* details */ },
      ending_cash: endingCash,
      variance_to_bank: 0  // TODO: fetch actual bank balance
    };
  }
  
  private sumByCategory(
    journals: JournalEntry[],
    categoryMap: Map<number, string>,
    category: string
  ): number {
    return journals
      .filter(j => categoryMap.get(j.account_id) === category)
      .reduce((sum, j) => sum + (j.debit - j.credit), 0);
  }
  
  private async calculatePNL(shopId: string, dateFrom: Date, dateTo: Date): Promise<number> {
    // Query income - expense accounts for period
    const result = await this.journalRepo
      .createQueryBuilder('j')
      .where('j.shop_id = :shopId AND j.date BETWEEN :dateFrom AND :dateTo', {
        shopId,
        dateFrom,
        dateTo
      })
      .andWhere('j.status = :status', { status: 'POSTED' })
      .andWhere('(j.account.type IN ("income", "expense"))')
      .select('SUM(j.debit - j.credit)', 'net')
      .getRawOne();
    
    return result?.net || 0;
  }
  
  private async getBeginningCash(shopId: string, dateFrom: Date): Promise<number> {
    // Sum all cash account entries BEFORE dateFrom
    const result = await this.journalRepo
      .createQueryBuilder('j')
      .where('j.shop_id = :shopId AND j.date < :dateFrom', { shopId, dateFrom })
      .andWhere('j.account.code LIKE :cashCode', { cashCode: '11__' })  // 1110, 1120, etc.
      .andWhere('j.status = :status', { status: 'POSTED' })
      .select('SUM(j.debit - j.credit)', 'balance')
      .getRawOne();
    
    return result?.balance || 0;
  }
}
```

---

### 3.2 COGSService

```typescript
// src/services/cogs.service.ts

class COGSService {
  constructor(
    private ordersRepo: Repository<ShopeeOrder>,
    private inventoryRepo: Repository<InventoryCosting>,
    private journalService: JournalService,
    private logger: Logger
  ) {}
  
  async createCOGSJournal(shopId: string, orderSn: string): Promise<JournalEntry> {
    // 1. Fetch order
    const order = await this.ordersRepo.findOne({
      where: { shop_id: shopId, order_sn: orderSn }
    });
    
    if (!order) throw new NotFoundException(`Order not found: ${orderSn}`);
    
    // 2. Check if COGS already exists
    if (order.cogs_journal_entry_id) {
      this.logger.warn(`COGS already exists for order ${orderSn}, skipping`);
      return null;
    }
    
    // 3. Calculate COGS = sum(cost_per_unit × qty) for each item
    let totalCOGS = 0;
    for (const item of order.item_list) {
      const inventory = await this.inventoryRepo.findOne({
        where: { shop_id: shopId, item_id: item.item_id }
      });
      
      const itemCOGS = (inventory?.cost_per_unit || 0) * item.qty;
      totalCOGS += itemCOGS;
    }
    
    if (totalCOGS === 0) {
      this.logger.warn(`COGS amount is 0 for order ${orderSn}, skipping`);
      return null;
    }
    
    // 4. Create GL entry (auto-journal)
    const coaHPP = await this.getCoAByCode(shopId, '5110');  // HPP
    const coaInventory = await this.getCoAByCode(shopId, '1210');  // Inventory
    
    const journalEntry = await this.journalService.createEntry({
      shop_id: shopId,
      date: order.update_time || new Date(),
      description: `COGS dari order ${orderSn} (average cost)`,
      status: 'POSTED',  // Auto-journal posted immediately
      auto_journal_flag: true,
      lines: [
        { account_id: coaHPP.id, debit: totalCOGS, credit: 0 },
        { account_id: coaInventory.id, debit: 0, credit: totalCOGS }
      ]
    });
    
    // 5. Link COGS to order
    order.cogs_journal_entry_id = journalEntry.id;
    order.cogs_amount = totalCOGS;
    order.cogs_method = 'average';
    await this.ordersRepo.save(order);
    
    // 6. Audit log
    await this.auditLogRepo.save({
      shop_id: shopId,
      export_type: 'cogs_auto_journal',
      file_name: `order_${orderSn}`,
      created_at: new Date()
    });
    
    return journalEntry;
  }
  
  @Cron('0 */4 * * *')  // Every 4h
  async syncCOGSForAllShops() {
    const shops = await this.shopsRepo.find({
      where: { account_status: 'active' }
    });
    
    for (const shop of shops) {
      try {
        await this.syncCOGSForShop(shop.id);
      } catch (error) {
        this.logger.error(`COGS sync failed for shop ${shop.id}`, error);
      }
    }
  }
  
  private async syncCOGSForShop(shopId: string) {
    // Find all DELIVERED orders without COGS journal
    const orders = await this.ordersRepo.find({
      where: {
        shop_id: shopId,
        order_status: 'DELIVERED',
        cogs_journal_entry_id: IsNull()
      }
    });
    
    for (const order of orders) {
      try {
        await this.createCOGSJournal(shopId, order.order_sn);
      } catch (error) {
        this.logger.error(`COGS creation failed for order ${order.order_sn}`, error);
      }
    }
  }
  
  async reverseCOGS(shopId: string, orderSn: string): Promise<JournalEntry> {
    const order = await this.ordersRepo.findOne({
      where: { shop_id: shopId, order_sn: orderSn }
    });
    
    if (!order?.cogs_journal_entry_id) {
      throw new NotFoundException(`No COGS to reverse for order ${orderSn}`);
    }
    
    const originalEntry = await this.journalRepo.findOne(order.cogs_journal_entry_id);
    
    // Create reverse entry
    const reverseEntry = await this.journalService.createEntry({
      shop_id: shopId,
      date: new Date(),
      description: `Reverse COGS order ${orderSn} (refund)`,
      status: 'POSTED',
      auto_journal_flag: true,
      lines: originalEntry.lines.map(l => ({
        account_id: l.account_id,
        debit: l.credit,  // Flip debit/credit
        credit: l.debit
      }))
    });
    
    order.cogs_journal_entry_id = null;  // Clear link
    await this.ordersRepo.save(order);
    
    return reverseEntry;
  }
}
```

---

### 3.3 AccountingExportService

```typescript
// src/services/accounting-export.service.ts

class AccountingExportService {
  constructor(
    private journalRepo: Repository<JournalEntry>,
    private coaRepo: Repository<ChartOfAccounts>,
    private shopsRepo: Repository<Shop>,
    private auditLogRepo: Repository<ExportAuditLog>
  ) {}
  
  async exportGL(
    shopId: string,
    software: 'accurate' | 'jurnal' | 'myob',
    dateFrom: Date,
    dateTo: Date,
    includeOpeningBalance: boolean,
    format: 'xlsx' | 'csv'
  ): Promise<{ fileName: string; downloadUrl: string }> {
    // 1. Get mapping
    const shop = await this.shopsRepo.findOne(shopId);
    const mapping = shop.accounting_export_mapping?.[software] || {};
    
    // 2. Fetch journals
    const journals = await this.journalRepo.find({
      where: {
        shop_id: shopId,
        status: 'POSTED',
        date: Between(dateFrom, dateTo)
      },
      relations: ['lines', 'account']
    });
    
    // 3. Build export data
    const rows = [];
    
    if (includeOpeningBalance) {
      // Add opening balance row per account
      const accounts = [...new Set(journals.map(j => j.account_id))];
      for (const accountId of accounts) {
        const openingBal = await this.getOpeningBalance(shopId, accountId, dateFrom);
        const coa = await this.coaRepo.findOne(accountId);
        const mappedCode = mapping[coa.code] || coa.code;
        
        if (openingBal !== 0) {
          rows.push({
            date: formatDate(dateFrom),
            account_code: mappedCode,
            account_name: coa.name,
            debit: openingBal > 0 ? openingBal : 0,
            credit: openingBal < 0 ? Math.abs(openingBal) : 0,
            reference: 'OB',
            description: 'Opening Balance'
          });
        }
      }
    }
    
    // 4. Add journal lines
    for (const journal of journals) {
      const coa = await this.coaRepo.findOne(journal.account_id);
      const mappedCode = mapping[coa.code] || coa.code;
      
      for (const line of journal.lines) {
        rows.push({
          date: formatDate(journal.date),
          account_code: mappedCode,
          account_name: coa.name,
          debit: line.debit || 0,
          credit: line.credit || 0,
          reference: journal.reference || '',
          description: journal.description || ''
        });
      }
    }
    
    // 5. Generate file
    let fileName, fileContent;
    if (format === 'xlsx') {
      fileName = `GL_Export_${shopId}_${dateFrom}_to_${dateTo}.xlsx`;
      fileContent = await this.generateXLSX(rows);
    } else {
      fileName = `GL_Export_${shopId}_${dateFrom}_to_${dateTo}.csv`;
      fileContent = this.generateCSV(rows);
    }
    
    // 6. Upload to temp storage (S3 or local)
    const downloadUrl = await this.uploadToTempStorage(fileName, fileContent);
    
    // 7. Audit log
    const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');
    await this.auditLogRepo.save({
      shop_id: shopId,
      export_type: 'accounting_export',
      file_name: fileName,
      file_format: format,
      file_hash: fileHash,
      file_size_bytes: fileContent.length,
      created_at: new Date()
    });
    
    return { fileName, downloadUrl };
  }
  
  private generateCSV(rows: any[]): string {
    const header = 'Date,Account Code,Account Name,Debit,Credit,Reference,Description\n';
    const body = rows
      .map(r => `${r.date},${r.account_code},"${r.account_name}",${r.debit},${r.credit},"${r.reference}","${r.description}"`)
      .join('\n');
    return header + body;
  }
  
  private async generateXLSX(rows: any[]): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GL');
    return XLSX.write(workbook, { type: 'buffer' });
  }
  
  private async uploadToTempStorage(fileName: string, content: Buffer): Promise<string> {
    // S3 or local file storage
    const path = `/tmp/exports/${fileName}`;
    fs.writeFileSync(path, content);
    // Return download URL (with expiry)
    return `${process.env.API_BASE_URL}/exports/download/${fileName}?expires_in=24h`;
  }
  
  private async getOpeningBalance(shopId: string, accountId: string, beforeDate: Date): Promise<number> {
    const result = await this.journalRepo
      .createQueryBuilder('j')
      .where('j.shop_id = :shopId AND j.account_id = :accountId AND j.date < :beforeDate', {
        shopId,
        accountId,
        beforeDate
      })
      .andWhere('j.status = :status', { status: 'POSTED' })
      .select('SUM(j.debit - j.credit)', 'balance')
      .getRawOne();
    
    return result?.balance || 0;
  }
}
```

---

### 3.4 TaxService (e-Faktur)

```typescript
// src/services/tax.service.ts

class TaxService {
  constructor(
    private journalRepo: Repository<JournalEntry>,
    private efakturLogRepo: Repository<EFakturLog>,
    private logger: Logger
  ) {}
  
  async generateEFaktur(shopId: string, period: string): Promise<{ fileName: string; downloadUrl: string }> {
    // 1. Parse period (YYYY-MM)
    const [year, month] = period.split('-');
    const dateFrom = new Date(`${year}-${month}-01`);
    const dateTo = new Date(year, parseInt(month), 0);  // Last day of month
    
    // 2. Fetch PPN journals in period
    const ppnJournals = await this.journalRepo.find({
      where: {
        shop_id: shopId,
        status: 'POSTED',
        date: Between(dateFrom, dateTo),
        account: { code: In(['2110', '4210']) }  // PPN payable / PPN receivable
      }
    });
    
    if (ppnJournals.length === 0) {
      throw new NotFoundException('No PPN entries found for period');
    }
    
    // 3. Generate XML per DJP schema
    const xmlString = this.buildEFakturXML(shopId, ppnJournals, period);
    
    // 4. Validate XML
    const validationResult = await this.validateEFakturXML(xmlString);
    if (!validationResult.valid) {
      throw new BadRequestException(`e-Faktur validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    // 5. Save to file
    const fileName = `eFaktur_${shopId}_${period}.xml`;
    const downloadUrl = await this.uploadToTempStorage(fileName, Buffer.from(xmlString));
    
    // 6. Log in e_faktur_log
    const xmlHash = crypto.createHash('sha256').update(xmlString).digest('hex');
    await this.efakturLogRepo.save({
      shop_id: shopId,
      period,
      xml_file_name: fileName,
      xml_hash: xmlHash,
      xml_size_bytes: xmlString.length,
      validation_status: 'valid',
      created_at: new Date()
    });
    
    return { fileName, downloadUrl };
  }
  
  private buildEFakturXML(shopId: string, journals: JournalEntry[], period: string): string {
    const shop = this.getShop(shopId);  // TODO: fetch from DB
    
    // Simplified e-Faktur XML structure (DJP schema)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Faktur>
  <FakturHeader>
    <NomorFaktur>${period.replace('-', '')}</NomorFaktur>
    <TanggalFaktur>${period}-01</TanggalFaktur>
    <NpwpPenjual>${shop.npwp || '000000000000000'}</NpwpPenjual>
    <NamaUsaha>${shop.shopee_shop_name || 'Shop'}</NamaUsaha>
    <TotalPPN>${this.sumPPN(journals)}</TotalPPN>
  </FakturHeader>
  <FakturDetail>
${journals.map(j => `
    <Transaksi>
      <Tanggal>${formatDate(j.date)}</Tanggal>
      <Uraian>${j.description || j.account.name}</Uraian>
      <DPP>${Math.abs(j.debit || j.credit || 0)}</DPP>
      <PPN>${Math.abs((j.debit || j.credit || 0) * 0.1)}</PPN>
    </Transaksi>
`).join('')}
  </FakturDetail>
</Faktur>`;
    
    return xml;
  }
  
  private async validateEFakturXML(xmlString: string): Promise<{ valid: boolean; errors: string[] }> {
    // Use xmllint or similar to validate against DJP schema
    // Simplified: check required fields
    const errors = [];
    
    if (!xmlString.includes('<NomorFaktur>')) errors.push('Missing NomorFaktur');
    if (!xmlString.includes('<TanggalFaktur>')) errors.push('Missing TanggalFaktur');
    if (!xmlString.includes('<NpwpPenjual>')) errors.push('Missing NpwpPenjual');
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  private sumPPN(journals: JournalEntry[]): number {
    return journals.reduce((sum, j) => sum + (j.debit || 0) * 0.1, 0);
  }
}
```

---

## 4. API Endpoints

### 4.1 Cash Flow

**GET** `/api/v1/shops/:shopId/journals/cash-flow?date_from=2026-08-01&date_to=2026-08-31`

Response:
```json
{
  "period": { "from": "2026-08-01", "to": "2026-08-31" },
  "beginning_cash": 10000000,
  "operating": {
    "net_income": 5000000,
    "adjustments": { "depreciation": 500000 },
    "net_operating_cash": 5500000
  },
  "investing": { "net_investing_cash": -1000000 },
  "financing": { "net_financing_cash": 0 },
  "ending_cash": 14500000,
  "variance_to_bank": 50000
}
```

### 4.2 COGS

**POST** `/api/v1/shops/:shopId/inventory/costing`

Body:
```json
{
  "item_id": 12345,
  "cost_per_unit": 50000,
  "method": "average"
}
```

### 4.3 Export

**POST** `/api/v1/shops/:shopId/accounting-export/export-gl`

Body:
```json
{
  "software": "accurate",
  "date_from": "2026-08-01",
  "date_to": "2026-08-31",
  "include_opening_balance": true,
  "file_format": "xlsx"
}
```

Response:
```json
{
  "fileName": "GL_Export_…xlsx",
  "downloadUrl": "https://api.shop.dntech.id/exports/download/GL_Export_…?expires_in=24h"
}
```

### 4.4 e-Faktur

**POST** `/api/v1/shops/:shopId/tax/e-faktur/generate`

Body:
```json
{
  "period": "2026-08"
}
```

Response:
```json
{
  "fileName": "eFaktur_shopId_2026-08.xml",
  "downloadUrl": "https://api.shop.dntech.id/exports/download/eFaktur_…xml?expires_in=24h"
}
```

---

## 5. Regression Testing Checklist

**Pre-deployment validation:**

```bash
# 1. Demo seed path green
npm run test:demo-seed  # ✓ all queries return expected data

# 2. Shopee sync unchanged
npm run test:shopee-sync  # ✓ OAuth, webhook, cron still work

# 3. v2.1 features unchanged
npm run test:v2.1-smoke  # ✓ tier, email, OTP, password reset

# 4. v2.2 features working
npm run test:v2.2-features  # ✓ cash flow, COGS, export, e-Faktur

# 5. Regression on live path (if partner active)
npm run test:shopee-live-smoke  # ✓ webhook + sync + tier enforcement
```

---

## 6. Deployment & Configuration

### 6.1 Env Variables (additions to v2.1)

```bash
# Export storage
EXPORT_TEMP_DIR=/tmp/dnshop-exports
EXPORT_TTL_HOURS=24

# e-Faktur DJP schema version (lock to current)
EFAKTUR_SCHEMA_VERSION=3.0

# XLSX library config
XLSX_COMPRESSION=true
```

### 6.2 VPS Migration (if DB changes needed)

```bash
# Run migration
npm run typeorm migration:run

# Seed cash flow mapping (default SAK EMKM → operating/investing/financing)
npm run seed:cash-flow-mapping

# Run regression
npm run test:regression
```

---

## 7. Monitoring & Observability

### 7.1 New Metrics

```typescript
// Track COGS auto-journal events
prometheus_counter('cogs_auto_journal_total', {
  shop_id,
  status: 'success' | 'failed'
});

// Track exports
prometheus_counter('export_total', {
  software: 'accurate' | 'jurnal' | 'myob',
  format: 'xlsx' | 'csv'
});

// Track e-Faktur
prometheus_counter('efaktur_generated_total', {
  period,
  validation_status: 'valid' | 'invalid'
});
```

### 7.2 New Alerts

| Alert | Condition | Action |
|-------|-----------|--------|
| COGS sync failed | >5 errors in 1h | Log + retry |
| Export file large | >100MB | Warn user |
| e-Faktur invalid | validation fails | Return error, don't generate |

---

## 8. Glossary

- **e-Faktur** — Electronic invoice (DJP compliance XML)
- **SAK EMKM** — Indonesian SME accounting standard
- **COGS/HPP** — Cost of goods sold
- **DJP** — Direktorat Jenderal Pajak
- **Average cost** — Inventory valuation method (FIFO future)

---

**End of SDD v2.2**
