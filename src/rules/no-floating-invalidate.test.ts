import { RuleTester } from "oxlint/plugins-dev";

import { noFloatingInvalidateRule } from "./no-floating-invalidate.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "floatingInvalidate" };

tester.run("cibi/no-floating-invalidate", noFloatingInvalidateRule, {
  valid: [
    {
      name: "returned from onSuccess",
      code: "useMutation({ mutationFn: f, onSuccess: () => { return queryClient.invalidateQueries({ queryKey: k }); } });",
    },
    {
      name: "implicitly returned from onSuccess",
      code: "useMutation({ mutationFn: f, onSuccess: () => queryClient.invalidateQueries({ queryKey: k }) });",
    },
    {
      name: "awaited in onSettled",
      code: "useMutation({ mutationFn: f, onSettled: async () => { await queryClient.invalidateQueries({ queryKey: k }); } });",
    },
    {
      name: "awaited cancelQueries in onMutate",
      code: "useMutation({ mutationFn: f, onMutate: async () => { await queryClient.cancelQueries({ queryKey: k }); } });",
    },
    {
      name: "fire-and-forget outside a mutation callback is intentional",
      code: "ws.onmessage = (e) => { queryClient.invalidateQueries({ queryKey: [e.entity] }); };",
    },
    {
      name: "a different method entirely",
      code: "useMutation({ mutationFn: f, onSuccess: () => { queryClient.setQueryData(k, next); } });",
    },
  ],
  invalid: [
    {
      name: "discarded in onSuccess",
      code: "useMutation({ mutationFn: f, onSuccess: () => { queryClient.invalidateQueries({ queryKey: k }); } });",
      errors: [error],
    },
    {
      name: "discarded in onSettled",
      code: "useMutation({ mutationFn: f, onSettled: () => { queryClient.invalidateQueries({ queryKey: k }); } });",
      errors: [error],
    },
    {
      name: "discarded refetchQueries in onError",
      code: "useMutation({ mutationFn: f, onError: () => { queryClient.refetchQueries({ queryKey: k }); } });",
      errors: [error],
    },
    {
      name: "discarded cancelQueries in onMutate",
      code: "useMutation({ mutationFn: f, onMutate: () => { queryClient.cancelQueries({ queryKey: k }); } });",
      errors: [error],
    },
  ],
});
