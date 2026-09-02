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

**Load disclosed files only for the branch you need.**

| Branch | Open |
|---|---|
| A click or a form submit that waits on the server — `useTransition`, `useActionState`, `useFormStatus` | [pending.md](pending.md) |
| Showing the result before the server confirms — `useOptimistic`, `onMutate` + rollback | [optimistic.md](optimistic.md) |
| Where the loading UI appears — `Suspense`, `ErrorBoundary`, `use()`, `useDeferredValue` | [boundaries.md](boundaries.md) |

## Review checklist

Flag: a transition with no `isPending` guard; `useFormStatus` rendered outside its form; an optimistic value committed from the response instead of server truth; a Query optimistic update with no `cancelQueries` or no rollback; a spinner shown during an update that already has data; a `Suspense` with no paired `ErrorBoundary`; one boundary wrapping the whole page; and any fetch inside `useEffect`.

## Done when

The right primitive is used for click vs form; every transition is pending-guarded; optimistic paths cancel and roll back; fresh-load and updating states are distinguished; every `Suspense` has an `ErrorBoundary`; and no data is fetched on mount.
