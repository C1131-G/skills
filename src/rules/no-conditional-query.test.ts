import { RuleTester } from "oxlint/plugins-dev";

import { noConditionalQueryRule } from "./no-conditional-query.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "conditionalQuery" };

tester.run("cibi/no-conditional-query", noConditionalQueryRule, {
  valid: [
    {
      name: "unconditional call gated by enabled",
      code: "function C() { const { data } = useQuery({ queryKey: ['u', id], queryFn: f, enabled: !!id }); }",
    },
    {
      name: "conditional inside the options object, not around the call",
      code: "function C() { const q = useQuery({ queryKey: k, queryFn: f, enabled: a ? b : c }); }",
    },
    {
      name: "conditional rendering after the hook",
      code: "function C() { const q = useQuery(o); if (q.isPending) { return null; } return q.data; }",
    },
    {
      name: "an unrelated function called conditionally",
      code: "function C() { if (id) { const v = computeTotal(id); } }",
    },
    {
      name: "hook inside a nested callback is a different call site",
      code: "function C() { if (a) { items.forEach(() => { useQuery(o); }); } }",
    },
    {
      name: "mutation hook called unconditionally",
      code: "function C() { const m = useMutation({ mutationFn: save }); }",
    },
  ],
  invalid: [
    {
      name: "inside an if block",
      code: "function C() { if (userId) { const { data } = useQuery(userOptions(userId)); } }",
      errors: [error],
    },
    {
      name: "guarded by a logical and",
      code: "function C() { const q = userId && useQuery(userOptions(userId)); }",
      errors: [error],
    },
    {
      name: "inside a ternary",
      code: "function C() { const q = userId ? useQuery(o) : null; }",
      errors: [error],
    },
    {
      name: "inside a loop",
      code: "function C() { for (const id of ids) { useQuery(userOptions(id)); } }",
      errors: [error],
    },
    {
      name: "mutation hook inside a branch",
      code: "function C() { if (canEdit) { const m = useMutation({ mutationFn: save }); } }",
      errors: [error],
    },
    {
      name: "namespaced call inside a branch",
      code: "function C() { if (a) { const q = ReactQuery.useQuery(o); } }",
      errors: [error],
    },
  ],
});
