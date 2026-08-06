---
name: audit-react-effects
description: useEffect audit — external sync only, named functions, eliminate the rest. Called by skill-master / route-react-async-ui / use-tanstack-router.
disable-model-invocation: true
---

# audit-react-effects

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

Every touched `useEffect` is justified external sync with named functions, or eliminated.
