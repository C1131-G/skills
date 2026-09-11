# Repository guidance

This repository holds agent skills — written guidance, one directory per skill, installed into agents with the `skills` CLI.

## Project map

| Path | Holds |
|---|---|
| `skills/<category>/<name>/SKILL.md` | The skill: frontmatter, rules, `## Done when` |
| `skills/<category>/<name>/*.md` | Disclosed reference files, opened only for the branch that needs them |
| `skills/<category>/README.md` | Category index |
| `skills/INDEX.md` | Routing table: every skill, the signal that loads it, its references |
| `scripts/check-skills.py` | Proves `INDEX.md` matches the filesystem |

## Which skill to load

Two or more rows can apply at once — load all of them. This table is about working *on* this repo (authoring skills); it is not the `skills/INDEX.md` routing table those skills use in a *consuming* project.

| When | Load |
|---|---|
| Writing or editing any `SKILL.md` in this repo | `enforce-code-quality` |
| Onboarding a project, or writing/updating that project's `AGENTS.md` | `setup-agent-rules` |
| Auditing a project against the skills its stack implies | `audit-with-skills` |

<important if="you are writing a new SKILL.md or editing an existing one">

## Writing a skill

- **The name is a verb phrase.** `apply-` writes the pattern, `audit-` finds and fixes violations of it, `enforce-` is a standing constraint on every change, `use-` is a library's rules, `setup-` wires a project up, `read-` is a reading method. The object follows the verb and names what is acted on, not the topic area.
- **Renaming a skill is a breaking change.** The name is referenced by the index, both READMEs, the `setup-agent-rules` table, other skills' cross-references, and copies already installed on machines. Rename only when the current name misleads about what the skill does, and fix every reference in the same commit.
- **The `description` is the whole trigger.** It is the only text an agent sees when deciding whether to load the skill. Write it as the words someone actually types and the code signals that imply the skill — `"the list doesn't update after saving"`, `"any file importing useQuery"` — not as a topic label like "React data fetching."
- **Split at roughly 150 lines.** A long skill becomes a thin `SKILL.md` router plus disclosed references. Split when a reader needs *one* section; merge when the sections are always used together.
- **One canonical write-up per pattern.** Cross-reference it. Never copy a pattern into a second skill — the copies drift.
- **Every `SKILL.md` ends with `## Done when`**, stating the observable finish condition.
- **Every skill applies `enforce-code-quality`**, and TypeScript work also applies `enforce-typescript-strict`.

### House format

```markdown
---
name: <matches the directory name>
description: <what it does> + <when to use> + <concrete triggers>
---

# <name>

<one line on purpose, and which skills to pair it with>

<routing table, if the skill has reference files>

## Rules  (or numbered sections)

## Review checklist   — what to flag in existing code

## Done when
```

</important>

<important if="you are about to commit a change in this repo">

## Before committing

- Every `SKILL.md` parses as YAML frontmatter with `name` matching its directory.
- Every relative link resolves.
- Every backticked skill reference names a skill that exists — deleting a skill means fixing everything that pointed at it.
- The category README and the root README list the same set of skills as the filesystem.
- `skills/INDEX.md` has exactly one row per `SKILL.md` on disk, and every path and reference filename in it resolves — `python scripts/check-skills.py` proves it.

</important>
