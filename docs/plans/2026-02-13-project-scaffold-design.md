# Project Scaffold Design

## Summary

Set up the Usermind monorepo folder structure, README, and root configuration files. TypeScript + pnpm workspaces, starting with two packages: `@usermind/core` and `@usermind/cli`.

## Decisions

- **Language:** TypeScript (Node)
- **Package manager:** pnpm with workspaces
- **Structure:** Monorepo, flat `packages/` layout
- **Initial packages:** `@usermind/core` (runner, DSL, evidence, agent orchestration) and `@usermind/cli` (commands: run, validate, replay)
- **Style:** No emojis, no emdashes, clean technical tone per brand guide

## Folder Structure

```
usermind/
├── packages/
│   ├── core/                     # @usermind/core
│   │   ├── src/
│   │   │   ├── runner/           # Flow execution engine
│   │   │   ├── dsl/              # YAML flow parser & validator
│   │   │   ├── evidence/         # Evidence bundle capture
│   │   │   ├── agent/            # Agent task orchestration
│   │   │   └── index.ts          # Public API barrel
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── cli/                      # @usermind/cli
│       ├── src/
│       │   ├── commands/         # run, validate, replay commands
│       │   └── index.ts          # CLI entry point
│       ├── package.json
│       └── tsconfig.json
├── docs/                         # Public documentation
│   └── plans/                    # Design docs
├── examples/                     # Example flows & configs
│   └── flows/                    # Sample .yaml flow files
├── internal-doc/                 # (git-ignored) Internal design docs
├── .github/                      # CI workflows, issue templates
├── package.json                  # Root workspace config, dev scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json            # Shared compiler options
├── .gitignore
├── LICENSE
└── README.md
```

## README Sections

1. **Header** - Project name, one-liner, badges (license, CI, npm)
2. **What is Usermind** - 3-4 sentences, elevator pitch, what makes it different
3. **Key Concepts** - Glossary table: Flow, Fragment, Actor, Agent Task, Evidence Bundle, Runner, Recorder
4. **Getting Started** - Install, create a flow YAML, run it with `usermind run`
5. **Project Structure** - Brief map of packages/core and packages/cli
6. **Development** - Clone, install, build, test commands
7. **License** - One line with link

Style reference: Playwright, tRPC, Turborepo READMEs. No emojis, no emdashes, no roadmap.
