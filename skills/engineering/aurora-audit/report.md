# Report — what the audit hands back

Three parts, in this order. Nothing else.

## 1. Stack line

```
Next 16.5.0-canary.2 · React 19.3 · cacheComponents ✔ · partialPrefetching ✔ · reactCompiler ✔ · typedRoutes ✔
Client cache: @tanstack/react-query 5 · ORM: Prisma 7 · Tests: Playwright + @next/playwright
Topics audited: folders, pages, suspense, skeletons, components, queries, actions, caching, interactions, errors, navigation, tooling, testing
Topics skipped: client-cache (no swr / @tanstack/react-query in package.json)
```

## 2. Rule table

One row per rule ID of every audited topic. No rule left out.

| ID | Rule (short) | Verdict | Evidence |
|---|---|---|---|
| P1 | Pages not async | FAIL | `app/post/[id]/page.tsx:8`, `app/u/[handle]/page.tsx:5` (2 total) |
| Q1 | Queries import `server-only` | PASS | loop over 6 `*-queries.ts` printed nothing |
| CA1 | Reads cached + tagged | N/A | `cacheComponents` not set in `next.config.ts` |
| K5 | Skeleton height matches | UNVERIFIABLE | needs browser measurement |

Verdicts:

- **PASS** — cite a `file:line` that complies, or the exact search and its empty output.
- **FAIL** — every offending `file:line`, at most 10, then "(N total)".
- **N/A** — the surface doesn't exist; say what is missing.
- **UNVERIFIABLE** — can't be settled from code; say what would settle it.

## 3. Fix plan

Every `FAIL`, ordered by severity, then by how many files it touches.

| # | Severity | Rule | File(s) | Change |
|---|---|---|---|---|
| 1 | High | A2 | `features/post/post-actions.ts:14` | Call `verifyUser()` first; scope the update to `user.id` |
| 2 | Medium | P1 | `app/post/[id]/page.tsx` | Drop `async`; move `getPost` into `PostDetail`; `params.then(({ id }) => <PostDetail id={id} />)` |

Severity:

- **High** — security or data integrity: A2, A3, Q1, T3, E5, CA2 leaking one user's cache to another.
- **Medium** — wrong structure that blocks streaming or caching: P1–P3, S1, S5, C1, C3, CA1, CA3–CA5.
- **Low** — consistency and polish: naming, skeleton placement, toast choice, lint config.

## Close

End with the counts — `PASS n · FAIL n · N/A n · UNVERIFIABLE n` — and the single change that would remove the most `FAIL`s. Offer to apply the plan; don't apply it unasked.
