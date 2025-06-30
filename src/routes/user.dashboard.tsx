import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { observer } from "mobx-react-lite";
import { useStore } from "@/store/use-store";

function RouteComponent() {
  const store = useStore((store) => store.dashboardStore);
  const { getTableResult, setTableResult } = store;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={store.decrementTableId}
                  disabled={!store.canDecrementTableId}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  -
                </button>
                <div className="min-w-[200px] rounded-md border bg-background px-4 py-2 text-center font-mono text-lg shadow-sm">
                  Fetching Table ID: {store.tableId}
                </div>
                <button
                  onClick={store.incrementTableId}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  +
                </button>
              </div>
              {getTableResult.failureCount > 0 && getTableResult.isFetching ? (
                <div className="m-4 rounded-md bg-orange-50 p-4 text-orange-700">
                  <p className="font-medium">Error getting data</p>
                  <p>
                    There was a problem getting the table data. Retrying ...
                  </p>
                  <p>{getTableResult.failureReason?.message}</p>
                  <div className="mt-2 flex items-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-700 border-t-transparent"></div>
                    <span className="ml-2 text-sm">Retrying...</span>
                  </div>
                </div>
              ) : getTableResult.isError ? (
                <div className="m-4 rounded-md bg-red-50 p-4 text-red-700">
                  <p className="font-medium">Error getting data</p>
                  <p>There was a problem getting the table data.</p>
                  <p>{getTableResult.error?.message}</p>
                </div>
              ) : getTableResult.isPending ? (
                <div className="flex items-center justify-center p-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <span className="ml-2">Loading data...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center p-4">
                  <span className="ml-2">{getTableResult.data?.dummyData}</span>
                </div>
              )}

              <div className="flex items-center justify-center">
                <button
                  onClick={store.setTableToRandom}
                  className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground ring-offset-background transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Set to Random
                </button>
              </div>
              {setTableResult.isRetryError ? (
                <div className="m-4 rounded-md bg-orange-50 p-4 text-orange-700">
                  <p className="font-medium">Error setting data</p>
                  <p>
                    There was a problem setting the table data. Retrying ...
                  </p>
                  <p>{setTableResult.retryError?.message}</p>
                  <div className="mt-2 flex items-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-700 border-t-transparent"></div>
                    <span className="ml-2 text-sm">Retrying...</span>
                  </div>
                </div>
              ) : setTableResult.isError ? (
                <div className="m-4 rounded-md bg-red-50 p-4 text-red-700">
                  <p className="font-medium">Error setting data</p>
                  <p>There was a problem setting the table data.</p>
                  <p>{setTableResult.error?.message}</p>
                </div>
              ) : setTableResult.isPending ? (
                <div className="flex items-center justify-center p-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <span className="ml-2">Setting data...</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

const ObserverRouteComponent = observer(RouteComponent);

export const Route = createFileRoute("/user/dashboard")({
  component: ObserverRouteComponent,
});
