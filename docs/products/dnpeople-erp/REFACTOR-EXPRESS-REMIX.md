# dnCore Runtime Refactor — Express + Remix

Updated: 22 July 2026
Source repository: https://github.com/dreamcraft17/erp
Canonical implementation docs: https://github.com/dreamcraft17/erp/tree/main/Docs/refactor

## Current runtime

dnCore production runtime is:

- Express 5 native API, compiled from backend/src/express/, managed by PM2 as dncore-api on port 3001.
- Remix SSR, built from frontend/app/, managed by PM2 as dncore-web on port 3000.
- Nginx reverse proxy: /api/* to Express and all other paths to Remix.
- PostgreSQL + TypeORM for persistent data. Redis, RabbitMQ, and Elasticsearch are optional services by feature.

NestJS modules and services remain as domain/data-layer compatibility code where needed, but Nest is not bootstrapped by the production Express entrypoint. The frontend no longer uses a SPA catch-all or MemoryRouter.

## VPS deployment

    git pull origin main
    npm install
    cd backend && npm install && cd ..
    cd frontend && npm install && cd ..
    npm run build
    pm2 start ecosystem.config.cjs
    pm2 save

Use the repository files ecosystem.config.cjs and deploy/nginx/dncore.conf. Full runbook:
https://github.com/dreamcraft17/erp/blob/main/Docs/PM2-NGINX-DEPLOYMENT.md

Docker Compose, Kubernetes/Helm, and Terraform remain optional deployment alternatives; they are not required for the PM2 + Nginx VPS setup.

## Validation status

- Backend build: passed.
- Remix production build: passed.
- Backend tests: 408 tests / 88 suites passed.
- Native Express smoke: health, metrics, register, and login passed.
- Static checks: no Nest bootstrap/bridge in Express runtime; no frontend SPA router/catch-all.
