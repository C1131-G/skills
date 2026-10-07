# `next.config.ts` (Next.js 16.4)

Source of truth: the [Next.js 16.4 release post](https://nextjs.org/blog/next-16-4) and the `next.config.js` API reference. Re-check both before writing — experimental keys move between releases. A key `next build` warns about is removed, never silenced.

## Ask first

Detect what you can (monorepo, installed icon packages, Playwright), then confirm in one batch:

| Question | Options (recommended first) | Drives |
|---|---|---|
| Where does this app run in production? | Vercel / managed host · Self-hosted Node or Docker · Electron or another launcher of a bundled server | `output`, `outputFileTracingRoot` |
| Workspace packages this app imports as source? | detected names · none | `transpilePackages`, `turbopackAdditionalRoots` |
| Largest Server Action payload (file uploads)? | 1 MB default · 6 MB · other | `serverActions.bodySizeLimit` |
| Upgrade reminders during `next dev`/`build`? | `latest` · `security` (Next default) · `experimental-future` · off | `agentUpgrade` |
| Let the agent draft feedback reports to the Next.js team? | off · on (needs telemetry) | `agentFeedback` |
| Turn on experimental dev-speed flags? | yes · no | `turbopackGc`, `turbopackLazyDynamicImports` |

`exposeTestingApiInProductionBuild` is included only when `@next/playwright` `instant()` tests exist or are planned (`next-cache-components-optimizer`). `optimizePackageImports` lists only installed barrel packages that are **not** already on Next's built-in list.

## Template

Write this, then delete every line marked `// if:` whose condition the answers rule out (and the `path` import if nothing uses it).

```ts
import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    brief: { expire: 300, revalidate: 60, stale: 30 },
    moderate: { expire: 86_400, revalidate: 3600, stale: 300 },
    realtime: { expire: 30, revalidate: 10, stale: 0 },
    reference: { expire: 604_800, revalidate: 86_400, stale: 3600 },
  },
  experimental: {
    /**
     * Policy for `next upgrade --agent` and the upgrade reminder shown during
     * `next dev` / `next build`. Never upgrades on its own.
     */
    agentUpgrade: "latest",
    agentFeedback: false,
    exposeTestingApiInProductionBuild: process.env.EXPOSE_TESTING_API === "1", // if: instant() tests
    /**
     * Instant navigation validation in dev — surfaces blocking client-nav
     * paths that page-load Suspense alone doesn't catch.
     */
    instantInsights: {
      validationLevel: "warning",
    },
    /**
     * Tree-shake barrel imports from icon packages per cold start.
     */
    optimizePackageImports: ["@phosphor-icons/react"], // if: installed and not built in
    serverActions: {
      bodySizeLimit: "6mb", // if: uploads exceed the 1 MB default
    },
    /**
     * Linked workspace packages outside this app's root that Turbopack must
     * follow through symlinks.
     */
    turbopackAdditionalRoots: { // if: monorepo with linked packages, or a global virtual store
      workspacePackages: { path: path.join(import.meta.dirname, "../../packages") },
    },
    /**
     * Drop compilation work that is no longer reachable from memory and the
     * disk cache during long dev sessions.
     */
    turbopackGc: true, // if: dev-speed flags
    /**
     * Compile client-side `import()` targets only when the browser asks.
     */
    turbopackLazyDynamicImports: true, // if: dev-speed flags
    /**
     * Native Rust port of the React Compiler inside Turbopack instead of the
     * Babel transform: faster compiles, less memory.
     */
    turbopackRustReactCompiler: true,
    /**
     * Shell out to local `tsc` during `next build` typecheck instead of
     * requiring typescript/lib/typescript.js, so a move to the native
     * TypeScript 7 compiler needs no config change.
     * @see https://github.com/vercel/next.js/pull/95639
     */
    useTypeScriptCli: true,
  },
  /**
   * Self-contained server bundle (.next/standalone) for Docker, a Node host,
   * or a desktop shell that launches it as a child process. Keeps every
   * server feature, which `output: "export"` would give up.
   */
  output: "standalone", // if: self-hosted or Electron
  /**
   * Trace from the monorepo root so workspace packages land in the
   * standalone bundle. The server entry moves to
   * .next/standalone/<app path>/server.js as a result.
   */
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."), // if: standalone in a monorepo
  /**
   * Prefetch one App Shell per route (shared across Links). Pair with
   * Link prefetch={true} + segment `prefetch = 'partial'` for
   * URL/searchParams-aware prefetches.
   */
  partialPrefetching: true,
  reactCompiler: true,
  transpilePackages: ["@workspace/ui"], // if: workspace packages shipped as TS source
  /**
   * Statically type next/link href and next/navigation push/replace/prefetch
   * against the App Router route map (.next/types/routes.d.ts).
   */
  typedRoutes: true,
};

export default nextConfig;
```

Strip the `// if:` markers from the kept lines. Keys stay alphabetical, matching the source config.

Also:

- Add `"analyze": "next analyze"` to scripts — the Turbopack analyzer replaces `@next/bundle-analyzer`. Remove `@next/bundle-analyzer` and the `ANALYZE` wrapper if present.
- Add `babel-plugin-react-compiler` only if `next build` asks for it; the Rust compiler does not.

## Why each key

| Key | What it does | Why it is on |
|---|---|---|
| `cacheComponents` | Turns on the Cache Components model: `'use cache'`, `cacheLife`, `cacheTag`, static shells with streamed dynamic holes | Recommended for every app from 16.4; the default in Next 17 |
| `cacheLife` | Named cache profiles: `stale` (client may reuse), `revalidate` (background refresh), `expire` (hard limit), in seconds | One vocabulary — `cacheLife("moderate")` — instead of magic numbers per call site. `realtime` ≈ seconds, `brief` ≈ minutes, `moderate` ≈ a day, `reference` ≈ a week |
| `partialPrefetching` | Prefetches one shared App Shell per route; `prefetch = 'partial'` segments add URL-aware data | Part of the Cache Components model since 16.4; makes client navigations instant |
| `reactCompiler` | Auto-memoizes components and hooks | Removes hand-written `useMemo`/`useCallback` |
| `experimental.turbopackRustReactCompiler` | Runs that compiler natively in Turbopack | 16.4: ~30% less memory, ~15% faster compiles than 16.3, and skips files that need nothing |
| `typedRoutes` | Type-checks `href` and `router.push` against real routes | A broken link becomes a type error |
| `experimental.useTypeScriptCli` | `next build` runs the project's `tsc` binary | Same checker in build and editor; TypeScript 7 drops in |
| `experimental.agentUpgrade` | Policy for `next upgrade --agent` and the dev/build upgrade reminder | `latest` keeps the app current; `security` only flags advisories |
| `experimental.agentFeedback` | Agent drafts bug reports for review; nothing sends without a click | Off unless the user opts in; requires telemetry |
| `experimental.instantInsights` | Dev warnings for client navigations that block | Catches non-instant navigations Suspense on page load misses |
| `experimental.exposeTestingApiInProductionBuild` | Exposes the testing API `instant()` needs in a prod build | Env-gated so it is never on in a real deploy |
| `experimental.optimizePackageImports` | Rewrites barrel imports to per-module imports | Big icon barrels cost cold-start time |
| `experimental.serverActions.bodySizeLimit` | Max Server Action request body | Default 1 MB rejects file uploads |
| `experimental.turbopackGc` | Garbage-collects stale compile work in memory and on disk | Long dev sessions stay lean |
| `experimental.turbopackLazyDynamicImports` | Compiles `import()` targets on first request | Less up-front dev compilation |
| `experimental.turbopackAdditionalRoots` | Lets Turbopack follow symlinks outside the project root | Linked monorepo packages and pnpm/Bun global virtual stores |
| `output: "standalone"` | Emits `.next/standalone` with a minimal `node_modules` and `server.js` | Self-hosting without the full install; keeps server features `export` drops |
| `outputFileTracingRoot` | Root for file tracing | Workspace packages land in the standalone bundle |
| `transpilePackages` | Compiles listed packages from source | Workspace UI packages ship raw TS/TSX |

## Deliberately left out

| Not used | Why |
|---|---|
| `@next/bundle-analyzer` | Webpack-only; does nothing on a Turbopack build. `next analyze` is the Turbopack analyzer (route summary, snapshots, diffs) |
| `experimental.turbopackPluginRuntimeStrategy: "workerThreads"` | Falls back to child processes on Node ≥ 24.13.1 anyway; add only if the app runs Babel/PostCSS/webpack loaders on an older Node |
| `eslint` | Removed in Next 16; linting is Ultracite's job |
| `output: "export"` | Gives up Server Actions, Cache Components runtime and Partial Prefetching |
