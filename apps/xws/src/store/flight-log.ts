import {action, computed, makeObservable, observable, toJS} from 'mobx';
import {Api, ModelsFlightStatus} from './Api';
import {scaleQuantile} from 'd3-scale';

export const inFlowColors = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132],
];

export const outFlowColors = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [177, 0, 38],
];

export interface TableDataSet {
  filters: any;
  data: any;
}

class FlightLogStore {
  @observable
  public flightStatuses: ModelsFlightStatus[];
  @observable
  public flightStatus: ModelsFlightStatus;

  private api: Api<ModelsFlightStatus>;

  constructor() {
    this.flightStatuses = [];
    this.flightStatus = {};
    this.api = new Api<ModelsFlightStatus>();
    this.loadFlightStatuses();
    makeObservable(this);
  }

  @computed
  get AirplaneStats() {
    var res: any[] = [];
    this.flightStatuses.forEach((flightStatus) => {
      const index = res.findIndex(
        (item: any) =>
          item.type ==
          `${
            flightStatus.aircraftICAO == ''
              ? 'Unknown'
              : flightStatus.aircraftICAO
          }`
      );
      if (index == -1) {
        res.push({
          type:
            flightStatus.aircraftICAO == ''
              ? 'Unknown'
              : flightStatus.aircraftICAO,
          value: 1,
        });
      } else {
        res[index].value += 1;
      }
    });
    return res;
  }

  @computed
  get mapData() {
    const res = this.calculatePaths([this.flightStatus]) as any;
    return {
      paths: res.paths,
      pathsExt: res.pathsExt,
    };
  }

  @computed
  get mapDataSet() {
    const res = this.calculatePaths(this.flightStatuses) as any;
    const arch = this.calculateArcs(this.flightStatuses);
    return {
      paths: res.paths,
      pathsExt: res.pathsExt,
      arch,
    };
  }

  @computed
  get LandingLineData(): any {
    const line: any[] = [
      {
        name: 'VS(ft/min)',
        ts: 0,
        value: 0,
      },
    ];
    const column: any[] = [
      {
        type: 'G-Force',
        ts: 0,
        count: 0,
      },
    ];
    this.flightStatuses.forEach((flightStatus) => {
      let touchDownCount = 0;
      let g: number = 0;
      let vs = 0;
      flightStatus.locations?.forEach((location: any, index: number) => {
        if ((location.state as any) == 'landing') {
          if (
            location!.gearForce! < 1 &&
            flightStatus!.locations![index + 1]!.gearForce! > 0
          ) {
            touchDownCount += 1;
            if (location!.vs! * -1 > vs) {
              vs = location.vs! * -1;
            }
          }
          if (location!.gforce! > g && location!.gearForce! > 1) {
            g = location.gforce!;
          }
        }
      });
      line.push({
        name: 'VS(ft/min)',
        ts: flightStatus.id,
        value: vs,
      });
      column.push(
        {
          type: 'G-Force',
          ts: flightStatus.id,
          count: g,
        }
        // {
        //   type: 'Touch Down',
        //   ts: flightStatus.id,
        //   count: touchDownCount,
        // }
      );
    });
    return {line, column};
  }

  @computed
  get TotalNumberOfHours(): number {
    let res: number = 0.0;
    this.flightStatuses.forEach((flightStatus) => {
      if (
        flightStatus.arrivalFlightInfo?.time &&
        flightStatus.departureFlightInfo?.time
      ) {
        res =
          res +
          (flightStatus.arrivalFlightInfo.time -
            flightStatus.departureFlightInfo?.time) /
          3600.0;
      }
    });
    return res;
  }

  @computed
  get TotalNumberOfFlights(): number {
    return this.flightStatuses.length;
  }

  @computed
  get TotalNumberOfAirplanes(): number {
    const unique = [
      ...new Set(this.flightStatuses.map((item) => item.aircraftICAO)),
    ]; // [ 'A', 'B']
    return unique.length;
  }

  @computed
  get TotalNumberOfAirports(): number {
    const airports = [
      ...this.flightStatuses.map((item) => item.departureFlightInfo?.airportId),
      ...this.flightStatuses
        .filter((item) => item.arrivalFlightInfo?.airportId != '')
        .map((item) => item.arrivalFlightInfo?.airportId),
    ];
    const unique = [...new Set(airports.map((item) => item))];
    return unique.length;
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

  @action
  async LoadFlightInfo(id: string) {
    let res = await this.api.flightLogs.flightLogsDetail(id);
    this.flightStatus = res.data;
  }

  calculateArcs(data: any) {
    if (!data || !data.length) {
      return null;
    }
    const arcs: any[] = [];
    this.flightStatuses.forEach((flightStatus) => {
      if (flightStatus.locations && flightStatus.locations?.length > 0) {
        arcs.push({
          source: [
            flightStatus.locations[0].lng,
            flightStatus.locations[0].lat,
          ],
          target: [
            flightStatus.locations[flightStatus.locations.length - 1].lng,
            flightStatus.locations[flightStatus.locations.length - 1].lat,
          ],
          value: flightStatus.id,
        });
      }
    });

    const scale = scaleQuantile()
      .domain(arcs.map((a: any) => Math.abs(a.value)))
      .range(inFlowColors.map((c, i) => i));

    arcs.forEach((a: any) => {
      a.gain = Math.sign(a.value);
      a.quantile = scale(Math.abs(a.value));
    });

    return arcs;
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
      item?.locations?.forEach((location: any) => {
        const pathItem = [location.lng, location.lat, location.agl];
        res.timestamps.push(location.Timestamp);
        res.path.push(pathItem);
        res.color = color;
        let resExt: any = {
          path: [],
        };
        resExt.path.push(pathItem);
        resExt.path.push([location.lng, location.lat, 0]);
        resExt.color = color;
        pathsExt.push(resExt);
      });
      paths.push(res);
    });
    return {paths, pathsExt};
  }
}

export const flightLogStore = new FlightLogStore();
