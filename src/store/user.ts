import { makeAutoObservable } from "mobx";
import { RootStore } from "./index";
import { trpc } from "@/query";
import { MobxQuery } from "./mobx-query";

// type UserInfoResponse = TRPCOutputTypes["user"]["info"]["getUserInfo"]["user"];

export default class UserStore {
  rootStore: RootStore;
  // #username: string | null = null;
  // #user: UserInfoResponse | null = null;
  #userInfoQuery = new MobxQuery(
    trpc.user.info.getUserInfo.queryOptions()
  );

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this, undefined, { autoBind: true });
  }

  public async init() {}

  public async handleLogin() {
    this.#userInfoQuery.query();
  }

  public get username() {
    return this.#userInfoQuery.query().data?.user.username;
  }

  public get userInfoResult() {
    return this.#userInfoQuery.query();
  }
}
