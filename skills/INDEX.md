# Skill index

Machine-readable map of every skill in this repository. One row per skill; the **Signal** column is what to match against — a dependency, a file pattern, or a phrase the user typed.

Paths are relative to this file. Every skill lives at `<category>/<name>/SKILL.md`.

## How to use this file

1. Match the task against **Signal**. More than one row can match — load all of them.
2. Open that row's `SKILL.md`. It is a router when the **References** column is non-empty: open only the reference files for the branch you need.
3. `enforce-code-quality` applies to every code change; `enforce-typescript-strict` to every `.ts`/`.tsx` change. They are never the only skill for a task.

## Index

| Skill | Signal | Path | References |
|---|---|---|---|
| enforce-code-quality | any code change, any language | [engineering/enforce-code-quality/SKILL.md](engineering/enforce-code-quality/SKILL.md) | — |
| enforce-typescript-strict | any `.ts` / `.tsx` file; `as any`, `@ts-ignore`, failing `tsc` | [engineering/enforce-typescript-strict/SKILL.md](engineering/enforce-typescript-strict/SKILL.md) | — |
| audit-react-effects | `useEffect` about to be written or edited; render loops; state that lags a render | [engineering/audit-react-effects/SKILL.md](engineering/audit-react-effects/SKILL.md) | `CASES.md` |
| apply-react-async-ui | an interaction that waits on the server: submit, save, spinner placement, double-submit | [engineering/apply-react-async-ui/SKILL.md](engineering/apply-react-async-ui/SKILL.md) | `pending.md`, `optimistic.md`, `boundaries.md` |
| use-tanstack-query | `@tanstack/react-query`; `useQuery`, `useMutation`, `queryClient`; stale list after save | [engineering/use-tanstack-query/SKILL.md](engineering/use-tanstack-query/SKILL.md) | `core.md`, `fetching.md`, `invalidation.md`, `mutations.md`, `cache-writes.md`, `render.md`, `advanced.md`, `nextjs.md`, `nextjs-cache.md` |
| use-tanstack-router | `@tanstack/react-router`; `createFileRoute`, route loaders, search params | [engineering/use-tanstack-router/SKILL.md](engineering/use-tanstack-router/SKILL.md) | `query-integration.md` |
| apply-toasts | `sonner` or any toast library; "show a message when it saves"; `alert()` used for feedback | [engineering/apply-toasts/SKILL.md](engineering/apply-toasts/SKILL.md) | `motion.md` |
| apply-native-feel-nav | route transitions, gestures, tap highlight, safe areas, mobile viewport; "feels like a website" | [engineering/apply-native-feel-nav/SKILL.md](engineering/apply-native-feel-nav/SKILL.md) | `motion.md`, `touch.md`, `viewport.md` |
| apply-next-shell-nav | `next`; a sidebar or app shell; layout that remounts or flashes on navigation | [engineering/apply-next-shell-nav/SKILL.md](engineering/apply-next-shell-nav/SKILL.md) | `review.md` |
| setup-agent-rules | onboarding a repository; "set up AGENTS.md"; skills exist but never load | [engineering/setup-agent-rules/SKILL.md](engineering/setup-agent-rules/SKILL.md) | — |
| audit-with-skills | "audit my project", "check my skills are applied", "which skills does this repo need" | [engineering/audit-with-skills/SKILL.md](engineering/audit-with-skills/SKILL.md) | `detection.md`, `tanstack.md`, `evidence.md`, `report.md` |
| read-research-paper | a paper, an arXiv or DOI link, "is this paper any good" | [productivity/read-research-paper/SKILL.md](productivity/read-research-paper/SKILL.md) | — |

## Pairings

Rows that almost always fire together:

| If you loaded | Also load | Because |
|---|---|---|
| `use-tanstack-query` | `apply-react-async-ui` | Query owns keys, cache and invalidation; async-ui owns pending and optimistic UI |
| `use-tanstack-query` + `use-tanstack-router` | `use-tanstack-router/query-integration.md` | The loader boundary: `ensureQueryData` in the loader, `useSuspenseQuery` on the same `queryOptions` |
| `apply-next-shell-nav` | `apply-native-feel-nav` | Shell structure vs the motion layered on it |
| any of the above | `enforce-code-quality` | Always in scope for a code change |
| `audit-with-skills` | `setup-agent-rules` | The audit applies it when the project's decision table is missing or stale |

## Invariants

This file is the routing surface, so it is kept true:

- Every `<category>/<name>/SKILL.md` on disk has exactly one row here.
- Every path and reference filename in a row exists.
- A row's skill name matches the `name:` in that file's frontmatter and its directory name.
