import App, { AppProps } from 'next/app';
import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import Head from 'next/head';
import Script from 'next/script';
import { PageLayout } from 'layouts';
import Background from 'layouts/Background';
import { mainTheme } from 'styles/theme';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { GoogleAnalytics } from 'nextjs-google-analytics';
import store from 'state';
import ApplicationUpdater from 'state/application/updater';
import TransactionUpdater from 'state/transactions/updater';
import ListsUpdater from 'state/lists/updater';
import UserUpdater from 'state/user/updater';
import MulticallUpdater from 'state/multicall/updater';
import MultiCallV3Updater from 'state/multicall/v3/updater';
import FarmUpdater from 'state/farms/updater';
import DualFarmUpdater from 'state/dualfarms/updater';
import CNTFarmUpdater from 'state/cnt/updater';
import SyrupUpdater from 'state/syrups/updater';
import { Web3ReactManager, Popups, TermsWrapper } from 'components';
import { appWithTranslation } from 'next-i18next';
import './index.scss';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = mainTheme;

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<Background fallback={true} />}>
      <ThemeProvider>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Suspense>
  );
};

function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <TransactionUpdater />
      <ListsUpdater />
      <MulticallUpdater />
      <MultiCallV3Updater />
      <UserUpdater />
      <FarmUpdater />
      <CNTFarmUpdater />
      <DualFarmUpdater />
      <SyrupUpdater />
    </>
  );
}

const MyApp = ({ Component, pageProps }: AppProps) => {
  const queryClient = new QueryClient();
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <link rel='icon' href='/logo_circle.png' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, minimum-scale=1'
        />
        <meta
          name='description'
          content='QuickSwap is a next-gen #DEX for #DeFi. Trade at lightning-fast speeds with near-zero gas fees.'
        />
        <link rel='apple-touch-icon' href='/logo_circle.png' />
        <title>QuickSwap</title>
      </Head>
      <Script
        id='arcx-analytics'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `
            const script = document.createElement('script'); 
            const apiKey = 'd29f17e774ac4e67247a2929a02a806f6787ac6cdbbb0fc41f721c6fc621156a'
            const config = {
              // We are tracking wallet connections manually
              trackWalletConnections: false
            } 
            script.src = 'https://unpkg.com/@arcxmoney/analytics'
            script.onload = function () {
              ArcxAnalyticsSdk.init(apiKey, config)
                .then(function (sdk) {
                  window.arcx = sdk
                })
            }
            document.head.appendChild(script)
          `,
        }}
      />
      {googleAnalyticsId && (
        <GoogleAnalytics trackPageViews gaMeasurementId={googleAnalyticsId} />
      )}
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <Providers>
            <TermsWrapper>
              <Web3ReactManager>
                <Updaters />
                <Popups />
                <PageLayout>
                  <Component {...pageProps} />
                </PageLayout>
              </Web3ReactManager>
            </TermsWrapper>
          </Providers>
        </Provider>
      </QueryClientProvider>
    </>
  );
};

MyApp.getInitialProps = async (appContext: any) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default appWithTranslation(MyApp);
