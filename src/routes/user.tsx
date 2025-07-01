import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/user")({
  component: UserLayoutComponent,
  beforeLoad: (ctx) => {
    if (!ctx.context.rootStore.authStore.isAuthenticated) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
  },
});

function UserLayoutComponent() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
