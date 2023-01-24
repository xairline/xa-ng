import {Col, Layout, Menu, Row, theme} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBook, faBuilding} from '@fortawesome/free-solid-svg-icons';
import Headquarter from '../../pages/headquarter/headquarter';
import FlightLog from '../../pages/flight-log/flight-log';
import {Link} from 'react-router-dom';
import {useStores} from "../../../store";

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
    path: '/flight-log',
    name: 'Flight Log',
    icon: (
      <FontAwesomeIcon
        icon={faBook}
        style={{marginLeft: '10px', marginRight: '14px'}}
        size={'1x'}
      />
    ),
    comp: <FlightLog/>,
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
