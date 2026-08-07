---
name: design-backend-architecture
role: leaf
parent: route-backend
description: LEAF of route-backend — not a main skill. Feature modules, routes→controller→service→repository.
disable-model-invocation: true
---
# design-backend-architecture

**Leaf — not main.** Parent: `route-backend`. If invoked alone, load parent with the same mode and Decision-select this leaf only. Do not report this name as a top-level run.

Apply these rules whenever designing or reviewing the folder structure and request flow of a backend/API service, regardless of framework (Express, Hono, Fastify, NestJS, etc.) or database layer.

## 1. Organize by feature, not by layer, at the top level

Don't make `routes/`, `controllers/`, `services/` top-level folders. That structure means adding *one* feature touches four different top-level folders, which gets painful to navigate past a small number of features.

Instead, group everything about one feature together in its own module:

```
src/
├── index.ts                  # entrypoint: create server, listen, graceful shutdown
├── app.ts                     # framework app instance, middleware wiring, route mounting
│
├── config/
│   ├── env.ts                  # schema-validated env vars, crash-fast if invalid
│   └── db.ts                   # DB client singleton
│
├── modules/                   # feature-based
│   ├── user/
│   │   ├── user.routes.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.schema.ts        # request/response validation schemas
│   │   └── user.repository.ts    # DB queries only
│   └── order/
│       └── ...same pattern
│
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts       # centralized error handler, last in chain
│   └── validate.middleware.ts
│
├── db/
│   ├── schema/                   # table/column definitions
│   └── migrations/
│
├── lib/
│   ├── logger.ts
│   └── app-error.ts              # custom error class
│
└── types/
```

Why this is worth the reorganization: everything about one feature lives in one place, so it's easier to reason about in isolation, easier to onboard someone to a single feature, and easy to delete cleanly if a feature gets cut (delete one folder, done).

## 2. Enforce a strict one-direction request flow

No skipping layers, no calling backwards up the chain:

```
Client Request
      │
      ▼
   routes         HTTP method + path → controller, per-route middleware
      │
      ▼
 controller       parse request, call service, shape response — NO business logic
      │
      ▼
  service         all business logic — framework-agnostic, no req/res access
      │
      ▼
 repository       DB queries only — nothing else
      │
      ▼
   Database
```

| Layer | Responsibility | Must NOT do |
|---|---|---|
| **routes** | Wire path + method to controller, attach middleware | Business logic, validation logic |
| **controller** | Parse request, call service, format response, pass errors to the error handler | Talk to the DB directly, hold business rules |
| **service** | Business rules, orchestration across repositories | Know about the request/response objects or the framework at all |
| **repository** | Typed DB queries, nothing else | Business logic, validation |

A service that imports the framework's request/response types, or a controller that calls the DB directly, is a sign the layers have blurred and should be split back apart.

## 3. Centralize error handling — one handler, not scattered `try/catch` responses

```
Controller throws / passes error along
      │
      ▼
Central error handler (registered last in the middleware/handler chain)
      │
      ├── known application error → respond with its status + a consistent error shape
      └── unknown/unexpected error → log it, respond with a generic 500
```

One centralized handler shapes **every** error response. Don't scatter `res.status(500).json(...)`-style calls across individual controllers — that's how error response shapes drift and become inconsistent across endpoints.

## 4. Fixed, deliberate middleware/request-processing order

Order matters and should be explicit and documented in the app's entrypoint, typically:

1. Security headers
2. CORS (explicit origin allow-list, never wildcard for an authenticated API)
3. Body parsing, with a size limit
4. Request logging (with a request ID attached — see the logging rules for details)
5. Rate limiting
6. Route mounting
7. Centralized error handler — **must be registered last**

## 5. Production essentials checklist

| Concern | Where it lives |
|---|---|
| Env validation | A dedicated config module, schema-validated, crash on boot if invalid |
| Graceful shutdown | Entrypoint handles termination signals, closes the DB pool, drains in-flight requests before exiting |
| Request logging | Structured, with a request ID propagated through the request (see `apply-structured-logging`) |
| Security headers | Set via the framework's security-headers middleware/equivalent |
| CORS | Explicit allow-list, never `*`, for any API that isn't fully public |
| Body size limits | Set explicitly, don't rely on framework defaults |
| Rate limiting | Backed by a shared store (e.g. Redis) if running more than one instance, not in-memory |
| Health check endpoint | Verifies real dependencies (e.g. DB connectivity), not just "process is running" |
| Migrations | Run explicitly as a CI/deploy step — never auto-sync/push schema changes directly against production |

## Applying these rules

- **New backend project**: set up the module/folder structure and layer boundaries from the start, before writing feature code.
- **Existing project**: don't force a full restructure uninvited. If asked to add a feature, follow the existing structure's conventions if it already has one; if the project has no clear structure yet, propose this one rather than adding another ad-hoc pattern.
- **Reviewing code**: flag layer violations (business logic in a controller, DB access in a service, framework types leaking into a service), error responses built ad hoc outside the central handler, and any of the production-essentials items that are missing.

