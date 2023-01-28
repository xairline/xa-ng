import {Col, Row, Spin} from 'antd';
import {useEffect, useState} from 'react';
import {useStores} from '../../../store';
import {useObserver} from 'mobx-react-lite';
import MapDetailed from '../../components/map/mapDetailed';
import {useParams} from 'react-router-dom';

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
          style={{height: `${windowDimensions.width > 992 ? '100%' : '30%'}`}}
        >
        </Col>
        <Col
          lg={14}
          span={24}
          style={{height: `${windowDimensions.width > 992 ? '100%' : '70%'}`}}
        >
          <MapDetailed data={FlightLogStore.mapData}/>
        </Col>
      </Row>
    )
  );
}

export default FlightLog;
