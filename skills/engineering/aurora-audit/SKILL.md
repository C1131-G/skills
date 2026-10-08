---
name: aurora-audit
description: Audit a Next.js 16 App Router project against the code-quality and structure principles in Aurora Scharff's next16 reference apps (calendar, social-media, airline, team-chat, mail, commerce), then produce a fix plan with cited evidence. Checks feature folders, synchronous pages with `params.then()`, page-owned Suspense, same-file skeletons, `server-only` queries, validated `'use server'` actions, `'use cache'` / `cacheTag` / `updateTag`, client leaves, optimistic UI, `catchError` error boundaries, prefetching, tooling and Playwright `instant()` tests. Use when asked to "audit my Next.js app", "aurora audit", "check against Aurora's patterns", "is my Next.js structure right", "review my app router architecture", or on any repo with `next` 16+ where pages are `async`, pages import `*-queries`, or features receive `params`.
---

# aurora-audit

Audits a Next.js 16+ App Router codebase against the patterns Aurora Scharff uses across her `next16-*` reference apps, and turns every violation into a fix with a file path. Pair with `enforce-code-quality` and `enforce-typescript-strict`; route interaction mechanics to `apply-react-async-ui`, effects to `audit-react-effects`, and TanStack Query details to `use-tanstack-query`.

Read-only on application code. The deliverable is the report; apply fixes only when the user asks.

## One topic per file

Each reference holds one principle area: its rules (with IDs), a real example from the reference apps, the searches that find violations, and the fix. Open a file only when the project has that area.

| Topic | Open | Rule IDs |
|---|---|---|
| Where code lives: `app/`, `features/`, `components/`, `lib/` | [folders.md](folders.md) | F1–F8 |
| What a `page.tsx` / `layout.tsx` may contain | [pages.md](pages.md) | P1–P7 |
| Where `<Suspense>` goes, layout shift | [suspense.md](suspense.md) | S1–S8 |
| Loading skeletons | [skeletons.md](skeletons.md) | K1–K7 |
| Server vs client components, props | [components.md](components.md) | C1–C8 |
| Server reads (`*-queries.ts`) | [queries.md](queries.md) | Q1–Q7 |
| Server writes (`*-actions.ts`) | [actions.md](actions.md) | A1–A8 |
| `cacheComponents`, tags, invalidation | [caching.md](caching.md) | CA1–CA8 |
| Optimistic UI, pending, toasts, forms | [interactions.md](interactions.md) | I1–I9 |
| Error boundaries, `error.tsx`, `notFound()` | [errors.md](errors.md) | E1–E6 |
| SWR / TanStack Query alongside RSC | [client-cache.md](client-cache.md) | CC1–CC6 |
| Links, prefetching, navigation gates | [navigation.md](navigation.md) | N1–N6 |
| `next.config.ts`, TypeScript, lint, format | [tooling.md](tooling.md) | T1–T7 |
| Playwright e2e and `instant()` | [testing.md](testing.md) | TS1–TS5 |
| Report and fix-plan format | [report.md](report.md) | — |

## Procedure

1. **Confirm the stack.** Read `package.json` and `next.config.ts`. Record the `next` version and whether `cacheComponents`, `partialPrefetching`, `reactCompiler`, `typedRoutes` are on. Without `cacheComponents`, mark CA1–CA8 and N4–N5 `N/A` and say why.
2. **Map the tree.** List `app/`, `features/`, `components/`, `lib/`, `hooks/`, `types/`. Note the client data library (`swr`, `@tanstack/react-query`) if any.
3. **Pick the topics.** Every project gets folders, pages, suspense, skeletons, components, queries, actions, errors, tooling, testing. Add caching, client-cache, interactions, navigation when the project has those surfaces.
4. **Check every rule in every picked file.** Run the file's searches, then read each hit in context before calling it a violation. A grep hit is a candidate, not a verdict.
5. **Write the report** in the format of [report.md](report.md): one row per rule ID, a verdict, and evidence.

## Rules

1. **Evidence or no verdict.** `PASS` cites a `file:line` or the zero-result search; `FAIL` cites every offending `file:line` (cap 10, give the total).
2. **No sampling.** Every rule ID in every picked file appears in the report. Can't settle it from code → `UNVERIFIABLE` with the reason.
3. **The newer apps win.** `next16-commerce` predates the others (PascalCase files, default exports, page-local async helpers). Where it disagrees with the other five, audit against the five.
4. **Respect the project's own `AGENTS.md`.** A documented local convention (casing, a different folder name) beats a rule here; report it as `PASS (local convention)` with the line that sets it.
5. **Generated and vendored code is exempt** — `generated/`, `prisma/migrations/`, shadcn-copied `components/ui/` primitives.
6. **Audit, then fix — separately.** No edits to app code during the audit.

## Review checklist

When reviewing a finished aurora audit, flag: a rule ID missing from the report; a `PASS` with no citation; caching rules marked `PASS` on an app without `cacheComponents`; a fix with no file path; a grep hit reported as `FAIL` without being read; commerce-only style held up as the target.

## Done when

Every rule ID of every picked topic has a `PASS`, `FAIL`, `N/A` or `UNVERIFIABLE` verdict with evidence, and the fix plan lists each `FAIL` with its file path, the change, and a severity, ordered most severe first.
