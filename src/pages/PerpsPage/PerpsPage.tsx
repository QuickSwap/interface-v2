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
import {Leverage} from "./Leverage";
import { AdvancedChart } from 'react-tradingview-embed';
import { Grid } from '@mui/material';

export const PerpsPage = () => {
  const { chainId, account, provider } = useActiveWeb3React();
  return (
    <Theme style={{ color: 'white', alignSelf: 'center' }}>
      <Tabs.Root
        defaultValue='orderbook'
        style={{ marginTop: '1rem', color: 'white', alignSelf: 'center' }}
      >
        <Tabs.List style={{ color: 'white', alignSelf: 'center' }}>
          <Tabs.Trigger value='account' style={{ color: 'white' }}>
            Account
          </Tabs.Trigger>
          <Tabs.Trigger value='assets' style={{ color: 'white' }}>
            Assets
          </Tabs.Trigger>
          <Tabs.Trigger value='orderbook' style={{ color: 'white' }}>
            Orderbook
          </Tabs.Trigger>
          <Tabs.Trigger value='market' style={{ color: 'white' }}>
            Market
          </Tabs.Trigger>
          <Tabs.Trigger value='create_order' style={{ color: 'white' }}>
            Create Order
          </Tabs.Trigger>
          <Tabs.Trigger value='orders' style={{ color: 'white' }}>
            Orders
          </Tabs.Trigger>
          <Tabs.Trigger value='positions' style={{ color: 'white' }}>
            Positions
          </Tabs.Trigger>
          <Tabs.Trigger value='pairs' style={{ color: 'white' }}>
            Pairs
          </Tabs.Trigger>
          <Tabs.Trigger value='chart' style={{ color: 'white' }}>
            Chart
          </Tabs.Trigger>
          <Tabs.Trigger value='leverage' style={{ color: 'white' }}>
            Leverage
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value='account' style={{ color: 'white' }}>
          <Account />
        </Tabs.Content>
        <Tabs.Content value='assets' style={{ color: 'white' }}>
          <Assets />
        </Tabs.Content>
        <Tabs.Content value='orderbook' style={{ color: 'white' }}>
          <Orderbook />
        </Tabs.Content>
        <Tabs.Content value='create_order' style={{ color: 'white' }}>
          <CreateOrder />
        </Tabs.Content>
        <Tabs.Content value='orders' style={{ color: 'white' }}>
          <Orders />
        </Tabs.Content>
        <Tabs.Content value='positions' style={{ color: 'white' }}>
          <Positions />
        </Tabs.Content>
        <Tabs.Content value='market' style={{ color: 'white' }}>
          <Market />
        </Tabs.Content>
        <Tabs.Content value='pairs' style={{ color: 'white' }}>
          <Pairs />
        </Tabs.Content>
        <Tabs.Content value='chart' style={{ color: 'white' }}>
          <AdvancedChart />
        </Tabs.Content>
        <Tabs.Content value='leverage' style={{ color: 'white' }}>
          <Leverage />
        </Tabs.Content>
      </Tabs.Root>
    </Theme>
  );
};

export default PerpsPage;
