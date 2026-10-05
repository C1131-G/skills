# Buttons

One component, `components/_ui/button.tsx`: a `cva` called `buttonVariants` plus a `Button` that renders `next/link` when given `href` and `<button type="button">` otherwise. Every clickable surface goes through it.

## The base string

Both dialects start the base class with the same skeleton:

```
inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap
outline-none select-none
focus-visible:ring-2 focus-visible:ring-<focus>/60
disabled:pointer-events-none
```

- Flat adds `gap-1.5 rounded-full font-medium leading-none transition-[background-color,color,box-shadow] duration-150 ease-power3-out disabled:opacity-50`. Focus ring is `ring-ring/60`.
- Tactile adds `group` (so icons inside can react to hover) and leaves gap, radius and transition to each variant. Focus ring is `ring-[#7f59f0]/60`.

## Variants

### Flat (sales-crm)

| Variant | Look | Use for |
|---|---|---|
| `primary` | `bg-primary` (#4124fb) + the 5-layer raised shadow, `hover:bg-[#4b30ff]` | The one main action per area: New Company, Save, Create |
| `secondary` (default) | `bg-secondary` + ring shadow + 1px top highlight, `hover:bg-muted` | Toolbar actions, filter menus, header icon buttons |
| `muted` | `bg-muted`, same shadow, `hover:bg-[#333333]` | A raised action on an already-dark card (sidebar billing CTA) |
| `subtle` | `bg-[#232323] shadow-[0_0_0_1px_#333333]` | Cancel next to a primary |
| `ghost` | transparent, `text-subtle hover:bg-white/6 hover:text-foreground` | Close X, row actions, inline owner chips |
| `nav` | full width, left aligned, `rounded-lg`; active = `bg-sidebar-primary` + secondary shadow | Sidebar items, driven by `data-active` |
| `item` | full width, top aligned, `gap-3 rounded-lg whitespace-normal hover:bg-white/4` | Multi-line list rows (notifications) |
| `link` | underline `decoration-from-font underline-offset-2`, `hover:text-soft` | Inline text links ("Need help? Ask us.") |

| Size | Classes | Result |
|---|---|---|
| `sm` (default) | `p-[9px] text-[12px]` | 30px tall — the standard control |
| `md` | `p-2 text-[14px]` | 30px tall, larger text — nav items |
| `icon` | `size-[30px] p-0` | Square, matches `sm` |
| `icon-sm` | `size-6 p-0` | Close buttons and row actions inside dense areas |
| `none` | `p-0` | Bespoke box: set height and padding in `className` |

### Tactile (workflow-editor)

| Variant | Look | Use for |
|---|---|---|
| `accent` | `bg-[#5016ff]` + top-lit gradient + violet glow shadow, `rounded-[8px]` | The primary in-app action: Run once, New automation |
| `field` | `bg-[#1b1b20]` + surface shadow, `text-white/80 hover:text-white` | Secondary toolbar actions: Sort, Filter, Help, Share |
| `raised` / `brick` | Gradient or flat `#1b1b20` + raised shadow, `rounded-[8px]` / `[10px]` | Icon toggles, segmented-style toggles (`aria-pressed`) |
| `round` | Raised, `rounded-full border-black` | The rail's circular "+" create button |
| `ghost` | transparent, `hover:bg-white/4 active:bg-white/6`, `rounded-[8px]` | Sidebar toggle, close X, inline title |
| `nav` | `text-white/32 hover:text-white/60`; `aria-[current=page]` gets the raised gradient | Sidebar rail items |
| `crumb` | `text-[#fcfdff]/30 hover:text-white/70` | Breadcrumb links |
| `tab` | Gradient + 6-layer inset bevel, `rounded-[2px]` | Segmented tabs only |
| `primary` / `secondary` | `rounded-full font-bold`, filled or 2px outline, `active:scale-98` | Marketing / landing pages |
| `bare` | nothing | Bespoke |

| Size | Classes | Result |
|---|---|---|
| `field` | `h-8 gap-2 pr-2 pl-1.5 text-[14px] leading-6` | 32px — the standard in-app control |
| `icon` / `icon-lg` | `size-8` / `size-9` | Square, 32 / 36px |
| `block` | `h-9 w-full gap-2 px-2` | Full-width list action |
| `xs` | `h-6 px-2 text-[12px]` | Inline chips |
| `crumb` | `-mx-1 h-6 px-1` | Breadcrumb — the negative margin keeps text aligned with its column |
| `title` | `h-6 px-1.5 font-[550]` | Click-to-rename title |
| `tab` | `px-4 py-1.5 text-[14px] leading-5` | 32px segmented tab |
| `sm` / `md` / `lg` | `px-2 py-1` → `sm:px-4 sm:py-2`, text 13–18px | Marketing pills, responsive |

## Anatomy: icon + label

```tsx
<Button variant="field" size="field">
  <SortIcon aria-hidden className="size-[18px] text-white/60" />
  <span className="pr-1">Sorted by</span>
</Button>
```

- **Optical padding.** The size already pads the icon side less (`pl-1.5`) than the text side (`pr-2`); the label adds `pr-1`, so text gets 12px on the right while the icon gets 6px on the left. The Flat equivalent with an avatar is `py-[5px] pr-[7px] pl-[5px]`.
- **Icon size vs text.** Flat: `size-3` (12px) icons with 12px text, `size-3.5` (14px) in icon buttons and nav, `size-4` for a close X. Tactile: `size-[18px]` in field buttons, `size-5` (20px) in icon buttons and the rail, `size-3.5` glyph for a "+".
- **Icon box.** When a glyph is smaller than its slot (a 14px plus in a 20px row), wrap it: `<span className="flex size-5 items-center justify-center"><PlusIcon className="size-3.5" /></span>`. Every row's text then starts at the same x.
- **Icon color.** One step dimmer than the label (`text-white/60` against `/80`, `text-subtle` against foreground), brightened with `group-hover:text-icon` / `group-hover:text-white`, `transition-colors duration-150`.
- **Gap.** Flat `gap-1.5` (6px), Tactile `gap-2` (8px). Icon-only buttons have no gap and no label; they need `aria-label`.

## Split trigger (filter menu)

A Flat filter is one `secondary` button, `size="none" h-[30px] gap-0 overflow-hidden text-[12px]`, holding three children: the label (`px-[9px] font-normal text-subtle`), a full-height `w-px bg-white/8` divider, and the value with a `size-3` chevron (`px-[9px] gap-1.5`). The chevron rotates on `group-data-[state=open]:rotate-180`, and the trigger keeps `data-[state=open]:bg-muted` while open.

## Grouping and order

- Primary is the **rightmost** button in its group; secondary actions sit to its left.
- Toolbar action pair (Export + New): `gap-1` (Flat). Header clusters: `gap-2` (Flat) / `gap-3` (Tactile).
- Dialog and sheet footers: `subtle` Cancel, then `primary` confirm, `justify-end gap-2`. A help link may sit on the left with `justify-between`.
- On narrow screens, secondary text buttons get `hidden md:inline-flex` and collapse into a "More" `DropdownMenu`. Primary buttons stay visible. In mobile toolbars, two equal actions share `grid grid-cols-2 gap-2.5` and grow to `h-10`.

## States

| State | How |
|---|---|
| Hover | Background step (`hover:bg-muted`, `hover:bg-white/4`) or text step; never both a color and a scale change |
| Press | Tactile app controls: `active:bg-[#18181c]` (darker); pills: `active:scale-98` |
| Active / current | `data-[active=true]:` or `aria-[current=page]:` on `nav`; `aria-pressed:` on toggles |
| Open trigger | `data-[state=open]:bg-muted` / `bg-white/3` + chevron rotation |
| Disabled | Flat `disabled:opacity-50`; Tactile `disabled:text-white/30` (shape stays) |
| Busy | Swap the leading icon for a `size-3` spinner in the same slot, keep a `min-w-[114px]` so the label change ("Run once" → "Running…") does not resize the button; add `aria-live="polite"` |

## Inline buttons that sit inside text

Ghost buttons placed in a table cell or a text row use `size="none" -mx-1.5 px-1.5 py-1`: the negative margin cancels the padding so the text lines up with the column, while the hover background still has room.
