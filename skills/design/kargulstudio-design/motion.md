# Motion

Short, specific, and asymmetric: things open a little slower than they close, and only the properties that change are transitioned.

## Timing

| Duration | Use |
|---|---|
| 100ms | Menu item highlight (Tactile), tooltip and menu close |
| **150ms** | **Hover and press:** background, color, border, box-shadow; menu close (Flat) |
| **200ms** | **Popover, menu, select open**; chevron rotation; icon swaps; segmented-tab fade; floating panel entry |
| 250ms / 200ms | Dialog open / close (Flat) |
| 300ms | Sidebar rail width, nav indicator slide, bottom sheet open, view-toggle icon rotation |
| 350ms / 250ms | Side sheet open / close (Flat) |
| 400–600ms | Slow ambient hover reveals only (stat card glow and label brightening) |

Close is always faster than open: `duration-200 data-[state=closed]:duration-150`.

## Curves

| Curve | Use |
|---|---|
| `ease-power3-out` | Entering, hover, anything reacting to the user |
| `ease-power3-in` | Exiting (`data-[state=closed]:ease-power3-in`) |
| `ease-power3-in-out` | Color transitions on Tactile controls |
| `ease-smooth-in-out` | Layout motion that travels: rail width, indicator slide, switch thumb, radius morph |

## Patterns

- **Name the properties.** `transition-[background-color,color,box-shadow]`, `transition-[opacity,translate]`, `transition-[width]`. Never `transition-all`.
- **Popover entry.** `animate-in fade-in-0 zoom-in-95` (Flat) or `zoom-in-[0.96–0.97]` (Tactile), from the Radix transform origin; exit mirrors with `fade-out-0 zoom-out-95`.
- **Chevron.** `transition-transform duration-200 group-data-[state=open]:rotate-180`.
- **Icon swap.** Stack both icons `absolute` in one slot; the hidden one gets `scale-[0.25] opacity-0 blur-[4px]` via `data-hidden`, transitioning `[opacity,scale,filter]` over 200ms.
- **Sliding indicator.** One absolutely positioned bar, moved with `translate-y-[calc(var(--nav-index)*46px)]` where `--nav-index` is set inline; 300ms `ease-smooth-in-out`. Never mount a new indicator per item.
- **Mount-in without JS.** `starting:translate-x-3 starting:opacity-0` with `transition-[opacity,translate] duration-200` for panels that appear on render.
- **Press.** Pills `active:scale-98` (transition `[scale]`); app controls darken instead of scaling.
- **Reduced motion.** Every travel animation has `motion-reduce:transition-none`; zoom entries fall back with `motion-reduce:data-[state=open]:zoom-in-100`.
- **Keyframes** live in `@theme` as `--animate-*` (`fade-in` 400ms, `chart-draw` 900ms, `run-ping`, `dash-flow`) and are used as `animate-fade-in`.

For anything beyond these — gesture-driven or spring motion — load the `animate` skill.
