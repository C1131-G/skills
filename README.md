# Cibi Skills

Personal agent skills from **my own knowledge and daily workout** — stack-aware, token-efficient, composable patterns I actually use when building.

[![skills.sh](https://skills.sh/b/C1131-G/skills)](https://skills.sh/C1131-G/skills)

Install with the open [skills.sh](https://skills.sh) CLI. Pick skills and target agents; files land in your project or global agent dirs.

## Disclaimer

> **This is my personal knowledge and practice — not official docs, not a product, not professional advice.**

These skills capture how *I* work: what I learned, tested, and refine over real projects. They may be incomplete, outdated for your stack, or simply **wrong for your context**.

- Treat every skill as **opinionated guidance**, not absolute truth.
- Always verify against current library docs, your team’s standards, and your project’s needs.
- Agents can still produce bad code even when a skill is loaded — **you** own the result.
- No warranty of any kind: fitness, accuracy, or fitness for a particular purpose. Use at your own risk.

**If something is wrong, unclear, or outdated:** open a [GitHub Issue](https://github.com/C1131-G/skills/issues) or PR and guide me — corrections and better patterns are welcome. That’s how this repo improves.

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

1. **Every agent run** — invoke **`skill-master` with a suffix**:
   - **`skill-master:check`** — audit/fix so the **whole project** (including old code) matches your skills  
   - **`skill-master:write`** — implement a task **following** skills (new code + feature neighbors)  
   - bare `skill-master` defaults to **write**
2. Shared first steps: **understand repo → packages → need skills → file map**. Never load a skill for a library not in the project.
3. **Break the job** — for each needed skill, walk **rule 1 → all files → lint/typecheck/build gate → rule 2 → …** then next skill. Do not start rule 2 until rule 1 is clean and the gate is green.
4. **COMPACT after every skill completes** — write a short ledger line, drop file bodies / finished skill text, run host compact if available, then load only the next skill. Keeps context small on long checks.
5. Single-skill invoke also supports suffixes: e.g. `use-tanstack-query:check`, `enforce-typescript-strict:write`.

### check vs write

| | `:check` | `:write` |
|---|---|---|
| Scope | All relevant project source | Task scope (change + feature neighbors) |
| Goal | Make **old/existing** code match skills | Ship the feature **following** skills |
| Loop | skill → each rule → scan → fix → gate → **COMPACT** → next skill | skill → align → write → gate → **COMPACT** |
| Gate | lint → fix → typecheck → build before next rule | same after each skill slice (or heavy rule) |
| Context | Shrink after each skill (ledger only) | Same — no multi-skill context pile-up |

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

| Suffix (on invoke) | Meaning |
|---|---|
| `:check` | Check/align code against skill rules (old project welcome) |
| `:write` | Write code following skill rules |

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
| `skill-master` | Entry — `:check` / `:write` + rule-by-rule gates |
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
