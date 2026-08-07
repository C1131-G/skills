---
name: route-react-async-ui
role: router
description: >
  MAIN router for async React UI. Invoke this skill only (not its leaves).
  Modes: bare=audit report, :check=fix, :write=implement. Decision-loads
  apply-react-transitions | apply-react-optimistic | apply-react-suspense.
disable-model-invocation: true
---

# route-react-async-ui

**Main skill.** User invokes **this** name with mode suffix. Leaves are **not** mains.

| Invoke | Mode |
|---|---|
| `route-react-async-ui` | audit — report only |
| `route-react-async-ui:check` | audit + fix |
| `route-react-async-ui:write` | implement under Decision leaves |

If the user names a leaf (`apply-react-suspense`, …), **redirect here** with the same mode and Decision-select that leaf only. Do not run the leaf as a top-level skill in the report.

On write/check: still apply ALWAYS (`enforce-code-quality`, `enforce-typescript-strict` if TS) in scope.

## Leaves (internal only)

| Leaf | Load when |
|---|---|
| `../apply-react-transitions/SKILL.md` | Click handler, form action, pending state, double-submit |
| `../apply-react-optimistic/SKILL.md` | Instant optimistic feedback on mutation |
| `../apply-react-suspense/SKILL.md` | Suspense boundary, flicker, streaming, deferred |

Load **only** Decision-matched leaves. One leaf at a time → rules → (fix if check/write) → COMPACT → next leaf.

## Decision

| Task | Leaf |
|---|---|
| Click handler, form action, pending state | transitions |
| Instant optimistic feedback on mutation | optimistic |
| Suspense boundary, flicker, streaming promise, deferred render | suspense |

Most mutations need **transitions + optimistic**. If `useEffect` appears → also main `../audit-react-effects/SKILL.md`.

## Flow map

```
User interaction
  EVENT       → transitions   (capture input outside transition)
  TRANSITION  → transitions   (useTransition / useActionState)
  OPTIMISTIC  → optimistic    (useOptimistic or onMutate)
  LOADING     → suspense      (fresh load vs keep previous)
  ANIMATE     → main apply-native-feel-nav (View Transitions — visual only)
  SHELL       → main apply-next-shell-nav (Next dashboard shell / nested nav)
  COMMIT      → optimistic    (server truth / invalidate)
```

## Pair mains (not leaves)

| Pair | When |
|---|---|
| `apply-native-feel-nav` | Route-level View Transitions / native motion |
| `apply-next-shell-nav` | Next App Router sidebar / first paint / private session chrome |
| `audit-react-effects` | `useEffect` appears or fetch-on-mount smell |
| `route-tanstack` | Mutation cache keys / invalidation with optimistic UI |

## Accessibility

- Optimistic + rollback: `aria-live="polite"` (errors: `"assertive"`)
- Never silent rollback

## Mode behavior

| Mode | Action |
|---|---|
| audit | Scan each selected leaf’s rules → findings report; no edits |
| check | Scan + fix each leaf rule-by-rule + gate |
| write | Align + implement under selected leaves + gate |

## Done when

Selected leaves applied under this main; leaves never reported as separate top-level runs; rapid-click guarded; server truth on commit (write/check).
