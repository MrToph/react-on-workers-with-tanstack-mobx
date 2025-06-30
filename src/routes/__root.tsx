import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StoreProvider } from "@/components/store-provider";
import type { RootStore } from "@/store";
import type { QueryClient } from "@tanstack/react-query";
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AppRouter } from "@worker/trpc/router";

type RouterContext = {
  queryClient: QueryClient
  trpc: TRPCOptionsProxy<AppRouter>,
  rootStore: RootStore,
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
      <StoreProvider>
        <Outlet />
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      </StoreProvider>
  );
}
