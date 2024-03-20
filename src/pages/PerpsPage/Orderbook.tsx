import React from 'react';
import { useOrderbookStream } from '@orderly.network/hooks';
import { FC } from 'react';

import './Orderbook.css';
import { Box, Grid } from '@material-ui/core';

export const Orderbook: FC<{ token?: string }> = ({ token }) => {
  const [
    data,
    { onDepthChange, isLoading, onItemClick, depth, allDepths },
  ] = useOrderbookStream(token || 'PERP_ETH_USDC', undefined, {
    level: 10,
  });
  return (
    <Box style={{ backgroundColor: '#12131a' }}>
      {/*<Heading>Orderbook</Heading>*/}

      {!isLoading && (
        <Grid
          style={{ gridTemplateColumns: '5rem 5rem 5rem', textAlign: 'center' }}
          className='table'
        >
          <Box
            style={{
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: 'Inter',
              color: '#61657a',
              margin: '8px 0',
            }}
          >
            Price (USDC)
          </Box>
          <Box
            style={{
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: 'Inter',
              color: '#61657a',
              margin: '8px 0',
            }}
          >
            Qty(ETH)
          </Box>
          <Box
            style={{
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: 'Inter',
              color: '#61657a',
              margin: '8px 0',
            }}
          >
            Total (ETH)
          </Box>
          {data.asks?.map(([price, quantity, aggregated]) => {
            const gradient = (100 * aggregated) / data.asks[0][2];
            return (
              <>
                <Box
                  className='ask'
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter',
                  }}
                >
                  {price}
                </Box>
                <Box
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter',
                  }}
                >
                  {quantity}
                </Box>
                <Box
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter',
                    background: `linear-gradient(to left, rgba(161, 6, 6, 0.2) ${gradient}%, transparent ${gradient}%)`,
                  }}
                >
                  {aggregated}
                </Box>
              </>
            );
          })}
          {data.bids?.map(([price, quantity, aggregated]) => {
            const gradient =
              (100 * aggregated) / data.bids[data.bids.length - 1][2];
            return (
              <>
                <Box
                  className='bid'
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter',
                  }}
                >
                  {price}
                </Box>
                <Box
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter',
                  }}
                >
                  {quantity}
                </Box>
                <Box
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter',
                    background: `linear-gradient(to left, rgba(4, 109, 4, 0.2) ${gradient}%, transparent ${gradient}%)`,
                  }}
                >
                  {aggregated}
                </Box>
              </>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
