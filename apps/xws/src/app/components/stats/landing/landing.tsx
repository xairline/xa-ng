import {useStores} from '../../../../store';
import {useObserver} from 'mobx-react-lite';
import {Card, Col, Row, Statistic} from 'antd';
import {CardSize} from 'antd/es/card/Card';
import {DualAxes} from '@ant-design/plots';

/* eslint-disable-next-line */
export interface LandingProps {
  size: CardSize;
}

export function Landing(props: LandingProps) {
  const {FlightLogStore} = useStores();
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
  return useObserver(() => (
    <Card title={'Landing'} size={props.size}>
      <Row>
        <Col span={18}>
          <DualAxes {...(config as any)} />
        </Col>
        <Col span={4} offset={2}>
          <Row gutter={[16, 16]}>
            <Col>
              <Statistic
                title="Avg VS"
                value={FlightLogStore.AvgLandingVS}
                precision={2}

                // valueStyle={{color: '#3f8600'}}
                suffix="ft/min"
                // formatter={formatter}
              />
            </Col>
            <Col>
              <Statistic
                title="Avg G"
                value={FlightLogStore.AvgGForce}
                precision={2}
                // valueStyle={{color: '#3f8600'}}
                // suffix="%"
                // formatter={formatter}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  ));
}

export default Landing;
