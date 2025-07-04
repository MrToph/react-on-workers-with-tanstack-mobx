import { queryClient } from "@/query";
import type { QueryClient } from "@tanstack/react-query";
import DashboardStore from "./dashboard";
import AuthStore from "./auth";
import UserStore from "./user";
import SettingsStore from "./settings";

export class RootStore {
  #queryClient: QueryClient;

  // make sure AuthStore runs first, so the JWT is loaded when other stores are initialized
  authStore = new AuthStore(this);
  userStore = new UserStore(this);
  settingsStore = new SettingsStore(this);
  dashboardStore = new DashboardStore(this);

  constructor() {
    this.#queryClient = queryClient;
  }

  async init() {
    try {
      await Promise.allSettled([
        this.authStore.init(),
        this.userStore.init(),
        this.settingsStore.init(),
        this.dashboardStore.init(),
      ]);
    } catch (error: any) {
      throw new Error(`Error while initializing store: ${error.message}`);
    }
  }

  // called by authStore upon login
  async onLogin() {
    this.userStore.handleLogin();
    console.log(`logged in`);
  }

  async onLogout() {
    console.log(`logged out`);
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
