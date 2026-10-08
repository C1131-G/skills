# Suspense — who owns the boundary

The **page** decides where loading happens. The **feature** supplies the component and its skeleton. Nothing jumps when data arrives.

## What it looks like

```tsx
// next16-mail/app/(mail)/[mailbox]/[threadId]/page.tsx (trimmed)
<article className="...">
  <AnimatedSuspense fallback={<ThreadHeaderSkeleton />}>
    {query.then(({ threadId }) => (
      <>
        <ThreadHeader threadId={threadId} />
        <ErrorBoundary title="This conversation could not be loaded">
          <AnimatedSuspense fallback={<LatestMessageSkeleton />}>
            <LatestMessage threadId={threadId} />
          </AnimatedSuspense>
        </ErrorBoundary>
      </>
    ))}
  </AnimatedSuspense>
</article>
```

The `<article>` frame is outside the boundary; only the data body swaps. `AnimatedSuspense` (in `components/ui/`) is `<Suspense>` plus a `<ViewTransition>` so fallback→content crossfades.

## Rules

- **S1** `<Suspense>` for page data sits in the page. Feature components never wrap themselves in `<Suspense>`.
- **S2** Exception: app-shell slots (sidebar counts, user badge, compose panel) own their boundary in the layout or shell component, because they repeat on every route.
- **S3** Stable chrome — cards, panels, borders, section headings with a fixed position — sits **outside** the boundary. Fallback and content never both render the same outer card.
- **S4** Never `fallback={null}` over visible UI. Null is fine only for invisible work (a client effect leaf, a script) or a slot that reserves its own space.
- **S5** Never wrap the whole page in one boundary with a full-page skeleton. Narrow the boundary to the data-dependent part.
- **S6** A section of unknown height that pushes content below groups the sections under it into the same boundary, or reserves its height.
- **S7** A route with variants (`[step]`, `[view]`) uses two levels: a neutral outer fallback that fits every variant, then a variant-exact skeleton inside `.then()` once the variant is known (`next16-airline/app/(travel)/book/[flightId]/[step]/page.tsx`).
- **S8** Pending indicators keep their size: a spinner inside a button does not widen it; a badge that appears with data has a same-height pill skeleton.

## Find violations

```bash
grep -rln "<Suspense" features              # S1: then read — is it a page-data boundary?
grep -rn "fallback={null}" app features components
grep -rnB2 -A2 "<Suspense" app | grep -iE "fullpage|PageSkeleton"
```

CLS is runtime behaviour: mark S6/S8 `UNVERIFIABLE` unless you measured in the browser (React DevTools Suspense panel, or Next.js DevTools loading-state inspector).

## Fix

Lift the `<Suspense>` out of the feature into the page, export the skeleton beside the component, move the shared card outside the boundary, and replace `fallback={null}` with the real skeleton or merge it into a sibling boundary that already has one.
