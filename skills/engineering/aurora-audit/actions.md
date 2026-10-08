# Actions — server writes

All mutations for a domain live in `features/<domain>/<domain>-actions.ts`. Every action follows the same five steps.

## What it looks like

```ts
// next16-mail/features/thread/thread-actions.ts
'use server';

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function toggleStar(threadId: string, starred: boolean): Promise<ActionResult> {
  const user = await verifyUser();                                   // 1. auth
  const parsed = z.object({ starred: z.boolean(), threadId: threadIdSchema })
    .safeParse({ starred, threadId });                               // 2. validate
  if (!parsed.success) return invalidAction();
  await prisma.threadState.update({ ... where: { userId_threadId: { threadId, userId: user.id } } }); // 3. mutate, scoped to user
  updateTag(threadTags.list(user.id));                               // 4. invalidate
  return { ok: true };                                               // 5. result
}
```

## Rules

- **A1** Every `*-actions.ts` starts with `'use server'`. Action file name matches the folder, even for a sub-concept (`toggleFavorite` lives in `event-actions.ts`).
- **A2** Every action re-checks auth on the server. Never trust a user id sent from the client; scope every write to the session user.
- **A3** Every input is validated with a schema (`zod` `safeParse`), including plain-argument actions, not only `FormData`.
- **A4** Every action invalidates what it changed: `updateTag()` for tagged reads, `refresh()` only for deliberately untagged reads.
- **A5** Fallible actions return a discriminated union (`{ ok: true } | { ok: false; error }`). Expected failures are returned, not thrown.
- **A6** No toasts, no `redirect()` inside actions called from a click or a dialog — return `{ ok: true }` and let the caller toast and `router.push`. `redirect()` is fine in a `<form action>` flow.
- **A7** Client components import actions directly. No server action passed down as a prop just to be called.
- **A8** User-generated text that other people will see goes through moderation/sanitizing before it is stored, when the app has such a helper (`lib/moderation.ts`).

## Find violations

```bash
for f in $(find features -name '*-actions.ts'); do head -1 "$f" | grep -q "use server" || echo "missing 'use server': $f"; done
grep -rLE "verifyUser|verifyAuth|getCurrentUser|auth\(" $(find features -name '*-actions.ts')
grep -rLE "safeParse|\.parse\(" $(find features -name '*-actions.ts')
grep -rLE "updateTag|revalidateTag|refresh\(" $(find features -name '*-actions.ts')
grep -rn "throw new Error" $(find features -name '*-actions.ts')
grep -rnE "(action|Action)=\{[a-z]\w+\}" features --include=*.tsx      # then check: prop drilling an action?
```

The file-level greps find files with **no** auth/validation/invalidation at all; also read each exported function — one unvalidated action in a validated file is still a `FAIL`.

## Fix

Add the missing step in the five-step order. Convert thrown expected errors into `{ ok: false, error }`. Replace an action prop with a direct import in the client leaf.
