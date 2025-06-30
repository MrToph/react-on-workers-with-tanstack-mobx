import { t } from "@worker/trpc/trpc-instance";
import { exampleTableDataRouter } from "@worker/trpc/routes/example-table-data";
import { authRouter } from "@worker/trpc/routes/auth";

export const appRouter = t.router({
  exampleTableData: exampleTableDataRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
