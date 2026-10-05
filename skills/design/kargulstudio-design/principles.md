# Design principles

What the two Kargul apps get right, stated so it transfers to any product. Each principle has the reason, how to apply it to *your* app, and where it shows up in the source — the source is an illustration, not a template. Your app keeps its own content, layout, brand and personality; it borrows the thinking.

## 1. Calm chrome, loud content

Navigation, bars and labels recede; the user's data and the one next action carry the contrast.

- **Why:** in a tool people use all day, the frame is seen thousands of times and the content is what changes. Chrome that competes makes every screen feel busy.
- **Apply:** idle nav and labels sit two or three steps down the text ramp; values, titles and the current item are full contrast. Icons in chrome are dimmer than their labels.
- **Source:** idle rail items at `white/32`, sidebar text at muted grey, table values in full white.

## 2. One accent, spent carefully

The brand color appears on the primary action, the current selection, and focus — nowhere else.

- **Why:** an accent only means "act here" if it is rare. Status colors (success, warning, danger) carry meaning of their own and are not decoration.
- **Apply:** choose one accent for your brand. Everything else is a neutral ramp. One primary button per area; secondary actions are neutral.
- **Source:** one violet / indigo per app, used on a single button per toolbar, selected radio dots and focus rings.

## 3. Hierarchy by contrast, not size

Use few type sizes and many contrast steps.

- **Why:** size changes break rhythm and alignment; contrast steps rank information without moving anything.
- **Apply:** three or four sizes for app UI (≈12, 13–14, 16, plus one display size for headline numbers). Rank with a 4–5 step text ramp (primary → secondary → tertiary → placeholder → disabled). Weight is the third lever: one in-between weight (500–550) for labels and titles.
- **Source:** sales-crm runs almost entirely on 12 / 14 / 16px; workflow-editor ranks text with white at 100 / 80 / 50 / 30%.

## 4. Dense, with rhythm

Compact controls and tight gaps, always from the same short scale.

- **Why:** density shows more of the user's work; a consistent scale keeps it from feeling cramped.
- **Apply:** controls around 30–32px, inputs around 36px, gaps from a short list (4 / 6 / 8 / 12 / 16 / 20px), panel padding 12 / 16 / 20px. Fixed row heights so lists read as a grid. Siblings are spaced by the parent's `gap`, never by margins. Calibrate the numbers to your audience — denser for power tools, roomier for occasional users — but keep the scale short. → [spacing.md](spacing.md)

## 5. Align everything

Things that share a row share a height; things that share a column share a left edge.

- **Apply:**
  - One control height per row: buttons, filters and search in a toolbar all match.
  - Icons sit in fixed-width cells so labels line up even when glyphs differ in size.
  - Padding is optical: the side with an icon or avatar gets less padding than the text side.
  - Inline buttons in text or table cells use a negative margin equal to their padding, so their text stays on the column while the hover background still has room.
  - Bold-on-active labels reserve their bold width so nothing shifts.

## 6. Depth from light; separation from hairlines

Surfaces are a ladder of near-identical neutrals; elevation is suggested by a consistent light source, and sections are divided by thin lines rather than space.

- **Why:** on dark UI, heavy borders look like wireframes and big gaps waste space. A 1px highlight on the top edge and a dark ring around the outside read as physical without being loud.
- **Apply:** pick 4–6 surface steps (page → panel → card → control → hover). Raised elements get an outer dark ring plus an inner top highlight; pressed or inset ones (tracks, active tabs) get an inner shadow. Divide stacked sections with 1px hairlines (`divide-*` or an inset shadow). Choose one finish for the whole app — *flat* (hairline borders, minimal shadow) or *tactile* (no borders, layered light) — and use it everywhere. → [tokens.md](tokens.md)

## 7. Concentric geometry

Radii nest: an inner radius is the outer radius minus the padding between them.

- **Apply:** decide 3–4 radii (control, card, panel, overlay) and derive inner ones from outer. Pills (`rounded-full`) are for buttons, tags and badges; rectangular containers use the radius scale.

## 8. Every state is designed

Nothing is left at the browser default or as an empty box.

- **Apply:** design hover, press, focus-visible, current, open, disabled and busy for every control. Design empty, no-results, error, not-available and destructive-confirmation for every screen. Busy buttons keep their width; disabled controls keep their shape. → [layout.md](layout.md)

## 9. Keep the user's place

Context stays on screen; details come to the user in layers.

- **Why:** navigating away to see one record loses the list, the scroll position, the filters and the selection.
- **Apply:** fixed frame, one scrolling region. Records, quick edits, creation, search and notifications open in sheets, dialogs, popovers or a command palette over the current screen. Pick which layer fits your content; the principle is that the screen underneath does not change. → [layout.md](layout.md)

## 10. Nothing moves unless the user moved it

Layout is stable across state changes.

- **Apply:** `tabular-nums` on changing numbers; reserved width for bold labels and busy buttons; fixed row and control heights; skeletons the same shape as the content they stand in for; panels that overlay instead of pushing content.

## 11. Motion explains, briefly

Animation shows where something came from or went, then gets out of the way.

- **Apply:** about 150ms for hover, 200ms for popovers, 250–350ms for sheets and layout travel; exits faster than entrances; ease-out in, ease-in out; animate only transform, opacity and color; respect reduced motion. → [motion.md](motion.md)

## 12. Mobile is a re-layout

Small screens get a different arrangement, not a smaller one.

- **Apply:** decide per region what it becomes: sidebar → drawer, filter bar → bottom sheet, wide table → cards, top tabs → bottom bar, secondary actions → overflow menu. The primary action always stays visible.

## 13. Words name outcomes

- **Apply:** buttons say what will happen ("Show 12 results", "Create company"), not "OK" / "Submit". Empty states say what will appear and how. Toasts say what happened and what happens next. Descriptions are one sentence.

## 14. Accessible by construction

- **Apply:** every icon-only control has an `aria-label`; decorative icons are `aria-hidden`; focus is visible on everything; state lives in real attributes (`aria-current`, `aria-pressed`, `aria-selected`, `data-state`) and styling reads those attributes; rows and cards that open something are keyboard reachable; dialogs and sheets always have a title, visually hidden if needed.

## 15. Build it as a system

- **Apply:** one component per concept (one `Button`, one field shell, one tag), looks as variants, values as tokens, repeated class recipes named once. A new screen should be assembly, not invention. When something new is needed, add it to the system first, then use it.
