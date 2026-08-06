---
name: master
description: Single entry for every task. Detects the project, loads only skills in use, applies rules, loops until balance.
disable-model-invocation: true
---

# Master

**Send this skill on every agent run.** Do not write code until the loop below has selected skills and you are applying them.

## Balance loop

Repeat until **balanced** (definition below). Never load a skill whose stack is absent from the project.

```
1 DETECT   → stack from package.json / lockfile / tree (once per conversation)
2 ALWAYS   → load always-on skills
3 ROUTE    → load only skills whose triggers match this task + stack
4 APPLY    → write/review under those rules only
5 CHECK    → any open violation or missing rule for touched code?
           → YES: go to 3 with the gap closed
           → NO: balanced — stop
```

### Balanced means

- [ ] Always-on skills applied to every file touched
- [ ] Every stack-matched skill that the task touches was loaded and applied
- [ ] No skill loaded for a library the project does not use
- [ ] No open rule violation left in the change without a stated exception

### DETECT (once)

From `package.json` (and tree if needed), note only what exists:

| Signal | Skill cluster |
|---|---|
| TypeScript | always-on typing |
| React | `react-async-ui` family when UI mutates/loads |
| `@tanstack/react-query` | `tanstack` → query |
| `@tanstack/react-router` | `tanstack` → router |
| `@tanstack/react-form` | `tanstack` → form |
| `@tanstack/react-table` | `tanstack` → table |
| `zustand` | `zustand-state` |
| Next.js | Next paths inside skills that mention it |
| backend framework (hono/express/fastify/nest) | `backend` router |
| vitest (backend tests) | `backend-testing` |
| nub / vite+ | `nub-vite-plus` |
| research paper task | `research-paper-reading` |

If the library is **not** in the project → **do not load** that skill.

### ALWAYS (every task)

Read and apply, in order:

1. `skills/engineering/code-quality/SKILL.md`
2. `skills/engineering/typescript-strict-typing/SKILL.md` (skip if pure JS)

### ROUTE (task + stack)

Load **routers first** when a whole area is involved; they point at leaf skills. Skip leaves the router does not select.

| Trigger | Load |
|---|---|
| Interactive / mutating UI, loading UI, Suspense | `skills/engineering/react-async-ui/SKILL.md` |
| Any `useEffect` (write or review) | `skills/engineering/react-effect-audit/SKILL.md` |
| Any TanStack package in stack + task touches it | `skills/engineering/tanstack/SKILL.md` |
| Backend / API work | `skills/engineering/backend/SKILL.md` |
| Frontend folder structure | `skills/engineering/frontend-architecture/SKILL.md` |
| Zustand client state | `skills/engineering/zustand-state/SKILL.md` |
| Toasts | `skills/engineering/toast-notifications/SKILL.md` |
| Native-feel nav / View Transitions | `skills/engineering/native-feel-navigation/SKILL.md` |
| Next.js ↔ React conversion | `skills/engineering/nextjs-react-conversion/SKILL.md` |
| Nub / Vite+ | `skills/engineering/nub-vite-plus/SKILL.md` |
| Research paper | `skills/productivity/research-paper-reading/SKILL.md` |

### Connections (do not double-load; do not skip)

```
react-async-ui
  → react-transitions | react-optimistic | react-suspense
  → pairs native-feel-navigation (visual VT only)
  → pairs react-effect-audit if useEffect appears

tanstack
  → tanstack-query | tanstack-router | tanstack-form | tanstack-table
  → query pairs react-async-ui (optimistic path)
  → router pairs react-effect-audit (no useEffect fetch)
  → query pairs zustand-state (server vs client split)

backend
  → backend-architecture | structured-logging | openapi-documentation | backend-testing
```

### APPLY

- Follow each selected skill's rules while writing or reviewing.
- Prefer **one vertical slice** of work; re-run CHECK after the slice.
- Minimal diffs (`code-quality`).

### CHECK → loop

Before finishing, scan the change for gaps (wrong stack skill missing, always-on broken, effect that should die, optimistic without transition, etc.). If anything fails → ROUTE the missing skill → APPLY → CHECK again.

**Done only when balanced.**

## Token rule

Load the **smallest set** of `SKILL.md` files that covers the task. Open disclosed siblings (`*.md` next to a skill) only when that branch is active. Never load the full library of skills up front.
