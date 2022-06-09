import React, { useMemo, useState } from 'react';
import { Box } from '@material-ui/core';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import 'pages/styles/prdtPage.scss';

const PrdtPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box width='100%' id='PrdtPage'>
      <div style={{ height: '100%', width: '100%', overflowY: 'auto' }}>
        <iframe
          title='Predictions Market'
          allow='payment'
          frameBorder='0'
          height='900px'
          src={process.env.REACT_APP_PRDT_URL}
          width='100%'
        >
          <p>Your browser does not support iframes</p>
        </iframe>
      </div>
      <div className='externalDappWarningBanner'>
        <AlertTriangle size={20} />
        <span className='text-bold'> {t('prdtWarning')}</span>
      </div>
    </Box>
  );
};

export default PrdtPage;
