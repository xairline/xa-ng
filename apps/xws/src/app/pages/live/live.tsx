import { useObserver } from 'mobx-react-lite';
import { useStores } from '../../../store';
import {
  Card,
  Col,
  Divider,
  Row,
  Space,
  Spin,
  Statistic,
  Tabs,
  Timeline,
} from 'antd';
import {
  ModelsFlightStatusEvent,
  ModelsFlightStatusEventType,
  ModelsFlightStatusLocation,
} from '../../../store/Api';
import { useEffect, useState } from 'react';
import MapDetailed from '../../components/map/mapDetailed';
import Overview from './components/overview';
import AutoPilot from './components/autopilot';
import { runInAction } from 'mobx'; /* eslint-disable-next-line */

/* eslint-disable-next-line */
export interface LiveProps {}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function Live(props: LiveProps) {
  const { LiveStore } = useStores();
  const [loading, setLoading] = useState(true);
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    runInAction(() => {
      LiveStore.loadLiveFlightStatus().then(() => {
        setLoading(false);
      });
    });
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return useObserver(() => {
    return loading || !LiveStore.flightStatus.aircraftICAO?.length > 0 ? (
      <Row style={{ marginTop: '30vh' }}>
        <Col span={8}></Col>
        <Col span={8}>
          <Card style={{ height: '20vh', width: '30vw' }}>
            <Spin
              tip="Waiting for aircraft ... "
              size="large"
              style={{ marginTop: '8vh' }}
            >
              <div className="content" />
            </Spin>
          </Card>
        </Col>
        <Col span={8}></Col>{' '}
      </Row>
    ) : (
      <>
        <Row style={{ height: '100%' }} gutter={20}>
          <Col
            lg={12}
            span={24}
            style={{
              height: `${windowDimensions.width > 992 ? '100%' : '50%'}`,
            }}
          >
            <Card style={{ height: '99%' }}>
              <Row gutter={16} style={{ height: '100%' }}>
                <Col
                  span={8}
                  md={6}
                  style={{
                    height: '100%',
                    overflowY: 'auto',
                    paddingTop: '10px',
                  }}
                >
                  <Timeline>
                    {LiveStore?.Events?.map(
                      (value: ModelsFlightStatusEvent) => {
                        if (value?.description == '') {
                          return;
                        }
                        // convert time to hh:mm
                        const h = Math.floor(
                          ((value.timestamp as any) -
                            LiveStore.Events[0].timestamp) /
                            3600
                        );
                        const m = Math.floor(
                          ((value.timestamp as any) -
                            LiveStore.Events[0].timestamp -
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
                            {m} -{' '}
                            {value.eventType ==
                            ModelsFlightStatusEventType.ViolationEvent
                              ? value.details
                              : value.description}
                          </Timeline.Item>
                        );
                      }
                    )}
                  </Timeline>
                </Col>
                <Col span={16} md={18}>
                  <Card>
                    <Row gutter={8}>
                      <Col span={24}>
                        <Row gutter={8}>
                          <Col span={8}>
                            <Statistic
                              title={'Aircraft'}
                              value={LiveStore.flightStatus.aircraftICAO}
                              valueStyle={{ fontSize: 'small' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic
                              title={'VS'}
                              suffix={'ft/min'}
                              value={
                                LiveStore?.flightStatus?.locations[
                                  LiveStore?.flightStatus?.locations?.length - 1
                                ]?.vs || 'NA'
                              }
                              precision={0}
                              valueStyle={{ fontSize: 'small' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic
                              title={'Heading'}
                              value={
                                LiveStore?.flightStatus?.locations[
                                  LiveStore?.flightStatus?.locations?.length - 1
                                ]?.heading
                              }
                              valueStyle={{ fontSize: 'small' }}
                            />
                          </Col>
                          <Divider />
                          <Col span={8}>
                            <Statistic
                              title={'Altitude'}
                              value={
                                Math.floor(
                                  (LiveStore?.flightStatus?.locations[
                                    LiveStore?.flightStatus?.locations?.length -
                                      1
                                  ]?.altitude *
                                    3.28084) /
                                    100
                                ) * 100
                              }
                              suffix={'ft'}
                              valueStyle={{ fontSize: 'small' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic
                              title={'IAS'}
                              value={
                                LiveStore?.flightStatus?.locations[
                                  LiveStore?.flightStatus?.locations?.length - 1
                                ]?.ias
                              }
                              precision={0}
                              suffix={'kt'}
                              valueStyle={{ fontSize: 'small' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic
                              title={'Fuel'}
                              value={
                                LiveStore?.flightStatus?.locations[
                                  LiveStore?.flightStatus?.locations?.length - 1
                                ]?.fuel
                              }
                              suffix={'kg'}
                              valueStyle={{ fontSize: 'small' }}
                            />
                          </Col>
                        </Row>
                        <Divider />
                        <Tabs
                          defaultActiveKey="1"
                          type="card"
                          size={'small'}
                          items={[
                            {
                              label: `Overview`,
                              key: `overview`,
                              children: <Overview />,
                            },
                            {
                              label: `AP`,
                              key: `ap`,
                              children: <AutoPilot />,
                            },
                          ]}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col
            lg={12}
            span={24}
            style={{
              height: `${windowDimensions.width > 992 ? '100%' : '50%'}`,
            }}
          >
            {LiveStore?.flightStatus?.locations &&
            LiveStore?.flightStatus?.locations?.length > 0 ? (
              <MapDetailed
                data={LiveStore.mapData}
                mapStyle={'mapbox://styles/mapbox/satellite-streets-v12'}
                viewState={{
                  longitude:
                    LiveStore.flightStatus.locations[
                      LiveStore.flightStatus.locations?.length - 1
                    ].lng,
                  latitude:
                    LiveStore.flightStatus.locations[
                      LiveStore.flightStatus.locations?.length - 1
                    ].lat,
                  zoom:
                    LiveStore.flightStatus.locations[
                      LiveStore.flightStatus.locations?.length - 1
                    ].gearForce > 1
                      ? 15
                      : 10,
                  pitch: 53,
                  bearing: -10,
                }}
              />
            ) : (
              <></>
            )}
          </Col>
        </Row>
      </>
    );
  });
}

export default Live;
