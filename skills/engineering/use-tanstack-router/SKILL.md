---
name: use-tanstack-router
description: Use TanStack Router with file routes, loaders, typed params and search, links, and prefetching, plus its TanStack Query integration. Use on any file with createFileRoute, useNavigate, or a route loader. Triggers on adding or nesting a route, reading URL/search params, data loaded twice on navigation, params typed as string when they are not, and loader-versus-component data divergence.
---

# use-tanstack-router

Use this skill directly for TanStack Router. Pair it with `use-tanstack-query` for server state and `audit-react-effects` to eliminate effect-driven route fetching.

Also apply `enforce-code-quality` and `enforce-typescript-strict` to files in scope.

Assumes a `routes/` and `features/` folder split.

| Branch | Open |
|---|---|
| The route loads server data — loaders, `loaderDeps`, context, waterfalls | [query-integration.md](query-integration.md) |
| Everything else — folder shape, search params, links, layouts, errors | this file |

## Routes folder shape

```
src/routes/
├── __root.tsx                  # root layout, error boundary, devtools
├── index.tsx                   # /
├── _authenticated/             # pathless layout route — auth guard, no URL segment
│   ├── dashboard.tsx           # /dashboard, requires auth
│   └── settings.tsx
└── users/
    ├── index.tsx               # /users
    └── $userId.tsx             # /users/:userId
```

## Who owns what

Data flows in one direction: **route → context → loader → component → feature → server.** Each layer has exactly one job.

| Layer | Responsibility | Must NOT do |
|---|---|---|
| **route** | Path matching, search validation, `loaderDeps`, `context` options factory | Business logic, defining the fetch |
| **context** | Build `queryOptions` from `params` + `deps` as the single source of truth | Trigger side effects or network calls |
| **loader** | Prime the cache before render — `ensureQueryData(context.myQueryOptions)` | Duplicate the options or the fetch logic |
| **component** | Render loaded data via `useSuspenseQuery(context.myQueryOptions)`, handle interaction, trigger mutations | Fetch initial data in `useEffect`, or build query options independently |
| **feature** (`*.queries.ts` / `*.api.ts`) | Define `queryOptions`, mutation functions, feature schemas | Know about routing or which route uses it |

The critical property: because `context` builds the options **once**, the loader and the component cannot disagree about what to fetch. See [query-integration.md](query-integration.md) for why that matters and what breaks without it.

## Rules

1. **File-based routing, not the code-based route tree.** The tree is generated from the file structure, so files and registered routes cannot drift apart.

2. **`queryOptions` live in route `context`**, with `loaderDeps` for any search param that affects fetching. The loader primes with `ensureQueryData(context.myQueryOptions)`; the component reads the same object via `useRouteContext()` + `useSuspenseQuery`. Divergence becomes structurally impossible. → [query-integration.md](query-integration.md)

3. **Validate search params with a schema; never read raw strings.** `?page=2&sort=name` should arrive as typed, validated data, not strings parsed by hand across components.

   ```ts
   const searchSchema = z.object({
     page: z.number().catch(1),
     sort: z.enum(["name", "date"]).catch("date"),
   });
   export const Route = createFileRoute("/users/")({ validateSearch: searchSchema, ... });
   ```

4. **Typed `<Link>` / `navigate`, never hand-built path strings.** `` `/users/${id}/posts` `` loses type safety and breaks silently on a route rename; the typed APIs turn that into a compile error.

5. **Pathless layout routes (`_authenticated/`) for cross-cutting concerns** — auth guards, shared chrome — instead of repeating the check inside every protected route.

6. **An `errorComponent` on the root and every major section.** One route's loader failure must not take down the whole app shell.

7. **Prefetch on intent at the router level** — `defaultPreload: "intent"`, or per-`<Link>` where you need finer control — not scattered manual `prefetchQuery` calls in components.

8. **Keep route files thin.** A route file wires path + search schema + loader + component choice. Heavy logic, large components, and derived state belong in `features/`, per `enforce-code-quality`'s one-file-one-job rule.

## Review checklist

Flag: `useEffect` fetching a route's initial data; `queryOptions` constructed separately in the loader and the component; missing `loaderDeps` on a search-dependent query; raw string search-param access instead of `validateSearch`; hand-built path strings instead of typed `<Link>`/`navigate`; missing error boundaries on independently failing sections; and route files that have grown from wiring into real feature logic.

## Done when

Routes are file-based; every search param that affects fetching is in `loaderDeps`; query options exist in exactly one place per route; search params are schema-validated; navigation is typed; sections fail independently; and route files still only wire things together.
