# dnPeople — GTM Engineering Status (100% scope)

> **Author:** Dozer  
> **Date:** 2026-10-02

Scope = **yang bisa dibangun di repo** per [GTM-IMPLEMENTATION-90-DAYS.md](./GTM-IMPLEMENTATION-90-DAYS.md). Founder motion (50 akun, interview, LinkedIn, pilot paid) **bukan** engineering.

## Done

| Area | Deliverable |
|------|-------------|
| North star | `GET /admin/analytics/north-star` · UI `/admin/analytics/north-star` · CSV `?format=csv` |
| Leads | `GET /admin/marketing/leads` · UI `/admin/marketing/leads` |
| Payroll preview audit | `POST /payroll/run` → audit `PREVIEW` |
| Approvals in metric | Koreksi absensi (audit) + cuti/izin (`approvedAt`) |
| WhatsApp motion | `WhatsAppAuditLink` + GA events · nav/hero/sticky/pricing/faq/demo/docs/about/contact/pillar/footer |
| Lead magnet | `/resources/payroll-evidence-checklist` · download `public/downloads/*.md` |
| Early release | Feedback form `/billing` · due banner (~14d) · email template doc |
| Onboarding | Signup checkbox retail pilot → redirect `/industry-templates?gtm=pilot` · dashboard banner |
| Industry template | `retail-fnb-multi-outlet` **beta** · demo seed apply |
| Trust | GTM block on `/people-evidence` pillar |
| Tests | `northStarAnalytics` · `contact-links` · **222+** backend suite |

## Out of scope (by design)

- Talenta comparison page (after pilot)
- Google Ads
- Cron email 2x/bulan (founder sends template; in-app due nudge only)
- Native app · PRD v16+ modules

## Verify locally

```bash
cd dnpeople/backend && npm test
```
