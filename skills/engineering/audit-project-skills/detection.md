# Detection — stack to skills

## 1. Find every manifest

A single root `package.json` is the exception, not the rule. Collect all of them, minus dependencies:

```bash
find . -name package.json -not -path '*/node_modules/*' -not -path '*/.git/*'
```

Read each one. For a monorepo, audit each workspace against the skills **its own** manifest selects — a Next.js app and a plain library in the same repo do not get the same rule set. Say which workspace each finding belongs to.

Also read, when present: `tsconfig.json` (and every extended base), `next.config.*`, `vite.config.*`, `tailwind.config.*`, `eslint.config.*` / `.eslintrc.*`, and the lockfile for the **resolved** versions.

```bash
node -e "const p=require('./package.json');console.log(JSON.stringify({...p.dependencies,...p.devDependencies},null,2))"
```

Record the installed major of anything a rule depends on — React 18 and React 19 do not have the same async-UI primitives, and TanStack Query v4 and v5 do not have the same callbacks.

## 2. Map dependencies to skills

| Present in a manifest | Select |
|---|---|
| *anything at all* | `enforce-code-quality` |
| `typescript`, or any `.ts` / `.tsx` file | `enforce-typescript-strict` |
| `react` | `audit-react-effects`, `apply-react-async-ui` |
| `next` | `apply-next-shell-nav`, plus the `react` rows |
| `sonner` | `apply-toasts` |
| `react-hot-toast`, `react-toastify`, `@radix-ui/react-toast`, or a hand-rolled toast component | `apply-toasts` — audit it, and include the migration to `sonner` in the plan as a recommendation, not a `FAIL` |
| `@tanstack/react-query`, `@tanstack/query-core`, `@tanstack/vue-query` | `use-tanstack-query` |
| `@tanstack/react-router`, `@tanstack/router-plugin` | `use-tanstack-router` |
| `framer-motion` / `motion`, `next/link` route transitions, `viewport` meta, or any mobile-targeted UI | `apply-native-feel-nav` |
| *always, in step 4* | `setup-agent-rules` |

`read-research-paper` is never selected by a dependency. Reject it unless the repository actually holds papers to read.

Both TanStack skills selected together also means auditing the Router+Query loader boundary in `use-tanstack-router/query-integration.md`.

## 3. Handle what the table does not cover

- **A framework with no matching skill** (Vue, Svelte, Angular, a backend-only service): select `enforce-code-quality` and `enforce-typescript-strict` only, and say plainly that the library has no skill for the rest of the stack. Do not stretch a React rule onto a non-React codebase.
- **No `package.json` at all**: audit against `enforce-code-quality` and report that dependency-driven selection was not possible.
- **A dependency present but unused** (in the manifest, zero imports): still select the skill, and note the zero-import finding — an unused dependency is itself a fix-plan item.

```bash
grep -rl "@tanstack/react-query" --include=*.ts --include=*.tsx --include=*.js --include=*.jsx . | head
```

## 4. Record the selection

Before auditing anything, write the selection table: skill, the exact dependency and version that selected it, and the file the dependency was found in. Every library skill not in that table is listed underneath with the reason it was rejected.
