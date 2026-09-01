# Repository guidance

This repository holds agent skills — written guidance, one directory per skill, installed into agents with the `skills` CLI.

## Layout

| Path | Holds |
|---|---|
| `skills/<category>/<name>/SKILL.md` | The skill: frontmatter, rules, `## Done when` |
| `skills/<category>/<name>/*.md` | Disclosed reference files, opened only for the branch that needs them |
| `skills/<category>/README.md` | Category index |

## Writing a skill

- **The `description` is the whole trigger.** It is the only text an agent sees when deciding whether to load the skill. Write it as the words someone actually types and the code signals that imply the skill — `"the list doesn't update after saving"`, `"any file importing useQuery"` — not as a topic label like "React data fetching."
- **Split at roughly 150 lines.** A long skill becomes a thin `SKILL.md` router plus disclosed references. Split when a reader needs *one* section; merge when the sections are always used together.
- **One canonical write-up per pattern.** Cross-reference it. Never copy a pattern into a second skill — the copies drift.
- **Every `SKILL.md` ends with `## Done when`**, stating the observable finish condition.
- **Every skill applies `enforce-code-quality`**, and TypeScript work also applies `enforce-typescript-strict`.

## House format

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

## Before committing

- Every `SKILL.md` parses as YAML frontmatter with `name` matching its directory.
- Every relative link resolves.
- Every backticked skill reference names a skill that exists — deleting a skill means fixing everything that pointed at it.
- The category README and the root README list the same set of skills as the filesystem.
