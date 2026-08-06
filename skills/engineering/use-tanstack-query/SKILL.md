---
name: use-tanstack-query
description: TanStack Query — keys, queryOptions, cache, mutations. Use when the project has @tanstack/react-query and the task touches server state. Called by skill-master / tanstack router.
disable-model-invocation: true
---

# use-tanstack-query

Apply when writing or reviewing server-state code. **Load disclosed files only for the branch you need.**

| Branch | Open |
|---|---|
| Keys, enabled, staleTime, parallel, queryOptions, prefetch, SSR, retry, no local-state copy | [core.md](core.md) |
| mutate vs mutateAsync, MutationCache, concurrent optimistic, data-before-error | [mutations.md](mutations.md) |
| select / transform, tracked queries, error/toast strategy | [render.md](render.md) |
| Testing, placeholder vs initialData, Router+Query, WebSockets, forms, context | [advanced.md](advanced.md) |

Optimistic UI path → also `route-react-async-ui` / `apply-react-optimistic`. Client UI state → `use-zustand`, not the query cache.

## Non-negotiables (every change)

1. **Never conditional hooks** — use `enabled`.
2. **Hierarchical key factories**; key = dependency array of the `queryFn`.
3. **`queryOptions` factories** over custom hooks as the primary share unit.
4. **Await/return** `invalidateQueries` in mutation callbacks.
5. Prefer **`setQueriesData`** when the mutation already returns the new entity.
6. Explicit **`staleTime`**; do not confuse with `gcTime`.
7. **Parallel** independent queries (`useQueries` when N is dynamic).
8. **`select`** for slices; no object rest from `useQuery` (breaks tracking).
9. Do **not** copy query `data` into `useState` (except deliberate one-time form seed).
10. Cache is **not** a general client store.
11. Mutations: prefer **`mutate`**; always-run logic on `useMutation` callbacks; UI-only on call-site callbacks.
12. Optimistic: `cancelQueries` in `onMutate`; last mutator invalidates via `isMutating === 1`.
13. Render: if `data` exists, show it before treating background `isError` as fatal.
14. Router: loader primes cache; component reads via `useSuspenseQuery` / `useQuery` — not loader data alone.
15. Devtools **dev only**.

## Done when

Touched queries/mutations follow non-negotiables; deeper file opened only if the branch applied; pairs with async-ui/zustand respected.
