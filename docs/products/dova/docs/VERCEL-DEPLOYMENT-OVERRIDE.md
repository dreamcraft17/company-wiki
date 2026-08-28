# DOVA Deployment Override

This document overrides older deployment sections that mention Docker and DigitalOcean App Platform.

## Current decision

- Frontend Next.js is built and deployed on Vercel via `vercel.json`.
- The repository does not use Dockerfile or Docker Compose for build/deploy.
- Backend NestJS runs on a separate Node.js runtime.
- PostgreSQL and Redis are provided as managed/external services via `DATABASE_URL` and `REDIS_URL`.
- CI runs install, build, typecheck, and test without building Docker images.
- Remote migrations are run manually via `.github/workflows/database-migrate.yml`.

If instructions in older documents differ from this decision, this document and the repository configuration are authoritative.
