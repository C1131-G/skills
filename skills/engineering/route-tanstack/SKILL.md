---
name: route-tanstack
description: >
  TanStack router skill. Routes to use-tanstack-query, use-tanstack-router,
  use-tanstack-form, use-tanstack-table. Only load leaves the task needs. Called by skill-master.
disable-model-invocation: true
---

# route-tanstack

Load **only** the sub-skills the task needs. Skip packages not in the project.

## Decision

| Task | Read |
|---|---|
| Server state, `useQuery`/`useMutation`, keys, cache | `../use-tanstack-query/SKILL.md` |
| File routes, loaders, typed params/search, prefetch | `../use-tanstack-router/SKILL.md` |
| Forms, Standard Schema, field/form split | `../use-tanstack-form/SKILL.md` |
| Headless tables, row models, server mode | `../use-tanstack-table/SKILL.md` |

## Connections

| Pair | Rule |
|---|---|
| query + `route-react-async-ui` | Mutations / optimistic UI live in async-ui; query owns cache keys + invalidation |
| router + query | Loader: `ensureQueryData` / `prefetchQuery`; component: `useSuspenseQuery` same `queryOptions` — never `useLoaderData` alone for Query data |
| router + `audit-react-effects` | No `useEffect` for route data |
| query + `use-zustand` | Server state in Query; client UI state in Zustand — never both for the same data |

## Done when

Selected leaf skills applied; unused TanStack packages not loaded.
