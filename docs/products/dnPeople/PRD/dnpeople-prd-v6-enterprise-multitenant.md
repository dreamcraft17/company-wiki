# dnPeople — PRD v6
## Multi-Tenant Enterprise Architecture & Advanced Tenant Management

**Version:** 6.0 (Enterprise-grade multi-tenancy)  
**Owner:** Dozer (CEO + Tech Lead)  
**Date:** July 16, 2026  
**Status:** Enterprise specification (incorporates Mekari, Odoo, Zoho best practices)  
**Audience:** Product, Engineering, Architects, Enterprise Sales

---

## Executive Summary

PRD v5 introduced subscription tiers. **PRD v6 adds enterprise-grade multi-tenant architecture** learned from industry leaders:

- **Mekari Talenta** uses multi-availability zone architecture with VPC isolation, AES-256 encryption, SAML 2.0 + OIDC SSO support, and SCIM 2.0 provisioning
- **Odoo** offers 3 isolation models: shared database with row-level rules, isolated databases, or per-tenant containers
- **Zoho People** provides organization structure for multiple entities within one account with cross-entity reporting capability

**PRD v6 implements:**
1. **3-Tier Tenant Isolation Model** (Silo / Pool / Bridge)
2. **Per-Tenant SSO Routing** (SAML, OIDC, Google, Microsoft)
3. **Organization Structure** (multi-company with cross-reporting)
4. **Row-Level RBAC** (scope-based access control)
5. **SCIM 2.0 Provisioning** (enterprise integration)
6. **Tenant Resource Limits** (CPU, memory, queries)
7. **Tenant-Level Monitoring** (usage, performance, isolation breach detection)
8. **White-Label Tenant Branding** (custom domain, logo, colors)

---

## Part 1: Tenant Isolation Model

### Background: Why This Matters

In multi-tenant systems, authentication and SSO are critical because identity misrouting, shared tokens, or reused configurations can lead to cross-tenant access and security breaches.

Tenant isolation is separate from general security mechanisms. A user can be authenticated and authorized but still access another tenant's resources if isolation is not properly enforced.

---

### Three Tenant Isolation Models

The three tenant isolation models are Silo (one identity store per tenant), Pool (all tenants share a store with a tenant_id discriminator), and Bridge (a hybrid that silos sensitive tenants while pooling the rest).

---

### Model 1: POOL (Shared Database - for Starter/Professional tiers)

**Architecture:**
```
Single PostgreSQL Database
  ↓
All companies' data in same tables
  ↓
Discriminator column: companyId (Company ID like 46a3bcb5...)
  ↓
Row-level access enforced at application layer
```

**Data Structure:**
```sql
-- Single table, all companies
employees
├── id
├── companyId  -- ← Discriminator (46a3bcb5..., xyz9876..., etc)
├── name
├── salary
└── ... (other fields)

-- Query MUST include companyId filter
SELECT * FROM employees 
WHERE companyId = '46a3bcb5...' AND userId = req.user.id
```

**Pros:**
- ✅ Cost-efficient (shared infrastructure)
- ✅ Easy multi-company support in same account
- ✅ Simple data export/migration
- ✅ Centralized updates

**Cons:**
- ❌ Data isolation relies on application logic (not DB-level)
- ❌ All companies share same Odoo version / modules
- ❌ One bug can leak data across companies
- ❌ Query performance degrades as data grows

**Best For:**
- Starter tier (1-50 employees, budget-conscious)
- Professional tier (50-300 employees, related entities)
- SMEs with multiple branches under same legal entity

---

### Model 2: SILO (Isolated Database - for Business/Enterprise tiers)

**Architecture:**
```
Multiple PostgreSQL Databases (one per tenant)
  ↓
Company A Database (46a3bcb5...)
Company B Database (xyz9876...)
Company C Database (abc1234...)
  ↓
Each tenant completely isolated at DB level
  ↓
Routing: API Gateway → Router (by companyId) → Tenant DB
```

**Data Structure:**
```
company-46a3bcb5-db (Separate PostgreSQL instance)
  ├── employees (Company A employees only)
  ├── payroll (Company A payroll only)
  └── ... (all tables)

company-xyz9876-db (Separate PostgreSQL instance)
  ├── employees (Company B employees only)
  ├── payroll (Company B payroll only)
  └── ... (all tables)

// Connection routing
const dbUrl = await getCompanyDatabaseUrl(companyId);
const connection = await pg.connect(dbUrl);
```

**Pros:**
- ✅ **True isolation** (DB-level enforcement, not just app logic)
- ✅ Each tenant can have different Odoo version / modules
- ✅ Performance isolated (one tenant's queries don't affect others)
- ✅ Easy compliance (separate DB = separate backups, audits)
- ✅ Individual scaling per tenant

**Cons:**
- ❌ Higher cost (multiple DB instances)
- ❌ Complex deployment (manage N databases)
- ❌ Backup/restore more complex
- ❌ Cross-tenant reporting harder

**Best For:**
- Business tier (300+ employees, need multi-branch/API)
- Enterprise tier (500+, strict compliance, custom modules)
- Customers with different regulatory requirements

---

### Model 3: BRIDGE (Hybrid - for mixed scenarios)

**Architecture:**
```
Pool (shared DB) for most tenants
  ↓
SILO (isolated DB) for large/sensitive tenants
  ↓
Router logic: 
  if (tenant.requires_isolation) → Connect to tenant-specific DB
  else → Connect to shared pool DB
```

**Decision Tree:**
```
New customer signs up
  ↓
  Size < 50 employees?  → POOL (Starter)
  Size < 300 employees? → POOL (Professional)
  Size >= 300 employees → SILO (Business)
  Has compliance needs?  → SILO (Enterprise)
  
Later upgrade path:
  Starter (POOL) → Professional (POOL) → Business (SILO)
```

**Pros:**
- ✅ Cost-efficient for small/mid customers
- ✅ Enterprise-grade for large customers
- ✅ Flexible scaling (move tenant between models)
- ✅ Gradual isolation as customer grows

**Cons:**
- ❌ Most complex to implement
- ❌ Different feature sets per isolation model
- ❌ Debugging is harder (is it app logic or DB issue?)

**Best For:**
- Global SaaS (mix of small startups + enterprises)
- Flexible pricing (charge more for isolation)

---

## Part 2: Per-Tenant SSO & Authentication

### Problem: Identity Misrouting

If a tenant requires SSO, the login flow must route the user into the correct IdP. If you don't do this, users will keep attempting "normal login" on SSO-only tenants and think your app is broken.

---

### Solution: Tenant Discovery + Per-Tenant IdP

**Step 1: Tenant Discovery** (before authentication)

```typescript
// User enters email: user@company-a.com
// Query: which company does this email belong to?

const domain = extractDomain('user@company-a.com');  // "company-a.com"

const company = await db.company.findFirst({
  where: { 
    OR: [
      { verifiedDomain: domain },           // company-a.com registered
      { email: { contains: `@${domain}` } } // Historical emails
    ]
  }
});

if (!company) {
  // Unrecognized domain → Show tenant picker
  return showTenantPicker();
}

return company.id;  // ← Route to this company's SSO config
```

**Step 2: Route to Company's SSO** (SAML / OIDC / OAuth)

```typescript
// Company A has SAML configured to their Okta tenant
// Company B has Google Workspace OIDC
// Company C has Microsoft Azure AD

const company = await getCompany(companyId);

if (company.ssoEnabled) {
  const idpConfig = company.idpConfig; // { type: 'SAML' | 'OIDC' | 'OAUTH', ... }
  
  if (idpConfig.type === 'SAML') {
    // Redirect to company's Okta
    return redirect(`https://${idpConfig.samlIdpUrl}/app/...`);
  } else if (idpConfig.type === 'OIDC') {
    // Redirect to company's Azure AD
    return redirect(`https://${idpConfig.oidcAuthUrl}?...&tenant=${company.id}`);
  }
} else {
  // No SSO configured → Show email/password login
  return showEmailPasswordLogin();
}
```

**Step 3: Validate & Provision User** (JIT)

Per-tenant authentication means each tenant can bring its own IdP: one customer logs in with Okta SAML 2.0, the next with Microsoft Entra ID OIDC, a third with Google Workspace, all against the same app.

```typescript
// After IdP succeeds, validate audience/tenant
const idpResponse = req.body.SAMLResponse; // or OIDC token

// Validate: user belongs to THIS company, not another
if (idpResponse.audience !== company.id) {
  return 403; // Token for wrong company
}

// JIT: If user doesn't exist in dnPeople, auto-create
let user = await db.user.findFirst({
  where: { email: idpResponse.email, companyId }
});

if (!user) {
  // Auto-provision based on IdP attributes
  user = await db.user.create({
    data: {
      email: idpResponse.email,
      companyId,
      firstName: idpResponse.givenName,
      lastName: idpResponse.familyName,
      role: idpResponse.roles?.includes('admin') ? 'COMPANY_ADMIN' : 'EMPLOYEE',
    }
  });
}

// Create session
const token = jwt.sign({
  userId: user.id,
  companyId: user.companyId,
  role: user.role
}, SECRET);

return token;
```

---

### Implementation: IdentityService

```typescript
export class IdentityService {
  
  /**
   * Step 1: Discover tenant from email/domain/subdomain
   */
  async discoverTenant(email: string): Promise<string | null> {
    const domain = email.split('@')[1];
    
    const company = await prisma.company.findFirst({
      where: {
        verifiedDomains: { has: domain }
      },
      select: { id: true }
    });
    
    return company?.id ?? null;
  }
  
  /**
   * Step 2: Get IdP config for tenant
   */
  async getIdpConfig(companyId: string) {
    return prisma.ssoConfig.findUnique({
      where: { companyId },
      select: {
        type: true,          // SAML | OIDC | OAUTH
        samlIdpUrl: true,
        oidcAuthUrl: true,
        oidcClientId: true,
        oidcClientSecret: true,
        audience: true,      // company-specific audience claim
      }
    });
  }
  
  /**
   * Step 3: Validate IdP response against tenant
   */
  async validateIdpResponse(companyId: string, idpToken: any) {
    const config = await this.getIdpConfig(companyId);
    
    // Validate audience matches company
    if (idpToken.audience !== companyId) {
      throw new Error('Token audience does not match company');
    }
    
    // Validate token signature
    // (SDK-specific: passport-saml, openid-client, etc)
    
    return {
      email: idpToken.email,
      firstName: idpToken.given_name,
      lastName: idpToken.family_name,
      groups: idpToken.groups // User's groups in IdP
    };
  }
  
  /**
   * Step 4: JIT user provisioning
   */
  async jitProvisionUser(companyId: string, idpUser: any) {
    let user = await prisma.user.findFirst({
      where: {
        email: idpUser.email,
        companyId
      }
    });
    
    if (!user) {
      // Determine role from IdP groups
      const role = idpUser.groups?.includes('hr_admins') 
        ? 'HR' 
        : 'EMPLOYEE';
      
      user = await prisma.user.create({
        data: {
          email: idpUser.email,
          companyId,
          firstName: idpUser.firstName,
          lastName: idpUser.lastName,
          role,
          ssoEnabled: true,
          idpUserId: idpUser.id // Reference in IdP
        }
      });
    }
    
    return user;
  }
  
  /**
   * SCIM 2.0 provisioning (for enterprise)
   * IdP pushes users/groups to dnPeople
   */
  async scimProvisionUsers(companyId: string, scimPayload: any) {
    // Each tenant gets scoped SCIM token
    // Tenant can only provision to their own organization
    
    for (const user of scimPayload.Resources) {
      await this.jitProvisionUser(companyId, user);
    }
  }
}
```

---

## Part 3: Organization Structure & Cross-Company Reporting

### Feature: Multi-Company Within One Account

Zoho People's Organization Structure feature enables you to configure and manage multiple companies or legal entities within a single Zoho People organization account, with employees in one organization unable to view or interact with employees from another organization, though cross-entity reporting is supported.

**Use Case:**
```
Conglomerate Corp (one Zoho account)
  ├─ Company A (Manufacturing division)
  │   ├─ CEO (reports to: Group Head)
  │   └─ 100 employees
  │
  ├─ Company B (Retail division)
  │   ├─ Group Head (reports to: none)
  │   └─ 50 employees
  │
  └─ Company C (Tech division)
      ├─ CTO (reports to: none)
      └─ 200 employees

Cross-company reporting:
  Division CEOs report to Group Head (cross-org)
  Visibility: Each org only sees own employees + their direct reports
```

**Schema:**
```prisma
model Organization {
  id                  String    @id @default(cuid())
  companyId           String
  company             Company   @relation(fields: [companyId], references: [id])
  
  name                String    // "Manufacturing Division"
  code                String    // "MFG"
  parentOrgId         String?   // Parent org (for hierarchy)
  
  // Visibility & policy
  employeesCanViewOtherOrgs Boolean @default(false)
  allowCrossOrgReporting    Boolean @default(true)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  employees           Employee[]
  
  @@unique([companyId, code])
  @@index([parentOrgId])
}

model Employee {
  id                  String    @id @default(cuid())
  organizationId      String    // Which org within the company
  organization        Organization @relation(fields: [organizationId], references: [id])
  
  name                String
  email               String
  managerId           String?   // Can be null if CEO
  manager             Employee?  @relation("ManagerOf", fields: [managerId], references: [id])
  directReports       Employee[] @relation("ManagerOf")
  
  // Cross-org reporting
  crossOrgManagerId   String?   // Manager in different org
  
  @@unique([organizationId, email])
  @@index([organizationId])
  @@index([managerId])
}
```

**Visibility Rules:**
```typescript
async function getVisibleEmployees(userId: string, companyId: string) {
  const user = await prisma.employee.findFirst({
    where: { userId, organizationId: { company: { id: companyId } } }
  });
  
  // Rule 1: Always see own org
  const ownOrg = await prisma.employee.findMany({
    where: { organizationId: user.organizationId }
  });
  
  // Rule 2: See direct reports (even cross-org)
  const directReports = await prisma.employee.findMany({
    where: { managerId: user.id }
  });
  
  // Rule 3: See cross-org only if permission
  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId }
  });
  
  let otherOrgs = [];
  if (org.employeesCanViewOtherOrgs && user.role === 'HR') {
    otherOrgs = await prisma.employee.findMany({
      where: { organizationId: { NOT: user.organizationId } }
    });
  }
  
  return [...ownOrg, ...directReports, ...otherOrgs];
}
```

---

## Part 4: Row-Level RBAC (Scope-Based Access Control)

### Problem: Simple Role ≠ Real-World Permissions

Traditional RBAC:
```
User has role: "HR"
→ Can see all employees, attendance, leave
```

Real-world requirement:
```
User is HR for Manufacturing division
→ Can see Manufacturing employees only
→ Cannot see Retail or Tech employees
→ Can see department/location reports for Manufacturing
→ Cannot approve leave for other divisions
```

---

### Solution: Scope-Based RBAC

```prisma
model RoleScope {
  id                  String    @id @default(cuid())
  userId              String
  user                User      @relation(fields: [userId], references: [id])
  
  role                String    // "HR", "MANAGER", "FINANCE"
  
  // Scope constraints
  scopeType           String    // "ALL" | "ORGANIZATION" | "DEPARTMENT" | "LOCATION" | "CUSTOM"
  scopeValues         String[]  // ["org_mfg", "org_retail"] or ["dept_001"] or ["loc_jakarta"]
  
  // Custom rules
  customRules         Json?     // { "canApproveLeave": true, "canViewPayroll": false }
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@unique([userId, role, scopeType])
  @@index([userId])
  @@index([scopeType])
}
```

**Example: HR for Manufacturing Only**

```sql
INSERT INTO RoleScope (userId, role, scopeType, scopeValues)
VALUES (
  'user_123',
  'HR',
  'ORGANIZATION',
  ARRAY['org_mfg']  -- Manufacturing org only
);
```

**Query: Get employees visible to this user**

```typescript
async function getVisibleEmployees(userId: string) {
  // Get user's role scopes
  const scopes = await prisma.roleScope.findMany({
    where: { userId }
  });
  
  // Build WHERE clause from scopes
  const whereConditions = [];
  for (const scope of scopes) {
    if (scope.scopeType === 'ORGANIZATION') {
      whereConditions.push({
        organizationId: { in: scope.scopeValues }
      });
    } else if (scope.scopeType === 'DEPARTMENT') {
      whereConditions.push({
        departmentId: { in: scope.scopeValues }
      });
    } else if (scope.scopeType === 'ALL') {
      // No restriction
    }
  }
  
  // Query with OR (user can see if ANY scope matches)
  return prisma.employee.findMany({
    where: {
      OR: whereConditions,
      companyId: user.companyId // Always scoped to company
    }
  });
}
```

---

## Part 5: SCIM 2.0 Provisioning (Enterprise)

### Feature: Automated User Provisioning

SCIM 2.0 provisioning must be scoped per tenant: each tenant gets its own bearer token and its own /Users and /Groups endpoints so a deprovision event from one customer never touches another.

**Endpoints (per tenant):**

```
POST   /scim/v2/{tenantId}/Users
GET    /scim/v2/{tenantId}/Users
GET    /scim/v2/{tenantId}/Users/{userId}
PATCH  /scim/v2/{tenantId}/Users/{userId}
DELETE /scim/v2/{tenantId}/Users/{userId}

POST   /scim/v2/{tenantId}/Groups
GET    /scim/v2/{tenantId}/Groups
PATCH  /scim/v2/{tenantId}/Groups/{groupId}
```

**Authentication:** Tenant-specific bearer token
```
Authorization: Bearer scim_tenant_46a3bcb5_abc123def456
```

**Example: Create User via SCIM**

```http
POST /scim/v2/46a3bcb5-2790-44b6-8df9-8fc1274e37ca/Users
Authorization: Bearer scim_tenant_46a3bcb5_abc123def456
Content-Type: application/scim+json

{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "userName": "john.doe",
  "name": {
    "givenName": "John",
    "familyName": "Doe"
  },
  "emails": [
    {
      "value": "john.doe@company.com",
      "primary": true
    }
  ],
  "active": true,
  "groups": [
    {
      "value": "group_hr_001",
      "display": "HR Team"
    }
  ]
}
```

**Response:**
```json
{
  "id": "user_scim_001",
  "meta": {
    "resourceType": "User",
    "created": "2026-07-16T10:00:00Z",
    "location": "/scim/v2/46a3bcb5.../Users/user_scim_001"
  }
}
```

---

## Part 6: Tenant Resource Limits & Monitoring

### Feature: Prevent One Tenant from Impacting Others

```prisma
model TenantQuota {
  id                  String    @id @default(cuid())
  companyId           String    @unique
  company             Company   @relation(fields: [companyId], references: [id])
  
  // Resource limits
  maxEmployees        Int       @default(100)
  maxAPICallsPerDay   Int       @default(10000)
  maxStorageGB        Int       @default(10)
  maxConcurrentUsers  Int       @default(50)
  
  // Rate limits
  queryTimeoutMs      Int       @default(30000)  // 30 sec per query
  requestsPerMinute   Int       @default(600)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([companyId])
}

model TenantUsage {
  id                  String    @id @default(cuid())
  companyId           String
  company             Company   @relation(fields: [companyId], references: [id])
  
  date                DateTime  @default(now())
  
  // Metrics
  employeeCount       Int
  apiCallsUsed        Int
  storageUsedGB       Decimal
  concurrentUsers     Int
  querySlowest        Int       // Slowest query in ms
  
  @@unique([companyId, date])
  @@index([companyId])
  @@index([date])
}
```

**Monitoring Service:**

```typescript
export class TenantMonitoringService {
  
  /**
   * Check if tenant exceeds quota
   */
  async checkQuotaExceeded(companyId: string): Promise<QuotaStatus> {
    const [quota, usage] = await Promise.all([
      this.getQuota(companyId),
      this.getCurrentUsage(companyId)
    ]);
    
    const status = {
      employeeCount: {
        used: usage.employeeCount,
        limit: quota.maxEmployees,
        exceeded: usage.employeeCount > quota.maxEmployees
      },
      apiCalls: {
        used: usage.apiCallsUsed,
        limit: quota.maxAPICallsPerDay,
        exceeded: usage.apiCallsUsed > quota.maxAPICallsPerDay
      },
      storage: {
        used: usage.storageUsedGB,
        limit: quota.maxStorageGB,
        exceeded: usage.storageUsedGB > quota.maxStorageGB
      }
    };
    
    return status;
  }
  
  /**
   * Enforce query timeout per tenant
   */
  async executeWithTimeout(companyId: string, query: string) {
    const quota = await this.getQuota(companyId);
    
    const timeoutMs = quota.queryTimeoutMs;
    
    try {
      return await Promise.race([
        db.query(query),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
        )
      ]);
    } catch (error) {
      if (error.message === 'Query timeout') {
        // Log and alert
        await this.logQuotaViolation(companyId, 'QUERY_TIMEOUT', query);
        throw new Error(`Query timeout. Limit: ${timeoutMs}ms`);
      }
      throw error;
    }
  }
  
  /**
   * Rate limiting: requests per minute
   */
  async checkRateLimit(companyId: string) {
    const quota = await this.getQuota(companyId);
    const key = `ratelimit:${companyId}`;
    
    const current = await redis.incr(key);
    if (current === 1) {
      // First request this minute
      await redis.expire(key, 60);
    }
    
    if (current > quota.requestsPerMinute) {
      throw new Error(
        `Rate limit exceeded: ${current}/${quota.requestsPerMinute} per minute`
      );
    }
  }
}
```

---

## Part 7: White-Label Tenant Branding

### Feature: Each Tenant Has Custom Domain & Branding

```prisma
model TenantBranding {
  id                  String    @id @default(cuid())
  companyId           String    @unique
  company             Company   @relation(fields: [companyId], references: [id])
  
  // Domain
  customDomain        String?   // e.g., "hr.company-a.com"
  domainVerified      Boolean   @default(false)
  dnsCname            String?   // CNAME record for verification
  
  // Colors
  primaryColor        String    @default("#0066CC")  // Brand color
  secondaryColor      String    @default("#F5F5F5")
  accentColor         String    @default("#FF6B35")
  
  // Logo & images
  logoUrl             String?   // Custom logo
  faviconUrl          String?
  
  // Email
  emailFromName       String    @default("dnPeople")
  emailFromAddress    String?   // support@company-a.com
  
  // Custom content
  footerText          String?
  privacyPolicyUrl    String?
  termsOfServiceUrl   String?
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([companyId])
  @@index([customDomain])
}
```

**Implementation:**

```typescript
// Route handler that returns tenant-specific config
app.get('/api/branding', async (req, res) => {
  const companyId = req.company.id;
  
  const branding = await prisma.tenantBranding.findUnique({
    where: { companyId }
  });
  
  res.json({
    primaryColor: branding?.primaryColor || '#0066CC',
    logo: branding?.logoUrl || '/default-logo.png',
    favicon: branding?.faviconUrl || '/default-favicon.ico'
  });
});

// Custom domain routing
app.use((req, res, next) => {
  const host = req.hostname;  // "hr.company-a.com"
  
  // Lookup: which company owns this domain?
  const company = await prisma.company.findFirst({
    where: {
      branding: { customDomain: host }
    }
  });
  
  if (company) {
    req.company = company;
    return next();
  }
  
  // Fallback: extract companyId from URL
  next();
});
```

**Frontend Implementation:**

```tsx
export function App() {
  const { branding } = useBranding();
  
  return (
    <ThemeProvider theme={{
      colors: {
        primary: branding.primaryColor,
        secondary: branding.secondaryColor,
      }
    }}>
      <img src={branding.logo} alt="Logo" />
      <Outlet />
    </ThemeProvider>
  );
}
```

---

## Part 8: Security & Compliance

### Encryption & Data Protection

All data is encrypted using AES-256 at rest and TLS 1.2+ in transit. Encryption keys are managed via a dedicated Key Management System (KMS).

**Implementation:**
```typescript
// At-rest encryption (field-level)
const encrypted = await crypto.encrypt(salary, masterKey);

// In-transit encryption (TLS 1.3)
// All API endpoints: HTTPS only

// Key rotation
const newKey = generateKey();
const allRecords = await db.salaries.findMany();
for (const record of allRecords) {
  const decrypted = decrypt(record.encryptedValue, oldKey);
  record.encryptedValue = encrypt(decrypted, newKey);
  await record.save();
}
```

### Audit Trail & Compliance

```prisma
model TenantAuditLog {
  id                  String    @id @default(cuid())
  companyId           String
  company             Company   @relation(fields: [companyId], references: [id])
  
  action              String    // "salary_viewed", "employee_created", "login_failed"
  userId              String?
  resourceId          String?
  resourceType        String?   // "Employee", "Payroll", etc
  
  // Isolation audit
  attemptedTenantId   String?   // If cross-tenant access attempted
  blocked             Boolean   @default(false)
  
  ipAddress           String?
  userAgent           String?
  
  createdAt           DateTime  @default(now())
  
  @@index([companyId])
  @@index([action])
  @@index([createdAt])
}
```

---

## Part 9: Migration Path

### v5 → v6 Upgrade Strategy

**Phased Approach:**

| Phase | Timeline | Action |
|-------|----------|--------|
| Phase 1 (Week 1) | Week 1-2 | Deploy v6 code (SSO routing, org structure, RBAC) |
| Phase 2 (Week 2) | Week 3-4 | Existing customers assigned to POOL model |
| Phase 3 (Week 3) | Week 5-6 | Enterprise customers can request SILO model |
| Phase 4 (Week 4) | Week 7-8 | Enable SCIM provisioning for Enterprise tier |
| Phase 5 (Week 5+) | Ongoing | Gradual tenant migration based on usage |

---

## Part 10: Comparison: v5 vs v6

| Feature | v5 | v6 | Benefit |
|---------|----|----|---------|
| Tenant isolation | Simple (app-level) | 3 models (POOL/SILO/BRIDGE) | Enterprise-grade |
| SSO | Basic SAML/OAuth | Per-tenant IdP routing | Each company own IdP |
| Organization structure | None | Multi-company + cross-reporting | Conglomerates |
| RBAC | Role-based | Scope-based (org, dept, location) | Fine-grained control |
| Provisioning | Manual | SCIM 2.0 | Automated enterprise |
| Resource limits | None | Quotas + monitoring | Fair usage |
| White-label | Basic | Full custom domain + branding | Multi-brand |
| Tenant monitoring | None | Usage dashboard + alerts | Operational visibility |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Enterprise deal close rate | >60% (was 30% in v5) |
| SILO tenant adoption | 30% of Business+ customers by Q4 2026 |
| SSO-only adoption | 80% of Enterprise customers |
| Data isolation breach incidents | 0 (track quarterly) |
| Tenant quota violations | <1% per month |

---

## Implementation Timeline

| Phase | Duration | Owner |
|-------|----------|-------|
| Design & architecture review | 1 week | Dozer, Engineering Lead |
| Backend implementation (SSO, RBAC, SCIM) | 4 weeks | Backend Engineer |
| Frontend implementation (org structure, branding) | 2 weeks | Frontend Engineer |
| Testing & security audit | 2 weeks | QA, Security |
| Production deployment | 1 day | DevOps, Dozer |

**Total:** ~10 weeks (same as v5 migration)

---

## Dependencies & External Integrations

- Mekari Talenta reference: Multi-AZ setup, VPC isolation, DDoS protection (via cloud provider)
- Odoo reference: Multi-company rules enforcement (row-level database rules)
- Zoho People reference: Organization structure with cross-entity reporting

---

## Next Steps

1. ✅ Architecture review with Dozer + Engineering Lead
2. ⬜ Select isolation model (recommend BRIDGE for flexibility)
3. ⬜ Design IdP routing flow
4. ⬜ Plan database schema updates (RoleScope, TenantBranding, etc)
5. ⬜ Implement IdentityService
6. ⬜ Test with enterprise customers (pilot)

---

*Last Updated: July 16, 2026 | Owner: Dozer (CEO + Tech Lead)*
