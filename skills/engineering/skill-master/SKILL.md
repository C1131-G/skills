---
name: skill-master
description: >
  Single entry for every agent run. Detects project stack, loads only skills in use,
  applies rules, balance-loops until done. Always send this skill first.
disable-model-invocation: true
---

# skill-master

**Send this skill on every agent run.** Do not write code until the loop below has selected skills and you are applying them.

After `npx skills` install, skills sit as **siblings** under your agent skills dir. Load by skill name or `../<skill-name>/SKILL.md`.

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
| React | `route-react-async-ui` family when UI mutates/loads |
| `@tanstack/react-query` | `route-tanstack` → `use-tanstack-query` |
| `@tanstack/react-router` | `route-tanstack` → `use-tanstack-router` |
| `@tanstack/react-form` | `route-tanstack` → `use-tanstack-form` |
| `@tanstack/react-table` | `route-tanstack` → `use-tanstack-table` |
| `zustand` | `use-zustand` |
| Next.js | Next paths inside skills that mention it |
| backend framework (hono/express/fastify/nest) | `route-backend` |
| vitest (backend tests) | `test-backend` |
| nub / vite+ | `use-nub-vite` |
| research paper task | `read-research-paper` |

If the library is **not** in the project → **do not load** that skill.

### ALWAYS (every task)

Read and apply, in order:

1. `../enforce-code-quality/SKILL.md`
2. `../enforce-typescript-strict/SKILL.md` (skip if pure JS)

### ROUTE (task + stack)

Load **routers first** when a whole area is involved; they point at leaf skills. Skip leaves the router does not select.

| Trigger | Load |
|---|---|
| Interactive / mutating UI, loading UI, Suspense | `../route-react-async-ui/SKILL.md` |
| Any `useEffect` (write or review) | `../audit-react-effects/SKILL.md` |
| Any TanStack package in stack + task touches it | `../route-tanstack/SKILL.md` |
| Backend / API work | `../route-backend/SKILL.md` |
| Frontend folder structure | `../design-frontend-architecture/SKILL.md` |
| Zustand client state | `../use-zustand/SKILL.md` |
| Toasts | `../apply-toasts/SKILL.md` |
| Native-feel nav / View Transitions | `../apply-native-feel-nav/SKILL.md` |
| Next.js ↔ React conversion | `../convert-nextjs-react/SKILL.md` |
| Nub / Vite+ | `../use-nub-vite/SKILL.md` |
| Research paper | `../read-research-paper/SKILL.md` |

### Connections (do not double-load; do not skip)

```
route-react-async-ui
  → apply-react-transitions | apply-react-optimistic | apply-react-suspense
  → pairs apply-native-feel-nav (visual VT only)
  → pairs audit-react-effects if useEffect appears

route-tanstack
  → use-tanstack-query | use-tanstack-router | use-tanstack-form | use-tanstack-table
  → query pairs route-react-async-ui (optimistic path)
  → router pairs audit-react-effects (no useEffect fetch)
  → query pairs use-zustand (server vs client split)

route-backend
  → design-backend-architecture | apply-structured-logging | document-openapi | test-backend
```

### APPLY

- Follow each selected skill's rules while writing or reviewing.
- Prefer **one vertical slice** of work; re-run CHECK after the slice.
- Minimal diffs (`enforce-code-quality`).

### CHECK → loop

Before finishing, scan the change for gaps (wrong stack skill missing, always-on broken, effect that should die, optimistic without transition, etc.). If anything fails → ROUTE the missing skill → APPLY → CHECK again.

**Done only when balanced.**

## Token rule

Load the **smallest set** of `SKILL.md` files that covers the task. Open disclosed siblings (`*.md` next to a skill) only when that branch is active. Never load the full library of skills up front.
