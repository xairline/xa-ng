import {action, makeObservable, observable} from 'mobx';
import {Api, ModelsFlightStatus} from './Api';

const routes: string[] = ['flight-logs'];

class FlightLogStore {
  @observable
  public flightStatuses: ModelsFlightStatus[];
  private api: Api<ModelsFlightStatus>;

  constructor() {
    this.flightStatuses = [];
    this.api = new Api<ModelsFlightStatus>();
    makeObservable(this);
  }

  @action
  async loadFlightStatuses(): Promise<void> {
    let res = await this.api.flightLogs.flightLogsList({isOverview: 'true'});
    this.flightStatuses = res.data;
  }
  
}

export const flightLogStore = new FlightLogStore();
