# Repository guidance

This repository holds two things: **executable rules** (`src/`) and **written skills** (`skills/`). They are not interchangeable, and which one a piece of knowledge belongs in is the main design decision here.

## The rule

**If a claim can be checked mechanically, it belongs in `src/rules/` as a lint rule. If it needs judgment, it belongs in `skills/` as prose.**

A lint rule runs on every commit, in CI, for every agent and every human. A skill only applies if something chooses to read it. Push each piece of knowledge to the strongest form that can hold it.

## Layout

| Path | Holds |
|---|---|
| `src/rules/` | One rule per file, with its `.test.ts` beside it |
| `src/shared/` | Helpers used by more than one rule |
| `src/index.ts` | The plugin entry point that registers every rule |
| `skills/<category>/<name>/` | Written skills — `SKILL.md` plus disclosed reference files |
| `skills/engineering/install-cibi-rules/` | The installer skill; `assets/cibi/` is a generated copy of `src/` |
| `scripts/sync-skill-assets.mjs` | Keeps that copy in step with `src/` |

## Working on rules

- Use Oxlint's ESTree API. Do not add a second production parser.
- Walk up with `node.parent`; the `:exit` visitor form is not used here.
- Every semantic change needs `RuleTester` coverage — both the case that must fire and the near-miss that must not.
- Keep rules generic. No application-specific names, paths, or exceptions.
- Run `npm run sync:skill-assets` after changing anything under `src/`.
- Run `npm run check` before committing.

## Working on skills

- Frontmatter `description` is the only text an agent sees when deciding whether to load the skill. Write it as triggers — the words someone actually types, and the imports that imply the skill — not as a topic label.
- A skill over ~150 lines becomes a thin `SKILL.md` router plus disclosed reference files. Split when a reader needs *one* section; merge when sections are always used together.
- Every `SKILL.md` ends with `## Done when`.
- One canonical write-up per pattern. Cross-reference it; never copy it into a second skill.

## Verification

`npm run check` runs lint, the rule tests, typecheck, and the skill-asset drift check. It is the same command CI runs.
