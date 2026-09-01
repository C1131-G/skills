---
name: apply-react-async-ui
description: Apply React's async UI primitives — useTransition, useActionState, useFormStatus, useOptimistic, Suspense, Error Boundaries, use, and useDeferredValue. Use on any interaction that waits on a server. Triggers on "the UI freezes while it saves", "the button feels slow", a submit button clickable twice, a value that flickers back after saving, spinner placement, a flash of empty state, and a whole page blocked by one slow query.
---

# apply-react-async-ui

Use this skill directly for any interaction that waits on a server: pending state, optimistic updates, and loading boundaries. Pair it with `use-tanstack-query` when the data lives in a shared server-state cache, `apply-next-shell-nav` when placing boundaries in a Next.js shell, and `apply-toasts` when a failure needs a user-facing message.

Also apply `enforce-code-quality` and, for TypeScript code, `enforce-typescript-strict` to files in scope.

These three concerns are one decision, not three. A mutation needs pending state *and* an optimistic value *and* a boundary that does not double up on the spinner. Pick all three together.

| Question | Primitive |
|---|---|
| Click that waits on the server | `useTransition` |
| Real `<form>` submit | `useActionState` |
| Pending state inside a form's children | `useFormStatus` |
| Show the result before the server confirms (Server Actions) | `useOptimistic` |
| Show the result before the server confirms (TanStack Query) | `onMutate` + rollback |
| Where the loading UI appears | `Suspense` + `ErrorBoundary` |
| Keep a list responsive while filtering | `useDeferredValue` |

**Never use these for animation.** Visual motion is View Transitions / Motion — see `apply-native-feel-nav`.

## 1. Pending state

### `useTransition` — clicks

```tsx
const [isPending, startTransition] = useTransition();

// Server Actions
function handleClick() {
  if (isPending) return;
  startTransition(async () => {
    setOptimistic(newValue);
    await serverAction(newValue);
  });
}

// TanStack Query
function handleClick() {
  setInput(""); // urgent — outside the transition
  startTransition(() => {
    mutation.mutate({ text: input });
  });
}
```

Guard every entry point with `if (isPending) return` before starting another transition.

### `useActionState` — forms

Prefer over manual `useTransition` for real `<form>` submits; it runs in a transition internally.

```tsx
const [state, formAction, isPending] = useActionState(
  async (_prev, formData: FormData) => {
    const result = await createPost(formData);
    if (!result.ok) return { error: result.error };
    return { ok: true };
  },
  null
);
```

### `useFormStatus` — form children only

Must render **inside** the `<form>`, not as a sibling.

```tsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
}
```

## 2. Optimistic updates

| | `useOptimistic` | Query `onMutate` |
|---|---|---|
| Path | Server Actions | TanStack Query |
| Scope | Component-local | Shared cache |
| Rollback | Automatic | Manual `context.previous` in `onError` |
| Multi-component | No | Yes (same key) |
| Commit | Reverts to server value | `onSettled` → invalidate |

### Server Actions

```tsx
const [optimisticLikes, setOptimisticLikes] = useOptimistic(post.likes);
startTransition(async () => {
  setOptimisticLikes(optimisticLikes + 1);
  await likePost(post.id); // error → auto-revert
});
```

### TanStack Query

```ts
onMutate: async (newTodo) => {
  await queryClient.cancelQueries({ queryKey: ["todos"] });
  const previous = queryClient.getQueryData<Todo[]>(["todos"]);
  queryClient.setQueryData<Todo[]>(["todos"], (old = []) => [...old, { ...newTodo, pending: true }]);
  return { previous };
},
onError: (_e, _v, ctx) => {
  if (ctx?.previous) queryClient.setQueryData(["todos"], ctx.previous);
},
onSettled: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
```

### Guards

- Apply **server truth** on commit, never toggle from the response alone (`setLiked(result.isLiked)`).
- Rapid clicks: `if (isPending) return` / `disabled={mutation.isPending}`.
- Action props: the component owns transition + optimistic; the consumer passes a `*Action` Server Function.

## 3. Loading boundaries

### Fresh load vs updating — the most common mistake

- **Fresh** (no data yet): a Suspense fallback is correct.
- **Updating** (refetch, pagination, filter change): keep the current UI. Query uses `placeholderData: keepPreviousData`; `useOptimistic` already keeps the UI. **Do not stack a spinner on top of either.**

### Granularity

One boundary per independently loadable and recoverable section — not one per leaf, not one for the whole page. Always pair the two:

```tsx
<ErrorBoundary fallback={<WidgetError />}>
  <Suspense fallback={<WidgetSkeleton />}>
    <AsyncWidget />
  </Suspense>
</ErrorBoundary>
```

### Render-as-you-fetch

No `useEffect` fetching. Use Server Components, or a router loader + `ensureQueryData`, then `useSuspenseQuery`. See `audit-react-effects`.

### `use()` — a promise from a Server Component

```tsx
function TodoList({ todosPromise }: { todosPromise: Promise<Todo[]> }) {
  const todos = use(todosPromise);
  return <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>;
}
```

Do not use it to replace `useSuspenseQuery` when Query already owns the query.

### `useDeferredValue` — expensive lists on input

Prefer over a manual debounce; React can interrupt deferred work, a `setTimeout` cannot.

### Fallbacks

Skeletons match the shape of the content they replace. Respect `prefers-reduced-motion`.

## Review checklist

Flag: a transition with no `isPending` guard; `useFormStatus` rendered outside its form; an optimistic value committed from the response instead of server truth; a Query optimistic update with no `cancelQueries` or no rollback; a spinner shown during an update that already has data; a `Suspense` with no paired `ErrorBoundary`; one boundary wrapping the whole page; and any fetch inside `useEffect`.

## Done when

The right primitive is used for click vs form; every transition is pending-guarded; optimistic paths cancel and roll back; fresh-load and updating states are distinguished; every `Suspense` has an `ErrorBoundary`; and no data is fetched on mount.
