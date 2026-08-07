---
name: test-backend
role: leaf
parent: route-backend
description: LEAF of route-backend — not a main skill. Vitest pyramid, DB isolation, AAA.
disable-model-invocation: true
---
# test-backend

**Leaf — not main.** Parent: `route-backend`. If invoked alone, load parent with the same mode and Decision-select this leaf only. Do not report this name as a top-level run.

Apply these rules whenever writing or reviewing backend tests. Assumes Vitest as the test runner, per the project's stack.

## 1. Follow the test pyramid — most tests should be fast unit tests

Unit tests check one function or module in isolation; integration tests verify that multiple modules or services work correctly together; end-to-end tests simulate a real user journey through the whole system. Keep the shape a pyramid: a wide base of fast unit tests, a much smaller number of integration tests, and only a handful of E2E tests for critical flows — not inverted.

| Layer | What it tests | Speed |
|---|---|---|
| **Unit** | One function/service in isolation, dependencies mocked | Fast — run on every save |
| **Integration** | Multiple modules together (e.g. service → repository → real test DB) | Slower — run on every commit |
| **E2E** | A full critical user journey through the real API/app | Slowest, flakiest — run on merge to main only |

## 2. Test the request/controller/service layers with the right tool per layer

- **Service/business logic** (per `design-backend-architecture`'s layering): unit test directly, no HTTP involved. Mock the repository layer.
- **Routes/controllers as a whole**: use an HTTP-level testing library (e.g. Supertest) that can send requests directly against the app instance without binding to a real network port — fast and deterministic, and it gives you a true contract test of what the API actually returns.
- **Repository/DB queries**: integration test against a real (test) database rather than mocking the DB driver — mocking the DB layer just tests that your mocks return what you told them to, not that the query is actually correct.

## 3. Vitest config for a backend project

Use the Node environment, not jsdom (that's for frontend/DOM tests):

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,        // describe/it/expect available without importing them
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: { lines: 80, functions: 80, branches: 70 },
    },
  },
});
```

Add both a watch script and a single-run script — the bare `vitest` command starts watch mode, while `vitest run` executes once and exits, which is what CI needs:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

## 4. Coverage: aim for meaningful, not maximal

Target roughly 70-80% line coverage, with higher branch coverage specifically on critical paths (auth, payments, data writes). Pushing past ~90% has steeply diminishing returns — past that point you're mostly testing trivial getters, not catching real bugs. Put the effort into meaningful integration tests on the paths that actually matter, not chasing a coverage percentage.

## 5. Isolate database state between tests

Don't let tests leak state into each other. Wrap each test in a transaction via `beforeEach`/`afterEach` and roll it back afterward, so every test gets a clean slate that never becomes a permanent write — rather than manually cleaning up rows or relying on test execution order.

Watch for port conflicts specifically: if the app binds a real network port and Vitest runs test files in parallel workers, two workers can collide on that port. Pass the app instance directly to the HTTP-testing library instead of calling `.listen()` anywhere in test code.

## 6. Mock external services, not your own code

Mock things you don't control and that are slow/unreliable to call in a test run — third-party APIs, payment providers, email/SMS senders. Don't mock your own repository/service layer in an integration test — that defeats the purpose of the integration test, which is to verify those layers actually work together.

## 7. Structure tests with `describe`/`it`, one behavior per `it`

`describe` groups related tests; `it` defines an individual case. Each `it` should assert exactly one behavior — if a test's name needs "and" to describe what it checks, split it into two tests.

```ts
describe("createOrder", () => {
  it("creates an order when the payload is valid", async () => { ... });
  it("rejects an order with a negative quantity", async () => { ... });
  it("returns 404 when the referenced product doesn't exist", async () => { ... });
});
```

## 8. Follow Arrange-Act-Assert (AAA) in every test body

Structure each test as: set up inputs/mocks, call the thing being tested, assert the outcome — in that order, with a blank line between sections if it helps readability. Don't interleave setup and assertions.

## 9. Test behavior, not implementation

If a refactor that doesn't change any user-visible/API-visible behavior breaks a test, the test was asserting on an implementation detail rather than an outcome. Assert on what the function/endpoint returns or what side effect it produces, not on internal call counts or private structure — unless that call itself is the actual contract (e.g. asserting a specific downstream service was invoked when that's the point of the test).

## 10. Where tests live

Colocate unit tests with the module they test, following the feature-based structure in `design-backend-architecture` (e.g. `user.service.test.ts` next to `user.service.ts`). Keep integration and E2E tests in a separate top-level `tests/integration/` or `tests/e2e/` folder, since they span multiple modules and don't belong to any single feature folder.

## Applying these rules

- **New feature**: write unit tests alongside the service/logic as you build it; add at least one integration test covering the feature's main route(s) end-to-end through the real (test) DB.
- **Reviewing tests**: flag DB-layer mocking in what should be an integration test, missing tests on critical paths (auth, payments, data writes), tests asserting on implementation details, and any test suite chasing a coverage percentage over meaningful assertions.

