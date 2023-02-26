import {action, makeObservable, observable, runInAction} from 'mobx';
import {Api, ModelsFlightStatus} from './Api';

class AnalyticsStore {
  @observable
  public flightLogs: ModelsFlightStatus[];
  public departureAirportId: string;
  public arrivalAirportId: string;
  public aircraftICAO: string;
  public source: string;

  private api: Api<ModelsFlightStatus>;

  constructor() {
    this.flightLogs = [];
    this.departureAirportId = '';
    this.arrivalAirportId = '';
    this.aircraftICAO = '';
    this.source = '';
    this.api = new Api<ModelsFlightStatus>();
    this.loadFlightStatuses();
    makeObservable(this);
  }

  @action
  async loadFlightStatuses() {
    let res = await this.api.flightLogs.flightLogsList({
      departureAirportId: this.departureAirportId,
      arrivalAirportId: this.arrivalAirportId,
      aircraftICAO: this.aircraftICAO,
      source: this.source,
    });
    runInAction(() => {
      this.flightLogs = res.data;
    });
  }

  public setDepartureAirportId = (value: string) => {
    this.departureAirportId = value;
    this.loadFlightStatuses();
  };

  public setArrivalAirportId = (value: string) => {
    this.arrivalAirportId = value;
    this.loadFlightStatuses();
  };

  public setAircraftICAO = (value: string) => {
    this.aircraftICAO = value;
    this.loadFlightStatuses();
  };

  public setSource = (value: string) => {
    this.source = value;
    this.loadFlightStatuses();
  };
}

export const analyticsStore = new AnalyticsStore();
