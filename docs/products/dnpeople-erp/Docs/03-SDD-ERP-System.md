# SYSTEM DESIGN DOCUMENT (SDD)
## dnPeople - Enterprise Resource Planning System

**Version:** 1.0 Enterprise Ready  
**Date:** June 2026 · **Implementation sync:** 7 Juli 2026  
**Status:** Target architecture — **Phase 1–4 implemented** as modular monolith

> ### ⚙️ Implementasi Aktual vs SDD Target
> | Aspek | SDD (target) | Codebase (actual Jul 2026) |
> |-------|--------------|----------------------------|
> | Backend framework | Express.js | **NestJS 10** modular monolith |
> | Services | 12 microservices | **24 modules** + registry scaffold |
> | Multi-tenant | Schema-per-tenant | Row-level + optional schema mode |
> | Deploy | K8s 12 services | **Prod Docker/Helm/Terraform ready** |
>
> SDD tetap valid sebagai **target arsitektur jangka panjang**. Status live: [`12-PROJECT-STATUS.md`](12-PROJECT-STATUS.md).

---

## 1. DESIGN OVERVIEW

### 1.1 Architecture Philosophy
- **Cloud-Native**: Designed for cloud deployment (AWS, GCP, Azure)
- **Microservices**: Modular, independently deployable services
- **Multi-Tenant**: Isolated data per tenant, shared infrastructure
- **API-First**: All functionality exposed via REST API
- **Event-Driven**: Asynchronous processing for long-running tasks
- **Scalable**: Horizontal scaling for all components
- **Observable**: Comprehensive monitoring and logging

### 1.2 Design Principles
1. **Separation of Concerns**: Each service has single responsibility
2. **DRY (Don't Repeat Yourself)**: Code reusability and libraries
3. **SOLID Principles**: Maintainable and testable code
4. **Security First**: Security considerations in every layer
5. **Performance First**: Optimize for speed and scalability
6. **Fail Safe**: Graceful degradation on failures

---

## 2. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Layer (CDN)                          │
│  ┌──────────────┬──────────────┬──────────────────────────────┐  │
│  │  Web App     │  Mobile App  │  Third-party Integrations   │  │
│  │  (React)     │  (iOS/Android)│  (REST API)                │  │
│  └──────┬───────┴──────┬───────┴──────────────────────────────┘  │
└─────────┼──────────────┼───────────────────────────────────────┘
          │              │
          └──────┬───────┘
                 │ HTTPS/TLS
          ┌──────▼────────────┐
          │  WAF + Load       │
          │  Balancer         │
          └──────┬────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐  ┌──────▼──┐  ┌──────▼──┐
│  API │  │  API   │  │  API   │
│Gate  │  │ Server │  │ Server │
│way   │  │ (Node) │  │ (Node) │
└──┬───┘  └────┬───┘  └────┬───┘
   │           │           │
   └───────────┼───────────┘
               │
    ┌──────────┼──────────────────────────────┐
    │          │          │          │        │
┌───▼───┐ ┌────▼────┐ ┌──▼────┐ ┌──▼────┐ ┌──▼────┐
│Cache  │ │Database │ │Message│ │Search │ │Object │
│(Redis)│ │(Postgres)│ │Queue │ │Engine │ │Store  │
│       │ │         │ │(RMQ)  │ │(ES)   │ │(S3)   │
└───────┘ └─────────┘ └───────┘ └───────┘ └───────┘

    Microservices Layer (Kubernetes)
┌─────────────────────────────────────────────────────┐
│  ┌─────────────┬─────────────┬─────────────┐        │
│  │ Finance Svc │  Supply Svc │  Sales Svc  │        │
│  └─────────────┴─────────────┴─────────────┘        │
│  ┌─────────────┬─────────────┬─────────────┐        │
│  │   HR Svc    │ Project Svc │  Mfg. Svc   │        │
│  └─────────────┴─────────────┴─────────────┘        │
│  ┌─────────────┬─────────────┬─────────────┐        │
│  │  Auth Svc   │ Tenant Svc  │ Report Svc  │        │
│  └─────────────┴─────────────┴─────────────┘        │
└─────────────────────────────────────────────────────┘

    Shared Services
┌─────────────────────────────────────────────────────┐
│  Logging  │  Monitoring  │  Notifications  │  Jobs   │
└─────────────────────────────────────────────────────┘
```

---

## 3. TECHNOLOGY STACK

### 3.1 Backend Stack

#### 3.1.1 Application Framework
```
Primary: Node.js with Express.js
- Version: Node 18 LTS or later
- Package Manager: npm 9+
- Why: Fast, scalable, JavaScript/TypeScript, large ecosystem

Framework Libraries:
- Express.js: HTTP server and routing
- Nestjs: Optional advanced framework for larger teams
- TypeScript: Type safety and developer productivity
- Joi: Schema validation
- Winston: Logging
- Helmet: Security headers
- CORS: Cross-origin resource sharing
```

#### 3.1.2 Database
```
Primary: PostgreSQL 15+
- Why: ACID compliance, JSON support, Jsonb, array types, range types
- Multi-tenant strategy: Schema isolation (separate schema per tenant)

Database Libraries:
- Sequelize ORM for query building
- pg: Native PostgreSQL driver
- Knex: Query builder for complex queries
- Database Migrations: db-migrate or Flyway

Replication & Backup:
- PostgreSQL Streaming Replication (Master-Slave)
- WAL-E for backup management
- Point-in-time recovery capability
```

#### 3.1.3 Caching Layer
```
Primary: Redis 7+
- In-memory data store for caching
- Session storage
- Real-time data synchronization

Usage:
- User session cache (TTL: 30 minutes)
- Query result caching (TTL: 5-60 minutes depending on data)
- Rate limiting (per IP, per user)
- Background job queue (optional, alternative to RabbitMQ)
- Pub/Sub for real-time updates

Libraries:
- redis-py or ioredis (Node.js)
- Redis Cluster for high availability
```

#### 3.1.4 Message Queue
```
Primary: RabbitMQ 3.12+
- Asynchronous job processing
- Event publishing and consumption
- Service-to-service communication

Queues:
- Email notifications
- Report generation
- Data imports/exports
- Invoice processing
- Payroll processing
- Audit logging

Libraries:
- amqplib (Node.js)
- Message acknowledgment and retry mechanism
- Dead letter queues for failed messages
```

#### 3.1.5 Search Engine
```
Primary: Elasticsearch 8+
- Full-text search across all data
- Advanced filtering and aggregations
- Real-time indexing

Indexes:
- Customers
- Products
- Invoices
- Orders
- Transactions
- Documents

Libraries:
- @elastic/elasticsearch (Node.js)
- Kibana for search analytics and debugging
```

### 3.2 Frontend Stack

#### 3.2.1 Framework & Libraries
```
Primary: React 18+
- Why: Component-based, large ecosystem, strong community
- TypeScript: Full type safety
- Vite: Fast build tool and dev server

State Management:
- Redux Toolkit: Predictable state management
- Redux Query: Data fetching and caching

Styling:
- Tailwind CSS: Utility-first CSS framework
- Emotion: CSS-in-JS for dynamic styling
- Responsive Design: Mobile-first approach

UI Components:
- Material-UI (MUI): Professional component library
- Recharts: Data visualization
- React Query: Server state management
- React Hook Form: Form handling

Navigation & Routing:
- React Router v6+

Authentication:
- JWT token management
- Axios interceptors for auth headers
- Automatic token refresh
```

#### 3.2.2 Development Tools
```
Build & Bundling:
- Vite for development and production builds
- Fast Hot Module Replacement (HMR)

Code Quality:
- ESLint: Code linting
- Prettier: Code formatting
- Husky: Git hooks for pre-commit checks

Testing:
- Jest: Unit testing framework
- React Testing Library: Component testing
- Cypress: E2E testing
- Mock Service Worker: API mocking

Package Management:
- npm 9+ or yarn 3+
- Dependency updates automated with Dependabot
```

### 3.3 DevOps & Deployment

#### 3.3.1 Containerization
```
Docker:
- Base Image: node:18-alpine for small footprint
- Multi-stage builds for optimized images
- Docker Compose for local development

Registry:
- Docker Hub or ECR (AWS) for image storage
- Image scanning for vulnerabilities
- Versioning strategy: semver tags
```

#### 3.3.2 Orchestration
```
Primary: Kubernetes (K8s)
- Managed service: AWS EKS, Google GKE, or Azure AKS
- Helm for package management and deployment

K8s Components:
- Deployments: Stateless services (API servers)
- StatefulSets: Stateful services (databases)
- Services: Internal load balancing
- Ingress: External traffic routing
- ConfigMaps: Configuration management
- Secrets: Sensitive data management
- PersistentVolumes: Data persistence

Scaling:
- Horizontal Pod Autoscaling (HPA)
- Vertical Pod Autoscaling (VPA)
- Cluster autoscaling for nodes
```

#### 3.3.3 CI/CD Pipeline
```
Git Workflow:
- GitHub or GitLab for version control
- Feature branches from main
- Pull request reviews required
- Branch protection rules

CI Pipeline (GitHub Actions or GitLab CI):
Stage 1: Lint & Test
  - npm install
  - npm run lint
  - npm run test
  - npm run test:coverage

Stage 2: Build
  - Docker build
  - Push to registry
  - Image scanning

Stage 3: Deploy to Staging
  - Deploy to staging K8s cluster
  - Run integration tests
  - Run E2E tests
  - Performance testing

Stage 4: Deploy to Production
  - Manual approval required
  - Canary deployment (10% traffic)
  - Monitor for errors
  - Gradual rollout to 100%
  - Rollback capability

Pipeline triggers:
- Automatic on push to main
- Manual trigger for releases
- Scheduled nightly builds
```

#### 3.3.4 Monitoring & Logging
```
Application Monitoring:
- Prometheus: Metrics collection
- Grafana: Metrics visualization
- New Relic or DataDog: APM (optional)
- HealthChecks: Endpoint monitoring

Logging:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Structured logging (JSON format)
- Log levels: DEBUG, INFO, WARN, ERROR, CRITICAL
- Log retention: 30 days in hot storage, 90 days archived

Alerting:
- PagerDuty for critical alerts
- Slack integration for warnings
- Email for non-critical notifications
- Alert threshold configuration

Tracing:
- Jaeger or Zipkin for distributed tracing
- Trace every request through services
```

#### 3.3.5 Infrastructure as Code
```
Terraform:
- AWS resources definition
- RDS (PostgreSQL managed database)
- ElastiCache (Redis managed cache)
- ALB (Application Load Balancer)
- VPC and networking
- IAM roles and policies
- S3 buckets for file storage

Configuration Management:
- Environment-specific configurations
- Secrets management with HashiCorp Vault or AWS Secrets Manager
- Configuration rotation
```

---

## 4. MULTI-TENANT ARCHITECTURE

### 4.1 Tenant Isolation Strategy

#### 4.1.1 Data Isolation - Schema Isolation
```
Database Structure:
postgres://host/main_db

Tenant 1:
- Schema: tenant_1
  - Tables: users, customers, invoices, etc
  - Indexes: Tenant-specific indexes
  - Permissions: tenant_1_app_user role

Tenant 2:
- Schema: tenant_2
  - Tables: users, customers, invoices, etc
  - Indexes: Tenant-specific indexes
  - Permissions: tenant_2_app_user role

Shared Tables (in public schema):
- tenant_master: Tenant metadata
- subscription_plans
- system_configuration

Advantages:
- Complete data isolation
- Different schema per tenant allows schema evolution
- Easy backup/restore per tenant
- Scalable to 1000+ tenants

Disadvantages:
- Connection pooling complexity
- Schema migration complexity
- Database connection overhead
```

#### 4.1.2 Tenant Context Identification
```
Identifying tenant from request:

1. Subdomain-based: tenant-1.app.com
   - Extract subdomain from request
   - Lookup tenant from URL

2. Header-based: X-Tenant-Id header
   - Passed by authenticated user or API key
   - Validated against user's tenant

3. Session-based: Stored in JWT token
   - Tenant ID encoded in JWT
   - Verified on token validation

4. Domain-based: custom.erp.app
   - Each tenant has custom domain
   - DNS CNAME points to main application
   - Lookup tenant from domain

Implementation (Node.js Middleware):
```javascript
const tenantMiddleware = (req, res, next) => {
  const tenant = extractTenantFromRequest(req);
  
  if (!tenant) {
    return res.status(400).json({ error: 'Tenant not identified' });
  }
  
  // Verify user belongs to tenant
  if (req.user && req.user.tenant_id !== tenant.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  // Set tenant context
  req.tenant = tenant;
  req.db = getTenantDatabase(tenant.id);
  
  next();
};
```

### 4.2 Resource Utilization Optimization

#### 4.2.1 Shared Resources
```
Shared across all tenants:
- API Gateway and Load Balancer
- Cache layer (Redis)
- Message Queue (RabbitMQ)
- Search Engine (Elasticsearch)
- Object Storage (S3)
- Monitoring and Logging infrastructure
- Authentication service

Benefits:
- Cost efficiency
- Easier maintenance
- Shared security infrastructure

Resource Limits per Tenant:
- Max API calls: 10,000/hour
- Max storage: 100GB
- Max users: 1000
- Max concurrent connections: 100
```

#### 4.2.2 Cost Optimization
```
Multi-tenant advantages:
- Single database server for multiple tenants
- Shared application servers
- Shared infrastructure costs
- Economies of scale

Per-tenant monitoring:
- CPU, Memory, Storage usage
- API calls and bandwidth
- Database query performance
- Chargeback allocation
```

---

## 5. MICROSERVICES ARCHITECTURE

### 5.1 Service Breakdown

#### 5.1.1 Core Microservices
```
1. Auth Service
   - User authentication (login, logout)
   - Token generation and validation
   - OAuth 2.0 / SSO integration
   - 2FA management
   Database: Shared (user-tenant mapping)
   API Endpoints: /auth/*

2. Tenant Service
   - Tenant management (create, update, delete)
   - Tenant configuration
   - Subscription management
   - Billing and invoicing
   Database: Shared (tenant master data)
   API Endpoints: /tenants/*

3. Finance Service
   - Chart of Accounts
   - General Ledger
   - Accounts Payable
   - Accounts Receivable
   - Fixed Assets
   - Bank Reconciliation
   Database: Tenant-specific (finance schema)
   API Endpoints: /finance/*

4. Supply Chain Service
   - Inventory Management
   - Warehouse Management
   - Procurement
   - Vendor Management
   Database: Tenant-specific (supply_chain schema)
   API Endpoints: /supply-chain/*

5. Sales Service
   - Sales Orders
   - Sales Quotations
   - Customer Management
   - CRM features
   Database: Tenant-specific (sales schema)
   API Endpoints: /sales/*

6. Manufacturing Service
   - Bill of Materials (BOM)
   - Manufacturing Orders
   - Work Orders
   - Quality Control
   Database: Tenant-specific (manufacturing schema)
   API Endpoints: /manufacturing/*

7. HR Service
   - Employee Management
   - Attendance Tracking
   - Payroll
   - Leave Management
   - Performance Management
   Database: Tenant-specific (hr schema)
   API Endpoints: /hr/*

8. Project Service
   - Project Management
   - Task Management
   - Resource Allocation
   - Time Tracking
   Database: Tenant-specific (projects schema)
   API Endpoints: /projects/*

9. Reporting Service
   - Report generation
   - Dashboard data
   - Analytics
   - Business Intelligence
   Database: Read-only from tenant databases
   API Endpoints: /reports/*

10. Integration Service
    - Third-party integrations
    - Webhook management
    - Data sync
    Database: Tenant-specific (integrations schema)
    API Endpoints: /integrations/*

11. Notification Service
    - Email notifications
    - SMS notifications
    - In-app notifications
    - Push notifications
    Database: Tenant-specific (notifications schema)
    API Endpoints: /notifications/*

12. Document Service
    - File upload/download
    - Document management
    - Storage management
    Database: Tenant-specific (documents schema)
    API Endpoints: /documents/*
```

### 5.2 Service Communication

#### 5.2.1 Synchronous Communication (REST API)
```
Service-to-Service HTTP calls using:
- Axios or Fetch API with timeouts
- Circuit breaker pattern for reliability
- Retry logic with exponential backoff
- Timeout: 5 seconds default

Example:
Finance Service → Sales Service
GET /sales/customers/{customer_id}
Verify customer credit limit
```

#### 5.2.2 Asynchronous Communication (Message Queue)
```
Using RabbitMQ for event-driven communication:

Examples:
1. Invoice Created Event
   - Finance Service publishes: invoice.created
   - Sales Service consumes: Update customer AR
   - Reporting Service consumes: Update analytics
   - Notification Service consumes: Send invoice email

2. Purchase Order Received
   - Supply Chain publishes: purchase_order.received
   - Finance Service consumes: Record liability
   - Inventory Service consumes: Update stock
   - Manufacturing consumes: Plan production

3. Payroll Processed
   - HR Service publishes: payroll.processed
   - Finance Service consumes: Record payroll expense
   - Notification Service consumes: Send payslips

Benefits:
- Loose coupling between services
- Reliable delivery with acknowledgments
- Retry capability
- Historical event tracking
```

### 5.3 Data Management Across Services

#### 5.3.1 Database per Service Pattern
```
Each service owns its database schema:

Finance Service owns:
- General Ledger tables
- Chart of Accounts
- Journal Entry tables
- Bank tables

Sales Service owns:
- Customer tables
- Sales Order tables
- Sales Quotation tables
- Sales Invoice tables

Supply Chain Service owns:
- Product tables
- Inventory tables
- Warehouse tables
- Purchase Order tables

Benefits:
- Database independence
- Easy scaling per service
- Technology flexibility

Challenges:
- Data consistency across services
- Distributed transactions
- Joining data across services
```

#### 5.3.2 Saga Pattern for Distributed Transactions
```
Scenario: Create Sales Order
Steps:
1. Sales Service: Create sales order (PENDING status)
2. Supply Chain Service: Reserve inventory
3. Finance Service: Create AR entry
4. If any step fails: Execute compensating transactions

Choreography (Event-driven):
Sales Service → publishes "SalesOrder.Created"
  ↓
SupplyChain Service → listens, reserves inventory → publishes "Inventory.Reserved"
  ↓
Finance Service → listens, creates AR entry → publishes "AREntry.Created"
  ↓
Sales Service → listens, marks order as CONFIRMED

Compensating Transactions:
If inventory not available:
  - SupplyChain publishes "Inventory.ReservationFailed"
  - Finance Service listens and reverses AR entry
  - Sales Service listens and updates order status to FAILED
```

---

## 6. API DESIGN

### 6.1 REST API Standards

#### 6.1.1 Endpoint Design
```
Resources:
- GET /api/v1/tenants/{tenant_id}/customers - List customers
- POST /api/v1/tenants/{tenant_id}/customers - Create customer
- GET /api/v1/tenants/{tenant_id}/customers/{id} - Get customer
- PUT /api/v1/tenants/{tenant_id}/customers/{id} - Update customer
- DELETE /api/v1/tenants/{tenant_id}/customers/{id} - Delete customer
- GET /api/v1/tenants/{tenant_id}/customers/{id}/invoices - List invoices

Standard HTTP Methods:
- GET: Retrieve resource(s)
- POST: Create new resource
- PUT: Replace entire resource
- PATCH: Partial update
- DELETE: Delete resource

Status Codes:
- 200 OK: Success
- 201 Created: Resource created
- 204 No Content: Success, no response body
- 400 Bad Request: Invalid input
- 401 Unauthorized: Authentication required
- 403 Forbidden: Authorization failed
- 404 Not Found: Resource not found
- 409 Conflict: Resource conflict
- 500 Internal Server Error: Server error
- 503 Service Unavailable: Service down
```

#### 6.1.2 Request/Response Format
```
JSON-based request/response:

Request Example:
POST /api/v1/tenants/{tenant_id}/customers
{
  "name": "ABC Corporation",
  "email": "contact@abc.com",
  "phone": "+62-21-1234567",
  "address": {
    "street": "Jl. Gatot Subroto",
    "city": "Jakarta",
    "state": "DKI",
    "zip": "12950",
    "country": "Indonesia"
  },
  "billing_address": {...},
  "tax_id": "12345678901234",
  "payment_terms": "NET30",
  "credit_limit": 1000000000
}

Response Example:
{
  "id": "cust_123456",
  "name": "ABC Corporation",
  "email": "contact@abc.com",
  "status": "ACTIVE",
  "created_at": "2024-06-28T10:30:00Z",
  "updated_at": "2024-06-28T10:30:00Z",
  "_links": {
    "self": "/api/v1/tenants/{tenant_id}/customers/cust_123456",
    "invoices": "/api/v1/tenants/{tenant_id}/customers/cust_123456/invoices"
  }
}

Error Response:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be valid email"
      }
    ]
  }
}
```

#### 6.1.3 Pagination
```
Query Parameters:
- page: Page number (default: 1)
- limit: Records per page (default: 20, max: 100)
- sort: Sort field (default: created_at)
- order: asc or desc (default: desc)
- filter: JSON filter object

Example:
GET /api/v1/tenants/{tenant_id}/invoices?page=2&limit=50&sort=created_at&order=desc

Response includes:
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 1250,
    "total_pages": 25,
    "has_next": true,
    "has_prev": true
  }
}
```

#### 6.1.4 Filtering & Search
```
Complex filtering:
GET /api/v1/tenants/{tenant_id}/invoices?filter={
  "status": "UNPAID",
  "created_at": {"$gte": "2024-01-01", "$lte": "2024-06-30"},
  "amount": {"$gt": 1000000}
}

Full-text search:
GET /api/v1/tenants/{tenant_id}/customers/search?q=ABC&fields=name,contact_person

Operators supported:
- $eq: Equal
- $ne: Not equal
- $gt: Greater than
- $gte: Greater than or equal
- $lt: Less than
- $lte: Less than or equal
- $in: In array
- $nin: Not in array
- $exists: Field exists
```

### 6.2 Authentication & Authorization

#### 6.2.1 API Key Authentication
```
Usage:
- For service-to-service communication
- For third-party integrations

Header:
Authorization: Bearer {api_key}

API Key Management:
- Rotated every 90 days
- Can be revoked immediately
- Rate limited per API key
```

#### 6.2.2 JWT Token Authentication
```
JWT Structure:
{
  "sub": "user_id",
  "tenant_id": "tenant_123",
  "roles": ["user", "admin"],
  "permissions": ["read:customers", "write:customers"],
  "exp": 1719554400
}

Token Management:
- Access token: 1 hour validity
- Refresh token: 7 days validity
- Tokens signed with HS256
- Token refreshed automatically by frontend
- Logout invalidates token
```

#### 6.2.3 Rate Limiting
```
Per-user limits:
- 1000 API calls per hour
- 100 API calls per minute
- 10 file uploads per day (100MB each)

Per-IP limits:
- 10,000 API calls per hour
- 1000 API calls per minute

Response Headers:
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1719538800

When exceeded:
HTTP 429 Too Many Requests
Retry-After: 60 (seconds)
```

### 6.3 Webhooks

#### 6.3.1 Webhook Configuration
```
Webhook types:
- invoice.created
- invoice.paid
- purchase_order.received
- payment.processed
- employee.onboarded

Webhook setup:
POST /api/v1/tenants/{tenant_id}/webhooks
{
  "url": "https://example.com/webhooks/invoices",
  "events": ["invoice.created", "invoice.paid"],
  "active": true
}

Webhook payload:
{
  "id": "webhook_event_123",
  "timestamp": "2024-06-28T10:30:00Z",
  "event": "invoice.created",
  "data": {
    "id": "inv_123456",
    "customer_id": "cust_123",
    "amount": 5000000,
    "status": "DRAFT"
  }
}

Retry logic:
- Initial delivery
- Retry after 5 minutes (exponential backoff)
- Max 5 retries
- Dead letter queue for failed webhooks
```

---

## 7. SECURITY ARCHITECTURE

### 7.1 Authentication Flow

```
1. User Login
   └─> POST /auth/login (username, password)
       └─> Validate credentials
       └─> Generate JWT tokens (access + refresh)
       └─> Return tokens + user info

2. API Request with JWT
   └─> Request with Authorization header
       └─> API Gateway validates JWT signature
       └─> Extract user and tenant context
       └─> Route to appropriate service
       └─> Service validates tenant access

3. Token Refresh
   └─> POST /auth/refresh (refresh_token)
       └─> Validate refresh token
       └─> Issue new access token
       └─> Return new access token

4. Logout
   └─> POST /auth/logout
       └─> Invalidate refresh token
       └─> Clear session cookies
```

### 7.2 Authorization Model

```
Role-Based Access Control (RBAC):

Roles:
- Super Admin: Full access to all tenants
- Tenant Admin: Full access within tenant
- Finance Manager: Access to finance module
- Sales Manager: Access to sales module
- HR Manager: Access to HR module
- User: Limited access based on role

Permissions:
- read:module
- write:module
- create:module
- delete:module
- approve:module

Permission assignment:
Role → has many → Permissions
User → has many → Roles

Authorization check on each API request:
if (user.roles.includes(requiredRole) && user.hasPermission(requiredPermission)) {
  // Allow access
} else {
  // Deny access
}
```

### 7.3 Data Security

#### 7.3.1 Encryption
```
In Transit (TLS 1.2+):
- All API communications encrypted
- Certificate management with auto-renewal
- Perfect forward secrecy (PFS) enabled

At Rest (AES-256):
- Database encryption
- File storage encryption
- Backup encryption

Sensitive Fields:
- Passwords: bcrypt hashing (cost factor 12)
- Credit card: Tokenization (PCI compliance)
- SSN: Field-level encryption
- Bank account: Field-level encryption
```

#### 7.3.2 Audit Logging
```
Audit log captures:
- User: Who performed action
- Timestamp: When action occurred
- Action: What action (create, update, delete)
- Resource: Which resource affected
- Before/After: Data changes
- IP Address: Source of request
- Tenant: Which tenant

Example audit log:
{
  "id": "audit_123456",
  "user_id": "user_123",
  "tenant_id": "tenant_123",
  "timestamp": "2024-06-28T10:30:00Z",
  "action": "update",
  "resource": "customer",
  "resource_id": "cust_123",
  "before": {
    "credit_limit": 1000000000
  },
  "after": {
    "credit_limit": 2000000000
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}

Audit log retention: 2 years
Immutability: Logs cannot be modified or deleted
```

### 7.4 Network Security

```
Layers:
1. DDoS Protection
   - Cloudflare or AWS Shield
   - Rate limiting
   - Geographic blocking

2. Web Application Firewall (WAF)
   - OWASP Top 10 protection
   - SQL injection prevention
   - XSS prevention
   - CSRF protection

3. API Gateway
   - Request validation
   - Authentication enforcement
   - Rate limiting
   - Request/response logging

4. Service-to-Service
   - mTLS (mutual TLS)
   - API keys for service auth
   - Network policies in K8s

5. Database
   - VPC isolation
   - No public internet access
   - IAM-based access control
   - Connection encryption
```

---

## 8. DATABASE DESIGN

### 8.1 Multi-Tenant Schema Isolation

```
Database: erp_production

Master Schema (Public):
- tenant_master
- subscription_plans
- system_parameters
- feature_flags

Tenant Schemas (Per Tenant):
erp_production.tenant_1.*
erp_production.tenant_2.*
...
erp_production.tenant_n.*

Each tenant schema includes:
- finance_* (GL, AP, AR, etc)
- supply_chain_* (inventory, warehouse, etc)
- sales_* (customers, orders, invoices, etc)
- hr_* (employees, payroll, etc)
- manufacturing_* (BOM, MO, etc)
- projects_* (projects, tasks, time tracking, etc)
- shared_* (users, audit logs, etc)
```

### 8.2 Key Tables & Relationships

#### Finance Module
```
chart_of_accounts
├─ id (PK)
├─ company_id (FK)
├─ code (UNIQUE)
├─ name
├─ account_type (ENUM)
├─ status (ENUM)
└─ created_at

general_ledger
├─ id (PK)
├─ journal_entry_id (FK)
├─ account_id (FK)
├─ debit_amount
├─ credit_amount
├─ transaction_date
├─ period_id (FK)
└─ created_at

journal_entries
├─ id (PK)
├─ document_id
├─ document_type
├─ total_debit
├─ total_credit
├─ reference
├─ status (ENUM)
├─ posted_by (FK: users)
├─ period_id (FK)
└─ created_at

accounts_payable
├─ id (PK)
├─ vendor_id (FK)
├─ invoice_number (UNIQUE)
├─ invoice_date
├─ due_date
├─ amount
├─ status (ENUM)
├─ payment_terms
└─ created_at

accounts_receivable
├─ id (PK)
├─ customer_id (FK)
├─ invoice_number (UNIQUE)
├─ invoice_date
├─ due_date
├─ amount
├─ status (ENUM)
├─ payment_terms
└─ created_at
```

#### Sales Module
```
customers
├─ id (PK)
├─ code (UNIQUE)
├─ name
├─ email
├─ phone
├─ tax_id
├─ credit_limit
├─ payment_terms
├─ sales_rep_id (FK: users)
├─ status (ENUM)
└─ created_at

sales_orders
├─ id (PK)
├─ order_number (UNIQUE)
├─ customer_id (FK)
├─ order_date
├─ delivery_date
├─ total_amount
├─ status (ENUM)
├─ created_by (FK: users)
└─ created_at

sales_order_lines
├─ id (PK)
├─ sales_order_id (FK)
├─ product_id (FK)
├─ quantity
├─ unit_price
├─ discount_percent
├─ line_total
└─ created_at
```

#### Inventory Module
```
products
├─ id (PK)
├─ code (UNIQUE)
├─ name
├─ description
├─ unit_of_measure
├─ category_id (FK)
├─ status (ENUM)
└─ created_at

stock_levels
├─ id (PK)
├─ product_id (FK)
├─ warehouse_id (FK)
├─ quantity_on_hand
├─ quantity_reserved
├─ quantity_available
├─ reorder_point
├─ reorder_quantity
└─ last_updated_at

stock_movements
├─ id (PK)
├─ product_id (FK)
├─ warehouse_id (FK)
├─ movement_type (ENUM)
├─ reference_id
├─ reference_type
├─ quantity
├─ movement_date
└─ created_at
```

#### HR Module
```
employees
├─ id (PK)
├─ employee_id (UNIQUE)
├─ first_name
├─ last_name
├─ email (UNIQUE)
├─ phone
├─ department_id (FK)
├─ designation
├─ manager_id (FK)
├─ date_of_joining
├─ date_of_birth
├─ status (ENUM)
└─ created_at

attendance
├─ id (PK)
├─ employee_id (FK)
├─ attendance_date
├─ status (ENUM: Present, Absent, Half-day)
├─ check_in_time
├─ check_out_time
└─ created_at

payroll
├─ id (PK)
├─ employee_id (FK)
├─ payroll_month
├─ basic_salary
├─ total_allowances
├─ total_deductions
├─ net_salary
├─ status (ENUM: Draft, Approved, Processed)
└─ created_at
```

### 8.3 Indexes & Performance

```
Indexes Strategy:
1. Primary Keys: Automatically indexed
2. Foreign Keys: Indexed for join performance
3. Frequently filtered columns:
   - status (ENUM)
   - created_at, updated_at
   - company_id, tenant_id
   - customer_id, vendor_id, product_id
4. Search columns: Full-text index

Example Indexes:
CREATE INDEX idx_customer_status 
  ON customers(status);

CREATE INDEX idx_invoice_due_date 
  ON accounts_receivable(due_date);

CREATE INDEX idx_stock_product_warehouse 
  ON stock_levels(product_id, warehouse_id);

CREATE INDEX idx_movement_date 
  ON stock_movements(movement_date DESC);

Query Optimization:
- Use EXPLAIN ANALYZE for query plans
- Denormalization for frequently joined tables
- Materialized views for complex aggregations
```

---

## 9. DEPLOYMENT ARCHITECTURE

### 9.1 Deployment Environments

```
Environments:

Development (Local):
- Docker Compose
- Local PostgreSQL
- Mock services
- No TLS (HTTP)

Staging:
- AWS EKS (1 node cluster)
- RDS PostgreSQL (db.t3.small)
- ElastiCache Redis (cache.t3.micro)
- Manual deployment approval
- For QA and integration testing

Production:
- AWS EKS (multi-node cluster, auto-scaled)
- RDS PostgreSQL (db.r5.xlarge with Multi-AZ)
- ElastiCache Redis Cluster (cache.r5.large)
- CloudFront CDN
- Load balancing with ALB
- Auto-scaling based on CPU/Memory

High Availability Setup:
```

### 9.2 Infrastructure Diagram

```
Internet
    ↓
CloudFlare (DDoS Protection)
    ↓
AWS Route53 (DNS)
    ↓
AWS ALB (Application Load Balancer)
    ├─ SSL/TLS Termination
    ├─ Multiple AZs
    └─ Rate limiting
    ↓
AWS EKS Cluster
├─ Availability Zone 1
│  ├─ API Server Pod 1
│  ├─ API Server Pod 2
│  ├─ Worker Pod 1
│  └─ Worker Pod 2
├─ Availability Zone 2
│  ├─ API Server Pod 3
│  ├─ API Server Pod 4
│  ├─ Worker Pod 3
│  └─ Worker Pod 4
└─ Availability Zone 3
   ├─ API Server Pod 5
   ├─ API Server Pod 6
   ├─ Worker Pod 5
   └─ Worker Pod 6

Shared Services (Multi-AZ):
├─ RDS PostgreSQL (Master-Standby)
├─ ElastiCache Redis Cluster
├─ RabbitMQ Cluster
├─ Elasticsearch Cluster
├─ S3 Bucket (Multi-region replication)
└─ ELK Stack (Logging)

Monitoring:
├─ Prometheus
├─ Grafana
├─ New Relic or DataDog
└─ AlertManager
```

---

## 10. IMPLEMENTATION PHASES

### Phase 1 (Months 1-4): MVP Development
```
Focus:
- Core infrastructure setup
- Core modules: GL, AP, AR, Inventory, Sales, HR Basics
- Multi-tenant database
- Basic API
- Web UI foundation
- Authentication & RBAC

Deliverables:
- Development environment ready
- Core modules functional
- API documentation
- UI/UX design system
```

### Phase 2 (Months 5-7): Feature Expansion
```
Focus:
- Advanced CRM
- Manufacturing module
- Projects management
- Advanced reporting
- Mobile app (read-only)
- Integrations (first batch)

Deliverables:
- Additional modules
- Integration framework
- Mobile app
- Enhanced reporting
```

### Phase 3 (Months 8-10): Scale & Optimize
```
Focus:
- Performance optimization
- Advanced analytics & BI
- AI-powered features
- Mobile app (full features)
- Integration marketplace

Deliverables:
- Optimized system
- Analytics dashboard
- Mobile app enhancements
- Integration partners
```

### Phase 4 (Months 11-12): Market Expansion
```
Focus:
- Multi-language support
- Industry-specific solutions
- Enterprise features
- Partner ecosystem

Deliverables:
- 15+ language support
- Industry modules
- Partner integrations
```

---

## 11. TECHNOLOGY SELECTION RATIONALE

### 11.1 Why Node.js + Express

**Advantages:**
- JavaScript ecosystem (same language frontend/backend)
- Non-blocking I/O for scalability
- Large npm ecosystem
- Easy to learn and maintain
- Good for API-first design
- Good performance for I/O operations

**Alternative Considered:**
- Python/FastAPI: Good, but slower than Node
- Java/Spring: More verbose, steeper learning curve
- Go: Good performance, but less ecosystem for ERP

### 11.2 Why PostgreSQL

**Advantages:**
- ACID compliance (critical for financial data)
- Advanced features (JSONB, arrays, ranges)
- Row-level security (important for multi-tenant)
- Excellent performance and reliability
- Open source and widely adopted

**Alternative Considered:**
- MySQL: Works but lacks some advanced features
- NoSQL (MongoDB): Not ideal for transactional data
- Oracle: Expensive and overkill for this use case

### 11.3 Why React

**Advantages:**
- Large ecosystem and community
- Component-based architecture
- Excellent tooling (Vite, ESLint, etc)
- Good performance
- Easy to test
- Good for responsive design

**Alternative Considered:**
- Vue.js: Good but smaller ecosystem
- Angular: Overkill for this project
- Svelte: Newer, less mature

### 11.4 Why Kubernetes

**Advantages:**
- Industry standard for container orchestration
- Auto-scaling and high availability
- Multi-cloud portability
- Mature ecosystem
- Good for microservices

**Alternative Considered:**
- Docker Swarm: Simpler but less powerful
- Lambda/Serverless: Not ideal for persistent services
- Traditional VMs: Not container-native

---

## 12. TESTING STRATEGY

### 12.1 Test Pyramid
```
              ▲
             / \
            /   \    E2E Tests (5%)
           /─────\   (Cypress, Selenium)
          /       \
         /─────────\  Integration Tests (15%)
        /           \ (Jest, Supertest)
       /─────────────\
      /               \ Unit Tests (80%)
     /─────────────────\ (Jest, Mocha)
    /_____────────────__\
```

### 12.2 Testing Plan

**Unit Tests:**
- Test individual functions/components
- Mock external dependencies
- Coverage: > 80%
- Tools: Jest, React Testing Library

**Integration Tests:**
- Test API endpoints
- Test database interactions
- Test service integrations
- Coverage: Critical paths
- Tools: Supertest, test containers

**E2E Tests:**
- Test complete user workflows
- Test across browsers
- Coverage: Main user scenarios
- Tools: Cypress, Selenium
- Frequency: Nightly runs

**Performance Tests:**
- Load testing (JMeter, K6)
- Stress testing
- Spike testing
- Baseline: 1000 concurrent users

**Security Tests:**
- OWASP dependency check
- SonarQube for code quality
- Snyk for vulnerability scanning
- Penetration testing (quarterly)
```

---

## APPENDICES

### A. Technology Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend | Node.js + Express | 18 LTS |
| Language | TypeScript | 5.0+ |
| Database | PostgreSQL | 15+ |
| Cache | Redis | 7+ |
| Message Queue | RabbitMQ | 3.12+ |
| Search | Elasticsearch | 8+ |
| Frontend | React | 18+ |
| Styling | Tailwind CSS | 3+ |
| Build | Vite | 4+ |
| Container | Docker | 24+ |
| Orchestration | Kubernetes | 1.27+ |
| Cloud | AWS | - |

---

**Document Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Architect | - | - | - |
| Lead Developer | - | - | - |
| DevOps Engineer | - | - | - |
| Security Officer | - | - | - |
| CTO | - | - | - |

---

**Version History**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | June 2026 | Enterprise Ready Initial Version | Architecture Team |

