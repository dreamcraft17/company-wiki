# dnCore ERP — Software Design Document (SDD)
## Tech Stack Refactoring: Express + Remix

**Document Version:** 1.0  
**Last Updated:** 22 Juli 2026  
**Audience:** Backend engineers, frontend engineers, DevOps  

---

## 1. Design Overview

### 1.1 Architecture diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / SPA Client                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTP + SSR Hydration
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                      Remix SSR Server                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Routes (loaders + actions)                               │   │
│  │ - Layout.tsx (auth, nav)                                 │   │
│  │ - Pages/modules/* (file-based routing)                   │   │
│  │ - Error boundary, SEO metadata                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                                    │                   │
│         │ Server-side rendering              │ Type-safe calls   │
│         │ (React Server Components)          │                   │
│         └────────────────────┬───────────────┘                   │
└────────────────────┬──────────────────────────────────────────────┘
                     │
                     │ Authenticated HTTP REST
                     │ /api/v1/* + JWT
                     │
┌────────────────────▼────────────────────────────────────────────┐
│              Express.js 5 Backend API                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Express App (src/app.ts)                                 │   │
│  │ - Middleware: cors, helmet, rate-limit, auth, tenant     │   │
│  │ - Routes (src/routes/)                                   │   │
│  │ - Handlers (src/handlers/)                               │   │
│  │ - Services (src/services/)  [business logic]             │   │
│  │ - TypeORM entities & repositories                        │   │
│  │ - Validations (class-validator, Zod)                     │   │
│  │ - Error handling middleware                              │   │
│  │ - Health check, metrics                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│    ┌─────────────┬──────────────┬──────────────┬──────────────┐  │
│    │             │              │              │              │  │
│    ▼             ▼              ▼              ▼              ▼  │
│ PostgreSQL    Redis          RabbitMQ     Elasticsearch    S3   │
│   (TypeORM)   (Cache)       (Events)      (Search)       (Files)│
│               (Sessions)                                        │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 Design principles

1. **Separation of concerns:** Frontend (Remix) handles presentation, routing, forms; backend (Express) handles data, auth, business logic.
2. **Type safety:** TypeScript strict mode throughout (both FE + BE).
3. **Progressive enhancement:** Forms work without JavaScript (HTML form fallback).
4. **Minimal abstraction:** Express handlers are direct HTTP mapping; no decorator/provider layer.
5. **Shared patterns:** Consistent error handling, validation, logging across modules.

---

## 2. Backend (Express.js) Architecture

### 2.1 Directory structure

```
backend/
├── src/
│   ├── main.ts                          # Entry point, Express app instantiation
│   ├── app.ts                           # Express app config (middleware, routes)
│   ├── env.ts                           # Environment schema validation (Zod)
│   │
│   ├── middleware/                      # Shared middleware
│   │   ├── auth.ts                      # JWT verification, JwtAuthGuard equivalent
│   │   ├── tenant.ts                    # Tenant context extraction
│   │   ├── audit.ts                     # Request audit logging
│   │   ├── error.ts                     # Global error handler
│   │   ├── validation.ts                # Request body validation
│   │   └── cors-security.ts             # CORS + Helmet + rate limit
│   │
│   ├── routes/                          # Route definitions (no controllers)
│   │   ├── auth.routes.ts               # POST /api/v1/auth/login, /logout, /refresh
│   │   ├── users.routes.ts              # CRUD /api/v1/users
│   │   ├── tenants.routes.ts            # CRUD /api/v1/tenants
│   │   ├── finance.routes.ts            # Finance module routes
│   │   ├── sales.routes.ts              # Sales module routes
│   │   ├── hr.routes.ts                 # HR module routes
│   │   ├── inventory.routes.ts          # Inventory module routes
│   │   ├── projects.routes.ts           # Projects module routes
│   │   ├── crm.routes.ts                # CRM module routes
│   │   ├── reporting.routes.ts          # Reports + custom dashboards
│   │   ├── integrations.routes.ts       # Third-party integrations
│   │   ├── workflows.routes.ts          # Workflow engine
│   │   ├── documents.routes.ts          # Document management
│   │   ├── health.routes.ts             # Health check, metrics
│   │   └── index.ts                     # Route composition
│   │
│   ├── handlers/                        # Express request handlers (req, res, next)
│   │   ├── auth/
│   │   │   ├── login.handler.ts
│   │   │   ├── logout.handler.ts
│   │   │   ├── refresh.handler.ts
│   │   │   └── totp-verify.handler.ts
│   │   ├── users/
│   │   │   ├── list.handler.ts
│   │   │   ├── create.handler.ts
│   │   │   ├── update.handler.ts
│   │   │   └── delete.handler.ts
│   │   ├── tenants/
│   │   ├── finance/
│   │   ├── sales/
│   │   ├── hr/
│   │   ├── [other modules]/
│   │   └── [module].handler.ts pattern continues
│   │
│   ├── services/                        # Business logic (unchanged from NestJS)
│   │   ├── auth.service.ts              # Auth logic, JWT, password hashing
│   │   ├── users.service.ts             # User CRUD, validation
│   │   ├── tenants.service.ts           # Tenant isolation, schema handling
│   │   ├── finance.service.ts           # Finance calculations
│   │   ├── sales.service.ts             # Sales workflows
│   │   ├── hr.service.ts                # HR workflows
│   │   ├── [other services]/
│   │   └── [domain].service.ts pattern
│   │
│   ├── database/
│   │   ├── data-source.ts               # TypeORM DataSource (PostgreSQL config)
│   │   ├── entities/                    # TypeORM entities (unchanged from NestJS)
│   │   │   ├── user.entity.ts
│   │   │   ├── tenant.entity.ts
│   │   │   ├── finance-entry.entity.ts
│   │   │   └── [other entities]/
│   │   ├── migrations/                  # TypeORM migrations
│   │   │   └── 1690000000000-*.ts
│   │   ├── repositories/                # TypeORM custom repositories (if needed)
│   │   │   └── [domain].repository.ts
│   │   └── seeds/                       # Seed scripts
│   │       └── seed.ts
│   │
│   ├── validators/                      # Input validation schemas (Zod)
│   │   ├── auth.validator.ts            # Login, register DTOs
│   │   ├── users.validator.ts           # User create/update DTOs
│   │   ├── tenants.validator.ts
│   │   ├── [module].validator.ts pattern
│   │   └── index.ts                     # Export all schemas
│   │
│   ├── types/                           # TypeScript types & interfaces
│   │   ├── auth.types.ts                # JwtPayload, AuthContext
│   │   ├── error.types.ts               # ApiError, ErrorResponse
│   │   ├── pagination.types.ts          # ListResponse, Cursor
│   │   ├── tenant.types.ts              # TenantContext
│   │   └── [domain].types.ts
│   │
│   ├── utils/                           # Shared utility functions
│   │   ├── response.ts                  # standardResponse(), errorResponse()
│   │   ├── error-handler.ts             # Error mapping, logging
│   │   ├── jwt.ts                       # JWT sign/verify wrapper
│   │   ├── password.ts                  # bcryptjs wrapper
│   │   ├── cache.ts                     # Redis wrapper (ioredis)
│   │   ├── queue.ts                     # Bull queue wrapper
│   │   ├── logger.ts                    # Winston/pino logger
│   │   └── [utility].ts
│   │
│   ├── infrastructure/
│   │   ├── cache/                       # Redis Cluster Manager
│   │   │   ├── redis-client.ts          # ioredis connection
│   │   │   └── cache-manager.ts         # Abstraction layer
│   │   ├── queue/                       # Bull job queue
│   │   │   ├── queue-manager.ts         # Bull instance factory
│   │   │   └── processors/              # Job processors
│   │   │       ├── email.processor.ts
│   │   │       ├── export.processor.ts
│   │   │       └── [job].processor.ts
│   │   ├── messaging/                   # RabbitMQ (amqplib)
│   │   │   ├── rabbit-client.ts
│   │   │   ├── publishers/
│   │   │   │   ├── user.publisher.ts
│   │   │   │   ├── finance.publisher.ts
│   │   │   │   └── [domain].publisher.ts
│   │   │   └── consumers/
│   │   │       ├── user.consumer.ts
│   │   │       ├── finance.consumer.ts
│   │   │       └── [domain].consumer.ts
│   │   ├── search/                      # Elasticsearch
│   │   │   ├── es-client.ts             # @elastic/elasticsearch client
│   │   │   ├── indexing.ts              # Bulk indexing
│   │   │   └── search.service.ts        # Query DSL wrapper
│   │   ├── storage/                     # S3 / file storage
│   │   │   ├── s3-client.ts             # AWS S3 client
│   │   │   ├── file-upload.ts
│   │   │   └── file-export.ts           # Excel, PDF export
│   │   └── email/
│   │       ├── nodemailer-client.ts     # Nodemailer setup
│   │       └── templates/
│   │           ├── welcome.html
│   │           ├── password-reset.html
│   │           └── [template].html
│   │
│   └── config/                          # Configuration files
│       ├── app.config.ts                # App-level config (port, env)
│       ├── database.config.ts           # DB connection options
│       ├── cache.config.ts              # Redis config
│       ├── queue.config.ts              # Bull config
│       ├── messaging.config.ts          # RabbitMQ config
│       └── logger.config.ts
│
├── package.json                         # Dependencies
├── tsconfig.json                        # TypeScript strict config
├── .env.example                         # Environment template
└── tests/
    ├── unit/
    │   ├── services/
    │   │   └── [service].spec.ts
    │   └── utils/
    │       └── [utility].spec.ts
    ├── integration/
    │   ├── routes/
    │   │   ├── auth.spec.ts              # Supertest API tests
    │   │   ├── users.spec.ts
    │   │   └── [route].spec.ts
    │   └── database/
    │       └── migrations.spec.ts
    └── e2e/
        └── (Cypress tests in frontend/ repo)
```

### 2.2 Handler pattern (Express request/response)

**Express handler** (instead of NestJS controller method):

```typescript
// src/handlers/auth/login.handler.ts
import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../../validators/auth.validator';
import { AuthService } from '../../services/auth.service';
import { standardResponse, errorResponse } from '../../utils/response';

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate input
    const { email, password } = await loginSchema.parseAsync(req.body);

    // Call service
    const authService = new AuthService(/* deps */);
    const { token, refreshToken, user } = await authService.login(email, password);

    // Respond
    res.status(200).json(
      standardResponse('Login successful', {
        token,
        refreshToken,
        user: { id: user.id, email: user.email },
      })
    );
  } catch (error) {
    next(error); // Pass to error middleware
  }
}
```

**Route registration:**

```typescript
// src/routes/auth.routes.ts
import express from 'express';
import { loginHandler } from '../handlers/auth/login.handler';
import { logoutHandler } from '../handlers/auth/logout.handler';
import { refreshHandler } from '../handlers/auth/refresh.handler';

const router = express.Router();

router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.post('/refresh', refreshHandler);

export default router;
```

**App composition:**

```typescript
// src/app.ts
import express from 'express';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import { errorMiddleware } from './middleware/error';
import { authMiddleware } from './middleware/auth';

const app = express();

// Global middleware
app.use(express.json());
app.use(helmet()); // security headers
app.use(cors()); // CORS
app.use(requestIdMiddleware); // trace ID
app.use(loggerMiddleware); // logging

// Routes (public)
app.use('/api/v1/auth', authRoutes);

// Routes (protected)
app.use('/api/v1/users', authMiddleware, usersRoutes);

// Health
app.get('/api/v1/health', healthHandler);
app.get('/api/v1/metrics', metricsHandler);

// Error handler (last middleware)
app.use(errorMiddleware);

export default app;
```

### 2.3 Database & ORM (TypeORM, unchanged)

**Data source configuration:**

```typescript
// src/database/data-source.ts
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';
// ... other entities

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Tenant, /* ... */],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // Use migrations only
  logging: process.env.NODE_ENV === 'development',
});
```

**Service layer (database access):**

```typescript
// src/services/users.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { User } from '../database/entities/user.entity';

export class UsersService {
  private usersRepo: Repository<User>;

  constructor() {
    this.usersRepo = AppDataSource.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ id });
  }

  async create(data: CreateUserDTO): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    await this.usersRepo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.usersRepo.delete(id);
  }
}
```

### 2.4 Middleware stack

| Middleware | Purpose | Order |
|---|---|---|
| express.json() | Parse JSON body | 1 |
| helmet() | Security headers | 2 |
| cors() | CORS handling | 3 |
| requestIdMiddleware | Trace ID | 4 |
| loggerMiddleware | Log requests | 5 |
| authMiddleware | JWT verify (protected routes) | 6 |
| tenantMiddleware | Tenant context | 7 |
| validationMiddleware | Schema validation | 8 |
| compression() | gzip response | 9 |
| errorMiddleware | Error handler | last |

---

## 3. Frontend (Remix) Architecture

### 3.1 Directory structure

```
frontend/
├── app/
│   ├── root.tsx                         # Root layout, error boundary
│   ├── entry.server.tsx                 # SSR entry point
│   ├── entry.client.tsx                 # Client hydration
│   │
│   ├── routes/
│   │   ├── _auth.tsx                    # Auth layout (login, signup)
│   │   │   ├── login.tsx                # GET /login, POST /login (action)
│   │   │   ├── signup.tsx               # GET /signup, POST /signup
│   │   │   ├── forgot-password.tsx      # Password reset flow
│   │   │   └── verify-totp.tsx          # TOTP verification
│   │   │
│   │   ├── _app.tsx                     # Protected app layout
│   │   │   ├── dashboard/
│   │   │   │   ├── index.tsx            # GET /dashboard
│   │   │   │   └── _.$tenantId.tsx      # Multi-tenant wrapper
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── index.tsx            # GET /users, POST /users
│   │   │   │   ├── $id.tsx              # GET /users/:id, PUT, DELETE
│   │   │   │   └── $id.form.tsx         # Form component
│   │   │   │
│   │   │   ├── finance/
│   │   │   │   ├── index.tsx            # Finance dashboard
│   │   │   │   ├── entries.tsx          # Journal entries list
│   │   │   │   ├── reports.tsx          # Financial reports
│   │   │   │   └── $id.tsx              # Entry details
│   │   │   │
│   │   │   ├── sales/
│   │   │   ├── hr/
│   │   │   ├── inventory/
│   │   │   ├── projects/
│   │   │   ├── crm/
│   │   │   ├── reporting/
│   │   │   ├── integrations/
│   │   │   ├── workflows/
│   │   │   ├── documents/
│   │   │   ├── settings/
│   │   │   │   ├── profile.tsx
│   │   │   │   ├── team.tsx
│   │   │   │   ├── billing.tsx
│   │   │   │   └── security.tsx
│   │   │   │
│   │   │   ├── portal/
│   │   │   │   ├── customer/
│   │   │   │   └── vendor/
│   │   │   │
│   │   │   └── analytics/
│   │   │       └── index.tsx
│   │   │
│   │   ├── logout.tsx                   # Logout action
│   │   └── $.*.(tsx|jsx)                # Catch-all for 404
│   │
│   ├── components/                      # Reusable React components
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── [other UI components]
│   │   │
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── UserForm.tsx
│   │   │   ├── FinanceEntryForm.tsx
│   │   │   └── [domain].form.tsx pattern
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx              # Navigation drawer
│   │   │   ├── Header.tsx               # Top bar
│   │   │   ├── Footer.tsx
│   │   │   ├── ProtectedLayout.tsx      # Auth wrapper
│   │   │   └── ResponsiveLayout.tsx     # Mobile-first
│   │   │
│   │   ├── tables/
│   │   │   ├── DataTable.tsx            # Pagination, sort, filter
│   │   │   ├── ScrollableTable.tsx      # Mobile-friendly scroll
│   │   │   └── [domain]Table.tsx
│   │   │
│   │   ├── charts/
│   │   │   ├── BarChart.tsx             # Recharts wrapper
│   │   │   ├── LineChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── [type]Chart.tsx
│   │   │
│   │   └── common/
│   │       ├── ErrorBoundary.tsx
│   │       ├── Loading.tsx
│   │       ├── Empty.tsx
│   │       ├── Pagination.tsx
│   │       └── [utility].tsx
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── useAuth.ts                   # Auth context hook
│   │   ├── useTenant.ts                 # Tenant context hook
│   │   ├── useFetch.ts                  # Data fetching hook (if needed)
│   │   ├── useForm.ts                   # Form state hook
│   │   ├── useNotification.ts           # Toast/alert hook
│   │   └── [custom].ts
│   │
│   ├── utils/
│   │   ├── api.ts                       # Axios client + headers
│   │   ├── auth.ts                      # JWT storage, token refresh
│   │   ├── format.ts                    # Number, currency, date formatting
│   │   ├── validation.ts                # Client-side Zod schemas
│   │   ├── error-handler.ts             # Error parsing + UI feedback
│   │   ├── constants.ts                 # Enums, defaults
│   │   └── [utility].ts
│   │
│   ├── store/                           # Redux (optional, for complex state)
│   │   ├── store.ts                     # Configure store
│   │   ├── slices/
│   │   │   ├── auth.slice.ts            # Auth state
│   │   │   ├── tenant.slice.ts          # Tenant state
│   │   │   ├── ui.slice.ts              # UI state (modals, drawers)
│   │   │   └── [domain].slice.ts
│   │   └── middleware/
│   │       └── [custom].middleware.ts
│   │
│   ├── i18n/                            # Internationalization
│   │   ├── i18n.ts                      # i18next config
│   │   ├── locales/
│   │   │   ├── id.json                  # Indonesian
│   │   │   └── en.json                  # English
│   │   └── detection.ts                 # Language detection
│   │
│   ├── styles/                          # Global styles
│   │   ├── globals.css                  # Tailwind imports, root styles
│   │   ├── variables.css                # CSS variables
│   │   └── [page].module.css            # Component-scoped styles (optional)
│   │
│   └── types/
│       ├── api.types.ts                 # API response shapes
│       ├── auth.types.ts                # Auth context, user types
│       ├── domain.types.ts              # Business domain types
│       └── [domain].types.ts
│
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── [static assets]
│
├── remix.config.js                      # Remix build config
├── remix.env.d.ts                       # Remix types
├── package.json                         # Frontend dependencies
├── tsconfig.json                        # TypeScript config
├── tailwind.config.js                   # Tailwind config
├── .env.example                         # Environment template
│
└── tests/
    ├── cypress/
    │   ├── e2e/
    │   │   ├── auth.cy.ts               # Login, logout, signup
    │   │   ├── users.cy.ts              # CRUD user
    │   │   ├── finance.cy.ts            # Finance workflows
    │   │   └── [module].cy.ts
    │   └── support/
    │       ├── commands.ts              # Custom Cypress commands
    │       └── e2e.ts
    └── unit/
        ├── utils/
        │   └── [utility].spec.ts        # Jest unit tests
        └── hooks/
            └── [hook].spec.tsx
```

### 3.2 Loader pattern (server-side data fetching)

**Remix loader** (replaces client-side fetch):

```typescript
// app/routes/_app.dashboard.index.tsx
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { DashboardCard } from '~/components/dashboard';

type DashboardData = {
  stats: {
    totalRevenue: number;
    activeUsers: number;
    pendingOrders: number;
  };
  recentActivity: Activity[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  // This runs on server before render
  const authHeader = request.headers.get('cookie');
  const token = extractToken(authHeader);

  if (!token) {
    throw redirect('/login');
  }

  // Fetch data server-side (no waterfall)
  const [stats, activity] = await Promise.all([
    fetch(`${API_URL}/api/v1/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),
    fetch(`${API_URL}/api/v1/dashboard/activity`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()),
  ]);

  // SEO metadata
  return json<DashboardData>(
    { stats, recentActivity: activity },
    {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
      },
    }
  );
};

export default function Dashboard() {
  const { stats, recentActivity } = useLoaderData<DashboardData>();

  // Data is already loaded, no spinners needed
  return (
    <div className="p-6">
      <h1>Dashboard</h1>
      <DashboardCard stat={stats} />
      {/* ... */}
    </div>
  );
}
```

### 3.3 Action pattern (form submission)

**Remix action** (server-side form handler):

```typescript
// app/routes/_app.users.$id.tsx
import { json, redirect, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
import { updateUserSchema } from '~/utils/validation';

export const loader: LoaderFunction = async ({ params }) => {
  const user = await fetch(`${API_URL}/api/v1/users/${params.id}`).then(r => r.json());
  return json(user);
};

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method === 'PUT') {
    // Validate input (server-side, no JS required)
    const formData = await request.formData();
    const result = await updateUserSchema.parseAsync(Object.fromEntries(formData));

    if (!result.success) {
      return json({ errors: result.error.flatten() }, { status: 400 });
    }

    // Call backend API
    const response = await fetch(`${API_URL}/api/v1/users/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken(request)}`,
      },
      body: JSON.stringify(result.data),
    });

    if (!response.ok) {
      return json({ error: 'Failed to update' }, { status: 500 });
    }

    // Redirect after success
    return redirect(`/users/${params.id}`);
  }

  if (request.method === 'DELETE') {
    await fetch(`${API_URL}/api/v1/users/${params.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken(request)}` },
    });
    return redirect('/users');
  }
};

export default function UserDetail() {
  const user = useLoaderData<typeof loader>();

  return (
    <Form method="put">
      <input name="email" defaultValue={user.email} />
      <input name="name" defaultValue={user.name} />
      <button type="submit">Update</button>
    </Form>
  );
}
```

### 3.4 Component structure (React + MUI + Tailwind)

**Example component:**

```typescript
// app/components/forms/UserForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserSchema } from '~/utils/validation';
import { TextField, Button, Box } from '@mui/material';

type UserFormProps = {
  initialValues?: typeof updateUserSchema._type;
  onSubmit: (data) => Promise<void>;
};

export function UserForm({ initialValues, onSubmit }: UserFormProps) {
  const { control, handleSubmit, formState: { errors, isLoading } } = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Full Name"
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </form>
  );
}
```

---

## 4. API Contract (REST)

### 4.1 Base URL & versioning

- **Base:** `https://api.example.com/api/v1`
- **Version prefix:** `/v1` (path-based versioning)
- **Status codes:** Standard HTTP (200, 201, 400, 401, 403, 404, 500)

### 4.2 Response format (standardized)

**Success response:**

```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "timestamp": "2026-07-22T10:30:00Z"
}
```

**Error response:**

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "email": ["Email is invalid"],
    "password": ["Password must be at least 8 characters"]
  },
  "timestamp": "2026-07-22T10:30:00Z"
}
```

### 4.3 Authentication (JWT)

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Token payload:**
```json
{
  "sub": "user-123",
  "email": "user@example.com",
  "tenantId": "tenant-456",
  "roles": ["admin", "finance"],
  "iat": 1690000000,
  "exp": 1690086400
}
```

**Refresh flow:**
```
POST /api/v1/auth/refresh
Body: { refreshToken: "..." }
Response: { token, refreshToken, expiresIn }
```

### 4.4 Common endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login, returns JWT + refresh token |
| POST | `/auth/logout` | Logout (invalidate token) |
| POST | `/auth/refresh` | Refresh JWT |
| GET | `/users` | List users (paginated, filterable) |
| POST | `/users` | Create user |
| GET | `/users/:id` | Get user detail |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/health` | Health check (no auth) |
| GET | `/metrics` | Prometheus metrics (no auth, optional) |

---

## 5. Database Schema (TypeORM entities, unchanged)

**User entity example:**

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  name: string;

  @Column('uuid')
  tenant_id: string;

  @Column('simple-array', { nullable: true })
  roles: string[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**Entities preserved from NestJS:**
- All existing TypeORM entities copied as-is
- No schema changes (backward compatible)
- Migrations remain identical

---

## 6. Caching strategy (Redis, unchanged)

**Cache keys pattern:**
```
user:<id>              # User object
users:page:<n>         # Paginated user list
finance:report:<type>  # Financial report
session:<token>        # Session storage
```

**TTL defaults:**
```
User object:    1 hour
User list:      30 minutes
Finance report: 24 hours
Session:        7 days
```

**Invalidation:**
```typescript
// src/utils/cache.ts
export async function invalidateUserCache(userId: string) {
  const redis = getRedisClient();
  await redis.del(`user:${userId}`);
  await redis.del('users:page:*'); // Pattern delete
}
```

---

## 7. Error handling

**Error mapping (Express middleware):**

```typescript
// src/middleware/error.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Zod validation error
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: error.flatten().fieldErrors,
    });
  }

  // Auth error
  if (error.code === 'UNAUTHORIZED') {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized',
    });
  }

  // Not found
  if (error.code === 'NOT_FOUND') {
    return res.status(404).json({
      status: 'error',
      message: 'Resource not found',
    });
  }

  // Unknown error
  console.error('Unhandled error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}
```

---

## 8. Testing architecture

### 8.1 Backend (Jest + Supertest)

**Unit test:**

```typescript
// backend/tests/unit/services/auth.service.spec.ts
import { AuthService } from '../../../src/services/auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(/* mocked deps */);
  });

  it('should hash password correctly', async () => {
    const hashed = await service.hashPassword('password123');
    expect(hashed).not.toBe('password123');
    expect(await service.verifyPassword('password123', hashed)).toBe(true);
  });
});
```

**Integration test (API):**

```typescript
// backend/tests/integration/routes/auth.spec.ts
import request from 'supertest';
import app from '../../../src/app';

describe('POST /api/v1/auth/login', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });
});
```

### 8.2 Frontend (Cypress E2E)

**E2E test:**

```typescript
// frontend/tests/cypress/e2e/auth.cy.ts
describe('Authentication flow', () => {
  it('should login and access dashboard', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Dashboard');
  });
});
```

---

## 9. Deployment & infrastructure

### 9.1 Primary deployment: PM2 + Nginx on VPS

The supported VPS runtime uses two native Node processes managed by PM2:

- Express API: `dncore-api` on `127.0.0.1:3001`.
- Remix SSR: `dncore-web` on `127.0.0.1:3000`.
- Nginx proxies `/api/*` to the API and all other paths to Remix.
- Repository files: `ecosystem.config.cjs` and `deploy/nginx/dncore.conf`.

Operational steps are documented in `Docs/PM2-NGINX-DEPLOYMENT.md`.

### 9.2 Docker build (optional alternative)

**Multi-stage Dockerfile (backend):**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/express/main.js"]
```

**Multi-stage Dockerfile (frontend):**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build ./dist
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 9.3 Kubernetes deployment (optional alternative)

**Helm values (unchanged):**
```yaml
backend:
  image: dntech/dncore-backend:latest
  replicas: 3
  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 1Gi

frontend:
  image: dntech/dncore-frontend:latest
  replicas: 2
  resources:
    requests:
      cpu: 256m
      memory: 256Mi
```

### 9.4 AWS Terraform (optional alternative)

VPC, EKS, RDS, ElastiCache, S3, CloudFront configuration remains identical.

---

## 10. Security considerations

### 10.1 Backend

- **JWT validation:** Verify signature, expiry, issuer
- **CORS:** Whitelist origins via env var
- **Rate limiting:** 100 req/min per IP (Remix endpoints), 1000 req/min authenticated
- **SQL injection:** Parameterized queries via TypeORM QueryBuilder
- **XSS protection:** Helmet headers + content security policy
- **CSRF:** Remix handles automatically (token validation on actions)

### 10.2 Frontend

- **Secure token storage:** localStorage + HTTPOnly cookie (dual-layer)
- **XSS prevention:** React auto-escapes, no dangerouslySetInnerHTML
- **HTTPS only:** Force TLS in production
- **CSP headers:** Restrict script sources

---

## 11. Monitoring & observability (unchanged)

### 11.1 Logging

**Backend:** Winston/pino logger
```typescript
logger.info('User login', { userId, ip, timestamp });
logger.error('Database error', { error, query });
```

**Frontend:** Sentry error tracking (optional)

### 11.2 Metrics (Prometheus)

- HTTP request latency (histogram)
- Request count by endpoint (counter)
- Active connections (gauge)
- Database connection pool (gauge)
- Cache hit rate (counter)

**Endpoint:** `/api/v1/metrics` (text/plain)

### 11.3 Alerting

**Grafana dashboards:**
- API response time p95/p99
- Error rate (5xx)
- Database CPU/memory
- Cache eviction rate

---

## 12. Migration path (NestJS → Express)

### 12.1 Service layer preservation

**NestJS service:**
```typescript
@Injectable()
export class UserService {
  constructor(private usersRepository: Repository<User>) {}
  async findById(id: string) { /* ... */ }
}
```

**Express service (copied):**
```typescript
export class UsersService {
  private usersRepo: Repository<User>;
  constructor() { this.usersRepo = AppDataSource.getRepository(User); }
  async findById(id: string) { /* ... */ }
}
```

**No business logic changes** — services ported 1:1.

### 12.2 Handler mapping

| NestJS | Express |
|---|---|
| @Controller('/users') | express.Router() |
| @Get(':id') | router.get('/:id', handler) |
| @Post() | router.post('/', handler) |
| @UseGuards(JwtAuthGuard) | authMiddleware |
| throw new BadRequestException() | throw new Error() (caught by error middleware) |

### 12.3 Database schema (no changes)

All TypeORM entities, migrations, seeds copied as-is.

---

## 13. Performance optimization

### 13.1 Backend

- **Connection pooling:** PostgreSQL max_connections=100 (via RDS)
- **Query optimization:** Index frequently filtered columns (tenant_id, user_id, created_at)
- **Caching:** Redis for user, tenant, configuration data
- **Compression:** gzip responses (compression middleware)

### 13.2 Frontend

- **Code splitting:** Remix automatic per-route chunk
- **Lazy loading:** Components via React.lazy()
- **Image optimization:** Next-gen formats (WebP), lazy img loading
- **CSS purging:** Tailwind JIT removes unused styles

---

## 14. Rollback plan

### 14.1 Pre-deployment

1. Full database backup (pg_dump)
2. Git tag current production (NestJS commit)
3. Test data migration on staging
4. Smoke tests pass on staging

### 14.2 During deployment

- Kubernetes rolling update (old → new pods gradually)
- Blue-green deployment option (parallel clusters)
- Health checks on readiness probe (`/api/v1/health`)

### 14.3 Rollback trigger

- Error rate >5% for 5 min → auto-rollback via Helm
- Manual rollback: `helm rollback dncore prod-release 1`

---

## Appendix A: Dependency mapping

| Package | NestJS | Express | Reason |
|---|---|---|---|
| express | Platform | Core | HTTP handler |
| typescript | Yes | Yes | Type safety |
| typeorm | Yes | Yes | ORM (unchanged) |
| pg | Yes | Yes | PostgreSQL driver |
| ioredis | Yes | Yes | Redis client |
| amqplib | Yes | Yes | RabbitMQ |
| @elastic/elasticsearch | Yes | Yes | Search |
| bcryptjs | Yes | Yes | Password hashing |
| jsonwebtoken | `@nestjs/jwt` | Direct | JWT signing |
| class-validator | `@nestjs/common` | Zod | Validation |
| passport | `@nestjs/passport` | Direct | Auth middleware |
| helmet | `@nestjs/common` | Direct | Security headers |
| cors | Platform | Direct | CORS |
| compression | Platform | Direct | gzip |
| @remix-run/node | N/A | Frontend | Remix server |
| react | Yes | Yes | UI |
| react-router | Yes → Remix | Yes (built-in) | Routing |
