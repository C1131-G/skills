# Evidence — turning rules into verdicts

## 1. Extract the rules

For each selected skill, read `SKILL.md` and **every** file it routes to, then write a numbered list of its checkable claims. Sources of rules, in order:

1. The `## Rules` / `## Non-negotiables` list.
2. The `## Review checklist` — each line is a rule.
3. Any imperative in the prose ("never conditional hooks", "await `invalidateQueries`").
4. The `## Done when` line — the skill's own finish condition.
5. For a router, its **Connections** / cross-leaf table — those rules belong to no single leaf and are the ones an audit of leaves alone would miss.

Number them `<skill>-<n>` (`use-tanstack-query-7`). The count you extract is the count that must appear in the report.

Collapse two phrasings of the same rule into one entry and say so. Never split one rule into several to inflate coverage.

## 2. Check each rule

Every rule gets exactly one verdict:

| Verdict | Means | Requires |
|---|---|---|
| `PASS` | The code satisfies the rule | A `file:line` showing compliance, **or** the exact search that proved the anti-pattern absent, with its zero-result output |
| `FAIL` | The code violates the rule | Every violating `file:line`, capped at 10 with a total count |
| `UNVERIFIABLE` | Cannot be settled by reading the code | The reason — needs runtime behavior, needs design intent, too many call sites to check exhaustively |

`UNVERIFIABLE` is a legitimate, expected outcome. An optimistic `PASS` is the one failure mode this skill exists to prevent.

## 3. Search, then read

Grep locates candidates; it does not decide. Every candidate line is read in context before it becomes a `FAIL` — a `useEffect` that genuinely synchronizes with an external system is not a violation of `audit-react-effects`, and a `as unknown as` inside a test double may be deliberate.

Useful starting searches:

```bash
grep -rn "useEffect(" --include=*.tsx --include=*.ts src
grep -rn "as any\|as unknown as\|@ts-ignore\|@ts-expect-error\|!\." --include=*.ts --include=*.tsx src
grep -rn "useQuery(\|useMutation(\|queryKey:" --include=*.tsx --include=*.ts src
grep -rn "invalidateQueries" --include=*.tsx --include=*.ts src
grep -rn "createFileRoute\|useNavigate\|loader:" --include=*.tsx --include=*.ts src
grep -rn "toast(\|<Toaster" --include=*.tsx src
```

Config rules are checked against the config, not against prose:

```bash
node -e "const t=require('./tsconfig.json');console.log(t.compilerOptions)"
```

## 4. Exhaustive, or say it is not

"No sampling" means the search covers every file the rule can apply to. When the candidate set is too large to read in full, do not check the first twenty and generalize. Instead:

- Report the candidate count from the search.
- Read a stated number of them, and mark the rule `UNVERIFIABLE — checked 20 of 340 call sites`.
- Put "finish checking rule X" in the fix plan as its own item.

An honest partial check is useful. A partial check reported as complete is not.

## 5. Severity

Assign each `FAIL` a severity, used to order the fix plan:

| Severity | Meaning |
|---|---|
| `critical` | Causes wrong behavior or data loss today — a stale cache shown as fresh, an unhandled rejection, a type assertion hiding a real runtime shape |
| `high` | Breaks under a foreseeable condition — a race, a missing `enabled`, an unawaited invalidation |
| `medium` | Correct but violates the skill's structural rule — no key factory, an effect that should be derived state |
| `low` | Style, naming, or consistency |

Severity comes from the consequence in the code at hand, not from how strongly the skill words the rule.
