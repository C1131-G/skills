---
name: react-transitions
description: useTransition, useActionState, useFormStatus. Part of react-async-ui. Called by master when interactive UI.
disable-model-invocation: true
---

# React Transitions

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
- Never use for animation — View Transitions / `native-feel-navigation`

## Done when

Pending guarded; correct primitive for click vs form; no animation misuse.
