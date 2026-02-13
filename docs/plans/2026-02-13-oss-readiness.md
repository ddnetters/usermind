# OSS Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Configure the Usermind GitHub repository for open source collaboration with CI, branch protection, Dependabot, and PR templates.

**Architecture:** GitHub config files in `.github/`, repo settings and branch protection via `gh` CLI. CI uses GitHub Actions with pnpm caching. PR title linting uses the `amannn/action-semantic-pull-request` action.

**Tech Stack:** GitHub Actions, gh CLI, Dependabot

---

### Task 1: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create the CI workflow**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm build

      - run: pnpm test
```

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add CI workflow"
```

---

### Task 2: PR title lint workflow

**Files:**
- Create: `.github/workflows/pr-title.yml`

**Step 1: Create the PR title lint workflow**

```yaml
name: PR Title

on:
  pull_request_target:
    types: [opened, edited, synchronize]

permissions:
  pull-requests: read

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Step 2: Commit**

```bash
git add .github/workflows/pr-title.yml
git commit -m "ci: add PR title lint workflow"
```

---

### Task 3: Dependabot configuration

**Files:**
- Create: `.github/dependabot.yml`

**Step 1: Create the Dependabot config**

```yaml
version: 2

updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
```

**Step 2: Commit**

```bash
git add .github/dependabot.yml
git commit -m "ci: add Dependabot configuration"
```

---

### Task 4: PR template

**Files:**
- Create: `.github/pull_request_template.md`

**Step 1: Create the PR template**

```markdown
## Summary

<!-- What changed and why? -->

## Test plan

<!-- How was this tested? -->

## Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] Build succeeds (`pnpm build`)
- [ ] No breaking changes (or documented in summary)
```

**Step 2: Commit**

```bash
git add .github/pull_request_template.md
git commit -m "docs: add PR template"
```

---

### Task 5: Repository settings via gh CLI

**Step 1: Set repo description and homepage**

```bash
gh repo edit ddnetters/usermind \
  --description "A composable flow engine that simulates real user behavior inside web applications." \
  --enable-wiki=false \
  --delete-branch-on-merge \
  --enable-squash-merge \
  --squash-merge-commit-title PR_TITLE \
  --squash-merge-commit-message PR_BODY \
  --enable-merge-commit=false \
  --enable-rebase-merge=false
```

**Step 2: Verify settings**

```bash
gh repo view ddnetters/usermind --json description,deleteBranchOnMerge,squashMergeAllowed,mergeCommitAllowed,rebaseMergeAllowed,hasWikiEnabled
```

Expected: description set, deleteBranchOnMerge true, squashMergeAllowed true, mergeCommitAllowed false, rebaseMergeAllowed false, hasWikiEnabled false.

---

### Task 6: Branch protection via gh CLI

**Step 1: Push all commits first** (branch protection needs status checks to reference)

```bash
git push origin main
```

**Step 2: Set branch protection rules**

```bash
gh api repos/ddnetters/usermind/branches/main/protection \
  --method PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

**Step 3: Verify branch protection**

```bash
gh api repos/ddnetters/usermind/branches/main/protection --jq '{
  required_status_checks: .required_status_checks.contexts,
  enforce_admins: .enforce_admins.enabled,
  required_reviews: .required_pull_request_reviews.required_approving_review_count,
  allow_force_pushes: .allow_force_pushes.enabled
}'
```

Expected: contexts includes "build", enforce_admins false, required_reviews 1, allow_force_pushes false.
