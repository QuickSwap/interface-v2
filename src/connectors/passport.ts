import { config, passport } from '@imtbl/sdk';

const clientId = process.env.REACT_APP_PASSPORT_CLIENT_ID;
if (!clientId) throw new Error('Client ID is not defined');

export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.PRODUCTION,
    publishableKey: process.env.REACT_APP_PASSPORT_PUBLISHABLE_KEY,
  },
  clientId,
  redirectUri: 'https://quickswap.exchange',
  logoutRedirectUri: 'https://quickswap.exchange',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});

passportInstance.connectEvm();
