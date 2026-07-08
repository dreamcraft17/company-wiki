# 📖 Panduan Setup Company Wiki Repository
## DN Tech Company Knowledge Base

Panduan step-by-step untuk membuat dan mengatur `company-wiki` repository di VS Code.

---

## 🎯 Daftar Isi

1. [Prerequisites](#prerequisites)
2. [Inisialisasi Repository](#inisialisasi-repository)
3. [Setup Folder Structure](#setup-folder-structure)
4. [Membuat File Dokumentasi](#membuat-file-dokumentasi)
5. [Git Workflow](#git-workflow)
6. [Publish ke GitHub](#publish-ke-github)
7. [Maintenance & Update](#maintenance--update)

---

## Prerequisites

### Tools yang Diperlukan
- ✅ Git (latest version)
- ✅ VS Code (latest)
- ✅ GitHub account
- ✅ Terminal/Command Line
- ✅ Node.js (optional, untuk tools)

### Extensions VS Code Recommended
1. **Markdown All in One** - Better markdown support
2. **Markdown Preview Enhanced** - Preview markdown
3. **GitHub Copilot** - Assist writing
4. **GitLens** - Git integration
5. **Thunder Client** - Test API (untuk docs API)
6. **Draw.io Integration** - Buat diagram

### Instalasi Extensions
```bash
# Buka VS Code Extensions atau gunakan CLI
code --install-extension yzhang.markdown-all-in-one
code --install-extension shd101wyy.markdown-preview-enhanced
code --install-extension eamodio.gitlens
code --install-extension rangav.vscode-thunder-client
```

---

## Inisialisasi Repository

### Step 1: Buat Folder Project Lokal

```bash
# Buka terminal/command prompt
# Navigate ke folder project Anda
cd ~/projects

# Buat folder baru
mkdir company-wiki
cd company-wiki

# Buka dengan VS Code
code .
```

### Step 2: Inisialisasi Git

```bash
# Di dalam folder company-wiki (dalam VS Code terminal)
git init
git config user.name "Your Name"
git config user.email "your.email@dntech.id"
```

### Step 3: Buat File .gitignore

Di VS Code, buat file `.gitignore`:

```bash
# File → New File
# Ketik: .gitignore
```

**Isi .gitignore:**
```
# OS
.DS_Store
Thumbs.db
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# Node (jika nanti pakai tools)
node_modules/
dist/
build/

# Temporary
*.tmp
.temp/

# Sensitive data
.env
.env.local
secrets/

# Cache
.cache/
```

### Step 4: Buat README Awal

Buat file `README.md` di root:

```markdown
# DN Tech Company Wiki

Knowledge base dan dokumentasi untuk DN Tech.

## 📚 Daftar Isi

- [Company Overview](./02_COMPANY_OVERVIEW.md)
- [Mission & Vision](./03_MISSION_VISION.md)
- [Tech Stack](./05_TECH_STACK.md)
- [Products](./08_PRODUCTS.md)

## 🚀 Getting Started

1. Clone repository ini
2. Buka folder di VS Code
3. Baca dokumentasi sesuai kebutuhan

## 📝 Contributing

Lihat CONTRIBUTING.md untuk guidelines

## 📄 License

Confidential - DN Tech Internal Documentation
```

### Step 5: Initial Commit

```bash
git add .
git commit -m "Initial commit: Setup repository structure"
```

---

## Setup Folder Structure

### Step 1: Buat Struktur Folder

Di VS Code, buat folder dengan klik kanan → New Folder:

```
company-wiki/
├── README.md                    # Main index
├── .gitignore
├── CONTRIBUTING.md              # Guidelines
├── docs/
│   ├── 01_README.md
│   ├── 02_COMPANY_OVERVIEW.md
│   ├── 03_MISSION_VISION.md
│   ├── 04_ORGANIZATION.md
│   ├── 05_TECH_STACK.md
│   ├── 06_ARCHITECTURE.md
│   ├── 07_DEV_GUIDELINES.md
│   └── 08_PRODUCTS.md
├── products/
│   ├── 09_COMPRO_PRD.md
│   ├── 10_COMPRO_SPEC.md
│   ├── 11_CAREERS_PRD.md
│   └── 12_CAREERS_SPEC.md
├── templates/
│   ├── PRD_TEMPLATE.md
│   ├── SDD_TEMPLATE.md
│   └── MEETING_NOTES_TEMPLATE.md
├── images/                      # Screenshots, diagrams
├── diagrams/                    # Architecture diagrams
└── archive/                     # Old/archived documents
```

### Step 2: Buat Folder via Terminal

```bash
# Dalam VS Code terminal
mkdir -p docs products templates images diagrams archive

# Verify
ls -la
```

### Step 3: Buat File-file Dokumentasi

**Cara 1: Manual di VS Code**
- Klik kanan pada folder → New File
- Ketik nama file (contoh: `02_COMPANY_OVERVIEW.md`)
- Paste content dari template

**Cara 2: Via Terminal**
```bash
# Buat file kosong
touch docs/01_README.md
touch docs/02_COMPANY_OVERVIEW.md
touch docs/03_MISSION_VISION.md
# dst...
```

---

## Membuat File Dokumentasi

### Struktur Setiap File Markdown

**Header Template:**
```markdown
# [Judul Dokumen]

**Document Version**: 1.0  
**Last Updated**: July 8, 2026  
**Status**: [Draft/Published]  
**Owner**: [Role/Person]

---

## [Main Content Section]

### Subsection

Content here...

---

## 📄 Related Documents

- [Link ke dokumen terkait](../path/file.md)

---

*Last Updated: [Date]*
```

### Step 1: Copy Content dari Template

Ambil content dari file-file yang sudah saya buat sebelumnya.

**Contoh untuk `docs/02_COMPANY_OVERVIEW.md`:**
1. Buka file template yang sudah ada
2. Copy semua content
3. Paste ke file di VS Code
4. Adjust link references jika perlu

### Step 2: Update Referensi Path

Karena struktur folder berbeda, update path di markdown:

**Sebelum:**
```markdown
- [Tech Stack](./05_TECH_STACK.md)
- [Architecture](./06_ARCHITECTURE.md)
```

**Sesudah (kalau docs di subfolder):**
```markdown
- [Tech Stack](./05_TECH_STACK.md)
- [Architecture](./06_ARCHITECTURE.md)
- [Products](../docs/08_PRODUCTS.md)
```

### Step 3: Preview Markdown

**Method 1: Built-in Preview**
- Klik tombol Preview di kanan atas (eye icon)
- Atau: Ctrl+Shift+V (Windows/Linux) / Cmd+Shift+V (Mac)

**Method 2: Markdown Preview Enhanced**
- Klik kanan → Markdown Preview Enhanced
- Atau: Ctrl+K V

---

## Git Workflow

### Step 1: Add Files ke Git

```bash
# Add semua file
git add .

# Atau add specific file
git add docs/02_COMPANY_OVERVIEW.md

# Check status
git status
```

### Step 2: Commit dengan Message yang Jelas

```bash
# Format: [TYPE] Deskripsi

git commit -m "docs: Add company overview documentation"
git commit -m "docs: Add tech stack specifications"
git commit -m "docs: Add development guidelines"
git commit -m "feat: Add product documentation (Compro & Careers)"
```

### Step 3: Lihat Git History

```bash
# Lihat commit history
git log --oneline

# Lihat changes
git diff HEAD~1

# Lihat file changes
git show HEAD:docs/02_COMPANY_OVERVIEW.md
```

### Step 4: Workflow untuk Multiple Documents

```bash
# Session 1: Company docs
git add docs/02_COMPANY_OVERVIEW.md docs/03_MISSION_VISION.md
git commit -m "docs: Add company profile and mission/vision"

# Session 2: Tech docs
git add docs/05_TECH_STACK.md docs/06_ARCHITECTURE.md
git commit -m "docs: Add technical documentation"

# Session 3: Product docs
git add products/09_COMPRO_PRD.md products/10_COMPRO_SPEC.md
git commit -m "feat: Add Compro product documentation (PRD & Spec)"

git add products/11_CAREERS_PRD.md products/12_CAREERS_SPEC.md
git commit -m "feat: Add Careers module documentation (PRD & Spec)"
```

---

## Publish ke GitHub

### Step 1: Buat Repository di GitHub

**Di GitHub.com:**
1. Login ke akun GitHub
2. Klik "+" → New repository
3. Repository name: `company-wiki`
4. Description: "DN Tech Company Knowledge Base"
5. Privacy: Private (karena internal docs)
6. ✅ Add README (uncheck - sudah punya)
7. ✅ Add .gitignore (uncheck - sudah punya)
8. Click "Create repository"

### Step 2: Connect Local Repository ke GitHub

Setelah repo dibuat, GitHub akan kasih instruksi. Di VS Code terminal:

```bash
# Add remote repository
git remote add origin https://github.com/YourUsername/company-wiki.git

# Verify
git remote -v

# Rename branch ke main jika masih master
git branch -M main

# Push ke GitHub
git push -u origin main
```

### Step 3: Push Pertama Kali

```bash
# Kalau ada error, push dengan force (hanya first time)
git push -u origin main

# Subsequent pushes
git push
```

### Step 4: Verify di GitHub

1. Buka GitHub.com → company-wiki repo
2. Verify semua file sudah terupload
3. Baca README di GitHub

---

## Struktur Template untuk Dokumen Baru

### Template: Product Requirements Document (PRD)

Buat file `templates/PRD_TEMPLATE.md`:

```markdown
# Product Requirements Document (PRD)
## [Product Name]

**Document Version**: 1.0  
**Last Updated**: [Date]  
**Status**: Draft  
**Owner**: [Role]

---

## 1. Executive Summary

### Product Name
**[Full Product Name]**

### Product Vision
[Deskripsi visi produk]

### Goal Statement
[Tujuan utama]

### Success Metrics
- [Metric 1]
- [Metric 2]

---

## 2. Problem Statement

### Current Situation
[Situasi saat ini]

### Problems to Solve
[List masalah]

---

## 3. Target Audience

### Primary Segments
[Segment 1]
[Segment 2]

---

## 4. Key Features

### 4.1 Core Features
[Feature 1]
[Feature 2]

### 4.2 Additional Features
[Feature 3]
[Feature 4]

---

## 5. User Flows

### Flow 1: [User Journey Name]
[Flow description]

---

## 6. Success Criteria

### Launch Criteria
- [ ] Checklist item 1
- [ ] Checklist item 2

---

## 📄 Related Documents
- [Link ke dokumen terkait](./file.md)

---

*Last Updated: [Date]*  
*Next Review: [Date]*
```

### Gunakan Template

```bash
# Copy template ke file baru
cp templates/PRD_TEMPLATE.md products/13_NEW_PRODUCT_PRD.md

# Edit di VS Code
code products/13_NEW_PRODUCT_PRD.md
```

---

## Maintenance & Update

### Regular Tasks

**Weekly:**
```bash
# Pull latest changes
git pull

# Check for outdated docs
git log --since="2 weeks ago" --oneline
```

**Monthly:**
```bash
# Update last modified dates
# Klik pada setiap file yang diupdate
# Update "Last Updated" header

# Commit updates
git add docs/ products/
git commit -m "docs: Monthly update - refresh documentation"
git push
```

### Updating Existing Document

**Step 1: Edit file**
```bash
# Buka file di VS Code
code docs/02_COMPANY_OVERVIEW.md

# Edit content
# Ubah "Last Updated" date
```

**Step 2: Commit changes**
```bash
git add docs/02_COMPANY_OVERVIEW.md
git commit -m "docs(overview): Update company information"
git push
```

### Branch untuk Major Updates

**Untuk update besar-besaran:**

```bash
# Buat branch baru
git checkout -b feature/major-documentation-update

# Edit multiple files
code docs/
code products/

# Commit changes
git add .
git commit -m "docs: Major update to documentation"

# Push branch
git push -u origin feature/major-documentation-update

# Di GitHub: Buat Pull Request → Review → Merge ke main
```

---

## Collaboration Guidelines

### Workflow untuk Multiple Contributors

**Contributor 1:**
```bash
# Get latest changes
git pull

# Create feature branch
git checkout -b docs/add-api-documentation

# Edit & commit
git add docs/api.md
git commit -m "docs: Add API documentation"

# Push
git push -u origin docs/add-api-documentation

# Create Pull Request di GitHub
```

**Reviewer (Dozer/Owner):**
1. Review PR di GitHub
2. Add comments jika perlu
3. Approve & merge

**Contributor 1 (After Merge):**
```bash
# Switch back to main
git checkout main

# Delete feature branch
git branch -d docs/add-api-documentation

# Pull latest
git pull
```

---

## Tips & Tricks

### 1. Useful VS Code Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K Ctrl+V` | Preview Markdown |
| `Ctrl+Shift+V` | Quick Preview |
| `Ctrl+/` | Comment/Uncomment |
| `Ctrl+F` | Find |
| `Ctrl+H` | Find & Replace |
| `Ctrl+Alt+↑/↓` | Move line |
| `Ctrl+L` | Select line |

### 2. Markdown Formatting Quick Reference

```markdown
# H1 Heading
## H2 Heading
### H3 Heading

**Bold text**
*Italic text*
~~Strikethrough~~

[Link text](url)
![Alt text](image.url)

- Bullet point
1. Numbered item

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |

> Blockquote

```code block```

---
```

### 3. Useful Git Commands

```bash
# Undo changes di file
git checkout docs/file.md

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View file history
git log -p docs/file.md

# Compare versions
git diff docs/file.md

# Stash changes (temporary)
git stash
git stash pop

# Create tag untuk version
git tag v1.0
git push origin v1.0
```

### 4. Auto-Generate Table of Contents

**Gunakan VS Code extension: Markdown All in One**

```bash
# Di file markdown, gunakan:
<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6} -->
```

### 5. Integrate README ke GitHub Profile (Optional)

Kalau ingin showcase wiki di GitHub profile:

```markdown
# 📚 Company Wiki

Explore our comprehensive company documentation:
- [Company Overview](https://github.com/dntech/company-wiki#company-overview)
- [Tech Stack](https://github.com/dntech/company-wiki#tech-stack)
- [Products](https://github.com/dntech/company-wiki#products)
```

---

## Troubleshooting

### Issue: "fatal: not a git repository"

```bash
# Solution: Initialize git
git init
git remote add origin https://github.com/YourUsername/company-wiki.git
```

### Issue: "Permission denied" saat push

```bash
# Solution: Generate SSH key
ssh-keygen -t ed25519 -C "your.email@dntech.id"

# Add ke GitHub (Settings → SSH Keys)
# Ubah remote ke SSH
git remote set-url origin git@github.com:YourUsername/company-wiki.git
```

### Issue: Conflict saat merge

```bash
# View conflicted file
git diff

# Edit file, resolve conflict
# Kemudian:
git add resolved-file.md
git commit -m "resolve: Merge conflict"
```

### Issue: Accidentally deleted file

```bash
# Restore file
git checkout HEAD -- docs/deleted-file.md

# Atau check dari git history
git log -- docs/deleted-file.md
git checkout <commit-hash>^ -- docs/deleted-file.md
```

---

## Checklist Setup Selesai

- [ ] Repository folder dibuat
- [ ] Git initialized (git init)
- [ ] .gitignore dibuat
- [ ] README.md dibuat
- [ ] Folder structure dibuat (docs/, products/, etc)
- [ ] Markdown files ditambahkan
- [ ] Initial commit dilakukan
- [ ] GitHub repository dibuat
- [ ] Local repository terhubung ke GitHub (git remote)
- [ ] Semua file di-push ke GitHub
- [ ] Repository di-verify di GitHub.com
- [ ] Collaborators ditambahkan (optional)
- [ ] GitHub Actions setup (optional, untuk auto-publish)

---

## Next Steps

1. ✅ Follow guide ini step by step
2. ✅ Setup repository di lokal
3. ✅ Publish ke GitHub
4. ✅ Invite team members
5. ✅ Setup CI/CD (optional)
6. ✅ Setup GitHub Pages (optional, untuk public wiki)

---

## Resources & References

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com)
- [Markdown Guide](https://www.markdownguide.org)
- [VS Code Documentation](https://code.visualstudio.com/docs)

---

*Created: July 8, 2026*  
*For: DN Tech Company Wiki Setup*