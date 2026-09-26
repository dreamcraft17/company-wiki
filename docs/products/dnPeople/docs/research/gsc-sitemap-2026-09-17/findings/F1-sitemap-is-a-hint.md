# F1 — Sitemap submission is a discovery/canonical hint, not an indexing guarantee

## Finding

The GSC Sitemaps report confirms whether Google could fetch and process the sitemap. It does not guarantee that every listed URL will be crawled or indexed. The operating procedure must therefore connect sitemap monitoring with URL Inspection and Page indexing.

## Evidence

- Google says submission tells Google where the file is; crawling the listed URLs can take time and not all URLs are necessarily crawled. [02](../sources/02-sitemaps-report.md)
- Google describes sitemap inclusion as a canonical signal, while redirects and `rel="canonical"` are stronger signals. [06](../sources/06-consolidate-duplicate-urls.md)
- The Page indexing report lets teams filter submitted pages separately from all known pages. [04](../sources/04-page-indexing.md)

## Implication for dnPeople

Report two outcomes separately: `sitemap processed` and `priority URLs indexed`. A `Success` status with low indexing still requires URL-level diagnosis; it is not evidence that the sitemap implementation failed.
