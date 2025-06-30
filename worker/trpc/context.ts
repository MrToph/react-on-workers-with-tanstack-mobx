/// <reference types="../../worker-configuration.d.ts" />
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
  // Create your context based on the request object
  // Will be available as `ctx` in all your resolvers
  // This is just an example of something you might want to do in your ctx fn
  async function getUserFromHeader() {
    if (req.headers.get("authorization")) {
      const user = await decodeAndVerifyJwtToken(
        req.headers.get("authorization")!.split(" ")[1],
        env.JWT_SECRET
      );
      return user;
    }
    return null;
  }
  const user = await getUserFromHeader();

  return {
    req,
    env,
    workerCtx,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
