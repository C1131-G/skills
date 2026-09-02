# TanStack Query — defining a query

Disclosed reference. Open from SKILL.md only for the active branch. Rule numbers are stable across files: fetching timing is in [fetching.md](fetching.md), keeping data fresh in [invalidation.md](invalidation.md).

## 1. Never call `useQuery`/`useMutation` conditionally — use `enabled` instead

Calling a hook inside an `if` block violates the Rules of Hooks and can crash or produce inconsistent hook order across renders. Using `!` on a possibly-undefined value to force the call through just hides a real null-safety bug from TypeScript.

Keep the hook call unconditional; make the *fetch* conditional with `enabled`:

```ts
// Avoid:
if (userId) {
  const { data } = useQuery(userOptions(userId)); // conditional hook call
}
useQuery({ queryKey: ["user", userId], queryFn: () => fetchUser(userId!) }); // lying to TS

// Prefer:
useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId!), // safe: only runs once enabled is true
  enabled: !!userId,
});
```

Best: extract the whole thing into a `queryOptions(...)` factory (see rule 8) so `enabled` and the key are always defined together, not duplicated at each call site.

`enabled` unlocks more than just "skip until a value exists" — it's the general mechanism for several distinct patterns, worth recognizing as the same tool rather than reaching for something bespoke each time:
- **Dependent queries**: run a second query only once a first one has successfully returned data it depends on.
- **Pausing an active query**: a query polling on an interval (`refetchInterval`) can be temporarily paused (e.g. while a modal is open) by toggling `enabled` rather than tearing the query down and recreating it.
- **Waiting for user input**: a query whose key includes filter/search criteria can stay disabled until the user has actually applied a filter, instead of firing on default/empty criteria first.
- **Deferring to a local draft**: if a draft value should temporarily take precedence over server data (e.g. mid-edit), disable the query while the draft is active rather than letting a background refetch overwrite it.

## 2. Use hierarchical, factory-generated query keys

Query keys are arrays matched by TanStack Query left-to-right (by prefix). Structure them hierarchically so a broad invalidation ("everything about todos") doesn't require knowing every specific key:

```ts
// Avoid: flat keys that can't be bulk-invalidated
["gamification-actions"];
["challenges"];

// Prefer: a key factory
const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters: TodoFilters) => [...todoKeys.lists(), filters] as const,
  detail: (id: string) => [...todoKeys.all, "detail", id] as const,
};

useQuery({ queryKey: todoKeys.list(filters), queryFn: () => fetchTodos(filters) });
queryClient.invalidateQueries({ queryKey: todoKeys.all }); // wipes every todos query at once
```

**Treat the query key like `useEffect`'s dependency array.** A changed query key is what triggers a refetch — so any variable the `queryFn` actually uses to fetch data should be part of the key, the same way a value read inside an effect belongs in its dependency array. If a variable is passed into `queryFn` but left out of `queryKey`, changing that variable won't trigger a refetch, and two different filter states can silently collide on the same cache entry. In practice, there's rarely a reason to pass something to `queryFn` that isn't also in `queryKey`.

## 6. Set `staleTime` deliberately; understand `gcTime` is not the same thing

A common misconception worth clearing up first: TanStack Query does **not** re-run `queryFn` on every component re-render, even with the default `staleTime` of `0`. A component can re-render for many unrelated reasons; refetching on every one of them would be unusable. If a refetch shows up that seems unexpected, the most common cause is `refetchOnWindowFocus` — a background refetch fired when the user returns to the tab, which is deliberately silent (no loading spinner, no re-render if the data hasn't actually changed). Since v5 this listens to the `visibilitychange` event specifically rather than the raw `focus` event, which cuts down on spurious refetches triggered by switching to devtools during development.

- **`staleTime`**: how long fetched data is considered fresh (no automatic background refetch during this window). Defaults to `0`, meaning TanStack Query will refetch in the background on every mount unless you set this explicitly — for data that doesn't change every second, set a real value (seconds to minutes) to avoid needless refetches.
- **`gcTime`** (renamed from `cacheTime` in v5): how long *unused* data stays in memory after the last component unmounts, before being garbage collected. This is memory management, not freshness — don't confuse the two, and don't assume a long `gcTime` keeps data "fresh" (it doesn't; `staleTime` controls that).

```ts
useQuery({
  queryKey: todoKeys.list(filters),
  queryFn: () => fetchTodos(filters),
  staleTime: 60_000,      // fresh for 1 minute — no background refetch during this window
  gcTime: 5 * 60_000,     // kept in memory 5 minutes after becoming unused
});
```

## 8. Use `select` to avoid re-rendering on irrelevant data changes

If a component only needs a slice or derived value from a query's data, use the `select` option rather than pulling the full object and deriving inline. TanStack Query only re-renders the component when the *selected* value changes, not on every change to the full cached object.

```ts
const { data: todoCount } = useQuery({
  queryKey: todoKeys.all,
  queryFn: fetchTodos,
  select: (todos) => todos.length, // component only re-renders when the count changes
});
```

## 9. Extract reusable query definitions with `queryOptions`

Don't duplicate the same `queryKey`/`queryFn`/`enabled` combination across multiple components that need the same data. Define it once as a `queryOptions(...)` factory and reuse it — this also gives prefetching, `useQuery`, and `queryClient.getQueryData` a single shared source of truth for that query's shape.

```ts
const userOptions = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId!),
    enabled: !!userId,
  });

// Reused identically everywhere this data is needed:
useQuery(userOptions(userId));
queryClient.prefetchQuery(userOptions(userId));
```

This is also the reasoning behind wrapping a query in its own custom hook even when it's a thin wrapper around one `useQuery` call: it keeps the actual fetch definition out of the UI but co-located with the rest of that query's concerns, keeps every usage of a given query key (and its types) findable in one file, and gives a single place to adjust settings (`staleTime`, `select`, retry behavior) later without hunting down every call site.

## 13. Use TanStack Query Devtools in development only

Include `@tanstack/react-query-devtools` in development builds to inspect cache state, query statuses, and stale/fresh timing while building — but make sure it's excluded from the production bundle (most setups already tree-shake it out via `process.env.NODE_ENV` checks; verify this rather than assuming it).

## 14. Don't copy query data into local `useState` — it opts you out of every future background update

If a component takes `data` from `useQuery` and immediately does `useState(data)`, that local copy stops updating the moment TanStack Query refetches in the background — the whole point of the cache (staying in sync with the server without the component asking for it) is lost the instant the value is cloned into component state. Read the query's data directly wherever it's used instead of mirroring it.

The one legitimate exception: seeding a one-time initial value (e.g. a form's default values) where you genuinely want to freeze it at mount time and not have later background updates fight with in-progress user edits. Even then, be explicit about it — set `staleTime: Infinity` so it's clear this data is deliberately not meant to refetch, rather than accidentally relying on the local-state copy to (incorrectly) shield you from updates that could still happen anyway:

```ts
const { data } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: Infinity });
return data ? <SettingsForm initialData={data} /> : null;

function SettingsForm({ initialData }: { initialData: Settings }) {
  const [formData, setFormData] = useState(initialData); // deliberate one-time seed, documented as such
  // ...
}
```

## 15. Don't use the query cache as a general local-state manager

`queryClient.setQueryData`/`setQueriesData` exist for two purposes: optimistic updates (covered by `apply-react-async-ui`), and writing back data a mutation's response already returned (rule 4). Using them as a general-purpose way to stash arbitrary client state in the cache invites a background refetch to silently overwrite whatever was manually written, since the cache doesn't know that value wasn't "real" server data. For actual client/UI state, use local component state or a dedicated client-state store — keep server state and client state in the tools built for each, not blended into one cache.
