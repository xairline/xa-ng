import { createContext, useContext } from 'react';
import { routerStore } from './router';
import { flightLogStore } from './flight-log';
import { analyticsStore } from './analytics';
import { ModelsFlightStatusLocation } from './Api';

export const rootStoreContext = createContext({
  RouterStore: routerStore,
  FlightLogStore: flightLogStore,
  AnalyticsStore: analyticsStore,
});

export const useStores = () => {
  const store = useContext(rootStoreContext);
  if (!store) {
    throw new Error('useStores must be used within a provider');
  }
  return store;
};
