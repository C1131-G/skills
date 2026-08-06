# Cibi Skills

Personal agent skills. **No publish step** — improve in git, push `main`.

## Always start here

Send **`master/SKILL.md`** on every agent run.

`master` runs a **balance loop**:

1. DETECT stack (once)
2. ALWAYS load `code-quality` + `typescript-strict-typing`
3. ROUTE only skills the project **uses** and the task **touches**
4. APPLY
5. CHECK → loop until balanced

Never load a skill for a library not in the project.

## Layout (Matt-style)

```
master/                         # entry — always send this
skills/
  engineering/                  # code work
    code-quality/               # always-on
    typescript-strict-typing/   # always-on
    react-async-ui/             # ROUTER → transitions | optimistic | suspense
    tanstack/                   # ROUTER → query | router | form | table
    backend/                    # ROUTER → architecture | logging | openapi | testing
    …leaf skills…
  productivity/
    research-paper-reading/
```

### Routers (token efficiency)

| Router | Leaves |
|---|---|
| `react-async-ui` | `react-transitions`, `react-optimistic`, `react-suspense` (+ `react-effect-audit` if effects) |
| `tanstack` | `tanstack-query`, `tanstack-router`, `tanstack-form`, `tanstack-table` |
| `backend` | `backend-architecture`, `structured-logging`, `openapi-documentation`, `backend-testing` |

Fat skills disclose detail beside `SKILL.md` (e.g. `tanstack-query/core.md`). Open disclosed files **only** for the active branch.

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
| `master` | Entry + balance loop |
| `code-quality` | Always-on quality |
| `typescript-strict-typing` | Always-on TS |
| `react-async-ui` | Async UI router |
| `react-transitions` | useTransition / useActionState |
| `react-optimistic` | Optimistic updates |
| `react-suspense` | Suspense / use / deferred |
| `react-effect-audit` | Kill bad useEffect |
| `tanstack` | TanStack router |
| `tanstack-query` | Server state |
| `tanstack-router` | File routes + loaders |
| `tanstack-form` | Forms |
| `tanstack-table` | Tables |
| `zustand-state` | Client state |
| `frontend-architecture` | FE folders |
| `backend` | Backend router |
| `backend-architecture` | BE layering |
| `structured-logging` | Logs |
| `openapi-documentation` | OpenAPI |
| `backend-testing` | Vitest |
| `toast-notifications` | Toasts |
| `native-feel-navigation` | Native-feel nav |
| `nextjs-react-conversion` | Next ↔ React |
| `nub-vite-plus` | Toolchain |
| `research-paper-reading` | Papers |
