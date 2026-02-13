# Project Scaffold Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold the Usermind monorepo with root config, two workspace packages (@usermind/core, @usermind/cli), README, and example flow.

**Architecture:** pnpm workspaces monorepo with `packages/core` and `packages/cli`. Shared TypeScript config at root, per-package configs extending it. Vitest for testing.

**Tech Stack:** TypeScript 5.x, pnpm workspaces, Vitest, Node 20+

---

### Task 1: Root workspace configuration

**Files:**
- Modify: `.gitignore`
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `tsconfig.base.json`

**Step 1: Update .gitignore for a TypeScript/Node project**

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Environment
.env
.env.*

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Test & coverage
coverage/

# Internal docs (not published)
internal-doc/
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
```

**Step 3: Create root package.json**

```json
{
  "name": "usermind",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "pnpm -r run lint",
    "clean": "pnpm -r run clean"
  }
}
```

**Step 4: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

**Step 5: Commit**

```bash
git add .gitignore pnpm-workspace.yaml package.json tsconfig.base.json
git commit -m "chore: add root workspace configuration"
```

---

### Task 2: @usermind/core package scaffold

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`

**Step 1: Create packages/core/package.json**

```json
{
  "name": "@usermind/core",
  "version": "0.0.1",
  "description": "Flow engine, runner, and evidence capture for Usermind",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "keywords": ["usermind", "flow-engine", "agent", "testing"],
  "license": "MIT"
}
```

**Step 2: Create packages/core/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

**Step 3: Create packages/core/src/index.ts**

```typescript
export const VERSION = "0.0.1";
```

**Step 4: Write a smoke test**

Create `packages/core/src/__tests__/index.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { VERSION } from "../index.js";

describe("@usermind/core", () => {
  it("exports a version string", () => {
    expect(VERSION).toBe("0.0.1");
  });
});
```

**Step 5: Install dependencies and run test**

```bash
cd /Users/dominique.netters/code/personal/usermind
pnpm install
pnpm --filter @usermind/core test
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/core/
git commit -m "feat: scaffold @usermind/core package"
```

---

### Task 3: @usermind/cli package scaffold

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/src/index.ts`

**Step 1: Create packages/cli/package.json**

```json
{
  "name": "@usermind/cli",
  "version": "0.0.1",
  "description": "CLI for Usermind flow engine",
  "type": "module",
  "bin": {
    "usermind": "dist/index.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@usermind/core": "workspace:*"
  },
  "keywords": ["usermind", "cli"],
  "license": "MIT"
}
```

**Step 2: Create packages/cli/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

**Step 3: Create packages/cli/src/index.ts**

```typescript
#!/usr/bin/env node

import { VERSION } from "@usermind/core";

console.log(`usermind v${VERSION}`);
```

**Step 4: Write a smoke test**

Create `packages/cli/src/__tests__/index.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { VERSION } from "@usermind/core";

describe("@usermind/cli", () => {
  it("can import from @usermind/core", () => {
    expect(VERSION).toBe("0.0.1");
  });
});
```

**Step 5: Install dependencies and run test**

```bash
pnpm install
pnpm --filter @usermind/cli test
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/cli/
git commit -m "feat: scaffold @usermind/cli package"
```

---

### Task 4: Core source directory structure

**Files:**
- Create: `packages/core/src/runner/.gitkeep`
- Create: `packages/core/src/dsl/.gitkeep`
- Create: `packages/core/src/evidence/.gitkeep`
- Create: `packages/core/src/agent/.gitkeep`
- Create: `packages/cli/src/commands/.gitkeep`

**Step 1: Create module directories with .gitkeep placeholders**

```bash
mkdir -p packages/core/src/runner packages/core/src/dsl packages/core/src/evidence packages/core/src/agent packages/cli/src/commands
touch packages/core/src/runner/.gitkeep packages/core/src/dsl/.gitkeep packages/core/src/evidence/.gitkeep packages/core/src/agent/.gitkeep packages/cli/src/commands/.gitkeep
```

**Step 2: Commit**

```bash
git add packages/core/src/runner packages/core/src/dsl packages/core/src/evidence packages/core/src/agent packages/cli/src/commands
git commit -m "chore: add source directory structure"
```

---

### Task 5: Example flow and examples directory

**Files:**
- Create: `examples/flows/hello.yaml`

**Step 1: Create example flow file**

```yaml
name: hello
description: A minimal example flow that navigates to a page and checks the title.

steps:
  - action: navigate
    url: "https://example.com"

  - action: assert
    selector: "h1"
    text: "Example Domain"
```

**Step 2: Commit**

```bash
git add examples/
git commit -m "docs: add example flow"
```

---

### Task 6: README

**Files:**
- Create: `README.md`

**Step 1: Write README.md**

Follow the approved design:
1. Header with project name, one-liner, badges
2. What is Usermind (elevator pitch, differentiators)
3. Key Concepts table
4. Getting Started (install, example flow, run command)
5. Project Structure (packages/core, packages/cli)
6. Development (clone, install, build, test)
7. License

Style: No emojis, no emdashes, no roadmap. Direct technical tone. Reference Playwright/tRPC/Turborepo README patterns.

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

### Task 7: LICENSE

**Files:**
- Create: `LICENSE`

**Step 1: Create MIT license file**

Standard MIT license text with "Usermind Contributors" as copyright holder, year 2026.

**Step 2: Commit**

```bash
git add LICENSE
git commit -m "chore: add MIT license"
```

---

### Task 8: Install dependencies and verify full build

**Step 1: Install all workspace dependencies**

```bash
pnpm install
```

**Step 2: Run full build**

```bash
pnpm build
```

Expected: Both packages compile without errors.

**Step 3: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass.

**Step 4: Commit lockfile**

```bash
git add pnpm-lock.yaml
git commit -m "chore: add lockfile"
```
