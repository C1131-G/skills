---
name: enforce-typescript-strict
description: Always-on TypeScript — no any/as/enum/!, undefined over null, end-to-end inference. Called by skill-master on every TS task.
disable-model-invocation: true
---

# enforce-typescript-strict

Apply to all TypeScript written or reviewed.

## Rules

1. **No `any`** — use `unknown` + narrow.
2. **No `as`** — restructure so the checker infers (guards, generics, signatures).
3. **No `enum`** — `const` object + `as const` + derived union, or string unions.
4. **Prefer inference** over hand-written parallel types.
5. **Shared type only when inference cannot reach** — one declaration, infer downstream.
6. **No non-null `!`** — guards, `?.`, `??`.
7. **Discriminated unions** for variant/state data.
8. **`satisfies`** for config objects (check + narrow literals).
9. **`import type` / `export type`** for type-only imports.
10. **Schema validation at runtime boundaries** — infer types from the schema.
11. **No `namespace`** — ES modules.
12. **No `null` in our code** — use `undefined`. Match third-party boundaries that require `null`.
13. **One source of truth per shape** — prefer DB/schema → API → query → UI inference chain; do not re-declare the same shape each layer.

## Compiler

Flag missing `"strict": true`. Prefer also: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.

## Done when

No banned escapes in the change; new server-backed data reuses upstream types when possible.
