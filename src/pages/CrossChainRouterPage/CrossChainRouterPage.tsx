import React, { useMemo, useState } from 'react';
import { Box } from '@material-ui/core';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import 'pages/styles/crossChainRouter.scss';

const CrossChainRouterPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box width='100%' id='cross-chain-router-page'>
      <div className='externalDappWarningBanner'>
        <AlertTriangle size={20} />
        <span className='text-bold'> {t('externalDappWarning')}</span>
      </div>
      <div style={{ height: '100%', width: '100%', overflowY: 'auto' }}>
        <iframe
          title='Predictions Market'
          allow='payment'
          frameBorder='1px solid red'
          height='900px'
          src='https://app.routerprotocol.com/swap?isWidget=true&widgetId=widget-0101&fromChain=137&toChain=1&fromToken=0x831753DD7087CaC61aB5644b308642cc1c33Dc13&toToken=0x6c28AeF8977c9B773996d0e8376d2EE379446F2f'
          width='100%'
        >
          <p>Your browser does not support iframes</p>
        </iframe>
      </div>
    </Box>
  );
};

export default CrossChainRouterPage;
