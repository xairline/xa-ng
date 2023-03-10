import {Col, Row} from 'antd';
import {ReactNode, useEffect, useState} from 'react';
import TableView from '../../components/table/table';
import {useObserver} from 'mobx-react-lite';
import MapArch from '../../components/map/mapArch';
import CountUp from 'react-countup';
import Landing from '../../components/stats/landing/landing';
import Flights from '../../components/stats/flights/flights';

/* eslint-disable-next-line */
export interface HeadquarterProps {
}

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

export function Headquarter(props: HeadquarterProps) {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  const formatter = (value: any): ReactNode => (
    <CountUp end={value} separator=","/>
  );
  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return useObserver(() => (
    <div>
      <Row gutter={[16, 8]}>
        <Col span={`${windowDimensions.width > 992 ? '12' : '12'}`}>
          <Flights size={'small'}/>
        </Col>
        <Col span={`${windowDimensions.width > 992 ? '12' : '12'}`}>
          <Landing size={'small'}/>
        </Col>
        <Col span={`${windowDimensions.width > 992 ? '12' : '24'}`}>
          <TableView
            height={`${
              windowDimensions.width > 992
                ? 'calc(43vh - 40px)'
                : 'calc(23vh - 100px)'
            }`}
          />
        </Col>
        <Col
          span={`${windowDimensions.width > 992 ? '12' : '24'}`}
          style={{
            height: `${windowDimensions.width > 992 ? '47vh' : '35vh'}`,
          }}
        >
          <MapArch/>
        </Col>
      </Row>
    </div>
  ));
}

export default Headquarter;
