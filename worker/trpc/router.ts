import { t } from "@worker/trpc/trpc-instance";
import { exampleTableDataRouter } from "@worker/trpc/routes/example-table-data";
import { authRouter } from "@worker/trpc/routes/auth";
import { userRouter } from "@worker/trpc/routes/user";

export const appRouter = t.router({
  exampleTableData: exampleTableDataRouter,
  auth: authRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
