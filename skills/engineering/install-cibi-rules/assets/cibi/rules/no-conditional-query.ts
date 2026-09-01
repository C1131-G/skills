import { defineRule } from "@oxlint/plugins";
import type { ESTree } from "@oxlint/plugins";

import { isQueryOrMutationHookCall } from "../shared/query-hooks.ts";

/** Node types that make the hook call below them conditional. */
const BRANCHING = new Set([
  "IfStatement",
  "ConditionalExpression",
  "LogicalExpression",
  "SwitchCase",
  "SwitchStatement",
  "ForStatement",
  "ForInStatement",
  "ForOfStatement",
  "WhileStatement",
  "DoWhileStatement",
  "TryStatement",
  "CatchClause",
]);

/** Walking up stops at the function that owns the call — a nested function is a different call site. */
const FUNCTIONS = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

/**
 * Ban conditionally-called query and mutation hooks, which break the Rules of Hooks.
 * The fetch is made conditional with `enabled`; the hook call itself stays unconditional.
 */
export const noConditionalQueryRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow calling TanStack Query hooks inside a branch; keep the call unconditional and gate the fetch with `enabled`.",
    },
    messages: {
      conditionalQuery:
        "This query hook is called conditionally, which violates the Rules of Hooks. Call it unconditionally and pass `enabled` to control whether it fetches.",
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (!isQueryOrMutationHookCall(node)) return;

        let current: ESTree.Node | null | undefined = node.parent;
        while (current !== null && current !== undefined) {
          if (FUNCTIONS.has(current.type)) return;
          if (BRANCHING.has(current.type)) {
            context.report({ node, messageId: "conditionalQuery" });
            return;
          }
          current = current.parent;
        }
      },
    };
  },
});
