import React, { useEffect, useMemo, useState } from 'react';
import './Layout.scss';
import AdvancedChartWrapper from './AdvancedChartWrapper';
import OrderbookV2 from './OrderbookV2';
import { Market } from './Market';
import { GraphHeader } from './GraphHeader';
import { Leverage } from './Leverage';
import { Footer } from './Footer';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { Box, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import { PerpsNotification } from './PerpsNotification';
import { useAccount } from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';

export const Layout = () => {
  const [token, setToken] = useState('PERP_ETH_USDC');
  const [orderItem, setOrderItem] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('orderbook');
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const { state } = useAccount();

  const tabs = useMemo(() => {
    return isMobile
      ? [
          { id: 'bidAsk', text: 'Bids / Asks' },
          { id: 'chart', text: 'Chart' },
          { id: 'trades', text: 'Last Trades' },
        ]
      : [
          { id: 'orderbook', text: 'Orderbook' },
          { id: 'trades', text: 'Last Trades' },
        ];
  }, [isMobile]);

  useEffect(() => {
    setSelectedTab(isMobile ? 'bidAsk' : 'orderbook');
  }, [isMobile]);

  return (
    <Grid container className='perpsV2Container'>
      <Grid item xs={12} sm={12} md={9} lg={9} xl={10}>
        <Grid container className='border-bottom'>
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={9}
            className='border-right flex flex-col'
          >
            <GraphHeader tokenSymbol={token} setTokenSymbol={setToken} />
            {!isMobile && <AdvancedChartWrapper token={token} />}
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={3}>
            <Box className='border-bottom' pl={2}>
              <CustomTabSwitch
                items={tabs}
                height={48}
                value={selectedTab}
                handleTabChange={setSelectedTab}
              />
            </Box>
            {selectedTab === 'chart' && <AdvancedChartWrapper token={token} />}
            {selectedTab === 'orderbook' && (
              <OrderbookV2 token={token} setOrderItem={setOrderItem} />
            )}
            {selectedTab === 'trades' && <Market token={token} />}
            {selectedTab === 'bidAsk' && (
              <Box className='flex'>
                <Box margin='8px -18px 0 -8px' minWidth='190px'>
                  <OrderbookV2 token={token} setOrderItem={setOrderItem} />
                </Box>
                <Box
                  margin={
                    state.status === AccountStatusEnum.EnableTrading
                      ? '-32px 0 0'
                      : ''
                  }
                >
                  <Leverage perpToken={token} orderItem={orderItem} />
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
        <div className='kingFooter'>
          <Footer token={token} setToken={setToken} />
        </div>
      </Grid>
      {!isMobile && (
        <Grid item xs={12} sm={12} md={3} lg={3} xl={2} className='border-left'>
          <Leverage perpToken={token} orderItem={orderItem} />
        </Grid>
      )}
      <PerpsNotification />
    </Grid>
  );
};
