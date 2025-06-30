import { observable, runInAction } from "mobx";
import {
  MutationObserver,
  MutationObserverOptions,
  MutationObserverResult,
  QueryClient,
} from "@tanstack/react-query";
import { queryClient } from "@/query";

export class MobxMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
> {
  readonly #queryClient: QueryClient;
  readonly #defaultOptions: MutationObserverOptions<
    TData,
    TError,
    TVariables,
    TContext
  >;
  #observer?: MutationObserver<TData, TError, TVariables, TContext>;
  readonly #reactMutationResult = observable(
    {},
    { deep: false }
  ) as MutationObserverResult<TData, TError>;
  #unsubscribe?: () => void;

  constructor(
    options: MutationObserverOptions<TData, TError, TVariables, TContext>
  ) {
    this.#queryClient = queryClient;
    this.#defaultOptions = options;
  }

  mutate(
    variables: TVariables,
    options?: MutationObserverOptions<TData, TError, TVariables, TContext>
  ): MutationObserverResult<TData, TError> {
    this.mutateAsync(variables, options).catch(noop);
    return this.#reactMutationResult;
  }

  async mutateAsync(
    variables: TVariables,
    options?: MutationObserverOptions<TData, TError, TVariables, TContext>
  ): Promise<MutationObserverResult<TData, TError>> {
    if (this.#unsubscribe) {
      this.#unsubscribe();
    }

    this.#observer = new MutationObserver(
      this.#queryClient,
      // no need to merge options as .mutate does it automatically?
      this.#defaultOptions
    );
    this.#unsubscribe = this.#observer.subscribe((result) =>
      runInAction(() => Object.assign(this.#reactMutationResult, result))
    );

    try {
      // this runs and runs until it's done. meaning, it will retry internally (if retries defined), only return once it's a final success or error
      await this.#observer.mutate(variables, options);
    } catch (e) {
      // error will be handled in the store/ui
    }
    return this.#reactMutationResult;
  }

  reset() {
    this.#observer?.reset();
  }

  get data() {
    return this.#reactMutationResult.data;
  }

  get error() {
    return this.#reactMutationResult.error ?? null;
  }

  get isError() {
    return this.#reactMutationResult.isError ?? false;
  }

  get retryError() {
    return this.#reactMutationResult.failureReason;
  }

  get isRetryError() {
    return this.isPending && this.#reactMutationResult.failureCount > 0;
  }

  get isPending() {
    return this.#reactMutationResult.isPending ?? false;
  }

  get isSuccess() {
    return this.#reactMutationResult.isSuccess ?? false;
  }

  get status() {
    return this.#reactMutationResult.status ?? "idle";
  }

  dispose() {
    this.#unsubscribe?.();
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}
