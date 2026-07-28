# DN Tech — Testing SRS
## System Requirements Specification (Test Cases & Acceptance Criteria)

**Date:** Juli 2026  
**Owner:** QA + Engineering Team  
**Reference:** `DN-TECH-TESTING-PRD.md`

## Coverage & Acceptance Snapshot

| Layer | Current | Target | Status |
|-------|---------|--------|--------|
| Backend critical set | 76.17% statements / 77.28% lines | ≥75% critical paths | ✅ |
| Frontend critical set | 67.33% statements / 78.00% functions / 69.36% lines | ≥70% critical paths | ✅ scenario target terpenuhi |
| Integration scenarios | 15+ | 15+ | ✅ |
| E2E scenarios | 5 (10 runs on desktop+mobile) | 5+ | ✅ |
| CI required checks | Active | Mandatory | ✅ |

## Functional Acceptance

- [x] Auth flow tested (`/auth/login`, `/auth/refresh`)
- [x] Lead flow tested (`/leads`, duplicate and validation paths)
- [x] Newsletter flow tested (subscribe and validation paths)
- [x] Product public flow tested (`/products`, `/products/:slug`)
- [x] Frontend critical component and helper coverage expanded
- [x] E2E smoke+critical navigation paths covered

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
