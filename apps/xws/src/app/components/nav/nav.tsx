import {Col, Layout, Menu, Row, theme} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBuilding, faChartLine, faPlane,} from '@fortawesome/free-solid-svg-icons';
import Headquarter from '../../pages/headquarter/headquarter';
import {Link} from 'react-router-dom';
import {useStores} from '../../../store';
import Live from '../../pages/live/live';
import Analytics from '../../pages/analytics/analytics';

const {Header} = Layout;
const MenuItem = Menu.Item;

export interface IRoute {
  path: string;
  exact?: boolean;
  name: string;
  icon?: React.ReactElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comp?: any;
}

export const routes: Array<IRoute> = [
  {
    path: '/',
    name: 'Headquarter',
    icon: (
      <FontAwesomeIcon
        icon={faBuilding}
        style={{marginLeft: '10px', marginRight: '14px'}}
        size={'1x'}
      />
    ),
    comp: <Headquarter/>,
  },
  // hq sub menus
  {
    path: '/live',
    name: 'Live',
    icon: (
      <FontAwesomeIcon
        icon={faPlane}
        style={{
          marginLeft: '6px',
          marginRight: '20px',
        }}
        size={'1x'}
      />
    ),
    comp: <Live/>,
  },
  {
    path: '/analytics',
    name: 'Analytics',
    icon: (
      <FontAwesomeIcon
        icon={faChartLine}
        style={{
          marginLeft: '6px',
          marginRight: '20px',
        }}
        size={'1x'}
      />
    ),
    comp: <Analytics/>,
  },
];

/* eslint-disable-next-line */
export interface NavProps {
  handleClick: () => void;
  isDarkMode: boolean;
}

export function Nav() {
  const {RouterStore} = useStores();
  const {
    token: {colorBgContainer},
  } = theme.useToken();
  return (
    <Header
      style={{
        padding: 0,
        background: colorBgContainer,
        position: 'sticky',
        width: '100%',
      }}
    >
      <Row>
        <Col flex="auto">
          <Menu
            mode="horizontal"
            theme={'dark'}
            style={{background: '#006363'}}
            defaultSelectedKeys={[RouterStore.getDefaultSelectedKeys()]}
            onSelect={(info) => {
              RouterStore.setSelectedMenuKey(parseInt(info.key));
            }}
          >
            {routes.map((route, index) => {
              return (
                <MenuItem key={index}>
                  <Link to={route.path}>
                    {route.icon || ''}
                    <span className="nav-text">{route.name}</span>
                  </Link>
                </MenuItem>
              );
            })}
          </Menu>
        </Col>
        {/*<Col flex="80px">*/}
        {/*  <Button*/}
        {/*    onClick={props.handleClick}*/}
        {/*    style={{*/}
        {/*      display: 'inline-block',*/}
        {/*      verticalAlign: 'middle',*/}
        {/*      marginLeft: "12px"*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    {props.isDarkMode ? 'Light' : 'Dark'}*/}
        {/*  </Button>*/}
        {/*</Col>*/}
      </Row>
    </Header>
  );
}
