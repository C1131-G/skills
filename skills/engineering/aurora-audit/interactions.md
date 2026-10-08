# Interactions — feedback that matches the action

Every click that writes or navigates shows feedback **on the thing clicked**, without moving the layout. Mechanics of the hooks belong to `apply-react-async-ui`; effects belong to `audit-react-effects`. This file checks which mechanism was chosen.

## What it looks like

```tsx
// next16-mail/features/thread/components/thread-toolbar.tsx
const [optimisticStarred, setOptimisticStarred] = useOptimistic(starred);

onClick={() =>
  startTransition(async () => {
    setOptimisticStarred(!optimisticStarred);           // instant
    const result = await toggleStar(threadId, !optimisticStarred);
    if (!result.ok) toast.error(result.error);           // error-only toast; optimistic value rolls back
  })
}
```

## Pick the mechanism

| Situation | Use |
|---|---|
| Unlikely to fail (star, like, follow) | `useOptimistic` inside `startTransition`; toast only on error |
| Create/update/delete in a visible list | one domain reducer + `useOptimistic` (`eventChangeReducer` in calendar) |
| Filter, sort, tab, navigation | `useTransition` + `data-pending` on the node; parent reacts with `group-has-data-pending:` CSS |
| Field errors from the server | `useActionState`, inline with `aria-invalid` + `role="alert"` |
| Submit spinner | `useFormStatus` in a child of `<form>` (the shared `Button` does this) |
| Side effect with nothing visible (sent, copied) | success toast |

## Rules

- **I1** Optimistic writes use `useOptimistic`, not `useState` + manual rollback, and set it inside the same transition as the action.
- **I2** No success toast next to an optimistic result. Toast on error only.
- **I3** No toast for navigation, and no toast for an expected in-page failure — that goes on the component's status line.
- **I4** Destructive actions are recoverable: either a confirm dialog whose button owns the pending state (delete, cancel trip), or an undo toast after the fact (archive, unsend). Navigate away only after `{ ok: true }`.
- **I5** Non-optimistic pending state is shown with `data-pending` / `aria-busy` and the control is disabled, not with a global spinner.
- **I6** No `useEffect` that copies props into state or resets state on a prop change — key the child, derive in render, or use a reducer.
- **I7** Filters, tabs, pages and wizard steps live in the URL; a URL-driven control uses `useOptimistic(draft)` + `router.replace` in one transition.
- **I8** Search forms take defaults from `useSearchParams()`, key the `<form>` on `params.toString()`, prefetch on change, and dim old results with `data-pending:opacity-60`.
- **I9** Buttons that show a spinner keep their width (fixed width or reserved slot).

## Find violations

```bash
grep -rn "toast.success\|toast(" features components --include=*.tsx
grep -rln "useOptimistic" features | wc -l; grep -rn "setTimeout\|rollback\|previous" features --include=*.tsx
grep -rnA3 "useEffect(" features components --include=*.tsx | grep -E "set[A-Z]\w*\("
grep -rn "useState" features --include=*.tsx | grep -iE "tab|filter|page|sort"
grep -rn "window.confirm\|confirm(" features --include=*.tsx
```

Read each `toast.success`: is there an optimistic UI or navigation right next to it? Read each effect that calls a setter: is it syncing an external system (fine) or deriving state (I6)?

## Fix

Swap manual pending/rollback for `useOptimistic`; delete success toasts beside optimistic UI; move tab/filter state into search params; replace derived-state effects per `audit-react-effects`.
