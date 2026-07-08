# 🎯 START HERE - Getting Started Guide

**Bingung mau mulai dari mana? Baca ini dulu! (5 menit)**

---

## 👋 Welcome!

Kamu mau bikin `company-wiki` repository untuk DN Tech? 
**Panduan ini akan membimbing kamu step-by-step.**

---

## 📚 Which Guide to Read?

### Scenario 1: "I have 1 hour, want to setup everything"
→ **Read: [SETUP_GUIDE.md](./SETUP_GUIDE.md)**
- Complete step-by-step setup
- Includes all git commands
- Covers GitHub integration
- Time: ~60 minutes

### Scenario 2: "I want quick commands to reference daily"
→ **Read: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**
- Command cheat sheet
- Common tasks
- Quick fixes
- Time: 5 minutes (reference anytime)

### Scenario 3: "I'm helping contribute to the wiki"
→ **Read: [CONTRIBUTING.md](./CONTRIBUTING.md)**
- How to write documentation
- Style guidelines
- Commit message format
- PR workflow
- Time: 15 minutes

### Scenario 4: "I want to track all files & status"
→ **Read: [FILE_MANIFEST.md](./FILE_MANIFEST.md)**
- Complete file inventory
- Setup checklist
- File structure
- Status tracking
- Time: 10 minutes

---

## ⚡ Super Quick Start (5 Minutes)

### Already know git? Do this:

```bash
# 1. Create folder & open VS Code
mkdir company-wiki && cd company-wiki && code .

# 2. Init git (in VS Code terminal: Ctrl+`)
git init
git config user.name "Your Name"
git config user.email "your.email@dntech.id"

# 3. Create folder structure
mkdir -p docs products templates images diagrams archive

# 4. Create .gitignore file
touch .gitignore
# (Paste content from FILE_MANIFEST.md)

# 5. Initial commit
git add .
git commit -m "Initial commit: Setup wiki"

# 6. Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/company-wiki.git
git branch -M main
git push -u origin main

# 7. Copy all markdown files to appropriate folders
# (You'll do this manually from the output files)
```

**Done! ✅**

Now:
- Copy all .md files to correct folders
- Commit again: `git add . && git commit -m "docs: Add documentation"`
- Push: `git push`

---

## 🎯 Your Next Steps

### Step 1: Choose Your Path (Now)
```
Am I familiar with Git? 
├─ YES → Go to "Super Quick Start" above
└─ NO  → Go to SETUP_GUIDE.md
```

### Step 2: Follow the Guide (30-60 min)
- Read the appropriate guide fully
- Do each step in order
- Don't skip steps!

### Step 3: Copy Documentation Files (10 min)
- Navigate to this folder
- Copy all `.md` files to your repository
- Follow FILE_MANIFEST.md for correct locations

### Step 4: Commit & Push (5 min)
```bash
git add .
git commit -m "docs: Add DN Tech documentation"
git push
```

### Step 5: Verify on GitHub (2 min)
- Visit github.com
- Open your repository
- Check all files are there ✅

### Step 6: Start Using! 🎉
- Repository ready!
- Share with team
- Start writing docs!

---

## 📋 Checklist (Do These First)

Before you start, make sure you have:

- [ ] **Git installed**: `git --version`
- [ ] **VS Code installed**: Open it
- [ ] **GitHub account**: logged in
- [ ] **30-60 minutes free**: block calendar
- [ ] **Terminal access**: Comfortable enough
- [ ] **This folder downloaded**: All `.md` files

---

## 🤔 Confused About Something?

### Q: Where do I put the files?
**A:** Use FILE_MANIFEST.md - shows exact folder structure

### Q: What's git?
**A:** Version control system. SETUP_GUIDE.md explains it

### Q: Do I need to memorize git commands?
**A:** No! QUICK_REFERENCE.md has all commands you need

### Q: What if I mess up?
**A:** It's ok! See "Undo/Fix" section in QUICK_REFERENCE.md

### Q: Can I ask for help?
**A:** Yes! Check CONTRIBUTING.md for how to ask questions

---

## 📖 All Guides at a Glance

```
START HERE (you are here) ← Short introduction
    ↓
FILE_MANIFEST.md ← File inventory & checklist
    ↓
SETUP_GUIDE.md ← Detailed step-by-step
    ↓
QUICK_REFERENCE.md ← Commands reference
    ↓
CONTRIBUTING.md ← How to contribute
```

---

## ⏰ Time Estimates

| Phase | Time | Guide |
|-------|------|-------|
| Understand setup | 10 min | This page + FILE_MANIFEST |
| Follow setup steps | 40 min | SETUP_GUIDE.md |
| Copy files | 10 min | Manual (drag & drop in VS Code) |
| Commit & push | 5 min | QUICK_REFERENCE.md |
| Verify on GitHub | 2 min | Manual |
| **TOTAL** | **~70 min** | - |

---

## 🚀 Ready to Start?

### Option A: I want step-by-step guide (Recommended for first time)
→ **Go to [SETUP_GUIDE.md](./SETUP_GUIDE.md)** and follow each step carefully

### Option B: I know git, just want quick setup
→ Use "Super Quick Start" section above

### Option C: I want to understand everything first
→ Read [FILE_MANIFEST.md](./FILE_MANIFEST.md) then SETUP_GUIDE.md

### Option D: I just want daily reference commands
→ Bookmark [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

## 💡 Pro Tips

1. **Don't skip steps** - Follow guides in order
2. **Read error messages** - They usually tell you what's wrong
3. **Use preview** - Ctrl+Shift+V in VS Code to preview markdown
4. **Ask questions** - Better to ask than guess
5. **Start small** - Setup first, then add documentation
6. **Test locally** - Verify everything works before pushing

---

## ✨ What You'll Get

After following this guide:

✅ Local git repository on your computer  
✅ All documentation files organized  
✅ Connected to GitHub  
✅ Ready to start documenting  
✅ Ready to collaborate with team  
✅ Professional company wiki  

---

## 🎓 After Setup is Done

Once repository is created:

1. **Share with team** - Add collaborators on GitHub
2. **Start documenting** - Use CONTRIBUTING.md guidelines
3. **Commit regularly** - Use QUICK_REFERENCE.md commands
4. **Review PRs** - Use CONTRIBUTING.md checklist
5. **Update docs** - Keep Last Updated date fresh

---

## 📞 I'm Still Confused!

### Read these in this order:

1. **FILE_MANIFEST.md** - Understand what files exist
2. **SETUP_GUIDE.md** - Follow step by step
3. **QUICK_REFERENCE.md** - Bookmark for later
4. **CONTRIBUTING.md** - Reference when adding docs

If still confused:
- Re-read the relevant section slowly
- Check "Troubleshooting" in SETUP_GUIDE.md
- Ask colleague or search online for git help

---

## 🎯 Recommended Reading Order

**First Time Setup:**
```
1. START HERE (this page) ← 5 min
   ↓
2. FILE_MANIFEST.md ← 10 min
   ↓
3. SETUP_GUIDE.md ← 50 min
   ↓
4. QUICK_REFERENCE.md ← 5 min (bookmark)
   ↓
5. CONTRIBUTING.md ← 15 min (when needed)
```

**Total: ~85 minutes** 

---

## 🏁 Ready?

**Let's go!** 

Choose your path above and start with the appropriate guide.

---

## Quick Links (Save These!)

| Guide | Purpose | Read Time |
|-------|---------|-----------|
| **START HERE** | This page | 5 min |
| **FILE_MANIFEST** | File checklist | 10 min |
| **SETUP_GUIDE** | Complete setup | 50 min |
| **QUICK_REFERENCE** | Command cheat sheet | 5 min |
| **CONTRIBUTING** | How to contribute | 15 min |

---

**Questions? Open the appropriate guide above and find your answer!** 🎓

*Last Updated: July 8, 2026*