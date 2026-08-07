# Engineering

Daily code skills. Install via `npx skills@latest add C1131-G/skills`.

## Run

| Invoke | Mode | Edits |
|---|---|---|
| `skill-master` or `<main>` | **audit** | No — report only |
| `skill-master:check` or `<main>:check` | **check** | Yes — fix |
| `skill-master:write` or `<main>:write` | **write** | Yes — implement |

**Only mains are invokable.** Leaves run only under their router.

## Entry

- **[skill-master](./skill-master/SKILL.md)** — always first  
  - bare → full-stack **audit report**  
  - `:check` → fix project to skills  
  - `:write` → implement; NEED = message + change (mains only)

## Routers (main — invoke the router, not leaves)

| Router | Leaves (internal) |
|---|---|
| **[route-react-async-ui](./route-react-async-ui/SKILL.md)** | apply-react-transitions, apply-react-optimistic, apply-react-suspense |
| **[route-tanstack](./route-tanstack/SKILL.md)** | use-tanstack-query, use-tanstack-router, use-tanstack-form, use-tanstack-table |
| **[route-backend](./route-backend/SKILL.md)** | design-backend-architecture, apply-structured-logging, document-openapi, test-backend |

Example: `route-react-async-ui:write` — **not** `apply-react-suspense:write` as a top-level run.

## Always-on (main)

- **[enforce-code-quality](./enforce-code-quality/SKILL.md)**
- **[enforce-typescript-strict](./enforce-typescript-strict/SKILL.md)**

## Other mains

- **[design-frontend-architecture](./design-frontend-architecture/SKILL.md)**
- **[audit-react-effects](./audit-react-effects/SKILL.md)**
- **[apply-toasts](./apply-toasts/SKILL.md)**
- **[apply-native-feel-nav](./apply-native-feel-nav/SKILL.md)**
- **[apply-next-shell-nav](./apply-next-shell-nav/SKILL.md)**
- **[use-zustand](./use-zustand/SKILL.md)**
- **[use-nub-vite](./use-nub-vite/SKILL.md)**
- **[convert-nextjs-react](./convert-nextjs-react/SKILL.md)**

## Leaves (not invokable as main)

Listed only under routers above. Frontmatter: `role: leaf` + `parent: route-…`.

See root [README](../../README.md) for full index and interconnect map.
