---
name: install-cibi-rules
description: Install and configure the cibi Oxlint plugin — executable versions of the TanStack Query rules from use-tanstack-query — into a local TypeScript or JavaScript repository. Use whenever a user asks to add the cibi lint rules, vendor the plugin, enforce query rules in CI, or migrate an existing local copy.
---

# install-cibi-rules

Copy the bundled Oxlint plugin into the current repository and wire it into that repository's existing lint setup. These rules are the mechanically checkable subset of `use-tanstack-query` — a lint failure here is a skill rule that a linter can prove, so it holds whether or not any agent read the skill.

Preserve unrelated work and adapt to the project's package manager and configuration style.

## Rules installed

| Rule | Enforces |
|---|---|
| `cibi/no-conditional-query` | Query and mutation hooks are called unconditionally; the fetch is gated with `enabled` |
| `cibi/no-floating-invalidate` | `invalidateQueries` and friends are awaited or returned inside mutation callbacks |
| `cibi/no-query-result-rest` | No rest destructuring of a query result, which defeats tracked-query re-renders |

## Procedure

1. **Inspect before changing.**
   - Read the repository's agent instructions (`AGENTS.md`, `CLAUDE.md`).
   - Run `git status` and preserve unrelated changes.
   - Identify the package manager from `packageManager` and the lockfile.
   - Find the Oxlint configuration (`oxlint.config.*`, `.oxlintrc*`, or a Vite+ config).
   - Check whether a `cibi` plugin copy already exists. Do not overwrite it without reviewing the diff.

2. **Copy the plugin.** Run from the target repository:

   ```bash
   node <skill-directory>/scripts/install.mjs
   ```

   This creates `tools/oxlint/cibi/`. Pass another relative destination as the first argument when the repository has an established tooling layout. The script refuses to replace an existing destination; use `--force` only after reviewing what is there.

3. **Install matching dependencies — read the versions, do not recall them.**
   - If the repository already depends on `oxlint`, read its installed version and install `@oxlint/plugins` at exactly that version. Pin exactly, so future upgrades move both together.
   - Only when there is no existing `oxlint` dependency, query `npm view oxlint version` and `npm view @oxlint/plugins version` and install the same current version of both.
   - `oxlint` is a dev dependency. The copied source imports `@oxlint/plugins`, so install that as a dev dependency too for a local-only plugin.
   - Do not switch package managers or rewrite unrelated dependency ranges.

4. **Register the plugin and enable the rules.** Merge these fields into the existing configuration — keep every existing entry:

   ```ts
   ignorePatterns: [
     ".agents/**",
     ".claude/**",
     ".codex/**",
     ".cursor/**",
     "tools/oxlint/cibi/**",
   ],
   jsPlugins: [
     { name: "cibi", specifier: "./tools/oxlint/cibi/index.ts" },
   ],
   rules: {
     "cibi/no-conditional-query": "error",
     "cibi/no-floating-invalidate": "error",
     "cibi/no-query-result-rest": "error",
   },
   ```

   Adjust the last ignore pattern if the plugin was copied elsewhere. Add any other project-local agent tooling directories you find, rather than linting installed skills as application source. Do not blanket-ignore all dot-directories — some repositories keep real source in them.

   For Vite+, add these to `lint.ignorePatterns` and `lint.jsPlugins`, and merge the same ignores into `fmt.ignorePatterns` so `vp check` does not reformat the vendored plugin.

5. **Run the repository's lint command and typecheck.** If findings appear in project source, report them. Fix them only if the user asked for migration or cleanup.

   **Never** suppress a rule, lower its severity, add a file-level disable header, or launder a type to make lint pass. A finding here is a real defect the `use-tanstack-query` skill describes; resolve it the way that skill says to.

6. **Report the result:** the copied path, the dependency versions installed, the configuration changed, the checks run, and any remaining findings.

## Migration guidance

When replacing an older copy, diff its rules and diagnostics before overwriting. Keep project-specific rules in their own plugin — this one is meant to stay generic across every repository that uses TanStack Query.

## Done when

The plugin is copied, registered, and all three rules are enabled at `error`; the repository's own lint command runs them; dependency versions are pinned and matched; and no rule was weakened to achieve a green run.
