---
name: use-tanstack-query
description: Use TanStack Query for server state, query keys, queryOptions, caching, mutations, prefetching, rendering, tests, and Next.js App Router hydration. Use on any file importing useQuery, useMutation, useSuspenseQuery, or queryClient. Triggers on "the list doesn't update after saving", a field that goes blank or stale after a submit or refetch, duplicate requests, a loading spinner on every navigation, and cache invalidation questions.
---

# use-tanstack-query

Use this skill directly for TanStack Query. Load only the disclosed reference files needed for the current task.

Also apply `enforce-code-quality` and `enforce-typescript-strict` to files in scope.

Apply when writing or reviewing server-state code. **Load disclosed files only for the branch you need.**

| Branch | Open |
|---|---|
| Keys, enabled, staleTime, parallel, queryOptions, prefetch, SSR, retry, no local-state copy | [core.md](core.md) |
| mutate vs mutateAsync, MutationCache, concurrent optimistic, data-before-error | [mutations.md](mutations.md) |
| select / transform, tracked queries, error/toast strategy | [render.md](render.md) |
| Testing, placeholder vs initialData, Router+Query, WebSockets, forms, context | [advanced.md](advanced.md) |
| Writing the cache directly: `setQueryData`, `setQueriesData`, seeding, infinite shape | [cache-writes.md](cache-writes.md) |
| Next.js App Router: providers, HydrationBoundary, `use cache` / `cacheTag`, `updateTag` | [nextjs.md](nextjs.md) |

Optimistic UI, pending state, and loading boundaries → `apply-react-async-ui`. Client UI state → a dedicated client-state store, not the query cache.

## Non-negotiables (every change)

1. **Never conditional hooks** — use `enabled`.
2. **Hierarchical key factories**; key = dependency array of the `queryFn`.
3. **`queryOptions` factories** over custom hooks as the primary share unit.
4. **Await/return** `invalidateQueries` in mutation callbacks.
5. Prefer **`setQueriesData`** when the mutation already returns the new entity; cache writes are **immutable**, exact-key, and mark data fresh.
6. Explicit **`staleTime`**; do not confuse with `gcTime`.
7. **Parallel** independent queries (`useQueries` when N is dynamic).
8. **`select`** for slices; no object rest from `useQuery` (breaks tracking).
9. Do **not** copy query `data` into `useState` (except deliberate one-time form seed).
10. Cache is **not** a general client store.
11. Mutations: prefer **`mutate`**; always-run logic on `useMutation` callbacks; UI-only on call-site callbacks.
12. Optimistic: `cancelQueries` in `onMutate`; last mutator invalidates via `isMutating === 1`.
13. Render: if `data` exists, show it before treating background `isError` as fatal.
14. Router: place `queryOptions` in Route `context` (with `loaderDeps` for search params) so loader (`ensureQueryData`) and component (`useSuspenseQuery` via `useRouteContext`) share a single source of truth and never diverge.
15. Devtools **dev only**.
16. **Next.js App Router**: skip the library entirely for read-once data (`use()` on a server promise); one `QueryClient` per server render + a browser singleton; server prefetch and client hook share **one exported cache contract** (query key + `cacheTag`).

## Done when

Touched queries/mutations follow non-negotiables; deeper file opened only if the branch applied; pairs with async-ui/zustand respected.
