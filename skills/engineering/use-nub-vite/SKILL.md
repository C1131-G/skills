---
name: use-nub-vite
role: main
description: >
  MAIN. Modes: bare=audit report, :check=fix, :write=implement. Nub + Vite+ toolchain.
disable-model-invocation: true
---
# use-nub-vite

**Main skill** (`role: main`). Modes:

| Invoke | Mode |
|---|---|
| `use-nub-vite` | audit — report only, no edits |
| `use-nub-vite:check` | audit + fix |
| `use-nub-vite:write` | implement / apply under this skill's rules |

On write/check, skill-master ALWAYS still applies when stack matches. Not a leaf — invoke by this name.

Both are 2026, Rust/oxc-powered JS toolchains that look like competitors but occupy different layers — the two are meant to be layered together, not chosen between, for a project that has both a Node-side runtime concern and a browser-facing frontend build.

## What Nub actually is

Nub does **not** reimplement the Node runtime the way Deno/Bun do. It **augments the user's real, installed `node`** through Node's own extension surfaces — `--import` preload, `module.registerHooks`, N-API addons, V8 flag injection. Two properties follow from that, and matter for how it's positioned relative to anything else in the stack:

- **No reimplementation-induced divergence** — code runs on the user's actual Node, byte-for-byte. Every Nub behavior is something a user could in principle install themselves via `module.register`/an `--import` preload/an npm addon, so there's no separate runtime to fall out of sync with Node.
- **Zero lock-in** — Nub adds no globals, no `nub:` import namespace, no config field to author. Remove Nub and the project's code runs unchanged on plain Node.

Nub does **not** type-check — that stays with `tsc` (or, in a combined setup, Vite+'s embedded type checker).

## What each one owns

| Concern | Nub | Vite+ |
|---|---|---|
| Script runner (`npm run` equivalent) | ✅ | ✅ |
| Bin runner (`npx` equivalent) | ✅ | ✅ |
| Node version manager | ✅ | ✅ |
| TypeScript execution (runs `.ts` directly) | ✅ | ❌ |
| Package manager | ✅ — owns the full resolve/link/lockfile flow | ❌ — passthrough to whatever PM the project already uses |
| Dev server | ❌ — bring your own | ✅ (Vite) |
| Bundler | ❌ — bring your own | ✅ (Rolldown) |
| Formatter | ❌ — bring your own | ✅ (Oxfmt) |
| Linter | ❌ — bring your own | ✅ (Oxlint) |
| Type checker | ❌ — bring your own | ✅ (embedded tsgo) |
| Test runner | ❌ — bring your own | ✅ (Vitest) |

## The decision rule

**Nub is the base; Vite+ fills the gaps Nub leaves open on purpose.** Nub is deliberately unopinionated about the frontend toolchain (dev server, bundler, formatter, linter, type checker, test runner) — it only owns the Node-process-level concerns (running scripts/bins, managing the Node version, running TypeScript, managing packages). Vite+ is exactly the opposite: it's an integrated, opinionated frontend toolchain that happens to also cover script/bin running and Node versioning, but treats package management as someone else's job (it shells out to whatever package manager is already in place).

So for a project that has a browser-facing build:
- Use **Nub** for running scripts/bins, managing the Node version, executing TypeScript directly, and for package installs (operating on whichever lockfile the project already has — see the package management section below).
- Use **Vite+** for the dev server, bundler, formatter, linter, type checker, and test runner — the pieces Nub explicitly doesn't provide.
- Don't run both tools' script runners, bin runners, or Node-version-managers redundantly against each other — pick one to own each of those three overlapping jobs (default: let Nub own them, since it's the base layer in this setup) to avoid two tools racing to provision the Node version or resolve the same binary.

For a project with **no browser output at all** (a pure backend/Node service, a CLI tool) — Vite+ isn't needed; Nub alone covers the full workflow, and the frontend-toolchain half of Vite+ has nothing to attach to.

## Nub command cheat sheet

Every row is a drop-in replacement for an existing command — none of them changes anything about the project itself:

| Instead of | Use | Notes |
|---|---|---|
| `node file.js` / `node file.ts` | `nub file.ts` | runs TS/JSX directly, no build step; tsconfig paths + `.env` honored |
| `npm run <script>` | `nub run <script>` | same scripts, faster dispatch |
| `npx <tool>` / `pnpm dlx <tool>` | `nubx <tool>` | runs the project's local CLI; fetches ad hoc if absent |
| `npm install` / `pnpm install` | `nub install` | reads and writes the project's *existing* lockfile — see package management section below |
| `npm install <pkg>` | `nub add <pkg>` | also `nub remove` / `nub update` |
| `nodemon file.ts` | `nub watch file.ts` | restart on change |
| `npm init` | `nub init` | TypeScript-first scaffold |
| `nvm use` / installing a Node version | *(nothing)* | pinned Node auto-provisioned from `.node-version`/`.nvmrc`/`engines.node` |
| plain, unaugmented Node | `nub --node file.ts` | no transpile, no `.env` — vanilla Node, still on the project's pinned version |

## Running files: know which path you're on

```bash
nub app.ts         # augmented — full TypeScript syntax, JSX, tsconfig-aware resolution, .env loading, polyfills
nub --node app.ts  # plain — Node's native type-stripping only, still on the project's pinned Node version
vp node app.ts      # plain — Vite+'s own unaugmented path, Node's native type-stripping only
```

Both Nub and Vite+ provision the right Node version on demand regardless of which path is used, but they diverge sharply in what happens to the file:

- **`nub app.ts`** augments execution on top of stock `node`: the full TypeScript syntax surface (enums, decorators, parameter properties, `import =`, extensionless imports), direct `.jsx`/`.tsx` execution with the runtime resolved from `tsconfig`, `tsconfig`-aware module resolution (`paths`, `baseUrl`, `extends`) applied at runtime, automatic `.env`/`.env.[mode]` loading, non-JS data imports (YAML, TOML, JSON5, JSONC, plain text) loading like JSON, and polyfills for newer globals (`Worker`, web storage, `Temporal`, `URLPattern`).
- **`vp node app.ts`** is deliberately unaugmented — it defers entirely to Node's own native type-stripping, with none of the above.

Critically: **this is transpilation, not type-checking**, on the Nub side. `nub app.ts` runs the TypeScript but never checks it — that's exactly the gap Vite+'s embedded type checker (or any standalone type checker) is there to fill.

## Package management: who actually owns it, and a correction worth flagging

Nub is a genuine package manager — it resolves the dependency graph and links `node_modules` — but it is **not** a new lockfile format competing with npm/pnpm/Bun/Yarn. Nub infers whichever package manager the project already uses and reads *and writes* that PM's native lockfile directly:

- npm, pnpm, and Bun lockfiles round-trip **in place** — `nub install`/`nub add`/`nub remove` are safe to use regardless of which of these three the project already has.
- Yarn lockfiles are **read-only** — Nub can install and run a Yarn project but won't rewrite `yarn.lock`.

**Never propose switching a project's package manager or lockfile format in order to adopt Nub.** There is nothing to migrate on the package-manager axis — that's the whole point of how Nub is built here. This corrects a natural but wrong assumption: Nub isn't "a full package manager instead of npm/pnpm," it's a faster CLI *for* whichever one is already there.

Vite+, by contrast, is a genuine passthrough: `vp install` in a pnpm project just runs pnpm's own install under the hood — it has no lockfile opinion of its own at all.

Practical implication for a combined setup: since Nub already drives the existing lockfile directly, don't let Vite+'s `vp install` passthrough become a second, redundant path to the same `node_modules` — pick Nub as the single command you actually run for installs in a combined project (it'll still be operating on the same lockfile Vite+ would have deferred to anyway).

## Migrating an existing project onto Nub: what becomes redundant

When adopting Nub into a project that already has a fragmented toolchain, look for these classes of tooling — match by class, not by exact package name:

| Toolchain class | Look for | Subsumed by |
|---|---|---|
| TypeScript runners | `tsx`, `ts-node`, `ts-node-dev`, `esbuild-register` | `nub file.ts` runs TypeScript directly |
| Build-to-run scripts | `tsc && node dist/…`-shaped script bodies | `nub file.ts` — no build step to run |
| Env-file loading | `dotenv`, `dotenv-cli`, `env-cmd`, `import "dotenv/config"` | `.env`/`.env.[mode]` load automatically |
| Cross-platform env vars | `cross-env` in script bodies | Nub's script runner + env loading |
| Watch-and-restart | `nodemon`, `tsx watch` | `nub watch file.ts` |
| Path aliases | `tsconfig-paths`, `-r tsconfig-paths/register` | `tsconfig.json#paths` applied at runtime |
| Bin runners | `npx`, `pnpm dlx`, `bunx` | `nubx <tool>` |
| Node version managers | `nvm`, `fnm`, `volta` | a pin (`.node-version`/`engines.node`) alone provisions the right Node |
| Package-manager provisioning | corepack, `corepack enable` | Nub's own PM handling |
| CI Node setup | `actions/setup-node` | `nubjs/setup-nub` installs Nub, warms the pinned Node, caches the store |

Some of these may still be referenced directly in code (e.g. an explicit `import "dotenv/config"`) — only remove the dependency once nothing references it anymore.

**Coming from the Bun runtime specifically** (code calling `Bun.*` APIs, scripts invoking `bun run`) is a bigger move than a dependency cleanup — that's a genuine migration, not a drop-in swap, unlike a project that merely used Bun *as a package manager* (Nub round-trips `bun.lock` in place with no migration needed at all).

If the project type-checks against surfaces Nub adds (data-format imports like YAML/TOML, `import.meta.hot`, etc.), add `@nubjs/types` as a devDependency so the type checker (whether standalone `tsc` or Vite+'s embedded one) recognizes them.

## Applying this

- **New project with a browser-facing build**: set up Nub first (runtime, script/bin running, driving whichever package manager is chosen), then layer Vite+ on top specifically for dev server/bundler/formatter/linter/type-checker/test-runner — don't reach for separate standalone tools (a different linter, a different test runner) for jobs Vite+ already covers once it's in the stack.
- **New project with no browser output**: Nub alone; skip Vite+ entirely.
- **Migrating an existing project onto Nub**: investigate read-only first (dependencies, scripts, CI config), match against the toolchain-class table above, then propose adoption as a menu of independent, opt-in steps rather than one all-or-nothing switch — a team can use Nub for day-to-day commands with zero of the cleanup steps applied. Never take an action that installs, edits, or removes anything without the change being explicitly selected first.
- **Reviewing an existing setup**: flag redundant tooling per the migration table (a `tsx`/`ts-node`-style runner alongside Nub, `dotenv`/`nodemon`/`cross-env`/`tsconfig-paths` still present after Nub is adopted, a standalone linter/formatter/test runner alongside Vite+ redundant with Oxlint/Oxfmt/Vitest) and any place a project's package manager or lockfile format was changed in order to "adopt" Nub — that's never necessary.
- **If TypeScript correctness matters at build/CI time**, don't rely on `nub app.ts` alone — it transpiles but doesn't type-check; make sure Vite+'s embedded type checker (or a standalone `tsc --noEmit`) actually runs as part of CI, not just the dev-time editor experience.

