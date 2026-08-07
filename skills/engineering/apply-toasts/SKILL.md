---
name: apply-toasts
role: main
description: >
  MAIN. Modes: bare=audit report, :check=fix, :write=implement. Sonner toasts — when, a11y, motion.
disable-model-invocation: true
---
# apply-toasts

**Main skill** (`role: main`). Modes:

| Invoke | Mode |
|---|---|
| `apply-toasts` | audit — report only, no edits |
| `apply-toasts:check` | audit + fix |
| `apply-toasts:write` | implement / apply under this skill's rules |

On write/check, skill-master ALWAYS still applies when stack matches. Not a leaf — invoke by this name.

Apply these rules whenever adding or reviewing toast/notification UI in a React project.

## 1. Library: use Sonner

Sonner is the current default for new React projects — it's what shadcn/ui ships with, has the largest adoption and smallest bundle size (~9KB gzipped) among the mainstream options, requires no `Provider`-style setup beyond mounting a single `<Toaster />`, and has a TypeScript-first, promise-aware API. Use it unless the project already has an established alternative (react-hot-toast, react-toastify) with no strong reason to migrate — don't introduce a second toast library alongside an existing one.

```tsx
// app/layout.tsx (or root component)
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

## 2. Use a toast for: transient, non-critical, out-of-flow feedback

Toasts are the right tool when the message is:
- **A confirmation of something that already happened** — an action completed, a background job finished, an item was added.
- **Not required for the user to proceed.** If the app cannot function or the user cannot continue without seeing this message, it's not a toast.
- **Not tied to a specific field or element on screen.** If the feedback is about one specific input, it belongs next to that input, not floating in a corner.

## 3. Don't use a toast for: anything the user must see, act on, or refer back to

- **Form validation errors** — show them inline, next to the field, not as a toast. A toast for "email is invalid" disappears before the user has even looked back at the form.
- **Errors that block a workflow** — if the user genuinely cannot proceed until something is resolved (e.g. a required confirmation, a destructive-action warning), use a modal/dialog, not a toast that can be missed or auto-dismiss.
- **Anything the user might need to reference later** — a toast is not a persistent log. If it matters after it disappears, put it in a notifications panel/inbox, not a toast.
- **Multi-step or long-form content** — a toast should be a sentence, not a paragraph. If it needs more room, it's a different UI pattern.
- **Silent background failures the user can't act on** — don't toast an error the user has no way to respond to; log it instead (see `apply-structured-logging`) and only surface it if there's something the user can actually do.

## 4. Duration: match it to how much attention the message needs

- **Success confirmations**: short, ~2-3 seconds. The action worked, the user knows, don't make them wait for it to disappear.
- **Errors**: longer, ~5-6 seconds minimum, or persistent (no auto-dismiss) if the message requires reading and understanding, not just glancing at.
- **Anything with an action button** (Undo, Retry, View): keep it visible long enough for a real decision — err toward longer duration or no auto-dismiss when there's an action attached, since dismissing before the user can click defeats the point of offering the action.

## 5. Give destructive/undoable actions an actual Undo action, not just a message

If an action can reasonably be undone (delete, archive, remove), offer it directly in the toast rather than making the user navigate somewhere to reverse it:

```ts
toast("Item deleted", {
  action: {
    label: "Undo",
    onClick: () => restoreItem(id),
  },
});
```

## 6. Don't stack duplicate or spammy toasts

- **Deduplicate**: if the same action fires the same toast repeatedly in quick succession (e.g. a retried request, a debounced save), use a toast ID so the new call updates the existing toast instead of stacking a new one on top.

  ```ts
  toast.loading("Saving...", { id: "save-draft" });
  // later, same id updates the existing toast rather than adding a new one:
  toast.success("Saved", { id: "save-draft" });
  ```

- **Cap concurrent toasts** (most libraries, including Sonner, support a max-visible-toasts option) so a burst of events doesn't flood the screen with a stack the user has to dismiss one by one.
- **Don't toast on every minor state change.** If an action is expected/frequent (e.g. autosave firing every few seconds), a persistent subtle status indicator is a better fit than a toast per save.

## 7. Accessibility: verify it, don't assume the library handles it for you

Toast libraries generally wire up `aria-live` regions so screen readers announce new toasts, but implementation quality varies and dismissal animations can interfere with the announcement actually being read. Don't take this for granted — test with a screen reader (or at minimum verify the rendered markup includes a live region) rather than assuming it "just works" because the library claims accessibility support.

- Error toasts should use `aria-live="assertive"` (or the library's equivalent) since they're more urgent; routine success toasts can use `"polite"`.
- Never rely on color alone to convey success vs. error — pair color with an icon and/or the message text itself.
- Give toasts a reasonable minimum display time for anyone using a screen reader or reading slowly; don't let an auto-dismiss race the announcement.

## 8. Position and consistency

Pick one position for the app (top-right and bottom-right are the most common defaults) and use it everywhere — don't let different parts of the app spawn toasts from different corners. Mount a single `<Toaster />` at the root of the app, not one per page/route, so position, stacking, and max-visible behavior stay consistent across the whole app.

## 9. Visual polish: Apple-inspired motion, using Motion

Sonner already uses the **Motion** library (formerly Framer Motion) internally for its default transitions, so the baseline is already reasonable — but for a genuinely polished, Apple-like feel, apply these principles rather than accepting fixed-duration defaults everywhere:

- **Spring physics, not fixed-duration easing curves.** A `cubic-bezier` with a fixed duration always looks the same regardless of context; a spring (`type: "spring"` in Motion, tuned with `stiffness`/`damping`, or `bounce`/`duration` in newer Motion APIs) responds naturally and feels physical rather than scripted. Prefer a spring for a toast's enter/exit unless there's a specific reason a linear/eased transition reads better.

  ```tsx
  import { motion, AnimatePresence } from "motion/react";

  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      >
        {toastContent}
      </motion.div>
    )}
  </AnimatePresence>
  ```

- **Motion should be interruptible, not restart from scratch.** If a new toast arrives while another is still animating out (or the stack is re-flowing), the animation should continue smoothly from its current position/velocity, not snap back to a fixed start state and replay. This is what a spring naturally gives you (it can retarget mid-flight); a fixed-duration keyframe animation can't do this cleanly — another reason to prefer springs here.
- **Restraint over spectacle.** Apple's own motion language (see the design principles behind iOS toast/alert UI) favors subtle, quick, purposeful movement — a small scale/opacity/position shift, not a bounce, spin, or elaborate multi-stage entrance. A toast that overshoots wildly or takes over half a second to settle reads as gimmicky, not premium; keep total settle time in the 200-400ms range.
- **Depth via translucency, not heavy shadows alone.** A subtle `backdrop-filter: blur(...)` with a semi-transparent background (a "glass" material) paired with a soft, low-opacity shadow reads as more refined than a flat, opaque box with a hard drop shadow. Keep blur/opacity subtle enough that text inside the toast stays fully legible against any background.
- **Respect `prefers-reduced-motion` here too** (same principle as `route-react-async-ui`'s View Transitions rule) — fall back to a simple, fast opacity-only fade with no spring/scale/position movement when the user has that preference set:

  ```tsx
  const prefersReducedMotion = useReducedMotion(); // Motion's built-in hook
  <motion.div
    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={prefersReducedMotion ? { duration: 0.15 } : { type: "spring", stiffness: 500, damping: 35 }}
  >
  ```

- **Only reach for a fully custom Motion-based toast when Sonner's built-in styling/transition options genuinely can't achieve the desired look** (Sonner exposes `className`, `style`, and CSS variables for most visual customization first). Building a bespoke toast system is more surface area to maintain — treat it as a deliberate upgrade, not the default starting point.

## Applying these rules

- **Adding new feedback UI**: default to Sonner; check the decision in rules 2/3 first — toast, inline error, or modal — before writing any toast code.
- **Reviewing existing code**: flag validation errors shown as toasts instead of inline, blocking/required messages shown as dismissible toasts, missing Undo actions on destructive operations, un-deduplicated toasts on retried/frequent actions, more than one `<Toaster />` mounted in the app, fixed-duration easing used where a spring would feel more natural, and any custom animation with no `prefers-reduced-motion` fallback.

