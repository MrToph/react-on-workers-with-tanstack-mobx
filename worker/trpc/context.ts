/// <reference types="../../worker-configuration.d.ts" />
import { decodeAndVerifyJwtToken } from "./jwt";
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@worker/db/schemas';

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
      // if invalid auth token provided, just act as no user instead of throwing error
      // as we still want to access unprotected routes like /login to override the invalid auth token
      // if it is set for some reason by client
      return null;
    }
    const user = await decodeAndVerifyJwtToken(authToken, env.JWT_SECRET);
    return user;
  }

  const user = await getUserFromHeader();
  const db = drizzle(env.DB, { schema });

  // available as `ctx` in all resolvers
  return {
    req,
    env,
    workerCtx,
    user,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
