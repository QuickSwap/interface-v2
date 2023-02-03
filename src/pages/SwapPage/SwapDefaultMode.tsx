import { Box, Button, Divider, Grid, Paper } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import LiquidityPools from './LiquidityPools';
import SwapMain from './SwapMain';
import { Token } from '@uniswap/sdk';
import SwapNewsWidget from './SwapNewWidget';
import {
  ArrowLeftSharp,
  NavigateBefore,
  NavigateNext,
} from '@material-ui/icons';
import { SwapBuySellMiniWidget } from './BuySellWidget';
import { AdsSlider, SwapTokenDetailsHorizontal } from 'components';

const SwapDefaultMode: React.FC<{
  isTiny: boolean;
  token1: any;
  token2: any;
}> = ({ isTiny, token1, token2 }) => {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  return (
    <Grid>
      <Grid container justifyContent='center' spacing={2}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <Grid container justifyContent='flex-end' spacing={2}>
            <Grid item>
              <Box
                className='btn-swap-widget'
                onClick={() => setLeftOpen(!leftOpen)}
              >
                {!leftOpen && <NavigateBefore />}
                {leftOpen && <NavigateNext />}
              </Box>
            </Grid>
            {leftOpen && (
              <Grid item xs={10}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box className='wrapper'>
                      {token1 && <SwapTokenDetailsHorizontal token={token1} />}
                      <Divider
                        style={{
                          marginLeft: '-24px',
                          marginRight: '-24px',
                          marginTop: '12px',
                          marginBottom: '12px',
                        }}
                      />
                      {token2 && <SwapTokenDetailsHorizontal token={token2} />}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    {token1 && token2 && (
                      <Box className='wrapper'>
                        <LiquidityPools token1={token1} token2={token2} />
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <Box className='wrapper'>
            <SwapMain />
          </Box>
          <Box maxWidth={isTiny ? '320px' : '352px'} margin='16px auto 0'>
            <AdsSlider sort='swap' />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <Grid container justifyContent='flex-start' spacing={2}>
            {rightOpen && (
              <Grid item xs={10}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box className='wrapper'>
                      <SwapBuySellMiniWidget />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <SwapNewsWidget />
                  </Grid>
                </Grid>
              </Grid>
            )}
            <Grid item>
              <Box
                className='btn-swap-widget'
                onClick={() => setRightOpen(!rightOpen)}
              >
                {rightOpen && <NavigateBefore />}
                {!rightOpen && <NavigateNext />}
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SwapDefaultMode;
