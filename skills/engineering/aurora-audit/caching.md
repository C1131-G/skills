# Caching — Cache Components

Applies when `next.config.ts` has `cacheComponents: true` (all six reference apps do). Otherwise mark every CA rule `N/A`.

## The model in one paragraph

Synchronous JSX, `'use cache'` output and Suspense fallbacks form the **static shell**, prerendered at build. Uncached async work streams in behind `<Suspense>`. Reusable reads are cached and tagged; mutations name the tag that changed.

## What it looks like

```ts
// features/thread/thread-cache.ts — the only place tag strings exist
export const threadTags = {
  detail: (threadId: string) => `thread:${threadId}`,
  list: (userId: string) => `threads:${userId}`,
};

// thread-queries.ts
'use cache'; cacheLife('max'); cacheTag(threadTags.list(userId));

// thread-actions.ts
updateTag(threadTags.list(user.id));
```

## Rules

- **CA1** Reusable reads carry `'use cache'` + `cacheTag(...)` + `cacheLife(...)`. A read left dynamic has a one-line comment saying why.
- **CA2** Per-user reads that touch `cookies()` / `headers()` use `'use cache: private'` (the current-user lookup), or read the session outside and pass `userId` into a plain `'use cache'` function.
- **CA3** Tag strings are defined once in `<domain>-cache.ts` and imported by both queries and actions. No string literal tags inline.
- **CA4** Server actions use `updateTag()` (read-your-own-writes). Route handlers / webhooks use `revalidateTag(tag, 'max')`. The one-argument `revalidateTag(tag)` is deprecated.
- **CA5** `refresh()` is not a substitute for `updateTag()` on a cached read.
- **CA6** Tag by write frequency: a cheap, chatty layer (holds, counters, presence) gets its own function and tag, so its writes don't recompute the expensive read.
- **CA7** No legacy flags: `experimental.ppr`, `dynamicIO`, `useCache`, route `export const dynamic`/`revalidate`.
- **CA8** Synchronous request-time values (`new Date()`, `Math.random()`) under the shell follow `await io()` or live in a client leaf; `connection()` only when render must wait for a real request.

## Find violations

```bash
grep -n "cacheComponents" next.config.*
grep -rLn "'use cache" $(find features -name '*-queries.ts')
grep -rnE "cacheTag\(['\"\`]|updateTag\(['\"\`]|revalidateTag\(['\"\`]" features app
grep -rnE "revalidateTag\([^,)]+\)" features app
grep -rn "refresh()" features
grep -rnE "experimental\.(ppr|dynamicIO|useCache)|export const (dynamic|revalidate)" app next.config.*
grep -rnE "new Date\(\)|Math\.random\(\)" features --include=*.tsx | grep -v "use client"
```

Read every `refresh()` hit: is the affected read tagged? If yes, CA5 fails.

## Fix

Add the directive trio to the read, create `<domain>-cache.ts` and move the strings there, swap `refresh()` for `updateTag()` with the matching tag, and split a mixed cheap+expensive read into two cached functions.
