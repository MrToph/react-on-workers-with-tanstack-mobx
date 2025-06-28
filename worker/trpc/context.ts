/// <reference types="../../worker-configuration.d.ts" />

export async function createContext({
  req,
  env,
  workerCtx,
}: {
  req: Request;
  env: Env;
  workerCtx: ExecutionContext;
}) {
  return {
    req,
    env,
    workerCtx,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
