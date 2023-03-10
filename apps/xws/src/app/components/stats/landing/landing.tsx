import { useStores } from '../../../../store';
import { useObserver } from 'mobx-react-lite';
import { Card, Col, Row, Statistic } from 'antd';
import { CardSize } from 'antd/es/card/Card';
import { DualAxes } from '@ant-design/plots';

/* eslint-disable-next-line */
export interface LandingProps {
  size: CardSize;
}

export function Landing(props: LandingProps) {
  const { FlightLogStore } = useStores();

  return useObserver(() => {
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
    return (
      <Card title={'Landing'} size={props.size}>
        <Row gutter={[8, 8]}>
          <Col span={16}>
            <DualAxes {...(config as any)} />
          </Col>
          <Col span={7} offset={1}>
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Statistic
                  title="Avg VS (ft/min)"
                  value={FlightLogStore.AvgLandingVS}
                  precision={0}
                  // valueStyle={{color: '#3f8600'}}
                  // valueStyle={{ fontSize: 'small' }}
                  // formatter={formatter}
                />
              </Col>
              <Col span={24}>
                <Statistic
                  title="Avg G"
                  value={FlightLogStore.AvgGForce}
                  precision={2}
                  // valueStyle={{ fontSize: 'small' }}
                  // valueStyle={{color: '#3f8600'}}
                  // suffix="%"
                  // formatter={formatter}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    );
  });
}

export default Landing;
