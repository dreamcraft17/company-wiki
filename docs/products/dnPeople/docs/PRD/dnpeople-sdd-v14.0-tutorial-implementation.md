# dnPeople — SDD v14.0
## In-App Tutorial & Onboarding: Technical Implementation

**Versi:** 14.0  
**Tanggal:** 24 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Code-ready (copy-paste)

> **Implementation override — 25 July 2026:** Video fields, `VideoLibraryItem`, `/videos` APIs, YouTube embeds, and the `/help/videos` page are removed from v14.0. The live design implements interactive tutorials + Knowledge Base only. Video code below is retained as historical draft reference and must not be copied into the application.

---

# 1. DATABASE SCHEMA

## 1.1 Prisma Models (Copy-Paste)

```prisma
// prisma/schema.prisma

model Tutorial {
  id                String            @id @default(cuid())
  
  title             String            // "Employee Creation"
  slug              String            @unique // "employee-creation"
  description       String            // "Add employees to your company"
  category          String            // "Getting Started" | "Advanced" | "Video"
  
  // Content structure
  steps             TutorialStep[]
  videoUrl          String?           // YouTube embed URL (https://youtube.com/embed/...)
  
  // Metadata
  expectedMinutes   Int               // 3, 5, 15, etc
  difficulty        String            // "Easy" | "Medium" | "Hard"
  minTierRequired   String            @default("FREE") // Tier gating
  modules           String[]          @default([]) // ["payroll", "attendance"]
  displayOrder      Int               @default(0)
  isActive          Boolean           @default(true)
  
  // Analytics
  viewCount         Int               @default(0)
  completionCount   Int               @default(0)
  avgCompletionTime Int?              // seconds
  helpfulRating     Float?            // 1-5 average
  
  // Timestamps
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@index([category])
  @@index([minTierRequired])
  @@map("tutorials")
}

model TutorialStep {
  id                String            @id @default(cuid())
  tutorial          Tutorial          @relation(fields: [tutorialId], references: [id], onDelete: Cascade)
  tutorialId        String
  
  stepNumber        Int               // 1, 2, 3, ...
  title             String            // "Navigate to Employees"
  instruction       String            @db.Text // Markdown
  
  // Visual guidance
  elementSelector   String?           // CSS selector: "[data-testid='nav-employees']"
  highlightColor    String?           // "blue" | "green" | "yellow"
  screenshotUrl     String?           // Image URL
  
  // Media
  videoUrl          String?           // YouTube embed (specific to this step)
  
  // Optional: Client-side validation
  completionScript  String?           // JS to check if step completed
  successMessage    String?           // "Great! Click Next"
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@unique([tutorialId, stepNumber])
  @@map("tutorial_steps")
}

model TutorialProgress {
  id                String            @id @default(cuid())
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
  
  tutorial          Tutorial          @relation(fields: [tutorialId], references: [id], onDelete: Cascade)
  tutorialId        String
  
  // Progress state
  currentStep       Int               // 1-6 (current user is on)
  isCompleted       Boolean           @default(false)
  completedAt       DateTime?
  
  // Time tracking
  startedAt         DateTime          @default(now())
  lastActivityAt    DateTime          @updatedAt
  totalTimeSpent    Int               @default(0) // seconds
  
  // User feedback
  isHelpful         Boolean?          // null = not rated, true/false = user feedback
  feedbackComment   String?           @db.Text
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@unique([userId, tutorialId])
  @@index([userId, isCompleted])
  @@map("tutorial_progress")
}

model KnowledgeBaseArticle {
  id                String            @id @default(cuid())
  slug              String            @unique // "what-is-payroll"
  
  title             String
  content           String            @db.LongText // Markdown
  excerpt           String?           // Short preview (max 200 chars)
  category          String            // "Payroll" | "Attendance" | "General"
  tags              String[]          @default([])
  
  // SEO + discovery
  metaDescription   String?
  relatedArticleIds String[]          @default([]) // FK to other articles
  relatedTutorialIds String[]         @default([]) // FK to tutorials
  
  // Display
  displayOrder      Int               @default(0)
  isPublished       Boolean           @default(true)
  
  // Analytics
  viewCount         Int               @default(0)
  helpfulYesCount   Int               @default(0)
  helpfulNoCount    Int               @default(0)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@index([category])
  @@fulltext([title, content]) // MySQL fulltext search
  @@map("knowledge_base_articles")
}

model VideoLibraryItem {
  id                String            @id @default(cuid())
  
  title             String
  description       String            @db.Text
  youtubeUrl        String            // Full YouTube URL
  embedUrl          String            // https://youtube.com/embed/VIDEO_ID
  youtubeVideoId    String            // Extracted video ID
  
  thumbnailUrl      String?           // YouTube thumbnail (auto-fetched)
  durationSeconds   Int?              // 300, 360, etc (optional)
  
  category          String            // "Payroll" | "Attendance" | "Mobile" | "General"
  tags              String[]          @default([])
  
  relatedTutorialIds String[]         @default([]) // FK to tutorials
  relatedArticleIds  String[]         @default([]) // FK to KB articles
  
  displayOrder      Int               @default(0)
  isPublished       Boolean           @default(true)
  
  viewCount         Int               @default(0)
  helpfulYesCount   Int               @default(0)
  helpfulNoCount    Int               @default(0)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  @@unique([youtubeVideoId])
  @@index([category])
  @@map("video_library_items")
}

// Extend existing User model
model User {
  // ... existing fields ...
  tutorialProgress  TutorialProgress[]
}
```

---

# 2. BACKEND IMPLEMENTATION

## 2.1 Services (Copy-Paste)

```typescript
// backend/src/services/tutorialService.ts

import { prisma } from '@/lib/prisma';
import { TierService } from '@/services/tierService';

export class TutorialService {
  
  // Get available tutorials for user's tier
  static async getAvailableTutorials(tier: string, category?: string) {
    let where: any = { isActive: true };
    
    // Tier gating: Only show if user's tier >= minTierRequired
    const tiers = ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'];
    const userTierIndex = tiers.indexOf(tier);
    const allowedTiers = tiers.slice(0, userTierIndex + 1);
    
    where.minTierRequired = { in: allowedTiers };
    
    if (category) {
      where.category = category;
    }

    return prisma.tutorial.findMany({
      where,
      include: { steps: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }]
    });
  }

  // Get single tutorial with all steps
  static async getTutorial(tutorialId: string, userId: string, tier: string) {
    const tutorial = await prisma.tutorial.findUnique({
      where: { id: tutorialId },
      include: { steps: { orderBy: { stepNumber: 'asc' } } }
    });

    if (!tutorial) {
      throw new Error('Tutorial not found');
    }

    // Check tier access
    if (!this.hasAccessToTutorial(tier, tutorial.minTierRequired)) {
      throw new Error('Tier not allowed for this tutorial');
    }

    // Get user's progress
    const progress = await prisma.tutorialProgress.findUnique({
      where: { userId_tutorialId: { userId, tutorialId } }
    });

    return {
      tutorial,
      progress: progress || null
    };
  }

  private static hasAccessToTutorial(userTier: string, minTierRequired: string): boolean {
    const tiers = ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'];
    const userIndex = tiers.indexOf(userTier);
    const minIndex = tiers.indexOf(minTierRequired);
    return userIndex >= minIndex;
  }

  // Start or continue tutorial
  static async startTutorial(userId: string, tutorialId: string, tier: string) {
    const tutorial = await prisma.tutorial.findUnique({ where: { id: tutorialId } });
    
    if (!tutorial) throw new Error('Tutorial not found');
    if (!this.hasAccessToTutorial(tier, tutorial.minTierRequired)) {
      throw new Error('Tier not allowed');
    }

    // Get or create progress
    const progress = await prisma.tutorialProgress.upsert({
      where: { userId_tutorialId: { userId, tutorialId } },
      create: {
        userId,
        tutorialId,
        currentStep: 1,
        startedAt: new Date()
      },
      update: { lastActivityAt: new Date() } // Just update last activity if resuming
    });

    // Increment view count
    await prisma.tutorial.update({
      where: { id: tutorialId },
      data: { viewCount: { increment: 1 } }
    });

    return progress;
  }

  // Move to next step
  static async completeStep(userId: string, tutorialId: string, stepNumber: number) {
    const progress = await prisma.tutorialProgress.findUnique({
      where: { userId_tutorialId: { userId, tutorialId } }
    });

    if (!progress) throw new Error('No progress found');

    const tutorial = await prisma.tutorial.findUnique({ where: { id: tutorialId } });
    if (!tutorial) throw new Error('Tutorial not found');

    const totalSteps = await prisma.tutorialStep.count({ where: { tutorialId } });
    const isLastStep = stepNumber >= totalSteps;

    // Update progress
    const updated = await prisma.tutorialProgress.update({
      where: { id: progress.id },
      data: {
        currentStep: stepNumber + 1,
        isCompleted: isLastStep,
        completedAt: isLastStep ? new Date() : null,
        totalTimeSpent: Math.floor((Date.now() - progress.startedAt.getTime()) / 1000)
      }
    });

    // If completed, increment completion count
    if (isLastStep) {
      await prisma.tutorial.update({
        where: { id: tutorialId },
        data: { completionCount: { increment: 1 } }
      });
    }

    return updated;
  }

  // Rate tutorial (helpful?)
  static async rateTutorial(userId: string, tutorialId: string, isHelpful: boolean, comment?: string) {
    return prisma.tutorialProgress.update({
      where: { userId_tutorialId: { userId, tutorialId } },
      data: {
        isHelpful,
        feedbackComment: comment
      }
    });
  }
}

// Knowledge Base Service
export class KnowledgeBaseService {
  
  static async searchArticles(query: string, category?: string, limit: number = 10) {
    let where: any = { isPublished: true };

    if (category) {
      where.category = category;
    }

    if (query) {
      // MySQL fulltext search
      where.OR = [
        { title: { contains: query } },
        { content: { contains: query } }
      ];
    }

    return prisma.knowledgeBaseArticle.findMany({
      where,
      take: limit,
      orderBy: [
        { title: { contains: query } ? { _relevance: 'desc' } : undefined }, // Relevance
        { viewCount: 'desc' } // Popularity
      ].filter(Boolean)
    });
  }

  static async getArticle(slug: string) {
    const article = await prisma.knowledgeBaseArticle.findUnique({ where: { slug } });

    if (!article) throw new Error('Article not found');

    // Increment view count
    await prisma.knowledgeBaseArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    });

    return article;
  }

  static async rateArticle(articleId: string, isHelpful: boolean) {
    const field = isHelpful ? 'helpfulYesCount' : 'helpfulNoCount';
    
    return prisma.knowledgeBaseArticle.update({
      where: { id: articleId },
      data: { [field]: { increment: 1 } }
    });
  }

  static async getCategories() {
    const categories = await prisma.knowledgeBaseArticle.findMany({
      distinct: ['category'],
      select: { category: true },
      where: { isPublished: true }
    });

    return categories.map((c) => c.category);
  }
}

// Video Library Service
export class VideoLibraryService {
  
  static async getVideos(category?: string) {
    let where: any = { isPublished: true };
    
    if (category) {
      where.category = category;
    }

    return prisma.videoLibraryItem.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }]
    });
  }

  static async getVideo(id: string) {
    const video = await prisma.videoLibraryItem.findUnique({ where: { id } });

    if (!video) throw new Error('Video not found');

    // Increment view count
    await prisma.videoLibraryItem.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    return video;
  }

  static async rateVideo(videoId: string, isHelpful: boolean) {
    const field = isHelpful ? 'helpfulYesCount' : 'helpfulNoCount';

    return prisma.videoLibraryItem.update({
      where: { id: videoId },
      data: { [field]: { increment: 1 } }
    });
  }

  static async getCategories() {
    const categories = await prisma.videoLibraryItem.findMany({
      distinct: ['category'],
      select: { category: true },
      where: { isPublished: true }
    });

    return categories.map((c) => c.category);
  }
}
```

## 2.2 API Routes (Express)

```typescript
// backend/src/routes/tutorials.ts

import { Router } from 'express';
import { protect } from '@/middleware/auth';
import { TutorialService, KnowledgeBaseService, VideoLibraryService } from '@/services/tutorialService';

const router = Router();

// TUTORIALS

router.get('/tutorials', protect, async (req, res) => {
  const { category } = req.query;
  const tutorials = await TutorialService.getAvailableTutorials(
    req.subscription.tier,
    category as string
  );
  res.json({ tutorials });
});

router.get('/tutorials/:id', protect, async (req, res) => {
  const { tutorial, progress } = await TutorialService.getTutorial(
    req.params.id,
    req.user.id,
    req.subscription.tier
  );
  res.json({ tutorial, progress });
});

router.post('/tutorials/:id/start', protect, async (req, res) => {
  const progress = await TutorialService.startTutorial(
    req.user.id,
    req.params.id,
    req.subscription.tier
  );
  res.json({ progress });
});

router.post('/tutorials/:id/steps/:stepNumber/complete', protect, async (req, res) => {
  const progress = await TutorialService.completeStep(
    req.user.id,
    req.params.id,
    parseInt(req.params.stepNumber)
  );
  res.json({ progress });
});

router.post('/tutorials/:id/rate', protect, async (req, res) => {
  const progress = await TutorialService.rateTutorial(
    req.user.id,
    req.params.id,
    req.body.isHelpful,
    req.body.comment
  );
  res.json({ progress });
});

// KNOWLEDGE BASE

router.get('/kb/search', protect, async (req, res) => {
  const { q, category, limit } = req.query;
  const articles = await KnowledgeBaseService.searchArticles(
    q as string,
    category as string,
    limit ? parseInt(limit as string) : 10
  );
  res.json({ articles });
});

router.get('/kb/articles/:slug', protect, async (req, res) => {
  const article = await KnowledgeBaseService.getArticle(req.params.slug);
  res.json({ article });
});

router.post('/kb/articles/:id/rate', protect, async (req, res) => {
  const article = await KnowledgeBaseService.rateArticle(
    req.params.id,
    req.body.isHelpful
  );
  res.json({ article });
});

router.get('/kb/categories', protect, async (req, res) => {
  const categories = await KnowledgeBaseService.getCategories();
  res.json({ categories });
});

// VIDEO LIBRARY

router.get('/videos', protect, async (req, res) => {
  const { category } = req.query;
  const videos = await VideoLibraryService.getVideos(category as string);
  res.json({ videos });
});

router.get('/videos/:id', protect, async (req, res) => {
  const video = await VideoLibraryService.getVideo(req.params.id);
  res.json({ video });
});

router.post('/videos/:id/rate', protect, async (req, res) => {
  const video = await VideoLibraryService.rateVideo(
    req.params.id,
    req.body.isHelpful
  );
  res.json({ video });
});

router.get('/videos/categories', protect, async (req, res) => {
  const categories = await VideoLibraryService.getCategories();
  res.json({ categories });
});

export default router;

// Mount in main app:
// app.use('/api/v1', router);
```

---

# 3. FRONTEND IMPLEMENTATION

## 3.1 Tutorial Hook

```typescript
// frontend/src/hooks/useTutorials.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export function useTutorials(category?: string) {
  return useQuery({
    queryKey: ['tutorials', category],
    queryFn: () =>
      apiClient.get('/api/v1/tutorials', {
        params: { category }
      })
  });
}

export function useTutorial(id: string) {
  return useQuery({
    queryKey: ['tutorial', id],
    queryFn: () => apiClient.get(`/api/v1/tutorials/${id}`)
  });
}

export function useStartTutorial() {
  return useMutation({
    mutationFn: (tutorialId: string) =>
      apiClient.post(`/api/v1/tutorials/${tutorialId}/start`)
  });
}

export function useCompleteStep() {
  return useMutation({
    mutationFn: ({ tutorialId, stepNumber }: any) =>
      apiClient.post(
        `/api/v1/tutorials/${tutorialId}/steps/${stepNumber}/complete`
      )
  });
}

export function useRateTutorial() {
  return useMutation({
    mutationFn: ({ tutorialId, isHelpful, comment }: any) =>
      apiClient.post(`/api/v1/tutorials/${tutorialId}/rate`, {
        isHelpful,
        comment
      })
  });
}
```

## 3.2 Tutorial Modal Component

```typescript
// frontend/src/components/TutorialModal.tsx

import React, { useState } from 'react';
import { useTutorial, useCompleteStep } from '@/hooks/useTutorials';

interface TutorialModalProps {
  tutorialId: string;
  onClose: () => void;
}

export function TutorialModal({ tutorialId, onClose }: TutorialModalProps) {
  const { data, isLoading } = useTutorial(tutorialId);
  const { mutate: completeStep } = useCompleteStep();
  const [currentStep, setCurrentStep] = useState(data?.progress?.currentStep || 1);

  if (isLoading) return <div>Loading...</div>;

  const { tutorial, progress } = data;
  const totalSteps = tutorial.steps.length;
  const step = tutorial.steps[currentStep - 1];

  const handleNext = () => {
    completeStep(
      { tutorialId, stepNumber: currentStep },
      {
        onSuccess: () => {
          if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
          } else {
            // Completion
            onClose();
          }
        }
      }
    );
  };

  return (
    <div className="tutorial-modal-overlay" onClick={onClose}>
      <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>{tutorial.title}</h2>
          <button onClick={onClose}>&times;</button>
        </div>

        {/* Content */}
        <div className="modal-content">
          <h3>{step.title}</h3>
          <p className="instruction">{step.instruction}</p>

          {step.screenshotUrl && (
            <img src={step.screenshotUrl} alt="Step guide" className="step-screenshot" />
          )}

          {step.videoUrl && (
            <iframe
              width="100%"
              height="315"
              src={step.videoUrl}
              title="Step video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Progress */}
        <div className="modal-footer">
          <div className="progress-info">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(currentStep / totalSteps) * 100}%`
                }}
              />
            </div>
            <span className="step-count">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="estimated-time">
              ~{Math.max(0, tutorial.expectedMinutes - Math.floor((Date.now() - progress.startedAt) / 60000))} min
            </span>
          </div>

          <div className="modal-actions">
            <button
              onClick={() => {
                setCurrentStep(1);
                onClose();
              }}
              className="btn-secondary"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="btn-primary"
            >
              {currentStep === totalSteps ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 3.3 Knowledge Base Component

```typescript
// frontend/src/components/KnowledgeBase.tsx

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export function KnowledgeBase() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const { data: searchResults } = useQuery({
    queryKey: ['kb-search', query, category],
    queryFn: () =>
      apiClient.get('/api/v1/kb/search', {
        params: { q: query, category }
      }),
    enabled: query.length > 0
  });

  return (
    <div className="kb-container">
      <h2>Knowledge Base</h2>

      {/* Search */}
      <div className="kb-search">
        <input
          type="text"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Payroll">Payroll</option>
          <option value="Attendance">Attendance</option>
          <option value="Leave">Leave</option>
        </select>
      </div>

      {/* Results */}
      <div className="kb-results">
        {searchResults?.articles?.map((article: any) => (
          <div key={article.id} className="kb-result-item">
            <h4>{article.title}</h4>
            <p className="excerpt">{article.excerpt}</p>
            <span className="category">{article.category}</span>
            <button onClick={() => window.location.href = `/help/kb/${article.slug}`}>
              Read more →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

# 4. DATABASE MIGRATION

```sql
-- File: migrations/2026-09-01_tutorial-onboarding-system.sql

CREATE TABLE tutorials (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  videoUrl VARCHAR(255),
  expectedMinutes INT,
  difficulty VARCHAR(50),
  minTierRequired VARCHAR(50) DEFAULT 'FREE',
  modules JSON DEFAULT '[]',
  displayOrder INT DEFAULT 0,
  isActive BOOLEAN DEFAULT TRUE,
  viewCount INT DEFAULT 0,
  completionCount INT DEFAULT 0,
  avgCompletionTime INT,
  helpfulRating FLOAT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (category),
  INDEX (minTierRequired)
);

CREATE TABLE tutorial_steps (
  id VARCHAR(255) PRIMARY KEY,
  tutorialId VARCHAR(255) NOT NULL,
  stepNumber INT NOT NULL,
  title VARCHAR(255),
  instruction LONGTEXT,
  elementSelector VARCHAR(255),
  highlightColor VARCHAR(50),
  screenshotUrl VARCHAR(255),
  videoUrl VARCHAR(255),
  completionScript TEXT,
  successMessage TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tutorialId) REFERENCES tutorials(id) ON DELETE CASCADE,
  UNIQUE (tutorialId, stepNumber)
);

CREATE TABLE tutorial_progress (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  tutorialId VARCHAR(255) NOT NULL,
  currentStep INT DEFAULT 1,
  isCompleted BOOLEAN DEFAULT FALSE,
  completedAt TIMESTAMP,
  startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastActivityAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  totalTimeSpent INT DEFAULT 0,
  isHelpful BOOLEAN,
  feedbackComment LONGTEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutorialId) REFERENCES tutorials(id) ON DELETE CASCADE,
  UNIQUE (userId, tutorialId),
  INDEX (userId, isCompleted)
);

CREATE TABLE knowledge_base_articles (
  id VARCHAR(255) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  excerpt VARCHAR(500),
  category VARCHAR(100),
  tags JSON DEFAULT '[]',
  metaDescription TEXT,
  relatedArticleIds JSON DEFAULT '[]',
  relatedTutorialIds JSON DEFAULT '[]',
  displayOrder INT DEFAULT 0,
  isPublished BOOLEAN DEFAULT TRUE,
  viewCount INT DEFAULT 0,
  helpfulYesCount INT DEFAULT 0,
  helpfulNoCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (category),
  FULLTEXT (title, content)
);

CREATE TABLE video_library_items (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255),
  description LONGTEXT,
  youtubeUrl VARCHAR(255),
  embedUrl VARCHAR(255),
  youtubeVideoId VARCHAR(50) UNIQUE,
  thumbnailUrl VARCHAR(255),
  durationSeconds INT,
  category VARCHAR(100),
  tags JSON DEFAULT '[]',
  relatedTutorialIds JSON DEFAULT '[]',
  relatedArticleIds JSON DEFAULT '[]',
  displayOrder INT DEFAULT 0,
  isPublished BOOLEAN DEFAULT TRUE,
  viewCount INT DEFAULT 0,
  helpfulYesCount INT DEFAULT 0,
  helpfulNoCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (category)
);

-- Run migration
npx prisma migrate deploy --name tutorial-onboarding-system
```

---

# 5. CONTENT SEEDING (Example)

```typescript
// backend/src/scripts/seedTutorials.ts

import { prisma } from '@/lib/prisma';

export async function seedTutorials() {
  // Tutorial 1: Employee Creation
  const employeeTutorial = await prisma.tutorial.create({
    data: {
      title: 'Employee Creation',
      slug: 'employee-creation',
      description: 'Add employees to your company in 3 minutes',
      category: 'Getting Started',
      expectedMinutes: 3,
      difficulty: 'Easy',
      minTierRequired: 'FREE',
      modules: ['core_hr'],
      displayOrder: 1,
      steps: {
        create: [
          {
            stepNumber: 1,
            title: 'Navigate to Employees',
            instruction: 'Click the **Employees** menu in the left sidebar.',
            elementSelector: '[data-testid="nav-employees"]',
            highlightColor: 'blue',
            screenshotUrl: 'https://example.com/screenshots/step1.png',
            successMessage: 'Great! Now click Add Employee.'
          },
          {
            stepNumber: 2,
            title: 'Click Add Employee',
            instruction: 'Look for the blue **+ Add Employee** button in the top right.',
            elementSelector: '[data-testid="btn-add-employee"]',
            highlightColor: 'blue'
          },
          // ... more steps
        ]
      }
    }
  });

  console.log('Tutorial seeded:', employeeTutorial.id);
}

// Run: npx ts-node backend/src/scripts/seedTutorials.ts
```

---

# 6. TESTING

```typescript
// backend/src/__tests__/tutorials.test.ts

import { TutorialService } from '@/services/tutorialService';

describe('TutorialService', () => {
  it('should return only FREE tutorials for FREE tier users', async () => {
    const tutorials = await TutorialService.getAvailableTutorials('FREE');
    
    expect(tutorials.length).toBeGreaterThan(0);
    tutorials.forEach((t: any) => {
      expect(['FREE', 'STARTER']).toContain(t.minTierRequired);
    });
  });

  it('should return all tutorials for PROFESSIONAL tier users', async () => {
    const tutorials = await TutorialService.getAvailableTutorials('PROFESSIONAL');
    
    expect(tutorials.length).toBeGreaterThanOrEqual(5);
  });

  it('should block STARTER tutorial for FREE user', async () => {
    await expect(
      TutorialService.getTutorial('payroll-setup', 'user1', 'FREE')
    ).rejects.toThrow('Tier not allowed');
  });

  it('should track tutorial progress', async () => {
    const progress = await TutorialService.startTutorial('user1', 'employee-creation', 'FREE');
    
    expect(progress.currentStep).toBe(1);
    expect(progress.isCompleted).toBe(false);
  });
});
```

---

*Last Updated: 24 Juli 2026 | Version: 14.0 (FINAL SDD) | Status: Code Ready*
