import React, { Suspense } from 'react';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
} from '@material-ui/core';
import { Provider } from 'react-redux';
import store from 'state';
import { LandingPage } from 'pages';
import { PageLayout } from 'layouts';
import { getLibrary } from 'utils'
import { NetworkContextName } from 'constants/index';
import ApplicationUpdater from 'state/application/updater'
import TransactionUpdater from 'state/transactions/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import UserUpdater from './state/user/updater'
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './App.css';
import { mainTheme } from './theme';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

const ThemeProvider: React.FC = ({ children }) => {
  let theme = mainTheme;

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

const Providers: React.FC = ({ children }) => {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <ThemeProvider>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </Suspense>
    </BrowserRouter>
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
  )
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <Updaters />
          <Providers>
            <Switch>
              <Route exact path='/'>
                <PageLayout>
                  <LandingPage />
                </PageLayout>
              </Route>
            </Switch>
          </Providers>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  );
}

export default App;
