import {useObserver} from 'mobx-react-lite';
import {Spin, Statistic} from 'antd';
import {useEffect, useState} from 'react';
import {useStores} from 'apps/xws/src/store';

/* eslint-disable-next-line */
export interface FMCProps {
}

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

export function FMC(props: FMCProps) {
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
    return LiveStore?.Events?.length <= 0 ? (
      <Spin tip="Loading" size="large" style={{marginTop: '200px'}}/>
    ) : (
      <>
        <Statistic/>
      </>
    );
  });
}

export default FMC;
