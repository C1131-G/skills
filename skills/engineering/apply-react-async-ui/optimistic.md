# Optimistic updates

Disclosed reference. Open from SKILL.md only for the active branch. `useOptimistic` with Server Actions, `onMutate` and rollback with TanStack Query, and the guards both need. Pending state is in [pending.md](pending.md).

| | `useOptimistic` | Query `onMutate` |
|---|---|---|
| Path | Server Actions | TanStack Query |
| Scope | Component-local | Shared cache |
| Rollback | Automatic | Manual `context.previous` in `onError` |
| Multi-component | No | Yes (same key) |
| Commit | Reverts to server value | `onSettled` → invalidate |

## Server Actions

```tsx
const [optimisticLikes, setOptimisticLikes] = useOptimistic(post.likes);
startTransition(async () => {
  setOptimisticLikes(optimisticLikes + 1);
  await likePost(post.id); // error → auto-revert
});
```

## TanStack Query

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

## Guards

- Apply **server truth** on commit, never toggle from the response alone (`setLiked(result.isLiked)`).
- Rapid clicks: `if (isPending) return` / `disabled={mutation.isPending}`.
- Action props: the component owns transition + optimistic; the consumer passes a `*Action` Server Function.
