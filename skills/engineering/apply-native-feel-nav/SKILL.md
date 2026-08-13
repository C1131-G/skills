---
name: apply-native-feel-nav
description: Apply native-feeling web navigation and mobile browser ergonomics with View Transitions, motion, touch behavior, safe areas, and viewport handling. Use for route transitions, gestures, persistent navigation, tap feedback, mobile layout, and reduced motion.
---
# apply-native-feel-nav

Use this skill directly for navigation motion. Pair it with `apply-next-shell-nav` for Next.js shell structure and `apply-react-transitions` for non-visual async interaction state.

Also apply `enforce-code-quality` and, for TypeScript code, `enforce-typescript-strict` to files in scope.

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

Never make a path gesture the only way to act. Provide visible, keyboard-operable single-pointer alternatives: previous/next buttons for a carousel, a back control for swipe-back, and a close button for swipe-to-dismiss. Assistive technology may consume authored swipe gestures before the component receives them.

Declare which native gestures the browser still owns. For a horizontally draggable carousel, reserve horizontal movement for the component while leaving vertical page scrolling and continuous zoom to the browser. `pan-y` is the baseline axis rule; add `pinch-zoom` where supported so the carousel does not unnecessarily suppress page zoom. Without an intentional value, the browser may interpret the gesture in the wrong axis or delay dispatch while deciding what owns it.

```css
.horizontal-carousel {
  touch-action: pan-y pinch-zoom;
}
```

If the component intentionally owns pinch gestures, document and test that behavior instead. Never disable pinch zoom merely to simplify carousel handling.

## Tap feedback: remove the browser default, add an intentional one

Strip the default blue/gray tap-highlight rectangle (`-webkit-tap-highlight-color: transparent`), but don't leave taps feeling unresponsive as a result — replace it with a deliberate, immediate press state (a slight scale-down via Motion's `whileTap`, or a CSS `:active` state) so every tap still gives instant visual feedback, just a considered one instead of the browser's default.

```tsx
<motion.button whileTap={{ scale: 0.96 }} className="tap-highlight-none">
```

```css
.tap-highlight-none {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
}
```

Make the replacement feedback begin on pointer-down (`:active`, Motion `whileTap`, or the equivalent pointer event), not after click. `touch-action: manipulation` removes unnecessary gesture delay on tappable controls. Apply `user-select: none` only to buttons, tabs, draggable handles, and other interaction chrome whose labels should not be selected on long-press—never to article text, form values, or copyable content. Preserve visible keyboard focus; removing a tap highlight does not authorize removing `:focus-visible`.

Make authored navigation targets at least `24px × 24px` in CSS pixels or satisfy the WCAG spacing exception; prefer larger platform-style hit areas for primary mobile controls. The interactive hit area—not only the visible icon—must meet the target.

Touchscreens can leave CSS hover styles visually stuck after a tap. Put hover-only decoration behind a capability query, while keeping focus and active states outside it:

```css
@media (hover: hover) and (pointer: fine) {
  .nav-item:hover {
    background: var(--nav-hover);
  }
}

.nav-item:focus-visible {
  outline: 2px solid currentColor;
}

.nav-item:active {
  transform: scale(0.98);
}
```

Use the combined `(hover: hover) and (pointer: fine)` query for effects that require precise pointing. If a decorative effect only requires convenient hover—not precision—`(hover: hover)` is sufficient. Never hide functionality behind hover alone.

## Mobile viewport height and input zoom

Do not size a mobile app shell with `100vh`; browser chrome makes that value unreliable. Use `100dvh` for an app surface that should track the currently visible viewport, and `100svh` for a hero or landing section that should remain stable when browser bars expand or collapse.

```css
.app-shell { min-height: 100dvh; }
.hero { min-height: 100svh; }
```

Keep text inputs, textareas, and selects at a computed font size of at least `16px` on small screens. Mobile Safari zooms the page when focusing smaller form text, making the interface feel broken. Do not disable user zoom in the viewport meta tag to work around this; fix the control font size.

Test focused controls and fixed bottom bars with the virtual keyboard open. `100dvh` does not guarantee keyboard-safe layout in every browser. Where supported, `interactive-widget=resizes-content` in the viewport meta tag makes the layout viewport shrink with the keyboard; otherwise use a carefully tested `visualViewport` fallback only when CSS and normal document flow cannot keep the focused control visible.

## Safe-area insets — don't let system UI overlap fixed elements

Any fixed-position nav bar, tab bar, or bottom sheet needs to respect device safe areas (the home indicator, notches) or it'll render underneath system UI on real devices even though it looks fine in a desktop browser's mobile emulation. Use the `env()` CSS environment variables, wired through Tailwind's arbitrary-value syntax:

```html
<nav class="pb-[max(1rem,env(safe-area-inset-bottom))]">
```

Set `viewport-fit=cover` in the viewport meta tag — without it, `env(safe-area-inset-*)` values are always zero regardless of the CSS above.

Apply the relevant inset on every edge where content can meet a cutout or system gesture area, not only the bottom. Verify the result in portrait and landscape.

## Scroll feel and overscroll behavior

Use axis-specific overscroll on nested panels so only the panel's scroll axis stops chaining—for example, `overscroll-behavior-y: contain` on a vertically scrolling sheet. A two-axis `overscroll-behavior: contain` can also suppress horizontal browser history gestures. Do not add `-webkit-overflow-scrolling: touch`; modern iOS accelerates overflow scrolling automatically, and the legacy property can create an unwanted stacking context.

For a full-screen app that intentionally owns document scrolling and must suppress native pull-to-refresh, change only the vertical axis. Keep the horizontal axis available for browser history gestures. Use `contain` when the native rubber-band affordance may remain, or `none` when it must also be removed. Do not apply this blanket rule to ordinary content sites where native overscroll is expected.

```css
html,
body {
  overscroll-behavior-y: none;
}
```

Before changing root overscroll, test the browser's native back/forward swipe and the app's own edge gestures on real hardware.

## Browser chrome and status-bar color

Set a `theme-color` for each color scheme so supported mobile browsers paint their address/status chrome to match the app instead of leaving a desktop-looking default. Keep these values synchronized with the actual page background.

```html
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0b0b0c" media="(prefers-color-scheme: dark)" />
```

If the app has a theme toggle independent of the operating-system preference, update the active `theme-color` at runtime and set the CSS `color-scheme` property so native controls follow the same theme.

## Timing, easing, and performance

- Keep transition durations short — roughly 200-400ms. Longer reads as sluggish; shorter can feel abrupt. Prefer spring-based easing over fixed-duration linear/ease curves for anything gesture-adjacent (see `apply-react-transitions` and `apply-toasts` for adjacent interaction guidance).
- Animate only `transform` and `opacity` where possible — these run on the compositor thread and stay smooth even under main-thread load; animating layout-triggering properties (`width`, `top`, `left`) causes jank, especially on lower-end mobile hardware.
- Keep the number of elements with a `view-transition-name` small and deliberate — assigning one to too many elements increases the snapshot/compositing cost of every transition.
- Avoid heavy synchronous work inside a `startViewTransition` callback — it can affect Interaction to Next Paint (INP) since the callback blocks the transition from starting cleanly.
- Test on the actual lower-end devices users have, not just desktop browser mobile emulation — transition cost that's invisible on a dev machine can visibly stutter on real hardware.
- Test at least one real touch device for sticky hover, tap feedback, input focus zoom, dynamic viewport height, pull-to-refresh, safe-area insets, carousel axis behavior, and browser-chrome color. A layout that is correct in responsive desktop emulation is not verified on mobile hardware.

## Respect `prefers-reduced-motion`

Consistent with `apply-react-suspense` and `apply-toasts`: check `window.matchMedia("(prefers-reduced-motion: reduce)")` (or the CSS media query equivalent) and remove spatial/spring animation or make it effectively instantaneous. Keep the gesture's function available and keep its visible non-gesture control; reduced motion changes presentation, not capability.

## Applying these rules

- **New navigation UI**: decide which of the three tools each piece of motion belongs to (route transitions → View Transitions API, gestures → Motion, static states → CSS) before writing any animation code; keep the tab bar outside the route tree from the start.
- **Reviewing existing code**: flag a hand-rolled Motion-based page transition where the View Transitions API would do the same job more cheaply, a tab bar that remounts on route change, gesture completion decided by distance alone with no velocity check, gesture-only actions without button/keyboard alternatives, hover styles not guarded by `(hover: hover)`, undersized or crowded tap targets, `100vh` app shells, sub-16px mobile form controls, missing safe-area or `theme-color` handling, gesture surfaces without an intentional `touch-action`, animated layout-triggering CSS properties instead of `transform`/`opacity`, and transitions with no `prefers-reduced-motion` fallback.

