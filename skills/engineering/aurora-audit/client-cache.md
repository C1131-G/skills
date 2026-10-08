# Client cache — SWR / TanStack Query next to RSC

Only for features that need a browser cache: live data, polling, externally authored updates (chat messages, unread counts). Everything else stays a server component. Library mechanics belong to `use-tanstack-query`.

## What it looks like

```ts
// next16-team-chat/features/message/message-cache.ts — one contract for both sides
export const messageKeys = { channel: (channelId: string) => ['messages', channelId] as const };
export const messageTags = { channel: (channelId: string) => `messages:${channelId}` };

// message-query-options.ts — client query definition
export function messagesQueryOptions(channelId: string) {
  return queryOptions({
    queryKey: messageKeys.channel(channelId),
    queryFn: async () => { const res = await fetch(apiUrl(`/api/channels/${channelId}/messages`)); ... },
    staleTime: Infinity,
    refetchInterval: 10_000,
  });
}

// hooks/use-message-mutations.ts — useSendMessage, useReactionToggle (call server actions, write the cache)
```

## Rules

- **CC1** A client library is used only where data changes without the user's own action. A page that only shows server data does not use `useQuery`.
- **CC2** Server tags and client query keys for the same data live together in `<domain>-cache.ts`; queries, actions, route handlers, hydration and hooks import from it.
- **CC3** Client query definitions live in `<domain>-query-options.ts` at the feature root; mutation wrappers are hooks in `features/<domain>/hooks/use-*-mutations.ts`.
- **CC4** The server seeds the client cache (hydrate from a cached server read); the first render does not show a client spinner for data the server already had.
- **CC5** Route handlers under `app/api/` are thin: they call the feature's query and return `Response.json`. No business logic or Prisma calls in `route.ts`.
- **CC6** Mutations still go through server actions; the hook writes the client cache optimistically in `onMutate` and restores it in `onError`.

## Find violations

```bash
grep -E '"(swr|@tanstack/react-query)"' package.json
grep -rln "useQuery\|useSWR" features components app
grep -rn "queryKey: \[" features --include=*.ts --include=*.tsx      # inline keys instead of <domain>Keys
grep -rn "prisma\." app/api
find features -name '*-query-options.ts'; find features -path '*hooks*' -name 'use-*-mutations.ts'
```

## Fix

Move inline keys into `<domain>-cache.ts`, extract `queryOptions` into `<domain>-query-options.ts`, replace Prisma in route handlers with a feature query, and drop the client library from features that never receive outside updates.
