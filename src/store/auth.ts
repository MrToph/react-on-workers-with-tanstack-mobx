import { makeAutoObservable, runInAction } from "mobx";
import { RootStore } from "./index";
import { queryClient, setToken, trpc } from "@/query";
import { MobxMutation } from "./mobx-mutation";
import { client } from "@passwordless-id/webauthn";
import { extendStoreFromLocalStorage } from "./local-storage";
import { router } from "@/router";

export enum LoginFormState {
  Login,
  Register,
}

export default class AuthStore {
  rootStore: RootStore;
  loginForm = {
    username: "",
    state: LoginFormState.Login,
  };
  #registerInitMutationResult;
  #registerVerifyMutationResult;
  #loginInitMutationResult;
  #loginVerifyMutationResult;

  jwtToken: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    this.#registerInitMutationResult = new MobxMutation(
      trpc.auth.registerInit.mutationOptions()
    );

    this.#registerVerifyMutationResult = new MobxMutation(
      trpc.auth.registerVerify.mutationOptions()
    );

    this.#loginInitMutationResult = new MobxMutation(
      trpc.auth.loginInit.mutationOptions()
    );

    this.#loginVerifyMutationResult = new MobxMutation(
      trpc.auth.loginVerify.mutationOptions()
    );

    makeAutoObservable(this, undefined, { autoBind: true });

    extendStoreFromLocalStorage(this, "authStore", (store) => ({
      jwtToken: store.jwtToken,
    }));
  }

  public async init() {
    // do it in init; need to wait until other stores are constructed
    if (this.jwtToken) {
      this._onLogin(this.jwtToken, false);
    }
  }

  public formToggle() {
    this.loginForm.state =
      this.loginForm.state === LoginFormState.Login
        ? LoginFormState.Register
        : LoginFormState.Login;
    this.#registerInitMutationResult.reset();
    this.#registerVerifyMutationResult.reset();
    this.#loginInitMutationResult.reset();
    this.#loginVerifyMutationResult.reset();
  }

  public async formSubmit() {
    if (this.loginForm.state === LoginFormState.Login) {
      await this._login();
    } else {
      await this._register();
    }
  }

  public formUsernameChange(username: string) {
    this.loginForm.username = username;
  }

  public get formCanSubmit() {
    return this.loginForm.username.length > 0;
  }

  public get isFormSubmissionError() {
    if (this.loginForm.state === LoginFormState.Login) {
      return (
        this.#loginInitMutationResult.isError ||
        this.#loginVerifyMutationResult.isError
      );
    }
    return (
      this.#registerInitMutationResult.isError ||
      this.#registerVerifyMutationResult.isError
    );
  }

  public get formSubmissionError() {
    if (this.loginForm.state === LoginFormState.Login) {
      return (
        this.#loginInitMutationResult.error ||
        this.#loginVerifyMutationResult.error
      );
    }
    return (
      this.#registerInitMutationResult.error ||
      this.#registerVerifyMutationResult.error
    );
  }

  public get formSubmissionLoading() {
    if (this.loginForm.state === LoginFormState.Login) {
      return (
        this.#loginInitMutationResult.isPending ||
        this.#loginVerifyMutationResult.isPending
      );
    }
    return (
      this.#registerInitMutationResult.isPending ||
      this.#registerVerifyMutationResult.isPending
    );
  }

  public async handleLogout() {
    await router.navigate({ to: "/login" });
    // Any steps after await aren't in the same tick, so they require action wrapping
    runInAction(() => {
      this.jwtToken = null;
      setToken("");
      // mark all queries as stale, but do not refetch them
      queryClient.invalidateQueries({
        refetchType: "none",
      });
      this.rootStore.onLogout();
    });
  }

  private async _login() {
    // clear any potential errors from second step
    this.#loginVerifyMutationResult.reset();

    const username = this.loginForm.username;
    let initResult = await this.#loginInitMutationResult.mutateAsync({
      username,
    });

    if (!initResult.isSuccess) {
      // error will be reactively rendered on UI
      return;
    }

    const authentication = await client.authenticate({
      challenge: initResult.data!.challenge,
      allowCredentials: initResult.data!.credentials,
      timeout: 5 * 60_000,
    });

    let verifyResult = await this.#loginVerifyMutationResult.mutateAsync({
      username,
      authentication,
    });
    if (!verifyResult.isSuccess) {
      // error will be reactively rendered on UI
      return;
    }

    this._onLogin(verifyResult.data!.jwt, true);
  }

  private async _register() {
    // clear any potential errors from second step
    this.#registerVerifyMutationResult.reset();

    const username = this.loginForm.username;
    let initResult = await this.#registerInitMutationResult.mutateAsync({
      username,
    });

    if (!initResult.isSuccess) {
      // error will be reactively rendered on UI
      return;
    }

    const registration = await client.register({
      user: username,
      challenge: initResult.data!.challenge,
    });

    let verifyResult = await this.#registerVerifyMutationResult.mutateAsync({
      // username is in registration.user.name
      registration,
    });
    if (!verifyResult.isSuccess) {
      // error will be reactively rendered on UI
      return;
    }

    this._onLogin(verifyResult.data!.jwt, true);
  }

  private async _onLogin(jwtToken: string, shouldRedirect = false) {
    this.jwtToken = jwtToken;
    setToken(jwtToken);
    // just invalidate all cached queries. not sure if strictly needed
    queryClient.invalidateQueries();
    this.rootStore.onLogin();

    if (shouldRedirect) {
      router.navigate({ to: "/user/dashboard" });
    }
  }

  public get isAuthenticated() {
    return this.jwtToken !== null;
  }
}
