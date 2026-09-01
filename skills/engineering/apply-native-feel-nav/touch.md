# Native-feel navigation — touch, gestures, and scroll

Disclosed reference. Open from SKILL.md only for the active branch.

## 1. Gestures: swipe-to-go-back, swipe-to-dismiss

Use Motion's drag gestures (`drag`, `useMotionValue`, `useDragControls`) for anything the user physically drags — a swipe from the edge to go back, a bottom sheet dragged down to dismiss.

Decide completion by **velocity, not just distance**. A fast short flick should complete the gesture even if the finger barely travelled, matching how native gesture recognizers work; a slow drag that never crosses the distance threshold should snap back:

```tsx
function handleDragEnd(_, info: PanInfo) {
  const shouldDismiss = info.offset.y > 100 || info.velocity.y > 500;
  if (shouldDismiss) dismiss();
  else controls.start({ y: 0 }); // snap back
}
```

**Never make a gesture the only way to act.** Provide visible, keyboard-operable single-pointer alternatives: previous/next buttons for a carousel, a back control for swipe-back, a close button for swipe-to-dismiss. Assistive technology may consume authored swipe gestures before the component ever receives them.

### Declare which gestures the browser still owns

For a horizontally draggable carousel, reserve horizontal movement for the component while leaving vertical page scrolling and continuous zoom to the browser. `pan-y` is the baseline axis rule; add `pinch-zoom` where supported so the carousel does not needlessly suppress page zoom. Without an intentional value the browser may interpret the gesture in the wrong axis, or delay dispatch while it decides who owns it.

```css
.horizontal-carousel {
  touch-action: pan-y pinch-zoom;
}
```

If the component intentionally owns pinch gestures, document and test that behavior. **Never disable pinch zoom merely to simplify carousel handling.**

## 2. Tap feedback: remove the browser default, add an intentional one

Strip the default blue/gray tap-highlight rectangle — but do not leave taps feeling unresponsive as a result. Replace it with a deliberate, immediate press state so every tap still gives instant feedback, just a considered one:

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

- Feedback must begin on **pointer-down** (`:active`, Motion's `whileTap`), not after click.
- `touch-action: manipulation` removes the legacy tap delay on tappable controls.
- Apply `user-select: none` only to buttons, tabs, and drag handles — **never** to article text, form values, or copyable content.
- Removing a tap highlight does not authorize removing `:focus-visible`. Keep visible keyboard focus.

### Hit area

Authored navigation targets must be at least `24px × 24px` in CSS pixels, or satisfy the WCAG spacing exception. Prefer larger platform-style areas for primary mobile controls. The **interactive** hit area must meet the target, not just the visible icon.

### Sticky hover on touchscreens

Touch devices can leave CSS hover styles visually stuck after a tap. Put hover-only decoration behind a capability query, keeping focus and active states outside it:

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

Use the combined `(hover: hover) and (pointer: fine)` query for effects requiring precise pointing; `(hover: hover)` alone is enough for decoration that only needs convenient hover. **Never hide functionality behind hover.**

## 3. Scroll feel and overscroll behavior

Use **axis-specific** overscroll on nested panels so only that panel's scroll axis stops chaining — for example `overscroll-behavior-y: contain` on a vertically scrolling sheet. A two-axis `overscroll-behavior: contain` can also suppress horizontal browser history gestures.

Do not add `-webkit-overflow-scrolling: touch`; modern iOS accelerates overflow scrolling automatically, and the legacy property can create an unwanted stacking context.

For a full-screen app that intentionally owns document scrolling and must suppress native pull-to-refresh, change only the vertical axis and leave the horizontal axis available for browser history gestures. Use `contain` when the rubber-band affordance may remain, `none` when it must also go:

```css
html,
body {
  overscroll-behavior-y: none;
}
```

Do not apply this blanket rule to ordinary content sites where native overscroll is expected. Before changing root overscroll, test the browser's native back/forward swipe **and** the app's own edge gestures on real hardware.
