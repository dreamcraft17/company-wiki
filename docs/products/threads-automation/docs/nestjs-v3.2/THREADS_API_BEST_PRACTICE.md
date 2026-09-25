# THREADS API BEST PRACTICE GUIDE
## 1 Static Token Setup untuk Automated Publishing

---

## 1. TOKEN ACQUISITION & STORAGE (One-Time Setup)

### 1.1 How to Get Initial Access Token (Manual, One-Time)

```
1. Login ke Threads account DN Tech (@dntech atau official account)
2. Go to: https://www.threads.net/settings/apps-and-websites
3. Click "Generate Access Token" (atau use Meta Business Platform)
4. Copy token (long string, starts with EAAB...)
5. Store securely (jangan commit ke Git, jangan print console)
```

**Token Anatomy:**
```
EAAB...[base64 encoded]...[expires_at timestamp]...[signature]
- Expires dalam 60 hari (standard Meta token)
- Tidak auto-refresh
- Perlu manual renewal sebelum expired
```

### 1.2 Secure Storage Pattern

**❌ DON'T:**
```env
# .env
THREADS_ACCESS_TOKEN=EAAB...token...here

# .git/config
token = EAAB...
```

**✅ DO:**
```
AWS Secrets Manager
├─ Secret name: /prod/threads/access-token
├─ Value: EAAB...token...here
├─ Rotation policy: Manual (set reminder 50 days)
├─ Audit logging: Enabled
└─ Access control: Only app-service-role

Database (encrypted)
├─ Table: third_party_tokens
├─ Columns: 
│   ├─ provider (threads)
│   ├─ token (AES-256 encrypted)
│   ├─ acquired_at (timestamp)
│   ├─ expires_at (timestamp)
│   ├─ last_used_at (timestamp)
│   └─ rotation_needed (boolean)
└─ Index: expires_at (for renewal alerts)
```

### 1.3 NestJS Implementation

```typescript
# src/config/threads-config.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class ThreadsConfigService {
  private secretsManager: AWS.SecretsManager;
  private cachedToken: string | null = null;
  private cachedTokenExpiry: number | null = null;
  
  constructor(private configService: ConfigService) {
    this.secretsManager = new AWS.SecretsManager({
      region: this.configService.get('AWS_REGION'),
    });
  }
  
  /**
   * Get Threads access token from AWS Secrets Manager
   * With local caching (5 min TTL) to avoid excessive API calls
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now();
    
    // Return cached token if still valid
    if (this.cachedToken && this.cachedTokenExpiry && now < this.cachedTokenExpiry) {
      return this.cachedToken;
    }
    
    // Fetch from AWS Secrets Manager
    const secretName = `/prod/threads/access-token`;
    
    try {
      const secret = await this.secretsManager
        .getSecretValue({ SecretId: secretName })
        .promise();
      
      const token = secret.SecretString || '';
      
      // Cache for 5 minutes
      this.cachedToken = token;
      this.cachedTokenExpiry = now + (5 * 60 * 1000);
      
      // Log token fetch (audit trail)
      await this.logTokenAccess('fetch', 'success');
      
      return token;
    } catch (error) {
      await this.logTokenAccess('fetch', 'failed', error.message);
      throw new Error(`Failed to get Threads access token: ${error.message}`);
    }
  }
  
  /**
   * Get token expiry from database
   * Triggers alert if expires within 7 days
   */
  async checkTokenExpiry(db: PrismaService): Promise<{
    expiresAt: Date;
    daysRemaining: number;
    needsRotation: boolean;
  }> {
    const token = await db.thirdPartyToken.findFirst({
      where: { provider: 'threads' },
      orderBy: { acquiredAt: 'desc' },
    });
    
    if (!token) {
      throw new Error('Threads token not found in database');
    }
    
    const now = new Date();
    const daysRemaining = Math.floor(
      (token.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const needsRotation = daysRemaining <= 7;
    
    // Alert if needs rotation soon
    if (needsRotation) {
      await this.alertTokenExpiry(daysRemaining);
    }
    
    return {
      expiresAt: token.expiresAt,
      daysRemaining,
      needsRotation,
    };
  }
  
  /**
   * Log token access for audit trail
   */
  private async logTokenAccess(
    action: 'fetch' | 'use' | 'refresh',
    status: 'success' | 'failed',
    error?: string,
  ): Promise<void> {
    console.log(`[Threads Token] ${action} - ${status}${error ? ': ' + error : ''}`);
    
    // Send to DataDog/monitoring
    // await monitoringService.log({
    //   event: 'threads_token_access',
    //   action,
    //   status,
    //   error,
    //   timestamp: new Date(),
    // });
  }
  
  private async alertTokenExpiry(daysRemaining: number): Promise<void> {
    console.warn(
      `[ALERT] Threads token expires in ${daysRemaining} days. Manual renewal required!`
    );
    
    // Send Slack alert
    // await slackService.send({
    //   channel: '#threads-automation-alerts',
    //   message: `⚠️ Threads access token expires in ${daysRemaining} days. Go to threads.net/settings/apps to renew.`,
    // });
  }
}
```

---

## 2. THREADS API SERVICE (Best Practices)

### 2.1 Service Implementation

```typescript
# src/threads-api/threads-api.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ThreadsConfigService } from '../config/threads-config.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ThreadsAPIService {
  private readonly logger = new Logger(ThreadsAPIService.name);
  private readonly THREADS_API_URL = 'https://graph.threads.net/v1.0';
  private readonly MAX_RETRIES = 3;
  private readonly RATE_LIMIT_BUFFER = 10; // Keep 10 posts buffer
  
  constructor(
    private http: HttpService,
    private configService: ThreadsConfigService,
    private prisma: PrismaService,
  ) {}
  
  /**
   * Create media container (Step 1 of 2-step publish)
   * 
   * Best Practice:
   * - Always validate input (max 500 chars for text)
   * - Handle rate limiting (250 posts/24h)
   * - Log all requests (audit trail)
   * - Retry with exponential backoff
   */
  async createContainer(payload: {
    mediaType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL';
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
  }): Promise<{ id: string }> {
    // Validate input
    if (!payload.text && !payload.imageUrl && !payload.videoUrl) {
      throw new Error('Must provide text, imageUrl, or videoUrl');
    }
    
    if (payload.text && payload.text.length > 500) {
      throw new Error('Text must be <= 500 characters');
    }
    
    // Check rate limit before attempting publish
    const canPublish = await this.checkRateLimit();
    if (!canPublish) {
      throw new Error('Threads rate limit (250/24h) would be exceeded');
    }
    
    const token = await this.configService.getAccessToken();
    const userId = process.env.THREADS_USER_ID;
    const url = `${this.THREADS_API_URL}/${userId}/threads`;
    
    const data = {
      media_type: payload.mediaType,
      ...(payload.text && { text: payload.text }),
      ...(payload.imageUrl && { image_url: payload.imageUrl }),
      ...(payload.videoUrl && { video_url: payload.videoUrl }),
      access_token: token,
    };
    
    return await this.retryableRequest('POST', url, data);
  }
  
  /**
   * Publish container (Step 2 of 2-step publish)
   * 
   * Best Practice:
   * - Only call after successful container creation
   * - Handle idempotency (same creation_id can be called multiple times safely)
   * - Log response (threads_post_id for tracking)
   * - Atomic transaction (create container + publish in same transaction)
   */
  async publishContainer(creationId: string): Promise<{ id: string }> {
    const token = await this.configService.getAccessToken();
    const userId = process.env.THREADS_USER_ID;
    const url = `${this.THREADS_API_URL}/${userId}/threads_publish`;
    
    const data = {
      creation_id: creationId,
      access_token: token,
    };
    
    try {
      const response = await this.retryableRequest('POST', url, data);
      this.logger.log(`Published post: ${response.id}`);
      return response;
    } catch (error) {
      this.logger.error(`Publish failed for creation_id: ${creationId}`, error);
      throw error;
    }
  }
  
  /**
   * Atomic publish (create + publish in 1 call)
   * 
   * Best Practice:
   * - Idempotent: safe to retry if fails partway
   * - Logs both steps
   * - Cleans up if publish fails (delete container)
   * - Transaction: all-or-nothing
   */
  async publishPost(text: string): Promise<{ id: string }> {
    let containerId: string | null = null;
    
    try {
      // Step 1: Create container
      const container = await this.createContainer({
        mediaType: 'TEXT',
        text,
      });
      containerId = container.id;
      
      this.logger.log(`Container created: ${containerId}`);
      
      // Step 2: Publish
      const published = await this.publishContainer(containerId);
      
      this.logger.log(`Post published: ${published.id}`);
      return published;
    } catch (error) {
      // Cleanup if publish failed
      if (containerId) {
        try {
          await this.deleteContainer(containerId);
          this.logger.log(`Cleaned up container: ${containerId}`);
        } catch (cleanupError) {
          this.logger.warn(`Failed to cleanup container: ${cleanupError.message}`);
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Delete container (cleanup on error)
   * 
   * Best Practice:
   * - Call on publish failure
   * - Don't throw if delete fails (already in error state)
   */
  private async deleteContainer(creationId: string): Promise<void> {
    const token = await this.configService.getAccessToken();
    const userId = process.env.THREADS_USER_ID;
    const url = `${this.THREADS_API_URL}/${creationId}`;
    
    try {
      await this.http
        .delete(url, {
          params: { access_token: token },
        })
        .toPromise();
    } catch (error) {
      // Don't throw - already in error recovery mode
      this.logger.warn(`Failed to delete container ${creationId}: ${error.message}`);
    }
  }
  
  /**
   * Check rate limit (250 posts per 24 hours)
   * 
   * Best Practice:
   * - Query last 24h post count
   * - Keep buffer (default 10 posts)
   * - Alert if approaching limit
   */
  private async checkRateLimit(): Promise<boolean> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const publishedCount = await this.prisma.threadsPost.count({
      where: {
        publishedAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });
    
    const remainingCapacity = 250 - publishedCount;
    const canPublish = remainingCapacity > this.RATE_LIMIT_BUFFER;
    
    if (remainingCapacity <= this.RATE_LIMIT_BUFFER) {
      this.logger.warn(
        `Approaching rate limit: ${publishedCount}/250 posts in 24h`
      );
      // Alert team via Slack
    }
    
    return canPublish;
  }
  
  /**
   * Retryable HTTP request with exponential backoff
   * 
   * Best Practice:
   * - Retry on 5xx errors (server issues)
   * - Don't retry on 4xx (client issues, won't fix)
   * - Exponential backoff: 1s, 2s, 4s
   * - Log each attempt
   * - Track retry metrics
   */
  private async retryableRequest(
    method: 'POST' | 'GET' | 'DELETE',
    url: string,
    data?: any,
  ): Promise<any> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        this.logger.log(`[${method}] ${url} (attempt ${attempt}/${this.MAX_RETRIES})`);
        
        let response;
        if (method === 'POST') {
          response = await this.http.post(url, data).toPromise();
        } else if (method === 'GET') {
          response = await this.http.get(url, { params: data }).toPromise();
        } else if (method === 'DELETE') {
          response = await this.http.delete(url, { params: data }).toPromise();
        }
        
        return response.data;
      } catch (error) {
        lastError = error;
        
        // Don't retry on 4xx errors (client fault)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          this.logger.error(
            `[${method}] ${url} failed (HTTP ${error.response.status}): ${error.message}`
          );
          throw error;
        }
        
        // Retry on 5xx or network errors
        if (attempt < this.MAX_RETRIES) {
          const backoffMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          this.logger.warn(
            `[${method}] ${url} failed (attempt ${attempt}), retrying in ${backoffMs}ms`
          );
          await this.sleep(backoffMs);
        }
      }
    }
    
    // All retries exhausted
    this.logger.error(
      `[${method}] ${url} failed after ${this.MAX_RETRIES} attempts`
    );
    throw lastError;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 3. SCHEDULER/CRON JOB (Best Practices)

### 3.1 Reliable Publishing Workflow

```typescript
# src/scheduling/publish.scheduler.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { ThreadsAPIService } from '../threads-api/threads-api.service';

@Injectable()
export class PublishScheduler {
  private readonly logger = new Logger(PublishScheduler.name);
  
  constructor(
    private prisma: PrismaService,
    private threadsAPI: ThreadsAPIService,
  ) {}
  
  /**
   * Every 1 minute, check for posts ready to publish
   * 
   * Best Practice:
   * - Frequent polling (1 min) for near-real-time
   * - Process in batches (10 posts max per cycle)
   * - FIFO order (oldest first)
   * - Idempotent: safe to run multiple times
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduledPosts(): Promise<void> {
    const startTime = Date.now();
    this.logger.log('Starting publish cycle');
    
    try {
      const now = new Date();
      
      // Get posts ready to publish (batch of 10)
      const pendingPosts = await this.prisma.threadsPost.findMany({
        where: {
          approvalStatus: 'approved',
          scheduledAt: { lte: now },
          publishedAt: null,
          publishFailureCount: { lt: 3 }, // Don't retry > 3 times
        },
        orderBy: { scheduledAt: 'asc' }, // FIFO
        take: 10, // Max 10 per cycle
      });
      
      this.logger.log(`Found ${pendingPosts.length} posts to publish`);
      
      // Process each post
      for (const post of pendingPosts) {
        await this.publishSinglePost(post.id, post.generatedText);
      }
      
      const duration = Date.now() - startTime;
      this.logger.log(`Publish cycle completed in ${duration}ms`);
      
    } catch (error) {
      this.logger.error(`Publish cycle failed: ${error.message}`, error.stack);
      // Send alert but don't crash
      await this.alertPublishFailure(error);
    }
  }
  
  /**
   * Publish single post with retry logic
   * 
   * Best Practice:
   * - Atomic transaction (publish + update status together)
   * - Track failure count (max 3 retries)
   * - Log detailed error info
   * - Update database ONLY after successful publish
   */
  private async publishSinglePost(postId: string, text: string): Promise<void> {
    try {
      this.logger.log(`Publishing post ${postId}`);
      
      // Call Threads API (with internal retries)
      const published = await this.threadsAPI.publishPost(text);
      
      // Update database atomically
      await this.prisma.threadsPost.update({
        where: { id: postId },
        data: {
          approvalStatus: 'published',
          publishedAt: new Date(),
          threadsPostId: published.id,
          publishFailureCount: 0, // Reset on success
        },
      });
      
      this.logger.log(
        `Post ${postId} published successfully (threads_id: ${published.id})`
      );
      
    } catch (error) {
      this.logger.error(
        `Failed to publish post ${postId}: ${error.message}`
      );
      
      // Increment failure count
      const post = await this.prisma.threadsPost.findUnique({
        where: { id: postId },
      });
      
      const newFailureCount = (post?.publishFailureCount || 0) + 1;
      
      // Update with failure info
      await this.prisma.threadsPost.update({
        where: { id: postId },
        data: {
          publishFailureCount: newFailureCount,
          publishLastError: error.message,
          publishLastErrorAt: new Date(),
          // Mark as failed if > 3 attempts
          ...(newFailureCount >= 3 && {
            approvalStatus: 'publish_failed',
          }),
        },
      });
      
      // Alert on repeated failures
      if (newFailureCount >= 3) {
        await this.alertPublishFailed(postId, error);
      }
    }
  }
  
  /**
   * Monitoring & Alerting
   */
  private async alertPublishFailure(error: any): Promise<void> {
    // Send to Slack
    // await slackService.send({
    //   channel: '#threads-automation-alerts',
    //   message: `❌ Publish cycle failed: ${error.message}`,
    //   severity: 'high',
    // });
    
    // Send to monitoring system
    // await monitoringService.recordError({
    //   service: 'publish-scheduler',
    //   error: error.message,
    //   timestamp: new Date(),
    // });
  }
  
  private async alertPublishFailed(postId: string, error: any): Promise<void> {
    // await slackService.send({
    //   channel: '#threads-automation-alerts',
    //   message: `⚠️ Post ${postId} failed after 3 retries: ${error.message}`,
    //   severity: 'medium',
    // });
  }
}
```

---

## 4. ERROR HANDLING & SCENARIOS

### 4.1 Error Matrix

| Error | HTTP Code | Retry? | Action |
|-------|-----------|--------|--------|
| Network timeout | - | ✅ Yes (3x) | Backoff 1s,2s,4s |
| Server error | 5xx | ✅ Yes (3x) | Backoff 1s,2s,4s |
| Rate limited | 429 | ✅ Yes (with delay) | Wait 60s, retry 1x |
| Invalid token | 401 | ❌ No | Alert team, manual renewal |
| Invalid text | 400 | ❌ No | Log error, skip post |
| Unknown error | Other | ❌ No | Log, skip, alert |

### 4.2 Database Schema for Tracking

```prisma
model ThreadsPost {
  // ... existing fields
  
  // Publishing tracking
  publishFailureCount    Int       @default(0)
  publishLastError       String?
  publishLastErrorAt     DateTime?
  publishAttempts        Int       @default(0)
  
  @@index([publishFailureCount])
  @@index([publishLastErrorAt])
}

model ThreadsPublishLog {
  id              String    @id @default(cuid())
  postId          String
  attempt         Int
  statusCode      Int?
  errorMessage    String?
  retryAfter      DateTime?
  duration_ms     Int
  timestamp       DateTime  @default(now())
  
  post            ThreadsPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@index([postId])
  @@index([timestamp])
  @@index([statusCode])
}
```

---

## 5. MONITORING & ALERTING

### 5.1 Metrics to Track

```typescript
// src/monitoring/threads-metrics.service.ts

class ThreadsMetrics {
  // Daily metrics
  totalPostsPublished: number;      // Count
  publishSuccessRate: number;       // %
  averagePublishLatency: number;    // ms
  
  // Error metrics
  publishErrors: number;            // Count last 24h
  retryCount: number;               // Total retries
  failedPosts: number;              // Posts > 3 failures
  
  // Rate limit
  postsPublishedToday: number;      // of 250 limit
  remainingCapacity: number;        // Buffer tracking
  
  // Token health
  tokenDaysRemaining: number;       // Until renewal
  tokenLastUsed: Date;              // Freshness
}
```

### 5.2 Alerting Rules

```
🟢 All Good
├─ publishSuccessRate > 99%
├─ publishErrors < 5/day
└─ tokenDaysRemaining > 7

🟡 Warning
├─ publishSuccessRate 95-99%
├─ publishErrors 5-10/day
├─ tokenDaysRemaining 3-7 days
└─ Threads API > 100ms latency

🔴 Critical
├─ publishSuccessRate < 95%
├─ publishErrors > 10/day
├─ tokenDaysRemaining < 3 days
├─ Threads API unreachable
└─ rateLimit remaining < 10 posts
```

---

## 6. SETUP CHECKLIST

### One-Time Setup

- [ ] Get Threads access token from @dntech account
- [ ] Store in AWS Secrets Manager (`/prod/threads/access-token`)
- [ ] Set THREADS_USER_ID in .env (DN Tech account ID)
- [ ] Create `third_party_tokens` table (for expiry tracking)
- [ ] Create `threads_publish_log` table (for audit trail)
- [ ] Setup Slack alert channel (#threads-automation-alerts)
- [ ] Setup DataDog monitoring dashboard
- [ ] Configure token expiry reminder (calendar: 50 days from now)

### Monitoring Setup

- [ ] Setup synthetic test (publish 1 test post daily)
- [ ] Setup DataDog dashboard (publish success rate, latency)
- [ ] Setup Slack alerts (for errors, rate limit, token expiry)
- [ ] Setup PagerDuty (optional, for critical failures)

### Testing

- [ ] Test publish flow end-to-end
- [ ] Test retry logic (simulate API failures)
- [ ] Test rate limit handling
- [ ] Test token expiry alert
- [ ] Load test (publish 100+ posts rapidly)

---

## 7. TROUBLESHOOTING

### Token Expired (401 Unauthorized)
```
1. Go to Threads settings: https://www.threads.net/settings/apps
2. Click "Generate New Token"
3. Copy new token
4. Update AWS Secrets Manager with new token
5. Done (no code changes needed!)
```

### Rate Limit Hit (429)
```
Problem: 250 posts in 24h limit exceeded
Solution: 
  1. Check current count: SELECT COUNT(*) FROM threads_posts WHERE published_at > NOW() - 24h
  2. Wait for oldest posts to roll out of 24h window
  3. Schedule future posts after capacity available
```

### Publish Repeatedly Failing
```
Check:
1. Is token still valid? (check DataDog, token age)
2. Is text > 500 chars? (check DB for post.generatedText)
3. Is Threads API down? (check status.threads.net)
4. Check publish logs for specific error code (400/500/etc)
```

---

## 8. SUMMARY: Architecture

```
┌─────────────────────┐
│   Web (Admin UI)    │ ← Dozer: Approve posts, schedule
│  (Input topics)     │
└──────────┬──────────┘
           │
       (API)│ PUT /api/v1/posts/{id}/schedule
           │
┌──────────▼──────────────────────┐
│   NestJS Backend                │
├─────────────────────────────────┤
│ ├─ Threads Config Service       │ ← AWS Secrets Mgr
│ ├─ Threads API Service          │ ← Retry logic, rate limit
│ └─ Publish Scheduler (1min)     │ ← Idempotent, atomic
└──────────┬──────────────────────┘
           │
    Every 1 minute
           │
┌──────────▼──────────────────────┐
│  1. Check scheduled posts       │
│  2. Create Threads container    │ ← Step 1
│  3. Publish container           │ ← Step 2
│  4. Update database (atomic)    │
└──────────┬──────────────────────┘
           │
    ┌──────▼──────┐
    │ Threads API │ ← graph.threads.net/v1.0
    └─────────────┘
           │
    ┌──────▼──────────────┐
    │ @dntech Threads     │ ← 1 static token
    │ (Official account)  │
    └─────────────────────┘
```

**Key Points:**
- ✅ 1 static token (no OAuth, no multi-user)
- ✅ Worker cron publishes on schedule
- ✅ Atomic publishing (create + publish = transaction)
- ✅ Retry logic with backoff
- ✅ Rate limit protection (250/24h)
- ✅ Token expiry monitoring
- ✅ Audit trail (all attempts logged)

---

**Document Version:** v3.1  
**Created:** 2026-09-13  
**Status:** Production-Ready Best Practices  
**Type:** Static Token Architecture (1 bot account)
