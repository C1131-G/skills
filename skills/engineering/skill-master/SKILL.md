---
name: skill-master
description: >
  Single entry for every agent run. Invoke as skill-master:check (audit/align
  whole project to skills) or skill-master:write (implement following skills
  selected from the user message and change surface). Detect stack, select only
  matching skills, break work rule-by-rule, COMPACT after every skill. Always first.
disable-model-invocation: true
---

# skill-master

**Send this skill first on every agent run.** Do not write product code until mode, stack, and **NEED SKILLS** are set.

After `npx skills` install, skills sit as **siblings**. Load by skill name or `../<skill-name>/SKILL.md`.

## Invoke with suffix (required)

Pick **one** mode when you invoke. Suffix is the contract:

| Invoke | Mode | Purpose |
|---|---|---|
| `skill-master:check` | **check** | Audit + fix so **existing / old project code** matches skills |
| `skill-master:write` | **write** | Implement a task; **select skills from message + changes**, then follow them |
| `skill-master` only (no suffix) | treat as **write** | Same as `:write` |

Same suffixes work on a **single skill** when you only want that skill:

| Invoke | Meaning |
|---|---|
| `<skill>:check` | Run that skill’s rules only (still rule-by-rule + gate) |
| `<skill>:write` | Write code under that skill’s rules only (still ALWAYS if stack matches) |

Examples: `enforce-typescript-strict:check`, `use-tanstack-query:write`, `audit-react-effects:check`.

**`:write` rule:** if the invoke is bare `skill-master:write` (or `skill-master`), you **must** select which leaf/router skills apply from the **user message** and the **files you will touch**. Do not load the whole library “because the package is installed.”

---

## Shared first steps (both modes)

Always do this **before** loading leaf skills or editing:

```
1 UNDERSTAND  → read repo shape: README, package.json, app entry, src/ layout, scripts
2 PACKAGES    → list stack from package.json / lockfile / tree (once per conversation)
3 NEED SKILLS → select skills (mode-specific — see below). Write a short NEED list before loading any leaf
4 FILE MAP    → paths in scope (write: task files; check: skill-relevant project dirs) — not node_modules
```

Never load a skill for a library the project does **not** use.

### DETECT (packages → allowed skill cluster)

Stack only **unlocks** skills. It does **not** mean every unlocked skill is selected.

| Signal (in project) | May select |
|---|---|
| TypeScript | `enforce-typescript-strict` |
| any TS/JS project | `enforce-code-quality` |
| React | `route-react-async-ui` leaves, `audit-react-effects` when effects appear |
| `@tanstack/react-query` | `use-tanstack-query` (via `route-tanstack`) |
| `@tanstack/react-router` | `use-tanstack-router` |
| `@tanstack/react-form` | `use-tanstack-form` |
| `@tanstack/react-table` | `use-tanstack-table` |
| `zustand` | `use-zustand` |
| Next.js | Next paths inside selected skills; `convert-nextjs-react` only if conversion task |
| backend (hono/express/fastify/nest/…) | `route-backend` leaves |
| vitest (+ backend tests in scope) | `test-backend` |
| nub / vite+ in use | `use-nub-vite` |
| research paper task | `read-research-paper` |

### ALWAYS (when stack matches — both modes)

Process **before** optional routers/leaves:

1. `../enforce-code-quality/SKILL.md`
2. `../enforce-typescript-strict/SKILL.md` (skip if pure JS)

In **`:write`**, ALWAYS only on **task-scope** files (not whole repo).

### Connections (do not double-load; do not skip when pair is in NEED)

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

---

## NEED SKILLS — mode split

### `:check` — stack-wide selection

Select every skill whose **stack signal is present** and that applies to the project (ALWAYS + all matching ROUTE clusters). Goal: whole codebase alignment.

**Process order (`:check`):**

1. `enforce-code-quality`
2. `enforce-typescript-strict` (if TS)
3. `design-frontend-architecture` / `design-backend-architecture` (if in need-list)
4. `audit-react-effects` (if React)
5. Router families and leaves from DETECT (TanStack, React async UI, Zustand, backend leaves, …)
6. Remaining matched leaves (toasts, native-feel, nub, convert, …)

### `:write` — select from **message** + **change surface** (+ stack gate)

**Required.** Before any product edit, build NEED SKILLS with this formula:

```
candidates = skills hinted by USER MESSAGE
           ∪ skills hinted by CHANGE SURFACE (paths, imports, symbols you will touch)
allowed    = candidates ∩ DETECT unlocks (package/stack present)
NEED       = ALWAYS (stack-matched) ∪ allowed ∪ pair skills required by Connections
```

**Write a one-line NEED list** (names only) and keep it for the run / ledger. Example:

```text
NEED: enforce-code-quality, enforce-typescript-strict, use-tanstack-query, apply-react-optimistic
SKIP: use-tanstack-table (no table work), route-backend (FE-only task), use-zustand (not in message/change)
```

Do **not** select a skill only because its package is installed. Package must be present **and** the message or change surface must call for it (except ALWAYS).

#### A. USER MESSAGE → skill hints

Read the full user request (and any follow-ups that redefine scope). Map intent → skills:

| Message / intent signals (examples) | Select (if stack allows) |
|---|---|
| fetch, cache, invalidate, mutation, server state, react-query, query key | `route-tanstack` → `use-tanstack-query` |
| route, loader, search params, file route, link, navigate | `route-tanstack` → `use-tanstack-router` |
| form, field validation, canSubmit, Standard Schema | `route-tanstack` → `use-tanstack-form` |
| table, columns, row model, sorting/pagination (data grid) | `route-tanstack` → `use-tanstack-table` |
| pending click, useTransition, action state, double-submit | `route-react-async-ui` → `apply-react-transitions` |
| optimistic, instant UI, rollback | `route-react-async-ui` → `apply-react-optimistic` (+ query if server) |
| Suspense, skeleton, streaming, deferred value, loading UI | `route-react-async-ui` → `apply-react-suspense` |
| useEffect, effect cleanup, “runs twice”, sync external | `audit-react-effects` |
| zustand, client store, slice, global UI state | `use-zustand` |
| toast, sonner, snackbar notification | `apply-toasts` |
| view transition, native feel, shared element nav | `apply-native-feel-nav` |
| API route, controller, service, repository, OpenAPI, pino, backend test | `route-backend` → matching leaves only |
| folder structure, feature folder, where does this file go | `design-frontend-architecture` and/or `design-backend-architecture` |
| Next ↔ React, migrate off Next, port component | `convert-nextjs-react` |
| nub, vite+, toolchain install | `use-nub-vite` |
| research paper, three-pass reading | `read-research-paper` |
| “just add a button / copy tweak” with no stack keywords | **ALWAYS only** (unless change surface pulls more) |

If the user **names a skill** or uses a single-skill invoke (`use-tanstack-query:write`), that skill is in NEED (plus ALWAYS).

#### B. CHANGE SURFACE → skill hints

Before coding, identify **task paths**: files user named, open diffs, feature folder, or the natural place for the feature. Scan those files (and close neighbors) for:

| Change-surface signals | Select (if stack allows) |
|---|---|
| imports / usage of `@tanstack/react-query`, `useQuery`, `useMutation` | `use-tanstack-query` |
| `@tanstack/react-router`, `createFileRoute`, loaders | `use-tanstack-router` |
| `@tanstack/react-form`, form API | `use-tanstack-form` |
| `@tanstack/react-table` | `use-tanstack-table` |
| `zustand` / store hooks | `use-zustand` |
| `useEffect` in files you will edit | `audit-react-effects` |
| `useTransition` / `useOptimistic` / `Suspense` / mutations in UI | matching `apply-react-*` |
| toast / sonner | `apply-toasts` |
| server routes, OpenAPI, logger, `*.test.ts` on API | matching `route-backend` leaves |
| only CSS/copy in a presentational component | ALWAYS only |

**Union** message hints and change-surface hints, then **intersect** with DETECT.

#### C. Re-select when scope expands

If mid-task you open new files, add a library, or the user adds requirements:

```
re-run MESSAGE ∪ CHANGE → NEED
append any new skills; do not drop skills already applied without reason
COMPACT finished skills before loading newly added ones
```

#### D. Anti-patterns (`:write` selection)

- Loading all DETECT skills “just in case”
- Skipping ALWAYS on a TS task
- Selecting `use-tanstack-table` because Query is installed but the task is a form
- Ignoring the user message and only grepping the repo
- Ignoring imports in the files you are about to edit
- Loading a router and then every leaf without a Decision match

#### E. Process order (`:write`)

Only skills on the NEED list, in this order:

1. ALWAYS (`enforce-code-quality`, then `enforce-typescript-strict` if TS)
2. Structure skills if selected (`design-frontend-architecture`, `design-backend-architecture`)
3. `audit-react-effects` if selected
4. Selected routers → **only Decision-matched leaves** (one leaf at a time)
5. Other selected leaves (zustand, toasts, native-feel, convert, nub, paper, …)

Routers: load router → pick leaves from **Decision + NEED** → load **one** leaf → apply → COMPACT → next leaf.

---

## Break the job: skill → rule → files → gate

**Yes — this is the required pattern.** Do not jump ahead.

If a skill has **10 rules**, treat each rule as its own mini-task:

```
for skill in ordered_need_list:
  load that skill only (or router → selected leaves one at a time)
  number its rules 1..N (numbered lists, "Rules", Done-when bullets, Reviewing existing code items)
  for rule R = 1..N:
    1. SCAN all relevant files for rule R only
    2. FIX every violation of rule R (or state exception: file + rule + why deferred)
    3. GATE — project must still be healthy before rule R+1:
         - edit done for this rule
         - lint (if project has it)
         - typecheck (if TS)
         - build (or project's verify script)
       If gate fails → fix from this rule's edits; do not start rule R+1
  4. COMPACT — after this skill’s full check is complete (all rules + gate OK):
       shrink context, keep only the ledger line, then next skill
```

**Relevant files**

| Mode | Scope |
|---|---|
| `:check` | **All project source** that skill applies to (app/src/server/features; exclude `node_modules`, dist, lockfiles) — makes **old projects** match skills |
| `:write` | **Task scope** = files you change + existing feature neighbors (callers, callees, same feature folder, shared hooks/stores/routes) |

Never “rule 3 half-done + rule 7 started.” Finish rule R + pass gate, then R+1.

---

## Mode: `skill-master:check`

**Goal:** existing / legacy codebase **matches** your skills. Prefer fix over ignore.

```
UNDERSTAND → PACKAGES → NEED SKILLS → FILE MAP
  → for each skill in process order:
       for each rule 1..N:
         SCAN all relevant files
         FIX
         GATE (lint / typecheck / build)
       COMPACT  ← required after every skill check completes (keep context small)
  → REPORT from ledger only: skills done, exceptions left, gate status
```

Rules for check:

- One skill at a time; one rule at a time across **all** applicable files.
- Use each skill’s **Rules**, **Reviewing existing code**, and **Done when**.
- After each skill’s last rule passes gate → **COMPACT** → only then next skill.
- Full-repo rewrite of unrelated style is still wrong — only what the **current rule** requires (`enforce-code-quality` minimal-diff spirit).
- If a rule is blocked (third-party, migration debt), record **exception** and continue; do not pretend balanced.

**Done when (check):** every needed skill processed rule-by-rule; each skill followed by COMPACT; gates green (or documented fail); exception list is explicit in the ledger.

---

## Mode: `skill-master:write`

**Goal:** implement the user task **following skills selected from the message and change surface**; do not copy local anti-patterns; do not drag in unrelated stack skills.

```
UNDERSTAND → PACKAGES → NEED SKILLS (message ∪ change ∩ stack) → write NEED list
  → FILE MAP (task scope only)
  → for each skill in write process order (NEED only):
       load that skill only
       ALIGN task-scope neighbors to that skill’s rules
       WRITE new/changed code under those rules
       GATE after each skill slice (or after each rule if the slice is large)
       COMPACT after that skill’s work for this task is complete
  → if scope grew → re-select NEED → continue for new skills only
  → final GATE + balanced check (from ledger + NEED list + current slice)
```

### Balanced means (write)

- [ ] NEED list was written from **message + change surface** (not “all packages”)
- [ ] Always-on applied in **task scope**
- [ ] Every skill on NEED was loaded and applied; nothing important on message/change was omitted
- [ ] No skill loaded for absent libraries
- [ ] No skill loaded that message+change did not call for (except ALWAYS + required pairs)
- [ ] Task-scope existing code checked against each loaded skill (not only the new diff)
- [ ] No open violation in change or task scope without a stated exception
- [ ] Final lint / typecheck / build OK (or project has no such script — say so)

### Write APPLY

1. **SELECT** NEED from message + change surface (gate with stack). State the list.
2. **ALIGN** neighbors first so new code does not copy forbidden patterns of the **current** skill.
3. **WRITE** under **selected** skills only.
4. Prefer one vertical slice; re-gate after the slice.
5. Minimal diffs — fix in-scope skill violations; defer out-of-slice with exception.
6. **RE-SELECT** if message or files in scope change.

**Done when (write):** task complete + balanced + final gate green + NEED list matches what was applied.

---

## Gate (edit → lint → fix → build)

After each **rule** (check mode) or each **skill slice** (write mode):

1. **Edit** — only what the current rule/skill requires  
2. **Lint** — project lint script if present; fix issues you introduced  
3. **Typecheck** — `tsc` / `typecheck` if TS  
4. **Build** (or `test`/`verify` if that is the project’s truth)  
5. All OK → next **rule**; after **last rule of the skill** → COMPACT → next skill  
6. Gate fail → fix here; do not advance; do not COMPACT until the skill’s check is complete  

If the repo has no lint/build scripts, run what exists and note what was skipped.

---

## COMPACT (harness — keep context small)

**Required after every skill check completes** (all rules for that skill done + final gate for that skill green or exceptions recorded). Also after each skill finishes its slice in `:write`.

Goal: drop bulky working context so the next skill starts lean. Do **not** carry full file bodies, rule-by-rule scan notes, or the finished skill’s full `SKILL.md` into the next skill.

### When

```
skill rules 1..N done + skill gate OK (or exceptions listed)
  → COMPACT
  → load next skill only
```

Never skip COMPACT to “save a step.” Skipping blows context on long `:check` runs.

### How (run in order)

1. **Ledger line** — append one short block only (keep for the whole run):

```text
## skill-ledger
- need: <comma-separated NEED list for this run>   # write once at start; update if re-select
- skill: <name>
  mode: check|write
  why: message|change|always|pair   # write mode: why this skill was selected
  status: pass | pass-with-exceptions | blocked
  rules: N/N
  changed: <path>, <path>   # or none
  exceptions: <file + rule + why> | none
  gate: lint/tsc/build OK | skipped:<what>
```

2. **Drop from working memory / context**
   - Full contents of files already fixed for this skill (re-read later if needed)
   - Finished skill’s loaded body and disclosed siblings
   - Per-rule scan dumps, grep noise, intermediate gate logs
   - Anything not required for the next skill or final REPORT

3. **Keep only**
   - UNDERSTAND / PACKAGES / **NEED SKILLS list** (short — source of truth for write)
   - Full `skill-ledger` (all prior skills)
   - Open exceptions that later skills must not re-break
   - Current file map paths (paths only, not bodies)

4. **Host compact** — if the agent harness supports conversation/context compact (e.g. `/compact`, session compact, or “summarize and clear tool output”), **run it now** after writing the ledger line. Prefer host compact over re-pasting large blobs.

5. **Next skill** — load only the next skill’s `SKILL.md`. Do not re-load finished skills unless a later rule needs them.

### Anti-patterns

- Starting the next skill while still holding multi-file dumps from the previous skill  
- Replacing the ledger with a long narrative essay  
- COMPACT mid-skill (before all rules of that skill finish) — only after the skill’s check is complete  
- Deleting exceptions from the ledger  

### Final REPORT

Build the end summary **from the ledger only** (plus last gate). Do not re-scan the whole history of tool output.

---

## Token rule

Load the **smallest set** of `SKILL.md` files for the **current** skill in the loop. Do not load the full library up front. Open disclosed siblings (`*.md` next to a skill) only when that branch is active.

Routers: load router → load **one** selected leaf → finish that leaf’s rules → **COMPACT** → next leaf.

COMPACT after each completed skill is part of the token budget — treat it as mandatory harness hygiene, not optional cleanup.
