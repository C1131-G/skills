# TanStack Query — detailed rules

Disclosed reference. Open from SKILL.md only for the active branch.

## 19. Mutations: prefer `mutate` over `mutateAsync`, and separate concerns between hook callbacks and call-site callbacks

- **Use `mutate`, not `mutateAsync`** in most cases. `mutate` swallows errors internally (React Query catches the rejection) so you don't need to wrap it in `try/catch`. `mutateAsync` returns the raw Promise — useful when you genuinely need to `await` it (e.g. sequential/dependent mutations, or `Promise.all` over multiple mutations), but it requires manual error handling; an unhandled rejection will surface as an unhandled promise rejection at the process level.
- **Mutations take only one argument for variables** — use an object if you need to pass multiple values.
- **Separate concerns between `useMutation` callbacks and `mutate` callbacks.** Callbacks on `useMutation` fire before those on `mutate` and are guaranteed to run. Callbacks on `mutate` (the second argument to `mutation.mutate(vars, { onSuccess })`) fire after and may **not** fire if the component unmounts before the mutation finishes. Rule of thumb: put logic that must always happen (invalidation, cache writes) in the `useMutation` callbacks; put UI-only side effects (navigation, toast notifications, dialog close) in the `mutate` callbacks so they only fire if the user is still on that screen.

## 20. Automatic global invalidation via the `MutationCache` `onSuccess` callback

Instead of putting `invalidateQueries` inside every single `useMutation`'s `onSuccess`, wire one global invalidation in the `MutationCache` callback at setup time. This gives a Remix/React Router-like "invalidate everything after every mutation" behavior by default with just a few lines:

```ts
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries(); // invalidate all active queries
    },
  }),
});
```

Invalidation doesn't mean refetch-everything — it only immediately refetches currently active (visible) queries; everything else is just marked stale and refetches when next accessed. For most apps with a reasonable `staleTime`, this is less expensive than it sounds.

To make it more selective: use `mutation.options.mutationKey` as a filter (add `mutationKey: ['todos']` to a mutation, and only `['todos']` queries get invalidated), or use `mutation.meta.invalidates` and `matchQuery` for a tag-based system. For queries that should never be auto-invalidated, set `staleTime: 'static'` on them.

For the "I want to await one specific invalidation while letting others fire-and-forget" case: the global callback invalidates everything without awaiting; a local `onSuccess` on `useMutation` returns a more targeted invalidation Promise (with `cancelRefetch: false` so it picks up the already-in-flight refetch rather than firing a second request).

## 21. Concurrent optimistic updates: cancel in-flight queries and skip redundant invalidations

Standard optimistic update code has two race condition failure modes when multiple mutations update the same entity concurrently:

**Problem 1 (query cancellation):** A background refetch triggered by `refetchOnWindowFocus` or a prior invalidation arrives after the optimistic update and overwrites it. Fix: `await queryClient.cancelQueries(...)` in `onMutate` to abort any in-flight request for the affected query before writing the optimistic value. This is the standard fix and handles most cases.

**Problem 2 (overlapping invalidations):** Two mutations are running concurrently. When the first one settles it calls `invalidateQueries`, which triggers a refetch. If that refetch completes before the second mutation finishes, it overwrites the second mutation's optimistic state — the UI flickers back to pre-mutation state briefly. Fix: only invalidate when there are no other related mutations still in flight:

```ts
onSettled: () => {
  if (queryClient.isMutating({ mutationKey: ['items'] }) === 1) {
    queryClient.invalidateQueries({ queryKey: ['items'] });
  }
}
```

`isMutating()` returns the count of currently running mutations. In `onSettled`, the current mutation is still counted, so checking for `1` means "I'm the last one." Use `mutationKey` to scope the check to related mutations only, not all mutations in the app. Don't use `useIsMutating()` here — the hook's value is stale inside a callback (closure issue); use the imperative `queryClient.isMutating()` instead.

## 22. Check data availability before checking for errors — don't unmount stale-but-good data

The "standard" pattern of checking `isPending` first, then `isError`, then rendering data is only correct when there is no previous data. When a background refetch fails, both `isError` and `data` will be non-empty at the same time — React Query keeps stale data available even after an error. If the code checks `isError` first, it unmounts the stale data and shows an error screen to the user, even though the data from the last successful fetch is still perfectly usable.

Check `data` availability first when stale-but-good data is acceptable:

```tsx
// Avoid — unmounts stale data when background refetch fails
if (todos.isPending) return <Loading />;
if (todos.isError) return <Error />;
return <TodoList data={todos.data} />;

// Prefer — keeps stale data visible, only shows error when there's nothing else to show
if (todos.data) return <TodoList data={todos.data} />;
if (todos.isError) return <Error />;
return <Loading />;
```

This is especially important because React Query retries failed queries three times with exponential backoff — a user could stare at a confusing blank/error screen for several seconds before the retries complete, even though their data was already on screen.

