# Cibi Skills

Personal agent skills from **my own knowledge and daily workout** — stack-aware, token-efficient, composable patterns I actually use when building.

Install with the open [skills.sh](https://skills.sh) CLI. Pick skills and target agents; files land in your project or global agent dirs.

## Disclaimer

> **This is my personal knowledge and practice — not official docs, not a product, not professional advice.**

These skills capture how *I* work: what I learned, tested, and refine over real projects. They may be incomplete, outdated for your stack, or simply **wrong for your context**.

- Treat every skill as **opinionated guidance**, not absolute truth.
- Always verify against current library docs, your team’s standards, and your project’s needs.
- Agents can still produce bad code even when a skill is loaded — **you** own the result.
- No warranty of any kind. Use at your own risk.

**If something is wrong, unclear, or outdated:** open a [GitHub Issue](https://github.com/C1131-G/skills/issues) or PR.

## Installation (30-second setup)

Requires [Node.js](https://nodejs.org/) (`npx` ships with it).

```bash
npx skills@latest add C1131-G/skills
```

**Recommended:** install **all** skills (or at least `skill-master` + always-on + routers). Routers only work if their leaf files are installed too.

```bash
# All skills → all detected agents
npx skills@latest add C1131-G/skills --all

# All skills → specific agents
npx skills@latest add C1131-G/skills --skill '*' -a claude-code -a cursor -a grok -y

# Global (every project)
npx skills@latest add C1131-G/skills --skill '*' -g -y
```

```bash
npx skills@latest add C1131-G/skills --list
npx skills update
```

---

## How to run (read this)

### Three modes (every **main** skill)

| Invoke | Mode | Edits? | What happens |
|---|---|---|---|
| `skill-name` | **audit** | **No** | Scan rules → **report only** (findings, paths, severity) |
| `skill-name:check` | **check** | Yes | Audit + **fix** so code matches rules |
| `skill-name:write` | **write** | Yes | Implement the task following the skill(s) |

Bare name is **never** write. Bare = **audit report only**.

### Main vs leaf

| Kind | Examples | You invoke? |
|---|---|---|
| **Entry** | `skill-master` | Yes — full package run |
| **Router** | `route-react-async-ui`, `route-tanstack`, `route-backend` | Yes — only the router name |
| **Always** | `enforce-code-quality`, `enforce-typescript-strict` | Yes (solo or via master) |
| **Main** | `apply-next-shell-nav`, `use-zustand`, `audit-react-effects`, … | Yes |
| **Leaf** | `apply-react-suspense`, `use-tanstack-query`, `test-backend`, … | **No** |

**Leaves are not mains.** Example: do **not** run `apply-react-suspense:write` as a top-level skill. Run:

```text
route-react-async-ui:write
```

The router Decision-loads only the leaves it needs. If you name a leaf by mistake, the agent **redirects to the parent router** with the same mode and selects that leaf only — the report still shows the **router** as the main run.

### skill-master

| Invoke | Behavior |
|---|---|
| `skill-master` | **audit** all stack-unlocked mains → report only |
| `skill-master:check` | audit + **fix** whole project against unlocked mains |
| `skill-master:write` | implement task; NEED = message ∪ change ∩ stack (**mains only**) |

Every run still: **understand → packages → mode → NEED mains → file map → rule-by-rule → COMPACT**.

### Solo main examples

```text
route-react-async-ui          # audit async UI family
route-react-async-ui:check    # fix async UI family
route-react-async-ui:write    # implement under Decision leaves

route-tanstack:write
route-backend:check
enforce-typescript-strict     # audit TS rules only (report)
apply-next-shell-nav:write
```

### Interconnect

```
skill-master
  ├─ ALWAYS: enforce-code-quality, enforce-typescript-strict
  ├─ route-react-async-ui
  │    ├─ leaf apply-react-transitions
  │    ├─ leaf apply-react-optimistic
  │    └─ leaf apply-react-suspense
  │    pairs → apply-native-feel-nav, apply-next-shell-nav, audit-react-effects
  ├─ route-tanstack
  │    ├─ leaf use-tanstack-query
  │    ├─ leaf use-tanstack-router
  │    ├─ leaf use-tanstack-form
  │    └─ leaf use-tanstack-table
  │    pairs → route-react-async-ui, use-zustand, audit-react-effects
  ├─ route-backend
  │    ├─ leaf design-backend-architecture
  │    ├─ leaf apply-structured-logging
  │    ├─ leaf document-openapi
  │    └─ leaf test-backend
  └─ mains: design-frontend-architecture, use-zustand, apply-toasts, …
```

---

## Naming

| Prefix | Meaning |
|---|---|
| `skill-` | Entry / orchestration |
| `route-` | **Main router** — only invokable face of a family |
| `enforce-` | Always-on main |
| `apply-` / `use-` / `design-` / `audit-` / … | Main **or** leaf (see role in frontmatter) |

| Suffix | Meaning |
|---|---|
| *(none)* | **audit** — report only |
| `:check` | Fix to match rules |
| `:write` | Implement following rules |

Frontmatter `role:` is `entry` | `router` | `always` | `main` | `leaf`. Leaves also set `parent:`.

---

## Layout

```
skills/
  engineering/
    skill-master/                 # entry
    enforce-*/                    # always mains
    route-*/                      # router mains
    apply-react-*/                # leaves of route-react-async-ui
    use-tanstack-*/               # leaves of route-tanstack
    design-backend-*, document-*, test-backend, apply-structured-logging  # leaves of route-backend
    …other mains…
  productivity/
    read-research-paper/          # main
```

---

## Skill index

### Entry / routers / always (invoke these)

| Skill | Role |
|---|---|
| `skill-master` | Entry — audit / `:check` / `:write` |
| `route-react-async-ui` | Router → transitions, optimistic, suspense |
| `route-tanstack` | Router → query, router, form, table |
| `route-backend` | Router → design, logging, openapi, test |
| `enforce-code-quality` | Always-on quality |
| `enforce-typescript-strict` | Always-on TS |

### Other mains (invoke these)

| Skill | Role |
|---|---|
| `design-frontend-architecture` | FE folders |
| `audit-react-effects` | Kill bad useEffect |
| `apply-toasts` | Toasts |
| `apply-native-feel-nav` | Native-feel nav |
| `apply-next-shell-nav` | Next shell + nested sidebar |
| `use-zustand` | Client state |
| `use-nub-vite` | Toolchain |
| `convert-nextjs-react` | Next ↔ React |
| `read-research-paper` | Papers |

### Leaves (do **not** invoke as main — parent only)

| Parent | Leaves |
|---|---|
| `route-react-async-ui` | `apply-react-transitions`, `apply-react-optimistic`, `apply-react-suspense` |
| `route-tanstack` | `use-tanstack-query`, `use-tanstack-router`, `use-tanstack-form`, `use-tanstack-table` |
| `route-backend` | `design-backend-architecture`, `apply-structured-logging`, `document-openapi`, `test-backend` |

---

## Maintain / improve

```
use skill on real work
  → note miss / rush / bloat
  → fix description or step / Done when
  → prune no-ops
  → commit + push main
```

```bash
npx skills@latest add C1131-G/skills
```
