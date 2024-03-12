import React, { useEffect, useState } from 'react';
import { Flex, Container, Text } from '@radix-ui/themes';
import { AdvancedChart } from 'react-tradingview-embed';
import { Market } from './Market';
import { Leverage } from './Leverage';
import { GraphHeader } from './GraphHeader';
import { Orderbook } from './Orderbook';
import './FinalPage.css';
import {OrderbookV2} from "./OrderbookV2";
export const FinalPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('market');
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };
  const [token, setToken] = useState('PERP_ETH_USDC');
  const [selectedOption, setSelectedOption] = useState('Portfolio');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <>
      <Flex
        direction={windowWidth <= 1024 ? 'column' : 'row'}
        justify='center'
        align='start'
        style={{
          width: '100vw',
          height: '200vh',
        }}
      >
        <Container
          id='graph'
          style={{
            width: windowWidth <= 1024 ? '100vw' : '61vw',
            height: windowWidth <= 1024 ? 'fit-content' : '100vh',
          }}
        >
          <GraphHeader setTokenName={setToken} />
          <AdvancedChart
            widgetProps={{
              theme: 'dark',
              style: '9',
            }}
          />
        </Container>

        {windowWidth <= 1024 ? (
          <div
            id='test'
            style={{
              display: 'flex',
              width: '100vw',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Container
              id='market'
              style={{
                width: '50w',
                flex: 1,
                height: '100vh',
                border: '1px solid  #1b1e29',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  textAlign: 'center',
                  width: '100%',
                  marginBottom: '5px',
                }}
              >
                <div
                  onClick={() => handleTabChange('market')}
                  style={{
                    flex: 1,
                    cursor: 'pointer',
                    padding: '5px 0',
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    borderBottom:
                      currentTab === 'market' ? '2px solid white' : 'none',
                    color: currentTab === 'market' ? 'white' : '#61657a',
                  }}
                >
                  Market
                </div>
                <div
                  onClick={() => handleTabChange('orderbook')}
                  style={{
                    flex: 1,
                    cursor: 'pointer',
                    padding: '5px 0',
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    borderBottom:
                      currentTab === 'orderbook' ? '2px solid white' : 'none',
                    color: currentTab === 'orderbook' ? 'white' : '#61657a',
                  }}
                >
                  Orderbook
                </div>
              </div>
              {currentTab === 'market' && <Market token={token} />}
              {currentTab === 'orderbook' && <OrderbookV2/>}
            </Container>
            <Container
              id='leverage'
              style={{
                width: '50vw',
                flex: 1,
              }}
            >
              <div style={{ marginTop: '-92px' }}>
                <Leverage perpToken={token} />
              </div>
            </Container>
          </div>
        ) : (
          <>
            <Container
              id='market'
              style={{
                width: '15.5vw',
                height: '86vh',
                border: '1px solid  #1b1e29',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  textAlign: 'center',
                  width: '100%',
                  marginBottom: '5px',
                }}
              >
                <div
                  onClick={() => handleTabChange('market')}
                  style={{
                    flex: 1,
                    cursor: 'pointer',
                    padding: '5px 0',
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    borderBottom:
                      currentTab === 'market' ? '2px solid white' : 'none',
                    color: currentTab === 'market' ? 'white' : '#61657a',
                  }}
                >
                  Market
                </div>
                <div
                  onClick={() => handleTabChange('orderbook')}
                  style={{
                    flex: 1,
                    cursor: 'pointer',
                    padding: '5px 0',
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    borderBottom:
                      currentTab === 'orderbook' ? '2px solid white' : 'none',
                    color: currentTab === 'orderbook' ? 'white' : '#61657a',
                  }}
                >
                  Orderbook
                </div>
              </div>
              {currentTab === 'market' && <Market token={token} />}
              {currentTab === 'orderbook' && <OrderbookV2/>}
            </Container>

            <Container
              id='leverage'
              style={{
                width: '21vw',
                height: '100vh',
              }}
            >
          <Leverage/>
            </Container>
          </>
        )}
      </Flex>
    </>
  );
};
