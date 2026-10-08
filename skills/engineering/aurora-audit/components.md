# Components — server by default, client at the leaves

A feature component is an **async server component** that reads its own data. `'use client'` is for the small interactive pieces inside it.

## What it looks like

```tsx
// server — next16-mail/features/thread/components/thread-header.tsx
export async function ThreadToolbar({ backHref, threadId }: { backHref: Route; threadId: string }) {
  const thread = await getThreadSummary(threadId);
  return (
    <div>
      <ArchiveButton backHref={backHref} threadId={thread.id} threadMailbox={thread.mailbox} />
      <StarButton starred={thread.starred} threadId={thread.id} />
    </div>
  );
}

// client leaf — next16-mail/features/thread/components/thread-toolbar.tsx
'use client';
import { toggleStar } from '../thread-actions';
export function StarButton({ starred, threadId }: { starred: boolean; threadId: string }) { ... }
```

## Rules

- **C1** Feature components receive plain values — `threadId`, `handle`, `page: number`, or an already-fetched record. No prop named `params` or `searchParams`, no route-shaped object.
- **C2** Server components await their query directly. No `useEffect` + `fetch` for data the server can read.
- **C3** `'use client'` only for hooks, event handlers, or browser APIs, and only on **leaves**. A client component never imports an async server component; server content reaches it as `children` or a named slot prop.
- **C4** When a parent already fetched the list, it passes each record down; the child does not refetch by id.
- **C5** A promise handed to a client component is named with a `Promise` suffix (`highlighterPromise`, `userPromise`) and read with `use()` inside a `<Suspense>`.
- **C6** Single-use sub-components stay as **non-exported** functions in the same file. Exports are for things other files import.
- **C7** Related components share a file (a card and its grid). Split only for a third call site, or because one side is `'use client'`.
- **C8** Shareable UI state (tab, filter, page) lives in the URL; local `useState` holds only ephemeral state (open, focused, draft).

## Find violations

```bash
grep -rnE "(params|searchParams)[?]?:" features --include=*.tsx
grep -rln "^['\"]use client" features components | xargs grep -ln "useEffect" | xargs grep -lE "fetch\(|axios"
# C3: client files importing an async server component — list client files, then check their component imports
grep -rln "^['\"]use client" features components
grep -rnE "Promise<[^>]+>" features --include=*.tsx | grep -vE "[a-z]Promise[?]?:"
```

For C3, open each client file and confirm every imported component from `features/` is itself client-safe (not `export async function`).

## Fix

Resolve route props in the page and pass the id; move fetch-in-effect into an async server component; push `'use client'` down to the smallest interactive piece and pass server content through `children`.
