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
        <GraphHeader />
        <AdvancedChart />
      </Container>
      <Container
        style={{
          width: '22.5vw',
          height: '100vh',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row' ,textAlign:"center",padding:'0 89px' }}>
          <div
            className={`tab ${currentTab === 'market' && 'active'}`}
            onClick={() => handleTabChange('market')}
            style={{ marginRight: '10px', cursor: 'pointer' }}
          >
            Market
          </div>
          <div
            className={`tab ${currentTab === 'orderbook' && 'active'}`}
            onClick={() => handleTabChange('orderbook')}
            style={{ cursor: 'pointer' }}
          >
            Orderbook
          </div>
        </div>
        {currentTab === 'market' && <Market />}
        {currentTab === 'orderbook' && <Orderbook />}
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
