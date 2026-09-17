# Shell navigation — transitions and motion

Disclosed reference. Open from SKILL.md when the shell needs visual navigation motion.

The techniques here are router-agnostic — they need only a hook into "the DOM is about to change for this navigation" — but they assume the persistent shell this skill builds. Rule 1 (layout owns the shell) is a prerequisite: a tab bar or sidebar that remounts per route cannot animate continuously.

## 1. Pick the right tool before writing animation code

The most common mistake is forcing one animation tool to do a job it is not suited for — a hand-rolled `requestAnimationFrame` page transition instead of the browser's own compositor, or trying to get drag physics out of the View Transitions API, which has none.

| Job | Tool | Why |
|---|---|---|
| Route/page transitions, shared-element morphs, list reordering | **View Transitions API** | Browser-native: snapshots old/new DOM and interpolates on the compositor thread, so it stays smooth even when the main thread is busy. No animation library needed. |
| Gestures — drag, swipe, pan, velocity-aware release, spring physics, interruptible motion | **Motion** (formerly Framer Motion) | The View Transitions API has no concept of an in-progress gesture or physical velocity. No native browser equivalent exists. |
| Simple static transitions — hover, color/opacity changes that need not survive unmount | **CSS** (transitions, `@starting-style`) | Motion here is unnecessary weight for something CSS does natively. |

Do not use Motion for the page-transition job the View Transitions API already covers more cheaply — that is the single most common over-engineering mistake in this area. Reserve Motion for what it uniquely does: gestures and interruptible, physics-based motion.

## 2. Route transitions: View Transitions API, wired to the router

Wrap the router's navigation-triggered DOM update in `document.startViewTransition(...)` (or React's `<ViewTransition>` primitive, where the framework exposes one) rather than a Motion `AnimatePresence` page-fade:

```ts
function navigateWithTransition(navigate: () => void) {
  if (!document.startViewTransition) {
    navigate(); // no support — just navigate, no animation
    return;
  }
  document.startViewTransition(() => navigate());
}
```

Give the elements that should visually morph between two views (a shared header, a hero image going from grid thumbnail to detail) a matching `view-transition-name` in CSS. That is what turns a plain cross-fade into a shared-element transition with zero JavaScript animation code:

```css
.hero-image {
  view-transition-name: hero-image;
}
```

## 3. Direction-aware transitions — back should feel like back

A native app slides forward navigation in from the right and back navigation out to the right. A symmetric fade in both directions immediately reads as "just a website."

For same-document soft navigation the browser does not always know the direction the way it does for full page loads, so track it yourself from the router's own history state (comparing the new index against the previous one) and expose it as a data attribute CSS can key off:

```ts
document.documentElement.dataset.navDirection = isBack ? "back" : "forward";
```

```css
[data-nav-direction="back"]::view-transition-old(root) { animation: slide-out-to-right 250ms; }
[data-nav-direction="back"]::view-transition-new(root) { animation: slide-in-from-left 250ms; }
[data-nav-direction="forward"]::view-transition-old(root) { animation: slide-out-to-left 250ms; }
[data-nav-direction="forward"]::view-transition-new(root) { animation: slide-in-from-right 250ms; }
```

## 4. Animated active-tab indicator on the persistent nav

The primary nav lives outside the route-rendering tree (rule 1), so it never unmounts, remounts, or re-fades as the active route changes underneath it. Only the active-tab indicator and the page content change.

Animate the indicator with Motion's shared layout animation (`layoutId`) rather than computing and transitioning a pixel offset by hand. That gives a physically continuous slide for free, including correct retargeting if the user taps a third tab mid-animation:

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

Derive `activeTab` from the navigation model and current pathname (rule 2), not a separate piece of state kept in sync with the URL by hand.

## 5. Timing, easing, and performance

- **Duration ~200-400ms.** Longer reads as sluggish; shorter feels abrupt. Prefer spring-based easing over fixed-duration curves for anything gesture-adjacent (see `apply-react-async-ui` and `apply-toasts` for adjacent interaction guidance).
- **Animate only `transform` and `opacity`** where possible — these run on the compositor thread and stay smooth under main-thread load. Animating layout-triggering properties (`width`, `top`, `left`) causes jank, especially on low-end mobile hardware.
- **Keep `view-transition-name` assignments few and deliberate** — each one increases the snapshot and compositing cost of every transition.
- **No heavy synchronous work inside a `startViewTransition` callback** — it blocks the transition from starting cleanly and shows up in Interaction to Next Paint (INP).
- **Test on the low-end devices your users actually have**, not desktop mobile emulation. Transition cost invisible on a dev machine can visibly stutter on real hardware.

## 6. Respect `prefers-reduced-motion`

Consistent with `apply-react-async-ui` and `apply-toasts`: check `window.matchMedia("(prefers-reduced-motion: reduce)")` (or the CSS media query) and remove spatial/spring animation, or make it effectively instantaneous.

Keep every action's function available and keep its visible, keyboard-operable control. **Reduced motion changes presentation, not capability.**

## Done when

- Each piece of motion uses the tool from the table that fits its job
- Route transitions go through `startViewTransition`, with a no-support fallback that just navigates
- Back reads as back
- The nav indicator animates without the nav remounting
- Only `transform` and `opacity` animate, and every transition has a reduced-motion fallback

For touch behavior, safe areas, and mobile viewport handling underneath all of this, use the `mobile-native` skill.
