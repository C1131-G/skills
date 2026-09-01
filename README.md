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

```bash
npx skills@latest add C1131-G/skills --all
```

Installs to every detected agent — Claude Code, Cursor, Codex, Cline, Copilot, Gemini CLI, Windsurf, Zed, and others. Or choose interactively:

```bash
npx skills@latest add C1131-G/skills
npx skills@latest add C1131-G/skills --list
npx skills update
```

## The skills

### React and frontend

| Skill | Covers |
|---|---|
| [apply-react-async-ui](skills/engineering/apply-react-async-ui/SKILL.md) | Pending state, optimistic updates, loading boundaries |
| [audit-react-effects](skills/engineering/audit-react-effects/SKILL.md) | Eliminating unnecessary `useEffect` |
| [apply-toasts](skills/engineering/apply-toasts/SKILL.md) | Sonner; toast vs inline vs modal; accessibility |
| [apply-native-feel-nav](skills/engineering/apply-native-feel-nav/SKILL.md) | Navigation motion and mobile ergonomics |
| [apply-next-shell-nav](skills/engineering/apply-next-shell-nav/SKILL.md) | Next.js App Router shell structure |

### TanStack

| Skill | Covers |
|---|---|
| [use-tanstack-query](skills/engineering/use-tanstack-query/SKILL.md) | Server state, keys, caching, mutations, SSR |
| [use-tanstack-router](skills/engineering/use-tanstack-router/SKILL.md) | File routes, search params, links, loaders |

### Cross-cutting

| Skill | Covers |
|---|---|
| [enforce-code-quality](skills/engineering/enforce-code-quality/SKILL.md) | Minimal diffs, size limits, naming, verification, commit hygiene |
| [enforce-typescript-strict](skills/engineering/enforce-typescript-strict/SKILL.md) | Strictness rules and compiler flags |
| [setup-agent-rules](skills/engineering/setup-agent-rules/SKILL.md) | Writing a project's `AGENTS.md` so the right skills get loaded |

### Other

[read-research-paper](skills/productivity/read-research-paper/SKILL.md) — a three-pass method for reading papers.

## Invocation

Every skill is independently invokable. Name the one you need and say what you want in ordinary language:

```text
Use apply-react-async-ui to review the loading boundaries.
Use use-tanstack-query to fix the mutation cache behavior.
Use audit-react-effects and enforce-code-quality to review this feature.
```

Larger skills are a thin `SKILL.md` router over disclosed reference files, so only the relevant branch is loaded:

| Skill | References |
|---|---|
| `use-tanstack-query` | `core.md`, `mutations.md`, `render.md`, `advanced.md`, `nextjs.md` |
| `apply-native-feel-nav` | `motion.md`, `touch.md`, `viewport.md` |
| `use-tanstack-router` | `query-integration.md` |
| `apply-toasts` | `motion.md` |
| `audit-react-effects` | `CASES.md` |

## Making skills actually get loaded

Skill loading is probabilistic — an agent reads the description and decides. To make it reliable in a given project, run [setup-agent-rules](skills/engineering/setup-agent-rules/SKILL.md) there. It writes a decision-tree table into that project's `AGENTS.md`, tailored to the stack the project actually uses, so every agent is told which skill to load rather than left to infer it.

`AGENTS.md` is read by most agents; Claude Code reads `CLAUDE.md`, so the skill points one at the other instead of maintaining two copies.

## License

MIT
