# Cibi Skills

Personal agent skills. **No publish step** — improve in git, push `main`.

## Always start here

Send **`skill-master/SKILL.md`** on every agent run.

`skill-master` runs a **balance loop**:

1. DETECT stack (once)
2. ALWAYS load `enforce-code-quality` + `enforce-typescript-strict`
3. ROUTE only skills the project **uses** and the task **touches**
4. APPLY
5. CHECK → loop until balanced

Never load a skill for a library not in the project.

## Naming (agent-friendly)

| Prefix | Meaning |
|---|---|
| `skill-` | Entry / orchestration |
| `route-` | Router — pick leaves only |
| `enforce-` | Always-on rules |
| `apply-` | Apply a pattern while coding |
| `use-` | Library how-to |
| `design-` | Structure / layering |
| `audit-` | Review / eliminate anti-patterns |
| `test-` / `document-` / `convert-` / `read-` | Task verbs |

Folder name = frontmatter `name` = path agents load.

## Layout

```
skill-master/                      # entry — always send this
skills/
  engineering/
    enforce-code-quality/          # always-on
    enforce-typescript-strict/     # always-on
    route-react-async-ui/          # ROUTER → apply-react-* leaves
    route-tanstack/                # ROUTER → use-tanstack-* leaves
    route-backend/                 # ROUTER → design/apply/document/test leaves
    …leaf skills…
  productivity/
    read-research-paper/
```

### Routers (token efficiency)

| Router | Leaves |
|---|---|
| `route-react-async-ui` | `apply-react-transitions`, `apply-react-optimistic`, `apply-react-suspense` (+ `audit-react-effects` if effects) |
| `route-tanstack` | `use-tanstack-query`, `use-tanstack-router`, `use-tanstack-form`, `use-tanstack-table` |
| `route-backend` | `design-backend-architecture`, `apply-structured-logging`, `document-openapi`, `test-backend` |

Fat skills disclose detail beside `SKILL.md` (e.g. `use-tanstack-query/core.md`). Open disclosed files **only** for the active branch.

## Maintain / improve

```
use skill on real work
  → note miss / rush / bloat
  → fix description or step / Done when
  → prune no-ops
  → commit + push main
```

Commit per skill change. No docs site, no plugin.

## Skill index

| Skill | Role |
|---|---|
| `skill-master` | Entry + balance loop |
| `enforce-code-quality` | Always-on quality |
| `enforce-typescript-strict` | Always-on TS |
| `route-react-async-ui` | Async UI router |
| `apply-react-transitions` | useTransition / useActionState |
| `apply-react-optimistic` | Optimistic updates |
| `apply-react-suspense` | Suspense / use / deferred |
| `audit-react-effects` | Kill bad useEffect |
| `route-tanstack` | TanStack router |
| `use-tanstack-query` | Server state |
| `use-tanstack-router` | File routes + loaders |
| `use-tanstack-form` | Forms |
| `use-tanstack-table` | Tables |
| `use-zustand` | Client state |
| `design-frontend-architecture` | FE folders |
| `route-backend` | Backend router |
| `design-backend-architecture` | BE layering |
| `apply-structured-logging` | Logs |
| `document-openapi` | OpenAPI |
| `test-backend` | Vitest |
| `apply-toasts` | Toasts |
| `apply-native-feel-nav` | Native-feel nav |
| `convert-nextjs-react` | Next ↔ React |
| `use-nub-vite` | Toolchain |
| `read-research-paper` | Papers |
