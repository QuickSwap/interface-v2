import React from 'react';
import { Flex } from '@radix-ui/themes';
import './Layout.css';
import { AdvancedChart } from 'react-tradingview-embed';
import { OrderbookV2 } from './OrderbookV2';
import { GraphHeader } from './GraphHeader';
import {Leverage} from "./Leverage";

export const Layout = () => {
  return (
    <div className='container'>
      <div className='graph_footer'>
        <div className='graph_orderbook'>
          <div className='graph'>
            <GraphHeader />
            <AdvancedChart widgetProps={{ height: '430' }} />
          </div>
          <div className='orderbook' style={{ height: '466px' }}>
            <div
              style={{
                color: 'white',
                height: 36,
                textAlign: 'center',
                padding: 4,
              }}
            >
              Orderbook
            </div>
            <OrderbookV2 />
          </div>
        </div>
        <div className='kingFooter'>
          <div className='perp_footer'>
            <div className='footer-left'>
              <div>Portfolio</div>
              <div>Pending</div>
              <div>Filled</div>
              <div>Cancled</div>
              <div>Rejected</div>
              <div>Order History</div>
            </div>
            <div className='footer-right'>Show All Instrument</div>
          </div>
          <div className='portfolio_status'>
            <div>Unreal</div>
            <div>Real</div>
            <div>Margin</div>
          </div>
          <div className='footer_data'>
            <div>NotFound</div>
          </div>
        </div>
      </div>
      <div className='other'><Leverage></Leverage></div>
    </div>
  );
};
