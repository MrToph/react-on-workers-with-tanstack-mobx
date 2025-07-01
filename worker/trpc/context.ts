/// <reference types="../../worker-configuration.d.ts" />
import { TRPCError } from "@trpc/server";
import { decodeAndVerifyJwtToken } from "./jwt";

export async function createContext({
  req,
  env,
  workerCtx,
}: {
  req: Request;
  env: Env;
  workerCtx: ExecutionContext;
}) {
  async function getUserFromHeader() {
    const authorizationHeader = req.headers.get("authorization");
    if (!authorizationHeader) {
      return null;
    }

    const authToken = authorizationHeader.split(" ")[1];
    if (typeof authToken !== "string") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid authorization header. Expected 'Bearer <token>'.",
      });
    }
    const user = await decodeAndVerifyJwtToken(authToken, env.JWT_SECRET);
    return user;
  }

  const user = await getUserFromHeader();

  // available as `ctx` in all resolvers
  return {
    req,
    env,
    workerCtx,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
