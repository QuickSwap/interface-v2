import React, { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Switch, Route } from 'react-router-dom';
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
} from '@material-ui/core';
import { Provider } from 'react-redux';
import store from 'state';
import GoogleAnalyticsReporter from './components/GoogleAnalytics/GoogleAnalyticsReporter';
const DragonPage = lazy(() => import('./pages/DragonPage'));
const FarmPage = lazy(() => import('./pages/FarmPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PoolsPage = lazy(() => import('./pages/PoolsPage'));
const SwapPage = lazy(() => import('./pages/SwapPage'));
const ContestPage = lazy(() => import('./pages/ContestPage'));
const ConvertQUICKPage = lazy(() => import('./pages/ConvertQUICKPage'));
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
import { Web3ReactManager, Popups, TermsWrapper } from 'components';
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
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './i18n';
import { mainTheme } from './theme';
import Background from 'layouts/Background';
import { RedirectExternal } from 'components/RedirectExternal/RedirectExternal';
import NotFound404Page from 'pages/NotFound404Page';

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
      <CNTFarmUpdater />
      <DualFarmUpdater />
      <SyrupUpdater />
      <AnalyticsUpdater />
    </>
  );
}

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Route component={GoogleAnalyticsReporter} />
      <Provider store={store}>
        <Providers>
          <TermsWrapper>
            <Web3ReactManager>
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
                <Route exact path='/add/:currencyIdA?/:currencyIdB?/:version?'>
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
                <Route path='*'>
                  <PageLayout>
                    <NotFound404Page />
                  </PageLayout>
                </Route>
              </Switch>
            </Web3ReactManager>
          </TermsWrapper>
        </Providers>
      </Provider>
    </QueryClientProvider>
  );
};

export default App;
