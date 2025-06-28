import { queryClient } from '@/query';
import {
  DefaultedQueryObserverOptions,
  QueryClient,
  QueryKey,
  QueryObserver,
  QueryObserverOptions,
  QueryObserverResult,
} from '@tanstack/react-query';
import { observable, runInAction } from 'mobx';

export class MobxQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> {
  readonly #queryClient: QueryClient;
  readonly #defaultOptions: QueryObserverOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
  >;
  #observer?: QueryObserver<TQueryFnData, TError, TData, TQueryData, TQueryKey>;
  #reactQueryResult = observable({}, { deep: false }) as QueryObserverResult<
    TData,
    TError
  >;
  #unsubscribe?: () => void;

  constructor(
    options: QueryObserverOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey
    >,
  ) {
    this.#queryClient = queryClient;
    // no need for us to call defaultQueryOptions. creating observer and setOptions will do that for us. important not to call it because it adds _defaulted and _queryKey fields which we DO NOT want to have
    this.#defaultOptions = options;
    console.log("mobx-query.defaultOptions", this.#defaultOptions);
  }

  query(
    options?: QueryObserverOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryData,
      TQueryKey
    >,
  ): QueryObserverResult<TData, TError> {
    // pass same options to QueryObserver as for QueryClient
    const opts = Object.assign({}, this.#defaultOptions, options);

    // having these fields defined in our options will break the setOptions(..) call as it might early return and not actually run the new query
    if (opts.queryHash || opts._defaulted) {
      throw new Error("MobxQuery: default and/or options parameter contains invalid fields")
    }

    if (this.#observer) {
      // subsequent query() calls only need to update options. this retriggers the query if it's new/stale
      this.#observer.setOptions(opts);
    } else {
      // first query() call initializes observer. this triggers the query if it's new/stale
      const observer = (this.#observer = new QueryObserver(
        this.#queryClient,
        opts,
      ));
      runInAction(() => {
        return Object.assign(this.#reactQueryResult, observer.getCurrentResult())
      });
      this.#unsubscribe = observer.subscribe((result) => {
        return runInAction(() => Object.assign(this.#reactQueryResult, result))
      });
    }
    return this.#reactQueryResult;
  }

  dispose() {
    this.#unsubscribe?.();
  }
}
