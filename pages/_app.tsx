import App, { AppProps } from 'next/app';
import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import Head from 'next/head';
import { PageLayout } from 'layouts';
import Background from 'layouts/Background';
import { Web3ReactProvider } from '@web3-react/core';
import { getLibrary } from 'utils';
import { mainTheme } from 'styles/theme';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
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
import AnalyticsUpdater from 'state/analytics/updater';
import AdsUpdater from 'state/ads/updater';
import GasUpdater from 'state/application/gasUpdater';
import StyledThemeProvider from 'theme/index';
import { Web3ReactManager, Popups } from 'components';
import dynamic from 'next/dynamic';
import { appWithTranslation } from 'next-i18next';
import './index.scss';

const Web3DefaultNetworkProvider = dynamic(
  () => import('components/Web3DefaultNetworkProvider'),
  { ssr: false },
);

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
      <AnalyticsUpdater />
      <AdsUpdater />
      <GasUpdater />
    </>
  );
}

const MyApp = ({ Component, pageProps }: AppProps) => {
  const queryClient = new QueryClient();

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
      <QueryClientProvider client={queryClient}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3DefaultNetworkProvider getLibrary={getLibrary}>
            <Provider store={store}>
              <Updaters />
              <Providers>
                <Popups />
                <StyledThemeProvider>
                  <Web3ReactManager>
                    <PageLayout>
                      <Component {...pageProps} />
                    </PageLayout>
                  </Web3ReactManager>
                </StyledThemeProvider>
              </Providers>
            </Provider>
          </Web3DefaultNetworkProvider>
        </Web3ReactProvider>
      </QueryClientProvider>
    </>
  );
};

MyApp.getInitialProps = async (appContext: any) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default appWithTranslation(MyApp);
