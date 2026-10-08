# Tooling — config, types, lint, format

The reference apps share one baseline. Check it once per project.

## What it looks like

```ts
// next16-mail/next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  serverExternalPackages: ['better-sqlite3'],
};
```

```json
// package.json scripts
"build": "prisma generate && next build",
"lint": "eslint .", "typecheck": "tsc --noEmit", "format": "prettier --write .", "test:e2e": "playwright test"
```

## Rules

- **T1** `next.config.ts` (TypeScript, typed `NextConfig`) turns on `cacheComponents`, `partialPrefetching`, `reactCompiler`, `typedRoutes` — or the project documents why one is off.
- **T2** `tsconfig.json` has `"strict": true`, `"allowJs": false`, and the `@/*` path alias; imports use `@/…` across features and `./` / `../` only inside one feature.
- **T3** `server-only` is a dependency and is imported by `lib/db.ts` and every `*-queries.ts`. The DB client is a `globalThis` singleton in dev.
- **T4** Lint enforces: `@typescript-eslint/consistent-type-imports`, `import/order` (alphabetized, `@/` before relative), `sort-keys-fix`, `react/self-closing-comp`, `no-console`, `arrow-body-style: as-needed`. Prettier owns formatting (`eslint-config-prettier`). A project on Biome/Ultracite with equivalent rules passes.
- **T5** One formatter owns style, and it sorts Tailwind classes. The reference apps use Prettier (`printWidth` 120, `singleQuote`, `trailingComma: all`, `arrowParens: avoid`, `prettier-plugin-tailwindcss`); a project set up with `setup-nextjs` (Ultracite) passes with its own formatter.
- **T6** Scripts exist for `lint`, `typecheck`, `format`, `test:e2e`, and `build` runs codegen (`prisma generate`) first.
- **T7** No `as any`, `@ts-ignore`, or non-null `!` in app code without a comment proving it safe (`enforce-typescript-strict` owns the detail). Generated code under `generated/` is ignored by lint.

## Find violations

```bash
cat next.config.* tsconfig.json .prettierrc* 2>/dev/null
ls eslint.config.* biome.json* 2>/dev/null
grep -nE '"(lint|typecheck|format|test:e2e|build)"' package.json
grep -n '"server-only"' package.json
grep -rnE "as any|@ts-ignore|@ts-expect-error" app features components lib hooks --include=*.ts --include=*.tsx
grep -rnE "from '\.\./\.\./" features app --include=*.ts --include=*.tsx     # deep relative imports → use @/
```

Then run the checks the project has — `pnpm typecheck`, `pnpm lint` — and report their real output; a failing typecheck is a `FAIL` on T2/T7 regardless of the greps.

## Fix

Add the missing flag or script; turn on `strict`; add the lint rules to the existing config rather than introducing a second linter.
