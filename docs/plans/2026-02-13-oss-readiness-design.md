# OSS Readiness Design

## Summary

Configure the GitHub repository for open source collaboration: repo settings, branch protection, CI workflows, Dependabot, and PR template.

## Decisions

- **Branch protection:** Standard OSS, admins excluded (can push directly)
- **Merge strategy:** Squash merge only
- **PR titles:** Conventional commit format enforced via GHA
- **Dependabot:** Weekly checks for npm and GHA, max 5 open PRs per ecosystem

## Components

### 1. Repository settings (gh CLI)
- Description: "A composable flow engine that simulates real user behavior inside web applications."
- Squash merge only (disable merge commits and rebase merge)
- Delete branches on merge
- Disable wiki

### 2. Branch protection on main
- Require PR with 1 approval
- Require status checks to pass (ci workflow)
- No direct pushes
- No force pushes
- Do NOT enforce for admins

### 3. GitHub Actions

**CI** (`.github/workflows/ci.yml`)
- Triggers: push to main, PRs to main
- Node 20, pnpm
- Steps: checkout, pnpm install, build, test

**PR title lint** (`.github/workflows/pr-title.yml`)
- Triggers: pull_request (opened, edited, synchronize)
- Uses amannn/action-semantic-pull-request
- Enforces conventional commit format

### 4. Dependabot (`.github/dependabot.yml`)
- npm: weekly, max 5 open PRs
- github-actions: weekly, max 5 open PRs
- Target: main

### 5. PR template (`.github/pull_request_template.md`)
- Summary section
- Test plan section
- Checklist (tests pass, no breaking changes)
