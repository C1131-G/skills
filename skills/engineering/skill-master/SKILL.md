---
name: skill-master
role: entry
description: >
  Single entry for every agent run. Modes: bare = audit report only;
  :check = audit+fix; :write = implement. Only MAIN skills are user-invokable;
  leaves run only under their parent router. Detect stack, select NEED, rule-by-rule,
  COMPACT after every skill. Always first.
disable-model-invocation: true
---

# skill-master

**Send this skill first on every agent run.** Do not write product code until **mode**, **stack**, and **NEED** are set.

After `npx skills` install, skills sit as **siblings**. Load by skill name or `../<skill-name>/SKILL.md`.

---

## Main vs leaf (hard rule)

| Kind | Role | User may invoke? | How it runs |
|---|---|---|---|
| **Entry** | `skill-master` | Yes | Orchestrates all mains |
| **Router** | `route-*` | Yes | Decision → load **leaves only** |
| **Always** | `enforce-*` | Yes (solo or via master) | Quality/TS on every run when stack matches |
| **Main** | standalone pattern skills | Yes | One skill’s rules only |
| **Leaf** | child of a router | **No** | Only when parent router Decision selects it |

### MAIN catalog (user may invoke)

```
skill-master                          # entry
route-react-async-ui                  # router → transitions | optimistic | suspense
route-tanstack                        # router → query | router | form | table
route-backend                         # router → design-backend | logging | openapi | test
enforce-code-quality                  # always
enforce-typescript-strict             # always (TS)
design-frontend-architecture
audit-react-effects
apply-toasts
apply-native-feel-nav
apply-next-shell-nav
use-zustand
use-nub-vite
convert-nextjs-react
read-research-paper
```

### LEAF catalog (not main — parent only)

| Parent (main) | Leaves (do **not** invoke as main) |
|---|---|
| `route-react-async-ui` | `apply-react-transitions`, `apply-react-optimistic`, `apply-react-suspense` |
| `route-tanstack` | `use-tanstack-query`, `use-tanstack-router`, `use-tanstack-form`, `use-tanstack-table` |
| `route-backend` | `design-backend-architecture`, `apply-structured-logging`, `document-openapi`, `test-backend` |

### Leaf redirect (mandatory)

If the user invokes a **leaf** as if it were main (`use-tanstack-query:write`, `apply-react-suspense:check`, bare leaf name):

1. **Do not** treat the leaf as the run entry.
2. Load the **parent router** with the **same mode** (bare / `:check` / `:write`).
3. Decision-select **only that leaf** (and required pairs).
4. In the ledger, record: `invoked-as: <leaf> → parent: <router>`.

Never list leaves in the user-facing “running skills” report as top-level runs. Report the **main** (router or standalone); mention leaves only under that main.

Example: user says `apply-react-optimistic:write` → run `route-react-async-ui:write` with Decision = optimistic only (+ ALWAYS).

---

## Modes (suffix contract)

Same three modes on **skill-master** and on every **main** skill:

| Invoke | Mode | Edits? | Purpose |
|---|---|---|---|
| `<main>` (no suffix) | **audit** | **No** | Scan rules → **report only** (findings, severity, paths). No product edits. |
| `<main>:check` | **check** | **Yes** | Audit + **fix** so code matches rules (whole scope for master; skill scope for solo main). |
| `<main>:write` | **write** | **Yes** | Implement the task following selected skills (message + change surface). |

Bare is **never** write. Bare is **audit report only**.

### skill-master modes

| Invoke | Behavior |
|---|---|
| `skill-master` | **audit** — DETECT unlocks → NEED all stack-relevant **mains** → scan every rule → **REPORT only** (no fix) |
| `skill-master:check` | **check** — same NEED as audit → scan + **fix** rule-by-rule + gate |
| `skill-master:write` | **write** — NEED from message ∪ change ∩ stack → implement under those mains only |

### Solo main modes

| Invoke | Behavior |
|---|---|
| `route-react-async-ui` | audit Decision-matched leaves → report only |
| `route-react-async-ui:check` | fix under Decision-matched leaves |
| `route-react-async-ui:write` | implement task under Decision-matched leaves (+ ALWAYS if stack matches) |
| `enforce-typescript-strict:check` | only that always skill’s rules, fix |
| `apply-next-shell-nav` | audit that main only → report |

On solo main **write/check/audit**: still load ALWAYS (`enforce-code-quality`, `enforce-typescript-strict` if TS) for write/check; for **audit**, report ALWAYS findings too when stack matches (no fix).

---

## Shared first steps (all modes)

Before loading other skills or editing:

```
1 UNDERSTAND  → repo shape: README, package.json, entry, layout, scripts
2 PACKAGES    → stack from package.json / lockfile / tree (once per conversation)
3 MODE        → audit | check | write   (from suffix; bare = audit)
4 NEED MAINS  → select **main** skills only (routers, not leaves) — write NEED list
5 FILE MAP    → paths in scope
```

Never load a skill for a library the project does **not** use.

### DETECT (packages → allowed main cluster)

Stack **unlocks** mains. It does not select every unlocked main for write.

| Signal | May select (mains) |
|---|---|
| any TS/JS | `enforce-code-quality` |
| TypeScript | `enforce-typescript-strict` |
| React | `route-react-async-ui`, `audit-react-effects` (when effects), `design-frontend-architecture` |
| `@tanstack/react-query` / router / form / table | `route-tanstack` (Decision picks leaves) |
| `zustand` | `use-zustand` |
| Next.js | `apply-next-shell-nav` when shell/sidebar; `convert-nextjs-react` only if conversion task |
| backend (hono/express/fastify/nest/…) | `route-backend` |
| sonner / toast usage | `apply-toasts` |
| view transitions / motion nav | `apply-native-feel-nav` |
| nub / vite+ | `use-nub-vite` |
| research paper task | `read-research-paper` |

### ALWAYS (write + check; report-only in audit)

Before optional mains:

1. `../enforce-code-quality/SKILL.md`
2. `../enforce-typescript-strict/SKILL.md` (skip if pure JS)

In **write**, ALWAYS only on **task-scope** files.

### Connections (interconnect — load pairs when NEED requires)

```
route-react-async-ui
  → leaves: apply-react-transitions | apply-react-optimistic | apply-react-suspense
  → pairs main: apply-native-feel-nav (visual VT only)
  → pairs main: apply-next-shell-nav (Next dashboard shell; Suspense placement)
  → pairs main: audit-react-effects if useEffect appears

route-tanstack
  → leaves: use-tanstack-query | use-tanstack-router | use-tanstack-form | use-tanstack-table
  → pairs main: route-react-async-ui (optimistic / pending UI for mutations)
  → pairs main: audit-react-effects (no useEffect fetch)
  → pairs main: use-zustand (server vs client split)

route-backend
  → leaves: design-backend-architecture | apply-structured-logging | document-openapi | test-backend
  → pairs ALWAYS (enforce-*)
```

NEED lists name **mains** (`route-tanstack`), not leaves. Leaves appear only inside the router’s Decision ledger lines.

---

## NEED MAINS — mode split

### `audit` and `:check` — stack-wide mains

Select every **main** unlocked by DETECT that applies to the project (ALWAYS + matching routers + matching standalones). Goal: full alignment view (audit) or full fix (check).

**Process order:**

1. `enforce-code-quality`
2. `enforce-typescript-strict` (if TS)
3. `design-frontend-architecture` if React FE structure in scope
4. `audit-react-effects` if React
5. Routers from DETECT (`route-react-async-ui`, `route-tanstack`, `route-backend`) — each router Decision-selects its own leaves
6. Remaining mains: `use-zustand`, `apply-toasts`, `apply-native-feel-nav`, `apply-next-shell-nav`, `use-nub-vite`, `convert-nextjs-react`, …

### `:write` — message + change surface ∩ stack

```
candidates = mains hinted by USER MESSAGE
           ∪ mains hinted by CHANGE SURFACE
allowed    = candidates ∩ DETECT unlocks
NEED       = ALWAYS ∪ allowed ∪ pair mains required by Connections
```

Write a one-line NEED of **mains only**:

```text
NEED: enforce-code-quality, enforce-typescript-strict, route-tanstack, route-react-async-ui
SKIP: route-backend (FE-only), use-zustand (not in message/change)
LEAVES (internal): route-tanstack → query; route-react-async-ui → optimistic
```

#### A. USER MESSAGE → main hints

| Message / intent | Select main (if stack allows) |
|---|---|
| fetch, cache, invalidate, mutation, server state, react-query | `route-tanstack` → leaf query |
| route, loader, search params, file route, link | `route-tanstack` → leaf router |
| form, field validation, canSubmit | `route-tanstack` → leaf form |
| table, columns, row model, data grid | `route-tanstack` → leaf table |
| pending click, useTransition, action state | `route-react-async-ui` → leaf transitions |
| optimistic, instant UI, rollback | `route-react-async-ui` → leaf optimistic |
| Suspense, skeleton, streaming, deferred | `route-react-async-ui` → leaf suspense |
| useEffect, “runs twice”, sync external | `audit-react-effects` |
| zustand, client store, slice | `use-zustand` |
| toast, sonner | `apply-toasts` |
| view transition, native feel | `apply-native-feel-nav` |
| sidebar, nested nav, dashboard shell, private cache, partial prefetch | `apply-next-shell-nav` |
| API route, controller, service, OpenAPI, pino, backend test | `route-backend` |
| feature folder, where does this file go (FE) | `design-frontend-architecture` |
| Next ↔ React convert | `convert-nextjs-react` |
| nub, vite+ | `use-nub-vite` |
| research paper | `read-research-paper` |
| leaf name (e.g. use-tanstack-query) | **parent router** + that leaf only |
| no stack keywords | ALWAYS only |

#### B. CHANGE SURFACE → main hints

| Signals in task files | Select main |
|---|---|
| `@tanstack/react-query` / `useMutation` | `route-tanstack` → query |
| `@tanstack/react-router` / `createFileRoute` | `route-tanstack` → router |
| `@tanstack/react-form` | `route-tanstack` → form |
| `@tanstack/react-table` | `route-tanstack` → table |
| `zustand` | `use-zustand` |
| `useEffect` | `audit-react-effects` |
| `useTransition` / `useOptimistic` / `Suspense` | `route-react-async-ui` |
| toast / sonner | `apply-toasts` |
| dashboard sidebar / `"use cache: private"` / partialPrefetching | `apply-next-shell-nav` |
| server routes / OpenAPI / logger / API tests | `route-backend` |

#### C. Re-select when scope expands

```
re-run MESSAGE ∪ CHANGE → NEED
append new mains; COMPACT finished mains before loading new ones
```

#### D. Anti-patterns

- Invoking or reporting a **leaf** as a top-level run
- Loading all DETECT “just in case” on write
- Skipping ALWAYS on TS write/check
- Loading every leaf of a router without Decision match
- Bare mode making edits

#### E. Process order (`:write`)

1. ALWAYS  
2. `design-frontend-architecture` if selected  
3. `audit-react-effects` if selected  
4. Selected **routers** → Decision leaves one at a time → COMPACT per leaf  
5. Other selected **mains** (zustand, toasts, shell-nav, …)

---

## Break the job: main → (leaf) → rule → files → gate|report

```
for main in ordered_need:
  if main is router:
    Decision → selected leaves
    for leaf in selected_leaves:
      apply rules 1..N (mode-dependent)
      COMPACT leaf
  else:
    apply main rules 1..N
  COMPACT main
```

Per rule:

| Mode | Action |
|---|---|
| **audit** | SCAN only → record findings (path, rule, severity). **No edit.** No lint gate required; optional typecheck for evidence. |
| **check** | SCAN → FIX → GATE (lint / tsc / build) |
| **write** | ALIGN neighbors → WRITE → GATE |

**Scope**

| Mode | Scope |
|---|---|
| skill-master audit / check | All relevant project source for each main |
| skill-master write | Task scope (change + feature neighbors) |
| solo main | That main’s domain only (+ ALWAYS on write/check) |

---

## Mode: audit (bare)

**Goal:** report how the codebase stands against skills. **Zero product file edits.**

```
UNDERSTAND → PACKAGES → MODE=audit → NEED mains → FILE MAP
  → for each main (routers expand leaves internally):
       for each rule: SCAN → append findings
       COMPACT
  → AUDIT REPORT (from ledger only)
```

### AUDIT REPORT shape

```text
# Audit report
mode: audit
scope: <paths or "project">
need: <mains>

## Findings
- [main|leaf] rule R: <title> — <path> — severity: high|med|low — detail

## Summary
- mains audited: …
- findings: N (high/med/low)
- recommended next: skill-master:check  or  <main>:check
```

**Done when (audit):** every NEED main scanned; report delivered; no edits.

---

## Mode: `skill-master:check`

**Goal:** existing code **matches** skills. Prefer fix over ignore.

```
UNDERSTAND → PACKAGES → NEED → FILE MAP
  → for each main:
       for each rule: SCAN → FIX → GATE
       COMPACT
  → REPORT from ledger
```

**Done when:** all NEED mains processed; COMPACT after each; gates green or exceptions listed.

---

## Mode: `skill-master:write`

**Goal:** implement the task under NEED mains from message + change surface.

```
UNDERSTAND → PACKAGES → NEED (message ∪ change ∩ stack) → FILE MAP
  → for each main:
       ALIGN → WRITE → GATE → COMPACT
  → re-select if scope grew
  → final GATE + balanced check
```

### Balanced (write)

- [ ] NEED is **mains** from message + change (not all packages)
- [ ] Leaves only under routers; never top-level invoke
- [ ] ALWAYS applied in task scope
- [ ] No skill for absent libraries
- [ ] Final lint / typecheck / build OK (or noted skip)

**Done when:** task complete + balanced + gate green + NEED matches applied mains.

---

## Gate (check + write only)

1. Edit only what the current rule requires  
2. Lint if present  
3. Typecheck if TS  
4. Build / verify if present  
5. Fail → fix here; do not advance  

Audit mode skips gate edits.

---

## COMPACT

Required after each **main** completes (and after each **leaf** under a router).

```text
## skill-ledger
- need: <mains>
- mode: audit|check|write
- skill: <main>                    # never a leaf as top-level skill line
  leaves: <leaf,…> | none          # only if router
  why: message|change|always|pair|stack
  status: pass | pass-with-exceptions | blocked | report-only
  rules: N/N
  findings: N                      # audit
  changed: <paths> | none          # check/write
  exceptions: … | none
  gate: OK | skipped | n/a-audit
```

Drop finished skill bodies and file dumps. Keep NEED + full ledger + open exceptions.

Final user summary builds from the **ledger only**. Top-level lines = **mains**.

---

## Token rule

- Load smallest set for **current** main (router → one leaf).  
- Do not load the full library up front.  
- Disclosed siblings (`core.md`, …) only when that leaf branch is active.  
- COMPACT is mandatory harness hygiene.
