# TanStack Query — Next.js cache layers

Disclosed reference. Open from SKILL.md only for the active branch. Coordinating the Query cache with Next.js's Data Cache and Full Route Cache, server mutations, and Cache Components. Providers and hydration are in [nextjs.md](nextjs.md).

## 37. Three cache layers, coordinated by identity — not by matching durations

With Cache Components (`cacheComponents` in `next.config.ts`) enabled, related data can live in three places:

| Layer | Holds | Freshness knob |
|---|---|---|
| Next.js server cache | `use cache` data and Server Component output | `cacheLife` → `revalidate` / `expire` |
| Next.js client cache | RSC payloads for visited/prefetched routes | `cacheLife` → `stale` |
| TanStack Query | Browser data under a query key | `staleTime` + invalidation |

Their durations are **independent** and do not need to match — TanStack Query's `staleTime` has nothing to do with `cacheLife`. What must stay coordinated is **cache identity and mutation invalidation**: the query key and the `cacheTag` are two names for the same data, so define both in the same contract (rule 35).

```ts
// app/products/[id]/data.ts — server read
export async function getProduct(id: string): Promise<Product> {
  'use cache'
  cacheLife('max')                 // 'max' is fine because writes invalidate the tag
  cacheTag(productCache.tag(id))
  return db.product.findUnique({ where: { id } })
}
```

With Cache Components on, Next.js also prerenders Client Components — keep any query needed for the initial render **behind Suspense**, since TanStack Query reads the current time when creating active query state and would otherwise trip a current-time prerender error.

## 38. Mutations: optimistic in the browser, `updateTag` on the server

Hydration only seeds the initial value; after hydration TanStack Query owns the browser copy. A mutation therefore has two jobs:

1. **Update the browser cache now** — `cancelQueries` → snapshot → `setQueryData` in `onMutate`, restore the snapshot in `onError` (see [mutations.md](mutations.md) and `apply-react-async-ui`).
2. **Invalidate the cached server read** in the Server Action, so the next server render doesn't hand back a stale value the client then has to correct.

```ts
'use server'
export async function markActivityReadAction() {
  const userId = await getCurrentUserId()
  await markActivityReadInDatabase(userId)
  updateTag(activityCache.tag(userId))
}
```

Pick the server-side invalidation by urgency:

| Call | Use when | Next server read |
|---|---|---|
| `updateTag(tag)` | A Server Action's write must be visible immediately | Waits for fresh data |
| `revalidateTag(tag, 'max')` | Passive update; stale is acceptable | Serves stale while revalidating |
| `revalidateTag(tag, { expire: 0 })` | Webhook / external system needs immediate expiry | Waits for fresh data |

If the server read is **not** cached there is no tag to invalidate, and step 2 doesn't apply.

## 39. Cache Components + `dehydrate()`: build the hydration state by hand

`dehydrate()` reads `Date.now()`, which trips a current-time prerender error under Cache Components. Cache **only the timestamp**, tagged with the same tags as the data reads, then assemble `DehydratedState` yourself:

```ts
async function getHydrationUpdatedAt(tags: string[]) {
  'use cache'
  cacheTag(...tags)
  cacheLife('max')
  return Date.now()
}

export async function dehydrate(queries: HydratedQuery[], options: HydrationOptions) {
  const updatedAt = await getHydrationUpdatedAt(options.tags)
  const queryClient = new QueryClient()
  for (const query of queries) queryClient.setQueryData(query.queryKey, query.data, { updatedAt })

  return {
    mutations: [],
    queries: queryClient.getQueryCache().getAll()
      .filter((query) => defaultShouldDehydrateQuery(query))
      .map((query) => ({
        dehydratedAt: updatedAt,
        queryHash: query.queryHash,
        queryKey: query.queryKey,
        state: query.state,
        ...(query.meta ? { meta: query.meta } : {}),
      })),
  }
}
```

The invariant: **the timestamp must advance whenever the hydrated data changes**, otherwise `<HydrationBoundary>` won't overwrite a client query that is actually older. Sharing tags between the data read and the timestamp read is what guarantees that. This works for tag-driven data; for time-driven data, derive the data and its timestamp from the same cached snapshot rather than maintaining two unrelated time windows.
