import {useState} from 'react';
import {ConfigProvider, Layout, Menu, theme} from 'antd';
import {useObserver} from 'mobx-react-lite';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {Nav, routes} from './components/nav/nav';

interface IRoute {
  path: string;
  exact?: boolean;
  name: string;
  icon?: React.ReactElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comp?: any;
}

const MenuItem = Menu.Item;
const {Header, Content, Footer} = Layout;

export function App() {
  const {defaultAlgorithm, darkAlgorithm} = theme;
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleClick = () => {
    setIsDarkMode((previousValue) => !previousValue);
  };
  const {
    token: {colorBgContainer},
  } = theme.useToken();

  return useObserver(() => (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {colorPrimary: '#006363'},
      }}
    >
      <BrowserRouter>
        <Layout className="layout app ">
          <Layout className="site-layout" style={{background: '#232424'}}>
            <Nav/>
            <Content
              className="main-content"
              style={{
                margin: '24px 16px',
                padding: 24,
                minHeight: 280,
                overflowY: 'scroll',
              }}
            >
              <Routes>
                {routes.map((route: IRoute, index) => {
                  console.log(route);
                  return (
                    <Route key={index} path={route.path} element={route.comp}/>
                  );
                })}
              </Routes>
            </Content>
            <Footer style={{textAlign: 'center'}}>
              X Web Stack ©2023 Created by X Airline
            </Footer>
          </Layout>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  ));
}

export default App;
