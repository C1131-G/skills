# Skeletons — same file, same size

A skeleton is the loading twin of one component. It lives next to it so they change together.

## What it looks like

```tsx
// next16-mail/features/thread/components/thread-header.tsx
export async function ThreadHeader({ threadId }: { threadId: string }) {
  const thread = await getThreadSummary(threadId);
  return (
    <header>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-4">
        <h1 className="text-xl leading-7 font-semibold sm:text-2xl sm:leading-8">{thread.subject}</h1>
      </div>
      ...
    </header>
  );
}

export function ThreadHeaderSkeleton() {
  return (
    <div aria-hidden>
      <div className="pt-4">
        <div className="flex h-7 items-center sm:h-8">       {/* same line box as the h1 */}
          <Skeleton className="h-6 w-3/5 max-w-xl" />
        </div>
      </div>
      ...
    </div>
  );
}
```

## Rules

- **K1** Every async component that sits under a boundary exports a `<Name>Skeleton` from the **same file**.
- **K2** The skeleton is defined **after** the component, at the end of the file.
- **K3** No alias skeletons (`CompactGridSkeleton = () => <GridSkeleton dense />`). Pass the prop inline at the boundary: `fallback={<GridSkeleton dense />}`.
- **K4** Same layout as the real thing: flex direction, gaps, padding, breakpoints, and responsive visibility (`hidden sm:block` in both).
- **K5** Same height. Text becomes a bar inside the text's line box (`flex h-7 items-center` around an `h-6` bar), not a guessed `h-[34rem]`.
- **K6** Variable-length lists show 2–5 placeholder rows, not the real count. Inner Suspense content is not drawn inside the outer skeleton.
- **K7** Skeletons are `aria-hidden` (or a single `role="status"` with a label). Dense grids use a flat fill; only a few text bars animate.

## Find violations

```bash
# K1: async components with no Skeleton export in the same file
for f in $(grep -rl "export async function" features --include=*.tsx); do grep -q "Skeleton(" "$f" || echo "$f"; done
# K2: a Skeleton defined before the main component
grep -rn "export function .*Skeleton" features --include=*.tsx
# K3: one-line alias skeletons
grep -rnA2 "export function .*Skeleton" features --include=*.tsx | grep -E "return <[A-Za-z]+Skeleton"
# K5: guessed fixed heights
grep -rnE "h-\[[0-9.]+(rem|px)\]" features --include=*.tsx
```

An async component rendered only inside another component's boundary may legitimately have no skeleton — check where it is used before failing K1. K4/K5 need a browser to confirm; mark `UNVERIFIABLE` without one.

## Fix

Move the skeleton into the component's file, below it; delete alias skeletons and inline their props at the boundary; replace fixed-height guesses with a skeleton composed from the same primitives the real component uses.
