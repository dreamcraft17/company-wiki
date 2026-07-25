# DOVA — Progress Update for the BD Team

**From:** Dozer (Tech)
**Date:** 25 July 2026
**For:** BD, Sales, Ops — anyone non-technical. Feel free to forward.

---

Hi team,

Quick update on where DOVA stands, in plain language.

## The short version

The product is **built**. Everything we agreed for the MVP — customers shopping and paying, suppliers managing their products, admins approving suppliers — is working. I can demo the whole thing today, on a laptop or a phone.

What we're **not** yet: publicly live. There's no link you can send to a customer, and no real money moves through the system yet. That's the gap we close next, and closing it needs help from the business side, not more coding.

## Where we are on the plan

Our 4-week plan runs 21 July – 17 August. The build work planned for all four weeks is already done — we finished ahead of the calendar. So we're not behind; we've actually shifted early into the last stage: **getting ready for soft launch**.

That last stage has three steps:

1. Put the app on a proper shared URL (staging) so everyone can try it themselves.
2. Run real *test* payments through Paystack — no actual money, just proving the payment rails work. We want at least 10 successful ones.
3. Then we all look at it and decide together: go or no-go for soft launch.

## What you can show people today

If you're demoing to anyone, the full story works:

- A customer signs up, browses ~20 sample products, fills a cart, checks out (pickup or delivery), "pays", and sees their order.
- A supplier registers with their documents, waits for approval, then adds products with photos and fulfills orders.
- An admin approves that supplier and keeps an eye on everything, including messages from the Contact page.

Minimum basket is **₦3,000 for pickup** and **₦5,000 for delivery** — the app tells buyers how much more to add if they're under.

Demo logins if you want to poke around (internal build only):

- Admin: `admin@dova.local` / `admin1234`
- Supplier: `supplier@dova.local` / `supplier1234`
- Customer: just register on the sign-up page

## What NOT to promise anyone yet

- A public website link — doesn't exist yet.
- Real payments — Paystack is wired in but unproven; demos run in simulation mode.
- Password reset, email verification, product reviews, wishlists, discounts, courier tracking — all deliberately left out of the MVP. They're roadmap, not "coming this week".

If someone asks, a safe line is: *"The product is ready and being validated on a private environment. Public launch follows once payment testing is signed off."*

## What I need from you

This is the part that actually decides when we launch:

1. **Someone to own staging** — who gets the URL first, who invites testers.
2. **A Paystack account** (test mode, currency NGN) — I need the test keys to run the payment proof. This is probably a Finance/BD ask.
3. **A few pilot suppliers** — real ones with their documents (CAC / ID) ready, so we can test onboarding for real.
4. **Content check** — is the About page, Contact info, and support channel what we want to show?
5. **A go/no-go date** — once staging is up and payments are proven, leadership picks the soft-launch date.

Until 1 and 2 are moving, I can't flip anything live — the tech side is done and waiting.

## Bottom line

We're ahead on the build. Demo freely (internally), don't share a link publicly yet, and help me get staging + Paystack sorted — that's all that stands between us and soft launch, well within the 17 August window.

Questions or want a walkthrough? Ping me anytime — happy to do a 15-minute demo call.

— Dozer

---

*Copy-paste version for Slack:*

> **DOVA update (25 Jul):** The MVP is fully built — customer shopping, supplier tools, admin panel all work, demo-able today on desktop & phone. Not publicly live yet: we still need a staging URL, Paystack test payments (≥10), and a go/no-go decision. We're ahead of the 4-week plan (ends 17 Aug). Needed from BD/ops: staging owner, Paystack test keys (NGN), pilot suppliers, launch date.
