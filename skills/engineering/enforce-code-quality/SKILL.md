---
name: enforce-code-quality
role: always
description: >
  MAIN always-on. Modes: bare=audit report, :check=fix, :write=apply. Minimal diffs, file/function limits, naming, DRY/KISS/YAGNI.
disable-model-invocation: true
---

# enforce-code-quality

**Main skill** (`role: always`). Modes:

| Invoke | Mode |
|---|---|
| `enforce-code-quality` | audit - report only, no edits |
| `enforce-code-quality:check` | audit + fix |
| `enforce-code-quality:write` | implement / apply under this skill's rules |

On write/check, ALWAYS (enforce-*) still applies when stack matches. Not a leaf - invoke by this name.

Language-agnostic. Apply to every file in **task scope** (files you touch and the existing files the feature already depends on — see `skill-master` APPLY).

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

## Done when

In-scope code respects limits and naming; diffs stay minimal; violations fixed or explicitly deferred. Scope: task neighbors on write; all relevant source on check/audit. Mode **audit** = report only; **check/write** = fix/apply with gate between rules **1 → N**.
