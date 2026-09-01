# Cibi Skills

Personal engineering knowledge from **my own work and daily practice**, in two forms:

- **Lint rules** (`src/`) — the parts a machine can check, as an Oxlint plugin you vendor into your repo. They run in CI for every agent and every human, whether or not anyone read the docs.
- **Skills** (`skills/`) — the parts that need judgment, as agent skills for Claude Code, Cursor, Codex, Copilot, and others.

The split is the point. Prose only helps if something chooses to read it; a lint rule fails the build regardless.

## Disclaimer

> **This is personal knowledge and practice — not official documentation, a product, or professional advice.**

- Treat every rule and skill as opinionated guidance, not absolute truth.
- Verify against current library documentation, team standards, and project constraints.
- You own the result produced with these.

If something is wrong, unclear, or outdated, open a [GitHub Issue](https://github.com/C1131-G/skills/issues) or PR.

---

## The lint rules

Executable versions of the mechanically-checkable rules from `use-tanstack-query`. No other linter catches these.

| Rule | Enforces |
|---|---|
| `cibi/no-conditional-query` | Query and mutation hooks are called unconditionally; the fetch is gated with `enabled` |
| `cibi/no-floating-invalidate` | `invalidateQueries` and friends are awaited or returned inside mutation callbacks |
| `cibi/no-query-result-rest` | No rest destructuring of a query result, which defeats tracked-query re-renders |

**Meant to be vendored, not depended on.** Copy the rules into your repository, read them, and change what does not fit your team. They are a starting point, not a standard.

### Install

Ask an agent with the `install-cibi-rules` skill, or do it by hand:

```bash
node skills/engineering/install-cibi-rules/scripts/install.mjs
```

That copies the plugin to `tools/oxlint/cibi/`. Then register it in `oxlint.config.ts`:

```ts
jsPlugins: [{ name: "cibi", specifier: "./tools/oxlint/cibi/index.ts" }],
rules: {
  "cibi/no-conditional-query": "error",
  "cibi/no-floating-invalidate": "error",
  "cibi/no-query-result-rest": "error",
},
```

Install `oxlint` and `@oxlint/plugins` at the **same pinned version** — the skill walks through reading the right one rather than guessing.

### Develop

```bash
npm install
npm run check     # lint + rule tests + typecheck + asset drift
```

One rule per file in `src/rules/`, its test beside it. After changing `src/`, run `npm run sync:skill-assets` so the installer ships the current code.

---

## The skills

```bash
npx skills@latest add C1131-G/skills --all
```

Installs to every detected agent — Claude Code, Cursor, Codex, Cline, Copilot, Gemini CLI, Windsurf, Zed, and others. Or choose interactively:

```bash
npx skills@latest add C1131-G/skills
npx skills@latest add C1131-G/skills --list
npx skills update
```

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
| [install-cibi-rules](skills/engineering/install-cibi-rules/SKILL.md) | Vendoring the lint rules above into a project |

### Other

[read-research-paper](skills/productivity/read-research-paper/SKILL.md) — a three-pass method for reading papers.

## Invocation

Every skill is independently invokable. Name the one you need and say what you want in ordinary language:

```text
Use apply-react-async-ui to review the loading boundaries.
Use use-tanstack-query to fix the mutation cache behavior.
```

Larger skills are a thin `SKILL.md` router over disclosed reference files, so only the relevant branch gets loaded.

## Making them apply automatically

Skill loading is probabilistic — an agent reads the description and decides. To make knowledge apply every time, in this order:

1. **Lint rules** — the only mechanism that is tool-agnostic and applies to humans too.
2. **`AGENTS.md`** in your project, listing the skills that always apply. Read by most agents; Claude Code reads `CLAUDE.md`, so point one at the other rather than maintaining two.
3. **Hooks**, if you use Claude Code — a `PreToolUse` hook on `Write|Edit` can inject a skill pointer on every edit. Claude Code only.

## License

MIT
