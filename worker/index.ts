import { app } from "@worker/hono/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@worker/trpc/router";
import { createContext } from "@worker/trpc/context";

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/trpc")) {
      return fetchRequestHandler({
        endpoint: "/trpc",
        req: request,
        router: appRouter,
        createContext: () =>
          createContext({ req: request, env: env, workerCtx: ctx }),
      });
    }
    return app.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
