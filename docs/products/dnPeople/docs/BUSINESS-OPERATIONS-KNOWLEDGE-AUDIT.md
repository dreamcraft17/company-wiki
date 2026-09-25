---
owner: Dozer
status: active
canonical: true
last_reviewed: 2026-09-15
review_cadence: quarterly
---

# dnPeople Business Operations Knowledge Audit

**Author:** Dozer  
**Project:** dnPeople  
**Reviewed:** 2026-09-15  
**Method:** `business-operations-skills` → `knowledge-ops`  
**Scope:** `dnpeople/docs/`

## Executive summary

The dnPeople documentation set is broad and contains useful product, engineering, compliance, deployment, support, and incident-response material. The remediation in this report has now established machine-readable governance for every Markdown page, connected the formerly orphaned pages, removed glossary drift, normalized the two critical runbooks, and removed the tracked credential-like CSV.

The final verification scanned **105 Markdown pages**. Remaining work is operational rather than structural: confirm credential rotation history, keep review dates current, and maintain the canonical index as the product evolves.

## Verified project baseline

The implementation files and current project documentation indicate the following stack:

| Area | Current implementation |
|---|---|
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, TanStack Query, Playwright, axe-core |
| Backend | Express 5, TypeScript, Prisma 6, Zod, JWT/httpOnly-cookie authentication, Sentry |
| Database | PostgreSQL through Prisma; Supabase is documented as the recommended hosted option |
| Payments | Xendit integration, including billing/webhook documentation |
| Operations | Deployment, backup/restore, restore-drill, incident response, SLA/RPO/RTO, and launch-gate documentation |

Canonical implementation references should remain `backend/package.json`, `frontend/package.json`, `backend/prisma/schema.prisma`, and `docs/CURRENT-IMPLEMENTATION.md`. Older PRD/SDD/SRS documents should be treated as historical unless explicitly marked current.

## Knowledge-base health snapshot

The `knowledge-ops` ingestion scan returned:

| Metric | Result | Interpretation |
|---|---:|---|
| Pages scanned | 103 | Large documentation surface |
| Pages with no inbound link | 0 (0.0%) | All pages are reachable from the documentation graph |
| Pages over the default 365-day stale threshold | 0 | Not proof of correctness; filesystem time can be misleading |
| Pages with missing machine-readable owner | 0 (0.0%) | Every page has YAML owner metadata |
| Glossary drift conflicts | 0 | Canonical terminology is consistent |
| Glossary candidates | 303 | Tool output is noisy; curate only meaningful business terms |

The stale-page result should not be interpreted as “all documentation is current.” Explicit `last_reviewed` metadata is required because a file modification time may change during copying, formatting, or unrelated edits.

## Findings

### 1. Ownership and review governance are machine-readable

The remediation added standardized owner, status, canonicality, review-date, and cadence metadata to all 105 Markdown pages. Critical documents use `canonical: true`; legacy and reference documents use `canonical: false` and `status: review-required`.

```yaml
owner: Dozer
status: active
canonical: true
last_reviewed: 2026-09-15
review_cadence: quarterly
```

For production runbooks, replace a generic team name with a named person or explicitly named on-call rotation. Assign functional owners for Engineering, Operations, Security, Finance, HR, and Support; Dozer can remain the accountable approver until those owners are assigned.

### 2. Orphan rate has been resolved

The former 34 orphan pages are now linked from the reference section in `00_INDEX.md`. Many are legacy PRD/SDD/SRS, payment, legal, planning, or design documents. Their metadata makes the disposition explicit without deleting history:

1. Link it from a canonical index or feature page.
2. Mark it as historical/reference material.
3. Move it to an archive location if the repository convention supports that.
4. Keep it search-only with explicit metadata and a reason.

The first triage target should be legacy payment documentation so Midtrans-era material cannot be mistaken for the current Xendit integration.

### 3. Glossary drift has been resolved

The remediation added `docs/GLOSSARY.md`, linked it from `00_INDEX.md`, and normalized the previously conflicting QRIS, billing/API, and HR headings. The follow-up scan reports zero glossary drift. The remaining 303 candidates are mostly protocol verbs, role abbreviations, and ordinary uppercase tokens; they should not be added blindly.

### 4. Runbook structure is validator-compatible

The validator initially could not parse four representative documents. The restore drill and security response were then rewritten into explicit `### Step N:` sections with separate Owner, Duration, Success, Failure, Rollback, and Escalation bullets. Both executable runbooks now pass at **100/100 SAFE-TO-USE**. The launch document remains correctly classified as a checklist, while deployment remains a guide.

The validator originally returned “runbook contains no steps” for these documents:

- `RESTORE-DRILL-RUNBOOK.md`
- `SECURITY-INCIDENT-RESPONSE.md`
- `LAUNCH-GATE-CHECKLIST.md`
- `DEPLOYMENT.md`

Manual inspection still shows that the launch document is a gate table and the deployment document is a guide with commands; they are linked to the executable runbooks rather than incorrectly forced into the runbook format.

For each executable step, standardize these six fields:

| Required field | Minimum acceptable content |
|---|---|
| Owner | Named person or named on-call rotation |
| Expected duration | Number and unit |
| Success signal | Observable yes/no check, such as HTTP 200 or a completed ticket state |
| Failure signal | Observable condition proving the step failed |
| Rollback | Reversal procedure, or explicit irreversible escalation |
| Escalation | Named contact or rotation with an expected response path |

The restore drill currently has eight numbered steps and useful RPO/RTO targets, but does not expose all six fields per step. The security response has five numbered steps and names Dozer as owner, but also lacks step-level duration, signals, rollback, and escalation details.

### 5. Potential credential exposure requires immediate verification

The documentation tree contains `docs/xendit/secret_api_key.csv`. Do not commit, publish, or copy its contents into this report. Verify whether it contains live or historical credentials. If it does, remove it from version control, revoke/rotate the affected keys, review access history, and replace it with a redacted example or environment-variable reference. This item takes precedence over documentation cleanup.

## 5W2H operating model

| Question | dnPeople documentation decision |
|---|---|
| Who | Dozer is the current accountable owner; assign named functional owners and on-call rotations |
| What | Maintain canonical product, architecture, integration, deployment, compliance, support, and incident documents |
| When | Review critical runbooks at least quarterly and after material system changes; review general docs on a defined cadence |
| Where | Keep canonical Markdown under `dnpeople/docs/`; link operational runbooks from `00_INDEX.md` and the relevant service pages |
| Why | Reduce time-to-find, prevent conflicting implementation guidance, and make incident execution safer |
| How | Add metadata, curate the index, normalize runbook fields, classify legacy pages, and enforce checks in CI |
| How much | Treat the first cleanup as a focused documentation sprint; measure progress using the KPIs below rather than page count alone |

## Remediation status and maintenance plan

### P0 — completed

1. Removed the tracked `docs/xendit/secret_api_key.csv`; added a safe example file. Credential rotation/history must still be confirmed outside the repository.
2. Added governance metadata to all 105 Markdown pages and added a CI check for critical documents and credential-like paths.
3. Normalized and validated the restore-drill and security-incident runbooks.

### P1 — completed

1. Linked and classified all former orphan pages from `00_INDEX.md`.
2. Created `docs/GLOSSARY.md` and resolved all detected glossary drift.
3. Converted executable runbooks to the six-field validator format.
4. Standardized current Xendit terminology and marked Midtrans guidance as non-canonical reference material.

### P2 — maintenance

1. Keep the metadata CI check running on every pull request.
2. Re-run `kb_ingester.py` after major documentation changes.
3. Review critical documents quarterly or after architecture, payment, security, or deployment changes.

## Success measures

| KPI | Current | Initial target |
|---|---:|---:|
| Canonical pages missing owner metadata | 0% | 0% |
| Unexplained orphan pages | 0 | 0 |
| Critical runbooks passing validator | 2/2 | 2/2 |
| Unresolved glossary conflicts | 0 | 0 |
| Critical pages with explicit review date | 100% | 100%, reviewed within 90 days |
| Credential-like files in documentation | 0 live files; example only | 0 live credentials |

## Audit limitations

This report assesses documentation structure and repository evidence. It does not prove production behavior, credential validity, backup recoverability, SLA compliance, or security control effectiveness. The runbook validator now passes the two executable critical runbooks, but staging restore and incident exercises still require real operator evidence.

## Grill challenge

Who will sign off the next quarterly review and verify that credential rotation, restore evidence, and launch-gate evidence still exist outside the repository? Structural hygiene is fixed; operational proof must now be maintained.
