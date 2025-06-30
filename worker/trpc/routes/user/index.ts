import { t } from "../../trpc-instance";
import { userInfoRouter } from "./info";

/**
 * A router that groups all user-related routes.
 * Protection is applied at the procedure level within each sub-router.
 */
export const userRouter = t.router({
  info: userInfoRouter,
});
