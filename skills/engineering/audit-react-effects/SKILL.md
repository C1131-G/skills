---
name: audit-react-effects
description: Audit and refactor React useEffect usage so effects synchronize only with external systems. Use for derived state, event logic, data fetching, subscriptions, and effect dependency problems.
---

# audit-react-effects

Use this skill directly whenever React effects are being written, reviewed, or removed. Pair it with the relevant data, router, or state skill when another system should own the behavior.

Also apply `enforce-code-quality` and, for TypeScript code, `enforce-typescript-strict` to files in scope.

> Before another `useEffect`: **is this syncing with an external system?** If not, use a better pattern.

## Decision tree

```
External system? (WebSocket, browser API, third-party widget, DOM measure, timer)
│
├── YES → useEffect allowed — NAMED setup + NAMED cleanup
│
└── NO
    ├── Derive data?           → compute in render / useMemo
    ├── User event?            → event handler
    ├── Reset on prop change?  → key prop
    ├── Fetch data?            → TanStack Query / route loader
    ├── Notify parent?         → call parent in same handler
    ├── Chain effects?         → one handler + derived values
    └── External store?        → useSyncExternalStore
```

## Named function rule

```tsx
useEffect(function connectToWebSocket() {
  const ws = new WebSocket(url);
  function handleMessage(e: MessageEvent) { /* ... */ }
  ws.addEventListener("message", handleMessage);
  return function disconnectWebSocket() {
    ws.removeEventListener("message", handleMessage);
    ws.close();
  };
}, [url]);
```

## Patterns

Case-by-case before/after: [CASES.md](CASES.md)

## Checklist (before commit)

- [ ] Syncing with something React does not control?
- [ ] Named setup + cleanup?
- [ ] Not derive / event / key / Query / syncExternalStore?

## Done when

Every `useEffect` in **task scope** (files you touch and existing feature neighbors) is justified external sync with named functions, or eliminated — not only effects you just added.
