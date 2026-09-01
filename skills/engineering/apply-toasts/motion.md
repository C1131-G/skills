# Toasts — visual polish and motion

Disclosed reference. Open from SKILL.md only when customizing a toast's appearance or animation.

**Start here:** Sonner already uses the **Motion** library internally for its default transitions, and exposes `className`, `style`, and CSS variables for most visual customization. Only reach for a fully custom Motion-based toast when those options genuinely cannot achieve the look you need. A bespoke toast system is real surface area to maintain — treat it as a deliberate upgrade, not the default starting point.

## 1. Spring physics, not fixed-duration easing

A `cubic-bezier` with a fixed duration always looks the same regardless of context. A spring responds to the situation and reads as physical rather than scripted. Prefer a spring for enter/exit unless a linear transition specifically reads better.

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

## 2. Motion must be interruptible

If a new toast arrives while another is still animating out — or the stack is re-flowing — the animation should continue from its current position and velocity, not snap back to a fixed start state and replay.

A spring gives this naturally, because it can retarget mid-flight. A fixed-duration keyframe animation cannot do it cleanly. That is the second reason to prefer springs here.

## 3. Restraint over spectacle

Apple's motion language favors subtle, quick, purposeful movement — a small scale/opacity/position shift, not a bounce, spin, or multi-stage entrance. A toast that overshoots wildly or takes half a second to settle reads as gimmicky, not premium.

**Keep total settle time in the 200-400ms range.**

## 4. Depth via translucency, not heavy shadows

A subtle `backdrop-filter: blur(...)` over a semi-transparent background — a "glass" material — paired with a soft, low-opacity shadow reads as more refined than a flat opaque box with a hard drop shadow.

Keep blur and opacity subtle enough that the text inside stays fully legible against any background.

## 5. Respect `prefers-reduced-motion`

Same principle as `apply-native-feel-nav`. Fall back to a fast opacity-only fade with no spring, scale, or position movement:

```tsx
const prefersReducedMotion = useReducedMotion(); // Motion's built-in hook

<motion.div
  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={prefersReducedMotion ? { duration: 0.15 } : { type: "spring", stiffness: 500, damping: 35 }}
>
```
