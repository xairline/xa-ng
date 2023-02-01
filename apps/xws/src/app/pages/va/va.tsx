import {Button, Card, Col, Descriptions, Divider, Dropdown, Input, MenuProps, message, Row, Space, Spin,} from 'antd';
import {useEffect, useState} from 'react';
import {useStores} from '../../../store';
import {useObserver} from 'mobx-react-lite';
import {useParams} from 'react-router-dom';

/* eslint-disable-next-line */
export interface VaProps {
  id?: string;
}

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

export function Va(props: VaProps) {
  const {FlightLogStore, VaStore} = useStores();
  // Get the userId param from the URL.
  let {id} = useParams();
  const [loading, setLoading] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
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
      VaStore.loadVaInfo().then(() => {
        setLoading(false);
      });
    });
  }, []);

  // #DATA1=XACARS|1.0&DATA2=username~password~flightnumber~aircrafticao~altitudeorFL~flightrules~depicao~desticao~alticao~deptime(dd.mm.yyyy hh:mm)~blocktime(hh:mm)~flighttime(hh:mm)~blockfuel~flightfuel~pax~cargo~online(VATSIM|ICAO|FPI|[other])
  // #DATA1=XACARS|1.1&DATA2=xactesting~xactestingpass~xac1001~F100~24000~IFR~LOWW~LOWI~EDDM~01.07.2009 18:32~02:04~01:27~1980~1456~72~2100~VATSIM~123456719~123456729~123456739~123456749~22000~25000~23000~N43 12.2810~E18 12.3802~630~N43 12.2810~E18 12.3802~320~2347~3202~290~450
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    message.info('Click on left button.');
    console.log('click left button', e);
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    message.info('Click on menu item.');
    console.log('click', e);
  };

  return useObserver(() => {
    const items: { label: string; key: number }[] = VaStore.VaInfo.map(
      (vaInfo: any, index: number) => {
        return {
          label: vaInfo?.Name,
          key: index,
        };
      }
    );

    const menuProps = {
      items,
      onClick: handleMenuClick,
    };

    return loading ? (
      <Spin tip="Loading" size="large">
        <div className="content"/>
      </Spin>
    ) : (
      <>
        <Row style={{height: '100%'}} gutter={20}>
          <Col span={16}>
            <Card>FLIGHT DETAILS</Card>
          </Col>
          <Col span={8}>
            <Card>
              <Row gutter={16}>
                <Col span={24}>
                  <Dropdown.Button menu={menuProps} onClick={handleButtonClick}>
                    Select VA
                  </Dropdown.Button>
                  <Divider/>
                  <Space direction="vertical">
                    Username:
                    <Input
                      placeholder="Username"
                      onChange={(v) => console.log(v.nativeEvent.target.value)}
                    />
                    Password:
                    <Input.Password placeholder="Password"/>
                    <Button onClick={() => console.log()}>Login</Button>
                  </Space>
                </Col>
                <Col span={24} style={{paddingTop: '16px'}}>
                  <Descriptions
                    title={VaStore.VaInfo[0].Name}
                    bordered
                    size={'small'}
                    layout={`${
                      windowDimensions.width > 992 ? 'horizontal' : 'vertical'
                    }`}
                  >
                    <Descriptions.Item label="Address" span={24}>
                      {VaStore.VaInfo[0].Address}
                    </Descriptions.Item>
                    <Descriptions.Item label="PIREP" span={24}>
                      {VaStore.VaInfo[0].PIREP}
                    </Descriptions.Item>
                    <Descriptions.Item label="FlightInfo" span={24}>
                      {VaStore.VaInfo[0].FlightInfo}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </>
    );
  });
}

export default Va;
