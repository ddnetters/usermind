# Usermind

A composable flow engine that simulates real user behavior inside web applications.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![Node: >=20](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)

## What is Usermind

Usermind is a testing framework that drives web applications the way real users do. You define user journeys as composable, YAML-based flows. Within those deterministic flows you can embed bounded AI agent tasks that explore your application intelligently. Each flow runs under a role-aware actor with real user context, permissions, and session state. Every failure produces a full evidence bundle (screenshots, logs, traces) so defects are reproducible from the first report.

## Key Concepts

| Concept | Description |
|---------|-------------|
| Flow | A composable, YAML-defined user journey through a web application. |
| Fragment | A reusable building block (login, navigation) that can be composed into flows. |
| Actor | A role-aware identity that executes a flow with specific permissions and context. |
| Agent Task | A bounded AI exploration step embedded within a deterministic flow. |
| Evidence Bundle | Captured artifacts (screenshots, logs, traces) for failure reproduction. |
| Runner | The execution engine that processes flows step by step. |
| Recorder | A tool for capturing user interactions and converting them into flow definitions. |

## Getting Started

Install the core packages:

```bash
pnpm add @usermind/core @usermind/cli
```

Create a flow file:

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

Run it:

```bash
usermind run hello
```

See the [examples](./examples/flows/) directory for more flow definitions.

## Project Structure

```
packages/
  core/     # @usermind/core - flow engine, runner, DSL, evidence capture
  cli/      # @usermind/cli  - command-line interface
examples/
  flows/    # example flow definitions
docs/       # documentation
```

## Development

```bash
git clone https://github.com/ddnetters/usermind.git
cd usermind
pnpm install
pnpm build
pnpm test
```

## License

[MIT](./LICENSE)
