# DuaVulnScanner — Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | DuaVulnScanner (DVS) |
| **Jenis** | All-in-One Penetration Testing Platform |
| **Company** | DN Tech (PT. Dozer Napitupulu Technology) |
| **Owner / CTO** | Dozer Fernando Saroha Daniel Napitupulu |
| **Versi** | 0.1.0-MVP |
| **Tanggal** | 24 Juli 2026 |
| **Status** | Draft → Approved for MVP build |
| **Repo (target)** | [github.com/dreamcraft17/dvs](https://github.com/dreamcraft17/dvs) |

---

## 1. Ringkasan eksekutif

**DuaVulnScanner** menggabungkan **Scanner + Reporting + Tracking** dalam satu platform self-hosted untuk security tester internal, profesional pentest, dan DevSecOps.

**UVP:** all-in-one (bukan hanya CLI scanner), compliance-aware (UU PDP / OWASP), API-first untuk CI/CD, self-hosted di VPS DN Tech.

**MVP (4 minggu):** web scanner pasif + tracking findings + report HTML/PDF dasar + auth RBAC + dashboard. Active exploit payload suites **out of MVP code** (lihat §7 Constraints / ethics).

---

## 2. Personas & target user

| Persona | Kebutuhan |
|---------|-----------|
| Security Tester | Jalankan scan, lihat findings + PoC ringkas, export report |
| Manager | Dashboard severity, assign remediasi, roadmap |
| Viewer | Baca report & metrics (read-only) |
| Admin | Users, teams, settings, audit |

---

## 3. Modul produk

### 3.1 Scanner

| Submodul | MVP | Post-MVP |
|----------|-----|----------|
| Web app (headers, TLS hint, form discovery, misconfig) | ✅ | Active SQLi/XSS/CSRF/IDOR engines (gated policy) |
| API security (auth header checks, CORS, rate-limit probe soft) | Week 3–4 | Full authz matrix |
| Infrastructure (SSH/SSL/ports) | Post | ✅ |
| Source code (deps / secrets) | Post | ✅ |
| Scheduling | Soft (manual start) | Recurring |

### 3.2 Reporting

| Fitur | MVP |
|-------|-----|
| Executive summary (1-pager) | ✅ HTML |
| Detailed findings | ✅ |
| Remediation roadmap (priority sort) | Week 3–4 |
| Compliance map (OWASP / CWE / UU PDP tags) | Soft |
| Export PDF / Markdown / Excel | HTML+MD MVP; PDF Week 2–3 |
| White-label | Post |

### 3.3 Tracking

| Fitur | MVP |
|-------|-----|
| Findings CRUD + severity/CVSS | ✅ |
| Test / scan management | ✅ |
| Workflow New→…→Verified / Accepted Risk | Week 3–4 |
| Comments + assign | Week 3–4 |
| Analytics dashboard | Week 4 |
| Audit log | ✅ basic |

---

## 4. Tech stack (locked)

| Layer | Choice |
|-------|--------|
| Backend | NestJS 10 + TypeScript |
| Frontend | Next.js (App Router) + React 19 + TypeScript |
| DB | PostgreSQL 16 + Prisma |
| Cache / queue | Redis + Bull (optional Week 2+) |
| Auth | JWT + RBAC (admin, manager, tester, viewer) |
| API | REST + OpenAPI |
| Deploy | Self-hosted VPS (Nginx + Node); Docker Compose optional |

---

## 5. MVP timeline (4 minggu)

| Week | Deliverable |
|------|-------------|
| 1 | Monorepo, schema, auth, teams, API skeleton, UI shell |
| 1–2 | Web passive scanner + findings store + HTML report |
| 2–3 | Report PDF/MD, scan progress UI |
| 3 | API soft checks, workflow + assign + comments |
| 3–4 | Dashboard metrics, email notify (optional SMTP) |
| 4 | Hardening, docs, staging deploy, internal UAT |

---

## 6. NFR (ringkas)

- Scan web tipikal: target &lt; 5 menit (passive crawl bounded)
- Report 100 findings: &lt; 30 dtk
- Dashboard: &lt; 2 dtk
- Concurrent scans: ≥ 3 (queue)
- Encrypt secrets at rest; TLS in transit; team row-level isolation
- Uptime internal: 99%

---

## 7. Constraints & ethics

- **Tidak** menyimpan raw secrets hasil scan di plaintext log
- Scan hanya ke target yang diizinkan (scope + confirmation)
- Implementasi MVP **tidak** menyertakan exploit kit / weaponized payload lists di repo publik
- Active offensive modules = policy gate + separate private pack (post-MVP)

---

## 8. Success criteria (MVP)

- [ ] Tester dapat create test → start scan → lihat findings → export HTML
- [ ] Manager melihat dashboard severity
- [ ] RBAC mencegah akses lintas-team (default)
- [ ] Deploy staging VPS DN Tech
- [ ] Internal feedback ≥ 4/5 setelah UAT PT2

---

## 9. Pricing (future)

Free (5 tests/bulan) · Pro · Enterprise — **bukan scope MVP**.

---

## 10. Sign-off

| Role | Nama | Tanggal |
|------|------|---------|
| Product Owner / CTO | Dozer | _________ |

---

*Referensi prompt: `docs/PENTEST_TOOL_PRD_PROMPT.md`*
