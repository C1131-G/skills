# Ultracite with Oxlint

[Ultracite](https://www.ultracite.ai) is a zero-config preset over a linter and formatter. Here it drives **Oxlint** (lint) and **Oxfmt** (format) — both Rust, both replacing what step 3 removed.

## 1. Read the current options

Flags change between releases. Before asking anything, run:

```bash
npx ultracite@latest init --help
```

and use its option list over the table below if they differ.

## 2. Ask every option

Pre-fill what is detectable, mark the recommendation, ask in batches of up to four. Never skip one — an unasked option is a prompt the user later has to undo.

| Flag | Values | Recommend |
|---|---|---|
| `--linter` | `oxlint`, `biome`, `eslint` | `oxlint` — the house rules below are Oxlint rules |
| `--pm` | `pnpm`, `bun`, `yarn`, `npm`, `deno`, `nub`, `aube` | the lockfile's |
| `--frameworks` | `react`, `next`, `solid`, `vue`, `svelte`, `qwik`, `remix`, `tanstack`, `angular`, `astro`, `nestjs`, `jest`, `vitest` | `react next` + the installed test runner |
| `--workspace-framework` | `<path>=<framework>`, repeatable | monorepo only, e.g. `apps/web=next` |
| `--editors` | `universal`, `vscode`, `cursor`, `windsurf`, `zed`, `antigravity`, `kiro`, `trae`, `void`, `bob`, `codebuddy` | the user's editor |
| `--agents` | `universal`, `claude`, `codex`, `copilot`, `cursor-cli`, `gemini`, `cline`, `amp`, `opencode`, … (see `--help`) | the agents the user runs |
| `--hooks` | `claude`, `cursor`, `windsurf`, `copilot`, `codebuddy` | the user's agent — runs `ultracite fix` after each agent edit |
| `--integrations` | `husky`, `lefthook`, `lint-staged`, `pre-commit` | `lefthook` (or what the repo already uses) |
| `--js-plugins` | `@shadcn/lint`, `anti-slop`, `eslint-plugin-github`, `eslint-plugin-jsdoc`, `eslint-plugin-sonarjs`, `eslint-plugin-tsdoc`, `oxlint-plugin-react-doctor` | `oxlint-plugin-react-doctor`; `@shadcn/lint` when `components.json` exists |
| `--type-aware` | flag | yes — enables rules that need type info (floating promises, unsafe `any`) |
| `--install-skill` | flag | yes |

`--skip-install` and `--quiet` are for CI; do not use them here. `--js-plugins` ESLint plugins run inside Oxlint — they are not ESLint coming back.

## 3. Run it

Assemble the command, show it to the user, run it after they confirm:

```bash
npx ultracite@latest init --linter oxlint --pm pnpm --frameworks react next vitest --editors vscode --agents claude --hooks claude --integrations lefthook --js-plugins oxlint-plugin-react-doctor --type-aware --install-skill
```

Multi-value flags take space-separated values, as above.

With `--linter oxlint` it writes `oxlint.config.mts` and `oxfmt.config.mts` (`.mts` so they load as ESM in a `"type": "commonjs"` app), `check`/`fix` scripts, and the chosen editor, hook and integration files. `--type-aware` adds `oxlint-tsgolint`.

## 4. Fix what init leaves behind

Seen with Ultracite 7.12.4 — re-check on newer versions, fix whatever still applies:

| Problem | Fix |
|---|---|
| `devDependencies` gets `"oxlint": "latest"`, `"oxfmt": "latest"`, `"oxlint-tsgolint": "latest"`, `"lefthook": "latest"` | After install, pin each to the version the lockfile resolved |
| `.vscode/settings.json` sets the top-level `"editor.defaultFormatter": "esbenp.prettier-vscode"` — Prettier back in the editor | Change it to `"oxc.oxc-vscode"` |
| No `.vscode/extensions.json` | Create it with `"recommendations": ["oxc.oxc-vscode"]` |
| Hook or `lefthook.yml` commands use `npx` in a pnpm/bun project | Swap to the project's runner (`pnpm exec`, `bunx`) |

Then re-run the final grep from [remove-eslint-prettier.md](remove-eslint-prettier.md). The only allowed hits are `--js-plugins` package names.

## House rules

Add `rules` beside the generated `extends` in `oxlint.config.mts` — never edit inside the Ultracite presets:

```ts
import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, react, next],
  ignorePatterns: core.ignorePatterns,
  rules: {
    complexity: ["warn", { max: 20 }],
    "id-denylist": [
      "warn",
      "temp",
      "tmp",
      "foo",
      "bar",
      "baz",
      "val",
      "obj",
      "res",
      "callback",
      "cb",
    ],
    "id-length": [
      "warn",
      {
        exceptions: ["i", "j", "k", "x", "y", "z", "_"],
        min: 2,
        // Property keys often match a third-party API (Recharts' `r`) or a
        // domain value (the scoring zones' `M`/`X`), not a name we choose.
        properties: "never",
      },
    ],
  },
});
```

Keep everything else Ultracite generated. All three rules are needed — the core preset does not cover them:

| Rule | In `ultracite/oxlint/core` | House override |
|---|---|---|
| `complexity` | `"error"`, ESLint default max 20 — fails the build | `warn` at 20 |
| `id-denylist` | `"error"` with no names — does nothing | `warn` with the list |
| `id-length` | `"off"` | `warn`, min 2 |

Check that Oxlint accepts them: run `ultracite check` and confirm no unknown-rule error, then confirm each fires on a file that breaks it (a `tmp` variable, a one-letter parameter). Verified working on Oxlint 1.87.0.

### Why each rule

| Rule | What it flags | Why |
|---|---|---|
| `complexity` max 20 | Functions with more than 20 independent paths | Matches `enforce-code-quality` rule 3: past ~20 branches a function does more than one job |
| `id-denylist` | `temp`, `tmp`, `foo`, `bar`, `baz`, `val`, `obj`, `res`, `callback`, `cb` | Placeholder names that say nothing about the value — `enforce-code-quality` rule 12 |
| `id-length` min 2 | One-letter names outside `i j k x y z _` | Loop indices and coordinates are conventional; anything else needs a word. `properties: "never"` because keys often belong to someone else's API |

All three are `warn`: they steer naming without blocking a build. Promote to `error` once the codebase is clean if the user wants them enforced.

## Oxfmt

The `ultracite/oxfmt` preset already covers the formatter: Prettier-compatible style (double quotes, semicolons, 2 spaces, width 80, `es5` trailing commas, LF), import sorting, `package.json` sorting, Tailwind class sorting through `clsx`/`cva`/`cn`/`tw`/`twMerge`/`twJoin`/`tv`, and the shared ignore list (`.next`, `next-env.d.ts`, lockfiles, generated code). Do not restate any of it.

The one addition: **Tailwind v4 needs its stylesheet.** Without `stylesheet`, Oxfmt sorts against Tailwind's stock `theme.css`, so classes from the app's own `@theme` (`bg-brand`) are sorted wrong. Point it at the CSS entry that has `@import "tailwindcss"`:

```ts
import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  sortTailwindcss: {
    ...ultracite.sortTailwindcss,
    stylesheet: "./app/globals.css",
  },
});
```

Spread `ultracite.sortTailwindcss` so the preset's `functions` list is kept. Skip this if the project has no Tailwind, or is on Tailwind v3 (where `tailwind.config.js` is found automatically).

## Check

```bash
npx ultracite check
```

Then `npx ultracite fix`, review the diff with the user, and keep it only if it is formatting and safe autofixes.
