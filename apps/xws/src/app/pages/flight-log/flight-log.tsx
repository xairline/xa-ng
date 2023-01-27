import {Col, Row} from 'antd';
import {useEffect, useState} from 'react';
import {useStores} from '../../../store';
import {useObserver} from 'mobx-react-lite';
import TableView from '../../components/table/table';
import MapDetailed from '../../components/map/mapDetailed';

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
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return useObserver(() => (
    <Row style={{height: '100%'}} gutter={20}>
      <Col
        lg={10}
        span={24}
        style={{height: `${windowDimensions.width > 992 ? '100%' : '30%'}`}}
      >
        <TableView
          dataSet={FlightLogStore.tableDataSet}
          height={`${
            windowDimensions.width > 992
              ? 'calc(70vh - 100px)'
              : 'calc(25vh - 100px)'
          }`}
        />
      </Col>
      <Col
        lg={14}
        span={24}
        style={{height: `${windowDimensions.width > 992 ? '100%' : '70%'}`}}
      >
        <MapDetailed data={FlightLogStore.mapDataSet}/>
      </Col>
    </Row>
  ));
}

export default FlightLog;
