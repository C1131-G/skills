# Navigation — instant by default

Navigation commits immediately to a prefetched shell; link-specific data streams after. The shell layout, sidebar and active-tab motion belong to `apply-next-shell-nav`; this file checks links and prefetch decisions.

## What it looks like

```tsx
// Back link the user will almost certainly click — full prefetch
<Link aria-label="Back to list" href={href} prefetch={true}>…</Link>

// Rows in a long list — prefetch on intent (next16-mail/components/ui/hover-prefetch-link.tsx)
<HoverPrefetchLink href={`/inbox/${thread.id}`}>…</HoverPrefetchLink>

// Content that must wait for the click, not the prefetch (next16-mail thread-messages.tsx)
export async function LatestMessage({ threadId }: { threadId: string }) {
  await navigation();            // `unstable_navigation()` on 16.4 canaries
  const latest = await getLatestMessage(threadId);
  …
}
```

## Rules

- **N1** Internal links use `next/link` with typed hrefs (`typedRoutes: true`, `Route` type), not `<a href>` or string-built URLs without `as Route`.
- **N2** `prefetch={true}` is reserved for high-value next steps (back, primary CTA). Long lists prefetch on hover/focus intent. No `prefetch="auto"` written out — it is the default.
- **N3** Active and pending link state come from one `NavLink` primitive using `usePathname` + `useLinkStatus`, wrapped in `<Suspense>` with an inactive fallback so the shell stays static.
- **N4** With `partialPrefetching`, heavy or private content that should not ride in a prefetch is gated with `navigation()` / `unstable_navigation()`; content kept out of the shared shell but allowed in a per-link prefetch uses `prefetch()` / `unstable_prefetch()`. Gates sit in an uncached wrapper, never inside `'use cache'`.
- **N5** A live read (presence, seat holds) sits in its own sibling boundary so it doesn't block the useful cached content around it.
- **N6** A finished flow leaves with `redirect(…, RedirectType.replace)` so Back doesn't return to the completed step.

## Find violations

```bash
grep -n "typedRoutes\|partialPrefetching" next.config.*
grep -rnE "<a href=['\"]/" app features components --include=*.tsx
grep -rn "prefetch={true}" app features components | wc -l
grep -rn "prefetch=\"auto\"\|prefetch='auto'" app features components
grep -rn "useLinkStatus\|usePathname" components features --include=*.tsx
grep -rnB3 "navigation()\|prefetch()" features --include=*.tsx | grep "use cache"
```

Count `prefetch={true}`: dozens on list rows is an N2 `FAIL`; a handful on primary paths is a `PASS`. Instant feel is runtime — prove it with `testing.md` (TS3), otherwise `UNVERIFIABLE`.

## Fix

Swap raw anchors for `Link`; demote list-row `prefetch={true}` to an intent-based link; centralize active state in a `NavLink`; move a gate out of a cached function into its uncached caller.
