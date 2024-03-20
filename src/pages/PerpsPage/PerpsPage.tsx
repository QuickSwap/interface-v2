import React from 'react';
import { useAccount, useChains } from '@orderly.network/hooks';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './index.css';
import { useActiveWeb3React } from 'hooks';
import { Layout } from './Layout';
import { Tab, Tabs } from '@material-ui/core';

export const PerpsPage = () => {
  const { chainId, account, provider } = useActiveWeb3React();
  const widgetProps = {
    symbol: 'BINANCE:ETHUSD',
    timezone: 'Etc/UTC',
    theme: 'dark',
    hide_side_toolbar: true,
    hide_top_toolbar: true,
    withdateranges: true,
    save_image: false,
    allow_symbol_change: false,
  };
  return (
    <div style={{ color: 'white', alignSelf: 'center' }}>
      <Tabs
        defaultValue='layout'
        style={{ marginTop: '1rem', color: 'white', alignSelf: 'center' }}
      >
        <Tab value='layout' style={{ color: 'white' }}>
          <Layout />
        </Tab>
      </Tabs>
    </div>
  );
};

export default PerpsPage;
