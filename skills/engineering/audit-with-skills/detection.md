# Detection — stack to skills

Two inventories drive the audit: what the **project** contains, and what **skills are installed on the machine**. Build both before selecting anything.

## 1. Find every manifest

A single root `package.json` is the exception, not the rule. Collect all of them, minus dependencies:

```bash
find . -name package.json -not -path '*/node_modules/*' -not -path '*/.git/*'
```

Read each one. For a monorepo, audit each workspace against the skills **its own** manifest selects — a Next.js app and a plain library in the same repo do not get the same rule set. Say which workspace each finding belongs to.

Also read, when present: `tsconfig.json` (and every extended base), `next.config.*`, `vite.config.*`, `app.json` / `app.config.*` (Expo), `tailwind.config.*`, `eslint.config.*` / `.eslintrc.*`, `vitest.config.*`, and the lockfile for the **resolved** versions.

```bash
node -e "const p=require('./package.json');console.log(JSON.stringify({...p.dependencies,...p.devDependencies},null,2))"
```

Record the installed major of anything a rule depends on — React 18 and React 19 do not have the same async-UI primitives, and TanStack Query v4 and v5 do not have the same callbacks.

## 2. Inventory every installed skill

The audit uses **all suitable skills on the machine**, not only the ones from this repository. Search every root that exists:

```bash
for root in ~/.agents/skills ~/.claude/skills .agents/skills .claude/skills .codex/skills .cursor/skills; do
  [ -d "$root" ] && echo "== $root" && ls "$root"
done
```

Then read only the frontmatter of each — name, role, description — never the bodies at this stage:

```bash
for f in ~/.agents/skills/*/SKILL.md; do awk '/^---$/{n++; next} n==1' "$f" | grep -E '^(name|role|description|disable-model-invocation):' ; echo "--- $f"; done
```

The `description` is the whole matching surface: it names the triggers and the code signals. Match the project's signals against it.

### Respect main / leaf routing

Some libraries mark a skill's place in a hierarchy. Honor it:

| Frontmatter | Kind | Select it? |
|---|---|---|
| `role: entry` | Entry orchestrator (`skill-master`) | Yes — if present, it defines the run's mode and ordering; follow it |
| `role: router` (`route-*`) | Main router over leaves | **Yes — select the router** |
| `disable-model-invocation: true` on a child, or a router lists it as a leaf | Leaf | **No — never select directly.** It is audited *through* its router |
| No role | Standalone main | Yes, when its description matches a project signal |

Selecting a leaf that belongs to a router splits the audit and loses the router's cross-leaf rules. Name the router; record which leaves its Decision table selects for this project, and audit those leaves' rules under it.

De-duplicate across roots by skill name. If two roots hold the same name with different content, audit the one the agent would actually load (project root beats home root), and report the divergence.

## 3. Map project signals to skills

Highest-confidence rows first. A name in this table is only selected **if the inventory from step 2 contains it** — otherwise it is a gap, reported in step 4.

| Present in a manifest / repo | Select |
|---|---|
| *anything at all* | `enforce-code-quality` |
| `typescript`, or any `.ts` / `.tsx` file | `enforce-typescript-strict` |
| `react` | `audit-react-effects`, plus `route-react-async-ui` (or `apply-react-async-ui` if no router is installed) |
| **any `@tanstack/*` package** | `route-tanstack`, **plus the skills the packages ship via TanStack Intent** — see the TanStack section below |
| `next` | the Next.js architecture / shell skills in the inventory, plus every `react` row |
| `expo`, `react-native` | the `expo-*` / react-native skills whose descriptions match what the repo actually does (router, data fetching, UI, EAS) |
| `sonner` | `apply-toasts` |
| `react-hot-toast`, `react-toastify`, `@radix-ui/react-toast`, or a hand-rolled toast | `apply-toasts` — audit it, and put the migration to `sonner` in the plan as a recommendation, not a `FAIL` |
| `zustand`, `jotai`, `redux` | the client-state skill in the inventory (`use-zustand`) — and check the server/client state split against the TanStack rules |
| `vitest`, `jest` | the testing skills (`vitest`, `test-backend` / its router `route-backend`) |
| `fastify`, `express`, `hono`, a `prisma`/`drizzle` schema | `route-backend` (or its standalone equivalents) |
| `supabase`, `@supabase/*` | the Supabase skills |
| `framer-motion` / `motion`, view transitions, gestures, mobile viewport | the animation and native-feel skills (`animate`, `apply-native-feel-nav`) |
| *always, in step 4 of the procedure* | `setup-agent-rules` |

Skills with no project signal — writing, video, marketing, research, design-review skills — are **not** selected by a code audit. List them as rejected with "not a code-audit skill", once, as a group.

## 4. TanStack

Any `@tanstack/*` dependency puts the whole TanStack rule set in scope — **and** the version-matched skills the packages ship themselves through [TanStack Intent](https://tanstack.com/intent/latest). Both are in [tanstack.md](tanstack.md).

## 5. Handle what the tables do not cover

- **A stack with no matching installed skill** (Vue, Svelte, Angular, Go, Python): select `enforce-code-quality` and, for TypeScript, `enforce-typescript-strict`, then say plainly that no installed skill covers the rest. Do not stretch a React rule onto a non-React codebase.
- **A selected skill missing from every root**: that is the install gap handled in step 3 of the procedure.
- **No `package.json` at all**: audit against `enforce-code-quality` and report that dependency-driven selection was not possible.

## 6. Record the selection

Before auditing anything, write the selection table: skill, the root it was found in, the exact dependency and version that selected it, and the manifest that dependency came from. Every inventoried skill not selected is listed underneath with its reason — individually for code skills, as one group for the non-code ones.
