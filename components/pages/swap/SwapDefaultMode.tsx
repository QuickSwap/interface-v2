import { Box, Divider, Grid } from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { SwapTokenDetailsHorizontal } from 'components';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { SwapBuySellMiniWidget } from './BuySellWidget';
import LiquidityPools from './LiquidityPools';
import SwapMain from './SwapMain';
import SwapNewsWidget from './SwapNewWidget';
import styles from 'styles/pages/Swap.module.scss';

const SwapDefaultMode: React.FC<{
  token1: any;
  token2: any;
}> = ({ token1, token2 }) => {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const router = useRouter();
  const swapIndex = router.query.swapIndex
    ? (router.query.swapIndex as string)
    : '';
  const [disabledLeft, setDisabledLeft] = useState(false);

  useEffect(() => {
    if (swapIndex === '4') {
      setDisabledLeft(true);
      setLeftOpen(false);
    } else {
      setLeftOpen(true);
      setDisabledLeft(false);
    }
  }, [swapIndex]);

  return (
    <Grid>
      <Grid container justifyContent='center' spacing={2}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <Grid container justifyContent='flex-end' spacing={2}>
            <Grid item>
              <Box
                sx={{ display: { xs: 'none', lg: 'block' } }}
                className={`${styles.btnSwapWidget} ${
                  disabledLeft ? styles.btnSwapWidgetDisabled : ''
                } `}
                onClick={() => {
                  if (disabledLeft) return;
                  setLeftOpen(!leftOpen);
                }}
              >
                {!leftOpen && <NavigateBefore />}
                {leftOpen && <NavigateNext />}
              </Box>
            </Grid>
            {leftOpen && (
              <Grid item xs={12} lg={10}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box
                      className='wrapper'
                      sx={{ marginTop: { xs: '-16px', lg: '0px' } }}
                    >
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
        </Grid>
        <Grid item lg={4}>
          <Grid container justifyContent='flex-start' spacing={2}>
            {rightOpen && (
              <Grid item xs={12} lg={10}>
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
                className={styles.btnSwapWidget}
                sx={{ display: { xs: 'none', lg: 'block' } }}
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
