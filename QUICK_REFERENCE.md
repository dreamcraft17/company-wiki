# 🚀 Quick Reference Guide
## VS Code Workflow untuk Company Wiki

Panduan cepat untuk daily operations di VS Code. Save file ini dan reference saat working.

---

## ⚡ Super Quick Setup (First Time)

```bash
# 1. Buat folder project
mkdir company-wiki && cd company-wiki

# 2. Buka VS Code
code .

# 3. Buka terminal di VS Code (Ctrl+`)
# 4. Init git
git init
git config user.name "Your Name"
git config user.email "email@dntech.id"

# 5. Buat .gitignore
touch .gitignore

# 6. Create folder structure
mkdir -p docs products templates images diagrams archive

# 7. Initial commit
git add .
git commit -m "Initial commit: Setup repository"

# 8. Connect to GitHub
git remote add origin https://github.com/YourUsername/company-wiki.git
git branch -M main
git push -u origin main
```

**Done! ✅**

---

## 📝 Daily Workflow

### Morning: Start Working

```bash
# Open project in VS Code
cd company-wiki
code .

# Update local repo
git pull

# Create feature branch (for new docs)
git checkout -b docs/add/feature-name

# Or work on existing:
git checkout -b docs/update/existing-doc-name
```

### Working: Editing Docs

**Shortcuts in VS Code:**

| Action | Shortcut |
|--------|----------|
| Preview Markdown | `Ctrl+Shift+V` |
| Find | `Ctrl+F` |
| Replace | `Ctrl+H` |
| Format Document | `Shift+Alt+F` |
| Save | `Ctrl+S` |
| Terminal | `Ctrl+`` ` |

### Evening: Commit & Push

```bash
# Check status
git status

# View changes
git diff

# Stage all changes
git add .

# Commit
git commit -m "docs(section): Your message here"

# Push to GitHub
git push

# Create PR via GitHub website
```

---

## 🔥 30-Second Commands

```bash
# Check git status
git status

# See recent commits
git log --oneline -5

# Undo unstaged changes
git checkout -- filename.md

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View file history
git log -p filename.md

# Compare with main
git diff main

# Stash & pop
git stash
git stash pop

# Create new file
touch docs/filename.md

# List all branches
git branch -a

# Delete local branch
git branch -d branch-name

# Pull latest
git pull

# Push changes
git push

# Push to new remote branch
git push -u origin branch-name
```

---

## 📋 Typical Day in 10 Steps

### Step 1: Open Project
```bash
cd company-wiki
code .
```

### Step 2: Pull Latest
```bash
git pull origin main
```

### Step 3: Create Branch
```bash
git checkout -b docs/add/new-documentation
```

### Step 4: Create/Edit File
- Open docs/ folder
- Create new markdown file
- Edit content
- Preview with Ctrl+Shift+V

### Step 5: Check Formatting
- Preview markdown
- Check links
- Spell check
- Update "Last Updated" date

### Step 6: Stage Changes
```bash
git add docs/new-file.md
```

### Step 7: Commit
```bash
git commit -m "docs(section): Add new documentation"
```

### Step 8: Push
```bash
git push -u origin docs/add/new-documentation
```

### Step 9: Create PR
- Go to GitHub.com
- Click "Compare & pull request"
- Add description
- Submit

### Step 10: Merge (After Review)
```bash
# In VS Code:
git checkout main
git pull
git branch -d docs/add/new-documentation
```

---

## 🐛 Quick Fixes

### Oops! Typed wrong commit message

```bash
# Fix last commit message (before push)
git commit --amend -m "Correct message"
git push --force-with-lease
```

### Oops! Forgot to add file

```bash
# Add file & amend commit
git add forgotten-file.md
git commit --amend --no-edit
git push --force-with-lease
```

### Oops! Committed to wrong branch

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Switch to correct branch
git checkout correct-branch

# Commit again
git commit -m "message"
git push
```

### Oops! Need to discard changes

```bash
# Discard all changes in working directory
git checkout -- .

# Discard specific file
git checkout -- docs/filename.md
```

### Oops! Merge conflict

```bash
# View conflicted files
git status

# Open file & manually resolve conflicts
# Look for: <<<<<<, ======, >>>>>>

# Mark as resolved
git add resolved-file.md

# Complete merge
git commit -m "Resolve merge conflict"
```

---

## 📐 File Structure Quick Reference

```
company-wiki/
├── .git/                    # Git folder (auto-created)
├── .gitignore              # Files to ignore
├── README.md               # Main index
├── SETUP_GUIDE.md          # Setup instructions ← YOU ARE HERE
├── CONTRIBUTING.md         # Contributing guidelines
├── docs/
│   ├── 01_README.md
│   ├── 02_COMPANY_OVERVIEW.md
│   ├── products/          # Product source docs index and per-product folders
│   │   ├── README.md      # 187 markdown + 1 DOCX + 4 ZIP archives
│   │   ├── dnPeople/      # HRIS docs, PRD v6.1 status, current baseline mirror
│   │   └── ...
│   └── ...
├── products/
│   ├── 09_COMPRO_PRD.md
│   ├── 10_COMPRO_SPEC.md
│   └── ...
├── templates/              # Doc templates
├── images/                 # Screenshots, diagrams
├── diagrams/              # Architecture diagrams
└── archive/               # Old documents
```

---

## 🔗 Useful Links

**VS Code Extensions (Install):**
```
Markdown All in One
Markdown Preview Enhanced
GitLens
Thunder Client (for API testing)
```

**VS Code Settings:**
```json
{
  "markdown.preview.fontSize": 14,
  "editor.formatOnSave": true,
  "editor.wordWrap": "on",
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**Git Global Config (One-time):**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@dntech.id"
git config --global core.editor "code"
```

---

## 📊 Commit Types Quick Reference

```bash
# Adding new documentation
git commit -m "docs(tech-stack): Add database configuration"

# Adding new feature/product doc
git commit -m "feat(products): Add new product PRD"

# Updating existing docs
git commit -m "update(guidelines): Refresh coding standards"

# Fixing typos/errors
git commit -m "fix(overview): Correct department name"

# Reorganizing content
git commit -m "refactor(docs): Restructure folder layout"

# CI/CD changes
git commit -m "ci: Add GitHub Actions workflow"
```

---

## 🎯 Common Tasks

### Update dnPeople Product Docs

```bash
# 1. Edit implementation docs in app repo
code ../dnpeople/docs/CURRENT-IMPLEMENTATION.md

# 2. Mirror docs that must stay identical
cp ../dnpeople/docs/CURRENT-IMPLEMENTATION.md docs/products/dnPeople/docs/CURRENT-IMPLEMENTATION.md
cp ../dnpeople/docs/FEATURE-CATALOG.md docs/products/dnPeople/docs/FEATURE-CATALOG.md

# 3. Verify mirror
diff -u ../dnpeople/docs/CURRENT-IMPLEMENTATION.md docs/products/dnPeople/docs/CURRENT-IMPLEMENTATION.md

# 4. Update product indexes when status/counts changed
code docs/products/README.md README.md CONTRIBUTING.md
```

Use this for dnPeople changes that affect PRD baseline, feature catalog, API contract,
implementation status, or release evidence. `CURRENT-IMPLEMENTATION.md` should describe
shipped behavior only.

### Add New Documentation

```bash
# 1. Create branch
git checkout -b docs/add/feature-name

# 2. Create file
touch docs/NN_FEATURE_NAME.md

# 3. Edit in VS Code
# (Ctrl+K Ctrl+V to preview)

# 4. Commit & push
git add docs/NN_FEATURE_NAME.md
git commit -m "docs(feature): Add feature documentation"
git push -u origin docs/add/feature-name

# 5. Create PR on GitHub
```

### Update Existing Documentation

```bash
# 1. Pull latest
git pull

# 2. Edit file in VS Code

# 3. Commit & push
git add docs/NN_EXISTING_DOC.md
git commit -m "update(section): Update specific section"
git push
```

### Fix Typos

```bash
# Quick fix workflow
git pull
vim docs/filename.md              # or open in VS Code
git add docs/filename.md
git commit -m "fix(doc): Fix typo in section"
git push
```

### Move/Rename File

```bash
# Proper way to rename in Git
git mv docs/old-name.md docs/new-name.md
git commit -m "refactor: Rename documentation file"
git push
```

### Delete File

```bash
# Remove file
git rm docs/old-file.md
git commit -m "docs: Remove outdated documentation"
git push
```

---

## ✨ VS Code Tips

### Enable Auto-Save
```
File → Auto Save (toggle)
```

### Zoom In/Out
```
Ctrl + / Ctrl -
```

### Split Editor
```
Ctrl + \ (split vertically)
```

### Focus on Markdown Preview
```
Ctrl+K Ctrl+V (opens preview)
```

### Open Recent Files
```
Ctrl+P (quick open)
Type filename to search
```

### Go to Line
```
Ctrl+G
Type line number
```

---

## 📱 Mobile/Remote Push (Optional)

Kalau perlu push dari mobile:

```bash
# Create GitHub token (Settings → Developer settings)
# Store token securely

# Use token for authentication
git clone https://[token]@github.com/user/company-wiki.git
```

---

## 🔒 Important Notes

- **NEVER** commit passwords, API keys, or secrets
- **ALWAYS** update "Last Updated" date
- **ALWAYS** preview markdown before commit
- **ALWAYS** write descriptive commit messages
- **ALWAYS** pull before starting new work
- **ALWAYS** update product indexes when product doc counts/status change
- **ALWAYS** keep dnPeople mirror docs aligned when changing `dnpeople/docs`
- **NEVER** force push to main branch
- **ALWAYS** use feature branches

---

## 🆘 Need Help?

### Common Issues:

| Issue | Solution |
|-------|----------|
| "Not a git repository" | Run `git init` in folder |
| "Permission denied" | Setup SSH keys on GitHub |
| "Merge conflicts" | Open file, resolve manually |
| "Preview not showing" | Install Markdown extension |
| "Can't push" | Run `git pull` first |
| dnPeople wiki docs differ | Run `diff -u ../dnpeople/docs/CURRENT-IMPLEMENTATION.md docs/products/dnPeople/docs/CURRENT-IMPLEMENTATION.md` and mirror intentionally |

### Resources:
- SETUP_GUIDE.md (Full setup)
- CONTRIBUTING.md (Guidelines)
- GitHub docs: docs.github.com

---

## 📌 Bookmarks (Save These)

1. **GitHub Repo**: https://github.com/YourUsername/company-wiki
2. **GitHub Issues**: Issues tab for discussion
3. **GitHub Projects**: Kanban board (if setup)
4. **Git Cheat Sheet**: https://git-scm.com/downloads

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Setup new repository | 10 min |
| Add new doc | 30-60 min |
| Update existing doc | 15-30 min |
| Fix typo | 2-5 min |
| Review & merge PR | 5-10 min |

---

## 🎓 Cheat Sheet Format

```
COMMAND              │ WHAT IT DOES
─────────────────────┼──────────────────────────────────
git pull             │ Get latest changes
git add .            │ Stage all changes
git commit -m "msg"  │ Save changes locally
git push             │ Send to GitHub
git branch -a        │ Show all branches
git checkout -b name │ Create new branch
git status           │ Check current status
git log --oneline    │ See recent commits
git diff             │ View changes
git reset --soft HEAD~1 │ Undo last commit
```

---

**Print this page or save as favorite for quick reference!** 📌

*Last Updated: July 18, 2026*
