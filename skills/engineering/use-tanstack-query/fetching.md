# TanStack Query — when the fetch happens

Disclosed reference. Open from SKILL.md only for the active branch. Parallelism, prefetching, SSR, and retry. How a query is defined is in [core.md](core.md).

## 7. Avoid request waterfalls — fetch independent data in parallel

If two queries don't depend on each other's result, don't fetch them sequentially just because they're written one after another in the component. Fire them together:

```ts
// Avoid (sequential/serial if awaited one after another inside effects)

// Prefer: parallel, fixed number of queries
const { data: todos } = useQuery({ queryKey: todoKeys.all, queryFn: fetchTodos });
const { data: user } = useQuery({ queryKey: ["user", userId], queryFn: () => fetchUser(userId) });

// Prefer: parallel, dynamic/variable number of queries
const results = useQueries({
  queries: todoIds.map((id) => ({ queryKey: todoKeys.detail(id), queryFn: () => fetchTodo(id) })),
});
```

Only make one query depend on another (a "dependent query", via `enabled`) when the second genuinely needs data from the first (e.g. fetching a user's orders requires the user ID from a first query) — don't default to sequential just because it's simpler to write.

## 10. Prefetch to avoid loading spinners, not just to be clever

Prefetch when you can reasonably predict what a user needs next — on hover/focus of a link, at the router/route level (declare each route's data needs ahead of time), or on the server before rendering. `prefetchQuery` respects `staleTime`, so prefetching data that's already fresh is a cheap no-op, not a wasted request.

Prefer router-level prefetching over ad hoc prefetch calls scattered through components — declaring a route's data dependencies in one place is what actually prevents deep request waterfalls as an app grows.

## 11. Server-side rendering: one `QueryClient` per request, real `staleTime`, careful with Suspense

- Create a **new `QueryClient` instance per request** (in server-side code) or once in client-side React state — never share a single `QueryClient` across different users/requests, or you'll leak one user's cached data into another's response.
- Since `staleTime` defaults to `0`, hydrated data is instantly considered stale and will trigger a background refetch immediately on the client after hydration. Set an explicit `staleTime` for anything you prefetch server-side if you don't want that double-fetch.
- If using `useSuspenseQuery` on the client, every one of those queries **must** be prefetched on the server. A `useSuspenseQuery` that wasn't prefetched can cause a markup hydration mismatch (server and client rendering different things), not just a slower load.

For the Next.js App Router specifics (provider placement, `HydrationBoundary`, dehydrating pending queries, `use cache`/`cacheTag`/`updateTag` coordination), see [nextjs.md](nextjs.md).

## 12. Configure retry/backoff deliberately, don't leave it fully default everywhere

The default retry behavior (3 retries with exponential backoff) is reasonable for transient network errors, but isn't right for every case — a 404 or a validation error (4xx) shouldn't be retried at all, since retrying won't change the outcome. Use the `retry` function form to skip retries for non-transient errors:

```ts
useQuery({
  queryKey: todoKeys.all,
  queryFn: fetchTodos,
  retry: (failureCount, error) => {
    if (error instanceof HttpError && error.status >= 400 && error.status < 500) return false;
    return failureCount < 3;
  },
});
```
