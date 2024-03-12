import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import './Layout.css';
import { AdvancedChart } from 'react-tradingview-embed';
import { OrderbookV2 } from './OrderbookV2';
import { GraphHeader } from './GraphHeader';
import { Leverage } from './Leverage';

export const Layout = () => {
  const [selectedItem, setSelectedItem] = useState('Portfolio');
  const [selectedSide, setSelectedSide] = useState(null);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };
  const handleSideChange = (e) => {
    setSelectedSide(e.target.value);
  };

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
              {[
                'Portfolio',
                'Pending',
                'Filled',
                'Cancelled',
                'Rejected',
                'Order History',
              ].map((item, index) => (
                <div
                  key={index}
                  className={selectedItem === item ? 'selected' : ''}
                  onClick={() => handleItemClick(item)}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className='footer-right'>Show All Instrument</div>
          </div>
          <div >
            {selectedItem !== 'Portfolio' ? (
              <div>
                <select onChange={handleSideChange}>
                  <option value='all' disabled selected>
                    All Side
                  </option>
                  <option value='buy'>Buy</option>
                  <option value='sell'>Sell</option>
                </select>
              </div>
            ) : (
              <div className='portfolio_status'>
                <div>Unreal</div>
                <div>Real</div>
                <div>Margin</div>
              </div>
            )}
          </div>

          <div className='footer_data'>
            <div>NotFound</div>
          </div>
        </div>
      </div>
      <div className='other'>
        <Leverage></Leverage>
      </div>
    </div>
  );
};
