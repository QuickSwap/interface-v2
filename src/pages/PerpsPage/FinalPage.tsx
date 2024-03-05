import React, { useState } from 'react';
import { Flex, Container } from '@radix-ui/themes';
import { AdvancedChart } from 'react-tradingview-embed';
import { Market } from './Market';
import { Leverage } from './Leverage';
import { GraphHeader } from './GraphHeader';
import { Orderbook } from './Orderbook';

export const FinalPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('market');
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };
  const [token, setToken] = useState('PERP_ETH_USDC');
    console.log(token)
  return (
    <Flex
      direction='row'
      justify='between'
      align='start'
      style={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <Container
        style={{
          width: '55vw',
          height: '100vh',
        }}
      >
        <GraphHeader setTokenName={setToken} />
        <AdvancedChart />
      </Container>
      <Container
        style={{
          width: '22.5vw',
          height: '100vh',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            textAlign: 'center',
            padding: '0 89px',
          }}
        >
          <div
            onClick={() => handleTabChange('market')}
            style={{
              marginRight: '10px',
              cursor: 'pointer',
              borderBottom:
                currentTab === 'market' ? '2px solid white' : 'none',
            }}
          >
            Market
          </div>
          <div
            onClick={() => handleTabChange('orderbook')}
            style={{
              cursor: 'pointer',
              borderBottom:
                currentTab === 'orderbook' ? '2px solid white' : 'none',
            }}
          >
            Orderbook
          </div>
        </div>
        {currentTab === 'market' && <Market token={token} />}
        {currentTab === 'orderbook' && <Orderbook token={token} />}
      </Container>
      <Container
        style={{
          width: '22.5vw',
          height: '100vh',
        }}
      >
        <Leverage />
      </Container>
    </Flex>
  );
};
