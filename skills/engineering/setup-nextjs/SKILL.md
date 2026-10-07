---
name: setup-nextjs
description: Set up a Next.js app the opinionated way — upgrade Next.js to latest, strip ESLint and Prettier out completely, write a Next.js 16.4 `next.config.ts` (Cache Components, Partial Prefetching, Rust React Compiler, typed routes, agent upgrades), upgrade TypeScript to latest, install Ultracite with Oxlint + Oxfmt and house Oxlint rules, then make and push the initial commit. Use when the user says "set up my Next.js project", "new Next app", "bootstrap Next", "replace ESLint with Ultracite/Oxlint", "remove Prettier", "set up next.config", or on a fresh `create-next-app` repo with `eslint.config.mjs` still in it.
---

# setup-nextjs

Takes a Next.js app from whatever state it is in to the house baseline, in a fixed order, asking the user at each decision point and explaining every config key at the end. Pair with `enforce-code-quality` (verification, staging) and `enforce-typescript-strict` (the `tsconfig` side).

| Step | Open |
|---|---|
| 3 — remove ESLint and Prettier | [remove-eslint-prettier.md](remove-eslint-prettier.md) |
| 4 — write `next.config.ts` | [next-config.md](next-config.md) |
| 6–7 — Ultracite and Oxlint rules | [ultracite.md](ultracite.md) |
| 10 — explain the config | [next-config.md](next-config.md) § Why each key, [ultracite.md](ultracite.md) § Why each rule |

## Procedure

Run the steps in order. Each ends with a check; do not start the next step on a failing one.

### 1. Preflight

- `git status` — if the tree is dirty with work you did not do, stop and ask. Note whether `.git` exists at all.
- Detect the package manager from the lockfile (`pnpm-lock.yaml`, `bun.lock`, `yarn.lock`, `package-lock.json`). Use it for every command; never mix.
- Detect a monorepo: `pnpm-workspace.yaml`, `workspaces` in the root `package.json`, `turbo.json`. Record the app path (`apps/web`) and the workspace UI package (`@workspace/ui`) if any.
- Read the Next.js version from `package.json`.

### 2. Upgrade Next.js

Load the `next-upgrade` skill and follow it to the latest stable. Prefer the official agent flow, which picks codemods and verification for the installed version:

```bash
npx next@canary upgrade --agent=latest
```

Check: `next --version` reports the latest stable, `react`/`react-dom` moved with it, and the app builds.

### 3. Remove ESLint and Prettier fully

Follow [remove-eslint-prettier.md](remove-eslint-prettier.md): packages, config files, `package.json` keys, scripts, inline disable comments, editor settings, hooks, CI. Check: its final grep returns nothing.

### 4. Write `next.config.ts`

Ask the questions in [next-config.md](next-config.md) § Ask first in **one** batch, then write the config from its template, dropping the conditional keys the answers rule out. Install nothing the config does not import. Check: `next build` passes and prints no unknown-key warning.

### 5. Upgrade TypeScript

```bash
pnpm add -D typescript@latest @types/node@latest @types/react@latest @types/react-dom@latest
```

(swap `pnpm add -D` for the project's runner). Then run the project's typecheck (`tsc --noEmit`, or the `typecheck` script). `experimental.useTypeScriptCli` makes `next build` shell out to this same `tsc`, so a native TypeScript 7 compiler needs no config change. Fix type errors the upgrade surfaced; apply `enforce-typescript-strict` to `tsconfig.json`.

### 6. Set up Ultracite

Follow [ultracite.md](ultracite.md): ask every `ultracite init` option, show the user the assembled command, run the latest Ultracite with their answers, then fix what init leaves behind (`latest` version ranges, a Prettier default formatter in `.vscode/settings.json`) and add the Tailwind v4 `stylesheet` to `oxfmt.config.mts`. Check: `ultracite check` runs.

### 7. Add the house Oxlint rules

Merge the rules in [ultracite.md](ultracite.md) § House rules into the generated `oxlint.config.mts`. Check: no unknown-rule error, and each rule fires on a file that breaks it; then run `ultracite fix` and review the diff before keeping it.

### 8. Verify

Run the full suite through the project's own scripts: typecheck, `ultracite check`, tests if present, `next build`. Fix failures caused by this setup; report pre-existing ones (per `enforce-code-quality`).

### 9. Initial commit and push

Ask the user for the remote URL — never guess or create a repository for them.

```bash
git init -b main          # only if step 1 found no .git
git remote add origin <url>   # or `git remote set-url origin <url>` if origin exists and the user confirms
```

Stage the paths this setup touched by name, commit (`Set up Next.js, TypeScript and Ultracite`, or `Initial commit` on a fresh repo), show the user the commit summary and the push target, and push only after they say yes:

```bash
git push -u origin main
```

If the remote already has history, stop and ask — do not force-push.

### 10. Explain

Finish with a table of every key in `next.config.ts` and every rule added in step 7, one line each on what it does and why it is on — taken from the "Why" sections of the references, filtered to what was actually written. Also list what was deliberately left out and why (e.g. `@next/bundle-analyzer`, `turbopackPluginRuntimeStrategy`).

## Rules

- **Ask, then act.** Every option in steps 4, 6 and 9 is the user's. Use the batched questions; recommend a default, mark it, and do not proceed on an unanswered decision.
- **One formatter, one linter.** After this skill: Oxlint lints, Oxfmt formats, Ultracite drives both. Any surviving ESLint or Prettier reference is a bug.
- **No config without a consumer.** A monorepo key in a single app, an icon package not installed, a standalone output nothing launches — remove it.
- **Latest means resolved.** Read the version the registry actually installed and report it; never write "latest" into `package.json`.

## Review checklist

- `eslint`, `prettier`, `eslint-config-*`, `.eslintrc*`, `.prettierrc*` anywhere in the repo.
- `next.config.ts` wrapping with `@next/bundle-analyzer` on a Turbopack build — it does nothing there; use `next analyze`.
- `outputFileTracingRoot` / `transpilePackages` / `turbopackAdditionalRoots` in a non-monorepo app.
- `optimizePackageImports` listing a package that is not a dependency.
- `oxlint.config.mts` with a rule name Oxlint does not recognize.
- `.vscode/settings.json` still defaulting to `esbenp.prettier-vscode` after `ultracite init`.
- A Tailwind v4 app whose `oxfmt.config.mts` has no `sortTailwindcss.stylesheet`.
- An initial commit containing `.env*`, `.next/`, or `node_modules/`.

## Done when

Next.js and TypeScript are on the latest stable versions (reported by number); no ESLint or Prettier package, config, script, comment or editor setting remains; `next.config.ts` holds only keys the user's answers justify; Ultracite with Oxlint and the house rules runs clean; typecheck, lint and build pass; the initial commit is pushed to the remote the user gave; and the user has the table explaining every key and rule.
