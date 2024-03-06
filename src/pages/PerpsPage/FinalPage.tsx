import React, { useState } from 'react';
import { Flex, Container, Text } from '@radix-ui/themes';
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
  return (
    <>
      <Flex
        direction='row'
        justify='between'
        align='start'
        style={{
          width: '100vw',
          height: 'fit-content',
        }}
      >
        <Container
          style={{
            width: '55vw',
            height: 'fit-content',
          }}
        >
          <GraphHeader setTokenName={setToken} />
          <AdvancedChart />
        </Container>
        <Container
          style={{
            width: '22.5vw',
            height: '86vh',
            border: '1px solid  #1b1e29',
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
      <Flex
        direction={'row'}
        justify={'between'}
        align={'center'}
        style={{ width: '77.5vw' ,border: '1px solid  #1b1e29' }}
      >
        <Flex
          direction='row'
          justify='between'
          align='center'
          style={{ width: '40vw',fontSize:'14px',fontFamily:'Inter',fontWeight:500,color:'#61657a'}}
        >
          <Text>Portfolio</Text>
          <Text>Pending</Text>
          <Text>Filled</Text>
          <Text>Cancelled</Text>
          <Text>Rejected</Text>
          <Text>Order History</Text>
        </Flex>
        <Text>Show all Instrument</Text>
      </Flex>
    </>
  );
};
