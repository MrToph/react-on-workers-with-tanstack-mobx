import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: (ctx) => {
    const isAuthenticated = ctx.context.rootStore.authStore.isAuthenticated;
    if (isAuthenticated) {
      redirect({
        to: "/user/dashboard",
        throw: true,
      });
    } else {
      redirect({
        to: "/login",
        throw: true,
      });
    }
  },
});

function RouteComponent() {
  // will always perform a redirect before this Component is loaded
  return null;
}
