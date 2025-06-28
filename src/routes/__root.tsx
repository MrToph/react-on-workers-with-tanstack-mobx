import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StoreProvider } from "@/components/store-provider";

export const Route = createRootRoute({
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
