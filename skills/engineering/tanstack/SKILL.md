---
name: tanstack
description: TanStack router. Routes to query, router, form, table. Only load leaves the task needs. Called by master.
disable-model-invocation: true
---

# TanStack — Router

Load **only** the sub-skills the task needs. Skip packages not in the project.

## Decision

| Task | Read |
|---|---|
| Server state, `useQuery`/`useMutation`, keys, cache | `../tanstack-query/SKILL.md` |
| File routes, loaders, typed params/search, prefetch | `../tanstack-router/SKILL.md` |
| Forms, Standard Schema, field/form split | `../tanstack-form/SKILL.md` |
| Headless tables, row models, server mode | `../tanstack-table/SKILL.md` |

## Connections

| Pair | Rule |
|---|---|
| query + `react-async-ui` | Mutations / optimistic UI live in async-ui; query owns cache keys + invalidation |
| router + query | Loader: `ensureQueryData` / `prefetchQuery`; component: `useSuspenseQuery` same `queryOptions` — never `useLoaderData` alone for Query data |
| router + `react-effect-audit` | No `useEffect` for route data |
| query + `zustand-state` | Server state in Query; client UI state in Zustand — never both for the same data |

## Done when

Selected leaf skills applied; unused TanStack packages not loaded.
