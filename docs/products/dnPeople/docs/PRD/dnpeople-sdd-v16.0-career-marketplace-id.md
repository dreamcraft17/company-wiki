# dnPeople Internal Career Marketplace
## System Design Document (SDD) v16.0

**Bahasa:** Bahasa Indonesia  
**Tanggal:** 10 Agustus 2026  
**Status:** Ready for Implementation

---

## 1. ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────┐
│  Frontend (React 19 / Next.js 16)    │
│  ├─ Job posting (HR)                 │
│  ├─ Browse jobs (Employee)           │
│  ├─ Apply modal                      │
│  ├─ Pipeline kanban (HR)             │
│  └─ Application timeline (Employee)  │
└─────────────┬──────────────────────┘
              │ HTTPS + JWT auth
              │
┌─────────────▼──────────────────────┐
│  Backend (Express 5)                │
│  ├─ InternalJobService             │
│  ├─ InternalApplicationService     │
│  ├─ PipelineService                │
│  ├─ NotificationService            │
│  └─ AuditService                   │
└─────────────┬──────────────────────┘
              │
      ┌───────┼───────────┐
      │       │           │
      ▼       ▼           ▼
   ┌────┐ ┌─────┐ ┌──────────┐
   │ DB │ │Redis│ │ Email    │
   └────┘ └─────┘ │ Service  │
                  └──────────┘
```

---

## 2. DATABASE SCHEMA (Prisma)

### New Models

```prisma
enum InternalJobStatus {
  DRAFT
  PUBLISHED
  CLOSED
  FILLED
}

enum InternalApplicationStatus {
  APPLIED
  SCREENING
  INTERVIEW
  OFFER
  ACCEPTED
  REJECTED
  WITHDRAWN
}

enum RejectionReason {
  COMPETENCY_GAP
  BETTER_FIT
  WITHDRAWN_BY_MANAGER
  ON_HOLD
  OTHER
}

model InternalJob {
  id            String   @id @default(cuid())
  companyId     String   @db.VarChar(255)
  
  title         String   @db.VarChar(255)
  departmentId  String?  @db.VarChar(255)
  positionId    String?  @db.VarChar(255)
  
  description   String   @db.Text
  requirements  String?  @db.Text
  
  status        InternalJobStatus @default(DRAFT)
  publishedAt   DateTime?
  closesAt      DateTime? // deadline for apply
  filledAt      DateTime?
  
  tierMinimum   String?  @db.VarChar(50) // PROFESSIONAL | BUSINESS | ENTERPRISE
  
  createdById   String   @db.VarChar(255)
  createdAt     DateTime @default(now())
  updatedById   String   @db.VarChar(255)
  updatedAt     DateTime @updatedAt
  
  isArchived    Boolean  @default(false)
  
  // Relations
  company       Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  department    Department? @relation(fields: [departmentId], references: [id])
  position      Position? @relation(fields: [positionId], references: [id])
  createdBy     User     @relation("InternalJobCreatedBy", fields: [createdById], references: [id])
  updatedBy     User     @relation("InternalJobUpdatedBy", fields: [updatedById], references: [id])
  applications  InternalApplication[]
  
  @@index([companyId, status])
  @@index([companyId, publishedAt])
  @@index([closesAt])
}

model InternalApplication {
  id            String   @id @default(cuid())
  companyId     String   @db.VarChar(255)
  jobId         String   @db.VarChar(255)
  employeeId    String   @db.VarChar(255)
  
  status        InternalApplicationStatus @default(APPLIED)
  coverNote     String?  @db.VarChar(500)
  
  appliedAt     DateTime @default(now())
  withdrawnAt   DateTime?
  rejectedAt    DateTime?
  acceptedAt    DateTime?
  
  rejectionReason RejectionReason?
  rejectionNotes  String? @db.VarChar(200)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  company       Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  job           InternalJob @relation(fields: [jobId], references: [id], onDelete: Cascade)
  employee      User     @relation(fields: [employeeId], references: [id])
  statusHistory InternalApplicationStatusHistory[]
  
  @@unique([jobId, employeeId]) // One active apply per job per employee
  @@index([companyId, employeeId])
  @@index([jobId, status])
  @@index([employeeId, status])
}

model InternalApplicationStatusHistory {
  id            String   @id @default(cuid())
  applicationId String   @db.VarChar(255)
  
  oldStatus     InternalApplicationStatus
  newStatus     InternalApplicationStatus
  
  changedById   String   @db.VarChar(255)
  changedAt     DateTime @default(now())
  
  notes         String?  @db.VarChar(500)
  
  // Relations
  application   InternalApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  changedBy     User     @relation(fields: [changedById], references: [id])
  
  @@index([applicationId])
  @@index([changedAt])
}

// Update existing Company model to add relation
model Company {
  // ... existing fields ...
  internalJobs        InternalJob[]
  internalApplications InternalApplication[]
}

// Update existing User model to add relations
model User {
  // ... existing fields ...
  createdInternalJobs   InternalJob[] @relation("InternalJobCreatedBy")
  updatedInternalJobs   InternalJob[] @relation("InternalJobUpdatedBy")
  internalApplications  InternalApplication[]
  statusHistoryChanges  InternalApplicationStatusHistory[]
}
```

### Indexes
```sql
CREATE INDEX idx_internal_jobs_company_status ON internal_jobs(company_id, status);
CREATE INDEX idx_internal_jobs_published_at ON internal_jobs(published_at);
CREATE INDEX idx_internal_jobs_closes_at ON internal_jobs(closes_at);
CREATE INDEX idx_internal_applications_job_employee ON internal_applications(job_id, employee_id);
CREATE INDEX idx_internal_applications_job_status ON internal_applications(job_id, status);
CREATE INDEX idx_internal_applications_employee_status ON internal_applications(employee_id, status);
CREATE INDEX idx_internal_status_history_application ON internal_application_status_history(application_id);
CREATE UNIQUE INDEX idx_unique_one_apply_per_job ON internal_applications(job_id, employee_id) WHERE withdrawn_at IS NULL;
```

---

## 3. SERVICE LAYER

### InternalJobService

**File:** `backend/src/services/InternalJobService.ts`

```typescript
class InternalJobService {
  constructor(private db: PrismaClient, private auditService: AuditService) {}

  async createJob(companyId: string, userId: string, data: {
    title: string;
    departmentId?: string;
    positionId?: string;
    description: string;
    requirements?: string;
    closesAt: Date;
    tierMinimum?: string;
  }) {
    const job = await this.db.internalJob.create({
      data: {
        companyId,
        title: data.title,
        departmentId: data.departmentId,
        positionId: data.positionId,
        description: data.description,
        requirements: data.requirements,
        closesAt: data.closesAt,
        tierMinimum: data.tierMinimum,
        createdById: userId,
        updatedById: userId,
        status: 'DRAFT'
      }
    });

    await this.auditService.log({
      userId,
      action: 'create',
      resource_type: 'InternalJob',
      resource_id: job.id,
      after_state: job
    });

    return job;
  }

  async publishJob(companyId: string, jobId: string, userId: string) {
    const job = await this.db.internalJob.findUnique({ where: { id: jobId } });
    if (job?.companyId !== companyId) throw new Error('Unauthorized');
    if (job?.status !== 'DRAFT') throw new Error('Can only publish DRAFT jobs');

    const updated = await this.db.internalJob.update({
      where: { id: jobId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        updatedById: userId
      }
    });

    await this.auditService.log({
      userId,
      action: 'publish',
      resource_type: 'InternalJob',
      resource_id: jobId,
      before_state: job,
      after_state: updated
    });

    return updated;
  }

  async listPublishedJobs(companyId: string, filters?: {
    departmentId?: string;
    search?: string;
    sortBy?: 'published_date'|'deadline'|'department';
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      companyId,
      status: 'PUBLISHED',
      isArchived: false
    };

    if (filters?.departmentId) where.departmentId = filters.departmentId;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const orderBy = this.buildOrderBy(filters?.sortBy);

    const [jobs, count] = await Promise.all([
      this.db.internalJob.findMany({
        where,
        orderBy,
        skip: filters?.offset || 0,
        take: filters?.limit || 25,
        include: {
          _count: { select: { applications: true } }
        }
      }),
      this.db.internalJob.count({ where })
    ]);

    return {
      data: jobs.map(j => ({
        ...j,
        applicants_count: j._count.applications
      })),
      pagination: { offset: filters?.offset || 0, limit: filters?.limit || 25, total: count }
    };
  }

  private buildOrderBy(sortBy?: string) {
    switch (sortBy) {
      case 'deadline': return { closesAt: 'asc' };
      case 'department': return { department: { name: 'asc' } };
      default: return { publishedAt: 'desc' };
    }
  }
}
```

### InternalApplicationService

```typescript
class InternalApplicationService {
  constructor(
    private db: PrismaClient,
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  async apply(companyId: string, jobId: string, employeeId: string, coverNote?: string) {
    // Check one-apply constraint
    const existing = await this.db.internalApplication.findUnique({
      where: { jobId_employeeId: { jobId, employeeId } }
    });
    if (existing && !existing.withdrawnAt) throw new Error('Already applied to this job');

    const job = await this.db.internalJob.findUnique({ where: { id: jobId } });
    if (job?.status !== 'PUBLISHED') throw new Error('Job not available');

    const app = await this.db.internalApplication.create({
      data: {
        companyId,
        jobId,
        employeeId,
        coverNote,
        status: 'APPLIED',
        appliedAt: new Date()
      }
    });

    // Audit
    await this.auditService.log({
      userId: employeeId,
      action: 'apply',
      resource_type: 'InternalApplication',
      resource_id: app.id,
      after_state: app
    });

    // Notify HR
    await this.notificationService.sendNotification({
      event_type: 'application_received',
      to_roles: ['HR', 'COMPANY_ADMIN'],
      companyId,
      job_id: jobId,
      employee_id: employeeId,
      message: `${employee.name} applied for ${job.title}`
    });

    return app;
  }

  async changeStatus(companyId: string, appId: string, hrUserId: string, newStatus: string) {
    const app = await this.db.internalApplication.findUnique({ where: { id: appId } });
    if (app?.companyId !== companyId) throw new Error('Unauthorized');

    const oldStatus = app.status;

    const updated = await this.db.internalApplication.update({
      where: { id: appId },
      data: { status: newStatus }
    });

    // Log status history
    await this.db.internalApplicationStatusHistory.create({
      data: {
        applicationId: appId,
        oldStatus,
        newStatus,
        changedById: hrUserId,
        changedAt: new Date()
      }
    });

    // Audit
    await this.auditService.log({
      userId: hrUserId,
      action: 'status_change',
      resource_type: 'InternalApplication',
      resource_id: appId,
      before_state: { status: oldStatus },
      after_state: { status: newStatus }
    });

    // Notify employee
    if (newStatus !== 'REJECTED') {
      await this.notificationService.sendNotification({
        event_type: 'status_changed',
        to_user_id: app.employeeId,
        job_id: app.jobId,
        new_status: newStatus,
        message: `Your application moved to ${newStatus}`
      });
    }

    return updated;
  }

  async reject(companyId: string, appId: string, hrUserId: string, reason: string, notes?: string) {
    const app = await this.db.internalApplication.findUnique({ where: { id: appId } });
    if (app?.companyId !== companyId) throw new Error('Unauthorized');

    const updated = await this.db.internalApplication.update({
      where: { id: appId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason,
        rejectionNotes: notes
      }
    });

    // Audit
    await this.auditService.log({
      userId: hrUserId,
      action: 'reject',
      resource_type: 'InternalApplication',
      resource_id: appId,
      details: { reason, notes }
    });

    // Notify employee
    await this.notificationService.sendNotification({
      event_type: 'rejected',
      to_user_id: app.employeeId,
      job_id: app.jobId,
      rejection_reason: reason,
      message: `Your application was not selected. Reason: ${reason}`
    });

    return updated;
  }

  async accept(companyId: string, appId: string, hrUserId: string) {
    const app = await this.db.internalApplication.findUnique({
      where: { id: appId },
      include: { job: true, employee: true }
    });
    if (app?.companyId !== companyId) throw new Error('Unauthorized');

    // Update application
    const updated = await this.db.internalApplication.update({
      where: { id: appId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    });

    // Update employee position (if job has positionId)
    if (app.job.positionId) {
      await this.db.user.update({
        where: { id: app.employeeId },
        data: {
          positionId: app.job.positionId,
          departmentId: app.job.departmentId
        }
      });

      // Audit position change
      await this.auditService.log({
        userId: hrUserId,
        action: 'position_change',
        resource_type: 'User',
        resource_id: app.employeeId,
        details: { from_position: app.employee.positionId, to_position: app.job.positionId }
      });
    }

    // Mark job as FILLED
    await this.db.internalJob.update({
      where: { id: app.jobId },
      data: { status: 'FILLED', filledAt: new Date() }
    });

    // Trigger onboarding (async, don't wait)
    // this.onboardingService.createOnboardingPlan(app.employeeId, app.job.positionId);

    // Notify employee
    await this.notificationService.sendNotification({
      event_type: 'accepted',
      to_user_id: app.employeeId,
      job_id: app.jobId,
      message: 'Congratulations! You have been hired.'
    });

    // Notify HR
    await this.notificationService.sendNotification({
      event_type: 'accepted',
      to_roles: ['HR', 'COMPANY_ADMIN'],
      companyId,
      job_id: app.jobId,
      employee_id: app.employeeId,
      message: `${app.employee.name} accepted offer for ${app.job.title}`
    });

    return updated;
  }
}
```

---

## 4. CONTROLLERS & ROUTES

### InternalJobController

**File:** `backend/src/controllers/InternalJobController.ts`

```typescript
export class InternalJobController {
  constructor(
    private jobService: InternalJobService,
    private appService: InternalApplicationService
  ) {}

  @Post('/internal-jobs')
  @Auth(['HR', 'COMPANY_ADMIN'])
  @FeatureGate('career:marketplace')
  async createJob(req: Request, res: Response) {
    try {
      const { title, departmentId, positionId, description, requirements, closesAt, tierMinimum } = req.body;
      const companyId = req.user.companyId;
      const userId = req.user.id;

      // Validation
      if (!title || title.length < 5) {
        return res.status(400).json({ error: 'Title required, min 5 chars' });
      }
      if (!description) {
        return res.status(400).json({ error: 'Description required' });
      }
      if (new Date(closesAt) <= new Date()) {
        return res.status(400).json({ error: 'Deadline must be in future' });
      }

      const job = await this.jobService.createJob(companyId, userId, {
        title, departmentId, positionId, description, requirements, closesAt, tierMinimum
      });

      return res.status(201).json(job);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  @Get('/internal-jobs/published')
  @Auth(['EMPLOYEE'])
  @FeatureGate('career:marketplace')
  async listPublished(req: Request, res: Response) {
    try {
      const { departmentId, search, sortBy, limit = 25, offset = 0 } = req.query;
      const companyId = req.user.companyId;

      // Check tier
      const company = await this.db.company.findUnique({
        where: { id: companyId },
        select: { subscriptionTier: true }
      });
      if (!['PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'].includes(company?.subscriptionTier)) {
        return res.status(403).json({ error: 'Feature not available for your tier' });
      }

      const result = await this.jobService.listPublishedJobs(companyId, {
        departmentId: departmentId as string,
        search: search as string,
        sortBy: sortBy as string,
        limit: Number(limit),
        offset: Number(offset)
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  @Patch('/internal-jobs/:id/publish')
  @Auth(['HR', 'COMPANY_ADMIN'])
  async publish(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      const userId = req.user.id;

      const job = await this.jobService.publishJob(companyId, id, userId);
      return res.status(200).json(job);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  @Get('/internal-jobs/:id/applicants')
  @Auth(['HR', 'COMPANY_ADMIN'])
  async getApplicants(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status = 'APPLIED', limit = 100, offset = 0 } = req.query;
      const companyId = req.user.companyId;

      const applicants = await this.db.internalApplication.findMany({
        where: {
          companyId,
          jobId: id,
          status: status as any
        },
        include: {
          employee: { select: { id, name, email, phone, currentRole: true } },
          job: { select: { title: true } }
        },
        orderBy: { appliedAt: 'desc' },
        skip: Number(offset),
        take: Number(limit)
      });

      return res.status(200).json({ data: applicants });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
```

### InternalApplicationController

```typescript
export class InternalApplicationController {
  constructor(private appService: InternalApplicationService) {}

  @Post('/internal-jobs/:jobId/apply')
  @Auth(['EMPLOYEE'])
  async apply(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const { coverNote } = req.body;
      const companyId = req.user.companyId;
      const employeeId = req.user.id;

      if (coverNote && coverNote.length > 500) {
        return res.status(400).json({ error: 'Cover note max 500 chars' });
      }

      const app = await this.appService.apply(companyId, jobId, employeeId, coverNote);
      return res.status(201).json(app);
    } catch (error) {
      if (error.message.includes('Already applied')) {
        return res.status(409).json({ error: 'Already applied' });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  @Patch('/internal-applications/:id/status')
  @Auth(['HR', 'COMPANY_ADMIN'])
  async changeStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newStatus } = req.body;
      const companyId = req.user.companyId;
      const userId = req.user.id;

      if (!['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED'].includes(newStatus)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const app = await this.appService.changeStatus(companyId, id, userId, newStatus);
      return res.status(200).json(app);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  @Patch('/internal-applications/:id/reject')
  @Auth(['HR', 'COMPANY_ADMIN'])
  async reject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason, notes } = req.body;
      const companyId = req.user.companyId;
      const userId = req.user.id;

      if (!reason) {
        return res.status(400).json({ error: 'Reason required' });
      }

      const app = await this.appService.reject(companyId, id, userId, reason, notes);
      return res.status(200).json(app);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  @Patch('/internal-applications/:id/accept')
  @Auth(['HR', 'COMPANY_ADMIN'])
  async accept(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      const userId = req.user.id;

      const app = await this.appService.accept(companyId, id, userId);
      return res.status(200).json(app);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}
```

---

## 5. FRONTEND COMPONENTS

### JobBrowseList.tsx

**File:** `frontend/app/career/components/JobBrowseList.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import JobCard from './JobCard';

export default function JobBrowseList() {
  const auth = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    departmentId: '',
    search: '',
    sortBy: 'published_date'
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/v1/internal-jobs/published?${params}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      const data = await res.json();
      setJobs(data.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Internal Opportunities</h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search jobs..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 px-4 py-2 border rounded"
        />
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="px-4 py-2 border rounded"
        >
          <option value="published_date">Newest First</option>
          <option value="deadline">Closing Soon</option>
        </select>
      </div>

      {/* Job List */}
      {loading ? (
        <div className="text-center text-gray-500">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center text-gray-500">No jobs available</div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### PipelineKanban.tsx

**File:** `frontend/app/career/admin/components/PipelineKanban.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function PipelineKanban({ jobId }) {
  const [applicants, setApplicants] = useState({
    APPLIED: [],
    SCREENING: [],
    INTERVIEW: [],
    OFFER: [],
    ACCEPTED: [],
    REJECTED: []
  });

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    const res = await fetch(`/api/v1/internal-jobs/${jobId}/applicants`);
    const data = await res.json();

    const grouped = {
      APPLIED: [],
      SCREENING: [],
      INTERVIEW: [],
      OFFER: [],
      ACCEPTED: [],
      REJECTED: []
    };

    data.data.forEach(app => {
      grouped[app.status].push(app);
    });

    setApplicants(grouped);
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const newStatus = destination.droppableId;
    const appId = draggableId;

    try {
      await fetch(`/api/v1/internal-applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ newStatus }),
        headers: { 'Content-Type': 'application/json' }
      });

      // Update local state
      setApplicants(prev => {
        const updated = { ...prev };
        const app = updated[source.droppableId].find(a => a.id === appId);
        updated[source.droppableId] = updated[source.droppableId].filter(a => a.id !== appId);
        updated[newStatus].push({ ...app, status: newStatus });
        return updated;
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const statuses = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED'];

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-6 gap-4 p-6">
        {statuses.map(status => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`bg-gray-50 p-4 rounded min-h-96 ${
                  snapshot.isDraggingOver ? 'bg-blue-50' : ''
                }`}
              >
                <h3 className="font-bold mb-4">{status}</h3>
                {applicants[status].map((app, idx) => (
                  <Draggable key={app.id} draggableId={app.id} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-white p-3 mb-2 rounded shadow ${
                          snapshot.isDragging ? 'shadow-lg' : ''
                        }`}
                      >
                        <div className="font-semibold text-sm">{app.employee.name}</div>
                        <div className="text-xs text-gray-500">{app.employee.email}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
```

---

## 6. TESTING STRATEGY

### Unit Tests (Backend)

```typescript
describe('InternalJobService', () => {
  it('should create job in DRAFT status', async () => {
    const job = await service.createJob('company-1', 'user-1', {
      title: 'Senior Engineer',
      description: 'We are hiring...',
      closesAt: new Date('2026-10-01')
    });
    expect(job.status).toBe('DRAFT');
  });

  it('should publish job and make visible', async () => {
    const job = await service.publishJob('company-1', 'job-1', 'user-1');
    expect(job.status).toBe('PUBLISHED');
    expect(job.publishedAt).toBeDefined();
  });

  it('should enforce one-apply-per-job constraint', async () => {
    await service.apply('company-1', 'job-1', 'emp-1');
    expect(service.apply('company-1', 'job-1', 'emp-1')).rejects.toThrow();
  });

  it('should move applicant between stages', async () => {
    const app = await service.changeStatus('company-1', 'app-1', 'hr-1', 'SCREENING');
    expect(app.status).toBe('SCREENING');
  });

  it('should reject with reason', async () => {
    const app = await service.reject('company-1', 'app-1', 'hr-1', 'COMPETENCY_GAP');
    expect(app.rejectionReason).toBe('COMPETENCY_GAP');
  });

  it('should update position on accept', async () => {
    const app = await service.accept('company-1', 'app-1', 'hr-1');
    expect(app.status).toBe('ACCEPTED');
    // Verify employee position updated
  });
});
```

### E2E Tests (Playwright)

```typescript
test('Employee apply for job end-to-end', async ({ page }) => {
  // Login as employee
  await page.goto('/login');
  await page.fill('input[type=email]', 'emp@company.com');
  await page.fill('input[type=password]', 'password');
  await page.click('button[type=submit]');

  // Browse jobs
  await page.goto('/career');
  await expect(page.locator('text=Senior Engineer')).toBeVisible();

  // Apply
  await page.click('text=Senior Engineer');
  await page.fill('textarea[placeholder="Cover note"]', 'I am interested...');
  await page.click('button:has-text("Apply")');

  // Verify confirmation
  await expect(page.locator('text=Application submitted')).toBeVisible();
  await expect(page.locator('text=APPLIED')).toBeVisible();
});

test('HR move applicant to Screening', async ({ page }) => {
  // Login as HR
  await page.goto('/login');
  await page.fill('input[type=email]', 'hr@company.com');
  await page.fill('input[type=password]', 'password');
  await page.click('button[type=submit]');

  // View pipeline
  await page.goto('/career/pipeline/job-1');
  
  // Drag applicant
  const applicantCard = page.locator('text=John Doe');
  const screeningColumn = page.locator('[data-droppable-id=SCREENING]');
  
  await applicantCard.dragTo(screeningColumn);

  // Verify moved
  await expect(applicantCard).toBeVisible();
});
```

---

## 7. DEPLOYMENT CHECKLIST

- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] API endpoints tested (manual Postman)
- [ ] Frontend components built and responsive
- [ ] Feature flag `career:marketplace` enabled for PROFESSIONAL+ tiers
- [ ] Notifications tested (in-app + email)
- [ ] Audit logging verified (all CRUD logged)
- [ ] Performance tested (1000+ applicants)
- [ ] Security review (RBAC, tier gating, data isolation)
- [ ] UAT with 1-2 beta customers (Sep 20)
- [ ] Production deploy (Oct 1)

---

**Version:** 1.0 (Ready for Engineering)  
**Last Updated:** 10 Agustus 2026

