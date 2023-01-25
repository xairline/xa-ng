import {Card, Col, Divider, Row, Statistic} from 'antd';
import CountUp from 'react-countup';
import {ReactNode, useEffect, useState} from 'react';
import TableView from '../../components/table/table';
import {useStores} from '../../../store';
import {useObserver} from 'mobx-react-lite';
import MapArch from '../../components/map/map';

/* eslint-disable-next-line */
export interface HeadquarterProps {
}

const formatter = (value: any): ReactNode => (
  <CountUp end={value} separator=","/>
);

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

export function Headquarter(props: HeadquarterProps) {
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
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Card
            title={'Flights'}
            size={`${windowDimensions.width > 992 ? 'default' : 'small'}`}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Total"
                  value={11.28}
                  precision={2}
                  valueStyle={{color: '#3f8600'}}
                  suffix="%"
                  formatter={formatter}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Tracked"
                  value={11.28}
                  precision={2}
                  valueStyle={{color: '#3f8600'}}
                  suffix="%"
                  formatter={formatter}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Airports"
                  value={11.28}
                  precision={2}
                  valueStyle={{color: '#3f8600'}}
                  suffix="%"
                  formatter={formatter}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title={'Hours'}
            size={`${windowDimensions.width > 992 ? 'default' : 'small'}`}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Total"
                  value={11.28}
                  precision={2}
                  valueStyle={{color: '#3f8600'}}
                  suffix="%"
                  formatter={formatter}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Airborne"
                  value={11.28}
                  precision={2}
                  valueStyle={{color: '#3f8600'}}
                  suffix="%"
                  formatter={formatter}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Ground"
                  value={11.28}
                  precision={2}
                  valueStyle={{color: '#3f8600'}}
                  suffix="%"
                  formatter={formatter}
                />
              </Col>
            </Row>
          </Card>
        </Col>{' '}
        <Col span={8}>
          <Card
            title={'Landings'}
            size={`${windowDimensions.width > 992 ? 'default' : 'small'}`}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Total"
                  value={11.28}
                  precision={2}
                  valueStyle={{color: '#3f8600'}}
                  suffix="%"
                  formatter={formatter}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Best"
                  value={11.28}
                  precision={2}
                  valueStyle={{color: '#3f8600'}}
                  suffix="%"
                  formatter={formatter}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Worst"
                  value={11.28}
                  precision={2}
                  valueStyle={{color: '#3f8600'}}
                  suffix="%"
                  formatter={formatter}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Divider/>
      <Row gutter={16}>
        <Col span={`${windowDimensions.width > 992 ? '10' : '24'}`}>
          <TableView
            dataSet={FlightLogStore.tableDataSet}
            height={`${
              windowDimensions.width > 992
                ? 'calc(50vh - 100px)'
                : 'calc(30vh - 100px)'
            }`}
          />
        </Col>
        <Col
          span={`${windowDimensions.width > 992 ? '14' : '24'}`}
          style={{
            height: `${windowDimensions.width > 992 ? '48vh' : '35vh'}`,
          }}
        >
          <MapArch data={FlightLogStore.mapDataSet}/>
        </Col>
      </Row>
    </div>
  ));
}

export default Headquarter;
