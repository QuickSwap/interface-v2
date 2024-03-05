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
      style={{ margin: '1rem' }}
      gap='3'
      align='center'
      justify='center'
      direction='column'
    >
      {!isLoading && (
        <Grid
          style={{ gridTemplateColumns: '6rem 6rem 6rem' }}
          className='table'
        >
          <Box>Times</Box>
          <Box>Price (USDC)</Box>
          <Box>Quantity (ETH)</Box>
          {data.slice(0, 25).map((item) => {
            const gradient = 10;
            return (
              <>
                <Box>{Date(item.ts).slice(16, 25)}</Box>
                <Box className={item.side === 'BUY' ? 'bid' : 'ask'}>
                  {item.price}
                </Box>
                <Box className={item.side === 'BUY' ? 'bid' : 'ask'}>
                  {item.size}
                </Box>
              </>
            );
          })}
        </Grid>
      )}
    </Flex>
  );
};
