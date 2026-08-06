# TanStack Query — detailed rules

Disclosed reference. Open from SKILL.md only for the active branch.

## 23. Testing: create a new `QueryClient` per test, disable retries, use MSW for network mocks

- **A new `QueryClient` per test**, not shared across tests. Shared state leaks between tests and causes flaky failures. Create the client inside a factory function called per test, wrapped in `QueryClientProvider`.
- **Disable retries in tests** via `defaultOptions.queries.retry: false`. The default three retries with exponential backoff will cause timeout failures for error-state tests without this — timeouts are the most common React Query testing gotcha.
- **Use `setQueryDefaults` instead of hardcoding `retry: 5` directly on a `useQuery` call** — options set directly on `useQuery` override the `defaultOptions`, making them impossible to turn off in tests. Any query-level setting that might need to be overridden in tests should be set via `queryClient.setQueryDefaults(queryKey, options)` instead.
- **Mock the network layer with MSW** (Mock Service Worker), not by mocking `fetch`/`axios` directly. MSW works at the network level, which means it works for both tests and Storybook and gives a single source of truth for mock API behavior.
- **Always await async state** in tests — use `await waitFor(() => expect(result.current.isSuccess).toBe(true))` before asserting on data, since queries are async and the component starts in pending state.

## 24. `placeholderData` vs. `initialData` — they are not interchangeable

Both pre-fill a query so the component starts in `success` state rather than `pending`, but they work at different levels and behave very differently in important edge cases:

| | `initialData` | `placeholderData` |
|---|---|---|
| Cache level | Cache entry (global) | Observer (per component) |
| Persisted to cache | ✅ Yes | ❌ No |
| Respects `staleTime` | ✅ Yes | ❌ Always triggers background refetch |
| Shown in devtools as real data | ✅ Yes | ❌ No |
| `isPlaceholderData` flag | ❌ No | ✅ Yes |
| On background refetch error | Error state + data both present | Error state, data disappears |

Use `initialData` when pre-filling from another query's existing cache entry (e.g. a detail view seeded from a list). Use `placeholderData` (typically `keepPreviousData`) for everything else — especially pagination and filter transitions where you want to keep showing the current page while the next one loads. Pre-filling with `initialData` also needs `initialDataUpdatedAt` set (use `queryClient.getQueryState(...).dataUpdatedAt`) so React Query knows when that data was last fetched and can trigger a background refetch correctly.

## 25. TanStack Router + Query: treat the loader as a fire-and-forget cache primer, always read data via `useQuery`/`useSuspenseQuery`

When combining TanStack Router with TanStack Query, the loader's job is to start the fetch early — nothing more. Never read from `Route.useLoaderData()` for data that's also in the Query cache: without a `useQuery` or `useSuspenseQuery` call, React Query sees no observer for that query, which means:
- No automatic background refetches (`refetchOnWindowFocus`, `refetchOnReconnect`)
- `invalidateQueries` won't refetch it (no active observer)
- The query is eligible for garbage collection even while "in use"

The integration between the two works best with this pattern:
1. **Loader**: fire `queryClient.prefetchQuery(options)` or `ensureQueryData(options)` — both start the fetch, the difference is whether you await it (blocking navigation) or not (deferred, showing a loading state)
2. **Component**: read the data with `useSuspenseQuery(options)` (using the same `queryOptions` factory) — this creates the observer and integrates with the router's Suspense/Error boundaries
3. **Router setup**: set `defaultPreloadStaleTime: 0` and `defaultPendingComponent`/`defaultErrorComponent` globally — this turns off the router's own cache (let Query own it) and wires up boundaries once rather than per-route

The `await`-or-not decision in the loader determines blocking vs. deferred loading, but it doesn't have to live in the loader when using Query — it can be deferred to the component by using `useSuspenseQuery` (blocking, reads from cache or waits for the in-flight promise) vs. `useQuery` (non-blocking, renders immediately while data loads).

## 26. `select` with an expensive transformation: stabilize the reference and externally memoize

`select` runs per `QueryObserver` — so if the same query is subscribed to by three components, the selector runs three times even if data hasn't changed. For an expensive transformation, two levels of memoization are needed:

1. **Stabilize the function reference** so React Query can skip re-running when the function identity is the same: either extract it to module scope (if it has no prop dependencies) or wrap it in `useCallback` (if it closes over changing values). An inline arrow function is always a new reference, so it always re-runs.
2. **Externally memoize the transformation itself** (e.g. with `fast-memoize`) for the case where the same query is used by multiple components — even with a stable reference, `select` runs once per observer, so a truly expensive transformation can still run N times for N subscribers. External memoization makes it run once per unique input regardless of how many observers are listening.

## 27. Prefer `queryOptions` factories over custom hooks as the primary abstraction

Custom hooks (`useInvoice`, `useCurrentUser`) have a fundamental limitation: they can only be called from React components or other hooks, so they can't be used in route loaders, `prefetchQuery` calls, or event handlers. They also tie you to a specific implementation (`useQuery`) when you might want `useSuspenseQuery` or `useQueries` for a different call site.

Use `queryOptions(...)` factories as the first abstraction building block instead. They're just functions — usable anywhere — and compose cleanly:

```ts
// Define once
const invoiceOptions = (id: number) =>
  queryOptions({ queryKey: ['invoice', id], queryFn: () => fetchInvoice(id) });

// Use with any hook or imperative function — same types, no generics
useQuery(invoiceOptions(1));
useSuspenseQuery(invoiceOptions(2));
queryClient.prefetchQuery(invoiceOptions(3));

// Add per-callsite options by spreading on top
useQuery({ ...invoiceOptions(1), select: (i) => i.createdAt, throwOnError: true });
```

The best `queryOptions` factories aren't configurable — they only contain the options shared by every caller. Per-callsite variations (a different `staleTime`, a `select`, `throwOnError`) go at the callsite via spread, not as parameters to the factory. This keeps the factory minimal and makes the type inference flow correctly without needing to manually thread generics.

## 28. Use the `QueryFunctionContext` to read query key params instead of closing over them

For queries with many parameters, using the inline-closure pattern (closing over variables from the component into the `queryFn`) makes it easy to let a variable creep into the `queryFn` without also being added to the `queryKey`, which silently breaks refetch-on-key-change. Instead, read parameters directly from the `QueryFunctionContext` — this makes it structurally impossible to have a dependency in the `queryFn` that isn't in the `queryKey`:

```ts
// Avoid — easy for queryKey and queryFn dependencies to diverge
useQuery({ queryKey: ['todos', state], queryFn: () => fetchTodos(state, sorting) }); // sorting missing from key!

// Prefer — queryFn reads everything from the key via context
const fetchTodos = async ({ queryKey: [, state, sorting] }: QueryFunctionContext) =>
  fetchTodosApi(state, sorting);

useQuery({ queryKey: ['todos', state, sorting] as const, queryFn: fetchTodos });
```

For object-shaped keys (which enable named destructuring rather than positional array destructuring and better fuzzy-matching across scopes), type the context with `QueryFunctionContext<ReturnType<typeof myKeyFactory>>`.

## 29. WebSockets: keep the standard queries, add an app-wide effect that calls `invalidateQueries` on server events

React Query has no built-in WebSocket support — it doesn't need one. Standard queries remain unchanged; add a single app-wide `useEffect` that opens a WebSocket connection and calls `queryClient.invalidateQueries(...)` when events arrive:

```ts
const useReactQuerySubscription = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const ws = new WebSocket('wss://your-api.com/ws');
    ws.onmessage = (event) => {
      const { entity, id } = JSON.parse(event.data);
      queryClient.invalidateQueries({ queryKey: [entity, id].filter(Boolean) });
    };
    return () => ws.close();
  }, [queryClient]);
};
```

Invalidation is better than pushing data directly: events for entities the user isn't currently viewing do nothing (no active observers), while pushing data via `setQueriesData` bypasses all type safety and staleness tracking. If you're pushing real-time updates via WebSockets, set `staleTime: Infinity` globally — you've already opted into server-push, so the default refetch-on-focus behavior is redundant.

## 30. Forms: keep server state and client (form) state deliberately separate

When a form is editing server-fetched data, decide upfront which approach you want:

**Option A — Copy server state as one-time initial values.** Put the server data into the form's `defaultValues` on first render, then let the form own it. Background refetches won't update the form (the user is mid-edit), so either set `staleTime: Infinity` on that query (since background updates won't reach the form anyway) or accept that they happen silently. To avoid the "data is undefined on first render" problem, split the parent (which fetches and shows loading/error) from the child `<Form>` component (which receives fully-loaded data as props and uses it as `defaultValues`).

**Option B — Keep server state in the query, track changes in form state, derive the display value.** Keep the query active (background updates still come through); the form only holds the user's *delta*. Each field's displayed value is `fieldValue ?? serverValue`. Reset form state to `undefined` after a successful submit so the next serverValue from the cache is picked up automatically. This approach is more complex but means collaborators' changes still appear in untouched fields.

Both are valid. The mistake is not choosing deliberately: copying state without knowing the tradeoffs means silent bugs when background refetches arrive mid-edit.

## 31. Use React Context + React Query together when data is shared implicitly across a subtree

If a deeply-nested component uses `useCurrentUserQuery()` or similar "global user data" queries, TypeScript will always tell you `data` might be undefined — even though you know it can't be, because the query was started far up the tree. This implicit dependency is dangerous: it works today, but breaks silently if `UserNameDisplay` is ever rendered without the parent that initialized the query.

The fix: wrap the query result in React Context. The parent that actually loads the data handles loading/error states and only renders children (via `children` prop from the Provider) once data is available. Downstream components read from context, not from the query, and the non-null assertion is no longer needed because the context type is `User`, not `User | undefined`. This also lets you add a runtime invariant (`throw new Error('Missing provider')`) so misuse fails fast with a useful message rather than a mysterious runtime error.

React Context is not state syncing here — there's one source of truth (the query). Context is just a typed delivery mechanism for data that's already been loaded, identical conceptually to passing a prop but without the intermediate layers.

## 32. `refetch` doesn't take parameters — that's by design, use the query key instead

A common misunderstanding: developers try to do `refetch({ id: 2 })` to fetch different data. This isn't how React Query works and `refetch` doesn't accept parameters. `refetch` replays the same request with the same query key — and the query key is what determines which cached entry data lands in. To fetch for a different id, change the variable in the query key itself (e.g. update a piece of state that the key depends on). This is the declarative approach: "I always want data for the current id" rather than "I want to trigger a refetch with this id."

