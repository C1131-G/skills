---
name: enforce-code-quality
description: Enforce practical code quality with minimal diffs, bounded files and functions, clear naming, DRY, KISS, YAGNI, and mandatory app verification after code changes. Use whenever a task will write, edit, refactor, fix, or review code in any language — including "fix this bug", "improve the UI", "add a sidebar", "check my setup", "make it work", or any request that ends in a file being changed.
---

# enforce-code-quality

Language-agnostic. Apply to every file in task scope: files you touch and the existing files the feature already depends on.

For TypeScript code, also apply `enforce-typescript-strict`.

## Rules

1. **Minimal diffs** — change only what the task needs; no drive-by reformat.
2. **Clear over clever** — a newer developer should read it without a pause.
3. **One job per function** — if you cannot name the job in one sentence, split.
4. **One job per file** — split when unrelated responsibilities pile up.
5. **File hard limit: 300 lines.** Split before exceeding.
6. **Function hard limit: 250 lines.** Split for multiple jobs, not for a soft line target.
7. **Folder structure** — group related files so related logic is findable.
8. **DRY** — extract repeated logic once.
9. **KISS + YAGNI** — build what is required now.
10. **Comment why, not what.**
11. **Names explain themselves** — files, folders, functions, variables.
12. **No bare generics** — not alone: `data`, `info`, `item`, `temp`, `util`, `helper`, `handler`, `manager`.
13. **Name specificity matches job specificity** — no `2` / `New` / `Copy` suffixes.

## Exempt from the size limits

Rules 5 and 6 (the 300-line file and 250-line function limits) do **not** apply to code the project did not author:

- **Vendored UI components** — `shadcn/ui` files under `components/ui/`, and anything else a CLI copied in (Radix wrappers, `tremor`, `magicui`, `aceternity`, a copied `data-table.tsx`). A 400-line `sidebar.tsx` from `npx shadcn add` is upstream's file, not a violation.
- **Generated output** — API clients, `*.gen.ts` (TanStack Router's `routeTree.gen.ts`), Prisma/Drizzle clients, GraphQL codegen, protobuf, OpenAPI types, migrations, snapshots.
- **Third-party code checked into the repo** — `vendor/`, `third_party/`, patches.

For these files: leave them alone. Do not split them to satisfy a limit, do not rename their exports, and do not reformat them — the next `add` or `generate` overwrites the edit and the diff is lost. The naming and DRY rules are likewise judged on your own code, not on upstream's.

Two things still apply. **Your** code that wraps or composes an exempt file is in scope and bound by every rule. And a deliberate divergence from upstream — a shadcn component you have genuinely made your own — stops being exempt: say so, and it is held to the limits like any other file.

When a limit check flags a file, resolve which side of this line it is on before reporting it.

## Verification contract for code changes

Apply this contract whenever the task authorizes writing or changing application code. A review-only request remains read-only.

1. Discover the project's existing non-interactive verification commands from its package scripts, task runner, CI configuration, or contributor instructions. Do not invent a second toolchain.
2. **Resolve the binary the project actually uses before running it.** Read `package.json` scripts first and run through the project's own runner (`pnpm --filter X exec`, `bun run`, `./node_modules/.bin/…`). A bare `npx tsc` or a bare `eslint` frequently resolves to the wrong package or to a config the repo does not have — that is a wasted round trip, not a project failure. If the first invocation fails on tooling rather than on your change, re-read the scripts instead of retrying variants.
3. Add or update focused tests for changed behavior when the project has test infrastructure and the change is testable.
4. Run the narrowest relevant tests while implementing so failures stay easy to diagnose.
5. Before finishing, run the full available verification suite for the affected app: tests, type checking, linting, and production build. In a monorepo, run affected-app commands and the repository-wide command when the project provides one and it is practical.
6. If any command fails, diagnose the failure, fix failures caused by or within the requested change, and rerun the failing command. Repeat until it passes.
7. Do not silently absorb unrelated pre-existing failures into the task. Record the exact command and failure, show why it is unrelated, and leave it unchanged unless the user authorized broader repair.
8. If verification cannot run because dependencies, credentials, services, platforms, or commands are unavailable, state what is missing and never claim the app passed.

Prefer single-run commands such as `vitest run` over watch mode. Never finish immediately after the first green focused test when a full app verification command exists.

## Commit and push hygiene

Verification proves the change works; these rules keep the change reviewable.

1. **Stage explicitly.** Name the paths you changed. Never `git add -A` or `git add .` in a tree that already carried unrelated modifications — check `git status` first and stage only your own work.
2. **One commit, one concern.** If the tree contains an in-progress migration, scaffolding, or another feature you did not write, it does not belong in your commit. Say so and leave it unstaged.
3. **Commit and push only when asked.** Finishing the work is not authorization to publish it. If you notice the change is on the default branch, branch first.

## Done when

In-scope code respects limits and naming — vendored and generated files excluded, and any exclusion named; diffs stay minimal; violations are fixed or explicitly deferred. After code changes, focused tests and the full available affected-app verification suite pass, or the final response identifies a concrete external or unrelated blocker. Anything committed contains only the intended change.
