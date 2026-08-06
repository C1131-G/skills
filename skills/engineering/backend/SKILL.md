---
name: backend
description: Backend router. Routes to architecture, logging, OpenAPI, testing. Only load leaves the task needs. Called by master.
disable-model-invocation: true
---

# Backend — Router

Load **only** the sub-skills the task needs.

## Decision

| Task | Read |
|---|---|
| Folder structure, routes→controller→service→repository, middleware order, production checklist | `../backend-architecture/SKILL.md` |
| Pino / structured logs, levels, request IDs | `../structured-logging/SKILL.md` |
| OpenAPI 3.1, spec from code, startup links | `../openapi-documentation/SKILL.md` |
| Vitest, pyramid, DB isolation, AAA | `../backend-testing/SKILL.md` |

## Connections

| Pair | Rule |
|---|---|
| architecture + logging | Request ID + structured logger are production essentials |
| architecture + openapi | Startup surfaces API docs; handlers stay thin |
| architecture + testing | Test at seams: unit services, HTTP contract, real DB for repositories |
| all + `code-quality` / `typescript-strict-typing` | Always-on still applies |

## Done when

Selected leaves applied; no backend skill loaded for pure frontend tasks.
