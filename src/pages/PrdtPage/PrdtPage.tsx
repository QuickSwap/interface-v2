import React, { useMemo, useState } from 'react';
import { Box } from '@material-ui/core';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import 'pages/styles/prdtPage.scss';

const PrdtPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box width='100%' id='PrdtPage'>
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
          src='https://cloudflare-ipfs.com/ipfs/QmRi3BuUDu5AoWNnKcWJmDwa4WSQSrvZRcyeqf2ApZCwAs/'
          width='100%'
        >
          <p>Your browser does not support iframes</p>
        </iframe>
      </div>
    </Box>
  );
};

export default PrdtPage;
