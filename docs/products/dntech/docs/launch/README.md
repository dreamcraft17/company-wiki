# DN Tech Relaunch — Pre-Fix Documentation Pack

> **Author:** Dozer · **Date:** 2026-08-29

Dokumen ini dibuat **sebelum** sprint fix relaunch `dntech.id`, menggunakan skill launch-strategy, adversarial-reviewer, anti-ai-slop-design, dan md-generator.

| Doc | Purpose |
|-----|---------|
| [DN-TECH-RELAUNCH-PRD.md](../DN-TECH-RELAUNCH-PRD.md) | One-page PRD — scope, RICE, success criteria |
| [../qa/DN-TECH-BUG-TRIAGE-2026-08-29.md](../qa/DN-TECH-BUG-TRIAGE-2026-08-29.md) | P0–P3 tickets (human approval) |
| [DN-TECH-RELAUNCH-LAUNCH-PLAN.md](./DN-TECH-RELAUNCH-LAUNCH-PLAN.md) | ORB channels, phases, launch-day checklist |
| [DN-TECH-RELAUNCH-ADVERSARIAL-REVIEW.md](./DN-TECH-RELAUNCH-ADVERSARIAL-REVIEW.md) | Pre-fix review — **BLOCK** |
| [DN-TECH-RELAUNCH-ANTI-SLOP-DESIGN.md](./DN-TECH-RELAUNCH-ANTI-SLOP-DESIGN.md) | Copy + visual slop audit |
| [dntech-relaunch-checklist.json](./dntech-relaunch-checklist.json) | Readiness scorer input |

```bash
# Re-score before announce
python3 ../../../../.cursor/skills/launch-strategy/scripts/launch_readiness_scorer.py \
  --checklist docs/launch/dntech-relaunch-checklist.json
```

**Current readiness:** 30/100 — 7 blockers. Do not announce until cleared.
