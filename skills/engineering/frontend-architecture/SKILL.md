---
name: frontend-architecture
description: Feature-based React folder structure. Called by master when setting up or reviewing frontend layout.
disable-model-invocation: true
---
# React Frontend Architecture

Apply these rules whenever setting up or reviewing a React frontend's folder structure, regardless of which router the project uses. Mirrors `backend-architecture.md`'s approach — folder structure first, then the rules that keep it clean.

## Folder Structure

```
src/
├── main.tsx                     # entrypoint: router/provider setup, render
│
├── routes/ (or pages/, app/)     # routing layer — thin, wiring only
│   └── ...                         # structure depends on the router in use
│
├── features/                     # feature-based, not layer-based at top level
│   ├── users/
│   │   ├── components/               # UI specific to this feature
│   │   ├── users.queries.ts            # data-fetching definitions
│   │   ├── users.api.ts                 # fetch functions
│   │   └── users.schema.ts               # validation schemas (forms, params)
│   └── orders/
│       └── ...same pattern
│
├── components/
│   └── ui/                         # shared, feature-agnostic components (buttons, inputs)
│
├── stores/
│   └── ui.store.ts                  # client-only UI state (e.g. Zustand)
│
├── lib/
│   ├── query-client.ts               # data-fetching client instance + defaults
│   └── env.ts                        # validated client env vars
│
└── types/
```

## Why feature-based, not layer-based, inside `features/`

Same reasoning as the backend: a top-level split into `components/`, `hooks/`, `api/` means adding one feature touches folders scattered across the whole tree. Grouping a feature's queries, API calls, and its own components together keeps everything about that feature in one place — easier to reason about, easier to onboard someone to a single feature, easy to delete cleanly.

`routes/` (or your router's equivalent) stays separate from `features/` on purpose: routes are wiring (which path, which loader/data dependency, which component to render), not where the feature's actual logic lives.

## Layer responsibilities

| Layer | Responsibility | Must NOT do |
|---|---|---|
| **routing layer** | Path matching, wiring a URL to a component and its data dependency | Business logic, defining the fetch itself |
| **feature (queries/api/schema)** | Data-fetching definitions, mutation functions, feature-specific validation schemas | Know about routing or which route uses it |
| **components (feature-local)** | Feature-specific UI | Cross-feature reuse — promote to `components/ui/` if it's needed elsewhere |
| **components/ui** | Shared, feature-agnostic UI primitives | Feature-specific logic or data fetching |
| **stores** | Client-only UI state | Server data — that belongs in the data-fetching layer, not duplicated into a store |

## Applying these rules

- **New project**: set up this folder structure before writing feature code, so nothing gets scattered ad hoc as the project grows.
- **New feature**: create its folder under `features/` following the established pattern before writing any component for it.
- **Reviewing existing code**: flag business logic or data-fetching code living inside the routing layer instead of `features/`, feature-specific components misplaced in `components/ui/`, server data duplicated into a client-state store instead of the data-fetching layer, and files that have grown past a single, clear responsibility (see `code-quality`).

