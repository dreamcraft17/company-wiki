# DuaVulnScanner — Software Requirements Specification (SRS)

| | |
|---|---|
| **Product** | DuaVulnScanner (DVS) |
| **Referensi** | [DuaVulnScanner_PRD.md](./DuaVulnScanner_PRD.md) |
| **Versi** | 0.1.0-MVP |
| **Tanggal** | 24 Juli 2026 |
| **Bahasa** | Indonesia + istilah teknis EN |

---

## 1. Functional requirements

### 1.1 Scanner

| ID | Requirement | Priority | AC (ringkas) |
|----|-------------|----------|--------------|
| FR-SCAN-001 | Web passive scan: discovery URL/form, security headers, cookie flags, TLS expiry hint | P0 | Completes ≤5m bounded crawl; findings + evidence JSON |
| FR-SCAN-002 | API soft scan: missing auth header patterns, CORS `*`, open OPTIONS | P1 | ≤3m for ≤50 paths from OpenAPI/URL list |
| FR-SCAN-003 | Infra scan (SSH/firewall/DB/Docker) | P2 | Post-MVP |
| FR-SCAN-004 | Source/deps/secrets scan | P2 | Post-MVP |
| FR-SCAN-005 | Scan CRUD + start/stop + progress | P0 | Progress % via API; fail retry ≤3 |

### 1.2 Reporting

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-REPORT-001 | Executive summary 1-pager | P0 |
| FR-REPORT-002 | Detailed finding report | P0 |
| FR-REPORT-003 | Remediation roadmap | P1 |
| FR-REPORT-004 | OWASP/CWE/UU PDP mapping tags | P1 |
| FR-REPORT-005 | Export HTML, Markdown; PDF; Excel later | P0/P1 |

### 1.3 Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TRACK-001 | Findings DB + filter/search | P0 |
| FR-TRACK-002 | Test management | P0 |
| FR-TRACK-003 | Status workflow | P1 |
| FR-TRACK-004 | Assign + comments | P1 |
| FR-TRACK-005 | Analytics dashboard | P1 |
| FR-TRACK-006 | RBAC roles admin/manager/tester/viewer | P0 |

---

## 2. Non-functional

| ID | Area | Target |
|----|------|--------|
| NFR-PERF-001 | Performance | Scan/report/dashboard per PRD |
| NFR-SCALE-001 | Scale | 3+ concurrent scans; 10k findings |
| NFR-SEC-001 | Security | AES-256 secrets, TLS 1.2+, RLS team, audit |
| NFR-REL-001 | Reliability | Daily backup; scan retry |
| NFR-MAINT-001 | Maintainability | OpenAPI, structured logs |

---

## 3. Use cases

### UC-1 Tester web scan
1. Login → New Scan → target URL + type `web_app` → Start  
2. Monitor progress → View findings → Export HTML  

### UC-2 Manager assign
1. Findings → filter Critical/High → Assign → due date → In-Progress  

### UC-3 Developer remediate
1. Open finding → comment fix ref → status Remediated → tester Verified  

---

## 4. Data flow (scan)

```
User → POST /scans/:id/start → ScanService → Queue(optional)
  → PassiveWebScanner (bounded) → VulnService (dedupe/CVSS)
  → findings table → WebSocket/poll progress → Dashboard
```

---

## 5. Schema requirements (logical)

Entities: `users`, `teams`, `tests`, `scans`, `findings`, `comments`, `audit_log`, `reports`  
(Detail DDL: SDD.)

---

## 6. Test scenarios (MVP)

| ID | Scenario | Expected |
|----|----------|----------|
| TS-SCAN-001 | Target missing CSP/HSTS | Finding medium+ with remediation |
| TS-REPORT-001 | Export HTML 10 findings | File ready &lt; 30s |
| TS-TRACK-001 | Assign finding | Assignee set + audit row |

---

## 7. Roles matrix

| Action | Admin | Manager | Tester | Viewer |
|--------|-------|---------|--------|--------|
| Manage users/teams | ✅ | — | — | — |
| Create/start scan | ✅ | ✅ | ✅ | — |
| Edit finding status | ✅ | ✅ | ✅ | — |
| Assign findings | ✅ | ✅ | — | — |
| Export reports | ✅ | ✅ | ✅ | ✅ |
| View audit | ✅ | — | — | — |

---

## 8. Assumptions & constraints

Sesuai PRD §7: authorized targets only; no weaponized exploit payloads in public MVP repo.

---

*Referensi prompt: `docs/PENTEST_TOOL_SRS_PROMPT.md`*
