# Engineering

Daily engineering skills. Install with `npx skills@latest add C1131-G/skills`.

Every skill is independently invokable. Name the skill and describe whether you want implementation, fixes, review, or explanation in ordinary language.

All engineering skills apply `enforce-code-quality`. After writing or changing app code, add or update relevant tests, run focused checks, then run the affected app's full available tests, type checking, linting, and production build. Fix in-scope failures and rerun until green; report unrelated or externally blocked failures exactly. Review-only requests remain read-only.

Larger skills are a thin `SKILL.md` router plus disclosed reference files. Open only the reference for the branch you need.

The full routing table, including the signal that should load each skill, is in [../INDEX.md](../INDEX.md).

## React and frontend

| Skill | Covers | References |
|---|---|---|
| [apply-react-async-ui](./apply-react-async-ui/SKILL.md) | Pending state, optimistic updates, loading boundaries | `pending.md`, `optimistic.md`, `boundaries.md` |
| [audit-react-effects](./audit-react-effects/SKILL.md) | Eliminating unnecessary `useEffect` | `CASES.md` |
| [apply-toasts](./apply-toasts/SKILL.md) | Sonner, toast-vs-inline-vs-modal, accessibility | `motion.md` |
| [apply-native-feel-nav](./apply-native-feel-nav/SKILL.md) | Navigation motion and mobile ergonomics | `motion.md`, `touch.md`, `viewport.md` |
| [apply-next-shell-nav](./apply-next-shell-nav/SKILL.md) | Next.js App Router shell structure | `review.md` |

## TanStack

| Skill | Covers | References |
|---|---|---|
| [use-tanstack-query](./use-tanstack-query/SKILL.md) | Server state, keys, caching, mutations, SSR | `core.md`, `fetching.md`, `invalidation.md`, `mutations.md`, `cache-writes.md`, `render.md`, `advanced.md`, `nextjs.md`, `nextjs-cache.md` |
| [use-tanstack-router](./use-tanstack-router/SKILL.md) | File routes, search params, links, layouts | `query-integration.md` |

## Cross-cutting

| Skill | Covers | References |
|---|---|---|
| [enforce-code-quality](./enforce-code-quality/SKILL.md) | Minimal diffs, size limits (vendored and generated code exempt), naming, verification, commit hygiene | — |
| [enforce-typescript-strict](./enforce-typescript-strict/SKILL.md) | Strictness rules and compiler flags | — |
| [setup-agent-rules](./setup-agent-rules/SKILL.md) | Writing a project's `AGENTS.md` so the right skills get loaded | — |
| [audit-with-skills](./audit-with-skills/SKILL.md) | Picking the skills a project's `package.json` implies, then auditing every rule and planning the fixes | `detection.md`, `tanstack.md`, `evidence.md`, `report.md` |

## How they connect

- `apply-react-async-ui` ← the optimistic/pending half of any `use-tanstack-query` mutation.
- `use-tanstack-router` → owns the canonical Router+Query loader pattern; `use-tanstack-query/advanced.md` points at it.
- `apply-next-shell-nav` owns shell **structure**; `apply-native-feel-nav` owns the **motion** on top of it.
- `audit-react-effects` applies wherever another system (a loader, a query, an event handler) should own the behavior instead.
- `audit-with-skills` selects which of the above a given repository needs, and calls `setup-agent-rules` when the routing table is missing or stale.
