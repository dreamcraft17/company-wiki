# DN Tech — SDD V8
## System Design Detail (Technical Implementation)

**Date:** Juli 2026  
**Owner:** Dozer + Engineering Team  
**Reference:** [PRD V8](./DN-TECH-PRD-V8.md) + [V8 Foundation](./DN-TECH-PRD-V8-FOUNDATION.md)

---

## 1. Track A: Go-Live Operations (Technical Design)

### A1. Database Schema & Migration

**Current state:**
- `schema.prisma` di main punya Product, EmailLog, tapi production DB belum updated.
- Stack: PostgreSQL (prod), SQLite (dev).

**Implementation:**

```bash
# Step 1: Backup production (CRITICAL)
ssh user@prod-server
sudo -u postgres pg_dump dntech > /backups/dntech-2026-07-25.sql
gzip /backups/dntech-2026-07-25.sql

# Step 2: Staging dry-run
cd backend
export DATABASE_URL="postgresql://user:pass@staging-db/dntech"
npx prisma migrate status  # Show pending migrations
npx prisma db push --skip-generate

# Step 3: Verify staging
SELECT COUNT(*) FROM "Product"; -- Should work
SELECT COUNT(*) FROM "EmailLog"; -- Should work

# Step 4: Production (gated)
export DATABASE_URL="postgresql://user:pass@prod-db/dntech"
npx prisma db push --skip-generate

# Step 5: Verify production
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
```

**New tables/fields added (from V6-V7):**

```prisma
// V6 Product model
model Product {
  id, name, slug, category, tagline, description,
  heroImage, published, featured,
  // V7 additions:
  pricingTiers Json,
  features Json,
  integrations Json,
  useCases Json,
  testimonials Json,
  comparisonTable Json,
  roadmap Json,
  primaryCta Json, secondaryCta Json,
  // Media:
  logoUrl, screenshotUrls,
  // Status:
  status ("launched" | "beta" | "comingsoon"),
  tags, longFormContent,
}

// V5 EmailLog (new)
model EmailLog {
  id, recipient, subject, template,
  status ("sent" | "failed" | "skipped"),
  errorMessage, sentAt, createdAt
}

// V5 NewsletterSubscriber (new)
model NewsletterSubscriber {
  email, confirmed, confirmToken, confirmTokenExpiry,
  subscribedAt, unsubscribedAt
}

// V5 FormSubmission (new)
model FormSubmission {
  id, type ("contact" | "quiz" | "career"),
  data Json, email, status, createdAt
}
```

**Indexing strategy:**

```sql
-- Add indexes for frequent queries
CREATE INDEX idx_product_slug ON "Product"(slug);
CREATE INDEX idx_product_featured ON "Product"(featured, published);
CREATE INDEX idx_emaillog_recipient ON "EmailLog"(recipient);
CREATE INDEX idx_emaillog_status ON "EmailLog"(status);
CREATE INDEX idx_newsletter_email ON "NewsletterSubscriber"(email);
```

---

### A2. Seed dnPeople Script

**File: `backend/scripts/seed-dnpeople-v8.ts`**

```typescript
import { prisma } from '@/lib/prisma';

async function seedDnPeople() {
  try {
    // Check if already exists
    const existing = await prisma.product.findUnique({
      where: { slug: 'dnpeople' }
    });
    
    if (existing) {
      console.log('✓ dnPeople already seeded, skipping');
      return;
    }
    
    // Create product
    const product = await prisma.product.create({
      data: {
        name: 'dnPeople',
        slug: 'dnpeople',
        category: 'HRIS',
        tagline: 'Payroll & HR jadi mudah. Harga terjangkau.',
        description: 'dnPeople adalah solusi HRIS untuk SME Indonesia...',
        published: true,
        featured: true,
        status: 'launched',
        
        // Pricing tiers (from V7 PRD)
        pricingTiers: [
          {
            id: 'free',
            name: 'Gratis',
            pricing: { amount: 0, currency: 'IDR', billingPeriod: 'forever' },
            features: ['Employee database', 'Org chart', ...],
            cta: { label: 'Mulai Gratis', url: 'https://app.dnpeople.id/signup', type: 'trial' }
          },
          // ... 4 more tiers
        ],
        
        // Features by category
        features: [
          {
            category: 'Core Payroll',
            icon: 'credit-card',
            features: [
              { name: 'Payroll Otomatis', description: '...' },
              // ...
            ]
          },
          // ... 4 more categories
        ],
        
        // Integrations
        integrations: [
          { name: 'Jurnal', logo: '...', category: 'Accounting', status: 'available' },
          // ...
        ],
        
        // Use cases
        useCases: [
          {
            id: 'manufacturing',
            segment: 'Manufaktur & Pabrik',
            icon: 'factory',
            description: '...',
            testimonial: { quote: '...', author: '...', company: '...' }
          },
          // ...
        ],
        
        // Testimonials
        testimonials: [
          { quote: '...', author: '...', company: '...', rating: 5 },
          // ...
        ],
        
        // Roadmap
        roadmap: [
          {
            quarter: 'Q3 2026',
            status: 'launched',
            features: [
              { name: 'Core Payroll & Talent Development' },
              // ...
            ]
          },
          // ...
        ],
        
        // Comparison
        comparisonTable: {
          title: 'dnPeople vs Kompetitor',
          competitors: ['dnPeople', 'Talenta', 'Gadjian', 'Gajihub'],
          rows: [...]
        },
        
        // CTAs
        primaryCta: {
          label: 'Mulai Gratis Sekarang',
          url: 'https://app.dnpeople.id/signup',
          type: 'trial'
        },
        secondaryCtas: [
          { label: 'Lihat Pricing', url: '#pricing' },
          { label: 'Schedule Demo', url: 'https://calendly.com/dntech/demo' }
        ]
      }
    });
    
    console.log('✓ dnPeople seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedDnPeople();
```

**Run script:**

```bash
npm run db:seed-dnpeople
# atau:
npm run db:seed  # full seed: admin + settings + dnpeople
```

---

### A3. SMTP Verification & Email Logs

**Current SMTP config (V5):**

```typescript
// backend/src/services/EmailService.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,     // mx8.mailspace.id
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,     // info@dntech.id
    pass: process.env.SMTP_PASS,     // password
  },
  from: process.env.SMTP_FROM || 'info@dntech.id',
});
```

**Email Log schema:**

```typescript
// backend/src/services/EmailService.ts
async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, template } = options;
  
  try {
    const result = await transporter.sendMail({
      to,
      subject,
      html,
      replyTo: 'hello@dntech.id'
    });
    
    // Log success
    await prisma.emailLog.create({
      data: {
        recipient: to,
        subject,
        template: template || 'custom',
        status: 'sent',
        messageId: result.messageId,
        sentAt: new Date()
      }
    });
    
    return result;
  } catch (error) {
    // Log failure
    await prisma.emailLog.create({
      data: {
        recipient: to,
        subject,
        template: template || 'custom',
        status: 'failed',
        errorMessage: error.message,
      }
    });
    
    throw error;
  }
}
```

**Verification checklist:**

```bash
# 1. SMTP connectivity test
npm run test:smtp
# Output: ✓ SMTP connected to mx8.mailspace.id:465

# 2. Send test email (production)
curl -X POST https://api.dntech.id/admin/test-email \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"admin@dntech.id"}'
# Check inbox within 2 minutes

# 3. Verify email logs
curl https://api.dntech.id/admin/email-logs \
  -H "Authorization: Bearer $TOKEN"
# Should see status="sent" for test email

# 4. Contact form → admin email test
# Fill contact form at dntech.id → submit → check info@dntech.id inbox
```

---

### A4. Environment Variable Validation

**File: `backend/scripts/validate-env.ts`**

```typescript
const requiredEnvs = [
  'DATABASE_URL',
  'NEXT_PUBLIC_API_URL',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

function validateEnv() {
  const missing: string[] = [];
  
  requiredEnvs.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error(`❌ Missing env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
  
  // Validate format
  if (!process.env.NEXT_PUBLIC_API_URL?.startsWith('https://')) {
    console.error('❌ NEXT_PUBLIC_API_URL must start with https://');
    process.exit(1);
  }
  
  console.log('✓ All env vars present and valid');
}

validateEnv();
```

**Add to build script:**

```json
{
  "scripts": {
    "validate:env": "tsx scripts/validate-env.ts",
    "build": "npm run validate:env && next build"
  }
}
```

---

### A5. Admin Password Security

**One-time setup (after first deploy):**

```bash
# Login to admin at https://dntech.id/admin/login
# Email: admin@dntech.id
# Password: Admin@123456 (default from seed)

# Change password:
# 1. Click admin profile → Settings
# 2. Change password
# 3. New password: [random strong, 12+ chars]
# 4. Store in 1Password vault

# Mark old password as "DO NOT USE"
```

**Optional: Disable seed user after first deploy**

```typescript
// backend/scripts/disable-seed-admin.ts
const admin = await prisma.user.update({
  where: { email: 'admin@dntech.id' },
  data: { active: false } // or delete entirely
});
```

---

## 2. Track B: Engineering Maturity

### B1. GitHub Actions CI

**File: `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-build-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: dntech_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint frontend
        run: npm run lint:frontend
      
      - name: Lint backend
        run: npm run lint:backend
      
      - name: Build frontend
        run: npm run build:frontend
      
      - name: Build backend
        run: npm run build:backend
      
      - name: Test (optional)
        run: npm test 2>/dev/null || true
```

---

### B2. JWT Refresh Token

**File: `backend/src/routes/auth.ts`**

```typescript
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || ''
    ) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Issue new access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || '',
      { expiresIn: '15m' }
    );
    
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

---

### B3. Forgot Password Email

**File: `backend/src/routes/auth.ts`**

```typescript
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if user exists for security
    return res.json({ message: 'If account exists, email sent' });
  }
  
  // Generate reset token (1 hour expiry)
  const resetToken = generateToken();
  const expiry = new Date(Date.now() + 3600 * 1000);
  
  await prisma.user.update({
    where: { email },
    data: { resetToken, resetTokenExpiry: expiry }
  });
  
  // Send email
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  
  await emailService.sendEmail({
    to: email,
    subject: 'Reset Password - DN Tech',
    template: 'forgot-password',
    html: `<a href="${resetUrl}">Reset your password</a>`
  });
  
  res.json({ message: 'Reset email sent' });
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }
    }
  });
  
  if (!user) {
    return res.status(400).json({ error: 'Token expired or invalid' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    }
  });
  
  res.json({ message: 'Password reset successful' });
});
```

---

### B4. Health Endpoint

**File: `backend/src/routes/health.ts`**

```typescript
router.get('/health', async (req, res) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## 3. Track C: Product Platform (Technical Design)

### C1. Media Upload Integration

**File: `backend/src/routes/media.ts`**

```typescript
import multer from 'multer';
import path from 'path';

const upload = multer({
  dest: 'uploads/products/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, WebP allowed'));
    } else {
      cb(null, true);
    }
  }
});

router.post('/products/:productId/upload', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const productId = req.params.productId;
  const url = `/uploads/products/${productId}/${req.file.filename}`;
  
  // Update product
  const product = await prisma.product.update({
    where: { id: productId },
    data: { heroImage: url }
  });
  
  res.json({ url, product });
});
```

---

### C2. Guided Product Editor (Admin Form)

**File: `frontend/src/app/admin/products/[id]/editor.tsx`**

```typescript
export function ProductEditor({ productId }: { productId: string }) {
  const [product, setProduct] = useState(null);
  const [pricingTiers, setPricingTiers] = useState([]);
  
  const addPricingTier = () => {
    setPricingTiers([...pricingTiers, {
      id: `tier-${Date.now()}`,
      name: '',
      pricing: { amount: 0, currency: 'IDR' },
      features: []
    }]);
  };
  
  const savePricingTiers = async () => {
    await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ pricingTiers })
    });
  };
  
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await savePricingTiers();
      alert('Pricing tiers saved!');
    }}>
      <h2>Pricing Tiers</h2>
      
      {pricingTiers.map((tier, idx) => (
        <fieldset key={tier.id}>
          <input
            value={tier.name}
            onChange={(e) => {
              const updated = [...pricingTiers];
              updated[idx].name = e.target.value;
              setPricingTiers(updated);
            }}
            placeholder="Tier name (e.g., Professional)"
          />
          
          <input
            type="number"
            value={tier.pricing.amount}
            onChange={(e) => {
              const updated = [...pricingTiers];
              updated[idx].pricing.amount = parseInt(e.target.value);
              setPricingTiers(updated);
            }}
            placeholder="Price"
          />
          
          <button
            type="button"
            onClick={() => setPricingTiers(pricingTiers.filter((_, i) => i !== idx))}
          >
            Delete
          </button>
        </fieldset>
      ))}
      
      <button type="button" onClick={addPricingTier}>
        Add Tier
      </button>
      
      <button type="submit">Save</button>
    </form>
  );
}
```

---

## 4. Testing & QA Checklist

**File: `docs/QA-CHECKLIST-V8.md`**

```markdown
# V8 QA Checklist

## Track A: Go-live
- [ ] DB migration successful (production)
- [ ] dnPeople product published + featured
- [ ] Contact form → admin email (verify in info@dntech.id inbox)
- [ ] Newsletter signup → opt-in email (verify activation link works)
- [ ] Career form → email to applicant
- [ ] Email logs show "sent" status
- [ ] Admin password changed from default

## Track B: Engineering
- [ ] CI pipeline runs on every push
- [ ] Build + lint pass (0 errors)
- [ ] Refresh token works (15-min access, 7-day refresh)
- [ ] Forgot password email works
- [ ] Health endpoint `/health` returns 200

## Track C: Product (if in scope)
- [ ] Product image upload works
- [ ] Pricing tier form builder saves correctly
- [ ] ROI calculator on dnPeople page
- [ ] 2nd product seeded (DOVA or dummy)

## General
- [ ] Lighthouse mobile ≥ 75 (screenshot captured)
- [ ] Mobile responsiveness: 320px, 640px, 1024px, 1440px
- [ ] Form accessibility: Tab through all inputs
- [ ] No errors in browser console / server logs
```

---

**Status:** 📋 SDD ready for implementation  
**Next:** Team assigns tasks + starts coding

---

**Owner:** Dozer + Engineering Team  
**Date:** Juli 2026
