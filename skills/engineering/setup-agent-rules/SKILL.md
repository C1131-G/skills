---
name: setup-agent-rules
description: Write or update a project's AGENTS.md so every AI agent working in it knows which skills to load for which task. Use when setting up a new repository, when skills exist but never get used, when onboarding a project to Claude Code / Cursor / Codex / Copilot, or when asked to "make the agent follow my rules", "add agent instructions", or "set up AGENTS.md".
---

# setup-agent-rules

Skill loading is probabilistic: an agent reads a skill's description and decides whether it applies. `AGENTS.md` is not — it is loaded into context every session, by every agent that supports it. Putting a decision tree there converts "the agent might load the right skill" into "the agent is told which one to load."

This skill writes that decision tree into a target project, tailored to what the project actually uses.

Also apply `enforce-code-quality` to any file you change here.

## Procedure

### 1. Detect what the project actually uses

Do not write rules for skills the project has no use for — a Next.js rule in a Vite repo is noise that makes the whole file easier to ignore. Read `package.json` dependencies and check the source:

| Signal | Include |
|---|---|
| always | `enforce-code-quality` |
| `typescript` in dependencies, or any `.ts`/`.tsx` | `enforce-typescript-strict` |
| `react` | `audit-react-effects`, `apply-react-async-ui` |
| `@tanstack/react-query` | `use-tanstack-query` |
| `@tanstack/react-router` | `use-tanstack-router` |
| `sonner`, or any toast library | `apply-toasts` |
| `next` | `apply-next-shell-nav` |
| React Native feel wanted, or mobile-first web | `apply-native-feel-nav` |

When a signal is ambiguous, ask rather than guessing. An unused row costs more than a missing one.

### 2. Check what already exists

- Read any existing `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/*`, `.github/copilot-instructions.md`.
- Run `git status` and preserve unrelated changes.
- If a skills section already exists, **update it in place**. Never append a second copy, and never overwrite the project's own instructions.

### 3. Write the block

Insert this section into `AGENTS.md`, keeping every existing section. Include **only the rows that step 1 selected**:

```markdown
## Which skill to load

Load the skill before writing the code, not after.

| When | Load |
|---|---|
| Any code change, any language | `enforce-code-quality` |
| Editing a `.ts` / `.tsx` file | `enforce-typescript-strict` |
| About to write a `useEffect` | `audit-react-effects` |
| An interaction that waits on the server — submit, save, load | `apply-react-async-ui` |
| File imports `useQuery` / `useMutation` / `queryClient` | `use-tanstack-query` |
| File has `createFileRoute`, a loader, or reads search params | `use-tanstack-router` |
| Showing the user a message about something that happened | `apply-toasts` |
| Route transitions, gestures, tap feedback, safe areas | `apply-native-feel-nav` |
| Next.js layout shell, sidebar, or streaming boundaries | `apply-next-shell-nav` |

Two or more rows can apply at once — load all of them.
```

Keep it a table. It is loaded on every session in this repository, so length is a real cost; do not expand it into prose.

### 4. Point the other agent files at it

`AGENTS.md` is read by Codex, Cursor, and others. Claude Code reads `CLAUDE.md`. Rather than maintaining two copies that drift, create or update `CLAUDE.md` as a pointer:

```markdown
See [AGENTS.md](AGENTS.md) for repository guidance and which skill to load for which task.
```

If the project has `.cursor/rules/` or `.github/copilot-instructions.md`, add the same one-line pointer there. One source of truth, several doors into it.

### 5. Verify the skills are actually installed

The table is useless if the named skills are not on the machine. Confirm they are:

```bash
npx skills@latest add C1131-G/skills --all
```

If a skill in the table is not installed, say so plainly rather than leaving a row that resolves to nothing.

### 6. Report

State which rows you included and why, which files you changed, and anything you deliberately left out.

## Rules

1. **Only rows the project earns.** Detection drives the table, not a blanket copy.
2. **Merge, never clobber.** The project's existing instructions outrank anything this skill adds.
3. **One source of truth.** `AGENTS.md` holds the content; every other agent file points at it.
4. **Keep it short.** This text is in context for every session in the repository, forever.
5. **A row names a real installed skill**, or it does not go in.

## Done when

`AGENTS.md` contains a decision-tree table covering exactly the skills this project uses; existing instructions are intact; `CLAUDE.md` and any other agent file point at it rather than duplicating it; and every named skill is installed.
