---
name: apply-react-suspense
description: Apply React Suspense, Error Boundaries, use, and useDeferredValue. Use for async loading boundaries, streaming, stale-content retention, and recovery UI.
---

# apply-react-suspense

Use this skill directly for asynchronous render boundaries. Pair it with `use-tanstack-query` for cached server data and `apply-next-shell-nav` when placing boundaries in a Next.js application shell.

Also apply `enforce-code-quality` and, for TypeScript code, `enforce-typescript-strict` to files in scope.

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
