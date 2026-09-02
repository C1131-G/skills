# Loading boundaries

Disclosed reference. Open from SKILL.md only for the active branch. Where the loading UI goes: fresh load vs updating, granularity, `use()`, `useDeferredValue`, fallbacks.

## Fresh load vs updating — the most common mistake

- **Fresh** (no data yet): a Suspense fallback is correct.
- **Updating** (refetch, pagination, filter change): keep the current UI. Query uses `placeholderData: keepPreviousData`; `useOptimistic` already keeps the UI. **Do not stack a spinner on top of either.**

## Granularity

One boundary per independently loadable and recoverable section — not one per leaf, not one for the whole page. Always pair the two:

```tsx
<ErrorBoundary fallback={<WidgetError />}>
  <Suspense fallback={<WidgetSkeleton />}>
    <AsyncWidget />
  </Suspense>
</ErrorBoundary>
```

## Render-as-you-fetch

No `useEffect` fetching. Use Server Components, or a router loader + `ensureQueryData`, then `useSuspenseQuery`. See `audit-react-effects`.

## `use()` — a promise from a Server Component

```tsx
function TodoList({ todosPromise }: { todosPromise: Promise<Todo[]> }) {
  const todos = use(todosPromise);
  return <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>;
}
```

Do not use it to replace `useSuspenseQuery` when Query already owns the query.

## `useDeferredValue` — expensive lists on input

Prefer over a manual debounce; React can interrupt deferred work, a `setTimeout` cannot.

## Fallbacks

Skeletons match the shape of the content they replace. Respect `prefers-reduced-motion`.
