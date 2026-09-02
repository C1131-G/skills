---
name: apply-next-shell-nav
description: Apply a persistent Next.js App Router shell with nested sidebars, correct deep-link first paint, private session chrome, and stable soft navigation. Triggers on "add a sidebar", "sidebar open/close", collapsible or responsive nav, a layout that remounts or flashes on navigation, nav state lost on refresh, and chrome that should only render for logged-in users.
---

# apply-next-shell-nav

Use this skill directly for Next.js application shells. Pair it with `apply-react-async-ui` for boundary placement and `apply-native-feel-nav` for visual navigation motion.

Also apply `enforce-code-quality` and, for TypeScript code, `enforce-typescript-strict` to files in scope.

Patterns for **Next.js App Router dashboards** (Cache Components era): a persistent shell, nested product sidebar, correct deep-link first paint, and soft nav that does not skeleton the chrome.

Stack gate: **Next.js** in `package.json`. Prefer with `cacheComponents` / Partial Prefetching when available (Next 16+). Pair `apply-react-async-ui` for boundary shape; pair `apply-native-feel-nav` only for visual motion — this skill owns **structure and data placement**, not transitions.

Canonical demo: [aurorascharff/sidebar-subnav-demo](https://github.com/aurorascharff/sidebar-subnav-demo).

## Rules (apply 1 → N, gate each)

### 1. Layout owns the shell — one sidebar, never remounted per product page

Put the dashboard chrome (sidebar, team switcher, user card) in the **segment layout** that wraps all products (`app/[team]/layout.tsx` or equivalent). Product pages only render **main content**.

```tsx
// layout — shell stable across soft nav
export default function TeamLayout({ children, params }) {
  return (
    <div className="app-shell">
      <DashboardSidebar params={params} />
      <main>{children}</main>
    </div>
  );
}
```

**Done when:** navigating product A → product B does not unmount the sidebar tree (no sidebar file under each leaf route; no `key={pathname}` on the sidebar).

### 2. Static nav model + client pathname selects the pane

Define routes, labels, nested sections, and path helpers as **static data** shared by server and client. Client sidebar uses `usePathname()` (or router match) to pick active link and nested pane. Keep open/scroll state in that mounted client tree.

```ts
// navigation-model.ts — single source of truth
routeDefinitions, topLevelLinks, sidebarSections
routeToPath(route, teamSlug)
pathToRoute(pathname, teamSlug)
getRouteSection(route) // nested pane key | undefined
```

```tsx
// client SidebarNavigation
const pathname = usePathname();
const route = pathToRoute(pathname, teamSlug);
const nestedKey = getRouteSection(route);
// show nested pane when nestedKey is set; local open state survives soft nav
```

**Done when:** pane open/closed and active styles derive from URL + local UI state only — not from remounting a different sidebar component per section.

### 3. Destination identity on first paint — narrow Suspense on rows only

Hard visit to a nested URL must not flash another product or a blank generic page. Each page renders **title, description, primary action, static metrics** synchronously. Wrap **request-scoped lists/tables** in a narrow `Suspense` with a shape-matched skeleton.

```tsx
export default function ApiKeysPage({ params }) {
  const teamSlug = params.then((p) => p.teamSlug);
  return (
    <ApiKeysPageContent teamSlug={teamSlug}>
      <Suspense fallback={<RowsSkeleton />}>
        <ApiKeyRows teamSlug={teamSlug} />
      </Suspense>
    </ApiKeysPageContent>
  );
}
```

**Done when:** first paint of a deep link already names the correct destination; only secondary rows stream.

### 4. Route-aware nav is not part of the shared static shell fallback

Parent layout does not know the active child while the shared shell is prerendered. A Suspense fallback that renders the **wrong product pane** is a bug.

Pick one:

| Mode | Behavior | Use when |
|---|---|---|
| **Skeleton** | Neutral pane skeleton until client pathname resolves | Prefer simplicity; short load OK |
| **Inline pre-paint** | HTML includes all panes (hidden) + tiny script sets pane + `aria-current` from `location.pathname` before paint | No wrong pane **and** no skeleton flash |

Do **not** default the fallback to top-level nav only when the URL is nested. Parallel routes can server-render the exact pane but **remount** when crossing segment boundaries — avoid if nested pane local state matters.

Active links: optional pre-paint script on `data-navlink-href` (see Aurora’s NavLink pattern) so `aria-current` is correct before React hydrates.

**Done when:** deep link never paints the wrong product pane; chosen mode is intentional (skeleton vs pre-paint).

### 5. Session chrome does not block soft navigation

User/role/team chrome that reads cookies must not force a full-nav skeleton on every soft navigate.

```ts
export async function getCurrentUser() {
  'use cache: private';
  cacheLife({ stale: 300 }); // tune; private = per-session, not shared CDN
  const session = (await cookies()).get('…')?.value;
  // return user
}
```

Wrap team switcher / user card in their **own** Suspense skeletons. Enable framework support when available:

```ts
// next.config
cacheComponents: true,
partialPrefetching: true, // when on Next that supports it
```

Default `<Link>` prefetch can include private-cached shell in the **browser session**. Do **not** set `prefetch={true}` only for cookie shell — that opt-in is for per-URL `params` / `searchParams` work.

Partial Prefetching does **not** choose the active pane; rule 2 does after commit.

**Done when:** soft nav between siblings does not re-skeleton session chrome when private cache is warm; hard load still resolves user correctly.

### 6. Split async by independence — shell pieces stream separately

Sidebar is one region with **multiple** boundaries, not one mega-Suspense:

- params → team label  
- navigation (client after params)  
- user card (`getCurrentUser`)  

Main content: page shell sync, rows async (rule 3).

**Done when:** a slow user fetch does not block the whole sidebar; a slow table does not blank the page title.

Reviewing or fixing an existing shell rather than building one → [review.md](review.md): the anti-pattern table and the six review questions.

## Done when (skill)

- Shell layout owns nav; leaves own content only  
- Static model + pathname pane selection; no remount for pane switch  
- Destination clear on first paint; rows stream  
- Fallback never shows wrong product  
- Session chrome cached privately; soft nav stays responsive  
- Rules gated (lint/typecheck/build as project allows)
