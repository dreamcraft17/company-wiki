# F2 — Sitemap quality depends on canonical, indexable URLs

## Finding

The sitemap should contain absolute URLs for the public canonical pages the business wants in search. It should not be treated as a dump of all application routes.

## Evidence

- Google recommends absolute, fully qualified URLs and recommends hosting the sitemap at the site root. [01](../sources/01-build-submit-sitemap.md)
- Google recommends including URLs that should appear in search and using sitemap URLs as preferred canonical candidates. [01](../sources/01-build-submit-sitemap.md)
- The local dnPeople generator lists marketing, docs, legal, and signup routes, while robots blocks application routes. [local source](../../frontend/src/app/sitemap.ts)

## Implication for dnPeople

The release gate must validate every generated URL for HTTP status, canonical, robots/noindex, uniqueness, and production host before submission.
