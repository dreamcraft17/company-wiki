# DN Tech V5 — HOTFIX: SMTP Connection Issues
## Fix Email System (ETIMEDOUT, ENETUNREACH errors)

**Date:** Juli 2026  
**Status:** 🔴 CRITICAL - Email system down  
**Owner:** Dozer (CEO + Tech Lead)  
**Error:** Cannot connect to mx8.mailspace.id:465

---

## 🚨 Problem Analysis

### What's Happening

```
❌ Email NOT sending
❌ API returns error: ETIMEDOUT (connection timeout)
❌ API returns error: ENETUNREACH (network unreachable)
❌ Server trying IPv6: 2001:df7:5300:9::137 → Failing
```

### Error Chain (from logs)

1. **Email sent to user** → ENETUNREACH
2. **Email sent to admin** → ENETUNREACH  
3. **Retry 1** → ETIMEDOUT
4. **Retry 2** → ETIMEDOUT
5. **Retry 3** → ENETUNREACH

### Root Cause

**DigitalOcean server cannot reach IPv6 address of mx8.mailspace.id:465**

- DNS resolves mx8.mailspace.id → IPv6: `2001:df7:5300:9::137`
- Server has no IPv6 gateway configured
- **Solution:** Force IPv4 connection only

---

## 🔧 Fix Options (3 available)

### Option 1: Force IPv4 Only (FASTEST) ⚡
**Time:** 5 min  
**Risk:** Low  
**Recommended:** YES

**What:** Add `family: 4` to nodemailer transport

```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  family: 4, // ← Force IPv4 only (skip IPv6)
  auth: { ... }
});
```

**Why:** Nodemailer defaults to IPv6 first, then IPv4. If IPv6 fails, times out.

---

### Option 2: Use IPv4-Only SMTP Host (ALTERNATIVE)
**Time:** 15 min  
**Risk:** Medium  
**Recommended:** If Option 1 fails

**What:** Use mailspace.id alternative IPv4 address

**Steps:**
1. SSH to DigitalOcean droplet
2. Resolve mailspace.id to IPv4 only:
   ```bash
   nslookup mx8.mailspace.id
   # Look for A records (IPv4), not AAAA (IPv6)
   ```
3. If only AAAA records exist:
   - Contact mailspace.id support for IPv4 address
   - OR switch to alternative SMTP provider

---

### Option 3: Change SMTP Provider (NUCLEAR)
**Time:** 1-2 hours  
**Risk:** High (requires code change)  
**Recommended:** Only if Option 1+2 fail

**Alternative providers:**
- SendGrid (trusted, enterprise)
- AWS SES (good for DigitalOcean)
- Mailgun (easy setup)
- Gmail SMTP (quick test)

---

## 🚀 IMMEDIATE FIX (Option 1)

### Step 1: Update EmailService.ts

**File:** `backend/src/services/EmailService.ts`

**Find this code:**

```typescript
this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: { ... }
});
```

**Replace with:**

```typescript
this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  family: 4, // ← ADD THIS: Force IPv4 only (skip IPv6)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  pool: { ... }
});
```

### Step 2: Deploy

```bash
cd /var/www/dntech/backend

# Rebuild
npm run build

# Restart API
pm2 restart dntech-api

# Verify
pm2 logs dntech-api
```

### Step 3: Test

**Send test email:**

```bash
curl -X POST http://localhost:4000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "dozern@gmail.com",
    "projectType": "Testing",
    "description": "Test SMTP fix"
  }'
```

**Check logs:**

```bash
# Should see:
# ✅ Email sent to dozern@gmail.com
# ✅ Email sent to info@dntech.id
```

---

## 📋 Alternative: Add Timeout Config

If `family: 4` alone doesn't work, also add:

```typescript
this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  family: 4, // Force IPv4
  connectionTimeout: 10000, // 10 sec (default 2 sec)
  socketTimeout: 10000, // 10 sec
  auth: { ... }
});
```

---

## 🔍 Verify Fix Worked

### Check 1: Logs

```bash
pm2 logs dntech-api --err
# Should show: ✅ Email sent (no ETIMEDOUT/ENETUNREACH)
```

### Check 2: Email Received

- Check **dozern@gmail.com** inbox
- Check **info@dntech.id** mailspace.id (webmail)
- Should both receive test emails

### Check 3: Database

```bash
psql -d dntech
SELECT * FROM "EmailLog" 
WHERE "createdAt" > now() - interval '10 minutes' 
ORDER BY "createdAt" DESC;

# Should show: status = 'sent' (not 'failed')
```

### Check 4: API Response

```bash
# Should return:
{
  "success": true,
  "leadId": "...",
  "message": "Terima kasih! Email konfirmasi telah dikirim ke dozern@gmail.com",
  "adminNotified": true
}
```

---

## 🆘 If Still Not Working

### Debug Step 1: Test SMTP Connection

```bash
cd /var/www/dntech/backend

node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'mx8.mailspace.id',
  port: 465,
  secure: true,
  family: 4, // Force IPv4
  auth: {
    user: 'info@dntech.id',
    pass: process.env.SMTP_PASSWORD
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Error:', error);
  } else {
    console.log('✅ SMTP OK');
  }
  process.exit(0);
});
"
```

### Debug Step 2: Check DigitalOcean DNS

```bash
# SSH into server
ssh root@your-server-ip

# Test DNS resolution
nslookup mx8.mailspace.id
# or
dig mx8.mailspace.id

# Check IPv4 vs IPv6
nslookup -query=A mx8.mailspace.id    # IPv4
nslookup -query=AAAA mx8.mailspace.id # IPv6
```

### Debug Step 3: Check Network Connectivity

```bash
# Can we reach ANY port on mailspace.id?
nc -zv mx8.mailspace.id 465
telnet mx8.mailspace.id 465

# Check if IPv6 is enabled
ip addr show
# Look for "inet6" entries

# Disable IPv6 connectivity test
curl -4 https://ipv4.example.com  # Should work
curl -6 https://ipv6.example.com  # Might fail if no IPv6
```

### Debug Step 4: Use Alternative Port

If 465 blocked, try 587 (TLS):

```typescript
this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587, // Try alternative port
  secure: false, // TLS instead of SSL
  family: 4,
  auth: { ... }
});
```

---

## ✅ Success Checklist

- [ ] Updated EmailService.ts with `family: 4`
- [ ] Deployed to production
- [ ] API restarted
- [ ] Test email sent
- [ ] User received confirmation email
- [ ] Admin received lead notification
- [ ] Database logs show status: 'sent'
- [ ] No ETIMEDOUT/ENETUNREACH errors in logs

---

## 📊 Before & After

### Before Fix

```
❌ Email send attempt 1: ENETUNREACH
❌ Email send attempt 2: ETIMEDOUT
❌ Email send attempt 3: ENETUNREACH
❌ Email logs: status = 'failed'
❌ User not notified
❌ Admin not alerted
```

### After Fix

```
✅ Email send attempt 1: SENT
✅ User receives confirmation
✅ Admin receives notification
✅ Email logs: status = 'sent'
✅ All systems working
```

---

## 📝 Implementation Steps

### Quick Fix (5 min)

1. Edit `backend/src/services/EmailService.ts`
2. Add `family: 4` to transporter config
3. Deploy: `npm run build && pm2 restart dntech-api`
4. Test one email
5. Verify in logs + mailbox

### Full Diagnosis (20 min)

1. Do Quick Fix above
2. Run debug commands (SSH into server)
3. Check DNS resolution
4. Verify IPv4 connectivity
5. Document findings

### Extended Fix (1 hour, if needed)

1. If `family: 4` doesn't work
2. Test with port 587 instead of 465
3. Contact mailspace.id support for IPv4 address
4. OR switch SMTP provider

---

## 🎯 Root Cause Explanation

**Why this happened:**

1. **mailspace.id DNS** returns both IPv6 + IPv4 addresses
2. **Nodemailer default:** Try IPv6 first, fallback to IPv4
3. **DigitalOcean server:** No IPv6 gateway configured
4. **Result:** IPv6 connection attempt → ENETUNREACH, then timeout

**Why `family: 4` fixes it:**

- Forces nodemailer to **skip IPv6 entirely**
- Goes straight to IPv4
- **IPv4 works fine** on DigitalOcean

---

## 🚨 Prevention for Future

### Add to .env

```bash
# Email config (in backend/.env)
SMTP_HOST=mx8.mailspace.id
SMTP_PORT=465
SMTP_SECURE=true
SMTP_FAMILY=4  # Force IPv4 (add this)
SMTP_USER=info@dntech.id
SMTP_PASSWORD=...
```

### Update Code to Use .env

```typescript
this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  family: parseInt(process.env.SMTP_FAMILY || '4'), // ← From .env
  auth: { ... }
});
```

---

## 📞 Support Options

### If Quick Fix Works ✅
- Celebrate! Email system is live
- Monitor for 24 hours
- Document the fix

### If Quick Fix Doesn't Work ❌
- Run debug steps above
- Collect error logs
- Try Option 2 or 3
- Contact mailspace.id support

### DigitalOcean Support
- Ask: "Why no IPv6 connectivity to mx8.mailspace.id?"
- Ask: "Can we whitelist mailspace.id SMTP?"
- Ask: "Should we upgrade to IPv6-enabled server?"

---

## ⏱️ Time Breakdown

| Task | Time |
|------|------|
| Quick Fix (family: 4) | 5 min |
| Deploy + restart | 5 min |
| Test + verify | 5 min |
| Debug (if needed) | 10-20 min |
| **Total** | **15-35 min** |

---

## 📊 Expected Result

After applying this fix:

```
✅ 100% of emails send successfully
✅ User confirmations delivered
✅ Admin lead alerts delivered
✅ Zero ETIMEDOUT errors
✅ Zero ENETUNREACH errors
✅ System fully operational
```

---

## 🎯 Success = When You See

```
✅ Email sent to dozern@gmail.com (messageId: <xxx>)
✅ Email sent to info@dntech.id (messageId: <yyy>)
✅ Form response: "Email konfirmasi telah dikirim"
✅ PM2 logs: No errors
✅ Emails in inbox (both user + admin)
```

---

## Next Steps

**Immediately:**
1. Apply `family: 4` fix
2. Deploy
3. Test
4. Verify

**If working:**
- Update documentation
- Monitor for 24h
- Close ticket

**If still broken:**
- Run debug steps
- Try Option 2 (port 587)
- OR switch provider (Option 3)

---

**Status:** 🔴 URGENT - Apply now!  
**Estimated fix time:** 15-35 minutes  
**Difficulty:** Easy (1-line change)  
**Risk:** Very low

**Let's fix this! 🚀**

---

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026  
**Version:** V5 HOTFIX
