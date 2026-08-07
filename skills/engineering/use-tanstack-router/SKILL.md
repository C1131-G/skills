---
name: use-tanstack-router
role: leaf
parent: route-tanstack
description: LEAF of route-tanstack — not a main skill. File routes, loaders + Query, typed search.
disable-model-invocation: true
---
# use-tanstack-router

**Leaf — not main.** Parent: `route-tanstack`. If invoked alone, load parent with the same mode and Decision-select this leaf only. Do not report this name as a top-level run.

Apply these rules whenever building or reviewing routing in a project that uses TanStack Router, paired with TanStack Query for server state. Assumes the `routes/` and `features/` folder split from `design-frontend-architecture`.

## Routes folder shape

```
src/routes/
├── __root.tsx              # root layout, error boundary, devtools
├── index.tsx                # /
├── _authenticated/            # pathless layout route — auth guard, no URL segment
│   ├── dashboard.tsx            # /dashboard, requires auth
│   └── settings.tsx
└── users/
    ├── index.tsx                  # /users
    └── $userId.tsx                 # /users/:userId
```

## Request/Render Flow

```
URL change / navigation
      │
      ▼
┌─────────────┐
│    route    │   matches path, validates search params, runs loader
└─────────────┘
      │
      ▼
┌─────────────┐
│   loader    │   calls a feature's queryOptions via queryClient.ensureQueryData
└─────────────┘      — data is in the cache BEFORE the component renders
      │
      ▼
┌─────────────┐
│  component  │   reads already-loaded data via useSuspenseQuery — no loading
└─────────────┘   state to manage here, no useEffect fetch
      │
      ▼
┌─────────────┐
│  feature    │   queryOptions/api functions — the actual fetch + shape definition
│  (queries)  │
└─────────────┘
      │
      ▼
┌─────────────┐
│   server    │
└─────────────┘
```

| Layer | Responsibility | Must NOT do |
|---|---|---|
| **route** | Path matching, search-param validation, calling the loader, choosing the component | Business logic, defining the fetch itself |
| **loader** | Populate the query cache before render (`ensureQueryData`) | Duplicate fetch logic already defined in `features/*.queries.ts` |
| **component** | Render already-loaded data, handle user interaction, trigger mutations | Fetch its own initial data in `useEffect` — see below |
| **feature (`*.queries.ts`/`*.api.ts`)** | Define `queryOptions`, mutation functions, feature-specific schemas | Know about routing or which route uses it |

## Data fetching: loaders, not `useEffect` — apply the `audit-react-effects` skill here

TanStack Router's loaders run before the component renders and block navigation until they resolve, so the component always receives already-loaded data. This is also exactly the case the **`audit-react-effects`** skill is built to catch: `useEffect` used to fetch a route's initial data is a textbook example of an effect that should be eliminated rather than fixed, because the router's loader already owns that responsibility.

Whenever this skill fires, invoke `audit-react-effects` on any `useEffect` you're writing or reviewing in a routed component:
- **Fetching this route's initial data in `useEffect`** → eliminate it; move it to the route's `loader`.
- **Fetching data in response to a prop/param change** (e.g. `userId` changes) → this is what the router's loader re-running on navigation already handles; don't duplicate it with an effect watching the param.
- **A genuinely unavoidable effect** (subscribing to a browser API, syncing with a non-React widget) → follow `audit-react-effects`'s named-function-style enforcement for the effect itself.

```ts
// Avoid — data fetching in the component, audit-react-effects should flag this
function UserPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  if (!user) return <Spinner />;
  return <h1>{user.name}</h1>;
}

// Prefer — loader owns the fetch, component just renders
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

## Rules

1. **Use file-based routing**, not the code-based route tree — the route tree is generated from the file structure, avoiding drift between what files exist and what's registered.

2. **Route loaders integrate with TanStack Query via shared `queryOptions` factories** (defined once in `features/*/*.queries.ts`, per `use-tanstack-query` rule 8) — the loader calls `ensureQueryData(options)`, the component reads the same `options` via `useSuspenseQuery`. One definition, no duplicated fetch logic.

3. **Validate search params with a schema (Zod), never read raw strings.** Define `validateSearch` per route so `?page=2&sort=name` becomes typed, validated data instead of manually parsed strings scattered through the component.

   ```ts
   const searchSchema = z.object({
     page: z.number().catch(1),
     sort: z.enum(["name", "date"]).catch("date"),
   });
   export const Route = createFileRoute("/users/")({ validateSearch: searchSchema, ... });
   ```

4. **Use typed `<Link>`/`navigate`, never hand-built path strings.** A hand-built path (`` `/users/${id}/posts` ``) loses type safety and breaks silently on a route rename; the router's typed link/navigate APIs turn that into a compile error instead.

5. **Use pathless layout routes (`_authenticated/`) for cross-cutting concerns** — auth guards, shared chrome — instead of repeating a guard check inside every protected route individually.

6. **Give routes (or at least the root and major sections) their own `errorComponent`.** A failure in one route's loader/render shouldn't take down the whole app shell.

7. **Prefetch on intent at the router level**, not via scattered manual `prefetchQuery` calls in components — set `defaultPreload: "intent"` on the router, or per-`<Link>` where finer control is needed.

8. **Keep route files thin.** A route file wires path + loader + search schema + component choice. Heavy logic, large components, and derived state belong in `features/`, following `enforce-code-quality`'s one-file-one-job and 250-line rules — not stuffed into the route file itself.

## Applying these rules

- **New route**: create the file first, add `validateSearch` if it has query params, define/reuse a `queryOptions` factory in the relevant `features/` folder, write the loader calling `ensureQueryData`, keep the component focused on rendering already-loaded data — running `audit-react-effects` mentally (or literally) on any effect you're tempted to add.
- **Reviewing existing code**: flag `useEffect`-based fetching for a route's initial data (route it through `audit-react-effects`), raw string search-param access instead of `validateSearch`, hand-built path strings instead of typed `<Link>`/`navigate`, missing error boundaries on independently-failing sections, and route files that have grown past wiring into holding real feature logic.

