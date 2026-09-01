import { defineRule } from "@oxlint/plugins";

import { isQueryHookCall } from "../shared/query-hooks.ts";

/**
 * Ban rest destructuring of a query result.
 * TanStack Query tracks which result fields a component actually reads, and only re-renders
 * when one of those changes. A rest element touches every remaining getter, so the component
 * subscribes to all of them and re-renders on changes it does not use.
 */
export const noQueryResultRestRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow rest destructuring of a TanStack Query result, which defeats tracked-query re-render optimization.",
    },
    messages: {
      queryResultRest:
        "Rest destructuring reads every field of the query result, so this component re-renders on changes it never uses. Name the fields you need instead.",
    },
  },
  createOnce(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type !== "ObjectPattern") return;
        if (node.init === null || node.init === undefined) return;
        if (node.init.type !== "CallExpression" || !isQueryHookCall(node.init)) return;

        for (const property of node.id.properties) {
          if (property.type === "RestElement") {
            context.report({ node: property, messageId: "queryResultRest" });
          }
        }
      },
    };
  },
});
