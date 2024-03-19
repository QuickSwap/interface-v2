import React from 'react';
import { useAccount, useChains } from '@orderly.network/hooks';
import PerpsProChart from './PerpsChart';
import { Theme, Button, Container, Flex, Switch, Tabs } from '@radix-ui/themes';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './index.css';
import '@radix-ui/themes/styles.css';
import { useActiveWeb3React } from 'hooks';
import { Account } from './Account';
import { Assets } from './Assets';
import { CreateOrder } from './CreateOrder';
import { Orderbook } from './Orderbook';
import { Orders } from './Orders';
import { Positions } from './Positions';
import { Market } from './Market';
import { Pairs } from './Pairs';
import { Leverage } from './Leverage';
import { AdvancedChart } from 'react-tradingview-embed';
import { GraphHeader } from './GraphHeader';
import { FinalPage } from './FinalPage';
import { Grid } from '@mui/material';
import { OrderbookV2 } from './OrderbookV2';
import { Layout } from './Layout';
import {MyOrderBook} from "./OrderBookEntry";

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
