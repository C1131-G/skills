# TanStack — Intent skills and the local rule set

Any `@tanstack/*` dependency means two things are in scope: this library's TanStack skills, **and** the skills TanStack ships inside the packages themselves via [TanStack Intent](https://tanstack.com/intent/latest).

Intent (`@tanstack/intent`, alpha) lets a package ship a `SKILL.md` versioned with its own code. Those skills describe the API of **the exact version installed**, which a hand-written skill cannot promise. When TanStack is present, use them.

## Enumerate what the dependencies ship

Run from the workspace root, with the project's own package runner (`npx`, `pnpm dlx`, `yarn dlx`, `bunx`):

```bash
npx @tanstack/intent@latest list --json
```

Empty output usually means the allowlist is unset, not that no skills exist. Intent surfaces skills only from packages the project has explicitly trusted, in `package.json`:

```json
{ "intent": { "skills": ["@tanstack/*"] } }
```

If the allowlist is missing, add `@tanstack/*` and re-run `list` — the project already depends on those packages. Widening the allowlist to **non**-TanStack packages is a trust decision: propose it, name the packages, and leave it to the user. Then wire the loading guidance into the project's agent config:

```bash
npx @tanstack/intent@latest install
```

That writes an `intent-skills` managed block into `AGENTS.md` (or updates an existing one). It is generated content between `<!-- intent-skills:start -->` and `<!-- intent-skills:end -->` — never hand-edit inside those markers, and never let the decision table from `setup-agent-rules` overwrite them. The two blocks coexist in the same file.

## Load the matching skills before auditing

```bash
npx @tanstack/intent@latest load @tanstack/react-query#core
npx @tanstack/intent@latest stale
```

Load every skill whose package the project depends on and whose subject the audit touches. `stale` reports skills whose source documentation has changed since the skill was written — a stale skill is still audited, with the staleness noted against its findings.

## Precedence when they disagree

| Question | Wins |
|---|---|
| What the installed version's API does — a renamed option, a removed callback, a v4-vs-v5 signature | The Intent skill. It ships with that version; a hand-written skill can be a major behind |
| Project convention — key factory shape, where `queryOptions` live, error strategy, file layout | This library's skill and the project's `AGENTS.md` |
| Direct contradiction on a rule | Report both, audit against the Intent skill, and put "reconcile our skill with the shipped one" in the fix plan |

Never silently drop one side. A contradiction between a shipped skill and a local one is itself a finding.

## Local TanStack rule set

Independently of Intent, the TanStack skills installed on the machine apply:

| Dependency | Leaf whose rules apply |
|---|---|
| `@tanstack/react-query`, `@tanstack/query-core`, `@tanstack/vue-query` | `use-tanstack-query` |
| `@tanstack/react-router`, `@tanstack/router-plugin`, `@tanstack/start` | `use-tanstack-router` |
| `@tanstack/react-form` | `use-tanstack-form` |
| `@tanstack/react-table` | `use-tanstack-table` |

1. If `route-tanstack` is installed, **invoke it** — it Decision-selects the leaves. Audit every leaf its Decision table matches for this project's dependencies, and its cross-leaf connection rules (Query owns keys and invalidation; async-UI owns pending and optimistic; no `useEffect` for route or server data; server state in Query, client UI state in the client-state store).
2. If `route-tanstack` is not installed, load the `use-tanstack-*` skills for the present dependencies directly, and say the router was unavailable.
3. Query **and** Router both present → the loader boundary is mandatory scope: `ensureQueryData` / `prefetchQuery` in the loader, `useSuspenseQuery` on the same `queryOptions` in the component (`use-tanstack-router/query-integration.md`).
4. A TanStack package in the manifest with zero imports is still audited, and the unused dependency is a fix-plan item.

```bash
grep -rn "@tanstack/" --include=*.ts --include=*.tsx --include=*.js --include=*.jsx --include=package.json . | grep -v node_modules | head -40
```

Intent is not TanStack-only — any package can ship skills. If `list` surfaces skills from a non-TanStack dependency the project already allowlisted, load those too.
