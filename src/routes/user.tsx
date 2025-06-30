import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/user")({
  component: UserLayoutComponent,
  beforeLoad: (ctx) => {
    if (!ctx.context.rootStore.authStore.isAuthenticated) {
      redirect({
        to: '/login',
        throw: true,
      })
    }
  },
});

function UserLayoutComponent() {
  return (
    <div>
      <h1>User Layout</h1>
      <main>Add sidebar here</main>
      <Outlet />
    </div>
  );
}
