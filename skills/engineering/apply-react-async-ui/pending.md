# Pending state

Disclosed reference. Open from SKILL.md only for the active branch. `useTransition` for clicks, `useActionState` for forms, `useFormStatus` for form children. The optimistic value is in [optimistic.md](optimistic.md).

## `useTransition` — clicks

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

## `useActionState` — forms

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

## `useFormStatus` — form children only

Must render **inside** the `<form>`, not as a sibling.

```tsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
}
```
