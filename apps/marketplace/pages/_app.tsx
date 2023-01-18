import {AppProps} from 'next/app';
import Head from 'next/head';
import './styles.css';
import Navbar from '../components/navbar/navbar';
import {ThemeProvider} from 'next-themes';
import nightwind from 'nightwind/helper';

function CustomApp({Component, pageProps}: AppProps) {
  return (
    <>
      <Head>
        <title>XWS</title>
        <link rel="icon" type="image/x-icon" href="/images/icon.png"/>
        <script dangerouslySetInnerHTML={{__html: nightwind.init()}}/>
      </Head>

      <ThemeProvider
        attribute="class"
        storageKey="nightwind-mode"
        defaultTheme="system" // default "light"
      >
        <div className="h-screen">
          <Navbar/>
          <div className="bg-gray-50 h-[92%] md:h-[88%] lg:h-[84%] p-3 mb-6 md:p-4 lg:p-6 overflow-auto">
            <Component {...pageProps} />
          </div>
        </div>
      </ThemeProvider>
    </>
  );
}

export default CustomApp;
