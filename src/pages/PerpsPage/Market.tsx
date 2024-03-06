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

export const Market: FC = ({ token }) => {
  const { data, isLoading } = useMarketTradeStream(token);
  console.log(data);
  if (isLoading) return <div>Loading...</div>;

  return (
    <Flex
      style={{ margin: '1rem', backgroundColor: '#12131a' }}
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
          <Box
            style={{
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: 'Inter',
              color: '#61657a',
            }}
          >
            Time
          </Box>
          <Box
            style={{
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: 'Inter',
              color: '#61657a',
            }}
          >
            Price{' '}
          </Box>
          <Box
            style={{
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: 'Inter',
              color: '#61657a',
            }}
          >
            Quantity (ETH)
          </Box>
          {data.slice(0, 25).map((item) => {
            const gradient = 10;
            return (
              <>
                <Box
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter',
                  }}
                >
                  {Date(item.ts).slice(16, 25)}
                </Box>
                <Box
                  className={item.side === 'BUY' ? 'bid' : 'ask'}
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter',
                  }}
                >
                  {item.price}
                </Box>
                <Box
                  className={item.side === 'BUY' ? 'bid' : 'ask'}
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter',
                  }}
                >
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
