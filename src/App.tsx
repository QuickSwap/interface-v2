import React, { Suspense } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
} from '@material-ui/core';
import { Provider } from 'react-redux';
import store from 'state';
import { LandingPage } from 'pages';
import { PageLayout } from 'layouts';
import ApplicationUpdater from 'state/application/updater'
import TransactionUpdater from 'state/transactions/updater'
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './App.css';
import { mainTheme } from './theme';

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
    </>
  )
}

function App() {
  return (
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
  );
}

export default App;
