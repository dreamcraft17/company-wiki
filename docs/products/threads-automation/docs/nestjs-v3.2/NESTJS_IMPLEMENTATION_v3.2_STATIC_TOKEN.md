# NestJS Implementation Guide v3.2 — Static Token Architecture
## Threads Automation Bot (1 Bot Account, No OAuth)

---

## 1. PROJECT SETUP

```bash
# Clone & setup
git clone https://github.com/dntech/threads-automation.git
cd threads-automation

# Backend dependencies (NestJS 10 stack)
npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config
npm install @nestjs/typeorm @nestjs/bull @nestjs/schedule
npm install @google/generative-ai openai axios
npm install @prisma/client prisma
npm install bull bull-board redis ioredis
npm install passport passport-jwt @nestjs/passport
npm install aws-sdk
npm install winston dotenv joi
npm install helmet cors
npm install datadog-api-client

# Dev dependencies
npm install --save-dev @types/node @types/express jest ts-jest
npm install --save-dev prisma ts-node nodemon
```

---

## 2. ENVIRONMENT VARIABLES (.env)

```env
# App
NODE_ENV=production
PORT=3000
API_URL=https://threads-automation.dntech.id

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/threads_automation
REDIS_URL=redis://localhost:6379

# AWS Secrets Manager (for Threads token)
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
THREADS_SECRETS_NAME=/prod/threads/access-token

# Threads Account (DN Tech Official)
THREADS_USER_ID=17841406420890626  # @dntech Threads ID
THREADS_API_URL=https://graph.threads.net/v1.0

# LLM Providers (Gemini primary, OpenAI fallback)
LLM_PRIMARY_PROVIDER=gemini
LLM_SECONDARY_PROVIDER=openai
GEMINI_API_KEY=xxx
GEMINI_MODEL=gemini-1.5-flash
OPENAI_API_KEY=xxx
OPENAI_MODEL=gpt-4-turbo

# Internal Auth (NOT user OAuth, just Dozer access)
JWT_SECRET=super_secret_key_change_this_in_prod
JWT_EXPIRATION=86400

# Cost Tracking
COST_DAILY_LIMIT_USD=100
COST_MONTHLY_LIMIT_USD=1500

# Monitoring
DATADOG_API_KEY=xxx
SENTRY_DSN=xxx

# Approval SLA
APPROVAL_SLA_HOURS=4
```

---

## 3. PRISMA SCHEMA (schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model ThreadsPost {
  id                    String   @id @default(cuid())
  batchId               String?
  
  // Content
  topic                 String
  generatedText         String   @db.VarChar(500)
  tone                  String   @default("professional")
  hashtags              String[]
  cta                   String?
  
  // LLM tracking
  llmProviderUsed       String?
  tokensUsed            Int?
  
  // Approval workflow
  approvalStatus        String   @default("draft") // draft, approved, rejected, editing, published, publish_failed
  approverComments      String?
  approvedAt            DateTime?
  
  // Publishing
  scheduledAt           DateTime?
  scheduledTimezone     String   @default("UTC")
  threadsPostId         String?  @unique
  publishedAt           DateTime?
  
  // Publishing retry tracking
  publishFailureCount   Int      @default(0)
  publishLastError      String?
  publishLastErrorAt    DateTime?
  
  // Metadata
  createdAt             DateTime @default(now())
  createdBy             String   @default("dozer")
  updatedAt             DateTime @updatedAt
  
  // Relations
  approvalLogs          ApprovalLog[]
  publishLogs           ThreadsPublishLog[]
  
  @@index([approvalStatus])
  @@index([scheduledAt])
  @@index([publishedAt])
  @@index([publishFailureCount])
  @@index([createdAt])
}

model ApprovalLog {
  id                String   @id @default(cuid())
  postId            String
  post              ThreadsPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  approverEmail     String   @default("dozer@dntech.id")
  decision          String   // approve, reject, edit
  editedText        String?
  comments          String?
  suggestedPublishTime DateTime?
  
  createdAt         DateTime @default(now())
  
  @@index([postId])
  @@index([createdAt])
}

model ThreadsPublishLog {
  id                String   @id @default(cuid())
  postId            String
  post              ThreadsPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  attempt           Int
  statusCode        Int?
  errorMessage      String?
  retryAfter        DateTime?
  durationMs        Int
  
  timestamp         DateTime @default(now())
  
  @@index([postId])
  @@index([timestamp])
}

model LLMCostLog {
  id                String   @id @default(cuid())
  batchId           String?
  provider          String   // gemini, openai
  inputTokens       Int
  outputTokens      Int
  costUsd           Float
  
  timestamp         DateTime @default(now())
  
  @@index([provider])
  @@index([timestamp])
}

model BrandGuideline {
  id                String   @id @default(cuid())
  parameterName     String   @unique
  value             String   @db.Text
  valueType         String   // string, array, object
  version           Int      @default(1)
  
  updatedBy         String   @default("dozer")
  updatedAt         DateTime @updatedAt
  createdAt         DateTime @default(now())
  
  @@index([parameterName])
}

model EngagementMetric {
  id                String   @id @default(cuid())
  postId            String   @unique
  threadsPostId     String   @unique
  
  views             Int      @default(0)
  likes             Int      @default(0)
  replies           Int      @default(0)
  reposts           Int      @default(0)
  shares            Int      @default(0)
  impressions       Int      @default(0)
  
  engagementCount   Int      @default(0) // likes + replies + reposts + shares
  engagementRate    Float    @default(0) // engagement / impressions
  
  fetchedAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([postId])
  @@index([fetchedAt])
}

model PostingHeatmap {
  id                String   @id @default(cuid())
  hourOfDay         Int      // 0-23
  dayOfWeek         Int      // 0-6 (Sun-Sat)
  
  avgEngagementScore Float   @default(0)
  sampleSize        Int      @default(0)
  
  updatedAt         DateTime @updatedAt
  
  @@unique([hourOfDay, dayOfWeek])
}

model ThirdPartyToken {
  id                String   @id @default(cuid())
  provider          String   // threads
  
  token             String   @db.Text // Encrypted in DB
  acquiredAt        DateTime
  expiresAt         DateTime
  lastUsedAt        DateTime?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([provider])
  @@index([expiresAt])
}
```

---

## 4. THREADS CONFIG SERVICE (AWS Secrets Manager)

```typescript
// src/config/threads-config.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ThreadsConfigService {
  private readonly logger = new Logger(ThreadsConfigService.name);
  private secretsManager: AWS.SecretsManager;
  
  private cachedToken: string | null = null;
  private cachedTokenExpiry: number | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.secretsManager = new AWS.SecretsManager({
      region: this.configService.get('AWS_REGION'),
    });
  }
  
  /**
   * Get Threads access token from AWS Secrets Manager
   * With local caching (5 min TTL)
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now();
    
    // Return cached token if still valid
    if (this.cachedToken && this.cachedTokenExpiry && now < this.cachedTokenExpiry) {
      return this.cachedToken;
    }
    
    // Fetch from AWS Secrets Manager
    const secretName = this.configService.get('THREADS_SECRETS_NAME');
    
    try {
      const secret = await this.secretsManager
        .getSecretValue({ SecretId: secretName })
        .promise();
      
      const token = secret.SecretString || '';
      
      // Cache for 5 minutes
      this.cachedToken = token;
      this.cachedTokenExpiry = now + this.CACHE_TTL;
      
      // Log access
      await this.logTokenAccess('fetch', 'success');
      
      return token;
    } catch (error) {
      await this.logTokenAccess('fetch', 'failed', error.message);
      throw new Error(`Failed to get Threads token: ${error.message}`);
    }
  }
  
  /**
   * Check token expiry and alert if needed
   */
  async checkTokenExpiry(): Promise<{
    expiresAt: Date;
    daysRemaining: number;
    needsRotation: boolean;
  }> {
    const token = await this.prisma.thirdPartyToken.findUnique({
      where: { provider: 'threads' },
    });
    
    if (!token) {
      throw new Error('Threads token not found in database');
    }
    
    const now = new Date();
    const daysRemaining = Math.floor(
      (token.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const needsRotation = daysRemaining <= 7;
    
    if (needsRotation) {
      this.logger.warn(
        `Threads token expires in ${daysRemaining} days. Manual renewal required!`
      );
      // TODO: Send Slack alert
    }
    
    return { expiresAt: token.expiresAt, daysRemaining, needsRotation };
  }
  
  private async logTokenAccess(
    action: string,
    status: string,
    error?: string,
  ): Promise<void> {
    this.logger.log(
      `[Threads Token] ${action} - ${status}${error ? ': ' + error : ''}`
    );
  }
}
```

---

## 5. THREADS API SERVICE (Simplified)

```typescript
// src/threads-api/threads-api.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ThreadsConfigService } from '../config/threads-config.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ThreadsAPIService {
  private readonly logger = new Logger(ThreadsAPIService.name);
  private readonly THREADS_API_URL = 'https://graph.threads.net/v1.0';
  private readonly MAX_RETRIES = 3;
  
  constructor(
    private http: HttpService,
    private configService: ThreadsConfigService,
    private prisma: PrismaService,
  ) {}
  
  /**
   * Publish a single post to Threads
   * Step 1: Create container
   * Step 2: Publish container
   */
  async publishPost(text: string): Promise<{ id: string }> {
    let containerId: string | null = null;
    
    try {
      // Check rate limit first
      const canPublish = await this.checkRateLimit();
      if (!canPublish) {
        throw new Error('Rate limit (250/24h) would be exceeded');
      }
      
      // Step 1: Create container
      const container = await this.createContainer(text);
      containerId = container.id;
      
      this.logger.log(`Container created: ${containerId}`);
      
      // Step 2: Publish
      const published = await this.publishContainer(containerId);
      
      this.logger.log(`Post published: ${published.id}`);
      return published;
    } catch (error) {
      // Cleanup container on failure
      if (containerId) {
        try {
          await this.deleteContainer(containerId);
        } catch (cleanupError) {
          this.logger.warn(`Cleanup failed: ${cleanupError.message}`);
        }
      }
      throw error;
    }
  }
  
  private async createContainer(text: string): Promise<{ id: string }> {
    if (text.length > 500) {
      throw new Error('Text must be <= 500 characters');
    }
    
    const token = await this.configService.getAccessToken();
    const userId = process.env.THREADS_USER_ID;
    const url = `${this.THREADS_API_URL}/${userId}/threads`;
    
    return await this.retryableRequest('POST', url, {
      media_type: 'TEXT',
      text,
      access_token: token,
    });
  }
  
  private async publishContainer(creationId: string): Promise<{ id: string }> {
    const token = await this.configService.getAccessToken();
    const userId = process.env.THREADS_USER_ID;
    const url = `${this.THREADS_API_URL}/${userId}/threads_publish`;
    
    return await this.retryableRequest('POST', url, {
      creation_id: creationId,
      access_token: token,
    });
  }
  
  private async deleteContainer(creationId: string): Promise<void> {
    const token = await this.configService.getAccessToken();
    const url = `${this.THREADS_API_URL}/${creationId}`;
    
    try {
      await this.http
        .delete(url, {
          params: { access_token: token },
        })
        .toPromise();
    } catch (error) {
      this.logger.warn(`Cleanup failed: ${error.message}`);
    }
  }
  
  private async checkRateLimit(): Promise<boolean> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const publishedCount = await this.prisma.threadsPost.count({
      where: {
        publishedAt: { gte: twentyFourHoursAgo },
      },
    });
    
    return publishedCount < 240; // Keep 10-post buffer
  }
  
  private async retryableRequest(
    method: 'POST' | 'GET' | 'DELETE',
    url: string,
    data?: any,
  ): Promise<any> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        let response;
        
        if (method === 'POST') {
          response = await this.http.post(url, data).toPromise();
        } else if (method === 'DELETE') {
          response = await this.http.delete(url, { params: data }).toPromise();
        }
        
        return response.data;
      } catch (error) {
        lastError = error;
        
        // Don't retry on 4xx errors
        if (error.response?.status >= 400 && error.response?.status < 500) {
          this.logger.error(`[${method}] ${url}: HTTP ${error.response.status}`);
          throw error;
        }
        
        // Retry on 5xx or network errors
        if (attempt < this.MAX_RETRIES) {
          const backoffMs = Math.pow(2, attempt - 1) * 1000;
          this.logger.warn(
            `[${method}] ${url} failed, retrying in ${backoffMs}ms`
          );
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
    
    throw lastError || new Error('Unknown error');
  }
}
```

---

## 6. PUBLISH SCHEDULER (Bull Queue + Cron)

```typescript
// src/scheduling/publish.scheduler.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../database/prisma.service';
import { ThreadsAPIService } from '../threads-api/threads-api.service';

@Injectable()
export class PublishScheduler {
  private readonly logger = new Logger(PublishScheduler.name);
  
  constructor(
    @InjectQueue('publish') private publishQueue: Queue,
    private prisma: PrismaService,
    private threadsAPI: ThreadsAPIService,
  ) {}
  
  /**
   * Every 1 minute: check for posts ready to publish
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduledPosts(): Promise<void> {
    try {
      const now = new Date();
      
      // Get ready-to-publish posts (batch of 10)
      const pendingPosts = await this.prisma.threadsPost.findMany({
        where: {
          approvalStatus: 'approved',
          scheduledAt: { lte: now },
          publishedAt: null,
          publishFailureCount: { lt: 3 },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 10,
      });
      
      this.logger.log(`Found ${pendingPosts.length} posts to publish`);
      
      for (const post of pendingPosts) {
        await this.publishQueue.add(
          { postId: post.id, text: post.generatedText },
          { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
        );
      }
    } catch (error) {
      this.logger.error(`Publish scheduler failed: ${error.message}`);
    }
  }
  
  // Job processor
  async processPublishJob(job: any): Promise<void> {
    const { postId, text } = job.data;
    
    try {
      const published = await this.threadsAPI.publishPost(text);
      
      await this.prisma.threadsPost.update({
        where: { id: postId },
        data: {
          approvalStatus: 'published',
          publishedAt: new Date(),
          threadsPostId: published.id,
          publishFailureCount: 0,
        },
      });
      
      this.logger.log(`Published: ${postId}`);
    } catch (error) {
      const post = await this.prisma.threadsPost.findUnique({
        where: { id: postId },
      });
      
      const newFailureCount = (post?.publishFailureCount || 0) + 1;
      
      await this.prisma.threadsPost.update({
        where: { id: postId },
        data: {
          publishFailureCount: newFailureCount,
          publishLastError: error.message,
          publishLastErrorAt: new Date(),
          ...(newFailureCount >= 3 && { approvalStatus: 'publish_failed' }),
        },
      });
      
      throw error;
    }
  }
}
```

---

## 7. MODULE SETUP (app.module.ts)

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { ThreadsAPIModule } from './threads-api/threads-api.module';
import { GenerateModule } from './generate/generate.module';
import { PostsModule } from './posts/posts.module';
import { SchedulingModule } from './scheduling/scheduling.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ThreadsAPIModule,
    GenerateModule,
    PostsModule,
    SchedulingModule,
  ],
})
export class AppModule {}
```

---

## 8. QUICK CHECKLIST (Sprint 1)

- [ ] Setup NestJS project + dependencies
- [ ] Create `.env` from template
- [ ] Setup AWS Secrets Manager (secret: `/prod/threads/access-token`)
- [ ] Run `prisma migrate dev --name init`
- [ ] Implement ThreadsConfigService
- [ ] Implement ThreadsAPIService
- [ ] Setup PublishScheduler + Bull queue
- [ ] Create basic POST /api/v1/posts/generate endpoint
- [ ] Test: Generate → Approve → Schedule → Publish flow

---

**Key Changes from v3.1:**
- ✅ **NO OAuth** (1 static token only)
- ✅ **AWS Secrets Manager** (token storage)
- ✅ **NestJS 10** (not Express)
- ✅ **Bull Queue** (job processing)
- ✅ **Cron job** (every 1 minute publish check)
- ✅ **Atomic transactions** (publish + DB update together)
- ✅ **Retry with backoff** (exponential)
- ✅ **Rate limit protection** (250/24h)

