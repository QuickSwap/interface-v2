import React, { useState } from 'react';
import './Layout.scss';
import { AdvancedChartWrapper } from './AdvancedChartWrapper';
import { OrderbookV2 } from './OrderbookV2';
import { Market } from './Market';
import { GraphHeader } from './GraphHeader';
import { Leverage } from './Leverage';
import { OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import { Footer } from './Footer';

type Order = {
  price: number;
  quantity: number;
  created_time: number;
  order_id: number;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  executed: number;
};
export const Layout = () => {
  const [token, setToken] = useState('PERP_ETH_USDC');
  const [selectedItem, setSelectedItem] = useState('Portfolio');
  const [selectedSide, setSelectedSide] = useState<string>('');
  const [selectedNavItem, setSelectedNavItem] = useState('Chart');
  const [orderQuantity, setOrderQuantity] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = useState<'Orderbook' | 'Market'>(
    'Orderbook',
  );

  const handleTabClick = (tab: 'Orderbook' | 'Market') => {
    setSelectedTab(tab);
  };
  return (
    <div className='perpsV2Container'>
      <div className='graph_footer'>
        <div className='graph_orderbook'>
          <div className='graph'>
            <div className='desktop-graph-navbar'>
              <GraphHeader setTokenName={setToken} />
            </div>
            <nav className='mobile-graph-navbar'>
              <div onClick={() => setSelectedNavItem('Chart')}>Chart</div>
              <div onClick={() => setSelectedNavItem('Trade')}>Trade</div>
              <div onClick={() => setSelectedNavItem('Data')}>Data</div>
            </nav>
            {selectedNavItem === 'Chart' && (
              <AdvancedChartWrapper token={token} />
            )}
            {selectedNavItem === 'Trade' && (
              <div className='nav-trade'>
                <Market />
              </div>
            )}
            {selectedNavItem === 'Data' && (
              <div className='nav-data'>
                <div className='item'>Mark Price</div>
                <div className='item'>Index Price</div>
                <div className='item'>24h Volume</div>
                <div className='item'>24h High</div>
                <div className='item'>24h Low</div>
                <div className='item'>Open Interest</div>
                <div className='item'>1</div>
                <div className='item'>1</div>
                <div className='item'>1</div>
                <div className='item'>1</div>
                <div className='item'>1</div>
                <div className='item'>1</div>
              </div>
            )}
          </div>
          <div className='orderbook desktop_orderbook'>
            <div className='tab-header'>
              <div
                className={selectedTab === 'Orderbook' ? 'active-tab' : ''}
                onClick={() => handleTabClick('Orderbook')}
              >
                Orderbook
              </div>
              <div
                className={selectedTab === 'Market' ? 'active-tab' : ''}
                onClick={() => handleTabClick('Market')}
              >
                Market
              </div>
            </div>
            {selectedTab === 'Orderbook' && (
              <OrderbookV2 token={token} setOrderQuantity={setOrderQuantity} />
            )}
            {selectedTab === 'Market' && <Market token={token} />}
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
                  onClick={() => setSelectedItem(item)}
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
                <select
                  id='dropdownSelect'
                  onChange={(e) => {
                    setSelectedSide(e.target.value);
                  }}
                >
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
            <div>Price</div>
            <div>Quantity</div>
            <div>CreatedAt</div>
            <div>Side</div>
            <div>Type</div>
            <div>Status</div>
            <div>Price</div>
          </div>
          <Footer token={token} selectedTab={selectedItem} />
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
            {/*<OrderbookV2 />*/}
          </div>
        </div>
        <div className='leverage'>
          {/* Leverage component */}
          <div style={{ border: '1px solid #61675a', padding: '10px' }}>
            <Leverage perpToken={token} orderQuantity={orderQuantity[0]} />
          </div>
        </div>
      </div>
      <div className='other'>
        <Leverage perpToken={token} orderQuantity={orderQuantity[0]}></Leverage>
      </div>
      <div className='mobile_footer'>
        <div className='perp_footer'>
          <div className='footer-left'>
            {['Portfolio', 'Pending', 'Filled'].map((item, index) => (
              <div
                key={index}
                className={selectedItem === item ? 'selected' : ''}
                onClick={() => setSelectedItem(item)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div>
          {selectedItem !== 'Portfolio' ? (
            <div className='dropdown'>
              <select
                id='dropdownSelect'
                onChange={(e) => setSelectedSide(e.target.value)}
              >
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
