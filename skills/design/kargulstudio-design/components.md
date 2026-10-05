# Components

What makes each component type feel right, so you can design your own versions. The values in *Example* lines come from the Kargul apps; use them to calibrate, then fit them to your palette and density.

Shared rules for every component: one file per concept wrapping a Radix / shadcn primitive, a `data-slot` attribute, `className` merged last through `cn`, styling driven by `data-state` / `aria-*`, transitions on named properties.

## Menus (dropdown, select, popover, command)

- Compact: items one control-height tall (~32px), small inner padding (4–6px), rounded a step smaller than the container.
- Highlight with a faint fill, not a color change of the whole row; selected state is a small indicator (dot or check) in a fixed left slot, so labels stay aligned whether or not the item is selected.
- Separators bleed to the container edge (negative margin equal to the padding).
- Group labels are the smallest, quietest text in the menu.
- Grow from the trigger (`origin-(--radix-…-transform-origin)`), cap height to the available space and scroll inside.
- Select-like menus match the trigger's width; multi-select items keep the menu open.
- *Example:* `p-1`/`p-1.5` content, `h-8 px-2` items, `bg-white/5–6` highlight, `size-1.5` dot indicator.

## Overlays (dialog, sheet, drawer)

- Dim and blur the page behind just enough to separate it (≈55–60% black, 3–6px blur).
- Structure: header band (title + one-sentence description + close), scrolling body, footer band (secondary then primary, right-aligned; an optional help link on the left).
- Long forms split into titled sections divided by hairlines.
- Side sheets for records (full height, ~480–560px); bottom sheets on mobile (rounded top, ≤85% viewport height); dialogs for short tasks (~480–560px wide, 16px from viewport edges).
- Always provide a title and description, visually hidden if the design shows none.
- *Example:* header `px-6 py-5`, footer `px-6 py-4`, sheet header `h-14`.

## Fields

- One field shell: label row (label + optional trailing value or action), the control, then hint or error. Label is small and secondary; error replaces hint and is linked with `aria-describedby`.
- One input surface reused for text inputs, selects, search and textareas, so all fields match. Focus is a clear ring in the accent color; invalid is a danger-colored edge.
- Prefix and suffix symbols sit inside the input in placeholder color.
- *Example:* `h-9 px-3 rounded-[8px]` inputs, 12px labels at 50% contrast, accent focus ring with a soft 4px halo.

## Tags, badges, status

- Tags are short, pill-shaped or slightly rounded, and use a **tone triplet** (fill, edge, text) per meaning. Define tones once as tokens; never style a tag ad hoc.
- In tight space show the first few and a neutral `+N`.
- Counts are tiny neutral pills after a label; unread/alert is a small danger dot, mirrored in the accessible label ("Notifications, 3 unread").
- Status pills (Draft / Live / Paused) use semantic tones consistently across the whole app.
- Deltas: green or red text on a faint same-color fill.

## Tabs and switches

- Two kinds, chosen by job: **underline tabs** for sections of a page; **segmented control** for switching a view or a value in place. Do not mix them for the same job.
- Active state fades in on a separate layer or underline; bold-active labels reserve their width.
- Arrow keys move between tabs; only the active tab is in the tab order.
- Switches are for instant settings; pair each with a label row (title + description) that toggles it.

## Tables and lists

- Fixed row height; header in the smallest, quietest text; text left-aligned, numbers right-aligned with `tabular-nums`, small visuals centered.
- Separate rows with a hairline or a 1–2px gap, not zebra stripes.
- Hover is a faint fill; the selected / open row keeps a stronger fill.
- Controls inside a row (checkbox, menu, inline person button) stop click propagation; the row itself is keyboard-reachable.
- Rich cells stay quiet: avatar + name, tags + `+N`, a small bar + percentage, date · label with a thin tick between.
- The table scrolls horizontally inside its container, never the page.

## Cards and sections

- A card is a surface one step up the ladder with the app's raised treatment, consistent padding (16–20px) and an internal `gap` rhythm.
- Clickable cards are one `Button` (or link) with a visible focus ring and a subtle hover fill or glow — not a scale bounce.
- Section headers inside a panel: small uppercase or medium-weight title, optional control right-aligned in a fixed-height row so sections with and without controls align.
- Identity blocks (logo / avatar + name + tags) open a record view.

## Feedback

- **Toasts:** bottom-center or bottom-right, ~350px, title + optional one-line description + optional action; for out-of-view results, unbuilt features, and undo.
- **Tooltips:** small, high-contrast, short delay (~400ms), for icon-only controls and collapsed navigation; never for essential information.
- **Empty states:** icon in a soft circle, one strong line, one quiet line, optional action, centered with generous vertical padding.
- **Keyboard hints:** `kbd` chips in command menus and next to shortcut-bearing actions.
