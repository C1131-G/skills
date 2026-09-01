---
name: apply-native-feel-nav
description: Apply native-feeling web navigation and mobile browser ergonomics with View Transitions, motion, touch behavior, safe areas, and viewport handling. Use for route transitions, gestures, persistent navigation, tap feedback, mobile layout, and reduced motion. Triggers on "make it feel native", "feels like a website", janky page changes, tap highlight or double-tap zoom, content under the notch, and layout jumping when the mobile address bar hides.
---

# apply-native-feel-nav

Use this skill directly for navigation motion and mobile ergonomics, in any React SPA regardless of router. Pair it with `apply-next-shell-nav` for Next.js shell structure and `apply-react-async-ui` for non-visual async interaction state.

Also apply `enforce-code-quality` and, for TypeScript code, `enforce-typescript-strict` to files in scope.

**Load only the reference for the branch you need.**

| Branch | Open |
|---|---|
| Route transitions, shared elements, direction, tab bar, timing, reduced motion | [motion.md](motion.md) |
| Gestures, `touch-action`, tap feedback, hit area, sticky hover, overscroll | [touch.md](touch.md) |
| `dvh`/`svh`, input zoom, virtual keyboard, safe areas, `theme-color` | [viewport.md](viewport.md) |

## First: the three-tool split

The most common mistake is picking one animation tool and forcing it to do a job it is not suited for — a hand-rolled `requestAnimationFrame` page transition instead of the browser's own compositor, or trying to get gesture drag physics out of the View Transitions API, which has none.

| Job | Tool | Why |
|---|---|---|
| Route/page transitions, shared-element morphs, list reordering | **View Transitions API** | Browser-native: snapshots old/new DOM and interpolates on the compositor thread, so it stays smooth even when the main thread is busy. No animation library needed. |
| Gestures — drag, swipe, pan, velocity-aware release, spring physics, interruptible motion | **Motion** (formerly Framer Motion) | The View Transitions API has no concept of an in-progress gesture or physical velocity. No native browser equivalent exists. |
| Simple static transitions — hover, color/opacity changes that need not survive unmount | **CSS** (transitions, `@starting-style`) | Motion here is unnecessary weight for something CSS does natively. |

Do not use Motion for the page-transition job the View Transitions API already covers more cheaply — that is the single most common over-engineering mistake in this area. Reserve Motion for what it uniquely does: gestures and interruptible, physics-based motion.

## Non-negotiables

1. Decide **which of the three tools** each piece of motion belongs to before writing any animation code.
2. Primary nav lives **outside the route tree** — it must never remount on navigation.
3. Gesture completion is decided by **velocity or distance**, never distance alone.
4. Every gesture has a **visible, keyboard-operable alternative**.
5. Animate **`transform` and `opacity` only**; never layout-triggering properties.
6. Every gesture surface declares an intentional **`touch-action`**.
7. Hover-only styling sits behind **`(hover: hover)`**; functionality never does.
8. App shells use **`dvh`/`svh`**, never `100vh`.
9. Mobile form controls are **≥16px**; user zoom is never disabled.
10. Fixed elements respect **`env(safe-area-inset-*)`** with `viewport-fit=cover` set.
11. Every animation has a **`prefers-reduced-motion`** fallback.
12. Verified on **real touch hardware**, not desktop emulation.

## Review checklist

Flag: a hand-rolled Motion page transition where View Transitions would do the job more cheaply; a tab bar that remounts on route change; gesture completion by distance alone; gesture-only actions with no button or keyboard path; hover styles not guarded by `(hover: hover)`; undersized or crowded tap targets; `100vh` app shells; sub-16px mobile form controls; missing safe-area or `theme-color` handling; gesture surfaces with no `touch-action`; animated layout-triggering properties; and transitions with no reduced-motion fallback.

## Done when

Each piece of motion uses the right tool for its job; the twelve non-negotiables hold in task scope; and the behavior is verified on a real touch device.
