---
name: enforce-code-quality
description: Enforce practical code quality with minimal diffs, bounded files and functions, clear naming, DRY, KISS, YAGNI, and mandatory app verification after code changes. Use when writing or reviewing code in any language.
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

## Verification contract for code changes

Apply this contract whenever the task authorizes writing or changing application code. A review-only request remains read-only.

1. Discover the project's existing non-interactive verification commands from its package scripts, task runner, CI configuration, or contributor instructions. Do not invent a second toolchain.
2. Add or update focused tests for changed behavior when the project has test infrastructure and the change is testable.
3. Run the narrowest relevant tests while implementing so failures stay easy to diagnose.
4. Before finishing, run the full available verification suite for the affected app: tests, type checking, linting, and production build. In a monorepo, run affected-app commands and the repository-wide command when the project provides one and it is practical.
5. If any command fails, diagnose the failure, fix failures caused by or within the requested change, and rerun the failing command. Repeat until it passes.
6. Do not silently absorb unrelated pre-existing failures into the task. Record the exact command and failure, show why it is unrelated, and leave it unchanged unless the user authorized broader repair.
7. If verification cannot run because dependencies, credentials, services, platforms, or commands are unavailable, state what is missing and never claim the app passed.

Prefer single-run commands such as `vitest run` over watch mode. Never finish immediately after the first green focused test when a full app verification command exists.

## Done when

In-scope code respects limits and naming; diffs stay minimal; violations are fixed or explicitly deferred. After code changes, focused tests and the full available affected-app verification suite pass, or the final response identifies a concrete external or unrelated blocker.
