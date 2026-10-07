# Remove ESLint and Prettier

Ultracite (step 6) replaces both with Oxlint and Oxfmt. Remove every trace first so nothing runs two linters or fights over formatting.

## 1. Packages

List what is installed, then remove all matches from every `package.json` in the repo (root and each workspace):

```bash
grep -rhoE '"(eslint[^"]*|@eslint/[^"]*|@typescript-eslint/[^"]*|typescript-eslint|@next/eslint-plugin-next|@rushstack/eslint-patch|prettier[^"]*|@prettier/[^"]*|@ianvs/prettier-plugin[^"]*|@trivago/prettier-plugin[^"]*)"' --include=package.json --exclude-dir=node_modules .
```

```bash
pnpm remove eslint eslint-config-next @eslint/eslintrc @eslint/js typescript-eslint prettier eslint-config-prettier ...
```

Use the project's package manager and the exact names the grep printed; in a monorepo, run it per workspace (`pnpm --filter <name> remove ...` or `-w` for the root).

**Not a removal target:** `oxlint-plugin-*` and ESLint plugins Ultracite loads as Oxlint JS plugins (`--js-plugins`) — those are added back on purpose in step 6.

## 2. Config files

Delete, in every workspace:

- `eslint.config.{js,mjs,cjs,ts,mts}`, `.eslintrc`, `.eslintrc.{js,cjs,json,yml,yaml}`, `.eslintignore`
- `prettier.config.{js,mjs,cjs,ts}`, `.prettierrc`, `.prettierrc.{json,json5,yml,yaml,js,cjs,mjs,toml}`, `.prettierignore`
- A shared config package (`packages/eslint-config`, `packages/prettier-config`) — remove the package and every `workspace:*` dependency on it.

## 3. `package.json` keys and scripts

- Delete top-level `eslintConfig` and `prettier` keys.
- Delete scripts that call `eslint`, `next lint`, or `prettier` (`lint`, `lint:fix`, `format`, `format:check`). Ultracite writes its own `check`/`fix` scripts; re-add `lint`/`format` as aliases to them only if CI or teammates call those names.
- `lint-staged` entries running `eslint`/`prettier` — delete the entry (Ultracite rewrites it if the user picks `lint-staged`).

## 4. Code comments

```bash
grep -rnE 'eslint-disable|eslint-enable|prettier-ignore|global [a-z]+ *\*/' --include='*.{ts,tsx,js,jsx,mjs,cjs,css,md,mdx}' --exclude-dir={node_modules,.next} .
```

Delete each directive. Where it suppressed a real rule, note it — the matching Oxlint rule may flag the same line in step 7, and the fix there is in code or an `oxlint-disable` with a reason, decided then.

## 5. Next.js config

Remove an `eslint` key from `next.config.*` (Next.js 16 dropped `next lint` and the key with it).

## 6. Editor, hooks, CI

- `.vscode/settings.json`: remove `eslint.*`, `prettier.*`, `"editor.defaultFormatter": "esbenp.prettier-vscode"`, and `source.fixAll.eslint` in `editor.codeActionsOnSave`. Ultracite writes its own editor settings.
- `.vscode/extensions.json`: remove `dbaeumer.vscode-eslint` and `esbenp.prettier-vscode` from `recommendations`.
- `.husky/*`, `lefthook.yml`, `.pre-commit-config.yaml`: remove `eslint`/`prettier` commands.
- `.github/workflows/*`, other CI: remove lint/format steps that call them; step 6 adds `ultracite check`.
- `.editorconfig` stays — Oxfmt reads it.

## 7. Reinstall and prove it is gone

Reinstall so the lockfile drops the packages, then:

```bash
grep -rniE 'eslint|prettier' --exclude-dir={node_modules,.next,.git} --exclude='*lock*' .
```

Expected: no output. Any hit is either removed or explained to the user (e.g. a `CHANGELOG.md` mention).
