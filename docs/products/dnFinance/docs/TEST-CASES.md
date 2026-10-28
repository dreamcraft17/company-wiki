# dnFinance — Test Cases (MVP)

**Automated:** `npm run test` · `apps/backend` smoke  
**Register flow:** creates tenant + COA template automatically

## Auth & tenancy
| ID | Scenario | Expected |
|----|----------|----------|
| AUTH-01 | Register retail company | 201 + JWT + COA imported |
| AUTH-02 | Login / refresh / logout | Token rotation works |
| AUTH-03 | Cross-tenant isolation | User A cannot read tenant B (in-memory) |

## Core accounting
| ID | Scenario | Expected |
|----|----------|----------|
| COA-01 | Apply industry template | Accounts created, no duplicate codes |
| JE-01 | Balanced journal post | TB debit = credit |
| JE-02 | Unbalanced journal | 400 rejected |

## AR / AP
| ID | Scenario | Expected |
|----|----------|----------|
| AR-01 | Invoice PKP customer | PPN 11% + GL on send |
| AR-02 | Record payment | AR cleared, cash debited |
| AP-01 | Bill + PPh 23 | Withholding calculated |
| AP-02 | Approval workflow | GL posts after approve |

## Inventory & reports
| ID | Scenario | Expected |
|----|----------|----------|
| INV-01 | Stock in | Qty + valuation updated |
| RPT-01 | Trial balance / P&L / tax summary | Returns numeric totals |

Run: `npm run test` (15+ unit tests)
