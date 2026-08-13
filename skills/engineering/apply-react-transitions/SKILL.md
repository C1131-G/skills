---
name: apply-react-transitions
description: Apply React useTransition, useActionState, and useFormStatus. Use for non-blocking actions, pending interaction state, and duplicate-submission prevention.
---

# apply-react-transitions

Use this skill directly for non-blocking async interactions. Pair it with `apply-react-optimistic` when an action should update the interface immediately.

Also apply `enforce-code-quality` and, for TypeScript code, `enforce-typescript-strict` to files in scope.

Priority for non-blocking async work — not animation.

## `useTransition`

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
  setInput(""); // urgent — outside transition
  startTransition(() => {
    mutation.mutate({ text: input });
  });
}
```

## `useActionState` — forms

Prefer over manual `useTransition` for real `<form>` submits (runs in a transition internally).

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

## `useFormStatus` — form children only

Must render **inside** the `<form>`, not as a sibling.

```tsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
}
```

## Rules

- Clicks → `useTransition`; forms → `useActionState`
- Always `if (isPending) return` before starting another transition
- Never use for animation — View Transitions / `apply-native-feel-nav`

## Done when

Pending guarded; correct primitive for click vs form; no animation misuse.
