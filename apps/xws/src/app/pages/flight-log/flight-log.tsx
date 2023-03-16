import { Card, Col, Collapse, Row, Spin, Statistic, Timeline } from 'antd';
import { useEffect, useState } from 'react';
import { useStores } from '../../../store';
import { useObserver } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import {
  ModelsFlightStatusEvent,
  ModelsFlightStatusEventType,
} from '../../../store/Api';
import MapDetailed from '../../components/map/mapDetailed';
import { DualAxes } from '@ant-design/plots';

const { Panel } = Collapse;
/* eslint-disable-next-line */
export interface FlightLogProps {
  id?: string;
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function FlightLog(props: FlightLogProps) {
  const { FlightLogStore } = useStores();
  // Get the userId param from the URL.
  let { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    FlightLogStore.LoadFlightInfo(id as string).then(() => {
      setLoading(false);
    });
  }, []);

  const overviewConfig = {
    data: [
      FlightLogStore.OverviewData.line as any[],
      FlightLogStore.OverviewData.column as any[],
    ],
    xField: 'ts',
    yField: ['value', 'count'],
    height: 160,
    geometryOptions: [
      {
        geometry: 'line',
        seriesField: 'name',
        smooth: true,
        connectNull: true,
      },
      {
        geometry: 'column',
        isStack: false,
        isGroup: true,
        seriesField: 'type',
        columnWidthRatio: 0.4,
      },
    ],
  };
  const takeoffConfig = {
    data: [
      FlightLogStore.TakeoffData.line as any[],
      FlightLogStore.TakeoffData.column as any[],
    ],
    xField: 'ts',
    yField: ['value', 'count'],
    height: 160,
    geometryOptions: [
      {
        geometry: 'line',
        seriesField: 'name',
        smooth: true,
        connectNull: true,
      },
      {
        geometry: 'column',
        isStack: false,
        isGroup: true,
        seriesField: 'type',
        columnWidthRatio: 0.4,
      },
    ],
  };
  const touchDowns = FlightLogStore.LandingData.gearForce.filter(
    (v: any, index: number) => {
      return (
        v.value <= 1 &&
        FlightLogStore.LandingData.gearForce[index + 1].value >= 1
      );
    }
  );
  const annotations = touchDowns.map((v: any, index: number) => {
    return {
      type: 'line',
      top: true,
      start: { ts: v.ts, value: 'min' },
      end: { ts: v.ts, value: 'max' },

      style: {
        // textAlign: 'start',
        stroke: '#F4664A',
        lineWidth: 1,
        fill: 'red',
      },
      text: {
        content: 'touch down',
        position: 'end',
        autoRotate: false,
        offsetY: index * 14,
        offsetX: 4,
        style: {
          // textAlign: 'start',
          stroke: '#F4664A',
          // lineWidth: 4,
          fill: 'red',
        },
      },
    };
  });
  const landingConfig = {
    data: [
      FlightLogStore.LandingData.line as any[],
      FlightLogStore.LandingData.column as any[],
    ],
    xField: 'ts',
    yField: ['value', 'count'],
    height: 160,
    geometryOptions: [
      {
        geometry: 'line',
        seriesField: 'name',
        smooth: true,
        connectNull: true,
      },
      {
        geometry: 'column',
        isStack: false,
        isGroup: true,
        seriesField: 'type',
        columnWidthRatio: 0.4,
      },
    ],
    annotations: [annotations], //fix touch down line
  };
  return useObserver(() =>
    loading ? (
      <Spin tip="Loading" size="large">
        <div className="content" />
      </Spin>
    ) : (
      <Row style={{ height: '100%' }} gutter={8}>
        <Col
          lg={12}
          span={24}
          style={{
            height: `${windowDimensions.width > 992 ? '100%' : '60%'}`,
          }}
        >
          <Card
            style={{
              height: `${windowDimensions.width > 992 ? '100%' : '99%'}`,
              overflowY: 'auto',
            }}
          >
            <Row gutter={16} style={{ height: '100%' }}>
              <Col
                span={8}
                md={6}
                style={{
                  height: '100%',
                  paddingTop: '10px',
                }}
              >
                <Timeline>
                  {FlightLogStore.FlightEvents.map(
                    (value: ModelsFlightStatusEvent) => {
                      // convert time to hh:mm
                      const h = Math.floor(
                        ((value.timestamp as any) -
                          FlightLogStore.FlightEvents[0].timestamp) /
                          3600
                      );
                      const m = Math.floor(
                        ((value.timestamp as any) -
                          FlightLogStore.FlightEvents[0].timestamp -
                          h * 3600) /
                          60
                      );
                      return (
                        <Timeline.Item
                          key={value.timestamp + value.description}
                          color={
                            value.eventType ==
                            ModelsFlightStatusEventType.StateEvent
                              ? 'blue'
                              : 'red'
                          }
                        >
                          {h.toString().length == 1 ? '0' : ''}
                          {h}:{m.toString().length == 1 ? '0' : ''}
                          {m} - {value.details || value.description}
                        </Timeline.Item>
                      );
                    }
                  )}
                </Timeline>
              </Col>
              <Col span={16} md={18}>
                <Card
                  size={'small'}
                  style={{
                    height: '100%',
                  }}
                >
                  <Row gutter={2}>
                    <Col span={6}>
                      <Statistic
                        title={'Aircraft'}
                        loading={FlightLogStore.FlightDetailData.length == 0}
                        value={FlightLogStore.flightStatus.aircraftICAO}
                        valueStyle={{ fontSize: 'small' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title={'Airborne'}
                        suffix={'min'}
                        loading={FlightLogStore.FlightDetailData.length == 0}
                        value={
                          ((FlightLogStore.FlightDetailData[2]
                            .timestamp as any) -
                            (FlightLogStore.FlightDetailData[1]
                              .timestamp as any)) /
                          60
                        }
                        precision={0}
                        valueStyle={{ fontSize: 'small' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title={'Fuel (kg)'}
                        loading={FlightLogStore.FlightDetailData.length == 0}
                        value={
                          ((FlightLogStore.FlightDetailData[0].fuel as any) -
                            (FlightLogStore.FlightDetailData[3].fuel as any)) /
                          60
                        }
                        precision={0}
                        valueStyle={{ fontSize: 'small' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title={'Route'}
                        loading={FlightLogStore.FlightDetailData.length == 0}
                        value={`${FlightLogStore.flightStatus.departureFlightInfo?.airportId} - ${FlightLogStore.flightStatus.arrivalFlightInfo?.airportId}`}
                        valueStyle={{ fontSize: 'small' }}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Collapse
                      defaultActiveKey={['3']}
                      style={{
                        width: '100%',
                        marginTop: '16px',
                      }}
                    >
                      <Panel header="Overview" key="1">
                        <DualAxes {...(overviewConfig as any)} />
                      </Panel>
                      <Panel key={'2'} header={'Takeoff'}>
                        <DualAxes {...(takeoffConfig as any)} />
                      </Panel>
                      <Panel header="Landing" key="3">
                        <DualAxes {...(landingConfig as any)} />

                        <Collapse style={{ marginTop: '10px' }}>
                          {touchDowns.map((v: any, index: number) => {
                            return (
                              <Panel
                                header={`touchdown - ${index + 1}`}
                                key={index}
                              >
                                <Row gutter={12}>
                                  <Col span={6}>
                                    <Statistic
                                      title={'VS(ft/min)'}
                                      // suffix={'ft/min'}
                                      loading={
                                        FlightLogStore.FlightDetailData
                                          .length == 0
                                      }
                                      value={Math.min(
                                        ...FlightLogStore?.flightStatus?.locations
                                          ?.slice(
                                            FlightLogStore.LandingData
                                              .touchdownIndex[index],
                                            FlightLogStore.LandingData
                                              .touchdownIndex[index] + 50
                                          )
                                          .map((v) => v.vs)
                                      )}
                                      precision={0}
                                      valueStyle={{ fontSize: 'small' }}
                                    />
                                  </Col>
                                  <Col span={6}>
                                    <Statistic
                                      title={'IAS(kt)'}
                                      // suffix={'kt'}
                                      loading={
                                        FlightLogStore.FlightDetailData
                                          .length == 0
                                      }
                                      value={
                                        FlightLogStore?.flightStatus?.locations[
                                          FlightLogStore.LandingData
                                            .touchdownIndex[index]
                                        ].ias
                                      }
                                      precision={0}
                                      valueStyle={{ fontSize: 'small' }}
                                    />
                                  </Col>
                                  <Col span={6}>
                                    <Statistic
                                      title={'G Force'}
                                      value={Math.max(
                                        ...FlightLogStore?.flightStatus?.locations
                                          ?.slice(
                                            FlightLogStore.LandingData
                                              .touchdownIndex[index],
                                            FlightLogStore.LandingData
                                              .touchdownIndex[index] + 50
                                          )
                                          .map((v) => v.gforce)
                                      )}
                                      loading={
                                        FlightLogStore.FlightDetailData
                                          .length == 0
                                      }
                                      precision={2}
                                      valueStyle={{ fontSize: 'small' }}
                                    />
                                  </Col>
                                  <Col span={6}>
                                    <Statistic
                                      title={'Pitch(deg)'}
                                      // suffix={'deg'}
                                      loading={
                                        FlightLogStore.FlightDetailData
                                          .length == 0
                                      }
                                      value={
                                        FlightLogStore?.flightStatus?.locations[
                                          FlightLogStore.LandingData
                                            .touchdownIndex[index]
                                        ].pitch
                                      }
                                      precision={2}
                                      valueStyle={{ fontSize: 'small' }}
                                    />
                                  </Col>
                                </Row>
                              </Panel>
                            );
                          })}
                        </Collapse>
                      </Panel>
                      {/*<Panel header="Rules" key="4">*/}
                      {/*  <p>RULES</p>*/}
                      {/*  <p>RULES</p>*/}
                      {/*  <p>RULES</p>*/}
                      {/*  <p>RULES</p>*/}
                      {/*  <p>RULES</p>*/}
                      {/*</Panel>*/}
                    </Collapse>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col
          lg={12}
          span={24}
          style={{ height: `${windowDimensions.width > 992 ? '100%' : '40%'}` }}
        >
          <Card
            style={{
              height: `${windowDimensions.width > 992 ? '100%' : '99%'}`,
            }}
          >
            <MapDetailed data={FlightLogStore.mapData} />
          </Card>
        </Col>
      </Row>
    )
  );
}

export default FlightLog;
