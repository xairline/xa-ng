/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ResponseError {
  message?: string;
}

export enum DataAccessDataRefType {
  TypeUnknown = 0,
  TypeInt = 1,
  TypeFloat = 2,
  TypeDouble = 4,
  TypeFloatArray = 8,
  TypeIntArray = 16,
  TypeData = 32,
}

export interface GormDeletedAt {
  time?: string;
  /** Valid is true if Time is not NULL */
  valid?: boolean;
}

export interface ModelsDatarefValue {
  dataref_type?: DataAccessDataRefType;
  name?: string;
  value?: any;
}

export interface ModelsFlightInfo {
  airportId?: string;
  airportName?: string;
  fuelWeight?: number;
  time?: number;
  totalWeight?: number;
}

export enum ModelsFlightState {
  FlightStateParked = 'parked',
  FlightStateTaxiOut = 'taxi_out',
  FlightStateTakeoff = 'takeoff',
  FlightStateClimb = 'climb',
  FlightStateCruise = 'cruise',
  FlightStateDescend = 'descend',
  FlightStateLanding = 'landing',
  FlightStateTaxiIn = 'taxi_in',
}

export interface ModelsFlightStatus {
  aircraftDisplayName?: string;
  aircraftICAO?: string;
  arrivalFlightInfo?: ModelsFlightInfo;
  createdAt?: string;
  deletedAt?: GormDeletedAt;
  departureFlightInfo?: ModelsFlightInfo;
  id?: number;
  locations?: ModelsFlightStatusLocation[];
  source?: string;
  updatedAt?: string;
  va_filed?: boolean;
}

export interface ModelsFlightStatusEvent {
  description?: string;
  eventType?: ModelsFlightStatusEventType;
}

export enum ModelsFlightStatusEventType {
  StateEvent = 'event:state',
}

export interface ModelsFlightStatusLocation {
  agl?: number;
  altitude?: number;
  createdAt?: string;
  deletedAt?: GormDeletedAt;
  event?: ModelsFlightStatusEvent;
  flightId?: number;
  fuel?: number;
  gearForce?: number;
  gforce?: number;
  gs?: number;
  heading?: number;
  ias?: number;
  id?: number;
  lat?: number;
  lng?: number;
  pitch?: number;
  state?: ModelsFlightState;
  timestamp?: number;
  updatedAt?: string;
  vs?: number;
}

export interface ModelsVa {
  Address?: string;
  FlightInfo?: string;
  Name?: string;
  PIREP?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '/apis';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title No title
 * @baseUrl /apis
 * @contact
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  flightLogs = {
    /**
     * No description
     *
     * @tags Flight_Logs
     * @name FlightLogsList
     * @summary Get a list of FlightLogs
     * @request GET:/flight-logs
     */
    flightLogsList: (
      query?: {
        /** specify if it's overview */
        isOverview?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ModelsFlightStatus[], ResponseError>({
        path: `/flight-logs`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Flight_Logs
     * @name FlightLogsDetail
     * @summary Get one FlightLog
     * @request GET:/flight-logs/{id}
     */
    flightLogsDetail: (id: string, params: RequestParams = {}) =>
      this.request<ModelsFlightStatus, void>({
        path: `/flight-logs/${id}`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  flightStatus = {
    /**
     * No description
     *
     * @tags Flight_Status
     * @name FlightStatusList
     * @summary Get current of FlightStatus
     * @request GET:/flightStatus
     */
    flightStatusList: (params: RequestParams = {}) =>
      this.request<ModelsFlightStatus, ResponseError>({
        path: `/flightStatus`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Flight_Status
     * @name LocationList
     * @summary Get current of location
     * @request GET:/flightStatus/location
     */
    locationList: (params: RequestParams = {}) =>
      this.request<ModelsFlightStatusLocation, ResponseError>({
        path: `/flightStatus/location`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  va = {
    /**
     * No description
     *
     * @tags Va
     * @name GetVa
     * @summary Get a list of Va
     * @request GET:/va
     */
    getVa: (params: RequestParams = {}) =>
      this.request<ModelsVa[], ResponseError>({
        path: `/va`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  xplm = {
    /**
     * No description
     *
     * @tags XPLM_Dataref
     * @name DatarefList
     * @summary Get Dataref
     * @request GET:/xplm/dataref
     */
    datarefList: (
      query: {
        /** xplane dataref string */
        dataref_str: string;
        /** alias name, if not set, dataref_str will be used */
        alias?: string;
        /** -1: raw, 2: round up to two digits */
        precision: number;
        /** transform xplane byte array to string */
        is_byte_array?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ModelsDatarefValue, ResponseError>({
        path: `/xplm/dataref`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags XPLM_Dataref
     * @name DatarefUpdate
     * @summary Set Dataref
     * @request PUT:/xplm/dataref
     */
    datarefUpdate: (params: RequestParams = {}) =>
      this.request<any, void>({
        path: `/xplm/dataref`,
        method: 'PUT',
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags XPLM_Dataref
     * @name DatarefsCreate
     * @summary Get a list of Dataref
     * @request POST:/xplm/datarefs
     */
    datarefsCreate: (params: RequestParams = {}) =>
      this.request<ModelsDatarefValue[], void>({
        path: `/xplm/datarefs`,
        method: 'POST',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags XPLM_Dataref
     * @name DatarefsUpdate
     * @summary Set a list of Dataref
     * @request PUT:/xplm/datarefs
     */
    datarefsUpdate: (params: RequestParams = {}) =>
      this.request<any, void>({
        path: `/xplm/datarefs`,
        method: 'PUT',
        type: ContentType.Json,
        ...params,
      }),
  };
}
