import React, { useEffect, useMemo, useState } from 'react';
import './Layout.scss';
import AdvancedChartWrapper from './AdvancedChartWrapper';
import OrderbookV2 from './OrderbookV2';
import { Market } from './Market';
import { GraphHeader } from './GraphHeader';
import { Leverage } from './Leverage';
import { Footer } from './Footer';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { Grid, useMediaQuery, useTheme } from '@material-ui/core';
import { PerpsNotification } from './PerpsNotification';

export const Layout = () => {
  const [token, setToken] = useState('PERP_ETH_USDC');
  const [orderItem, setOrderItem] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('orderbook');
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const tabs = useMemo(() => {
    return isMobile
      ? [
          { id: 'chart', text: 'Chart' },
          { id: 'orderbook', text: 'Orderbook' },
          { id: 'trades', text: 'Last Trades' },
          { id: 'bidAsk', text: 'Bids / Asks' },
        ]
      : [
          { id: 'orderbook', text: 'Orderbook' },
          { id: 'trades', text: 'Last Trades' },
        ];
  }, [isMobile]);

  useEffect(() => {
    setSelectedTab(isMobile ? 'chart' : 'orderbook');
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
            <GraphHeader setTokenName={setToken} />
            {!isMobile && <AdvancedChartWrapper token={token} />}
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={3}>
            <div className='border-bottom'>
              <CustomTabSwitch
                items={tabs}
                height={48}
                value={selectedTab}
                handleTabChange={setSelectedTab}
              />
            </div>
            {selectedTab === 'chart' && <AdvancedChartWrapper token={token} />}
            {selectedTab === 'orderbook' && (
              <OrderbookV2 token={token} setOrderItem={setOrderItem} />
            )}
            {selectedTab === 'trades' && <Market token={token} />}
            {selectedTab === 'bidAsk' && (
              <Leverage perpToken={token} orderItem={orderItem} />
            )}
          </Grid>
        </Grid>
        <div className='kingFooter'>
          <Footer token={token} />
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
