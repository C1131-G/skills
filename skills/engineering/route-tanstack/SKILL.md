---
name: route-tanstack
role: router
description: >
  MAIN router for TanStack. Invoke this skill only (not its leaves).
  Modes: bare=audit report, :check=fix, :write=implement. Decision-loads
  use-tanstack-query | use-tanstack-router | use-tanstack-form | use-tanstack-table.
disable-model-invocation: true
---

# route-tanstack

**Main skill.** User invokes **this** name. Leaves are **not** mains.

| Invoke | Mode |
|---|---|
| `route-tanstack` | audit — report only |
| `route-tanstack:check` | audit + fix |
| `route-tanstack:write` | implement under Decision leaves |

If the user names a leaf (`use-tanstack-query`, …), **redirect here** with the same mode and Decision-select that leaf only.

Skip packages not in the project. On write/check: apply ALWAYS in scope.

## Leaves (internal only)

| Leaf | Load when |
|---|---|
| `../use-tanstack-query/SKILL.md` | Server state, `useQuery`/`useMutation`, keys, cache |
| `../use-tanstack-router/SKILL.md` | File routes, loaders, typed params/search, prefetch |
| `../use-tanstack-form/SKILL.md` | Forms, Standard Schema, field/form split |
| `../use-tanstack-table/SKILL.md` | Headless tables, row models, server mode |

Load **only** Decision-matched leaves. One at a time → COMPACT between leaves.

## Decision

| Task | Leaf |
|---|---|
| Server state, cache, mutations | query |
| File routes, loaders, typed search | router |
| Forms, validation, canSubmit | form |
| Headless tables, row models | table |

## Connections (pair mains)

| Pair | Rule |
|---|---|
| + `route-react-async-ui` | Mutations / optimistic / pending UI live in async-ui; query owns keys + invalidation |
| query + router leaves | Loader: `ensureQueryData` / `prefetchQuery`; component: `useSuspenseQuery` same `queryOptions` |
| + `audit-react-effects` | No `useEffect` for route or server data |
| + `use-zustand` | Server state in Query; client UI in Zustand — never both for the same data |

## Mode behavior

| Mode | Action |
|---|---|
| audit | Scan selected leaves → report; no edits |
| check | Fix leaf rules + gate |
| write | Implement under selected leaves + gate |

## Done when

Selected leaves applied under this main; unused TanStack packages not loaded; leaves not top-level in the user report.
