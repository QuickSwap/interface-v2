import React, { lazy, Suspense, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'react-router-dom';
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
} from '@material-ui/core';
import { Provider } from 'react-redux';
import store from 'state';
import GoogleAnalyticsReporter from './components/GoogleAnalytics/GoogleAnalyticsReporter';
import { OrderlyConfigProvider } from '@orderly.network/hooks';
const PerpsPage = lazy(() => import('./pages/PerpsPage'));
const DragonPage = lazy(() => import('./pages/DragonPage'));
const FarmPage = lazy(() => import('./pages/FarmPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PoolsPage = lazy(() => import('./pages/PoolsPage'));
const SwapPage = lazy(() => import('./pages/SwapPage'));
const ContestPage = lazy(() => import('./pages/ContestPage'));
const ConvertQUICKPage = lazy(() => import('./pages/ConvertQUICKPage'));
const BondsPage = lazy(() => import('./pages/BondsPage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const NewsletterPage = lazy(() => import('./pages/NewsletterPage'));
const TOSPage = lazy(() => import('./pages/TOSPage'));
const AnalyticsTokenDetails = lazy(() =>
  import('./pages/AnalyticsTokenDetails'),
);
const AnalyticsPairDetails = lazy(() => import('./pages/AnalyticsPairDetails'));
const AnalyticsOverview = lazy(() =>
  import('./pages/AnalyticsPage/AnalyticsOverview'),
);
const AnalyticsHeader = lazy(() => import('./pages/AnalyticsPage'));
const AnalyticsTokens = lazy(() =>
  import('./pages/AnalyticsPage/AnalyticsTokens'),
);
const AnalyticsPairs = lazy(() =>
  import('./pages/AnalyticsPage/AnalyticsPairs'),
);
const RemoveLiquidityV3Page = lazy(() =>
  import('./pages/PoolsPage/v3/RemoveLiquidityPage'),
);
const IncreaseLiquidityV3Page = lazy(() =>
  import('./pages/PoolsPage/v3/IncreaseLiquidityPage'),
);
const MigrateV2LiquidityPage = lazy(() =>
  import('./pages/PoolsPage/v3/MigrateV2LiquidityPage'),
);
const MigrateV2DetailsPage = lazy(() =>
  import('./pages/PoolsPage/v3/MigrateV2DetailsPage'),
);
const PositionPage = lazy(() => import('./pages/PoolsPage/v3/PositionPage'));

import { PageLayout } from 'layouts';
import { Popups, TermsWrapper } from 'components';
import ApplicationUpdater from 'state/application/updater';
import TransactionUpdater from 'state/transactions/updater';
import ListsUpdater from 'state/lists/updater';
import UserUpdater from 'state/user/updater';
import MulticallUpdater from 'state/multicall/updater';
import MultiCallV3Updater from 'state/multicall/v3/updater';
import SyrupUpdater from 'state/syrups/updater';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './i18n';
import { mainTheme } from './theme';
import Background from 'layouts/Background';
import { RedirectExternal } from 'components/RedirectExternal/RedirectExternal';
import NotFound404Page from 'pages/NotFound404Page';
import ForbiddenPage from 'pages/ForbiddenPage';
import { ArcxAnalyticsProvider } from '@arcxmoney/analytics';
import '@orderly.network/react/dist/styles.css';
import './index.scss';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react';
import { ChainId } from '@uniswap/sdk';
import { SUPPORTED_CHAINIDS } from 'constants/index';
import { getConfig } from 'config/index';
import 'connectors/passport';
import {
  createSoulZapApiClient,
  SoulZapApiClient,
} from 'utils/soulZapTrpcClient';

const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ?? '';

const metadata = {
  name: 'QuickSwap',
  description: 'Largest DEX on Polygon',
  url: 'https://quickswap.exchange',
  icons: ['https://quickswap.exchange/logo_circle.png'],
};

const ethersConfig = defaultConfig({
  metadata,
  defaultChainId: ChainId.MATIC,
});

const chainsToShow = SUPPORTED_CHAINIDS.filter((chainId) => {
  const config = getConfig(chainId);
  return !!config;
});
const chains = chainsToShow.map((chainId) => {
  const config = getConfig(chainId);
  return {
    chainId,
    name: config['networkName'],
    currency: config['nativeCurrency']['symbol'],
    explorerUrl: config['blockExplorer'],
    rpcUrl: config['rpc'],
  };
});

const chainImages: { [chainId: number]: string } = {};
chainsToShow.forEach((chainId) => {
  const config = getConfig(chainId);
  chainImages[chainId] = config['nativeCurrencyImage'];
});

createWeb3Modal({
  ethersConfig,
  chains,
  chainImages,
  projectId,
  enableAnalytics: true,
  allowUnsupportedChain: true,
  enableOnramp: true,
});

const ThemeProvider: React.FC<{ children: any }> = ({ children }) => {
  const theme = mainTheme;

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

const Providers: React.FC<{ children: any }> = ({ children }) => {
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
      <SyrupUpdater />
    </>
  );
}

const queryClient = new QueryClient();

const App: React.FC = () => {
  const arcxAPIKey = process.env.REACT_APP_ARCX_KEY ?? '';
  const soulZapAPIEndpoint = process.env.REACT_APP_SOULZAP_API_ENDPOINT;
  const [soulZapApiClient] = useState(() =>
    createSoulZapApiClient(soulZapAPIEndpoint),
  );

  return (
    <ArcxAnalyticsProvider apiKey={arcxAPIKey}>
      <SoulZapApiClient.Provider
        client={soulZapApiClient}
        queryClient={queryClient}
      >
        <QueryClientProvider client={queryClient}>
          <OrderlyConfigProvider brokerId='quick_perps' networkId='mainnet'>
            <Route component={GoogleAnalyticsReporter} />
            <Provider store={store}>
              <Providers>
                <TermsWrapper>
                  <Updaters />
                  <Popups />
                  <Switch>
                    <Route exact path='/'>
                      <PageLayout>
                        <LandingPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/swap/:version?'>
                      <PageLayout>
                        <SwapPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/leader-board'>
                      <PageLayout>
                        <ContestPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/pools/:version?'>
                      <PageLayout>
                        <PoolsPage />
                      </PageLayout>
                    </Route>
                    <Route exact strict path='/pool/:tokenId'>
                      <PageLayout>
                        <PositionPage></PositionPage>
                      </PageLayout>
                    </Route>
                    <Route exact strict path='/falkor'>
                      <PageLayout>
                        <PerpsPage />
                      </PageLayout>
                    </Route>
                    <Route
                      exact
                      path='/add/:currencyIdA?/:currencyIdB?/:version?'
                    >
                      <PageLayout>
                        <PoolsPage></PoolsPage>
                      </PageLayout>
                    </Route>
                    <Route
                      exact
                      path='/increase/:currencyIdA?/:currencyIdB?/:tokenId'
                    >
                      <PageLayout>
                        <IncreaseLiquidityV3Page></IncreaseLiquidityV3Page>
                      </PageLayout>
                    </Route>
                    <Route exact path='/remove/:tokenId'>
                      <PageLayout>
                        <RemoveLiquidityV3Page></RemoveLiquidityV3Page>
                      </PageLayout>
                    </Route>
                    <Route exact path='/migrate'>
                      <PageLayout>
                        <MigrateV2LiquidityPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/migrate/:currencyIdA/:currencyIdB'>
                      <PageLayout>
                        <MigrateV2DetailsPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/farm/:version?'>
                      <PageLayout>
                        <FarmPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/dragons'>
                      <PageLayout>
                        <DragonPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/convert'>
                      <PageLayout>
                        <ConvertQUICKPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/bonds'>
                      <PageLayout>
                        <BondsPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/newsletter'>
                      <PageLayout>
                        <NewsletterPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/tos'>
                      <PageLayout>
                        <TOSPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/gamehub'>
                      <RedirectExternal
                        to={`${process.env.REACT_APP_GAMEHUB_URL}`}
                        target={'_top'}
                      ></RedirectExternal>
                    </Route>
                    <Route exact path='/analytics/:version?'>
                      <PageLayout>
                        <AnalyticsHeader />
                        <AnalyticsOverview />
                      </PageLayout>
                    </Route>
                    <Route exact path='/analytics/:version/tokens'>
                      <PageLayout>
                        <AnalyticsHeader />
                        <AnalyticsTokens />
                      </PageLayout>
                    </Route>
                    <Route exact path='/analytics/:version/pairs'>
                      <PageLayout>
                        <AnalyticsHeader />
                        <AnalyticsPairs />
                      </PageLayout>
                    </Route>
                    <Route exact path='/analytics/:version/token/:id'>
                      <PageLayout>
                        <AnalyticsTokenDetails />
                      </PageLayout>
                    </Route>
                    <Route exact path='/analytics/:version/pair/:id'>
                      <PageLayout>
                        <AnalyticsPairDetails />
                      </PageLayout>
                    </Route>
                    <Route exact path='/calculator/0.01-eth-to-usd'>
                      <PageLayout>
                        <CalculatorPage />
                      </PageLayout>
                    </Route>
                    <Route path='/forbidden'>
                      <PageLayout>
                        <ForbiddenPage />
                      </PageLayout>
                    </Route>
                    <Route path='*'>
                      <PageLayout>
                        <NotFound404Page />
                      </PageLayout>
                    </Route>
                  </Switch>
                </TermsWrapper>
              </Providers>
            </Provider>
          </OrderlyConfigProvider>
        </QueryClientProvider>
      </SoulZapApiClient.Provider>
    </ArcxAnalyticsProvider>
  );
};

export default App;
