# Pages — composition only

A page describes the **loading experience**: static chrome, headings, and where each data section suspends. It does not fetch.

## What it looks like

```tsx
// next16-mail/app/(mail)/[mailbox]/page.tsx
export default function MailboxPage({ params, searchParams }: PageProps<'/[mailbox]'>) {
  const query = Promise.all([params, searchParams]).then(([{ mailbox }, values]) => {
    if (!isMailbox(mailbox)) notFound();
    return { mailbox, page: parsePage(values.page) };
  });

  return (
    <div className="flex h-full flex-col">
      <AnimatedSuspense fallback={<ThreadListSkeleton />}>
        {query.then(({ mailbox, page }) => (
          <ThreadList mailbox={mailbox} page={page} title={MAILBOX_LABELS[mailbox]} />
        ))}
      </AnimatedSuspense>
    </div>
  );
}
```

Synchronous function. Route props resolved with `.then()`. Plain values passed down. The chrome outside the boundary paints at once.

## Rules

- **P1** Pages and layouts are **not** `async`. No `await params` / `await searchParams` at the top.
- **P2** Route props are read with `params.then(...)`, `searchParams.then(...)`, or `Promise.all([params, searchParams]).then(...)` — never nested `.then()` chains.
- **P3** No `*-queries` import in `page.tsx` / `layout.tsx`. Exception: `generateMetadata`, which is its own entry point and may `await params` and call a query.
- **P4** Props are typed with the generated `PageProps<'/route'>` / `LayoutProps<'/route'>`, not hand-written `{ params: Promise<...> }`. Route handlers use `RouteContext<'/api/...'>`.
- **P5** Parsing and validation of URL values happens at the page boundary through a feature helper (`parsePage`, `parseBookingDraft`, `isMailbox`) — the feature receives a clean `number` / union, and `notFound()` fires for an invalid segment.
- **P6** No page-local wrapper components (`HomeContent`, `ResultsSection`) that only fetch or group a fallback. Keep resolved JSX and fallback JSX inline so the loading shape is visible in the page.
- **P7** Allowed exceptions: a tiny route-local helper whose only job is control flow at a boundary (`await connection(); await redirectIfAuthenticated()`), and thin transition wrappers.

## Find violations

```bash
grep -rnE "export default async function" app --include=page.tsx --include=layout.tsx
grep -rnE "await (params|searchParams)" app --include=page.tsx --include=layout.tsx
grep -rn "\-queries'" app --include=page.tsx --include=layout.tsx
grep -rnE "params: Promise<" app
grep -rnE "^(async )?function [A-Z]" app --include=page.tsx
```

Read each `await params` hit: inside `generateMetadata` it is fine (P3 exception).

## Fix

Drop `async`, replace the top-level `await` with a `.then()` inside the `<Suspense>` that covers it, move the query call into the feature component, and pass the resolved id. A page-local fetching component moves into `features/<domain>/components/` with its skeleton.
