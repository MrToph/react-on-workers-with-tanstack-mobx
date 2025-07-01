import type { createContext } from "@worker/trpc/context";

export type DB = Awaited<ReturnType<typeof createContext>>["db"];
