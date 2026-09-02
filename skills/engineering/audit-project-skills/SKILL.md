---
name: audit-project-skills
description: Audit a project against every rule of the skills its stack actually needs, then produce a prioritized fix plan. Reads package.json to pick the relevant skills, installs any that are missing, confirms the project's AGENTS.md decision table is applied, reads 100% of each selected skill's rules, and checks every rule against the code with cited evidence. Use when asked to "audit my project", "audit my setup", "check my skills are applied", "pick the right skills for this repo", "are my rules being followed", or when onboarding an unfamiliar codebase.
---

# audit-project-skills

Selects the skills this project's dependencies imply, guarantees they are installed and wired into `AGENTS.md`, then audits the codebase against **every rule of every selected skill** and emits a fix plan.

Read-only on application code. It produces a plan; it does not apply it unless the user asks for the fixes.

Also apply `enforce-code-quality` to any file this skill writes (`AGENTS.md`, the report).

| Step needs | Open |
|---|---|
| Reading `package.json`, mapping dependencies to skills, monorepos | [detection.md](detection.md) |
| Turning a skill's prose into checkable rules, and proving each verdict | [evidence.md](evidence.md) |
| The audit report and fix-plan format | [report.md](report.md) |

## Procedure

Run all seven steps every time this skill is invoked. Do not skip a step because a previous session did it — the point of the skill is that the answer is re-verified now.

### 1. Detect the stack

Read the root `package.json`, plus every workspace `package.json`, `tsconfig.json`, and framework config. See [detection.md](detection.md). Record concrete versions — a rule that depends on a major version is audited against the installed major, not the newest.

### 2. Select the skills

Map the detected dependencies to skills using the table in [detection.md](detection.md). A skill is selected when its trigger dependency is present, or when its scope is unconditional (`enforce-code-quality` always; `enforce-typescript-strict` whenever a `.ts`/`.tsx` file exists).

State the selection **and the rejections**: every skill in the library is either selected with its trigger, or rejected with the reason ("no `@tanstack/react-router` in any manifest"). A silent omission is indistinguishable from an oversight.

### 3. Install what is missing

For each selected skill, check it exists on the machine:

```bash
ls ~/.claude/skills/<name>/SKILL.md .claude/skills/<name>/SKILL.md .agents/skills/<name>/SKILL.md 2>/dev/null
```

If any selected skill is missing, install the library so it is available to every project, not just this one:

```bash
npx skills@latest add C1131-G/skills --all
```

Run that from the home directory for a machine-wide install, or check `npx skills@latest add --help` for a global flag on the installed CLI version. Re-run the `ls` check afterwards and report the result — never claim an install succeeded without re-checking.

### 4. Confirm the AGENTS.md wiring

Skills that are installed but not routed still do not get loaded. Check the project's `AGENTS.md` for the "Which skill to load" decision table:

- **Missing** → apply `setup-agent-rules` now and say that you did.
- **Present but stale** — a selected skill has no row, or a row names a skill that no longer exists → update it in place via `setup-agent-rules`.
- **Present and complete** → say so explicitly. "Setup confirmed applied" is a required line of the report.

### 5. Load every selected skill in full

Read each selected skill's `SKILL.md` **and every reference file it routes to**. This is the one place where partial disclosure does not apply: an audit that reads `use-tanstack-query/SKILL.md` but not `mutations.md` cannot claim to have audited mutations.

### 6. Extract and check every rule

Turn each skill into a numbered rule list, then check every rule against the code. Method, verdicts, and the evidence bar are in [evidence.md](evidence.md).

The rule count in the report must equal the rule count extracted. `PASS`, `FAIL`, and `UNVERIFIABLE` are all acceptable outcomes; a rule silently dropped from the table is not.

### 7. Report

Emit the coverage table and the prioritized fix plan in the format in [report.md](report.md).

## Rules

1. **Selection is derived, never assumed.** Every selected skill names the dependency that selected it; every rejected skill names what was absent.
2. **No verdict without evidence.** A `PASS` cites a `file:line` or the exact search that proved the anti-pattern absent. See [evidence.md](evidence.md).
3. **No sampling.** Every rule of every selected skill appears in the output. If the codebase is too large to check a rule exhaustively, the verdict is `UNVERIFIABLE` with the reason — not an optimistic `PASS`.
4. **Audit, then fix — separately.** Do not edit application code during the audit. The deliverable is the plan; apply it only on the user's word.
5. **Missing skills get installed, not noted.** A selected-but-absent skill is fixed in step 3 and re-verified, not left as a recommendation.
6. **`AGENTS.md` state is always reported**, including when nothing needed changing.
7. **Report failures faithfully.** An install that failed, a check that could not run, a workspace that could not be parsed — each is stated with its error, not smoothed over.

## Review checklist

When reviewing a previous audit, flag: a skill selected without a named trigger; a `PASS` with no citation; a rule count in the table lower than the rules in the skill; a fix plan item with no file path; an `AGENTS.md` claim made without reading the file; an install claimed without a follow-up check.

## Done when

Every dependency-implied skill is installed and verified present; the project's `AGENTS.md` decision table is confirmed applied or was applied during the run; every rule of every selected skill carries a `PASS`/`FAIL`/`UNVERIFIABLE` verdict with cited evidence; and the fix plan lists each `FAIL` with a file path, the change, and its severity.
