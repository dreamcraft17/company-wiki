# 🚨 IMMEDIATE ACTION PLAN
## Fix Email System (Now)

**Status:** Critical - Email not sending  
**Time to fix:** 5-15 minutes  
**Difficulty:** Easy (1-line code change)

---

## ⚡ DO THIS RIGHT NOW (5 minutes)

### Step 1: Edit File (2 min)

```bash
cd /var/www/dntech/backend

# Open editor
vim src/services/EmailService.ts
```

### Step 2: Find This Line

Search for `createTransport` and find this part:

```typescript
this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
```

### Step 3: Add ONE Line

Right after `secure: true,` ADD:

```typescript
family: 4,  // ← ADD THIS LINE
```

**Result:**

```typescript
this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  family: 4,  // ← ADDED
  auth: {
```

### Step 4: Deploy (2 min)

```bash
# Build
npm run build

# Restart
pm2 restart dntech-api

# Watch logs
pm2 logs dntech-api --err
```

### Step 5: Test (1 min)

```bash
curl -X POST http://localhost:4000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "dozern@gmail.com",
    "projectType": "Test",
    "description": "Test"
  }'

# Check logs:
# ✅ Should show "Email sent to dozern@gmail.com"
# ✅ Should show "Email sent to info@dntech.id"
# ❌ Should NOT show "ETIMEDOUT" or "ENETUNREACH"
```

---

## ✅ If Email Works Now

**Success!** 🎉

- Monitor for next 24 hours
- If stable → Close ticket
- If issues → Run troubleshooting guide

---

## ❌ If Still Not Working

**Follow extended guide:**

Open: `DN-TECH-V5-HOTFIX-TROUBLESHOOTING.md`

Run these tests:
```bash
# SSH to server
ssh root@your.server.ip

# Test 1: Check DNS
nslookup mx8.mailspace.id

# Test 2: Test IPv4
nc -4 -zv mx8.mailspace.id 465

# Test 3: Test IPv6
nc -6 -zv mx8.mailspace.id 465

# Test 4: Run SMTP test
node test-smtp.js
```

Then follow Level 2 or Level 3 fixes in troubleshooting guide.

---

## 📋 Complete Docs

| Document | Purpose | Read When |
|----------|---------|-----------|
| **ACTION-PLAN.md** | This file - immediate fix | NOW |
| **HOTFIX-SMTP-CONNECTION.md** | Quick fix explained | If quick fix fails |
| **HOTFIX-TROUBLESHOOTING.md** | Deep debugging | If still broken after quick fix |

---

## 🎯 Expected Timeline

- **Now:** Apply 1-line fix (5 min)
- **+5 min:** Deploy (2 min)
- **+5 min:** Test (1 min)
- **+5 min:** DONE! ✅

**Total:** 15 minutes to working email system

---

## 💡 What's The Problem?

```
Server trying to connect via IPv6 → Times out
Solution: Force IPv4 only via family: 4
```

---

## 🔥 DO NOT

❌ Don't switch SMTP provider yet  
❌ Don't rebuild entire email system  
❌ Don't ask for more documentation  

✅ DO: Apply 1-line fix first!

---

**Status:** URGENT - Apply now  
**Expected:** 15 minutes  
**Outcome:** Working email system ✅

**Go! 🚀**

---

Owner: Dozer  
Date: Juli 2026
