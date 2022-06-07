import React, { useMemo, useState } from 'react';
import { Box } from '@material-ui/core';
import { AlertTriangle } from 'react-feather';
import 'pages/styles/prdtPage.scss';

const PrdtPage: React.FC = () => {
  return (
    <Box width='100%' id='PrdtPage'>
      <div className='prdtWarningBanner'>
        <AlertTriangle size={20} />
        <span className='text-bold'>
          This feature is run by an external party. By using this software, you
          understand acknowledge and accept that the following page is not
          controlled by Quickswap, and may have issues, bugs or security flaws
          that quickswap cannot control, use at your own descression
        </span>
      </div>
      <div style={{ height: '100%', width: '100%', overflowY: 'auto' }}>
        <iframe
          title='Predictions Market'
          allow='payment'
          frameBorder='1px solid red'
          height='900px'
          src='https://ipfs.fleek.co/ipfs/QmRi3BuUDu5AoWNnKcWJmDwa4WSQSrvZRcyeqf2ApZCwAs/'
          width='100%'
        >
          <p>Your browser does not support iframes</p>
        </iframe>
      </div>
    </Box>
  );
};

export default PrdtPage;
