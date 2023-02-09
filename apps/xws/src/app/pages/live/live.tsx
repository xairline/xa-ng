import {useObserver} from 'mobx-react-lite';
import {useStores} from '../../../store';
import {Card, Col, Row, Spin, Tabs, Timeline} from 'antd';
import {ModelsFlightStatusLocation} from '../../../store/Api';
import {useEffect, useState} from 'react';
import MapDetailed from '../../components/map/mapDetailed';
import Overview from './components/overview';
import AutoPilot from './components/autopilot';
import FMC from './components/fmc';
import {runInAction} from 'mobx'; /* eslint-disable-next-line */

/* eslint-disable-next-line */
export interface LiveProps {
}

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

export function Live(props: LiveProps) {
  const {LiveStore} = useStores();
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    runInAction(() => {
      LiveStore.loadLiveFlightStatus();
    });
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return useObserver(() => {
    return LiveStore?.Events?.length <= 0 ? (
      <Spin tip="Loading" size="large">
        <div className="content"/>
      </Spin>
    ) : (
      <>
        <Row style={{height: '100%'}} gutter={20}>
          <Col
            lg={10}
            span={24}
            style={{
              height: `${windowDimensions.width > 992 ? '100%' : '50%'}`,
            }}
          >
            <Card style={{height: '99%'}}>
              <Row gutter={16} style={{height: '100%'}}>
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
                      (value: ModelsFlightStatusLocation) => {
                        if (value?.event?.description == '') {
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
                          <Timeline.Item key={value.timestamp}>
                            {h.toString().length == 1 ? '0' : ''}
                            {h}:{m.toString().length == 1 ? '0' : ''}
                            {m} - {value.event?.description}
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
                        <Tabs
                          defaultActiveKey="1"
                          type="card"
                          size={'small'}
                          items={[
                            {
                              label: `Overview`,
                              key: `overview`,
                              children: <Overview/>,
                            },
                            {
                              label: `AP`,
                              key: `ap`,
                              children: <AutoPilot/>,
                            },
                            {
                              label: `FMC`,
                              key: `fmc`,
                              children: <FMC/>,
                            },
                          ]}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
              <Row
                style={{
                  height: '85%',
                  paddingTop: '10px',
                }}
                gutter={[20, 20]}
              >
                <Col span={windowDimensions.width > 992 ? 12 : 6}>
                  <Card
                    title={'VS'}
                    size={windowDimensions.width > 992 ? 'small' : 'default'}
                    draggable={'true'}
                  >
                    {LiveStore.flightStatus.locations?.length > 0 ? (
                      LiveStore?.flightStatus?.locations[
                      LiveStore?.flightStatus?.locations?.length - 1
                        ]?.vs + " ft/min"
                    ) : (
                      <Spin tip="Loading" size="large"/>
                    )}
                  </Card>
                </Col>
                <Col span={windowDimensions.width > 992 ? 12 : 6}>
                  <Card
                    title={'Heading'}
                    size={windowDimensions.width > 992 ? 'small' : 'default'}
                  >
                    {LiveStore.flightStatus.locations?.length > 0 ? (
                      LiveStore?.flightStatus?.locations[
                      LiveStore?.flightStatus?.locations?.length - 1
                        ]?.heading
                    ) : (
                      <Spin tip="Loading" size="large"/>
                    )}
                  </Card>
                </Col>
                <Col span={windowDimensions.width > 992 ? 12 : 6}>
                  <Card
                    title={'Altitude'}
                    size={windowDimensions.width > 992 ? 'small' : 'default'}
                  >
                    {LiveStore.flightStatus.locations?.length > 0 ? (
                      Math.floor(
                        LiveStore?.flightStatus?.locations[
                        LiveStore?.flightStatus?.locations?.length - 1
                          ]?.altitude * 3.28084
                      ) + " ft"
                    ) : (
                      <Spin tip="Loading" size="large"/>
                    )}
                  </Card>
                </Col>
                <Col span={windowDimensions.width > 992 ? 12 : 6}>
                  <Card
                    title={'IAS'}
                    size={windowDimensions.width > 992 ? 'small' : 'default'}
                  >
                    {LiveStore.flightStatus.locations?.length > 0 ? (
                      LiveStore?.flightStatus?.locations[
                      LiveStore?.flightStatus?.locations?.length - 1
                        ]?.ias
                    ) : (
                      <Spin tip="Loading" size="large"/>
                    )}
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col
            lg={14}
            span={24}
            style={{
              height: `${windowDimensions.width > 992 ? '100%' : '50%'}`,
            }}
          >
            {LiveStore?.flightStatus?.locations?.length > 0 ? (
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
