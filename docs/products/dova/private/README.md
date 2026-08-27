# DOVA — Private documents (Dozer)

> **Author:** Dozer
> **Date:** 2026-08-27
> **Access:** DN Tech / Dozer — **do not** copy into `dova-company-wiki` (that repo is shared with the DOVA team)

Dokumen di sini bersifat **pribadi / negosiasi** (equity, counter-proposal, budget internal).

Folder ini **tidak ikut di-sync** dari `dova-company-wiki/` (`rsync --exclude private`). Wiki tim DOVA tetap bersih.

## Isi

| File | Isi |
|------|-----|
| [DOVA-COUNTER-PROPOSAL-CTO-EQUITY.md](./DOVA-COUNTER-PROPOSAL-CTO-EQUITY.md) | Counter-proposal CTO & Founding Engineer (EN) |
| [DOVA-COUNTER-PROPOSAL-CTO-EQUITY-ID.md](./DOVA-COUNTER-PROPOSAL-CTO-EQUITY-ID.md) | Versi Bahasa Indonesia |
| [DOVA-Counter-Proposal-CTO-Equity.pdf](./DOVA-Counter-Proposal-CTO-Equity.pdf) | PDF EN |
| [DOVA-Counter-Proposal-CTO-Equity-ID.pdf](./DOVA-Counter-Proposal-CTO-Equity-ID.pdf) | PDF ID |
| [DOVA-Counter-Proposal.pdf](./DOVA-Counter-Proposal.pdf) | PDF draft sebelumnya |
| [DOVA-BACKEND-DEVELOPER-EQUITY-PROPOSAL-ID.md](./DOVA-BACKEND-DEVELOPER-EQUITY-PROPOSAL-ID.md) | Terjemahan proposal equity dari founder |
| [DOVA - Backend Developer Equity Partnership Proposal (2).pdf](./DOVA%20-%20Backend%20Developer%20Equity%20Partnership%20Proposal%20(2).pdf) | PDF proposal founder (asli) |
| [DOVA - Backend Developer Equity Partnership Proposal (ID).pdf](./DOVA%20-%20Backend%20Developer%20Equity%20Partnership%20Proposal%20(ID).pdf) | PDF terjemahan |
| [DOVA-LAUNCH-BUDGET.md](./DOVA-LAUNCH-BUDGET.md) | Launch budget (BD / ops) |
| [DOVA-LAUNCH-BUDGET-CEO.md](./DOVA-LAUNCH-BUDGET-CEO.md) | Launch budget ringkas CEO |
| [DOVA-Launch-Budget-CEO-Friendly.pdf](./DOVA-Launch-Budget-CEO-Friendly.pdf) | PDF CEO |

## Regenerasi PDF

Dari root workspace `dozer/`:

```bash
PYTHONPATH=.tmp-pdf-lib python3 .cursor/skills/md-to-pdf/scripts/formal_pdf.py \
  company-wiki/docs/products/dova/private/DOVA-COUNTER-PROPOSAL-CTO-EQUITY.md \
  company-wiki/docs/products/dova/private/DOVA-Counter-Proposal-CTO-Equity.pdf \
  --footer "DOVA Partnership Framework (Discussion Draft)"
```
