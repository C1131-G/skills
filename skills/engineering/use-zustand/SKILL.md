---
name: use-zustand
description: Use Zustand for client-only React state with slices, selectors, stable actions, and clear separation from server caches. Use when building or reviewing Zustand stores.
---
# use-zustand

Use this skill directly for Zustand state. Pair it with `use-tanstack-query` to keep client state and server state in their proper owners.

Also apply `enforce-code-quality` and `enforce-typescript-strict` to files in scope.

Apply these rules whenever writing or reviewing Zustand stores in a React project.

## 1. Zustand is for client-only state — don't overlap with TanStack Query

Zustand owns UI/client state: sidebar open/closed, multi-step form data, theme, cart contents the user is actively editing. Server data (anything fetched from an API) belongs in TanStack Query, not duplicated into a Zustand store — see `use-tanstack-query`. Mixing the two responsibilities (e.g. copying fetched data into Zustand "to make it easier to access") creates two sources of truth that can drift out of sync.

## 2. No `Provider` needed, but client-only

A Zustand store is a module-level singleton — no context wrapper required, and it's accessible from anywhere by importing the hook. But that also means it depends on browser APIs and per-client state, so:

- Only initialize/use Zustand stores in Client Components (`'use client'` in Next.js).
- Never create or read a Zustand store in a Server Component — there's no "per-request" isolation the way there is with a fresh `QueryClient`, so doing so risks leaking state between users/requests.

## 3. Organize large stores with the slices pattern, not one flat blob

A single store with unrelated concerns crammed together (user, cart, UI theme, notifications, all in one object) gets hard to navigate and reason about. Split by domain into slices, then compose them into one `create()` call:

```ts
// userSlice.ts
export interface UserSlice {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
});

// cartSlice.ts
export interface CartSlice {
  items: CartItem[];
  addItem: (item: CartItem) => void;
}

export const createCartSlice: StateCreator<CartSlice> = (set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
});

// store.ts
type AppState = UserSlice & CartSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createUserSlice(...a),
  ...createCartSlice(...a),
}));
```

Only reach for genuinely **separate stores** (not slices) when two domains are truly independent and never need to interact (e.g. an auth store vs. an analytics-only store) — multiple stores add coordination overhead, so default to slices within one store first.

## 4. Use named action methods, not raw `set()` calls from components

Expose actions as named functions on the store; don't call the store's `set` directly from a component.

```ts
// Avoid: works, but not semantic — components need to know the state shape
const set = useAppStore((state) => state.set);
set({ theme: "dark" });

// Prefer: named, self-documenting actions
const setTheme = useAppStore((state) => state.setTheme);
setTheme("dark");
```

Use `get()` inside a slice's own actions to read other state or call other slices' actions (e.g. a `logout` action that also clears the cart) — but watch for circular dependencies between slices calling into each other.

## 5. Always select the specific slice of state you need — never the whole store

```ts
// Avoid: re-renders on ANY store change, even unrelated fields
const state = useAppStore();

// Prefer: re-renders only when `user` changes
const user = useAppStore((state) => state.user);
```

## 6. Use `useShallow` when selecting multiple values or an object

Selecting a newly-constructed object or array from the store (e.g. `{ user, theme }`) creates a new reference on every render even if the underlying values haven't changed, causing unnecessary re-renders. Wrap it in `useShallow` so Zustand compares the selected values shallowly instead of by reference:

```ts
import { useShallow } from "zustand/react/shallow";

const { user, theme } = useAppStore(
  useShallow((state) => ({ user: state.user, theme: state.theme }))
);
```

## 7. Use the `immer` middleware for nested state updates

Manually spreading multiple levels of nested state to update one field is error-prone and verbose. The `immer` middleware lets you write direct "mutation" syntax that's actually applied immutably under the hood:

```ts
import { immer } from "zustand/middleware/immer";

const useStore = create<State>()(
  immer((set) => ({
    nested: { deeply: { value: 0 } },
    increment: () =>
      set((state) => {
        state.nested.deeply.value += 1; // looks mutable, is actually immutable
      }),
  }))
);
```

Skip `immer` for very high-frequency updates (e.g. 60fps animation state) where its overhead matters; for typical CRUD-style state it's a readability win worth the small cost.

## 8. Type stores with the curried `create<State>()(...)` form

Plain `create((set) => ({...}))` can't be reliably inferred by TypeScript for anything beyond a trivial store, due to how the state generic is invariant. Always use the curried form:

```ts
interface CounterState {
  count: number;
  increment: () => void;
}

const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

## 9. Don't store derived/computed values — compute them in a selector or the component

If a value can be calculated from other state already in the store (a total from a list of items, a boolean from a status field), don't also store it as its own field — it will drift out of sync the moment one update path forgets to recompute it. Compute it in the selector, or as a plain derived value in the component:

```ts
// Avoid: a separate `itemCount` field that must be kept in sync manually
addItem: (item) => set((state) => ({ items: [...state.items, item], itemCount: state.itemCount + 1 })),

// Prefer: derive it at read time
const itemCount = useCartStore((state) => state.items.length);
```

## 10. Use `persist` for state that should survive across sessions, `devtools` only in development

- Use the `persist` middleware (backed by `localStorage`/`sessionStorage`, or a custom storage adapter) for state that genuinely needs to survive a page reload or new session (cart contents, user preferences) — not for state that should reset on every visit.
- Include a `version` and, if the shape ever changes, a `migrate` function in `persist`'s options so old persisted state doesn't silently break the app after a schema change.
- Use the `devtools` middleware to integrate with Redux DevTools for inspecting state changes during development, but make sure it isn't enabled in production builds.

```ts
export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({ theme: "light", setTheme: (theme) => set({ theme }) }),
      { name: "settings-storage", version: 1 }
    )
  )
);
```

## 11. Use `devtools` to trace state flow, and pair it with React DevTools to catch unnecessary re-renders

`devtools` isn't just a nice-to-have logger — use it actively to debug *why* state changed, not just *that* it changed:

- **Name every action** so the devtools timeline shows a meaningful trail instead of an anonymous `set` entry for every update. Pass a third argument to `set` with an action name/type:

  ```ts
  addItem: (item) =>
    set(
      (state) => ({ items: [...state.items, item] }),
      false,
      "cart/addItem" // shows up as this label in Redux DevTools' action list
    ),
  ```

- **Name each store** via `devtools(..., { name: "cart-store" })` when a project has multiple stores, so the devtools panel doesn't show an ambiguous mix of updates from every store at once.
- **Use the devtools timeline to confirm the actual state-flow order** when a bug looks like a race condition or an update-ordering issue — step through the action list to see exactly what changed, when, and with what previous/next state, rather than guessing from `console.log`s scattered through action code.
- **Diagnosing unnecessary re-renders is a separate tool, not something `devtools` itself shows.** Use the React DevTools Profiler (or `why-did-you-render` in development if you need call-site-level detail) to see which components re-rendered on a given state change and why. If a component re-renders on a store update that didn't touch the fields it selects, that's a signal you're missing a selector (rule 5) or a `useShallow` wrap (rule 6) — go fix the selector, not the store.

## 12. Make stores testable: export the raw creator, not just the bound hook

Export both the hook (for components) and the underlying `StateCreator`/store-creation function (for tests), so tests can create a fresh, isolated store instance per test instead of sharing the module-level singleton across the whole test suite (which leaks state between tests).

## Applying these rules

- **New store**: start with a single store using the slices pattern from day one if more than one domain is involved; type it with the curried `create<State>()(...)` form; add `persist`/`devtools` only if the state actually needs them.
- **Reviewing existing code**: flag whole-store selection with no selector function, raw `set()` calls from components instead of named actions, derived state stored as its own field, server-fetched data duplicated into Zustand instead of TanStack Query, any store touched from a Server Component, unnamed actions/stores that make the devtools timeline hard to read, and any component re-rendering on unrelated store changes (missing selector or `useShallow`).

