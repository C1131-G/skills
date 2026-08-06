---
name: apply-native-feel-nav
description: Native-feel nav — View Transitions, Motion. Called by skill-master / route-react-async-ui.
disable-model-invocation: true
---
# apply-native-feel-nav

Apply these rules whenever building or reviewing navigation transitions/gestures meant to make a React SPA feel like a native mobile app, regardless of which router is in use.

## The three-tool split — use the right one for each job, not one tool for everything

As of 2026 there are three distinct animation tools available, and each has a lane. The most common mistake is picking one and forcing it to do a job it's not suited for (a hand-rolled `requestAnimationFrame` page transition instead of the browser's own compositor, or trying to get gesture-driven drag physics out of the View Transitions API, which has none):

| Job | Tool | Why |
|---|---|---|
| Route/page transitions, shared-element morphs, list reordering | **View Transitions API** | Browser-native: it snapshots old/new DOM state and cross-fades/interpolates on the compositor thread, so it stays smooth even when the main thread is busy. No animation library needed for this job specifically. |
| Gestures — drag, swipe, pan, velocity-aware release, spring physics, interruptible animation | **Motion** (formerly Framer Motion) | The View Transitions API has no concept of an in-progress user gesture or physical velocity — this is squarely Motion's job, and there's no native browser equivalent. |
| Simple, static, non-exit transitions (hover states, color/opacity changes that don't need to survive unmount) | **CSS** (transitions, `@starting-style`) | Reaching for Motion here is unnecessary weight for something CSS already does natively. |

Don't use Motion for the page-transition job the View Transitions API already covers more cheaply — that's the single most common over-engineering mistake here. Reserve Motion for what it uniquely does well: gestures and interruptible, physics-based motion.

## Route transitions: View Transitions API, wired to the router

Wrap the router's navigation-triggered DOM update in `document.startViewTransition(...)` (or React's `<ViewTransition>` primitive, where the framework exposes one) rather than a Motion `AnimatePresence` page-fade. This works the same way regardless of which router is in use — the router just needs to expose a hook into "the DOM is about to change for this navigation":

```ts
function navigateWithTransition(navigate: () => void) {
  if (!document.startViewTransition) {
    navigate(); // no support — just navigate, no animation
    return;
  }
  document.startViewTransition(() => navigate());
}
```

Give the elements that should visually morph between the two views (a shared header, a hero image going from a grid thumbnail to a detail view) a matching `view-transition-name` in CSS — that's what turns a plain cross-fade into a shared-element transition with zero JavaScript animation code:

```css
.hero-image {
  view-transition-name: hero-image;
}
```

## Direction-aware transitions — back should feel like back, forward like forward

A native app slides forward navigation in from the right and back navigation out to the right (or the equivalent for the platform) — a symmetric fade in both directions immediately reads as "just a website." For same-document SPA navigation, the browser doesn't always know navigation direction the way it does for full page loads, so track it yourself off the router's own history state (comparing the new index/position against the previous one) and apply it as a data attribute the CSS can key off:

```ts
document.documentElement.dataset.navDirection = isBack ? "back" : "forward";
```

```css
[data-nav-direction="back"]::view-transition-old(root) { animation: slide-out-to-right 250ms; }
[data-nav-direction="back"]::view-transition-new(root) { animation: slide-in-from-left 250ms; }
[data-nav-direction="forward"]::view-transition-old(root) { animation: slide-out-to-left 250ms; }
[data-nav-direction="forward"]::view-transition-new(root) { animation: slide-in-from-right 250ms; }
```

## Persistent, animated tab bar — don't remount it on every navigation

A bottom tab bar (or equivalent primary nav) should live outside the router's route-rendering tree (in the root layout, not inside each route), so it never unmounts/remounts or re-fades as the active route changes underneath it — only the active-tab indicator and the page content change.

Animate the active-tab indicator with Motion's shared layout animation (`layoutId`) rather than manually computing and transitioning a pixel offset — this gets a natural, physically-continuous slide between tabs for free, including correctly retargeting mid-animation if the user taps a third tab before the first transition finishes:

```tsx
{tabs.map((tab) => (
  <button key={tab.id} onClick={() => setActiveTab(tab.id)}>
    {tab.label}
    {activeTab === tab.id && (
      <motion.div layoutId="active-tab-indicator" className="tab-indicator" />
    )}
  </button>
))}
```

Derive `activeTab` from the router's own current-route state (whatever the router's active-link/active-match API is), not a separately maintained piece of state that has to be kept in sync with the URL by hand.

## Gestures: swipe-to-go-back, swipe-to-dismiss

Use Motion's drag gestures (`drag`, `useMotionValue`, `useDragControls`) for anything the user physically drags — a swipe-from-edge to go back, a bottom sheet dragged down to dismiss. Decide completion by **velocity, not just distance** — a fast short flick should complete the gesture even if the finger didn't travel far, matching how native gesture recognizers work; a slow drag that doesn't cross a distance threshold should snap back:

```tsx
function handleDragEnd(_, info: PanInfo) {
  const shouldDismiss = info.offset.y > 100 || info.velocity.y > 500;
  if (shouldDismiss) dismiss();
  else controls.start({ y: 0 }); // snap back
}
```

## Tap feedback: remove the browser default, add an intentional one

Strip the default blue/gray tap-highlight rectangle (`-webkit-tap-highlight-color: transparent`), but don't leave taps feeling unresponsive as a result — replace it with a deliberate, immediate press state (a slight scale-down via Motion's `whileTap`, or a CSS `:active` state) so every tap still gives instant visual feedback, just a considered one instead of the browser's default.

```tsx
<motion.button whileTap={{ scale: 0.96 }} className="tap-highlight-none">
```

```css
.tap-highlight-none { -webkit-tap-highlight-color: transparent; }
```

## Safe-area insets — don't let system UI overlap fixed elements

Any fixed-position nav bar, tab bar, or bottom sheet needs to respect device safe areas (the home indicator, notches) or it'll render underneath system UI on real devices even though it looks fine in a desktop browser's mobile emulation. Use the `env()` CSS environment variables, wired through Tailwind's arbitrary-value syntax:

```html
<nav class="pb-[env(safe-area-inset-bottom)]">
```

Set `viewport-fit=cover` in the viewport meta tag — without it, `env(safe-area-inset-*)` values are always zero regardless of the CSS above.

## Scroll feel: overscroll behavior and momentum

Set `overscroll-behavior: contain` on scrollable panels that shouldn't trigger the browser's own pull-to-refresh/rubber-band chrome when a custom gesture (a pull-to-refresh implementation, a draggable sheet) already owns that interaction — otherwise the two fight each other. Native-feeling momentum scrolling on iOS Safari specifically still benefits from `-webkit-overflow-scrolling: touch` on scroll containers.

## Timing, easing, and performance

- Keep transition durations short — roughly 200-400ms. Longer reads as sluggish; shorter can feel abrupt. Prefer spring-based easing over fixed-duration linear/ease curves for anything gesture-adjacent (see `route-react-async-ui`'s and `apply-toasts`' motion-design rules for the same spring-vs-fixed-duration principle applied elsewhere).
- Animate only `transform` and `opacity` where possible — these run on the compositor thread and stay smooth even under main-thread load; animating layout-triggering properties (`width`, `top`, `left`) causes jank, especially on lower-end mobile hardware.
- Keep the number of elements with a `view-transition-name` small and deliberate — assigning one to too many elements increases the snapshot/compositing cost of every transition.
- Avoid heavy synchronous work inside a `startViewTransition` callback — it can affect Interaction to Next Paint (INP) since the callback blocks the transition from starting cleanly.
- Test on the actual lower-end devices users have, not just desktop browser mobile emulation — transition cost that's invisible on a dev machine can visibly stutter on real hardware.

## Respect `prefers-reduced-motion`

Consistent with `route-react-async-ui` and `apply-toasts`: check `window.matchMedia("(prefers-reduced-motion: reduce)")` (or the CSS media query equivalent) and fall back to a simple, fast cross-fade with no slide/spring/gesture-driven motion for users who've set that preference — don't force the full native-feel treatment on everyone regardless.

## Applying these rules

- **New navigation UI**: decide which of the three tools each piece of motion belongs to (route transitions → View Transitions API, gestures → Motion, static states → CSS) before writing any animation code; keep the tab bar outside the route tree from the start.
- **Reviewing existing code**: flag a hand-rolled Motion-based page transition where the View Transitions API would do the same job more cheaply, a tab bar that remounts on route change, gesture completion decided by distance alone with no velocity check, missing safe-area handling on fixed elements, animated layout-triggering CSS properties instead of `transform`/`opacity`, and any transition/gesture with no `prefers-reduced-motion` fallback.

