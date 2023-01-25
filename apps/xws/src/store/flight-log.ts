import {action, computed, makeObservable, observable, toJS} from 'mobx';
import {Api, ModelsFlightStatus} from './Api';

export interface TableDataSet {
  filters: any;
  data: any;
}

class FlightLogStore {
  @observable
  public flightStatuses: ModelsFlightStatus[];
  private api: Api<ModelsFlightStatus>;

  constructor() {
    this.flightStatuses = [];
    this.api = new Api<ModelsFlightStatus>();
    this.loadFlightStatuses();
    makeObservable(this);
  }

  @computed
  get mapDataSet() {
    const res = this.calculatePaths(this.flightStatuses) as any;
    return {
      paths: res.paths,
      pathsExt: res.pathsExt,
    };
  }

  @computed
  get tableDataSet(): TableDataSet {
    let data: any[] = [];
    this.flightStatuses.forEach((flightStatus) => {
      data.push({
        key: flightStatus.id,
        date: flightStatus.createdAt,
        departure: flightStatus.departureFlightInfo,
        arrival: flightStatus.arrivalFlightInfo || '-',
        duration: !flightStatus.arrivalFlightInfo?.time
          ? '-'
          : !flightStatus.departureFlightInfo?.time
            ? '-'
            : flightStatus.arrivalFlightInfo.time -
            flightStatus.departureFlightInfo?.time,
      });
    });
    return {data, filters: []};
  }

  @action
  async loadFlightStatuses() {
    let res = await this.api.flightLogs.flightLogsList({isOverview: 'true'});
    this.flightStatuses = res.data;
  }

  calculatePaths(data: ModelsFlightStatus[]): any {
    if (!data || !data.length) {
      return [];
    }

    let paths: any[] = [];
    let pathsExt: any[] = [];
    toJS(data).forEach((item: any) => {
      let res: any = {
        path: [],
        timestamps: [],
        item: item,
      };
      const num = Math.round(0xffffff * Math.random());
      const r = num >> 16;
      const g = (num >> 8) & 255;
      const b = num & 255;
      const color = [r, g, b];
      item?.Locations?.forEach((location: any) => {
        const pathItem = [location.Lng, location.Lat, location.Agl];
        res.timestamps.push(location.Timestamp);
        res.path.push(pathItem);
        res.color = color;
        let resExt: any = {
          path: [],
        };
        resExt.path.push(pathItem);
        resExt.path.push([location.Lng, location.Lat, 0]);
        resExt.color = color;
        pathsExt.push(resExt);
      });
      paths.push(res);
    });
    return {paths, pathsExt};
  }
}

export const flightLogStore = new FlightLogStore();
