---
name: skill-master
description: >
  Single entry for every agent run. Invoke as skill-master:check (audit/align
  whole project to skills) or skill-master:write (implement following skills).
  Detect stack, load only matching skills, break work rule-by-rule, COMPACT
  context after every skill completes. Always first.
disable-model-invocation: true
---

# skill-master

**Send this skill first on every agent run.** Do not write product code until mode, stack, and skill list are set.

After `npx skills` install, skills sit as **siblings**. Load by skill name or `../<skill-name>/SKILL.md`.

## Invoke with suffix (required)

Pick **one** mode when you invoke. Suffix is the contract:

| Invoke | Mode | Purpose |
|---|---|---|
| `skill-master:check` | **check** | Audit + fix so **existing / old project code** matches skills |
| `skill-master:write` | **write** | Implement a task **following** skills (new + in-scope neighbors) |
| `skill-master` only (no suffix) | treat as **write** | Same as `:write` |

Same suffixes work on a **single skill** when you only want that skill:

| Invoke | Meaning |
|---|---|
| `<skill>:check` | Run that skill’s rules only (still rule-by-rule + gate) |
| `<skill>:write` | Write code under that skill’s rules only |

Examples: `enforce-typescript-strict:check`, `use-tanstack-query:write`, `audit-react-effects:check`.

---

## Shared first steps (both modes)

Always do this **before** loading leaf skills or editing:

```
1 UNDERSTAND  → read repo shape: README, package.json, app entry, src/ layout, scripts
2 PACKAGES    → list stack from package.json / lockfile / tree (once per conversation)
3 NEED SKILLS → only skills whose stack is present (ALWAYS + ROUTE below)
4 FILE MAP    → know which dirs/files matter (app, features, server, tests) — not node_modules
```

Never load a skill for a library the project does **not** use.

### DETECT (packages → skill cluster)

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

### ALWAYS (every project with that stack)

Load and process **in this order** (before routers/leaves):

1. `../enforce-code-quality/SKILL.md`
2. `../enforce-typescript-strict/SKILL.md` (skip if pure JS)

### ROUTE (stack + task / full project)

Load **routers first**; they point at leaves. Skip leaves the router does not select.

| Trigger | Load |
|---|---|
| Interactive / mutating UI, loading UI, Suspense | `../route-react-async-ui/SKILL.md` |
| Any `useEffect` (write or review) | `../audit-react-effects/SKILL.md` |
| Any TanStack package in stack + relevant | `../route-tanstack/SKILL.md` |
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

### Default skill process order (`:check` full project)

Run only skills that **NEED SKILLS** selected. Fixed order so always-on and structure land first:

1. `enforce-code-quality`
2. `enforce-typescript-strict` (if TS)
3. `design-frontend-architecture` / `design-backend-architecture` (if in need-list)
4. `audit-react-effects` (if React)
5. Router families and leaves from DETECT (TanStack, React async UI, Zustand, backend leaves, …)
6. Remaining matched leaves (toasts, native-feel, nub, convert, …)

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

**Goal:** implement the user task **following** skills; do not copy local anti-patterns.

```
UNDERSTAND → PACKAGES → NEED SKILLS (task + stack) → FILE MAP (task scope)
  → for each needed skill (ALWAYS first, then ROUTE leaves):
       ALIGN task-scope existing code to that skill’s rules (rule-by-rule if many violations)
       WRITE new/changed code under those rules
       GATE after each skill slice (or after each rule if the slice is large)
       COMPACT after that skill’s work for this task is complete
  → final GATE + balanced check (from ledger + current slice only)
```

### Balanced means (write)

- [ ] Always-on applied in task scope
- [ ] Every stack-matched skill for this task was loaded and applied
- [ ] Task-scope existing code checked against each loaded skill (not only the diff)
- [ ] No skill loaded for absent libraries
- [ ] No open violation in change or task scope without a stated exception
- [ ] Final lint / typecheck / build OK (or project has no such script — say so)

### Write APPLY

1. **ALIGN** neighbors first so new code does not copy forbidden patterns.
2. **WRITE** under selected skills only.
3. Prefer one vertical slice; re-gate after the slice.
4. Minimal diffs — fix in-scope skill violations; defer out-of-slice with exception.

**Done when (write):** task complete + balanced + final gate green.

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
- skill: <name>
  mode: check|write
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
   - UNDERSTAND / PACKAGES / NEED SKILLS list (short)
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
