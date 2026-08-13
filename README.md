# Cibi Skills

Personal agent skills from **my own knowledge and daily work** — focused, composable patterns I use when building and reviewing software.

## Disclaimer

> **This is personal knowledge and practice — not official documentation, a product, or professional advice.**

- Treat every skill as opinionated guidance, not absolute truth.
- Verify recommendations against current library documentation, team standards, and project constraints.
- You own the result produced with these skills.

If something is wrong, unclear, or outdated, open a [GitHub Issue](https://github.com/C1131-G/skills/issues) or PR.

## Install

Requires [Node.js](https://nodejs.org/).

### Install all skills

[![Install all skills](https://skills.sh/b/C1131-G/skills)](https://skills.sh/C1131-G/skills)

Click the badge to open the package on skills.sh, or run one command to install every skill for all detected agents without prompts:

```bash
npx skills@latest add C1131-G/skills --all
```

### Choose skills or agents

Use the interactive installer or select the skills and agents yourself:

```bash
npx skills@latest add C1131-G/skills
npx skills@latest add C1131-G/skills --skill '*' -a claude-code -a cursor -a grok -y
npx skills@latest add C1131-G/skills --skill '*' -g -y
npx skills@latest add C1131-G/skills --list
npx skills update
```

## Invocation model

Every skill is independently invokable. There is no master skill, router, leaf role, or suffix-based audit/check/write protocol.

Invoke the exact skill whose expertise you need and state the action in normal language:

```text
Use apply-react-suspense to review the loading boundaries.
Use use-tanstack-query to fix the mutation cache behavior.
Use design-backend-architecture and test-backend to implement this endpoint with tests.
```

Skills remain interconnected through explicit related-skill guidance. Use multiple named skills when a task crosses boundaries; no hidden orchestrator expands the request.

### Verification after code changes

Every engineering skill links to `enforce-code-quality`. When a skill writes or changes application code, it must:

1. Add or update relevant tests when the project has test infrastructure.
2. Run focused tests during implementation.
3. Run the affected app's full available tests, type checking, linting, and production build before finishing.
4. Diagnose and fix failures caused by or within the requested change, then rerun until green.
5. Report unrelated pre-existing failures or unavailable external dependencies precisely instead of claiming success.

Review-only requests remain read-only.

### What is testable

| Skill group | Expected verification after writing code |
|---|---|
| React async/state: `apply-react-*`, `audit-react-effects`, `use-zustand` | Unit or component tests for state transitions, pending states, rollback, errors, and regression behavior |
| TanStack: `use-tanstack-*` | Unit/component tests plus loader, cache, form, table, or route integration tests as applicable |
| Backend: `design-backend-architecture`, `apply-structured-logging`, `document-openapi`, `test-backend` | Service unit tests, HTTP/repository integration tests, captured-log assertions, contract tests, and OpenAPI validation as applicable |
| App structure and conversion: `apply-next-shell-nav`, `design-frontend-architecture`, `convert-nextjs-react` | Route/integration tests for changed behavior plus typecheck, lint, and production build |
| Visual interaction: `apply-native-feel-nav`, `apply-toasts` | Automated component/E2E checks where practical, plus manual reduced-motion, accessibility, gesture, and real-device/browser verification |
| Cross-cutting: `enforce-code-quality`, `enforce-typescript-strict` | Run the existing suite, typecheck, lint, and build; add a regression test whenever behavior changes |
| Productivity: `read-research-paper` | No application tests; verify citations, notes, and conclusions against the paper |

Documentation-only or review-only changes do not require invented application tests. Run the checks that can actually validate the changed artifact.

## Interconnections

| Concern | Primary skill | Common companions |
|---|---|---|
| Async React actions | `apply-react-transitions` | `apply-react-optimistic`, `apply-react-suspense` |
| Optimistic server mutations | `apply-react-optimistic` | `use-tanstack-query`, `apply-toasts` |
| Async render boundaries | `apply-react-suspense` | `use-tanstack-query`, `apply-next-shell-nav` |
| TanStack server state | `use-tanstack-query` | `use-tanstack-router`, `use-tanstack-form`, `use-zustand` |
| TanStack routing | `use-tanstack-router` | `use-tanstack-query`, `audit-react-effects` |
| TanStack forms | `use-tanstack-form` | `use-tanstack-query`, `apply-react-transitions` |
| Server-driven tables | `use-tanstack-table` | `use-tanstack-query` |
| Backend structure | `design-backend-architecture` | `apply-structured-logging`, `document-openapi`, `test-backend` |
| Frontend structure | `design-frontend-architecture` | router and state skills used by the project |
| Navigation structure and motion | `apply-next-shell-nav` | `apply-native-feel-nav`, `apply-react-suspense` |
| Cross-cutting code rules | `enforce-code-quality` | `enforce-typescript-strict` for TypeScript |

## Skill index

### React and frontend

- `apply-react-transitions` — pending actions and non-blocking updates
- `apply-react-optimistic` — instant mutation feedback and rollback
- `apply-react-suspense` — async boundaries and stale-content retention
- `audit-react-effects` — external synchronization only
- `apply-toasts` — accessible notifications
- `apply-native-feel-nav` — navigation motion and gestures
- `apply-next-shell-nav` — persistent Next.js application shells
- `design-frontend-architecture` — feature-based React structure
- `convert-nextjs-react` — Next.js and plain React conversion
- `use-zustand` — client-only state

### TanStack

- `use-tanstack-query` — server state and mutations
- `use-tanstack-router` — typed file routing and loaders
- `use-tanstack-form` — type-safe forms and validation
- `use-tanstack-table` — headless typed tables

### Backend

- `design-backend-architecture` — feature modules and request flow
- `apply-structured-logging` — structured events and request context
- `document-openapi` — OpenAPI 3.1 from code
- `test-backend` — backend test pyramid and isolation

### Cross-cutting and productivity

- `enforce-code-quality` — maintainable, proportional code changes
- `enforce-typescript-strict` — strict TypeScript and boundary validation
- `read-research-paper` — three-pass paper reading

## Layout

```text
skills/
  engineering/
    <independently invokable skill>/
      SKILL.md
  productivity/
    <independently invokable skill>/
      SKILL.md
```
