# DuaVulnScanner — System Design Document (SDD)

| | |
|---|---|
| **Product** | DuaVulnScanner (DVS) |
| **Referensi** | PRD + SRS v0.1.0-MVP |
| **Tanggal** | 24 Juli 2026 |
| **Stack** | NestJS · Next.js · PostgreSQL · Prisma · Redis/Bull (optional) |

---

## 1. Architecture

```
┌──────────────┐   REST/WS    ┌─────────────────┐
│ Next.js UI   │ ───────────► │ NestJS API      │
│ Dashboard    │              │ Controllers     │
│ Scans/Findings│             │ Services        │
│ Reports      │              │ PassiveWebScanner │
└──────────────┘              └────────┬────────┘
                                       │
                         ┌─────────────┼─────────────┐
                         ▼             ▼             ▼
                   PostgreSQL       Redis         Disk/S3
                   (Prisma)      (cache/queue)   (reports)
```

Monorepo:

```
dvs/
├── apps/backend/     # NestJS :4100
├── apps/frontend/    # Next.js :3100
├── docs/PRD/         # PRD SRS SDD
└── README.md
```

---

## 2. API (MVP)

**Auth:** `POST /api/v1/auth/register|login|logout` · `GET /api/v1/auth/me`  
**Scans:** `POST/GET /api/v1/scans` · `POST .../start|stop` · `GET .../progress`  
**Findings:** `GET/PATCH /api/v1/findings/:id` · comments/assign later  
**Reports:** `POST /api/v1/reports` · `GET .../download`  
**Analytics:** `GET /api/v1/analytics/dashboard`  
**Health:** `GET /api/v1/health`

Envelope:

```json
{ "success": true, "data": {}, "message": "ok", "timestamp": "ISO-8601" }
```

---

## 3. Database (Prisma models)

- `User` — email, passwordHash, role, teamId  
- `Team` — name, description  
- `Test` — teamId, name, scope(json), type, status  
- `Scan` — testId, targetUrl, scanType, status, progressPercent  
- `Finding` — scanId, title, severity, cvss, component, poc, remediation, status, cweIds, owaspCategory  
- `Comment`, `AuditLog`, `Report`

Indexes: teamId, status, severity, scanId, createdAt.

---

## 4. Frontend routes

`/login` · `/dashboard` · `/scans` · `/scans/new` · `/scans/[id]` · `/findings` · `/findings/[id]` · `/reports` · `/settings`

---

## 5. PassiveWebScanner (MVP)

1. Normalize target URL (https only unless allowHttp)  
2. Fetch home + robots/sitemap (bounded, max N URLs)  
3. Check response headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy  
4. Cookie Secure/HttpOnly/SameSite flags  
5. Optional TLS cert expiry via Node `tls.connect`  
6. Emit findings with remediation text (no injection payloads)

---

## 6. Security

- bcrypt passwords; JWT access 1h + refresh 7d  
- Team isolation middleware  
- Audit on finding/scan mutations  
- `.env` gitignored; no secrets in logs  

---

## 7. Deploy

VPS: Nginx → frontend :3100 + API :4100 · Postgres · Redis optional  
CI: lint + unit tests on push `main`

---

## 8. Testing

| Layer | Tool | Target |
|-------|------|--------|
| Unit | Jest | ScanService, AuthService |
| API | Jest/supertest | auth + scans |
| E2E | Playwright (later) | login→scan→report |

---

*Referensi prompt: `docs/PENTEST_TOOL_SDD_PROMPT.md`*
