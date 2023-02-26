import {Pie} from '@ant-design/plots';
import {Card, Col, Row, Select, Statistic} from 'antd';
import {useEffect, useState} from 'react';
import {useStores} from '../../../store';
import {formatter} from '../../components/stats/util';
import {useObserver} from 'mobx-react-lite';

/* eslint-disable-next-line */
export interface AnalyticsProps {
}

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

export function Analytics(props: AnalyticsProps) {
  const {FlightLogStore, AnalyticsStore} = useStores();

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
  return useObserver(() => {
    return (
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={'Filters'} size={'small'}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                Departure Airport:
                <Select
                  defaultValue=""
                  style={{width: 120}}
                  onChange={AnalyticsStore.setDepartureAirportId}
                  options={[
                    {value: '', label: 'All'},
                    ...Array.from(
                      new Set(
                        FlightLogStore.flightStatuses.map((flightStatus) => {
                          return flightStatus.departureFlightInfo?.airportId;
                        })
                      )
                    ).map((value) => {
                      return {value, label: value};
                    }),
                  ]}
                />
              </Col>
              <Col span={6}>
                Arrival Airport:
                <Select
                  defaultValue=""
                  style={{width: 120}}
                  onChange={AnalyticsStore.setArrivalAirportId}
                  options={[
                    {value: '', label: 'All'},
                    ...Array.from(
                      new Set(
                        FlightLogStore.flightStatuses.map((flightStatus) => {
                          if (
                            flightStatus.arrivalFlightInfo?.airportId?.length >
                            0
                          )
                            return flightStatus.arrivalFlightInfo?.airportId;
                        })
                      )
                    ).map((value) => {
                      return {value, label: value};
                    }),
                  ]}
                />
              </Col>
              <Col span={6}>
                Aircraft:
                <Select
                  defaultValue=""
                  style={{width: 120}}
                  onChange={AnalyticsStore.setAircraftICAO}
                  options={[
                    {value: '', label: 'All'},
                    ...Array.from(
                      new Set(
                        FlightLogStore.flightStatuses.map((flightStatus) => {
                          if (flightStatus?.aircraftICAO?.length > 0)
                            return flightStatus?.aircraftICAO;
                        })
                      )
                    ).map((value) => {
                      return {value, label: value};
                    }),
                  ]}
                />
              </Col>
              <Col span={6}>
                Source:
                <Select
                  defaultValue=""
                  style={{width: 120}}
                  onChange={AnalyticsStore.setSource}
                  options={[
                    {value: '', label: 'All'},
                    ...Array.from(
                      new Set(
                        FlightLogStore.flightStatuses.map((flightStatus) => {
                          if (flightStatus.source?.length > 0)
                            return flightStatus?.source;
                        })
                      )
                    ).map((value) => {
                      return {value, label: value};
                    }),
                  ]}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={`${windowDimensions.width > 992 ? '8' : '12'}`}>
          <Card title={'Top 5 Departure Airports'}>
            <Row>
              <Col span={12}>
                <Pie {...(config as any)} />
              </Col>
              <Col span={12}>
                <Pie {...(config as any)} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={`${windowDimensions.width > 992 ? '8' : '12'}`}>
          <Card title={'Top 5 Destination Airports'}>
            <Row>
              <Col span={12}>
                <Pie {...(config as any)} />
              </Col>
              <Col span={12}>
                <Pie {...(config as any)} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={`${windowDimensions.width > 992 ? '8' : '12'}`}>
          <Card title={'Top 5 Airplanes'}>
            <Row>
              <Col span={12}>
                <Pie {...(config as any)} />
              </Col>
              <Col span={12}>
                <Pie {...(config as any)} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={`${windowDimensions.width > 992 ? '8' : '12'}`}>
          <Card title={'Best Landings'}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="G-Force(TODO)"
                  value={FlightLogStore.TotalNumberOfFlights}
                  // valueStyle={{color: '#3f8600'}}
                  formatter={formatter}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="VS(TODO)"
                  value={FlightLogStore.TotalNumberOfFlights}
                  // valueStyle={{color: '#3f8600'}}
                  formatter={formatter}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Aircraft"
                  value={FlightLogStore.TotalNumberOfFlights}
                  // valueStyle={{color: '#3f8600'}}
                  formatter={formatter}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={`${windowDimensions.width > 992 ? '8' : '12'}`}>
          <Card title={'Fuel Consumption'}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="G-Force(TODO)"
                  value={FlightLogStore.TotalNumberOfFlights}
                  // valueStyle={{color: '#3f8600'}}
                  formatter={formatter}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="VS(TODO)"
                  value={FlightLogStore.TotalNumberOfFlights}
                  // valueStyle={{color: '#3f8600'}}
                  formatter={formatter}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Aircraft"
                  value={FlightLogStore.TotalNumberOfFlights}
                  // valueStyle={{color: '#3f8600'}}
                  formatter={formatter}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={`${windowDimensions.width > 992 ? '8' : '12'}`}>
          <Card title={'Flights'}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Last 60 Days(TODO)"
                  value={FlightLogStore.TotalNumberOfFlights}
                  // valueStyle={{color: '#3f8600'}}
                  formatter={formatter}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Last 30 Days(TODO)"
                  value={FlightLogStore.TotalNumberOfFlights}
                  // valueStyle={{color: '#3f8600'}}
                  formatter={formatter}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Flights"
                  value={FlightLogStore.TotalNumberOfFlights}
                  // valueStyle={{color: '#3f8600'}}
                  formatter={formatter}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    );
  });
}

export default Analytics;
