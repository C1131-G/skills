# Testing — Playwright per page, `instant()` for loading

Every reference app ships end-to-end tests, one spec per route, run in CI on every push and PR.

## What it looks like

```ts
// next16-mail/tests/thread-page.spec.ts
import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';

test.describe('Thread (/[mailbox]/[threadId])', () => {
  test('a row in view prefetches the thread header, and message content waits for the navigation', async ({ page }) => {
    await page.goto('/inbox');
    await instant(page, async () => {
      await row.getByRole('link').click();
      await expect(page.getByRole('heading', { level: 1, name: 'Reading pane explorations, header first' })).toBeVisible();
      await expect(page.getByTestId('thread-latest')).toHaveCount(0);   // gated by navigation()
    });
    await expect(page.getByTestId('thread-latest')).toBeVisible();      // streams after
  });
});
```

## Rules

- **TS1** Playwright e2e tests live in `tests/`, one `<route>-page.spec.ts` per page (`inbox-page.spec.ts`, `booking-flow.spec.ts` for a multi-page flow), each in a `test.describe('<Name> (/<route>)')`.
- **TS2** Locators prefer roles and accessible names (`getByRole('link', { name })`); `data-testid` only where no accessible name exists.
- **TS3** With Cache Components, navigations that should feel instant are locked in with `instant()` from `@next/playwright`: assert what is in the shell inside the callback, and what streams after outside it.
- **TS4** Each spec covers the page's main mutation and its feedback (optimistic change, error toast), not only that the page renders.
- **TS5** A CI workflow (`.github/workflows/e2e.yml`) installs, generates, seeds, builds, and runs `test:e2e` on push and pull request.

## Find violations

```bash
ls tests e2e 2>/dev/null; ls .github/workflows 2>/dev/null
grep -n '"@playwright/test"\|"@next/playwright"' package.json
for p in $(find app -name page.tsx); do echo "$p"; done                 # compare against spec files
grep -rln "instant(" tests e2e 2>/dev/null
grep -rc "getByTestId" tests | sort -t: -k2 -n | tail -5
```

List every route next to its spec; a route with no spec is a TS1 `FAIL` for that route. Run the suite if the project can (`pnpm test:e2e`) and report the real result.

## Fix

Add a spec per uncovered route; wrap navigation assertions in `instant()`; replace test ids with role locators where an accessible name exists; add the CI workflow.
