import {Card, Col, Divider, Row, Spin, Statistic, Tabs, Timeline} from 'antd';
import {useEffect, useState} from 'react';
import {useStores} from '../../../store';
import {useObserver} from 'mobx-react-lite';
import {useParams} from 'react-router-dom';
import {ModelsFlightStatusLocation} from '../../../store/Api';
import MapDetailed from '../../components/map/mapDetailed';
import {DualAxes} from '@ant-design/plots';

/* eslint-disable-next-line */
export interface FlightLogProps {
  id?: string;
}

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

export function FlightLog(props: FlightLogProps) {
  const {FlightLogStore} = useStores();
  // Get the userId param from the URL.
  let {id} = useParams();
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
  const config = {
    data: [
      FlightLogStore.LandingLineData.line as any[],
      FlightLogStore.LandingLineData.column as any[],
    ],
    xField: 'ts',
    yField: ['value', 'count'],
    height: 200,
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

  const overviewConfig = {
    data: [
      FlightLogStore.OverviewData.line as any[],
      FlightLogStore.OverviewData.column as any[],
    ],
    xField: 'ts',
    yField: ['value', 'count'],
    height: 200,
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
    height: 200,
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
  const landingConfig = {
    data: [
      FlightLogStore.LandingData.line as any[],
      FlightLogStore.LandingData.column as any[],
    ],
    xField: 'ts',
    yField: ['value', 'count'],
    height: 200,
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

  return useObserver(() =>
    loading ? (
      <Spin tip="Loading" size="large">
        <div className="content"/>
      </Spin>
    ) : (
      <Row style={{height: '100%'}} gutter={20}>
        <Col
          lg={10}
          span={24}
          style={{height: `${windowDimensions.width > 992 ? '100%' : '50%'}`}}
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
                  {FlightLogStore.FlightEvents.map(
                    (value: ModelsFlightStatusLocation) => {
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
                        <Timeline.Item>
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
                    <Col span={6}>
                      <Statistic
                        title={'Taxi Out'}
                        suffix={'min'}
                        loading={FlightLogStore.FlightDetailData.length == 0}
                        value={
                          ((FlightLogStore.FlightDetailData[1]
                              .timestamp as any) -
                            (FlightLogStore.FlightDetailData[0]
                              .timestamp as any)) /
                          60
                        }
                        precision={0}
                        valueStyle={{fontSize: 'small'}}
                      />
                    </Col>
                    <Col span={6} offset={2}>
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
                        valueStyle={{fontSize: 'small'}}
                      />
                    </Col>
                    <Col span={6} offset={2}>
                      <Statistic
                        title={'Taxi in'}
                        suffix={'min'}
                        loading={FlightLogStore.FlightDetailData.length == 0}
                        value={
                          (FlightLogStore.FlightDetailData[3]
                            .timestamp as any) -
                          (FlightLogStore.FlightDetailData[2]
                            .timestamp as any) /
                          60
                        }
                        precision={0}
                        valueStyle={{fontSize: 'small'}}
                      />
                    </Col>
                  </Row>
                  <Divider/>
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
                            children: <DualAxes {...(overviewConfig as any)} />,
                          },
                          {
                            label: `Takeoff`,
                            key: `takeoff`,
                            children: <DualAxes {...(takeoffConfig as any)} />,
                          },
                          {
                            label: `Landing`,
                            key: `landing`,
                            children: <DualAxes {...(landingConfig as any)} />,
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
          lg={14}
          span={24}
          style={{height: `${windowDimensions.width > 992 ? '100%' : '50%'}`}}
        >
          <MapDetailed data={FlightLogStore.mapData}/>
        </Col>
      </Row>
    )
  );
}

export default FlightLog;
