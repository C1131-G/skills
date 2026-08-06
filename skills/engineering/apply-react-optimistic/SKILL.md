---
name: apply-react-optimistic
description: useOptimistic vs Query onMutate. Part of route-react-async-ui. Called by skill-master for instant mutation feedback.
disable-model-invocation: true
---

# apply-react-optimistic

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

- Apply **server truth**, never toggle from response alone (`setLiked(result.isLiked)`).
- Rapid clicks: `if (isPending) return` / `disabled={mutation.isPending}`.
- Action props: design components own transition+optimistic; consumer passes `*Action` Server Function.

## Done when

Correct path tool; cancel+rollback on Query path; rapid-click safe; server truth on commit.
