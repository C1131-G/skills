# TanStack Router + Query — the unified context pattern

Disclosed reference. Open from SKILL.md when a route loads server data.
This is the canonical write-up of this pattern; `use-tanstack-query/advanced.md` points here.

## The division of labour

The route loader **imperatively primes** the cache (`ensureQueryData`). The component **reactively subscribes** to it (`useSuspenseQuery`).

Never read a query's data from `Route.useLoaderData()`. Without a `useQuery`/`useSuspenseQuery` call there is no active observer, which silently breaks background refetching and invalidation for that data.

## The Great Divergence

The failure this pattern exists to prevent. As an application scales:

1. Components move out of route files into their own files via `getRouteApi('/path')`.
2. New features introduce search parameters — `?asOf=YYYY-MM-DD`, `?page=2`, `?sort=desc`.
3. Those parameters get consumed in the component but never synchronized with the loader. The loader fetches unwanted **default** data, blocking navigation; then the component re-suspends on mount for a *second* query. That is a silent, severe request waterfall.
4. Queries get removed from components without the loader being cleaned up — a silent bandwidth leak.

The fix is structural: make it impossible for the loader and the component to hold different options.

## The pattern

### 1. Declare `loaderDeps` for search parameters

Path params are always injected into loaders, because a path change is an unambiguous navigation. Search parameters are not — they often carry client UI state (open modals, active tabs) that should not re-trigger a loader.

**Any search parameter that affects data fetching must be declared explicitly:**

```ts
loaderDeps: ({ search: { asOf, page, sort } }) => ({ asOf, page, sort }),
```

### 2. Build `queryOptions` once, in route `context`

Never construct `queryOptions` independently in both the loader and the component. Build them once in the route's `context` function, which runs on the **loader schedule** — only when `params` or `loaderDeps` change, unlike `beforeLoad`, which runs on every navigation change.

```ts
// src/routes/dashboard/$dashboardId.tsx
export const Route = createFileRoute("/dashboard/$dashboardId")({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { asOf } }) => ({ asOf }),

  // 1. Single source of truth
  context: ({ params, deps }) => ({
    dashboardQueryOptions: dashboardOptions(params.dashboardId, deps),
  }),

  // 2. Loader primes the cache from that source
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(context.dashboardQueryOptions);
  },

  component: DashboardPage,
});
```

```tsx
// src/features/dashboard/DashboardContent.tsx — a separate file
const routeApi = getRouteApi("/dashboard/$dashboardId");

export function DashboardContent() {
  // 3. Component consumes the identical options
  const { dashboardQueryOptions } = routeApi.useRouteContext();
  const { data: dashboard } = useSuspenseQuery(dashboardQueryOptions);

  return <DashboardView data={dashboard} />;
}
```

### 3. Context is inherited

Route context is inherited hierarchically, so a root or parent route can define global options (`userQueryOptions` on `__root__`) that every child route and nested widget reads via `useRouteContext()` without re-instantiating query keys.

### 4. Subscriptions stay stable

`useRouteContext()` does **not** cause spurious re-renders when an unrelated search parameter changes (`?debug=true`), because the context function only recomputes when declared `params` or `loaderDeps` change.

### 5. Let Query own caching

Set `defaultPreloadStaleTime: 0` globally on the router so TanStack Query — not the router — owns staleness.

## Loaders replace `useEffect` fetching

Loaders run before the component renders and block navigation until they resolve, so the component always receives already-loaded data. This is the textbook case `audit-react-effects` exists to catch — apply it to any effect in a routed component:

| Effect you were about to write | What actually owns it |
|---|---|
| Fetching this route's initial data | The route's `loader` |
| Refetching when a param changes | The loader re-running on navigation |
| Subscribing to a browser API or non-React widget | A genuine effect — follow `audit-react-effects`'s named-function rule |

```ts
// Avoid — audit-react-effects should flag this
function UserPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  if (!user) return <Spinner />;
  return <h1>{user.name}</h1>;
}

// Prefer — the loader owns the fetch, the component only renders
export const Route = createFileRoute("/users/$userId")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(userOptions(params.userId)),
  component: UserPage,
});

function UserPage() {
  const { userId } = Route.useParams();
  const { data: user } = useSuspenseQuery(userOptions(userId)); // already loaded
  return <h1>{user.name}</h1>;
}
```
