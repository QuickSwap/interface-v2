import React from 'react';
import { useAccount, useChains } from '@orderly.network/hooks';
import { Theme, Button, Container, Flex, Switch, Tabs } from '@radix-ui/themes';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './index.css';
import '@radix-ui/themes/styles.css';
import { useActiveWeb3React } from 'hooks';
import { Layout } from './Layout';

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
    <Theme style={{ color: 'white', alignSelf: 'center' }}>
      <Tabs.Root
        defaultValue='layout'
        style={{ marginTop: '1rem', color: 'white', alignSelf: 'center' }}
      >
        <Tabs.Content value='layout' style={{ color: 'white' }}>
          <Layout />
        </Tabs.Content>
      </Tabs.Root>
    </Theme>
  );
};

export default PerpsPage;
