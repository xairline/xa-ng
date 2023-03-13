import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from 'mobx';
import {
  Api,
  ModelsDatarefValue,
  ModelsFlightState,
  ModelsFlightStatus,
} from './Api';

class LiveStore {
  @observable
  public flightStatus: ModelsFlightStatus;
  @observable
  public apState:
    | {
        AutothrottleEngage: boolean;
        HeadingHoldEngaged: boolean;
        WingLevelerEngaged: boolean;
        AirspeedHoldWithPitchEngaged: boolean;
        VVIClimbEngaged: boolean;
        AltitudeHoldArm: boolean;
        FlightLevelChangeEngage: boolean;
        PitchSyncEngage: boolean;
        HNAVArmed: boolean;
        HNAVEngaged: boolean;
        GlideslopeArmed: boolean;
        GlideslopeEngaged: boolean;
        FMSArmed: boolean;
        FMSEnaged: boolean;
        AltitudeHoldEngaged: boolean;
        HorizontalTOGAEngaged: boolean;
        VerticalTOGAEngaged: boolean;
        VNAVArmed: boolean;
        VNAVEngaged: boolean;
      }
    | any;
  private api: Api<ModelsFlightStatus>;
  private xplmApi: Api<ModelsDatarefValue>;

  constructor() {
    this.flightStatus = {};
    this.apState = {};
    this.api = new Api<ModelsFlightStatus>();
    this.xplmApi = new Api<ModelsDatarefValue>();
    setInterval(() => {
      runInAction(() => {
        this.loadLiveFlightStatus();
        this.loadDataref();
      });
    }, 20000);
    makeObservable(this);
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
  get Events(): any {
    return this.flightStatus.events
      ?.slice()
      .sort((a, b) => a.timestamp - b.timestamp);
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
        const ts = Math.floor(
          location.timestamp -
            (this.flightStatus?.locations
              ? (this.flightStatus.locations[0].timestamp as any)
              : 0)
        );
        console.log(ts);
        line.push({
          name: 'IAS',
          ts,
          value: location.ias,
        });
        column.push({
          type: 'AGL',
          ts,
          count: location.agl * 3.28084,
        });
      }
    });
    return { line, column };
  }

  @action
  async loadDataref() {
    const apState = await this.xplmApi.xplm.datarefList({
      dataref_str: 'sim/cockpit/autopilot/autopilot_state',
      precision: -1,
    });
    let apStateArray = (apState.data.value >>> 0).toString(2);
    this.apState = {
      AutoThrottleEngaged: apStateArray[0] == '1' ? true : false,
      HeadingHoldEngaged: apStateArray[1] == '1' ? true : false,
      WingLevelerEngaged: apStateArray[2] == '1' ? true : false,
      AirspeedHoldWithPitchEngaged: apStateArray[3] == '1' ? true : false,
      VVIClimbEngaged: apStateArray[4] == '1' ? true : false,
      AltitudeHoldArm: apStateArray[5] == '1' ? true : false,
      FlightLevelChangeEngage: apStateArray[6] == '1' ? true : false,
      PitchSyncEngage: apStateArray[7] == '1' ? true : false,
      HNAVArmed: apStateArray[8] == '1' ? true : false,
      HNAVEngaged: apStateArray[9] == '1' ? true : false,
      GlideslopeArmed: apStateArray[10] == '1' ? true : false,
      GlideslopeEngaged: apStateArray[11] == '1' ? true : false,
      FMSArmed: apStateArray[12] == '1' ? true : false,
      FMSEngaged: apStateArray[13] == '1' ? true : false,
      AltitudeHoldEngaged: apStateArray[14] == '1' ? true : false,
      HorizontalTOGAEngaged: apStateArray[15] == '1' ? true : false,
      VerticalTOGAEngaged: apStateArray[16] == '1' ? true : false,
      VNAVArmed: apStateArray[17] == '1' ? true : false,
      VNAVEngaged: apStateArray[18] == '1' ? true : false,
    };
  }

  @action
  async loadLiveFlightStatus() {
    let res = await this.api.flightStatus.flightStatusList();
    let flightStatus = res.data;
    res = await this.api.flightStatus.locationList();
    flightStatus.locations?.push(res.data);
    runInAction(() => {
      this.flightStatus = flightStatus;
    });
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
          color: [],
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
        res.item = location;
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

export const liveStore = new LiveStore();
