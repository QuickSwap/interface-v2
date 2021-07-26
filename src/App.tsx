import React, { Suspense } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
} from '@material-ui/core';
import { mainTheme } from './theme';
import { LandingPage } from 'pages';
import { PageLayout } from 'layouts';
import './App.css';

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

function App() {
  return (
    <Providers>
      <Switch>
        <Route exact path='/'>
          <PageLayout>
            <LandingPage />
          </PageLayout>
        </Route>
      </Switch>
    </Providers>
  );
}

export default App;
