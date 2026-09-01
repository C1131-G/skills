# Native-feel navigation — viewport, safe areas, and browser chrome

Disclosed reference. Open from SKILL.md only for the active branch.

## 1. Mobile viewport height

Do not size a mobile app shell with `100vh`; browser chrome makes that value unreliable.

```css
.app-shell { min-height: 100dvh; }  /* tracks the currently visible viewport */
.hero      { min-height: 100svh; }  /* stable when browser bars expand or collapse */
```

Use `100dvh` for an app surface that should track the visible viewport, and `100svh` for a hero or landing section that should stay stable as bars appear and disappear.

## 2. Input zoom

Keep text inputs, textareas, and selects at a **computed font size of at least `16px`** on small screens. Mobile Safari zooms the page when focusing smaller form text, which makes the interface feel broken.

Do **not** disable user zoom in the viewport meta tag to work around this. Fix the control's font size.

## 3. The virtual keyboard

Test focused controls and fixed bottom bars with the keyboard open — `100dvh` does not guarantee keyboard-safe layout in every browser.

Where supported, `interactive-widget=resizes-content` in the viewport meta tag makes the layout viewport shrink with the keyboard. Use a carefully tested `visualViewport` fallback **only** when CSS and normal document flow cannot keep the focused control visible.

## 4. Safe-area insets

Any fixed-position nav bar, tab bar, or bottom sheet must respect device safe areas (home indicator, notches) or it will render underneath system UI on real devices — even though it looks correct in desktop mobile emulation.

```html
<nav class="pb-[max(1rem,env(safe-area-inset-bottom))]">
```

Set **`viewport-fit=cover`** in the viewport meta tag. Without it, every `env(safe-area-inset-*)` value is zero regardless of the CSS above.

Apply the relevant inset on **every** edge where content can meet a cutout or system gesture area, not only the bottom. Verify in both portrait and landscape.

## 5. Browser chrome and status-bar color

Set a `theme-color` per color scheme so supported mobile browsers paint their address and status chrome to match the app instead of leaving a desktop-looking default:

```html
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0b0b0c" media="(prefers-color-scheme: dark)" />
```

Keep these values synchronized with the actual page background. If the app has a theme toggle independent of the OS preference, update the active `theme-color` at runtime and set the CSS `color-scheme` property so native controls follow the same theme.

## 6. Verify on hardware

Test at least one real touch device for: sticky hover, tap feedback, input focus zoom, dynamic viewport height, pull-to-refresh, safe-area insets, carousel axis behavior, and browser-chrome color.

**A layout that is correct in responsive desktop emulation is not verified on mobile.**
