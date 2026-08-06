---
name: convert-nextjs-react
description: Convert components between Next.js and plain React. Called by skill-master.
disable-model-invocation: true
---
# convert-nextjs-react

Apply these rules whenever converting a component from Next.js (App Router) to plain React, or from plain React to Next.js. The two directions have different failure modes — check the matching section below rather than assuming the reverse of one rule is automatically correct for the other.

## Core mental model

Next.js is a full-stack framework built on React that adds file-based routing, React Server Components, Server Actions, and framework-level optimizations (image, font, script). Plain React (e.g. Vite/TanStack Router/TanStack Start) is the UI library alone — no server rendering model, no built-in routing, no Server Components. A component written for one environment almost always uses APIs that don't exist in the other; a faithful conversion means replacing the framework-specific piece with the equivalent mechanism in the target environment, not just deleting the import and hoping it still works.

## Quick reference: API/concept mapping

| Concept | Next.js (App Router) | Plain React (Vite + TanStack Router/Query) |
|---|---|---|
| Routing/navigation | `next/link`'s `<Link>`, `next/navigation`'s `useRouter`/`usePathname`/`useSearchParams` | TanStack Router's `<Link>`, `useNavigate`, `Route.useSearch()` (see `design-frontend-architecture`) |
| Data fetching (initial/route data) | Server Component fetching directly (`async function Page()`), or a route's Server Action | TanStack Router loader + TanStack Query `queryOptions`/`ensureQueryData` (see `design-frontend-architecture`) |
| Mutations | Server Actions (`"use server"` functions passed to `<form action={...}>`) | TanStack Query `useMutation` calling an API endpoint (see `use-tanstack-query`) |
| Images | `next/image`'s `<Image>` (automatic optimization, layout shift prevention) | Plain `<img>`, or a client-side image library if optimization is genuinely needed |
| Fonts | `next/font` (self-hosted, zero layout shift) | Standard `<link>`/CSS `@font-face`, or a Vite font plugin |
| Environment variables exposed to the client | Prefixed `NEXT_PUBLIC_` | Prefixed `VITE_` (Vite) or per-bundler convention |
| Metadata/SEO tags | The `metadata` export / `generateMetadata()` | A head-management library (e.g. injecting via a route's `head()` in TanStack Router) — and note plain client-rendered React has no SSR, so SEO-critical metadata has real limits here regardless of tooling |
| Server-only code/secrets | React Server Components, safely never shipped to the client | Doesn't exist — anything in a plain React bundle ships to the browser; server-only logic must live in an actual backend endpoint instead |
| `'use client'` directive | Marks a component as client-rendered/interactive within an otherwise server-first app | Meaningless — every plain React component is already client-rendered; remove entirely |
| Middleware | `middleware.ts` at the edge | No equivalent — becomes actual backend middleware (see `design-backend-architecture`) or route-level logic in the router |

## Next.js → React

1. **Remove `'use client'`.** It has no meaning outside Next.js — every component in a plain React app is already client-rendered. Deleting it is safe and required, not optional.

2. **If the component was a Server Component doing data fetching directly** (`async function Page() { const data = await fetchX(); ... }`), that pattern doesn't exist in plain React. Convert the fetch into a TanStack Query `queryOptions` factory and move the actual fetch call into a route loader (`ensureQueryData`) with the component reading it via `useSuspenseQuery` — see `design-frontend-architecture` for the full pattern. Don't just wrap the fetch in `useEffect` — that reintroduces exactly the waterfall/loading-state problem the `audit-react-effects` skill flags.

3. **Replace `next/link`'s `<Link>` and `next/navigation`'s routing hooks** with the target router's equivalents (TanStack Router's `<Link>`, `useNavigate`, `Route.useSearch()`). Check every prop — Next.js's `<Link>` API (`href`, `prefetch`) doesn't map 1:1 onto TanStack Router's (`to`, `params`, `search`).

4. **Replace Server Actions with an explicit API call + `useMutation`.** A `"use server"` function has no equivalent in a client-only app — the logic it ran needs to actually live on a real backend endpoint, called via `fetch`/your API client and wrapped in a TanStack Query mutation, not inlined into the component as if it were still running server-side.

5. **Replace `next/image` with a plain `<img>`** (or a client-compatible image library if the automatic optimization is actually needed). Note the loss: no automatic format/size optimization, no built-in layout-shift prevention — set `width`/`height` (or `aspect-ratio` in CSS) manually to avoid CLS.

6. **Replace `next/font`** with standard `<link>`/CSS `@font-face` or the target bundler's font-loading plugin.

7. **Rename environment variables** exposed to the client from `NEXT_PUBLIC_*` to the target bundler's convention (e.g. `VITE_*`), and update every reference — a forgotten prefix silently returns `undefined` at runtime rather than failing at build time.

8. **Flag any server-only logic or secret** that lived safely in a Server Component. There is no server-only execution context in a plain React bundle — this logic must move to an actual backend, not just be left in the component (where it would ship the secret to every client).

9. **Metadata/SEO**: note explicitly to the user that plain client-rendered React has no server-side rendering, so whatever `generateMetadata()` was doing for SEO has real limitations in the new environment — this isn't a like-for-like swap, and matters if the page has any SEO requirement.

## React → Next.js

1. **Default to Server Components — only add `'use client'` where it's actually needed.** The App Router makes every component a Server Component by default. Add `'use client'` only to components that use `useState`, `useEffect`, event handlers, or browser-only APIs — not reflexively at the top of every converted file. A component that's purely presentational (renders props, no interactivity) should stay a Server Component.

2. **Move data fetching for a route's initial data into the Server Component itself** (or `generateMetadata`/route-level fetching), rather than keeping a TanStack Query loader/`useSuspenseQuery` pattern — Next.js's own data-fetching model replaces that, it isn't layered on top of it. If TanStack Query is still used for client-side mutations/interactive re-fetching after the initial load, that's fine — but the *initial* render shouldn't still be doing a client-side loader fetch when a Server Component can fetch it directly with zero client JS.

3. **Replace the router's `<Link>`/`navigate`** with `next/link`'s `<Link>` and `next/navigation`'s hooks. Check that `to`/`params`/`search` props translate correctly to `href`.

4. **Consider converting mutations to Server Actions** where it simplifies the flow (a `<form action={...}>` submitted directly to a `"use server"` function needs no separate API route) — but this is a judgment call, not mandatory; a TanStack Query `useMutation` calling a Next.js Route Handler is also valid, especially if the mutation needs the same optimistic-update patterns from `route-react-async-ui`.

5. **Replace `<img>` with `next/image`** to get automatic optimization — pass `width`/`height` (or use `fill` with a sized parent) as it requires them, unlike a plain `<img>`.

6. **Rename environment variables** from the source bundler's client-prefix convention (e.g. `VITE_*`) to `NEXT_PUBLIC_*` for anything genuinely needed in the browser — and double check nothing that should have stayed server-only was previously exposed with a client prefix by mistake, since Next.js's server/client boundary is stricter and this is a good point to catch that.

7. **Add a `metadata` export or `generateMetadata()`** if the page needs SEO — this is new capability the React version didn't have, not just a port of existing behavior.

8. **Watch for browser-only code running where a Server Component now executes.** Anything that touched `window`, `document`, `localStorage`, etc. will crash if it ends up in a Server Component — either move it into a `'use client'` boundary or replace it with a server-safe equivalent.

## Applying these rules

- **Any conversion**: work through the relevant section's list in order rather than doing a line-by-line find-replace — several of these (data fetching, mutations, server/client boundary) require restructuring the component, not just swapping an import.
- **After converting**: re-run the other relevant skills in this set on the result — `design-frontend-architecture` if converting into a TanStack Router app, `enforce-code-quality` and `enforce-typescript-strict` regardless of direction — since a mechanical conversion can leave the file in a state that violates rules that were fine before (e.g. a route file that grew past its wiring-only scope during the port).

