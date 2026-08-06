---
name: react-async-ui
description: Async UI router. Routes to transitions, optimistic, suspense. Called by master for interactive or loading UI.
disable-model-invocation: true
---

# React Async UI — Router

Load **only** the sub-skills the task needs.

## Decision

| Task | Read |
|---|---|
| Click handler, form action, pending state | `../react-transitions/SKILL.md` |
| Instant optimistic feedback on mutation | `../react-optimistic/SKILL.md` |
| Suspense boundary, flicker, streaming promise, deferred render | `../react-suspense/SKILL.md` |

Most mutations need **transitions + optimistic**. If `useEffect` appears → also `../react-effect-audit/SKILL.md`.

## Flow map

```
User interaction
  EVENT       → react-transitions   (capture input outside transition)
  TRANSITION  → react-transitions   (useTransition / useActionState)
  OPTIMISTIC  → react-optimistic    (useOptimistic or onMutate)
  LOADING     → react-suspense      (fresh load vs keep previous)
  ANIMATE     → native-feel-navigation (View Transitions — visual only)
  COMMIT      → react-optimistic    (server truth / invalidate)
```

## View Transitions (visual only)

Not `useTransition` (priority). For route-level VT → `native-feel-navigation`.

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
