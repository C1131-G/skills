---
name: document-openapi
description: Document HTTP APIs with OpenAPI 3.1 generated from code. Use for schemas, operations, examples, error responses, API explorers, and startup documentation links.
---
# document-openapi

Use this skill directly for API documentation. Pair it with `design-backend-architecture` so documentation generation stays aligned with routes, validation, and handlers.

Also apply `enforce-code-quality` and, for TypeScript code, `enforce-typescript-strict` to files in scope.

Apply these rules whenever documenting an HTTP API, regardless of language or framework. "Swagger" here refers to the OpenAPI ecosystem in general (tooling like Swagger UI); the specification itself is called OpenAPI.

1. **Use OpenAPI 3.1, not 3.0 or Swagger 2.0, for any new API.** 3.1 is fully aligned with JSON Schema, which removes the small but constant mismatches 3.0 had between its schema dialect and standard JSON Schema tooling. Only stay on 3.0 if a specific tool in the pipeline (SDK generator, gateway) doesn't yet support 3.1 — check before assuming that's the case.

2. **Generate the spec from the code/types, don't hand-maintain a separate YAML/JSON file.** A hand-written spec drifts from the real implementation the moment someone changes a route and forgets to update the doc. Use whatever mechanism the language/framework provides to derive the spec from actual route definitions, request/response types, or validation schemas (e.g. deriving from Zod/Pydantic/annotations rather than duplicating those shapes in a separate file).

3. **Every reusable shape goes in `components/schemas` and is referenced with `$ref`, never inlined twice.** If the same object shape (e.g. a `User` or an error envelope) appears in more than one response or request body, it must be defined once and referenced — inlining it repeatedly means every future change has to happen in multiple places and will eventually go out of sync.

4. **Give every operation a short, human-readable `operationId`.** Some frameworks auto-generate long, mechanical IDs (e.g. `App_Controllers_UserController_getUser`) — override these to something like `getUser`. `operationId` becomes the method name in generated SDKs, so an ugly ID here produces an ugly public API surface.

5. **Document every response status code an endpoint can actually return, including errors** — not just the success case. Each documented error response should show its actual shape (reference the shared error schema from rule 3), not just a status code with no body description.

6. **Add real examples, not placeholder values.** `example: "string"` or `example: 123` tells a reader nothing. Use realistic example values that show the actual shape and meaning of the data (an example UUID, a plausible date, a real-looking name) — examples are what a developer actually reads first, before the schema.

7. **Write a `description` for every schema, property, and operation** — not just a `title`/name. Explain purpose, constraints, and any non-obvious behavior (e.g. "read-only, set by the server" on an `id` field, or "nullable until the user completes verification" on a status field).

8. **Document authentication explicitly via `securitySchemes`**, applied globally or per-operation as appropriate — never leave callers to infer how to authenticate from example headers buried in a description.

9. **Version the API explicitly, and reflect that version in the spec.** Whether versioning is done via URL path (`/v1/...`), a header, or content negotiation, the chosen scheme should be consistent across every endpoint and visible in the spec's `info.version` and server URLs — don't mix strategies across different parts of the same API.

10. **Never expose interactive "try it out" documentation (Swagger UI or equivalent) unauthenticated in production** if the API itself requires auth or handles sensitive data. Either gate the docs UI behind the same auth as the API, restrict it to internal/staging environments, or serve a read-only rendered version (e.g. Redoc) in production instead of an interactive console that can fire real requests.

11. **Validate the generated spec in CI**, not just visually. Lint it against the OpenAPI schema itself (structural validity) and, where possible, against your own naming/style conventions — catching a broken or drifted spec at merge time is far cheaper than catching it when a consumer's SDK generation breaks.

12. **Treat the spec as a contract for SDK generation and machine consumption, not only for human reading.** Structured, consistent schemas and accurate types are what let client SDKs and AI coding tools generate correct integration code — a technically-valid-but-loose spec (vague types, missing required fields) produces incorrect generated code downstream.

13. **On server startup, log the two links a developer needs to actually use the API docs** — the web URL for the browsable docs (Swagger UI/Redoc) and the link for the API test collection (e.g. a Postman collection import URL). Log both once the server is ready to accept requests, so whoever started it can click straight through instead of hunting for the right port/path.

    ```ts
    logger.info({ url: `http://localhost:${port}/docs` }, "API docs (web)");
    logger.info({ url: postmanCollectionUrl }, "Postman collection");
    ```

    Only log these in non-production environments (local/dev/staging) unless the docs and test collection are intentionally public — don't print internal tooling links in production logs by default.

## Applying these rules

- **Setting up API docs for the first time**: check what the project's existing stack can generate a spec from natively (validation library, RPC layer, route definitions) before reaching for a separate hand-maintained spec file.
- **Reviewing existing API docs**: flag hand-duplicated schemas, missing error responses, placeholder examples, and any interactive docs UI exposed without auth in production.

