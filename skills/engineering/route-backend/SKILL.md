---
name: route-backend
role: router
description: >
  MAIN router for backend. Invoke this skill only (not its leaves).
  Modes: bare=audit report, :check=fix, :write=implement. Decision-loads
  design-backend-architecture | apply-structured-logging | document-openapi | test-backend.
disable-model-invocation: true
---

# route-backend

**Main skill.** User invokes **this** name. Leaves are **not** mains.

| Invoke | Mode |
|---|---|
| `route-backend` | audit — report only |
| `route-backend:check` | audit + fix |
| `route-backend:write` | implement under Decision leaves |

If the user names a leaf (`document-openapi`, `test-backend`, …), **redirect here** with the same mode and Decision-select that leaf only.

On write/check: apply ALWAYS in scope. Do not load this router for pure frontend tasks.

## Leaves (internal only)

| Leaf | Load when |
|---|---|
| `../design-backend-architecture/SKILL.md` | Folders, routes→controller→service→repository, middleware, production checklist |
| `../apply-structured-logging/SKILL.md` | Pino / structured logs, levels, request IDs |
| `../document-openapi/SKILL.md` | OpenAPI 3.1, spec from code, startup links |
| `../test-backend/SKILL.md` | Vitest, pyramid, DB isolation, AAA |

Load **only** Decision-matched leaves. One at a time → COMPACT between leaves.

## Decision

| Task | Leaf |
|---|---|
| Folder structure, layering, middleware order | design-backend-architecture |
| Structured logs, request context | apply-structured-logging |
| OpenAPI / API docs | document-openapi |
| Backend tests | test-backend |

## Connections

| Pair | Rule |
|---|---|
| architecture + logging | Request ID + structured logger are production essentials |
| architecture + openapi | Startup surfaces API docs; handlers stay thin |
| architecture + testing | Test at seams: unit services, HTTP contract, real DB for repositories |
| all + ALWAYS | `enforce-code-quality` / `enforce-typescript-strict` still apply |

## Mode behavior

| Mode | Action |
|---|---|
| audit | Scan selected leaves → report; no edits |
| check | Fix leaf rules + gate |
| write | Implement under selected leaves + gate |

## Done when

Selected leaves applied under this main; no backend skill for pure FE; leaves not top-level in the user report.
