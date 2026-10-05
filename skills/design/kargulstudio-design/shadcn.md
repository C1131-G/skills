# Applying the principles to a shadcn/ui project

Both Kargul repositories are shadcn projects underneath (`components.json`, `radix-ui`, `cva`, `data-slot`), so the approach fits a stock shadcn app without new dependencies. The button comes over close to the source; the theme and every other component are designed for your app using [principles.md](principles.md).

## 0. Choose the finish

**Flat** (hairline borders, quiet shadows) maps directly onto shadcn's token names (`background`, `secondary`, `muted`, `border`, `ring`) and is the default. **Tactile** (no borders, layered light) suits apps that should feel more physical; it needs more shadow work per component. Pick one for the whole app.

The reference palette is dark. If the app has no light theme, put the palette in `:root` and add `color-scheme: dark`. If it must keep a light theme, leave shadcn's light values in `:root`, put this palette in `.dark`, and set `className="dark"` on `<html>` to default to it.

## 1. Theme (`app/globals.css`)

Keep shadcn's existing `@theme inline` block and add the extra roles the button and components use. Fill the values with **your** palette built by the steps in [tokens.md](tokens.md) → Build your palette. The values below are the sales-crm reference palette: use them as a starting point or for calibration, and replace at least the accent (`--primary`) with your brand.

```css
@theme inline {
  --color-line-strong: var(--line-strong);
  --color-subtle: var(--subtle);
  --color-faint: var(--faint);
  --color-soft: var(--soft);
  --color-chip: var(--chip);
  --color-icon: var(--icon);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-status: var(--status);
}

@theme static {
  --shadow-overlay: 0px 16px 40px 0px rgba(0, 0, 0, 0.5), 0px 0px 0px 1px #0e0e0e;
  --ease-power3-in: cubic-bezier(0.5, 0, 0.75, 0);
  --ease-power3-out: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-power3-in-out: cubic-bezier(0.76, 0, 0.24, 1);
  --ease-smooth-in-out: cubic-bezier(0.7, 0, 0, 1);
}

:root {
  color-scheme: dark;
  --radius: 0.5rem;
  --background: #161616;
  --foreground: #f9fbff;
  --card: #1b1d20;
  --card-foreground: #f9fbff;
  --popover: #161616;
  --popover-foreground: #f9fbff;
  --primary: #4124fb;
  --primary-foreground: #f9fbff;
  --secondary: #1e1e1e;
  --secondary-foreground: #f9fbff;
  --muted: #2a2a2a;
  --muted-foreground: #7f7f7f;
  --accent: #2a2a2a;
  --accent-foreground: #f9fbff;
  --destructive: #f97373;
  --border: #232323;
  --input: #393939;
  --ring: #676767;
  --sidebar: #171717;
  --sidebar-foreground: #7f7f7f;
  --sidebar-primary: #2a2a2a;
  --sidebar-primary-foreground: #f9fbff;
  --sidebar-accent: #181818;
  --sidebar-accent-foreground: #f9fbff;
  --sidebar-border: #232323;
  --sidebar-ring: #676767;
  --line-strong: #393939;
  --subtle: #676767;
  --faint: #454545;
  --soft: #a4a4a4;
  --chip: #cfcfcf;
  --icon: #d0d4dd;
  --success: #22c55e;
  --warning: #fbbf24;
  --danger: #f97373;
  --status: #16c89e;
}
```

Add the `caption-style`, `lead-style` and `eyebrow-style` classes from [tokens.md](tokens.md) to `@layer base` if the project wants the Flat type helpers. Tag colors: copy the `--tag-*` triplets from tokens.md when you add a `Tag`.

## 2. Button (`components/ui/button.tsx`)

Keep shadcn's exports, `asChild`, `data-slot` and its variant names (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`), so every existing call site keeps compiling. Add the Kargul variants alongside them. Links use `asChild` with `next/link`, not the Kargul `href` prop.

Variants marked *derived* do not exist in the Kargul repositories. They are written in the same style so shadcn's API stays complete.

### Flat

```tsx
import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const raised =
  "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.4),inset_0px_1px_0px_0px_rgba(255,255,255,0.1),inset_0px_0px_0px_1px_rgba(255,255,255,0.06)]";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium leading-none outline-none select-none transition-[background-color,color,box-shadow] duration-150 ease-power3-out focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0px_4px_4px_0px_rgba(42,42,42,0.32),0px_0px_0px_1px_#0e0e0e,inset_0px_4px_6px_0px_rgba(255,255,255,0.2),inset_0px_0px_0px_1px_rgba(255,255,255,0.15),inset_0px_-8px_14px_0px_rgba(0,0,0,0.15)] hover:bg-[#4b30ff]",
        secondary: cn(raised, "bg-secondary text-secondary-foreground hover:bg-muted"),
        muted: cn(raised, "bg-muted text-foreground hover:bg-[#333333]"),
        outline: "bg-[#232323] text-foreground shadow-[0px_0px_0px_1px_#333333] hover:bg-muted",
        destructive: cn(raised, "bg-secondary text-danger hover:bg-muted"),
        ghost: "text-subtle hover:bg-white/6 hover:text-foreground",
        nav: "w-full justify-start rounded-lg text-sidebar-foreground hover:text-foreground aria-[current=page]:bg-sidebar-primary aria-[current=page]:text-foreground aria-[current=page]:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.4),inset_0px_1px_0px_0px_rgba(255,255,255,0.1),inset_0px_0px_0px_1px_rgba(255,255,255,0.06)]",
        item: "w-full items-start justify-start gap-3 rounded-lg text-left font-normal whitespace-normal text-foreground hover:bg-white/4",
        link: "rounded-none text-foreground underline decoration-from-font underline-offset-2 hover:text-soft",
      },
      size: {
        default: "h-[30px] px-[9px] text-[12px]",
        sm: "h-6 px-2 text-[12px]",
        md: "h-[30px] px-2 text-[14px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 px-3 text-[14px] [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-[30px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-6",
        "icon-lg": "size-9 [&_svg:not([class*='size-'])]:size-4",
        none: "p-0",
      },
    },
    defaultVariants: { variant: "secondary", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

- `defaultVariants.variant` is `secondary`, as in sales-crm, so a plain `<Button>` is the quiet one and the primary is opted into with `variant="default"`. If the codebase relies on shadcn's default being the filled primary, set it back to `default`.

*Derived:* `outline` (uses the Kargul `subtle` look), `destructive`, `sm` (24px) and `lg` (36px, the input height).

### Tactile

Same file shape. Replace the cva config with:

```tsx
const surface =
  "shadow-[0_2px_4px_-1px_rgb(0_0_0/0.08),0_1px_1px_-1px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]";
const raisedShadow =
  "shadow-[0_4px_8px_rgb(0_0_0/0.08),0_2px_4px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.16),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]";

const buttonVariants = cva(
  "group inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-[8px] outline-none select-none ease-power3-in-out duration-150 focus-visible:ring-2 focus-visible:ring-[#7f59f0]/60 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#5016ff] bg-[linear-gradient(0deg,rgb(255_255_255/0)_0%,rgb(255_255_255/0.1)_100%)] font-medium text-white shadow-[0_2px_6.5px_rgb(80_22_255/0.22),0_4px_4px_rgb(80_22_255/0.25),0_0_0_1px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)] transition-[background-color] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)] hover:bg-[#5b25ff] active:bg-[#4812e6] [&_svg]:text-white/80",
        secondary: cn(surface, "bg-[#1b1b20] font-medium text-white/80 transition-[background-color,color] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)] hover:bg-[#222228] hover:text-white active:bg-[#18181c] [&_svg]:text-white/60"),
        outline: cn(raisedShadow, "border border-black bg-linear-to-t from-[#1b1b20] via-[#1b1b20] via-50% to-[#27272e] text-white transition-colors hover:from-[#1f1f25] hover:via-[#1f1f25] hover:to-[#2d2d35] disabled:text-white/30"),
        destructive: cn(surface, "bg-[#1b1b20] font-medium text-[#ff6b61] transition-[background-color] hover:bg-[#e33e31]/10"),
        ghost: "transition-[background-color] hover:bg-white/4 active:bg-white/6",
        nav: "rounded-[10px] border border-transparent text-white/32 transition-[color] hover:text-white/60 aria-[current=page]:border-black aria-[current=page]:bg-linear-to-l aria-[current=page]:from-[#1b1b20] aria-[current=page]:via-[#1b1b20] aria-[current=page]:via-50% aria-[current=page]:to-[#27272e] aria-[current=page]:text-white aria-[current=page]:shadow-[0_4px_8px_rgb(0_0_0/0.08),0_2px_4px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.16),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]",
        link: "rounded-[6px] font-normal text-[#fcfdff]/30 transition-colors hover:text-white/70",
      },
      size: {
        default: "h-8 gap-2 px-3 text-[14px] leading-6 has-[>svg]:pr-3 has-[>svg]:pl-1.5 [&_svg:not([class*='size-'])]:size-[18px]",
        sm: "h-6 gap-1.5 px-2 text-[12px] leading-6 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-3 text-[14px] leading-6 [&_svg:not([class*='size-'])]:size-[18px]",
        icon: "size-8 [&_svg:not([class*='size-'])]:size-5",
        "icon-sm": "size-6 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-9 [&_svg:not([class*='size-'])]:size-5",
        block: "h-9 w-full justify-start gap-2 px-2 text-[14px] leading-6",
      },
    },
    defaultVariants: { variant: "secondary", size: "default" },
  },
);
```

`has-[>svg]:pl-1.5 pr-3` reproduces the Kargul optical padding (6px on the icon side, 12px on the text side) without the extra `<span className="pr-1">` the original needs. The source repository has no `outline` or `destructive`; here `outline` is its `raised` look and `destructive` is *derived*.

## 3. The other shadcn files

Restyle each file in place so it follows the matching section of [components.md](components.md), using your tokens. Keep shadcn's structure, `data-slot`s and exports. The aim is that every component obeys the same principles as the button (one height scale, quiet chrome, light-based depth, designed states), not that it matches a Kargul screen.

| shadcn file | Section in components.md |
|---|---|
| `sidebar.tsx` | [layout.md](layout.md) → The frame; nav items render through `Button` |
| `command.tsx` | Menus |
| `scroll-area.tsx` | A thin, rounded thumb at low contrast that fades in on hover |
| `dropdown-menu.tsx`, `select.tsx`, `popover.tsx` | Menus |
| `dialog.tsx`, `sheet.tsx`, `drawer.tsx` | Dialog and Sheet |
| `input.tsx`, `textarea.tsx`, `label.tsx`, `form.tsx` | Fields |
| `badge.tsx` | Tags and badges (`Tag`) |
| `tabs.tsx` | Tabs |
| `table.tsx` | Tables |
| `card.tsx` | Cards and sections |
| `tooltip.tsx`, `sonner.tsx`, `switch.tsx` | Feedback |

In every file, swap `transition-all` / `transition-[color,box-shadow]` for named properties with an `ease-power3-*` curve, and shadcn's `animate-in zoom-in-95` timings for the ones in [motion.md](motion.md).

## 4. Build the app

With the theme and components in place, design the frame and each screen for your product with [layout.md](layout.md), checking every decision against [principles.md](principles.md).

## 5. Keep it yours

- A restyled shadcn file is deliberate divergence from upstream, so `enforce-code-quality` treats it as project code. Do not run `npx shadcn add <name> --overwrite` on it later; that discards the style. New components added with the CLI arrive in stock shadcn style and need step 3 applied.
- Remove shadcn's `aria-invalid:ring-*` additions only if the field section's invalid style replaces them; do not drop invalid styling altogether.
- Run lint, typecheck and build afterwards: renamed or removed variants surface as type errors at every call site.
