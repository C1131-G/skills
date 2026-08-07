---
name: apply-react-suspense
role: leaf
parent: route-react-async-ui
description: LEAF of route-react-async-ui — not a main skill. Suspense, Error Boundary, use, useDeferredValue.
disable-model-invocation: true
---

# apply-react-suspense

**Leaf — not main.** Parent: `route-react-async-ui`. If invoked alone, load parent with the same mode and Decision-select this leaf only. Do not report this name as a top-level run.

## Fresh load vs updating

- **Fresh** (no data): Suspense fallback OK
- **Updating** (refetch/pagination): keep UI — Query `placeholderData: keepPreviousData`; Server Actions `useOptimistic` already keeps UI — do not stack a spinner on top

## Boundary granularity

One boundary per independently loadable/recoverable section — not one per leaf, not one whole-page only.

Always pair:

```tsx
<ErrorBoundary fallback={<WidgetError />}>
  <Suspense fallback={<WidgetSkeleton />}>
    <AsyncWidget />
  </Suspense>
</ErrorBoundary>
```

## Render-as-you-fetch

No `useEffect` fetch. Next Server Components, TanStack loaders + `ensureQueryData`, then `useSuspenseQuery`. See `audit-react-effects`.

## `use()` — promise from Server Component

```tsx
function TodoList({ todosPromise }: { todosPromise: Promise<Todo[]> }) {
  const todos = use(todosPromise);
  return <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>;
}
```

Do not replace `useSuspenseQuery` when Query already owns the query.

## `useDeferredValue` — expensive lists on input

Prefer over manual debounce; React can interrupt deferred work.

## Fallbacks + motion

Skeleton matching content shape. Respect `prefers-reduced-motion` for VT/springs.

## Done when

Fresh vs update correct; Error Boundary paired; no fetch-on-mount.
