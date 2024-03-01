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
import { AdvancedChart } from 'react-tradingview-embed';
import { Grid, Card } from '@mui/material';

export const PerpsPage = () => {
  const { chainId, account, provider } = useActiveWeb3React();
  const widgetProps = {
    symbol: 'BINANCE:ETHUSD',
    auto: true,
    theme: 'dark',
    hide_side_toolbar: true,
    hide_top_toolbar: false,
    withdateranges: false,
    save_image: false,
    enable_publishing: false,
    allow_symbol_change: false,
  };
  return (
    <Grid container>
      <Grid item xs={12} sm={8} md={8}>
        <AdvancedChart widgetProps={widgetProps} />
      </Grid>
      <Grid item xs={12} sm={4} md={4}>
        <Orderbook />
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <Orders />
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <Card>4</Card>
      </Grid>
    </Grid>
  );
};

export default PerpsPage;
