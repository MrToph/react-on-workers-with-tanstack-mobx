import { makeAutoObservable } from "mobx";
import { RootStore } from "./index";
import { trpc } from "@/query";
import { MobxMutation } from "./mobx-mutation";
import { client } from "@passwordless-id/webauthn";

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
  }

  public async init() {}

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
      await this.login();
    } else {
      await this.register();
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

  public async login() {
    // clear any potential errors from second step
    this.#loginVerifyMutationResult.reset();

    const username = this.loginForm.username;
    let initResult = await this.#loginInitMutationResult.mutateAsync(
      {
        username,
      }
    );

    if (!initResult.isSuccess) {
      console.log(`init failed`, initResult.failureCount);
      // error will be reactively rendered on UI
      return;
    }
    console.log(`init success`, initResult.data!.challenge);

    const authentication = await client.authenticate({
      challenge: initResult.data!.challenge,
      allowCredentials: initResult.data!.credentials,
      timeout: 5 * 60_000,
    });
    console.log(authentication);

    let verifyResult =
      await this.#loginVerifyMutationResult.mutateAsync({
        username,
        authentication,
      });
    if (!verifyResult.isSuccess) {
      console.log(`verify failed`, verifyResult.failureCount);
      // error will be reactively rendered on UI
      return;
    }
    console.log(`verify success`);
  }

  public async register() {
    // clear any potential errors from second step
    this.#registerVerifyMutationResult.reset();

    const username = this.loginForm.username;
    let initResult = await this.#registerInitMutationResult.mutateAsync(
      {
        username,
      }
    );

    if (!initResult.isSuccess) {
      // error will be reactively rendered on UI
      return;
    }

    const registration = await client.register({
      user: username,
      challenge: initResult.data!.challenge,
    });
    console.log(registration);

    let verifyResult =
      await this.#registerVerifyMutationResult.mutateAsync({
        // username is in registration.user.name
        registration,
      });
    if (!verifyResult.isSuccess) {
      // error will be reactively rendered on UI
      return;
    }

    // TODO: store JWT token and redirect to dashboard
  }
}
