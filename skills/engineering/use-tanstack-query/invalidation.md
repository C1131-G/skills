# TanStack Query — keeping data fresh after a change

Disclosed reference. Open from SKILL.md only for the active branch. Invalidating, writing the response you already have, and seeding a new cache entry. The write mechanics themselves are in [cache-writes.md](cache-writes.md); the optimistic and pending half of a mutation is `apply-react-async-ui`.

## 3. Invalidate broadly by prefix, and always await/return the invalidation

`invalidateQueries({ queryKey: ["todos"] })` refreshes every query whose key starts with `["todos"]` — you don't need to enumerate each variant.

`invalidateQueries` returns a Promise. If it isn't returned/awaited inside `onSuccess`, TanStack Query considers the mutation "done" before the refetch actually completes — this can hide loading state prematurely or cause an optimistic update to flash back to the old value before the real data arrives.

```ts
// Avoid: fire-and-forget — mutation resolves before the refetch completes
useMutation({
  mutationFn: updateTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: todoKeys.all }); // not awaited
  },
});

// Prefer: return (or await) the promise
useMutation({
  mutationFn: updateTodo,
  onSuccess: () => {
    return queryClient.invalidateQueries({ queryKey: todoKeys.all });
  },
});
```

## 4. Prefer `setQueriesData` over `invalidateQueries` when the mutation already returns the new data

If the mutation response already contains the updated object, write it directly into the cache instead of triggering a refetch — this avoids a network round-trip and the split-second flicker/loading state that `invalidateQueries` can cause.

```ts
useMutation({
  mutationFn: updateTodo,
  onSuccess: (updatedTodo) => {
    queryClient.setQueriesData({ queryKey: todoKeys.all }, (old: Todo[] | undefined) =>
      old?.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
  },
});
```

The mechanics of the write itself — exact-key matching, the immutable updater, what `undefined` means, and why it marks data fresh — are in [cache-writes.md](cache-writes.md).

For the optimistic-update side of a mutation (`onMutate`/`onError`/rollback), use `apply-react-async-ui`, which also covers the pending state and duplicate-submit protection the interaction needs.

## 5. When a variable key produces a brand-new cache entry, pre-fill it from a broader cached query if you can

Switching a query key's variable part (e.g. a filter from `"all"` to `"done"`) creates a genuinely new cache entry, which means a hard loading state the first time that specific variant is requested — even if the data was, in principle, already available. If a broader/related query is already cached and the new view is a subset of it, derive the new entry's `initialData` from that broader cache instead of showing a spinner:

```ts
useQuery({
  queryKey: todoKeys.list(filter),
  queryFn: () => fetchTodos(filter),
  initialData: () => {
    const allTodos = queryClient.getQueryData<Todo[]>(todoKeys.list("all"));
    const filtered = allTodos?.filter((todo) => todo.state === filter) ?? [];
    return filtered.length > 0 ? filtered : undefined; // undefined = let it fetch normally
  },
});
```

This is a different tool from `placeholderData: keepPreviousData` in `apply-react-async-ui` — that keeps the *previous* variant's data visible during a transition; this pre-fills a *new* variant's cache entry with a locally-derivable subset the moment it's created, before any network request completes.
