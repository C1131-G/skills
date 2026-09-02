# Report format

Emit these five sections, in order. Nothing else.

## 1. Setup

```markdown
## Setup

- Manifests read: `package.json`, `apps/web/package.json`
- Stack: Next 15.1.0, React 19.0.0, TypeScript 5.7.2, @tanstack/react-query 5.62.0, @tanstack/react-form 1.0.0
- Skill roots inventoried: `~/.agents/skills` (100), `~/.claude/skills` (40), project `.claude/skills` (0) — 112 unique after de-duplication
- Dependency-shipped skills (`intent list`): 6 from `@tanstack/react-query@5.62.0`, `@tanstack/react-form@1.0.0` — 3 loaded, 1 flagged stale   (or: allowlist `intent.skills` was unset, added `@tanstack/*`)
- Skills installed: 8 of 8 selected present   (or: installed `use-tanstack-router`, re-checked, now present)
- AGENTS.md `intent-skills` block: **present, untouched**   (or: **written by `intent install`**)
- AGENTS.md decision table: **confirmed applied**   (or: **missing — applied via `setup-agent-rules`**, or **stale — 2 rows updated**)
```

The AGENTS.md line is mandatory on every run, including when nothing changed.

## 2. Skill selection

```markdown
## Skills selected

| Skill | Root | Selected by | Found in |
|---|---|---|---|
| enforce-code-quality | `~/.agents/skills` | unconditional | — |
| route-tanstack (router) | `~/.agents/skills` | `@tanstack/*` present | `apps/web/package.json` |
| ├ use-tanstack-query (leaf) | `~/.agents/skills` | `@tanstack/react-query@5.62.0` | `apps/web/package.json` |
| └ use-tanstack-form (leaf) | `~/.agents/skills` | `@tanstack/react-form@1.0.0` | `apps/web/package.json` |

Not selected: `use-tanstack-router` — leaf of `route-tanstack`, no `@tanstack/react-router` in any manifest · `use-zustand` — no client-state library · 61 non-code skills (writing, video, marketing, design review) — not code-audit skills
```

Leaves appear indented under the router that selected them. A leaf never appears without its router.

## 3. Rule coverage

One row per extracted rule, grouped by skill. This table is the audit — it is long by design, and it is never truncated or summarized away.

```markdown
### use-tanstack-query — 14 rules

| # | Rule | Verdict | Evidence |
|---|---|---|---|
| 1 | Never conditional hooks — use `enabled` | PASS | `grep -rn "if.*useQuery" src` → 0 results |
| 2 | Hierarchical key factories | FAIL | `src/api/users.ts:12`, `src/api/posts.ts:8` (7 total) |
| 3 | Await `invalidateQueries` in mutation callbacks | FAIL | `src/hooks/useSave.ts:31` |
| 4 | No local-state copy of query data | UNVERIFIABLE | 340 `useState` call sites; checked 20 |
```

End each skill's block with its tally: `14 rules — 9 PASS · 3 FAIL · 2 UNVERIFIABLE`. The three numbers must sum to the rule count.

## 4. Fix plan

Ordered by severity, then by how many call sites the fix touches. Every item is actionable without re-reading the audit.

```markdown
## Fix plan

### 1. Await every `invalidateQueries` — critical
- **Where:** `src/hooks/useSave.ts:31`, `src/hooks/useDelete.ts:44`
- **Why it matters:** the mutation resolves before the refetch, so the UI renders the stale list.
- **Change:** `return queryClient.invalidateQueries({ queryKey: userKeys.all })` in `onSuccess`.
- **Rule:** use-tanstack-query-3
- **Verify:** `npm run test -- useSave` plus a manual save-then-list check.
```

Close the plan with a **Not in this plan** list: the `UNVERIFIABLE` rules and anything deliberately left alone, each with its reason. A finished plan accounts for every non-`PASS` row.

## 5. Next step

One line: the command to apply the plan, and the explicit statement that no application code was changed during the audit.

```markdown
No application code was changed. Say "apply the fix plan" to work through it in severity order.
```
