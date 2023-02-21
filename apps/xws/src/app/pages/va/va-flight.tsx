import {Card, Col, Descriptions, Divider, Form, FormInstance, Input, Row, Spin, Tooltip,} from 'antd';
import {useEffect, useState} from 'react';
import {useStores} from '../../../store';
import {useParams} from 'react-router-dom';
import {InfoCircleOutlined} from '@ant-design/icons';
import {useObserver} from 'mobx-react-lite';

/* eslint-disable-next-line */
export interface VaProps {
  id?: string;
  form: FormInstance;
}

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

export function VaFlight(props: VaProps) {
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
      const date = new Date(FlightLogStore.flightStatus.createdAt as string);
      props.form.setFieldsValue({
        aircraftICAO: FlightLogStore.flightStatus.aircraftICAO,
        depAirport: FlightLogStore.flightStatus.departureFlightInfo?.airportId,
        arrAirport: FlightLogStore.flightStatus.arrivalFlightInfo?.airportId,
        depTime: `${date.getDate()}.${
          date.getMonth() + 1
        }.${date.getFullYear()} ${date.getHours() + 1}:${date.getMinutes() < 10 ? "0" : ""}${date.getMinutes()}`,
        blockTime: `${
          Math.floor(
            (FlightLogStore?.flightStatus?.arrivalFlightInfo?.time -
              FlightLogStore.flightStatus.departureFlightInfo?.time) /
            3600
          ) > 10 || '0'
        }${Math.floor(
          (FlightLogStore.flightStatus.arrivalFlightInfo?.time -
            FlightLogStore.flightStatus.departureFlightInfo?.time) /
          3600
        )}:${
          Math.floor(
            ((FlightLogStore.flightStatus.arrivalFlightInfo?.time -
                FlightLogStore.flightStatus.departureFlightInfo?.time) %
              3600) /
            60
          ) > 10 || '0'
        }${Math.floor(
          ((FlightLogStore.flightStatus.arrivalFlightInfo?.time -
              FlightLogStore.flightStatus.departureFlightInfo?.time) %
            3600) /
          60
        )}`
        ,
        flightTime:
          `${
            Math.floor(
              ((FlightLogStore.FlightDetailData[2].timestamp as any) -
                (FlightLogStore.FlightDetailData[1].timestamp as any)) /
              3600
            ) > 10 || '0'
          }${Math.floor(
            ((FlightLogStore.FlightDetailData[2].timestamp as any) -
              (FlightLogStore.FlightDetailData[1].timestamp as any)) /
            3600
          )}:${
            Math.floor(
              (((FlightLogStore.FlightDetailData[2].timestamp as any) -
                  (FlightLogStore.FlightDetailData[1].timestamp as any)) %
                3600) /
              60
            ) > 10 || '0'
          }${Math.floor(
            (((FlightLogStore.FlightDetailData[2].timestamp as any) -
                (FlightLogStore.FlightDetailData[1].timestamp as any)) %
              3600) /
            60
          )}`
        ,
        blockFuel:
          `${
            FlightLogStore.FlightDetailData[3].fuel -
            FlightLogStore.FlightDetailData[0].fuel
          }`
        ,
        flightFuel:
          `${
            FlightLogStore.FlightDetailData[2].fuel -
            FlightLogStore.FlightDetailData[1].fuel
          }`
        ,
      });
    });
  }, []);
  // #DATA1=XACARS|1.0&DATA2=username~password~flightnumber~aircrafticao~altitudeorFL~flightrules~depicao~desticao~alticao~deptime(dd.mm.yyyy hh:mm)~blocktime(hh:mm)~flighttime(hh:mm)~blockfuel~flightfuel~pax~cargo~online(VATSIM|ICAO|FPI|[other])
  // #DATA1=XACARS|1.1&DATA2=xactesting~xactestingpass~xac1001~F100~24000~IFR~LOWW~LOWI~EDDM~01.07.2009 18:32~02:04~01:27~1980~1456~72~2100~VATSIM~123456719~123456729~123456739~123456749~22000~25000~23000~N43 12.2810~E18 12.3802~630~N43 12.2810~E18 12.3802~320~2347~3202~290~450
  return useObserver(() => {
    return loading ? (
      <Spin tip="Loading" size="large">
        <div className="content"/>
      </Spin>
    ) : (
      <>
        <Form form={props.form}>
          <Card>
            <Descriptions
              title={
                <Row justify={'end'}>
                  <Col span={2}>PIREP</Col>
                  <Col xl={16} lg={12} md={7}/>
                  <Col xl={6} lg={10} md={15}>
                    {/*<Form.Item>*/}
                    {/*  <Button>Load</Button>*/}
                    {/*  <Input*/}
                    {/*    placeholder={'SimBrief username'}*/}
                    {/*    style={{marginLeft: '8px', maxWidth: '200px'}}*/}
                    {/*  ></Input>*/}
                    {/*</Form.Item>*/}
                  </Col>
                </Row>
              }
              bordered
              size={'small'}
              // layout={`${
              //   windowDimensions.width > 992 ? 'horizontal' : 'vertical'
              // }`}
              column={{xxl: 2, xl: 2, lg: 2, md: 1, sm: 2, xs: 1}}
            >
              <Descriptions.Item label="Flight No.">
                <Form.Item name={'flightNo'} rules={[{required: true}]}>
                  <Input required/>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <Tooltip
                      title={
                        <>
                          <h3>Why ICAO doesn't match my aircraft?</h3>
                          <Divider/>
                          We are reading from x-plane directly so as long as
                          your plugin airplane's dev put what should be in the
                          acf file. You shouldn't have any problems. In the
                          past, we have seen cases some plugin development team
                          didn't set it properly. For example, A21N should be
                          set for A321NEO but because they used the same ACF
                          from their A321 plane, We will read it as A321 instead
                          of A21N
                        </>
                      }
                      trigger={'click'}
                    >
                      Aircraft ICAO{' '}
                      <InfoCircleOutlined style={{marginLeft: '6px'}}/>
                    </Tooltip>
                  </>
                }
              >
                <Form.Item name={'aircraftICAO'} rules={[{required: true}]}>
                  <Input required/>
                </Form.Item>
              </Descriptions.Item>

              <Descriptions.Item label="Flight Level">
                <Form.Item name={'flightLevel'} rules={[{required: true}]}>
                  <Input required/>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Flight Rules">IFR</Descriptions.Item>
              <Descriptions.Item label="Departure Airport">
                <Form.Item name={'depAirport'} rules={[{required: true}]}>
                  <Input disabled={true}/>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Arrival Airport">
                <Form.Item name={'arrAirport'} rules={[{required: true}]}>
                  <Input disabled={true}/>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Alternative Airport">
                <Form.Item name={'altAirport'} rules={[{required: true}]}>
                  <Input placeholder={'Alternative Airport'}/>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Departure Time">
                <Form.Item name={'depTime'} rules={[{required: true}]}>
                  <Input disabled={true}/>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Block Time(hh:mm)">
                <Form.Item name={'blockTime'} rules={[{required: true}]}>
                  <Input disabled={true}/>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Flight Time(hh:mm)">
                <Form.Item name={'flightTime'} rules={[{required: true}]}>
                  <Input disabled={true}/>
                </Form.Item>
              </Descriptions.Item>

              <Descriptions.Item label="Block Fuel">
                <Form.Item name={'blockFuel'} rules={[{required: true}]}>
                  <Input disabled={true}/>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Flight Fuel">
                <Form.Item name={'flightFuel'} rules={[{required: true}]}>
                  <Input disabled={true}/>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Pax">
                <Form.Item name={'pax'} rules={[{required: true}]}>
                  <Input required/>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Cargo">
                <Form.Item name={'cargo'} rules={[{required: true}]}>
                  <Input required/>
                </Form.Item>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Form>
      </>
    )
      ;
  });
}

export default VaFlight;
