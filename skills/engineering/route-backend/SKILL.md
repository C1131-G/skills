---
name: route-backend
description: >
  Backend router skill. Routes to design-backend-architecture, apply-structured-logging,
  document-openapi, test-backend. Only load leaves the task needs. Called by skill-master.
disable-model-invocation: true
---

# route-backend

Load **only** the sub-skills the task needs.

## Decision

| Task | Read |
|---|---|
| Folder structure, routes→controller→service→repository, middleware order, production checklist | `../design-backend-architecture/SKILL.md` |
| Pino / structured logs, levels, request IDs | `../apply-structured-logging/SKILL.md` |
| OpenAPI 3.1, spec from code, startup links | `../document-openapi/SKILL.md` |
| Vitest, pyramid, DB isolation, AAA | `../test-backend/SKILL.md` |

## Connections

| Pair | Rule |
|---|---|
| architecture + logging | Request ID + structured logger are production essentials |
| architecture + openapi | Startup surfaces API docs; handlers stay thin |
| architecture + testing | Test at seams: unit services, HTTP contract, real DB for repositories |
| all + `enforce-code-quality` / `enforce-typescript-strict` | Always-on still applies |

## Done when

Selected leaves applied; no backend skill loaded for pure frontend tasks.
