import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import type { AppRouter } from "@worker/trpc/router";


// own file to avoid circular dependency between router.tsx -> routeTree.gen -> rootRoute -> StoreProvider -> store/index.ts rootStore
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      // by default they are never stale, so only fetch once (unless manually invalidated)
      staleTime: Infinity,
      // Query results that have no more active instances in the QueryObserver are labeled as "inactive" and remain in the cache in case they are used again at a later time.
      gcTime: 5 * 60 * 1000,
    },
  },
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      httpBatchLink({
        url: "/trpc",
      }),
    ],
  }),
  queryClient,
});