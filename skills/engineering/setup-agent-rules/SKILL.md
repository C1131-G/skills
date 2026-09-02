---
name: setup-agent-rules
description: Write or update a project's AGENTS.md with a decision tree telling every AI agent which skill to load for which task. Use when setting up a new repository, when skills exist but never get used, when onboarding a project to Claude Code / Cursor / Codex / Copilot, or when asked to "make the agent follow my rules", "add agent instructions", or "set up AGENTS.md".
---

# setup-agent-rules

Skill loading is probabilistic: an agent reads a skill's description and decides whether it applies. `AGENTS.md` is not — it is loaded into context every session, by every agent that reads it. Putting a decision tree there converts "the agent might load the right skill" into "the agent is told which one to load."

This skill writes that decision tree into a target project.

Also apply `enforce-code-quality` to any file you change here.

## Procedure

### 1. Check what already exists

- Read any existing `AGENTS.md`.
- Run `git status` and preserve unrelated changes.
- If a "Which skill to load" section already exists, **update it in place**. Never append a second copy, and never overwrite the project's own instructions — they outrank anything this skill adds.

### 2. Write the block into AGENTS.md

Insert this section, keeping every existing section intact. Write **the whole table** — every skill appears, so an agent never has to guess whether a situation is covered:

```markdown
## Which skill to load

Load the skill before writing the code, not after. Two or more rows can apply at once — load all of them.

| When | Load |
|---|---|
| Any code change, in any language | `enforce-code-quality` |
| Editing a `.ts` or `.tsx` file | `enforce-typescript-strict` |
| About to write or edit a `useEffect` | `audit-react-effects` |
| An interaction that waits on the server — submit, save, load, spinner placement | `apply-react-async-ui` |
| The file imports `useQuery`, `useMutation`, `useSuspenseQuery`, or `queryClient` | `use-tanstack-query` |
| The file has `createFileRoute`, a route loader, or reads search params | `use-tanstack-router` |
| Showing the user a message about something that happened | `apply-toasts` |
| Route transitions, gestures, tap feedback, safe areas, mobile viewport | `apply-native-feel-nav` |
| A Next.js layout shell, sidebar, or streaming boundary | `apply-next-shell-nav` |
| Onboarding a repository, or this table needs updating | `setup-agent-rules` |
| Auditing the repo against the skills its stack implies, or checking this setup is applied | `audit-project-skills` |
| Reading or reviewing a research paper | `read-research-paper` |
```

Keep it a table. It sits in context for every session in this repository, so length is a real cost — do not expand it into prose or add commentary between rows.

### 3. Do not create CLAUDE.md

`AGENTS.md` is the single source of truth. Do not create a `CLAUDE.md`, a `.cursor/rules/` file, or any other per-agent copy — a second file is a second thing to drift.

If the project **already has** a `CLAUDE.md`, leave its content alone. Do not migrate it, and do not duplicate the table into it.

### 4. Verify the skills are installed

The table is useless if the named skills are not on the machine:

```bash
npx skills@latest add C1131-G/skills --all
```

If a row names a skill that is not installed, say so plainly rather than leaving a row that resolves to nothing.

### 5. Report

State what you changed in `AGENTS.md`, whether you created it or merged into an existing file, and anything you deliberately left untouched.

## Rules

1. **Every skill gets a row.** The table is the complete map, not a selection.
2. **Merge, never clobber.** The project's existing instructions win.
3. **`AGENTS.md` only.** No `CLAUDE.md`, no per-agent duplicates.
4. **Keep it short.** This text is in context for every session in the repository, forever.
5. **A row names a real installed skill**, or you report that it does not.

## Done when

`AGENTS.md` contains the complete decision-tree table; any pre-existing instructions in that file are intact; no `CLAUDE.md` or other per-agent copy was created; and every named skill is confirmed installed.
