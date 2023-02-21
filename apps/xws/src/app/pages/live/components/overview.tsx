import {useObserver} from 'mobx-react-lite';
import {Spin} from 'antd';
import {useEffect, useState} from 'react';
import {useStores} from 'apps/xws/src/store';
import {DualAxes} from '@ant-design/plots';

/* eslint-disable-next-line */
export interface OverviewProps {
}

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

export function Overview(props: OverviewProps) {
  const {LiveStore} = useStores();
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
  const overviewConfig = {
    data: [
      LiveStore.OverviewData.line as any[],
      LiveStore.OverviewData.column as any[],
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
  return useObserver(() => {
    return LiveStore?.Events?.length <= 0 ? (
      <Spin tip="Loading" size="large" style={{marginTop: '200px'}}/>
    ) : (
      <>
        <DualAxes {...(overviewConfig as any)} />
      </>
    );
  });
}

export default Overview;
