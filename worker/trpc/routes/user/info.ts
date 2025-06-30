import { t } from "../../trpc-instance";
import { protectedProcedure } from "../../procedures";
import { getUserByUsername } from "@worker/db/user";

export const userInfoRouter = t.router({
  getUserInfo: protectedProcedure.query(async ({ ctx }) => {
    const username = ctx.user.username;
    const user = getUserByUsername(username);
    return { user };
  }),
});
