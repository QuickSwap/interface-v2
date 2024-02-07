import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { isMobile } from 'react-device-detect';
import './index.scss';
import App from './App';
import { HashRouter } from 'react-router-dom';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './constants/index';

const GOOGLE_ANALYTICS_ID: string | undefined =
  process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
if (typeof GOOGLE_ANALYTICS_ID === 'string') {
  ReactGA.initialize(GOOGLE_ANALYTICS_ID);
  ReactGA.pageview(window.location.pathname + window.location.search);
  ReactGA.set({
    customBrowserType: !isMobile
      ? 'desktop'
      : 'web3' in window || 'ethereum' in window
      ? 'mobileWeb3'
      : 'mobileRegular',
  });
} else {
  ReactGA.initialize('test', { testMode: true, debug: true });
}

window.addEventListener('error', (error) => {
  ReactGA.exception({
    description: `${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`,
    fatal: true,
  });
});

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <script
        suppressHydrationWarning={true}
        dangerouslySetInnerHTML={{
          __html: `!(function (h, y, p, e, l, a, b) {
    ((l = document.createElement(h)).async = !0),
      (l.src = y),
      (l.onload = function () {
        (a = { URL: p, propertySlug: e, environment: 'production' }), HypeLab.initialize(a);
      }),
      (b = document.getElementsByTagName(h)[0]).parentNode.insertBefore(l, b);
  })('script', 'https://api.hypelab.com/v1/scripts/hp-sdk.js?v=0', 'https://api.hypelab.com', '81c00452a9');`,
        }}
      />
      <App />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
  serviceWorkerRegistration.register();
}
