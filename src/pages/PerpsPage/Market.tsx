import React from 'react';
import { useMarketTradeStream } from '@orderly.network/hooks';
import { OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import { Box, Flex, Grid, Heading } from '@radix-ui/themes';
import { FC } from 'react';
import { API } from '@orderly.network/types';
import './Orderbook.css';

type MarketOrder = {
  price: number;
  size: number;
  ts: number;
  side: OrderSide;
};

export const Market: FC = () => {
  const { data, isLoading } = useMarketTradeStream('PERP_ETH_USDC');
  if (isLoading) return <div>Loading...</div>;

  return (
    <Flex
      style={{ margin: '1.5rem' }}
      gap='3'
      align='center'
      justify='center'
      direction='column'
    >
      <Heading>Market</Heading>

      {!isLoading && (
        <Grid
          style={{ gap: '0 1rem', gridTemplateColumns: '6rem 6rem 10rem' }}
          className='table'
        >
          <Box>Price (USDC)</Box>
          <Box>Quantity (ETH)</Box>
          <Box>Side (ETH)</Box>
          {data.map((item) => {
            const gradient = 10;
            return (
              <>
                <Box className={item.side === 'BUY' ? 'bid' : 'ask'}>
                  {item.price}
                </Box>
                <Box>{item.size}</Box>
                <Box className={item.side === 'BUY' ? 'bid' : 'ask'}>
                  {item.side}
                </Box>
              </>
            );
          })}
        </Grid>
      )}
    </Flex>
  );
};
