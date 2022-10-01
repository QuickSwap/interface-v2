import React, { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { Switch, Route } from 'react-router-dom';
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
} from '@material-ui/core';
import { Provider } from 'react-redux';
import { GelatoProvider } from '@gelatonetwork/limit-orders-react';
import store from 'state';
import GoogleAnalyticsReporter from './components/GoogleAnalytics/GoogleAnalyticsReporter';
const DragonPage = lazy(() => import('./pages/DragonPage'));
const FarmPage = lazy(() => import('./pages/FarmPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PoolsPage = lazy(() => import('./pages/PoolsPage'));
const SwapPage = lazy(() => import('./pages/SwapPage'));
const ConvertQUICKPage = lazy(() => import('./pages/ConvertQUICKPage'));
const LendPage = lazy(() => import('./pages/LendPage'));
const LendDetailPage = lazy(() => import('./pages/LendPage/LendDetailPage'));
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
import { getLibrary } from 'utils';
import StyledThemeProvider from 'theme/index';
import { Web3ReactManager, Popups } from 'components';
import { GlobalConst } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import { useWalletModalToggle } from 'state/application/hooks';
import ApplicationUpdater from 'state/application/updater';
import TransactionUpdater from 'state/transactions/updater';
import ListsUpdater from 'state/lists/updater';
import UserUpdater from 'state/user/updater';
import MulticallUpdater from 'state/multicall/updater';
import MultiCallV3Updater from 'state/multicall/v3/updater';
import FarmUpdater from 'state/farms/updater';
import DualFarmUpdater from 'state/dualfarms/updater';
import SyrupUpdater from 'state/syrups/updater';
import AnalyticsUpdater from 'state/analytics/updater';
import AdsUpdater from 'state/ads/updater';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './i18n';
import { mainTheme } from './theme';
import Background from 'layouts/Background';
import GasUpdater from 'state/application/gasUpdater';
import { RedirectExternal } from 'components/RedirectExternal/RedirectExternal';

import { getConfig } from 'config/index';

const Web3ProviderNetwork = createWeb3ReactRoot(
  GlobalConst.utils.NetworkContextName,
);

const ThemeProvider: React.FC = ({ children }) => {
  const theme = mainTheme;

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

const Providers: React.FC = ({ children }) => {
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
      <DualFarmUpdater />
      <SyrupUpdater />
      <AnalyticsUpdater />
      <AdsUpdater />
      <GasUpdater />
    </>
  );
}

function Gelato({ children }: { children?: React.ReactNode }) {
  const { library, chainId, account } = useActiveWeb3React();
  const toggleWalletModal = useWalletModalToggle();

  return (
    <GelatoProvider
      library={library}
      chainId={chainId}
      account={account ?? undefined}
      handler={'quickswap'}
      toggleWalletModal={toggleWalletModal}
      useDefaultTheme={false}
    >
      {children}
    </GelatoProvider>
  );
}

const queryClient = new QueryClient();

const App: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const showSwap = config['swap']['available'];
  const showPool = config['pools']['available'];
  const showFarm = config['farm']['available'];
  const showLair = config['lair']['available'];
  const showConvert = config['convert']['available'];
  const showPredictions = config['predictions']['available'];
  const showAnalytics = config['analytics']['available'];
  const showLending = config['lending']['available'];
  const showMigrate = config['migrate']['available'];
  const v2 = config['v2'];
  const v3 = config['v3'];
  return (
    <QueryClientProvider client={queryClient}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Route component={GoogleAnalyticsReporter} />
        <Web3ProviderNetwork getLibrary={getLibrary}>
          <Provider store={store}>
            <Updaters />
            <Providers>
              <Popups />
              <StyledThemeProvider>
                <Gelato>
                  <Web3ReactManager>
                    <Switch>
                      <Route exact path='/'>
                        <PageLayout>
                          <LandingPage />
                        </PageLayout>
                      </Route>
                      {showSwap && (
                        <Route exact path='/swap/:version?'>
                          <PageLayout>
                            <SwapPage />
                          </PageLayout>
                        </Route>
                      )}
                      {showLending && (
                        <Route exact path='/lend'>
                          <PageLayout>
                            <LendPage />
                          </PageLayout>
                        </Route>
                      )}
                      {showLending && (
                        <Route exact path='/lend/detail'>
                          <PageLayout>
                            <LendDetailPage />
                          </PageLayout>
                        </Route>
                      )}
                      {showPool && (
                        <Route exact path='/pools/:version?'>
                          <PageLayout>
                            <PoolsPage />
                          </PageLayout>
                        </Route>
                      )}
                      {showPool && v3 && (
                        <Route exact strict path='/pool/:tokenId'>
                          <PageLayout>
                            <PositionPage></PositionPage>
                          </PageLayout>
                        </Route>
                      )}
                      {showPool && v2 && (
                        <Route
                          exact
                          path='/add/:currencyIdA?/:currencyIdB?/:version?'
                        >
                          <PageLayout>
                            <PoolsPage></PoolsPage>
                          </PageLayout>
                        </Route>
                      )}
                      {showPool && v3 && (
                        <Route
                          exact
                          path='/increase/:currencyIdA?/:currencyIdB?/:tokenId'
                        >
                          <PageLayout>
                            <IncreaseLiquidityV3Page></IncreaseLiquidityV3Page>
                          </PageLayout>
                        </Route>
                      )}
                      {showPool && v3 && (
                        <Route exact path='/remove/:tokenId'>
                          <PageLayout>
                            <RemoveLiquidityV3Page></RemoveLiquidityV3Page>
                          </PageLayout>
                        </Route>
                      )}
                      {showMigrate && (
                        <Route exact path='/migrate'>
                          <PageLayout>
                            <MigrateV2LiquidityPage />
                          </PageLayout>
                        </Route>
                      )}
                      {showMigrate && (
                        <Route exact path='/migrate/:currencyIdA/:currencyIdB'>
                          <PageLayout>
                            <MigrateV2DetailsPage />
                          </PageLayout>
                        </Route>
                      )}
                      {showFarm && (
                        <Route exact path='/farm/:version?'>
                          <PageLayout>
                            <FarmPage />
                          </PageLayout>
                        </Route>
                      )}
                      {showLair && (
                        <Route exact path='/dragons'>
                          <PageLayout>
                            <DragonPage />
                          </PageLayout>
                        </Route>
                      )}
                      {showConvert && (
                        <Route exact path='/convert'>
                          <PageLayout>
                            <ConvertQUICKPage />
                          </PageLayout>
                        </Route>
                      )}
                      {showPredictions && (
                        <Route exact path='/predictions'>
                          <RedirectExternal
                            to={`${process.env.REACT_APP_PREDICTIONS_URL}`}
                          ></RedirectExternal>
                        </Route>
                      )}
                      {showAnalytics && (
                        <div>
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
                        </div>
                      )}
                    </Switch>
                  </Web3ReactManager>
                </Gelato>
              </StyledThemeProvider>
            </Providers>
          </Provider>
        </Web3ProviderNetwork>
      </Web3ReactProvider>
    </QueryClientProvider>
  );
};

export default App;
