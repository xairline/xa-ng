import {action, computed, makeObservable, observable, toJS} from 'mobx';
import {Api, ModelsFlightStatus} from './Api';

class FlightLogStore {
  @observable
  public flightStatuses: ModelsFlightStatus[];
  private api: Api<ModelsFlightStatus>;

  constructor() {
    this.flightStatuses = [];
    this.api = new Api<ModelsFlightStatus>();
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

  @action
  async loadFlightStatuses(): Promise<void> {
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
