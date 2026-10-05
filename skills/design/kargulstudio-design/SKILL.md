---
name: kargulstudio-design
description: Design and build an app's UI with the design principles learned from Kargul Studio's sales-crm and workflow-editor — calm chrome, one accent, hierarchy by contrast, dense rhythmic spacing, strict alignment, depth from light, concentric radii, every state designed, details in layers, stable layout, brief motion, mobile re-layout. Buttons follow the Kargul button system closely; everything else (palette, layout, screens, components) is designed for the user's own product by applying the principles, never copied from the source apps. Use on a shadcn/ui or Tailwind + Radix project when asked to "design / build / restyle the app with the Kargul principles", "make it feel like Kargul Studio's apps but for my product", "make the UI feel premium / polished / dense but calm", "button padding feels off", "spacing is inconsistent", "add a new screen / settings page / list page / dashboard", or when the repo already has a Kargul-style `buttonVariants` with `ease-power3-out`.
---

# kargulstudio-design

Design principles learned from [kargulstudio/sales-crm](https://github.com/kargulstudio/sales-crm) and [kargulstudio/workflow-editor](https://github.com/kargulstudio/workflow-editor), applied to **your** app. Also apply `enforce-code-quality`, and `enforce-typescript-strict` for `.ts` / `.tsx`.

## What to take, and how

| Part | Take | How |
|---|---|---|
| **Buttons** | Close to the source | The Kargul button system: variants, sizes, optical padding, icon sizing, states. → [buttons.md](buttons.md), ready-made `button.tsx` in [shadcn.md](shadcn.md) |
| **Everything else** | The principles only | Your own palette, layout, screens and components, each designed by applying [principles.md](principles.md). The source apps are examples of the principles, not templates. |

Never reproduce a source screen, its layout, its copy, its icons or its brand colors unless the user asks for that specifically. A finished app should feel related to the Kargul apps in quality and rhythm, and look like its own product.

## References

| Task | Open |
|---|---|
| The principles, with why and how to apply each one | [principles.md](principles.md) |
| Any button: variant, size, icon, padding, grouping, states | [buttons.md](buttons.md) |
| Starting from shadcn/ui: theme roles, `button.tsx`, restyling the other components | [shadcn.md](shadcn.md) |
| Designing the frame, screens, forms, states and mobile for your product | [layout.md](layout.md) |
| What makes menus, overlays, fields, tags, tabs, tables, cards and feedback feel right | [components.md](components.md) |
| Building your palette; reference colors, type, radii, shadows | [tokens.md](tokens.md) |
| Spacing scale and density calibration | [spacing.md](spacing.md) |
| Motion timing and patterns | [motion.md](motion.md) |

Working order for a new app: principles.md → tokens.md (build your palette) → buttons.md / shadcn.md → layout.md (frame, then each screen) → components.md as each piece is built → motion.md.

## Principles (summary)

1. **Calm chrome, loud content** — navigation and labels recede; data and the next action carry contrast.
2. **One accent, spent carefully** — on the primary action, selection and focus only.
3. **Hierarchy by contrast, not size** — 3–4 type sizes, a 5-step text ramp, one in-between weight.
4. **Dense, with rhythm** — ~30–32px controls, a short gap scale, fixed row heights, no sibling margins.
5. **Align everything** — one height per row, fixed icon cells, optical padding, reserved bold width.
6. **Depth from light, separation from hairlines** — a surface ladder, ring + top highlight, 1px dividers; one finish per app.
7. **Concentric geometry** — inner radius = outer radius − padding.
8. **Every state is designed** — control states and screen states (empty, no results, error, not available, destructive).
9. **Keep the user's place** — fixed frame, one scrolling region, details in layers over the screen.
10. **Nothing moves unless the user moved it** — tabular numbers, fixed widths and heights, shaped skeletons.
11. **Motion explains, briefly** — 150 / 200 / 300ms, exits faster, transform and opacity only, reduced motion respected.
12. **Mobile is a re-layout** — each region gets a small-screen form; the primary action stays visible.
13. **Words name outcomes** — buttons say what happens; empty states say what will appear.
14. **Accessible by construction** — labels, visible focus, real ARIA state that the styling reads.
15. **Build it as a system** — one component per concept, variants for looks, tokens for values.

## Button rules (taken from the source)

- Every clickable thing renders through one `Button`: nav items, breadcrumbs, tabs, rows, links, icon buttons. `variant` is the look, `size` is the box.
- Standard control height ~30px (flat finish) or 32px (tactile); every control in a row matches.
- Icon side gets less padding than text side; icons are smaller and dimmer than the label and brighten on hover.
- Primary is the rightmost button in its group, one per area; Cancel then confirm in footers.
- Hover changes fill or text color in 150ms; press darkens or scales to 98%; busy swaps the icon for a spinner at a fixed width; disabled keeps the shape.

## Review checklist

- A screen, layout, palette or icon set copied from the source apps instead of designed for this product.
- More than one accent-colored action in an area; accent used as decoration.
- Chrome as loud as content; text ranked by size instead of contrast; more than four type sizes in app UI.
- Controls in one row at different heights; symmetric padding next to an icon; icons as bright as their label.
- Ad hoc spacing values, or margins between siblings.
- Heavy borders for elevation in a tactile app, or mixed finishes across screens.
- A screen missing its empty, no-results, error, or destructive-confirmation state; a dead click.
- The whole page scrolls, or opening a record loses the list, filters or selection.
- Layout shift on hover, selection, loading or number changes.
- `transition-all`; open and close at the same speed; no reduced-motion fallback.
- Mobile that only shrinks; a primary action hidden on mobile.
- Raw `<button>` / `<a>` styled by hand; icon-only buttons without `aria-label`.

## Done when

Buttons follow the Kargul button system; the palette, layout, screens and components are the product's own and each satisfies the principles in principles.md; every screen handles its states; no review-checklist item remains; and the project's lint, typecheck and build pass.
