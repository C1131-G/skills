---
name: route-react-async-ui
description: >
  Async UI router. Routes to apply-react-transitions, apply-react-optimistic,
  apply-react-suspense. Called by skill-master for interactive or loading UI.
disable-model-invocation: true
---

# route-react-async-ui

Load **only** the sub-skills the task needs.

## Decision

| Task | Read |
|---|---|
| Click handler, form action, pending state | `../apply-react-transitions/SKILL.md` |
| Instant optimistic feedback on mutation | `../apply-react-optimistic/SKILL.md` |
| Suspense boundary, flicker, streaming promise, deferred render | `../apply-react-suspense/SKILL.md` |

Most mutations need **transitions + optimistic**. If `useEffect` appears → also `../audit-react-effects/SKILL.md`.

## Flow map

```
User interaction
  EVENT       → apply-react-transitions   (capture input outside transition)
  TRANSITION  → apply-react-transitions   (useTransition / useActionState)
  OPTIMISTIC  → apply-react-optimistic    (useOptimistic or onMutate)
  LOADING     → apply-react-suspense      (fresh load vs keep previous)
  ANIMATE     → apply-native-feel-nav (View Transitions — visual only)
  COMMIT      → apply-react-optimistic    (server truth / invalidate)
```

## View Transitions (visual only)

Not `useTransition` (priority). For route-level VT → `apply-native-feel-nav`.

```ts
function animateUpdate(update: () => void) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches
    || !document.startViewTransition) {
    update();
    return;
  }
  document.startViewTransition(update);
}
```

## Accessibility

- Optimistic + rollback: `aria-live="polite"` (errors: `"assertive"`)
- Never silent rollback

## Done when

Selected leaves applied; rapid-click guarded; server truth on commit.
