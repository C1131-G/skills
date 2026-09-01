import type { ESTree } from "@oxlint/plugins";

/** Hooks that read from the TanStack Query cache. */
const QUERY_HOOKS = new Set([
  "useQuery",
  "useQueries",
  "useSuspenseQuery",
  "useSuspenseQueries",
  "useInfiniteQuery",
  "useSuspenseInfiniteQuery",
]);

/** Hooks that write through the TanStack Query cache. */
const MUTATION_HOOKS = new Set(["useMutation"]);

/**
 * Names the function a call targets, for both `useQuery(...)` and `ReactQuery.useQuery(...)`.
 * Returns null for calls whose target is not a plain identifier or static member access.
 */
export function calleeName(node: ESTree.CallExpression): string | null {
  const callee = node.callee;
  if (callee.type === "Super" || callee.type === "V8IntrinsicExpression") return null;
  if (callee.type === "Identifier") return callee.name;
  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier"
  ) {
    return callee.property.name;
  }
  return null;
}

/** Reports whether a call is one of the cache-reading query hooks. */
export function isQueryHookCall(node: ESTree.CallExpression): boolean {
  const name = calleeName(node);
  return name !== null && QUERY_HOOKS.has(name);
}

/** Reports whether a call is a query or mutation hook — anything bound by the Rules of Hooks. */
export function isQueryOrMutationHookCall(node: ESTree.CallExpression): boolean {
  const name = calleeName(node);
  return name !== null && (QUERY_HOOKS.has(name) || MUTATION_HOOKS.has(name));
}
