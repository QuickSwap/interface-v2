import React from 'react';
import { useOrderbookStream } from '@orderly.network/hooks';
import { Box, Flex, Grid, Heading } from '@radix-ui/themes';
import { FC } from 'react';

import './Orderbook.css';

export const Orderbook: FC<{ token?: string }> = ({ token }) => {
  const [
    data,
    { onDepthChange, isLoading, onItemClick, depth, allDepths },
  ] = useOrderbookStream(token || 'PERP_ETH_USDC', undefined, {
    level: 10,
  });
  return (
    <Flex
      style={{ margin: '1.5rem' }}
      gap='3'
      align='center'
      justify='center'
      direction='column'
    >
      {/*<Heading>Orderbook</Heading>*/}

      {!isLoading && (
        <Grid
          style={{ gap: '0 1rem', gridTemplateColumns: '6rem 6rem 6rem' }}
          className='table'
        >
          <Box>Price (USDC)</Box>
          <Box>Quantity (ETH)</Box>
          <Box>Total (ETH)</Box>
          {data.asks?.map(([price, quantity, aggregated]) => {
            const gradient = (100 * aggregated) / data.asks[0][2];
            return (
              <>
                <Box className='ask'>{price}</Box>
                <Box>{quantity}</Box>
                <Box
                  style={{
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
                <Box className='bid'>{price}</Box>
                <Box>{quantity}</Box>
                <Box
                  style={{
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
    </Flex>
  );
};
