import { makeAutoObservable } from "mobx";
import { RootStore } from "./index";
import { trpc } from "@/query";
import { MobxMutation } from "./mobx-mutation";
import { client } from "@passwordless-id/webauthn";

export default class SettingsStore {
  rootStore: RootStore;
  #addInitMutationResult;
  #addVerifyMutationResult;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    this.#addInitMutationResult = new MobxMutation(
      trpc.auth.addInit.mutationOptions()
    );

    this.#addVerifyMutationResult = new MobxMutation(
      trpc.auth.addVerify.mutationOptions()
    );

    makeAutoObservable(this, undefined, { autoBind: true });
  }

  public async init() {}

  public async handleAddPasskey() {
    await this._addPasskey();
  }

  public get isAddPasskeyError() {
    return (
      this.#addInitMutationResult.isError ||
      this.#addVerifyMutationResult.isError
    );
  }

  public get addPasskeyError() {
    return (
      this.#addInitMutationResult.error || this.#addVerifyMutationResult.error
    );
  }

  public get addPasskeyLoading() {
    return (
      this.#addInitMutationResult.isPending ||
      this.#addVerifyMutationResult.isPending
    );
  }

  private async _addPasskey() {
    // clear any potential errors from second step
    this.#addVerifyMutationResult.reset();

    let initResult = await this.#addInitMutationResult.mutateAsync();

    if (!initResult.isSuccess) {
      // error will be reactively rendered on UI
      return;
    }

    const registration = await client.register({
      user: initResult.data!.username,
      challenge: initResult.data!.challenge,
    });

    const verifyResult = await this.#addVerifyMutationResult.mutateAsync({
      registration,
    });
    // any error will be rendered on UI
    if (!verifyResult.isSuccess) {
      return;
    }

    // user info changed, refetch credentials
    await this.rootStore.queryClient.invalidateQueries({
      queryKey: trpc.user.info.getUserInfo.queryKey(),
    });
  }
}
