---
name: enforce-typescript-strict
description: Enforce strict TypeScript with unknown at boundaries, no unsafe assertions or enums, strong inference, exhaustive unions, and runtime validation of external data.
---

# enforce-typescript-strict

Use this skill directly whenever TypeScript is written or reviewed. Pair it with the domain skill for the code being changed.

Also apply `enforce-code-quality` to every file in scope, including the verification contract after code changes.

Apply to all TypeScript written or reviewed.

Type safety models the program; it does **not** make external data safe. Compile-time correctness and runtime validation are both required.

## Rules

1. **`unknown` over `any`** — narrow before use (typeof, guards, predicates). `any` erases the checker and leaks.
2. **No `as`** — restructure so the checker infers (guards, generics, signatures). Use **`satisfies`** to check a shape while keeping the inferred (literal) type. Reserve `as` only when the compiler genuinely cannot know (rare interop).
3. **No `enum`** — `as const` object or string array + derived union (`typeof x[number]` / `typeof obj[keyof typeof obj]`). Literal unions serialize and refactor more cleanly.
4. **Prefer inference** — skip redundant annotations that widen (`const name: string = "Ada"`). Annotate parameters/returns where inference cannot reach or the public contract must stay fixed.
5. **One source of truth** — derive types from values (`as const` + `typeof`) or from schemas; do not re-declare the same shape each layer. Prefer DB/schema → API → query → UI inference chain.
6. **Transform, don't duplicate** — `Pick` / `Omit` / `Partial` / `Required` / indexed access / mapped types when a shape is a view of another.
7. **No non-null `!`** — guards, `?.`, `??`.
8. **Discriminated unions** for variant/state data so invalid combinations cannot exist (not optional-property blobs).
9. **Exhaustive `never`** — every switch/if-chain over a union ends with `const _exhaustive: never = value` (or equivalent) so new variants fail compile until handled.
10. **Type predicates** for reusable narrowing: `function isUser(v: unknown): v is User`. Prefer at API/form/JSON boundaries.
11. **`satisfies` + `as const`** for config, routes, theme, and constant maps — validate against a type and keep literal inference.
12. **Inferable generics** — APIs take a value/schema and infer `T`; callers should not need `fn<User>()`. Schema-in → type-out is the default pattern.
13. **Runtime validation at trust boundaries** — every API response, form body, env var, JSON file, and user input is untrusted. Parse with a schema (e.g. Zod); **infer types from the schema** — never `as User` on `response.json()`.
14. **Template literal types** where string structure is load-bearing (routes, event names, query keys, CSS tokens): `` type Route = `/api/${string}` ``.
15. **`import type` / `export type`** for type-only imports.
16. **No `namespace`** — ES modules.
17. **No `null` in our code** — use `undefined`. Match third-party boundaries that require `null`.

## Compiler

Require `"strict": true`. Prefer also:

- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`
- `useUnknownInCatchVariables`

Flag missing `strict` when reviewing `tsconfig`.

## Done when

No banned escapes in scope; unions are exhaustive; external data is schema-validated; new server-backed data reuses upstream types when possible. Process rules **1 → N** with a lint/typecheck/build gate between rules when making broad corrections.
