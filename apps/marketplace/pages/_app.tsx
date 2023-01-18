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
        <div className="h-screen grid md:grid-rows-7 lg:row-span-6 grid-rows-7">
          <Navbar/>
          <div className="bg-slate-200 md:row-span-6 lg:row-span-5 row-span-6 h-full p-3 md:p-4 lg:p-6 overflow-auto">
            <Component {...pageProps} />
          </div>
        </div>
      </ThemeProvider>
    </>
  );
}

export default CustomApp;
