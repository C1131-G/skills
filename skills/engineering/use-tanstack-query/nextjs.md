# TanStack Query — Next.js App Router

Disclosed reference. Open from SKILL.md only for the active branch.
Source of truth: Next.js "Client-side data fetching with TanStack Query" guide (App Router).

## 33. First decide whether you need the library at all

If a Client Component reads server data **once** and never revalidates it in the browser, don't reach for TanStack Query — pass the promise down from a Server Component and unwrap it with React's `use()`. Adding a query cache for data that never refetches is pure overhead.

Reach for TanStack Query when Client Components need a **shared browser cache**: dedup across components, focus revalidation, interval polling, optimistic updates, or invalidation after a mutation.

Three patterns, and the choice is only about *when data becomes available*:

| Pattern | Hook / API | Data arrives |
|---|---|---|
| Inline loading state | `useQuery` | Browser request after hydration |
| Suspense loading state | `useSuspenseQuery` | Browser request after hydration |
| Provided by the server | `<HydrationBoundary>` | Initial render, or streamed from the server |

Use inline when each component owns its own spinner; use Suspense when a boundary should coordinate which parts reveal together. For interaction-driven data (autocomplete, filters) either client-only pattern is fine — waiting for hydration is the right tradeoff for data nobody needs until they interact. Reach for the server-provided pattern only when the **initial render** needs the data.

## 34. One `QueryClient` per server render, one shared instance in the browser

```tsx
// app/products/providers.tsx
'use client'
let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') return new QueryClient() // isolate per request
  browserQueryClient ??= new QueryClient()                    // survive re-renders
  return browserQueryClient
}

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
}
```

Render `<Providers>` from the **nearest shared layout** that owns those routes, not reflexively from the root layout. A module-level singleton on the server would leak one user's data into another user's response (rule 11); a fresh client on every browser render would throw the cache away on each re-render.

## 35. Server and client must share one cache contract

The prefetch on the server and the `useSuspenseQuery` in the browser have to agree on the **query key**, or hydration silently does nothing and the client refetches. Keep the key and its options in one module both sides import:

```ts
// app/products/[id]/product-cache.ts
export const productCache = {
  key: (id: string) => ['product', id] as const,
  tag: (id: string) => `product:${id}`, // server cache identity, see rule 37
  options: (id: string) =>
    queryOptions({
      queryKey: productCache.key(id),
      queryFn: async (): Promise<Product> => {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) throw new Error('Failed to fetch product')
        return res.json()
      },
      staleTime: 30_000,
    }),
}
```

Keep this module free of `server-only` and client-only imports — both cache layers import it. Note the `queryFn` hits a Route Handler with a **relative URL**, which only resolves in the browser; on the server, override `queryFn` with the direct data function.

## 36. Streamed prefetch: don't await, dehydrate pending queries

TanStack Query 5.40.0+ can dehydrate *pending* queries, so the server doesn't have to block on the fetch before handing work to the client:

```tsx
// app/products/[id]/page.tsx
export default function Page({ params }: PageProps<'/products/[id]'>) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      {params.then(({ id }) => <ProductData id={id} />)}
    </Suspense>
  )
}

function ProductData({ id }: { id: string }) {
  const queryClient = new QueryClient()

  // Not awaited — rendering is not blocked.
  void queryClient.prefetchQuery({ ...productCache.options(id), queryFn: () => getProduct(id) })

  return (
    <HydrationBoundary
      state={dehydrate(queryClient, {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      })}
    >
      <ProductView id={id} />
    </HydrationBoundary>
  )
}
```

Two things that are easy to get wrong:

- The explicit `staleTime` on the options (rule 11) is what stops the client refetching the moment it hydrates. Without it, the prefetch was wasted work.
- Multiple `useSuspenseQuery` calls **in one component run sequentially**. Put independent queries in sibling components or use `useSuspenseQueries`, or you've built a waterfall inside a Suspense boundary.

After a query has data, later refetches keep the cached data rendered rather than re-showing the fallback — surface background refreshes with `isFetching`, not the boundary. An initial `useSuspenseQuery` failure propagates to the nearest error boundary.

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
