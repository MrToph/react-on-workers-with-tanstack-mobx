import React, { useContext } from 'react';
import {rootStore, RootStore } from './index';

export const storeContext = React.createContext(rootStore);

export const useStore = <T>(storeSelector: (rootStore: RootStore) => T) => {
    const contextRootStore = useContext(storeContext);
    if (!contextRootStore) {
        throw new Error(`useStore must be used within StoreProvider`);
    }
    const store = storeSelector(contextRootStore);
    return store;
};
