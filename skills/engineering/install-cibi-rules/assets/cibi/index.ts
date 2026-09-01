import { eslintCompatPlugin } from "@oxlint/plugins";

import { noConditionalQueryRule } from "./rules/no-conditional-query.ts";
import { noFloatingInvalidateRule } from "./rules/no-floating-invalidate.ts";
import { noQueryResultRestRule } from "./rules/no-query-result-rest.ts";

/** Oxlint rules that enforce the server-state patterns documented in the cibi skills. */
const cibiPlugin = eslintCompatPlugin({
  meta: { name: "cibi" },
  rules: {
    "no-conditional-query": noConditionalQueryRule,
    "no-floating-invalidate": noFloatingInvalidateRule,
    "no-query-result-rest": noQueryResultRestRule,
  },
});

export default cibiPlugin;
