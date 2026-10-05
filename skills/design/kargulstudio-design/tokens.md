# Tokens

Keep the **structure** — the token roles, the ramps, the ratios between steps, the shadow anatomy. Choose your own **values**: your accent, your neutrals, your type. The Kargul values below are reference palettes to calibrate against or start from, not a brand to copy.

## Build your palette

1. **Neutrals.** A surface ladder of 4–6 steps (page → sidebar/panel → card → control → hover → hairline), each step a small lightness change (≈2–4% on dark UI). Tint the neutrals slightly toward your accent if you want warmth or coolness (workflow-editor's are faintly blue: `#111114`, `#1b1b20`).
2. **Text ramp.** Five roles: primary, secondary, tertiary, placeholder, disabled. On dark UI either named greys (sales-crm) or white at fixed opacities (workflow-editor); pick one method for the whole app.
3. **One accent** with hover (slightly lighter) and press (slightly darker) steps, a focus-ring tint, and a glow tint if the finish is tactile.
4. **Semantic tones**: success, warning, danger, and a neutral, each as a tag triplet (fill, edge, text). Add more tag hues only when the product has more categories.
5. **Check contrast**: primary and secondary text ≥ 4.5:1 on every surface they sit on; placeholder and disabled may go lower.

Expose every value as a CSS variable mapped through `@theme inline`, so components use roles (`bg-secondary`, `text-soft`) and a rebrand is a value swap. The reference palettes follow.

## Color — Flat reference (sales-crm)

Dark only (`color-scheme: dark`). Every color is a CSS variable exposed through `@theme inline` as `--color-*`, so classes read `bg-secondary`, `text-soft`, `border-line-strong`.

| Role | Token | Value |
|---|---|---|
| Page | `background` | `#161616` |
| Sidebar | `sidebar` / `sidebar-accent` | `#171717` / `#181818` |
| Card | `card` | `#1b1d20` |
| Button / input fill | `secondary` | `#1e1e1e` |
| Hover fill, chip fill | `muted`, `accent` | `#2a2a2a` |
| Hairline | `border` | `#232323` |
| Strong hairline, input border | `line-strong`, `input` | `#393939` |
| Brand | `primary` | `#4124fb` (hover `#4b30ff`) |

Text runs in five steps — choose by importance, keep the size:

| Step | Token | Value | Use |
|---|---|---|---|
| 1 | `foreground` | `#f9fbff` | Values, titles, active items |
| 2 | `soft` | `#a4a4a4` | Body copy, descriptions, labels |
| 3 | `muted-foreground` | `#7f7f7f` | Units, secondary columns, sidebar idle text |
| 4 | `subtle` | `#676767` | Placeholders, table heads, idle icons |
| 5 | `faint` | `#454545` | Sidebar section titles |

Status: `success #22c55e`, `warning #fbbf24`, `danger #f97373`, `status #16c89e` (selected-radio dot), `trend #00b562`. Icons on hover: `icon #d0d4dd`.

Tags have their own triplets — `--tag-<tone>-bg / -border / -text` for blue, purple, green, moss, red, orange, amber, teal, yellow, neutral — used as `bg-(--tag-blue-bg)`. Add a tone as a new triplet, never as a one-off class.

## Color — Tactile reference (workflow-editor)

Hard-coded, tuned per surface. The shadcn tokens in `globals.css` are present but the app UI does not use them.

| Surface | Value |
|---|---|
| App backdrop | `#0c0c0f` |
| Main frame, topbar, tab bar | `#111114` |
| Segmented-tab track | `#121215` |
| Card, section, dialog | `#141417` |
| Section header, floating panel, menu | `#18181c` / `#17171c` (menus at `/90` + `backdrop-blur-[12px]`) |
| Control fill | `#1b1b20`, hover `#222228`, press `#18181c` |
| Field fill | `bg-white/2`, hover `bg-white/3` |
| Accent | `#5016ff` (hover `#5b25ff`, press `#4812e6`); focus/indicator violet `#7f59f0`, `#7445ff`, glow dot `#9875ff` |

Text is white at fixed alphas: `white` titles → `/90` input text → `/80` button labels → `/70` → `/60` icons → `/50` descriptions and field labels → `/40` placeholders and idle icons → `/32` idle nav → `/30` crumbs and disabled.

Semantic tones (tags, deltas): violet `#7f59f0`, green `#59f089` / `#1fc16b`, red `#f05959`, cyan `#59ebf0`, amber `#ffb575`, destructive menu text `#ff6b61`. Each tag tone is the color at full strength for text, the same color at `/5`–`/14` for the fill, and a colored `text-shadow` glow.

## Type (reference scales)

Flat — set in `@layer base`, all `leading-none`, `tracking-normal`:

| Class | Size / weight |
|---|---|
| `h1`, `.h1-style` | 16 / 500 |
| `h2`, `.h2-style` | 16 / 600 |
| `h3`, `.h3-style` | 16 / 400 |
| `h4–h6` | 14 / 500 |
| `p`, `.p-style` | 14 / 400, `leading-[1.15]` |
| `.lead-style` | 14 / 400 |
| `.caption-style` | 12 / 400 |
| `.eyebrow-style` | 12 / 400, uppercase, `tracking-[1px]` |

Tactile — set inline per element:

| Use | Classes |
|---|---|
| Section / dialog title | `text-[16px] leading-6 font-[550]` |
| Bar title, row title, button | `text-[14px] leading-6 font-[550]` (titles) / `font-medium` (buttons) |
| Description | `text-[13px] leading-5 font-normal text-white/50` |
| Field label, menu label | `text-[12px] leading-6 font-[550] text-white/50` |
| Tag, tooltip | `text-[12px] leading-4–6 font-[550]` / `font-medium` |
| Big number | `font-display text-[40px] leading-12 tracking-[-0.2px] tabular-nums`, unit at `text-[24px] text-white/50` |

Tactile labels on dark fills carry an engraved shadow: `text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]`.

Every number that can change (counts, money, percentages, dates) gets `tabular-nums`. Percent and fixed-width values reserve their width: `w-[4ch] text-right`.

## Radius

Concentric: an inner radius equals the outer radius minus the padding between them.

| Flat | Value | On |
|---|---|---|
| `rounded-full` | — | Buttons, tags, badges, avatars |
| `rounded-md` | 6px | Menu items |
| `rounded-lg` | 8px | Inputs, menus, nav items, cards |
| `rounded-xl` | 12px | Dialogs, popovers, bottom sheets |

| Tactile | On |
|---|---|
| `rounded-[2px]` | Segmented tab inside a 9px track with `p-px` |
| `rounded-[6px]` | Inline rename input |
| `rounded-[8px]` | Buttons, fields, menu items, tags, tooltips |
| `rounded-[10px]` | Main frame, nav items, `brick`, large search |
| `rounded-[11px]` | Icon badge |
| `rounded-[12px]` | Menus, toasts, settings rows |
| `rounded-[16px]` | Cards, sections, dialogs, floating panels |
| `rounded-t-[20px]` | Bottom sheet |

Use `rounded-[inherit]` on overlays that must match their parent.

## Shadow recipes

Flat:

```
primary   shadow-[0px_4px_4px_0px_rgba(42,42,42,0.32),0px_0px_0px_1px_#0e0e0e,inset_0px_4px_6px_0px_rgba(255,255,255,0.2),inset_0px_0px_0px_1px_rgba(255,255,255,0.15),inset_0px_-8px_14px_0px_rgba(0,0,0,0.15)]
secondary shadow-[0px_0px_0px_1px_rgba(0,0,0,0.4),inset_0px_1px_0px_0px_rgba(255,255,255,0.1),inset_0px_0px_0px_1px_rgba(255,255,255,0.06)]
card      shadow-[0px_4px_4px_0px_rgba(42,42,42,0.32),0px_0px_0px_1px_#0e0e0e,inset_0px_1px_0px_0px_rgba(255,255,255,0.08),inset_0px_0px_0px_1px_rgba(255,255,255,0.08)]
overlay   shadow-overlay   (theme token: 0 16px 40px black/50 + 1px #0e0e0e ring)
```

Tactile:

```
surface  shadow-[0_2px_4px_-1px_rgb(0_0_0/0.08),0_1px_1px_-1px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]
raised   shadow-[0_4px_8px_rgb(0_0_0/0.08),0_2px_4px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.16),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]
card     shadow-[0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.12)]  + an absolute inset overlay with the inset highlight pair
menu     shadow-[0_24px_48px_rgb(0_0_0/0.24),0_10px_18px_rgb(0_0_0/0.16),0_5px_8px_rgb(0_0_0/0.16),0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.24),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]
focus    shadow-[0_0_0_1px_#17171c,0_0_0_4px_rgb(117_71_255/0.2),inset_0_0_0_1px_#7445ff]
```

Every Tactile raised surface is the same three ideas stacked: soft dark drop shadows, a 1px dark ring that replaces a border, and a 1px white inner highlight on top. A card whose children would cover its inset highlight gets the highlight as a last child: `<div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]" />`.

The engraved divider (Tactile `Divider`): `h-0.5 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.32)_0,rgb(0_0_0/0.32)_1.5px,rgb(83_86_101/0.06)_1.5px)]` — a dark line with a faint light line under it.

## Easings

Both projects define the GSAP power curves in `@theme static`: `ease-power1…4-in/out/in-out` and `ease-smooth-in-out` (`cubic-bezier(0.7,0,0,1)`). Use them instead of Tailwind's `ease-in-out`. → [motion.md](motion.md)
