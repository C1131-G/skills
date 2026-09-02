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

### Exclude what the project did not author

Before a file becomes a `FAIL`, check it is the project's own code. Vendored UI components (`components/ui/` from `shadcn`, other CLI-copied components), generated output (`*.gen.ts`, codegen clients, migrations), and `vendor/` are exempt from the size limits and from naming and DRY findings — see the exemption section of `enforce-code-quality`.

```bash
grep -rc '' --include=*.ts --include=*.tsx -r src app components 2>/dev/null \
  | awk -F: '$2 > 300' \
  | grep -v -E '/(components/ui|vendor|third_party|__generated__)/|\.gen\.|\.generated\.'
```

Report the exclusion rather than hiding it: `12 files over 300 lines — 9 are shadcn components under components/ui/ and routeTree.gen.ts, excluded; 3 are project code, listed below`. An audit that silently drops them looks identical to one that never checked.

A wrapper *around* an exempt file is project code and is audited normally.

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
