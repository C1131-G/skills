# Layout and screens

How to apply the principles to the frame and to individual screens of **your** app. Design the screens your product needs; the shapes below are ways of thinking, with the Kargul apps as worked examples.

## The frame

Decide three things before any screen:

1. **Navigation model.** How many destinations, and how often people switch? Many destinations or grouped sections suit a full sidebar; a handful suit an icon rail that can expand; two or three suit tabs in a top bar. (sales-crm: full grouped sidebar. workflow-editor: 5-item rail that expands to show labels.)
2. **What stays fixed.** Navigation, the screen's title bar, and its controls stay put; one content region scrolls. Implement with a root at `h-dvh overflow-hidden`, fixed regions `shrink-0`, and `min-h-0` / `min-w-0` on every flex child down to the scroller.
3. **Where details open.** List the things a user inspects or creates, and assign each one a layer: side sheet (a record with sections), dialog (a short focused task or form), popover (a glanceable list), command palette (jump anywhere, search everything), floating panel (properties of a selected object on a canvas). Keep this map consistent across the app.

Frame rules:

- Bars keep one height and padding on every screen even when their content changes.
- Title bar order: navigation toggle → where you are (title or breadcrumb) → status → actions, primary last.
- Only one side sheet is open at a time; open state lives in shared state so any component can open any layer.
- Selection stays visible underneath an open layer.
- A resizable or collapsible sidebar remembers its state and restores it before paint.

## Screen anatomy

Most screens stack the same four parts. Use the ones yours needs, in this order:

1. **Orientation** — title, one-sentence description, optional status or meta ("Changes save automatically").
2. **Controls** — view switches, filters and sort on the left; search, secondary actions and the primary action on the right.
3. **Content** — the user's data, in the form that fits it.
4. **Accounting** — how much is shown ("Showing 12 of 40", summary cells), so filtering never feels like data loss.

## Choosing the content form

| The data is… | Show it as | Principles that matter |
|---|---|---|
| Many comparable records | Table: fixed row height, aligned columns, numbers right-aligned and tabular, rich cells kept quiet | 3, 4, 5, 10 |
| Fewer records with personality | Card grid with `auto-fill` columns, a consistent card anatomy (title + status, clamped description, meta pinned to the bottom) | 4, 6, 7 |
| Headline metrics | A row of stat cards: label, one display-size number, comparison, delta chip; charts below | 2, 3 |
| One record in depth | A sheet or page of titled sections divided by hairlines, identity block at the top | 6, 9 |
| Configuration | Sections with an icon, title and description; fields in a 2-column grid; toggles as label + control rows; destructive actions last and visually separated | 8, 13 |
| A spatial structure | A canvas with floating panels over it, never beside it | 9 |

The same data often needs two forms (a table on desktop, cards on mobile; a table plus a grid toggle).

## Forms

- Group fields into titled sections; pair short related fields in two columns.
- Pre-fill sensible defaults so only the field the user must supply is empty.
- Validate on submit; show the message under the field, mark it `aria-invalid`, move focus there, and clear the error as the user types.
- Show the live value of sliders and ranges next to the label.
- Prefer saving as the user edits for settings; say so once in the heading instead of a Save button. Use explicit Save / Cancel for creation and for edits that must be reviewed.

## States checklist

For every screen you build, decide what each of these looks like:

| State | Principle |
|---|---|
| First use / empty | Icon, one line saying what will appear, one line on how to get there, optional action |
| No results | Same shape, plus a way to clear filters |
| Loading | A skeleton shaped like the content, or a spinner inside the control that started it |
| Error | Next to the thing that failed, with a way forward |
| Disabled | Visible with the reason apparent, not hidden |
| Not available yet | A toast saying so — never a dead click |
| Destructive | A second, explicit confirmation (in place or in a dialog), then a toast naming what was removed |
| Success | A toast for things that happen out of view; nothing for things the user can already see change |

## Mobile

For each region, write down what it becomes below the breakpoint. Typical choices: sidebar → drawer or sheet; filter row → one "Filters" button opening a bottom sheet with a "Show N results" action; table → cards; top tabs → bottom bar; secondary actions → overflow menu. Use paired `hidden sm:flex` / `sm:hidden` blocks for layout swaps, and a media-query hook only when JavaScript must decide something such as a default view.
