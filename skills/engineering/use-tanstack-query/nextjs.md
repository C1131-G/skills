# TanStack Query — Next.js App Router

Disclosed reference. Open from SKILL.md only for the active branch. Setup and hydration. The interaction with Next.js's own caches is in [nextjs-cache.md](nextjs-cache.md).

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
