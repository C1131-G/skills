---
name: audit-with-skills
description: Audit a project against every rule of the skills its stack actually needs, then produce a prioritized fix plan. Reads package.json to pick relevant skills from every skill installed on the machine (~/.agents/skills, ~/.claude/skills, and project roots), installs any that are missing, confirms the project's AGENTS.md decision table is applied, reads 100% of each selected skill's rules, and checks every rule against the code with cited evidence. Any @tanstack/* dependency pulls in the whole TanStack rule set plus the version-matched skills the packages ship through TanStack Intent. Use when asked to "audit my project", "audit my setup", "check my skills are applied", "pick the right skills for this repo", "are my rules being followed", or when onboarding an unfamiliar codebase.
---

# audit-with-skills

Selects the skills this project's dependencies imply — from **every skill installed on the machine**, not just one library — guarantees they are installed and wired into `AGENTS.md`, then audits the codebase against **every rule of every selected skill** and emits a fix plan.

Read-only on application code. It produces a plan; it does not apply it unless the user asks for the fixes.

Also apply `enforce-code-quality` to any file this skill writes (`AGENTS.md`, the report).

| Step needs | Open |
|---|---|
| Reading `package.json`, inventorying the installed skills, mapping dependencies to them, monorepos | [detection.md](detection.md) |
| A `@tanstack/*` dependency: Intent skills shipped by the package, the allowlist, precedence, the local TanStack rule set | [tanstack.md](tanstack.md) |
| Turning a skill's prose into checkable rules, and proving each verdict | [evidence.md](evidence.md) |
| The audit report and fix-plan format | [report.md](report.md) |

## Procedure

Run all seven steps every time this skill is invoked. Do not skip a step because a previous session did it — the point of the skill is that the answer is re-verified now.

### 1. Detect the stack

Read the root `package.json`, plus every workspace `package.json`, `tsconfig.json`, and framework config. See [detection.md](detection.md). Record concrete versions — a rule that depends on a major version is audited against the installed major, not the newest.

### 2. Inventory every installed skill, then select

Skills come from every root on the machine — `~/.agents/skills`, `~/.claude/skills`, and the project's own `.agents/skills` / `.claude/skills` — not only from this repository. Read each skill's frontmatter (name, role, description) and match the project's signals against the descriptions. Commands and the signal map are in [detection.md](detection.md).

A skill is selected when a project signal matches it, or when its scope is unconditional (`enforce-code-quality` always; `enforce-typescript-strict` whenever a `.ts`/`.tsx` file exists).

**Select routers, never their leaves.** A skill with `role: router` (or `role: entry`) owns its leaves and their cross-leaf rules; audit the leaves *under* it. Any `@tanstack/*` dependency selects the TanStack router and every leaf its Decision table matches ([tanstack.md](tanstack.md)).

**Dependencies can ship their own skills.** With TanStack present, run `npx @tanstack/intent@latest list --json` and load every matching skill it surfaces — those are versioned with the installed package, so they outrank a hand-written skill on what the installed API actually does. Allowlist, loading, and precedence are in [tanstack.md](tanstack.md).

State the selection **and the rejections**: every inventoried skill is either selected with its trigger, or rejected with the reason ("no `@tanstack/react-router` in any manifest"; leaf of `route-tanstack`; not a code-audit skill). A silent omission is indistinguishable from an oversight.

### 3. Install what is missing

The inventory in step 2 already says what is present. For a signal the project raises with **no installed skill to cover it**, close the gap rather than noting it:

```bash
ls ~/.agents/skills/<name>/SKILL.md ~/.claude/skills/<name>/SKILL.md .agents/skills/<name>/SKILL.md .claude/skills/<name>/SKILL.md 2>/dev/null
```

If a skill from this library is missing, install it machine-wide so every project gets it:

```bash
npx skills@latest add C1131-G/skills --all
```

Run that from the home directory for a machine-wide install, or check `npx skills@latest add --help` for a global flag on the installed CLI version. For a gap this library does not cover — a Vue project, a Python service — say so plainly and name the signal left unaudited; do not invent a source to install from.

Re-run the `ls` check afterwards and report the result — never claim an install succeeded without re-checking.

### 4. Confirm the AGENTS.md wiring

Skills that are installed but not routed still do not get loaded. Two blocks belong in the project's `AGENTS.md`, and both are checked.

**a. The "Which skill to load" decision table:**

- **Missing** → apply `setup-agent-rules` now and say that you did.
- **Present but stale** — a selected skill has no row, or a row names a skill that no longer exists → update it in place via `setup-agent-rules`.
- **Present and complete** → say so explicitly. "Setup confirmed applied" is a required line of the report.

**b. The `intent-skills` block**, when the project has Intent-shipping dependencies. Missing → run `npx @tanstack/intent@latest install`. Present → leave everything between `<!-- intent-skills:start -->` and `<!-- intent-skills:end -->` untouched; it is generated, and `setup-agent-rules` must merge around it rather than through it.

### 5. Load every selected skill in full

Read each selected skill's `SKILL.md` **and every reference file it routes to**. For a router, that means the router plus each leaf its Decision table selected, plus each of those leaves' own reference files. This is the one place where partial disclosure does not apply: an audit that reads `use-tanstack-query/SKILL.md` but not `mutations.md` cannot claim to have audited mutations.

### 6. Extract and check every rule

Turn each skill into a numbered rule list, then check every rule against the code. Method, verdicts, and the evidence bar are in [evidence.md](evidence.md).

The rule count in the report must equal the rule count extracted. `PASS`, `FAIL`, and `UNVERIFIABLE` are all acceptable outcomes; a rule silently dropped from the table is not.

### 7. Report

Emit the coverage table and the prioritized fix plan in the format in [report.md](report.md).

## Rules

1. **Selection is derived, never assumed.** Every selected skill names the dependency that selected it and the root it was loaded from; every rejected skill names what was absent.
2. **The whole machine's library is in scope.** Never limit selection to one repository's skills. Routers are selected; their leaves are audited under them, never picked directly.
3. **No verdict without evidence.** A `PASS` cites a `file:line` or the exact search that proved the anti-pattern absent. See [evidence.md](evidence.md).
4. **No sampling.** Every rule of every selected skill appears in the output. If the codebase is too large to check a rule exhaustively, the verdict is `UNVERIFIABLE` with the reason — not an optimistic `PASS`.
5. **Audit, then fix — separately.** Do not edit application code during the audit. The deliverable is the plan; apply it only on the user's word.
6. **Missing skills get installed, not noted.** A selected-but-absent skill is fixed in step 3 and re-verified, not left as a recommendation.
7. **A shipped skill beats a written one on API facts.** Where an Intent skill and a local skill disagree about the installed version's behavior, audit against the shipped skill, report the conflict, and never drop either side silently.
8. **`AGENTS.md` state is always reported**, including when nothing needed changing.
9. **Report failures faithfully.** An install that failed, a check that could not run, a workspace that could not be parsed — each is stated with its error, not smoothed over.

## Review checklist

When reviewing a previous audit, flag: a selection drawn from one library when more were installed; a leaf audited without its router; a `@tanstack/*` dependency whose sibling TanStack rules went unaudited; a TanStack project audited without running `intent list`; an edit made inside the `intent-skills` markers; a skill selected without a named trigger; a `PASS` with no citation; a rule count in the table lower than the rules in the skill; a fix plan item with no file path; an `AGENTS.md` claim made without reading the file; an install claimed without a follow-up check.

## Done when

Every skill root on the machine was inventoried; every skill the project's own dependencies ship was listed and, where relevant, loaded; every dependency-implied skill is installed and verified present; the project's `AGENTS.md` decision table is confirmed applied or was applied during the run; every rule of every selected skill carries a `PASS`/`FAIL`/`UNVERIFIABLE` verdict with cited evidence; and the fix plan lists each `FAIL` with a file path, the change, and its severity.
