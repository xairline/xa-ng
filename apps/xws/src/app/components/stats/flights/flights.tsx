import {Card, Col, Row, Statistic} from 'antd';
import {CardSize} from 'antd/es/card/Card';
import {useStores} from '../../../../store';
import {useObserver} from 'mobx-react-lite';
import {formatter} from '../util';
import {Pie} from '@ant-design/plots/es';

/* eslint-disable-next-line */
export interface FlightsProps {
  size: CardSize;
}

export function Flights(props: FlightsProps) {
  const {FlightLogStore} = useStores();

  const config = {
    appendPadding: 10,
    data: FlightLogStore.AirplaneStats,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    autoFit: false,
    // width: 200,
    height: 200,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({percent}: any) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 12,
        textAlign: 'center',
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };
  return useObserver(() => (
    <Card title={'Flights'} size={'small'}>
      <Row gutter={16}>
        <Col span={16}>
          <Pie {...(config as any)} />
        </Col>
        <Col span={8}>
          <Statistic
            title="Total Flights"
            value={FlightLogStore.TotalNumberOfFlights}
            // valueStyle={{color: '#3f8600'}}
            formatter={formatter}
          />
          <Statistic
            title="Airports"
            value={FlightLogStore.TotalNumberOfAirports}
            // valueStyle={{color: '#3f8600'}}
            formatter={formatter}
          />
          <Statistic
            title="Total Hours"
            value={FlightLogStore.TotalNumberOfHours}
            precision={2}
            // valueStyle={{color: '#3f8600'}}
            // suffix="%"
            // formatter={formatter}
          />
        </Col>
      </Row>
    </Card>
  ));
}

export default Flights;
