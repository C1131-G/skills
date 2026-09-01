---
name: apply-toasts
description: Apply accessible React toast notifications with Sonner, including when to toast, error strategy, actions, timing, and reduced motion. Triggers on "show a message when it saves", failures the user never sees, duplicate toasts from one action, alert() used for feedback, and confirmation UI for an action that already succeeded visibly.
---

# apply-toasts

Use this skill directly for toast and notification UI. Pair it with `apply-react-async-ui` when a mutation may roll back and needs a clear user-facing error.

Also apply `enforce-code-quality` and, for TypeScript code, `enforce-typescript-strict` to files in scope.

For custom appearance or animation, open [motion.md](motion.md) — but read rules 2 and 3 first, because most "make the toast nicer" requests are actually "this should not be a toast."

## 1. Library: Sonner

Sonner is the default for new React projects: it is what shadcn/ui ships, has the largest adoption and smallest bundle (~9KB gzipped) among mainstream options, needs no provider beyond a single `<Toaster />`, and has a TypeScript-first, promise-aware API.

Use it unless the project already has an established alternative (react-hot-toast, react-toastify) with no strong reason to migrate. **Never introduce a second toast library alongside an existing one.**

```tsx
// app/layout.tsx (or root component) — exactly one <Toaster /> per app
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

```ts
import { toast } from "sonner";

toast.success("Order placed");
toast.error("Payment failed");
toast.promise(saveDraft(), {
  loading: "Saving...",
  success: "Draft saved",
  error: "Couldn't save draft",
});
```

## 2. Toast when the message is transient, non-critical, and out of flow

- **Confirming something that already happened** — an action completed, a background job finished, an item was added.
- **Not required to proceed.** If the user cannot continue without seeing it, it is not a toast.
- **Not tied to one element on screen.** Feedback about a specific input belongs next to that input.

## 3. Never toast anything the user must see, act on, or refer back to

| Instead of a toast | Use |
|---|---|
| Form validation errors | Inline, next to the field |
| Errors that block the workflow | Modal or dialog |
| Anything needed later | Notifications panel or inbox |
| Multi-step or long-form content | A different pattern entirely — a toast is a sentence, not a paragraph |
| Silent background failures the user cannot act on | A log; surface it only if there is something to do |

A toast saying "email is invalid" disappears before the user has looked back at the form.

## 4. Duration matches the attention required

- **Success**: ~2-3s. The action worked; do not make the user wait for it to leave.
- **Errors**: ~5-6s minimum, or persistent if the message must be read and understood rather than glanced at.
- **Anything with an action button**: err toward longer or no auto-dismiss. Dismissing before the user can click defeats the point of offering the action.

## 5. Give undoable actions a real Undo

If an action can reasonably be undone (delete, archive, remove), offer it in the toast rather than making the user navigate somewhere to reverse it:

```ts
toast("Item deleted", {
  action: { label: "Undo", onClick: () => restoreItem(id) },
});
```

## 6. Never stack duplicate or spammy toasts

**Deduplicate with an id** so a repeated call updates the existing toast instead of stacking:

```ts
toast.loading("Saving...", { id: "save-draft" });
toast.success("Saved", { id: "save-draft" }); // same id — updates, does not add
```

**Cap concurrent toasts** (Sonner supports a max-visible option) so a burst of events cannot flood the screen.

**Do not toast every minor state change.** For expected, frequent actions like autosave, a subtle persistent status indicator beats a toast per save.

## 7. Verify accessibility, do not assume it

Toast libraries generally wire up `aria-live` regions, but implementation quality varies and dismissal animations can interfere with the announcement being read. Test with a screen reader, or at minimum verify the rendered markup includes a live region.

- Error toasts use `aria-live="assertive"`; routine success toasts use `"polite"`.
- Never rely on color alone for success vs error — pair it with an icon and the message text.
- Do not let auto-dismiss race the announcement.

## 8. One position, app-wide

Pick one position (top-right and bottom-right are the common defaults) and use it everywhere. Mount a single `<Toaster />` at the app root — not one per page or route — so position, stacking, and max-visible behavior stay consistent.

## Review checklist

Flag: validation errors shown as toasts instead of inline; blocking messages shown as dismissible toasts; destructive operations with no Undo; un-deduplicated toasts on retried or frequent actions; more than one `<Toaster />` mounted; fixed-duration easing where a spring would feel natural; and any custom animation with no `prefers-reduced-motion` fallback.

## Done when

The toast/inline/modal decision was made deliberately before any toast code was written; durations match message weight; undoable actions offer Undo; repeat calls deduplicate by id; exactly one `<Toaster />` is mounted; and accessibility was verified rather than assumed.
