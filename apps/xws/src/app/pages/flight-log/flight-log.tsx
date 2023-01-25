import {Col, Row} from 'antd';
import {useEffect, useState} from 'react';
import {useStores} from '../../../store';
import {useObserver} from 'mobx-react-lite';
import MapArch from './map';
import TableView from './table';

/* eslint-disable-next-line */
export interface FlightLogProps {
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
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    const fetchData = async () => {
      await FlightLogStore.loadFlightStatuses();
    };
    fetchData().catch(console.error);
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return useObserver(() => (
    <Row style={{height: '100%'}}>
      <Col
        lg={10}
        span={24}
        style={{height: `${windowDimensions.width > 992 ? '100%' : '30%'}`}}
      >
        <TableView/>
      </Col>
      <Col
        lg={14}
        span={24}
        style={{height: `${windowDimensions.width > 992 ? '100%' : '70%'}`}}
      >
        <MapArch data={FlightLogStore.mapDataSet}/>
      </Col>
    </Row>
  ));
}

export default FlightLog;
