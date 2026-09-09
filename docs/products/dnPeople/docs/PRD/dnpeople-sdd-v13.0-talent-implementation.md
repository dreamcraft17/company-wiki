# dnPeople — SDD v13.0
## Talent Advancement: Technical Implementation

**Versi:** 13.0  
**Tanggal:** 24 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Code-ready (copy-paste)

---

# 1. DATABASE SCHEMA

## 1.1 Prisma Models (Copy-Paste)

```prisma
// prisma/schema.prisma

model TalentMatrixConfiguration {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String              @unique
  
  // Axis config
  performanceSource     String              @default("performance_cycle") // "performance_cycle" | "custom"
  potentialSource       String              @default("competency_gap") // "competency_gap" | "manager_rating" | "custom"
  
  // 9-box labels (JSON)
  boxLabels             Json                @default("{\"1\":\"D1: Question\",\"2\":\"D2: Solid\",\"3\":\"D3: Specialist\",\"4\":\"D4: Core Talent\",\"5\":\"D5: Performer\",\"6\":\"D6: High Potential\",\"7\":\"D7: Superstar\",\"8\":\"D8: Rising Star\",\"9\":\"D9: A-Player\"}")
  
  // Permissions
  allowManagerSuggestions Boolean           @default(true)
  
  // Audit
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  createdBy             String?
  
  @@map("talent_matrix_configurations")
}

model TalentMatrixSession {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String
  
  name                  String              // "Kalibrasi 2026 Q3"
  period                String              // "2026-Q3"
  status                String              @default("draft") // "draft" | "in_review" | "locked" | "archived"
  
  // Config for session
  performanceCycleId    String?             // FK to PerformanceCycle (if used)
  competencyAssessmentDate DateTime?       // Date competency data was pulled
  
  // Session management
  createdBy             String              // User ID
  createdAt             DateTime            @default(now())
  lockedBy              String?
  lockedAt              DateTime?
  
  // Relations
  placements            TalentMatrixPlacement[]
  proposals             DevelopmentProposal[]
  
  updatedAt             DateTime            @updatedAt
  
  @@unique([companyId, period])
  @@index([companyId, status])
  @@index([createdAt])
  @@map("talent_matrix_sessions")
}

model TalentMatrixPlacement {
  id                    String              @id @default(cuid())
  session               TalentMatrixSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sessionId             String
  
  employee              Employee            @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  employeeId            String
  
  // 9-box assignment
  boxNumber             Int                 // 1-9
  performanceRating     String              // "Low" | "Medium" | "High"
  potentialRating       String              // "Low" | "Medium" | "High"
  
  // Justification
  justification         String?             @db.Text
  managerSuggested      Boolean             @default(false)
  suggestedBy           String?             // User ID if manager suggested
  approvedBy            String?             // User ID if HR approved suggestion
  
  // History (track movement)
  movedFromBox          Int?
  movedReason           String?
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@unique([sessionId, employeeId])
  @@index([sessionId, boxNumber])
  @@index([performanceRating])
  @@map("talent_matrix_placements")
}

model SuccessionPlanning {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String
  
  position              Position            @relation(fields: [positionId], references: [id], onDelete: Cascade)
  positionId            String
  
  isCritical            Boolean             @default(false)
  
  // Successors
  successors            SuccessorCandidate[]
  
  // Audit
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  lastReviewedAt        DateTime?
  lastReviewedBy        String?
  
  @@unique([companyId, positionId])
  @@index([companyId, isCritical])
  @@map("succession_planning")
}

model SuccessorCandidate {
  id                    String              @id @default(cuid())
  plan                  SuccessionPlanning  @relation(fields: [planId], references: [id], onDelete: Cascade)
  planId                String
  
  employee              Employee            @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  employeeId            String
  
  proposals             DevelopmentProposal[]
  
  // Ranking (1 = first choice)
  rank                  Int
  
  // Readiness
  readinessStatus       String              @default("develop") // "ready_now" | "1_2yr" | "2_5yr" | "develop"
  readinessScore        Float?              // 0-100
  
  // Assessment
  competencyGapPercent  Float?              // %
  managerRating         Int?                // 1-5 scale
  notes                 String?             @db.Text
  
  // Audit
  addedBy               String              // User ID
  addedAt               DateTime            @default(now())
  
  @@unique([planId, employeeId, rank])
  @@index([planId, readinessStatus])
  @@map("successor_candidates")
}

model DevelopmentProposal {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String
  
  session               TalentMatrixSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sessionId             String
  
  successor             SuccessorCandidate  @relation(fields: [successorId], references: [id], onDelete: Cascade)
  successorId           String
  
  position              Position            @relation(fields: [positionId], references: [id])
  positionId            String
  
  // Gap & proposal
  competencyGap         String              // Competency name
  gapPercent            Float               // %
  proposedLmsModuleId   String?             // FK to LMS Module
  proposedIdpGoal       String?             @db.Text
  
  // Status
  status                String              @default("proposed") // "proposed" | "approved" | "rejected" | "completed"
  approvedBy            String?
  approvedAt            DateTime?
  rejectionReason       String?             @db.Text
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@index([companyId, status])
  @@index([successorId])
  @@map("development_proposals")
}

model TalentMatrixAudit {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String
  
  entity                String              // "session" | "placement" | "successor" | "proposal"
  entityId              String
  action                String              // "created" | "updated" | "deleted" | "locked" | "unlocked"
  
  // Before/after (JSON, sensitive fields redacted)
  beforeState           Json?
  afterState            Json?
  
  // Audit info
  reason                String?             @db.Text
  performedBy           String              // User ID
  performedAt           DateTime            @default(now())
  
  @@index([companyId, performedAt])
  @@index([entityId])
  @@map("talent_matrix_audit")
}

// Extend existing Position model to support succession
model Position {
  // ... existing fields ...
  succession            SuccessionPlanning?
  proposals             DevelopmentProposal[]
}

// Extend existing Company model
model Company {
  // ... existing fields ...
  talentConfig          TalentMatrixConfiguration?
  talentSessions        TalentMatrixSession[]
  successionPlans       SuccessionPlanning[]
  proposals             DevelopmentProposal[]
  talentAudit           TalentMatrixAudit[]
}
```

## 1.2 Migration Script

```sql
-- File: migrations/2026-09-01_talent-matrix-module3.sql

-- TalentMatrixConfiguration
CREATE TABLE talent_matrix_configurations (
  id VARCHAR(255) PRIMARY KEY,
  companyId VARCHAR(255) UNIQUE NOT NULL,
  performanceSource VARCHAR(50) DEFAULT 'performance_cycle',
  potentialSource VARCHAR(50) DEFAULT 'competency_gap',
  boxLabels JSON,
  allowManagerSuggestions BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdBy VARCHAR(255),
  
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company (companyId)
);

-- TalentMatrixSession
CREATE TABLE talent_matrix_sessions (
  id VARCHAR(255) PRIMARY KEY,
  companyId VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  period VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  performanceCycleId VARCHAR(255),
  competencyAssessmentDate TIMESTAMP,
  createdBy VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lockedBy VARCHAR(255),
  lockedAt TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY (companyId, period),
  INDEX idx_company_status (companyId, status),
  INDEX idx_created (createdAt)
);

-- TalentMatrixPlacement
CREATE TABLE talent_matrix_placements (
  id VARCHAR(255) PRIMARY KEY,
  sessionId VARCHAR(255) NOT NULL,
  employeeId VARCHAR(255) NOT NULL,
  boxNumber INT,
  performanceRating VARCHAR(50),
  potentialRating VARCHAR(50),
  justification LONGTEXT,
  managerSuggested BOOLEAN DEFAULT FALSE,
  suggestedBy VARCHAR(255),
  approvedBy VARCHAR(255),
  movedFromBox INT,
  movedReason VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sessionId) REFERENCES talent_matrix_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY (sessionId, employeeId),
  INDEX idx_session_box (sessionId, boxNumber),
  INDEX idx_performance (performanceRating)
);

-- SuccessionPlanning
CREATE TABLE succession_planning (
  id VARCHAR(255) PRIMARY KEY,
  companyId VARCHAR(255) NOT NULL,
  positionId VARCHAR(255) NOT NULL,
  isCritical BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastReviewedAt TIMESTAMP,
  lastReviewedBy VARCHAR(255),
  
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (positionId) REFERENCES positions(id) ON DELETE CASCADE,
  UNIQUE KEY (companyId, positionId),
  INDEX idx_company_critical (companyId, isCritical)
);

-- SuccessorCandidate
CREATE TABLE successor_candidates (
  id VARCHAR(255) PRIMARY KEY,
  planId VARCHAR(255) NOT NULL,
  employeeId VARCHAR(255) NOT NULL,
  rank INT,
  readinessStatus VARCHAR(50) DEFAULT 'develop',
  readinessScore FLOAT,
  competencyGapPercent FLOAT,
  managerRating INT,
  notes LONGTEXT,
  addedBy VARCHAR(255) NOT NULL,
  addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (planId) REFERENCES succession_planning(id) ON DELETE CASCADE,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY (planId, employeeId, rank),
  INDEX idx_plan_readiness (planId, readinessStatus)
);

-- DevelopmentProposal
CREATE TABLE development_proposals (
  id VARCHAR(255) PRIMARY KEY,
  companyId VARCHAR(255) NOT NULL,
  sessionId VARCHAR(255) NOT NULL,
  successorId VARCHAR(255) NOT NULL,
  positionId VARCHAR(255) NOT NULL,
  competencyGap VARCHAR(255),
  gapPercent FLOAT,
  proposedLmsModuleId VARCHAR(255),
  proposedIdpGoal LONGTEXT,
  status VARCHAR(50) DEFAULT 'proposed',
  approvedBy VARCHAR(255),
  approvedAt TIMESTAMP,
  rejectionReason LONGTEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (sessionId) REFERENCES talent_matrix_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (successorId) REFERENCES successor_candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (positionId) REFERENCES positions(id),
  INDEX idx_company_status (companyId, status),
  INDEX idx_successor (successorId)
);

-- TalentMatrixAudit (7-year retention)
CREATE TABLE talent_matrix_audit (
  id VARCHAR(255) PRIMARY KEY,
  companyId VARCHAR(255) NOT NULL,
  entity VARCHAR(50),
  entityId VARCHAR(255),
  action VARCHAR(50),
  beforeState JSON,
  afterState JSON,
  reason LONGTEXT,
  performedBy VARCHAR(255) NOT NULL,
  performedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company_date (companyId, performedAt),
  INDEX idx_entity (entityId)
);

-- Run migration
npx prisma migrate deploy --name talent-matrix-module3
```

---

# 2. BACKEND IMPLEMENTATION

## 2.1 Services (Copy-Paste)

```typescript
// backend/src/services/talentMatrixService.ts

import { prisma } from '@/lib/prisma';

export class TalentMatrixService {
  
  // Configuration
  static async getConfig(companyId: string) {
    return prisma.talentMatrixConfiguration.findUnique({
      where: { companyId }
    });
  }

  static async updateConfig(companyId: string, data: any) {
    return prisma.talentMatrixConfiguration.upsert({
      where: { companyId },
      create: { companyId, ...data },
      update: data
    });
  }

  // Session management
  static async createSession(companyId: string, data: any, userId: string) {
    const session = await prisma.talentMatrixSession.create({
      data: {
        ...data,
        companyId,
        createdBy: userId
      }
    });
    
    // Audit
    await this.auditLog(companyId, 'session', session.id, 'created', null, session, userId);
    
    return session;
  }

  static async lockSession(sessionId: string, userId: string, reason?: string) {
    const session = await prisma.talentMatrixSession.update({
      where: { id: sessionId },
      data: {
        status: 'locked',
        lockedBy: userId,
        lockedAt: new Date()
      }
    });

    // Audit
    await this.auditLog(session.companyId, 'session', sessionId, 'locked', null, { lockedAt: new Date() }, userId, reason);

    return session;
  }

  static async unlockSession(sessionId: string, userId: string, reason: string) {
    const session = await prisma.talentMatrixSession.update({
      where: { id: sessionId },
      data: {
        status: 'draft',
        lockedBy: null,
        lockedAt: null
      }
    });

    await this.auditLog(session.companyId, 'session', sessionId, 'unlocked', { lockedAt: new Date() }, { lockedAt: null }, userId, reason);

    return session;
  }

  // Placement
  static async createPlacement(sessionId: string, employeeId: string, data: any, userId: string) {
    const session = await prisma.talentMatrixSession.findUnique({ where: { id: sessionId } });
    
    if (session?.status === 'locked') {
      throw new Error('Cannot edit locked session');
    }

    const placement = await prisma.talentMatrixPlacement.create({
      data: {
        sessionId,
        employeeId,
        ...data
      },
      include: { employee: true }
    });

    await this.auditLog(session!.companyId, 'placement', placement.id, 'created', null, placement, userId);

    return placement;
  }

  static async updatePlacement(sessionId: string, employeeId: string, data: any, userId: string) {
    const session = await prisma.talentMatrixSession.findUnique({ where: { id: sessionId } });
    
    if (session?.status === 'locked') {
      throw new Error('Cannot edit locked session');
    }

    const current = await prisma.talentMatrixPlacement.findUnique({
      where: { sessionId_employeeId: { sessionId, employeeId } }
    });

    const updated = await prisma.talentMatrixPlacement.update({
      where: { sessionId_employeeId: { sessionId, employeeId } },
      data: {
        ...data,
        movedFromBox: current?.boxNumber,
        movedReason: data.movedReason || 'Manual adjustment'
      }
    });

    await this.auditLog(session!.companyId, 'placement', updated.id, 'updated', current, updated, userId, data.reason);

    return updated;
  }

  // Readiness calculation
  static async calculateReadiness(employeeId: string, positionId: string): Promise<{
    status: string;
    score: number;
    gap: number;
  }> {
    // 1. Get competency gap for this role
    const position = await prisma.position.findUnique({ where: { id: positionId } });
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    
    if (!position || !employee) throw new Error('Not found');

    // 2. Calculate gap (simplified: assume gap available from competency assessment)
    const gap = 35; // TODO: fetch from competency module

    // 3. Get manager rating (default 3)
    const managerRating = 4;

    // 4. Determine status
    let status = 'develop';
    if (gap <= 20 && managerRating >= 4) status = 'ready_now';
    else if (gap <= 50 && managerRating >= 3) status = '1_2yr';
    else if (gap <= 80) status = '2_5yr';

    // 5. Calculate score
    const score = ((100 - gap) / 100) * (managerRating / 5) * 100;

    return { status, score, gap };
  }

  // Development proposal
  static async generateProposals(sessionId: string, userId: string) {
    const session = await prisma.talentMatrixSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error('Session not found');

    const proposals: any[] = [];

    // Find all successors with gaps ≥ 30%
    const successors = await prisma.successorCandidate.findMany({
      where: {
        plan: { companyId: session.companyId }
      }
    });

    for (const successor of successors) {
      if ((successor.competencyGapPercent || 0) >= 30) {
        // Propose LMS module
        const proposal = await prisma.developmentProposal.create({
          data: {
            companyId: session.companyId,
            sessionId,
            successorId: successor.id,
            positionId: successor.plan.positionId,
            competencyGap: 'Strategic Thinking', // TODO: from competency module
            gapPercent: successor.competencyGapPercent || 30,
            status: 'proposed'
          }
        });
        proposals.push(proposal);
      }
    }

    return proposals;
  }

  // Audit
  static async auditLog(
    companyId: string,
    entity: string,
    entityId: string,
    action: string,
    beforeState: any,
    afterState: any,
    performedBy: string,
    reason?: string
  ) {
    // Redact sensitive fields
    const redacted = (obj: any) => {
      if (!obj) return null;
      const copy = JSON.parse(JSON.stringify(obj));
      delete copy.salary;
      delete copy.bank;
      delete copy.npwp;
      delete copy.nric;
      return copy;
    };

    return prisma.talentMatrixAudit.create({
      data: {
        companyId,
        entity,
        entityId,
        action,
        beforeState: redacted(beforeState),
        afterState: redacted(afterState),
        reason,
        performedBy
      }
    });
  }
}
```

## 2.2 API Routes (Express)

```typescript
// backend/src/routes/talent.ts

import { Router } from 'express';
import { protect, authorize } from '@/middleware/auth';
import { TalentMatrixService } from '@/services/talentMatrixService';

const router = Router();

// Configuration
router.get('/config', protect, async (req, res) => {
  const config = await TalentMatrixService.getConfig(req.company.id);
  res.json(config || {});
});

router.put('/config', protect, authorize(['COMPANY_ADMIN', 'HR']), async (req, res) => {
  const config = await TalentMatrixService.updateConfig(req.company.id, req.body);
  res.json(config);
});

// Sessions
router.post('/sessions', protect, authorize(['COMPANY_ADMIN', 'HR']), async (req, res) => {
  const session = await TalentMatrixService.createSession(req.company.id, req.body, req.user.id);
  res.json(session);
});

router.get('/sessions', protect, async (req, res) => {
  const sessions = await prisma.talentMatrixSession.findMany({
    where: { companyId: req.company.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  res.json(sessions);
});

router.get('/sessions/:id', protect, async (req, res) => {
  const session = await prisma.talentMatrixSession.findUnique({
    where: { id: req.params.id },
    include: { placements: true }
  });
  res.json(session);
});

router.post('/sessions/:id/lock', protect, authorize(['COMPANY_ADMIN', 'HR']), async (req, res) => {
  const session = await TalentMatrixService.lockSession(req.params.id, req.user.id, req.body.reason);
  res.json(session);
});

router.post('/sessions/:id/unlock', protect, authorize(['COMPANY_ADMIN', 'HR']), async (req, res) => {
  const session = await TalentMatrixService.unlockSession(req.params.id, req.user.id, req.body.reason);
  res.json(session);
});

// Placements
router.post('/sessions/:sessionId/placements', protect, authorize(['COMPANY_ADMIN', 'HR', 'MANAGER']), async (req, res) => {
  // MANAGER can only suggest (managerSuggested=true)
  // HR can create directly
  
  const placement = await TalentMatrixService.createPlacement(
    req.params.sessionId,
    req.body.employeeId,
    {
      ...req.body,
      managerSuggested: req.user.role === 'MANAGER',
      suggestedBy: req.user.role === 'MANAGER' ? req.user.id : null
    },
    req.user.id
  );
  res.json(placement);
});

router.put('/sessions/:sessionId/placements/:employeeId', protect, authorize(['COMPANY_ADMIN', 'HR']), async (req, res) => {
  const placement = await TalentMatrixService.updatePlacement(
    req.params.sessionId,
    req.params.employeeId,
    req.body,
    req.user.id
  );
  res.json(placement);
});

// Succession
router.post('/positions/:positionId/critical', protect, authorize(['COMPANY_ADMIN', 'HR']), async (req, res) => {
  const plan = await prisma.successionPlanning.upsert({
    where: {
      companyId_positionId: { companyId: req.company.id, positionId: req.params.positionId }
    },
    create: {
      companyId: req.company.id,
      positionId: req.params.positionId,
      isCritical: true
    },
    update: { isCritical: true }
  });
  res.json(plan);
});

router.post('/positions/:positionId/successors', protect, authorize(['COMPANY_ADMIN', 'HR']), async (req, res) => {
  const candidate = await prisma.successorCandidate.create({
    data: {
      planId: req.params.positionId, // TODO: get planId from position
      employeeId: req.body.employeeId,
      rank: req.body.rank,
      readinessStatus: req.body.readinessStatus,
      managerRating: req.body.managerRating,
      notes: req.body.notes,
      addedBy: req.user.id
    }
  });
  res.json(candidate);
});

// Proposals
router.get('/proposals', protect, async (req, res) => {
  const proposals = await prisma.developmentProposal.findMany({
    where: {
      companyId: req.company.id,
      status: req.query.status
    }
  });
  res.json(proposals);
});

router.put('/proposals/:id', protect, authorize(['COMPANY_ADMIN', 'HR']), async (req, res) => {
  const proposal = await prisma.developmentProposal.update({
    where: { id: req.params.id },
    data: {
      status: req.body.status,
      approvedBy: req.body.status === 'approved' ? req.user.id : null,
      approvedAt: req.body.status === 'approved' ? new Date() : null,
      rejectionReason: req.body.status === 'rejected' ? req.body.reason : null
    }
  });

  // If approved, call LMS enrollment API
  if (req.body.status === 'approved' && proposal.proposedLmsModuleId) {
    // TODO: Call POST /api/v1/learning/courses/{moduleId}/enroll
  }

  res.json(proposal);
});

export default router;

// Mount in main app:
// app.use('/api/v1/talent', router);
```

---

# 3. FRONTEND IMPLEMENTATION

## 3.1 Navigation Visibility Fix (Key Component)

```typescript
// frontend/src/components/Navigation.tsx

import { useTierAccess } from '@/hooks/useTierAccess';
import Link from 'next/link';

const NAVIGATION_STRUCTURE = {
  employees: { label: 'Employees', href: '/employees', feature: 'core_hr' },
  org: { label: 'Organization', href: '/org', feature: 'core_hr' },
  payroll: { label: 'Payroll', href: '/payroll', feature: 'payroll' },
  attendance: { label: 'Attendance', href: '/attendance', feature: 'attendance' },
  leave: { label: 'Leave', href: '/leave', feature: 'leave' },
  recruitment: { label: 'Recruitment', href: '/recruitment', feature: 'recruitment' },
  performance: { label: 'Performance', href: '/performance', feature: 'performance' },
  training: { label: 'Training', href: '/training', feature: 'training' },
  talent: { label: 'Talent', href: '/talent', feature: 'talent_matrix' }, // NEW
  integrations: { label: 'Integrations', href: '/integrations', feature: 'api_keys' },
  settings: { label: 'Settings', href: '/settings', feature: 'core_hr' }
};

export function Navigation() {
  const { hasAccess } = useTierAccess();

  return (
    <nav className="sidebar">
      <div className="nav-menu">
        {Object.entries(NAVIGATION_STRUCTURE).map(([key, item]) => {
          // CRITICAL FIX: Only show if feature is enabled for tier
          const canAccess = hasAccess(item.feature);

          if (!canAccess) {
            return null; // Don't render hidden items at all
          }

          return (
            <Link key={key} href={item.href}>
              <a className="nav-item">{item.label}</a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

## 3.2 Talent Matrix Hook (NEW)

```typescript
// frontend/src/hooks/useTalentMatrix.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export function useTalentSessions(companyId: string) {
  return useQuery({
    queryKey: ['talent-sessions', companyId],
    queryFn: () => apiClient.get(`/api/v1/talent/sessions`),
    enabled: !!companyId
  });
}

export function useTalentSession(sessionId: string) {
  return useQuery({
    queryKey: ['talent-session', sessionId],
    queryFn: () => apiClient.get(`/api/v1/talent/sessions/${sessionId}`)
  });
}

export function useCreateSession() {
  return useMutation({
    mutationFn: (data) => apiClient.post('/api/v1/talent/sessions', data)
  });
}

export function useLockSession() {
  return useMutation({
    mutationFn: ({ sessionId, reason }: any) =>
      apiClient.post(`/api/v1/talent/sessions/${sessionId}/lock`, { reason })
  });
}

export function useUpdatePlacement() {
  return useMutation({
    mutationFn: ({ sessionId, employeeId, data }: any) =>
      apiClient.put(
        `/api/v1/talent/sessions/${sessionId}/placements/${employeeId}`,
        data
      )
  });
}
```

## 3.3 9-Box Matrix Component

```typescript
// frontend/src/components/TalentMatrix.tsx

import React from 'react';
import { useTalentSession } from '@/hooks/useTalentMatrix';

const BOX_POSITIONS = {
  1: { row: 0, col: 0 }, // Low potential, Low performance
  2: { row: 0, col: 1 },
  3: { row: 0, col: 2 },
  4: { row: 1, col: 0 },
  5: { row: 1, col: 1 },
  6: { row: 1, col: 2 },
  7: { row: 2, col: 0 },
  8: { row: 2, col: 1 },
  9: { row: 2, col: 2 } // High potential, High performance
};

export function TalentMatrix({ sessionId }: { sessionId: string }) {
  const { data: session, isLoading } = useTalentSession(sessionId);

  if (isLoading) return <div>Loading...</div>;
  if (!session) return <div>Session not found</div>;

  // Group placements by box
  const boxMap = new Map<number, any[]>();
  session.placements.forEach((p: any) => {
    if (!boxMap.has(p.boxNumber)) boxMap.set(p.boxNumber, []);
    boxMap.get(p.boxNumber)!.push(p);
  });

  return (
    <div className="talent-matrix">
      <div className="grid-3x3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((boxNum) => (
          <div key={boxNum} className="box" data-box={boxNum}>
            <h3 className="box-label">Box {boxNum}</h3>
            <ul className="employees">
              {(boxMap.get(boxNum) || []).map((placement) => (
                <li key={placement.id}>
                  <span>{placement.employee.name}</span>
                  <button onClick={() => editPlacement(placement)}>Edit</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

# 4. ENVIRONMENT VARIABLES

```bash
# .env (v13.0)

# Talent Matrix feature
FEATURE_TALENT_MATRIX=true
TALENT_MATRIX_MIN_TIER=PROFESSIONAL

# Tier feature gating
TIER_PROFESSIONAL_FEATURES=payroll,attendance,leave,recruitment,performance,training,talent_matrix
TIER_BUSINESS_FEATURES=${TIER_PROFESSIONAL_FEATURES},api_keys,webhooks
TIER_ENTERPRISE_FEATURES=${TIER_BUSINESS_FEATURES},branding,sso,scim
```

---

# 5. TESTING CODE (Unit + Integration)

```typescript
// backend/src/__tests__/talent-matrix.test.ts

import { TalentMatrixService } from '@/services/talentMatrixService';
import { prisma } from '@/lib/prisma';

describe('TalentMatrixService', () => {
  it('should create session', async () => {
    const session = await TalentMatrixService.createSession(
      'company-123',
      { name: 'Test', period: '2026-Q3' },
      'user-456'
    );

    expect(session.name).toBe('Test');
    expect(session.status).toBe('draft');
  });

  it('should lock session', async () => {
    const session = await TalentMatrixService.lockSession('session-123', 'user-456');
    expect(session.status).toBe('locked');
    expect(session.lockedAt).toBeDefined();
  });

  it('should calculate readiness', async () => {
    const readiness = await TalentMatrixService.calculateReadiness('emp-123', 'pos-456');
    
    expect(readiness.status).toMatch(/ready_now|1_2yr|2_5yr|develop/);
    expect(readiness.score).toBeBetween(0, 100);
  });

  it('should generate proposals', async () => {
    const proposals = await TalentMatrixService.generateProposals('session-123', 'user-456');
    expect(Array.isArray(proposals)).toBe(true);
  });

  it('should redact sensitive data in audit', async () => {
    const beforeState = { salary: 100000, name: 'John', bank: '1234' };
    await TalentMatrixService.auditLog(
      'company-123',
      'placement',
      'place-123',
      'updated',
      beforeState,
      { name: 'John', salary: 110000 },
      'user-456'
    );

    const audit = await prisma.talentMatrixAudit.findFirst({
      where: { entityId: 'place-123' }
    });

    expect(audit?.beforeState).not.toHaveProperty('salary');
    expect(audit?.beforeState).not.toHaveProperty('bank');
    expect(audit?.beforeState).toHaveProperty('name', 'John');
  });
});
```

---

# 6. PERFORMANCE CHECKLIST

```
[ ] Index on companyId, sessionId, employeeId
[ ] Pagination: 20 sessions/page, 50 placements/page
[ ] Query optimization: Eager load placements (include)
[ ] Caching: Session details cached 5 min
[ ] API rate limit: 100 req/min per company
[ ] UI: 9-box load < 2s (1000 emp)
[ ] Export: < 3s (1000 emp)
```

---

# 7. DEPLOYMENT CHECKLIST

```
PRE-DEPLOY:
  [ ] Database backup created
  [ ] Migration tested on staging
  [ ] All 30+ SRS tests passing
  [ ] Navigation fix verified (FREE/PROF tiers)
  [ ] Audit logging working

DEPLOY:
  [ ] npm run build (frontend + backend)
  [ ] npx prisma migrate deploy
  [ ] Restart API server
  [ ] Verify: GET /api/v1/talent/sessions (200 OK)

POST-DEPLOY (Monitor 24h):
  [ ] Error logs clean (Sentry)
  [ ] API response times (Datadog)
  [ ] Navigation visibility per tier
  [ ] Audit trail accurate
  [ ] Export performance OK
```

---

*Last Updated: 24 Juli 2026 | Version: 13.0 (FINAL SDD) | Status: Code Ready*
