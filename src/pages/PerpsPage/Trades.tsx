import React from 'react';
import { useMarketTradeStream } from '@orderly.network/hooks';
import { Flex, Heading } from '@radix-ui/themes';
import { FC } from 'react';

export const Trades: FC = () => {
  const trades = useMarketTradeStream('PERP_ETH_USDC');
  console.log('trades', trades);

  return (
    <Flex
      style={{ margin: '1.5rem' }}
      gap='3'
      align='center'
      justify='center'
      direction='column'
    >
      <Heading>Trades</Heading>
    </Flex>
  );
};
