import {createContext, useContext} from 'react';
import {routerStore} from './router';
import {flightLogStore} from './flight-log';
import {vaStore} from './va';

export const rootStoreContext = createContext({
  RouterStore: routerStore,
  FlightLogStore: flightLogStore,
  VaStore: vaStore,
});

export const useStores = () => {
  const store = useContext(rootStoreContext);
  if (!store) {
    throw new Error('useStores must be used within a provider');
  }
  return store;
};
