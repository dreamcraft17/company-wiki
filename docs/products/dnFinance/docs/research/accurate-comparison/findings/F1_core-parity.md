# F1 — dnFinance already covers the accounting core

Confidence: high for code-level capability; medium for production readiness.

The repository shows double-entry journals, GL, AR/AP, invoice and bill flows, Indonesian tax helpers, inventory movements, approvals, tenant isolation, RBAC, and core reports. This is enough to position dnFinance as an accounting MVP rather than a spreadsheet wrapper.

The important qualification is operational readiness: the current baseline still marks PostgreSQL, Redis/Bull, Gmail, and staging deployment as conditional. Therefore “feature exists” and “customer can depend on it in production” must remain separate product states.

Evidence: [Source 01](../sources/01_dnfinance-baseline.md).
