# Contributing Guidelines
## DN Tech Company Wiki

Panduan untuk berkontribusi dan menambah dokumentasi ke company wiki.

---

## 📋 Sebelum Mulai

### Pastikan Sudah Memiliki:
- ✅ Git installed
- ✅ VS Code installed
- ✅ Akses ke repository
- ✅ GitHub account

### Recommended Setup:
```bash
# Baca SETUP_GUIDE.md terlebih dahulu
# Install recommended extensions di VS Code
# Verify git configuration
git config --list
```

---

## 🚀 Workflow Berkontribusi

### Step 1: Update Local Repository

```bash
# Navigate ke project folder
cd company-wiki

# Get latest changes
git pull origin main

# Verify current branch
git status
```

### Step 2: Create Feature Branch

```bash
# Create dan switch ke branch baru
git checkout -b docs/[type]/[description]

# Contoh:
git checkout -b docs/add/database-migration-guide
git checkout -b docs/update/tech-stack-refresh
git checkout -b docs/fix/typo-in-architecture
```

### Step 3: Edit Dokumentasi

**Buka file di VS Code:**
```bash
code .
```

**Edit dengan Markdown Preview:**
- Ctrl+Shift+V untuk preview
- Edit di kanan, lihat hasil di kiri

**Pastikan:**
- [ ] Update "Last Updated" date
- [ ] Check semua links valid
- [ ] Verify formatting dengan preview
- [ ] Spell-check
- [ ] Consistent dengan style guide

### Step 4: Commit Changes

```bash
# Cek perubahan
git status
git diff

# Stage changes
git add .

# Commit dengan pesan yang jelas
git commit -m "docs(section): Description of changes

- Detailed point 1
- Detailed point 2

Fixes #123 (kalau ada issue)"
```

### Step 5: Push & Create Pull Request

```bash
# Push branch ke GitHub
git push -u origin docs/add/database-migration-guide
```

**Di GitHub:**
1. Buka repository
2. Lihat "Compare & pull request" button
3. Isi PR description
4. Request reviewer
5. Submit PR

### Step 6: Address Feedback

```bash
# Make requested changes
# Edit files...

# Commit changes
git add .
git commit -m "docs: Address review feedback"

# Push (auto-update PR)
git push
```

### Step 7: Merge PR

Setelah approval, PR di-merge ke `main`.

```bash
# Di lokal, update main branch
git checkout main
git pull origin main

# Delete local feature branch
git branch -d docs/add/database-migration-guide

# Delete remote feature branch
git push origin --delete docs/add/database-migration-guide
```

---

## 📝 Commit Message Format

### Template

```
[TYPE]([SCOPE]): [SUBJECT]

[BODY]

[FOOTER]
```

### Types

| Type | Deskripsi | Contoh |
|------|-----------|--------|
| `docs` | Documentation changes | `docs(tech-stack): Add Redis info` |
| `feat` | New feature/document | `feat(products): Add new product PRD` |
| `update` | Update existing docs | `update(guidelines): Refresh coding standards` |
| `fix` | Fix errors/typos | `fix(org): Correct department name` |
| `refactor` | Reorganize content | `refactor(docs): Restructure folder layout` |
| `ci` | CI/CD changes | `ci: Add GitHub Actions workflow` |

### Scope

Section yang diubah:
- tech-stack
- architecture
- guidelines
- products
- organization
- careers
- etc.

### Subject

- Gunakan imperative mood ("Add" bukan "Added")
- Jangan capitalize huruf pertama
- Jangan tambahkan period di akhir
- Maksimal 50 characters

### Contoh Commit

```bash
git commit -m "docs(tech-stack): Add PostgreSQL configuration details

- Added connection pooling configuration
- Added backup strategy
- Added performance tuning guidelines

Closes #45"
```

---

## 🎨 Style Guide

### Markdown Formatting

**Headings:**
```markdown
# H1 - Document Title (1 per file)
## H2 - Main Section
### H3 - Subsection
#### H4 - Minor heading
```

**Text Formatting:**
```markdown
**Bold** untuk important keywords
*Italic* untuk emphasis
~~Strikethrough~~ untuk deprecated items
`Code` untuk inline code
```

**Lists:**
```markdown
### Unordered List
- Item 1
- Item 2
  - Nested item
  
### Ordered List
1. First step
2. Second step
   1. Substep
```

**Blockquotes:**
```markdown
> Important note or quote
> Continue quote here
```

**Code Blocks:**
~~~markdown
```language
code here
```

```typescript
interface User {
  id: string;
  name: string;
}
```
~~~

**Links:**
```markdown
[Link text](../path/to/file.md)
[External link](https://example.com)
```

**Images:**
```markdown
![Alt text](../images/screenshot.png)
```

**Tables:**
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

### Document Structure

```markdown
# [Title]

**Document Version**: 1.0
**Last Updated**: July 8, 2026
**Status**: Draft/Published
**Owner**: [Role/Person]

---

## 📋 Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)

---

## Section 1

### Subsection 1.1

Content here...

---

## Section 2

Content here...

---

## 📄 Related Documents

- [Related Doc 1](./file1.md)
- [Related Doc 2](./file2.md)

---

*Last Updated: [Date]*
```

### Naming Conventions

**Files:**
- Gunakan `UPPER_CASE` untuk standar docs
- Gunakan `kebab-case` untuk file lain
- Contoh: `02_COMPANY_OVERVIEW.md`, `setup-guide.md`

**Folders:**
- Gunakan `lowercase`
- Contoh: `docs/`, `products/`, `templates/`

**Sections:**
- Gunakan descriptive names
- Contoh: "Getting Started", "Prerequisites", "Troubleshooting"

---

## 🔍 Review Checklist

Sebelum submit PR, pastikan:

- [ ] Content accurate & complete
- [ ] Markdown formatting valid
- [ ] No broken links
- [ ] "Last Updated" date correct
- [ ] Spelling & grammar checked
- [ ] Consistent dengan style guide
- [ ] Related documents linked
- [ ] No sensitive information
- [ ] Screenshots/diagrams have alt text
- [ ] Version bumped (kalau major change)

---

## 📚 Document Types & Templates

### 1. Product Requirements Document (PRD)

**Location:** `products/[NN]_[PRODUCT_NAME]_PRD.md`

**Sections:**
- Executive Summary
- Problem Statement
- Target Audience
- Key Features
- User Flows
- Requirements
- Design & UX
- Technical Stack
- Success Criteria
- Timeline & Milestones
- Resources

### 2. System Design Document (SDD)

**Location:** `products/[NN]_[PRODUCT_NAME]_SPEC.md`

**Sections:**
- Architecture Overview
- Frontend Architecture
- Backend Architecture
- Database Design
- API Specification
- Security
- Testing Strategy
- Deployment
- Performance Requirements

### 3. Process Documentation

**Location:** `docs/[NN]_[PROCESS_NAME].md`

**Sections:**
- Overview
- Prerequisites
- Step-by-step Instructions
- Examples
- Troubleshooting
- Related Documents

### 4. Technical Guidelines

**Location:** `docs/[NN]_[GUIDELINE_NAME].md`

**Sections:**
- Principles
- Standards
- Code Examples
- Best Practices
- Common Pitfalls
- Resources

---

## 🚨 Things to Avoid

### ❌ Don't

```markdown
# ❌ Wrong

- Hardcode sensitive information (passwords, API keys, etc.)
- Use personal opinions without evidence
- Add large uncompressed images
- Create overly long documents (>2000 lines)
- Mix different markdown styles
- Forget to update links after moving files
- Commit without meaningful message
- Force push to main branch
- Add compiled files or artifacts
- Use outdated information without updates
```

### ✅ Do

```markdown
# ✅ Correct

- Use placeholders: `<YOUR_API_KEY>`
- Back up claims with references
- Optimize images before adding
- Break into multiple focused documents
- Follow consistent style
- Use relative paths for links
- Write descriptive commit messages
- Always use pull requests
- Add only source files
- Keep Last Updated date current
```

---

## 🔄 Review Process

### What Reviewers Look For

**Content Accuracy:**
- Is information correct?
- Are examples valid?
- Are links working?

**Completeness:**
- Are all sections filled?
- Is context sufficient?
- Are related docs linked?

**Consistency:**
- Follow style guide?
- Match formatting?
- Use consistent terminology?

**Quality:**
- Is writing clear?
- Any typos/grammar errors?
- Is structure logical?

### Questions to Ask Yourself

1. Is this information useful for the team?
2. Is this documented clearly?
3. Will someone understand this 6 months from now?
4. Are there any broken links?
5. Is the language appropriate for the audience?

---

## 💡 Tips for Good Documentation

### 1. Know Your Audience
- Write for non-experts
- Explain jargon
- Provide context

### 2. Be Clear & Concise
- Short paragraphs
- Active voice
- Remove unnecessary words

### 3. Use Examples
- Code examples
- Real scenarios
- Case studies

### 4. Structure for Scannability
- Clear headings
- Bullet points
- Bold important terms

### 5. Keep Updated
- Regular reviews
- Update dates
- Note deprecations

### 6. Add Context
- Links to related docs
- Prerequisites section
- Next steps

---

## 📞 Questions?

### Getting Help

1. **GitHub Issues** - Ask questions via issue
2. **Email** - docs@dntech.id
3. **Slack** - #documentation channel
4. **PR Comments** - Ask reviewer directly

### Escalation

1. First: Ask in comments/issues
2. Second: Ping reviewer
3. Third: Contact documentation owner
4. Fourth: Reach out to VP Product / CTO

---

## Common Mistakes & Solutions

### Mistake 1: Broken Internal Links

```markdown
# ❌ Wrong
[Link](./relative/path/file.md)

# ✅ Correct
[Link](../docs/relative/path/file.md)
```

**Solution:**
- Use relative paths
- Test links before commit
- Use VS Code Link checker extension

### Mistake 2: Inconsistent Formatting

```markdown
# ❌ Wrong (Mixed styles)
**Bold and *italic* text together**

# ✅ Correct
**Bold text** and *italic text*
```

**Solution:**
- Follow style guide strictly
- Preview markdown
- Check similar documents

### Mistake 3: Missing Context

```markdown
# ❌ Wrong
Configure database with settings

# ✅ Correct
Configure PostgreSQL database:
1. Install PostgreSQL 12+
2. Create database named `dntech`
3. Set connection pool to 20
```

**Solution:**
- Provide step-by-step instructions
- Add examples
- Link to detailed docs

### Mistake 4: Outdated Information

```markdown
# ❌ Wrong
Last Updated: January 2026
(But it's July 2026!)

# ✅ Correct
Last Updated: July 8, 2026
(Update every time you modify)
```

**Solution:**
- Always update date
- Review old docs quarterly
- Mark deprecated sections

---

## 🎓 Learning Resources

### Markdown
- [Markdown Guide](https://www.markdownguide.org)
- [GitHub Markdown](https://guides.github.com/features/mastering-markdown)

### Git & GitHub
- [Git Handbook](https://guides.github.com/introduction/git-handbook)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow)

### Writing
- [Google Developer Style Guide](https://developers.google.com/style)
- [Microsoft Style Guide](https://docs.microsoft.com/en-us/style-guide/welcome)

### Tools
- [Markdown Lint](https://github.com/igorshubovych/markdownlint)
- [Grammarly](https://www.grammarly.com)

---

## 📋 Submission Checklist

Before submitting PR:

- [ ] Branch created from latest main
- [ ] Content reviewed for accuracy
- [ ] Markdown valid & previewed
- [ ] Links verified working
- [ ] Spell-checked
- [ ] Style guide followed
- [ ] Last Updated date set
- [ ] Related docs linked
- [ ] Commit message clear
- [ ] PR description filled
- [ ] No merge conflicts
- [ ] Ready for review

---

*Last Updated: July 8, 2026*  
*For: DN Tech Company Wiki Contributors*