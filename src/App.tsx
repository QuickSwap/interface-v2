import React, { lazy, Suspense } from 'react';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { Switch, Route } from 'react-router-dom';
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
} from '@material-ui/core';
import { Provider } from 'react-redux';
import { GelatoProvider } from '@gelatonetwork/limit-orders-react';
import store from 'state';
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const DragonPage = lazy(() => import('./pages/DragonPage'));
const FarmPage = lazy(() => import('./pages/FarmPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PoolsPage = lazy(() => import('./pages/PoolsPage'));
const SwapPage = lazy(() => import('./pages/SwapPage'));
const AnalyticsTokenDetails = lazy(() =>
  import('./pages/AnalyticsTokenDetails'),
);
const AnalyticsPairDetails = lazy(() => import('./pages/AnalyticsPairDetails'));

import { PageLayout } from 'layouts';
import { getLibrary } from 'utils';
import StyledThemeProvider from 'theme/index';
import { Web3ReactManager, Popups } from 'components';
import { NetworkContextName } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import { useWalletModalToggle } from 'state/application/hooks';
import ApplicationUpdater from 'state/application/updater';
import TransactionUpdater from 'state/transactions/updater';
import ListsUpdater from 'state/lists/updater';
import UserUpdater from 'state/user/updater';
import MulticallUpdater from 'state/multicall/updater';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './i18n';
import './App.css';
import { mainTheme } from './theme';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

const ThemeProvider: React.FC = ({ children }) => {
  const theme = mainTheme;

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

const Providers: React.FC = ({ children }) => {
  return (
    <div>
      <Suspense fallback={null}>
        <ThemeProvider>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </Suspense>
    </div>
  );
};

function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <TransactionUpdater />
      <ListsUpdater />
      <MulticallUpdater />
      <UserUpdater />
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

const App: React.FC = () => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
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
                    <Route exact path='/swap'>
                      <PageLayout>
                        <SwapPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/pools'>
                      <PageLayout>
                        <PoolsPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/farm'>
                      <PageLayout>
                        <FarmPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/dragons'>
                      <PageLayout>
                        <DragonPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/analytics'>
                      <PageLayout>
                        <AnalyticsPage />
                      </PageLayout>
                    </Route>
                    <Route exact path='/analytics/token/:id'>
                      <PageLayout>
                        <AnalyticsTokenDetails />
                      </PageLayout>
                    </Route>
                    <Route exact path='/analytics/pair/:id'>
                      <PageLayout>
                        <AnalyticsPairDetails />
                      </PageLayout>
                    </Route>
                  </Switch>
                </Web3ReactManager>
              </Gelato>
            </StyledThemeProvider>
          </Providers>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  );
};

export default App;
