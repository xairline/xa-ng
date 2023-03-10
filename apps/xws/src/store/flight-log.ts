import { action, computed, makeObservable, observable, toJS } from 'mobx';
import {
  Api,
  ModelsFlightState,
  ModelsFlightStatus,
  ModelsFlightStatusLocation,
} from './Api';
import { scaleQuantile } from 'd3-scale';

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
  @observable
  public AvgGForce: number;
  @observable
  public AvgLandingVS;
  @observable
  public TaxiOutDuration: number;
  @observable
  public TaxiOutFuel: number;
  @observable
  public AirborneDuration: number;
  @observable
  public AirborneFuel: number;
  @observable
  public TaxiInDuration: number;
  @observable
  public TaxiInFuel: number;

  private api: Api<ModelsFlightStatus>;

  constructor() {
    this.flightStatuses = [];
    this.flightStatus = {};
    this.AvgLandingVS = 0;
    this.AvgGForce = 0;
    this.AirborneDuration = 0;
    this.TaxiInDuration = 0;
    this.TaxiOutDuration = 0;
    this.AirborneFuel = 0;
    this.TaxiInFuel = 0;
    this.TaxiOutFuel = 0;
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
  get LandingData(): any {
    const line: any[] = [];
    const column: any[] = [];
    const gearForce: any[] = [];
    const touchdownIndex: number[] = [];
    let sampling: boolean = false;
    let lastTs: number = 0;
    this.flightStatus.locations?.forEach((location: any, index: number) => {
      if (location.state == ModelsFlightState.FlightStateLanding) {
        sampling = true;
        if (
          location.gearForce <= 1 &&
          this.flightStatus?.locations[index + 1]?.gearForce > 1
        ) {
          touchdownIndex.push(index);
        }
      }
      if (location.state == ModelsFlightState.FlightStateTaxiIn) {
        sampling = false;
      }

      if (sampling && location.timestamp - lastTs > 0) {
        lastTs = location.timestamp;
        line.push(
          {
            name: 'IAS',
            ts:
              Math.floor(
                (location.timestamp -
                  this.flightStatus.locations[0].timestamp) *
                  100
              ) / 100,
            value: location.ias,
          },
          {
            name: 'VS',
            ts:
              Math.floor(
                (location.timestamp -
                  this.flightStatus.locations[0].timestamp) *
                  100
              ) / 100,
            value: location.vs,
          },
          {
            name: 'AGL',
            ts:
              Math.floor(
                (location.timestamp -
                  this.flightStatus.locations[0].timestamp) *
                  100
              ) / 100,
            value: location.agl * 3.28084,
          }
        );
        column.push({
          type: 'G-Force',
          ts:
            Math.floor(
              (location.timestamp - this.flightStatus.locations[0].timestamp) *
                100
            ) / 100,
          count: location.gforce,
        });
        gearForce.push({
          ts:
            Math.floor(
              (location.timestamp - this.flightStatus.locations[0].timestamp) *
                100
            ) / 100,
          value: location.gearForce,
        });
      }
    });

    return { line, column, gearForce, touchdownIndex };
  }

  @computed
  get TakeoffData(): any {
    const line: any[] = [];
    const column: any[] = [];
    let sampling: boolean = false;
    let lastTs: number = 0;
    this.flightStatus.locations?.forEach((location: any, index: number) => {
      if (location.state == ModelsFlightState.FlightStateTakeoff) {
        sampling = true;
      }
      if (location.state == ModelsFlightState.FlightStateClimb) {
        sampling = false;
      }

      if (sampling && location.timestamp - lastTs > 0.5) {
        lastTs = location.timestamp;
        line.push(
          {
            name: 'IAS',
            ts:
              Math.floor(
                (location.timestamp -
                  this.flightStatus.locations[0].timestamp) *
                  10
              ) / 10,
            value: location.ias,
          },
          {
            name: 'VS',
            ts:
              Math.floor(
                (location.timestamp -
                  this.flightStatus.locations[0].timestamp) *
                  10
              ) / 10,
            value: location.vs,
          }
        );
        column.push({
          type: 'AGL',
          ts:
            Math.floor(
              (location.timestamp - this.flightStatus.locations[0].timestamp) *
                10
            ) / 10,
          count: location.agl * 3.28084,
        });
      }
    });

    return { line, column };
  }

  @computed
  get OverviewData(): any {
    const line: any[] = [];
    const column: any[] = [];
    let sampling: boolean = false;
    let lastTs: number = 0;
    this.flightStatus.locations?.forEach((location: any, index: number) => {
      if (location.state == ModelsFlightState.FlightStateTakeoff) {
        sampling = true;
      }
      if (location.state == ModelsFlightState.FlightStateTaxiIn) {
        sampling = false;
      }

      if (sampling && location.timestamp - lastTs > 10) {
        lastTs = location.timestamp;
        line.push({
          name: 'IAS',
          ts: Math.floor(
            location.timestamp -
              (this.flightStatus.locations[0].timestamp as any)
          ),
          value: location.ias,
        });
        column.push({
          type: 'AGL',
          ts: Math.floor(
            location.timestamp - this.flightStatus.locations[0].timestamp
          ),
          count: location.agl * 3.28084,
        });
      }
    });

    return { line, column };
  }

  @computed
  get LandingLineData(): any {
    const avgG: number[] = [];
    const avgVs: number[] = [];
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
    let counter = 0;
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

      if (g != 0) {
        counter++;
        line.push({
          name: 'VS(ft/min)',
          ts: counter,
          value: vs,
        });
        column.push({
          type: 'G-Force',
          ts: counter,
          count: g,
        });
        avgG.push(g);
        avgVs.push(vs);
      }
    });

    const AvgGForce =
      (avgG.reduce((partialSum, a) => partialSum + a, 0) * 1.0) / avgG.length;
    const AvgVs =
      (avgVs.reduce((partialSum, a) => partialSum + a, 0) * 1.0) / avgVs.length;
    this.setAvgVsAndG(AvgVs, AvgGForce);
    return { line, column };
  }

  @computed
  get FlightEvents(): any {
    let res = this.flightStatus.locations?.filter(
      (location: ModelsFlightStatusLocation) => {
        return (
          location.event?.eventType && (location.event?.eventType as any) !== ''
        );
      }
    );
    return res;
  }

  @computed
  get FlightDetailData(): ModelsFlightStatusLocation[] {
    if (
      !this.flightStatus.locations ||
      this.flightStatus.locations.length == 0
    ) {
      return [];
    }
    const res = [this.flightStatus.locations[0]];
    res.push(
      this.flightStatus.locations[
        this.flightStatus.locations
          .map((el) => el.state)
          .lastIndexOf(ModelsFlightState.FlightStateTaxiOut)
      ]
    );
    res.push(
      this.flightStatus.locations[
        this.flightStatus.locations
          .map((el) => el.state)
          .indexOf(ModelsFlightState.FlightStateTaxiIn)
      ]
    );
    res.push(
      this.flightStatus.locations[
        this.flightStatus.locations
          .map((el) => el.state)
          .lastIndexOf(ModelsFlightState.FlightStateTaxiIn)
      ]
    );
    return res;
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
        date: flightStatus.updatedAt,
        departure: flightStatus.departureFlightInfo,
        arrival: flightStatus.arrivalFlightInfo || '-',
        hasLocationData: flightStatus.locations
          ? flightStatus.locations?.length > 2
          : false,
        duration: !flightStatus.arrivalFlightInfo?.time
          ? '-'
          : !flightStatus.departureFlightInfo?.time
          ? '-'
          : flightStatus.arrivalFlightInfo.time -
            flightStatus.departureFlightInfo?.time,
      });
    });
    return { data, filters: [] };
  }

  @action
  setAvgVsAndG(vs: number, g: number) {
    this.AvgGForce = g;
    this.AvgLandingVS = vs;
  }

  @action
  async loadFlightStatuses() {
    let res = await this.api.flightLogs.flightLogsList({ isOverview: 'true' });
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
      item?.locations?.forEach((location: any, index: number) => {
        if (index < 2) return;
        let res: any = {
          path: [],
          timestamps: [],
          item: item,
        };
        const pathItem = [
          item?.locations[index].lng,
          item?.locations[index].lat,
          item?.locations[index].agl,
        ];
        const lastPathItem = [
          item?.locations[index - 1].lng,
          item?.locations[index - 1].lat,
          item?.locations[index - 1].agl,
        ];
        res.timestamps.push(location.timestamp);
        res.path.push(pathItem);
        res.path.push(lastPathItem);
        res.color = location.gearForce > 0 ? [92, 49, 8] : [22, 104, 220];
        paths.push(res);
        let resExt: any = {
          path: [],
        };
        resExt.path.push(pathItem);
        resExt.path.push([location.lng, location.lat, 0]);
        resExt.color = location.gearForce > 0 ? [92, 49, 8] : [22, 104, 220];
        pathsExt.push(resExt);
      });
    });
    return { paths, pathsExt };
  }
}

export const flightLogStore = new FlightLogStore();
