import {Col, Row} from 'antd';
import {useObserver} from 'mobx-react-lite';
import {useParams} from 'react-router-dom';
import VaPanel from './va-panel';
import VaFlight from './va-flight';

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
  // Get the userId param from the URL.
  let {id} = useParams();

  return useObserver(() => {
    return (
      <>
        <Row style={{height: '100%'}} gutter={20}>
          <Col span={16}>
            <VaFlight id={id}/>
          </Col>
          <Col span={8}>
            <VaPanel/>
          </Col>
        </Row>
      </>
    );
  });
}

export default Va;
