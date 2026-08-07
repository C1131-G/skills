---
name: audit-react-effects
role: main
description: >
  MAIN. Modes: bare=audit report, :check=fix, :write=apply. useEffect external sync only; eliminate the rest.
disable-model-invocation: true
---

# audit-react-effects

**Main skill** (`role: main`). Modes:

| Invoke | Mode |
|---|---|
| `audit-react-effects` | audit - report only, no edits |
| `audit-react-effects:check` | audit + fix |
| `audit-react-effects:write` | implement / apply under this skill's rules |

On write/check, ALWAYS (enforce-*) still applies when stack matches. Not a leaf - invoke by this name.

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
