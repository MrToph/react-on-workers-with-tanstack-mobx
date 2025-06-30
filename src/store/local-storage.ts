import { reaction, set } from "mobx";

export function extendStoreFromLocalStorage<
  T extends Record<string, any>,
  U extends object
>(store: T, localStorageKey: string, toTrack: (store: T) => U) {
  if (typeof window === "undefined") {
    return;
  }

  // load from LS immediately
  const existingPartialStore = window.localStorage.getItem(localStorageKey);
  if (existingPartialStore) {
    // note that setting the store will trigger the reaction again and we store it in LS
    set(store, JSON.parse(existingPartialStore));
  }

  reaction(
    // whatever is accessed here will be registered as a dependency of the reaction and rerun
    () => toTrack(store),
    // result of toTrack(store). expected to be an object
    (partialStoreToSerialize) => {
      window.localStorage.setItem(
        localStorageKey,
        JSON.stringify(partialStoreToSerialize)
      );
    }
  );
}
