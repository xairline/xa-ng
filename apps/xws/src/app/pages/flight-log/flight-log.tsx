import {Col, Row} from 'antd';
import {useEffect, useState} from 'react';
import {useStores} from '../../../store';
import {useObserver} from 'mobx-react-lite';
import {ModelsFlightStatus} from '../../../store/Api';
import {toJS} from 'mobx';
import MapArch from './map';
import TableView from "./table";

/* eslint-disable-next-line */
export interface FlightLogProps {
}

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

export function FlightLog(props: FlightLogProps) {
  const {FlightLogStore} = useStores();
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  const [data, setData] = useState({});

  function calculatePaths(data: ModelsFlightStatus[]): any {
    if (!data || !data.length) {
      return [];
    }

    let paths: any[] = [];
    let pathsExt: any[] = [];
    toJS(data).forEach((item: any) => {
      let res: any = {
        path: [],
        timestamps: [],
        item: item,
      };
      const num = Math.round(0xffffff * Math.random());
      const r = num >> 16;
      const g = (num >> 8) & 255;
      const b = num & 255;
      const color = [r, g, b];
      item?.Locations?.forEach((location: any) => {
        const pathItem = [location.Lng, location.Lat, location.Agl];
        res.timestamps.push(location.Timestamp);
        res.path.push(pathItem);
        res.color = color;
        let resExt: any = {
          path: [],
        };
        resExt.path.push(pathItem);
        resExt.path.push([location.Lng, location.Lat, 0]);
        resExt.color = color;
        pathsExt.push(resExt);
      });
      paths.push(res);
    });
    return {paths, pathsExt};
  }

  useEffect(() => {
    const fetchData = async () => {
      await FlightLogStore.loadFlightStatuses();

      const res = calculatePaths(FlightLogStore.flightStatuses) as any;
      setData(
        {
          paths: res.paths,
          pathsExt: res.pathsExt
        }
      );
    };

    // call the function
    fetchData()
      // make sure to catch any error
      .catch(console.error);
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return useObserver(() => (
    <Row style={{height: '100%'}}>
      <Col
        lg={10}
        span={24}
        style={{height: `${windowDimensions.width > 992 ? '100%' : '30%'}`}}
      >
        <TableView/>
      </Col>
      <Col
        lg={14}
        span={24}
        style={{height: `${windowDimensions.width > 992 ? '100%' : '70%'}`}}
      >
        <MapArch data={data}/>
      </Col>
    </Row>
  ));
}

export default FlightLog;
