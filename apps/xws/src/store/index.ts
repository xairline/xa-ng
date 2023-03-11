import { createContext, useContext } from 'react';
import { routerStore } from './router';
import { flightLogStore } from './flight-log';
import { vaStore } from './va';
import { liveStore } from './live';
import { analyticsStore } from './analytics';
import { ModelsFlightStatusLocation } from './Api';

export const rootStoreContext = createContext({
  RouterStore: routerStore,
  FlightLogStore: flightLogStore,
  VaStore: vaStore,
  LiveStore: liveStore,
  AnalyticsStore: analyticsStore,
});

export const useStores = () => {
  const store = useContext(rootStoreContext);
  if (!store) {
    throw new Error('useStores must be used within a provider');
  }
  return store;
};

export const locationsToEvents = (
  locations: ModelsFlightStatusLocation[]
): ModelsFlightStatusLocation[] => {
  let lastIndex = 0;
  let res: ModelsFlightStatusLocation[] = [];
  locations?.map((location: ModelsFlightStatusLocation, index: number) => {
    if (
      location.event?.eventType &&
      (location.event?.eventType as any) !== ''
    ) {
      res.push(location);
    }
  });
  return res;
};
