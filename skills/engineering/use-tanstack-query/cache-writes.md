# TanStack Query — writing to the cache directly

Disclosed reference. Open from SKILL.md when calling `setQueryData`, `setQueriesData`, or `getQueryData`.

`setQueryData` is a synchronous, imperative write into the cache. It does not fetch, does not validate, and does not know whether what you wrote is true. Everything below follows from that.

## 40. `setQueryData` matches one exact key; `setQueriesData` matches a filter

This is the most common silent failure. `setQueryData` takes a **query key**, not filters, and the match is exact — a partial or prefix key writes nothing and reports no error.

```ts
// Does nothing if the real key is ['todos', 'detail', 5]
queryClient.setQueryData(['todos'], next);

// One exact entry
queryClient.setQueryData(['todos', 'detail', 5], next);

// Every entry under a prefix — filters, fuzzy matched
queryClient.setQueriesData({ queryKey: ['todos'] }, updater);
```

If a write appears to do nothing, check key identity first. Note that key *order* matters for arrays but not for object members inside a key, which is one reason object-shaped key parts are easier to get right.

## 41. The updater must be immutable, and `undefined` has two distinct meanings

```ts
queryClient.setQueryData<Todo[]>(key, (old) => {
  if (old === undefined) return old;          // entry absent → leave it absent
  return old.map((t) => (t.id === id ? { ...t, done: true } : t));
});
```

Three rules in that snippet, each of which is a real bug when broken:

- **Never mutate `old`.** `old.push(...)` or `old[0].done = true` returns the same reference, so React sees no change and does not re-render — the cache is updated and the screen is not. Structural sharing also relies on getting a new object to diff.
- **The updater receives `undefined`** when no entry exists. Reading `old.map` without the guard throws.
- **Returning `undefined` is a no-op**, not "write undefined". The entry stays exactly as it was, so `return old` and `return undefined` behave the same for an absent entry — but for a *present* one, returning `undefined` silently cancels your write. Do not use it to clear an entry; use `removeQueries` for that.

Passing a value directly instead of an updater is fine when the new value does not depend on the old one: `setQueryData(key, freshTodo)`.

## 42. Let the key carry the type — do not reach for generics

In v5, a `queryOptions` factory returns a `queryKey` branded with the data type. Passing that key gives a fully typed `old` and a checked return, with no type argument and no assertion:

```ts
const todoOptions = (id: number) =>
  queryOptions({ queryKey: ['todo', id], queryFn: () => fetchTodo(id) });

// old is Todo | undefined; the return is checked against Todo
queryClient.setQueryData(todoOptions(id).queryKey, (old) => old && { ...old, done: true });

// getQueryData is typed the same way
const todo = queryClient.getQueryData(todoOptions(id).queryKey);
```

This is a concrete payoff of rule 27 — factories over custom hooks. A hand-written `['todo', id]` at the call site forces `setQueryData<Todo>(...)`, and that explicit generic is an assertion: it silences the checker rather than proving anything. If you find yourself writing the generic, the key should have come from the factory.

## 43. A write marks the data fresh, which can suppress a refetch you needed

`setQueryData` sets `dataUpdatedAt` to now. The entry is therefore fresh for the whole `staleTime` window, and the background refetch that would have corrected a partial or optimistic value does not happen.

Pass an explicit timestamp when the data you are writing is not actually current:

```ts
queryClient.setQueryData(key, valueFromAnOlderSource, { updatedAt: knownFetchTime });
```

This is the same mechanism `initialDataUpdatedAt` exists for (rule 24), and the reason seeding a detail view from a list needs care — see rule 45.

## 44. A write does not cancel an in-flight request

A refetch already on the wire will land after your write and overwrite it. This is why every optimistic update begins with `cancelQueries`:

```ts
onMutate: async (next) => {
  await queryClient.cancelQueries({ queryKey: key });   // without this, the write can be clobbered
  const previous = queryClient.getQueryData(key);
  queryClient.setQueryData(key, next);
  return { previous };
},
```

The window is small and load-dependent, which is exactly what makes it a bug that passes review and fails in production. Cancel unconditionally rather than reasoning about whether a fetch is in flight.

## 45. Seeding a detail entry from a list is only safe when the shapes match

The tempting pattern — after loading a list, write each item into its detail entry so opening one is instant:

```ts
for (const todo of todos) {
  queryClient.setQueryData(todoOptions(todo.id).queryKey, todo);
}
```

This is correct **only if the list item is the complete detail object.** List endpoints usually return a subset. Write that subset into the detail entry and the detail view renders a half-empty object — and because rule 43 just marked it fresh, nothing refetches to fill it in.

When the shapes differ, use `initialData` on the detail query instead, with `initialDataUpdatedAt` from the list's own `dataUpdatedAt`. That gives an instant first paint *and* a background refetch, because the timestamp tells Query the data is as old as the list read:

```ts
useQuery({
  ...todoOptions(id),
  initialData: () => queryClient.getQueryData(todoKeys.list())?.find((t) => t.id === id),
  initialDataUpdatedAt: () => queryClient.getQueryState(todoKeys.list())?.dataUpdatedAt,
});
```

## 46. Infinite queries hold `{ pages, pageParams }`, not an array

Writing an array into an infinite query's entry breaks every consumer, since `useInfiniteQuery` reads `data.pages`. Update the page that contains the item and leave the rest alone:

```ts
queryClient.setQueryData(todoKeys.infinite(), (old) =>
  old === undefined
    ? old
    : {
        ...old,
        pages: old.pages.map((page) =>
          page.map((t) => (t.id === id ? updated : t))
        ),
      }
);
```

## 47. Prefer writing the response you already have over invalidating

When the mutation response *is* the new entity, writing it costs nothing and avoids both a round trip and the flicker of a loading state. When the response is a bare `{ ok: true }`, or the write changes data you cannot see from here — computed totals, other users' rows, server-side ordering — invalidate instead and let the server be the source of truth.

Writing and invalidating are not exclusive: write for immediacy, then invalidate in `onSettled` to confirm. That is exactly the optimistic pattern in [mutations.md](mutations.md).

The failure mode to avoid is writing a value the server never confirmed and never reconciling it. Rule 15 covers the general form of this: the cache does not know a hand-written value was not real server data.
