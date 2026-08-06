---
name: use-tanstack-form
description: TanStack Form — Standard Schema, triggers, canSubmit. Called by skill-master / tanstack router.
disable-model-invocation: true
---
# use-tanstack-form

Apply these rules whenever building or reviewing a form using `@tanstack/react-form`.

## 1. When TanStack Form is the right choice

Reach for TanStack Form when the project already uses other TanStack libraries (Query, Router) and benefits from sharing one mental model across them, when forms need genuinely type-safe field paths (not just a generic passed to a hook), or when built-in async validation (debounced, cancellable) matters. For simple-to-moderate forms with no such requirement, a more established library may involve less setup — this is a real tradeoff, not a strictly-better-in-every-case choice.

## 2. Use Standard Schema validators directly — no adapter package needed

Current TanStack Form speaks the Standard Schema spec natively, so Zod, Valibot, ArkType, and Effect Schema all plug straight into a `validators` option with no separate adapter package:

```ts
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1, "A first name is required"),
  email: z.string().email(),
});

const form = useForm({
  defaultValues: { firstName: "", email: "" },
  validators: { onChange: schema },
  onSubmit: async ({ value }) => { /* value is typed from defaultValues */ },
});
```

Don't install or import a separate Zod/Valibot form-adapter package if the version in use already supports Standard Schema directly — that's dead weight from an older API generation.

## 3. Know where the form's TypeScript types actually come from

TanStack Form infers its types from `defaultValues`, not from the validation schema. If a schema is passed to `validators`, it validates at runtime and its own errors are typed, but it does not become the source of the form's value types — `defaultValues` and the schema are two separate things with no enforced link at the type level. Keep `defaultValues` accurate and complete; don't assume adding a schema alone gives you compile-time protection against a `defaultValues` shape that's drifted out of sync with it.

## 4. Choose field-level vs. form-level validation deliberately

- **Field-level** (`form.Field`'s `validators` prop): validate one field in isolation — a single required-string check, a format check. Good default for straightforward, independent field rules.
- **Form-level** (`useForm`'s `validators` option, one schema for the whole shape): use when rules span multiple fields (password confirmation matching, conditional requiredness) or when a single schema is simpler to maintain than scattering the same logic across many fields. Form-level errors propagate down to the relevant fields automatically — no manual wiring needed to surface them per-field.

## 5. Pick validation triggers deliberately — don't validate on every keystroke by default

Validators can run `onChange`, `onBlur`, `onSubmit`, or `onDynamic` (rules that change based on form state, e.g. stricter validation after the first submit attempt). Validating on every change from the very first keystroke, before the user has had a chance to finish typing, produces a noisy, premature-feeling form. A common, less naggy pattern: validate `onBlur` initially, then switch to `onChange` after the first submit attempt — implement this with `revalidateLogic()` rather than hand-rolling a "have they submitted yet" flag:

```ts
import { revalidateLogic, useForm } from "@tanstack/react-form";

const form = useForm({
  defaultValues: { firstName: "", lastName: "" },
  validationLogic: revalidateLogic(),
  validators: { onDynamic: schema },
});
```

## 6. Render Standard-Schema errors as issue objects, not plain strings

When the validator is a Standard Schema (Zod/Valibot/etc.), the error map's values are arrays of issue objects (`StandardSchemaV1Issue[]`), not plain strings — a raw string-validator function returns a string, but a schema validator doesn't. Render accordingly:

```tsx
{formErrorMap.onChange ? (
  <div>
    {Object.values(formErrorMap.onChange).flat().map((issue) => issue.message).join(", ")}
  </div>
) : null}
```

Don't assume every error in the map is a string ready to render directly — check whether the validator producing it is a schema or a plain function.

## 7. Wrap non-schema async checks (uniqueness, captcha) as their own validation step, not inline in `onSubmit`

Some validation genuinely can't live in the schema — a server-side uniqueness check, a captcha verification, a rate-limit check. Run schema validation first and only proceed to these async, non-schema checks if the schema passed; if a check fails, return its result directly so subsequent steps (and the real `onSubmit` handler) never run. Keep this layered logic in the form's async validation lifecycle rather than stuffing all of it into the `onSubmit` handler body, which makes partial-failure states harder to reason about.

## 8. Use array field helpers for dynamic field lists, don't hand-roll index-based state

For "add another item" style dynamic fields (multiple emails, multiple line items), use the library's array field API (`form.Field` with a `mode: "array"`-style field, or the array-specific helpers current docs describe) rather than manually managing a separate `useState` array alongside the form and keeping the two in sync yourself.

## 9. Wire the submit button to `canSubmit`/`isSubmitting`, not a hand-rolled flag

The form's own derived state already tracks whether it's currently valid-and-submittable and whether a submission is in flight — use those directly instead of recreating them:

```tsx
<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
  {([canSubmit, isSubmitting]) => (
    <button type="submit" disabled={!canSubmit || isSubmitting}>
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  )}
</form.Subscribe>
```

## Applying these rules

- **New form**: pick field-level vs. form-level validation deliberately (rule 4), decide the validation-trigger strategy up front (rule 5) rather than defaulting to on-every-keystroke, and use `defaultValues` as the actual source of the form's types (rule 3).
- **Reviewing existing code**: flag an installed adapter package that's no longer needed, error rendering that assumes every error is a plain string, non-schema async checks stuffed into `onSubmit` instead of a proper validation step, and a submit button driven by a hand-rolled `isSubmitting`/`canSubmit` flag instead of the form's own derived state.

