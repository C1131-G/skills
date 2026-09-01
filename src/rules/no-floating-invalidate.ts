import { defineRule } from "@oxlint/plugins";
import type { ESTree } from "@oxlint/plugins";

/** Cache operations that return a promise the mutation lifecycle must wait on. */
const AWAITABLE_CACHE_METHODS = new Set([
  "invalidateQueries",
  "refetchQueries",
  "resetQueries",
  "cancelQueries",
]);

/** Mutation lifecycle callbacks, where a discarded promise resolves the mutation too early. */
const MUTATION_CALLBACKS = new Set(["onMutate", "onSuccess", "onError", "onSettled"]);

/** Reports whether a node sits inside a mutation lifecycle callback. */
function insideMutationCallback(node: ESTree.Node): boolean {
  let current: ESTree.Node | null | undefined = node.parent;
  while (current !== null && current !== undefined) {
    if (
      current.type === "Property" &&
      !current.computed &&
      current.key.type === "Identifier" &&
      MUTATION_CALLBACKS.has(current.key.name)
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/** Names the method a call targets, for `queryClient.invalidateQueries(...)` style calls. */
function methodName(node: ESTree.CallExpression): string | null {
  const callee = node.callee;
  if (callee.type !== "MemberExpression" || callee.computed) return null;
  return callee.property.type === "Identifier" ? callee.property.name : null;
}

/**
 * Ban discarding the promise from a cache operation inside a mutation callback.
 * Without await or return, the mutation reports success before the refetch lands, so an
 * optimistic value can flash back to its old state before the real data arrives.
 */
export const noFloatingInvalidateRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Require awaiting or returning cache operations inside TanStack Query mutation callbacks.",
    },
    messages: {
      floatingInvalidate:
        "`{{method}}` returns a promise that is being discarded. Return or await it so the mutation does not settle before the cache does.",
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        const method = methodName(node);
        if (method === null || !AWAITABLE_CACHE_METHODS.has(method)) return;
        if (node.parent?.type !== "ExpressionStatement") return;
        if (!insideMutationCallback(node)) return;

        context.report({ node, messageId: "floatingInvalidate", data: { method } });
      },
    };
  },
});
