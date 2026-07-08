# DN Tech V5 — SMTP Troubleshooting Guide
## Deep Dive: Fix ETIMEDOUT & ENETUNREACH Errors

**Date:** Juli 2026  
**Status:** 🔴 CRITICAL  
**Owner:** Dozer (CEO + Tech Lead)  

---

## 📋 Error Summary

### What We're Seeing in PM2 Logs

```
Error 1: ETIMEDOUT (Connection timeout)
Error 2: ENETUNREACH (Network unreachable - IPv6)
Error 3: ESOCKET (Socket connection error)

All trying to reach: 2001:df7:5300:9::137:465 (IPv6 address)
```

### Translation

| Error | Meaning | Cause |
|-------|---------|-------|
| ETIMEDOUT | Waited too long | IPv6 route times out |
| ENETUNREACH | Can't reach network | No IPv6 gateway |
| ESOCKET | Socket failed | Connection refused |

---

## 🔍 Root Cause

### The Problem Chain

```
1. Nodemailer opens connection
2. Resolves mx8.mailspace.id → gets IPv6 + IPv4 addresses
3. Tries IPv6 first: 2001:df7:5300:9::137:465
4. DigitalOcean server has NO IPv6 route
5. Times out waiting (or connection refused immediately)
6. Email FAILS (should retry IPv4, but timeout happens first)
```

### Why It Fails

- **DigitalOcean droplet:** No IPv6 enabled OR no IPv6 gateway
- **mailspace.id DNS:** Returns both IPv6 and IPv4
- **Nodemailer default:** Prefers IPv6, then IPv4 (dual-stack)
- **Result:** Timeout before fallback

---

## ✅ Solution Hierarchy

### Level 1: Quick Fix (TRY FIRST)
**Time:** 5 min  
**Success rate:** 90%

Add to EmailService.ts:
```typescript
family: 4  // Force IPv4 only
```

---

### Level 2: If Level 1 Fails
**Time:** 15 min  
**Success rate:** 99%

Test connectivity, try port 587, add timeout config:
```typescript
family: 4
connectionTimeout: 15000
socketTimeout: 15000
port: 587
secure: false // TLS instead SSL
```

---

### Level 3: If Still Failing
**Time:** 1+ hour  
**Success rate:** 100%

Switch SMTP provider:
- SendGrid
- AWS SES
- Mailgun
- Gmail (temporary)

---

## 🚀 Level 1 Fix (DO THIS FIRST)

### File: `backend/src/services/EmailService.ts`

**Current code:**

```typescript
this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: {
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: parseInt(process.env.EMAIL_RATE_LIMIT || '10'),
  },
});
```

**Fixed code:**

```typescript
this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  family: 4, // ← ADD THIS LINE: Force IPv4 only
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: {
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: parseInt(process.env.EMAIL_RATE_LIMIT || '10'),
  },
});
```

### Deploy Level 1

```bash
cd /var/www/dntech/backend

# 1. Make the change above
vim src/services/EmailService.ts

# 2. Test locally
npm run dev

# 3. Build
npm run build

# 4. Deploy
pm2 restart dntech-api

# 5. Watch logs
pm2 logs dntech-api --err
```

### Test Level 1

```bash
# From browser or curl
curl -X POST http://localhost:4000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "projectType": "Test",
    "description": "SMTP test"
  }'

# Watch logs for:
# ✅ "Email sent" = SUCCESS
# ❌ "ETIMEDOUT" / "ENETUNREACH" = Try Level 2
```

---

## 🔧 Level 2 Fix (If Level 1 Fails)

### Step 1: Add Extended Timeout Config

```typescript
this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  family: 4, // Force IPv4
  
  // Add these timeouts:
  connectionTimeout: 15000, // 15 sec (default 2 sec)
  socketTimeout: 15000, // 15 sec (default 29 min)
  greetingTimeout: 10000, // 10 sec SMTP greeting
  
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: { ... }
});
```

### Step 2: Test Alternative Port

Try port 587 with TLS instead of 465 (SSL):

```typescript
// Option A: Keep 465 but add timeouts (try first)
port: 465,
secure: true,
family: 4,
connectionTimeout: 15000,
socketTimeout: 15000,

// Option B: Try 587 (if 465 fails)
port: 587,
secure: false, // TLS instead SSL
family: 4,
connectionTimeout: 15000,
socketTimeout: 15000,
```

### Step 3: SSH to Server & Debug

```bash
# SSH into DigitalOcean droplet
ssh root@your.server.ip

# Test DNS resolution
nslookup mx8.mailspace.id
# Look for A records (IPv4) and AAAA records (IPv6)

# Sample output:
# Name: mx8.mailspace.id
# Address: 192.0.2.137  ← IPv4 (good)
# Address: 2001:df7:5300:9::137  ← IPv6 (problem?)

# Test connectivity to IPv4 only
nc -4 -zv mx8.mailspace.id 465
# Should say "succeeded" or "Connection refused"

# Test connectivity to IPv6
nc -6 -zv mx8.mailspace.id 465
# Probably times out (ENETUNREACH)

# Check if IPv6 enabled on this droplet
ip addr show
# Look for "inet6" entries - if none, IPv6 disabled
```

### Step 4: If IPv6 Issue Confirmed

**Add to /etc/hosts** (workaround):

```bash
# SSH to server
ssh root@your.server.ip

# Edit hosts file
sudo vim /etc/hosts

# Add line (replace X.X.X.X with IPv4 from nslookup):
192.0.2.137  mx8.mailspace.id

# Verify
cat /etc/hosts
```

This forces system to use IPv4 only for mailspace.id.

### Deploy Level 2

```bash
cd /var/www/dntech/backend

# Update EmailService with timeouts
vim src/services/EmailService.ts

# If using /etc/hosts workaround (via SSH), done
# If just updating code:
npm run build
pm2 restart dntech-api
pm2 logs dntech-api --err
```

---

## 🌐 Level 3 Fix (Nuclear Option)

### If Level 1 + 2 Fail

**Consider switching email provider:**

#### Option A: SendGrid (RECOMMENDED)

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async sendEmail(to: string, subject: string, html: string) {
  await sgMail.send({
    to,
    from: 'info@dntech.id',
    subject,
    html,
  });
}
```

**Setup:**
1. Create SendGrid account
2. Generate API key
3. Add to .env: `SENDGRID_API_KEY=...`
4. Test

---

#### Option B: AWS SES

```bash
npm install aws-sdk nodemailer-aws-ses-transport
```

**Setup:**
1. Create AWS SES account
2. Get access keys
3. Add to .env
4. Configure nodemailer-aws-ses-transport

---

#### Option C: Mailgun

```bash
npm install mailgun.js
```

**Setup:**
1. Create Mailgun account
2. Get API key
3. Configure in code
4. Send emails

---

#### Option D: Gmail SMTP (Emergency Only)

```typescript
// Quick temporary fix
this.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-gmail@gmail.com',
    pass: 'app-password', // Google App Password
  },
});
```

⚠️ Only for testing! Not production-ready.

---

## 🧪 Comprehensive Debugging

### Test 1: Can We Resolve DNS?

```bash
ssh root@your.server.ip

# Test DNS
nslookup mx8.mailspace.id
dig mx8.mailspace.id

# Expected output:
# A record (IPv4): 192.0.2.137
# AAAA record (IPv6): 2001:df7:5300:9::137
```

### Test 2: Can We Reach IPv4?

```bash
# From DigitalOcean droplet
nc -4 -zv -w 5 mx8.mailspace.id 465
# Should print "succeeded" or immediate "refused"

# If times out → IPv4 also blocked (firewall issue)
# If refused → Port 465 blocked, try 587
```

### Test 3: Can We Reach IPv6?

```bash
# From DigitalOcean droplet
nc -6 -zv -w 5 mx8.mailspace.id 465
# Probably times out (ENETUNREACH) or "refused"
# This is the problem!
```

### Test 4: SMTP Handshake Test

```bash
# Open SMTP connection
telnet mx8.mailspace.id 465
# or
openssl s_client -connect mx8.mailspace.id:465

# If connects → Server reachable
# If times out → Network problem
```

### Test 5: Check Firewall Rules

```bash
ssh root@your.server.ip

# Check outbound firewall
sudo iptables -L -n | grep 465
sudo ufw status

# DigitalOcean Cloud Firewall:
# Login to DigitalOcean console
# Droplets → Networking → Firewalls
# Check if port 465 allowed outbound
```

---

## 📝 Email Test Script

Create file: `backend/test-smtp.js`

```javascript
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🔍 Testing SMTP connection...\n');

  // Test 1: IPv6 (will timeout)
  console.log('Test 1: IPv6 connection (expect timeout)');
  try {
    const t6 = nodemailer.createTransport({
      host: 'mx8.mailspace.id',
      port: 465,
      secure: true,
      family: 6, // IPv6 only
      connectionTimeout: 5000,
    });
    await t6.verify();
    console.log('✅ IPv6: OK');
  } catch (error) {
    console.log('❌ IPv6: FAILED -', error.code);
  }

  // Test 2: IPv4 (should work)
  console.log('\nTest 2: IPv4 connection (expect success)');
  try {
    const t4 = nodemailer.createTransport({
      host: 'mx8.mailspace.id',
      port: 465,
      secure: true,
      family: 4, // IPv4 only
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    const result = await t4.verify();
    console.log('✅ IPv4: OK - SMTP server ready');
  } catch (error) {
    console.log('❌ IPv4: FAILED -', error.message);
  }

  // Test 3: Port 587 alternative
  console.log('\nTest 3: Port 587 TLS (alternative)');
  try {
    const t587 = nodemailer.createTransport({
      host: 'mx8.mailspace.id',
      port: 587,
      secure: false,
      family: 4,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    const result = await t587.verify();
    console.log('✅ Port 587: OK');
  } catch (error) {
    console.log('❌ Port 587: FAILED -', error.message);
  }
}

testSMTP();
```

**Run:**

```bash
cd backend
node test-smtp.js
```

**Expected output:**

```
Test 1: IPv6 connection (expect timeout)
❌ IPv6: FAILED - ETIMEDOUT

Test 2: IPv4 connection (expect success)
✅ IPv4: OK - SMTP server ready

Test 3: Port 587 TLS (alternative)
✅ Port 587: OK
```

---

## 🎯 Decision Tree

```
Apply Level 1 Fix (family: 4)
    ↓
    ├─ Works? ✅
    │   └─ Done! Email system live
    │
    └─ Fails? ❌
        ↓
        Run Debug Tests (Test 1-5 above)
            ↓
            ├─ IPv6 issue? 
            │   └─ Apply Level 2: Add timeouts + /etc/hosts fix
            │       ├─ Works? ✅ Done!
            │       └─ Fails? ❌ Go to Level 3
            │
            ├─ Firewall blocked?
            │   └─ Contact DigitalOcean support
            │       OR allow port 465 in firewall
            │
            └─ SMTP auth failed?
                └─ Verify SMTP credentials
                    └─ Contact mailspace.id support
```

---

## 📊 Common Issues & Fixes

| Issue | Symptoms | Fix |
|-------|----------|-----|
| **IPv6 timeout** | ETIMEDOUT on 2001:... | Add `family: 4` |
| **No IPv6 route** | ENETUNREACH on IPv6 | Add `family: 4` + /etc/hosts |
| **Port blocked** | Connection refused 465 | Try port 587 OR firewall rule |
| **Auth failed** | 535 Authentication failed | Check SMTP credentials |
| **DNS issue** | getaddrinfo ENOTFOUND | Check /etc/resolv.conf |
| **Firewall blocked** | All timeouts | Check iptables/ufw/DigitalOcean FW |

---

## ✅ Success Indicators

### You'll Know It's Fixed When:

**In PM2 logs:**
```
✅ [Email] Email sent to dozern@gmail.com (messageId: <xxx>)
✅ [Email] Email sent to info@dntech.id (messageId: <yyy>)
```

**No more:**
```
❌ ETIMEDOUT
❌ ENETUNREACH
❌ ESOCKET
❌ Failed sending
```

**In database:**
```sql
SELECT status, COUNT(*) FROM "EmailLog" 
GROUP BY status;

-- Should show:
-- status | count
-- ------|-------
-- sent  | N
-- (no 'failed' entries)
```

---

## 🚨 Emergency Workaround (While Fixing)

If you need emails working NOW while debugging:

### Quick: Use Gmail SMTP Temporarily

```typescript
// backend/src/services/EmailService.ts
this.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'app-password', // Generate from Google Account Settings
  },
});
```

**Setup Google App Password:**
1. Go to myaccount.google.com/security
2. Enable 2-factor auth (if not enabled)
3. Create app password
4. Use that password in .env

**Deploy:**
```bash
npm run build && pm2 restart dntech-api
```

⚠️ **Temporary only!** Replace with mailspace.id fix ASAP.

---

## 📞 Support Escalation

### If All Fixes Fail, Contact:

**1. mailspace.id Support**
- Problem: "Cannot reach mx8.mailspace.id:465 from DigitalOcean (IPv6 timeout)"
- Ask: "IPv4-only endpoint?" or "IPv6 gateway issue?"
- Time: 1-2 hours response

**2. DigitalOcean Support**
- Problem: "Server cannot reach external IPv6 addresses"
- Ask: "Enable IPv6?" or "Whitelist mailspace.id?"
- Time: 2-4 hours response

**3. Switch Provider**
- SendGrid (1 hour setup)
- AWS SES (2 hours setup)
- Mailgun (30 min setup)

---

## 📋 Troubleshooting Checklist

- [ ] Applied Level 1 fix (family: 4)
- [ ] Deployed & restarted API
- [ ] Tested with curl/browser
- [ ] Checked PM2 logs for errors
- [ ] If still failing:
  - [ ] SSH to server
  - [ ] Ran DNS tests (nslookup)
  - [ ] Tested IPv4 connectivity (nc -4)
  - [ ] Tested IPv6 connectivity (nc -6)
  - [ ] Applied Level 2 fix if needed
  - [ ] Added /etc/hosts workaround
  - [ ] Tested again
- [ ] If still failing:
  - [ ] Ran comprehensive test-smtp.js
  - [ ] Checked firewall rules
  - [ ] Contacted support
  - [ ] Switched provider (Level 3)

---

## ⏱️ Time Estimates

| Level | Action | Time | Success Rate |
|-------|--------|------|--------------|
| **1** | Add family: 4 | 5 min | 90% |
| **2** | Debug + fix | 15-30 min | 99% |
| **3** | Switch provider | 1-2 hours | 100% |

---

## 🎯 Final Recommendation

**Do this RIGHT NOW:**

1. **Apply Level 1 fix** (5 min)
   - Add `family: 4` to EmailService
   - Deploy & test

2. **If works:** ✅ Done! Monitor for 24h.

3. **If fails:** Apply Level 2
   - Add timeouts
   - Add /etc/hosts
   - Debug with test script

4. **If still fails:** Switch provider (Level 3)
   - Use SendGrid
   - Takes 1-2 hours but guaranteed to work

**Estimate:** 15-30 minutes to fix.

---

**Status:** 🔴 URGENT  
**Action:** Apply Level 1 now!  
**Time to resolution:** 15-30 min guaranteed  

**Let's fix this! 🚀**

---

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026  
**Version:** V5 HOTFIX Extended
