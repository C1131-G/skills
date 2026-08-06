# Cibi Skills

Agent skills for real engineering — stack-aware, token-efficient, composable.

[![skills.sh](https://skills.sh/b/C1131-G/skills)](https://skills.sh/C1131-G/skills)

Install with the open [skills.sh](https://skills.sh) CLI (same flow as [mattpocock/skills](https://github.com/mattpocock/skills)). Pick skills and target agents; files land in your project or global agent dirs.

## Installation (30-second setup)

Requires [Node.js](https://nodejs.org/) (`npx` ships with it).

### Install

```bash
npx skills@latest add C1131-G/skills
```

Pick the skills you want and which coding agents to install them on.

**Recommended:** install **all** skills (or at least `skill-master` + always-on + routers you use). Routers only work if their leaf skills are installed too.

### Non-interactive / CI

```bash
# All skills → all detected agents
npx skills@latest add C1131-G/skills --all

# All skills → specific agents
npx skills@latest add C1131-G/skills --skill '*' -a claude-code -a cursor -a grok -y

# Global (every project)
npx skills@latest add C1131-G/skills --skill '*' -g -y
```

### List without installing

```bash
npx skills@latest add C1131-G/skills --list
```

### Update later

```bash
npx skills update
# or one skill:
npx skills update skill-master
```

### Local path (offline / fork)

```bash
npx skills@latest add ./path-to-this-repo --skill '*' -y
```

## After install

1. **Every agent run** — send / invoke **`skill-master`** first.
2. `skill-master` runs the balance loop: DETECT stack → ALWAYS load quality + TS → ROUTE only used skills → APPLY → CHECK until balanced.
3. Never load a skill for a library not in the project.

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
skills/
  engineering/
    skill-master/                  # entry — always send this
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

## Maintain / improve

```
use skill on real work
  → note miss / rush / bloat
  → fix description or step / Done when
  → prune no-ops
  → commit + push main
```

Commit per skill change. No docs site required — install is always:

```bash
npx skills@latest add C1131-G/skills
```
