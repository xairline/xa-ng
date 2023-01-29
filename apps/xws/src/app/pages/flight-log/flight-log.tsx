import {Card, Col, Divider, Row, Spin, Tabs, Timeline} from 'antd';
import {useEffect, useState} from 'react';
import {useStores} from '../../../store';
import {useObserver} from 'mobx-react-lite';
import MapDetailed from '../../components/map/mapDetailed';
import {useParams} from 'react-router-dom';
import {ModelsFlightStatusLocation} from '../../../store/Api';

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
                  <Row gutter={8}>Working in progress ...</Row>
                  <Divider/>
                  <Row gutter={8}>
                    <Tabs
                      defaultActiveKey="1"
                      type="card"
                      size={'small'}
                      items={[
                        {
                          label: `Overview`,
                          key: `overview`,
                          children: `Working in progress ... `,
                        },
                        {
                          label: `Taxi`,
                          key: `taxi`,
                          children: `Working in progress ...`,
                        },
                        {
                          label: `Takeoff & Climb`,
                          key: `takeoffAndClimb`,
                          children: `Working in progress ...`,
                        },
                        {
                          label: `Landing`,
                          key: `landing`,
                          children: `Working in progress ...`,
                        },
                      ]}
                    />
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
