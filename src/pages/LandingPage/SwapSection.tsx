import React, { useState } from 'react';
import {
  ButtonGroup,
  Button,
  Box,
  Grid,
  useMediaQuery,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Swap, AddLiquidity } from 'components';

const SWAP_TAB = 0;
const LIQUIDITY_TAB = 1;

export const SwapSection: React.FC = () => {
  const { breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const [tabIndex, setTabIndex] = useState(SWAP_TAB);

  return (
    <>
      <Box className='buttonGroup'>
        <ButtonGroup>
          <Button
            className={tabIndex === SWAP_TAB ? 'active' : ''}
            onClick={() => setTabIndex(SWAP_TAB)}
          >
            Swap
          </Button>
          <Button
            className={tabIndex === LIQUIDITY_TAB ? 'active' : ''}
            onClick={() => setTabIndex(LIQUIDITY_TAB)}
          >
            Liquidity
          </Button>
        </ButtonGroup>
      </Box>
      <Box className='swapContainer'>
        <Grid container spacing={mobileWindowSize ? 0 : 8} alignItems='center'>
          <Grid item sm={12} md={6}>
            {tabIndex === SWAP_TAB ? (
              <Swap currencyBgClass='bg-palette' />
            ) : (
              <AddLiquidity currencyBgClass='bg-palette' />
            )}
          </Grid>
          <Grid item sm={12} md={6} className='swapInfo'>
            <h4>
              {tabIndex === SWAP_TAB
                ? 'Swap tokens at near-zero gas fees'
                : 'Let your crypto work for you'}
            </h4>
            <p style={{ marginTop: '20px' }}>
              {tabIndex === SWAP_TAB
                ? 'Deposit your Liquidity Provider tokens to receive Rewards in $QUICK on top of LP Fees.'
                : 'Provide Liquidity and earn 0.25% fee on all trades proportional to your share of the pool. Earn additional rewards by depositing your LP Tokens in Rewards Pools.'}
            </p>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
