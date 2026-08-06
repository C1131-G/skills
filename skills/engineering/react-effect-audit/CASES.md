# useEffect cases

Disclosed from `react-effect-audit`. Open when eliminating a specific anti-pattern.

## 1. Transforming data

```tsx
// Bad — double render
useEffect(() => { setFiltered(todos.filter(t => !t.completed)); }, [todos]);

// Good
const filtered = todos.filter(t => !t.completed);
// or useMemo if expensive
```

## 2. User events

```tsx
// Bad — flag + watcher
const [submitted, setSubmitted] = useState(false);
useEffect(() => {
  if (submitted) { performSearch(query); setSubmitted(false); }
}, [submitted, query]);

// Good
function handleSubmit(e: FormEvent) {
  e.preventDefault();
  performSearch(query);
}
```

## 3. Reset on prop change

```tsx
// Bad
useEffect(() => { setComment(""); }, [userId]);

// Good
<UserProfile key={userId} userId={userId} />
```

Heavy components: reset only needed fields in the event handler instead of full remount.

## 4. Data fetching

```tsx
// Bad
useEffect(() => { fetch(`/users/${id}`).then(r => r.json()).then(setUser); }, [id]);

// Good — TanStack Query / route loader
const { data: user } = useQuery({ queryKey: ["user", id], queryFn: () => fetchUser(id) });
```

Mutations: `useMutation` + invalidate in `onSuccess`; call `mutate` from the handler.

## 5. Notify parent

```tsx
// Bad
useEffect(() => { onChange(isOn); }, [isOn, onChange]);

// Good — same handler, React batches
function updateToggle(next: boolean) {
  setIsOn(next);
  onChange(next);
}
```

## 6. Chaining effects

```tsx
// Bad — cascading effects
useEffect(() => setCity(""), [country]);
useEffect(() => setDistrict(""), [city]);

// Good
function handleCountryChange(val: string) {
  setCountry(val);
  setCity("");
  setDistrict("");
}
const shipping = country && city && district ? calculate(country, city, district) : 0;
```

## 7. External store

```tsx
// Prefer useSyncExternalStore over useEffect + setState for browser stores
function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  );
}
```

## When useEffect is correct

| Use case | Hook |
|---|---|
| WebSocket / long-lived connection | `useEffect` (named) |
| Third-party widget (maps, editors) | `useEffect` (named) |
| DOM measurement | `useLayoutEffect` |
| IntersectionObserver / ResizeObserver | `useEffect` (named) |
| Page title sync | `useEffect` (named) |
| Mount analytics | `useEffect` (named) — track actions in handlers, not via lastAction flag |

## ESLint (optional)

```bash
npm install --save-dev eslint-plugin-react-you-might-not-need-an-effect
```
