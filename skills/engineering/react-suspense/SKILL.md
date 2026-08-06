---
name: react-suspense
description: Suspense boundaries, Error Boundary, use, useDeferredValue. Part of react-async-ui. Called by master for loading UI.
disable-model-invocation: true
---

# React Suspense

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

No `useEffect` fetch. Next Server Components, TanStack loaders + `ensureQueryData`, then `useSuspenseQuery`. See `react-effect-audit`.

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
