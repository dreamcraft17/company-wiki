# PRD V3 — dnPeople ERP Enterprise Edition
## Production-Ready, Enterprise-Grade, Indonesian Market

**Document ID:** Doc 26-PRD-V3  
**Version:** 3.0  
**Date:** 7 July 2026  
**Owner:** PT. Dozer Napitupulu Technology (dntech.id)  
**Target Market:** Indonesia SMEs → Enterprise (Tier-1/2)  
**Baseline:** Doc 25 (PRD Baseline Current State)

> **Visi V3:** Dari MVP code-complete → **Production-Ready Enterprise Platform** dengan compliance level SAP/Odoo untuk Indonesia, competitive positioning vs Mekari Premium, target **100+ mid-market customers dalam 18 bulan**.

---

## 1. Executive Summary

### 1.1 Product Vision V3

**dnPeople v3.0** adalah SaaS ERP enterprise-grade untuk SMEs–mid-market Indonesia:

| Dimensi | Target |
|---------|--------|
| **Status code** | 95%+ implemented (Doc 25) → 100% production hardened |
| **Go-live** | Q3 2026 (8 minggu dari approval) |
| **Enterprise tiers** | Startup, Professional, Enterprise |
| **Market position** | Pesaing langsung Mekari Premium, Odoo Indonesia |
| **Compliance** | SOC 2 Type II, ISO 27001, e-Faktur, PPh 21, UU PDP |
| **Revenue model** | SaaS subscription + partner revenue (integrations) |
| **Projected ARR Y1** | $2.4M (200 customers × $1K–$2K/bulan) |

---

## 2. Strategic Objectives (18 bulan)

### 2.1 Phase 5: Go-Live & SRE (Q3 2026 — 8 minggu)
**Tema: Production Hardening + Compliance**

**Goals:**
- ✅ Live on AWS (EKS + RDS + multi-AZ)
- ✅ SOC 2 Type II initial audit (process docs + logging)
- ✅ Indonesia e-Faktur live integration (Kementerian Keuangan)
- ✅ PPh 21 + PPN automation fully compliant
- ✅ UU PDP data governance (consent, erasure, export)
- ✅ 99.9% uptime SLA + RTO/RPO documented
- ✅ Mobile iOS/Android (Expo → EAS build production)

**Deliverables:**
1. Terraform stacks live (AWS VPC, EKS, RDS Multi-AZ, ElastiCache, S3)
2. Production monitoring stack (Prometheus, Grafana, ELK, Sentry)
3. Compliance docs (SOC 2 system document, privacy policy, DPA)
4. Runbooks (failover, backup restore, scaling, incident response)
5. Mobile app (both platforms signed, submitted to App Store/Play Store)

---

### 2.2 Phase 6: Advanced Analytics & AI (Q4 2026 — 12 minggu)
**Tema: Differentiation vs Competitors**

**Goals:**
- ✅ ML-powered forecasting (sales, cash flow, churn)
- ✅ Anomaly detection (fraud, inventory, AR aging)
- ✅ What-if scenario planning (pricing, budget)
- ✅ Advanced BI (self-service dashboards, ad-hoc queries)
- ✅ AI copilot (natural language → SQL, chart generation)
- ✅ Predictive inventory (stock optimization, supplier recommendations)

**Tech stack:**
- Python FastAPI microservice (ML models)
- PostgreSQL + TimescaleDB (time-series)
- ClickHouse (OLAP warehouse — optional first year)
- Hugging Face models (NLP copilot)

---

### 2.3 Phase 7: Enterprise Tier-2 Features (Q1 2027 — 12 minggu)
**Tema: Premium Feature Bundling**

**Goals:**
- ✅ Document Management 2.0 (OCR, e-Archive, retention policies)
- ✅ Learning Management (LMS for HR onboarding/compliance)
- ✅ Advanced Workflow Designer (BPMN 2.0 drag-drop)
- ✅ Consolidation Engine (multi-entity financial reporting)
- ✅ Enterprise SSO (Azure AD, SAML 2.0, Okta)
- ✅ Advanced Audit Trail (tamper-proof logs, forensics)

---

### 2.4 Phase 8: Platform & Partner Ecosystem (Q2 2027 — 10 minggu)
**Tema: ISV/Reseller Revenue**

**Goals:**
- ✅ Partner API (OAuth 2.0, partner marketplace)
- ✅ App Store (vetted integrations, revenue share model)
- ✅ White-label deployment (SaaS for partners)
- ✅ Reseller program (MOU templates, margin structure)
- ✅ Indonesia partner network (tax consultants, auditors)

---

## 3. Market & Competition Analysis

### 3.1 Competitive Landscape (Indonesia SME)

| Feature | Mekari | Odoo | SAP | **dnPeople V3** |
|---------|--------|------|-----|-----------------|
| **Local compliance** (e-Faktur, PPh) | ✅ Full | ⚠️ Partial | ✅ Full | ✅ Full |
| **Price entry (startup)** | $500/mo | $600/mo | $2K+/mo | **$299/mo** |
| **Mobile native** | ✅ Good | ⚠️ Web-only | ⚠️ Web | ✅ Excellent |
| **i18n SEA** | ✅ 4 lang | ✅ 20 lang | ✅ Full | ✅ 15 lang |
| **Free trial** | 14 days | 30 days | — | **30 days (full features)** |
| **Support response** | 6 hours | 24 hours | SLA | **2 hours (24/7)** |
| **Reporting** | Standard | Advanced | Enterprise | **Advanced (Phase 6+)** |
| **Industry templates** | ⚠️ 3 | ✅ 10+ | ✅ Full | **5 (Phase 4)** |
| **AI/ML features** | ❌ None | ⚠️ Limited | ✅ Advanced | **Phase 6 (copilot, forecast)** |

**Positioning:** *"Mekari's simplicity + Odoo's power + SAP's compliance + Indonesian-first design"*

### 3.2 Market Entry Strategy

**Segment 1: Early Adopters** (startup/scale-up, 1–50 employees)
- Price: $299–$499/mo
- Focus: Ease of use, mobile, fast deployment
- Channel: Direct sales, freemium trial, YouTube tutorials

**Segment 2: Mid-market** (50–500 employees)
- Price: $1K–$3K/mo
- Focus: Advanced reporting, integrations, compliance
- Channel: Resellers, consultants, industry events

**Segment 3: Enterprise** (500+ employees)
- Price: Custom ($10K+/mo)
- Focus: Consolidation, multi-entity, SSO, SLA
- Channel: Partnership with Big 4 consultants

---

## 4. Feature Roadmap (V3.0 → V3.4)

### 4.1 V3.0: Go-Live Edition (Q3 2026 — 8w)

#### Core ERP (existing, hardening only)
- ✅ Finance (GL, AP/AR, bank reconciliation, PPN, PPh 21, e-Faktur LIVE)
- ✅ Sales (SO, quotation, credit limit, AR automation)
- ✅ Supply Chain (PO, GR, inventory, barcode, MRP)
- ✅ HR (payroll, leave, 360° feedback, ATS)
- ✅ Manufacturing (BOM, MO, capacity planning)
- ✅ Projects (tasks, time tracking, billing, budget)
- ✅ CRM (leads, opportunities, pipeline)
- ✅ Fixed Assets (register, depreciation per PSAK)

#### Production Readiness (NEW)
- ✅ Multi-AZ AWS deployment (EKS + RDS + Auto-scale)
- ✅ 99.9% uptime monitoring + alerting
- ✅ Backup/restore automation (daily, 30-day retention)
- ✅ Disaster recovery runbook (RTO 1h, RPO 5min)
- ✅ Secrets management (AWS Secrets Manager)
- ✅ Production logging (ELK stack, Sentry)
- ✅ API rate limiting + DDoS protection (Cloudflare)
- ✅ Certificate management (Let's Encrypt auto-renewal)

#### Compliance (NEW)
- ✅ SOC 2 Type II (system documentation, control mapping)
- ✅ ISO 27001 ISMS (policies, risk register, access control)
- ✅ UU PDP implementation (consent, retention, erasure, export)
- ✅ Privacy policy + DPA templates
- ✅ Audit trail tamper-proof logging
- ✅ Field-level encryption (PII: NPWP, bank account, email)
- ✅ Role-based encryption key management

#### Mobile GA (NEW)
- ✅ iOS app (App Store, signed certificate)
- ✅ Android app (Play Store, signed APK)
- ✅ Offline mode (SQLite local sync)
- ✅ Biometric login (Face ID, Touch ID, Android Biometric)
- ✅ Push notifications (Firebase Cloud Messaging)
- ✅ 10+ core screens parity (login, dashboard, SO, invoices, timesheets)

---

### 4.2 V3.1: Advanced Analytics & AI (Q4 2026 — 12w)

#### AI Copilot
- 🤖 Natural language → SQL (e.g., "Kasir apa bulan lalu juta?")
- 🤖 Chart generation from voice/text
- 🤖 Email summarization (daily digest from notifications)
- 🤖 Document classification (auto-tag POs, invoices)

#### Predictive Analytics
- 📊 Sales forecast (ARIMA, Prophet, ML ensemble)
- 📊 Cash flow forecast (14–90 day outlook)
- 📊 Customer churn prediction (early warning)
- 📊 Inventory optimization (stock level recommendations)
- 📊 AR aging risk (auto-dunning triggers)

#### Advanced BI
- 📈 Self-service dashboards (drag-drop widgets)
- 📈 Ad-hoc query builder (visual SQL, no coding)
- 📈 What-if scenario planning (budget vs actual)
- 📈 Cohort analysis (customer lifetime value)
- 📈 Drill-through capability (GL → transaction detail)

#### Data Warehouse (optional Phase 6.5)
- 🏢 ClickHouse optional add-on (separate pricing)
- 🏢 Pre-built industry cubes (Retail, Manufacturing)
- 🏢 ETL pipeline (nightly sync, incremental)

---

### 4.3 V3.2: Enterprise Tier-2 (Q1 2027 — 12w)

#### Document Management 2.0
- 📄 OCR (invoice → auto-populate GL account, amount)
- 📄 e-Archive integration (24/7 compliance retention)
- 📄 Document workflow (approval chain, e-signature)
- 📄 Full-text search (all documents searchable)
- 📄 Retention policy engine (auto-delete per regulation)

#### Learning Management System (LMS)
- 📚 Course builder (video, quiz, assignments)
- 📚 Compliance training (PSAK, tax, safety)
- 📚 Certification tracking
- 📚 Mobile access to courses
- 📚 Integration with HR module (link to employees)

#### Advanced Workflow Designer
- 🔄 BPMN 2.0 visual designer (drag-drop)
- 🔄 Complex logic (loops, sub-processes, gateways)
- 🔄 Human/system tasks with SLA
- 🔄 Escalation rules (no approval → auto-escalate to CFO)
- 🔄 Real-time monitoring dashboard

#### Consolidation Engine
- 💰 Multi-entity GL consolidation
- 💰 Intercompany transaction matching
- 💰 Forex revaluation
- 💰 Elimination entries
- 💰 Financial statement generation (standalone + consolidated)

#### Enterprise SSO
- 🔐 Azure AD / Entra ID integration
- 🔐 SAML 2.0 (Okta, Keycloak)
- 🔐 LDAP / Active Directory
- 🔐 Just-in-time (JIT) provisioning
- 🔐 Single sign-out (SLO)

#### Advanced Audit Trail
- 🔍 Immutable event log (blockchain-optional)
- 🔍 User action forensics (who changed what, when)
- 🔍 Financial transaction reconstruction
- 🔍 Compliance report generation (SOX-like)

---

### 4.4 V3.3: Platform & Ecosystem (Q2 2027 — 10w)

#### Partner API
- 🤝 OAuth 2.0 authorization
- 🤝 Sandbox environment (partner testing)
- 🤝 API quota + usage monitoring
- 🤝 Webhook replay + retry logic
- 🤝 Documentation + SDK (Node.js, Python, Java)

#### App Marketplace
- 🛒 Partner app submission portal
- 🛒 Revenue share (70/30 model)
- 🛒 App ratings + reviews
- 🛒 Version management + auto-upgrade
- 🛒 Pre-integrated app gallery (100+ apps target Y1)

#### White-Label / Reseller
- 🏷️ Custom domain + branding
- 🏷️ Logo/color customization
- 🏷️ Custom email templates
- 🏷️ Reseller admin dashboard (usage, billing, support)
- 🏷️ Margin structure (cost + X%)

#### Indonesia Partner Network
- 🇮🇩 Tax consultant integrations
- 🇮🇩 Auditor portal (financial data export)
- 🇮🇩 Compliance consultants (SOX, tax planning)
- 🇮🇩 Go-live partner program (certification, training)

---

### 4.5 V3.4: Internationalization & SEA Expansion (Q3 2027 — 8w)

#### Localization
- 🌍 Full translation (all 15 locales)
- 🌍 Regional compliance (Thailand VAT, Malaysia SST, Vietnam ACAS)
- 🌍 Multi-currency + forex revaluation
- 🌍 Localized payment methods (GCash, eWallet, bank transfer per region)
- 🌍 Regional phone/format validation

#### SEA Expansion
- 🚀 Thailand ERP (full Thai UI, VAT, accounting standards)
- 🚀 Malaysia ERP (SST, BIR, Bahasa Malaysia)
- 🚀 Vietnam ERP (ACAS, VND currency, Vietnamese UI)
- 🚀 Regional sales + support team (Singapore hub)

---

## 5. Non-Functional Requirements (Enterprise)

### 5.1 Performance

| Metric | Target | Tool |
|--------|--------|------|
| **API p95 latency** | <500ms | DataDog, NewRelic |
| **UI first paint** | <2s | Lighthouse, WebVitals |
| **Search latency** | <200ms | Elasticsearch monitoring |
| **Dashboard load** | <3s | Frontend perf tracking |
| **Concurrent users** | 1000+ | k6 load test |
| **Transaction throughput** | 1000 TPS | Benchmarked before GA |
| **DB query p99** | <1s | PostgreSQL EXPLAIN |

### 5.2 Availability & Disaster Recovery

| Requirement | Target | Implementation |
|-------------|--------|-----------------|
| **Uptime SLA** | 99.9% (8.76h/year) | Multi-AZ + auto-failover |
| **RTO** | 1 hour | EKS failover + DNS |
| **RPO** | 5 minutes | Continuous replication |
| **Backup retention** | 30 days | S3 versioning |
| **Backup testing** | Monthly DR drill | Automated restoration test |
| **Geo-redundancy** | Optional (Phase 7) | Secondary AWS region |

### 5.3 Security

| Control | Status | Frequency |
|---------|--------|-----------|
| **Penetration testing** | Annual (Q1) | 3rd party firm |
| **Vulnerability scanning** | Continuous | Snyk + npm audit |
| **SIEM** | Wazuh / ELK | Real-time |
| **WAF** | Cloudflare + ModSecurity | Always-on |
| **Encryption in transit** | TLS 1.3 | Enforced |
| **Encryption at rest** | AES-256 | DB + S3 |
| **Key rotation** | Quarterly | AWS KMS |
| **Incident response** | <15min alert | On-call rotation |

### 5.4 Scalability

| Dimension | Current | V3.0 target | V3.2 target |
|-----------|---------|-------------|-------------|
| **Concurrent API users** | 100 | 1000 | 5000 |
| **Tenants** | 10 (test) | 500 | 5000 |
| **Data size** | 100GB | 1TB | 10TB+ |
| **RabbitMQ throughput** | 100/s | 1000/s | 5000/s |
| **Elasticsearch shards** | 1 | 5 | 20 |

### 5.5 Compliance & Data Governance

#### Indonesia-specific
- ✅ **e-Faktur (Kementerian Keuangan)** — live API integration
- ✅ **PPh 21 calculation** — monthly certification
- ✅ **PPN compliance** — monthly SPT
- ✅ **UU PDP (Data Protection)** — consent, retention, erasure
- ✅ **Payroll bank reporting** — e-Filling integration
- ✅ **SKB (tax exemption certificates)** — document storage

#### International
- ✅ **GDPR** — data export, right to erasure
- ✅ **SOC 2 Type II** — annual audit
- ✅ **ISO 27001** — annual certification target
- ✅ **Cloud Security Alliance** — CCM compliance

---

## 6. Revenue Model & Pricing (V3.0)

### 6.1 Tier Pricing

| Tier | Price/month | Users | Modules | Transactions | Support |
|------|-------------|-------|---------|--------------|---------|
| **Startup** | $299 | 5 | Core 8 | 1K/mo | Email (24h) |
| **Professional** | $999 | 20 | All 24 | 10K/mo | Slack (2h) |
| **Enterprise** | Custom | Unlimited | All + AI/BI | Unlimited | Phone (1h) |

### 6.2 Add-ons (optional)

- **Advanced Analytics** (Phase 6): +$299/mo (5-seat limit per Professional)
- **LMS** (Phase 7): +$199/mo (unlimited courses)
- **White-label** (Phase 8): +$2K setup + 20% margin fee
- **API quota override**: +$99/mo (100K → 1M requests)
- **Premium support** (SLA 1h): +$500/mo

### 6.3 Revenue Projections (18 bulan)

| Period | Customers | MRR | ARR | Note |
|--------|-----------|-----|-----|------|
| Q3 2026 (launch) | 50 | $30K | $360K | Early adopters, freemium trial |
| Q4 2026 | 120 | $75K | $900K | Holiday promo, Phase 6 launch |
| Q1 2027 | 200 | $140K | $1.68M | Enterprise tier uptake |
| Q2 2027 | 300 | $200K | $2.4M | Platform launch, partner revenue |

**Target ARR Y1 end:** $2.4M (200 Professional avg) + partner revenue 15% → **$2.76M**

---

## 7. Go-to-Market & Sales Strategy

### 7.1 Channel Strategy

| Channel | Target | Q3–Q4 2026 | Q1–Q2 2027 |
|---------|--------|-----------|-----------|
| **Direct sales** (web demo) | Startup/SME | 40% | 30% |
| **Resellers** (consultants) | Mid-market | 20% | 40% |
| **Partners** (ERP integrators) | Enterprise | 10% | 20% |
| **Freemium trial** (self-serve) | All | 30% | 10% |

### 7.2 Marketing Initiatives (Q3 2026 launch)

1. **Content marketing** (bi-weekly blog posts)
   - "Mekari vs dnPeople: Perbandingan fitur"
   - "Implementasi e-Faktur dalam 48 jam"
   - "Cara migrasi dari Accurate ke dnPeople"

2. **Social proof**
   - Customer case studies (3 tier-1, 3 SME)
   - YouTube demo channel (20 video tutorials)
   - LinkedIn thought leadership (CFO/CIO audience)

3. **Events & sponsorships**
   - Indonesia Digital Summit 2026
   - Accounting & Finance Expo Jakarta
   - Industry conferences (retail, manufacturing)

4. **Partnerships**
   - Tax consulting firms (Deloitte, KPMG, BDO)
   - Accounting software resellers
   - MSP/IT service providers

5. **Demand generation**
   - Free trial (30 days, full features)
   - Webinar series ("Scaling your ERP")
   - Community Slack channel (knowledge sharing)

---

## 8. Organizational & Operational Requirements

### 8.1 Team Structure (by Phase)

#### Phase 5 (Q3 2026) — Go-Live: 25 people
- Product/PMM (2)
- Backend engineers (4, production hardening)
- Frontend engineers (3)
- DevOps/SRE (3, AWS, K8s, monitoring)
- QA (2)
- Solutions architect (1)
- Sales/CS (3)
- Operations (7 support staff)

#### Phase 6 (Q4 2026) — AI/Analytics: +6 people
- ML engineers (2)
- Data engineers (2)
- Analytics engineer (1)
- Customer success manager (1)

#### Phase 7–8 (2027) — Enterprise: +8 people
- Enterprise sales (2)
- Solutions engineer (2)
- Implementation consultant (2)
- Partner manager (1)
- Operations (1 increase)

### 8.2 Support Model

| Tier | Response | Resolution | Availability |
|------|----------|-----------|--------------|
| **Startup** | 24 hours | 72 hours | Business hours |
| **Professional** | 2 hours | 8 hours | 24/7 |
| **Enterprise** | 30 min | 4 hours | 24/7 + phone |

### 8.3 Service Level Agreements (SLAs)

```
99.9% uptime SLA (≤8.76h downtime/year)
- Excludes: scheduled maintenance (4h/month, notified 7 days prior)
- Excludes: customer-caused issues (config, data)
- Credit: 10% monthly fee per 0.1% SLA miss (max 30%)
```

---

## 9. Key Metrics & Success Criteria

### 9.1 Product Metrics (V3.0 go-live)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Deployment success** | 100% | 0 critical bugs in first week |
| **Uptime** | 99.9% | AWS CloudWatch + New Relic |
| **API latency (p95)** | <500ms | DataDog dashboard |
| **Customer onboarding** | <48h | From signup → production data |
| **Feature adoption** | >70% | GA features used by >70% tenants |
| **Mobile app downloads** | 5K+ | App Store + Play Store |

### 9.2 Business Metrics (Y1 end)

| Metric | Target | Owner |
|--------|--------|-------|
| **Customers** | 200+ | Head of Sales |
| **MRR** | $200K | CFO |
| **ARR** | $2.4M+ | CFO |
| **Customer retention** | >95% | VP Customer Success |
| **NPS** | >50 | VP Product |
| **Churn rate** | <5% MoM | VP Product |

### 9.3 Compliance Metrics

| Metric | Target | Auditor |
|--------|--------|---------|
| **SOC 2 Type II** | Initial audit | Big 4 firm |
| **Data breach incidents** | 0 | CISO |
| **Security vulnerabilities (critical)** | 0 unpatched | Security team |
| **PII data leakage** | 0 | Compliance officer |

---

## 10. Risk & Mitigation

### 10.1 Critical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Regulatory change** (PPh, e-Faktur API) | Medium | High | Dedicated compliance team, monthly reg. review |
| **AWS infrastructure outage** | Low | Critical | Multi-AZ + standby in another region (Phase 7) |
| **Customer data breach** | Low | Critical | SOC 2, penetration testing, bug bounty program |
| **Competitor price war** | High | Medium | Feature differentiation (AI, mobile) + bundled pricing |
| **Churn from migration issues** | Medium | High | Free migration service + 60-day transition support |

### 10.2 Contingency Plans

- **Data loss:** Automated 30-day backup + monthly restore test
- **DDoS attack:** Cloudflare + AWS Shield + traffic overflow to CDN
- **Payment processor down:** Fallback payment gateway (2Checkout or Stripe alternative)
- **Key person loss:** Cross-train CTO + VP Eng on all critical systems

---

## 11. Success Factors & Assumptions

### 11.1 Critical Success Factors

1. **On-time go-live** (Q3 2026)
   - AWS infrastructure fully provisioned by week 4
   - Staging environment ready for UAT by week 5
   - Customer migration test completed by week 6

2. **Regulatory compliance** (PPh 21, e-Faktur, UU PDP)
   - Kementerian Keuangan e-Faktur API integration by week 3
   - Privacy policy + DPA signed by customers by week 6
   - SOC 2 documentation complete by week 7

3. **Customer acquisition**
   - 10 early-adopter contracts (pilot pricing 50% off) by go-live
   - Freemium trial → 5% conversion → 2.5K trial users → 125 customers Y1

4. **Team execution**
   - Zero critical security incidents
   - <2% bug escape rate to production
   - Mobile app App Store approval <3 weeks

### 11.2 Market Assumptions

- Indonesia ERP market growing 20% YoY (per Gartner)
- SMEs willing to migrate from legacy (Accurate, Zahir) for 30%+ cost savings
- Mekari + Odoo capture 60% market; fragmented rest for niche players
- dnPeople can achieve 2–3% market share (200–300 customers) in 2 years

### 11.3 Technology Assumptions

- AWS SLA maintained (99.99% for managed services)
- PostgreSQL 15 stable for 1TB+ data (no major version upgrade needed in Y1)
- Elasticsearch can handle 100M documents/year without sharding overhaul
- Open-source ML libraries (Scikit-learn, Prophet) sufficient for Phase 6

---

## 12. Appendices

### 12.1 Glossary

| Term | Definition |
|------|-----------|
| **SAK-EP** | Standar Akuntansi Keuangan Entitas Makro (Indonesian GAAP) |
| **e-Faktur** | Electronic invoice system by Indonesia Ministry of Finance |
| **PPh 21** | Income tax on employee salaries (Indonesia) |
| **UU PDP** | Undang-undang Perlindungan Data Pribadi (Indonesia Data Protection Law) |
| **RTO** | Recovery Time Objective (max time to restore service) |
| **RPO** | Recovery Point Objective (max acceptable data loss) |
| **BPMN** | Business Process Model and Notation |
| **OAuth 2.0** | Authorization framework for 3rd-party app access |
| **SAML 2.0** | Security Assertion Markup Language (enterprise SSO) |
| **SOC 2** | Service Organization Control framework (audited security) |
| **ISO 27001** | Information Security Management System standard |

### 12.2 Related Documents

- Doc 25: PRD Baseline Current State (Phase 0–4)
- Doc 03: System Design Document (architecture)
- Doc 15: Deployment & Operations Runbook
- Doc 24: SOC 2 / Compliance Framework
- `update/GAPS-VS-MEKARI-SAP-ROADMAP.md`: Competitive analysis

### 12.3 Approval Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **VP Product** | — | — | — |
| **VP Engineering** | — | — | — |
| **Head of Sales** | — | — | — |
| **CEO** | — | — | — |

---

**Document version control:**
- V1.0 (Jan 2025): Initial 4-phase roadmap (Phase 0–3)
- V2.0 (May 2026): Phase 4 industry templates + i18n
- **V3.0 (Jul 2026)**: Enterprise edition, go-live + Phase 5–8 roadmap

*Maintainer: Update quarterly or at each major release. Owned by dntech.id.*
