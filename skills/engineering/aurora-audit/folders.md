# Folders — where code lives

Code is grouped by **product domain**, not by file type. A reader should find everything about "threads" in one folder.

## The shape

```
app/            routes only: page.tsx, layout.tsx, error.tsx, not-found.tsx, api/
features/
  <domain>/
    <domain>-queries.ts        server reads   (import 'server-only')
    <domain>-actions.ts        server writes  ('use server')
    <domain>-cache.ts          tag strings + client query keys, when shared
    <domain>-query-options.ts  client data-library queries, when used
    components/                server + client components, each with its skeleton
    hooks/                     use-*.ts used only by this feature
    types/                     types imported by several files in the feature
    utils/                     pure helpers (parsers, reducers, date math)
    providers/                 a provider that belongs to this domain
components/
  ui/           primitives: button, skeleton, spinner, animated-suspense, error-boundary
  theme/        theme provider + toggle
  scripts/      pre-hydration <script> components
  <shell>.tsx   app-shell singletons used once (site-header, mail-sidebar)
lib/            db.ts, utils.ts, non-domain subsystems
hooks/ types/   only for code shared by two or more features
```

Real example: `next16-mail/features/thread/` holds `thread-queries.ts`, `thread-actions.ts`, `thread-cache.ts`, `components/`, `providers/compose-provider.tsx`, `types/thread.ts`.

## Rules

- **F1** Domain code lives in `features/<domain>/`, not in `app/`, `lib/` or a flat `components/`.
- **F2** Feature folders are domains a user would name (thread, booking, channel, drop). Not database tables, not technical layers (`services/`, `api/`, `models/`).
- **F3** Sub-concepts fold into their parent. Star, like, bookmark, reaction, follow live with the thing they attach to. Auth, session and current user are one `user` folder.
- **F4** Files that export a feature contract start with the folder name: `thread-queries.ts`, `booking-cache.ts`, `user-session.ts`. Not `queries.ts`, `session.ts`, `favorite-actions.ts` inside `event/`.
- **F5** A feature with one query, one action and one button is folded into its parent instead.
- **F6** No `common/`, `shared/` or `misc/` folders. Used everywhere → `components/ui/`. Used once → top level of `components/`.
- **F7** Root `hooks/` and `types/` hold only code imported by two or more features. Single-feature code stays in that feature.
- **F8** File names are kebab-case and components are named exports (`export function ThreadList`), unless the project's `AGENTS.md` says otherwise.

## Find violations

```bash
ls features app components lib
find . -path ./node_modules -prune -o -type d \( -name common -o -name shared -o -name services -o -name misc \) -print
find features -maxdepth 2 -name '*.ts' | grep -vE 'features/([^/]+)/\1-' | grep -vE '/(index|types)\.ts$'
grep -rln "export default" features components --include=*.tsx | grep -v generated
find features components app -name '*[A-Z]*.tsx'
```

For F3/F5, list each feature folder with its file count; a folder with 1–3 files is a fold-in candidate — read it before deciding.

## Fix

Move the file to its owning feature, rename to the `<folder>-*` prefix, and update imports in the same change. Never leave a re-export shim at the old path.
