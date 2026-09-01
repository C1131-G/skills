import { RuleTester } from "oxlint/plugins-dev";

import { noQueryResultRestRule } from "./no-query-result-rest.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "queryResultRest" };

tester.run("cibi/no-query-result-rest", noQueryResultRestRule, {
  valid: [
    { name: "named fields only", code: "const { data, isPending } = useQuery(o);" },
    { name: "whole result kept", code: "const query = useQuery(o);" },
    { name: "renamed field", code: "const { data: todos } = useSuspenseQuery(o);" },
    { name: "rest from something that is not a query", code: "const { id, ...rest } = props;" },
    { name: "rest from an unrelated call", code: "const { id, ...rest } = buildOptions();" },
    { name: "nested rest inside data is the user's own shape", code: "const { data } = useQuery(o);" },
  ],
  invalid: [
    {
      name: "rest after a named field",
      code: "const { data, ...rest } = useQuery(o);",
      errors: [error],
    },
    {
      name: "rest alone",
      code: "const { ...rest } = useQuery(o);",
      errors: [error],
    },
    {
      name: "rest from useSuspenseQuery",
      code: "const { data, ...rest } = useSuspenseQuery(o);",
      errors: [error],
    },
    {
      name: "rest from useInfiniteQuery",
      code: "const { data, ...rest } = useInfiniteQuery(o);",
      errors: [error],
    },
  ],
});
