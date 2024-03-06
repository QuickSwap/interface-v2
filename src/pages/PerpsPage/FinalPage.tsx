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
  const [selectedOption, setSelectedOption] = useState('Portfolio');

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };
  return (
    <>
      <Flex
        direction='row'
        justify='between'
        align='start'
        style={{
          width: '100vw',
          height: '86vh',
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
              width: '22.5vw',
              padding: '0 89px',
            }}
          >
            <div
              onClick={() => handleTabChange('market')}
              style={{
                marginRight: '10px',
                cursor: 'pointer',
                width: '11.25vw',
                padding: '5px 0',
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
                padding: '5px 0',
                width: '11.25vw',
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
      <Flex direction='column' style={{ width: '77.5vw', height: '50vh' }}>
        <Flex
          direction={'row'}
          justify={'between'}
          align={'center'}
          style={{
            width: '77.5vw',
            padding: '10px',
            border: '1px solid  #1b1e29',
          }}
        >
          <Flex
            direction='row'
            justify='between'
            align='center'
            style={{
              width: '40vw',
              fontSize: '14px',
              fontFamily: 'Inter',
              fontWeight: 500,
              color: '#61657a',
            }}
          >
            {[
              'Portfolio',
              'Pending',
              'Filled',
              'Cancelled',
              'Rejected',
              'Order History',
            ].map((option) => (
              <Text
                key={option}
                onClick={() => handleOptionClick(option)}
                style={{
                  color: selectedOption === option ? 'white' : '#61657a',
                  borderBottom:
                    selectedOption === option ? '2px solid white' : 'none',
                  cursor: 'pointer',
                }}
              >
                {option}
              </Text>
            ))}
          </Flex>
          <Text
            style={{
              color: '#ccced9',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: 'Inter',
            }}
          >
            Show all Instrument
          </Text>
        </Flex>
        <Flex
          direction='row'
          gap='9'
          justify='start'
          align='center'
          style={{
            border: '1px solid  #1b1e29',
            width: '77.5vw',
            height: '80px',
            padding: '10px',
          }}
        >
          <Flex direction='column' align='center' justify='start'>
            <Text
              style={{
                fontFamily: 'Inter',
                fontSize: 12,
                fontWeight: 500,
                color: '#61657a',
              }}
            >
              Unreal.Pnl
            </Text>
            <Text
              style={{
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: 500,
                color: '#c7cad9',
              }}
            >
              0.00%
            </Text>
          </Flex>
          <Flex direction='column' align='center' justify='start'>
            <Text
              style={{
                fontFamily: 'Inter',
                fontSize: 12,
                fontWeight: 500,
                color: '#61657a',
              }}
            >
              Notional
            </Text>
            <Text
              style={{
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: 500,
                color: '#c7cad9',
              }}
            >
              0.00%
            </Text>
          </Flex>
          <Flex direction='column' align='center' justify='start'>
            <Text
              style={{
                fontFamily: 'Inter',
                fontSize: 12,
                fontWeight: 500,
                color: '#61657a',
              }}
            >
              Unsettled PnL
            </Text>
            <Text
              style={{
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: 500,
                color: '#c7cad9',
              }}
            >
              0.00%
            </Text>
          </Flex>
        </Flex>
        <Flex
          direction='row'
          justify='between'
          align='start'
          style={{
            width: '77.5vw',
            height: '100px',
            padding: '5px 10px 0 10px',
            border: '1px solid #1b1e29',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: 'Inter',
            color: '#61657a',
          }}
        >
          <Text>Instrument</Text>
          <Text>Quantity</Text>
          <Text>Avg.open</Text>
          <Text>Mark Price</Text>
          <Text>Liq.price</Text>
          <Text>Margin</Text>
          <Text>Unreal.PnL</Text>
          <Text>Notional</Text>
          <Text>Qty.</Text>
          <Text>Price</Text>
        </Flex>
        <Flex
          direction='column'
          justify='center'
          align='center'
          style={{
            width: '77.5vw',
            height: '150px',
            border: '1px solid #1b1e29',
          }}
        >
          <Text>No Result Found</Text>
        </Flex>
      </Flex>
    </>
  );
};
