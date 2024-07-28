import { Box, Divider, Grid, useMediaQuery } from '@material-ui/core';
import { NavigateBefore, NavigateNext } from '@material-ui/icons';
import { SwapTokenDetailsHorizontal } from 'components';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SwapBuySellMiniWidget } from './BuySellWidget';
import LiquidityPools from './LiquidityPools';
import SwapMain from './SwapMain';
import SwapNewsWidget from './SwapNewWidget';
import SwapNewsletterSignup from './SwapNewsletterSignUp';
import { LiquidityHubAd } from './LiquidityHubAd';
import { useTheme } from '@material-ui/core/styles';

type NavParams = {
  swapIndex: string | undefined;
};

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const SwapDefaultMode: React.FC<{
  token1: any;
  token2: any;
}> = ({ token1, token2 }) => {
  const { breakpoints } = useTheme();
  const isTablet = useMediaQuery(breakpoints.down('sm'));

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const query = useQuery();
  const [disabledLeft, setDisabledLeft] = useState(false);

  useEffect(() => {
    if (query.get('swapIndex') === '4') {
      setDisabledLeft(true);
      setLeftOpen(false);
    } else {
      setLeftOpen(true);
      setDisabledLeft(false);
    }
  }, [query]);

  return (
    <>
      {isTablet ? (
        <>
          <Box className='wrapper'>
            <SwapMain />
          </Box>
          {/* <Box className='wrapper' mt={2}>
            {token1 && (
              <SwapTokenDetailsHorizontal token={token1} isTablet={isTablet} />
            )}
            <Divider
              style={{
                marginLeft: '-24px',
                marginRight: '-24px',
                marginTop: '12px',
                marginBottom: '12px',
              }}
            />
            {token2 && (
              <SwapTokenDetailsHorizontal token={token2} isTablet={isTablet} />
            )}
          </Box>
          {token1 && token2 && (
            <Box className='wrapper' mt={2}>
              <LiquidityPools token1={token1} token2={token2} />
            </Box>
          )}
          <Box mt={2}>
            <SwapNewsletterSignup />
          </Box>
          <Box className='wrapper' mt={2}>
            <SwapBuySellMiniWidget />
          </Box>
          <Box mt={2}>
            <SwapNewsWidget />
          </Box> */}
        </>
      ) : (
        <Grid>
          <Grid container justifyContent='center' spacing={2}>
            {/* <Grid item xs={12} sm={12} md={6} lg={4}>
              <Grid container justifyContent='flex-end' spacing={2}>
                <Grid item>
                  <Box
                    sx={{ display: { xs: 'none', lg: 'block' } }}
                    className={`btn-swap-widget ${
                      disabledLeft ? 'btn-swap-widget-disabled' : ''
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
                          {token1 && (
                            <SwapTokenDetailsHorizontal
                              token={token1}
                              isTablet={isTablet}
                            />
                          )}
                          <Divider
                            style={{
                              marginLeft: '-24px',
                              marginRight: '-24px',
                              marginTop: '12px',
                              marginBottom: '12px',
                            }}
                          />
                          {token2 && (
                            <SwapTokenDetailsHorizontal
                              token={token2}
                              isTablet={isTablet}
                            />
                          )}
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
            </Grid> */}
            <Grid item xs={12} sm={12} md={6} lg={4}>
              {/* <Box mb={1} sx={{ display: { xs: 'none', md: 'block' } }}>
                <LiquidityHubAd />
              </Box> */}
              <Box className='wrapper'>
                <SwapMain />
              </Box>
            </Grid>
            {/* <Grid item lg={4}>
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
                    className='btn-swap-widget'
                    sx={{ display: { xs: 'none', lg: 'block' } }}
                    onClick={() => setRightOpen(!rightOpen)}
                  >
                    {rightOpen && <NavigateBefore />}
                    {!rightOpen && <NavigateNext />}
                  </Box>
                </Grid>
              </Grid>
            </Grid> */}
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default SwapDefaultMode;
