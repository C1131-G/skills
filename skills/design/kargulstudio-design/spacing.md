# Spacing and layout

Measured from both repositories, as calibration for principle 4 (dense, with rhythm). Keep the shape — a short gap scale, one control height per row, fixed row heights — and tune the numbers to your product's density. The region sizes are examples of how the source apps applied the scale, not layouts to reproduce.

## Gap scale

| Gap | Px | Used for |
|---|---|---|
| `gap-px` / `gap-[2px]` | 1–2 | Star ratings, segment bars, a grid of cells with hairline gutters |
| `gap-[3px]` | 3 | Tags in a row |
| `gap-0.5` | 2 | Segmented-tab buttons; dot + label inside a status pill |
| `gap-1` | 4 | Icon + short text (`$` + amount, calendar + date); sidebar section title → list; Flat toolbar button pair |
| `gap-1.5` | 6 | Inside Flat buttons; avatar + name; meta row (time · company) |
| `gap-2` | 8 | **Default.** Flat header clusters, field label → input, card title → body, footer buttons; inside Tactile buttons |
| `gap-2.5` | 10 | Mobile toolbar grids, Tactile rail nav items |
| `gap-3` | 12 | **Tactile default.** Topbar clusters, toolbars, logo + name, two-line row content |
| `gap-3.5` | 14 | Icon badge + section title |
| `gap-4` | 16 | Form fields in a section, tabs in a tab list, grouped topbar areas |
| `gap-5` | 20 | Rail groups, settings rows inside a section, stat card blocks |
| `gap-6` / `gap-8` | 24 / 32 | Label ↔ control in a settings row; rail top → nav |

Siblings never get margins. If two things need different gaps, nest a wrapper with its own `gap`.

## Control heights

Every control in one row shares one height.

| Height | Flat | Tactile |
|---|---|---|
| 16px | Count badge `h-4` | — |
| 20px | Avatar `size-5` | Change chip `h-5`, switch `h-5` |
| 22–24px | Tag `h-[22px]`, close `icon-sm` | Tag `h-6`, crumb `h-6`, xs button `h-6`, field label row `h-6` |
| **30px** | **All buttons, filter menus, nav items** | — |
| **32px** | Active nav item `h-8` | **All app buttons (`field`, `icon`), menu items `h-8`, tabs** |
| 36px | Inputs, select triggers `h-9` | Inputs, select fields, `icon-lg`, `block` `h-9` |
| 40px | — | Mobile toolbar buttons and search `h-10`; icon badge `size-10` |

## Bars and regions (reference)

| Region | Flat | Tactile |
|---|---|---|
| App frame | Sidebar + main, `h-dvh overflow-hidden` | Rail + main inset `p-1.5`, main `rounded-[10px]` with a 1px black ring |
| Sidebar | `--sidebar-width` 254px (200–400, resizable), sections `p-3 gap-1` | Rail 70px collapsed / 236px expanded, `px-[17px] py-5 gap-8` |
| Header | `px-4 py-[14px]` around 30px controls (58px) | `h-16 p-4` |
| Tab bar | `px-4`, triggers `py-4 gap-4`, underline tabs | `h-[51px] px-4 py-2`, segmented tabs |
| Toolbar | `px-4 py-4 gap-2`, wraps | `gap-3`, wraps; mobile stacks `gap-2.5` |
| Table head / row | `h-[38px]` / `h-[42px]`, cell `px-3` | — |
| Panel section | `p-5 gap-4` with a bottom hairline | Section header `px-[18px] py-3.5`, body `p-5 gap-5` |
| Settings row | — | `px-4 py-3 gap-6 rounded-[12px]` |
| Card | `p-4 gap-4 rounded-lg` | Stat card `px-5 pt-[19px] pb-[18px] gap-5 rounded-[16px]` |
| Dialog | Header `px-6 py-5 gap-2`, footer `px-6 py-4 gap-2`, form sections `px-6 py-5 gap-4` | `max-w-[520px] rounded-[16px]` |
| Sheet | Header `h-14 px-6`, footer `h-[62px] px-6`, side sheet `sm:w-[560px]` | Bottom sheet `rounded-t-[20px] max-h-[85dvh]` |
| Menu | Content `p-1`, items `px-2 py-2` | Content `p-1.5`, items `h-8 px-2` |
| Floating panel | — | `top-4 right-4 w-[min(480px,calc(100%-32px))]`, header `px-[18px] py-3.5` |

`px-4` is the page gutter in Flat at every breakpoint. Dialogs and popovers keep `16px` from the viewport: `w-[calc(100%-2rem)]`, `collisionPadding={16}`.

## Section rhythm

- Separate stacked sections with a bottom hairline, not a gap: Flat `shadow-[inset_0_-1px_0_var(--line-strong)]` (does not add height) with `last:shadow-none`, or `divide-y divide-border` on the parent; Tactile the 2px engraved `Divider`.
- Inside a section the heading row is fixed height when it holds an action (`h-[30px]` Flat, `h-6` Tactile field label) so sections with and without actions align.
- Headings in a panel are `eyebrow-style` (12px uppercase, `tracking-[1px]`) in Flat; `text-[16px] font-[550]` + a `text-[13px] text-white/50` description in Tactile.

## Responsive

- Flat: the desktop sidebar is `hidden lg:flex`; below `lg` the same content renders inside a left `Sheet`. Filters collapse into one mobile control below `sm`.
- Tactile: compact mode is `max-width: 639px` (`useCompact`); the rail becomes an overlay drawer, editor tabs move to a bottom bar, secondary topbar buttons hide below `md`.
- Text that should not wrap gets `min-w-0 flex-1 truncate` on itself and `shrink-0` on every neighbouring icon, badge and button.
- Global padding tokens (`--padding-global`, `--padding-section-*`) step at `sm` / `md` / `lg` in `globals.css`; use `px-(--padding-global)` for marketing sections rather than new breakpoint paddings.
