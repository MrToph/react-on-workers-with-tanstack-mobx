import { queryClient } from "@/query";
import type { QueryClient } from "@tanstack/react-query";
import DashboardStore from "./dashboard";
import AuthStore from "./auth";

export class RootStore {
  // @ts-ignore
  #queryClient: QueryClient;

  dashboardStore = new DashboardStore(this);
  authStore = new AuthStore(this)

  constructor() {
    this.#queryClient = queryClient;
  }

  async init() {
    try {
      await Promise.allSettled([
        this.dashboardStore.init(),
      ]);
    } catch (error: any) {
      throw new Error(`Error while initializing store: ${error.message}`);
    }
  }

  public get queryClient() {
    return this.#queryClient;
  }
}

export const rootStore = new RootStore();

// expose for debugging
if (typeof window !== `undefined`) {
  // @ts-ignore
  window.store = rootStore;
}


async function initRootStore() {
  try {
    await rootStore.init();
  } catch (error) {
    console.error(error);
  }
}

initRootStore();
