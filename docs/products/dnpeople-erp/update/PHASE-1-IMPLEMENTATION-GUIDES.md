# Phase 1 Implementation Guides
## Custom Reporting, Workflow Automation, Integration Marketplace

**Status:** ✅ Implemented (5 July 2026) · Phase 2–4 also complete (7 Jul 2026) — reference doc  
**Audience:** Backend & Frontend engineers  
**Timeline:** 4 weeks (completed)  
**Live status:** [`CEO-TRACKING-SHEET.md`](CEO-TRACKING-SHEET.md) · commits `af202eb`, `5d10ce3`

---

## 1. CUSTOM REPORT BUILDER

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend: Report Builder                │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┬─────────────────┬──────────────────┐   │
│ │ Column Picker│ Filter Builder  │ Group/Sort Panel  │   │
│ └──────────────┴─────────────────┴──────────────────┘   │
│ ┌──────────────────────────────────────────────────────┐ │
│ │                   Live Preview                        │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
         POST /reporting/custom-reports
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 Backend: Report Service                  │
├─────────────────────────────────────────────────────────┤
│ QueryBuilder: ReportDefinition → SQL WHERE/GROUP BY     │
│                                                          │
│ ReportDefinition                                         │
│  ├─ name, description                                    │
│  ├─ dataSource (module: "finance", table: "invoices")   │
│  ├─ columns: [{field: "id", label: "Invoice #", ...}]  │
│  ├─ filters: [{field, operator, value}]                │
│  ├─ groupBy: ["date", "status"]                         │
│  ├─ aggregates: [{field, func: "SUM"/"AVG"/"COUNT"}]   │
│  ├─ sortBy: [{field, direction: "ASC"}]                │
│  ├─ limit: 1000                                          │
│  └─ createdBy, tenantId                                 │
│                                                          │
│ QueryBuilder.execute() → SQL:                           │
│  SELECT id, date, status, SUM(amount) as total         │
│  FROM invoices                                          │
│  WHERE tenantId = ? AND status = ?                      │
│  GROUP BY date, status                                  │
│  ORDER BY date DESC LIMIT 1000                          │
└─────────────────────────────────────────────────────────┘
```

### Database Schema

```typescript
// Report definition (stored template)
@Entity('report_definitions')
export class ReportDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string; // "Monthly Revenue by Product"

  @Column('text', { nullable: true })
  description: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  createdBy: string;

  // Data source
  @Column('varchar')
  dataSourceModule: string; // "finance", "sales", "hr"

  @Column('varchar')
  dataSourceTable: string; // "invoices", "sales_orders"

  // Column selection
  @Column('jsonb')
  columns: Array<{
    field: string;        // "id", "amount", "customer_name"
    label: string;        // "Invoice ID", "Amount", "Customer"
    dataType: 'string' | 'number' | 'date' | 'boolean';
    format?: string;      // "$0,000.00", "YYYY-MM-DD"
    width?: number;       // column width in pixels
  }>;

  // Filtering
  @Column('jsonb', { default: [] })
  filters: Array<{
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between' | 'contains' | 'startsWith';
    value: any;
    connective?: 'AND' | 'OR';
  }>;

  // Grouping & Aggregation
  @Column('varchar', { array: true, default: [] })
  groupBy: string[]; // ["date", "status"]

  @Column('jsonb', { default: [] })
  aggregates: Array<{
    field: string;
    function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'COUNT_DISTINCT';
    alias: string; // "total_amount", "avg_price"
  }>;

  // Sorting
  @Column('jsonb', { default: [] })
  sortBy: Array<{
    field: string;
    direction: 'ASC' | 'DESC';
  }>;

  // Pagination
  @Column('integer', { default: 1000 })
  limit: number;

  // Display options
  @Column('jsonb')
  displayOptions: {
    showTotals: boolean;  // Show SUM row at bottom
    showPageNumbers: boolean;
    pageSize: number;     // For pagination
    freezeColumns?: string[]; // ["invoice_id"] — freeze first col
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('varchar', { enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' })
  status: string;

  @Column('uuid', { nullable: true })
  publishedBy?: string;

  @Column('timestamp', { nullable: true })
  publishedAt?: Date;
}

// Report execution history (audit trail)
@Entity('report_executions')
export class ReportExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reportId: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  executedBy: string;

  @Column('jsonb')
  filters: any; // runtime filter values (user can override)

  @Column('integer')
  rowCount: number;

  @Column('integer')
  executionTimeMs: number;

  @CreateDateColumn()
  executedAt: Date;
}

// Saved report (user's custom view of a definition)
@Entity('saved_reports')
export class SavedReport extends BaseEntity {
  @Column('uuid')
  reportDefinitionId: string;

  @Column('uuid')
  tenantId: string;

  @Column('varchar', { length: 255 })
  name: string; // User's saved view name

  @Column('jsonb')
  runtimeFilters: any; // User-overridden filters for this view

  @Column('uuid')
  createdBy: string;

  @UpdateDateColumn()
  lastAccessedAt: Date;
}
```

### Backend Implementation

```typescript
// src/modules/reporting/services/query-builder.service.ts

import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder, Repository } from 'typeorm';
import { ReportDefinition } from '../entities/report-definition.entity';
import { InvoiceAr } from '../../finance/entities/invoice-ar.entity';
import { SalesOrder } from '../../sales/entities/sales-order.entity';
import { PayrollRun } from '../../hr/entities/payroll-run.entity';

@Injectable()
export class QueryBuilderService {
  constructor(
    private invoiceRepository: Repository<InvoiceAr>,
    private salesOrderRepository: Repository<SalesOrder>,
    private payrollRepository: Repository<PayrollRun>,
  ) {}

  async buildAndExecute(
    tenantId: string,
    reportDef: ReportDefinition,
    runtimeFilters?: any,
  ): Promise<{ rows: any[]; count: number; executionMs: number }> {
    const startTime = Date.now();

    // Get appropriate repository based on dataSourceTable
    let query = this.getRepository(reportDef.dataSourceTable)
      .createQueryBuilder('t')
      .select('*') // Will be refined below
      .where('t.tenantId = :tenantId', { tenantId });

    // Step 1: SELECT columns
    const selectFields = reportDef.columns.map(col => `t.${col.field} as "${col.label}"`);
    query = this.getRepository(reportDef.dataSourceTable)
      .createQueryBuilder('t')
      .select(selectFields)
      .where('t.tenantId = :tenantId', { tenantId });

    // Step 2: WHERE filters
    const filters = runtimeFilters || reportDef.filters;
    query = this.applyFilters(query, filters);

    // Step 3: GROUP BY
    if (reportDef.groupBy.length > 0) {
      const groupFields = reportDef.groupBy.map(f => `t.${f}`);
      query = query.groupBy(groupFields.join(', '));

      // Add aggregations to SELECT
      reportDef.aggregates.forEach(agg => {
        const aggFunc = agg.function === 'COUNT' ? 'COUNT(*)' : `${agg.function}(t.${agg.field})`;
        query = query.addSelect(aggFunc, agg.alias);
      });
    }

    // Step 4: ORDER BY
    reportDef.sortBy.forEach(sort => {
      query = query.orderBy(`t.${sort.field}`, sort.direction);
    });

    // Step 5: LIMIT
    query = query.limit(reportDef.limit);

    // Execute
    const rows = await query.getRawMany();
    const executionMs = Date.now() - startTime;

    return {
      rows,
      count: rows.length,
      executionMs,
    };
  }

  private applyFilters(query: SelectQueryBuilder<any>, filters: any[]): SelectQueryBuilder<any> {
    let whereConnective = 'AND';
    let paramCount = 0;

    filters.forEach((filter, idx) => {
      if (filter.connective) whereConnective = filter.connective;

      const paramName = `param_${paramCount++}`;
      let condition = '';

      switch (filter.operator) {
        case 'eq':
          condition = `t.${filter.field} = :${paramName}`;
          break;
        case 'ne':
          condition = `t.${filter.field} != :${paramName}`;
          break;
        case 'gt':
          condition = `t.${filter.field} > :${paramName}`;
          break;
        case 'contains':
          condition = `t.${filter.field} ILIKE :${paramName}`;
          filter.value = `%${filter.value}%`;
          break;
        case 'between':
          condition = `t.${filter.field} BETWEEN :${paramName}_from AND :${paramName}_to`;
          query = query.setParameter(`${paramName}_from`, filter.value[0]);
          query = query.setParameter(`${paramName}_to`, filter.value[1]);
          return;
        // ... more operators
      }

      if (idx === 0) {
        query = query.andWhere(condition, { [paramName]: filter.value });
      } else {
        query = whereConnective === 'AND'
          ? query.andWhere(condition, { [paramName]: filter.value })
          : query.orWhere(condition, { [paramName]: filter.value });
      }
    });

    return query;
  }

  private getRepository(dataSourceTable: string): Repository<any> {
    const repos = {
      'invoices': this.invoiceRepository,
      'sales_orders': this.salesOrderRepository,
      'payroll_runs': this.payrollRepository,
      // ... more mappings
    };
    return repos[dataSourceTable];
  }
}

// src/modules/reporting/controllers/report-builder.controller.ts

@Controller('reporting/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportBuilderController {
  constructor(
    private queryBuilder: QueryBuilderService,
    private reportDefRepo: Repository<ReportDefinition>,
    private reportExecRepo: Repository<ReportExecution>,
  ) {}

  @Post('custom')
  @Roles('finance_manager', 'cfo', 'coo')
  async createCustomReport(
    @CurrentUser() user: User,
    @Body() dto: CreateReportDto,
  ) {
    const reportDef = this.reportDefRepo.create({
      ...dto,
      tenantId: user.tenantId,
      createdBy: user.id,
      status: 'DRAFT',
    });
    return this.reportDefRepo.save(reportDef);
  }

  @Post(':id/execute')
  async executeReport(
    @CurrentUser() user: User,
    @Param('id') reportId: string,
    @Body() runtimeFilters?: any,
  ) {
    const reportDef = await this.reportDefRepo.findOne({
      where: { id: reportId, tenantId: user.tenantId },
    });

    const startTime = Date.now();
    const { rows, count, executionMs } = await this.queryBuilder.buildAndExecute(
      user.tenantId,
      reportDef,
      runtimeFilters,
    );

    // Log execution
    await this.reportExecRepo.save({
      reportId,
      tenantId: user.tenantId,
      executedBy: user.id,
      filters: runtimeFilters || reportDef.filters,
      rowCount: count,
      executionTimeMs: executionMs,
    });

    return { rows, count, executionMs };
  }

  @Get(':id/preview')
  async previewReport(
    @CurrentUser() user: User,
    @Param('id') reportId: string,
    @Query('limit') limit = 20,
  ) {
    const reportDef = await this.reportDefRepo.findOne({ where: { id: reportId } });
    const { rows } = await this.queryBuilder.buildAndExecute(
      user.tenantId,
      { ...reportDef, limit },
    );
    return rows;
  }

  @Get('definitions')
  async listReportDefinitions(@CurrentUser() user: User) {
    return this.reportDefRepo.find({
      where: { tenantId: user.tenantId, status: 'PUBLISHED' },
      order: { createdAt: 'DESC' },
    });
  }

  @Post(':id/export/pdf')
  async exportPdf(
    @CurrentUser() user: User,
    @Param('id') reportId: string,
  ) {
    const reportDef = await this.reportDefRepo.findOne({ where: { id: reportId } });
    const { rows } = await this.queryBuilder.buildAndExecute(user.tenantId, reportDef);

    // Use pdfkit or similar
    const doc = new PDFDocument();
    doc.fontSize(14).text(reportDef.name, 100, 100);
    
    // Add table
    const table = new PdfTable(doc, { x: 50, y: 150 });
    reportDef.columns.forEach(col => table.addColumn(col.label, 100));
    rows.forEach(row => {
      reportDef.columns.forEach(col => table.addRow(row[col.label]));
    });

    const buffer = await doc.getBuffer();
    return { data: buffer, filename: `${reportDef.name}.pdf` };
  }

  @Post(':id/export/excel')
  async exportExcel(
    @CurrentUser() user: User,
    @Param('id') reportId: string,
  ) {
    const reportDef = await this.reportDefRepo.findOne({ where: { id: reportId } });
    const { rows } = await this.queryBuilder.buildAndExecute(user.tenantId, reportDef);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportDef.name);

    // Add header
    const headers = reportDef.columns.map(col => col.label);
    worksheet.addRow(headers);

    // Add data rows
    rows.forEach(row => {
      const rowData = reportDef.columns.map(col => row[col.label]);
      worksheet.addRow(rowData);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return { data: buffer, filename: `${reportDef.name}.xlsx` };
  }
}
```

### Frontend Implementation (React)

```typescript
// src/pages/ReportBuilder.tsx

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

interface Column {
  field: string;
  label: string;
  dataType: 'string' | 'number' | 'date';
}

interface Filter {
  field: string;
  operator: string;
  value: any;
}

export const ReportBuilder: React.FC = () => {
  const [dataSource, setDataSource] = useState('invoices');
  const [columns, setColumns] = useState<Column[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState([]);
  const [previewData, setPreviewData] = useState([]);

  const availableFields = {
    invoices: [
      { field: 'id', label: 'Invoice ID', dataType: 'string' },
      { field: 'amount', label: 'Amount', dataType: 'number' },
      { field: 'status', label: 'Status', dataType: 'string' },
      { field: 'createdAt', label: 'Date', dataType: 'date' },
      { field: 'customerId', label: 'Customer', dataType: 'string' },
    ],
    sales_orders: [
      { field: 'id', label: 'Order ID', dataType: 'string' },
      { field: 'total', label: 'Total', dataType: 'number' },
      { field: 'status', label: 'Status', dataType: 'string' },
    ],
  };

  const handleAddColumn = (field: string) => {
    const fieldDef = availableFields[dataSource].find(f => f.field === field);
    setColumns([...columns, fieldDef]);
  };

  const handleAddFilter = () => {
    setFilters([...filters, { field: '', operator: 'eq', value: '' }]);
  };

  const handlePreview = async () => {
    const reportDef = {
      dataSourceModule: 'finance', // hardcoded for now
      dataSourceTable: dataSource,
      columns,
      filters,
      groupBy,
      sortBy,
      displayOptions: { showTotals: true },
    };

    const response = await axios.post('/api/reporting/reports/execute', reportDef);
    setPreviewData(response.data.rows);
  };

  const handleSaveReport = async (name: string) => {
    const reportDef = {
      name,
      dataSourceModule: 'finance',
      dataSourceTable: dataSource,
      columns,
      filters,
      groupBy,
      sortBy,
      status: 'DRAFT',
    };

    await axios.post('/api/reporting/reports/custom', reportDef);
    alert('Report saved!');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr' }}>
      {/* Left Panel: Column Selector */}
      <div style={{ borderRight: '1px solid #ccc', padding: '20px' }}>
        <h3>Available Fields</h3>
        {availableFields[dataSource]?.map(field => (
          <button
            key={field.field}
            onClick={() => handleAddColumn(field.field)}
            style={{ display: 'block', marginBottom: '10px', width: '100%' }}
          >
            + {field.label}
          </button>
        ))}

        <h3 style={{ marginTop: '30px' }}>Filters</h3>
        {filters.map((filter, idx) => (
          <FilterRow
            key={idx}
            filter={filter}
            onChange={(f) => {
              const newFilters = [...filters];
              newFilters[idx] = f;
              setFilters(newFilters);
            }}
            onDelete={() => setFilters(filters.filter((_, i) => i !== idx))}
          />
        ))}
        <button onClick={handleAddFilter}>+ Add Filter</button>

        <h3 style={{ marginTop: '30px' }}>Group By</h3>
        <MultiSelect
          options={availableFields[dataSource]}
          selected={groupBy}
          onChange={setGroupBy}
        />

        <button onClick={handlePreview} style={{ marginTop: '20px', width: '100%' }}>
          Preview
        </button>
        <button onClick={() => handleSaveReport('My Report')} style={{ marginTop: '10px', width: '100%' }}>
          Save Report
        </button>
      </div>

      {/* Right Panel: Preview */}
      <div style={{ padding: '20px' }}>
        <h2>Preview</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              {columns.map(col => (
                <th key={col.field} style={{ textAlign: 'left', padding: '10px' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                {columns.map(col => (
                  <td key={col.field} style={{ padding: '10px' }}>
                    {row[col.label]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

---

## 2. WORKFLOW AUTOMATION ENGINE

### Workflow Definition Schema

```typescript
// src/modules/workflow/entities/workflow-definition.entity.ts

@Entity('workflow_definitions')
export class WorkflowDefinition extends BaseEntity {
  @Column('varchar')
  name: string; // "PO Approval"

  @Column('varchar')
  trigger: string; // "procurement.po.submitted"

  @Column('jsonb')
  states: WorkflowState[]; // SUBMITTED, MANAGER_REVIEW, CFO_REVIEW, APPROVED

  @Column('jsonb')
  transitions: WorkflowTransition[]; // SUBMITTED → MANAGER_REVIEW (if amount < 10M)

  @Column('jsonb')
  actions: WorkflowAction[]; // on APPROVED: send email, GL posting

  @Column('int')
  version: number;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  createdBy: string;
}

interface WorkflowState {
  id: string; // "state_1"
  name: string; // "Manager Review"
  type: 'pending_approval' | 'auto_action' | 'branch' | 'end';
  approvers?: string[]; // userIds or roles
  parallelApprovals?: boolean; // all must approve vs any one
  dueDate?: number; // days from creation
}

interface WorkflowTransition {
  from: string; // state_1
  to: string; // state_2
  condition?: any; // { field: 'amount', operator: 'gt', value: 10000000 }
  label: string; // "Amount > 10M"
}

interface WorkflowAction {
  trigger: 'on_enter' | 'on_exit'; // on state enter/exit
  state: string;
  type: 'email' | 'gl_posting' | 'webhook' | 'update_status';
  config: any; // email template, GL accounts, webhook URL
}

// src/modules/workflow/entities/workflow-instance.entity.ts

@Entity('workflow_instances')
export class WorkflowInstance extends BaseEntity {
  @Column('uuid')
  workflowDefinitionId: string;

  @Column('uuid')
  documentId: string; // PO ID, Invoice ID, etc.

  @Column('varchar')
  documentType: string; // 'po', 'invoice', 'leave_request'

  @Column('varchar')
  currentState: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  initiatedBy: string;

  @Column('jsonb')
  approvals: WorkflowApproval[];

  @Column('jsonb')
  history: WorkflowHistoryEntry[];

  @Column('timestamp', { nullable: true })
  dueDate: Date;

  @Column('varchar', { enum: ['active', 'completed', 'rejected'] })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}

interface WorkflowApproval {
  id: string;
  state: string;
  assignedTo: string[];
  approved: Map<string, { userId: string; timestamp: Date; comment?: string }>;
  rejected: { userId: string; timestamp: Date; reason: string } | null;
}

interface WorkflowHistoryEntry {
  timestamp: Date;
  fromState: string;
  toState: string;
  transitionedBy: string;
  reason?: string;
}
```

### Workflow Engine Service

```typescript
// src/modules/workflow/services/workflow-engine.service.ts

@Injectable()
export class WorkflowEngineService {
  constructor(
    private workflowDefRepo: Repository<WorkflowDefinition>,
    private instanceRepo: Repository<WorkflowInstance>,
    private notificationService: NotificationService,
    private eventBus: EventBusService,
  ) {}

  async initiate(
    workflowName: string,
    documentId: string,
    documentType: string,
    tenantId: string,
    initiatedBy: string,
  ): Promise<WorkflowInstance> {
    const workflowDef = await this.workflowDefRepo.findOne({
      where: { name: workflowName, tenantId },
    });

    const instance = this.instanceRepo.create({
      workflowDefinitionId: workflowDef.id,
      documentId,
      documentType,
      currentState: workflowDef.states[0].id,
      tenantId,
      initiatedBy,
      approvals: [],
      history: [],
      status: 'active',
    });

    await this.instanceRepo.save(instance);

    // Trigger onEnter actions for initial state
    await this.executeActions(workflowDef, workflowDef.states[0].id, 'on_enter', instance);

    // Notify approvers
    await this.notifyApprovers(workflowDef, workflowDef.states[0], instance);

    return instance;
  }

  async approve(
    instanceId: string,
    userId: string,
    comment?: string,
  ): Promise<WorkflowInstance> {
    const instance = await this.instanceRepo.findOne(instanceId);
    const workflowDef = await this.workflowDefRepo.findOne(instance.workflowDefinitionId);
    const currentState = workflowDef.states.find(s => s.id === instance.currentState);

    // Record approval
    const approval = instance.approvals.find(a => a.state === currentState.id);
    if (!approval.approved[userId]) {
      approval.approved[userId] = {
        userId,
        timestamp: new Date(),
        comment,
      };
    }

    // Check if all approvals received
    const allApproved = currentState.parallelApprovals
      ? approval.assignedTo.every(a => approval.approved[a])
      : Object.keys(approval.approved).length > 0; // any one

    if (!allApproved) {
      // Still waiting for more approvals
      await this.instanceRepo.save(instance);
      return instance;
    }

    // All approvals received, move to next state
    const transition = workflowDef.transitions.find(
      t => t.from === currentState.id && this.evaluateCondition(t.condition, instance),
    );

    if (!transition) {
      // No matching transition, stay in current state
      return instance;
    }

    // Exit actions for current state
    await this.executeActions(workflowDef, currentState.id, 'on_exit', instance);

    // Move to next state
    const nextState = workflowDef.states.find(s => s.id === transition.to);
    instance.currentState = nextState.id;
    instance.history.push({
      timestamp: new Date(),
      fromState: currentState.id,
      toState: nextState.id,
      transitionedBy: userId,
    });

    // Enter actions for new state
    await this.executeActions(workflowDef, nextState.id, 'on_enter', instance);

    // Notify new approvers
    await this.notifyApprovers(workflowDef, nextState, instance);

    if (nextState.type === 'end') {
      instance.status = 'completed';
    }

    return this.instanceRepo.save(instance);
  }

  async reject(
    instanceId: string,
    userId: string,
    reason: string,
  ): Promise<WorkflowInstance> {
    const instance = await this.instanceRepo.findOne(instanceId);
    const workflowDef = await this.workflowDefRepo.findOne(instance.workflowDefinitionId);

    // Find rejection transition (usually goes back to initial state)
    const rejectTransition = workflowDef.transitions.find(
      t => t.label?.includes('Reject'),
    );

    if (!rejectTransition) {
      throw new Error('No rejection transition defined');
    }

    instance.currentState = rejectTransition.to;
    instance.status = 'rejected';
    instance.history.push({
      timestamp: new Date(),
      fromState: rejectTransition.from,
      toState: rejectTransition.to,
      transitionedBy: userId,
    });

    await this.instanceRepo.save(instance);

    // Notify initiator
    await this.notificationService.send(instance.initiatedBy, {
      type: 'workflow_rejected',
      documentType: instance.documentType,
      documentId: instance.documentId,
      reason,
    });

    return instance;
  }

  private async executeActions(
    workflowDef: WorkflowDefinition,
    stateId: string,
    trigger: 'on_enter' | 'on_exit',
    instance: WorkflowInstance,
  ) {
    const actions = workflowDef.actions.filter(
      a => a.state === stateId && a.trigger === trigger,
    );

    for (const action of actions) {
      switch (action.type) {
        case 'email':
          await this.notificationService.sendEmail(action.config);
          break;
        case 'gl_posting':
          await this.postToGL(instance, action.config);
          break;
        case 'webhook':
          await this.triggerWebhook(instance, action.config);
          break;
        case 'update_status':
          await this.updateDocumentStatus(instance, action.config);
          break;
      }
    }
  }

  private evaluateCondition(condition: any, instance: WorkflowInstance): boolean {
    if (!condition) return true;

    const documentData = instance; // In real impl, fetch document
    const { field, operator, value } = condition;

    switch (operator) {
      case 'gt': return documentData[field] > value;
      case 'lt': return documentData[field] < value;
      case 'eq': return documentData[field] === value;
      default: return true;
    }
  }

  private async notifyApprovers(
    workflowDef: WorkflowDefinition,
    state: WorkflowState,
    instance: WorkflowInstance,
  ) {
    const approval: WorkflowApproval = {
      id: generateId(),
      state: state.id,
      assignedTo: state.approvers,
      approved: {},
      rejected: null,
    };

    instance.approvals.push(approval);
    await this.instanceRepo.save(instance);

    for (const approverId of state.approvers) {
      await this.notificationService.send(approverId, {
        type: 'approval_required',
        documentId: instance.documentId,
        instanceId: instance.id,
        stateName: state.name,
      });
    }
  }
}
```

### Approval Inbox UI

```typescript
// src/pages/ApprovalInbox.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface PendingApproval {
  instanceId: string;
  documentId: string;
  documentType: string;
  stateName: string;
  submittedBy: string;
  submittedAt: Date;
  dueDate: Date;
  isOverdue: boolean;
}

export const ApprovalInbox: React.FC = () => {
  const [pending, setPending] = useState<PendingApproval[]>([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const response = await axios.get('/api/workflow/inbox/pending');
    setPending(response.data);
  };

  const handleApprove = async (instanceId: string) => {
    await axios.post(`/api/workflow/instances/${instanceId}/approve`, {
      comment,
    });
    setComment('');
    await fetchPending();
  };

  const handleReject = async (instanceId: string) => {
    await axios.post(`/api/workflow/instances/${instanceId}/reject`, {
      reason: comment,
    });
    setComment('');
    await fetchPending();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr' }}>
      {/* List */}
      <div style={{ borderRight: '1px solid #ccc', padding: '20px' }}>
        <h3>Pending Approvals ({pending.filter(p => !p.isOverdue).length})</h3>
        {pending
          .filter(p => !p.isOverdue)
          .map(approval => (
            <div
              key={approval.instanceId}
              onClick={() => setSelectedApproval(approval)}
              style={{
                padding: '10px',
                margin: '10px 0',
                border: '1px solid #ddd',
                cursor: 'pointer',
                backgroundColor: selectedApproval?.instanceId === approval.instanceId ? '#f0f0f0' : '#fff',
              }}
            >
              <div><strong>{approval.documentType.toUpperCase()}</strong> #{approval.documentId}</div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                {approval.stateName}
              </div>
              <div style={{ fontSize: '0.85em', color: '#999' }}>
                Due: {new Date(approval.dueDate).toLocaleDateString()}
              </div>
            </div>
          ))}

        <h3 style={{ marginTop: '30px' }}>Overdue ({pending.filter(p => p.isOverdue).length})</h3>
        {pending
          .filter(p => p.isOverdue)
          .map(approval => (
            <div
              key={approval.instanceId}
              onClick={() => setSelectedApproval(approval)}
              style={{
                padding: '10px',
                margin: '10px 0',
                border: '2px solid #d9534f',
                backgroundColor: '#f8f1f1',
                cursor: 'pointer',
              }}
            >
              <div><strong>{approval.documentType.toUpperCase()}</strong> #{approval.documentId}</div>
              <div style={{ fontSize: '0.85em', color: '#d9534f', fontWeight: 'bold' }}>
                OVERDUE
              </div>
            </div>
          ))}
      </div>

      {/* Detail */}
      <div style={{ padding: '20px' }}>
        {selectedApproval ? (
          <>
            <h2>Approve {selectedApproval.documentType}</h2>
            <p><strong>Document:</strong> {selectedApproval.documentId}</p>
            <p><strong>Submitted by:</strong> {selectedApproval.submittedBy}</p>
            <p><strong>Submitted at:</strong> {new Date(selectedApproval.submittedAt).toLocaleString()}</p>

            <textarea
              placeholder="Add comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                marginTop: '20px',
                padding: '10px',
                border: '1px solid #ddd',
              }}
            />

            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => handleApprove(selectedApproval.instanceId)}
                style={{
                  padding: '10px 20px',
                  marginRight: '10px',
                  backgroundColor: '#5cb85c',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(selectedApproval.instanceId)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#d9534f',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Reject
              </button>
            </div>
          </>
        ) : (
          <p>Select an approval to review</p>
        )}
      </div>
    </div>
  );
};
```

---

## 3. INTEGRATION MARKETPLACE

### Integration Framework

```typescript
// src/modules/integration/entities/integration.entity.ts

@Entity('integrations')
export class Integration extends BaseEntity {
  @Column('uuid')
  tenantId: string;

  @Column('varchar')
  name: string; // "Stripe", "Slack", "Zapier"

  @Column('varchar')
  type: string; // Type identifier

  @Column('varchar', { enum: ['connected', 'disconnected', 'error'] })
  status: string;

  @Column('jsonb')
  credentials: {
    accessToken?: string; // encrypted
    refreshToken?: string; // encrypted
    apiKey?: string; // encrypted
    webhookSecret?: string; // encrypted
    additionalConfig?: any;
  };

  @Column('jsonb')
  config: {
    webhookUrl?: string;
    eventFilters?: string[];
    dataMapping?: { [key: string]: string };
    syncFrequency?: 'realtime' | 'hourly' | 'daily';
    [key: string]: any;
  };

  @Column('jsonb')
  lastSyncLog: {
    timestamp: Date;
    status: 'success' | 'error';
    recordsProcessed: number;
    errorMessage?: string;
  };

  @Column('uuid')
  createdBy: string;

  @CreateDateColumn()
  connectedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/modules/integration/services/integration-registry.service.ts

export interface IIntegration {
  getOAuthUrl(tenantId: string, redirectUri: string): string;
  handleOAuthCallback(code: string, tenantId: string): Promise<any>;
  authenticate(credentials: any, tenantId: string): Promise<boolean>;
  syncData(integration: Integration): Promise<SyncResult>;
  listEvents(): string[];
  testConnection(integration: Integration): Promise<boolean>;
}

@Injectable()
export class IntegrationRegistryService {
  private integrations: Map<string, IIntegration> = new Map();

  register(name: string, integration: IIntegration) {
    this.integrations.set(name, integration);
  }

  get(name: string): IIntegration {
    return this.integrations.get(name);
  }

  listAvailable(): string[] {
    return Array.from(this.integrations.keys());
  }
}

// src/modules/integration/integrations/stripe.integration.ts

@Injectable()
export class StripeIntegration implements IIntegration {
  constructor(
    private http: HttpService,
    private configService: ConfigService,
  ) {}

  getOAuthUrl(tenantId: string, redirectUri: string): string {
    const clientId = this.configService.get('STRIPE_CLIENT_ID');
    return `https://connect.stripe.com/oauth/authorize?client_id=${clientId}&state=${tenantId}`;
  }

  async handleOAuthCallback(code: string, tenantId: string): Promise<any> {
    const response = await this.http.post('https://connect.stripe.com/oauth/token', {
      client_secret: this.configService.get('STRIPE_SECRET_KEY'),
      code,
      grant_type: 'authorization_code',
    }).toPromise();

    return {
      accessToken: response.data.access_token,
      accountId: response.data.stripe_user_id,
    };
  }

  async syncData(integration: Integration): Promise<SyncResult> {
    const stripe = new Stripe(integration.credentials.accessToken);

    // Fetch recent payments
    const charges = await stripe.charges.list({ limit: 100 });

    const syncResult: SyncResult = {
      recordsProcessed: 0,
      errors: [],
    };

    for (const charge of charges.data) {
      // Map Stripe charge to AR Invoice Payment
      const mapping = integration.config.dataMapping;

      const paymentData = {
        stripeChargeId: charge.id,
        amount: charge.amount / 100, // convert cents to dollars
        currency: charge.currency,
        status: charge.status, // succeeded, failed, etc.
        metadata: charge.metadata,
      };

      try {
        // Post to GL or AR module
        await this.postToArPayment(integration.tenantId, paymentData);
        syncResult.recordsProcessed++;
      } catch (err) {
        syncResult.errors.push(err.message);
      }
    }

    return syncResult;
  }

  listEvents(): string[] {
    return ['charge.succeeded', 'charge.failed', 'charge.refunded'];
  }

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const stripe = new Stripe(integration.credentials.accessToken);
      await stripe.account.retrieve();
      return true;
    } catch {
      return false;
    }
  }

  private async postToArPayment(tenantId: string, paymentData: any) {
    // Call AR service to record payment
  }
}

// Register in app.module.ts
IntegrationRegistryService.register('stripe', new StripeIntegration(...));
```

### Integration Controller

```typescript
// src/modules/integration/controllers/integration.controller.ts

@Controller('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntegrationController {
  constructor(
    private integrationRepo: Repository<Integration>,
    private registry: IntegrationRegistryService,
    private eventBus: EventBusService,
  ) {}

  @Get('gallery')
  async listAvailable() {
    return this.registry.listAvailable().map(name => ({
      name,
      description: this.getDescription(name),
      icon: this.getIcon(name),
      events: this.registry.get(name).listEvents(),
    }));
  }

  @Get('oauth/:provider/url')
  async getOAuthUrl(
    @CurrentUser() user: User,
    @Param('provider') provider: string,
    @Query('redirectUri') redirectUri: string,
  ) {
    const integration = this.registry.get(provider);
    const oauthUrl = integration.getOAuthUrl(user.tenantId, redirectUri);
    return { oauthUrl };
  }

  @Post('oauth/:provider/callback')
  async handleOAuthCallback(
    @CurrentUser() user: User,
    @Param('provider') provider: string,
    @Body() { code }: { code: string },
  ) {
    const integration = this.registry.get(provider);
    const credentials = await integration.handleOAuthCallback(code, user.tenantId);

    const saved = this.integrationRepo.create({
      tenantId: user.tenantId,
      name: provider,
      type: provider,
      status: 'connected',
      credentials,
      createdBy: user.id,
    });

    return this.integrationRepo.save(saved);
  }

  @Post(':id/test')
  async testConnection(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const integration = await this.integrationRepo.findOne({
      where: { id, tenantId: user.tenantId },
    });

    const integrationImpl = this.registry.get(integration.name);
    const isConnected = await integrationImpl.testConnection(integration);

    if (isConnected) {
      integration.status = 'connected';
      integration.lastSyncLog = {
        timestamp: new Date(),
        status: 'success',
        recordsProcessed: 0,
      };
    } else {
      integration.status = 'error';
    }

    return this.integrationRepo.save(integration);
  }

  @Post(':id/sync')
  async manualSync(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const integration = await this.integrationRepo.findOne({
      where: { id, tenantId: user.tenantId },
    });

    const integrationImpl = this.registry.get(integration.name);

    try {
      const result = await integrationImpl.syncData(integration);

      integration.lastSyncLog = {
        timestamp: new Date(),
        status: 'success',
        recordsProcessed: result.recordsProcessed,
      };

      await this.integrationRepo.save(integration);

      return {
        status: 'success',
        recordsProcessed: result.recordsProcessed,
      };
    } catch (err) {
      integration.lastSyncLog = {
        timestamp: new Date(),
        status: 'error',
        recordsProcessed: 0,
        errorMessage: err.message,
      };

      await this.integrationRepo.save(integration);

      return {
        status: 'error',
        errorMessage: err.message,
      };
    }
  }

  @Get(':id')
  async getIntegration(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.integrationRepo.findOne({
      where: { id, tenantId: user.tenantId },
      select: [
        'id', 'name', 'type', 'status', 'config', 'lastSyncLog', 'connectedAt', 'updatedAt',
      ], // exclude credentials
    });
  }

  @Get()
  async listConnected(@CurrentUser() user: User) {
    return this.integrationRepo.find({
      where: { tenantId: user.tenantId },
      select: [
        'id', 'name', 'type', 'status', 'lastSyncLog', 'connectedAt',
      ],
    });
  }

  @Delete(':id')
  async disconnect(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    await this.integrationRepo.delete({
      id,
      tenantId: user.tenantId,
    });

    return { message: 'Integration disconnected' };
  }
}
```

### Integration UI (React)

```typescript
// src/pages/IntegrationMarketplace.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface IntegrationApp {
  name: string;
  description: string;
  icon: string;
  events: string[];
  connected?: boolean;
  lastSync?: string;
}

export const IntegrationMarketplace: React.FC = () => {
  const [apps, setApps] = useState<IntegrationApp[]>([]);
  const [connected, setConnected] = useState([]);

  useEffect(() => {
    fetchApps();
    fetchConnected();
  }, []);

  const fetchApps = async () => {
    const response = await axios.get('/api/integrations/gallery');
    setApps(response.data);
  };

  const fetchConnected = async () => {
    const response = await axios.get('/api/integrations');
    setConnected(response.data);
  };

  const handleConnect = async (provider: string) => {
    // Get OAuth URL
    const { data } = await axios.get(`/api/integrations/oauth/${provider}/url`, {
      params: { redirectUri: window.location.href },
    });

    // Redirect to OAuth provider
    window.location.href = data.oauthUrl;
  };

  const handleDisconnect = async (id: string) => {
    await axios.delete(`/api/integrations/${id}`);
    await fetchConnected();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Integration Marketplace</h1>

      <div style={{ marginBottom: '40px' }}>
        <h2>Connected Integrations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {connected.map(int => (
            <div
              key={int.id}
              style={{
                border: '1px solid #ddd',
                padding: '15px',
                borderRadius: '5px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <h3>{int.name}</h3>
              <p style={{ fontSize: '0.9em', color: '#666' }}>
                Connected {new Date(int.connectedAt).toLocaleDateString()}
              </p>
              {int.lastSyncLog && (
                <p style={{ fontSize: '0.85em', color: '#999' }}>
                  Last sync: {int.lastSyncLog.recordsProcessed} records
                </p>
              )}
              <button
                onClick={() => handleDisconnect(int.id)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#d9534f',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                Disconnect
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2>Available Integrations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {apps
            .filter(app => !connected.find(c => c.name === app.name))
            .map(app => (
              <div
                key={app.name}
                style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  borderRadius: '5px',
                  textAlign: 'center',
                }}
              >
                <img src={app.icon} alt={app.name} style={{ width: '60px', marginBottom: '10px' }} />
                <h3>{app.name}</h3>
                <p style={{ fontSize: '0.9em', color: '#666' }}>{app.description}</p>
                <p style={{ fontSize: '0.85em', color: '#999' }}>
                  Events: {app.events.length}
                </p>
                <button
                  onClick={() => handleConnect(app.name)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#5cb85c',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '10px',
                  }}
                >
                  Connect
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
```

---

## Next Steps for Engineering

1. **Create feature branches:**
   ```bash
   git checkout -b feature/custom-reporting
   git checkout -b feature/workflow-automation
   git checkout -b feature/integration-marketplace
   ```

2. **Database migrations:** Create migrations for new entities (ReportDefinition, WorkflowDefinition, WorkflowInstance, Integration)

3. **Start with backend:** Implement services first, then controllers, then wire up frontend

4. **Testing:** Add unit tests for QueryBuilder, WorkflowEngine, IntegrationRegistry

5. **Timeline tracking:** Update CEO-TRACKING-SHEET.md weekly with progress

---

**Document Owner:** Engineering Lead  
**Last Updated:** 5 July 2026  
**Questions?** Tag `@dozer` in Slack
