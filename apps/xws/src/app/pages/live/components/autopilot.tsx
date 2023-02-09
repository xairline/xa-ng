import {useObserver} from 'mobx-react-lite';
import {useEffect, useState} from 'react';
import {useStores} from 'apps/xws/src/store';
import {Badge, Space} from 'antd';

/* eslint-disable-next-line */
export interface AutoPilotProps {
}

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

export function AutoPilot(props: AutoPilotProps) {
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
  return useObserver(() => {
    return (
      <>
        <Space direction="horizontal">
          <Badge
            status={
              LiveStore.apState['AutoThrottleEngaged'] ? 'success' : 'error'
            }
            text={'A/TH'}
          />
          <Badge
            status={LiveStore.apState['FMSEngaged'] ? 'success' : 'error'}
            text={'AP'}
          />
        </Space>
      </>
    );
  });
}

export default AutoPilot;
