import { t } from "../../trpc-instance";
import { protectedProcedure } from "../../procedures";
import { getUserByUsername } from "@worker/db/user";
import { TRPCError } from "@trpc/server";

export const userInfoRouter = t.router({
  getUserInfo: protectedProcedure.query(async ({ ctx }) => {
    const username = ctx.user.username;
    const user = await getUserByUsername(ctx.db, username);

    // this can only happen in dev mode as we only sign JWTs for users that exist. and the JWT passed at this point
    if (!user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `User does not exist. Register first.`,
      });
    }

    return { user };
  }),
});
