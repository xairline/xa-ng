import {Button, Card, Col, Descriptions, Divider, Dropdown, Input, MenuProps, message, Row, Spin, Tooltip,} from 'antd';
import {useEffect, useState} from 'react';
import {useStores} from '../../../store';
import {useObserver} from 'mobx-react-lite';
import {vaStore} from '../../../store/va';
import {InfoCircleOutlined} from '@ant-design/icons';

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

export function VaPanel(props: VaProps) {
  const {VaStore} = useStores();
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
    VaStore.loadVaInfo().then(() => {
      setLoading(false);
    });
  }, []);
  const [selectedVaIndex, setSelectedVaIndex] = useState(0);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const index = parseInt(e.key);
    message.info(`${vaStore.VaInfo[index].Name} selected`);
    setSelectedVaIndex(index);
  };

  return useObserver(() => {
    const items: MenuProps['items'] = VaStore.VaInfo.map(
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
      selectable: true,
      defaultSelectedKeys: ['0'],
    };
    return vaStore.VaInfo.length <= 0 ? (
      <Spin tip="Loading" size="large">
        <div className="content"/>
      </Spin>
    ) : (
      <>
        <Card>
          <Row gutter={16}>
            <Col span={24}>
              <Dropdown menu={menuProps} placement="bottomLeft">
                <Button>Select your VA</Button>
              </Dropdown>
              <Tooltip
                title={
                  <>
                    <h3>Why my VA is not listed?</h3>
                    <Divider/>
                    We ask each VA owner to contact us before we can add your
                    VA. Email us at: admin@xairline.org from your VA's email
                    address.
                  </>
                }
                trigger={'click'}
              >
                <InfoCircleOutlined style={{marginLeft: '16px'}}/>
              </Tooltip>
              <Divider/>
              <Descriptions
                title={VaStore.VaInfo[selectedVaIndex].Name}
                bordered
                size={'small'}
                layout={`${
                  windowDimensions.width > 992 ? 'horizontal' : 'vertical'
                }`}
              >
                <Descriptions.Item label="Address" span={24}>
                  {VaStore.VaInfo[selectedVaIndex].Address}
                </Descriptions.Item>
                <Descriptions.Item label="PIREP" span={24}>
                  {VaStore.VaInfo[selectedVaIndex].PIREP}
                </Descriptions.Item>
                <Descriptions.Item label="FlightInfo" span={24}>
                  {VaStore.VaInfo[selectedVaIndex].FlightInfo}
                </Descriptions.Item>
              </Descriptions>
              <Divider/>
              Username:
              <Input
                placeholder="Username"
                style={{minWidth: '100px'}}
                onChange={(v) =>
                  console.log(v?.nativeEvent?.target?.value as any)
                }
              />
              Password:
              <Input.Password placeholder="Password"/>
              <Button
                onClick={() => message.info('file')}
                style={{marginTop: '10px', width: '100%'}}
              >
                File PIREP
              </Button>
            </Col>
            {/*<Col span={24} style={{ paddingTop: '16px' }}>*/}
            {/*  <Descriptions*/}
            {/*    title={VaStore.VaInfo[0].Name}*/}
            {/*    bordered*/}
            {/*    size={'small'}*/}
            {/*    layout={`${*/}
            {/*      windowDimensions.width > 992 ? 'horizontal' : 'vertical'*/}
            {/*    }`}*/}
            {/*  >*/}
            {/*    <Descriptions.Item label="Address" span={24}>*/}
            {/*      {VaStore.VaInfo[selectedVaIndex].Address}*/}
            {/*    </Descriptions.Item>*/}
            {/*    <Descriptions.Item label="PIREP" span={24}>*/}
            {/*      {VaStore.VaInfo[selectedVaIndex].PIREP}*/}
            {/*    </Descriptions.Item>*/}
            {/*    <Descriptions.Item label="FlightInfo" span={24}>*/}
            {/*      {VaStore.VaInfo[selectedVaIndex].FlightInfo}*/}
            {/*    </Descriptions.Item>*/}
            {/*  </Descriptions>*/}
            {/*</Col>*/}
          </Row>
        </Card>
      </>
    );
  });
}

export default VaPanel;
