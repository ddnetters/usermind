# Usermind

A guidance layer for AI agents navigating web applications.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![Node: >=20](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)

## What is Usermind

Usermind is an MCP server that guides AI agents through structured web application flows. You define user journeys as composable YAML flows with constraints and role context. Your agent already has browser control. Usermind tells it what to do next, enforces guardrails on what it should not do, and captures evidence of everything that happened.

## Key Concepts

| Concept | Description |
|---------|-------------|
| Flow | A composable, YAML-defined user journey through a web application. |
| Fragment | A reusable building block (login, navigation) that can be composed into flows. |
| Actor | A role-aware identity the agent assumes, with permissions and context. |
| Constraint | A guardrail that limits what the agent can do during a flow. |
| Evidence Bundle | Captured artifacts (screenshots, logs, traces) for failure reproduction. |
| Guidance Engine | Tracks flow progress and returns the next action based on page state. |
| MCP Server | The primary interface that exposes Usermind as tools an AI agent calls. |

## How it Works

Define a flow:

```yaml
name: create_message
description: Create a new demo message in the app.

actor:
  role: admin

constraints:
  - do not delete existing messages
  - do not navigate outside the messaging module

steps:
  - action: navigate
    url: "https://app.example.com/messages"

  - action: click
    selector: "#new-message"

  - action: fill
    selector: "input[name=subject]"
    value: "Demo message"

  - action: click
    selector: "#send"

  - action: assert
    selector: ".success-toast"
    text: "Message sent"
```

Then in Claude Code:

```
You: "go create a new demo message in the app"

Claude calls usermind.load_flow("create_message") to get the steps
Claude uses its own browser to navigate, click, and fill
Claude calls usermind.next_step() for guidance along the way
Claude calls usermind.record() to capture evidence
```

See the [examples](./examples/flows/) directory for more flow definitions.

## Project Structure

```
packages/
  core/        # @usermind/core       - flow DSL, guidance engine, evidence, constraints
  mcp-server/  # @usermind/mcp-server - MCP server exposing core as tools
  cli/         # @usermind/cli        - utility: validate flows, inspect evidence
examples/
  flows/       # example flow definitions
docs/          # documentation
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
