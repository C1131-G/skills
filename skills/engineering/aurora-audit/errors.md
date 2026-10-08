# Errors — fail one section, not the page

A failing section shows its own retry; the rest of the page stays usable. Framework control flow (`notFound()`, `redirect()`) is never swallowed.

## What it looks like

```tsx
// next16-mail/components/ui/error-boundary.tsx
'use client';
import { catchError, type ErrorInfo } from 'next/error';

function ErrorFallback(props: { title?: string }, { retry }: ErrorInfo) {
  const [isPending, startTransition] = useTransition();
  return (
    <ErrorState title={props.title ?? 'Something went wrong'} body="This section could not be loaded.">
      <Button onClick={() => startTransition(() => retry())} disabled={isPending} aria-busy={isPending}>
        {isPending && <Spinner />}
        {isPending ? 'Retrying…' : 'Try again'}
      </Button>
    </ErrorState>
  );
}

export default catchError(ErrorFallback);
```

Used in the page around the fallible section: `<ErrorBoundary title="…"><Suspense …>…</Suspense></ErrorBoundary>`.

## Rules

- **E1** Section-level error boundaries are built on `catchError` from `next/error`, not `react-error-boundary` or a hand-rolled class — those catch `notFound()`/`redirect()` and their reset doesn't refetch server data.
- **E2** Retry runs inside `startTransition`, with the button disabled and a pending label while it re-renders.
- **E3** The boundary is placed in the page around `<Suspense>` for sections that can fail on their own (secondary panels, replies, message bodies).
- **E4** Route groups have an `error.tsx` (`'use client'`, same retry-in-transition shape) and the app has a root `not-found.tsx`; dynamic resources have a segment `not-found.tsx` with a domain message.
- **E5** `notFound()` is called from the query or page boundary and is never inside a `try/catch`; if catching nearby is unavoidable, `unstable_rethrow` first.
- **E6** Error copy says what failed and that retrying is safe; no raw `error.message` shown to users.

## Find violations

```bash
grep -rn "react-error-boundary\|componentDidCatch\|getDerivedStateFromError" app components features
grep -rn "catchError" components app
find app -name error.tsx; find app -name not-found.tsx
grep -rnB5 "notFound()" features app | grep "try {"
grep -rn "error.message" app components features --include=*.tsx
```

## Fix

Replace the boundary with a `catchError` fallback like the one above; add `error.tsx` per route group and `not-found.tsx` per dynamic resource; move `notFound()` out of `try` blocks.
