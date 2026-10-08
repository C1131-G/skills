# Queries — server reads

All reads for a domain live in `features/<domain>/<domain>-queries.ts`. Components import them; pages do not.

## What it looks like

```ts
// next16-mail/features/thread/thread-queries.ts
import 'server-only';

// Public: reads the session, normalizes, then calls the cached body with primitives.
export async function getThreads(mailbox: Mailbox, page: number): Promise<ThreadPage> {
  const user = await verifyUser();
  return getThreadsForUser(user.id, mailbox, page);
}

async function getThreadsForUser(userId: string, mailbox: Mailbox, page: number): Promise<ThreadPage> {
  'use cache';
  cacheLife('max');
  cacheTag(threadTags.list(userId));
  const rows = await prisma.thread.findMany({ ... });
  return { threads: rows.map(row => toListItem(row, userId)), total };
}
```

## Rules

- **Q1** Every `*-queries.ts` starts with `import 'server-only'`. So does `lib/db.ts`.
- **Q2** Queries return **domain types** (`ThreadListItem`), mapped from ORM rows by a local `toX()` function. Dates cross as ISO strings. Components never see Prisma row types.
- **Q3** A resource query calls `notFound()` when the record is absent. Pages don't decide existence; nobody wraps `notFound()` in `try/catch`.
- **Q4** Session-dependent reads split in two: a public wrapper that reads the user (`verifyUser()`), and an inner cached function keyed on `userId` and other **primitives**.
- **Q5** Arguments are normalized (trimmed, lower-cased, clamped) **before** the cached call, so `?page=0`, `?page=1` and no page share one entry. Never pass a `searchParams` object into a query.
- **Q6** Independent reads run together with `Promise.all`, not sequential `await`s.
- **Q7** React `cache()` only for a proven same-request duplicate (the session lookup). Not on every query, and not stacked on a `'use cache'` function.

## Find violations

```bash
for f in $(find features -name '*-queries.ts'); do head -3 "$f" | grep -q "server-only" || echo "missing server-only: $f"; done
grep -rn "from '@prisma/client'\|from '@/generated/prisma" features --include=*.tsx
grep -rnB3 "notFound()" features app | grep -n "try"
grep -rnE "searchParams" features --include=*-queries.ts
# Q6 candidates: two `= await` lines in a row — read each: does the second depend on the first?
find features -name '*.ts*' -exec awk 'FNR==1{p=0} /= await /{if(p) print FILENAME":"FNR": "$0; p=1; next} {p=0}' {} +
grep -rn "cache(" features --include=*-queries.ts
```

## Fix

Add `import 'server-only'`; add a mapper and a type under `features/<domain>/types/`; move the existence check into the query with `notFound()`; split session read from cached body; normalize in the feature's parser before calling.
