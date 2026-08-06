# TanStack Query — detailed rules

Disclosed reference. Open from SKILL.md only for the active branch.

## 16. Transform data in `select`, not in render or in the `queryFn`, for most cases

There are three places to transform query data. Choose the right one per case:

- **In the `queryFn` (before it hits the cache)**: the transformed structure is what all consumers see and what the devtools shows. Runs on every fetch, not memoized. Good when you own the fetch layer and want one canonical shape in the cache. Bad when the transformation is expensive or when you need access to the raw backend shape elsewhere.
- **In the render (inside a custom hook via `useMemo`)**: runs on every render unless memoized. The devtools still shows the raw shape. If you use `useMemo`, depend on `queryInfo.data`, not `queryInfo` — depending on the whole object defeats the memo. Don't spread `...queryInfo` (this invokes all tracked-query getters).
- **In `select` (preferred for most cases)**: runs only when `data` exists (no `undefined` guard needed), and only re-runs when the underlying data changes. Supports partial subscriptions — a component subscribing only to the length of a list won't re-render when an individual item's name changes. Use a stable function reference (module-level function or `useCallback`) not an inline arrow so the selector isn't a new identity on every render.

The selector pattern also enables a powerful custom `useSelector`-like API: accept the selector as a parameter so different consumers can derive different shapes from the same underlying query.

## 17. Re-renders: tracked queries are on by default, avoid object rest destructuring

Since v4 React Query tracks which fields a component accesses during render and only notifies that component when those specific fields change (`notifyOnChangeProps: 'tracked'` is the default). A component that only reads `data` won't re-render when `isFetching` changes. Two things break tracking:

- **Object rest destructuring** (`const { isLoading, ...rest } = useQuery(...)`) forces all fields to be accessed, defeating tracking — always destructure specific fields.
- **Accessing fields only inside effects** — these aren't tracked during render; put the field in the effect's dependency array so it's at least read at render time.

Structural sharing is also on by default: React Query deep-compares new query results to the previous ones and keeps unchanged references stable, so a re-render only reaches components that subscribe to the part of the data that actually changed.

## 18. Error handling: use the `error` property for inline errors, `throwOnError` to push to an Error Boundary, and the global `QueryCache` callback for toast notifications

These three mechanisms serve different needs — use them in combination:

- **`isError`/`error` property**: for inline, per-component error UI (an "alert" below a form, a banner in the section that failed). Be careful not to unmount good data unnecessarily for background refetch failures — check `isError && !data` rather than `isError` alone if the component should keep showing stale data on a background failure.
- **`throwOnError: true` (or a function for granularity)**: propagates the error to the nearest Error Boundary instead of handling it locally. Use a function to be selective — e.g. only throw to the boundary for 5xx server errors, handle 4xx locally.
- **Global `QueryCache` `onError` callback**: the right place for toast notifications, since it fires exactly once per failed query regardless of how many components are subscribed. Check `query.state.data !== undefined` inside it to only toast on *background* failures (where there was already something on screen), not on first-load failures where an Error Boundary or inline error is the better fit.

Avoid putting toast notifications in a `useEffect` inside a custom hook — that fires once per observer, so two components using the same hook produce two toasts from one failed network request.

