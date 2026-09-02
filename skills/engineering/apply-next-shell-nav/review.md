# Reviewing an existing shell

Disclosed reference. Open from SKILL.md when the task is reviewing or fixing a shell rather than building one — the rules it is judged against are in [SKILL.md](SKILL.md).

## Anti-patterns

| Avoid | Prefer |
|---|---|
| Sidebar under each `page.tsx` | Layout-owned sidebar |
| Guessing product pane in SSR fallback | Skeleton or multi-pane + pre-paint script |
| Whole-page Suspense for one table | Page identity sync; rows only in Suspense |
| Uncached cookie user on every RSC request | `"use cache: private"` + narrow Suspense |
| Parallel-route pane that remounts on every section change | Pathname-selected panes in one client tree |
| Optimistic pane switch fighting the URL | URL is source of truth; local state only for open animation |
| `prefetch={true}` “for session data” | Private cache + default link prefetch |

## Reviewing existing code

1. Is the sidebar only in a parent layout?  
2. Is nested open state lost on soft nav?  
3. Deep-link first paint: correct title/area without waiting on tables?  
4. Suspense fallback: wrong product or neutral?  
5. Cookie/user reads: private-cached and isolated?  
6. Any `key={pathname}` or route-local sidebar remounting chrome?
