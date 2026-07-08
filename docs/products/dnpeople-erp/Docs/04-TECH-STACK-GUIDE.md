# TECH STACK & IMPLEMENTATION GUIDE
## dnPeople - Complete Setup & Best Practices (NestJS Version)

**Version:** 1.1 Enterprise Ready  
**Date:** June 2026 · **Implementation sync:** 3 Juli 2026  
**Backend Framework:** NestJS 10 (actual — SDD originally specified Express)

---

## 1. DEVELOPMENT ENVIRONMENT SETUP

### 1.1 Prerequisites
```bash
# Required Software
- Node.js 18 LTS or higher
- npm 9+ or yarn 3+
- Docker 24+
- Docker Compose 2.10+
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)
- Git 2.40+
- Visual Studio Code (recommended)
- NestJS CLI
```

### 1.2 Install NestJS CLI
```bash
# Install globally
npm install -g @nestjs/cli

# Verify installation
nest --version

# Create new project
nest new dnPeople-backend

# Navigate to project
cd dnPeople-backend
```

### 1.3 Local Development Setup

#### Docker Compose for Local Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: erp_dev
      POSTGRES_USER: erp_user
      POSTGRES_PASSWORD: erp_password_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - erp_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U erp_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - erp_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: erp_user
      RABBITMQ_DEFAULT_PASS: erp_password
    ports:
      - "5672:5672"
      - "15672:15672"  # Management UI
    networks:
      - erp_network
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    networks:
      - erp_network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/ || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Optional: pgAdmin for database management
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@dnPeople.dev
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - erp_network

volumes:
  postgres_data:

networks:
  erp_network:
    driver: bridge
```

#### Run Development Environment
```bash
# Start all services
docker-compose up -d

# Verify all services are healthy
docker-compose ps

# View logs
docker-compose logs -f

# Access services
# PostgreSQL: localhost:5432 (user: erp_user, pass: erp_password_dev)
# Redis: localhost:6379
# RabbitMQ Admin: http://localhost:15672 (user: erp_user, pass: erp_password)
# Elasticsearch: http://localhost:9200
# pgAdmin: http://localhost:5050 (user: admin@dnPeople.dev, pass: admin)
```

---

## 2. BACKEND SETUP - NESTJS

### 2.1 Project Structure
```
dnPeople-backend/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root module
│   ├── app.service.ts               # Root service
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   ├── local.strategy.ts
│   │   │   │   └── oauth.strategy.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── roles.guard.ts
│   │   │   │   └── tenant.guard.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── refresh-token.dto.ts
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   └── public.decorator.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   ├── finance/
│   │   │   ├── finance.module.ts
│   │   │   ├── controllers/
│   │   │   │   ├── gl.controller.ts
│   │   │   │   ├── ap.controller.ts
│   │   │   │   └── ar.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── gl.service.ts
│   │   │   │   ├── ap.service.ts
│   │   │   │   └── ar.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── chart-of-account.entity.ts
│   │   │   │   ├── journal-entry.entity.ts
│   │   │   │   └── invoice.entity.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-chart-of-account.dto.ts
│   │   │   │   └── create-journal-entry.dto.ts
│   │   │   └── repositories/
│   │   │       └── gl.repository.ts
│   │   ├── sales/
│   │   ├── supply-chain/
│   │   ├── hr/
│   │   ├── manufacturing/
│   │   ├── projects/
│   │   ├── reporting/
│   │   ├── tenants/
│   │   ├── integrations/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   ├── current-tenant.decorator.ts
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   └── public.decorator.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── tenant.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   └── transform.interceptor.ts
│   │   │   ├── pipes/
│   │   │   │   ├── validation.pipe.ts
│   │   │   │   └── parse-uuid.pipe.ts
│   │   │   └── middleware/
│   │   │       ├── request-logging.middleware.ts
│   │   │       └── tenant-context.middleware.ts
│   │   └── database/
│   │       ├── typeorm.config.ts
│   │       ├── migrations/
│   │       │   ├── 1700000001-initial.migration.ts
│   │       │   ├── 1700000002-multi-tenant.migration.ts
│   │       │   └── [sequential migrations]
│   │       └── seeds/
│   │           ├── seed.module.ts
│   │           └── seeds.ts
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── rabbitmq.config.ts
│   │   └── elasticsearch.config.ts
│   └── common/
│       ├── interfaces/
│       ├── utils/
│       └── constants/
├── test/
│   ├── app.e2e-spec.ts
│   ├── finance/
│   │   ├── gl.e2e-spec.ts
│   │   ├── ap.e2e-spec.ts
│   │   └── ar.e2e-spec.ts
│   └── jest-e2e.json
├── .env.example
├── .env.development
├── .env.test
├── .env.production
├── nest-cli.json
├── tsconfig.json
├── jest.config.js
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### 2.2 Essential Dependencies

#### package.json
```json
{
  "name": "dnPeople-backend",
  "version": "1.0.0",
  "description": "dnPeople - Enterprise Resource Planning System",
  "author": "dnPeople Team",
  "license": "PROPRIETARY",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "db:migrate": "typeorm migration:run -d src/database/typeorm.config.ts",
    "db:migrate:generate": "typeorm migration:generate -d src/database/typeorm.config.ts src/database/migrations/migration",
    "db:migrate:revert": "typeorm migration:revert -d src/database/typeorm.config.ts",
    "db:seed": "ts-node src/database/seeds.ts"
  },
  "dependencies": {
    "@nestjs/cache-manager": "^2.1.0",
    "@nestjs/common": "^10.2.0",
    "@nestjs/config": "^3.1.0",
    "@nestjs/core": "^10.2.0",
    "@nestjs/cqrs": "^10.1.0",
    "@nestjs/event-emitter": "^2.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/platform-fastify": "^10.2.0",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/swagger": "^7.1.0",
    "@nestjs/throttler": "^4.1.0",
    "@nestjs/typeorm": "^9.0.0",
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "cache-manager": "^5.2.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dayjs": "^1.11.0",
    "elastic": "^8.0.0",
    "@elastic/elasticsearch": "^8.10.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.1.0",
    "lodash": "^4.17.21",
    "nodemailer": "^6.9.0",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "reflect-metadata": "^0.1.13",
    "stripe": "^14.0.0",
    "twilio": "^3.96.0",
    "typeorm": "^0.3.17",
    "uuid": "^9.0.1",
    "winston": "^3.11.0",
    "amqplib": "^0.10.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.2.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.2.0",
    "@types/compression": "^1.7.5",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.54.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "husky": "^8.0.3",
    "jest": "^29.7.0",
    "lint-staged": "^15.0.0",
    "prettier": "^3.1.0",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.0",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.3.3"
  }
}
```

### 2.3 Environment Configuration

#### .env.example
```bash
# Server Config
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
API_PREFIX=/api
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_dev
DB_USER=erp_user
DB_PASSWORD=erp_password_dev
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_LOGGING=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=erp_user
RABBITMQ_PASSWORD=erp_password

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200

# JWT
JWT_SECRET=your-secret-key-min-32-characters-long
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

# CORS
CORS_ORIGIN=http://localhost:3001
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=debug
LOG_FILE=/var/log/erp/app.log

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=dnPeople-files

# Email (SendGrid)
SENDGRID_API_KEY=
SMTP_FROM=noreply@dnPeople.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Payment (Stripe)
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=

# Sentry
SENTRY_DSN=
SENTRY_ENVIRONMENT=development

# Feature Flags
FEATURE_2FA=true
FEATURE_SSO=true
FEATURE_WEBHOOKS=true
FEATURE_API_KEYS=true
```

### 2.4 Main Application File

#### src/main.ts
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from '@nestjs/helmet';
import compression from 'compression';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // Use Fastify for better performance
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      trustProxy: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || '/api');

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: JSON.parse(process.env.CORS_CREDENTIALS || 'true'),
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('dnPeople API')
      .setDescription('Enterprise Resource Planning System REST API')
      .setVersion('1.0.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'jwt',
      )
      .addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-Key' }, 'api-key')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  const url = await app.getUrl();
  console.log(`
╔══════════════════════════════════════╗
║       dnPeople API Running           ║
╠══════════════════════════════════════╣
║ Application: ${url}
║ Environment: ${process.env.NODE_ENV}
║ Version: 1.0.0
${process.env.NODE_ENV !== 'production' ? `║ Docs: ${url}/api/docs\n` : ''}╚══════════════════════════════════════╝
  `);
}

bootstrap().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
```

### 2.5 Root Module

#### src/app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { FinanceModule } from './modules/finance/finance.module';
import { SalesModule } from './modules/sales/sales.module';
import { SupplyChainModule } from './modules/supply-chain/supply-chain.module';
import { HrModule } from './modules/hr/hr.module';
import { ManufacturingModule } from './modules/manufacturing/manufacturing.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      cache: true,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: ['dist/**/*.entity.js'],
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: true,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: configService.get('DB_LOGGING') === 'true',
        poolSize: configService.get<number>('DB_POOL_MAX'),
        maxQueryExecutionTime: 5000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    // Caching
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        ttl: 5 * 60 * 1000, // 5 minutes default
        max: 100, // Max items in cache
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Scheduling
    ScheduleModule.forRoot(),

    // Event emitting
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // Feature modules
    AuthModule,
    FinanceModule,
    SalesModule,
    SupplyChainModule,
    HrModule,
    ManufacturingModule,
    ProjectsModule,
    ReportingModule,
    TenantsModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
```

---

## 3. DATABASE SETUP

### 3.1 TypeORM Configuration

#### src/database/typeorm.config.ts
```typescript
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'erp_user',
  password: process.env.DB_PASSWORD || 'erp_password_dev',
  database: process.env.DB_NAME || 'erp_dev',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.DB_LOGGING === 'true',
};

export const AppDataSource = new DataSource(config);
```

### 3.2 Running Migrations

```bash
# Generate new migration
npm run db:migrate:generate -- migration_name

# Run pending migrations
npm run db:migrate

# Revert last migration
npm run db:migrate:revert

# Seed database
npm run db:seed
```

---

## 4. FRONTEND SETUP

### 4.1 React Project with Vite
```bash
# Create project
npm create vite@latest dnPeople-frontend -- --template react-ts

# Navigate
cd dnPeople-frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

### 4.2 Essential Frontend Dependencies

```bash
npm install react react-dom react-router-dom
npm install @reduxjs/toolkit react-redux
npm install @tanstack/react-query
npm install axios
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install recharts
npm install react-hook-form zod @hookform/resolvers
npm install react-toastify
npm install date-fns dayjs
npm install tailwindcss postcss autoprefixer
npm install -D typescript @types/react @types/react-dom

# Tailwind setup
npx tailwindcss init -p
```

---

## 5. DOCKER SETUP

### 5.1 Dockerfile for NestJS

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main.js"]
```

#### Dockerfile.dev
```dockerfile
FROM node:18-alpine

WORKDIR /app

RUN npm install -g @nestjs/cli

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
```

---

## 6. KUBERNETES DEPLOYMENT

### 6.1 API Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dnPeople-api
  labels:
    app: dnPeople-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: dnPeople-api
  template:
    metadata:
      labels:
        app: dnPeople-api
    spec:
      containers:
      - name: api
        image: your-registry/dnPeople-api:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: dnPeople-config
              key: db_host
        - name: REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: dnPeople-config
              key: redis_host
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
      imagePullSecrets:
      - name: registry-credentials

---
apiVersion: v1
kind: Service
metadata:
  name: dnPeople-api
spec:
  type: ClusterIP
  ports:
  - port: 3000
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: dnPeople-api

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: dnPeople-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: dnPeople-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 7. CI/CD PIPELINE

### 7.1 GitHub Actions
```yaml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm install
    - run: npm run lint
    - run: npm run test:cov
    - uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push'
    steps:
    - uses: actions/checkout@v3
    - uses: docker/setup-buildx-action@v2
    - uses: docker/login-action@v2
      with:
        registry: ${{ secrets.REGISTRY }}
        username: ${{ secrets.REGISTRY_USERNAME }}
        password: ${{ secrets.REGISTRY_PASSWORD }}
    - uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          ${{ secrets.REGISTRY }}/dnPeople-api:latest
          ${{ secrets.REGISTRY }}/dnPeople-api:${{ github.sha }}
```

---

## 8. TESTING

### 8.1 Unit Test Example
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { GlService } from './gl.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChartOfAccount } from '../entities/chart-of-account.entity';

describe('GlService', () => {
  let service: GlService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlService,
        {
          provide: getRepositoryToken(ChartOfAccount),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GlService>(GlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createChartOfAccount', () => {
    it('should create a chart of account', async () => {
      const dto = {
        code: '1000',
        name: 'Cash',
        accountType: 'ASSET',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue({ id: 'uuid', ...dto });

      const result = await service.createChartOfAccount('tenant-1', dto);

      expect(result).toHaveProperty('id');
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
```

### 8.2 Run Tests
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## 9. MONITORING & LOGGING

### 9.1 Logging Setup

#### src/common/interceptors/logging.interceptor.ts
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent');

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const delay = Date.now() - now;

        this.logger.log(
          `${method} ${url} ${statusCode} ${delay}ms - ${userAgent} ${ip}`,
        );
      }),
      catchError(error => {
        const delay = Date.now() - now;
        this.logger.error(
          `${method} ${url} ${error.statusCode || 500} ${delay}ms - ${userAgent} ${ip}`,
        );
        throw error;
      }),
    );
  }
}
```

### 9.2 Prometheus Integration
```bash
npm install @willsoto/nestjs-prometheus prom-client
```

---

## 10. QUICK START

### Development
```bash
# 1. Install dependencies
npm install

# 2. Start Docker services
docker-compose up -d

# 3. Run migrations
npm run db:migrate

# 4. Seed database
npm run db:seed

# 5. Start development server
npm run start:dev

# 6. Access Swagger docs
http://localhost:3000/api/docs
```

### Production
```bash
# 1. Build
npm run build

# 2. Start
npm run start:prod
```

---

## 11. TROUBLESHOOTING

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti :3000 | xargs kill -9
```

### Database connection issues
```bash
# Check database is running
docker-compose ps

# View logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
npm run db:migrate
```

### Node modules issues
```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

---

**Version:** 1.1 Enterprise Ready  
**Last Updated:** June 2026  
**Framework:** NestJS (not Express)

