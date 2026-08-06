---
name: tanstack-table
description: TanStack Table — headless, row models, server mode. Called by master / tanstack router.
disable-model-invocation: true
---
# TanStack Table

Apply these rules whenever building or reviewing a data table using `@tanstack/react-table`.

## 1. It's headless — own the markup, don't fight that

TanStack Table returns state and handlers; it renders no HTML of its own. Every `<table>`/`<thead>`/`<tr>`/`<td>` element is written by hand (or via a UI kit's primitives) and driven by the table instance. Don't look for a built-in styled table component — there isn't one, and that's the point: it works with any markup/CSS/UI library.

## 2. Define columns once, outside the render path, fully typed

Column definitions should be a stable reference, not recreated on every render — define them at module scope (or `useMemo` if they depend on props/state) so the table doesn't treat them as new on every re-render:

```tsx
const columns: ColumnDef<Product>[] = [
  { accessorKey: "name", header: "Product Name" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "stock", header: "Stock" },
];
```

Use `accessorFn` instead of `accessorKey` when the displayed value is derived (combining two fields, formatting), rather than post-processing `accessorKey`'s raw value in the cell renderer every time.

## 3. Add row models only for the features actually enabled

`getCoreRowModel()` is always required. Sorting, filtering, and pagination are separate, opt-in row models — only include the ones actually used, both to keep the bundle smaller and to keep the table's behavior intentional rather than accidentally enabling something no UI exposes:

```tsx
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),       // only if sorting UI exists
  getFilteredRowModel: getFilteredRowModel(),   // only if filtering UI exists
  getPaginationRowModel: getPaginationRowModel(), // only if pagination UI exists
});
```

## 4. Client-side vs. server-side (manual) mode is a real decision, not a default

- **Client-side** (the row models above, no `manual*` flags): the table has the full dataset already in memory and does sorting/filtering/pagination itself. Fine for datasets small enough to load in full.
- **Server-side/manual**: for large datasets, set `manualPagination: true` / `manualSorting: true` / `manualFiltering: true` and supply `pageCount` yourself. In this mode the table only tracks *state* (which page, which sort, which filters) — it doesn't slice the data itself; the actual sorting/filtering/pagination happens on the backend, driven by that state.

```tsx
const table = useReactTable({
  data,               // already the correct page/sort/filter from the server
  columns,
  pageCount: totalPageCount,
  state: { pagination, sorting, columnFilters },
  onPaginationChange: setPagination,
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  getCoreRowModel: getCoreRowModel(),
});
```

Don't mix modes on the same concern — e.g. `manualSorting: true` alongside `getSortedRowModel()` actively sorting client-side too; pick one authority for each feature.

## 5. In server-side mode, let table state be the query key — don't hand-roll a `useEffect` fetch

The table's `pagination`/`sorting`/`columnFilters` state is exactly what a data-fetching query key should be built from. Feed that state into a TanStack Query `queryOptions` factory (see `tanstack-query`) so a state change naturally produces a new/updated query, instead of a `useEffect` that watches those state values and calls `fetch` manually — that `useEffect` pattern is precisely the kind of effect `react-effect-audit` flags, since TanStack Query's own reactivity to a changed query key already replaces it:

```tsx
// Avoid: manual effect-driven fetch on every state change
useEffect(() => {
  fetchUsers({ pagination, sorting, columnFilters }).then(setData);
}, [pagination, sorting, columnFilters]);

// Prefer: state feeds a query key, TanStack Query handles the rest
const { data } = useQuery(usersOptions({ pagination, sorting, columnFilters }));
```

## 6. Render cells/headers with `flexRender`, not by calling the definition directly

`header`/`cell` in a column definition can be a plain string, a function, or a component — `flexRender` handles all three correctly. Calling `cell.column.columnDef.cell` directly (or otherwise reimplementing this resolution) breaks the moment a column definition changes shape:

```tsx
{table.getHeaderGroups().map((headerGroup) =>
  headerGroup.headers.map((header) => (
    <th key={header.id}>
      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
    </th>
  ))
)}
```

## 7. Keep table-instance state (selection, visibility) in the table, not duplicated elsewhere

Row selection and column visibility are supported as first-class table state (`rowSelection`, `columnVisibility`) — read/derive from `table.getState()`/the row/column APIs rather than maintaining a separate parallel `useState` that has to be kept in sync with the table's own notion of what's selected/visible.

## Applying these rules

- **New table**: decide client-side vs. server-side mode up front based on expected dataset size (rule 4); if server-side, wire table state into a TanStack Query key from the start (rule 5) rather than adding a `useEffect` fetch that gets refactored later.
- **Reviewing existing code**: flag column definitions recreated inline on every render, mixed manual/client-side handling of the same feature (e.g. both `manualSorting` and an active `getSortedRowModel`), a `useEffect`-driven fetch reacting to table state instead of a query-key-driven one, direct calls into `columnDef.cell`/`columnDef.header` instead of `flexRender`, and selection/visibility state duplicated outside the table instance.

