# dnCore ERP — Tech Stack

Dokumen ini merangkum teknologi yang terdeteksi dari source code, `package.json`, konfigurasi runtime, Docker, CI/CD, Kubernetes, Terraform, dan dokumentasi proyek.

> Status dokumen: hasil scan repository pada 22 Juli 2026. Dependency aktual menjadi acuan utama; item yang hanya ada di dokumentasi ditandai sebagai planned, optional, atau on hold.

## 1. Ringkasan arsitektur

dnCore adalah ERP SaaS multi-tenant dengan arsitektur **modular monolith**:

```text
Browser / Mobile-first Web SPA
          |
          | REST API + JWT
          v
NestJS 10 API (modular monolith)
          |
  PostgreSQL | Redis | RabbitMQ | Elasticsearch
          |
Docker Compose / Kubernetes + Helm / AWS Terraform
```

Komponen aplikasi:

| Komponen | Lokasi | Status |
|---|---|---|
| Frontend web SPA | `frontend/` | Aktif |
| Backend REST API | `backend/` | Aktif |
| Native mobile | `mobile/` | Foundation tersedia, on hold |
| Infrastructure & deployment | `docker-compose*.yml`, `k8s/`, `terraform/` | Tersedia; sebagian production deployment bergantung secret/cloud |

## 2. Frontend

### 2.1 Core stack

| Area | Teknologi | Versi/package aktual |
|---|---|---|
| Language | TypeScript | `~6.0.2` |
| UI framework | React | `^19.2.7` |
| DOM renderer | React DOM | `^19.2.7` |
| Build tool/dev server | Vite | `^8.1.0` |
| React Vite integration | `@vitejs/plugin-react` | `^6.0.2` |
| Routing | Remix file-based routing (`@remix-run/react`) | `^2.4.0` |
| Global state | Redux Toolkit + React Redux | `^2.12.0` / `^9.3.0` |
| HTTP client | Axios | `^1.18.1` |
| UI component library | MUI / Material UI | `^9.1.2` |
| Icons | MUI Icons Material | `^9.1.1` |
| CSS/styling | Tailwind CSS | `^4.3.1` |
| Vite Tailwind integration | `@tailwindcss/vite` | `^4.3.1` |
| CSS-in-JS runtime | Emotion React/Styled | `^11.14.x` |
| Charts | Recharts | `^3.9.0` |
| Forms | React Hook Form | `^7.80.0` |
| Schema validation | Zod + Hook Form Resolvers | `^4.4.3` / `^5.4.0` |
| Date utility | Day.js | `^1.11.21` |
| Notifications | React Toastify | `^11.1.0` |

### 2.2 Struktur dan pola implementasi

- Entry point: `frontend/src/main.tsx`.
- Root application dan route composition: `frontend/src/App.tsx`.
- HTTP API wrapper: `frontend/src/api/client.ts`.
- Redux store dan auth state: `frontend/src/store/`.
- Reusable UI: `frontend/src/components/`, termasuk `CrudTable`, `FormDialog`, `ScrollableTable`, `Layout`, dan `ProtectedRoute`.
- Page-based SPA: `frontend/src/pages/`.
- Internationalization: `frontend/src/i18n/`, dengan dukungan locale dan default bahasa Indonesia.
- Responsive/mobile-first web: MUI breakpoints, navigation drawer, dan tabel yang dapat di-scroll pada layar kecil.
- Frontend mengakses backend melalui REST API; development proxy `/api` diarahkan ke `http://localhost:3000` di `frontend/vite.config.ts`.

### 2.3 Fitur frontend utama

Frontend mencakup halaman untuk dashboard, finance, sales, inventory, HR, manufacturing, projects, CRM, fixed assets, reporting, report builder, dashboard builder, analytics, documents, workflows, integrations, billing/settings, audit, GDPR, portal customer/vendor, authentication, dan enterprise V3.

### 2.4 Frontend quality tooling

| Area | Tool |
|---|---|
| Type checking/build | TypeScript compiler (`tsc -b`) |
| Lint | Oxlint |
| E2E testing | Cypress `^15.18.0` |
| Production container | Multi-stage Node 20 Alpine build lalu Nginx Alpine |

Catatan: Jest dan React Testing Library tidak terdaftar sebagai dependency frontend aktual; testing frontend yang tersedia di konfigurasi adalah Cypress E2E dan build/type-check.

## 3. Backend

### 3.1 Core stack

| Area | Teknologi | Versi/package aktual |
|---|---|---|
| Runtime/container | Node.js | Node 20 pada Docker dan CI |
| Language | TypeScript | `^5.1.3` |
| Framework | NestJS | `^10.0.0` |
| HTTP adapter | Express melalui `@nestjs/platform-express` | `^10.0.0` |
| ORM | TypeORM | `^0.3.20` |
| Database driver | `pg` | `^8.22.0` |
| Primary database | PostgreSQL | 15 Alpine pada Docker/CI |
| In-memory database test mode | pg-mem | `^3.0.14` |
| API style | REST, URI versioning | Prefix default `/api`, version `/v1` |
| API documentation | Swagger/OpenAPI | `@nestjs/swagger ^7.4.2` |
| Scheduling | Nest Schedule | `@nestjs/schedule ^4.1.2` |
| Events | Nest Event Emitter | `@nestjs/event-emitter ^2.1.1` |

### 3.2 Backend modules

Backend menggunakan modul domain NestJS di `backend/src/modules/`, antara lain:

- Auth, tenants, users, portal, dan billing.
- Finance, sales, supply chain, inventory, HR, manufacturing, projects, CRM, dan fixed assets.
- Reporting, workflow, analytics, documents, integrations, notifications, dan scheduler.
- Enterprise, industry, compliance, ops, LMS, dan platform registry.
- Health dan metrics.

Struktur pendukung:

- `backend/src/common/`: guards, interceptors, filters, audit, tenant handling, export, dan shared controllers.
- `backend/src/infrastructure/`: metrics, email, queue, search, export, dan event consumers.
- `backend/src/database/`: TypeORM data source, migrations/seed, dan pg-mem mode.

### 3.3 Persistence, cache, queue, dan search

| Fungsi | Teknologi | Implementasi |
|---|---|---|
| Relational data | PostgreSQL 15 | TypeORM + native `pg` driver |
| Schema migration | TypeORM CLI | `backend/src/database/` dan migration scripts |
| Test database | pg-mem | `DB_MODE=memory` / in-memory mode |
| Cache | Redis 7 | `ioredis`, Nest Cache Manager |
| Background/job queue | Bull | `bull` + `@nestjs/bull`, Redis-backed |
| Event/message broker | RabbitMQ 3.12 | `amqplib`, event-driven integration |
| Full-text/search | Elasticsearch 8.11 container | `@elastic/elasticsearch` |
| ORM cache abstraction | Nest Cache Manager | `@nestjs/cache-manager`, `cache-manager` |

RabbitMQ dipakai untuk event-driven business integration, sedangkan Bull tersedia untuk background job processing. Keduanya bukan pengganti satu sama lain.

### 3.4 Authentication dan security

- JWT authentication menggunakan `@nestjs/jwt`, Passport, `passport-jwt`, dan global `JwtAuthGuard`.
- Portal memiliki alur/auth JWT terpisah dari admin authentication.
- Password hashing menggunakan `bcryptjs`.
- 2FA/TOTP menggunakan `otplib`.
- Google SSO/OAuth tersedia melalui pola Passport dan modul auth.
- Request validation menggunakan `class-validator`, `class-transformer`, dan global `ValidationPipe` dengan whitelist serta rejection terhadap field tidak dikenal.
- Security headers menggunakan Helmet.
- Rate limiting menggunakan `@nestjs/throttler`.
- HTTP response compression menggunakan `compression`.
- CORS dikontrol melalui `CORS_ORIGIN` dan `CORS_CREDENTIALS`.
- Multi-tenancy diterapkan melalui tenant context/schema interceptor dan tenant-aware domain modules.
- Audit trail menggunakan audit interceptor, entity subscriber, dan audit controllers.
- Secret production dimuat melalui konfigurasi environment/secrets.

### 3.5 API dan integrasi

- Base URL default: `http://localhost:3000/api/v1`.
- Swagger UI development: `http://localhost:3000/api/docs`.
- Metrics endpoint: `/api/v1/metrics` sesuai konfigurasi monitoring.
- Health endpoint: `/api/v1/health` serta liveness endpoint untuk container health check.
- Email: Nodemailer dengan SMTP/development fallback.
- File/document export: ExcelJS dan PDFKit.
- QR code: `qrcode`.
- Date/time: Day.js.
- SMTP/email delivery, exports, document upload, integrations, billing, and notifications are represented in backend modules.

Catatan penting: Stripe, S3, dan beberapa connector eksternal muncul pada dokumentasi/infrastructure design, tetapi tidak terlihat sebagai dependency SDK utama pada `backend/package.json`. Implementasi connector perlu dianggap sebagai module/configuration-specific atau planned sampai diverifikasi di source terkait.

## 4. Native mobile

Direktori `mobile/` berisi foundation React Native berbasis Expo:

| Area | Teknologi | Versi/package aktual |
|---|---|---|
| Framework | Expo | `~52.0.0` |
| Native runtime | React Native | `0.76.0` |
| UI runtime | React | `18.3.1` |
| Language | TypeScript | `~5.3.0` |
| Navigation | React Navigation | `^7.0.0` |
| Secure token storage | Expo SecureStore | `~14.0.0` |
| Local storage | Async Storage | `1.23.1` |
| Biometrics | Expo Local Authentication | `~15.0.0` |
| Push notifications | Expo Notifications | `~0.29.0` |
| Screen/safe area | React Native Screens, Safe Area Context | `~4.1.0` / `4.12.0` |
| Build/release profile | EAS config | `mobile/eas.json` |

Native mobile berstatus **on hold**. Jalur mobile yang aktif saat ini adalah responsive web SPA di `frontend/`.

## 5. Observability dan operations

| Area | Teknologi/config |
|---|---|
| Application metrics | `prom-client`, endpoint `/metrics` |
| Metrics collection | Prometheus `v2.48.0` |
| Dashboards | Grafana `10.2.0` |
| Load testing | k6 scripts di `scripts/load-test/` |
| Database backup | `pg_dump` melalui `scripts/db-backup.sh` |
| Restore drill | `scripts/restore-drill.sh` |
| Smoke/acceptance checks | staging, production, security, migration scripts |
| Logging | Nest buffered logs dan container stdout |

## 6. Containerization dan deployment

### Local/development

Docker Compose menjalankan:

- PostgreSQL 15 Alpine.
- Redis 7 Alpine.
- RabbitMQ 3.12 Management Alpine.
- Elasticsearch 8.11.
- Prometheus 2.48.
- Grafana 10.2.
- Backend API pada port `3000`.
- Frontend Nginx pada port `5173`.

File utama: `docker-compose.yml`.

### Production container stack

File `docker-compose.prod.yml` menambahkan restart policy, persistent volume, environment-based secrets, Redis AOF, Elasticsearch security, dan frontend pada port `80`.

### Kubernetes

Kubernetes artifacts tersedia pada `k8s/` dan Helm chart pada `k8s/helm/`:

- API dan frontend deployment/service.
- Ingress Nginx.
- HPA dengan target CPU.
- PodDisruptionBudget.
- Staging dan production values.
- Prometheus scrape path.

### AWS/Terraform

Terraform pada `terraform/` menyediakan konfigurasi untuk:

- AWS VPC, subnet, routing, IAM, dan optional EKS.
- S3 bucket dokumen dan backup.
- Optional S3 + CloudFront untuk frontend SPA.
- Monitoring CloudWatch/SNS.
- Resource database/cache sesuai konfigurasi environment dan variables.

### CI/CD

GitHub Actions pada `.github/workflows/` menjalankan:

- Backend install, migration, unit/coverage test, dan build.
- Frontend install dan build.
- Cypress E2E flow.
- Docker image build.
- Helm lint.
- Optional production migration/deploy ke AWS EKS.

## 7. Testing dan quality gates

| Layer | Tool/command |
|---|---|
| Backend unit/integration | Jest + ts-jest |
| Backend HTTP/E2E | Supertest + Jest E2E config |
| Backend coverage | Jest coverage; threshold global 60% statements/lines |
| Backend DB test | pg-mem |
| Frontend E2E | Cypress |
| Static/type checks frontend | `tsc -b`, Oxlint |
| Build validation | `npm run build` untuk backend dan frontend |
| Load test | k6 |
| Production checks | smoke, security acceptance, checklist scripts |

## 8. Versi runtime dan command utama

Persyaratan yang terlihat pada CI/container:

- Node.js 20.
- npm dengan lockfile per aplikasi.
- Docker dan Docker Compose.
- PostgreSQL 15 jika tidak memakai container.

Command root yang tersedia:

```bash
npm run infra:up       # start PostgreSQL, Redis, RabbitMQ, Elasticsearch
npm run infra:down     # stop infrastructure containers
npm run dev:backend    # NestJS watch mode
npm run dev:frontend   # Vite dev server
npm run dev:mem        # backend dengan pg-mem/in-memory mode
npm run build          # build backend + frontend
npm test               # backend test
npm run test:e2e       # frontend Cypress E2E
npm run smoke          # staging smoke test
npm run smoke:prod     # production smoke test
```

## 9. Source of truth yang dipakai

- `frontend/package.json` — dependency dan script frontend.
- `backend/package.json` — dependency dan script backend.
- `mobile/package.json` — dependency native mobile.
- `backend/src/main.ts` dan `backend/src/app.module.ts` — runtime bootstrap, API, security, module, cache, dan global middleware.
- `docker-compose.yml` dan `docker-compose.prod.yml` — service/container aktual.
- `frontend/vite.config.ts` — build, Tailwind plugin, dan API proxy.
- `.github/workflows/` — CI/CD aktual.
- `k8s/` dan `terraform/` — deployment/orchestration/cloud infrastructure.
- `Docs/CURRENT-IMPLEMENTATION.md` dan `Docs/04-TECH-STACK-GUIDE.md` — konteks arsitektur dan implementation guide.
