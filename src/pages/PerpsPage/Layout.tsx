import React, { useState } from 'react';
import { AdvancedChart } from 'react-tradingview-embed';
import { OrderbookV2 } from './OrderbookV2';
import { GraphHeader } from './GraphHeader';
import { Leverage } from './Leverage';
import './Layout.css';

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
          <div className='orderbook desktop_orderbook'>
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
          <div>
            {selectedItem !== 'Portfolio' ? (
              <div className='dropdown'>
                <select id='dropdownSelect' onChange={handleSideChange}>
                  <option value='all' disabled selected>
                    All
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
      {/* Orderbook and Leverage in same div */}
      <div className='orderbook-leverage-container'>
        <div className='orderbook '>
          <div
            style={{
              padding: '10px',
              marginBottom: '34px',
            }}
          >
            {/* Replace this with your Orderbook component */}
            <OrderbookV2 />
          </div>
        </div>
        <div className='leverage'>
          {/* Leverage component */}
          <div style={{ border: '1px solid #61675a', padding: '10px' }}>
            <Leverage />
          </div>
        </div>
      </div>
      <div className='other'>
        <Leverage></Leverage>
      </div>
      <div className='mobile_footer'>
        <div className='perp_footer'>
          <div className='footer-left'>
            {['Portfolio', 'Pending', 'Filled'].map((item, index) => (
              <div
                key={index}
                className={selectedItem === item ? 'selected' : ''}
                onClick={() => handleItemClick(item)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div>
          {selectedItem !== 'Portfolio' ? (
            <div className='dropdown'>
              <select id='dropdownSelect' onChange={handleSideChange}>
                <option value='all' disabled selected>
                  All
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
  );
};
