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

export const Market: FC<{ token: string }> = ({ token }) => {
  const { data, isLoading } = useMarketTradeStream(token || 'PERP_ETH_USDC');
  if (isLoading) return <div>Loading...</div>;

  return (
    <Flex
      style={{ backgroundColor: '#12131a' }}
      gap='2'
      align='center'
      justify='center'
      direction='column'
    >
      {!isLoading && (
        <Grid
          style={{ gridTemplateColumns: '5rem 5rem 5rem' }}
          className='table'
        >
          <Box
            style={{
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: 'Inter',
              color: '#61657a',
              margin: '8px 0',
              textAlign: 'center',
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
              textAlign: 'center',
              margin: '8px 0',
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
              textAlign: 'center',
              margin: '8px 0',
            }}
          >
            Qty(ETH)
          </Box>
          {data.slice(0, 23).map((item) => {
            const gradient = 10;
            return (
              <>
                <Box
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter',
                    textAlign: 'center',
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
                    textAlign: 'center',
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
                    textAlign: 'center',
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
